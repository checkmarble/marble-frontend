import type { CaseDetail } from '@app-builder/models/cases';
import '@app-builder/tests/setup/i18next';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import i18next from 'i18next';
import { mockIntersectionObserver, mockResizeObserver } from 'jsdom-testing-mocks';
import { I18nextProvider } from 'react-i18next';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { CaseManagerPageLayout } from './PageLayout';

const mocks = vi.hoisted(() => ({ navigate: vi.fn(), sarReports: vi.fn() }));

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => <a href={to}>{children}</a>,
  useMatches: () => [],
  useParams: () => ({}),
  useRouter: () => ({ buildLocation: () => ({ href: '/next' }) }),
  useNavigate: () => mocks.navigate,
}));
vi.mock('@tanstack/react-start', () => ({ useServerFn: (fn: unknown) => fn }));
vi.mock('@app-builder/components', async () => ({ Page: (await import('@app-builder/components/Page')).Page }));
vi.mock('@app-builder/components/Breadcrumbs', () => ({ BreadCrumbs: () => null }));
vi.mock('@app-builder/queries/cases/sar-report', () => ({ useSarReportsQuery: mocks.sarReports }));
vi.mock('@app-builder/queries/cases/edit-suspicion', () => ({
  useEditSuspicionMutation: () => ({ mutateAsync: vi.fn() }),
  editSuspicionPayloadSchema: {
    parse: vi.fn(),
    safeParse: vi.fn(),
    '~standard': { validate: vi.fn(), vendor: 'test', version: 1 },
  },
}));
vi.mock('@app-builder/queries/data/get-annotations', () => ({ useGetAnnotationsQuery: () => ({}) }));
vi.mock('@app-builder/server-fns/cases', () => ({ getNextUnassignedCaseFn: vi.fn() }));
vi.mock('@app-builder/hooks/useFormDropzone', () => ({
  useFormDropzone: () => ({ getRootProps: () => ({}), getInputProps: () => ({}), isDragActive: false }),
}));
vi.mock('@app-builder/services/data/data-model', () => ({
  DataModelContextProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('@app-builder/services/feature-access', () => ({ getGraphExplorationDisplay: () => 'hidden' }));
vi.mock('./graph-pivots', () => ({ getGraphEligibleClients: () => [] }));
vi.mock('./hooks/comment-context', () => ({ CommentContext: { useValue: () => ({ info: null, set: vi.fn() }) } }));
vi.mock('./ClientComments', () => ({ ClientCommentForm: () => null }));
vi.mock('./KycEnrichment/KycEnrichmentPanel', () => ({ KycEnrichmentPanel: () => null }));
vi.mock('../Cases/CloseCase', () => ({ CloseCase: () => null }));
vi.mock('../Cases/OpenCase', () => ({ OpenCase: () => null }));
vi.mock('../Cases/SnoozeCase', () => ({ SnoozeCase: () => null }));
vi.mock('../Cases/SarReportDownload', () => ({ SarReportDownload: () => null }));

mockResizeObserver();
mockIntersectionObserver();
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

beforeEach(() => {
  vi.clearAllMocks();
  mocks.sarReports.mockReturnValue({ data: undefined });
});
afterEach(cleanup);

function renderLayout(outcome: CaseDetail['outcome']) {
  const caseDetail = {
    id: '2c1f0a9e-84b4-4f3c-9a55-0d6a8f6a8c11',
    status: 'open',
    outcome,
    snoozedUntil: undefined,
  } as unknown as CaseDetail;
  render(
    <QueryClientProvider client={new QueryClient()}>
      <I18nextProvider i18n={i18next}>
        <CaseManagerPageLayout
          caseDetail={caseDetail}
          pivotObjects={[]}
          caseClients={[]}
          dataModel={{} as never}
          dataModelFeatureAccess={{} as never}
        >
          <div>case content</div>
        </CaseManagerPageLayout>
      </I18nextProvider>
    </QueryClientProvider>,
  );
}

describe('case action area (i)', () => {
  it('keeps the manual SAR action as it was, whatever the outcome', async () => {
    for (const outcome of ['unset', 'confirmed_risk'] as const) {
      renderLayout(outcome);
      expect(screen.getByRole('button', { name: 'Report suspicious activity' })).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Enrich KYC profile' })).toBeTruthy();
      cleanup();
    }
  });

  it('still opens the SAR modal from the SAR action', async () => {
    const user = userEvent.setup();
    renderLayout('confirmed_risk');
    await user.click(screen.getByRole('button', { name: 'Report suspicious activity' }));
    expect(await screen.findByRole('dialog')).toBeTruthy();
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it('offers the TRACFIN declaration only when the case outcome is set, next to the SAR action', async () => {
    const user = userEvent.setup();
    renderLayout('unset');
    expect(screen.queryByRole('button', { name: 'TRACFIN declaration' })).toBeNull();
    cleanup();

    renderLayout('false_positive');
    const tracfin = screen.getByRole('button', { name: 'TRACFIN declaration' });
    const sar = screen.getByRole('button', { name: 'Report suspicious activity' });
    expect(sar.parentElement).toBe(tracfin.parentElement);
    await user.click(tracfin);
    expect(mocks.navigate).toHaveBeenCalledWith({
      to: '/cases/s/$caseId/tracfin',
      params: { caseId: expect.any(String) },
    });
  });
});
