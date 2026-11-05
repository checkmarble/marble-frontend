import {
  formatForDisplay,
  type RegisterableHotkey,
  type UseHotkeyDefinition,
  useHotkeyRegistrations,
  useHotkeys,
} from '@tanstack/react-hotkeys';

export interface ScreeningReviewShortcut {
  hotkey: RegisterableHotkey;
  name: string;
  group: string;
  action: () => void;
  enabled?: boolean;
  allowInModal?: boolean;
}

const shortcutScope = 'screening-review';

/** Keep the beta dependency and all registration/help integration behind this seam. */
export function useScreeningReviewShortcuts(shortcuts: readonly ScreeningReviewShortcut[]) {
  const definitions: UseHotkeyDefinition[] = [];
  for (const shortcut of shortcuts) {
    const callback = (event: KeyboardEvent) => {
      const target = event.target;
      if (event.isComposing || event.defaultPrevented) return;
      if (
        target instanceof Element &&
        target.closest(
          'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"], [role="combobox"], [role="listbox"]',
        )
      )
        return;
      if (
        !shortcut.allowInModal &&
        document.querySelector(
          '[role="dialog"][aria-modal="true"], [role="alertdialog"][aria-modal="true"], dialog[open]',
        )
      )
        return;
      event.preventDefault();
      shortcut.action();
    };
    const options = {
      enabled: shortcut.enabled ?? true,
      meta: { name: shortcut.name, group: shortcut.group },
      scope: shortcutScope,
    };
    definitions.push({ hotkey: shortcut.hotkey, callback, options });
    if (shortcut.hotkey === '?') {
      // The beta's letter fallback works for J/K, but Arabic ؟ needs an explicit
      // punctuation alias. The labelled logical registration owns the help entry.
      definitions.push({
        hotkey: 'Shift+[Slash]',
        callback,
        options: { ...options, meta: undefined },
      });
    }
  }
  useHotkeys(definitions, {
    // Guard before cancelling the event, including dialogs opened outside this page.
    preventDefault: false,
    stopPropagation: false,
    ignoreInputs: true,
    ignoreDefaultPrevented: true,
  });
}

export function useScreeningReviewShortcutList() {
  return useHotkeyRegistrations()
    .filter((registration) => registration.options.scope === shortcutScope && registration.options.meta?.name)
    .map((registration) => ({
      id: registration.id,
      name: registration.options.meta?.name ?? '',
      group: registration.options.meta?.group ?? '',
      keys: formatForDisplay(registration.hotkey),
    }));
}

// A provider activates the page's scope and removes it with the page.
export { HotkeysProvider as ScreeningReviewShortcutProvider } from '@tanstack/react-hotkeys';
