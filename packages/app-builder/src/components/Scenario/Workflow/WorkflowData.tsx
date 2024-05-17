import { type Inbox } from '@app-builder/models/inbox';
import { type Scenario } from '@app-builder/models/scenario';
import { createSimpleContext } from '@app-builder/utils/create-context';

interface WorkflowDataContext {
  scenarios: Promise<Scenario[]>;
  inboxes: Promise<Inbox[]>;
}

const WorkflowData = createSimpleContext<WorkflowDataContext>(
  'WorkflowDataContext',
);

export const WorkflowDataProvider = WorkflowData.Provider;

export const useWorkflowData = WorkflowData.useValue;
