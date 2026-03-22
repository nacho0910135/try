import { Button } from "./Button";

export function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <div className="surface flex min-h-[220px] flex-col items-center justify-center gap-4 p-8 text-center">
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="max-w-xl text-sm text-ink/60">{description}</p>
      {actionLabel ? <Button variant="secondary" onClick={onAction}>{actionLabel}</Button> : null}
    </div>
  );
}

