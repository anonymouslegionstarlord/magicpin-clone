export const THEME_STORAGE_KEY = "foodiehub-theme";
export const THEME_CHANGE_EVENT = "foodiehub-theme-change";

const LEGACY_THEME_STORAGE_KEY = "magicpin-theme";

export const getCurrentTheme = () =>
    document.documentElement.classList.contains("dark")
        ? "dark"
        : "light";

export const applyTheme = (
    theme,
    { notify = true, persist = true } = {}
) => {
    const normalizedTheme = theme === "dark" ? "dark" : "light";
    const isDark = normalizedTheme === "dark";

    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.dataset.theme = normalizedTheme;

    if (persist) {
        localStorage.setItem(THEME_STORAGE_KEY, normalizedTheme);
    }

    if (notify) {
        window.dispatchEvent(
            new CustomEvent(THEME_CHANGE_EVENT, {
                detail: { theme: normalizedTheme }
            })
        );
    }

    return normalizedTheme;
};

export const initializeTheme = () => {
    const storedTheme =
        localStorage.getItem(THEME_STORAGE_KEY) ||
        localStorage.getItem(LEGACY_THEME_STORAGE_KEY);

    const preferredTheme =
        storedTheme === "dark" ||
        (!storedTheme &&
            window.matchMedia("(prefers-color-scheme: dark)").matches)
            ? "dark"
            : "light";

    applyTheme(preferredTheme, { notify: false });
    localStorage.removeItem(LEGACY_THEME_STORAGE_KEY);

    return preferredTheme;
};

export const toggleTheme = () =>
    applyTheme(getCurrentTheme() === "dark" ? "light" : "dark");
