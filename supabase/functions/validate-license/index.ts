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
    if (!authHeader) {
      return new Response(
        JSON.stringify({ valid: false, error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ valid: false, error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get license
    const { data: license, error: licenseError } = await supabase
      .from("licenses")
      .select("*")
      .eq("user_id", user.id)
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
      // Auto-expire
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

    // Increment usage
    await supabase.from("licenses").update({
      usage_count: license.usage_count + 1,
    }).eq("id", license.id);

    // Check if admin
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

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
