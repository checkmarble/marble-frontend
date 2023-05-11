import { type Operator } from '..';

export interface EqualBoolOperator {
  type: 'EQUAL_BOOL';
  children: [Operator, Operator];
}
