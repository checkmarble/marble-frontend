import { type AstNode, type DataModel } from '@app-builder/models';
import { adaptAstNode, adaptNodeDto } from '@app-builder/models/astNode/ast-node';
import { NewStringTemplateAstNode } from '@app-builder/models/astNode/strings';
import { WorkflowAction } from '@app-builder/models/scenario/workflow';
import { useListInboxesQuery } from '@app-builder/queries/Workflows/list-inboxes';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { workflowI18n } from '../Scenario/Workflow/workflow-i18n';
import { InboxSelector } from './InboxSelector';
import { WorkflowAstProvider } from './WorkflowAstProvider';
import { WorkflowPayloadEvaluationNode } from './WorkflowPayloadEvaluationNode';
import { useWorkflowDataFeatureAccess } from './WorkflowProvider';

interface ActionSelectorProps {
  action?: WorkflowAction;
  onChange?: (action: WorkflowAction) => void;
  triggerObjectType?: string;
  dataModel?: DataModel;
}

export function ActionSelector({
  action,
  onChange,
  triggerObjectType = 'decision',
  dataModel = [],
}: ActionSelectorProps) {
  const { t } = useTranslation(workflowI18n);
  const { isCreateInboxAvailable } = useWorkflowDataFeatureAccess();

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
      label: 'Do nothing',
      description: 'No action will be taken',
      icon: 'stop',
    },
    {
      value: 'CREATE_CASE',
      label: 'Create case',
      description: 'Create a new case in the specified inbox',
      icon: 'plus',
    },
    {
      value: 'ADD_TO_CASE_IF_POSSIBLE',
      label: 'Add to case if possible',
      description: 'Add to existing case or create new one',
      icon: 'plus',
    },
  ] as const;

  // Helper function to create a proper default title template
  const createDefaultTitleTemplate = () => {
    // Create a simple string template with a basic template
    return NewStringTemplateAstNode('Case {{object_id}}', {});
  };

  const handleActionSelect = (actionType: (typeof actionOptions)[number]['value']) => {
    let newAction: WorkflowAction;

    switch (actionType) {
      case 'DISABLED':
        newAction = {
          action: 'DISABLED',
          id:
            action?.id ||
            tempIdRef.current ||
            `temp-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        };
        break;
      case 'CREATE_CASE':
        newAction = {
          action: 'CREATE_CASE',
          id:
            action?.id ||
            tempIdRef.current ||
            `temp-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
          params: {
            inbox_id: inboxesQuery.data?.[0]?.id || 'default-inbox', // Use first inbox or fallback
            any_inbox: false,
            title_template: adaptNodeDto(createDefaultTitleTemplate()),
          },
        };
        break;
      case 'ADD_TO_CASE_IF_POSSIBLE':
        newAction = {
          action: 'ADD_TO_CASE_IF_POSSIBLE',
          id:
            action?.id ||
            tempIdRef.current ||
            `temp-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
          params: {
            inbox_id: inboxesQuery.data?.[0]?.id || 'default-inbox', // Use first inbox or fallback
            any_inbox: false,
            title_template: adaptNodeDto(createDefaultTitleTemplate()),
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
        inbox_id: inboxId,
        any_inbox: false, // When selecting a specific inbox, turn off any_inbox
      },
    };

    onChange?.(newAction);
  };

  const handleTitleTemplateChange = (titleTemplate: AstNode) => {
    if (!action || action.action === 'DISABLED' || !('params' in action)) return;

    const newAction: WorkflowAction = {
      ...action,
      params: {
        ...action.params,
        title_template: adaptNodeDto(titleTemplate),
      },
    };

    onChange?.(newAction);
  };

  const handleInitializeTitleTemplate = () => {
    if (!action || action.action === 'DISABLED' || !('params' in action)) return;

    const newAction: WorkflowAction = {
      ...action,
      params: {
        ...action.params,
        title_template: adaptNodeDto(createDefaultTitleTemplate()),
      },
    };

    onChange?.(newAction);
  };

  const needsInbox =
    action?.action === 'CREATE_CASE' || action?.action === 'ADD_TO_CASE_IF_POSSIBLE';
  const selectedAction = action?.action;

  const getTitleTemplate = (): AstNode | undefined => {
    if (!action || !('params' in action) || !action.params?.title_template) {
      return undefined;
    }

    // If it's already an AstNode, return it directly
    if (
      'id' in action.params.title_template &&
      typeof action.params.title_template.id === 'string'
    ) {
      return action.params.title_template as AstNode;
    }

    // Otherwise, adapt from NodeDto
    return adaptAstNode(action.params.title_template);
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
          <div className="flex items-center gap-2">
            <div className="bg-grey-20 px-2 py-1 rounded">
              <span className="text-grey-60 font-bold text-sm">in</span>
            </div>
            <div className="flex items-center gap-2">
              <InboxSelector
                selectedInboxId={action && 'params' in action ? action.params?.inbox_id : undefined}
                onSelectedInboxIdChange={handleInboxSelect}
                inboxes={inboxesQuery.data || []}
                isCreateInboxAvailable={isCreateInboxAvailable}
                withAnyInboxAvailable={true}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-grey-20 px-2 py-1 rounded">
              <span className="text-grey-60 font-bold text-sm text-nowrap">
                {t('workflows:action.inbox.with_title')}
              </span>
            </div>
            <div className="flex-1 border border-grey-20 rounded-md p-2 bg-grey-98">
              {getTitleTemplate() ? (
                <WorkflowAstProvider
                  triggerObjectType={triggerObjectType}
                  dataModel={dataModel}
                  node={getTitleTemplate()!}
                  onChange={handleTitleTemplateChange}
                >
                  <WorkflowPayloadEvaluationNode root path="root" />
                </WorkflowAstProvider>
              ) : (
                <button
                  type="button"
                  onClick={handleInitializeTitleTemplate}
                  className="w-full text-left text-grey-50 text-sm hover:text-grey-25 transition-colors cursor-pointer"
                >
                  {t('workflows:action.inbox.add_title_template')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
