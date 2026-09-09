export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-6 py-10 text-center">
      <h3 className="text-base font-semibold text-zinc-800">{title}</h3>
      <p className="mt-1 text-sm text-zinc-500">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}