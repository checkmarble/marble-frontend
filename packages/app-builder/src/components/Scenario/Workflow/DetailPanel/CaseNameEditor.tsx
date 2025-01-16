import { type AstNode } from '@app-builder/models';
import {
  isStringTemplateAstNode,
  NewStringTemplateAstNode,
  type StringTemplateAstNode,
} from '@app-builder/models/astNode/strings';
import { useCurrentScenario } from '@app-builder/routes/_builder+/scenarios+/$scenarioId+/_layout';
import { useAstValidationFetcher } from '@app-builder/routes/ressources+/scenarios+/$scenarioId+/validate-ast';
import { useTriggerObjectTable } from '@app-builder/services/editor/options';
import {
  Fragment,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Button, ModalV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { StringTemplateEdit } from '../../AstBuilder/AstBuilderNode/Operand/OperandEditor/OperandEditModal/StringTemplateEdit/StringTemplateEdit';
import {
  STRING_TEMPLATE_VARIABLE_CAPTURE_REGEXP,
  STRING_TEMPLATE_VARIABLE_REGEXP,
} from '../../AstBuilder/AstBuilderNode/Operand/OperandEditor/OperandEditModal/StringTemplateEdit/StringTemplateEdit.hook';
import { useDefaultCaseName } from './CaseNameEditor.hook';

export type CaseNameEditorProps = {
  label: string;
  value: StringTemplateAstNode | null | undefined;
  onChange: (astNode: StringTemplateAstNode | null) => void;
};

export const CaseNameEditor = ({
  label,
  value,
  onChange,
}: CaseNameEditorProps) => {
  const { t } = useTranslation(['scenarios']);
  const triggerObjectTable = useTriggerObjectTable();
  const [isEditing, setIsEditing] = useState(false);
  const { defaultCaseNameNode } = useDefaultCaseName(triggerObjectTable.name);
  const currentScenario = useCurrentScenario();
  const { validate, validation } = useAstValidationFetcher(currentScenario.id);
  const initialValueRef = useRef(value);
  const handleValidation = useMemo(() => {
    return R.debounce((astNode: AstNode) => validate(astNode, 'string'), {
      waitMs: 300,
    }).call;
  }, [validate]);

  const caseNameContent = value ? getAstNodeDisplayElement(value) : '';
  const isDefaultCaseName = useMemo(() => {
    return value
      ? R.isDeepEqual(value, initialValueRef.current ?? defaultCaseNameNode)
      : true;
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
          className="border-grey-90 text-s flex grow items-center overflow-hidden rounded border p-2"
        >
          {caseNameContent}
        </button>
        {!isDefaultCaseName ? (
          <Button
            size="icon"
            variant="secondary"
            onClick={() =>
              onChange(initialValueRef.current ?? defaultCaseNameNode)
            }
          >
            <Icon icon="restart-alt" className="size-4" />
            <span className="line-clamp-1">
              {t('scenarios:edit_operand.clear_operand')}
            </span>
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
            initialNode={value ?? NewStringTemplateAstNode()}
            initialErrors={validation}
            onSave={handleAstNodeChange}
            onEdit={handleValidation}
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

  return (
    <span className="truncate whitespace-pre-wrap text-nowrap">
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
