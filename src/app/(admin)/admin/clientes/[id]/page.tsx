// app/admin/clientes/[id]/page.tsx
import { getUserById } from "@/app/actions/get-customers";
import { notFound } from "next/navigation";
import ClientDetails from './ClientDetails';

export default async function UserPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  let user;
  try {
    user = await getUserById(params.id);
  } catch (error) {
    notFound();
  }

  return <ClientDetails user={user} />;
}