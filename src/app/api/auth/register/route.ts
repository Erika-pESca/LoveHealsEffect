import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import {
  hashPassword,
  createSessionToken,
  createInvitationToken,
  verifyInvitationToken,
  getSessionCookieOptions,
  SESSION_COOKIE_NAME,
} from "@/lib/auth";
import {
  validateName,
  validateEmail,
  validatePhone,
  validatePassword,
} from "@/lib/validation";
import {
  sendCaregiverInvitationEmail,
  sendPatientInvitationEmail,
  sendAutoLinkedNotificationEmail,
} from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      role, // 'paciente' | 'cuidador'
      fullName,
      email,
      phone = "",
      password,
      // Datos Paciente
      cancerStage = "diagnostico",
      inviteCaregiver = false,
      caregiverName = "",
      caregiverEmail = "",
      caregiverRelationship = "Familiar",
      // Datos Cuidador
      patientName = "",
      patientEmail = "",
      caregiverSchedule = "",
      // Token opcional si viene de una invitación
      invitationToken,
    } = body;

    if (!role || !fullName || !email || !password) {
      return NextResponse.json(
        { ok: false, error: "Faltan campos obligatorios para el registro" },
        { status: 400 }
      );
    }

    // Validaciones estrictas solicitadas:
    // 1. Nombre: sin números
    const nameCheck = validateName(fullName, "nombre completo");
    if (!nameCheck.valid) {
      return NextResponse.json({ ok: false, error: nameCheck.error }, { status: 400 });
    }

    // 2. Correo: formato válido y con @
    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      return NextResponse.json({ ok: false, error: emailCheck.error }, { status: 400 });
    }

    // 3. Teléfono: sin letras
    const phoneCheck = validatePhone(phone);
    if (!phoneCheck.valid) {
      return NextResponse.json({ ok: false, error: phoneCheck.error }, { status: 400 });
    }

    // 4. Contraseña: mayúscula y número
    const passCheck = validatePassword(password);
    if (!passCheck.valid) {
      return NextResponse.json({ ok: false, error: passCheck.error }, { status: 400 });
    }

    // Validación de nombres y correos adicionales según rol
    if (role === "cuidador" && patientName) {
      const patientCheck = validateName(patientName, "nombre de la paciente");
      if (!patientCheck.valid) {
        return NextResponse.json({ ok: false, error: patientCheck.error }, { status: 400 });
      }
      if (patientEmail) {
        const patientEmailCheck = validateEmail(patientEmail);
        if (!patientEmailCheck.valid) {
          return NextResponse.json({ ok: false, error: patientEmailCheck.error }, { status: 400 });
        }
      }
    } else if (role === "paciente" && inviteCaregiver) {
      if (caregiverName) {
        const caregiverCheck = validateName(caregiverName, "nombre del cuidador");
        if (!caregiverCheck.valid) {
          return NextResponse.json({ ok: false, error: caregiverCheck.error }, { status: 400 });
        }
      }
      if (caregiverEmail) {
        const caregiverEmailCheck = validateEmail(caregiverEmail);
        if (!caregiverEmailCheck.valid) {
          return NextResponse.json({ ok: false, error: caregiverEmailCheck.error }, { status: 400 });
        }
      }
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Verificar si el correo ya existe en usuarios
    const { data: existingUser } = await supabaseAdmin
      .from("usuarios")
      .select("id, correo")
      .eq("correo", cleanEmail)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Este correo ya se encuentra registrado. Por favor inicia sesión.",
        },
        { status: 409 }
      );
    }

    // 2. Hash de contraseña seguro
    const passwordHash = await hashPassword(password);

    // 3. Crear usuario en tabla usuarios
    const { data: newUser, error: userError } = await supabaseAdmin
      .from("usuarios")
      .insert({
        nombre: fullName.trim(),
        correo: cleanEmail,
        password_hash: passwordHash,
        telefono: phone.trim(),
        rol: role,
        nivel_suscripcion: "gratuita",
        idioma_preferido: "es",
        estado: "activo",
      })
      .select("id, nombre, correo, rol")
      .single();

    if (userError || !newUser) {
      console.error("Error creando usuario en Supabase:", userError);
      return NextResponse.json(
        { ok: false, error: userError?.message || "Error al crear la cuenta" },
        { status: 500 }
      );
    }

    let fichaId: number | null = null;
    let inviteUrl: string | null = null;

    // 4. Si el usuario se registra a través de un enlace de INVITACIÓN previo
    if (invitationToken) {
      const invitePayload = verifyInvitationToken(invitationToken);
      if (invitePayload) {
        fichaId = invitePayload.fichaId;

        if (role === "cuidador") {
          // Vincular cuidador a la ficha de la paciente existente
          await supabaseAdmin
            .from("ficha_paciente")
            .update({
              cuidador_usuario_id: newUser.id,
              correo_invitacion_cuidador: cleanEmail,
            })
            .eq("id", fichaId);

          // Crear o actualizar ficha_cuidador a 'vinculado'
          await supabaseAdmin.from("ficha_cuidador").insert({
            cuidador_usuario_id: newUser.id,
            ficha_paciente_id: fichaId,
            relacion_familiar: caregiverRelationship || "Acompañante",
            horarios_disponibles: caregiverSchedule || "",
            estado_vinculo: "vinculado",
          });
        } else if (role === "paciente") {
          // La paciente acepta la invitación creada por su cuidador
          await supabaseAdmin
            .from("ficha_paciente")
            .update({
              paciente_usuario_id: newUser.id,
              nombre_paciente: fullName.trim(),
              correo_invitacion_paciente: cleanEmail,
              etapa_actual: cancerStage || "diagnostico",
            })
            .eq("id", fichaId);

          // Actualizar estado del vínculo en ficha_cuidador
          await supabaseAdmin
            .from("ficha_cuidador")
            .update({ estado_vinculo: "vinculado" })
            .eq("ficha_paciente_id", fichaId);
        }
      }
    }

    let autoLinked = false;
    let linkedPartnerName: string | null = null;
    let linkedPartnerEmail: string | null = null;

    // 5. Si es registro NORMAL (sin token en URL) -> Verificación inteligente por correo existente
    if (!fichaId) {
      const origin =
        req.headers.get("origin") ||
        process.env.NEXT_PUBLIC_APP_URL ||
        "http://localhost:3000";

      if (role === "cuidador") {
        const effectivePatientName = (patientName || "Paciente").trim();
        const cleanPatientEmail = patientEmail ? patientEmail.toLowerCase().trim() : "";

        // COMPROBACIÓN INTELIGENTE: ¿La paciente YA tiene cuenta o ficha en la plataforma?
        let existingFichaId: number | null = null;
        let patientUserName = effectivePatientName;

        if (cleanPatientEmail) {
          // Buscar si existe un usuario paciente con ese correo
          const { data: existingPatientUser } = await supabaseAdmin
            .from("usuarios")
            .select("id, nombre, correo")
            .eq("correo", cleanPatientEmail)
            .maybeSingle();

          if (existingPatientUser) {
            patientUserName = existingPatientUser.nombre;
            // Buscar la ficha médica de esa paciente
            const { data: existingFicha } = await supabaseAdmin
              .from("ficha_paciente")
              .select("id, cuidador_usuario_id")
              .eq("paciente_usuario_id", existingPatientUser.id)
              .maybeSingle();

            if (existingFicha) {
              existingFichaId = existingFicha.id;
            }
          } else {
            // También revisar si hay una ficha donde invitaron a esa paciente
            const { data: fichaPending } = await supabaseAdmin
              .from("ficha_paciente")
              .select("id")
              .eq("correo_invitacion_paciente", cleanPatientEmail)
              .maybeSingle();

            if (fichaPending) {
              existingFichaId = fichaPending.id;
            }
          }
        }

        if (existingFichaId) {
          // ¡VINCULACIÓN INMEDIATA! La paciente ya existe, se vincula el cuidador a su ficha existente
          fichaId = existingFichaId;
          autoLinked = true;
          linkedPartnerName = patientUserName;
          linkedPartnerEmail = cleanPatientEmail;

          await supabaseAdmin
            .from("ficha_paciente")
            .update({
              cuidador_usuario_id: newUser.id,
              correo_invitacion_cuidador: cleanEmail,
            })
            .eq("id", existingFichaId);

          // Crear o vincular ficha_cuidador
          await supabaseAdmin.from("ficha_cuidador").insert({
            cuidador_usuario_id: newUser.id,
            ficha_paciente_id: existingFichaId,
            relacion_familiar: caregiverRelationship || "Familiar",
            horarios_disponibles: caregiverSchedule || "",
            estado_vinculo: "vinculado",
          });

          // Notificar directamente por correo a la paciente que su cuidador se ha vinculado
          if (cleanPatientEmail) {
            await sendAutoLinkedNotificationEmail({
              to: cleanPatientEmail,
              recipientName: patientUserName,
              partnerName: fullName.trim(),
              partnerRole: "cuidador",
              dashboardLink: `${origin}/paciente`,
            });
          }
        } else {
          // La paciente aún no está registrada: se crea su ficha y se le envía la invitación
          const { data: ficha, error: fichaErr } = await supabaseAdmin
            .from("ficha_paciente")
            .insert({
              nombre_familia: `Familia de ${effectivePatientName}`,
              cuidador_usuario_id: newUser.id,
              nombre_paciente: effectivePatientName,
              correo_invitacion_paciente: cleanPatientEmail,
              etapa_actual: cancerStage || "diagnostico",
              registrado_por: "cuidador",
            })
            .select("id")
            .single();

          if (fichaErr) {
            console.error("Error creando ficha_paciente por cuidador:", fichaErr);
          } else if (ficha) {
            fichaId = ficha.id;

            await supabaseAdmin.from("ficha_cuidador").insert({
              cuidador_usuario_id: newUser.id,
              ficha_paciente_id: ficha.id,
              relacion_familiar: caregiverRelationship || "Familiar",
              horarios_disponibles: caregiverSchedule || "",
              estado_vinculo: cleanPatientEmail ? "pendiente" : "pendiente",
            });

            if (cleanPatientEmail) {
              const token = createInvitationToken({
                fichaId: ficha.id,
                targetEmail: cleanPatientEmail,
                targetRole: "paciente",
                inviterName: fullName.trim(),
              });

              inviteUrl = `${origin}/auth/registro?token=${token}&rol=paciente`;

              await sendPatientInvitationEmail({
                caregiverName: fullName.trim(),
                patientEmail: cleanPatientEmail,
                patientName: effectivePatientName,
                inviteLink: inviteUrl,
              });
            }
          }
        }
      } else if (role === "paciente") {
        // CASO PACIENTE: Verificar si el cuidador ya existe por correo
        const cleanCaregiverEmail = inviteCaregiver && caregiverEmail ? caregiverEmail.toLowerCase().trim() : "";
        let existingCuidadorId: number | null = null;
        let cuidadorUserName = caregiverName.trim() || "tu familiar";
        let pendingFichaId: number | null = null;

        if (cleanCaregiverEmail) {
          const { data: existingCuidadorUser } = await supabaseAdmin
            .from("usuarios")
            .select("id, nombre, correo")
            .eq("correo", cleanCaregiverEmail)
            .maybeSingle();

          if (existingCuidadorUser) {
            existingCuidadorId = existingCuidadorUser.id;
            cuidadorUserName = existingCuidadorUser.nombre;

            // Verificar si el cuidador ya había creado una ficha pendiente esperando a esta paciente
            const { data: fichaCreatedByCuidador } = await supabaseAdmin
              .from("ficha_paciente")
              .select("id")
              .eq("cuidador_usuario_id", existingCuidadorUser.id)
              .is("paciente_usuario_id", null)
              .maybeSingle();

            if (fichaCreatedByCuidador) {
              pendingFichaId = fichaCreatedByCuidador.id;
            }
          }
        }

        if (pendingFichaId) {
          // El cuidador ya había creado la ficha: vinculamos a la paciente directamente en esa ficha
          fichaId = pendingFichaId;
          autoLinked = true;
          linkedPartnerName = cuidadorUserName;
          linkedPartnerEmail = cleanCaregiverEmail;

          await supabaseAdmin
            .from("ficha_paciente")
            .update({
              paciente_usuario_id: newUser.id,
              nombre_paciente: fullName.trim(),
              correo_invitacion_paciente: cleanEmail,
              etapa_actual: cancerStage || "diagnostico",
            })
            .eq("id", pendingFichaId);

          await supabaseAdmin
            .from("ficha_cuidador")
            .update({ estado_vinculo: "vinculado" })
            .eq("ficha_paciente_id", pendingFichaId);

          if (cleanCaregiverEmail) {
            await sendAutoLinkedNotificationEmail({
              to: cleanCaregiverEmail,
              recipientName: cuidadorUserName,
              partnerName: fullName.trim(),
              partnerRole: "paciente",
              dashboardLink: `${origin}/cuidador`,
            });
          }
        } else {
          // Crear nueva ficha de la paciente
          const { data: ficha, error: fichaErr } = await supabaseAdmin
            .from("ficha_paciente")
            .insert({
              nombre_familia: `Familia de ${fullName.trim()}`,
              paciente_usuario_id: newUser.id,
              cuidador_usuario_id: existingCuidadorId,
              nombre_paciente: fullName.trim(),
              correo_invitacion_cuidador: cleanCaregiverEmail,
              etapa_actual: cancerStage || "diagnostico",
              registrado_por: "paciente",
            })
            .select("id")
            .single();

          if (fichaErr) {
            console.error("Error creando ficha_paciente:", fichaErr);
          } else if (ficha) {
            fichaId = ficha.id;

            if (existingCuidadorId) {
              // El cuidador ya tenía cuenta: vincular inmediatamente
              autoLinked = true;
              linkedPartnerName = cuidadorUserName;
              linkedPartnerEmail = cleanCaregiverEmail;

              await supabaseAdmin.from("ficha_cuidador").insert({
                cuidador_usuario_id: existingCuidadorId,
                ficha_paciente_id: ficha.id,
                relacion_familiar: caregiverRelationship || "Familiar",
                estado_vinculo: "vinculado",
              });

              await sendAutoLinkedNotificationEmail({
                to: cleanCaregiverEmail,
                recipientName: cuidadorUserName,
                partnerName: fullName.trim(),
                partnerRole: "paciente",
                dashboardLink: `${origin}/cuidador`,
              });
            } else if (inviteCaregiver && cleanCaregiverEmail) {
              // El cuidador aún no tiene cuenta: enviar invitación con token
              const token = createInvitationToken({
                fichaId: ficha.id,
                targetEmail: cleanCaregiverEmail,
                targetRole: "cuidador",
                inviterName: fullName.trim(),
              });

              inviteUrl = `${origin}/auth/registro?token=${token}&rol=cuidador`;

              await sendCaregiverInvitationEmail({
                patientName: fullName.trim(),
                caregiverEmail: cleanCaregiverEmail,
                caregiverName: caregiverName.trim(),
                inviteLink: inviteUrl,
              });
            }
          }
        }
      }
    }

    // 6. Generar token de sesión persistente (7 días)
    const sessionToken = createSessionToken({
      userId: newUser.id,
      nombre: newUser.nombre,
      correo: newUser.correo,
      rol: newUser.rol,
      fichaPacienteId: fichaId ?? undefined,
    });

    const response = NextResponse.json({
      ok: true,
      message: "Registro exitoso",
      user: {
        id: newUser.id,
        nombre: newUser.nombre,
        correo: newUser.correo,
        rol: newUser.rol,
      },
      fichaId,
      inviteUrl,
      autoLinked,
      linkedPartnerName,
      linkedPartnerEmail,
    });

    // 7. Guardar sesión en cookie segura HttpOnly
    response.cookies.set(
      SESSION_COOKIE_NAME,
      sessionToken,
      getSessionCookieOptions()
    );

    return response;
  } catch (error) {
    console.error("Error en /api/auth/register:", error);
    const msg = error instanceof Error ? error.message : "Error del servidor";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
