import { FormatData } from '@app-builder/components/FormatData';
import { type DataModel } from '@app-builder/models';
import { type ClientObjectDetail, type PivotObject } from '@app-builder/models/cases';
import { useFormatLanguage } from '@app-builder/utils/format';
import { parseUnknownData } from '@app-builder/utils/parse';
import { type TFunction } from 'i18next';
import { Fragment, type ReactNode, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function PivotsPanel({
  pivotObjects,
  dataModel,
  onExplore,
}: {
  pivotObjects: PivotObject[];
  dataModel: DataModel;
  onExplore: (pivotValue: string, tableName: string) => void;
}) {
  const { t } = useTranslation(['cases']);
  if (!pivotObjects[0]) {
    throw new Error('no pivot object');
  }

  const [currentPivotObject, setCurrentPivotObject] = useState(pivotObjects[0]);
  const currentTable = dataModel.find((t) => t.name === currentPivotObject.pivotObjectName);
  const pivotObjectData = currentPivotObject.pivotObjectData;

  return (
    <div className="flex flex-col gap-8">
      <h2 className="text-l font-semibold">{t('cases:case_detail.pivot_panel.title')}</h2>
      {pivotObjects.length > 1 ? (
        <div className="border-grey-90 flex gap-2 self-start rounded border p-1">
          {pivotObjects.map((pivotObject) => (
            <button
              key={pivotObject.pivotValue}
              className="aria-[current=true]:bg-purple-65 aria-[current=true]:text-grey-100 min-h-8 rounded p-1"
              aria-current={pivotObject.pivotValue === currentPivotObject.pivotValue}
              onClick={() => setCurrentPivotObject(pivotObject)}
            >
              {pivotObject.pivotObjectName}
            </button>
          ))}
        </div>
      ) : null}
      <PivotObjectDetails t={t} pivotObjectData={pivotObjectData} />
      {currentTable?.navigationOptions ? (
        <div className="grid grid-cols-[160px,_1fr]">
          {currentTable.navigationOptions.map((navigationOption) => (
            <Fragment key={`${navigationOption.targetTableId}_${navigationOption.filterFieldId}`}>
              <div>{navigationOption.targetTableName}</div>
              <Button
                size="small"
                variant="secondary"
                onClick={() => {
                  onExplore(currentPivotObject.pivotValue, navigationOption.targetTableName);
                }}
                className="flex items-center gap-1"
              >
                {t('cases:case_detail.pivot_panel.explore')}
                <Icon icon="arrow-up-right" className="size-4" />
              </Button>
            </Fragment>
          ))}
        </div>
      ) : null}
    </div>
  );
}

type PivotObjectDetailsProps = {
  t: TFunction<['cases'], undefined>;
  pivotObjectData: ClientObjectDetail;
};
function PivotObjectDetails({ pivotObjectData, t }: PivotObjectDetailsProps) {
  const { data, relatedObjects } = pivotObjectData;

  return (
    <DataCard title={t('cases:case_detail.pivot_panel.informations')}>
      <PivotObjectDataList t={t} data={data} />
      {relatedObjects ? (
        <div className="">
          {relatedObjects.map((relatedObject) =>
            relatedObject.linkName && relatedObject.relatedObjectDetail ? (
              <Fragment key={relatedObject.linkName}>
                <h4 className="border-grey-90 border-b text-right text-xs font-semibold">
                  Related object - {relatedObject.linkName}
                </h4>
                <PivotObjectDataList t={t} data={relatedObject.relatedObjectDetail.data} />
              </Fragment>
            ) : null,
          )}
        </div>
      ) : null}
    </DataCard>
  );
}

function PivotObjectDataList({
  t,
  data,
}: {
  t: TFunction<['cases'], undefined>;
  data: ClientObjectDetail['data'];
}) {
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
    <div className="grid grid-cols-[160px,_1fr] gap-y-2">
      {data.object_id ? (
        <>
          <div className="text-grey-50">ID</div>
          <div className="truncate">{data.object_id}</div>
        </>
      ) : null}
      {shownData.map(([property, data]) => {
        return data.value !== null ? (
          <Fragment key={property}>
            <div className="text-grey-50">{property}</div>
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
          {t(
            `cases:case_detail.pivot_panel.${isExpanded ? 'less_data' : 'more_data'}`,
            isExpanded ? 'View less' : 'View more',
          )}
          <Icon icon={isExpanded ? 'minus' : 'plus'} className="size-4" />
        </Button>
      ) : null}
    </div>
  );
}

type DataCardProps = {
  title: string;
  children: ReactNode;
};
function DataCard({ title, children }: DataCardProps) {
  return (
    <div>
      <h3 className="border-grey-90 text-s mb-3 border-b px-2 py-3 font-semibold">{title}</h3>
      <div className="flex flex-col gap-8">{children}</div>
    </div>
  );
}
