import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import {
  comparePassword,
  createSessionToken,
  getSessionCookieOptions,
  SESSION_COOKIE_NAME,
} from "@/lib/auth";
import { validateEmail } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, role } = body;

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: "Ingresa correo y contraseña" },
        { status: 400 }
      );
    }

    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      return NextResponse.json({ ok: false, error: emailCheck.error }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Buscar usuario por correo
    const { data: user, error: userErr } = await supabaseAdmin
      .from("usuarios")
      .select("id, nombre, correo, password_hash, rol, estado")
      .eq("correo", cleanEmail)
      .maybeSingle();

    if (userErr || !user) {
      return NextResponse.json(
        { ok: false, error: "Credenciales inválidas. Verifica tu correo y contraseña." },
        { status: 401 }
      );
    }

    // 2. Verificar contraseña con bcrypt
    const passwordMatch = await comparePassword(password, user.password_hash);
    if (!passwordMatch) {
      return NextResponse.json(
        { ok: false, error: "Credenciales inválidas. Verifica tu correo y contraseña." },
        { status: 401 }
      );
    }

    // 3. Si el usuario seleccionó un rol diferente al asignado, advertir o adaptar
    if (role && user.rol !== role && user.rol !== "admin") {
      const rolActual = user.rol === "paciente" ? "Paciente" : "Cuidador";
      const rolSeleccionado = role === "paciente" ? "Paciente" : "Cuidador";
      return NextResponse.json(
        {
          ok: false,
          error: `Tu cuenta está registrada como ${rolActual}. Por favor selecciona '${rolActual}' arriba para ingresar.`,
        },
        { status: 403 }
      );
    }

    // 4. Buscar ficha_paciente vinculada
    let fichaPacienteId: number | undefined;
    let linkedPartner: { name: string; email: string } | null = null;

    if (user.rol === "paciente") {
      const { data: ficha } = await supabaseAdmin
        .from("ficha_paciente")
        .select("id, cuidador_usuario_id, correo_invitacion_cuidador")
        .eq("paciente_usuario_id", user.id)
        .maybeSingle();

      if (ficha) {
        fichaPacienteId = ficha.id;
        if (ficha.cuidador_usuario_id) {
          const { data: cuidador } = await supabaseAdmin
            .from("usuarios")
            .select("nombre, correo")
            .eq("id", ficha.cuidador_usuario_id)
            .maybeSingle();
          if (cuidador) {
            linkedPartner = { name: cuidador.nombre, email: cuidador.correo };
          }
        }
      }
    } else if (user.rol === "cuidador") {
      const { data: ficha } = await supabaseAdmin
        .from("ficha_paciente")
        .select("id, paciente_usuario_id, nombre_paciente, correo_invitacion_paciente")
        .eq("cuidador_usuario_id", user.id)
        .maybeSingle();

      if (ficha) {
        fichaPacienteId = ficha.id;
        linkedPartner = {
          name: ficha.nombre_paciente,
          email: ficha.correo_invitacion_paciente || "",
        };
      }
    }

    // 5. Crear token de sesión firmado (7 días)
    const sessionToken = createSessionToken({
      userId: user.id,
      nombre: user.nombre,
      correo: user.correo,
      rol: user.rol,
      fichaPacienteId,
    });

    const redirectPath =
      user.rol === "paciente"
        ? "/paciente"
        : user.rol === "cuidador"
        ? "/cuidador"
        : user.rol === "admin"
        ? "/admin"
        : "/sanador";

    const response = NextResponse.json({
      ok: true,
      message: "Sesión iniciada con éxito",
      user: {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        rol: user.rol,
      },
      linkedPartner,
      redirectUrl: redirectPath,
    });

    // 6. Guardar en cookie segura
    response.cookies.set(
      SESSION_COOKIE_NAME,
      sessionToken,
      getSessionCookieOptions()
    );

    return response;
  } catch (error) {
    console.error("Error en /api/auth/login:", error);
    const msg = error instanceof Error ? error.message : "Error del servidor";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
