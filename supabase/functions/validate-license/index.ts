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
    const { data: license, error: licenseError } = await supabase
      .from("licenses")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (licenseError || !license) {
      return new Response(
        JSON.stringify({ valid: false, error: "No license found", code: "NO_LICENSE" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check status
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
      await supabase.from("licenses").update({ status: "expired" }).eq("id", license.id);
      return new Response(
        JSON.stringify({ valid: false, error: "License expired", code: "EXPIRED", license: { ...license, status: "expired" } }),
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

    // Session management - cleanup expired, check limit, register session
    await supabase.rpc("cleanup_expired_sessions");

    const { data: sessionCount } = await supabase
      .from("active_sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gt("expires_at", new Date().toISOString());

    const currentSessionCount = (sessionCount as any)?.length ?? 0;

    // Check session limit (use count query)
    const { count: activeCount } = await supabase
      .from("active_sessions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gt("expires_at", new Date().toISOString());

    if ((activeCount ?? 0) >= license.max_sessions) {
      // Delete oldest session to make room (sliding window)
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

    // Register/update session
    const sessionToken = token.slice(-16); // Use last 16 chars as session identifier
    await supabase.from("active_sessions").upsert(
      {
        user_id: userId,
        session_token: sessionToken,
        last_seen_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
      { onConflict: "user_id,session_token", ignoreDuplicates: false }
    ).then(() => {
      // If upsert fails due to no unique constraint on (user_id, session_token),
      // just insert
    }).catch(async () => {
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
        license: {
          ...license,
          usage_count: license.usage_count + 1,
        },
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
