'use client'

import React, { useEffect, useState } from "react";
import { LogoutLink, LoginLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { useAuthStatus } from '@/hooks/auth-status';
import Link from 'next/link';

type Role = {
  id: string;
  key: string;
  name: string;
};

type User = {
  id?: string;
  given_name?: string;
  family_name?: string;
  email?: string;
  roles?: Role[];
};

type AuthStatus = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
};

export default function AuthButton() {
  const { user, isAuthenticated, isLoading, error } = useAuthStatus() as AuthStatus;
  const [userRoles, setUserRoles] = useState<Role[]>([]);

  useEffect(() => {
    console.log("User object:", user);
    if (user && user.roles) {
      console.log("User roles from user object:", user.roles);
      setUserRoles(user.roles);
    } else {
      console.log("No roles found in user object");
    }
  }, [user]);

  console.log("User roles state:", userRoles);

  const hasRole = (roleName: string): boolean => {
    const result = userRoles.some(role => role && role.name && role.name.toLowerCase() === roleName.toLowerCase());
    console.log(`Checking for role ${roleName}:`, result);
    return result;
  };

  const getUserLink = () => {
    if (hasRole('Admin')) {
      return '/admin';
    } else {
      return '/cliente';
    }
  };

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center">
        <Link href={getUserLink()} className="text-lg font-medium mr-4 hover:underline">
          {user.given_name || user.family_name || user.email || 'Usuario'}
        </Link>
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
      <RegisterLink className="text-slate-900 text-xl font-medium py-2 px-6 transition duration-150 ease-in-out bg-white hover:text-white rounded-full hover:bg-slate-800">
        Registrarse
      </RegisterLink>
    </div>
  );
}