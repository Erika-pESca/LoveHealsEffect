import React from "react";
import { ModuleScaffold } from "@/components/ui/ModuleScaffold";

export default function RegistroPage() {
  return (
    <ModuleScaffold
      moduleNumber="Módulo 2"
      roleLabel="Célula Paciente – Cuidador"
      title="Registro Vinculado 1 a 1"
      description="Flujo bidireccional para crear la Célula Paciente-Cuidador sin importar quién llegue primero a la plataforma."
      folderPath="src/modules/auth/"
      plannedFeatures={[
        "Flujo A (Paciente): Crea su cuenta y agrega/invita a su cuidador o lo deja pendiente.",
        "Flujo B (Cuidador): Crea su cuenta y registra a su paciente en 3 pasos simples si está en cama.",
        "Creación automática del vínculo lógico 1 a 1 en 'ficha_paciente'.",
      ]}
    />
  );
}
