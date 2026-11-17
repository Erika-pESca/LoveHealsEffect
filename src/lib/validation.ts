/**
 * Utilidades y reglas de validación para Formularios de Autenticación y Registro.
 * Reglas solicitadas:
 * 1. Nombres: No pueden contener números.
 * 2. Celular: No puede contener letras.
 * 3. Contraseña: Mínimo 6 caracteres, al menos 1 mayúscula y al menos 1 número.
 * 4. Correo: Debe contener '@' y formato de dominio válido.
 */

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const HAS_UPPERCASE_REGEX = /[A-ZÁÉÍÓÚÑ]/;
export const HAS_NUMBER_REGEX = /[0-9]/;
export const HAS_NUMBER_IN_TEXT_REGEX = /[0-9]/;
export const HAS_LETTER_IN_PHONE_REGEX = /[a-zA-Z]/;

export function validateName(
  name: string,
  fieldName = "nombre"
): { valid: boolean; error?: string } {
  const trimmed = name.trim();
  if (!trimmed) {
    return { valid: false, error: `El ${fieldName} es obligatorio.` };
  }
  if (HAS_NUMBER_IN_TEXT_REGEX.test(trimmed)) {
    return {
      valid: false,
      error: `El ${fieldName} no puede contener números, solo letras.`,
    };
  }
  if (trimmed.length < 2) {
    return {
      valid: false,
      error: `El ${fieldName} debe tener al menos 2 caracteres.`,
    };
  }
  return { valid: true };
}

export function validateEmail(email: string): { valid: boolean; error?: string } {
  const trimmed = email.trim();
  if (!trimmed) {
    return { valid: false, error: "El correo electrónico es obligatorio." };
  }
  if (!trimmed.includes("@")) {
    return {
      valid: false,
      error: "El correo debe incluir el símbolo '@' (ejemplo: nombre@gmail.com).",
    };
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return {
      valid: false,
      error:
        "Ingresa un correo electrónico válido con dominio (ejemplo: usuario@gmail.com).",
    };
  }
  return { valid: true };
}

export function validatePhone(phone: string): { valid: boolean; error?: string } {
  const trimmed = phone.trim();
  if (!trimmed) {
    return { valid: true }; // Teléfono opcional
  }
  if (HAS_LETTER_IN_PHONE_REGEX.test(trimmed)) {
    return {
      valid: false,
      error: "El número de celular no puede contener letras, solo dígitos.",
    };
  }
  const digitsOnly = trimmed.replace(/[^0-9]/g, "");
  if (digitsOnly.length < 7) {
    return {
      valid: false,
      error: "El número de celular debe tener al menos 7 dígitos.",
    };
  }
  return { valid: true };
}

export function validatePassword(password: string): {
  valid: boolean;
  error?: string;
} {
  if (!password) {
    return { valid: false, error: "La contraseña es obligatoria." };
  }
  if (password.length < 6) {
    return {
      valid: false,
      error: "La contraseña debe tener al menos 6 caracteres.",
    };
  }
  if (!HAS_UPPERCASE_REGEX.test(password)) {
    return {
      valid: false,
      error:
        "La contraseña debe tener al menos una letra mayúscula (ej: A, B, C...).",
    };
  }
  if (!HAS_NUMBER_REGEX.test(password)) {
    return {
      valid: false,
      error: "La contraseña debe tener al menos un número (ej: 1, 2, 3...).",
    };
  }
  return { valid: true };
}

/**
 * Filtro en tiempo real para inputs de nombres:
 * Elimina cualquier número que el usuario intente escribir o pegar.
 */
export function sanitizeNameInput(val: string): string {
  return val.replace(/[0-9]/g, "");
}

/**
 * Filtro en tiempo real para inputs de celular:
 * Elimina cualquier letra (a-z, A-Z) que el usuario intente escribir o pegar.
 */
export function sanitizePhoneInput(val: string): string {
  return val.replace(/[a-zA-Z]/g, "");
}
