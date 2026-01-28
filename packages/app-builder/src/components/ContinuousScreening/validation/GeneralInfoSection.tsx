import { useTranslation } from 'react-i18next';
import { Collapsible } from 'ui-design-system';
import { type EditionValidationPanelProps } from '../EditionValidationPanel';

export const GeneralInfoSection = ({ updatedConfig, baseConfig }: EditionValidationPanelProps) => {
  const { t } = useTranslation(['continuousScreening']);
  const hasNameChanged = updatedConfig.name !== baseConfig.name;
  const hasDescriptionChanged = updatedConfig.description !== (baseConfig.description ?? '');

  return (
    <Collapsible.Container>
      <Collapsible.Title>{t('continuousScreening:edition.validation.generalInfo.title')}</Collapsible.Title>
      <Collapsible.Content>
        <div className="flex flex-col gap-v2-sm">
          <div className="grid grid-cols-[140px_1fr] gap-v2-sm items-center">
            <span>{t('continuousScreening:field.name.label')}</span>
            <div className="flex items-center gap-v2-sm">
              {hasNameChanged ? (
                <>
                  <span className="line-through text-grey-secondary">{baseConfig.name}</span>
                  <span>-&gt;</span>
                </>
              ) : null}
              <span>{updatedConfig.name}</span>
            </div>
          </div>
          <div className="grid grid-cols-[140px_1fr] gap-v2-sm items-center">
            <span>{t('continuousScreening:field.description.label')}</span>
            <div className="flex items-center gap-v2-sm">
              {hasDescriptionChanged ? (
                <>
                  <span className="line-through text-grey-secondary">
                    {!baseConfig.description ? (
                      <span className="italic">(Empty)</span>
                    ) : (
                      <span>{baseConfig.description}</span>
                    )}
                  </span>
                  <span>-&gt;</span>
                </>
              ) : null}
              <span>{updatedConfig.description}</span>
            </div>
          </div>
        </div>
      </Collapsible.Content>
    </Collapsible.Container>
  );
};
