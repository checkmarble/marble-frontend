import { useTranslation } from 'react-i18next';
import { Collapsible } from 'ui-design-system';

import { decisionsI18n } from './decisions-i18n';

export const TriggerObjectDetail = ({
  triggerObject,
}: {
  triggerObject: object;
}) => {
  const { t } = useTranslation(decisionsI18n);
  return (
    <Collapsible.Container className="bg-grey-00 h-fit flex-1">
      <Collapsible.Title>
        {t('decisions:trigger_object.type')}
      </Collapsible.Title>
      <Collapsible.Content>
        <div className="flex flex-col gap-2">
          {Object.entries(triggerObject).map(([property, value]) => (
            <div key={property}>
              <span className="font-semibold capitalize">{property}:</span>
              &nbsp;
              {value ?? '-'}
            </div>
          ))}
        </div>
      </Collapsible.Content>
    </Collapsible.Container>
  );
};
