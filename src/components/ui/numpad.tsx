"use client";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "00", "0", "⌫"];

export function Numpad({ onPress }: { onPress: (key: string) => void }) {
  return (
    <div className="mb-3 grid grid-cols-3 gap-2">
      {KEYS.map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => onPress(key)}
          className="flex h-[58px] items-center justify-center rounded-2xl bg-surface-2 text-2xl text-foreground transition-opacity active:opacity-60"
        >
          {key}
        </button>
      ))}
    </div>
  );
}
