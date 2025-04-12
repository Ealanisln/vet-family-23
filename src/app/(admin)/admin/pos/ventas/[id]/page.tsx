// src/app/(admin)/admin/pos/ventas/[id]/page.tsx
// Remove 'use client';

import { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { getSaleById } from "@/app/actions/pos/sales";

import { userHasPOSPermission } from "@/utils/pos-helpers";
import { Sale } from "@/types/pos"; // Keep Sale type for data fetching
import SaleDetailClient from './SaleDetailClient'; 


export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    // Fetch basic sale info for title - consider fetching only necessary fields if performance is key
    const sale = await getSaleById(params.id);
    return {
      title: `Venta ${sale.receiptNumber} | POS`,
      description: `Detalles de la venta ${sale.receiptNumber}`
    };
  } catch (error) {
    // Handle cases where the sale might not be found or other errors
    console.error(`Error generating metadata for sale ${params.id}:`, error);
    return {
      title: "Detalle de Venta | POS",
      description: "Ver detalles de una venta"
    };
  }
}

// Define the component props
interface SaleDetailPageProps {
  params: { id: string };
}

export default async function SaleDetailPage({ params }: SaleDetailPageProps) {
  // Verify user permissions (Keep this server-side logic)
  const { isAuthenticated, getUser } = getKindeServerSession();
  if (!(await isAuthenticated())) {
    return redirect("/api/auth/login");
  }
  const user = await getUser();
  const hasPermission = await userHasPOSPermission(user.id);
  if (!hasPermission) {
    return redirect("/admin");
  }

  // Fetch the complete sale details (Keep this server-side logic)
  let sale: Sale;
  try {
    sale = await getSaleById(params.id);
  } catch (error) {
    console.error(`Error fetching sale ${params.id}:`, error);
    // If getSaleById throws "Venta no encontrada.", notFound() is appropriate
    if (error instanceof Error && error.message === "Venta no encontrada.") {
        return notFound();
    }
    // For other errors, show a generic error message or redirect
    return notFound();
  }

  // Remove the getStatusBadgeVariant helper - it's now in SaleDetailClient

  // Render the Client Component and pass the fetched sale data
  return <SaleDetailClient sale={sale} />;
}

// Remove the redundant date-fns import at the end