import { useFormatLanguage } from '@app-builder/utils/format';
import { parseUnknownData } from '@app-builder/utils/parse';
import clsx from 'clsx';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Collapsible } from 'ui-design-system';

import { FormatData } from '../FormatData';
import { decisionsI18n } from './decisions-i18n';

function useParsedTriggerObject(triggerObject: Record<string, unknown>) {
  return React.useMemo(
    () => R.pipe(triggerObject, R.mapValues(parseUnknownData), R.entries()),
    [triggerObject],
  );
}

export function DecisionDetailTriggerObject({
  triggerObject,
}: {
  triggerObject: Record<string, unknown>;
}) {
  const { t } = useTranslation(decisionsI18n);
  const language = useFormatLanguage();

  const parsedTriggerObject = useParsedTriggerObject(triggerObject);

  return (
    <Collapsible.Container className="bg-grey-00">
      <Collapsible.Title>
        {t('decisions:trigger_object.type')}
      </Collapsible.Title>
      <Collapsible.Content>
        <div className="grid grid-cols-[max-content_1fr] gap-2 break-all">
          {parsedTriggerObject.map(([property, data]) => (
            <React.Fragment key={property}>
              <span className="font-semibold">{property}</span>
              <FormatData data={data} language={language} />
            </React.Fragment>
          ))}
        </div>
      </Collapsible.Content>
    </Collapsible.Container>
  );
}

export function CaseDetailTriggerObject({
  triggerObject,
  className,
}: {
  triggerObject: Record<string, unknown>;
  className?: string;
}) {
  const language = useFormatLanguage();

  const parsedTriggerObject = useParsedTriggerObject(triggerObject);

  return (
    <div
      className={clsx(
        'text-s text-grey-100 bg-grey-02 grid grid-cols-[max-content_1fr] gap-3 gap-x-4 break-all rounded-lg p-4',
        className,
      )}
    >
      {parsedTriggerObject.map(([property, data]) => (
        <React.Fragment key={property}>
          <span className="font-semibold">{property}</span>
          <FormatData data={data} language={language} />
        </React.Fragment>
      ))}
    </div>
  );
}
