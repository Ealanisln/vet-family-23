"use client";

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PawPrint } from 'lucide-react'

export default function FormularioCliente() {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    metodoContactoPreferido: 'email',
    mascota: '',
  })

  const handleChange = (e:any) => {
    const { name, value } = e.target
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }))
  }

  const handleSubmit = (e:any) => {
    e.preventDefault()
    console.log(formData)
    // Aquí iría la lógica para enviar los datos al servidor
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-primary flex items-center justify-center">
          <PawPrint className="mr-2" />
          Registro de Cliente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" name="nombre" required onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apellido">Apellido</Label>
              <Input id="apellido" name="apellido" required onChange={handleChange} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input id="email" name="email" type="email" required onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input id="telefono" name="telefono" type="tel" required onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección</Label>
            <Input id="direccion" name="direccion" required onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mascota">Nombre de la Mascota</Label>
            <Input id="mascota" name="mascota" required onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label>Método de Contacto Preferido</Label>
            <RadioGroup defaultValue="email" name="metodoContactoPreferido" onValueChange={(value) => handleChange({ target: { name: 'metodoContactoPreferido', value } })}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="email" id="email" />
                <Label htmlFor="email">Email</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="telefono" id="telefono" />
                <Label htmlFor="telefono">Teléfono</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mensaje" id="mensaje" />
                <Label htmlFor="mensaje">Mensaje</Label>
              </div>
            </RadioGroup>
          </div>
          <Button type="submit" className="w-full">Registrar Cliente</Button>
        </form>
      </CardContent>
    </Card>
  )
}