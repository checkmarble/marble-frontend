import {
  adaptAstNodeToViewModelFromIdentifier,
  type AstNode,
  type AstViewModel,
} from '@app-builder/models';
import { useEditorIdentifiers } from '@app-builder/services/editor';
import { Tooltip } from '@ui-design-system';

import { Condition } from './Condition';

interface PayloadProps {
  node: AstNode;
  isRoot?: boolean;
}

function format(viewModel: AstViewModel) {
  return {
    tooltip: 'This is from the payload',
    inline: viewModel.label,
  };
}

export function Payload({ node, isRoot }: PayloadProps) {
  const editorIdentifier = useEditorIdentifiers();
  const viewModel = adaptAstNodeToViewModelFromIdentifier(
    node,
    editorIdentifier
  );
  console.log(viewModel);
  const { tooltip, inline } = format(viewModel);
  console.log(JSON.stringify(node, null, 2));
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
