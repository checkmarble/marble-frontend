import { type DataModelObject, type TableModel } from '@app-builder/models';
import { useFormatDateTime } from '@app-builder/utils/format';
import { parseUnknownData } from '@app-builder/utils/parse';
import { getRoute } from '@app-builder/utils/routes';
import { Link } from '@remix-run/react';
import clsx from 'clsx';
import { Fragment, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Icon } from 'ui-icons';

import { FormatData } from '../FormatData';
import { DataFields } from './DataVisualisation/DataFields';

const METADATA_FIELDS = ['object_id', 'valid_from'] as const;

function isMetadataKey(key: string): { match: true; parentKey: string } | { match: false } {
  const suffix = '.metadata';
  if (key.endsWith(suffix)) {
    return { match: true, parentKey: key.slice(0, -suffix.length) };
  }
  // Handle keys with surrounding quotes (some API formats)
  const trimmed = key.replace(/^["']|["']$/g, '');
  if (trimmed !== key && trimmed.endsWith(suffix)) {
    return { match: true, parentKey: trimmed.slice(0, -suffix.length) };
  }
  return { match: false };
}

function hasMetadataContent(data: ReturnType<typeof parseUnknownData> | undefined): boolean {
  if (!data) return false;
  if (data.type === 'DerivedData') return Object.keys(data.value).length > 0;
  return false;
}

function useParsedTriggerObject(triggerObject: Record<string, unknown> | null) {
  return useMemo(() => {
    if (!triggerObject) return null;

    const allParsed = R.pipe(triggerObject, R.omit(METADATA_FIELDS), R.mapValues(parseUnknownData));
    const metadataByField: Record<string, ReturnType<typeof parseUnknownData>> = {};
    const entries: [string, ReturnType<typeof parseUnknownData>][] = [];

    for (const [key, value] of R.entries(allParsed)) {
      const meta = isMetadataKey(key);
      if (meta.match) {
        // Always capture metadata regardless of type/content to prevent
        // them from appearing as separate entries in the field list
        metadataByField[meta.parentKey] = value;
      } else {
        entries.push([key, value]);
      }
    }

    return { entries, metadataByField };
  }, [triggerObject]);
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
  const { t } = useTranslation(['data']);
  const parsed = useParsedTriggerObject(object.data);
  const parsedEntries = parsed?.entries ?? [];
  const metadataByField = parsed?.metadataByField ?? {};
  const formatDateTime = useFormatDateTime();

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
        'border-grey-border rounded-md border': bordered,
        'bg-grey-background-light': !light,
      })}
    >
      <div className="text-m col-span-full flex items-center gap-2">
        <span className="bg-surface-card border-blue-58 text-blue-58 rounded-sm border px-2 py-1">ID: {objectId}</span>
        <span className="bg-surface-card border-grey-placeholder text-grey-secondary rounded-sm border px-2 py-1">
          {t('data:last_ingestion_at', {
            date: formatDateTime(object.metadata.validFrom, {
              dateStyle: 'short',
              timeStyle: 'short',
            }),
          })}
        </span>
      </div>
      <div className="text-s grid grid-cols-[max-content_1fr] gap-x-4 gap-y-2 break-all">
        {parsedEntries.map(([property, data]) => {
          const fieldType = dataModelTable?.fields?.find((f) => f.name === property)?.dataType;
          return (
            <Fragment key={property}>
              <span className="font-semibold">{property}</span>
              <div className="inline-flex items-center gap-2">
                {links[property] && withLinks ? (
                  <Link
                    className="text-purple-primary group flex items-center gap-1"
                    to={getRoute('/data/view/:tableName/:objectId', {
                      tableName: links[property],
                      objectId: data.value as string,
                    })}
                  >
                    <FormatData type={fieldType} data={data} mapHeight={200} />
                    <Icon
                      icon="visibility"
                      className="invisible size-4 opacity-0 transition-opacity group-hover:visible group-hover:opacity-100"
                    />
                  </Link>
                ) : (
                  <FormatData type={fieldType} data={data} mapHeight={200} />
                )}
              </div>
              {hasMetadataContent(metadataByField[property]) ? <FormatData data={metadataByField[property]} /> : null}
            </Fragment>
          );
        })}
      </div>
      <div>
        <DataFields table={tableName} object={object} preset="full" className="w-fit" />
      </div>
    </div>
  );
};
