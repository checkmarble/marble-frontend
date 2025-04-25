import { type DecisionDetail } from '@app-builder/models/decision';
import { type SanctionCheck } from '@app-builder/models/sanction-check';
import { ReviewDecisionModal } from '@app-builder/routes/ressources+/cases+/review-decision';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { DialogDisclosure, useDialogStore } from '@ariakit/react/dialog';
import { Link } from '@remix-run/react';
import { Button, Checkbox } from 'ui-design-system';

export const RequiredActions = ({
  decision,
}: {
  decision: Pick<DecisionDetail, 'case' | 'id' | 'outcome' | 'reviewStatus'> & {
    sanctionChecks: SanctionCheck[];
  };
}) => {
  const reviewDecisionModalStore = useDialogStore();
  const pendingSanctionMatches =
    decision.sanctionChecks[0]?.matches.filter((m) => m.status === 'pending').length ?? 0;

  return decision.reviewStatus === 'pending' && decision.outcome === 'block_and_review' ? (
    <div className="bg-grey-98 group-hover:bg-grey-95 flex flex-col gap-2.5 rounded p-4 transition-colors">
      <span className="text-grey-50 text-xs">Required actions</span>
      {decision.sanctionChecks.length > 0 ? (
        <div className="flex items-center gap-2.5">
          <Checkbox disabled={true} size="small" checked={pendingSanctionMatches === 0} />
          {pendingSanctionMatches > 0 ? (
            <Link
              to={getRoute('/cases/:caseId/sanctions/:decisionId', {
                caseId: fromUUIDtoSUUID(decision.case?.id as string),
                decisionId: fromUUIDtoSUUID(decision.id),
              })}
            >
              <Button variant="secondary" size="xs">
                <span>Review pending sanction checks</span>
                <span>({pendingSanctionMatches})</span>
              </Button>
            </Link>
          ) : (
            <span>No more pending sanction checks</span>
          )}
        </div>
      ) : null}
      <div className="flex items-center gap-2.5">
        <Checkbox size="small" disabled={true} />
        <DialogDisclosure
          store={reviewDecisionModalStore}
          render={<Button variant="secondary" size="xs" disabled={pendingSanctionMatches > 0} />}
        >
          Decide final status
        </DialogDisclosure>
        <ReviewDecisionModal
          decisionId={decision.id}
          store={reviewDecisionModalStore}
          sanctionCheck={decision.sanctionChecks[0]}
        />
      </div>
    </div>
  ) : null;
};
