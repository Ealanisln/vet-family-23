// src/components/POS/Sales/Receipt.tsx
"use client";

import { useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PrinterIcon, Share2Icon, DownloadIcon } from "lucide-react";
import { formatDateTime, formatCurrency, translatePaymentMethod } from "@/utils/pos-helpers";
import type { Sale } from "@/types/pos";

interface ReceiptProps {
  sale: Sale;
  printMode?: boolean;
}

export default function Receipt({ sale, printMode = false }: ReceiptProps) {
  const [isPrinting, setIsPrinting] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);
  
  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
    onBeforeprint: () => setIsPrinting(true),
    onAfterPrint: () => setIsPrinting(false),
    pageStyle: `
      @page {
        size: 80mm 297mm;
        margin: 0;
      }
      @media print {
        body {
          margin: 0;
          padding: 0;
        }
      }
    `,
  });
  
  const handleShare = async () => {
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
  };
  
  const receiptContent = (
    <div 
      ref={receiptRef} 
      className={`bg-white ${
        printMode ? "p-4 w-[80mm] mx-auto" : "p-0 w-full"
      } font-mono text-sm`}
    >
      <div className="text-center space-y-1">
        <h2 className="font-bold text-base">VETERINARIA</h2>
        <p>Calle Principal #123</p>
        <p>Ciudad, Estado, CP 12345</p>
        <p>Tel: (123) 456-7890</p>
      </div>
      
      <Separator className="my-3" />
      
      <div className="space-y-1">
        <div className="flex justify-between">
          <span>Recibo:</span>
          <span className="font-bold">{sale.receiptNumber}</span>
        </div>
        <div className="flex justify-between">
          <span>Fecha:</span>
          <span>{formatDateTime(sale.date, true)}</span>
        </div>
        {sale.user && (
          <div className="flex justify-between">
            <span>Cliente:</span>
            <span>{sale.user.firstName} {sale.user.lastName}</span>
          </div>
        )}
        {sale.pet && (
          <div className="flex justify-between">
            <span>Mascota:</span>
            <span>{sale.pet.name} ({sale.pet.species})</span>
          </div>
        )}
      </div>
      
      <Separator className="my-3" />
      
      <div>
        <div className="flex justify-between border-b pb-1 mb-2 font-bold">
          <div className="w-16 text-left">Cant.</div>
          <div className="flex-1 text-left">Descripción</div>
          <div className="w-16 text-right">Precio</div>
          <div className="w-20 text-right">Total</div>
        </div>
        
        {sale.items.map((item) => (
          <div key={item.id} className="flex justify-between py-1 text-sm">
            <div className="w-16 text-left">{item.quantity}</div>
            <div className="flex-1 text-left">{item.description}</div>
            <div className="w-16 text-right">{formatCurrency(item.unitPrice)}</div>
            <div className="w-20 text-right">{formatCurrency(item.total)}</div>
          </div>
        ))}
      </div>
      
      <Separator className="my-3" />
      
      <div className="space-y-1">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>{formatCurrency(sale.subtotal)}</span>
        </div>
        {sale.discount > 0 && (
          <div className="flex justify-between">
            <span>Descuento:</span>
            <span>-{formatCurrency(sale.discount)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>IVA (16%):</span>
          <span>{formatCurrency(sale.tax)}</span>
        </div>
        <div className="flex justify-between font-bold text-base">
          <span>TOTAL:</span>
          <span>{formatCurrency(sale.total)}</span>
        </div>
        <div className="flex justify-between">
          <span>Forma de pago:</span>
          <span>{translatePaymentMethod(sale.paymentMethod)}</span>
        </div>
      </div>
      
      <Separator className="my-3" />
      
      <div className="text-center space-y-2 text-xs">
        <p>¡Gracias por su compra!</p>
        {sale.notes && (
          <p className="italic">{sale.notes}</p>
        )}
        <p>www.clinicaveterinaria.com</p>
      </div>
    </div>
  );
  
  if (printMode) {
    return receiptContent;
  }
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex justify-between items-center">
          <span>Recibo #{sale.receiptNumber}</span>
          <div className="flex space-x-1">
            <Button
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={handlePrint}
              disabled={isPrinting}
            >
              <PrinterIcon className="h-4 w-4" />
              <span className="sr-only">Imprimir</span>
            </Button>
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
        </CardTitle>
      </CardHeader>
      <CardContent>
        {receiptContent}
      </CardContent>
    </Card>
  );
}