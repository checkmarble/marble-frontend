import type { DecisionDetail } from '@app-builder/models/decision';
import type { SanctionCheck } from '@app-builder/models/sanction-check';
import { ReviewDecisionModal } from '@app-builder/routes/ressources+/cases+/review-decision';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { DialogDisclosure, useDialogStore } from '@ariakit/react/dialog';
import { Link } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { Button, Checkbox } from 'ui-design-system';

import { casesI18n } from './cases-i18n';

export const RequiredActions = ({
  decision,
  caseId,
}: {
  caseId: string;
  decision: Pick<DecisionDetail, 'id' | 'outcome' | 'reviewStatus'> & {
    sanctionChecks: SanctionCheck[];
  };
}) => {
  const { t } = useTranslation(casesI18n);
  const reviewDecisionModalStore = useDialogStore();
  const pendingSanctionMatches =
    decision.sanctionChecks[0]?.matches.filter((m) => m.status === 'pending').length ?? 0;
  const isPendingDecision =
    decision.reviewStatus === 'pending' && decision.outcome === 'block_and_review';
  const isThereSanctionChecks = decision.sanctionChecks.length > 0;

  return isPendingDecision || isThereSanctionChecks ? (
    <div className="bg-grey-98 group-hover:bg-grey-95 flex flex-col gap-2.5 rounded p-4 transition-colors">
      <span className="text-grey-50 text-xs">Required actions</span>
      {isThereSanctionChecks ? (
        <div className="flex items-center gap-2.5">
          <Checkbox disabled={true} size="small" checked={pendingSanctionMatches === 0} />
          {pendingSanctionMatches > 0 ? (
            <Link
              to={getRoute('/cases/:caseId/sanctions/:decisionId', {
                caseId: fromUUIDtoSUUID(caseId),
                decisionId: fromUUIDtoSUUID(decision.id),
              })}
            >
              <Button variant="secondary" size="xs">
                <span>
                  {t('cases:required_actions.review_screening_hits', {
                    count: pendingSanctionMatches,
                  })}
                </span>
              </Button>
            </Link>
          ) : (
            <span>{t('cases:required_actions.no_more_pending_sanction_checks')}</span>
          )}
        </div>
      ) : null}
      {isPendingDecision ? (
        <div className="flex items-center gap-2.5">
          <Checkbox size="small" disabled={true} />
          <DialogDisclosure
            store={reviewDecisionModalStore}
            render={<Button variant="secondary" size="xs" />}
          >
            {t('cases:required_actions.decide_final_status')}
          </DialogDisclosure>
          <ReviewDecisionModal
            decisionId={decision.id}
            store={reviewDecisionModalStore}
            sanctionCheck={decision.sanctionChecks[0]}
          />
        </div>
      ) : null}
    </div>
  ) : null;
};
