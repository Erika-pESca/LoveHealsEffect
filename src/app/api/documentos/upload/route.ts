import { NextRequest, NextResponse } from "next/server";
import {
  getSessionFromRequest,
  resolveUserFichaId,
  saveLocalDocument,
} from "@/lib/local-documents";

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json(
        { ok: false, error: "Sesión no iniciada" },
        { status: 401 }
      );
    }

    const fichaId = await resolveUserFichaId(session);
    if (!fichaId) {
      return NextResponse.json(
        { ok: false, error: "No se encontró una ficha de paciente vinculada." },
        { status: 404 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: "Debes adjuntar un archivo válido." },
        { status: 400 }
      );
    }

    const saved = await saveLocalDocument(fichaId, file);
    return NextResponse.json({ ok: true, ...saved });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "No se pudo guardar el archivo." },
      { status: 400 }
    );
  }
}
