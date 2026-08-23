export const CATEGORIES = [
  "Mat/matvaror",
  "Restaurang & fika",
  "Transport",
  "Hem & möbler",
  "Nöje",
  "Hälsa",
  "Kläder",
  "Prenumerationer",
  "Övrigt",
] as const;

export type Category = (typeof CATEGORIES)[number];
