import { type ClientObjectDetail, type TableModelWithOptions } from '@app-builder/models';
import { parseUnknownData } from '@app-builder/utils/parse';
import { Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Button, cn } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { FormatData } from '../FormatData';
import { SquareTag } from '../SquareTag';
import { DataListGrid } from './DataListGrid';

type ClientObjectDataListProps = {
  tableModel: TableModelWithOptions;
  data: ClientObjectDetail['data'];
  displayObjectType?: boolean;
  className?: string;
  isIncompleteObject?: boolean;
};

export function ClientObjectDataList({
  tableModel,
  displayObjectType = false,
  isIncompleteObject = false,
  data,
  className,
}: ClientObjectDataListProps) {
  const { t } = useTranslation(['common', 'cases']);
  const parsedData = R.pipe(data, R.mapValues(parseUnknownData));
  const effectiveFieldOrder =
    tableModel.options.fieldOrder.length > 0 ? tableModel.options.fieldOrder : tableModel.fields.map((f) => f.id);
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldShowButton = tableModel.fields.some((f) => !f.displayed);

  return (
    <DataListGrid className={className}>
      {displayObjectType ? (
        <Fragment>
          <div className="text-grey-secondary truncate">Object type</div>
          <div>
            <SquareTag className="capitalize">{tableModel.name}</SquareTag>
          </div>
        </Fragment>
      ) : null}
      {effectiveFieldOrder.map((fieldId) => {
        const field = tableModel.fields.find((f) => f.id === fieldId);
        if (!field) return null;

        const data = parsedData[field.name];
        const hasNoValue = data?.type === 'unknown' && !data.value;

        if (!data || !((field.displayed && !hasNoValue) || isExpanded)) return null;

        const isMultiLine = field.dataType === 'Coords' || field.dataType === 'IpAddress';
        // Backend sends quoted keys like `"ip.metadata"`, mock/other sources use unquoted `ip.metadata`
        const metadata = parsedData[`"${field.name}.metadata"`] ?? parsedData[`${field.name}.metadata`];
        const hasMetadata = metadata?.type === 'DerivedData' && Object.keys(metadata.value).length > 0;
        return (
          <Fragment key={field.id}>
            <div className="text-grey-secondary truncate">{field.name}</div>
            <FormatData type={field.dataType} data={data} className={cn({ truncate: !isMultiLine })} mapHeight={200} />
            {hasMetadata ? <FormatData data={metadata} /> : null}
          </Fragment>
        );
      })}

      {shouldShowButton && !isIncompleteObject ? (
        <Button variant="secondary" className="mt-3" onClick={() => setIsExpanded((e) => !e)}>
          {t(`cases:case_detail.pivot_panel.${isExpanded ? 'less_data' : 'more_data'}`)}
          <Icon icon={isExpanded ? 'minus' : 'plus'} className="size-3.5" />
        </Button>
      ) : null}
    </DataListGrid>
  );
}
