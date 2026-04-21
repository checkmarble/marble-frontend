import { DataModelObjectValue, type TableModel } from '@app-builder/models';
import { parseUnknownData } from '@app-builder/utils/parse';
import clsx from 'clsx';
import { Fragment, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Collapsible } from 'ui-design-system';
import { DataFields } from '../Data/DataVisualisation/DataFields';
import { FormatData } from '../FormatData';
import { decisionsI18n } from './decisions-i18n';

function useParsedTriggerObject(triggerObject: Record<string, unknown>) {
  return useMemo(() => R.pipe(triggerObject, R.mapValues(parseUnknownData), R.entries()), [triggerObject]);
}

export function DecisionDetailTriggerObject({
  table,
  triggerObject,
}: {
  table: string;
  triggerObject: Record<string, DataModelObjectValue>;
}) {
  const { t } = useTranslation(decisionsI18n);
  // const parsedTriggerObject = useParsedTriggerObject(triggerObject);

  return (
    <Collapsible.Container className="bg-surface-card">
      <Collapsible.Title>{t('decisions:trigger_object.type')}</Collapsible.Title>
      <Collapsible.Content>
        <DataFields
          table={table}
          object={{ data: triggerObject, metadata: { validFrom: (triggerObject['updated_at'] as string) ?? '' } }}
          options={{ mapHeight: 200 }}
        />
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
        'text-s text-grey-primary border-grey-border grid grid-cols-[max-content_1fr] items-baseline gap-3 gap-x-4 break-all rounded-lg border bg-surface-card p-4',
        className,
      )}
    >
      {parsedTriggerObject.map(([property, data]) => {
        const fieldType = dataModelTable?.fields?.find((f) => f.name === property)?.dataType;
        return (
          <Fragment key={property}>
            <span className="font-semibold">{property}</span>
            <div className="inline-flex items-center gap-2">
              {links[property] && !!data.value ? (
                <button
                  className="text-purple-primary group flex items-center gap-1 text-left"
                  onClick={() => onLinkClicked(links[property] as string, data.value as string)}
                >
                  <FormatData type={fieldType} data={data} mapHeight={200} />
                </button>
              ) : (
                <FormatData type={fieldType} data={data} mapHeight={200} />
              )}
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}
