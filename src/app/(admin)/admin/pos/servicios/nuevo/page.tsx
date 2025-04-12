// src/app/(admin)/admin/pos/servicios/nuevo/page.tsx
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ServiceCategory } from "@prisma/client";
import { NewServiceForm } from "@/components/Admin/pos/NewServiceForm"; // Corrected import path casing

export const metadata: Metadata = {
  title: "Nuevo Servicio | POS",
  description: "Crear un nuevo servicio en el sistema POS"
};

export const dynamic = "force-dynamic"; // Asegurarse de que la página se renderiza en cada solicitud

// Definir explícitamente que las categorías son del tipo ServiceCategory
const serviceCategories: ServiceCategory[] = [
  "CONSULTATION",
  "SURGERY",
  "VACCINATION",
  "GROOMING",
  "DENTAL",
  "LABORATORY",
  "IMAGING",
  "HOSPITALIZATION",
  "OTHER"
];

// Default export remains a Server Component performing auth checks
export default async function NewServicePage() {
  // Verification logic remains the same...
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

  return (
    <div className="container py-6">
      <div className="mb-6">
        <Link
          href="/admin/pos/servicios"
          className="flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver a servicios
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6">Nuevo Servicio</h1>

      {/* Render the client component for the form */}
      <NewServiceForm serviceCategories={serviceCategories} />

    </div>
  );
}