import { type ClientObjectDetail, type TableModelWithOptions } from '@app-builder/models';
import { useFormatLanguage } from '@app-builder/utils/format';
import { parseUnknownData } from '@app-builder/utils/parse';
import { Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Button, cn } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { FormatData } from '../FormatData';

type ClientObjectDataListProps = {
  tableModel: TableModelWithOptions;
  data: ClientObjectDetail['data'];
  className?: string;
  isIncompleteObject?: boolean;
};

export function ClientObjectDataList({
  tableModel,
  isIncompleteObject = false,
  data,
  className,
}: ClientObjectDataListProps) {
  const { t } = useTranslation(['common', 'cases']);
  const language = useFormatLanguage();
  const parsedData = R.pipe(data, R.mapValues(parseUnknownData));
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldShowButton = tableModel.fields.some((f) => !f.displayed);

  return (
    <div className={cn('grid grid-cols-[160px,_1fr] gap-x-3 gap-y-2', className)}>
      {tableModel.options.fieldOrder.map((fieldId) => {
        const field = tableModel.fields.find((f) => f.id === fieldId);
        if (!field) return null;

        const data = parsedData[field.name];

        return data && (field.displayed || isExpanded) ? (
          <Fragment key={field.id}>
            <div className="text-grey-50 truncate">{field.name}</div>
            <div className="truncate">
              {data.value === null ? '-' : <FormatData data={data} language={language} />}
            </div>
          </Fragment>
        ) : null;
      })}

      {shouldShowButton && !isIncompleteObject ? (
        <Button
          size="small"
          variant="secondary"
          className="mt-3"
          onClick={() => setIsExpanded((e) => !e)}
        >
          {t(`cases:case_detail.pivot_panel.${isExpanded ? 'less_data' : 'more_data'}`)}
          <Icon icon={isExpanded ? 'minus' : 'plus'} className="size-4" />
        </Button>
      ) : null}
    </div>
  );
}
