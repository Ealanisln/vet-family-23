import { useState, useCallback } from 'react';
import { 
  ColumnFiltersState, 
  SortingState, 
  VisibilityState,
  PaginationState,
} from "@tanstack/react-table";
import { useToast } from "@/components/ui/use-toast";
import { User } from '../types/user';
import { deleteUser, fetchUsers } from '../services/user';

export function useClientTable() {
  // Inicializamos el estado de ordenamiento con firstName ascendente
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "firstName",
      desc: false
    }
  ]);

  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const { toast } = useToast();

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const users = await fetchUsers();
      // Ordenar los usuarios por nombre antes de establecerlos
      const sortedUsers = [...users].sort((a, b) => {
        const nameA = `${a.firstName || ''} ${a.lastName || ''}`.trim().toLowerCase();
        const nameB = `${b.firstName || ''} ${b.lastName || ''}`.trim().toLowerCase();
        return nameA.localeCompare(nameB); // Orden alfabético ascendente
      });
      setData(sortedUsers);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch users. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleDeleteUser = useCallback(async (userId: string) => {
    try {
      await deleteUser(userId);
      setData((prevData) => {
        const updatedData = prevData.filter((user) => user.id !== userId);
        // Mantener el orden alfabético después de eliminar
        return [...updatedData].sort((a, b) => {
          const nameA = `${a.firstName || ''} ${a.lastName || ''}`.trim().toLowerCase();
          const nameB = `${b.firstName || ''} ${b.lastName || ''}`.trim().toLowerCase();
          return nameA.localeCompare(nameB);
        });
      });
      toast({
        title: "Éxito",
        description: "Usuario eliminado exitosamente.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al eliminar el usuario.",
        variant: "destructive",
      });
    }
  }, [toast]);

  return {
    data,
    loading,
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    columnVisibility,
    setColumnVisibility,
    rowSelection,
    setRowSelection,
    pagination,
    setPagination,
    handleDeleteUser,
    loadUsers,
  };
}