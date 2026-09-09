import Link from "next/link";

export type DashboardTab = "notes" | "my-lists" | "shared";

export const DASHBOARD_TABS: { id: DashboardTab; label: string; href: string }[] = [
  { id: "notes", label: "Заметки", href: "/" },
  { id: "my-lists", label: "Мои списки", href: "/?tab=my-lists" },
  { id: "shared", label: "Совместные", href: "/?tab=shared" },
];

export function parseDashboardTab(value: string | string[] | undefined): DashboardTab {
  const single = Array.isArray(value) ? value[0] : value;
  const match = DASHBOARD_TABS.find((tab) => tab.id === single);
  return match?.id ?? "notes";
}

export function DashboardTabs({ active }: { active: DashboardTab }) {
  return (
    <nav aria-label="Разделы" className="flex gap-1 overflow-x-auto rounded-lg border border-line bg-hover-bg p-1">
      {DASHBOARD_TABS.map((tab) => {
        const isActive = tab.id === active;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className={`whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "bg-surface text-foreground shadow-sm"
                : "text-muted hover:text-foreground"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}