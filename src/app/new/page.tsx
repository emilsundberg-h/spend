import { CATEGORIES } from "@/lib/categories";
import { BackLink } from "@/components/ui/back-link";
import { Tile } from "@/components/ui/tile";

export default function NewExpensePage() {
  return (
    <div className="flex min-h-screen flex-col px-6 pb-10 pt-8">
      <BackLink href="/" label="✕ Avbryt" />
      <h1 className="mb-4 mt-5 font-display text-[28px] font-extrabold tracking-tight text-foreground">
        Vad köpte ni?
      </h1>
      <div className="grid grid-cols-2 gap-2.5">
        {CATEGORIES.map((category) => (
          <Tile key={category} href={`/new/${encodeURIComponent(category)}`} label={category} />
        ))}
      </div>
    </div>
  );
}
