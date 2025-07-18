import { NewPayloadAstNode } from '@app-builder/models/astNode/data-accessor';
import { NewStringTemplateAstNode } from '@app-builder/models/astNode/strings';
import { useMemo } from 'react';

import { defaultCaseName } from './shared';

export const useDefaultCaseName = (triggerObjectType: string) => {
  const defaultCaseTemplate = defaultCaseName.replace('%trigger_object_type%', triggerObjectType);
  const defaultCaseNameNode = useMemo(() => {
    return NewStringTemplateAstNode(defaultCaseTemplate, {
      object_id: NewPayloadAstNode('object_id'),
    });
  }, [defaultCaseTemplate]);

  return {
    defaultCaseNameNode,
  };
};
