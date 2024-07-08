import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // Aquí deberías verificar las credenciales contra tu base de datos o variables de entorno
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
      // Autenticación exitosa
      return NextResponse.json({ success: true, message: 'Inicio de sesión exitoso' }, { status: 200 });
    } else {
      // Autenticación fallida
      return NextResponse.json({ success: false, message: 'Credenciales incorrectas' }, { status: 401 });
    }
  } catch (error) {
    console.error('Error en la autenticación:', error);
    return NextResponse.json({ success: false, message: 'Error en el servidor' }, { status: 500 });
  }
}