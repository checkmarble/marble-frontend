import {
  type AstNode,
  isStringTemplateAstNode,
  NewStringTemplateAstNode,
  type StringTemplateAstNode,
} from '@app-builder/models';
import { useTriggerObjectTable } from '@app-builder/services/editor/options';
import { Fragment, type ReactNode, useState } from 'react';
import { Button, ModalV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { StringTemplateEdit } from '../../AstBuilder/AstBuilderNode/Operand/OperandEditor/OperandEditModal/StringTemplateEdit/StringTemplateEdit';
import {
  STRING_TEMPLATE_VARIABLE_CAPTURE_REGEXP,
  STRING_TEMPLATE_VARIABLE_REGEXP,
} from '../../AstBuilder/AstBuilderNode/Operand/OperandEditor/OperandEditModal/StringTemplateEdit/StringTemplateEdit.hook';
import { defaultCaseName } from './shared';

export type CaseNameEditorProps = {
  value: StringTemplateAstNode | null | undefined;
  onChange: (astNode: StringTemplateAstNode | null) => void;
};

export const CaseNameEditor = ({ value, onChange }: CaseNameEditorProps) => {
  const triggerObjectTable = useTriggerObjectTable();
  const [isEditing, setIsEditing] = useState(false);

  const caseNameContent = value
    ? getAstNodeDisplayElement(value)
    : defaultCaseName.replace('%trigger_object_type%', triggerObjectTable.name);

  const handleAstNodeChange = (newAstNode: AstNode) => {
    if (isStringTemplateAstNode(newAstNode)) {
      onChange(newAstNode);
    }
    setIsEditing(false);
  };

  return (
    <>
      <div>Case name</div>
      <div className="grid grid-cols-[1fr_auto_auto] gap-2">
        <span className="border-grey-10 bg-grey-02 text-s flex items-center rounded border p-2">
          {caseNameContent}
        </span>
        <Button variant="secondary" onClick={() => setIsEditing(true)}>
          Edit
        </Button>
        {value ? (
          <Button
            size="icon"
            variant="secondary"
            onClick={() => onChange(null)}
          >
            <Icon icon="delete" className="size-4" />
          </Button>
        ) : null}
        <ModalV2.Content
          hideOnInteractOutside={(event) => {
            event.stopPropagation();
            // Prevent people from losing their work by clicking accidentally outside the modal
            return false;
          }}
          open={isEditing}
          onClose={() => setIsEditing(false)}
          size="medium"
        >
          <StringTemplateEdit
            cleanable
            initialNode={value ?? NewStringTemplateAstNode()}
            onSave={handleAstNodeChange}
          />
        </ModalV2.Content>
      </div>
    </>
  );
};

function getAstNodeDisplayElement(astNode: StringTemplateAstNode): ReactNode {
  const template = astNode.children[0]?.constant ?? '';
  const splittedTemplate = template.split(
    STRING_TEMPLATE_VARIABLE_CAPTURE_REGEXP,
  );

  console.log(splittedTemplate);

  return (
    <div className="whitespace-pre-wrap">
      {splittedTemplate.map((el, i) =>
        STRING_TEMPLATE_VARIABLE_REGEXP.test(el) ? (
          <code key={i} className="text-blue-100">
            {el}
          </code>
        ) : (
          <Fragment key={i}>{el}</Fragment>
        ),
      )}
    </div>
  );
}
