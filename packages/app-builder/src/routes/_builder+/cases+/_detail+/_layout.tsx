import { CopyToClipboardButton } from '@app-builder/components';
import { BreadCrumbLink, type BreadCrumbProps } from '@app-builder/components/Breadcrumbs';
import { createServerFn, data } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { caseDetailMiddleware } from '@app-builder/middlewares/case-detail-middleware';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { type SerializeFrom } from '@remix-run/node';
import { Outlet } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';

export const loader = createServerFn(
  [authMiddleware, caseDetailMiddleware],
  async function caseDetailLayoutLoader({ request, context }) {
    return data({ caseDetail: context.case.detail, caseInbox: context.case.inbox });
  },
);

export const handle = {
  i18n: ['common', 'cases', 'decisions'] satisfies Namespace,
  BreadCrumbs: [
    ({ isLast }: BreadCrumbProps) => {
      const { t } = useTranslation(['navigation']);

      return (
        <BreadCrumbLink to={getRoute('/cases')} isLast={isLast}>
          <Icon icon="case-manager" className="me-2 size-6" />
          {t('navigation:case_manager')}
        </BreadCrumbLink>
      );
    },
    ({ isLast, data }: BreadCrumbProps<SerializeFrom<typeof loader>>) => {
      const caseInbox = data.caseInbox;

      return (
        <BreadCrumbLink
          to={getRoute('/cases/inboxes/:inboxId', {
            inboxId: fromUUIDtoSUUID(caseInbox.id),
          })}
          isLast={isLast}
        >
          {caseInbox.name}
        </BreadCrumbLink>
      );
    },
    ({ isLast, data }: BreadCrumbProps<SerializeFrom<typeof loader>>) => {
      const caseDetail = data.caseDetail; // Safely access caseDetail from the loader data

      return (
        <div className="flex items-center gap-4">
          <BreadCrumbLink to={getRoute('/cases/:caseId', { caseId: fromUUIDtoSUUID(caseDetail.id) })} isLast={isLast}>
            <span className="line-clamp-2 text-start">{caseDetail.name}</span>
          </BreadCrumbLink>
          <CopyToClipboardButton toCopy={caseDetail.id}>
            <span className="text-small flex max-w-40 gap-1 font-normal">
              <span className="shrink-0 font-medium">ID</span>{' '}
              <span className="text-rtl truncate">{caseDetail.id}</span>
            </span>
          </CopyToClipboardButton>
        </div>
      );
    },
  ],
};

export default function CaseDetailLayout() {
  return <Outlet />;
}
