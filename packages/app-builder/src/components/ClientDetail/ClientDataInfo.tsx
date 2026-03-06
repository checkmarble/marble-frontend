import { DataModelObject, TableModelWithOptions } from '@app-builder/models';
import { parseUnknownData } from '@app-builder/utils/parse';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Button, cn } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { FormatData } from '../FormatData';

export type ClientDataInfoProps = {
  objectDetails: DataModelObject;
  table: TableModelWithOptions;
};

export const ClientDataInfo = ({ objectDetails, table }: ClientDataInfoProps) => {
  const { t } = useTranslation(['common']);
  const parsedData = R.pipe(objectDetails.data, R.mapValues(parseUnknownData));
  const effectiveFieldOrder =
    table.options.fieldOrder.length > 0 ? table.options.fieldOrder : table.fields.map((f) => f.id);
  const fieldCount = effectiveFieldOrder.length;
  const [isExpanded, setIsExpanded] = useState(false);
  const hasAnyMetadata = Object.keys(objectDetails.data).some((key) => key.endsWith('.metadata'));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-v2-md grow">
      <div
        className={cn(
          'grid grid-cols-subgrid gap-y-v2-sm col-span-full overflow-hidden',
          isExpanded || hasAnyMetadata ? 'max-h-[none]' : 'lg:max-h-[140px]',
        )}
      >
        {effectiveFieldOrder.map((fieldId) => {
          const field = table.fields.find((f) => f.id === fieldId);
          if (!field) return null;

          const metadata = parsedData[`"${field.name}.metadata"`] ?? parsedData[`${field.name}.metadata`];
          const hasMetadata = metadata?.type === 'DerivedData' && Object.keys(metadata.value).length > 0;
          return (
            <div key={field.id} className="grid grid-cols-[220px_1fr] min-w-0">
              <div className="truncate" title={field.name}>
                {field.name}
              </div>
              <div className="flex flex-col gap-1">
                <FormatData
                  type={field.dataType}
                  data={parsedData[field.name]}
                  className="whitespace-nowrap truncate"
                  mapHeight={200}
                />
                {hasMetadata ? <FormatData data={metadata} /> : null}
              </div>
            </div>
          );
        })}
      </div>
      {fieldCount > 10 && !isExpanded ? (
        <div className="not-lg:hidden">
          <Button appearance="link" onClick={() => setIsExpanded(true)} className="-m-v2-sm">
            {t('common:show')}
            <Icon icon="arrow-down" className="size-3.5" />
          </Button>
        </div>
      ) : null}
    </div>
  );
};
