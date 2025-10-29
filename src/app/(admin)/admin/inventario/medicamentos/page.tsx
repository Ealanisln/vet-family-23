// app/(admin)/admin/inventario/medicamentos/page.tsx

import MedicineInventory from "@/components/Inventory/Medicine";
import React from "react";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { getAuthenticatedUser } from "@/lib/auth-utils";

const InventoryPage = async () => {
  const { getUser, isAuthenticated } = getKindeServerSession();
  const user = await getAuthenticatedUser(getUser, isAuthenticated);

  return (
    <div>
      <MedicineInventory userId={user?.id} />
    </div>
  );
};

export default InventoryPage;
