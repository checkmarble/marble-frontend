export type AndOperator = {
  type: 'AND';
  children: Operator[];
};
export type BoolConstantOperator = {
  type: 'BOOL_CONSTANT';
  staticData: {
    value: boolean;
  };
};
export type DbFieldBoolOperator = {
  type: 'DB_FIELD_BOOL';
  staticData: {
    triggerTableName: string;
    path: string[];
    fieldName: string;
  };
};
export type DbFieldFloatOperator = {
  type: 'DB_FIELD_FLOAT';
  staticData: {
    triggerTableName: string;
    path: string[];
    fieldName: string;
  };
};
export type DbFieldStringOperator = {
  type: 'DB_FIELD_STRING';
  staticData: {
    triggerTableName: string;
    path: string[];
    fieldName: string;
  };
};
export type DivideFloatOperator = {
  type: 'DIVIDE_FLOAT';
  children: Operator[];
};
export type EqualBoolOperator = {
  type: 'EQUAL_BOOL';
  children: Operator[];
};
export type EqualStringOperator = {
  type: 'EQUAL_STRING';
  children: Operator[];
};
export type EqualFloatOperator = {
  type: 'EQUAL_FLOAT';
  children: Operator[];
};
export type FloatConstantOperator = {
  type: 'FLOAT_CONSTANT';
  staticData: {
    value: number;
  };
};
export type GreaterFloatOperator = {
  type: 'GREATER_FLOAT';
  children: Operator[];
};
export type GreaterOrEqualFloatOperator = {
  type: 'GREATER_OR_EQUAL_FLOAT';
  children: Operator[];
};
export type LesserFloatOperator = {
  type: 'LESSER_FLOAT';
  children: Operator[];
};
export type LesserOrEqualFloatOperator = {
  type: 'LESSER_OR_EQUAL_FLOAT';
  children: Operator[];
};
export type NotOperator = {
  type: 'NOT';
  children: Operator[];
};
export type OrOperator = {
  type: 'OR';
  children: Operator[];
};
export type PayloadFieldBoolOperator = {
  type: 'PAYLOAD_FIELD_BOOL';
  staticData: {
    fieldName: string;
  };
};
export type PayloadFieldFloatOperator = {
  type: 'PAYLOAD_FIELD_FLOAT';
  staticData: {
    fieldName: string;
  };
};
export type PayloadFieldStringOperator = {
  type: 'PAYLOAD_FIELD_STRING';
  staticData: {
    fieldName: string;
  };
};
export type ProductFloatOperator = {
  type: 'PRODUCT_FLOAT';
  children: Operator[];
};
export type RoundFloatOperator = {
  type: 'ROUND_FLOAT';
  children: Operator[];
  staticData: {
    level: number;
  };
};
export type StringIsInListOperator = {
  type: 'STRING_IS_IN_LIST';
  children: Operator[];
};
export type StringListConstantOperator = {
  type: 'STRING_LIST_CONSTANT';
  staticData: {
    value: string[];
  };
};
export type StringConstantOperator = {
  type: 'STRING_CONSTANT';
  staticData: {
    value: string;
  };
};
export type SubstractFloatOperator = {
  type: 'SUBTRACT_FLOAT';
  children: Operator[];
};
export type SumFloatOperator = {
  type: 'SUM_FLOAT';
  children: Operator[];
};
export type Operator =
  | AndOperator
  | BoolConstantOperator
  | DbFieldBoolOperator
  | DbFieldFloatOperator
  | DbFieldStringOperator
  | DivideFloatOperator
  | EqualBoolOperator
  | EqualStringOperator
  | EqualFloatOperator
  | FloatConstantOperator
  | GreaterFloatOperator
  | GreaterOrEqualFloatOperator
  | LesserFloatOperator
  | LesserOrEqualFloatOperator
  | NotOperator
  | OrOperator
  | PayloadFieldBoolOperator
  | PayloadFieldFloatOperator
  | PayloadFieldStringOperator
  | ProductFloatOperator
  | RoundFloatOperator
  | StringIsInListOperator
  | StringListConstantOperator
  | StringConstantOperator
  | SubstractFloatOperator
  | SumFloatOperator;
