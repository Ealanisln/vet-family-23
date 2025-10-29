// app/(admin)/admin/inventario/vacunas/page.tsx

import VaccineInventory from "@/components/Inventory/Vaccines"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { getAuthenticatedUser } from "@/lib/auth-utils";

const VaccinesPage = async () => {
  const { getUser, isAuthenticated } = getKindeServerSession();
  const user = await getAuthenticatedUser(getUser, isAuthenticated);

  return (
    <div><VaccineInventory userId={user?.id} /></div>
  )
}

export default VaccinesPage