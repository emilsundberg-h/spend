import { useState } from "react";

/**
 * The month a screen is currently showing, defaulting to the real current
 * month on first render — with prev/next to browse other months. "Next"
 * past the current month is refused rather than showing a guaranteed-empty
 * future month.
 */
export function useMonthNav() {
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const now = new Date();
  const isCurrentMonth = month.getFullYear() === now.getFullYear() && month.getMonth() === now.getMonth();

  function goToPreviousMonth() {
    setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  }

  function goToNextMonth() {
    setMonth((m) => {
      if (m.getFullYear() === now.getFullYear() && m.getMonth() === now.getMonth()) return m;
      return new Date(m.getFullYear(), m.getMonth() + 1, 1);
    });
  }

  return { month, isCurrentMonth, goToPreviousMonth, goToNextMonth };
}
