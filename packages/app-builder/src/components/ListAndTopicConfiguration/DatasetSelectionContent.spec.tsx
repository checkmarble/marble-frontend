import type { ScreeningProviders } from '@app-builder/models/screening';
import type { ListConfigFilters } from '@app-builder/queries/screening/lists-config';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { mockResizeObserver } from 'jsdom-testing-mocks';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ListAndTopicDatasetConfiguration,
  type ListAndTopicDatasetConfigurationVariant,
} from './context/ListAndTopicDatasetConfiguration';
import { DatasetSelectionContent } from './DatasetSelectionContent';
import { getCanonicalSelectedKeys } from './dataset-selection-provider-utils';

const { query } = vi.hoisted(() => ({ query: vi.fn() }));
vi.mock('@app-builder/queries/screening/lists-config', () => ({ useListConfigQuery: query }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

mockResizeObserver();
afterEach(cleanup);

const filters: ListConfigFilters = {
  sanctions: {
    datasets: [
      { name: 'europe', title: 'Europe', datasets: [{ name: 'eu', title: 'EU sanctions' }] },
      { name: 'america', title: 'America', datasets: [{ name: 'us', title: 'US sanctions' }] },
    ],
  },
  peps: { topics: { country: [{ name: 'fr', title: 'France' }] } },
};

function renderSelection({
  provider = 'lexisnexis',
  variant = 'default',
  datasets = {},
  availableFilters = filters,
}: {
  provider?: ScreeningProviders;
  variant?: ListAndTopicDatasetConfigurationVariant;
  datasets?: Record<string, boolean>;
  availableFilters?: ListConfigFilters;
} = {}) {
  query.mockReturnValue({
    isSuccess: true,
    isPending: false,
    isError: false,
    data: { filters: availableFilters, provider },
  });

  function Harness() {
    const sharp = ListAndTopicDatasetConfiguration.createSharp({ datasets, provider, variant, mode: 'edit' });
    return (
      <ListAndTopicDatasetConfiguration.Provider value={sharp}>
        <DatasetSelectionContent useCase="continuous_monitoring" />
        <SelectedKeys />
      </ListAndTopicDatasetConfiguration.Provider>
    );
  }

  return render(<Harness />);
}

function SelectedKeys() {
  const datasets = ListAndTopicDatasetConfiguration.select((state) => state.datasets);
  return <output data-testid="selected-keys">{JSON.stringify(getCanonicalSelectedKeys(datasets))}</output>;
}

function selectedKeys() {
  return JSON.parse(screen.getByTestId('selected-keys').textContent ?? '[]');
}

describe('section list selection', () => {
  it.each(['lexisnexis', 'opensanctions'] as const)(
    'selects and clears every sanctions list with the section checkbox for %s',
    (provider) => {
      renderSelection({ provider, datasets: { peps: true } });
      const checkbox = screen.getAllByRole('checkbox')[0]!;
      expect(screen.getByText('0 / 2')).toBeDefined();

      fireEvent.click(checkbox);
      expect(selectedKeys()).toEqual(['peps', 'sanctions', 'sanctions:dataset:eu', 'sanctions:dataset:us']);
      expect(screen.getByText('2 / 2')).toBeDefined();
      expect(checkbox.getAttribute('aria-checked')).toBe('true');

      fireEvent.click(checkbox);
      expect(selectedKeys()).toEqual(['peps']);
      expect(screen.getByText('0 / 2')).toBeDefined();
      expect(checkbox.getAttribute('aria-checked')).toBe('false');
    },
  );

  it('selects and clears sanctions lists with the popover section switch', () => {
    renderSelection({ variant: 'popover' });
    fireEvent.click(screen.getByRole('button', { name: /scenarios:sanction.lists.sanctions/ }));
    const toggle = screen.getByRole('switch');

    fireEvent.click(toggle);
    expect(selectedKeys()).toEqual(['sanctions', 'sanctions:dataset:eu', 'sanctions:dataset:us']);
    fireEvent.click(toggle);
    expect(selectedKeys()).toEqual([]);
  });

  it('keeps the section checkbox aligned when individual lists are selected or cleared', () => {
    renderSelection();
    const checkbox = screen.getAllByRole('checkbox')[0]!;
    fireEvent.click(screen.getByText('scenarios:sanction.lists.sanctions'));
    fireEvent.click(screen.getByText('Europe'));
    const listCheckbox = screen.getByRole('checkbox', { name: 'EU sanctions' });

    fireEvent.click(listCheckbox);
    expect(selectedKeys()).toEqual(['sanctions', 'sanctions:dataset:eu']);
    expect(checkbox.getAttribute('aria-checked')).toBe('true');
    expect(screen.getByText('1 / 2')).toBeDefined();

    fireEvent.click(listCheckbox);
    expect(selectedKeys()).toEqual([]);
    expect(checkbox.getAttribute('aria-checked')).toBe('false');
  });

  it('keeps the section checkbox aligned when a list group is selected or cleared', () => {
    renderSelection();
    const checkbox = screen.getAllByRole('checkbox')[0]!;
    fireEvent.click(screen.getByText('scenarios:sanction.lists.sanctions'));
    const groupCheckbox = screen.getAllByRole('checkbox', {
      name: 'continuousScreening:creation.datasetSelection.list.section.select_all',
    })[0]!;

    fireEvent.click(groupCheckbox);
    expect(checkbox.getAttribute('aria-checked')).toBe('true');
    expect(screen.getByText('1 / 2')).toBeDefined();
    fireEvent.click(groupCheckbox);
    expect(checkbox.getAttribute('aria-checked')).toBe('false');
    expect(selectedKeys()).toEqual([]);
  });

  it('preserves LexisNexis topic filters when toggling a topic-only section', () => {
    renderSelection({ datasets: { 'peps:topic:country:fr': true } });
    const checkbox = screen.getAllByRole('checkbox')[1]!;
    fireEvent.click(checkbox);
    expect(selectedKeys()).toEqual(['peps', 'peps:topic:country:fr']);
    fireEvent.click(checkbox);
    expect(selectedKeys()).toEqual(['peps:topic:country:fr']);
  });

  it.each(['default', 'popover'] as const)('keeps a single LexisNexis section enabled in %s mode', (variant) => {
    renderSelection({
      variant,
      datasets: { 'sanctions:dataset:eu': true },
      availableFilters: { sanctions: filters.sanctions },
    });
    if (variant === 'default') fireEvent.click(screen.getByText('scenarios:sanction.lists.sanctions'));
    else fireEvent.click(screen.getByRole('button', { name: /scenarios:sanction.lists.sanctions/ }));
    fireEvent.click(screen.getByText('Europe'));
    fireEvent.click(screen.getByRole('checkbox', { name: 'EU sanctions' }));
    expect(selectedKeys()).toEqual(['sanctions']);

    const groupCheckbox = screen.getAllByRole('checkbox', {
      name: 'continuousScreening:creation.datasetSelection.list.section.select_all',
    })[0]!;
    fireEvent.click(groupCheckbox);
    fireEvent.click(groupCheckbox);
    expect(selectedKeys()).toEqual(['sanctions']);
    const sectionControl = screen.getAllByRole(variant === 'default' ? 'checkbox' : 'switch')[0]!;
    expect(sectionControl.getAttribute('aria-checked')).toBe('true');
    expect(sectionControl.hasAttribute('disabled')).toBe(true);
  });

  it('syncs topic changes in a LexisNexis section containing both lists and topics', () => {
    renderSelection({
      datasets: { sanctions: true, 'sanctions:dataset:eu': true, 'sanctions:topic:country:fr': true },
      availableFilters: {
        ...filters,
        sanctions: { ...filters.sanctions, topics: { country: [{ name: 'fr', title: 'France' }] } },
      },
    });
    const checkbox = screen.getAllByRole('checkbox')[0]!;
    fireEvent.click(screen.getByText('scenarios:sanction.lists.sanctions'));
    fireEvent.click(screen.getByText('Europe'));
    fireEvent.click(screen.getByRole('checkbox', { name: 'EU sanctions' }));
    fireEvent.click(screen.getByText('France'));
    expect(selectedKeys()).toEqual([]);
    expect(checkbox.getAttribute('aria-checked')).toBe('false');
    fireEvent.click(screen.getByRole('button', { name: 'continuousScreening:creation.datasetSelection.filter.add' }));
    expect(selectedKeys()).toEqual(['sanctions', 'sanctions:topic:country:fr']);
    expect(checkbox.getAttribute('aria-checked')).toBe('true');
  });
});
