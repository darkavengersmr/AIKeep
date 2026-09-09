import type { Note } from "@prisma/client";
import { updateNoteAction, deleteNoteAction } from "@/actions/notes";
import { NoteCard } from "./note-card";
import { EmptyState } from "@/components/ui/empty-state";

export function NoteGrid({ notes }: { notes: Note[] }) {
  if (notes.length === 0) {
    return (
      <EmptyState
        title="Заметок пока нет"
        description="Создайте первую заметку — она появится здесь."
      />
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