import { type ThemePreference } from '@app-builder/utils/preferences-cookies/config';
import { setPreferencesCookie } from '@app-builder/utils/preferences-cookies/preferences-cookies-write';
import { createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { cn } from 'ui-design-system';

export type Theme = 'light' | 'dark';
export type { ThemePreference };

interface ThemeContextValue {
  /** The theme in effect: the preference, with 'system' resolved from the OS setting. */
  theme: Theme;
  themePreference: ThemePreference;
  setThemePreference: (preference: ThemePreference) => void;
}

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

const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';

/**
 * Inline `<head>` script for the 'system' preference. The server cannot know the OS setting and
 * renders the light theme, so this adds the `dark` class before the first paint.
 */
export const SYSTEM_THEME_SCRIPT = `if (window.matchMedia && window.matchMedia('${DARK_SCHEME_QUERY}').matches) document.documentElement.classList.add('dark');`;

function subscribeToColorScheme(onChange: () => void) {
  const mediaQuery = window.matchMedia?.(DARK_SCHEME_QUERY);
  mediaQuery?.addEventListener('change', onChange);
  return () => mediaQuery?.removeEventListener('change', onChange);
}

function getSystemPrefersDark() {
  return window.matchMedia?.(DARK_SCHEME_QUERY).matches ?? false;
}

// Matches the server render, so hydration sees the same theme before switching to the OS setting.
function getServerPrefersDark() {
  return false;
}

/**
 * Render `ThemedHtml` inside it to apply the `dark` class.
 *
 * ```tsx
 * <ThemeProvider preference={preferenceFromCookie}>
 *   <ThemedHtml>…</ThemedHtml>
 * </ThemeProvider>
 * ```
 */
export function ThemeProvider({ children, preference }: { children: React.ReactNode; preference: ThemePreference }) {
  const [themePreference, setThemePreference] = useState(preference);
  const systemPrefersDark = useSyncExternalStore(subscribeToColorScheme, getSystemPrefersDark, getServerPrefersDark);
  const theme: Theme = themePreference === 'system' ? (systemPrefersDark ? 'dark' : 'light') : themePreference;

  useEffect(() => {
    setPreferencesCookie('theme', themePreference);
  }, [themePreference]);

  // Keyboard shortcut (Ctrl+Shift+D) to toggle theme for QA testing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setThemePreference(theme === 'light' ? 'dark' : 'light');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [theme]);

  const value = useMemo(() => ({ theme, themePreference, setThemePreference }), [theme, themePreference]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** The document's `<html>`, carrying the `dark` class of the theme in effect. */
export function ThemedHtml({ className, ...props }: React.ComponentProps<'html'>) {
  const { theme } = useTheme();
  // SYSTEM_THEME_SCRIPT may add `dark` before hydration, while the server rendered it without.
  // Hydration leaves that mismatch in place, and React only rewrites `class` when the theme
  // changes, so write the class from the theme in effect once mounted.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);
  return <html suppressHydrationWarning className={cn(className, theme === 'dark' && 'dark')} {...props} />;
}
