import { useTranslation } from 'react-i18next';
import { Radio } from 'ui-design-system';
import type { TracfinFieldControlProps } from './types';

/** Three states: not filled in, yes, no. Going back to « non renseigné » empties the field on purpose. */
export function BooleanControl({ label, occurrence, disabled, onSet, onClear, onCommit }: TracfinFieldControlProps) {
  const { t } = useTranslation(['tracfin']);
  const { state } = occurrence;
  const value = state.kind === 'boolean' ? (state.boolean ? 'true' : 'false') : 'unset';

  return (
    <Radio.Root
      aria-label={label}
      orientation="horizontal"
      size="small"
      disabled={disabled}
      value={value}
      className="flex-row flex-wrap gap-md"
      onValueChange={(next) => {
        if (next === 'unset') onClear();
        else onSet({ kind: 'boolean', boolean: next === 'true' });
        onCommit();
      }}
    >
      <Radio.Item value="unset">
        <span className="text-s">{t('tracfin:draft.boolean.unset')}</span>
      </Radio.Item>
      <Radio.Item value="true">
        <span className="text-s">{t('tracfin:draft.boolean.true')}</span>
      </Radio.Item>
      <Radio.Item value="false">
        <span className="text-s">{t('tracfin:draft.boolean.false')}</span>
      </Radio.Item>
    </Radio.Root>
  );
}
