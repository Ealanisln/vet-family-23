'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { getPendingMedicalOrders } from "@/app/actions/medical-orders";

interface PendingMedicalOrder {
  id: string;
  visitDate: Date;
  pet: {
    name: string;
    species: string;
  };
  user: {
    firstName: string | null;
    lastName: string | null;
  };
  products: Array<{
    quantity: number;
    unitPrice: number;
    product: {
      name: string;
    };
  }>;
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function PendingMedicalOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState<PendingMedicalOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      const result = await getPendingMedicalOrders();
      if (result.success && result.orders) {
        setOrders(result.orders as PendingMedicalOrder[]);
      }
      setIsLoading(false);
    };

    loadOrders();
  }, []);

  const calculateTotal = (order: PendingMedicalOrder) => {
    return order.products.reduce((acc, product) => {
      return acc + (product.quantity * product.unitPrice);
    }, 0);
  };

  if (isLoading) {
    return <div>Cargando órdenes pendientes...</div>;
  }

  if (orders.length === 0) {
    return <div>No hay órdenes médicas pendientes</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Órdenes Médicas Pendientes</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Mascota</TableHead>
            <TableHead>Propietario</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{formatDate(order.visitDate)}</TableCell>
              <TableCell>
                {order.pet.name} ({order.pet.species})
              </TableCell>
              <TableCell>
                {order.user.firstName} {order.user.lastName}
              </TableCell>
              <TableCell>${calculateTotal(order).toFixed(2)}</TableCell>
              <TableCell>
                <Button
                  onClick={() => router.push(`/admin/pos/ventas/nueva?orderId=${order.id}`)}
                  size="sm"
                >
                  Procesar Pago
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 