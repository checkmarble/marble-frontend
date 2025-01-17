import { Callout, casesI18n } from '@app-builder/components';
import { CasePivotValues } from '@app-builder/components/Cases/CasePivotValues';
import { SanctionCheckMatchSheet } from '@app-builder/components/Cases/SanctionCheckMatchSheet/SanctionCheckMatchSheet';
import { CaseDetailTriggerObject } from '@app-builder/components/Decisions/TriggerObjectDetail';
import { usePivotValues } from '@app-builder/hooks/decisions/usePivotValues';
import { useTranslation } from 'react-i18next';

import { useCurrentCase } from './_layout';

export default function CaseSanctionsHitsPage() {
  const { t } = useTranslation(casesI18n);
  const { sanctionCheck, decision, pivots } = useCurrentCase();
  const matchesToReviewCount = sanctionCheck.matches.filter((match) => match.status === 'pending').length;
  const pivotValues = usePivotValues(decision.pivotValues, pivots);

  return (
    <div className="bg-grey-100 border-grey-90 grid grid-cols-[max-content_2fr_1fr_repeat(3,_max-content)] gap-x-6 gap-y-2 rounded-md border">
      <div className="col-span-full flex flex-row gap-6 p-4">
        <div className="flex h-fit flex-[2] flex-col gap-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-m font-semibold">Potential matches</span>
              <span className="text-grey-50 text-s">
                {matchesToReviewCount}/{sanctionCheck.matches.length} to review
              </span>
            </div>
            <Callout bordered>There are matches between the beneficiary information and the sanctions check. Check if it is the same beneficiary or not.</Callout>
          </div>
          <div className="flex flex-col gap-2">
            {sanctionCheck.matches.map((sanctionMatch) => (
              <SanctionCheckMatchSheet key={sanctionMatch.id} match={sanctionMatch} />
            ))}
          </div>
        </div>
        <div className="sticky top-0 flex h-fit flex-1 flex-col gap-6">
          <div className="flex h-fit flex-col gap-2">
            <div className="col-start-2 row-start-1 flex flex-row items-center justify-between gap-2">
              <span className="text-grey-00 text-xs font-medium first-letter:capitalize">{t('cases:case_detail.pivot_values')}</span>
            </div>
            <CasePivotValues pivotValues={pivotValues} />
          </div>

          <div className="flex h-fit flex-col gap-2">
            <div className="flex flex-row items-center justify-between gap-2">
              <span className="text-grey-00 text-xs font-medium first-letter:capitalize">{t('cases:case_detail.trigger_object')}</span>
            </div>
            <CaseDetailTriggerObject className="h-fit max-h-[50dvh] overflow-auto" triggerObject={decision.triggerObject} />
          </div>
        </div>
      </div>
    </div>
  );
}
