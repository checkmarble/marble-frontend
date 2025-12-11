import { CopyToClipboardButton } from '@app-builder/components/CopyToClipboardButton';
import { PanelContainer, PanelContent, PanelHeader, PanelOverlay } from '@app-builder/components/Panel';
import { type AuditEvent } from '@app-builder/models/audit-event';
import { formatDateTimeWithoutPresets, useFormatLanguage } from '@app-builder/utils/format';
import { useTranslation } from 'react-i18next';

import { JsonDiff } from './JsonDiff';
import { OperationBadge } from './OperationBadge';

interface AuditEventDetailPanelProps {
  event: AuditEvent;
}

export function AuditEventDetailPanel({ event }: AuditEventDetailPanelProps) {
  const { t } = useTranslation(['settings']);
  const language = useFormatLanguage();

  return (
    <PanelOverlay>
      <PanelContainer size="xl">
        <PanelHeader>{t('settings:activity_follow_up.detail.title')}</PanelHeader>
        <PanelContent>
          <div className="flex flex-col gap-6">
            {/* Event metadata */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-grey-50 text-xs">{t('settings:activity_follow_up.table.timestamp')}</span>
                <span className="text-grey-00 text-sm">
                  {event.createdAt
                    ? formatDateTimeWithoutPresets(event.createdAt, {
                        language,
                        dateStyle: 'medium',
                        timeStyle: 'medium',
                      })
                    : '-'}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-grey-50 text-xs">{t('settings:activity_follow_up.table.operation')}</span>
                <OperationBadge operation={event.operation} />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-grey-50 text-xs">
                  {event.actor?.type === 'api_key'
                    ? t('settings:activity_follow_up.detail.api_key_name')
                    : t('settings:activity_follow_up.detail.user_email')}
                </span>
                <span className="text-grey-00 text-sm">{event.actor?.name ?? '-'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-grey-50 text-xs">{t('settings:activity_follow_up.table.table')}</span>
                <span className="text-grey-00 text-sm">{event.table ?? '-'}</span>
              </div>
              <div className="col-span-2 flex flex-col gap-1">
                <span className="text-grey-50 text-xs">{t('settings:activity_follow_up.table.entity_id')}</span>
                {event.entityId ? (
                  <CopyToClipboardButton toCopy={event.entityId} size="sm">
                    <span className="text-grey-00 font-mono text-sm">{event.entityId}</span>
                  </CopyToClipboardButton>
                ) : (
                  <span className="text-grey-50 text-sm">-</span>
                )}
              </div>
            </div>

            {/* JSON diff */}
            <div className="flex flex-col gap-2">
              <span className="text-grey-00 text-sm font-semibold">{t('settings:activity_follow_up.detail.data')}</span>
              <JsonDiff oldData={event.oldData} newData={event.newData} />
            </div>
          </div>
        </PanelContent>
      </PanelContainer>
    </PanelOverlay>
  );
}
