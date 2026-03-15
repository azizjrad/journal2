import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CategoryInterface } from "@/lib/db";

interface CategoryFilterProps {
  categories: CategoryInterface[];
  value: string;
  onChange: (value: string) => void;
}

export function CategoryFilter({
  categories,
  value,
  onChange,
}: CategoryFilterProps) {
  // Use 'all' as the value for the "All Categories" option
  return (
    <Select
      value={value || "all"}
      onValueChange={(val) => onChange(val === "all" ? "" : val)}
    >
      <SelectTrigger className="w-full sm:w-48 bg-white/10 border-white/20 text-white">
        <SelectValue placeholder="Filter by category" />
      </SelectTrigger>
      <SelectContent className="bg-white/10 backdrop-blur-xl border-slate-700 shadow-xl">
        <SelectItem value="all" className="text-slate-200">
          All Categories
        </SelectItem>
        {categories.map((cat) => (
          <SelectItem
            key={cat.id || cat._id}
            value={cat.name_en}
            className="text-slate-200"
          >
            {cat.name_en}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
