import { type DecisionDetail } from '@app-builder/models/decision';
import { type SanctionCheck } from '@app-builder/models/sanction-check';
import { ReviewDecisionModal } from '@app-builder/routes/ressources+/cases+/review-decision';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { DialogDisclosure, useDialogStore } from '@ariakit/react/dialog';
import { Link } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { Button, Checkbox, cn } from 'ui-design-system';

import { casesI18n } from './cases-i18n';

const Divider = ({ isLast = false }: { isLast?: boolean }) => (
  <div className="flex size-6 flex-col items-start justify-center">
    <div className="w-px shrink-0 grow basis-0 bg-[#D9D9D9B2]" />
    <div className="h-px w-4 shrink-0 bg-[#D9D9D9B2]" />
    <div className={cn('w-px shrink-0 grow basis-0 bg-[#D9D9D9B2]', isLast && 'bg-transparent')} />
  </div>
);

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
    decision.sanctionChecks.flatMap((s) => s.matches).filter((m) => m.status === 'pending')
      .length ?? 0;
  const isPendingDecision =
    decision.reviewStatus === 'pending' && decision.outcome === 'block_and_review';
  const isThereSanctionChecks = decision.sanctionChecks.length > 0;

  return isPendingDecision || isThereSanctionChecks ? (
    <div className="bg-grey-98 group-hover:bg-grey-95 flex flex-col gap-2.5 rounded p-4 transition-colors">
      <span className="text-grey-50 text-xs">{t('sanctions:required_actions.title')}</span>
      {isThereSanctionChecks ? (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <Checkbox disabled={true} size="small" checked={pendingSanctionMatches === 0} />
            <span className="text-xs font-medium">
              {t('sanctions:required_actions.review_pending_screening_count', {
                count: decision.sanctionChecks.length,
              })}
            </span>
          </div>
          <div className="flex flex-col">
            {decision.sanctionChecks.map((s, i) => {
              return (
                <div key={s.id} className="flex items-center pl-6 text-xs font-medium">
                  <Divider isLast={i === decision.sanctionChecks.length - 1} />
                  <span
                    className={cn('inline-flex items-center gap-2 text-xs font-medium', {
                      'text-red-43': s.status === 'error',
                    })}
                  >
                    <span>{`${s.config.name} (${s.matches.length})`}</span>
                    <Link
                      className="underline"
                      to={getRoute('/cases/:caseId/d/:decisionId/screenings/:screeningId', {
                        caseId: fromUUIDtoSUUID(caseId),
                        decisionId: fromUUIDtoSUUID(decision.id),
                        screeningId: fromUUIDtoSUUID(s.id),
                      })}
                    >
                      {s.status === 'in_review'
                        ? t('sanctions:required_actions.review')
                        : s.status === 'error'
                          ? t('sanctions:required_actions.view_error')
                          : t('sanctions:required_actions.view')}
                    </Link>
                    {s.status !== 'error' && s.status !== 'in_review' ? (
                      <span
                        className={cn('text-2xs rounded-full px-2 py-0.5', {
                          'text-red-43 bg-red-95': s.status === 'confirmed_hit',
                          'text-grey-50 bg-grey-90': s.status === 'no_hit',
                        })}
                      >
                        {t(`sanctions:status.${s.status}`)}
                      </span>
                    ) : null}
                  </span>
                </div>
              );
            })}
          </div>
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
