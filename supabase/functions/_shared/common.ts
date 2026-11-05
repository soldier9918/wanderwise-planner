import { createClient } from "npm:@supabase/supabase-js@2";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version, x-lovable-aig-run-id",
  "Access-Control-Expose-Headers": "X-Lovable-AIG-Run-ID",
};

export const GATEWAY_URL = "https://ai.gateway.lovable.dev";

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/** Returns a user-scoped client (RLS applies) and the signed-in user, or null. */
export async function getUserClient(req: Request) {
  const authHeader = req.headers.get("Authorization") ?? "";
  const client = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) return null;
  return { client, user: data.user };
}

export function adminClient() {
  return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
}

/** Map gateway failures to a friendly message, preserving the status. */
export async function gatewayError(res: Response) {
  let message = "The AI service could not complete this request.";
  try {
    const body = await res.json();
    message = body?.error?.message ?? body?.message ?? message;
  } catch { /* ignore */ }
  if (res.status === 402) message = "Your workspace is out of AI credits. Add credits in Settings → Plans & credits.";
  if (res.status === 429) message = "Too many requests right now — please wait a moment and try again.";
  return json({ error: message }, res.status);
}
