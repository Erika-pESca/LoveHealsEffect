import React from "react";
import { ModuleScaffold } from "@/components/ui/ModuleScaffold";

export default function CuidadorPage() {
  return (
    <ModuleScaffold
      moduleNumber="Módulo 4"
      roleLabel="Rol Cuidador"
      title="Espacio del Cuidador"
      description="Contenido exclusivo para familiares y cuidadores, conectado 1 a 1 con el calendario de medicinas, citas y documentos de su paciente."
      folderPath="src/components/cuidador/"
      plannedFeatures={[
        "Ficha propia del cuidador (parentesco, horarios disponibles y áreas de apoyo).",
        "Tablero compartido en tiempo real con 'ficha_paciente' (medicinas y citas).",
        "Registro rápido de paciente en 3 pasos y guías prácticas de autocuidado.",
        "Reservas con sanadores tanto para la paciente como para el cuidador.",
      ]}
    />
  );
}
