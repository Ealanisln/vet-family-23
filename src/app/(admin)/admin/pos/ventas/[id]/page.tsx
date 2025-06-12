// src/app/(admin)/admin/pos/ventas/[id]/page.tsx
// Remove 'use client';

import { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { getSaleById } from "@/app/actions/pos/sales";

import { userHasPOSPermission } from "@/utils/pos-helpers";
import { Sale } from "@/types/pos"; // Keep Sale type for data fetching
import SaleDetailClient from './SaleDetailClient'; 


export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const params = await props.params;
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
  params: Promise<{ id: string }>;
}

export default async function SaleDetailPage(props: SaleDetailPageProps) {
  const params = await props.params;
  // Verify user permissions (Keep this server-side logic)
  const { isAuthenticated, getUser } = getKindeServerSession();

  const user = await getUser();

  // If user is null or not authenticated, redirect to login
  if (!user || !(await isAuthenticated())) {
    return redirect("/api/auth/login");
  }

  // Now that we know user is not null, we can safely access user.id
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


  // Render the Client Component and pass the fetched sale data
  return <SaleDetailClient sale={sale} />;
}

