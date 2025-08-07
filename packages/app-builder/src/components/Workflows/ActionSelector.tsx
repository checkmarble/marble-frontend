import { type AstNode } from '@app-builder/models';
import { adaptAstNode, adaptNodeDto } from '@app-builder/models/astNode/ast-node';
import { NewPayloadAstNode } from '@app-builder/models/astNode/data-accessor';
import {
  isStringTemplateAstNode,
  NewStringTemplateAstNode,
  type StringTemplateAstNode,
} from '@app-builder/models/astNode/strings';
import { WorkflowAction } from '@app-builder/models/scenario/workflow';
import { useListInboxesQuery } from '@app-builder/queries/Workflows/list-inboxes';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { CaseNameEditor } from './CaseNameEditor';
import { InboxSelector } from './InboxSelector';
import { useWorkflowDataFeatureAccess } from './WorkflowProvider';

interface ActionSelectorProps {
  action?: WorkflowAction;
  onChange?: (action: WorkflowAction) => void;
}

export function ActionSelector({ action, onChange }: ActionSelectorProps) {
  const { t } = useTranslation('workflows');
  const workflowFeatureAccess = useWorkflowDataFeatureAccess();
  const isCreateInboxAvailable = workflowFeatureAccess.isCreateInboxAvailable;

  const inboxesQuery = useListInboxesQuery();
  const [open, setOpen] = useState(false);
  // Generate a stable temporary ID for new actions being built
  const tempIdRef = useRef<string | null>(null);

  // Generate temp ID only once for new actions
  if (!action && !tempIdRef.current) {
    tempIdRef.current = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }

  // Reset temp ID when we have an existing action
  if (action && tempIdRef.current) {
    tempIdRef.current = null;
  }

  const actionOptions = [
    {
      value: 'DISABLED',
      label: t('workflows:action.disabled.label'),
      description: t('workflows:action.disabled.description'),
      icon: 'stop',
    },
    {
      value: 'CREATE_CASE',
      label: t('workflows:action.create_case.label'),
      description: t('workflows:action.create_case.description'),
      icon: 'plus',
    },
    {
      value: 'ADD_TO_CASE_IF_POSSIBLE',
      label: t('workflows:action.add_to_case_if_possible.label'),
      description: t('workflows:action.add_to_case_if_possible.description'),
      icon: 'plus',
    },
  ] as const;

  // Helper function to create a proper default title template
  const createDefaultTitleTemplate = (): StringTemplateAstNode => {
    return NewStringTemplateAstNode('Case %object_id%', {
      object_id: NewPayloadAstNode('object_id'),
    });
  };

  // Helper function to ensure AST node has proper structure
  const ensureValidAstNode = (node: AstNode): AstNode => {
    return {
      ...node,
      children: node.children || [],
      namedChildren: node.namedChildren || {},
    };
  };

  const handleActionSelect = (actionType: (typeof actionOptions)[number]['value']) => {
    const id =
      action?.id ||
      tempIdRef.current ||
      `temp-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    let newAction: WorkflowAction;

    switch (actionType) {
      case 'DISABLED':
        newAction = {
          id,
          action: 'DISABLED',
        };
        break;
      case 'CREATE_CASE':
        newAction = {
          id,
          action: 'CREATE_CASE',
          params: {
            inboxId: inboxesQuery.data?.[0]?.id ?? '',
            anyInbox: false,
            titleTemplate: adaptAstNode(adaptNodeDto(createDefaultTitleTemplate())),
          },
        };
        break;
      case 'ADD_TO_CASE_IF_POSSIBLE':
        newAction = {
          id,
          action: 'ADD_TO_CASE_IF_POSSIBLE',
          params: {
            inboxId: inboxesQuery.data?.[0]?.id ?? '',
            anyInbox: false,
            titleTemplate: adaptAstNode(adaptNodeDto(createDefaultTitleTemplate())),
          },
        };
        break;
      default:
        return;
    }

    onChange?.(newAction);
  };

  const handleInboxSelect = (inboxId: string) => {
    if (!action || action.action === 'DISABLED' || !('params' in action)) return;

    const newAction: WorkflowAction = {
      ...action,
      params: {
        ...action.params,
        inboxId: inboxId === 'any_inbox' ? (inboxesQuery.data?.[0]?.id ?? '') : inboxId,
        anyInbox: inboxId === 'any_inbox',
      },
    };

    onChange?.(newAction);
  };

  const handleTitleTemplateChange = (titleTemplate: StringTemplateAstNode | null) => {
    if (!action || action.action === 'DISABLED' || !('params' in action)) return;

    const templateToUse = titleTemplate || createDefaultTitleTemplate();
    const safeTemplate = ensureValidAstNode(templateToUse);

    const newAction: WorkflowAction = {
      ...action,
      params: {
        ...action.params,
        titleTemplate: safeTemplate,
      },
    };

    onChange?.(newAction);
  };

  const needsInbox =
    action?.action === 'CREATE_CASE' || action?.action === 'ADD_TO_CASE_IF_POSSIBLE';
  const selectedAction = action?.action;

  const getTitleTemplateAsStringTemplate = (): StringTemplateAstNode => {
    if (!action || !('params' in action) || !action.params?.titleTemplate) {
      return createDefaultTitleTemplate();
    }

    try {
      let astNode: AstNode;
      // If it's already an AstNode, use it directly
      if (
        'id' in action.params.titleTemplate &&
        typeof action.params.titleTemplate.id === 'string'
      ) {
        astNode = action.params.titleTemplate as AstNode;
      } else {
        // Otherwise, adapt from NodeDto
        astNode = action.params.titleTemplate;
      }

      // Ensure the node has proper structure
      const safeNode = ensureValidAstNode(astNode);

      // Check if it's a StringTemplateAstNode and return it, otherwise return default
      return isStringTemplateAstNode(safeNode) ? safeNode : createDefaultTitleTemplate();
    } catch (error) {
      console.warn('Error processing title template, using default:', error);
      return createDefaultTitleTemplate();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <MenuCommand.Menu open={open} onOpenChange={setOpen}>
        <MenuCommand.Trigger>
          <Button variant="secondary">
            {selectedAction ? (
              <>
                <Icon
                  icon={
                    (actionOptions.find((opt) => opt.value === selectedAction)?.icon as any) ||
                    'trigger'
                  }
                  className="size-4"
                />
                {actionOptions.find((opt) => opt.value === selectedAction)?.label}
              </>
            ) : (
              <>
                <Icon icon="plus" className="size-4" />
                <span>{t('workflows:action.add_action')}</span>
              </>
            )}
          </Button>
        </MenuCommand.Trigger>
        <MenuCommand.Content>
          <MenuCommand.List>
            {actionOptions.map((option) => (
              <MenuCommand.Item
                key={option.value}
                value={option.value}
                onSelect={() => handleActionSelect(option.value)}
                className="flex flex-col items-start gap-1 p-3 hover:bg-grey-05 rounded-md cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Icon icon={option.icon as any} className="size-4 text-grey-50" />
                  <span className="font-medium text-grey-00">{option.label}</span>
                </div>
                <span className="text-sm text-grey-50">{option.description}</span>
              </MenuCommand.Item>
            ))}
          </MenuCommand.List>
        </MenuCommand.Content>
      </MenuCommand.Menu>

      {needsInbox && (
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-2">
            <div className="bg-grey-20 px-3 py-1 rounded min-w-20 flex justify-center h-10 items-center">
              <span className="text-grey-60 font-bold text-sm">
                {t('workflows:action.in_inbox')}
              </span>
            </div>
            <div className="flex-1">
              <InboxSelector
                selectedInboxId={action && 'params' in action ? action.params?.inboxId : undefined}
                onSelectedInboxIdChange={handleInboxSelect}
                inboxes={inboxesQuery.data || []}
                isCreateInboxAvailable={isCreateInboxAvailable}
                withAnyInboxAvailable={false}
                isAnyInboxSelected={action && 'params' in action ? action.params?.anyInbox : false}
              />
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="bg-grey-20 px-3 py-1 rounded min-w-20 flex justify-center h-10 items-center">
              <span className="text-grey-60 font-bold text-sm text-nowrap">
                {t('workflows:action.inbox.with_title')}
              </span>
            </div>
            <div className="flex-1">
              <CaseNameEditor
                label=""
                value={getTitleTemplateAsStringTemplate()}
                onChange={handleTitleTemplateChange}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
