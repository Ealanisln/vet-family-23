// app/pets/page.tsx
import PetsTable from "@/components/OldPets/PetsTable";

export default function PetsPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Pacientes (Archivo histórico)</h1>
      <PetsTable />
    </div>
  );
}