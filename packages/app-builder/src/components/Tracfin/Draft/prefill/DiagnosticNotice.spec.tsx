import { cleanup, screen } from '@testing-library/react';
import { mockResizeObserver } from 'jsdom-testing-mocks';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { cloneDraft, draftTestCatalog } from '../test-utils/draft-test-data';
import { FakeDraftBackend } from '../test-utils/fake-backend';
import { connectBackend, ok, renderWithEditor } from '../test-utils/render-page';
import { DiagnosticNotice } from './DiagnosticNotice';

const mocks = vi.hoisted(() => ({
  getCatalog: vi.fn(),
  getDraft: vi.fn(),
  createDraft: vi.fn(),
  patchDraft: vi.fn(),
}));

vi.mock('@app-builder/server-fns/tracfin', () => ({
  getTracfinCatalogFn: mocks.getCatalog,
  getTracfinDraftFn: mocks.getDraft,
  createTracfinDraftFn: mocks.createDraft,
  patchTracfinDraftFn: mocks.patchDraft,
}));
vi.mock('@app-builder/server-fns/data', () => ({}));
vi.mock('@app-builder/server-fns/cases', () => ({}));
vi.mock('@tanstack/react-start', () => ({ useServerFn: (fn: unknown) => fn }));

mockResizeObserver();
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});
beforeEach(() => {
  vi.clearAllMocks();
  mocks.getCatalog.mockResolvedValue(ok(draftTestCatalog));
  connectBackend(mocks, new FakeDraftBackend(cloneDraft()));
});
afterEach(cleanup);

const diagnostic = (code: string, message: string) => ({ code, layer: 'sources', severity: 'warning', message });

describe('DiagnosticNotice', () => {
  it('says a known code in French wording', async () => {
    await renderWithEditor(() => <DiagnosticNotice diagnostic={diagnostic('SOURCE_UNAVAILABLE', 'server wording')} />);
    expect(screen.queryByText('server wording')).toBeNull();
    expect(screen.getByRole('note').textContent?.trim()).not.toBe('');
  });

  it('falls back to the server message for a code that has no text, not to « unrecognized diagnostic »', async () => {
    await renderWithEditor(() => (
      <DiagnosticNotice diagnostic={diagnostic('SOME_NEW_BACKEND_CODE', 'The source value is not usable.')} />
    ));
    expect(screen.getByText('The source value is not usable.')).toBeTruthy();
    expect(screen.queryByText(/Unrecognized diagnostic/)).toBeNull();
  });

  it('keeps the generic sentence only when the server gave no message either', async () => {
    await renderWithEditor(() => <DiagnosticNotice diagnostic={diagnostic('SOME_NEW_BACKEND_CODE', '  ')} />);
    expect(screen.getByText('Unrecognized diagnostic (SOME_NEW_BACKEND_CODE).')).toBeTruthy();
  });
});
