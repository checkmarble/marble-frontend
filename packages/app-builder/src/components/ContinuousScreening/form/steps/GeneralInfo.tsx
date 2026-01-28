import { useTranslation } from 'react-i18next';
import { Input, TextArea } from 'ui-design-system';
import { CopyToClipboardChip } from '../../CopyToClipboardChip';
import { ContinuousScreeningConfigurationStepper } from '../../context/CreationStepper';

export const GeneralInfo = ({ stableId }: { stableId: string }) => {
  const { t } = useTranslation(['continuousScreening']);
  const name = ContinuousScreeningConfigurationStepper.select((state) => state.data.$name);
  const description = ContinuousScreeningConfigurationStepper.select((state) => state.data.$description);
  const mode = ContinuousScreeningConfigurationStepper.select((state) => state.__internals.mode);

  return (
    <div className="flex flex-col gap-v2-sm p-v2-md rounded-v2-md bg-surface-card border border-grey-border">
      <div className="grid grid-cols-[3fr_2fr] gap-v2-lg">
        <Input readOnly={mode === 'view'} value={name.value} onChange={(e) => (name.value = e.target.value)} />
        <div className="self-center">
          <CopyToClipboardChip value={stableId} className="self-center text-xxs" />
        </div>
      </div>
      <TextArea
        readOnly={mode === 'view'}
        value={description.value}
        placeholder={
          mode === 'view'
            ? t('continuousScreening:field.description.view_placeholder')
            : t('continuousScreening:field.description.placeholder')
        }
        onChange={(e) => (description.value = e.target.value)}
      />
    </div>
  );
};
