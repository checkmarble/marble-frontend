import { BreadCrumbLink, type BreadCrumbProps } from '@app-builder/components/Breadcrumbs';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { caseDetailMiddleware } from '@app-builder/middlewares/case-detail-middleware';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import * as R from 'remeda';

const beforeLoadFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    return {
      inboxes: await context.authInfo.inbox.listInboxes(),
    };
  });

const caseDetailLayoutLoader = createServerFn()
  .middleware([authMiddleware, caseDetailMiddleware])
  .validator((input: { params?: Record<string, string> } | undefined) => input)
  .handler(async function caseDetailLayoutLoader({ context }) {
    return {
      detail: R.pick(context.case.detail, ['id', 'name']),
      inbox: R.pick(context.case.inbox, ['id', 'name']),
    };
  });

export const Route = createFileRoute('/_app/_builder/cases/_detail')({
  staticData: {
    BreadCrumbs: [
      ({ isLast, data }: BreadCrumbProps<Awaited<ReturnType<typeof caseDetailLayoutLoader>>>) => {
        return (
          <BreadCrumbLink
            to="/cases/inboxes/$inboxId"
            params={{ inboxId: fromUUIDtoSUUID(data.inbox.id) }}
            isLast={isLast}
          >
            {data.inbox.name}
          </BreadCrumbLink>
        );
      },
      ({ isLast, data }: BreadCrumbProps<Awaited<ReturnType<typeof caseDetailLayoutLoader>>>) => {
        return (
          <BreadCrumbLink to="/cases/$caseId" params={{ caseId: fromUUIDtoSUUID(data.detail.id) }} isLast={isLast}>
            <span className="line-clamp-2 text-start">{data.detail.name}</span>
          </BreadCrumbLink>
        );
      },
    ],
  },
  beforeLoad: () => beforeLoadFn(),
  loader: ({ params }) => caseDetailLayoutLoader({ data: { params } }),
  component: () => <Outlet />,
});
