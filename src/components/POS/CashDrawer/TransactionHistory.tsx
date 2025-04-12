// src/components/POS/CashDrawer/TransactionHistory.tsx
"use client";

import { useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowUp, ArrowDown, ReceiptText, RotateCcw, LayoutGrid } from "lucide-react";
import { formatCurrency, translateTransactionType } from "@/utils/pos-helpers";
import type { CashTransaction } from "@/types/pos";

interface TransactionHistoryProps {
  transactions: CashTransaction[];
}

export default function TransactionHistory({ transactions }: TransactionHistoryProps) {
  // Calcular totales por tipo de transacción
  const totals = useMemo(() => {
    return transactions.reduce((acc, tx) => {
      const type = tx.type;
      if (!acc[type]) {
        acc[type] = 0;
      }
      acc[type] += tx.amount;
      return acc;
    }, {} as Record<string, number>);
  }, [transactions]);
  
  // Ordenar transacciones por fecha (más reciente primero)
  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [transactions]);
  
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md bg-gray-50">
        <LayoutGrid className="mx-auto h-12 w-12 text-gray-300" />
        <h3 className="mt-2 text-gray-500">No hay transacciones</h3>
        <p className="text-sm text-gray-400">No se han registrado transacciones en esta sesión de caja</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Totales por tipo de transacción */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {totals.SALE !== undefined && (
          <div className="bg-green-50 p-3 rounded-md border border-green-100">
            <div className="flex items-center text-sm text-green-700">
              <ReceiptText className="h-4 w-4 mr-1" />
              Ventas
            </div>
            <div className="mt-1 font-medium text-green-800">
              {formatCurrency(totals.SALE)}
            </div>
          </div>
        )}
        
        {totals.REFUND !== undefined && (
          <div className="bg-orange-50 p-3 rounded-md border border-orange-100">
            <div className="flex items-center text-sm text-orange-700">
              <RotateCcw className="h-4 w-4 mr-1" />
              Devoluciones
            </div>
            <div className="mt-1 font-medium text-orange-800">
              {formatCurrency(Math.abs(totals.REFUND))}
            </div>
          </div>
        )}
        
        {totals.DEPOSIT !== undefined && (
          <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
            <div className="flex items-center text-sm text-blue-700">
              <ArrowDown className="h-4 w-4 mr-1" />
              Depósitos
            </div>
            <div className="mt-1 font-medium text-blue-800">
              {formatCurrency(totals.DEPOSIT)}
            </div>
          </div>
        )}
        
        {totals.WITHDRAWAL !== undefined && (
          <div className="bg-purple-50 p-3 rounded-md border border-purple-100">
            <div className="flex items-center text-sm text-purple-700">
              <ArrowUp className="h-4 w-4 mr-1" />
              Retiros
            </div>
            <div className="mt-1 font-medium text-purple-800">
              {formatCurrency(Math.abs(totals.WITHDRAWAL))}
            </div>
          </div>
        )}
      </div>
      
      {/* Tabla de transacciones */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hora</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="text-right">Monto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTransactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell className="text-sm text-gray-500">
                  {format(new Date(tx.createdAt), "HH:mm", { locale: es })}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`
                      ${tx.type === 'SALE' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                      ${tx.type === 'REFUND' ? 'bg-orange-50 text-orange-700 border-orange-200' : ''}
                      ${tx.type === 'DEPOSIT' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                      ${tx.type === 'WITHDRAWAL' ? 'bg-purple-50 text-purple-700 border-purple-200' : ''}
                      ${tx.type === 'ADJUSTMENT' ? 'bg-gray-50 text-gray-700 border-gray-200' : ''}
                    `}
                  >
                    {translateTransactionType(tx.type)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {tx.description}
                </TableCell>
                <TableCell className="text-right font-medium">
                  <span className={tx.amount < 0 ? 'text-red-600' : 'text-green-600'}>
                    {tx.amount < 0 ? '-' : '+'}{formatCurrency(Math.abs(tx.amount))}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}