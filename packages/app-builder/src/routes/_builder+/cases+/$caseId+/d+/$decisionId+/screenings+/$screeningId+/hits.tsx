import { casesI18n } from '@app-builder/components';
import { CasePivotValues } from '@app-builder/components/Cases/CasePivotValues';
import { IngestedObjectDetailModal } from '@app-builder/components/Data/IngestedObjectDetailModal';
import { CaseDetailTriggerObject } from '@app-builder/components/Decisions/TriggerObjectDetail';
import { ScreeningQueryDetail } from '@app-builder/components/Screenings/ScreeningQueryDetail';
import { ScreeningReviewSection } from '@app-builder/components/Screenings/SreeningReview';
import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { usePivotValues } from '@app-builder/hooks/decisions/usePivotValues';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
    <div className="bg-surface-card border-grey-border grid grid-cols-[max-content_2fr_1fr_repeat(3,max-content)] gap-x-6 gap-y-2 rounded-md border">
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
            <ScreeningQueryDetail request={screening.request} initialQuery={screening.initialQuery} />
          ) : null}
          {pivotValues.length > 0 && (
            <div className="flex h-fit flex-col gap-2">
              <div className="col-start-2 row-start-1 flex flex-row items-center justify-between gap-2">
                <span className="text-grey-primary text-xs font-medium first-letter:capitalize">
                  {t('cases:case_detail.pivot_values')}
                </span>
              </div>
              <CasePivotValues pivotValues={pivotValues} />
            </div>
          )}

          <div className="flex h-fit flex-col gap-2">
            <div className="flex flex-row items-center justify-between gap-2">
              <span className="text-grey-primary text-xs font-medium first-letter:capitalize">
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
