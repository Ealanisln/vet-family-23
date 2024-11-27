// src/components/Deworming/DewormingContainer.tsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DewormingDialogCard } from './DewormingDialogCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { PrismaDeworming } from '@/types/pet';

interface DewormingContainerProps {
  petId: string;
  dewormings: PrismaDeworming[];
}

export function DewormingContainer({ petId, dewormings }: DewormingContainerProps) {
  const internalDewormings = dewormings.filter(d => d.type === 'INTERNAL');
  const externalDewormings = dewormings.filter(d => d.type === 'EXTERNAL');

  return (
    <Card className="mb-6 sm:mb-8">
      <CardHeader>
        <CardTitle>Control de Desparasitación</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="internal" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="internal">Desparasitación Interna</TabsTrigger>
            <TabsTrigger value="external">Desparasitación Externa</TabsTrigger>
          </TabsList>
          <TabsContent value="internal">
            <DewormingDialogCard
              petId={petId}
              dewormings={internalDewormings}
              type="INTERNAL"
            />
          </TabsContent>
          <TabsContent value="external">
            <DewormingDialogCard
              petId={petId}
              dewormings={externalDewormings}
              type="EXTERNAL"
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// En vez de definir la interfaz localmente, ahora importamos PrismaDeworming
export type { PrismaDeworming };