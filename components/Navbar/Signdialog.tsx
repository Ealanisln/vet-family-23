'use client'

import React from "react";
import { LogoutLink, LoginLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { useAuthStatus } from '@/hooks/auth-status'; // Asegúrate de actualizar esta ruta

export default function AuthButton() {
  const { user, isAuthenticated, isLoading, error } = useAuthStatus();

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center">
        <span className="text-lg font-medium mr-4">
          {user.given_name || user.family_name || user.email || 'Usuario'}
        </span>
        <LogoutLink className="text-slate-900 text-xl font-medium py-2 px-6 transition duration-150 ease-in-out bg-white hover:text-white rounded-full hover:bg-slate-800">
          Cerrar sesión
        </LogoutLink>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <LoginLink className="text-lg font-medium">
        Iniciar sesión
      </LoginLink>
      <RegisterLink className="text-slate-900 text-xl font-medium py-2 px-6 transition duration-150 ease-in-out bg-white hover:text-white rounded-full hover:bg-slate-5=800">
        Registrarse
      </RegisterLink>
    </div>
  );
}