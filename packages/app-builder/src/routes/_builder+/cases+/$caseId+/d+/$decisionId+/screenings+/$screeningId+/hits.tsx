import { casesI18n, scenarioI18n } from '@app-builder/components';
import { CasePivotValues } from '@app-builder/components/Cases/CasePivotValues';
import { IngestedObjectDetailModal } from '@app-builder/components/Data/IngestedObjectDetailModal';
import { CaseDetailTriggerObject } from '@app-builder/components/Decisions/TriggerObjectDetail';
import { FormatData } from '@app-builder/components/FormatData';
import { ScreeningReviewSection } from '@app-builder/components/Screenings/SreeningReview';
import { screeningsI18n } from '@app-builder/components/Screenings/screenings-i18n';
import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { usePivotValues } from '@app-builder/hooks/decisions/usePivotValues';
import { type Screening, ScreeningQuery } from '@app-builder/models/screening';
import { useFormatLanguage } from '@app-builder/utils/format';
import { parseUnknownData } from '@app-builder/utils/parse';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { Fragment, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'ui-design-system/src/Tabs/Tabs';
import { useCurrentCase } from './_layout';

export default function CaseSanctionsHitsPage() {
  const { t } = useTranslation(casesI18n);
  const { caseDetail, screening, decision, dataModel, pivots } = useCurrentCase();
  const pivotValues = usePivotValues(decision.pivotValues, pivots);
  const [objectLink, setObjectLink] = useState<{
    tableName: string;
    objectId: string;
  } | null>(null);
  const navigate = useAgnosticNavigation();

  return (
    <div className="bg-grey-100 border-grey-90 grid grid-cols-[max-content_2fr_1fr_repeat(3,max-content)] gap-x-6 gap-y-2 rounded-md border">
      <div className="col-span-full flex flex-row gap-12 p-4">
        <ScreeningReviewSection
          screening={screening}
          onRefineSuccess={(screeningId) => {
            navigate(
              getRoute('/cases/:caseId/d/:decisionId/screenings/:screeningId', {
                caseId: fromUUIDtoSUUID(caseDetail.id),
                decisionId: fromUUIDtoSUUID(decision.id),
                screeningId: fromUUIDtoSUUID(screeningId),
              }),
            );
          }}
        />
        <div className="sticky top-0 flex h-fit flex-1 flex-col gap-6">
          {screening.request ? (
            <ScreeningQueryDetail
              request={screening.request}
              initialQuery={screening.initialQuery}
            />
          ) : null}
          {pivotValues.length > 0 && (
            <div className="flex h-fit flex-col gap-2">
              <div className="col-start-2 row-start-1 flex flex-row items-center justify-between gap-2">
                <span className="text-grey-00 text-xs font-medium first-letter:capitalize">
                  {t('cases:case_detail.pivot_values')}
                </span>
              </div>
              <CasePivotValues pivotValues={pivotValues} />
            </div>
          )}

          <div className="flex h-fit flex-col gap-2">
            <div className="flex flex-row items-center justify-between gap-2">
              <span className="text-grey-00 text-xs font-medium first-letter:capitalize">
                {t('cases:case_detail.trigger_object')}
              </span>
            </div>
            <CaseDetailTriggerObject
              className="h-fit max-h-[50dvh] overflow-auto"
              dataModel={dataModel}
              triggerObject={decision.triggerObject}
              triggerObjectType={decision.triggerObjectType}
              onLinkClicked={(tableName, objectId) => setObjectLink({ tableName, objectId })}
            />
            {objectLink ? (
              <IngestedObjectDetailModal
                dataModel={dataModel}
                tableName={objectLink.tableName}
                objectId={objectLink.objectId}
                onClose={() => setObjectLink(null)}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

const QueryObjectDetail = ({ query }: { query: ScreeningQuery }) => {
  const language = useFormatLanguage();
  const { t } = useTranslation(scenarioI18n);
  const parsed = useMemo(
    () => Object.entries(query.properties).map(([k, v]) => [k, parseUnknownData(v)] as const),
    [query.properties],
  );

  return (
    <div className="text-s text-grey-00 bg-grey-98 grid grid-cols-[max-content_1fr] gap-3 gap-x-4 break-all rounded-lg p-4 mb-2">
      <span className="font-semibold">type</span>
      <span>
        {match(query.schema)
          .with('Thing', () => t('scenarios:edit_sanction.entity_type.thing'))
          .with('Person', () => t('scenarios:edit_sanction.entity_type.person'))
          .with('Organization', () => t('scenarios:edit_sanction.entity_type.organization'))
          .with('Vehicle', () => t('scenarios:edit_sanction.entity_type.vehicle'))
          .otherwise(() => '')}
      </span>
      {parsed.map(([property, data]) => (
        <Fragment key={property}>
          <span className="font-semibold">{property}</span>
          <FormatData data={data} language={language} />
        </Fragment>
      ))}
    </div>
  );
};

function ScreeningQueryDetail({
  request,
  initialQuery,
}: {
  request: NonNullable<Screening['request']>;
  initialQuery: Screening['initialQuery'];
}) {
  const { t } = useTranslation(screeningsI18n);
  const processedQueries = Object.values(request.queries);
  const hasInitialQuery = Array.isArray(initialQuery) && initialQuery.length > 0;

  return (
    <Tabs defaultValue="preprocessed">
      <TabsList className="mb-2">
        {hasInitialQuery && (
          <TabsTrigger value="initial">{t('screenings:initial_query')}</TabsTrigger>
        )}
        <TabsTrigger value="preprocessed">
          {!hasInitialQuery ? t('screenings:query') : t('screenings:processed_query')}
        </TabsTrigger>
      </TabsList>
      {hasInitialQuery && (
        <TabsContent value="initial">
          {initialQuery.map((q, i) => (
            <QueryObjectDetail key={i} query={q as ScreeningQuery} />
          ))}
        </TabsContent>
      )}
      <TabsContent value="preprocessed">
        {processedQueries.map((q, i) => (
          <QueryObjectDetail key={i} query={q as ScreeningQuery} />
        ))}
      </TabsContent>
    </Tabs>
  );
}
