"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { ChevronDown, ChevronRight, RefreshCw, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  getDeletedMedicalHistories,
  restoreMedicalHistory,
} from "@/app/actions/add-medical-record";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

interface MedicalHistoryRecord {
  id: string;
  petId: string;
  visitDate: Date;
  weightInKg: number | null;
  reasonForVisit: string;
  diagnosis: string;
  treatment: string;
  prescriptions: string[];
  notes: string | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface DeletedMedicalHistoriesViewProps {
  petId: string;
}

export function DeletedMedicalHistoriesView({
  petId,
}: DeletedMedicalHistoriesViewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [deletedRecords, setDeletedRecords] = useState<MedicalHistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalHistoryRecord | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  // Fetch deleted records when the section is expanded
  useEffect(() => {
    if (isOpen) {
      fetchDeletedRecords();
    }
  }, [isOpen, petId]);

  const fetchDeletedRecords = async () => {
    setIsLoading(true);
    try {
      const result = await getDeletedMedicalHistories(petId);
      if (result.success === false) {
        throw new Error(result.error);
      }
      setDeletedRecords(result.histories as MedicalHistoryRecord[]);
    } catch (error) {
      console.error("Error fetching deleted records:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los registros eliminados",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!selectedRecord) return;

    setRestoringId(selectedRecord.id);
    try {
      const result = await restoreMedicalHistory(selectedRecord.id);

      if (result.success === false) {
        throw new Error(result.error);
      }

      toast({
        title: "Éxito",
        description: "El historial médico ha sido restaurado correctamente.",
      });
      setRestoreDialogOpen(false);
      setSelectedRecord(null);
      // Refresh both deleted records and the main page
      await fetchDeletedRecords();
      router.refresh();
    } catch (error) {
      console.error("Error restoring medical history:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo restaurar el historial médico",
        variant: "destructive",
      });
    } finally {
      setRestoringId(null);
    }
  };

  const openRestoreDialog = (record: MedicalHistoryRecord) => {
    setSelectedRecord(record);
    setRestoreDialogOpen(true);
  };

  return (
    <>
      <Card className="shadow-lg border-0 bg-red-50/30 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <ChevronDown className="h-5 w-5 text-red-600" />
            ) : (
              <ChevronRight className="h-5 w-5 text-red-600" />
            )}
            <div className="p-2 bg-red-100 rounded-lg">
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>
            <CardTitle className="text-xl text-red-700">
              Registros Eliminados
              {deletedRecords.length > 0 && (
                <span className="ml-2 text-sm font-normal text-red-600">
                  ({deletedRecords.length})
                </span>
              )}
            </CardTitle>
          </div>
        </CardHeader>

        {isOpen && (
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 text-red-600 mx-auto mb-4 animate-spin" />
                <p className="text-gray-500">Cargando registros eliminados...</p>
              </div>
            ) : deletedRecords.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-200">
                      <TableHead className="font-semibold text-gray-700">Fecha</TableHead>
                      <TableHead className="font-semibold text-gray-700">Peso (kg)</TableHead>
                      <TableHead className="font-semibold text-gray-700">Razón</TableHead>
                      <TableHead className="font-semibold text-gray-700">Diagnóstico</TableHead>
                      <TableHead className="font-semibold text-gray-700">Eliminado</TableHead>
                      <TableHead className="font-semibold text-gray-700">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deletedRecords.map((record, index) => (
                      <TableRow key={record.id} className={index % 2 === 0 ? "bg-red-50/50" : ""}>
                        <TableCell className="font-medium">
                          {format(new Date(record.visitDate), "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell>
                          {record.weightInKg ? `${record.weightInKg} kg` : "N/A"}
                        </TableCell>
                        <TableCell>{record.reasonForVisit}</TableCell>
                        <TableCell>{record.diagnosis}</TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {record.deletedAt
                            ? format(new Date(record.deletedAt), "dd/MM/yyyy HH:mm")
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openRestoreDialog(record)}
                            disabled={restoringId === record.id}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            {restoringId === record.id ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Restaurando...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Restaurar
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <Trash2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No hay registros eliminados.</p>
                <p className="text-gray-400 text-sm mt-2">
                  Los registros eliminados aparecerán aquí y podrán ser restaurados.
                </p>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Restore Confirmation Dialog */}
      <AlertDialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Restaurar este registro?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedRecord && (
                <>
                  Vas a restaurar el historial médico del{" "}
                  <strong>
                    {format(new Date(selectedRecord.visitDate), "dd/MM/yyyy")}
                  </strong>
                  .
                  <br />
                  <br />
                  El registro volverá a aparecer en el historial médico principal.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!restoringId}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRestore}
              disabled={!!restoringId}
              className="bg-green-600 hover:bg-green-700 focus:ring-green-600"
            >
              {restoringId ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Restaurando...
                </>
              ) : (
                "Restaurar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
