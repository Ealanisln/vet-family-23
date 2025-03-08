// src/app/(admin)/admin/page.tsx

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import AdminDashboard from './AdminDashboard';

export const dynamic = "force-dynamic"

export default async function Component() {
  const { getUser, getRoles } = getKindeServerSession();
  const user = await getUser();
  const roles = await getRoles();


  const isAdmin = roles?.some((role) => role.key === "admin");

  if (!isAdmin) {
    redirect("/cliente");
  }

  const username = user?.given_name || 'Usuario';

  return <AdminDashboard username={username} isAdmin={isAdmin} />;
}