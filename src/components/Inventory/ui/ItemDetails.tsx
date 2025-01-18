import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/custom-badge";
import type { BadgeProps } from "@/components/ui/custom-badge";
import { InventoryFormItem } from "@/types/inventory";
import { InventoryStatus } from "@prisma/client";

interface ItemDetailsProps {
  selectedItem: InventoryFormItem | null;
}

const getStatusBadgeVariant = (status: string): BadgeProps["variant"] => {
  const statusMap: Record<string, BadgeProps["variant"]> = {
    ACTIVE: "success",
    INACTIVE: "secondary",
    LOW_STOCK: "warning",
    OUT_OF_STOCK: "destructive",
    EXPIRED: "destructive",
  };
  return statusMap[status];
};

const formatDate = (dateString: string | Date) => {
  return new Date(dateString).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
};

const getStatusText = (status: InventoryStatus): string => {
  const statusMap: Record<string, string> = {
    ACTIVE: "Activo",
    INACTIVE: "Inactivo",
    LOW_STOCK: "Stock Bajo",
    OUT_OF_STOCK: "Sin Stock",
    EXPIRED: "Expirado",
  };
  return statusMap[status];
};

const getCategoryText = (category: string): string => {
  const categoryMap: Record<string, string> = {
    MEDICINE: "Medicina",
    SURGICAL_MATERIAL: "Material Quirúrgico",
    VACCINE: "Vacuna",
    FOOD: "Alimento",
    ACCESSORY: "Accesorio",
    CONSUMABLE: "Consumible",
  };
  return categoryMap[category];
};

export const ItemDetails: React.FC<ItemDetailsProps> = ({ selectedItem }) => {
  if (!selectedItem) return null;

  return (
    <div className="space-y-8 p-4">
      {/* Sección Superior: Estado y Datos Principales */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="w-full sm:w-2/3">
          <h3 className="text-2xl font-semibold text-gray-900">{selectedItem.name}</h3>
          <div className="mt-2 flex flex-wrap gap-2 items-center">
            <Badge variant={getStatusBadgeVariant(selectedItem.status)}>
              {getStatusText(selectedItem.status)}
            </Badge>
            <span className="text-gray-500">•</span>
            <span className="text-gray-600">{getCategoryText(selectedItem.category)}</span>
          </div>
        </div>
        <div className="w-full sm:w-1/3 flex flex-col items-start sm:items-end">
          <div className="text-3xl font-bold text-gray-900">{selectedItem.quantity}</div>
          <div className="text-sm text-gray-500">Unidades disponibles</div>
        </div>
      </div>

      {/* Grid de Información */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Columna Izquierda */}
        <Card className="p-6 space-y-6">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Detalles Básicos</h4>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Stock Mínimo</label>
                <p className="mt-1 text-gray-900">{selectedItem.minStock || "-"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Marca</label>
                <p className="mt-1 text-gray-900">{selectedItem.brand || "-"}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Columna Derecha */}
        <Card className="p-6 space-y-6">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Especificaciones</h4>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Presentación</label>
                <p className="mt-1 text-gray-900">{selectedItem.presentation || "-"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Medida</label>
                <p className="mt-1 text-gray-900">{selectedItem.measure || "-"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Compuesto Activo</label>
                <p className="mt-1 text-gray-900">{selectedItem.activeCompound || "-"}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Descripción */}
      {selectedItem.description && (
        <Card className="p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Descripción</h4>
          <p className="text-gray-700 leading-relaxed">{selectedItem.description}</p>
        </Card>
      )}

      {/* Movimientos */}
      <Card className="p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Últimos Movimientos</h4>
        <div className="space-y-3">
          {selectedItem.movements.map((movement, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg gap-2"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`text-lg font-semibold ${
                    movement.type === "IN" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {movement.type === "IN" ? "+" : "-"}
                  {movement.quantity}
                </span>
                <span className="text-gray-500 text-sm">
                  {formatDate(movement.date)}
                </span>
              </div>
              {movement.user?.name && (
                <span className="text-sm text-gray-600">
                  por {movement.user.name}
                </span>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ItemDetails;