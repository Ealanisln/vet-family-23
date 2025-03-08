// src/components/POS/Sales/SaleForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductSearch from "./ProductSearch";
import ServiceSearch from "./ServiceSearch";
import Cart from "./Cart";
import PaymentForm from "./PaymentForm";
import { createSale } from "@/app/actions/pos/sales";
import { ClientSearch } from "@/components/Clientes/ClientSearch";
import { PetSearch } from "@/components/Clientes/PetSearch";
import type { CartItem, SaleFormData } from "@/types/pos";

export default function SaleForm() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("products");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedClient, setSelectedClient] = useState<{ id: string; name: string } | null>(null);
  const [selectedPet, setSelectedPet] = useState<{ id: string; name: string } | null>(null);
  const [subtotal, setSubtotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Calcular totales cuando cambia el carrito o el descuento
  useEffect(() => {
    const newSubtotal = cartItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const newTax = newSubtotal * 0.16; // 16% IVA
    const newTotal = (newSubtotal + newTax) - discount;
    
    setSubtotal(newSubtotal);
    setTax(newTax);
    setTotal(newTotal);
  }, [cartItems, discount]);
  
  // Añadir producto al carrito
  const addProductToCart = (product: any) => {
    // Verificar si el producto ya está en el carrito
    const existingItemIndex = cartItems.findIndex(item => 
      item.type === 'product' && item.id === product.id
    );
    
    if (existingItemIndex >= 0) {
      // Actualizar cantidad si ya existe
      const updatedCart = [...cartItems];
      updatedCart[existingItemIndex].quantity += 1;
      setCartItems(updatedCart);
    } else {
      // Agregar nuevo item al carrito
      setCartItems([...cartItems, {
        id: product.id,
        type: 'product',
        name: product.name,
        description: product.description || product.name,
        quantity: 1,
        unitPrice: product.price || 0,
      }]);
    }
    
    toast({
      title: "Producto agregado",
      description: `${product.name} agregado al carrito`,
    });
  };
  
  // Añadir servicio al carrito
  const addServiceToCart = (service: any) => {
    const existingItemIndex = cartItems.findIndex(item => 
      item.type === 'service' && item.id === service.id
    );
    
    if (existingItemIndex >= 0) {
      const updatedCart = [...cartItems];
      updatedCart[existingItemIndex].quantity += 1;
      setCartItems(updatedCart);
    } else {
      setCartItems([...cartItems, {
        id: service.id,
        type: 'service',
        name: service.name,
        description: service.description || service.name,
        quantity: 1,
        unitPrice: service.price || 0,
      }]);
    }
    
    toast({
      title: "Servicio agregado",
      description: `${service.name} agregado al carrito`,
    });
  };
  
  // Actualizar cantidad de un item
  const updateItemQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const updatedCart = [...cartItems];
    updatedCart[index].quantity = newQuantity;
    setCartItems(updatedCart);
  };
  
  // Eliminar item del carrito
  const removeItem = (index: number) => {
    setCartItems(cartItems.filter((_, i) => i !== index));
  };
  
  // Procesar el pago
  const handlePayment = async (paymentData: { method: string }) => {
    if (cartItems.length === 0) {
      toast({
        title: "Error",
        description: "El carrito está vacío",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const saleData: SaleFormData = {
        userId: selectedClient?.id,
        petId: selectedPet?.id,
        subtotal,
        tax,
        discount,
        total,
        paymentMethod: paymentData.method,
        items: cartItems.map(item => ({
          itemId: item.type === 'product' ? item.id : null,
          serviceId: item.type === 'service' ? item.id : null,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.quantity * item.unitPrice,
        })),
      };
      
      const result = await createSale(saleData);
      
      if (result.success) {
        toast({
          title: "Venta procesada",
          description: `Venta #${result.receiptNumber} completada exitosamente`,
        });
        
        router.push(`/admin/pos/ventas/${result.id}`);
      } else {
        throw new Error(result.error || "Error al procesar la venta");
      }
    } catch (error) {
      console.error("Error al procesar la venta:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al procesar la venta",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Panel izquierdo: Búsqueda de productos y servicios */}
      <div className="lg:col-span-2 space-y-6">
        {/* Cliente y mascota */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="client">Cliente (opcional)</Label>
                <ClientSearch
                  onSelect={(client) => setSelectedClient(client)}
                  selectedClient={selectedClient}
                />
              </div>
              <div>
                <Label htmlFor="pet">Mascota (opcional)</Label>
                <PetSearch
                  onSelect={(pet) => setSelectedPet(pet)}
                  selectedPet={selectedPet}
                  userId={selectedClient?.id}
                  disabled={!selectedClient}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Tabs para productos y servicios */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="products">Productos</TabsTrigger>
            <TabsTrigger value="services">Servicios</TabsTrigger>
          </TabsList>
          
          <TabsContent value="products" className="border rounded-md p-4">
            <ProductSearch onSelectProduct={addProductToCart} />
          </TabsContent>
          
          <TabsContent value="services" className="border rounded-md p-4">
            <ServiceSearch onSelectService={addServiceToCart} />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Panel derecho: Carrito y pago */}
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <Cart 
              items={cartItems}
              updateQuantity={updateItemQuantity}
              removeItem={removeItem}
            />
            
            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>IVA (16%):</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="discount">Descuento:</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="w-24 text-right"
                />
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <PaymentForm 
          onSubmit={handlePayment}
          total={total}
          disabled={isSubmitting || cartItems.length === 0}
        />
        
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => router.push('/admin/pos')}
        >
          Cancelar Venta
        </Button>
      </div>
    </div>
  );
}