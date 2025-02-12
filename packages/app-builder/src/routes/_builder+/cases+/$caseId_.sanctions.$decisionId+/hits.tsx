import { casesI18n } from '@app-builder/components';
import { CasePivotValues } from '@app-builder/components/Cases/CasePivotValues';
import { IngestedObjectDetailModal } from '@app-builder/components/Data/IngestedObjectDetailModal';
import { CaseDetailTriggerObject } from '@app-builder/components/Decisions/TriggerObjectDetail';
import { SanctionReviewSection } from '@app-builder/components/Sanctions/SanctionReview';
import { SearchInputDisplay } from '@app-builder/components/Sanctions/SearchInput';
import { usePivotValues } from '@app-builder/hooks/decisions/usePivotValues';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';

import { useCurrentCase } from './_layout';

export default function CaseSanctionsHitsPage() {
  const { t } = useTranslation(casesI18n);
  const { sanctionCheck, decision, dataModel, pivots } = useCurrentCase();
  const pivotValues = usePivotValues(decision.pivotValues, pivots);
  const searchInput = R.values(sanctionCheck.request.queries);
  const [objectLink, setObjectLink] = useState<{
    tableName: string;
    objectId: string;
  } | null>(null);

  return (
    <div className="bg-grey-100 border-grey-90 grid grid-cols-[max-content_2fr_1fr_repeat(3,_max-content)] gap-x-6 gap-y-2 rounded-md border">
      <div className="col-span-full flex flex-row gap-12 p-4">
        <SanctionReviewSection
          decisionId={decision.id}
          sanctionCheck={sanctionCheck}
        />
        <div className="sticky top-0 flex h-fit flex-1 flex-col gap-6">
          <div className="flex h-fit flex-col gap-2">
            <div className="col-start-2 row-start-1 flex flex-row items-center justify-between gap-2">
              <span className="text-grey-00 text-xs font-medium first-letter:capitalize">
                {t('sanctions:search_input')}
              </span>
            </div>
            <SearchInputDisplay searchInput={searchInput} />
          </div>
          <div className="flex h-fit flex-col gap-2">
            <div className="col-start-2 row-start-1 flex flex-row items-center justify-between gap-2">
              <span className="text-grey-00 text-xs font-medium first-letter:capitalize">
                {t('cases:case_detail.pivot_values')}
              </span>
            </div>
            <CasePivotValues pivotValues={pivotValues} />
          </div>

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
              onLinkClicked={(tableName, objectId) =>
                setObjectLink({ tableName, objectId })
              }
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
