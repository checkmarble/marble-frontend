import {
  adaptAstNodeToViewModelFromIdentifier,
  type AstNode,
} from '@app-builder/models';
import { useEditorIdentifiers } from '@app-builder/services/editor';
import { Tooltip } from '@ui-design-system';

import { Condition } from './Condition';

interface PayloadProps {
  node: AstNode;
  isRoot?: boolean;
}

function format(label: string) {
  return {
    tooltip: 'This is from the payload',
    inline: label,
  };
}

export function Payload({ node, isRoot }: PayloadProps) {
  const editorIdentifier = useEditorIdentifiers();
  const viewModel = adaptAstNodeToViewModelFromIdentifier(
    node,
    editorIdentifier
  );
  const { tooltip, inline } = format(viewModel.label);
  return (
    <Condition.Container isRoot={isRoot}>
      <Condition.Item isRoot={isRoot}>
        <Tooltip.Default
          content={
            <span className="font-medium text-purple-100">{tooltip}</span>
          }
        >
          <span
            // Hack to have text-ellipsis truncate beggining of the fields
            dir="rtl"
            className="max-w-[250px] overflow-hidden text-ellipsis font-medium text-purple-100 max-md:max-w-[150px]"
          >
            {inline}
          </span>
        </Tooltip.Default>
      </Condition.Item>
    </Condition.Container>
  );
}
