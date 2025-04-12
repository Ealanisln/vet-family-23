// src/components/POS/Sales/Receipt.tsx
"use client";

import React, { useCallback, forwardRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Share2Icon } from "lucide-react";
import { formatDateTime, formatCurrency, translatePaymentMethod } from "@/utils/pos-helpers";
import type { Sale } from "@/types/pos";

interface ReceiptProps {
  sale: Sale;
  printMode?: boolean;
  showActions?: boolean;
}

const Receipt = forwardRef<HTMLDivElement, ReceiptProps>(
  ({ sale, printMode = false, showActions = true }, ref) => {

  const handleShare = useCallback(async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Recibo de venta #${sale.receiptNumber}`,
          text: `Recibo de venta de Veterinaria, por un total de ${formatCurrency(sale.total)}`,
          url: window.location.href,
        });
      } else {
        alert("La función de compartir no está disponible en este navegador.");
      }
    } catch (error) {
      console.error("Error al compartir:", error);
    }
  }, [sale]);
  
  const receiptContent = (
    <div 
      ref={ref} 
      className={`bg-white ${printMode ? "p-1 w-[76mm] mx-auto" : "p-0 w-full"} font-mono text-[10pt] leading-tight`}
    >
      <div className="text-center space-y-0.5 mb-2">
        <h2 className="font-bold text-sm uppercase">Vet Family</h2>
        <p>Calle Poetas, 144. Col Panorama, León, Guanajuato</p>
        <p>Tel: 477-332-7152</p>
        <p>WhatsApp: 477-260-5743</p>
      </div>
      
      <Separator className="my-1 border-dashed border-black" />
      
      <div className="text-[9pt]">
        <div className="flex justify-between"><span>Recibo:</span><span className="font-bold">{sale.receiptNumber}</span></div>
        <div className="flex justify-between"><span>Fecha:</span><span>{formatDateTime(sale.date, true)}</span></div>
        {sale.User && (
          <div className="flex justify-between"><span>Cliente:</span><span>{`${sale.User.firstName || ''} ${sale.User.lastName || ''}`.trim()}</span></div>
        )}
        {sale.Pet && (
          <div className="flex justify-between"><span>Mascota:</span><span>{sale.Pet.name} ({sale.Pet.species})</span></div>
        )}
      </div>
      
      <Separator className="my-1 border-dashed border-black" />
      
      <div className="text-[9pt]">
        <div className="flex justify-between font-bold mb-0.5">
          <span className="w-8 text-left">Cant</span>
          <span className="flex-1 text-left">Desc</span>
          <span className="w-14 text-right">P. Unit</span>
          <span className="w-14 text-right">Total</span>
        </div>
        {sale.SaleItem.map((item) => (
          <div key={item.id} className="flex justify-between items-start">
            <span className="w-8 text-left align-top">{item.quantity}</span>
            <span className="flex-1 text-left align-top break-words mr-1">{item.description}</span>
            <span className="w-14 text-right align-top">{formatCurrency(item.unitPrice)}</span>
            <span className="w-14 text-right align-top">{formatCurrency(item.total)}</span>
          </div>
        ))}
      </div>
      
      <Separator className="my-1 border-dashed border-black" />
      
      <div className="space-y-0.5 text-[10pt]">
        <div className="flex justify-between"><span>Subtotal:</span><span>{formatCurrency(sale.subtotal)}</span></div>
        {sale.discount > 0 && (
          <div className="flex justify-between"><span>Descuento:</span><span>-{formatCurrency(sale.discount)}</span></div>
        )}
        <div className="flex justify-between"><span>IVA (16%):</span><span>{formatCurrency(sale.tax)}</span></div>
        <div className="flex justify-between font-bold text-sm pt-1 border-t border-dashed border-black mt-1">
          <span>TOTAL:</span>
          <span>{formatCurrency(sale.total)}</span>
        </div>
        <div className="flex justify-between"><span>Pago:</span><span>{translatePaymentMethod(sale.paymentMethod)}</span></div>
      </div>
      
      <Separator className="my-1 border-dashed border-black" />
      
      <div className="text-center space-y-1 text-[8pt] mt-2">
        {sale.notes && (
          <p className="italic">Notas: {sale.notes}</p>
        )}
        <p>¡Gracias por su visita!</p>
        <p className="pt-1">Facebook & Instagram: @vet.family.23</p>
        <p>Sitio web: vetforfamily.com</p>
      </div>
    </div>
  );
  
  if (printMode) {
    return receiptContent;
  }
  
  return (
    <Card className="no-print">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex justify-between items-center">
          <span>Recibo #{sale.receiptNumber}</span>
          {showActions && (
            <div className="flex space-x-1">
              <Button
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={handleShare}
              >
                <Share2Icon className="h-4 w-4" />
                <span className="sr-only">Compartir</span>
              </Button>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {receiptContent}
      </CardContent>
    </Card>
  );
});

Receipt.displayName = "Receipt";
export default Receipt;