import { AstBuilderStaticProvider } from '@app-builder/components/AstBuilder/Provider';
import { FormatContext } from '@app-builder/contexts/FormatContext';
import { type DataModel, type DataModelField, type TableModel } from '@app-builder/models';
import { type AggregationAstNode, NewAggregatorAstNode } from '@app-builder/models/astNode/aggregation';
import { NewConstantAstNode } from '@app-builder/models/astNode/constant';
import { getDefaultSemanticType } from '@app-builder/models/semantic-types';
import '@app-builder/tests/setup/i18next';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import i18next from 'i18next';
import { mockResizeObserver } from 'jsdom-testing-mocks';
import { type ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { Tooltip } from 'ui-design-system';
import { describe, expect, it, vi } from 'vitest';

import { AstBuilderNodeSharpFactory } from '../../../node-store';
import { EditFilters } from './EditFilters';

mockResizeObserver();
window.HTMLElement.prototype.scrollIntoView = vi.fn();
window.HTMLElement.prototype.setPointerCapture = vi.fn();
window.HTMLElement.prototype.releasePointerCapture = vi.fn();
window.HTMLElement.prototype.hasPointerCapture = vi.fn(() => true);

function field(name: string, dataType: DataModelField['dataType'] = 'String'): DataModelField {
  return {
    id: name,
    dataType,
    semanticType: getDefaultSemanticType(dataType),
    name,
    description: `${name} description`,
    tableId: 'transactions',
    isEnum: false,
    nullable: false,
    unicityConstraint: 'no_unicity_constraint',
  };
}

function table(name: string, fields: DataModelField[]): TableModel {
  return {
    id: name,
    name,
    description: '',
    semanticType: null,
    alias: name,
    captionField: fields[0]?.name ?? 'id',
    fields,
    linksToSingle: [],
    fieldOrder: fields.map((f) => f.name),
  };
}

const amount = field('amount', 'Float');
const status = field('status', 'String');
const dataModel: DataModel = [table('transactions', [amount, status])];

function aggregationNode(): AggregationAstNode {
  const node = NewAggregatorAstNode('COUNT');
  node.namedChildren.tableName = NewConstantAstNode({ constant: 'transactions' });
  node.namedChildren.fieldName = NewConstantAstNode({ constant: 'amount' });
  return node;
}

function Harness({ children }: { children: ReactNode }) {
  const nodeSharp = AstBuilderNodeSharpFactory.createSharp({
    initialNode: aggregationNode(),
    initialValidation: { errors: [], evaluation: [] },
    validationFn: async () => ({ errors: [], evaluation: [] }),
  });

  return (
    <I18nextProvider i18n={i18next}>
      <FormatContext.Provider value={{ locale: 'en', timezone: 'UTC' }}>
        <Tooltip.Provider delayDuration={0}>
          <AstBuilderStaticProvider
            data={{
              customLists: [],
              triggerObjectType: 'transactions',
              dataModel,
              databaseAccessors: [],
              payloadAccessors: [],
              screeningConfigs: [],
              hasScoringRuleset: false,
              scoringSettings: null,
            }}
          >
            <AstBuilderNodeSharpFactory.Provider value={nodeSharp}>{children}</AstBuilderNodeSharpFactory.Provider>
          </AstBuilderStaticProvider>
        </Tooltip.Provider>
      </FormatContext.Provider>
    </I18nextProvider>
  );
}

describe('EditFilters FieldSelect', () => {
  it('opens the add-filter menu and adds a filter when a field is picked', async () => {
    render(
      <Harness>
        <EditFilters
          aggregatedField={{ tableName: 'transactions', fieldName: 'amount', field: amount }}
          dataModel={dataModel}
        />
      </Harness>,
    );

    await userEvent.click(screen.getByRole('button', { name: /new filter/i }));

    expect(await screen.findByRole('option', { name: /status/i })).toBeTruthy();

    await userEvent.click(screen.getByRole('option', { name: /status/i }));

    expect(await screen.findByText('status')).toBeTruthy();
    expect(screen.getByRole('button', { name: /new filter/i })).toBeTruthy();
  });
});
