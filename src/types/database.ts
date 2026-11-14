export type RolUsuario = "paciente" | "cuidador" | "sanador" | "admin";

export type EtapaCancer =
  | "diagnostico"
  | "tratamiento_activo"
  | "cirugia_recuperacion"
  | "remision";

export interface FichaPacienteRow {
  id: number;
  paciente_usuario_id: number | null;
  cuidador_usuario_id: number | null;
  nombre_paciente: string;
  etapa_actual: EtapaCancer;
  antecedentes_medicos: string;
  resumen_ia: string;
}

export interface CitaBitacoraRow {
  id: number;
  ficha_paciente_id: number;
  sanador_usuario_id: number;
  modalidad: "online" | "presencial";
  fecha_sesion: string;
  estado_cita: "programada" | "completada" | "cancelada";
  estado_observado_paciente: string;
  patrones_detectados: string;
  recomendaciones_dadas: string;
}

