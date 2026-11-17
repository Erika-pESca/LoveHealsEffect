import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL ?? "";
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY ?? "";
const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY ?? "";

if (!supabaseUrl) {
  console.warn("Advertencia: Falta SUPABASE_URL en .env");
}

/**
 * Cliente administrativo de Supabase para uso EXCLUSIVO en el servidor (src/app/api/).
 */
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseSecretKey || supabasePublishableKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);
