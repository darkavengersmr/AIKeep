import { requireAuth } from "@/lib/auth";
import { listNotes } from "@/server/notes/service";
import { CreateNoteForm } from "@/components/notes/create-note-form";
import { NoteGrid } from "@/components/notes/note-grid";

export default async function NotesPage() {
  const user = await requireAuth();
  const notes = await listNotes(user.id);

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-semibold">Заметки</h1>

      <section className="mt-6" aria-label="Новая заметка">
        <CreateNoteForm />
      </section>

      <section className="mt-6" aria-label="Заметки">
        <NoteGrid notes={notes} />
      </section>
    </div>
  );
}