import React from "react";
import { ModuleScaffold } from "@/components/ui/ModuleScaffold";

export default function AdminPage() {
  return (
    <ModuleScaffold
      moduleNumber="Módulo 6"
      roleLabel="Rol Administrador"
      title="Panel de Administración Global"
      description="Control de contenidos bilingües de la plataforma, supervisión de células Paciente-Cuidador, gestión de sanadores y entrenamiento de la IA."
      folderPath="src/modules/admin/"
      plannedFeatures={[
        "Edición de contenidos públicos de la web en Inglés y Español.",
        "Gestión de usuarios, vínculos 1 a 1 y aprobación de nuevos sanadores.",
        "Supervisión y entrenamiento interno del motor de resúmenes de IA.",
      ]}
    />
  );
}
