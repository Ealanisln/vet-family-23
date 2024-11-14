"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

const formSchema = z.object({
  nombre: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  mascota: z.string().min(2, {
    message: "La mascota debe tener al menos 2 caracteres.",
  }),
});

interface ClienteFormProps {
  onClienteAdded: () => void;
}

export default function ClienteForm({ onClienteAdded }: ClienteFormProps) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: "",
      mascota: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await fetch("/api/clientes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Error al agregar cliente");
      }

      form.reset();

      toast({
        title: "Cliente agregado",
        description: "El cliente se ha agregado exitosamente",
      });

      onClienteAdded();
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Error al agregar cliente",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4 md:w-1/2">
            <div className="mb-8">
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="mb-3 block text-sm font-medium text-dark dark:text-white pt-2">
                      Nombre del cliente
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Francisco Perez" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mascota"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-sm font-medium text-dark dark:text-white pt-2">
                      Nombre de la mascota
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Micaela" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <Button className="bg-green-500 hover:bg-green-800" type="submit">
              Agregar Cliente
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
