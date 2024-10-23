import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const VaccinationTable = () => {
  const vaccinations = [
    {
      type: "DP PUPPY",
      description: "Vacuna inicial para cachorros",
      applicationAge: "6-8 semanas",
      boosterNeeded: true,
      notes: "Primera vacuna en el esquema básico"
    },
    {
      type: "DHPPi (Quíntuple)",
      description: "Protege contra Distemper, Hepatitis, Parvovirus, Parainfluenza",
      applicationAge: "8-10 semanas",
      boosterNeeded: true,
      notes: "Requiere refuerzos"
    },
    {
      type: "Sextuple Quantum",
      description: "DHPPi + Coronavirus o Leptospira",
      applicationAge: "12-14 semanas",
      boosterNeeded: true,
      notes: "Protección ampliada"
    },
    {
      type: "Sextuple sin rabia",
      description: "Quantum sin componente antirrábico",
      applicationAge: "14-16 semanas",
      boosterNeeded: true,
      notes: "Opción para esquemas especiales"
    },
    {
      type: "Sextuple más rabia (DHPPi +RL)",
      description: "Protección completa incluyendo rabia",
      applicationAge: "16 semanas o más",
      boosterNeeded: true,
      notes: "Esquema completo"
    },
    {
      type: "Rabia (sola)",
      description: "Vacuna antirrábica individual",
      applicationAge: "16 semanas o más",
      boosterNeeded: false,
      notes: "Obligatoria por ley"
    },
    {
      type: "Bordetella",
      description: "Protege contra la tos de las perreras",
      applicationAge: "8 semanas o más",
      boosterNeeded: true,
      notes: "Recomendada para perros sociales"
    }
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Esquema de Vacunación para Cachorros</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Tipo de Vacuna</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Edad de Aplicación</TableHead>
              <TableHead>Requiere Refuerzo</TableHead>
              <TableHead>Notas</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vaccinations.map((vaccine) => (
              <TableRow key={vaccine.type}>
                <TableCell className="font-medium">{vaccine.type}</TableCell>
                <TableCell>{vaccine.description}</TableCell>
                <TableCell>{vaccine.applicationAge}</TableCell>
                <TableCell>{vaccine.boosterNeeded ? "Sí" : "No"}</TableCell>
                <TableCell>{vaccine.notes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default VaccinationTable;