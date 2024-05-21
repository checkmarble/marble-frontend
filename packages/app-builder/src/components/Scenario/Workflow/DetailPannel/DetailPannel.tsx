import { Callout } from '@app-builder/components/Callout';
import { useTranslation } from 'react-i18next';
import { assertNever } from 'typescript-utils';
import { Button, Separator, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';

import {
  type ActionData,
  isActionData,
  isEmptyNodeData,
  isTriggerData,
  type TriggerData,
  useTitleInfo,
} from '../models/node-data';
import { workflowI18n } from '../workflow-i18n';
import {
  useCreateNodeType,
  useSelectedNodes,
  useWorkflowActions,
} from '../WorkflowProvider';
import { AddToCaseIfPossibleNode } from './AddToCaseIfPossibleNode';
import { CreateCaseNode } from './CreateCaseNode';
import { DecisionCreatedNode } from './DecisionCreatedNode';

export function DetailPannel() {
  return (
    <div className="border-grey-10 bg-grey-00 flex h-full flex-col gap-4 border-l p-6">
      <DetailPannelContent />
    </div>
  );
}

function DetailPannelContent() {
  const selectedNodes = useSelectedNodes();

  if (selectedNodes.length > 1) {
    return <MultipleSelectedNodes />;
  }

  const selectedNode = selectedNodes.at(0);
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
        <Separator className="bg-grey-10" />
        <TriggerNode id={selectedNode.id} data={selectedNode.data} />
      </>
    );
  }

  if (isActionData(selectedNode.data)) {
    return (
      <>
        <NodeTitle data={selectedNode.data} />
        <Separator className="bg-grey-10" />
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
      <p className="text-l text-grey-100 font-medium">
        {t('workflows:detail_pannel.no_selected_nodes.title')}
      </p>
      <p className="text-s text-grey-100">
        {t('workflows:detail_pannel.no_selected_nodes.description')}
      </p>
    </>
  );
}

function MultipleSelectedNodes() {
  const { t } = useTranslation(workflowI18n);
  const { clearSelection } = useWorkflowActions();

  return (
    <>
      <p className="text-l text-grey-100 font-medium">
        {t('workflows:detail_pannel.multiple_selected_nodes.title')}
      </p>
      <p className="text-s text-grey-100">
        {t('workflows:detail_pannel.multiple_selected_nodes.description')}
      </p>
      <Button onClick={clearSelection}>
        {t('workflows:detail_pannel.multiple_selected_nodes.clear_selection')}
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
  const { updateNode } = useWorkflowActions();

  return (
    <>
      <p className="text-l text-grey-100 font-medium">
        {t('workflows:detail_pannel.create_trigger_node.title')}
      </p>
      <Callout>
        <p className="text-s text-grey-100">
          {t('workflows:detail_pannel.create_trigger_node.description')}
        </p>
      </Callout>
      <ul className="flex w-full list-inside list-none flex-col gap-2">
        <li>
          <Button
            onClick={() => {
              updateNode(id, {
                type: 'decision-created',
                scenarioId: null,
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
      <p className="text-l text-grey-100 font-medium">
        {t('workflows:detail_pannel.create_action_node.title')}
      </p>
      <Callout>
        <p className="text-s text-grey-100">
          {t('workflows:detail_pannel.create_action_node.description')}
        </p>
      </Callout>
      <ul className="flex w-full list-inside list-none flex-col gap-2">
        <li>
          <Button
            onClick={() => {
              updateNode(id, {
                type: 'create-case',
                inboxId: null,
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
      <div className="text-grey-100 bg-purple-10 flex aspect-square max-h-14 items-center justify-center rounded-md p-2">
        <Icon icon={icon} className="size-9 rounded-md text-purple-100" />
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <Tag color="grey" className="w-fit">
          {entity}
        </Tag>
        <span className="text-grey-100 flex-1 font-semibold">{title}</span>
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
