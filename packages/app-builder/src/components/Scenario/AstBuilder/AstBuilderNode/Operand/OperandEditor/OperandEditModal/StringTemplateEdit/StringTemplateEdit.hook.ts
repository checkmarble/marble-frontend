import { type AstNode, type StringTemplateAstNode } from '@app-builder/models';
import { type AstNodeErrors } from '@app-builder/services/validation/ast-node-validation';
import { useMemo, useReducer } from 'react';

export const STRING_TEMPLATE_VARIABLE_REGEXP = /%([a-z0-9_]+)%/gim;
export const STRING_TEMPLATE_VARIABLE_CAPTURE_REGEXP = /(%[a-z0-9_]+%)/gim;

const extractVariablesNamesFromTemplate = (template: string) => {
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
    case 'setTemplate':
      return { ...prevState, template: action.payload.template };
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

const adaptStringTemplateEditState = ({
  initialNode,
  initialErrors: _,
}: {
  initialNode: StringTemplateAstNode;
  initialErrors: AstNodeErrors | undefined;
}) => {
  const template = initialNode.children[0]?.constant ?? '';
  // const templateErrors = initialErrors.children[0]?.errors ?? [];

  return { template, variables: initialNode.namedChildren };
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
