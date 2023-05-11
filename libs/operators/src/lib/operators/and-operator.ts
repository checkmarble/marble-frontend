import { type Operator } from '..';

export interface AndOperator {
  type: 'AND';
  children: Operator[];
}
