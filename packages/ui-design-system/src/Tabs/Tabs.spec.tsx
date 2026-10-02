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

  it('renders a link tab', () => {
    render(
      <Tabs>
        <Tabs.Link href="/overview">Overview</Tabs.Link>
      </Tabs>,
    );

    const link = screen.getByRole('tab', { name: 'Overview' });
    expect(link).toHaveAttribute('href', '/overview');
    expect(link.tagName).toBe('A');
  });

  it('merges tab styles onto a child link when asChild is set', () => {
    render(
      <Tabs>
        <Tabs.Link asChild>
          <a href="/analytics">Analytics</a>
        </Tabs.Link>
      </Tabs>,
    );

    const link = screen.getByRole('tab', { name: 'Analytics' });
    expect(link).toHaveAttribute('href', '/analytics');
    expect(link).toHaveClass('text-s');
  });

  it('sets data-status on a link when active is passed', () => {
    render(
      <Tabs>
        <Tabs.Link href="/rulesets" active>
          Ruleset
        </Tabs.Link>
      </Tabs>,
    );

    expect(screen.getByRole('tab', { name: 'Ruleset' })).toHaveAttribute('data-status', 'active');
  });

  it('applies the grey color variant to the tablist and its items', () => {
    render(
      <Tabs color="grey" value="password">
        <Tabs.Button value="account">Account</Tabs.Button>
        <Tabs.Button value="password">Password</Tabs.Button>
        <Tabs.Link href="/overview">Overview</Tabs.Link>
      </Tabs>,
    );

    expect(screen.getByRole('tablist')).not.toHaveClass('bg-purple-background');
    expect(screen.getByRole('tab', { name: 'Account' })).toHaveClass('border-grey-border');
    expect(screen.getByRole('tab', { name: 'Password' })).toHaveClass('border-grey-border');
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveClass('border-grey-border');
    expect(screen.getByRole('tab', { name: 'Account' })).not.toHaveClass('bg-purple-background');
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
