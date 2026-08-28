import { createClient } from "@supabase/supabase-js";

/**
 * Client Supabase côté générateur : utilise la clé service_role, qui
 * bypass RLS. Ne jamais réutiliser cette clé côté app/mobile —
 * l'app utilisera la clé anon (lecture seule sur topic_blocks, cf. schema.sql).
 */
export function getSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être définis dans .env");
  }

  return createClient(url, key);
}
