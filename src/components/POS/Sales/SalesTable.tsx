// src/components/POS/Sales/SalesTable.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { 
  ArrowRight, 
  Eye, 
  FileText, 
  Filter, 
  RefreshCcw, 
  Search, 
  XCircle 
} from "lucide-react";
import { formatCurrency, formatDateTime, translatePaymentMethod } from "@/utils/pos-helpers";
import type { Sale } from "@/types/pos";

interface SalesTableProps {
  sales: Sale[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
  onPageChange?: (page: number) => void;
  onFilterChange?: (filters: any) => void;
}

export default function SalesTable({ 
  sales, 
  pagination, 
  onPageChange,
  onFilterChange
}: SalesTableProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  
  const handleSearch = () => {
    if (onFilterChange) {
      onFilterChange({
        search: searchTerm,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        paymentMethod: paymentFilter !== "ALL" ? paymentFilter : undefined,
        date: dateFilter
      });
    }
  };
  
  const handleReset = () => {
    setSearchTerm("");
    setStatusFilter("ALL");
    setPaymentFilter("ALL");
    setDateFilter(undefined);
    
    if (onFilterChange) {
      onFilterChange({});
    }
  };
  
  const handleViewSale = (id: string) => {
    router.push(`/admin/pos/ventas/${id}`);
  };
  
  const getSaleStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completada</Badge>;
      case "PENDING":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pendiente</Badge>;
      case "CANCELLED":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelada</Badge>;
      case "REFUNDED":
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Reembolsada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Ventas</CardTitle>
        <CardDescription>
          Listado de ventas realizadas
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filtros */}
        <div className="mb-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Buscar por # de recibo o cliente..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  <SelectItem value="COMPLETED">Completadas</SelectItem>
                  <SelectItem value="PENDING">Pendientes</SelectItem>
                  <SelectItem value="CANCELLED">Canceladas</SelectItem>
                  <SelectItem value="REFUNDED">Reembolsadas</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Pago" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  <SelectItem value="CASH">Efectivo</SelectItem>
                  <SelectItem value="CREDIT_CARD">Tarjeta crédito</SelectItem>
                  <SelectItem value="DEBIT_CARD">Tarjeta débito</SelectItem>
                  <SelectItem value="TRANSFER">Transferencia</SelectItem>
                  <SelectItem value="MOBILE_PAYMENT">Pago móvil</SelectItem>
                </SelectContent>
              </Select>
              
              <DatePicker
                date={dateFilter}
                onDateChange={setDateFilter}
                placeholder="Fecha"
              />
            </div>
          </div>
          
          <div className="flex justify-between">
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RefreshCcw className="h-4 w-4 mr-1" />
              Reiniciar
            </Button>
            <Button size="sm" onClick={handleSearch}>
              <Filter className="h-4 w-4 mr-1" />
              Filtrar
            </Button>
          </div>
        </div>
        
        {/* Tabla */}
        {sales.length > 0 ? (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recibo</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Método de pago</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-24 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">{sale.receiptNumber}</TableCell>
                    <TableCell>{formatDateTime(sale.date)}</TableCell>
                    <TableCell>
                      {sale.user ? (
                        <Link href={`/admin/clientes/${sale.userId}`} className="hover:underline">
                          {sale.user.firstName} {sale.user.lastName}
                        </Link>
                      ) : (
                        <span className="text-gray-500 text-sm">Cliente de mostrador</span>
                      )}
                    </TableCell>
                    <TableCell>{formatCurrency(sale.total)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{translatePaymentMethod(sale.paymentMethod)}</Badge>
                    </TableCell>
                    <TableCell>
                      {getSaleStatusBadge(sale.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleViewSale(sale.id)}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Ver detalle</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-10 border rounded-md bg-gray-50">
            <FileText className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-gray-500">No hay ventas</h3>
            <p className="text-sm text-gray-400">No se encontraron ventas con los filtros seleccionados</p>
            {(searchTerm || statusFilter !== "ALL" || paymentFilter !== "ALL" || dateFilter) && (
              <Button variant="outline" size="sm" className="mt-4" onClick={handleReset}>
                <XCircle className="h-4 w-4 mr-1" />
                Limpiar filtros
              </Button>
            )}
          </div>
        )}
        
        {/* Paginación */}
        {pagination.pages > 1 && (
          <div className="flex justify-center mt-4">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              onPageChange={onPageChange}
            />
          </div>
        )}
        
        {/* Botón de nueva venta */}
        <div className="mt-6">
          <Button asChild>
            <Link href="/admin/pos/ventas/nueva">
              Nueva Venta
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}