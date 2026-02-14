import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Whitelist of allowed update fields
const ALLOWED_UPDATE_FIELDS = ["status", "expires_at", "usage_limit", "usage_count", "allowed_features", "max_sessions", "max_projects"];
const ALLOWED_STATUSES = ["active", "trial", "expired", "revoked", "suspended"];
const ALLOWED_FEATURES = ["dashboard", "analytics", "vr", "alarms", "assets", "settings", "admin"];

function sanitizeUpdates(body: any): Record<string, any> {
  const clean: Record<string, any> = {};
  for (const key of ALLOWED_UPDATE_FIELDS) {
    if (body[key] !== undefined) {
      if (key === "status" && !ALLOWED_STATUSES.includes(body[key])) continue;
      if (key === "allowed_features") {
        if (!Array.isArray(body[key])) continue;
        clean[key] = body[key].filter((f: string) => ALLOWED_FEATURES.includes(f));
        continue;
      }
      if (["usage_limit", "usage_count", "max_sessions", "max_projects"].includes(key)) {
        const num = Number(body[key]);
        if (isNaN(num) || num < 0) continue;
        clean[key] = num;
        continue;
      }
      if (key === "expires_at") {
        const d = new Date(body[key]);
        if (isNaN(d.getTime())) continue;
        clean[key] = d.toISOString();
        continue;
      }
      clean[key] = body[key];
    }
  }
  return clean;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify token
    const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await anonClient.auth.getClaims(token);

    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub as string;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check admin role
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    const isAdmin = roles?.some((r: any) => r.role === "admin") ?? false;
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Also verify admin has valid license
    const { data: adminLicense } = await supabase
      .from("licenses")
      .select("status, expires_at")
      .eq("user_id", userId)
      .single();

    if (!adminLicense || !["active"].includes(adminLicense.status) || new Date(adminLicense.expires_at) <= new Date()) {
      return new Response(JSON.stringify({ error: "Admin license invalid" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const method = req.method;

    if (method === "GET") {
      const { data: licenses, error } = await supabase
        .from("licenses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const userIds = licenses?.map((l: any) => l.user_id) ?? [];
      const usersWithEmails = [];
      for (const uid of userIds) {
        const { data: { user: u } } = await supabase.auth.admin.getUserById(uid);
        usersWithEmails.push({ user_id: uid, email: u?.email, full_name: u?.user_metadata?.full_name });
      }

      const enriched = licenses?.map((l: any) => ({
        ...l,
        user_email: usersWithEmails.find((u: any) => u.user_id === l.user_id)?.email,
        user_name: usersWithEmails.find((u: any) => u.user_id === l.user_id)?.full_name,
      }));

      return new Response(JSON.stringify({ licenses: enriched }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (method === "POST") {
      const body = await req.json();
      const { action, license_id } = body;

      // Validate license_id is a valid UUID
      if (!license_id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(license_id)) {
        return new Response(JSON.stringify({ error: "Invalid license_id" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (action === "update") {
        const cleanUpdates = sanitizeUpdates(body);
        if (Object.keys(cleanUpdates).length === 0) {
          return new Response(JSON.stringify({ error: "No valid fields to update" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const { error } = await supabase.from("licenses").update(cleanUpdates).eq("id", license_id);
        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (action === "revoke") {
        const { error } = await supabase.from("licenses").update({ status: "revoked" }).eq("id", license_id);
        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (action === "activate") {
        const cleanUpdates = sanitizeUpdates({
          status: "active",
          expires_at: body.expires_at,
          usage_limit: body.usage_limit,
          allowed_features: body.allowed_features,
          max_sessions: body.max_sessions,
          max_projects: body.max_projects,
        });
        const { error } = await supabase.from("licenses").update(cleanUpdates).eq("id", license_id);
        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (action === "reset_usage") {
        const { error } = await supabase.from("licenses").update({ usage_count: 0 }).eq("id", license_id);
        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "Unknown action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
