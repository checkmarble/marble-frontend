import { type DataModelObject, type TableModel } from '@app-builder/models';
import { formatDateTime, useFormatLanguage } from '@app-builder/utils/format';
import { parseUnknownData } from '@app-builder/utils/parse';
import { getRoute } from '@app-builder/utils/routes';
import { Link } from '@remix-run/react';
import clsx from 'clsx';
import { Fragment, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Icon } from 'ui-icons';

import { FormatData } from '../FormatData';

const METADATA_FIELDS = ['object_id', 'valid_from'] as const;

function useParsedTriggerObject(triggerObject: Record<string, unknown> | null) {
  return useMemo(
    () =>
      triggerObject
        ? R.pipe(triggerObject, R.omit(METADATA_FIELDS), R.mapValues(parseUnknownData), R.entries())
        : null,
    [triggerObject],
  );
}

export type IngestedObjectDetailProps = {
  tableName: string;
  objectId: string;
  object: DataModelObject;
  dataModel: TableModel[];
  light?: boolean;
  bordered?: boolean;
  withLinks?: boolean;
};

export const IngestedObjectDetail = ({
  tableName,
  object,
  objectId,
  dataModel,
  light = false,
  bordered = true,
  withLinks = true,
}: IngestedObjectDetailProps) => {
  const parsedTriggerObject = useParsedTriggerObject(object.data) ?? [];
  const language = useFormatLanguage();
  const { t } = useTranslation(['data']);

  const dataModelTable = dataModel.find((table) => table.name === tableName);
  const links = R.pipe(
    dataModelTable?.linksToSingle ?? [],
    R.mapToObj((link) => {
      return [link.childFieldName, link.parentTableName];
    }),
  );

  return (
    <div
      className={clsx('flex flex-col gap-4 p-4', {
        'border-grey-90 rounded-md border': bordered,
        'bg-grey-98': !light,
      })}
    >
      <div className="text-m col-span-full flex items-center gap-2">
        <span className="bg-grey-100 border-blue-58 text-blue-58 rounded border px-2 py-1">
          ID: {objectId}
        </span>
        <span className="bg-grey-100 border-grey-50 text-grey-50 rounded border px-2 py-1">
          {t('data:viewer.detail.last_ingestion_at')}:{' '}
          {formatDateTime(object.metadata.validFrom, {
            language,
          })}
        </span>
      </div>
      <div className="text-s grid grid-cols-[max-content,_1fr] gap-x-4 gap-y-2 break-all">
        {parsedTriggerObject.map(([property, data]) => (
          <Fragment key={property}>
            <span className="font-semibold">{property}</span>
            <div className="inline-flex items-center gap-2">
              {links[property] && withLinks ? (
                <Link
                  className="text-purple-65 group flex items-center gap-1"
                  to={getRoute('/data/view/:tableName/:objectId', {
                    tableName: links[property],
                    objectId: data.value as string,
                  })}
                >
                  <FormatData data={data} language={language} />
                  <Icon
                    icon="visibility"
                    className="invisible size-4 opacity-0 transition-opacity group-hover:visible group-hover:opacity-100"
                  />
                </Link>
              ) : (
                <FormatData data={data} language={language} />
              )}
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
};
