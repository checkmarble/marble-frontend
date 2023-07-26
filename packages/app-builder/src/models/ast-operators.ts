import { type FuncAttributes } from "@marble-api";

export interface AstOperator {
  name: string;
  number_of_arguments: number;
  named_arguments: string[] | null;
}

// helper
export function NewAstOperator({
  name,
  number_of_arguments,
  named_arguments,
}: AstOperator): AstOperator {
  return {
    name: name,
    number_of_arguments: number_of_arguments,
    named_arguments: named_arguments ?? null,
  };
}

export function adaptAstOperatorDto(funcAttributes: FuncAttributes): AstOperator {
  return NewAstOperator({
    name: funcAttributes.name,
    number_of_arguments: funcAttributes.number_of_arguments,
    named_arguments: funcAttributes.named_arguments ?? null,
  });
}