export function ProgressBar({ percent, colorClassName = "bg-accent" }: { percent: number; colorClassName?: string }) {
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-surface-2">
      <div className={`h-full rounded-full ${colorClassName}`} style={{ width: `${clamped}%` }} />
    </div>
  );
}
