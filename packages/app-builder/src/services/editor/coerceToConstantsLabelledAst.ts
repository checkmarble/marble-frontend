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
        dataType: Number.isInteger(parsedNumber) ? 'Int' : 'Float',
        constant: parsedNumber,
      })
    );
  }

  if (searchLowerCase === 'true' || searchLowerCase === 'false') {
    results.push(
      newLabelledAstOfConstant({
        label: searchLowerCase,
        dataType: 'Bool',
        constant: searchLowerCase === 'true',
      })
    );
  }

  results.push(...coerceToConstantArray(search));

  results.push(
    newLabelledAstOfConstant({
      label: `"${search}"`,
      dataType: 'String',
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
        //TODO(combobox): infer/get array.dataType
        dataType: 'unknown',
        constant: parsed,
      }),
    ];
  }
  return [];
}

function newLabelledAstOfConstant({
  label,
  dataType,
  constant,
}: {
  label: string;
  dataType: LabelledAst['dataType'];
  constant: ConstantType;
}): LabelledAst {
  return {
    name: label,
    description: '',
    operandType: 'Constant',
    dataType,
    astNode: NewAstNode({
      constant: constant,
    }),
  };
}
