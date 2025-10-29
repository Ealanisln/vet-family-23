// src/app/(admin)/admin/page.tsx

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import AdminDashboard from './AdminDashboard';

export const dynamic = "force-dynamic"

export default async function Component() {
  // El layout ya validó la autenticación y autorización
  // Si llegamos aquí, el usuario es admin
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  const username = user?.given_name || 'Usuario';

  return <AdminDashboard username={username} isAdmin={true} userEmail={user?.email} />;
}