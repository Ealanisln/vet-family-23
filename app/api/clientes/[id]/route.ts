import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import Cliente from '../../../../models/Cliente';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  try {
    const cliente = await Cliente.findById(params.id);
    if (!cliente) {
      return NextResponse.json({ success: false, message: 'Cliente no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: cliente });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  try {
    const cliente = await Cliente.findById(params.id);
    if (!cliente) {
      return NextResponse.json({ success: false, message: 'Cliente no encontrado' }, { status: 404 });
    }
    
    cliente.visitas += 1;
    cliente.ultimaVisita = new Date();
    
    if (cliente.visitas % 6 === 0) {
      cliente.cuponDisponible = true;
    }
    
    await cliente.save();
    return NextResponse.json({ success: true, data: cliente });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}