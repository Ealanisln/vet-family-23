// app/cliente/perfil/page.tsx
import { getClientData } from "@/app/actions/get-client-data";
import { notFound } from "next/navigation";
import ClientDetails from '@/components/Clientes/ClientDetails';

export default async function ClientProfilePage() {
  let user;
  try {
    // Assume this function gets the logged-in user's data
    user = await getClientData();
  } catch (error) {
    notFound();
  }

  return <ClientDetails user={user} />;
}