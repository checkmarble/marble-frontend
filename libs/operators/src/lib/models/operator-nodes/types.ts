// Subset of JS built-in types we support
type PrimitiveType = string | boolean | number;

// Subset of built-in types we support
export type PrimitiveArgType =
  | 'float'
  | 'int'
  | 'string'
  | 'boolean'
  | 'number';
export type ArgType =
  | PrimitiveArgType
  | { type: 'array'; items: PrimitiveArgType };

export interface OperatorWithChildren {
  operatorName: string;
  children: OperatorSkeleton[];
}
interface OperatorWithNamedChildren {
  operatorName: string;
  namedChildren: Record<string, OperatorSkeleton>;
}
interface OperatorWithChildrenAndNamedChildren {
  operatorName: string;
  children: OperatorSkeleton[];
  namedChildren: Record<string, OperatorSkeleton>;
}
type OperatorConstant = {
  operatorName: string;
  constant: PrimitiveType | PrimitiveType[];
};

export type OperatorSkeleton =
  | OperatorWithChildren
  | OperatorWithNamedChildren
  | OperatorWithChildrenAndNamedChildren
  | OperatorConstant;

interface OperatorWithChildrenDeclaration {
  returnType: ArgType;
  minOperands: number;
  maxOperands: number;
  operandsType: ArgType;
}
interface OperatorWithNamedChildrenDeclaration<
  Operator extends OperatorWithNamedChildren
> {
  returnType: ArgType;
  namedArgs: Record<keyof Operator['namedChildren'], ArgType>;
}
interface OperatorWithChildrenAndNamedChildrenDeclaration<
  Operator extends OperatorWithChildrenAndNamedChildren
> {
  returnType: ArgType;
  minOperands: number;
  maxOperands: number;
  operandsType: ArgType;
  namedArgs: Record<keyof Operator['namedChildren'], ArgType>;
}
interface OperatorConstantDeclaration {
  returnType: ArgType;
}

// If you want to use this type, you need to use the `satisfies` keyword.
// If a never branch occure, check the provided Operator match OperatorSkeleton.
export type OperatorDeclaration<Operator extends OperatorSkeleton> =
  Operator extends OperatorWithChildrenAndNamedChildren
    ? OperatorWithChildrenAndNamedChildrenDeclaration<Operator>
    : Operator extends OperatorWithChildren
    ? OperatorWithChildrenDeclaration
    : Operator extends OperatorWithNamedChildren
    ? OperatorWithNamedChildrenDeclaration<Operator>
    : Operator extends OperatorConstant
    ? OperatorConstantDeclaration
    : never;

export type OperatorDeclarationMap<
  OperatorNodeMap extends Record<string, OperatorSkeleton>
> = {
  [Name in keyof OperatorNodeMap]: OperatorDeclaration<OperatorNodeMap[Name]>;
};
