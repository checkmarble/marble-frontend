import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Tabs } from './Tabs';

describe('Tabs', () => {
  it('renders a tablist', () => {
    render(
      <Tabs>
        <Tabs.Button>Account</Tabs.Button>
      </Tabs>,
    );

    expect(screen.getByRole('tablist')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Account' })).toBeInTheDocument();
  });

  it('marks the matching button as active from the parent value', () => {
    render(
      <Tabs value="password">
        <Tabs.Button value="account">Account</Tabs.Button>
        <Tabs.Button value="password">Password</Tabs.Button>
      </Tabs>,
    );

    expect(screen.getByRole('tab', { name: 'Account' })).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByRole('tab', { name: 'Password' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Password' })).toHaveAttribute('data-status', 'active');
  });

  it('calls onValueChange with the button value when clicked', async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();

    render(
      <Tabs value="account" onValueChange={onValueChange}>
        <Tabs.Button value="password">Password</Tabs.Button>
      </Tabs>,
    );

    await user.click(screen.getByRole('tab', { name: 'Password' }));

    expect(onValueChange).toHaveBeenCalledWith('password');
  });

  it('does not call onValueChange when the click is prevented', async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();

    render(
      <Tabs value="account" onValueChange={onValueChange}>
        <Tabs.Button
          value="password"
          onClick={(event) => {
            event.preventDefault();
          }}
        >
          Password
        </Tabs.Button>
      </Tabs>,
    );

    await user.click(screen.getByRole('tab', { name: 'Password' }));

    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('lets the active prop override the parent value', () => {
    render(
      <Tabs value="account">
        <Tabs.Button value="account" active={false}>
          Account
        </Tabs.Button>
        <Tabs.Button value="password" active>
          Password
        </Tabs.Button>
      </Tabs>,
    );

    expect(screen.getByRole('tab', { name: 'Account' })).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByRole('tab', { name: 'Password' })).toHaveAttribute('data-status', 'active');
  });

  it('renders links in a navigation landmark without tab roles', () => {
    render(
      <Tabs.Nav aria-label="Sections">
        <Tabs.Link href="/overview">Overview</Tabs.Link>
      </Tabs.Nav>,
    );

    expect(screen.getByRole('navigation', { name: 'Sections' })).toBeInTheDocument();
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
    const link = screen.getByRole('link', { name: 'Overview' });
    expect(link).toHaveAttribute('href', '/overview');
    expect(link.tagName).toBe('A');
  });

  it('merges tab styles onto a child link when asChild is set', () => {
    render(
      <Tabs.Nav>
        <Tabs.Link asChild>
          <a href="/analytics">Analytics</a>
        </Tabs.Link>
      </Tabs.Nav>,
    );

    const link = screen.getByRole('link', { name: 'Analytics' });
    expect(link).toHaveAttribute('href', '/analytics');
    expect(link).toHaveClass('text-s');
  });

  it('sets data-status on a link when active is passed', () => {
    render(
      <Tabs.Nav>
        <Tabs.Link href="/rulesets" active>
          Ruleset
        </Tabs.Link>
      </Tabs.Nav>,
    );

    expect(screen.getByRole('link', { name: 'Ruleset' })).toHaveAttribute('data-status', 'active');
  });

  it('applies the grey color variant to the tablist, the nav and their items', () => {
    render(
      <>
        <Tabs color="grey" value="password">
          <Tabs.Button value="account">Account</Tabs.Button>
          <Tabs.Button value="password">Password</Tabs.Button>
        </Tabs>
        <Tabs.Nav color="grey">
          <Tabs.Link href="/overview">Overview</Tabs.Link>
        </Tabs.Nav>
      </>,
    );

    expect(screen.getByRole('tablist')).not.toHaveClass('bg-purple-background');
    expect(screen.getByRole('navigation')).not.toHaveClass('bg-purple-background');
    expect(screen.getByRole('tab', { name: 'Account' })).toHaveClass('border-grey-border');
    expect(screen.getByRole('tab', { name: 'Password' })).toHaveClass('border-grey-border');
    expect(screen.getByRole('link', { name: 'Overview' })).toHaveClass('border-grey-border');
    expect(screen.getByRole('tab', { name: 'Account' })).not.toHaveClass('bg-purple-background');
  });

  it('links each button to its panel when the tabs have an id', () => {
    render(
      <>
        <Tabs id="settings" value="password">
          <Tabs.Button value="account">Account</Tabs.Button>
          <Tabs.Button value="password">Password</Tabs.Button>
        </Tabs>
        <Tabs.Panel tabsId="settings" value="password">
          Password content
        </Tabs.Panel>
      </>,
    );

    const tab = screen.getByRole('tab', { name: 'Password' });
    const panel = screen.getByRole('tabpanel', { name: 'Password' });
    expect(tab).toHaveAttribute('aria-controls', panel.id);
    expect(panel).toHaveAttribute('aria-labelledby', tab.id);
    expect(panel).toHaveTextContent('Password content');
  });

  it('moves focus and selection with the arrow keys', async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();

    render(
      <Tabs value="account" onValueChange={onValueChange}>
        <Tabs.Button value="account">Account</Tabs.Button>
        <Tabs.Button value="password" disabled>
          Password
        </Tabs.Button>
        <Tabs.Button value="settings">Settings</Tabs.Button>
      </Tabs>,
    );

    await user.click(screen.getByRole('tab', { name: 'Account' }));
    onValueChange.mockClear();

    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Settings' })).toHaveFocus();
    expect(onValueChange).toHaveBeenLastCalledWith('settings');

    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Account' })).toHaveFocus();
    expect(onValueChange).toHaveBeenLastCalledWith('account');

    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('tab', { name: 'Settings' })).toHaveFocus();

    await user.keyboard('{Home}');
    expect(screen.getByRole('tab', { name: 'Account' })).toHaveFocus();
  });

  it('passes its ref to the button element', () => {
    const ref = createRef<HTMLButtonElement>();

    render(
      <Tabs>
        <Tabs.Button ref={ref}>Account</Tabs.Button>
      </Tabs>,
    );

    expect(ref.current).toBe(screen.getByRole('tab', { name: 'Account' }));
  });
});
