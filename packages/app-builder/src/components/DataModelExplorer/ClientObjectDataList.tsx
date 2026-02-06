import { type ClientObjectDetail, type TableModelWithOptions } from '@app-builder/models';
import { parseUnknownData } from '@app-builder/utils/parse';
import { Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Button } from 'ui-design-system';
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
      {tableModel.options.fieldOrder.map((fieldId) => {
        const field = tableModel.fields.find((f) => f.id === fieldId);
        if (!field) return null;

        const data = parsedData[field.name];
        const hasNoValue = data?.type === 'unknown' && !data.value;

        return data && ((field.displayed && !hasNoValue) || isExpanded) ? (
          <Fragment key={field.id}>
            <div className="text-grey-secondary truncate">{field.name}</div>
            <FormatData data={data} className="truncate" />
          </Fragment>
        ) : null;
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
