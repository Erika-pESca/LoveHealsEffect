"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Download,
  ExternalLink,
  Eye,
  FileText,
  FolderOpen,
  Trash2,
  X,
} from "lucide-react";
import { Card } from "@/components/panel/ui";

export interface DocumentItem {
  id?: number | string;
  titulo: string;
  tipo: string;
  fecha: string;
  notas?: string;
  archivoNombre?: string;
  archivoRuta?: string;
  mimeType?: string;
  sizeBytes?: number;
}

interface DocumentCardsListProps {
  documents: DocumentItem[];
  emptyText: string;
  onDelete: (index: number) => void;
  t: (es: string, en: string) => string;
}

function formatSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return "";
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function isImageDoc(doc: DocumentItem): boolean {
  if (doc.mimeType?.startsWith("image/")) return true;
  return /\.(jpg|jpeg|png|webp|gif)$/i.test(doc.archivoNombre || "");
}

function isPdfDoc(doc: DocumentItem): boolean {
  if (doc.mimeType === "application/pdf") return true;
  return /\.pdf$/i.test(doc.archivoNombre || "");
}

function isDocxDoc(doc: DocumentItem): boolean {
  if (
    doc.mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return true;
  }
  return /\.docx$/i.test(doc.archivoNombre || "");
}

function matchesDocCategory(doc: DocumentItem, filter: string): boolean {
  if (filter === "todos") return true;
  const tipo = (doc.tipo || "").toLowerCase();
  if (filter === "receta") return tipo.includes("receta") || tipo.includes("nota") || tipo.includes("indicac");
  if (filter === "lab") return tipo.includes("lab");
  if (filter === "imagen") return tipo.includes("imagen") || tipo.includes("patolog");
  return true;
}

function DocumentPreviewBody({
  doc,
  t,
  tall = false,
}: {
  doc: DocumentItem;
  t: (es: string, en: string) => string;
  tall?: boolean;
}) {
  if (!doc.archivoRuta) {
    return (
      <div className="rounded-2xl border border-dashed border-[#6BB1AD]/35 bg-[#FAF7F2] p-6 text-center">
        <FileText className="mx-auto h-10 w-10 text-[#6BB1AD]" />
        <p className="mt-2.5 text-sm font-bold text-espresso">{doc.titulo}</p>
        <p className="mt-1 text-xs text-espresso/60">
          {t(
            "Registro de muestra sin archivo adjunto. Sube un PDF, Word o foto real para previsualizarlo aquí.",
            "Sample entry without an attached file. Upload a real PDF, Word, or photo to preview it here."
          )}
        </p>
        {doc.notas && (
          <div className="mt-4 rounded-xl bg-white p-3.5 text-left text-xs leading-relaxed text-espresso/80 shadow-xs">
            <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#239BA2]">
              {t("Notas clínicas", "Clinical notes")}
            </span>
            {doc.notas}
          </div>
        )}
      </div>
    );
  }

  if (isImageDoc(doc)) {
    return (
      <div className="flex items-center justify-center rounded-2xl bg-[#FAF7F2] p-3">
        <img
          src={doc.archivoRuta}
          alt={doc.titulo}
          className={`w-auto rounded-xl object-contain ${tall ? "max-h-[540px]" : "max-h-[65vh]"}`}
        />
      </div>
    );
  }

  if (isPdfDoc(doc)) {
    return (
      <iframe
        src={doc.archivoRuta}
        title={doc.titulo}
        className={`w-full rounded-2xl border border-espresso/10 bg-[#FAF7F2] ${
          tall ? "h-[540px]" : "h-[65vh]"
        }`}
      />
    );
  }

  if (isDocxDoc(doc)) {
    return (
      <iframe
        src={`${doc.archivoRuta}?preview=html`}
        title={doc.titulo}
        sandbox=""
        className={`w-full rounded-2xl border border-espresso/10 bg-white ${
          tall ? "h-[540px]" : "h-[65vh]"
        }`}
      />
    );
  }

  return (
    <div className="rounded-2xl bg-[#FAF7F2] p-8 text-center">
      <FileText className="mx-auto h-11 w-11 text-[#E6748E]" />
      <p className="mt-3 text-sm font-bold text-espresso">
        {t(
          "Vista previa no disponible para este formato.",
          "Preview not available for this file format."
        )}
      </p>
      <p className="mt-1 text-xs text-espresso/60">
        {t(
          "Puedes descargarlo directamente para abrirlo en tu dispositivo.",
          "You can download it directly to open it on your device."
        )}
      </p>
    </div>
  );
}

