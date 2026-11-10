import {
  type RegisterableHotkey,
  type UseHotkeyDefinition,
  useFormatForDisplay,
  useHotkeys,
} from '@tanstack/react-hotkeys';
import { useCallback } from 'react';

export interface ScreeningReviewShortcut {
  hotkey: RegisterableHotkey;
  action: () => void;
  enabled?: boolean;
  allowInModal?: boolean;
  /** Leave the key to a focused button or link, such as Enter on Cancel. Hit cards don't count. */
  yieldToControls?: boolean;
}

type ShortcutHotkey = Extract<RegisterableHotkey, string | { key: string }>;

const shortcutScope = 'screening-review';

/**
 * Every iteration 1 key, in the design's groups. This is a fixed list, so it can show keys that
 * later tickets wire up. Add new keys here and register them with useScreeningReviewShortcuts.
 */
export const SCREENING_REVIEW_SHORTCUT_HELP = [
  {
    group: 'move',
    rows: [
      { name: 'next_previous_hit', hotkeys: ['J', 'K', 'ArrowDown', 'ArrowUp'] },
      { name: 'next_previous_object', hotkeys: ['Shift+J', 'Shift+K'] },
    ],
  },
  {
    group: 'decide',
    rows: [
      { name: 'hit_no_hit', hotkeys: ['M', 'N'] },
      { name: 'validate', hotkeys: ['Enter'] },
      { name: 'comment', hotkeys: ['C'] },
      { name: 'cancel_clear_close', hotkeys: ['Escape'] },
      { name: 'undo', hotkeys: ['U'] },
    ],
  },
  {
    group: 'select',
    rows: [
      { name: 'select_hit', hotkeys: ['X'] },
      { name: 'select_object_hits', hotkeys: ['A'] },
    ],
  },
  {
    group: 'list',
    // Brackets are reserved for physical key codes in hotkey strings.
    rows: [{ name: 'toggle_list', hotkeys: [{ key: '[' }] }],
  },
  {
    group: 'more_information',
    rows: [
      { name: 'customer_list_record_case', hotkeys: ['P', 'L', 'H'] },
      { name: 'open_case', hotkeys: ['O'] },
    ],
  },
] as const satisfies readonly {
  group: string;
  rows: readonly { name: string; hotkeys: readonly ShortcutHotkey[] }[];
}[];

/** Keep the beta dependency and all registration and formatting integration behind this seam. */
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
        shortcut.yieldToControls &&
        target instanceof Element &&
        target.closest('button, a[href], [role="button"]') &&
        !target.closest('[data-review-hit-card]')
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
      scope: shortcutScope,
      // The library skips Enter and Space on every focused button. The guard above already leaves them
      // to controls, so a focused hit card can still pass them on.
      ...(shortcut.yieldToControls ? { ignoreInputs: false } : {}),
    };
    definitions.push({ hotkey: shortcut.hotkey, callback, options });
    if (shortcut.hotkey === '?') {
      // The beta's letter fallback works for J/K, but Arabic ؟ needs an explicit punctuation alias.
      definitions.push({ hotkey: 'Shift+[Slash]', callback, options });
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

/** Display labels for one hotkey, with one entry per key cap. Follows the user's platform. */
export function useShortcutKeyLabels() {
  const format = useFormatForDisplay();
  return useCallback((hotkey: ShortcutHotkey) => format(hotkey, { parts: true }), [format]);
}

// A provider activates the page's scope and removes it with the page.
export { HotkeysProvider as ScreeningReviewShortcutProvider } from '@tanstack/react-hotkeys';
export type { ShortcutHotkey };
