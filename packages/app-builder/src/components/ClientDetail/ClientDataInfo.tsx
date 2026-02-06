import { DataModelObject, TableModelWithOptions } from '@app-builder/models';
import { parseUnknownData } from '@app-builder/utils/parse';
import { useState } from 'react';
import * as R from 'remeda';
import { Button, cn } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { FormatData } from '../FormatData';

export type ClientDataInfoProps = {
  objectDetails: DataModelObject;
  table: TableModelWithOptions;
};

export const ClientDataInfo = ({ objectDetails, table }: ClientDataInfoProps) => {
  const parsedData = R.pipe(objectDetails.data, R.mapValues(parseUnknownData));
  const fieldCount = table.options.fieldOrder.length;
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-v2-md grow">
      <div
        className={cn(
          'grid grid-cols-subgrid gap-y-v2-sm col-span-full overflow-hidden',
          isExpanded ? 'max-h-[none]' : 'lg:max-h-[140px]',
        )}
      >
        {table.options.fieldOrder.map((fieldId) => {
          const field = table.fields.find((f) => f.id === fieldId);
          if (!field) return null;

          return (
            <div key={field.id} className="grid grid-cols-[160px_1fr] items-center">
              <div>{field.name}</div>
              <FormatData data={parsedData[field.name]} className="no-wrap truncate" />
            </div>
          );
        })}
      </div>
      {fieldCount > 10 && !isExpanded ? (
        <div className="not-lg:hidden">
          <Button appearance="link" onClick={() => setIsExpanded(true)} className="-m-v2-sm">
            See more
            <Icon icon="arrow-down" className="size-3.5" />
          </Button>
        </div>
      ) : null}
    </div>
  );
};
