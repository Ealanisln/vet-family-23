"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import LoadingButton from "@/components/ui/loading-button";
import ErrorMessage from "@/components/ui/error-message";

const signInSchema = z.object({
  username: z.string().min(1, "El usuario es requerido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

type SignInSchema = z.infer<typeof signInSchema>;

export default function LoginForm() {
  const [globalError, setGlobalError] = useState("");
  const router = useRouter();
  const form = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (values: SignInSchema) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        document.cookie = "isLoggedIn=true; path=/";
        router.push("/admin/");
      } else {
        setGlobalError(data.message || "Error de inicio de sesión");
      }
    } catch (error) {
      console.error('Error durante el inicio de sesión:', error);
      setGlobalError('Ocurrió un error durante el inicio de sesión. Por favor, intenta de nuevo.');
    }
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <div className="flex flex-1 items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-[350px] space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Panel de administración</h1>
            <p className="text-balance text-muted-foreground">
              Ingresa tu usuario y contraseña para tener acceso al panel de administración.
            </p>
          </div>
          {globalError && <ErrorMessage error={globalError} />}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usuario</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Usuario"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Contraseña" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <LoadingButton
                pending={form.formState.isSubmitting}
                className="w-full bg-cyan-600 hover:bg-cyan-700"
              >
                Iniciar sesión
              </LoadingButton>
            </form>
          </Form>
        </div>
      </div>
      <div className="relative flex-1">
        <Image
          src="/assets/login/new.png"
          alt="Login cover"
          layout="fill"
          objectFit="cover"
          className="dark:brightness-[0.2] dark:grayscale"
          priority
        />
      </div>
    </div>
  );
}