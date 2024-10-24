// hooks/useClientTable.ts
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
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const { toast } = useToast();

  const handleDeleteUser = useCallback(async (userId: string) => {
    try {
      await deleteUser(userId);
      setData((prevData) => prevData.filter((user) => user.id !== userId));
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

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const users = await fetchUsers();
      setData(users);
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