'use client'

import React, { useState, useEffect } from "react";
import { LogoutLink, LoginLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs/dist/types";

export default function AuthButton() {
  const [user, setUser] = useState<KindeUser<Record<string, any>> | null>(null);
  const [isAuthed, setIsAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAuthStatus() {
      try {
        const response = await fetch('/api/auth-status');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setUser(data.user);
        setIsAuthed(data.isAuthenticated);
      } catch (error) {
        console.error('Error fetching auth status:', error);
        setError(`Error fetching auth status: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setLoading(false);
      }
    }

    fetchAuthStatus();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (isAuthed && user) {
    return (
      <div className="flex items-center">
        <span className="text-lg text-blue-500 font-medium mr-4">
          {user.given_name || user.family_name || user.email || 'User'}
        </span>
        <LogoutLink className="text-blue-500 text-xl font-medium py-2 px-6 transition duration-150 ease-in-out bg-white hover:text-white rounded-full hover:bg-blue-500">
          Cerrar sesión
        </LogoutLink>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <LoginLink className="text-lg text-blue-500 font-medium">
        Iniciar sesión
      </LoginLink>
      <RegisterLink className="text-blue-500 text-xl font-medium py-2 px-6 transition duration-150 ease-in-out bg-white hover:text-white rounded-full hover:bg-blue-500">
        Registrarse
      </RegisterLink>
    </div>
  );
}