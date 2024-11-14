'use client'

import React from "react";
import Link from "next/link";
import { LoginLink, RegisterLink, LogoutLink } from "@kinde-oss/kinde-auth-nextjs";
import { useAuthStatus } from '@/hooks/auth-status'; 

interface NavigationItem {
  name: string;
  href: string;
  current: boolean;
}

const navigation: NavigationItem[] = [
  { name: "Promociones", href: "/promociones", current: true },
  { name: "Servicios", href: "#servicios", current: false },
  { name: "Blog", href: "/blog", current: false },
  { name: "Contacto", href: "#contacto", current: false },
  { name: "Ubicación", href: "#ubicacion", current: false },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

const Drawerdata = () => {
  const { user, isAuthenticated, isLoading } = useAuthStatus();

  return (
    <div className="rounded-md max-w-sm w-full mx-auto">
      <div className="flex-1 space-y-4 py-1">
        <div className="sm:block">
          <div className="space-y-1 px-5 pt-2 pb-3">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={classNames(
                  item.current
                    ? "text-black hover:opacity-100"
                    : "hover:text-black hover:opacity-100",
                  "px-2 py-1 text-lg font-normal opacity-75 block"
                )}
                aria-current={item.current ? "page" : undefined}
              >
                {item.name}
              </Link>
            ))}
            <div className="mt-4"></div>
            {isLoading ? (
              <div className="text-center">Cargando...</div>
            ) : isAuthenticated && user ? (
              <>
                <div className="text-center mb-2">
                  Bienvenido, {user.given_name || user.family_name || user.email || 'Usuario'}
                </div>
                <LogoutLink className="bg-sky-950 w-full hover:bg-blue hover:text-white text-white font-medium py-2 px-4 rounded block text-center">
                  Cerrar sesión
                </LogoutLink>
              </>
            ) : (
              <>
                <LoginLink className="bg-white w-full text-midnightblue border border-midnightblue font-medium py-2 px-4 rounded block text-center mb-2">
                  Iniciar sesión
                </LoginLink>
                <RegisterLink className="bg-sky-950 w-full hover:bg-blue hover:text-white text-white font-medium py-2 px-4 rounded block text-center">
                  Registrarse
                </RegisterLink>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Drawerdata;