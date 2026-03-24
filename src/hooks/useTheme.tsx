import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { invoke } from "@tauri-apps/api/core";

type Theme = "ametist" | "onyx";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>("ametist");

  useEffect(() => {
    (async () => {
      try {
        const result = await invoke<{ theme: Theme }>("get_settings");
        if (result.theme) {
          setTheme(result.theme);
        }
      } catch (err) {
        console.error("Не удалось получить тему из Rust:", err);
      }
    })();
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === "ametist" ? "onyx" : "ametist";
    setTheme(newTheme);

    try {
      await invoke("update_theme", { theme: newTheme });
    } catch (err) {
      console.error("Не удалось сохранить тему в Rust:", err);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div data-theme={theme}>{children}</div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return context;
};
