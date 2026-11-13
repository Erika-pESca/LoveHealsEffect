import React from "react";
import { ModuleScaffold } from "@/components/ui/ModuleScaffold";

export default function SanadorPage() {
  return (
    <ModuleScaffold
      moduleNumber="Módulo 5"
      roleLabel="Rol Sanador · Fase 1: Omar & Kelsey"
      title="Portal del Sanador y Trazabilidad"
      description="Herramienta de trabajo para Omar, Kelsey y futuros especialistas integrativos: contenidos, agenda de reservas, bitácora y resumen IA de la paciente."
      folderPath="src/modules/sanador/"
      plannedFeatures={[
        "Perfil público (Short Bio, especialidad) y disponibilidad para Booking.",
        "Subida de contenidos gratuitos: música, podcasts, libros PDF, videos y meditaciones.",
        "Lectura del Resumen Ejecutivo IA de la paciente antes de cada sesión.",
        "Bitácora Post-Sesión (notas, patrones, recomendaciones y subida de Word/audio/transcripción).",
      ]}
    />
  );
}
