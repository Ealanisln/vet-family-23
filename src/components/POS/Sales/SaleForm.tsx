// src/components/POS/Sales/SaleForm.tsx

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  PlusCircle,
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
  PaymentMethod,
  SaleFormData,
  Sale
} from "@/types/pos";
import type { InventoryItem as InvInventoryItem } from "@/types/inventory"; // Alias para el tipo de Inventory
import type { Client } from "@/components/Clientes/ClientSearch";
import { Pet } from "@/types/pet";
import { getPetDetails } from "@/app/(admin)/admin/mascotas/[petId]/getPetDetails";
import { getUserById } from "@/app/actions/get-customers";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import Receipt from "./Receipt";
import ReactDOMServer from 'react-dom/server';

export default function SaleForm() {
  // console.log("SaleForm component rendering..."); // REMOVE Log de prueba
  // throw new Error("ESTO ES UN ERROR DE PRUEBA EN SALEFORM"); // REMOVE Error intencional

  const router = useRouter();
  const [activeTab, setActiveTab] = useState("products");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [cashAmount, setCashAmount] = useState<number | "">("");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [completedSaleData, setCompletedSaleData] = useState<Sale | null>(null);

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

  // Cargar productos preseleccionados del historial médico
  useEffect(() => {
    const loadPendingSale = async () => {
      const pendingSale = localStorage.getItem('pending_pos_sale');
      if (pendingSale) {
        try {
          const { products, petId, notes } = JSON.parse(pendingSale);
          // Agregar los productos al carrito
          products.forEach((product: { id: string; name: string; quantity: number; unitPrice: number }) => {
            const cartItem = {
              id: product.id,
              type: 'product' as const,
              name: product.name,
              description: product.name,
              quantity: product.quantity,
              unitPrice: product.unitPrice
            };
            addItem(cartItem);
          });

          // Si hay un petId, buscar la información completa de la mascota
          if (petId) {
            try {
              const pet = await getPetDetails(petId);
              if (pet) {
                const cartPet = adaptPetToCartPet(pet);
                if (cartPet) {
                  setPet(cartPet);
                  // Buscar y establecer el cliente
                  const user = await getUserById(pet.userId);
                  if (user) {
                    const cartClient = adaptClientToCartClient({
                      id: user.id,
                      firstName: user.firstName || null,
                      lastName: user.lastName || null,
                      email: user.email || null,
                      phone: user.phone || null,
                    });
                    setClient(cartClient);
                  }
                }
              }
            } catch (error) {
              console.error('Error al obtener detalles de la mascota:', error);
            }
          }

          // Si hay notas, establecerlas
          if (notes) {
            setNotes(notes);
          }
          // Limpiar localStorage después de cargar
          localStorage.removeItem('pending_pos_sale');
        } catch (error) {
          console.error('Error al cargar productos preseleccionados:', error);
        }
      }
    };

    loadPendingSale();
  }, [addItem, setNotes, setPet, setClient]);

  // Calcular el total final después del descuento
  const finalTotal =
    (typeof total === "number" ? total : 0) -
    (typeof discountAmount === "number" ? discountAmount : 0);

  // Calcular el cambio para pagos en efectivo
  // Asegurarse de que cashAmount sea tratado como número para el cálculo
  const cashReceived = typeof cashAmount === 'number' ? cashAmount : 0;
  const change = cashReceived - finalTotal;

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
  const handleClientSelect = useCallback((client: Client | null) => {
    const cartClient = adaptClientToCartClient(client);
    setClient(cartClient);
    if (state.pet && (!cartClient || cartClient.id !== state.pet.userId)) {
      setPet(null);
    }
  }, [setClient, setPet, state.pet]);

  // Manejar selección de mascota
  const handlePetSelect = useCallback((pet: Pet | null) => {
    const cartPet = adaptPetToCartPet(pet);
    setPet(cartPet);
  }, [setPet]);

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

  // Función para limpiar y redirigir
  const finishSaleFlow = () => {
    console.log("finishSaleFlow: Iniciando limpieza y redirección."); // Log 15
    clearCart();
    router.push("/admin/pos");
    setCompletedSaleData(null);
    setIsSubmitting(false); // Poner isSubmitting false aquí
  };

  // Procesar la venta
  const handlePayment = useCallback(async () => {
    console.log("handlePayment: Iniciando..."); // Log 1: Inicio de la función

    if (state.items.length === 0) {
      console.log("handlePayment: Carrito vacío."); // Log 2: Validación carrito
      toast({ title: "Error", description: "El carrito está vacío", variant: "destructive" });
      return;
    }

    if (!state.paymentMethod) {
      console.log("handlePayment: Método de pago no seleccionado."); // Log 3: Validación método pago
      toast({ title: "Error", description: "Selecciona un método de pago", variant: "destructive" });
      return;
    }

    // Usar cashReceived para la comparación numérica
    if (
      state.paymentMethod === "CASH" &&
      confirmDialogOpen &&
      (typeof cashAmount !== 'number' || cashReceived < finalTotal)
    ) {
      console.log("handlePayment: Monto en efectivo insuficiente.", { cashReceived, finalTotal }); // Log 4: Validación efectivo
      toast({
        title: "Error",
        description: "El monto recibido en efectivo es menor al total a pagar.",
        variant: "destructive",
      });
      return;
    }

    console.log("handlePayment: Estableciendo isSubmitting a true."); // Log 5: Antes de setIsSubmitting
    setIsSubmitting(true);
    setConfirmDialogOpen(false);

    try {
      console.log("handlePayment: Dentro del bloque try."); // Log 6: Inicio try
      const saleData: SaleFormData = {
        userId: state.client?.id,
        petId: state.pet?.id,
        subtotal: subtotal,
        tax: tax,
        discount: discountAmount || 0,
        total: finalTotal,
        paymentMethod: state.paymentMethod, // Ya validamos que no sea null
        notes: state.notes,
        status: 'COMPLETED',
        items: state.items.map(item => ({
          itemId: item.type === 'product' ? item.id : null,
          serviceId: item.type === 'service' ? item.id : null,
          description: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.quantity * item.unitPrice
        }))
      };
      console.log("handlePayment: Datos de venta preparados:", saleData); // Log 7: Datos a enviar

      const saleResult = await createSale(saleData);
      console.log("handlePayment: Resultado de createSale:", saleResult); // Log 8: Resultado CRUDO

      // Verificar el éxito correctamente
      if (!saleResult || !saleResult.success) { // Más robusto, verifica si saleResult existe
        console.error("handlePayment: createSale NO fue exitoso o resultado inválido.", saleResult); // Log 9a: Fallo
        throw new Error(saleResult?.error || "Error desconocido al crear la venta.");
      }

      // Éxito
      console.log("handlePayment: Éxito."); // Log 9b: Éxito
      toast({
        title: "Éxito",
        description: "Venta procesada correctamente",
      });

      // Store the full Sale object
      console.log("handlePayment: Guardando datos de venta completada:", saleResult.sale); // Log 10: Antes de guardar datos
      setCompletedSaleData(saleResult.sale);

      console.log("handlePayment: Estableciendo showPrintDialog a true."); // Log 11: Antes de mostrar diálogo
      setShowPrintDialog(true);
      console.log("handlePayment: showPrintDialog debería ser true ahora."); // Log 12: Después de mostrar diálogo

    } catch (error) {
      console.error("handlePayment: Error en el bloque catch:", error); // Log 13: Error capturado
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al procesar la venta",
        variant: "destructive",
      });
      // Asegurarse de que el estado de carga se detenga en caso de error
      console.log("handlePayment: Estableciendo isSubmitting a false en catch."); // Log 14: Fin carga en error
      setIsSubmitting(false);
    }
  }, [state, subtotal, tax, discountAmount, finalTotal, cashAmount, confirmDialogOpen, clearCart, router, toast, setConfirmDialogOpen, setIsSubmitting, setCompletedSaleData, setShowPrintDialog]); // Añadir dependencias que faltaban

  const handlePrintReceipt = () => {
    console.log("handlePrintReceipt called!"); // <-- Add log here
    // Verify we have the completed sale data
    if (!completedSaleData) {
      console.error("handlePrintReceipt: Error - completedSaleData is null.");
      toast({
        title: "Error de Impresión",
        description: "No se encontraron los datos de la venta completada.",
        variant: "destructive",
      });
      return;
    }
    console.log(`handlePrintReceipt: Iniciando impresión para ID: ${completedSaleData.id}, Recibo: ${completedSaleData.receiptNumber}`);

    // Log the data being passed to Receipt component
    console.log("handlePrintReceipt: Data for rendering:", JSON.stringify(completedSaleData, null, 2));

    // 1. Render the Receipt component to an HTML string using the full Sale object
    const receiptElement = (
      <Receipt
        sale={completedSaleData} // Pass the full Sale object directly
        printMode={true}
        showActions={false} // Usually false for printing
      />
    );
    const receiptHtml = ReactDOMServer.renderToString(receiptElement);

    // 2. Open print window and write the rendered HTML
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Recibo ${completedSaleData.receiptNumber}</title>
            <!-- Add Tailwind CDN for print styling diagnosis -->
            <script src="https://cdn.tailwindcss.com"></script> 
            <style>
              /* Basic styles for thermal printer */
              @media print {
                body { 
                  margin: 0;
                  font-family: 'Courier New', Courier, monospace; /* Common thermal printer font */
                  font-size: 10pt; /* Adjust as needed */
                  width: 80mm; /* Standard thermal paper width */
                  /* Remove padding and use flex to center */
                  /* padding: 2mm; */ 
                  box-sizing: border-box; 
                  display: flex; /* Use flexbox */
                  justify-content: center; /* Center content horizontally */
                  align-items: flex-start; /* Align content to the top */
                  min-height: 100%; /* Ensure body takes height for alignment */
                }
                /* The receipt div itself doesn't need mx-auto if body centers it */
                /* Example: Ensure divs take full width */
                div { width: 100%; }
                .no-print { display: none; }
              }
              /* You might need to manually copy essential styles from Receipt.tsx or global CSS */
              /* For Tailwind, this approach won't automatically apply classes. */
              /* Consider a dedicated print CSS or inline styles in Receipt component if needed. */
            </style>
          </head>
          <body>
            ${receiptHtml}
            <script>
              window.onload = function() {
                setTimeout(function() { // Add a small delay for rendering
                  window.print();
                }, 100);
                window.onafterprint = function() {
                  window.close();
                };
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }

    setShowPrintDialog(false);
    finishSaleFlow();
  };

  // Memoize selected client and pet objects to prevent unnecessary re-renders
  const memoizedSelectedClient = useMemo(() => adaptCartClientToClient(state.client), [state.client]);
  const memoizedSelectedPet = useMemo(() => adaptCartPetToPet(state.pet), [state.pet]);

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
                  selectedClient={memoizedSelectedClient}
                />
              </div>
              <div>
                <Label htmlFor="pet-search" className="mb-2 block">
                  Mascota (opcional)
                </Label>
                <PetSearch
                  inputId="pet-search"
                  onSelect={handlePetSelect}
                  selectedPet={memoizedSelectedPet}
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
            <div className="mt-4 text-center">
              <Link href="/admin/pos/servicios/nuevo" passHref legacyBehavior>
                <Button variant="outline" size="sm">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Agregar Nuevo Servicio
                </Button>
              </Link>
            </div>
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
                <span>Subtotal (con IVA):</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span>
                  IVA incluido (16%):
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
            onClick={ // Asegurarnos que onClick llama a handlePayment
              state.paymentMethod !== "CASH"
                ? handlePayment // Llama directamente si no es efectivo
                : () => {
                    // Si es efectivo, maneja el diálogo o llama a handlePayment
                    console.log("Procesar Venta (CASH) button clicked"); // Log extra para el botón CASH
                    // Usar cashReceived para la comparación
                    if (
                      !confirmDialogOpen ||
                      (typeof cashAmount === 'number' && cashReceived >= finalTotal)
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
                cashReceived < finalTotal // Usar cashReceived aquí también
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

      {/* Diálogo para preguntar si imprimir ticket */}
      <AlertDialog open={showPrintDialog} onOpenChange={setShowPrintDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Venta Completada</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Deseas imprimir el ticket de la venta?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              console.log("AlertDialog: Cancelar clickeado.");
              setShowPrintDialog(false);
              finishSaleFlow();
            }}>
              No, gracias
            </AlertDialogCancel>
            <AlertDialogAction onClick={handlePrintReceipt}>
              Imprimir Ticket
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Componente de recibo para impresión (Ahora only used for rendering to string) */}
      {/* This div is no longer needed for direct printing */}
      {/* 
      {completedSaleData && (
        <div className="hidden">
          <Receipt sale={completedSaleData} printMode={true} /> // Example if needed elsewhere
        </div>
      )} 
      */}
    </div>
  );
}