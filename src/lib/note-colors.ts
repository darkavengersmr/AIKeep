export type NoteColor = {
  value: string | null;
  label: string;
  cardClass: string;
  swatchClass: string;
};

export const NOTE_COLORS: NoteColor[] = [
  {
    value: null,
    label: "Белый",
    cardClass: "bg-white",
    swatchClass: "border border-zinc-300 bg-white",
  },
  {
    value: "#fef3c7",
    label: "Жёлтый",
    cardClass: "bg-[#fef3c7]",
    swatchClass: "border border-zinc-300 bg-[#fef3c7]",
  },
  {
    value: "#d1fadf",
    label: "Зелёный",
    cardClass: "bg-[#d1fadf]",
    swatchClass: "border border-zinc-300 bg-[#d1fadf]",
  },
  {
    value: "#dbeafe",
    label: "Голубой",
    cardClass: "bg-[#dbeafe]",
    swatchClass: "border border-zinc-300 bg-[#dbeafe]",
  },
  {
    value: "#fce7f3",
    label: "Розовый",
    cardClass: "bg-[#fce7f3]",
    swatchClass: "border border-zinc-300 bg-[#fce7f3]",
  },
  {
    value: "#e5e7eb",
    label: "Серый",
    cardClass: "bg-[#e5e7eb]",
    swatchClass: "border border-zinc-300 bg-[#e5e7eb]",
  },
];

export function noteCardClass(color: string | null | undefined): string {
  const match = NOTE_COLORS.find((c) => c.value === color);
  return match?.cardClass ?? "bg-white";
}