'use client';

import React from 'react';
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, User, Dog, Calendar, Clock, Tag, CreditCard, Edit, XCircle, Printer } from "lucide-react";
import { formatCurrency, formatDateTime, translatePaymentMethod, translateSaleStatus } from "@/utils/pos-helpers";
import { Sale, SaleItem } from "@/types/pos";
import { format } from "date-fns";
import Receipt from '@/components/POS/Sales/Receipt';

interface SaleDetailClientProps {
  sale: Sale;
}

export default function SaleDetailClient({ sale }: SaleDetailClientProps) {
  const getStatusBadgeVariant = (status: Sale["status"]): "default" | "outline" | "secondary" | "destructive" => {
    switch (status) {
      case "COMPLETED": return "secondary";
      case "PENDING": return "default";
      case "CANCELLED": return "destructive";
      case "REFUNDED": return "outline";
      default: return "secondary";
    }
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8 print:hidden">
        <div className="mb-6 print:hidden">
          <Link
            href="/admin/pos/ventas"
            className="flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver al historial de ventas
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4 print:hidden">
          <div>
            <h1 className="text-3xl font-bold mb-2">Venta #{sale.receiptNumber}</h1>
            <div className="flex items-center text-sm text-gray-500 gap-4">
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {formatDateTime(sale.date, false)}
              </span>
              <span className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {format(new Date(sale.date), "HH:mm")}
              </span>
              <Badge variant={getStatusBadgeVariant(sale.status)} className="capitalize">
                {translateSaleStatus(sale.status)}
              </Badge>
            </div>
          </div>
          <div className="flex space-x-2 print:hidden">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-1" />
              Imprimir Recibo
            </Button>
            {sale.status === 'PENDING' && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/pos/ventas/${sale.id}/editar`}>
                  <Edit className="h-4 w-4 mr-1" /> Editar
                </Link>
              </Button>
            )}
            {sale.status !== 'CANCELLED' && sale.status !== 'REFUNDED' && (
              <Button variant="destructive" size="sm">
                <XCircle className="h-4 w-4 mr-1" /> Cancelar
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:hidden">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Artículos de la Venta</CardTitle>
              <CardDescription>Productos y servicios incluidos en esta venta.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead className="text-right">Precio Unit.</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sale.SaleItem && sale.SaleItem.length > 0 ? (
                    sale.SaleItem.map((item: SaleItem) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.description}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.total)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-gray-500">
                        No hay artículos en esta venta.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex flex-col items-end space-y-2 pt-4 border-t">
              <div className="flex justify-between w-full max-w-xs text-sm">
                <span>Subtotal:</span>
                <span>{formatCurrency(sale.subtotal)}</span>
              </div>
              {sale.discount > 0 && (
                <div className="flex justify-between w-full max-w-xs text-sm text-red-600">
                  <span>Descuento:</span>
                  <span>-{formatCurrency(sale.discount)}</span>
                </div>
              )}
              <div className="flex justify-between w-full max-w-xs text-base font-semibold border-t pt-2 mt-2">
                <span>Total:</span>
                <span>{formatCurrency(sale.total)}</span>
              </div>
            </CardFooter>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-gray-500"/> Cliente
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sale.User ? (
                  <>
                    <p className="font-medium">{`${sale.User.firstName || ''} ${sale.User.lastName || ''}`.trim()}</p>
                    <p className="text-sm text-gray-500">{sale.User.email}</p>
                    <Link href={`/admin/clientes/${sale.userId}`} className="text-sm text-blue-600 hover:underline mt-2 block print:hidden">
                      Ver perfil del cliente
                    </Link>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">Cliente de mostrador</p>
                )}
              </CardContent>
            </Card>

            {sale.Pet && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Dog className="h-5 w-5 mr-2 text-gray-500"/> Mascota
                  </CardTitle>
                </CardHeader>
                <CardContent>
                   <p className="font-medium">{sale.Pet.name}</p>
                   <p className="text-sm text-gray-500">{sale.Pet.species} ({sale.Pet.breed})</p>
                   <Link href={`/admin/clientes/${sale.userId}/mascotas/${sale.petId}`} className="text-sm text-blue-600 hover:underline mt-2 block print:hidden">
                     Ver perfil de la mascota
                   </Link>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-gray-500"/> Detalles del Pago
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Método:</span>
                  <span className="font-medium">{translatePaymentMethod(sale.paymentMethod)}</span>
                </div>
                <div className="flex justify-between">
                   <span className="text-gray-500">Estado:</span>
                   <Badge variant={getStatusBadgeVariant(sale.status)} className="capitalize">
                      {translateSaleStatus(sale.status)}
                   </Badge>
                </div>
              </CardContent>
            </Card>

            {sale.notes && (
               <Card>
                 <CardHeader>
                   <CardTitle className="flex items-center">
                     <Tag className="h-5 w-5 mr-2 text-gray-500"/> Notas Adicionales
                   </CardTitle>
                 </CardHeader>
                 <CardContent>
                   <p className="text-sm text-gray-600 whitespace-pre-wrap">{sale.notes}</p>
                 </CardContent>
               </Card>
            )}
          </div>
        </div>
      </div>

      <div className="hidden print:block">
        <Receipt sale={sale} printMode={true} showActions={false} />
      </div>
    </>
  );
} 