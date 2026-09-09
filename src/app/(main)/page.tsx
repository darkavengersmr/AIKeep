import { requireAuth } from "@/lib/auth";
import { listNotes } from "@/server/notes/service";
import { listLists } from "@/server/todos/service";
import { CreateNoteForm } from "@/components/notes/create-note-form";
import { NoteGrid } from "@/components/notes/note-grid";
import { CreateListForm } from "@/components/todos/create-list-form";
import { ListsSection } from "@/components/todos/lists-section";
import { DashboardTabs, parseDashboardTab } from "@/components/dashboard/dashboard-tabs";

export default async function DashboardPage(props: PageProps<"/">) {
  const user = await requireAuth();
  const searchParams = await props.searchParams;
  const activeTab = parseDashboardTab(searchParams.tab);

  const [notes, lists] = await Promise.all([listNotes(user.id), listLists(user.id)]);

  const myLists = lists.filter((list) => list.role === "OWNER");
  const sharedLists = lists.filter((list) => list.role !== "OWNER");

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-semibold">Добро пожаловать, {user.displayName}!</h1>

      <div className="mt-6">
        <DashboardTabs active={activeTab} />
      </div>

      {activeTab === "notes" && (
        <div className="mt-6 space-y-6">
          <section aria-label="Новая заметка">
            <CreateNoteForm />
          </section>
          <section aria-label="Заметки">
            <NoteGrid notes={notes} />
          </section>
        </div>
      )}

      {activeTab === "my-lists" && (
        <div className="mt-6 space-y-6">
          <section aria-label="Новый список">
            <CreateListForm />
          </section>
          <section aria-label="Мои списки">
            <ListsSection
              lists={myLists}
              emptyTitle="Своих списков пока нет"
              emptyDescription="Создайте первый список, и он появится здесь."
            />
          </section>
        </div>
      )}

      {activeTab === "shared" && (
        <div className="mt-6">
          <section aria-label="Совместные списки">
            <ListsSection
              lists={sharedLists}
              emptyTitle="Совместных списков пока нет"
              emptyDescription="Когда владелец списка добавит вас по email, список появится здесь."
            />
          </section>
        </div>
      )}
    </div>
  );
}