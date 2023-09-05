import {
  adaptLabelledAstFromAllIdentifiers,
  type AstNode,
} from '@app-builder/models';
import { useEditorIdentifiers } from '@app-builder/services/editor';
import { Tooltip } from '@ui-design-system';

import { Condition } from './Condition';

interface CustomListProps {
  node: AstNode;
  isRoot?: boolean;
}

export function Identifier({ node, isRoot }: CustomListProps) {
  const allIdentifiers = useEditorIdentifiers();
  const viewModel = adaptLabelledAstFromAllIdentifiers(node, allIdentifiers);
  return (
    <Condition.Container isRoot={isRoot}>
      <Condition.Item isRoot={isRoot}>
        {viewModel.tooltip ? (
          <Tooltip.Default
            content={
              <span className="font-medium text-purple-100">
                {viewModel.tooltip}
              </span>
            }
          >
            <span
              // Hack to have text-ellipsis truncate beggining of the fields
              dir="rtl"
              className="max-w-[250px] overflow-hidden text-ellipsis font-medium text-purple-100 max-md:max-w-[150px]"
            >
              {viewModel.label}
            </span>
          </Tooltip.Default>
        ) : (
          <span
            // Hack to have text-ellipsis truncate beggining of the fields
            dir="rtl"
            className="max-w-[250px] overflow-hidden text-ellipsis font-medium text-purple-100 max-md:max-w-[150px]"
          >
            {viewModel.label}
          </span>
        )}
      </Condition.Item>
    </Condition.Container>
  );
}
