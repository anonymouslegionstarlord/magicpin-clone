import { useEffect, useState } from "react";
import {
    getCurrentTheme,
    THEME_CHANGE_EVENT,
    toggleTheme
} from "../utils/theme";

function ThemeToggle() {
    const [isDark, setIsDark] = useState(() =>
        getCurrentTheme() === "dark"
    );

    useEffect(() => {
        const updateTheme = (event) => {
            setIsDark(event.detail.theme === "dark");
        };

        window.addEventListener(THEME_CHANGE_EVENT, updateTheme);

        return () =>
            window.removeEventListener(THEME_CHANGE_EVENT, updateTheme);
    }, []);

    return (
        <button
            type="button"
            onClick={() => toggleTheme()}
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
