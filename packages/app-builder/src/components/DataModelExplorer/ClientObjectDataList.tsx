import { type ClientObjectDetail } from '@app-builder/models';
import { useFormatLanguage } from '@app-builder/utils/format';
import { parseUnknownData } from '@app-builder/utils/parse';
import { Fragment, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { FormatData } from '../FormatData';

export function ClientObjectDataList({ data }: { data: ClientObjectDetail['data'] }) {
  const { t } = useTranslation(['common', 'cases']);
  const language = useFormatLanguage();
  const parsedData = R.pipe(
    data,
    R.omit(['object_id']),
    R.mapValues(parseUnknownData),
    R.entries(),
  );
  const [isExpanded, setIsExpanded] = useState(false);
  const shownData = useMemo(
    () => (isExpanded || parsedData.length <= 5 ? parsedData : parsedData.slice(0, 5)),
    [parsedData, isExpanded],
  );

  return (
    <div className="grid grid-cols-[160px,_1fr] gap-x-3 gap-y-2">
      {data.object_id ? (
        <>
          <div className="text-grey-50">ID</div>
          <div className="truncate">{data.object_id}</div>
        </>
      ) : null}
      {shownData.map(([property, data]) => {
        return data.value !== null ? (
          <Fragment key={property}>
            <div className="text-grey-50 truncate">{property}</div>
            <div className="truncate">
              <FormatData data={data} language={language} />
            </div>
          </Fragment>
        ) : null;
      })}
      {parsedData.length > 5 ? (
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
