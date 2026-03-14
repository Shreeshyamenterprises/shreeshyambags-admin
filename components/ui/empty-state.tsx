import Link from "next/link";

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center">
      <h3 className="text-lg font-semibold">{title}</h3>

      {description && (
        <p className="mt-2 text-sm text-zinc-500">{description}</p>
      )}

      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-4 rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
