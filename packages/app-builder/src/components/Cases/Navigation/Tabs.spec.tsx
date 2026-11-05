import { cleanup, render, screen } from '@testing-library/react';
import type { ComponentProps, ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CasesNavigationTabs } from './Tabs';

const access = vi.hoisted(() => ({ continuousScreening: 'allowed' }));
vi.mock('@tanstack/react-router', () => ({
  useLoaderData: () => ({ featuresAccess: access }),
  Link: ({
    to,
    children,
    search: _search,
    activeOptions: _activeOptions,
    ...props
  }: Omit<ComponentProps<'a'>, 'children'> & {
    to: string;
    children: ReactNode;
    search?: unknown;
    activeOptions?: unknown;
  }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
afterEach(() => {
  cleanup();
  access.continuousScreening = 'allowed';
});

describe('Case Manager screening review discovery', () => {
  it('shows entitled analysts Cases and Screening review without admin sections', () => {
    render(<CasesNavigationTabs showAdminSections={false} />);
    expect(screen.getAllByRole('link').map((link) => link.getAttribute('href'))).toEqual([
      '/cases/inboxes',
      '/cases/screening-review',
    ]);
  });

  it('preserves Overview, Analytics and Cases for admins', () => {
    render(<CasesNavigationTabs />);
    expect(screen.getAllByRole('link').map((link) => link.getAttribute('href'))).toEqual([
      '/cases/overview',
      '/cases/analytics',
      '/cases/inboxes',
      '/cases/screening-review',
    ]);
  });

  it.each(['restricted', 'missing_configuration'])('hides review when continuous screening is %s', (level) => {
    access.continuousScreening = level;
    render(<CasesNavigationTabs />);
    expect(screen.queryByRole('link', { name: 'cases:screening_review.title' })).toBeNull();
    expect(screen.getAllByRole('link')).toHaveLength(3);
  });
});
