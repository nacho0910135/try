export function LoadingState({ label = "Cargando..." }) {
  return (
    <div className="surface flex min-h-[220px] items-center justify-center p-8 text-sm font-medium text-ink/60">
      {label}
    </div>
  );
}

