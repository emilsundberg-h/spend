import Link from "next/link";

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="text-[15px] font-semibold text-muted">
      {label}
    </Link>
  );
}
