import '@app-builder/tests/setup/i18next';
import { ComparatorFuzzyMatchConfig } from '@app-builder/models/fuzzy-match/comparatorFuzzyMatchConfig';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import i18next from 'i18next';
import { mockResizeObserver } from 'jsdom-testing-mocks';
import { I18nextProvider } from 'react-i18next';
import { Tooltip } from 'ui-design-system';
import { describe, expect, it, vi } from 'vitest';
import { EditAlgorithm } from './EditAlgorithm';

mockResizeObserver();
window.HTMLElement.prototype.scrollIntoView = vi.fn();

function renderEditAlgorithm(algorithm: Parameters<typeof EditAlgorithm>[0]['algorithm'], onChange = vi.fn()) {
  return render(
    <I18nextProvider i18n={i18next}>
      <Tooltip.Provider>
        <EditAlgorithm fuzzyMatchConfig={ComparatorFuzzyMatchConfig} algorithm={algorithm} onChange={onChange} />
      </Tooltip.Provider>
    </I18nextProvider>,
  );
}

describe('EditAlgorithm', () => {
  it('opens the algorithm menu, selects another algorithm, calls onChange and closes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderEditAlgorithm('ratio', onChange);

    await user.click(screen.getByRole('combobox'));

    const phraseOption = await screen.findByRole('option', {
      name: new RegExp(i18next.t('scenarios:edit_fuzzy_match.algorithm.phrase_match')),
    });
    await user.click(phraseOption);

    expect(onChange).toHaveBeenCalledWith('phrase_match');
    expect(screen.queryByRole('option')).toBeNull();
  });

  it('renders static label without a combobox for non-editable algorithms', () => {
    renderEditAlgorithm('bag_of_words_similarity');

    expect(screen.queryByRole('combobox')).toBeNull();
    expect(screen.getByText(i18next.t('scenarios:edit_fuzzy_match.algorithm.token_set_ratio'))).toBeTruthy();
  });
});
