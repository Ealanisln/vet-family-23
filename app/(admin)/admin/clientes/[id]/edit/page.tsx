'use client'

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

// Define el tipo para el cliente
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
    nextVisitFree: false
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
        nextVisitFree: userData.nextVisitFree ?? false
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
    setClient(prevState => ({ ...prevState, [name]: value }))
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
      // Revalidate the client details page
      router.refresh()
      // Navigate back to the client details page
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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Editar Cliente</h1>
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={client.firstName}
                  onChange={handleInputChange}
                  required
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={client.email}
                  onChange={handleInputChange}
                  required
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  name="address"
                  value={client.address}
                  onChange={handleInputChange}
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
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="nextVisitFree"
                checked={client.nextVisitFree}
                onCheckedChange={handleCheckboxChange}
              />
              <Label htmlFor="nextVisitFree">Próxima visita gratis</Label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              <ArrowLeftIcon className="mr-2 h-4 w-4" /> Volver
            </Button>
            <Button type="submit">
              <SaveIcon className="mr-2 h-4 w-4" /> Guardar Cambios
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}