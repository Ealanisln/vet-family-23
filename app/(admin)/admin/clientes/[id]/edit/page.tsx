"use client";

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeftIcon, SaveIcon } from "lucide-react"
import { getUserById, updateUser } from '@/app/actions/get-customers'
import { useToast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"

type ClientData = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  visits: number;
  nextVisitFree: boolean;
}

export default function EditClientPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [client, setClient] = useState<ClientData>({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    visits: 0,
    nextVisitFree: false,
  })

  const fetchUser = useCallback(async () => {
    try {
      const userData = await getUserById(params.id)
      setClient({
        id: userData.id,
        firstName: userData.firstName ?? '',
        lastName: userData.lastName ?? '',
        email: userData.email ?? '',
        phone: userData.phone ?? '',
        address: userData.address ?? '',
        visits: userData.visits ?? 0,
        nextVisitFree: userData.nextVisitFree ?? false,
      })
    } catch (error) {
      console.error('Error fetching user data:', error)
      toast({
        title: "Error",
        description: "No se pudo cargar la información del cliente.",
        variant: "destructive",
      })
    }
  }, [params.id, toast])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setClient(prevState => ({ 
      ...prevState, 
      [name]: name === 'visits' ? (value ? parseInt(value) : 0) : value 
    }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setClient(prevState => ({ ...prevState, nextVisitFree: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateUser(client)
      toast({
        title: "Cliente actualizado",
        description: "Los datos del cliente se han guardado correctamente.",
        action: (
          <ToastAction altText="Cerrar">Cerrar</ToastAction>
        ),
      })
      router.refresh()
      router.push(`/admin/clientes/${client.id}`)
    } catch (error) {
      console.error('Error updating client:', error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la información del cliente.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Editar Cliente</h1>
      <Card className="w-full">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="text-xl">Información Personal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={client.firstName}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={client.lastName}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email (opcional)</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={client.email}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={client.phone}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  name="address"
                  value={client.address}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="visits">Número de visitas</Label>
              <Input
                id="visits"
                name="visits"
                type="number"
                value={client.visits}
                onChange={handleInputChange}
                min="0"
                className="w-full sm:w-1/2"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="nextVisitFree"
                checked={client.nextVisitFree}
                onCheckedChange={handleCheckboxChange}
              />
              <Label htmlFor="nextVisitFree" className="text-sm">Próxima visita gratis</Label>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-between gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()} className="w-full sm:w-auto">
              <ArrowLeftIcon className="mr-2 h-4 w-4" /> Volver
            </Button>
            <Button type="submit" className="w-full sm:w-auto">
              <SaveIcon className="mr-2 h-4 w-4" /> Guardar Cambios
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}