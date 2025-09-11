import { CaseStatusBadge } from '@app-builder/components/Cases';
import { ClientObjectDataList } from '@app-builder/components/DataModelExplorer/ClientObjectDataList';
import { DataModelExplorerContext } from '@app-builder/components/DataModelExplorer/Provider';
import {
  type CurrentUser,
  DataModelObject,
  type DataModelWithTableOptions,
  isAdmin,
  type TableModelWithOptions,
} from '@app-builder/models';
import { type CaseDetail, type PivotObject } from '@app-builder/models/cases';
import { usePivotRelatedCasesQuery } from '@app-builder/queries/pivot-related-cases';
import { formatDateTimeWithoutPresets, useFormatLanguage } from '@app-builder/utils/format';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { Link } from '@remix-run/react';
import { cva } from 'class-variance-authority';
import { Fragment, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { ButtonV2, CtaClassName, CtaV2ClassName, cn } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { KycEnrichment } from '../KycEnrichment';
import { DataCard } from './DataCard';
import { PivotAnnotations } from './PivotAnnotations';
import { PivotNavigationOptions } from './PivotNavigationOptions';

function pivotUniqKey(pivotObject?: PivotObject) {
  return pivotObject
    ? `${pivotObject.pivotObjectName}_${pivotObject.pivotFieldName}_${pivotObject.pivotValue}`
    : null;
}

export function PivotsPanelContent({
  currentUser,
  case: caseObj,
  pivotObjects,
  reviewProofs,
  dataModel,
  onExplore,
  isKycEnrichmentEnabled,
}: {
  currentUser: CurrentUser;
  case: CaseDetail;
  pivotObjects: PivotObject[];
  reviewProofs: { type: string; object: DataModelObject }[];
  dataModel: DataModelWithTableOptions;
  onExplore: () => void;
  isKycEnrichmentEnabled: boolean;
}) {
  const { t } = useTranslation(['cases']);

  const [isDisplayingProofs, setIsDisplayingProofs] = useState(false);
  const [currentPivotUniqKey, setCurrentPivotObjectUniqKey] = useState(
    pivotUniqKey(pivotObjects[0]),
  );
  const currentPivotObject = pivotObjects.find(
    (pivotObject) => pivotUniqKey(pivotObject) === currentPivotUniqKey,
  );

  const currentTable = dataModel.find((t) => t.name === currentPivotObject?.pivotObjectName);
  const decisionsPivotValues = useMemo(
    () => caseObj.decisions.flatMap((d) => d.pivotValues),
    [caseObj],
  );
  const isAllMissingPivotObject = decisionsPivotValues.every(
    (pivotValue) =>
      !pivotObjects.find((pivotObject) => pivotObject.pivotValue === pivotValue.value),
  );
  const dataModelExplorerContext = DataModelExplorerContext.useValue();

  return (
    <div className="flex flex-col gap-8">
      {isAllMissingPivotObject ? (
        <div className="border-grey-90 flex h-40 flex-col items-center justify-center gap-2 rounded-sm border p-8">
          <span className="text-center">
            {isAdmin(currentUser)
              ? t('cases:case_detail.pivot_panel.missing_pivot.admin')
              : t('cases:case_detail.pivot_panel.missing_pivot')}
          </span>
          {isAdmin(currentUser) ? (
            <Link
              to={getRoute('/data')}
              className={CtaClassName({ variant: 'secondary', size: 'small' })}
            >
              {t('cases:case_detail.pivot_panel.missing_pivot_cta')}
            </Link>
          ) : null}
        </div>
      ) : null}
      <div className="flex items-center gap-2 mt-4">
        {reviewProofs.length > 0 ? (
          <button
            onClick={() => {
              setIsDisplayingProofs(true);
              setCurrentPivotObjectUniqKey(null);
            }}
            className={cn('h-7 px-4 rounded-lg flex items-center border', {
              'bg-purple-96 text-purple-65 border-purple-96': isDisplayingProofs,
              'bg-white text-grey-50 border-grey-90 cursor-pointer': !isDisplayingProofs,
            })}
          >
            {t('cases:ai_review.proof.title')}
          </button>
        ) : null}
        <div className="border-grey-90 flex gap-2 self-start rounded-v2-lg border p-v2-xs">
          {pivotObjects.map((pivotObject, idx) => {
            const uniqKey = pivotUniqKey(pivotObject);
            return (
              <button
                key={uniqKey}
                className="text-grey-50 aria-current:bg-purple-96 aria-current:text-purple-65 rounded-v2-md p-v2-xs px-v2-sm cursor-pointer"
                aria-current={uniqKey === pivotUniqKey(currentPivotObject)}
                onClick={() => {
                  setCurrentPivotObjectUniqKey(pivotUniqKey(pivotObject));
                  setIsDisplayingProofs(false);
                }}
              >
                {pivotObject.pivotObjectName} {idx + 1}
              </button>
            );
          })}
        </div>
      </div>
      {!isDisplayingProofs ? (
        <>
          {currentTable && currentPivotObject ? (
            <div className="flex flex-col gap-v2-md">
              <div className="flex flex-row gap-v2-md">
                <div className="text-h2 font-semibold">
                  {t('cases:case_detail.pivot_panel.informations')}
                </div>
                {isKycEnrichmentEnabled ? <KycEnrichment caseId={caseObj.id} /> : null}
              </div>

              <div className="border-grey-90 flex flex-col gap-v2-md border p-v2-md bg-grey-background-light rounded-v2-lg">
                <div className="capitalize font-semibold">{currentTable.name}</div>
                <PivotObjectDetails
                  tableModel={currentTable}
                  dataModel={dataModel}
                  pivotObject={currentPivotObject}
                />
                <div className="h-px bg-grey-90" />
                <PivotNavigationOptions
                  currentUser={currentUser}
                  pivotObject={currentPivotObject}
                  table={currentTable}
                  dataModel={dataModel}
                  onExplore={onExplore}
                />
              </div>
            </div>
          ) : null}
          {currentPivotObject ? (
            <>
              {currentTable &&
              currentPivotObject.pivotObjectId &&
              currentPivotObject.pivotObjectData.metadata.canBeAnnotated ? (
                <PivotAnnotations
                  caseId={caseObj.id}
                  tableName={currentTable.name}
                  objectId={currentPivotObject.pivotObjectId}
                  annotations={currentPivotObject.pivotObjectData.annotations}
                />
              ) : null}
              <RelatedCases pivotValue={currentPivotObject.pivotValue} currentCase={caseObj} />
            </>
          ) : null}
        </>
      ) : (
        <>
          {reviewProofs.map((proof, idx) => {
            const tableModel = dataModel.find((t) => t.name === proof.type);
            if (!tableModel) return null;

            const navigationOptions = tableModel.navigationOptions;

            return (
              <div
                key={`${proof.type}-${proof.object.data['object_id']}`}
                className="rounded-xl border border-grey-90 bg-grey-98"
              >
                <div className="bg-grey-100 px-4 py-2 rounded-t-xl border-b border-grey-90">
                  {t('cases:ai_review.proof.tab_title', { number: idx + 1 })}
                </div>
                <div className="p-4 flex flex-col gap-v2-md">
                  <ClientObjectDataList tableModel={tableModel} data={proof.object.data} />
                  {navigationOptions ? (
                    <>
                      <div className="h-px bg-grey-90" />
                      <div className="flex flex-col gap-2">
                        {navigationOptions.map((navOption) => (
                          <div
                            key={navOption.targetTableName}
                            className="grid grid-cols-[116px_1fr] gap-x-3 items-center"
                          >
                            <div>{navOption.targetTableName}</div>
                            <ButtonV2
                              disabled={navOption.status === 'pending'}
                              variant="secondary"
                              onClick={() => {
                                dataModelExplorerContext.startNavigation({
                                  pivotObject: {
                                    isIngested: true,
                                    pivotValue: proof.object.data['object_id'] as string,
                                    pivotObjectName: tableModel.name,
                                  },
                                  sourceObject: proof.object.data,
                                  sourceTableName: tableModel.name,
                                  sourceFieldName: navOption.sourceFieldName,
                                  targetTableName: navOption.targetTableName,
                                  filterFieldName: navOption.filterFieldName,
                                  orderingFieldName: navOption.orderingFieldName,
                                });
                                onExplore();
                              }}
                              className="flex items-center gap-1"
                            >
                              {navOption.status === 'pending'
                                ? t('cases:case_detail.pivot_panel.explore_waiting_creation')
                                : t('cases:case_detail.pivot_panel.explore')}
                              {navOption.status === 'pending' ? (
                                <Icon icon="spinner" className="size-3.5 animate-spin" />
                              ) : (
                                <Icon icon="arrow-up-right" className="size-3.5" />
                              )}
                            </ButtonV2>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            );
          })}
        </>
      )}
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
  const language = useFormatLanguage();

  return match(casesQuery)
    .with({ isError: true }, () => {
      return (
        <DataCard title={t('cases:case_detail.pivot_panel.case_history')}>
          <div className="border-red-74 bg-red-95 text-red-47 mt-3 rounded-sm border p-2">
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
        <div className="flex flex-col gap-v2-md">
          <div className="text-h2 font-semibold">
            {t('cases:case_detail.pivot_panel.case_history')}
          </div>
          <div className="grid w-full grid-cols-[auto_1fr_auto_auto]">
            {cases.map((caseObj, idx) => {
              const isLast = idx === cases.length - 1;

              return (
                <Fragment key={caseObj.id}>
                  <div
                    className={cellVariants({
                      isLast,
                      className: 'shrink border-r leading-[28px]',
                    })}
                  >
                    {formatDateTimeWithoutPresets(caseObj.createdAt, {
                      language,
                      dateStyle: 'short',
                    })}
                  </div>
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
                      className={CtaV2ClassName({ variant: 'secondary' })}
                    >
                      Open
                    </Link>
                  </div>
                  <div
                    className={cellVariants({ isLast, className: 'flex items-center border-l' })}
                  >
                    <CaseStatusBadge
                      status={caseObj.status}
                      showText={false}
                      showBackground={false}
                      outcome={caseObj.outcome}
                    />
                  </div>
                </Fragment>
              );
            })}
          </div>
        </div>
      );
    });
}

type PivotObjectDetailsProps = {
  tableModel: TableModelWithOptions;
  dataModel: DataModelWithTableOptions;
  pivotObject: PivotObject;
};
export function PivotObjectDetails({
  tableModel,
  dataModel,
  pivotObject,
}: PivotObjectDetailsProps) {
  const { t } = useTranslation(['common', 'cases']);
  const { data, relatedObjects } = pivotObject.pivotObjectData;
  const filteredRelatedObjects = relatedObjects.filter((r) => !!r.relatedObjectDetail?.metadata);

  return (
    <>
      <div className="flex flex-col gap-8">
        <ClientObjectDataList
          tableModel={tableModel}
          data={data}
          isIncompleteObject={!pivotObject.isIngested}
        />
        {filteredRelatedObjects.length > 0 ? (
          <div className="">
            {filteredRelatedObjects.map((relatedObject) => {
              if (!relatedObject.relatedObjectDetail?.metadata) return null;

              const relatedObjectType = relatedObject.relatedObjectDetail.metadata.objectType;
              const relatedObjectTable = dataModel.find((tm) => tm.name === relatedObjectType);
              if (!relatedObjectTable) return null;

              return (
                <Fragment key={relatedObjectType}>
                  <h4 className="border-grey-90 mb-3 border-b text-right text-xs font-semibold">
                    {t('cases:case_detail.pivot_panel.related_object', {
                      tableName: relatedObject.linkName ?? relatedObjectType,
                    })}
                  </h4>
                  <ClientObjectDataList
                    tableModel={relatedObjectTable}
                    data={relatedObject.relatedObjectDetail.data}
                  />
                </Fragment>
              );
            })}
          </div>
        ) : null}
      </div>
    </>
  );
}
