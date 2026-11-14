/**
 * Utilidades generales del proyecto Love Heals Effect.
 */
export function formatShortDate(isoDate: string, locale: "es" | "en" = "es"): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString(locale === "es" ? "es-CO" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

