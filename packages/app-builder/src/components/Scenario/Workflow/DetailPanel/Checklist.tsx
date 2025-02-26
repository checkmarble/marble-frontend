import type * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Separator, Tag } from 'ui-design-system';
import { Icon, type IconName } from 'ui-icons';

import {
  type ActionData,
  isTriggerOrActionData,
  type TriggerData,
  useTitleInfo,
} from '../models/nodes';
import {
  adaptGlobalChecklistVM,
  adaptNodeChecklistVM,
  type GlobalChecklistVM,
  type NodeChecklistVM,
} from '../models/validation';
import { workflowI18n } from '../workflow-i18n';
import { useNodeData, useValidationPayload, useWorkflowActions } from '../WorkflowProvider';

export function Checklist() {
  const { t } = useTranslation(workflowI18n);
  const validation = useValidationPayload();

  let content;
  if (validation.isValid) {
    content = (
      <div className="border-grey-90 flex w-full flex-col gap-4 rounded-xl border p-4">
        <Title
          icon="rule-settings"
          title={t('workflows:detail_panel.checklist.error.global.title')}
          scope={t('workflows:detail_panel.checklist.error.global.scope')}
        />
        <Separator className="bg-grey-90" />
        <div className="flex flex-row items-center gap-2">
          <Icon icon="tick" className="text-green-38 size-6 shrink-0 rounded-full" />
          <span className="text-green-68">{t('workflows:detail_panel.checklist.no_issues')}</span>
        </div>
      </div>
    );
  } else {
    const globalChecklist = adaptGlobalChecklistVM(validation.errors);
    const nodeChecklists = adaptNodeChecklistVM(validation.errors);
    content = (
      <div className="flex flex-col gap-2">
        <GlobalChecklist checklist={globalChecklist} />
        {Object.entries(nodeChecklists).map(([nodeId, checklist]) => (
          <NodeChecklist key={nodeId} nodeId={nodeId} checklist={checklist} />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        <p className="text-l text-grey-00 font-medium">
          {t('workflows:detail_panel.checklist.title')}
        </p>
        <p className="text-s text-grey-50">{t('workflows:detail_panel.checklist.description')}</p>
      </div>
      {content}
    </>
  );
}

function GlobalChecklist({ checklist }: { checklist: GlobalChecklistVM }) {
  const { t } = useTranslation(workflowI18n);
  if (Object.values(checklist).every((value) => value === false)) {
    return null;
  }

  return (
    <div className="border-grey-90 flex w-full flex-col gap-4 rounded-xl border p-4">
      <Title
        icon="rule-settings"
        title={t('workflows:detail_panel.checklist.error.global.title')}
        scope={t('workflows:detail_panel.checklist.error.global.scope')}
      />
      <Separator className="bg-grey-90" />
      <div className="flex w-full flex-col gap-2">
        {checklist.hasMissingTriggerNode ? (
          <Issue>{t('workflows:detail_panel.checklist.error.global.missing_trigger_node')}</Issue>
        ) : null}
        {checklist.hasMultipleTriggerNodes ? (
          <Issue>{t('workflows:detail_panel.checklist.error.global.multiple_trigger_nodes')}</Issue>
        ) : null}
        {checklist.hasEmptyNodes ? (
          <Issue>{t('workflows:detail_panel.checklist.error.global.empty_nodes')}</Issue>
        ) : null}
        {checklist.hasGraphLoop ? (
          <Issue>{t('workflows:detail_panel.checklist.error.global.graph_loop')}</Issue>
        ) : null}
      </div>
    </div>
  );
}

function NodeChecklist({ nodeId, checklist }: { nodeId: string; checklist: NodeChecklistVM }) {
  const nodeData = useNodeData(nodeId);
  if (
    !nodeData ||
    !isTriggerOrActionData(nodeData) ||
    Object.values(checklist).every((value) => value === false)
  )
    return null;

  return <NodeChecklistContent nodeId={nodeId} nodeData={nodeData} checklist={checklist} />;
}

function NodeChecklistContent({
  nodeId,
  nodeData,
  checklist,
}: {
  nodeId: string;
  nodeData: TriggerData | ActionData;
  checklist: NodeChecklistVM;
}) {
  const { t } = useTranslation(workflowI18n);
  const { icon, title, entity } = useTitleInfo(nodeData);
  const { selectNode } = useWorkflowActions();

  return (
    <div className="border-grey-90 relative flex w-full flex-col gap-4 rounded-xl border p-4">
      <Title icon={icon} title={title} scope={entity} />
      <Separator className="bg-grey-90" />
      <div className="flex w-full flex-col gap-2">
        {checklist.hasInvalidConfig ? (
          <Issue>{t('workflows:detail_panel.checklist.error.node.invalid_node_config')}</Issue>
        ) : null}
        {checklist.isNotConnectedToTrigger ? (
          <Issue>{t('workflows:detail_panel.checklist.error.node.not_connected_to_trigger')}</Issue>
        ) : null}
        {checklist.hasMissingOutgoingNode ? (
          <Issue>{t('workflows:detail_panel.checklist.error.node.missing_outgoing_node')}</Issue>
        ) : null}
        {checklist.hasMultipleOutgoingNode ? (
          <Issue>{t('workflows:detail_panel.checklist.error.node.multiple_outgoing_nodes')}</Issue>
        ) : null}
        {checklist.hasWrongOutgoinNode ? (
          <Issue>{t('workflows:detail_panel.checklist.error.node.wrong_outgoing_node')}</Issue>
        ) : null}
        {checklist.noOutgoingNodeRequired ? (
          <Issue>
            {t('workflows:detail_panel.checklist.error.node.no_outgoing_node_required')}
          </Issue>
        ) : null}
      </div>
      <Button
        variant="secondary"
        onClick={() => {
          selectNode(nodeId);
        }}
      >
        {t('workflows:detail_panel.checklist.error.node.select_this_node')}
      </Button>
    </div>
  );
}

function Issue({ children }: { children: React.ReactNode }) {
  let content;
  if (typeof children === 'string') {
    content = <span className="text-grey-50 text-s font-medium">{children}</span>;
  } else {
    content = children;
  }
  return (
    <div className="flex flex-row items-center gap-2">
      <div className="bg-yellow-90 border-yellow-75 size-fit shrink-0 overflow-hidden rounded border p-1">
        <Icon icon="warning" className="size-4 shrink-0 text-yellow-50" />
      </div>
      {content}
    </div>
  );
}

function Title({ icon, title, scope }: { icon: IconName; title: string; scope: string }) {
  return (
    <div className="flex flex-row items-center gap-2">
      <div className="text-grey-00 bg-purple-96 size-fit shrink-0 overflow-hidden rounded-md p-1">
        <Icon icon={icon} className="text-purple-65 size-5 shrink-0" />
      </div>
      <span className="text-grey-00 flex-1 font-semibold">{title}</span>
      <Tag color="grey">{scope}</Tag>
    </div>
  );
}
