import { setPreferencesCookie } from '@app-builder/utils/preferences-cookies/preferences-cookies-write';
import Cookie from 'js-cookie';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const COOKIE_NAME = 'u-prefs';

const ThemeContext = createContext<ThemeContextValue | null>(null);
ThemeContext.displayName = 'Theme';

/**
 * Hook to access the theme context.
 * Must be used within ThemeProvider.
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

/**
 * Get the initial theme from cookie or default to 'light'.
 * This runs only on the client side.
 */
function getInitialTheme(): Theme {
  if (typeof window === 'undefined') {
    return 'light';
  }

  try {
    const raw = Cookie.get(COOKIE_NAME);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.theme === 'dark' || parsed.theme === 'light') {
        return parsed.theme;
      }
    }
  } catch {
    // ignore parse errors
  }

  return 'light';
}

/**
 * Apply the theme by adding/removing the 'dark' class on the document element.
 */
function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return;

  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

interface ThemeProviderProps {
  children: React.ReactNode;
  /** Optional initial theme. If not provided, reads from cookie or defaults to 'light'. */
  defaultTheme?: Theme;
}

/**
 * Provider component for theme context.
 * Handles theme state, persistence to cookie, and applying the dark class.
 *
 * Usage:
 * ```tsx
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 * ```
 */
export function ThemeProvider({ children, defaultTheme }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => defaultTheme ?? getInitialTheme());

  // Apply theme on mount and when it changes
  useEffect(() => {
    applyTheme(theme);
    setPreferencesCookie('theme', theme);
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  return <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>{children}</ThemeContext.Provider>;
}
