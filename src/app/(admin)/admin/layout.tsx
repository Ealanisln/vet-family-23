import React from "react";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import AdminLayoutClient from "./AdminLayoutClient";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { getUser, getRoles } = getKindeServerSession();
  const user = await getUser();
  const roles = await getRoles();

  const isAdmin = roles?.some((role) => role.key === "admin");

  if (!isAdmin) {
    redirect("/cliente");
  }

  // Preparar datos del usuario para el sidebar
  const userData = {
    name: user?.given_name && user?.family_name 
      ? `${user.given_name} ${user.family_name}`
      : user?.given_name || user?.email || "Admin",
    email: user?.email || "admin@example.com",
    avatar: user?.picture || "/avatars/admin.jpg",
  };

  return <AdminLayoutClient userData={userData}>{children}</AdminLayoutClient>;
}
