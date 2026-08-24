export function TagBadge({ tag }: { tag: string }) {
  return (
    <span className="flex-none truncate rounded-md bg-chip-bg px-1.5 py-0.5 text-[11px] font-semibold text-chip-foreground">
      #{tag}
    </span>
  );
}
