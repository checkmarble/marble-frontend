import { cleanup, screen, waitFor } from '@testing-library/react';
import { mockResizeObserver } from 'jsdom-testing-mocks';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { TracfinBlockEditor } from './fields/TracfinBlockEditor';
import { LeaveGuard } from './LeaveGuard';
import { topLevelAddress } from './sections/section-addresses';
import { cloneDraft, draftTestCatalog } from './test-utils/draft-test-data';
import { FakeDraftBackend } from './test-utils/fake-backend';
import { connectBackend, renderWithEditor } from './test-utils/render-page';

const mocks = vi.hoisted(() => ({
  getCatalog: vi.fn(),
  getDraft: vi.fn(),
  createDraft: vi.fn(),
  patchDraft: vi.fn(),
  blocker: {
    options: undefined as undefined | { shouldBlockFn: (args: never) => boolean; enableBeforeUnload: () => boolean },
    status: 'idle' as 'idle' | 'blocked',
    proceed: vi.fn(),
    reset: vi.fn(),
  },
}));

vi.mock('@app-builder/server-fns/tracfin', () => ({
  getTracfinCatalogFn: mocks.getCatalog,
  getTracfinDraftFn: mocks.getDraft,
  createTracfinDraftFn: mocks.createDraft,
  patchTracfinDraftFn: mocks.patchDraft,
}));
vi.mock('@app-builder/server-fns/data', () => ({}));
vi.mock('@tanstack/react-start', () => ({ useServerFn: (fn: unknown) => fn }));
vi.mock('@tanstack/react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tanstack/react-router')>()),
  useBlocker: (options: NonNullable<typeof mocks.blocker.options>) => {
    mocks.blocker.options = options;
    return mocks.blocker.status === 'blocked'
      ? { status: 'blocked', proceed: mocks.blocker.proceed, reset: mocks.blocker.reset }
      : { status: 'idle', proceed: undefined, reset: undefined };
  },
}));
vi.mock('@app-builder/server-fns/cases', () => ({}));

mockResizeObserver();
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

beforeEach(() => {
  vi.clearAllMocks();
  mocks.blocker.status = 'idle';
  mocks.getCatalog.mockResolvedValue({ ok: true, data: draftTestCatalog });
});
afterEach(cleanup);

const leaving = { current: { pathname: '/cases/s/a/tracfin' }, next: { pathname: '/cases/s/a/principal' } } as never;
const sameRoute = { current: { pathname: '/cases/s/a/tracfin' }, next: { pathname: '/cases/s/a/tracfin' } } as never;

async function render() {
  const backend = new FakeDraftBackend(cloneDraft());
  connectBackend(mocks, backend);
  const view = await renderWithEditor((draft) => (
    <>
      <TracfinBlockEditor address={topLevelAddress(draft, '/ds/organisme')} catalogId="/ds/organisme" />
      <LeaveGuard />
    </>
  ));
  return { ...view, backend };
}

describe('LeaveGuard', () => {
  it('blocks leaving the route only while edits are unsaved, never a change of section', async () => {
    const { user } = await render();
    expect(mocks.blocker.options?.shouldBlockFn(leaving)).toBe(false);
    expect(mocks.blocker.options?.enableBeforeUnload()).toBe(false);

    await user.type(screen.getByLabelText('Organisation name'), '!');
    expect(mocks.blocker.options?.shouldBlockFn(leaving)).toBe(true);
    expect(mocks.blocker.options?.enableBeforeUnload()).toBe(true);
    expect(mocks.blocker.options?.shouldBlockFn(sameRoute)).toBe(false);
  });

  it('offers to stay, leave without saving, or save and leave', async () => {
    mocks.blocker.status = 'blocked';
    const { user, backend } = await render();
    const dialog = await screen.findByRole('dialog');
    expect(dialog.textContent).toContain('Unsaved changes');

    await user.click(screen.getByRole('button', { name: 'Leave without saving' }));
    expect(mocks.blocker.proceed).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', { name: 'Stay' }));
    expect(mocks.blocker.reset).toHaveBeenCalled();
    expect(backend.bodies).toHaveLength(0);
  });

  it('saves before leaving', async () => {
    const { user, backend } = await render();
    await user.type(screen.getByLabelText('Organisation name'), '!');
    // The analyst now tries to leave: the next render shows the dialog.
    mocks.blocker.status = 'blocked';
    await user.type(screen.getByLabelText('Organisation name'), '?');
    await screen.findByRole('dialog');
    // (Opening the dialog moves the focus away from the field, which already saves it on blur.)
    await user.click(screen.getByRole('button', { name: 'Save and leave' }));
    await waitFor(() => expect(mocks.blocker.proceed).toHaveBeenCalledTimes(1));
    expect(backend.bodies).toHaveLength(1);
    expect(backend.lastBody.changes[0]?.value?.text).toBe('Banque Exemple SA!?');
  });
});
