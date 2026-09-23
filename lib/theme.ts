export type Theme = "system" | "light" | "dark";

export const THEME_COOKIE = "theme";

/** Light unless the user has picked another theme (including "system"). */
export function parseTheme(value: string | undefined): Theme {
  return value === "dark" || value === "system" ? value : "light";
}
