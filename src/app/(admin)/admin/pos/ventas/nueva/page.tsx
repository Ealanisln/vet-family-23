// src/app/(admin)/admin/pos/ventas/nueva/page.tsx
'use client';

import { useEffect, useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { getPendingMedicalOrders } from "@/app/actions/medical-orders";
import SaleForm from "@/components/POS/Sales/SaleForm";

interface SearchParams {
  orderId?: string;
}

interface MedicalOrderProduct {
  productId: string;
  quantity: number;
  unitPrice: number;
  product: {
    id: string;
    name: string;
    description: string | null;
    category: string;
    quantity: number;
  }
}

interface ExtendedMedicalOrder {
  id: string;
  petId: string;
  userId: string;
  visitDate: Date;
  diagnosis: string | null;
  treatment: string | null;
  prescriptions: string[];
  notes: string | null;
  products: MedicalOrderProduct[];
  pet: {
    id: string;
    name: string;
    species: string;
    weight: number;
    isNeutered: boolean;
  };
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
  };
}

export default function NewSalePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { addItem, setPet, setClient, setNotes } = useCart();
  const [isLoading, setIsLoading] = useState(true);

  // Cargar orden médica si existe
  useEffect(() => {
    const loadMedicalOrder = async () => {
      if (searchParams.orderId) {
        const result = await getPendingMedicalOrders();
        if (result.success) {
          const order = result.orders?.find((o: ExtendedMedicalOrder) => o.id === searchParams.orderId);
          if (order) {
            // Establecer cliente y mascota
            setClient({
              id: order.userId,
              firstName: order.user.firstName || '',
              lastName: order.user.lastName || '',
              email: order.user.email || ''
            });
            
            setPet({
              id: order.petId,
              name: order.pet.name,
              species: order.pet.species,
              userId: order.userId,
              weight: order.pet.weight,
              isNeutered: order.pet.isNeutered
            });

            // Agregar productos al carrito
            order.products.forEach((product: MedicalOrderProduct) => {
              addItem({
                id: product.productId,
                type: 'product',
                name: product.product.name,
                description: product.product.description || '',
                quantity: product.quantity,
                unitPrice: product.unitPrice,
                category: product.product.category,
                stock: product.product.quantity
              });
            });

            // Establecer notas
            if (order.notes) {
              setNotes(order.notes);
            }
          }
        }
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    };

    loadMedicalOrder();
  }, [searchParams.orderId, addItem, setClient, setPet, setNotes]);

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <SaleForm />
    </div>
  );
}
