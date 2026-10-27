import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Radio } from 'ui-design-system';
import { TextControl } from '../fields/TextControl';
import type { TracfinFieldControlProps } from '../fields/types';
import { referenceTargetOf } from '../persons/person-kinds';
import { ReferenceFieldRenderer } from '../persons/pickers/ReferenceFieldRenderer';
import { effectiveMode, type ReferenceMode, switchNeedsClear } from './text-reference-mode';

/**
 * Renderer of the four `text_or_reference` fields of an operation (issuer and beneficiary, and their
 * financial reference). The analyst chooses explicitly between a declared person / support and free
 * text. Free text is a text even when it is numeric: it is never converted into a reference. Switching
 * mode empties the other representation first (`clear_field`, saved at once), then the new value is
 * set on the same occurrence.
 */
export function ReferenceModeRenderer(props: TracfinFieldControlProps) {
  const { t } = useTranslation(['tracfin']);
  const { field, label, occurrence, onClear, onCommit } = props;
  const target = referenceTargetOf(field);
  const [chosen, setChosen] = useState<ReferenceMode>('text');
  const mode = effectiveMode(occurrence.state, chosen);

  if (target === null) return <TextControl {...props} />;

  const switchTo = (next: ReferenceMode) => {
    if (next === mode) return;
    setChosen(next);
    if (switchNeedsClear(occurrence.state, next)) {
      onClear();
      onCommit();
    }
  };

  return (
    <div className="flex min-w-0 flex-col gap-xs" data-mode={mode}>
      <Radio.Root
        aria-label={t('tracfin:draft.operations.mode.label', { field: label })}
        size="small"
        value={mode}
        disabled={props.disabled}
        onValueChange={(value) => switchTo(value as ReferenceMode)}
        className="flex-row flex-wrap gap-md"
      >
        <Radio.Item value="reference">
          <span className="text-s">{t(`tracfin:draft.operations.mode.reference_${target.kind}`)}</span>
        </Radio.Item>
        <Radio.Item value="text">
          <span className="text-s">{t('tracfin:draft.operations.mode.text')}</span>
        </Radio.Item>
      </Radio.Root>
      {mode === 'reference' ? (
        <ReferenceFieldRenderer {...props} />
      ) : (
        <>
          <TextControl {...props} label={t('tracfin:draft.persons.picker.free_text_label', { field: label })} />
          <span className="text-grey-secondary text-xs">{t('tracfin:draft.operations.mode.text_note')}</span>
        </>
      )}
    </div>
  );
}
