"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const formSchema = z
  .object({
    given_name: z.string().min(1, "First name is required"),
    family_name: z.string().min(1, "Last name is required"),
    organization_code: z.string().optional(),
    provided_id: z.string().optional(),
    email: z
      .string()
      .email("Invalid email address")
      .optional()
      .or(z.literal("")),
    phone: z.string().min(10, "Invalid phone number").optional(),
  })
  .refine((data) => data.email || data.phone, {
    message: "Either email or phone is required",
    path: ["email"],
  });

type FormValues = z.infer<typeof formSchema>;

export default function UserRegistrationForm() {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      given_name: "",
      family_name: "",
      organization_code: "",
      provided_id: "",
      email: "",
      phone: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setError(null);

    try {
      const response = await fetch("/api/user/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profile: {
            given_name: data.given_name,
            family_name: data.family_name,
          },
          organization_code: data.organization_code,
          provided_id: data.provided_id,
          identities: [
            {
              type: data.email ? "email" : "phone",
              details: {
                email: data.email || undefined,
                phone: data.phone || undefined,
              },
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to register user");
      }

      const responseData = await response.json();
      console.log("User registered:", responseData);

      const userId = responseData.dbUser.id;
      router.push(`/admin/clientes/registro-exitoso?userId=${userId}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while registering the user. Please try again."
      );
      console.error("Registration error:", err);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-white via-white to-blue-50 border-none shadow-lg">
      <CardHeader className="p-6">
        <CardTitle className="text-2xl font-semibold text-gray-800">
          Datos generales
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="given_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Nombre</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        className="h-11 border-[#47b3b6]/20 focus:border-[#47b3b6]/50 rounded-xl bg-white"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="family_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Apellido</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        className="h-11 border-[#47b3b6]/20 focus:border-[#47b3b6]/50 rounded-xl bg-white"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Correo electrónico</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      {...field} 
                      className="h-11 border-[#47b3b6]/20 focus:border-[#47b3b6]/50 rounded-xl bg-white"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Teléfono</FormLabel>
                  <FormControl>
                    <Input 
                      type="tel" 
                      {...field} 
                      className="h-11 border-[#47b3b6]/20 focus:border-[#47b3b6]/50 rounded-xl bg-white"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            {error && (
              <Alert variant="destructive" className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-600">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            <Button 
              type="submit" 
              className="w-full bg-[#47b3b6] hover:bg-[#47b3b6]/90 text-white rounded-xl h-11"
            >
              Registrar usuario
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}