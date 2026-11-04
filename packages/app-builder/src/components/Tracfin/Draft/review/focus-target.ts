import type { TracfinSectionId } from '../model/sections';

/**
 * Where a diagnostic (or a refused export) points in the draft: the section to open and, inside it,
 * the block, the field and the occurrence to bring on screen. Every part but the section may be missing.
 */
export type TracfinFocusTarget = {
  section: TracfinSectionId;
  blockId: string | null;
  fieldId: string | null;
  /** The occurrence (`value_id`) of the field. */
  valueId: string | null;
  /** For an attribute of simple content: the occurrence of the owner field it belongs to. */
  parentValueId: string | null;
};

/**
 * The attributes the draft editor puts on its DOM so that a target can be found again:
 * - `data-tracfin-block` on the editor of a block (its `id`);
 * - `data-tracfin-field-block` + `data-tracfin-field` (+ `data-tracfin-parent-value` for an attribute of simple content) on a field;
 * - `data-tracfin-value` on the row of an occurrence.
 */
export const focusAttributes = {
  block: 'data-tracfin-block',
  fieldBlock: 'data-tracfin-field-block',
  field: 'data-tracfin-field',
  parentValue: 'data-tracfin-parent-value',
  value: 'data-tracfin-value',
  highlight: 'data-tracfin-highlight',
} as const;

export type FocusMatch = { element: HTMLElement; precision: 'value' | 'field' | 'block' };

const all = (container: ParentNode, attribute: string): HTMLElement[] =>
  Array.from(container.querySelectorAll<HTMLElement>(`[${attribute}]`));

/**
 * The element a target designates, as precisely as the screen allows: the occurrence, else the field,
 * else the block (a diagnostic can name a block that has no row for the field: a child block that does
 * not exist yet, the piece itself...). Values are compared in code, never put in a selector.
 */
export function findFocusElement(container: ParentNode, target: TracfinFocusTarget): FocusMatch | null {
  if (target.blockId && target.fieldId) {
    const fields = all(container, focusAttributes.field).filter(
      (element) =>
        element.getAttribute(focusAttributes.fieldBlock) === target.blockId &&
        element.getAttribute(focusAttributes.field) === target.fieldId,
    );
    const field =
      (target.parentValueId
        ? fields.find((element) => element.getAttribute(focusAttributes.parentValue) === target.parentValueId)
        : undefined) ?? fields[0];
    if (field) {
      if (target.valueId) {
        const value = all(field, focusAttributes.value).find(
          (element) => element.getAttribute(focusAttributes.value) === target.valueId,
        );
        if (value) return { element: value, precision: 'value' };
      }
      return { element: field, precision: 'field' };
    }
  }
  if (target.blockId) {
    const block = all(container, focusAttributes.block).find(
      (element) => element.getAttribute(focusAttributes.block) === target.blockId,
    );
    if (block) return { element: block, precision: 'block' };
  }
  return null;
}

const FOCUSABLE =
  'input:not([disabled]):not([type="hidden"]), textarea:not([disabled]), select:not([disabled]), [role="combobox"]:not([disabled]), [role="radio"]:not([disabled]), button:not([disabled])';

/** Puts the keyboard focus on the first control of the element (on the element itself when it holds none). */
export function focusFirstControl(element: HTMLElement): HTMLElement {
  const control = element.querySelector<HTMLElement>(FOCUSABLE);
  const target = control ?? element;
  if (!control && !target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
  return target;
}

export const HIGHLIGHT_MS = 4000;

/** Marks the element for a few seconds (the editor styles `data-tracfin-highlight`). Returns a function that clears it at once. */
export function highlight(element: HTMLElement, duration = HIGHLIGHT_MS): () => void {
  element.setAttribute(focusAttributes.highlight, 'true');
  const timer = setTimeout(() => element.removeAttribute(focusAttributes.highlight), duration);
  return () => {
    clearTimeout(timer);
    element.removeAttribute(focusAttributes.highlight);
  };
}
