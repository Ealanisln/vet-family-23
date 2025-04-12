// src/components/Inventory/CategoryFilter.tsx
import { CATEGORY_TRANSLATIONS } from "@/utils/category-translations";
import type { InventoryCategory } from "@/types/inventory";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CategoryFilterProps {
  value: InventoryCategory | "all_categories";
  onChange: (value: InventoryCategory | "all_categories") => void;
}

export const CategoryFilter = ({ value, onChange }: CategoryFilterProps) => (
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger className="min-w-[200px] w-full max-w-[220px] h-10">
      <SelectValue placeholder="Categoría" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all_categories">Todas las categorías</SelectItem>
      {Object.entries(CATEGORY_TRANSLATIONS).map(([key, value]) => (
        <SelectItem key={key} value={key}>
          {value}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);