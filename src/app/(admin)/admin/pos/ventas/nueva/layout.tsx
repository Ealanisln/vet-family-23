import { Metadata } from "next";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { getCurrentDrawer } from "@/app/actions/pos/cash-drawer";

export const metadata: Metadata = {
  title: "Nueva Venta | POS",
  description: "Crear una nueva venta en el sistema POS",
};

export default async function NewSaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { getRoles, isAuthenticated } = getKindeServerSession();

  if (!(await isAuthenticated())) {
    redirect("/api/auth/login");
  }

  const roles = await getRoles();
  const isAdmin = roles?.some((role) => role.key === "admin");
  const isCashier = roles?.some((role) => role.key === "cashier");

  if (!isAdmin && !isCashier) {
    redirect("/admin");
  }

  const currentDrawer = await getCurrentDrawer();
  if (!currentDrawer || currentDrawer.status !== "OPEN") {
    redirect("/admin/pos?error=drawer-closed");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
} 