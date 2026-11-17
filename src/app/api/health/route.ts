import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const EXPECTED_TABLES = [
  "usuarios",
  "ficha_paciente",
  "ficha_cuidador",
  "sanadores_y_contenidos",
  "citas_y_bitacora_sanador",
  "pagos_y_suscripciones",
  "tickets_feedback",
] as const;

export async function GET() {
  try {
    const checks = await Promise.all(
      EXPECTED_TABLES.map(async (table) => {
        const { error } = await supabaseAdmin
          .from(table)
          .select("id", { count: "exact", head: true });
        return { table, ok: !error, error: error?.message ?? null };
      })
    );

    const allOk = checks.every((c) => c.ok);
    return NextResponse.json(
      {
        ok: allOk,
        database: allOk
          ? "Supabase conectado y 7 tablas listas"
          : "Conexión realizada, faltan tablas por crear en SQL Editor",
        checks,
      },
      { status: allOk ? 200 : 500 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
