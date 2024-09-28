import { redirect } from "next/navigation";
import ClientDetails from '@/components/Clientes/ClientDetails';
import { getClientData } from '@/app/actions/get-client-data';

export default async function ClientProfilePage() {
  const user = await getClientData(); // Obtener los datos completos

  console.log(user)

  if (!user) {
    redirect("/login");
  }

  return <ClientDetails user={user} />;
}
