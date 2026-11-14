/**
 * Utilidades de autenticación, hashing y validación de sesión por rol.
 */
import type { UserRole } from "@/types";

export function getDashboardPathByRole(role: UserRole): string {
  switch (role) {
    case "patient":
      return "/paciente";
    case "caregiver":
      return "/cuidador";
    case "healer":
      return "/sanador";
    case "admin":
      return "/admin";
  }
}

