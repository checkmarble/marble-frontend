import { type Pivot } from '@app-builder/models';

export function getPivotDisplayValue(pivot: Pivot): string {
  if (pivot.type === 'field') {
    return pivot.field;
  }
  return `→${pivot.pathLinks.join('→')}`;
}
