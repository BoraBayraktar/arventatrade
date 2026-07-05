"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Category = {
  id: string;
  slug: string;
  name: string;
};

type Props = {
  locale: string;
  categories: Category[];
  initialSearch?: string;
  initialCategory?: string;
  labels: {
    searchPlaceholder: string;
    allCategories: string;
    filter: string;
  };
};

export function CatalogFilters({
  locale,
  categories,
  initialSearch,
  initialCategory,
  labels,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState(initialSearch ?? "");
  const [category, setCategory] = useState(initialCategory ?? "all");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams();
    if (search.trim()) {
      params.set("search", search.trim());
    }

    if (category !== "all") {
      params.set("category", category);
    }

    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : `/${locale}/products`);
  }

  return (
    <form className="grid gap-3 md:grid-cols-[2fr_1fr_auto] md:items-center" onSubmit={handleSubmit}>
      <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={labels.searchPlaceholder} />
      <Select value={category} onValueChange={setCategory}>
        <SelectTrigger>
          <SelectValue placeholder={labels.allCategories} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{labels.allCategories}</SelectItem>
          {categories.map((item) => (
            <SelectItem key={item.id} value={item.slug}>
              {item.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button type="submit" variant="secondary">{labels.filter}</Button>
    </form>
  );
}
