// src/components/POS/Sales/SaleForm.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Loader2,
  CreditCard,
  BanknoteIcon,
  Wallet,
  Smartphone,
} from "lucide-react";
import ProductSearch from "./ProductSearch";
import ServiceSearch from "./ServiceSearch";
import Cart from "./Cart";
import { createSale } from "@/app/actions/pos/sales";
import { ClientSearch } from "@/components/Clientes/ClientSearch";
import { PetSearch } from "@/components/Clientes/PetSearch";
import { useCart } from "@/contexts/CartContext";
import { createCartItemFromProduct } from "../ProductCard"; // Asume que esta función necesita price y usa PosInventoryItem
import { createCartItemFromService } from "../ServiceCard";
import {
  adaptClientToCartClient,
  adaptPetToCartPet,
  adaptCartClientToClient,
  adaptCartPetToPet,
} from "@/lib/type-adapters";
import type {
  InventoryItem as PosInventoryItem,
  Service,
  SaleFormData,
  PaymentMethod, // Asegúrate que esté importado
} from "@/types/pos";
import type { InventoryItem as InvInventoryItem } from "@/types/inventory"; // Alias para el tipo de Inventory
import type { Client } from "@/components/Clientes/ClientSearch";
import { Pet } from "@/types/pet";

// (Opcional pero recomendado) Definir el tipo de resultado esperado de createSale

type CreateSaleResult =
  | { success: true; id: string; receiptNumber: string }
  | { success: false; error: string };

