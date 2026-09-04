import { describe, expect, it } from 'vitest';
import { stripIdFromNode } from './ast-node';
import { isSwitchAstNode, NewSwitchAstNode } from './control-flow';
import { NewPayloadAstNode } from './data-accessor';
import {
  getValueSwitchCellKey,
  isValueSwitchAstNode,
  isValueSwitchModelComplete,
  normalizeValueSwitchThresholds,
  parseValueSwitchAstNode,
  type ValueSwitchModel,
  valueSwitchModelToAst,
} from './value-switch';

function oneDimensionModel(): ValueSwitchModel {
  return {
    dimensionCount: 1,
    dimensions: [
      {
        type: 'field',
        field: NewPayloadAstNode('status'),
        values: ['PEP', 'Sanctions'],
      },
    ],
    thresholds: {
      [getValueSwitchCellKey(['PEP'])]: 20,
      [getValueSwitchCellKey(['Sanctions'])]: 30,
    },
    fallback: 10,
  };
}

function stripModelIds(model: ValueSwitchModel): ValueSwitchModel {
  return {
    ...model,
    dimensions: model.dimensions.map((dimension) =>
      dimension?.type === 'field' ? { ...dimension, field: stripIdFromNode(dimension.field) } : dimension,
    ) as ValueSwitchModel['dimensions'],
  };
}

describe('value switch AST', () => {
  it('distinguishes numeric value switches from scoring switches', () => {
    const valueSwitch = valueSwitchModelToAst(oneDimensionModel());
    const scoringSwitch = NewSwitchAstNode('String', NewPayloadAstNode('status'));

    expect(isValueSwitchAstNode(valueSwitch)).toBe(true);
    expect(isSwitchAstNode(valueSwitch)).toBe(false);
    expect(isSwitchAstNode(scoringSwitch)).toBe(true);
    expect(isValueSwitchAstNode(scoringSwitch)).toBe(false);
  });

  it('round-trips an ordered one-variable switch', () => {
    const model = oneDimensionModel();
    const ast = valueSwitchModelToAst(model);

    expect(ast.children.map((child) => child.children[1].constant)).toEqual([20, 30]);
    expect(ast.namedChildren.fallback.constant).toBe(10);
    expect(stripModelIds(parseValueSwitchAstNode(ast)!)).toEqual(stripModelIds(model));
  });

  it('flattens a two-variable matrix in row-major order and round-trips it', () => {
    const model: ValueSwitchModel = {
      dimensionCount: 2,
      dimensions: [
        { type: 'field', field: NewPayloadAstNode('status'), values: ['PEP', 'Sanctions'] },
        { type: 'risk-level', values: [1, 2] },
      ],
      thresholds: {
        [getValueSwitchCellKey(['PEP', 1])]: 10,
        [getValueSwitchCellKey(['PEP', 2])]: 20,
        [getValueSwitchCellKey(['Sanctions', 1])]: 30,
        [getValueSwitchCellKey(['Sanctions', 2])]: 40,
      },
      fallback: 5,
    };

    const ast = valueSwitchModelToAst(model);

    expect(ast.children).toHaveLength(4);
    expect(ast.children.every((child) => child.children[0].name === 'And')).toBe(true);
    expect(ast.children.map((child) => child.children[1].constant)).toEqual([10, 20, 30, 40]);
    expect(stripModelIds(parseValueSwitchAstNode(ast)!)).toEqual(stripModelIds(model));
  });

  it('keeps existing cells and initializes new cells from the fallback', () => {
    const current = oneDimensionModel();
    const dimension = current.dimensions[0];
    if (!dimension || dimension.type !== 'field') throw new Error('expected field dimension');

    const normalized = normalizeValueSwitchThresholds({
      ...current,
      dimensions: [{ ...dimension, values: [...dimension.values, 'Adverse media'] }],
    });

    expect(normalized.thresholds).toEqual({
      [getValueSwitchCellKey(['PEP'])]: 20,
      [getValueSwitchCellKey(['Sanctions'])]: 30,
      [getValueSwitchCellKey(['Adverse media'])]: 10,
    });
  });

  it('rejects incomplete models and incomplete persisted matrices', () => {
    const duplicateDimensionModel: ValueSwitchModel = {
      dimensionCount: 2,
      dimensions: [
        { type: 'risk-level', values: [1] },
        { type: 'risk-level', values: [2] },
      ],
      thresholds: { [getValueSwitchCellKey([1, 2])]: 10 },
      fallback: 0,
    };
    expect(isValueSwitchModelComplete(duplicateDimensionModel)).toBe(false);

    const validMatrix: ValueSwitchModel = {
      dimensionCount: 2,
      dimensions: [
        { type: 'field', field: NewPayloadAstNode('status'), values: ['PEP', 'Sanctions'] },
        { type: 'risk-level', values: [1, 2] },
      ],
      thresholds: {
        [getValueSwitchCellKey(['PEP', 1])]: 10,
        [getValueSwitchCellKey(['PEP', 2])]: 20,
        [getValueSwitchCellKey(['Sanctions', 1])]: 30,
        [getValueSwitchCellKey(['Sanctions', 2])]: 40,
      },
      fallback: 0,
    };
    const incompleteAst = valueSwitchModelToAst(validMatrix);
    incompleteAst.children.pop();

    expect(parseValueSwitchAstNode(incompleteAst)).toBeNull();
  });
});
