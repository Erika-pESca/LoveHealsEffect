import nodemailer from "nodemailer";

interface SendMailResult {
  ok: boolean;
  messageId?: string;
  previewUrl?: string;
  error?: string;
}

/**
 * Crea el transportador de correo SMTP directo (sin intermediación de Supabase).
 */
function createTransporter() {
  const host = (process.env.SMTP_HOST || "smtp.gmail.com").trim();
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const user = (process.env.SMTP_USER || "").trim();
  const pass = (process.env.SMTP_PASS || "").replace(/\s+/g, "");

  // Si no hay credenciales SMTP configuradas aún, retornamos null
  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

/**
 * Plantilla HTML base con la estética visual de Love Heals Effect (colores suaves, rosa marca #E8809A, crema #F9F8F3).
 */
function wrapEmailTemplate(title: string, contentHtml: string): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F9F8F3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2D2B2A;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F9F8F3; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 560px; background-color: #FFFFFF; border-radius: 28px; overflow: hidden; box-shadow: 0 12px 36px rgba(232, 128, 154, 0.12); border: 1px solid rgba(232, 128, 154, 0.2);">
          
          <!-- Encabezado con marca y logo -->
          <tr>
            <td style="padding: 28px 32px; background: linear-gradient(135deg, #FCECEE 0%, #FFFFFF 100%); border-bottom: 1px solid rgba(232, 128, 154, 0.15); text-align: center;">
              <span style="display: inline-block; width: 44px; height: 44px; line-height: 44px; border-radius: 50%; background-color: #E8809A; color: #FFFFFF; font-size: 22px; font-weight: bold; margin-bottom: 8px;">♡</span>
              <h1 style="margin: 6px 0 2px 0; font-family: Georgia, serif; font-size: 22px; font-weight: bold; color: #2D2B2A; letter-spacing: -0.02em;">Love Heals Effect</h1>
              <p style="margin: 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; color: #E8809A;">Honolulu, Hawái · Cuidado que sana</p>
            </td>
          </tr>

          <!-- Contenido del Mensaje -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; font-size: 14px; line-height: 1.6; color: #4A4644;">
              ${contentHtml}
            </td>
          </tr>

          <!-- Pie del Correo -->
          <tr>
            <td style="padding: 20px 32px; background-color: #FAF9F6; border-top: 1px solid rgba(45, 43, 42, 0.08); text-align: center; font-size: 11px; color: #8C8885;">
              <p style="margin: 0 0 6px 0;">Este correo fue enviado directamente desde la plataforma Love Heals Effect.</p>
              <p style="margin: 0;">O'ahu · Maui · Hawái Island · © 2026 Love Heals Effect</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * 1. Envía correo de invitación al Cuidador / Familiar.
 */
export async function sendCaregiverInvitationEmail(params: {
  patientName: string;
  caregiverEmail: string;
  caregiverName?: string;
  inviteLink: string;
}): Promise<SendMailResult> {
  const { patientName, caregiverEmail, caregiverName, inviteLink } = params;

  const subject = `${patientName} te ha invitado a acompañarle en Love Heals Effect`;
  const nameToGreet = caregiverName ? caregiverName.split(" ")[0] : "Hola";

  const contentHtml = `
    <h2 style="margin: 0 0 16px 0; font-family: Georgia, serif; font-size: 20px; color: #2D2B2A;">¡${nameToGreet}!</h2>
    <p style="margin: 0 0 14px 0;">
      <strong style="color: #2D2B2A;">${patientName}</strong> se ha registrado en <strong>Love Heals Effect</strong> y te ha añadido como su persona de confianza y acompañante en su proceso de salud.
    </p>
    <p style="margin: 0 0 18px 0; color: #6E6865;">
      En esta plataforma privada podrán compartir una <strong>Bitácora Médica</strong> unificada: control de medicamentos, horarios, fechas de quimios y citas, para que no tengas que repetir su historia una y otra vez ante cada médico o familiar.
    </p>

    <div style="background-color: #FCECEE; border-left: 4px solid #E8809A; padding: 14px 18px; border-radius: 12px; margin: 20px 0;">
      <p style="margin: 0; font-size: 13px; color: #7F3348; line-height: 1.5;">
        <strong>Tu acceso como Cuidador:</strong> Tendrás tu propio inicio de sesión privado con herramientas de autorregulación emocional, meditaciones para cuidadores y sincronización directa con los datos médicos de ${patientName}.
      </p>
    </div>

    <div style="text-align: center; margin: 28px 0;">
      <a href="${inviteLink}" style="display: inline-block; background-color: #E8809A; color: #FFFFFF; font-size: 14px; font-weight: bold; text-decoration: none; padding: 14px 32px; border-radius: 50px; box-shadow: 0 8px 20px rgba(232, 128, 154, 0.35);">
        Aceptar Invitación y Crear mi Contraseña →
      </a>
    </div>

    <p style="margin: 20px 0 0 0; font-size: 12px; color: #8C8885; text-align: center;">
      Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
      <a href="${inviteLink}" style="color: #E8809A; word-break: break-all;">${inviteLink}</a>
    </p>
  `;

  return sendDirectEmail({
    to: caregiverEmail,
    subject,
    html: wrapEmailTemplate(subject, contentHtml),
    inviteLink,
  });
}

/**
 * 2. Envía correo de invitación a la Paciente (cuando el Cuidador la registra primero).
 */
export async function sendPatientInvitationEmail(params: {
  caregiverName: string;
  patientEmail: string;
  patientName: string;
  inviteLink: string;
}): Promise<SendMailResult> {
  const { caregiverName, patientEmail, patientName, inviteLink } = params;

  const subject = `${caregiverName} ha preparado tu espacio de sanación en Love Heals Effect`;
  const nameToGreet = patientName.split(" ")[0];

  const contentHtml = `
    <h2 style="margin: 0 0 16px 0; font-family: Georgia, serif; font-size: 20px; color: #2D2B2A;">Querida ${nameToGreet},</h2>
    <p style="margin: 0 0 14px 0;">
      <strong style="color: #2D2B2A;">${caregiverName}</strong> ha dado el primer paso por ti y ha creado tu ficha en <strong>Love Heals Effect</strong> para quitarte el peso de llevar citas y dosis en solitario.
    </p>
    <p style="margin: 0 0 18px 0; color: #6E6865;">
      Cuando tengas energía y desees ingresar, solo haz clic en el botón de abajo para activar tu usuario y definir tu contraseña. Tu espacio está listo con meditaciones guiadas, prácticas suaves y la contención de nuestra comunidad en Hawái.
    </p>

    <div style="text-align: center; margin: 28px 0;">
      <a href="${inviteLink}" style="display: inline-block; background-color: #E8809A; color: #FFFFFF; font-size: 14px; font-weight: bold; text-decoration: none; padding: 14px 32px; border-radius: 50px; box-shadow: 0 8px 20px rgba(232, 128, 154, 0.35);">
        Activar mi Espacio de Bienestar →
      </a>
    </div>

    <p style="margin: 20px 0 0 0; font-size: 12px; color: #8C8885; text-align: center;">
      Tómate tu tiempo. Este enlace estará disponible cuando lo necesites:<br>
      <a href="${inviteLink}" style="color: #E8809A; word-break: break-all;">${inviteLink}</a>
    </p>
  `;

  return sendDirectEmail({
    to: patientEmail,
    subject,
    html: wrapEmailTemplate(subject, contentHtml),
    inviteLink,
  });
}

/**
 * 3. Envía correo de recuperación de contraseña.
 */
export async function sendPasswordResetEmail(params: {
  userName: string;
  userEmail: string;
  resetLink: string;
}): Promise<SendMailResult> {
  const { userName, userEmail, resetLink } = params;
  const subject = `Recuperación de contraseña · Love Heals Effect`;
  const firstName = userName ? userName.split(" ")[0] : "Hola";

  const contentHtml = `
    <h2 style="margin: 0 0 16px 0; font-family: Georgia, serif; font-size: 20px; color: #2D2B2A;">Hola ${firstName},</h2>
    <p style="margin: 0 0 14px 0;">
      Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>Love Heals Effect</strong> asociada a <strong style="color: #2D2B2A;">${userEmail}</strong>.
    </p>
    <p style="margin: 0 0 20px 0; color: #6E6865;">
      Este enlace es válido por <strong>1 hora</strong> por motivos de seguridad:
    </p>

    <div style="text-align: center; margin: 28px 0;">
      <a href="${resetLink}" style="display: inline-block; background-color: #E8809A; color: #FFFFFF; font-size: 14px; font-weight: bold; text-decoration: none; padding: 14px 32px; border-radius: 50px; box-shadow: 0 8px 20px rgba(232, 128, 154, 0.35);">
        Restablecer mi Contraseña →
      </a>
    </div>

    <p style="margin: 20px 0 0 0; font-size: 12px; color: #8C8885; text-align: center;">
      Si no solicitaste este cambio, puedes ignorar este mensaje; tu contraseña actual continuará siendo la misma.<br>
      <a href="${resetLink}" style="color: #E8809A; word-break: break-all;">${resetLink}</a>
    </p>
  `;

  return sendDirectEmail({
    to: userEmail,
    subject,
    html: wrapEmailTemplate(subject, contentHtml),
    inviteLink: resetLink,
  });
}

/**
 * 4. Notifica cuando se produce una vinculación automática directa (ambos usuarios ya tienen cuenta).
 */
export async function sendAutoLinkedNotificationEmail(params: {
  to: string;
  recipientName: string;
  partnerName: string;
  partnerRole: "paciente" | "cuidador";
  dashboardLink: string;
}): Promise<SendMailResult> {
  const { to, recipientName, partnerName, partnerRole, dashboardLink } = params;
  const subject = `¡Tus cuentas se han vinculado con éxito! · Love Heals Effect`;
  const nameToGreet = recipientName ? recipientName.split(" ")[0] : "Hola";
  const partnerRoleLabel = partnerRole === "cuidador" ? "cuidador/a" : "paciente";

  const contentHtml = `
    <h2 style="margin: 0 0 16px 0; font-family: Georgia, serif; font-size: 20px; color: #2D2B2A;">¡Hola ${nameToGreet}!</h2>
    <p style="margin: 0 0 14px 0;">
      Te confirmamos que <strong style="color: #2D2B2A;">${partnerName}</strong> se ha registrado en <strong>Love Heals Effect</strong> como tu <strong>${partnerRoleLabel}</strong>.
    </p>
    <p style="margin: 0 0 18px 0; color: #6E6865;">
      El sistema detectó automáticamente sus cuentas y las ha <strong>vinculado y sincronizado de inmediato</strong>. Ya pueden compartir la bitácora médica, el control de medicamentos, fechas de quimios y notas clínicas.
    </p>

    <div style="text-align: center; margin: 28px 0;">
      <a href="${dashboardLink}" style="display: inline-block; background-color: #E8809A; color: #FFFFFF; font-size: 14px; font-weight: bold; text-decoration: none; padding: 14px 32px; border-radius: 50px; box-shadow: 0 8px 20px rgba(232, 128, 154, 0.35);">
        Entrar a mi Panel Sincronizado →
      </a>
    </div>

    <p style="margin: 20px 0 0 0; font-size: 12px; color: #8C8885; text-align: center;">
      Tu equipo de Love Heals Effect · Cuidado que sana
    </p>
  `;

  return sendDirectEmail({
    to,
    subject,
    html: wrapEmailTemplate(subject, contentHtml),
    inviteLink: dashboardLink,
  });
}

/**
 * Función interna que despacha el correo vía SMTP directo.
 * Si las credenciales SMTP no están en .env, loguea el mensaje en consola
 * y devuelve el enlace directamente para que el flujo nunca falle en desarrollo.
 */
async function sendDirectEmail(options: {
  to: string;
  subject: string;
  html: string;
  inviteLink?: string;
}): Promise<SendMailResult> {
  const from =
    process.env.SMTP_FROM || '"Love Heals Effect" <contacto@lovehealseffect.com>';
  const transporter = createTransporter();

  if (!transporter) {
    console.log("------------------------------------------------------------");
    console.log("✉️ [CORREO DIRECTO (Modo Simulado / SMTP sin credenciales)]");
    console.log(`Para: ${options.to}`);
    console.log(`Asunto: ${options.subject}`);
    if (options.inviteLink) {
      console.log(`Enlace de acción: ${options.inviteLink}`);
    }
    console.log("------------------------------------------------------------");

    return {
      ok: true,
      previewUrl: options.inviteLink,
      messageId: `simulated-${Date.now()}`,
    };
  }

  try {
    const info = await transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    console.log(`✅ Correo enviado exitosamente a ${options.to} (ID: ${info.messageId})`);
    return {
      ok: true,
      messageId: info.messageId,
      previewUrl: options.inviteLink,
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Error al enviar correo";
    console.error(`❌ Error enviando correo directo a ${options.to}:`, errorMsg);
    // Devolvemos ok: false pero con mensaje descriptivo
    return {
      ok: false,
      error: errorMsg,
      previewUrl: options.inviteLink,
    };
  }
}
