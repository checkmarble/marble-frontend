import { type NodeProps } from 'reactflow';
import { assertNever } from 'typescript-utils';
import { Separator } from 'ui-design-system';

import { type TriggerData } from '../models/nodes';
import { DecisionCreatedTriggerContent } from './DecisionCreatedTriggerContent';
import { NodeTitle, TriggerNodeContainer } from './shared';

export function Trigger({ id, selected, data }: NodeProps<TriggerData>) {
  return (
    <TriggerNodeContainer id={id} selected={selected}>
      <NodeTitle data={data} />
      <Separator className="bg-grey-90" />
      <TriggerContent data={data} />
    </TriggerNodeContainer>
  );
}

function TriggerContent({ data }: { data: TriggerData }) {
  switch (data.type) {
    case 'decision-created':
      return <DecisionCreatedTriggerContent data={data} />;
    default:
      assertNever('Unknown TriggerData', data.type);
  }
}
