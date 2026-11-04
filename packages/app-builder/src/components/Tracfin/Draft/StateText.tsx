import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import type { FieldValueState } from './model/field-values';

/** A value as a sentence fragment, for the comparison and the lists of pending edits. */
export function describeState(t: TFunction<['tracfin']>, state: FieldValueState | null): string {
  if (state === null) return t('tracfin:draft.value.none');
  switch (state.kind) {
    case 'empty':
      return t('tracfin:draft.value.none');
    case 'cleared':
      return t('tracfin:draft.value.cleared');
    case 'text':
      return state.text;
    case 'decimal':
      return state.decimal;
    case 'boolean':
      return state.boolean ? t('tracfin:draft.boolean.true') : t('tracfin:draft.boolean.false');
    case 'reference':
      return `${t('tracfin:draft.value.reference')} ${state.reference.block_id.slice(0, 8)}`;
  }
}

export function StateText({ state }: { state: FieldValueState | null }) {
  const { t } = useTranslation(['tracfin']);
  return <span className="font-mono text-xs break-all">{describeState(t, state)}</span>;
}
