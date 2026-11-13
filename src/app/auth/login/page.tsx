import React from "react";
import { ModuleScaffold } from "@/components/ui/ModuleScaffold";

export default function LoginPage() {
  return (
    <ModuleScaffold
      moduleNumber="Módulo 2"
      roleLabel="Autenticación"
      title="Login Único por Rol"
      description="Inicio de sesión para Pacientes, Cuidadores, Sanadores (Omar & Kelsey) y Administrador. Redirige automáticamente al panel correspondiente."
      folderPath="src/modules/auth/"
      plannedFeatures={[
        "Autenticación contra la tabla 'usuarios' en PostgreSQL.",
        "Redirección automática según rol: /paciente, /cuidador, /sanador o /admin.",
        "Acceso directo optimizado para escaneo de Código QR en eventos.",
      ]}
    />
  );
}
