import { beforeEach, describe, expect, it, vi } from 'vitest';

const session: { data: { toastMessage?: unknown }; update: (update: { toastMessage: unknown }) => Promise<void> } = {
  data: {},
  update: async ({ toastMessage }) => {
    session.data.toastMessage = toastMessage;
  },
};

vi.mock('@tanstack/react-start/server', () => ({ useSession: async () => session }));
vi.mock('@app-builder/utils/environment', () => ({ getServerEnv: () => 'secret' }));

const toast = { type: 'error', message: 'The organization could not be changed.' };
const pageRequest = (path: string) => new Request(`https://app.example${path}`);

describe('getToastForPage', () => {
  beforeEach(() => {
    session.data = { toastMessage: toast };
  });

  it('keeps the toast through /app-router, for the page it redirects to', async () => {
    const { getToastForPage } = await import('./toast.server');

    await expect(getToastForPage(pageRequest('/app-router'))).resolves.toBeUndefined();
    await expect(getToastForPage(pageRequest('/detection'))).resolves.toMatchObject(toast);
  });

  it('shows a toast once', async () => {
    const { getToastForPage } = await import('./toast.server');

    await getToastForPage(pageRequest('/detection'));

    await expect(getToastForPage(pageRequest('/detection'))).resolves.toBeUndefined();
  });
});
