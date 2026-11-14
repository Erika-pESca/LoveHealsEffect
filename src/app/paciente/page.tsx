import React from "react";
import { ModuleScaffold } from "@/components/ui/ModuleScaffold";

export default function PacientePage() {
  return (
    <ModuleScaffold
      moduleNumber="Módulo 3"
      roleLabel="Rol Paciente (Eje Central)"
      title="Espacio de la Paciente"
      description="Panel personalizado según la etapa de cáncer de mama, donde se centraliza la ficha médica, medicamentos, citas y recursos de bienestar."
      folderPath="src/components/paciente/"
      plannedFeatures={[
        "Ficha integral por etapa (Diagnóstico, Tratamiento Activo, Cirugía, Remisión).",
        "Lista de medicamentos, suplementos y calendario de citas médicas.",
        "Subida de documentos y notas del oncólogo para trazabilidad e IA.",
        "Acceso a música, podcasts, libros y reservas (Booking) con Sanadores.",
      ]}
    />
  );
}
