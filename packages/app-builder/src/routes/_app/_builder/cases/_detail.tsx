import { BreadCrumbLink, type BreadCrumbProps } from '@app-builder/components/Breadcrumbs';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { caseDetailMiddleware } from '@app-builder/middlewares/case-detail-middleware';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';

const caseDetailLayoutLoader = createServerFn()
  .middleware([authMiddleware, caseDetailMiddleware])
  .inputValidator((input: { params?: Record<string, string> } | undefined) => input)
  .handler(async function caseDetailLayoutLoader({ context }) {
    return { caseDetail: context.case.detail, caseInbox: context.case.inbox };
  });

export const Route = createFileRoute('/_app/_builder/cases/_detail')({
  staticData: {
    BreadCrumbs: [
      ({ isLast, data }: BreadCrumbProps<Awaited<ReturnType<typeof caseDetailLayoutLoader>>>) => {
        const caseInbox = data.caseInbox;

        return (
          <BreadCrumbLink
            to="/cases/inboxes/$inboxId"
            params={{ inboxId: fromUUIDtoSUUID(caseInbox.id) }}
            isLast={isLast}
          >
            {caseInbox.name}
          </BreadCrumbLink>
        );
      },
      ({ isLast, data }: BreadCrumbProps<Awaited<ReturnType<typeof caseDetailLayoutLoader>>>) => {
        const caseDetail = data.caseDetail;

        return (
          <BreadCrumbLink to="/cases/$caseId" params={{ caseId: fromUUIDtoSUUID(caseDetail.id) }} isLast={isLast}>
            <span className="line-clamp-2 text-start">{caseDetail.name}</span>
          </BreadCrumbLink>
        );
      },
    ],
  },
  loader: ({ params }) => caseDetailLayoutLoader({ data: { params } }),
  component: () => <Outlet />,
});
