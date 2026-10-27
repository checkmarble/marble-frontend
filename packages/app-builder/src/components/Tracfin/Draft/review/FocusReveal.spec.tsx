import { tracfinValidationFixture } from '@app-builder/models/tracfin/__fixtures__';
import { cleanup, screen, waitFor, within } from '@testing-library/react';
import { mockResizeObserver } from 'jsdom-testing-mocks';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { FakeDraftBackend } from '../test-utils/fake-backend';
import { connectPersons, type PersonsMocks } from '../test-utils/persons-harness';
import { personsDraft } from '../test-utils/persons-test-data';
import { ok, renderDraftPage } from '../test-utils/render-page';

const mocks = vi.hoisted(() => ({
  getCatalog: vi.fn(),
  getDraft: vi.fn(),
  createDraft: vi.fn(),
  patchDraft: vi.fn(),
  prefill: vi.fn(),
  validate: vi.fn(),
  exportDraft: vi.fn(),
  getContext: vi.fn(),
  navigate: vi.fn(),
  getDataModel: vi.fn(),
  getObjectDetails: vi.fn(),
}));

vi.mock('@app-builder/server-fns/tracfin', () => ({
  getTracfinCatalogFn: mocks.getCatalog,
  getTracfinDraftFn: mocks.getDraft,
  createTracfinDraftFn: mocks.createDraft,
  patchTracfinDraftFn: mocks.patchDraft,
  prefillTracfinDraftFn: mocks.prefill,
  validateTracfinDraftFn: mocks.validate,
  exportTracfinDraftFn: mocks.exportDraft,
  getTracfinContextFn: mocks.getContext,
  navigateTracfinFn: mocks.navigate,
}));
vi.mock('@app-builder/server-fns/data', () => ({
  getDataModelFn: mocks.getDataModel,
  getObjectDetailsFn: mocks.getObjectDetails,
}));
vi.mock('@app-builder/server-fns/cases', () => ({}));
vi.mock('@tanstack/react-start', () => ({ useServerFn: (fn: unknown) => fn }));
vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...actual,
    Link: ({ children, to }: { children: React.ReactNode; to: string }) => <a href={to}>{children}</a>,
    useBlocker: () => ({ status: 'idle', proceed: undefined, reset: undefined }),
  };
});

mockResizeObserver();
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});
vi.setConfig({ testTimeout: 30_000 });

beforeEach(() => {
  vi.clearAllMocks();
});
afterEach(cleanup);

const NOT_FOUND = 'This field is no longer in the draft or cannot be displayed.';
const DATE_OF_BIRTH = '/ds/personnes/pp/etatCivil/dateNaissance';

const missing = (blockId: string, fieldId: string) => ({
  code: 'MISSING_REQUIRED_VALUE',
  layer: 'internal_structure',
  severity: 'error',
  message: 'Required profile value is absent',
  field: { block_id: blockId, field_id: fieldId },
});

async function checkFrom(diagnostics: ReturnType<typeof missing>[]) {
  mocks.validate.mockResolvedValue(ok({ ...tracfinValidationFixture, diagnostics }));
  const backend = new FakeDraftBackend(personsDraft());
  connectPersons(mocks as unknown as PersonsMocks, backend);
  const rendered = await renderDraftPage({ initialSection: 'review' });
  await screen.findByRole('button', { name: 'Check the saved revision' });
  await rendered.user.click(screen.getByRole('button', { name: 'Check the saved revision' }));
  const card = await screen.findByRole('region', { name: 'Internal checks' });
  await within(card).findByTestId('diagnostic-counts');
  return { ...rendered, card };
}

describe('a diagnostic inside a collapsed container', () => {
  it('opens the person card, then focuses and highlights the field', async () => {
    const { user, section } = await checkFrom([missing('civil-1', DATE_OF_BIRTH)]);

    // The person card is collapsed on arrival: the field is not in the page.
    await user.click(screen.getByRole('button', { name: /^Persons/ }));
    const person = await screen.findByRole('region', { name: 'Jeanne Martin' });
    expect(within(person).getByRole('button', { name: 'Open' }).getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByLabelText('Date of birth')).toBeNull();

    await user.click(screen.getByRole('button', { name: /^Review and export/ }));
    await user.click(
      within(await screen.findByRole('region', { name: 'Internal checks' })).getByRole('button', {
        name: /^Go to field “Date of birth”/,
      }),
    );

    expect(section()).toBe('persons');
    const input = await screen.findByLabelText('Date of birth');
    await waitFor(() => expect(document.activeElement).toBe(input));
    expect(input.closest('[data-tracfin-field]')?.getAttribute('data-tracfin-highlight')).toBe('true');
    expect(
      within(await screen.findByRole('region', { name: 'Jeanne Martin' }))
        .getByRole('button', { name: 'Collapse' })
        .getAttribute('aria-expanded'),
    ).toBe('true');
    expect(screen.queryByText(NOT_FOUND)).toBeNull();
  });

  it('opens the card and highlights the block when the diagnostic names no field', async () => {
    const { user, card } = await checkFrom([missing('civil-1', '')]);
    await user.click(within(card).getByRole('button', { name: /^Go to field/ }));
    await waitFor(() => {
      const block = document.querySelector('[data-tracfin-block="civil-1"]');
      expect(block?.getAttribute('data-tracfin-highlight')).toBe('true');
      expect(block?.contains(document.activeElement)).toBe(true);
    });
  });
});

describe('a diagnostic whose target no longer exists', () => {
  it('opens the section and says so, instead of doing nothing', async () => {
    const { user, section, card } = await checkFrom([missing('deleted-block', DATE_OF_BIRTH)]);
    await user.click(within(card).getByRole('button', { name: /^Go to field “Date of birth”/ }));
    expect(section()).toBe('persons');
    const notice = await screen.findByText(NOT_FOUND, {}, { timeout: 3000 });
    expect(notice.closest('[role="status"]')).toBeTruthy();

    await user.click(within(notice.closest('[role="status"]') as HTMLElement).getByRole('button', { name: 'Close' }));
    expect(screen.queryByText(NOT_FOUND)).toBeNull();
  });
});
