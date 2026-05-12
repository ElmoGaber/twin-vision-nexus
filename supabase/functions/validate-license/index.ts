import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ valid: false, error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify token using getClaims
    const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await anonClient.auth.getClaims(token);

    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ valid: false, error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub as string;

    // Use service role for DB operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get license
    let { data: license, error: licenseError } = await supabase
      .from("licenses")
      .select("*")
      .eq("user_id", userId)
      .single();

    // FIRST LOGIN: If no license exists, create a 7-day trial starting NOW
    if (licenseError || !license) {
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data: newLicense, error: createError } = await supabase
        .from("licenses")
        .insert({
          user_id: userId,
          status: "trial",
          expires_at: expiresAt,
          usage_limit: 500,
          usage_count: 0,
          allowed_features: ["dashboard", "analytics"],
          max_sessions: 3,
          max_projects: 1,
        })
        .select()
        .single();

      if (createError || !newLicense) {
        return new Response(
          JSON.stringify({ valid: false, error: "Failed to create trial license", code: "NO_LICENSE" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      license = newLicense;
    }

    // Check status - revoked or suspended
    if (license.status === "revoked" || license.status === "suspended") {
      return new Response(
        JSON.stringify({ valid: false, error: "License revoked", code: "REVOKED", license }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check expiration
    const now = new Date();
    const expiresAt = new Date(license.expires_at);
    if (expiresAt <= now) {
      // Mark as expired in DB
      await supabase.from("licenses").update({ status: "expired" }).eq("id", license.id);
      return new Response(
        JSON.stringify({
          valid: false,
          error: "License expired",
          code: "EXPIRED",
          license: { ...license, status: "expired" },
          message: "Your 7-day trial has ended. Please contact the administrator to renew your license.",
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if already expired status in DB
    if (license.status === "expired") {
      return new Response(
        JSON.stringify({
          valid: false,
          error: "License expired",
          code: "EXPIRED",
          license,
          message: "Your 7-day trial has ended. Please contact the administrator to renew your license.",
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check usage
    if (license.usage_count >= license.usage_limit) {
      return new Response(
        JSON.stringify({ valid: false, error: "Usage limit exceeded", code: "USAGE_EXCEEDED", license }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Session management
    await supabase.rpc("cleanup_expired_sessions");

    const { count: activeCount } = await supabase
      .from("active_sessions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gt("expires_at", new Date().toISOString());

    if ((activeCount ?? 0) >= license.max_sessions) {
      const { data: oldestSession } = await supabase
        .from("active_sessions")
        .select("id")
        .eq("user_id", userId)
        .order("created_at", { ascending: true })
        .limit(1)
        .single();

      if (oldestSession) {
        await supabase.from("active_sessions").delete().eq("id", oldestSession.id);
      }
    }

    // Register session
    const sessionToken = token.slice(-16);
    await supabase.from("active_sessions").upsert(
      {
        user_id: userId,
        session_token: sessionToken,
        last_seen_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
      { onConflict: "user_id,session_token", ignoreDuplicates: false }
    ).catch(async () => {
      await supabase.from("active_sessions").insert({
        user_id: userId,
        session_token: sessionToken,
        last_seen_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });
    });

    // Increment usage
    await supabase.from("licenses").update({
      usage_count: license.usage_count + 1,
    }).eq("id", license.id);

    // Check if admin
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    const isAdmin = roles?.some((r: any) => r.role === "admin") ?? false;

    // Calculate remaining time
    const remainingMs = expiresAt.getTime() - now.getTime();
    const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));

    return new Response(
      JSON.stringify({
        valid: true,
        license: { ...license, usage_count: license.usage_count + 1 },
        isAdmin,
        remainingDays,
        remainingUsage: license.usage_limit - license.usage_count - 1,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ valid: false, error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
