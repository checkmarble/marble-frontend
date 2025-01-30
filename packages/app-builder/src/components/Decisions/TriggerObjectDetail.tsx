import { type TableModel } from '@app-builder/models';
import { useFormatLanguage } from '@app-builder/utils/format';
import { parseUnknownData } from '@app-builder/utils/parse';
import { getRoute } from '@app-builder/utils/routes';
import { Link } from '@remix-run/react';
import clsx from 'clsx';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Collapsible } from 'ui-design-system';
import { Icon } from 'ui-icons';

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
    <Collapsible.Container className="bg-grey-100">
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
  dataModel,
  triggerObject,
  triggerObjectType,
  className,
  onLinkClicked,
}: {
  dataModel: TableModel[];
  triggerObject: Record<string, unknown>;
  triggerObjectType: string;
  className?: string;
  onLinkClicked: (tableName: string, objectId: string) => void;
}) {
  const language = useFormatLanguage();
  const parsedTriggerObject = useParsedTriggerObject(triggerObject);
  const dataModelTable = dataModel.find(
    (table) => table.name === triggerObjectType,
  );
  const links = R.pipe(
    dataModelTable?.linksToSingle ?? [],
    R.mapToObj((link) => {
      return [link.childFieldName, link.parentTableName];
    }),
  );

  return (
    <div
      className={clsx(
        'text-s text-grey-00 bg-grey-98 grid grid-cols-[max-content_1fr] gap-3 gap-x-4 break-all rounded-lg p-4',
        className,
      )}
    >
      {parsedTriggerObject.map(([property, data]) => (
        <React.Fragment key={property}>
          <span className="font-semibold">{property}</span>
          <div className="inline-flex items-center gap-2">
            {links[property] && data.value !== null ? (
              <button
                className="text-purple-65 group flex items-center gap-1 text-left"
                onClick={() =>
                  onLinkClicked(links[property] as string, data.value as string)
                }
              >
                <FormatData data={data} language={language} />
              </button>
            ) : (
              <FormatData data={data} language={language} />
            )}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}