export default function SaleForm() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("products");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [cashAmount, setCashAmount] = useState<number | "">("");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // Usar el contexto del carrito
  const {
    state,
    addItem,
    removeItem,
    updateQuantity,
    setClient,
    setPet,
    setPaymentMethod,
    setNotes,
    clearCart,
    subtotal,
    tax,
    total,
  } = useCart();

  // Calcular el total final después del descuento

  const finalTotal =
    (typeof total === "number" ? total : 0) -
    (typeof discountAmount === "number" ? discountAmount : 0);

  // Calcular el cambio para pagos en efectivo

  const change = typeof cashAmount === "number" ? cashAmount - finalTotal : 0;

  // Función original para añadir producto al carrito (espera PosInventoryItem)

  const handleAddProduct = (product: PosInventoryItem) => {
    const cartItem = createCartItemFromProduct(product);

    addItem(cartItem);

    toast({
      title: "Producto agregado",

      description: `${product.name} agregado al carrito`,
    });
  };

  // Función adaptadora para convertir InvInventoryItem a PosInventoryItem

  const handleSelectProductFromSearch = (invProduct: InvInventoryItem) => {
    if (invProduct.price === null || invProduct.price === undefined) {
      console.error("Producto sin precio:", invProduct);

      toast({
        title: "Error",

        description: `El producto "${invProduct.name}" no tiene un precio definido.`,

        variant: "destructive",
      });

      return;
    }

    const posProduct: PosInventoryItem = {
      id: invProduct.id,

      name: invProduct.name,

      category: invProduct.category,

      description: invProduct.description,

      activeCompound: invProduct.activeCompound,

      presentation: invProduct.presentation,

      measure: invProduct.measure,

      brand: invProduct.brand,

      quantity: invProduct.quantity,

      minStock: invProduct.minStock,

      location: invProduct.location,

      expirationDate: invProduct.expirationDate
        ? new Date(invProduct.expirationDate)
        : null,

      status: invProduct.status,

      batchNumber: invProduct.batchNumber,

      specialNotes: invProduct.specialNotes,

      createdAt: new Date(invProduct.createdAt),

      updatedAt: invProduct.updatedAt ? new Date(invProduct.updatedAt) : null,

      price: invProduct.price, // Precio validado

      cost: invProduct.cost,
    };

    handleAddProduct(posProduct);
  };

  // Añadir servicio al carrito

  const handleAddService = (service: Service) => {
    const cartItem = createCartItemFromService(service);

    addItem(cartItem);

    toast({
      title: "Servicio agregado",

      description: `${service.name} agregado al carrito`,
    });
  };

  // Manejar selección de cliente

  const handleClientSelect = (client: Client | null) => {
    const cartClient = adaptClientToCartClient(client);

    setClient(cartClient);

    if (state.pet && (!cartClient || cartClient.id !== state.pet.userId)) {
      setPet(null);
    }
  };

  // Manejar selección de mascota

  const handlePetSelect = (pet: Pet | null) => {
    const cartPet = adaptPetToCartPet(pet);

    setPet(cartPet);
  };

  // Manejar selección de método de pago

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setPaymentMethod(method);

    if (method === "CASH") {
      setCashAmount(finalTotal >= 0 ? finalTotal : "");

      setConfirmDialogOpen(true);
    } else {
      setConfirmDialogOpen(false); // Cierra si se cambia a otro método
    }
  };

  // Procesar la venta

  const handlePayment = async () => {
    if (state.items.length === 0) {
      toast({
        title: "Error",
        description: "El carrito está vacío",
        variant: "destructive",
      });

      return;
    }

    if (!state.paymentMethod) {
      toast({
        title: "Error",
        description: "Selecciona un método de pago",
        variant: "destructive",
      });

      return;
    }

    if (
      state.paymentMethod === "CASH" &&
      confirmDialogOpen &&
      (typeof cashAmount !== "number" || cashAmount < finalTotal)
    ) {
      toast({
        title: "Error",
        description: "El monto recibido en efectivo es menor al total a pagar.",
        variant: "destructive",
      });

      return;
    }

    setIsSubmitting(true);

    try {
      // Construir los datos de la venta

      const saleData: SaleFormData = {
        userId: state.client?.id,

        petId: state.pet?.id,

        subtotal,

        tax,

        discount: discountAmount,

        total: finalTotal, // Usa el total después del descuento

        paymentMethod: state.paymentMethod, // Ya validamos que no es null

        notes: state.notes,

        items: state.items.map((item) => ({
          itemId: item.type === "product" ? item.id : null,

          serviceId: item.type === "service" ? item.id : null,

          description: item.name, // O usa item.description si lo tienes en CartItem

          quantity: item.quantity,

          unitPrice: item.unitPrice,

          total: item.quantity * item.unitPrice,
        })),
      };

      // Llamar a la acción del servidor y tipar el resultado (opcional pero recomendado)

      const result: CreateSaleResult = await createSale(saleData);

      // --- CORRECCIÓN AQUÍ ---

      // Primero verifica solo 'success'. TypeScript estrechará el tipo dentro de cada bloque.

      if (result.success) {
        // DENTRO de este bloque, TypeScript sabe que 'result' tiene 'id' y 'receiptNumber'.

        toast({
          title: "Venta procesada",

          description: `Venta #${result.receiptNumber} completada exitosamente`, // Acceso SEGURO
        });

        clearCart();

        setDiscountAmount(0);

        setCashAmount("");

        router.push(`/admin/pos/ventas/${result.id}`); // Acceso SEGURO
      } else {
        // DENTRO de este bloque, TypeScript sabe que 'result' tiene 'error'.

        console.error("Error devuelto por createSale:", result.error); // Acceso SEGURO

        // Lanza el error para que lo capture el bloque 'catch'.

        throw new Error(
          result.error || "Error desconocido al procesar la venta" // Acceso SEGURO
        );
      }

      // --- FIN CORRECCIÓN ---
    } catch (error) {
      console.error("Error al procesar la venta (catch):", error);

      const errorMessage =
        error instanceof Error ? error.message : "Ocurrió un error inesperado.";

      toast({
        title: "Error al Procesar Venta",

        description: errorMessage,

        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);

      setConfirmDialogOpen(false); // Asegúrate de cerrar el diálogo siempre
    }
  };

  // Renderizado del componente

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* --- Panel izquierdo: Búsqueda --- */}

      <div className="lg:col-span-2 space-y-6">
        {/* Cliente y mascota */}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Cliente y Mascota</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="client-search" className="mb-2 block">
                  Cliente (opcional)
                </Label>
                <ClientSearch
                  inputId="client-search"
                  onSelect={handleClientSelect}
                  selectedClient={adaptCartClientToClient(state.client)}
                />
              </div>
              <div>
                <Label htmlFor="pet-search" className="mb-2 block">
                  Mascota (opcional)
                </Label>
                <PetSearch
                  inputId="pet-search"
                  onSelect={handlePetSelect}
                  selectedPet={adaptCartPetToPet(state.pet)}
                  userId={state.client?.id}
                  disabled={!state.client}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs productos/servicios */}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="products">Productos</TabsTrigger>

            <TabsTrigger value="services">Servicios</TabsTrigger>
          </TabsList>

          <TabsContent
            value="products"
            className="mt-0 border border-t-0 rounded-b-md p-4"
          >
            <ProductSearch onSelectProduct={handleSelectProductFromSearch} />
          </TabsContent>

          <TabsContent
            value="services"
            className="mt-0 border border-t-0 rounded-b-md p-4"
          >
            <ServiceSearch onSelectService={handleAddService} />
          </TabsContent>
        </Tabs>
      </div>

      {/* --- Panel derecho: Carrito y Pago --- */}

      <div className="space-y-6">
        {/* Carrito */}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Resumen de Venta</CardTitle>
          </CardHeader>

          <CardContent>
            <Cart
              items={state.items}
              updateQuantity={(itemId, newQuantity) =>
                updateQuantity(itemId, newQuantity)
              }
              removeItem={removeItem}
            />

            <div className="mt-4 space-y-2 border-t pt-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>

                <span>${subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span>
                  IVA ({subtotal > 0 ? ((tax / subtotal) * 100).toFixed(0) : 0}
                  %):
                </span>

                <span>${tax.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <Label htmlFor="discount" className="pr-2">
                  Descuento:
                </Label>

                <Input
                  id="discount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={discountAmount}
                  onChange={(e) =>
                    setDiscountAmount(parseFloat(e.target.value) || 0)
                  }
                  className="w-24 h-8 text-right"
                  aria-label="Monto del descuento"
                />
              </div>

              <div className="flex justify-between font-bold text-lg pt-2 border-t mt-2">
                <span>Total:</span>

                <span>${finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notas */}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Notas (opcional)</CardTitle>
          </CardHeader>

          <CardContent>
            <Textarea
              placeholder="Añadir notas a la venta..."
              className="resize-none"
              value={state.notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Método de pago */}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Método de Pago</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  "CASH",
                  "CREDIT_CARD",
                  "TRANSFER",
                  "MOBILE_PAYMENT",
                ] as PaymentMethod[]
              ).map((method) => {
                let IconComponent;

                let label: string;

                switch (method) {
                  case "CASH":
                    IconComponent = BanknoteIcon;
                    label = "Efectivo";
                    break;

                  case "CREDIT_CARD":
                    IconComponent = CreditCard;
                    label = "Tarjeta";
                    break;

                  case "TRANSFER":
                    IconComponent = Wallet;
                    label = "Transferencia";
                    break;

                  case "MOBILE_PAYMENT":
                    IconComponent = Smartphone;
                    label = "Pago Móvil";
                    break;

                  default:
                    return null; // O manejar caso por defecto
                }

                return (
                  <Button
                    key={method}
                    variant={
                      state.paymentMethod === method ? "default" : "outline"
                    }
                    className="flex flex-col h-auto py-3 gap-1 text-xs sm:text-sm"
                    onClick={() => handlePaymentMethodSelect(method)}
                  >
                    <IconComponent className="h-5 w-5 mb-1" />

                    <span>{label}</span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Botones de acción */}

        <div className="space-y-3 pt-3">
          <Button
            className="w-full py-4 text-lg bg-green-600 hover:bg-green-700 text-white"
            disabled={
              isSubmitting || state.items.length === 0 || !state.paymentMethod
            }
            onClick={
              state.paymentMethod !== "CASH"
                ? handlePayment // Llama directo si no es efectivo
                : () => {
                    // Si es efectivo, verifica si el diálogo debe abrirse/usarse

                    if (
                      !confirmDialogOpen ||
                      (typeof cashAmount === "number" &&
                        cashAmount >= finalTotal)
                    ) {
                      handlePayment(); // Llama si el diálogo no está abierto o el monto es válido
                    } else {
                      setConfirmDialogOpen(true); // Abre/asegura que el diálogo esté abierto
                    }
                  }
            }
            aria-live="polite"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              "Procesar Venta"
            )}
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              clearCart();
              router.push("/admin/pos");
            }}
            disabled={isSubmitting}
          >
            Cancelar Venta
          </Button>
        </div>
      </div>

      {/* Diálogo de confirmación para pago en efectivo */}

      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar pago en Efectivo</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cash-received" className="text-sm font-medium">
                Monto recibido
              </Label>

              <Input
                id="cash-received"
                type="number"
                value={cashAmount}
                onChange={(e) =>
                  setCashAmount(e.target.value ? Number(e.target.value) : "")
                }
                min={finalTotal >= 0 ? finalTotal : 0}
                step="0.01"
                className="text-lg h-12"
                placeholder={`Mínimo $${finalTotal.toFixed(2)}`}
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-4 text-center border-t pt-4">
              <div>
                <div className="text-xs font-medium text-gray-500 uppercase">
                  Total a Pagar
                </div>

                <div className="text-lg font-semibold">
                  ${finalTotal.toFixed(2)}
                </div>
              </div>

              <div>
                <div className="text-xs font-medium text-gray-500 uppercase">
                  Cambio
                </div>

                <div
                  className={`text-lg font-semibold ${change >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  $
                  {change >= 0
                    ? change.toFixed(2)
                    : `Faltan $${Math.abs(change).toFixed(2)}`}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
            >
              Cancelar
            </Button>

            <Button
              onClick={handlePayment} // Llama al mismo handler
              disabled={
                isSubmitting ||
                typeof cashAmount !== "number" ||
                cashAmount < finalTotal
              }
              aria-live="polite"
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Confirmar Pago
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
