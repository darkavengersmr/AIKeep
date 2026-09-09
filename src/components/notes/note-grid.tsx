import type { Note } from "@prisma/client";
import { updateNoteAction, deleteNoteAction } from "@/actions/notes";
import { NoteCard } from "./note-card";

export function NoteGrid({ notes }: { notes: Note[] }) {
  if (notes.length === 0) {
    return (
      <p className="text-zinc-500">
        Пока нет заметок. Создайте первую заметку выше.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          updateAction={updateNoteAction}
          deleteAction={deleteNoteAction}
        />
      ))}
    </div>
  );
}