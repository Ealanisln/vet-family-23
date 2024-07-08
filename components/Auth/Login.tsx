"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
  
      if (data.success) {
        // Inicio de sesión exitoso
        document.cookie = "isLoggedIn=true; path=/";
        router.push("/admin/cliente-frecuente");
      } else {
        // Inicio de sesión fallido
        alert(data.message);
      }
    } catch (error) {
      console.error('Error durante el inicio de sesión:', error);
      alert('Ocurrió un error durante el inicio de sesión. Por favor, intenta de nuevo.');
    }
  };
  return (
    <div className="flex items-center justify-center bg-gray-100 py-8">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Admin</CardTitle>
          <CardDescription>Ingresa tu usuario y contraseña</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="user">Usuario</Label>
              <Input
                id="user"
                type="text"
                placeholder="Usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-cyan-600 hover:bg-cyan-700" type="submit">
              Iniciar sesión
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
