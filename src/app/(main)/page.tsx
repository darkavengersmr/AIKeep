import { requireAuth } from "@/lib/auth";
import { listNotes } from "@/server/notes/service";
import { listLists } from "@/server/todos/service";
import { CreateNoteForm } from "@/components/notes/create-note-form";
import { NoteGrid } from "@/components/notes/note-grid";
import { CreateListForm } from "@/components/todos/create-list-form";
import { ListsSection } from "@/components/todos/lists-section";

export default async function DashboardPage() {
  const user = await requireAuth();
  const [notes, lists] = await Promise.all([listNotes(user.id), listLists(user.id)]);

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-semibold">Добро пожаловать, {user.displayName}!</h1>

      <section className="mt-6" aria-label="Новая заметка">
        <CreateNoteForm />
      </section>

      <section className="mt-6" aria-label="Заметки">
        <h2 className="mb-4 text-lg font-semibold">Заметки</h2>
        <NoteGrid notes={notes} />
      </section>

      <section className="mt-8" aria-label="Новый список">
        <h2 className="mb-4 text-lg font-semibold">Списки дел</h2>
        <CreateListForm />
      </section>

      <section className="mt-6" aria-label="Мои списки">
        <ListsSection lists={lists} />
      </section>
    </div>
  );
}