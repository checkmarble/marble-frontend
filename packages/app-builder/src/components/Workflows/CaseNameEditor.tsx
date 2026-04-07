import { AstBuilder } from '@app-builder/components/AstBuilder';
import { type AstNode } from '@app-builder/models';
import {
  isStringTemplateAstNode,
  NewStringTemplateAstNode,
  STRING_TEMPLATE_VARIABLE_CAPTURE_REGEXP,
  STRING_TEMPLATE_VARIABLE_REGEXP,
  type StringTemplateAstNode,
} from '@app-builder/models/astNode/strings';
import { Scenario } from '@app-builder/models/scenario';
import { Fragment, type ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDefaultCaseName } from './CaseNameEditor.hook';

export type CaseNameEditorProps = {
  label: string;
  value: StringTemplateAstNode | null | undefined;
  onChange: (astNode: StringTemplateAstNode | null) => void;
  scenario: Scenario;
};

export const CaseNameEditor = ({ label, value, onChange, scenario }: CaseNameEditorProps) => {
  const { t } = useTranslation(['common']);
  const [isEditing, setIsEditing] = useState(false);
  const { defaultCaseNameNode } = useDefaultCaseName(scenario.triggerObjectType);

  const caseNameContent = value ? getAstNodeDisplayElement(value) : '';

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
      <div className="flex items-stretch gap-2">
        <button
          onClick={() => setIsEditing(true)}
          className="border-grey-border text-s inline-flex items-center rounded-sm border p-2 max-w-full"
        >
          {caseNameContent}
        </button>
        {isEditing ? (
          <AstBuilder.Provider scenarioId={scenario.id} mode="edit">
            <AstBuilder.EditModal
              node={value ?? NewStringTemplateAstNode()}
              onSave={handleAstNodeChange}
              onCancel={() => setIsEditing(false)}
              saveLabel={t('common:validate')}
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
