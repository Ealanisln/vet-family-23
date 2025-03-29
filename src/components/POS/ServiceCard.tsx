// src/components/pos/ServiceCard.tsx
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tag, Plus, Clock } from "lucide-react";
import { formatCurrency } from "@/utils/pos-helpers";
import type { Service, CartItem } from "@/types/pos";
import { cn } from "@/lib/utils";

interface ServiceCardProps {
  service: Service;
  onAddToCart?: (service: Service) => void;
  className?: string;
}

export function ServiceCard({ 
  service, 
  onAddToCart,
  className 
}: ServiceCardProps) {
  // Convertir categoría a un formato más legible para mostrar
  const formatServiceCategory = (category: string): string => {
    return category
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };
  
  // Manejar clic en añadir al carrito
  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(service);
    }
  };
  
  return (
    <Card className={cn("overflow-hidden h-full transition-all duration-200 hover:shadow-md", className)}>
      <div className="p-4 flex flex-col h-full">
        {/* Encabezado con categoría y estado */}
        <div className="flex justify-between items-start mb-2">
          <Badge variant="outline" className="text-xs">
            {formatServiceCategory(service.category)}
          </Badge>
          
          {!service.isActive && (
            <Badge variant="secondary" className="text-xs">
              Inactivo
            </Badge>
          )}
        </div>
        
        {/* Nombre y descripción */}
        <h3 className="font-medium text-base mb-1 line-clamp-1">{service.name}</h3>
        
        <p className="text-sm text-gray-500 line-clamp-2 mb-2 flex-grow">
          {service.description || "Sin descripción"}
        </p>
        
        {/* Duración del servicio, si está disponible */}
        {service.duration && (
          <div className="text-xs text-gray-500 mb-1 flex items-center">
            <Clock className="h-3.5 w-3.5 mr-1 text-gray-400" />
            <span>{service.duration} min</span>
          </div>
        )}
        
        {/* Pie de tarjeta con precio y acciones */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t">
          <div className="flex items-center">
            <Tag className="h-4 w-4 text-green-600 mr-1" />
            <span className="font-semibold text-green-600">
              {formatCurrency(service.price)}
            </span>
          </div>
          
          <Button 
            size="sm" 
            variant="outline"
            onClick={handleAddToCart}
            disabled={!service.isActive}
            className={cn(
              "text-sm gap-1 transition-colors",
              service.isActive && "hover:bg-green-50 hover:text-green-700 hover:border-green-200"
            )}
          >
            <Plus className="h-3.5 w-3.5" /> 
            Agregar
          </Button>
        </div>
      </div>
    </Card>
  );
}

// Función auxiliar para convertir un Service a CartItem
export function createCartItemFromService(service: Service): CartItem {
  return {
    id: service.id,
    type: 'service',
    name: service.name,
    description: service.description || service.name || "",
    quantity: 1,
    unitPrice: service.price
  };
}