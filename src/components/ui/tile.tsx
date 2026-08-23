import Link from "next/link";

export function Tile({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex h-[92px] items-end rounded-[20px] bg-surface p-3.5 text-base font-semibold leading-tight text-foreground transition-transform active:scale-[0.98]"
    >
      {label}
    </Link>
  );
}
