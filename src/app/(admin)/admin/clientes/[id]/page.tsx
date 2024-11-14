// app/admin/clientes/[id]/page.tsx
import { getUserById } from "@/app/actions/get-customers";
import { notFound } from "next/navigation";
import ClientDetails from './ClientDetails';

export default async function UserPage({ params }: { params: { id: string } }) {
  let user;
  try {
    user = await getUserById(params.id);
  } catch (error) {
    notFound();
  }

  return <ClientDetails user={user} />;
}