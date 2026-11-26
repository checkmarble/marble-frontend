import { isAdmin } from '@app-builder/models/user';
import { useOrganizationDetails } from '@app-builder/services/organization/organization-detail';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { TooltipV2 } from 'ui-design-system';

export interface ScreeningReviewEscalationTarget {
  inboxId: string;
  /** Unset when the inbox has no escalation inbox. */
  escalationInboxName?: string;
}

/** Explains a disabled escalating action: no escalation inbox, else `fallback`; without either, just `children`. */
export function EscalationTooltip({
  target,
  fallback,
  children,
}: {
  target: ScreeningReviewEscalationTarget;
  fallback?: string;
  children: React.ReactNode;
}) {
  const { t } = useTranslation(['cases']);
  const { currentUser } = useOrganizationDetails();
  const missing = !target.escalationInboxName;
  if (!missing && !fallback) return children;
  const admin = isAdmin(currentUser);
  return (
    <TooltipV2.Provider>
      <TooltipV2.Tooltip delayDuration={0}>
        {/* A disabled button gets no pointer events, so the wrapper opens the tooltip. */}
        <TooltipV2.TooltipTrigger asChild>
          <span className="inline-flex" tabIndex={0}>
            {children}
          </span>
        </TooltipV2.TooltipTrigger>
        <TooltipV2.TooltipContent className="max-w-80">
          <div>
            {missing
              ? t(admin ? 'cases:escalate-button.forbidden.hint.admin' : 'cases:escalate-button.forbidden.hint')
              : fallback}
          </div>
          {missing && admin ? (
            <Link
              to="/settings/inboxes"
              search={{ inboxId: fromUUIDtoSUUID(target.inboxId) }}
              className="font-semibold text-purple-primary hover:text-purple-hover hover:underline focus:text-purple-hover focus:underline"
            >
              {t('cases:case.inbox_settings_link')}
            </Link>
          ) : null}
        </TooltipV2.TooltipContent>
      </TooltipV2.Tooltip>
    </TooltipV2.Provider>
  );
}
