import Link from "next/link";

const TILE_CLASS =
  "flex h-[92px] items-end rounded-[20px] bg-surface p-3.5 text-left text-base font-semibold leading-tight text-foreground transition-transform active:scale-[0.98]";

type TileProps = { label: string } & ({ href: string; onClick?: never } | { href?: never; onClick: () => void });

export function Tile({ label, ...props }: TileProps) {
  if ("href" in props && props.href) {
    return (
      <Link href={props.href} className={TILE_CLASS}>
        {label}
      </Link>
    );
  }
  return (
    <button type="button" onClick={"onClick" in props ? props.onClick : undefined} className={TILE_CLASS}>
      {label}
    </button>
  );
}
