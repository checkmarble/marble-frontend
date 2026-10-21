import '@app-builder/tests/setup/i18next';
import { NewConstantAstNode } from '@app-builder/models/astNode/constant';
import { ComparatorFuzzyMatchConfig } from '@app-builder/models/fuzzy-match/comparatorFuzzyMatchConfig';
import { render, screen } from '@testing-library/react';
import i18next from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { Modal } from 'ui-design-system';
import { describe, expect, it, vi } from 'vitest';

import { InnerEditFuzzyMatchModal, type InnerEditFuzzyMatchModalProps } from './InnerFuzzyMatchModal';

vi.mock('../../../node-store', () => ({
  AstBuilderNodeSharpFactory: {
    useSharp: () => ({ select: () => ({}) }),
  },
}));

vi.mock('../../../EditionOperand', () => ({ EditionAstBuilderOperand: () => null }));
vi.mock('../../../helpers', () => ({ getValidationStatus: () => undefined }));
vi.mock('./EditAlgorithm', () => ({ EditAlgorithm: () => null }));
vi.mock('./EditLevel', () => ({ EditLevel: () => null }));
vi.mock('./EditThreshold', () => ({ EditThreshold: () => null }));

describe('Fuzzy match direction notice', () => {
  it('shows the operand direction only while phrase_match is selected', () => {
    const props: InnerEditFuzzyMatchModalProps = {
      fuzzMatchConfig: ComparatorFuzzyMatchConfig,
      left: NewConstantAstNode({ constant: 'Payment for restricted goods' }),
      right: NewConstantAstNode({ constant: 'restricted goods' }),
      onRightChange: vi.fn(),
      algorithm: 'phrase_match',
      onAlorithmChange: vi.fn(),
      threshold: { mode: 'level', level: 'high', value: 85 },
      onThresholdChange: vi.fn(),
    };
    const renderModal = (algorithm: InnerEditFuzzyMatchModalProps['algorithm']) => (
      <I18nextProvider i18n={i18next}>
        <Modal.Root open>
          <Modal.Content>
            <Modal.Title>String similarity</Modal.Title>
            <InnerEditFuzzyMatchModal {...props} algorithm={algorithm} />
          </Modal.Content>
        </Modal.Root>
      </I18nextProvider>
    );
    const { rerender } = render(renderModal('phrase_match'));

    expect(screen.getByText(/the left operand is the text to search/)).toBeTruthy();
    expect(screen.queryByRole('table')).toBeNull();

    rerender(renderModal('ratio'));

    expect(screen.queryByText(/the left operand is the text to search/)).toBeNull();
    expect(screen.getByRole('table')).toBeTruthy();
  });
});
