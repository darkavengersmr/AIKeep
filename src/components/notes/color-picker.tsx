"use client";

import { useState } from "react";
import { NOTE_COLORS } from "@/lib/note-colors";

export function NoteColorPicker({
  name,
  value,
}: {
  name: string;
  value?: string | null;
}) {
  const [selected, setSelected] = useState(value ?? "");

  return (
    <div className="flex items-center gap-1.5" role="group" aria-label="Цвет заметки">
      <input type="hidden" name={name} value={selected} />
      {NOTE_COLORS.map((color) => {
        const swatchValue = color.value ?? "";
        const isSelected = selected === swatchValue;
        return (
          <button
            key={swatchValue}
            type="button"
            title={color.label}
            aria-label={color.label}
            aria-pressed={isSelected}
            onClick={() => setSelected(swatchValue)}
            className={`h-6 w-6 rounded-full ${color.swatchClass} ${isSelected ? "ring-2 ring-offset-1 ring-offset-surface ring-foreground" : ""}`}
          />
        );
      })}
    </div>
  );
}