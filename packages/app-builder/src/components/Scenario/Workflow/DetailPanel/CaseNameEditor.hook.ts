import {
  NewPayloadAstNode,
  NewStringTemplateAstNode,
} from '@app-builder/models';
import { useMemo } from 'react';

import { defaultCaseName } from './shared';

export const useDefaultCaseName = (triggerObjectType: string) => {
  const defaultCaseTemplate = defaultCaseName.replace(
    '%trigger_object_type%',
    triggerObjectType,
  );
  const defaultCaseNameNode = useMemo(() => {
    return NewStringTemplateAstNode(defaultCaseTemplate, {
      object_id: NewPayloadAstNode('object_id'),
    });
  }, [defaultCaseTemplate]);

  // const isDefaultCaseName = (astNode: StringTemplateAstNode) => {
  //   return R.isDeepEqual(astNode, defaultCaseNameNode);
  //   // if (astNode.children[0]?.constant !== defaultCaseTemplate) {
  //   //   return false;
  //   // }
  //   // const objectIdVariable = astNode.namedChildren['object_id'];

  //   // return (
  //   //   objectIdVariable &&
  //   //   isPayload(objectIdVariable) &&
  //   //   objectIdVariable.children[0]?.constant === 'object_id'
  //   // );
  // };

  return {
    defaultCaseNameNode,
  };
};
