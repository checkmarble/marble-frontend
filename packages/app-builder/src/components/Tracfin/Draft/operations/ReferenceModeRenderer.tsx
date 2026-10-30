import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Radio } from 'ui-design-system';
import { TextControl } from '../fields/TextControl';
import type { TracfinFieldControlProps } from '../fields/types';
import { stateOfValue } from '../model/field-values';
import { referenceTargetOf } from '../persons/person-kinds';
import { ReferenceFieldRenderer } from '../persons/pickers/ReferenceFieldRenderer';
import { effectiveMode, modeOfState, type ReferenceMode } from './text-reference-mode';

/**
 * Renderer of the four `text_or_reference` fields of an operation (issuer and beneficiary, and their
 * financial reference). The analyst chooses explicitly between a declared person / support and free
 * text. Free text is a text even when it is numeric: it is never converted into a reference. Switching
 * mode only changes what is shown: the stored value stays until the analyst sets the new one, which
 * replaces it on the same occurrence (see `effectiveMode`). The mode starts from the stored value.
 */
export function ReferenceModeRenderer(props: TracfinFieldControlProps) {
  const { t } = useTranslation(['tracfin']);
  const { field, label, occurrence } = props;
  const target = referenceTargetOf(field);
  const [chosen, setChosen] = useState<ReferenceMode | null>(null);
  const saved = occurrence.server ? stateOfValue(occurrence.server) : null;
  const shown = modeOfState(occurrence.state);
  // The mode the field was last seen in: emptying a picker (or the text) does not flip the radio.
  const [remembered, setRemembered] = useState<ReferenceMode | null>(null);
  if (shown !== null && shown !== remembered) setRemembered(shown);
  const mode = effectiveMode({ state: occurrence.state, saved, chosen, remembered });

  if (target === null) return <TextControl {...props} />;

  const switchTo = (next: ReferenceMode) => {
    if (next !== mode) setChosen(next);
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
      {shown !== null && shown !== mode ? (
        <span className="text-grey-secondary text-xs">{t('tracfin:draft.operations.mode.kept_until_set')}</span>
      ) : null}
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
