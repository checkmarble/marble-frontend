import { BreadCrumbLink, type BreadCrumbProps } from '@app-builder/components/Breadcrumbs';
import {
  DEFAULT_TRACFIN_SECTION,
  isTracfinSectionId,
  type TracfinSectionId,
} from '@app-builder/components/Tracfin/Draft/model/sections';
import { TracfinDraftPage } from '@app-builder/components/Tracfin/Draft/TracfinDraftPage';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { z } from 'zod/v4';

const searchSchema = z.object({
  // An unknown section in the URL falls back to the first one rather than failing the page.
  section: z.string().optional().catch(undefined),
});

export const Route = createFileRoute('/_app/_builder/cases/_detail/s/$caseId/tracfin')({
  staticData: {
    // The case breadcrumbs come from the case layout; this one names the page and links to the draft.
    BreadCrumbs: [TracfinBreadCrumb],
  },
  validateSearch: searchSchema,
  component: RouteComponent,
});

function TracfinBreadCrumb({ isLast }: BreadCrumbProps) {
  const { t } = useTranslation(['tracfin']);
  const { caseDetail } = Route.useRouteContext();
  return (
    <BreadCrumbLink to="/cases/s/$caseId/tracfin" params={{ caseId: fromUUIDtoSUUID(caseDetail.id) }} isLast={isLast}>
      {t('tracfin:draft.title')}
    </BreadCrumbLink>
  );
}

function RouteComponent() {
  const { caseDetail } = Route.useRouteContext();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const section: TracfinSectionId = isTracfinSectionId(search.section) ? search.section : DEFAULT_TRACFIN_SECTION;

  return (
    <TracfinDraftPage
      caseId={caseDetail.id}
      section={section}
      onSectionChange={(next) => void navigate({ search: { section: next }, replace: true })}
    />
  );
}
