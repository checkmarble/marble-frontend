import {
  type AllowedScoringRuleSourceType,
  type BoolSwitch,
  type NumberSwitch,
  type StringSwitch,
} from '@app-builder/models/scoring';

export function createDefaultConditions(
  fieldType: AllowedScoringRuleSourceType,
): NumberSwitch | StringSwitch | BoolSwitch {
  switch (fieldType) {
    case 'Int':
    case 'Float':
      return {
        type: 'number',
        branches: [{ value: 0, impact: { modifier: 0 } }],
        default: { modifier: 0 },
      };
    case 'String':
      return {
        type: 'string',
        branches: [{ value: { op: '=', value: '' }, impact: { modifier: 0 } }],
        default: { modifier: 0 },
      };
    case 'Bool':
      return { type: 'bool', ifTrue: { modifier: 0 }, ifFalse: { modifier: 0 } };
  }
}
