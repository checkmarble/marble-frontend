import { casesI18n } from '@app-builder/components/Cases';
import { CaseDecisions } from '@app-builder/components/Cases/CaseDecisions';
import { getRoute } from '@app-builder/utils/routes';
import { Link } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { Trans, useTranslation } from 'react-i18next';

import { useCurrentCase } from './$caseId._layout';

export const handle = {
  i18n: ['common', 'navigation', 'data', ...casesI18n] satisfies Namespace,
};

export default function CasePage() {
  const { t } = useTranslation(handle.i18n);
  const { caseDetail, caseDecisionsPromise, featureAccess, entitlements } =
    useCurrentCase();

  if (caseDetail.decisions.length === 0) {
    return (
      <div className="bg-grey-00 border-grey-10 rounded-lg border p-4">
        <span className="text-grey-50 text-s whitespace-pre">
          <Trans
            t={t}
            i18nKey="cases:case_detail.no_decisions"
            components={{
              Link: (
                <Link
                  className="text-purple-50 hover:text-purple-100 hover:underline"
                  to={getRoute('/decisions/')}
                />
              ),
            }}
          />
        </span>
      </div>
    );
  }

  return (
    <CaseDecisions
      decisions={caseDetail.decisions}
      featureAccess={featureAccess}
      entitlements={entitlements}
      caseDecisionsPromise={caseDecisionsPromise}
    />
  );
}
