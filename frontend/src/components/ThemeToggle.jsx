import { useState } from "react";

const THEME_STORAGE_KEY = "magicpin-theme";

function ThemeToggle() {
    const [isDark, setIsDark] = useState(() =>
        document.documentElement.classList.contains("dark")
    );

    const toggleTheme = () => {
        const nextIsDark = !isDark;
        const nextTheme = nextIsDark
            ? "dark"
            : "light";

        document.documentElement.classList.toggle(
            "dark",
            nextIsDark
        );
        document.documentElement.dataset.theme = nextTheme;
        localStorage.setItem(
            THEME_STORAGE_KEY,
            nextTheme
        );
        setIsDark(nextIsDark);
    };

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label={
                isDark
                    ? "Switch to light mode"
                    : "Switch to dark mode"
            }
            aria-pressed={isDark}
            title={
                isDark
                    ? "Switch to light mode"
                    : "Switch to dark mode"
            }
            className="glass-button flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg text-gray-700"
        >
            <span aria-hidden="true">
                {isDark ? "☀️" : "🌙"}
            </span>
        </button>
    );
}

export default ThemeToggle;
