import { COOKIE_NAME } from '@app-builder/utils/preferences-cookies/config';
import { act, fireEvent, renderHook } from '@testing-library/react';
import Cookie from 'js-cookie';
import { type ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { type ThemePreference, ThemeProvider, useTheme } from './ThemeContext';

function stubOsColorScheme(dark: boolean) {
  const listeners = new Set<() => void>();
  const mediaQuery = {
    matches: dark,
    addEventListener: (_type: string, listener: () => void) => listeners.add(listener),
    removeEventListener: (_type: string, listener: () => void) => listeners.delete(listener),
  };
  vi.stubGlobal('matchMedia', () => mediaQuery);
  return {
    setDark(next: boolean) {
      mediaQuery.matches = next;
      act(() => listeners.forEach((listener) => listener()));
    },
  };
}

function renderTheme(preference: ThemePreference) {
  return renderHook(() => useTheme(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <ThemeProvider preference={preference}>{children}</ThemeProvider>
    ),
  });
}

const storedPreference = () => JSON.parse(Cookie.get(COOKIE_NAME) ?? '{}').theme;

afterEach(() => {
  vi.unstubAllGlobals();
  Cookie.remove(COOKIE_NAME);
});

describe('ThemeProvider', () => {
  it('follows the OS setting live for the system preference, and stores the preference, not the resolved theme', () => {
    const os = stubOsColorScheme(true);
    const { result } = renderTheme('system');

    expect(result.current.theme).toBe('dark');
    expect(result.current.themePreference).toBe('system');
    expect(storedPreference()).toBe('system');

    os.setDark(false);

    expect(result.current.theme).toBe('light');
    expect(storedPreference()).toBe('system');
  });

  it('ignores the OS setting for an explicit preference', () => {
    stubOsColorScheme(true);
    const { result } = renderTheme('light');

    expect(result.current.theme).toBe('light');
  });

  it('Ctrl+Shift+D switches from the theme in effect to the opposite explicit preference', () => {
    stubOsColorScheme(true);
    const { result } = renderTheme('system');

    act(() => {
      fireEvent.keyDown(window, { ctrlKey: true, shiftKey: true, key: 'D' });
    });

    expect(result.current.themePreference).toBe('light');
    expect(result.current.theme).toBe('light');
  });
});
