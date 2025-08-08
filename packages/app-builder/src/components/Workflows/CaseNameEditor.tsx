import { AstBuilder } from '@app-builder/components/AstBuilder';
import { type AstNode, stripIdFromNode } from '@app-builder/models';
import {
  isStringTemplateAstNode,
  NewStringTemplateAstNode,
  STRING_TEMPLATE_VARIABLE_CAPTURE_REGEXP,
  STRING_TEMPLATE_VARIABLE_REGEXP,
  type StringTemplateAstNode,
} from '@app-builder/models/astNode/strings';
import { useCurrentScenario } from '@app-builder/routes/_builder+/scenarios+/$scenarioId+/_layout';
import { Fragment, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import * as R from 'remeda';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { useDefaultCaseName } from './CaseNameEditor.hook';

export type CaseNameEditorProps = {
  label: string;
  value: StringTemplateAstNode | null | undefined;
  onChange: (astNode: StringTemplateAstNode | null) => void;
};

export const CaseNameEditor = ({ label, value, onChange }: CaseNameEditorProps) => {
  const currentScenario = useCurrentScenario();
  const [isEditing, setIsEditing] = useState(false);
  const { defaultCaseNameNode } = useDefaultCaseName(currentScenario.triggerObjectType);
  // const { validate, validation } = useAstValidationFetcher(currentScenario.id);
  const initialValueRef = useRef(value);
  // const handleValidation = useMemo(() => {
  //   return R.debounce((astNode: AstNode) => validate(astNode, 'string'), {
  //     waitMs: 300,
  //   }).call;
  // }, [validate]);

  const caseNameContent = value ? getAstNodeDisplayElement(value) : '';
  const isDefaultCaseName = useMemo(() => {
    if (!value) return true;

    const strippedValue = stripIdFromNode(value);
    const strippedInitial = stripIdFromNode(initialValueRef.current ?? defaultCaseNameNode);
    const isEqual = R.isDeepEqual(strippedValue, strippedInitial);

    return isEqual;
  }, [value, initialValueRef, defaultCaseNameNode]);

  const handleAstNodeChange = (newAstNode: AstNode) => {
    if (isStringTemplateAstNode(newAstNode)) {
      onChange(newAstNode);
    }
    setIsEditing(false);
  };

  useEffect(() => {
    if (!value) {
      onChange(defaultCaseNameNode);
    }
  }, [onChange, value, defaultCaseNameNode]);

  return (
    <>
      <div>{label}</div>
      <div className="flex gap-2">
        <button
          onClick={() => setIsEditing(true)}
          className="border-grey-90 text-s inline-flex items-center rounded border p-2 max-w-full"
        >
          {caseNameContent}
        </button>
        {!isDefaultCaseName ? (
          <Button
            size="icon"
            variant="secondary"
            onClick={() => onChange(initialValueRef.current ?? defaultCaseNameNode)}
          >
            <Icon icon="restart-alt" className="size-4" />
          </Button>
        ) : null}
        {isEditing ? (
          <AstBuilder.Provider scenarioId={currentScenario.id} mode="edit">
            <AstBuilder.EditModal
              node={value ?? NewStringTemplateAstNode()}
              onSave={handleAstNodeChange}
              onCancel={() => setIsEditing(false)}
            />
          </AstBuilder.Provider>
        ) : null}
      </div>
    </>
  );
};

function getAstNodeDisplayElement(astNode: StringTemplateAstNode): ReactNode {
  const template = astNode.children[0]?.constant ?? '';
  const splittedTemplate = template.split(STRING_TEMPLATE_VARIABLE_CAPTURE_REGEXP);

  return (
    <span className="whitespace-pre-wrap text-nowrap max-w-full">
      {splittedTemplate.map((el, i) =>
        STRING_TEMPLATE_VARIABLE_REGEXP.test(el) ? (
          <code key={i} className="text-blue-58">
            {el}
          </code>
        ) : (
          <Fragment key={i}>{el}</Fragment>
        ),
      )}
    </span>
  );
}
