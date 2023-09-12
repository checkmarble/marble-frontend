import {
  type ConstantType,
  type LabelledAst,
  NewAstNode,
} from '@app-builder/models';

export function coerceToConstantsLabelledAst(search: string): LabelledAst[] {
  const results: LabelledAst[] = [];

  const searchLowerCase = search.trim().toLocaleLowerCase();
  if (searchLowerCase.length === 0) {
    return [];
  }

  // Note: Number('') === 0
  const parsedNumber = Number(searchLowerCase);
  if (Number.isFinite(parsedNumber)) {
    results.push(
      newLabelledAstOfConstant({
        label: search,
        type: 'number',
        constant: parsedNumber,
      })
    );
  }

  if (searchLowerCase === 'true' || searchLowerCase === 'false') {
    results.push(
      newLabelledAstOfConstant({
        label: searchLowerCase,
        type: 'boolean',
        constant: searchLowerCase === 'true',
      })
    );
  }

  results.push(...coerceToConstantArray(search));

  results.push(
    newLabelledAstOfConstant({
      label: `"${search}"`,
      type: 'string',
      constant: search,
    })
  );

  return results;
}

function coerceToConstantArray(search: string): LabelledAst[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(search);
  } catch {
    return [];
  }

  if (Array.isArray(parsed)) {
    // let's accept anything in the array.
    return [
      newLabelledAstOfConstant({
        label: search,
        type: 'array',
        constant: parsed,
      }),
    ];
  }
  return [];
}

function newLabelledAstOfConstant({
  label,
  type,
  constant,
}: {
  label: string;
  type: string;
  constant: ConstantType;
}): LabelledAst {
  return {
    label,
    tooltip: `(${type})`,
    astNode: NewAstNode({
      constant: constant,
    }),
    dataModelField: null,
  };
}
