// src/components/pos/ServiceCard.tsx
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tag, Plus, Check, Loader2, Clock } from "lucide-react";
import { formatCurrency } from "@/utils/pos-helpers";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  // Estados
  const [isLoading, setIsLoading] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);

  // Convertir categoría a un formato más legible para mostrar
  const formatServiceCategory = (category: string): string => {
    return category
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };
  
  // Manejar clic en añadir al carrito
  const handleAddToCart = async () => {
    if (onAddToCart && service.isActive && !isLoading) {
      setIsLoading(true);
      try {
        await onAddToCart(service);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 1500);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  // Determinar el estado del botón
  const buttonState = !service.isActive ? "inactive" : isLoading ? "loading" : showSuccess ? "success" : "default";

  return (
    <Card className={cn("overflow-hidden h-full transition-all duration-200 hover:shadow-md", className)}>
      <div className="p-4 flex flex-col h-full">
        {/* Encabezado con categoría y estado */}
        <div className="flex justify-between items-start mb-2">
          <Badge variant="outline" className="text-xs">
            {formatServiceCategory(service.category)}
          </Badge>
          
          {!service.isActive && (
            <Badge variant="destructive" className="text-xs">
              No disponible
            </Badge>
          )}
        </div>
        
        {/* Nombre y descripción */}
        <h3 className="font-medium text-base mb-1 line-clamp-1">{service.name}</h3>
        
        {/* Description - Make this section take up variable space but have a min-height */}
        <div className="flex-grow mb-2 min-h-[40px]"> {/* Adjust min-h as needed */} 
          <p className="text-sm text-gray-500 line-clamp-2">
            {service.description || "Sin descripción"}
          </p>
        </div>
        
        {/* Duración del servicio - Ya no necesita min-h */}
        <div className="mb-2"> 
          {service.duration && (
            <div className="text-xs text-gray-500 flex items-center">
              <Clock className="h-3.5 w-3.5 mr-1 text-gray-400" />
              <span>{service.duration} min</span>
            </div>
          )}
        </div>
        
        {/* Pie de tarjeta con precio y acciones */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t">
          <div className="flex items-center">
            <Tag className="h-4 w-4 text-green-600 mr-1" />
            <span className="font-semibold text-green-600">
              {formatCurrency(service.price)}
            </span>
          </div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="sm" 
                  variant={buttonState === "inactive" ? "ghost" : "default"}
                  onClick={handleAddToCart}
                  disabled={!service.isActive || isLoading}
                  className={cn(
                    "h-auto px-2 py-1", // Reducir padding y altura
                    "text-xs gap-1 min-w-[80px]", // Reducir tamaño de fuente, gap y ancho mínimo
                    "transition-all duration-200",
                    buttonState === "default" && "bg-green-600 hover:bg-green-700 text-white",
                    buttonState === "success" && "bg-green-600 text-white",
                    buttonState === "loading" && "bg-green-600 text-white cursor-wait",
                    buttonState === "inactive" && "bg-gray-100 text-gray-400"
                  )}
                  aria-label={`Agregar ${service.name} al carrito${!service.isActive ? ' - No disponible' : ''}`}
                >
                  {buttonState === "loading" ? (
                    <Loader2 className="h-3 w-3 animate-spin" /> // Icono más pequeño
                  ) : buttonState === "success" ? (
                    <Check className="h-3 w-3" /> // Icono más pequeño
                  ) : (
                    <Plus className="h-3 w-3" /> // Icono más pequeño
                  )}
                  {buttonState === "inactive" ? "No disponible" : "Agregar"}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" align="center">
                {!service.isActive ? (
                  <p className="text-xs">Servicio no disponible actualmente</p>
                ) : (
                  <p className="text-xs">Agregar servicio al carrito</p>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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