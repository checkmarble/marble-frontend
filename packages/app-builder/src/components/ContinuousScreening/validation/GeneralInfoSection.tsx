import { useTranslation } from 'react-i18next';
import { Collapsible } from 'ui-design-system';
import { type EditionValidationPanelProps } from '../EditionValidationPanel';

export const GeneralInfoSection = ({ updatedConfig, baseConfig }: EditionValidationPanelProps) => {
  const { t } = useTranslation(['continuousScreening']);
  const hasNameChanged = updatedConfig.name !== baseConfig.name;
  const hasDescriptionChanged = updatedConfig.description !== (baseConfig.description ?? '');

  if (!hasNameChanged && !hasDescriptionChanged) return null;

  return (
    <Collapsible.Container>
      <Collapsible.Title>{t('continuousScreening:edition.validation.generalInfo.title')}</Collapsible.Title>
      <Collapsible.Content>
        <div className="flex flex-col gap-v2-sm">
          <div className="flex items-center gap-v2-sm">
            <span>{t('continuousScreening:field.name.label')}</span>
            <span>{updatedConfig.name}</span>
            {hasNameChanged ? <span className="line-through text-grey-secondary">{baseConfig.name}</span> : null}
          </div>
          {hasDescriptionChanged ? (
            <div className="flex items-center gap-v2-sm">
              <span>{t('continuousScreening:field.description.label')}</span>
              <span>{updatedConfig.description}</span>
              <span className="line-through text-grey-secondary">{baseConfig.description}</span>
            </div>
          ) : null}
        </div>
      </Collapsible.Content>
    </Collapsible.Container>
  );
};
