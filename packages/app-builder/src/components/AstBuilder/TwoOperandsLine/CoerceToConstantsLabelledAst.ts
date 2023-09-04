import { type LabelledAst, NewAstNode } from '@app-builder/models';

export function coerceToConstantsLabelledAst(search: string): LabelledAst[] {
  const results: LabelledAst[] = [];

  const searchLowerCase = search.trim().toLocaleLowerCase();
  if (searchLowerCase.length === 0) {
    return [];
  }

  // Note: Number('') === 0
  const parsedNumber = Number(searchLowerCase);
  if (Number.isFinite(parsedNumber)) {
    results.push({
      label: search,
      tooltip: '(number)',
      astNode: NewAstNode({
        constant: parsedNumber,
      }),
    });
  }

  if (searchLowerCase === 'true' || searchLowerCase === 'false') {
    results.push({
      label: searchLowerCase,
      tooltip: '(boolean)',
      astNode: NewAstNode({
        constant: searchLowerCase === 'true',
      }),
    });
  }

  results.push(...coerceToConstantArray(search));

  results.push({
    label: `"${search}"`,
    tooltip: '(string)',
    astNode: NewAstNode({
      constant: search,
    }),
  });

  return results;
}

function coerceToConstantArray(search: string): LabelledAst[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(search);
  } catch {
    return [];
  }

  const results: LabelledAst[] = [];

  if (Array.isArray(parsed)) {
    // let's accept anything in the array.
    results.push({
      label: search,
      tooltip: '(array)',
      astNode: NewAstNode({
        constant: parsed,
      }),
    });
  }

  return results;
}
