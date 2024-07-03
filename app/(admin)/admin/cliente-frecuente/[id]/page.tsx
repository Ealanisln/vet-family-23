import { notFound } from "next/navigation";

async function getCliente(id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/clientes/${id}`,
    { cache: "no-store" }
  );
  if (!res.ok) return undefined;
  return res.json();
}

export default async function ClientePage({
  params,
}: {
  params: { id: string };
}) {
  const { data: cliente } = (await getCliente(params.id)) || {};

  if (!cliente) {
    notFound();
  }

  return (
    <div>
      <h1>{cliente.nombre}</h1>
      <p>Mascota: {cliente.mascota}</p>
      <p>Visitas: {cliente.visitas}</p>
      <p>
        Última visita: {new Date(cliente.ultimaVisita).toLocaleDateString()}
      </p>
      <p>Cupón disponible: {cliente.cuponDisponible ? "Sí" : "No"}</p>
    </div>
  );
}
