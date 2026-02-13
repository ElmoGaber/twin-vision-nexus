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
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const isAdmin = roles?.some((r: any) => r.role === "admin") ?? false;
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const method = req.method;

    if (method === "GET") {
      // List all licenses with user info
      const { data: licenses, error } = await supabase
        .from("licenses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get user emails
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
      const { action } = body;

      if (action === "update") {
        const { license_id, ...updates } = body;
        const { error } = await supabase
          .from("licenses")
          .update(updates)
          .eq("id", license_id);

        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (action === "revoke") {
        const { license_id } = body;
        const { error } = await supabase
          .from("licenses")
          .update({ status: "revoked" })
          .eq("id", license_id);

        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (action === "activate") {
        const { license_id, expires_at, usage_limit, allowed_features, max_sessions, max_projects } = body;
        const { error } = await supabase
          .from("licenses")
          .update({
            status: "active",
            expires_at,
            usage_limit,
            allowed_features,
            max_sessions,
            max_projects,
          })
          .eq("id", license_id);

        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (action === "reset_usage") {
        const { license_id } = body;
        const { error } = await supabase
          .from("licenses")
          .update({ usage_count: 0 })
          .eq("id", license_id);

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
