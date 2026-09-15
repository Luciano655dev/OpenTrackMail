"use client";

import { Moon, Sun } from "lucide-react";

const storageKey = "opentrackmail-theme";

export function ThemeToggle({ className = "" }: { className?: string }) {
  function toggleTheme() {
    const root = document.documentElement;
    const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = nextTheme;
    root.style.colorScheme = nextTheme;
    localStorage.setItem(storageKey, nextTheme);
  }

  return (
    <button type="button" className={`theme-toggle ${className}`.trim()} onClick={toggleTheme} aria-label="Toggle color theme" title="Toggle color theme">
      <Moon className="theme-icon-moon" size={17} aria-hidden="true" />
      <Sun className="theme-icon-sun" size={17} aria-hidden="true" />
    </button>
  );
}
