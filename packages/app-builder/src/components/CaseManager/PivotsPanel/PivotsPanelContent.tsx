import { CaseStatusTag } from '@app-builder/components/Cases';
import { ClientObjectDataList } from '@app-builder/components/DataModelExplorer/ClientObjectDataList';
import { DataModelExplorerContext } from '@app-builder/components/DataModelExplorer/Provider';
import { type ClientObjectDetail, type DataModel } from '@app-builder/models';
import { type CaseDetail, type PivotObject } from '@app-builder/models/cases';
import { usePivotRelatedCasesQuery } from '@app-builder/queries/pivot-related-cases';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { Link } from '@remix-run/react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Fragment, type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Button, CtaClassName } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function PivotsPanelContent({
  case: caseObj,
  pivotObjects,
  dataModel,
  onExplore,
}: {
  case: CaseDetail;
  pivotObjects: PivotObject[];
  dataModel: DataModel;
  onExplore: () => void;
}) {
  const { t } = useTranslation(['cases']);
  const dataModelExplorerContext = DataModelExplorerContext.useValue();

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
        <div className="border-grey-90 flex h-12 gap-2 self-start rounded-lg border p-1">
          {pivotObjects.map((pivotObject, idx) => (
            <button
              key={pivotObject.pivotValue}
              className="text-grey-50 aria-[current=true]:bg-purple-96 aria-[current=true]:text-purple-65 rounded p-1 px-4"
              aria-current={pivotObject.pivotValue === currentPivotObject.pivotValue}
              onClick={() => setCurrentPivotObject(pivotObject)}
            >
              {pivotObject.pivotObjectName} {idx + 1}
            </button>
          ))}
        </div>
      ) : null}
      <PivotObjectDetails pivotObjectData={pivotObjectData} />
      {currentTable?.navigationOptions ? (
        <div className="grid grid-cols-[120px,_1fr] gap-3">
          {currentTable.navigationOptions.map((navigationOption) => (
            <Fragment key={`${navigationOption.targetTableId}_${navigationOption.filterFieldId}`}>
              <div>{navigationOption.targetTableName}</div>
              <Button
                size="small"
                variant="secondary"
                onClick={() => {
                  dataModelExplorerContext.startNavigation({
                    pivotObject: currentPivotObject,
                    sourceObject: pivotObjectData.data,
                    sourceTableName: currentTable.name,
                    sourceFieldName: navigationOption.sourceFieldName,
                    targetTableName: navigationOption.targetTableName,
                    filterFieldName: navigationOption.filterFieldName,
                    orderingFieldName: navigationOption.orderingFieldName,
                  });
                  onExplore();
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
      <RelatedCases pivotValue={currentPivotObject.pivotValue} currentCase={caseObj} />
    </div>
  );
}

const cellVariants = cva('border-grey-90 border-t p-2', {
  variants: {
    isLast: {
      true: 'border-b',
      false: null,
    },
  },
  defaultVariants: {
    isLast: false,
  },
});

function RelatedCases({
  currentCase,
  pivotValue,
}: {
  currentCase: CaseDetail;
  pivotValue: string;
}) {
  const { t } = useTranslation(['common', 'cases']);
  const casesQuery = usePivotRelatedCasesQuery(pivotValue);

  return match(casesQuery)
    .with({ isError: true }, () => {
      return (
        <DataCard title={t('cases:case_detail.pivot_panel.case_history')}>
          <div className="border-red-74 bg-red-95 text-red-47 mt-3 rounded border p-2">
            {t('common:global_error')}
          </div>
        </DataCard>
      );
    })
    .with({ isPending: true }, () => {
      return <>Loading...</>;
    })
    .otherwise((query) => {
      const cases = query.data.cases.filter((caseObj) => caseObj.id !== currentCase.id);
      if (cases.length === 0) {
        return null;
      }

      return (
        <DataCard borderless title={t('cases:case_detail.pivot_panel.case_history')}>
          <div className="grid w-full grid-cols-[1fr_auto_96px]">
            {cases.map((caseObj, idx) => {
              const isLast = idx === cases.length - 1;

              return (
                <Fragment key={caseObj.id}>
                  <div
                    className={cellVariants({
                      isLast,
                      className: 'shrink truncate leading-[28px]',
                    })}
                  >
                    {caseObj.name}
                  </div>
                  <div className={cellVariants({ isLast, className: 'shrink-0' })}>
                    <Link
                      to={getRoute('/cases/:caseId', { caseId: fromUUIDtoSUUID(caseObj.id) })}
                      className={CtaClassName({ size: 'small', variant: 'secondary' })}
                    >
                      Open
                    </Link>
                  </div>
                  <div
                    className={cellVariants({ isLast, className: 'flex items-center border-l' })}
                  >
                    <CaseStatusTag status={caseObj.status} />
                  </div>
                </Fragment>
              );
            })}
          </div>
        </DataCard>
      );
    });
}

type PivotObjectDetailsProps = {
  pivotObjectData: ClientObjectDetail;
};
function PivotObjectDetails({ pivotObjectData }: PivotObjectDetailsProps) {
  const { t } = useTranslation(['common', 'cases']);
  const { data, relatedObjects } = pivotObjectData;

  return (
    <DataCard title={t('cases:case_detail.pivot_panel.informations')}>
      <div className="mt-3 flex flex-col gap-8">
        <ClientObjectDataList data={data} />
        {relatedObjects ? (
          <div className="">
            {relatedObjects.map((relatedObject) =>
              relatedObject.linkName && relatedObject.relatedObjectDetail ? (
                <Fragment key={relatedObject.linkName}>
                  <h4 className="border-grey-90 border-b text-right text-xs font-semibold">
                    {t('cases:case_detail.pivot_panel.related_object', {
                      vallinkName: relatedObject.linkName,
                    })}
                  </h4>
                  <ClientObjectDataList data={relatedObject.relatedObjectDetail.data} />
                </Fragment>
              ) : null,
            )}
          </div>
        ) : null}
      </div>
    </DataCard>
  );
}

const titleVariants = cva('text-s px-2 py-3 font-semibold', {
  variants: {
    borderless: {
      true: null,
      false: 'border-b border-grey-90',
    },
  },
  defaultVariants: {
    borderless: false,
  },
});

type DataCardProps = {
  title: string;
  children: ReactNode;
} & VariantProps<typeof titleVariants>;
function DataCard({ title, children, borderless }: DataCardProps) {
  return (
    <div>
      <h3 className={titleVariants({ borderless })}>{title}</h3>
      {children}
    </div>
  );
}
