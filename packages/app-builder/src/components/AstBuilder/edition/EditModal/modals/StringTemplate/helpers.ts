import { STRING_TEMPLATE_VARIABLE_REGEXP } from '@app-builder/models/astNode/strings';

export const extractVariablesNamesFromTemplate = (template: string) => {
  const res = template.matchAll(STRING_TEMPLATE_VARIABLE_REGEXP).toArray();

  return res.reduce((acc, match) => {
    if (match[1] && !acc.includes(match[1])) {
      acc.push(match[1]);
    }
    return acc;
  }, [] as string[]);
};
