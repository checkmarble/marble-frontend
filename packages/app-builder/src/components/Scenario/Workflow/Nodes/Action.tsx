import type { NodeProps } from 'reactflow';
import { assertNever } from 'typescript-utils';
import { Separator } from 'ui-design-system';

import type { ActionData } from '../models/nodes';
import { AddToCaseIfPossibleActionContent } from './AddToCaseIfPossibleActionContent';
import { CreateCaseActionContent } from './CreateCaseActionContent';
import { NodeContainer, NodeTitle } from './shared';

export function Action({ id, data, selected }: NodeProps<ActionData>) {
  return (
    <NodeContainer id={id} selected={selected}>
      <NodeTitle data={data} />
      <Separator className="bg-grey-90" />
      <ActionContent data={data} />
    </NodeContainer>
  );
}

function ActionContent({ data }: { data: ActionData }) {
  switch (data.type) {
    case 'create-case':
      return <CreateCaseActionContent data={data} />;
    case 'add-to-case-if-possible':
      return <AddToCaseIfPossibleActionContent data={data} />;
    default:
      assertNever('Unknown ActionData', data);
  }
}
