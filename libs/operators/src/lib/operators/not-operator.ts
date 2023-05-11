import { type Operator } from '.';

export interface NotOperator {
  type: 'NOT';
  children: [Operator];
}
