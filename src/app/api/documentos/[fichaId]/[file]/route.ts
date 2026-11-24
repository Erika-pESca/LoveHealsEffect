import fs from "fs/promises";
import path from "path";
import mammoth from "mammoth";
import { NextRequest, NextResponse } from "next/server";
import {
  canAccessFichaDocument,
  getMimeTypeFromFilename,
  getSessionFromRequest,
  getUploadsDir,
} from "@/lib/local-documents";

function buildDocxPreviewHtml(bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  body {
    font-family: "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    color: #262322;
    background: #ffffff;
    margin: 0;
    padding: 24px 28px;
    line-height: 1.6;
    font-size: 14px;
  }
  h1, h2, h3, h4 { color: #262322; margin-top: 1.2em; margin-bottom: 0.5em; line-height: 1.25; }
  h1 { font-size: 20px; border-bottom: 1px solid #edecdb; padding-bottom: 6px; }
  h2 { font-size: 17px; color: #239BA2; }
  h3 { font-size: 15px; }
  p { margin: 0.6em 0; }
  ul, ol { padding-left: 22px; margin: 0.6em 0; }
  li { margin: 0.25em 0; }
  table { width: 100%; border-collapse: collapse; margin: 1em 0; font-size: 13px; }
  th, td { border: 1px solid #e5e2d9; padding: 8px 10px; text-align: left; }
  th { background: #faf7f2; font-weight: 700; }
  img { max-width: 100%; height: auto; border-radius: 8px; }
</style>
</head>
<body>${bodyHtml}</body>
</html>`;
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ fichaId: string; file: string }> }
) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }

    const { fichaId: rawFichaId, file: rawFile } = await context.params;
    const fichaId = Number(rawFichaId);
    if (!Number.isInteger(fichaId) || fichaId <= 0) {
      return NextResponse.json({ ok: false, error: "Ficha inválida" }, { status: 400 });
    }

    const allowed = await canAccessFichaDocument(session, fichaId);
    if (!allowed) {
      return NextResponse.json({ ok: false, error: "Acceso denegado" }, { status: 403 });
    }

    const safeFileName = path.basename(decodeURIComponent(rawFile));
    const fullPath = path.join(getUploadsDir(fichaId), safeFileName);
    const fileBuffer = await fs.readFile(fullPath);

    const download = req.nextUrl.searchParams.get("download") === "1";
    const preview = req.nextUrl.searchParams.get("preview");
    const mimeType = getMimeTypeFromFilename(safeFileName);
    const displayName = safeFileName.replace(/^\d+-[a-f0-9]+-/, "");

    if (preview === "html" && /\.docx$/i.test(safeFileName)) {
      const result = await mammoth.convertToHtml({ buffer: fileBuffer });
      const html = buildDocxPreviewHtml(result.value || "<p>(Documento vacío)</p>");
      return new NextResponse(html, {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; img-src data:;",
          "Cache-Control": "private, max-age=3600",
        },
      });
    }

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${encodeURIComponent(displayName)}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err: any) {
    if (err?.code === "ENOENT") {
      return NextResponse.json(
        { ok: false, error: "Archivo no encontrado en almacenamiento local." },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { ok: false, error: "Error leyendo el documento." },
      { status: 500 }
    );
  }
}
