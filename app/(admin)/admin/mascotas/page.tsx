import PetTable from "@/components/Clientes/PetTable";

export default function PetTablePage() {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl py-6 sm:py-10">
        <h1 className="text-2xl font-bold mb-5 text-center sm:text-left">Mascotas de la Veterinaria</h1>
        <div className="overflow-x-auto">
          <PetTable />
        </div>
      </div>
    </div>
  );
}