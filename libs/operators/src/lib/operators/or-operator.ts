import { type Operator } from '.';

export interface OrOperator {
  type: 'OR';
  children: Operator[];
}
