import { casesI18n } from '@app-builder/components';
import { EventTime } from '@app-builder/components/Cases/Events/Time';
import { type CaseEntityRemovedEvent } from '@app-builder/models/cases';
import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { getFullName } from '@app-builder/services/user';
import { clientDetailLinkParams } from '@app-builder/utils/routes/client-detail-url';
import { Link } from '@tanstack/react-router';
import { type ReactNode, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';

export function CaseEntityRemovedDetail({ event }: { event: CaseEntityRemovedEvent }) {
  const { getOrgUserById } = useOrganizationUsers();
  const { t } = useTranslation(casesI18n);
  const user = useMemo(() => (event.userId ? getOrgUserById(event.userId) : undefined), [event.userId, getOrgUserById]);

  return (
    <div key={event.id} className="flex w-full items-center gap-sm">
      <div className="bg-surface-card border-grey-border flex size-6 shrink-0 grow-0 items-center justify-center rounded-full border">
        <Icon icon="link" className="text-grey-primary size-3" />
      </div>
      <span className="text-grey-primary inline-flex h-full items-center whitespace-pre text-xs">
        <Trans
          t={t}
          i18nKey="cases:case_detail.history.event_detail.entity_removed"
          components={{
            Actor: <span className="font-bold capitalize" />,
            Entity: <EntityLink tableName={event.tableName} objectId={event.objectId} />,
          }}
          values={{
            actor: user ? getFullName(user) : 'Workflow',
            entity: entityLabel(event),
          }}
        />
      </span>
      <EventTime time={event.createdAt} />
    </div>
  );
}

function entityLabel(event: Pick<CaseEntityRemovedEvent, 'entityId' | 'tableName' | 'objectId'>) {
  if (event.tableName && event.objectId) return `${event.tableName} / ${event.objectId}`;
  return event.entityId;
}

function EntityLink({
  tableName,
  objectId,
  children,
}: {
  tableName?: string;
  objectId?: string;
  children?: ReactNode;
}) {
  const label = <bdi dir="auto">{children}</bdi>;
  if (!tableName || !objectId) {
    return <span className="font-medium">{label}</span>;
  }

  return (
    <Link
      to="/client-detail/$objectType/$objectId"
      params={clientDetailLinkParams(tableName, objectId)}
      className="font-medium underline"
    >
      {label}
    </Link>
  );
}
