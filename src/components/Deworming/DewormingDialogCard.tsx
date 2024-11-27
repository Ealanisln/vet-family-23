// src/components/Deworming/DewormingDialogCard.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PlusIcon } from 'lucide-react';
import { DewormingDialog } from './DewormingDialog';
import { PrismaDeworming } from './DewormingContainer';

interface DewormingDialogCardProps {
  petId: string;
  dewormings: PrismaDeworming[];
  type: 'INTERNAL' | 'EXTERNAL';
}

export function DewormingDialogCard({ petId, dewormings, type }: DewormingDialogCardProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <DewormingDialog petId={petId} type={type} />
      </div>

      {dewormings.length > 0 ? (
        <div className="overflow-x-auto -mx-4 sm:-mx-6">
          <div className="inline-block min-w-full align-middle">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Dosis</TableHead>
                  <TableHead>Próxima Aplicación</TableHead>
                  <TableHead>MVZ</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-[100px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dewormings.map((deworming) => (
                  <TableRow key={deworming.id}>
                    <TableCell>
                      {deworming.applicationDate.toLocaleDateString()}
                    </TableCell>
                    <TableCell>{deworming.productId || 'N/A'}</TableCell>
                    <TableCell>{deworming.dose}</TableCell>
                    <TableCell>
                      {deworming.nextApplication.toLocaleDateString()}
                    </TableCell>
                    <TableCell>{deworming.veterinarianName || 'N/A'}</TableCell>
                    <TableCell>{deworming.status}</TableCell>
                    <TableCell>
                      <DewormingDialog
                        petId={deworming.petId}
                        type={type}
                        existingRecord={deworming}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground text-center py-4">
          No hay registros de desparasitación {type === 'INTERNAL' ? 'interna' : 'externa'}.
        </p>
      )}
    </div>
  );
}