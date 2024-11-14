import ClientsTable from "@/components/Clientes/ClientsTable";

export default function VeterinaryDashboard() {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl py-6 sm:py-10">
        <h1 className="text-2xl font-bold mb-5 text-center sm:text-left">Clientes de la Veterinaria</h1>
        <div className="overflow-x-auto">
          <ClientsTable />
        </div>
      </div>
    </div>
  );
}