import { type TableModel } from '@app-builder/models';
import { parseUnknownData } from '@app-builder/utils/parse';
import clsx from 'clsx';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Collapsible } from 'ui-design-system';

import { FormatData } from '../FormatData';
import { decisionsI18n } from './decisions-i18n';

function useParsedTriggerObject(triggerObject: Record<string, unknown>) {
  return React.useMemo(() => R.pipe(triggerObject, R.mapValues(parseUnknownData), R.entries()), [triggerObject]);
}

export function DecisionDetailTriggerObject({ triggerObject }: { triggerObject: Record<string, unknown> }) {
  const { t } = useTranslation(decisionsI18n);
  const parsedTriggerObject = useParsedTriggerObject(triggerObject);

  return (
    <Collapsible.Container className="bg-surface-card">
      <Collapsible.Title>{t('decisions:trigger_object.type')}</Collapsible.Title>
      <Collapsible.Content>
        <div className="grid grid-cols-[max-content_1fr] gap-2 break-all">
          {parsedTriggerObject.map(([property, data]) => (
            <React.Fragment key={property}>
              <span className="font-semibold">{property}</span>
              <FormatData data={data} />
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
  const parsedTriggerObject = useParsedTriggerObject(triggerObject);
  const dataModelTable = dataModel.find((table) => table.name === triggerObjectType);
  const links = R.pipe(
    dataModelTable?.linksToSingle ?? [],
    R.mapToObj((link) => {
      return [link.childFieldName, link.parentTableName];
    }),
  );

  return (
    <div
      className={clsx(
        'text-s text-grey-primary border-grey-border grid grid-cols-[max-content_1fr] gap-3 gap-x-4 break-all rounded-lg border bg-surface-card p-4',
        className,
      )}
    >
      {parsedTriggerObject.map(([property, data]) => (
        <React.Fragment key={property}>
          <span className="font-semibold">{property}</span>
          <div className="inline-flex items-center gap-2">
            {links[property] && !!data.value ? (
              <button
                className="text-purple-primary group flex items-center gap-1 text-left"
                onClick={() => onLinkClicked(links[property] as string, data.value as string)}
              >
                <FormatData data={data} />
              </button>
            ) : (
              <FormatData data={data} />
            )}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}
