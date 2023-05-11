export * from './and-operator';
export * from './db-field-bool-operator';
export * from './equal-bool-operator';
export * from './false-operator';
export * from './not-operator';
export * from './or-operator';
export * from './payload-field-bool-operator';
export * from './true-operator';

import { type AndOperator } from './and-operator';
import { type DBFieldBoolOperator } from './db-field-bool-operator';
import { type EqualBoolOperator } from './equal-bool-operator';
import { type FalseOperator } from './false-operator';
import { type NotOperator } from './not-operator';
import { type OrOperator } from './or-operator';
import { type PayloadFieldBoolOperator } from './payload-field-bool-operator';
import { type TrueOperator } from './true-operator';

export type Operator =
  | AndOperator
  | DBFieldBoolOperator
  | EqualBoolOperator
  | FalseOperator
  | NotOperator
  | OrOperator
  | PayloadFieldBoolOperator
  | TrueOperator;
