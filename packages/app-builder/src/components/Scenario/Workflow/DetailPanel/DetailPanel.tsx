import { Callout } from '@app-builder/components/Callout';
import { useTranslation } from 'react-i18next';
import { assertNever } from 'typescript-utils';
import { Button, ModalV2, Separator, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';

import {
  type ActionData,
  isActionData,
  isEmptyNodeData,
  isTriggerData,
  type TriggerData,
  useTitleInfo,
} from '../models/nodes';
import type { ValidWorkflow } from '../models/validation';
import {
  useCreateNodeType,
  useSelectedNodes,
  useValidationPayload,
  useWorkflowActions,
  useWorkflowData,
} from '../WorkflowProvider';
import { workflowI18n } from '../workflow-i18n';
import { AddToCaseIfPossibleNode } from './AddToCaseIfPossibleNode';
import { Checklist } from './Checklist';
import { CreateCaseNode } from './CreateCaseNode';
import { DecisionCreatedNode } from './DecisionCreatedNode';

interface DetailPanelProps {
  onSave: (validWorkflow: ValidWorkflow) => void;
  onDelete: () => void;
}

export function DetailPanel({ onSave, onDelete }: DetailPanelProps) {
  const { t } = useTranslation(workflowI18n);
  const validationPayload = useValidationPayload();

  const saveWorkflow = () => {
    if (!validationPayload.isValid) return;
    onSave(validationPayload.value);
  };

  return (
    // eslint-disable-next-line tailwindcss/no-custom-classname -- nokey class ensures that ReactFlow onKeyDown event is not triggered (ex: delete node)
    <div className="border-grey-90 bg-grey-100 nokey flex h-full flex-col overflow-hidden border-s">
      <div className="flex h-full flex-col gap-4 overflow-y-auto p-6">
        <DetailPanelContent />
      </div>
      <Separator className="bg-grey-90" />
      <div className="flex items-center justify-center gap-4 p-4">
        <ModalV2.Root>
          <ModalV2.Trigger render={<Button className="w-full" color="red" />}>
            <Icon icon="delete" className="size-6" />
            {t('common:delete')}
          </ModalV2.Trigger>
          <ModalV2.Content>
            <ModalV2.Title>
              {t('workflows:detail_panel.confirm_delete_workflow.title')}
            </ModalV2.Title>
            <div className="flex flex-col gap-6 p-6">
              <ModalV2.Description>
                {t('workflows:detail_panel.confirm_delete_workflow.description')}
              </ModalV2.Description>
              <div className="flex flex-1 flex-row gap-4">
                <ModalV2.Close
                  render={<Button className="flex-1" variant="secondary" name="cancel" />}
                >
                  {t('common:cancel')}
                </ModalV2.Close>
                <Button className="flex-1" color="red" onClick={onDelete}>
                  <Icon icon="delete" className="size-6" />
                  {t('common:delete')}
                </Button>
              </div>
            </div>
          </ModalV2.Content>
        </ModalV2.Root>

        <Button className="w-full" disabled={!validationPayload.isValid} onClick={saveWorkflow}>
          <Icon icon="rule-settings" className="size-6" />
          {t('common:save')}
        </Button>
      </div>
    </div>
  );
}

function DetailPanelContent() {
  const selectedNodes = useSelectedNodes();

  if (selectedNodes.length > 1) {
    return <MultipleSelectedNodes />;
  }

  const selectedNode = selectedNodes[0];
  if (selectedNode === undefined) {
    return <NoSelectedNodes />;
  }

  if (isEmptyNodeData(selectedNode.data)) {
    return <CreateAllowedNode id={selectedNode.id} />;
  }

  if (isTriggerData(selectedNode.data)) {
    return (
      <>
        <NodeTitle data={selectedNode.data} />
        <Separator className="bg-grey-90" />
        <TriggerNode id={selectedNode.id} data={selectedNode.data} />
      </>
    );
  }

  if (isActionData(selectedNode.data)) {
    return (
      <>
        <NodeTitle data={selectedNode.data} />
        <Separator className="bg-grey-90" />
        <ActionNode id={selectedNode.id} data={selectedNode.data} />
      </>
    );
  }

  assertNever('Unknown node type', selectedNode.data);
}

function NoSelectedNodes() {
  const { t } = useTranslation(workflowI18n);

  return (
    <>
      <p className="text-l text-grey-00 font-medium">
        {t('workflows:detail_panel.no_selected_nodes.title')}
      </p>
      <p className="text-s text-grey-00">
        {t('workflows:detail_panel.no_selected_nodes.description')}
      </p>
      <Separator className="bg-grey-90" />
      <Checklist />
    </>
  );
}

function MultipleSelectedNodes() {
  const { t } = useTranslation(workflowI18n);
  const { clearSelection } = useWorkflowActions();

  return (
    <>
      <p className="text-l text-grey-00 font-medium">
        {t('workflows:detail_panel.multiple_selected_nodes.title')}
      </p>
      <p className="text-s text-grey-00">
        {t('workflows:detail_panel.multiple_selected_nodes.description')}
      </p>
      <Button onClick={clearSelection}>
        {t('workflows:detail_panel.multiple_selected_nodes.clear_selection')}
      </Button>
    </>
  );
}

function CreateAllowedNode({ id }: { id: string }) {
  const type = useCreateNodeType(id);
  switch (type) {
    case 'trigger':
      return <CreateTriggerNode id={id} />;
    case 'action':
      return <CreateActionNode id={id} />;
  }
}

function CreateTriggerNode({ id }: { id: string }) {
  const { t } = useTranslation(workflowI18n);
  const { nonEditableData } = useWorkflowData();
  const { updateNode } = useWorkflowActions();

  return (
    <>
      <p className="text-l text-grey-00 font-medium">
        {t('workflows:detail_panel.create_trigger_node.title')}
      </p>
      <Callout>
        <p className="text-s text-grey-00">
          {t('workflows:detail_panel.create_trigger_node.description')}
        </p>
      </Callout>
      <ul className="flex w-full list-inside list-none flex-col gap-2">
        <li>
          <Button
            onClick={() => {
              updateNode(id, {
                type: 'decision-created',
                scenarioId: nonEditableData.scenarioId,
                outcomes: [],
              });
            }}
          >
            {t('workflows:trigger_node.decision_created.title')}
          </Button>
        </li>
      </ul>
    </>
  );
}

function CreateActionNode({ id }: { id: string }) {
  const { t } = useTranslation(workflowI18n);
  const { updateNode } = useWorkflowActions();

  return (
    <>
      <p className="text-l text-grey-00 font-medium">
        {t('workflows:detail_panel.create_action_node.title')}
      </p>
      <Callout>
        <p className="text-s text-grey-00">
          {t('workflows:detail_panel.create_action_node.description')}
        </p>
      </Callout>
      <ul className="flex w-full list-inside list-none flex-col gap-2">
        <li>
          <Button
            onClick={() => {
              updateNode(id, {
                type: 'create-case',
                inboxId: null,
                caseName: null,
              });
            }}
          >
            {t('workflows:action_node.create_case.title')}
          </Button>
        </li>

        <li>
          <Button
            onClick={() => {
              updateNode(id, {
                type: 'add-to-case-if-possible',
                inboxId: null,
                caseName: null,
              });
            }}
          >
            {t('workflows:action_node.add_to_case_if_possible.title')}
          </Button>
        </li>
      </ul>
    </>
  );
}

function NodeTitle({ data }: { data: TriggerData | ActionData }) {
  const { t } = useTranslation(workflowI18n);
  const { icon, title, entity } = useTitleInfo(data);

  return (
    <div className="flex flex-row gap-2">
      <div className="text-grey-00 bg-purple-96 flex aspect-square max-h-14 items-center justify-center rounded-md p-2">
        <Icon icon={icon} className="text-purple-65 size-9 rounded-md" />
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <Tag color="grey" className="w-fit">
          {entity}
        </Tag>
        <span className="text-grey-00 flex-1 font-semibold">{title}</span>
      </div>
      <div className="flex max-h-14 items-center">
        <Tag size="big" border="square">
          {t('common:edit')}
        </Tag>
      </div>
    </div>
  );
}

function TriggerNode({ id, data }: { id: string; data: TriggerData }) {
  switch (data.type) {
    case 'decision-created':
      return <DecisionCreatedNode id={id} data={data} />;
    default:
      assertNever('Unknown trigger data type', data.type);
  }
}

function ActionNode({ id, data }: { id: string; data: ActionData }) {
  switch (data.type) {
    case 'create-case':
      return <CreateCaseNode id={id} data={data} />;
    case 'add-to-case-if-possible':
      return <AddToCaseIfPossibleNode id={id} data={data} />;
    default:
      assertNever('Unknown action data type', data);
  }
}
