"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input, Label } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

/** Lista editable de textos simples (características de un programa, por ejemplo). */
export function StringList({
  name,
  label,
  defaultValue = [],
}: {
  name: string;
  label: string;
  defaultValue?: string[];
}) {
  const [items, setItems] = useState<string[]>(defaultValue.length ? defaultValue : [""]);

  return (
    <div>
      <Label>{label}</Label>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex gap-2">
            <Input
              name={`${name}[]`}
              value={item}
              maxLength={200}
              onChange={(e) => setItems((prev) => prev.map((v, i) => (i === index ? e.target.value : v)))}
              aria-label={`${label} ${index + 1}`}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label={`Eliminar ${label} ${index + 1}`}
              onClick={() => setItems((prev) => (prev.length === 1 ? [""] : prev.filter((_, i) => i !== index)))}
            >
              <Trash2 className="size-4" strokeWidth={1.5} />
            </Button>
          </li>
        ))}
      </ul>
      <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={() => setItems((prev) => [...prev, ""])}>
        <Plus className="size-4" strokeWidth={1.5} /> Agregar
      </Button>
    </div>
  );
}
