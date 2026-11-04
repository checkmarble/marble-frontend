import type { TracfinCodeOption } from '@app-builder/models/tracfin/catalog-index';
import type { PickerOption } from './OptionPicker';

/** « value — label », the way a TRACFIN code is read; an enumeration whose label is its value shows it once. */
export function toCodeOptions(codes: readonly TracfinCodeOption[]): PickerOption[] {
  return codes.map(({ value, label }) => ({ value, label: value === label ? value : `${value} — ${label}` }));
}
