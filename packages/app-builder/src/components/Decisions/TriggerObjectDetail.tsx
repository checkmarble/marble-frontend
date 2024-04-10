import { useFormatLanguage } from '@app-builder/utils/format';
import { parseUnknownData } from '@app-builder/utils/parse';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Collapsible } from 'ui-design-system';

import { FormatData } from '../FormatData';
import { decisionsI18n } from './decisions-i18n';

export const TriggerObjectDetail = ({
  triggerObject,
}: {
  triggerObject: Record<string, unknown>;
}) => {
  const { t } = useTranslation(decisionsI18n);
  const language = useFormatLanguage();

  const parsedTriggerObject = useMemo(
    () => R.pipe(triggerObject, R.mapValues(parseUnknownData), R.entries()),
    [triggerObject],
  );

  return (
    <Collapsible.Container className="bg-grey-00">
      <Collapsible.Title>
        {t('decisions:trigger_object.type')}
      </Collapsible.Title>
      <Collapsible.Content>
        <div className="flex flex-col gap-2">
          {parsedTriggerObject.map(([property, data]) => (
            <div key={property}>
              <span className="font-semibold capitalize">{property}:</span>
              &nbsp;
              <FormatData data={data} language={language} />
            </div>
          ))}
        </div>
      </Collapsible.Content>
    </Collapsible.Container>
  );
};
