import { type AstNode, NewUndefinedAstNode } from '@app-builder/models';
import { type StringTemplateAstNode } from '@app-builder/models/astNode/strings';
import { type AstNodeErrors } from '@app-builder/services/validation/ast-node-validation';
import { useMemo, useReducer } from 'react';

export const STRING_TEMPLATE_VARIABLE_REGEXP = /%([a-z0-9_]+)%/gim;
export const STRING_TEMPLATE_VARIABLE_CAPTURE_REGEXP = /(%[a-z0-9_]+%)/gim;

export const extractVariablesNamesFromTemplate = (template: string) => {
  const res = template.matchAll(STRING_TEMPLATE_VARIABLE_REGEXP).toArray();

  return res.reduce((acc, match) => {
    return match[1] && !acc.includes(match[1]) ? [...acc, match[1]] : acc;
  }, [] as string[]);
};

type EditStringTemplateState = {
  template: string;
  variables: Record<string, AstNode>;
};

type EditStringTemplateAction =
  | { type: 'setTemplate'; payload: { template: string } }
  | { type: 'setVariable'; payload: { name: string; data: AstNode } };

const editStringTemplateReducer = (
  prevState: EditStringTemplateState,
  action: EditStringTemplateAction,
): EditStringTemplateState => {
  switch (action.type) {
    case 'setTemplate': {
      const nextState = { ...prevState, template: action.payload.template };
      const variablesNames = extractVariablesNamesFromTemplate(
        action.payload.template,
      );
      const variables = { ...prevState.variables };
      if (hasEmptyVariable(variables, variablesNames)) {
        for (const variableName of variablesNames) {
          if (variables[variableName] === undefined) {
            variables[variableName] = NewUndefinedAstNode();
          }
        }
        return { ...nextState, variables };
      }
      return nextState;
    }
    case 'setVariable':
      return {
        ...prevState,
        variables: {
          ...prevState.variables,
          [action.payload.name]: action.payload.data,
        },
      };
  }
};

const hasEmptyVariable = (
  variables: Record<string, AstNode>,
  variableNames: string[],
) => {
  return (
    variableNames.filter((variableName) => !variables[variableName]).length > 0
  );
};

const adaptStringTemplateEditState = ({
  initialNode,
  initialErrors: _,
}: {
  initialNode: StringTemplateAstNode;
  initialErrors: AstNodeErrors | undefined;
}) => {
  return {
    template: initialNode.children[0]?.constant ?? '',
    variables: initialNode.namedChildren,
  };
};

export const useStringTemplateEditState = (
  initialNode: StringTemplateAstNode,
  initialErrors: AstNodeErrors | undefined,
) => {
  const [state, dispatch] = useReducer(
    editStringTemplateReducer,
    { initialNode, initialErrors },
    adaptStringTemplateEditState,
  );
  const variableNames = useMemo(
    () => extractVariablesNamesFromTemplate(state.template),
    [state.template],
  );

  return {
    template: state.template,
    setTemplate: (template: string) => {
      dispatch({ type: 'setTemplate', payload: { template } });
    },
    variableNames,
    variables: state.variables,
    setVariable: (name: string, data: AstNode) => {
      dispatch({ type: 'setVariable', payload: { name, data } });
    },
  };
};