export function DocumentCardsList({
  documents,
  emptyText,
  onDelete,
  t,
}: DocumentCardsListProps) {
  const [typeFilter, setTypeFilter] = useState("todos");
  const [selectedKey, setSelectedKey] = useState<string | number | null>(null);
  const [mobilePreviewDoc, setMobilePreviewDoc] = useState<DocumentItem | null>(null);

  const indexedDocs = useMemo(
    () => documents.map((doc, originalIndex) => ({ doc, originalIndex, key: doc.id ?? originalIndex })),
    [documents]
  );

  const filteredDocs = useMemo(
    () => indexedDocs.filter(({ doc }) => matchesDocCategory(doc, typeFilter)),
    [indexedDocs, typeFilter]
  );

  useEffect(() => {
    if (filteredDocs.length === 0) {
      setSelectedKey(null);
      return;
    }
    const stillExists = filteredDocs.some((item) => item.key === selectedKey);
    if (!stillExists) {
      setSelectedKey(filteredDocs[0].key);
    }
  }, [filteredDocs, selectedKey]);

  const activeEntry =
    filteredDocs.find((item) => item.key === selectedKey) ?? filteredDocs[0] ?? null;

  if (documents.length === 0) {
    return (
      <Card className="border border-dashed border-[#6BB1AD]/35 bg-white/80 py-10 text-center">
        <FolderOpen className="mx-auto h-10 w-10 text-[#6BB1AD]" />
        <p className="mt-3 text-sm font-medium text-espresso/70">{emptyText}</p>
      </Card>
    );
  }

  return (
    <>
      {/* Filtros rápidos por tipo de documento */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          ["todos", t("Todos", "All")],
          ["receta", t("Recetas / Notas", "Prescriptions")],
          ["lab", t("Laboratorios", "Labs")],
          ["imagen", t("Imágenes", "Imaging")],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTypeFilter(id)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
              typeFilter === id
                ? "bg-[#239BA2] text-white shadow-sm"
                : "bg-white text-espresso/70 border border-espresso/10 hover:border-[#6BB1AD]/50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Layout Maestro-Detalle en escritorio: Lista izquierda + Previsualización derecha */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-start">
        <div className="space-y-3 lg:col-span-5">
          {filteredDocs.length === 0 && (
            <Card className="text-center text-sm text-espresso/60">
              {t("No hay documentos en esta categoría.", "No documents in this category.")}
            </Card>
          )}

          {filteredDocs.map(({ doc: d, originalIndex, key }) => {
            const sizeLabel = formatSize(d.sizeBytes);
            const hasRealFile = Boolean(d.archivoRuta);
            const isSelected = activeEntry?.key === key;

            return (
              <div
                key={key}
                onClick={() => setSelectedKey(key)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedKey(key);
                  }
                }}
                className={`group cursor-pointer rounded-3xl border bg-white p-4 transition-all ${
                  isSelected
                    ? "border-[#239BA2] bg-[#F4F8F8] shadow-[0_10px_28px_rgba(35,155,162,0.14)]"
                    : "border-white/90 shadow-sm hover:border-[#6BB1AD]/45 hover:shadow-md"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition ${
                      isSelected
                        ? "bg-[#239BA2] text-white"
                        : "bg-[#FDF3EF] text-[#E6748E]"
                    }`}
                  >
                    <FileText className="h-5 w-5" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-sm font-bold text-espresso">{d.titulo}</p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(originalIndex);
                        }}
                        className="shrink-0 text-espresso/30 transition hover:text-[#C94A6A]"
                        aria-label={t("Eliminar", "Delete")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <p className="mt-0.5 text-xs text-espresso/55">
                      {d.tipo} · {d.fecha}
                    </p>

                    {d.notas && (
                      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-espresso/75">
                        {d.notas}
                      </p>
                    )}

                    <div className="mt-2.5 flex flex-wrap items-center gap-2">
                      {d.archivoNombre && (
                        <span className="max-w-[180px] truncate rounded-full bg-[#FAF7F2] px-2.5 py-1 text-[11px] font-semibold text-espresso/70">
                          📎 {d.archivoNombre}
                          {sizeLabel ? ` (${sizeLabel})` : ""}
                        </span>
                      )}

                      {hasRealFile ? (
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedKey(key);
                              setMobilePreviewDoc(d);
                            }}
                            className="inline-flex items-center gap-1 rounded-full bg-[#E5F2F1] px-3 py-1 text-[11px] font-bold text-[#239BA2] transition hover:bg-[#d2eae8] lg:hidden"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>{t("Ver", "View")}</span>
                          </button>
                          <a
                            href={`${d.archivoRuta}?download=1`}
                            download={d.archivoNombre || "documento"}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 rounded-full bg-[#FCECEE] px-3 py-1 text-[11px] font-bold text-[#C94A6A] transition hover:bg-[#f8dce0] lg:hidden"
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span>{t("Descargar", "Download")}</span>
                          </a>
                        </>
                      ) : (
                        <span className="rounded-full bg-espresso/5 px-2.5 py-1 text-[10px] font-semibold text-espresso/45">
                          {t("Registro de muestra", "Sample entry")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Panel derecho de Previsualización en vivo (Desktop) */}
        <div className="hidden lg:sticky lg:top-6 lg:block lg:col-span-7">
          {activeEntry ? (
            <div className="rounded-[28px] border border-white/90 bg-white p-5 shadow-[0_14px_36px_rgba(35,155,162,0.1)]">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-espresso/10 pb-3.5">
                <div className="min-w-0 flex-1">
                  <span className="inline-block rounded-full bg-[#E5F2F1] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#239BA2]">
                    {activeEntry.doc.tipo}
                  </span>
                  <h3 className="mt-1.5 truncate text-xl font-semibold tracking-[-0.025em] text-espresso">
                    {activeEntry.doc.titulo}
                  </h3>
                  <p className="mt-0.5 truncate text-xs text-espresso/60">
                    {activeEntry.doc.archivoNombre || t("Sin archivo adjunto", "No file attached")}
                    {activeEntry.doc.sizeBytes ? ` · ${formatSize(activeEntry.doc.sizeBytes)}` : ""}
                    {` · ${activeEntry.doc.fecha}`}
                  </p>
                </div>

                {activeEntry.doc.archivoRuta && (
                  <div className="flex shrink-0 items-center gap-2">
                    <a
                      href={
                        isDocxDoc(activeEntry.doc)
                          ? `${activeEntry.doc.archivoRuta}?preview=html`
                          : activeEntry.doc.archivoRuta
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#E5F2F1] px-3.5 py-2 text-xs font-bold text-[#239BA2] transition hover:bg-[#d2eae8]"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>{t("Abrir", "Open")}</span>
                    </a>
                    <a
                      href={`${activeEntry.doc.archivoRuta}?download=1`}
                      download={activeEntry.doc.archivoNombre || "documento"}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#E6748E] px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#d65c78]"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>{t("Descargar", "Download")}</span>
                    </a>
                  </div>
                )}
              </div>

              {activeEntry.doc.notas && activeEntry.doc.archivoRuta && (
                <div className="mt-3 rounded-2xl bg-[#FDF3EF] px-4 py-2.5 text-xs leading-relaxed text-espresso/80">
                  <span className="font-bold text-[#C9526D]">
                    {t("Notas del médico: ", "Doctor notes: ")}
                  </span>
                  {activeEntry.doc.notas}
                </div>
              )}

              <div className="mt-4">
                <DocumentPreviewBody doc={activeEntry.doc} t={t} tall />
              </div>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-[28px] border border-dashed border-espresso/15 bg-white/70 p-6 text-center text-sm text-espresso/50">
              {t(
                "Selecciona un documento a la izquierda para previsualizarlo aquí.",
                "Select a document on the left to preview it here."
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de vista previa en móvil / pantallas pequeñas */}
      {mobilePreviewDoc && mobilePreviewDoc.archivoRuta && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-espresso/50 p-4 backdrop-blur-sm lg:hidden"
          onClick={() => setMobilePreviewDoc(null)}
        >
          <div
            className="w-full max-w-2xl rounded-[28px] bg-white p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-espresso/10 pb-3">
              <div className="min-w-0">
                <h3 className="truncate text-lg font-semibold tracking-[-0.025em] text-espresso">
                  {mobilePreviewDoc.titulo}
                </h3>
                <p className="truncate text-xs text-espresso/60">
                  {mobilePreviewDoc.archivoNombre} · {mobilePreviewDoc.fecha}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMobilePreviewDoc(null)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-espresso/5 text-espresso/70 transition hover:bg-espresso/10"
                aria-label={t("Cerrar", "Close")}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4">
              <DocumentPreviewBody doc={mobilePreviewDoc} t={t} />
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
              <a
                href={mobilePreviewDoc.archivoRuta}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#E5F2F1] px-4 py-2 text-xs font-bold text-[#239BA2] transition hover:bg-[#d2eae8]"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>{t("Abrir en pestaña", "Open in tab")}</span>
              </a>
              <a
                href={`${mobilePreviewDoc.archivoRuta}?download=1`}
                download={mobilePreviewDoc.archivoNombre || "documento"}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#E6748E] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#d65c78]"
              >
                <Download className="h-3.5 w-3.5" />
                <span>{t("Descargar", "Download")}</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
