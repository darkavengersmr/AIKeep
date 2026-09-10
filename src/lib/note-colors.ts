export type NoteColor = {
  value: string | null;
  label: string;
  cardClass: string;
  cardHoverClass: string;
  swatchClass: string;
};

export const NOTE_COLORS: NoteColor[] = [
  {
    value: null,
    label: "Белый",
    cardClass: "bg-surface",
    cardHoverClass: "hover:bg-hover-bg",
    swatchClass: "border border-line-strong bg-surface",
  },
  {
    value: "#fff4b8",
    label: "Жёлтый",
    cardClass: "bg-note-yellow",
    cardHoverClass: "hover:bg-note-yellow-hover",
    swatchClass: "border border-line-strong bg-note-yellow",
  },
  {
    value: "#d7f5d0",
    label: "Зелёный",
    cardClass: "bg-note-green",
    cardHoverClass: "hover:bg-note-green-hover",
    swatchClass: "border border-line-strong bg-note-green",
  },
  {
    value: "#d9f0ff",
    label: "Голубой",
    cardClass: "bg-note-blue",
    cardHoverClass: "hover:bg-note-blue-hover",
    swatchClass: "border border-line-strong bg-note-blue",
  },
  {
    value: "#e9d7ff",
    label: "Фиолетовый",
    cardClass: "bg-note-purple",
    cardHoverClass: "hover:bg-note-purple-hover",
    swatchClass: "border border-line-strong bg-note-purple",
  },
  {
    value: "#ffd9e2",
    label: "Розовый",
    cardClass: "bg-note-pink",
    cardHoverClass: "hover:bg-note-pink-hover",
    swatchClass: "border border-line-strong bg-note-pink",
  },
  {
    value: "#ffe0b2",
    label: "Оранжевый",
    cardClass: "bg-note-orange",
    cardHoverClass: "hover:bg-note-orange-hover",
    swatchClass: "border border-line-strong bg-note-orange",
  },
];

export function noteCardClass(color: string | null | undefined): string {
  const match = NOTE_COLORS.find((c) => c.value === color);
  return match?.cardClass ?? "bg-surface";
}

export function noteCardHoverClass(color: string | null | undefined): string {
  const match = NOTE_COLORS.find((c) => c.value === color);
  return match?.cardHoverClass ?? "hover:bg-hover-bg";
}