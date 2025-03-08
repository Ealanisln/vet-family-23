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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Service } from "@/types/pos";

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
        const category = selectedCategory === "ALL" ? null : selectedCategory;
        const result = await searchServices({
          searchTerm,
          category,
          isActive: true,
        });
        setServices(result);
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setLoading(false);
      }
    };
    
    const handler = setTimeout(() => {
      fetchServices();
    }, 300);
    
    return () => clearTimeout(handler);
  }, [searchTerm, selectedCategory]);
  
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
      
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="w-full flex overflow-x-auto hide-scrollbar">
          {serviceCategories.map((category) => (
            <TabsTrigger 
              key={category.value} 
              value={category.value}
              className="flex-shrink-0"
            >
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      
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
          {services.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto p-1">
              {services.map((service) => (
                <Card key={service.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-3">
                    <div className="flex flex-col h-full">
                      <div>
                        <h3 className="font-medium truncate" title={service.name}>
                          {service.name}
                        </h3>
                        <div className="text-sm text-gray-500 truncate" title={service.description || ""}>
                          {service.description || ""}
                        </div>
                        <div className="mt-1 flex items-center justify-between">
                          <Badge variant="outline">{serviceCategories.find(c => c.value === service.category)?.label || service.category}</Badge>
                          <span className="font-semibold">${service.price.toFixed(2)}</span>
                        </div>
                        {service.duration && (
                          <div className="text-sm text-gray-500 mt-1 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {service.duration} min
                          </div>
                        )}
                      </div>
                      <Button 
                        size="sm" 
                        className="mt-2 w-full"
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
            <div className="text-center py-8 border rounded-md">
              <p className="text-gray-500">No se encontraron servicios con los criterios de búsqueda.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}