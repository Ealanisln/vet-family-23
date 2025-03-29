// src/components/POS/Sales/ServiceSearch.tsx
"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Plus, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { searchServices } from "@/app/actions/pos/services";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Asegúrate de importar ServiceCategory
import type { Service, ServiceCategory } from "@/types/pos"; 

const serviceCategories = [
  { value: "ALL", label: "Todos" },
  { value: "CONSULTATION", label: "Consultas" },
  { value: "SURGERY", label: "Cirugías" },
  { value: "VACCINATION", label: "Vacunación" },
  { value: "GROOMING", label: "Estética" },
  { value: "DENTAL", label: "Dental" },
  { value: "LABORATORY", label: "Laboratorio" },
  { value: "IMAGING", label: "Imagenología" },
  { value: "HOSPITALIZATION", label: "Hospitalización" },
  { value: "OTHER", label: "Otros" },
];

interface ServiceSearchProps {
  onSelectService: (service: Service) => void;
}

export default function ServiceSearch({ onSelectService }: ServiceSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        // ---- CORRECCIÓN AQUÍ ----
        const category = selectedCategory === "ALL" 
          ? null 
          : selectedCategory as ServiceCategory; 
        // -------------------------

        const result = await searchServices({
          searchTerm,
          category,
          isActive: true,
        });
        setServices(result);
      } catch (error) {
        console.error("Error fetching services:", error);
        // Considerar mostrar un mensaje de error al usuario
      } finally {
        setLoading(false);
      }
    };
    
    // Usar un debounce para evitar llamadas excesivas a la API
    const handler = setTimeout(() => {
      fetchServices();
    }, 300); // 300ms de espera después de dejar de escribir/seleccionar
    
    // Limpiar el timeout si el componente se desmonta o los parámetros cambian
    return () => clearTimeout(handler);
  }, [searchTerm, selectedCategory]); // Dependencias del useEffect
  
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          type="search"
          placeholder="Buscar servicios por nombre..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* Tabs para filtrar por categoría */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="w-full flex overflow-x-auto hide-scrollbar">
          {serviceCategories.map((category) => (
            <TabsTrigger 
              key={category.value} 
              value={category.value}
              className="flex-shrink-0" // Evita que los tabs se encojan demasiado
            >
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      
      {/* Estado de carga */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-3">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-1/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Resultados de la búsqueda */}
          {services.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto p-1">
              {services.map((service) => (
                <Card key={service.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-3">
                    <div className="flex flex-col h-full">
                      {/* Contenido principal de la tarjeta */}
                      <div className="flex-grow"> {/* Ocupa el espacio disponible */}
                        <h3 className="font-medium truncate" title={service.name}>
                          {service.name}
                        </h3>
                        {/* Asegurarse de que description no sea null para title */}
                        <div className="text-sm text-gray-500 truncate" title={service.description || ""}>
                          {service.description || <span className="italic">Sin descripción</span>} 
                        </div>
                        <div className="mt-1 flex items-center justify-between">
                          <Badge variant="outline">
                            {/* Busca la etiqueta correspondiente en serviceCategories */}
                            {serviceCategories.find(c => c.value === service.category)?.label || service.category}
                          </Badge>
                          <span className="font-semibold">${service.price.toFixed(2)}</span>
                        </div>
                        {/* Mostrar duración si existe */}
                        {service.duration && (
                          <div className="text-sm text-gray-500 mt-1 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {service.duration} min
                          </div>
                        )}
                      </div>
                      {/* Botón de agregar */}
                      <Button 
                        size="sm" 
                        className="mt-2 w-full flex-shrink-0" // Evita que el botón se encoja
                        onClick={() => onSelectService(service)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Agregar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
             /* Mensaje cuando no hay resultados */
            <div className="text-center py-8 border rounded-md bg-gray-50 dark:bg-gray-800">
              <p className="text-gray-500 dark:text-gray-400">
                No se encontraron servicios con los criterios de búsqueda.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

