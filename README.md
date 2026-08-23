# Utgifter

En delad utgiftsapp för två — logga gemensamma köp direkt när ni handlat: **plus → kategori → summa → sparat**. PWA:n går att lägga till på hemskärmen och stödjer ljust och mörkt tema.

## Kom igång

```bash
npm run dev
```

Öppna [http://localhost:3000](http://localhost:3000).

## Hur appen är byggd

- **Next.js (App Router) + TypeScript + Tailwind CSS v4.** Routes under `src/app` speglar flödet: `/` (hem), `/new` (kategori), `/new/[category]` (belopp + vem + info), `/summary` och `/summary/[category]`, samt `/settings` (tema + namn).
- **Data lagras lokalt** i `localStorage` via `src/lib/storage.ts`, bakom ett Promise-baserat gränssnitt som `src/lib/expenses-context.tsx` använder. Det gör det enkelt att byta ut mot Supabase senare — bara `storage.ts` behöver skrivas om, inga sidor behöver ändras. Just nu synkas alltså **inte** köp mellan telefoner.
- **Tema**: `next-themes` togglar `.dark`-klassen; ljusa/mörka färgtokens finns i `src/app/globals.css`. Växla i Inställningar.
- **PWA**: `src/app/manifest.ts` + `public/sw.js` (minimal app-shell-cache). Ikoner genereras med `node scripts/gen-icons.mjs` (kör om du ändrar `scripts/gen-icons.mjs`s SVG).

## Nästa steg

- Koppla på Supabase (byt ut `src/lib/storage.ts` mot Supabase-anrop) för att dela köp mellan er telefoner i realtid.
- Deploy på Vercel.
