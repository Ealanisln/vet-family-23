// app/(admin)/admin/inventario/page.tsx

import Inventory from "@/components/Inventory/Products";
import React from "react";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { getAuthenticatedUser } from "@/lib/auth-utils";

const InventoryPage = async () => {
  const { getUser, isAuthenticated } = getKindeServerSession();
  const user = await getAuthenticatedUser(getUser, isAuthenticated);

  return (
    <div>
      <Inventory userId={user?.id} />
    </div>
  );
};

export default InventoryPage;
