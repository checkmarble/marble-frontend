import { isKnownOperandAstNode } from '@app-builder/models/astNode/builder-ast-node';
import { type IsMultipleOfAstNode } from '@app-builder/models/astNode/multiple-of';
import { formatNumber, useFormatLanguage } from '@app-builder/utils/format';
import { useTranslation } from 'react-i18next';
import { MenuCommand } from 'ui-design-system';

import { EditionAstBuilderOperand } from '../../../EditionOperand';
import { EditionEvaluationErrors } from '../../../EvaluationErrors';
import { getValidationStatus } from '../../../helpers';
import { AstBuilderNodeSharpFactory } from '../../../node-store';
import { OperandEditModalContainer } from '../../Container';
import { type OperandEditModalProps } from '../../EditModal';
import { Examples } from './Examples';

const dividerOptions = [
  { value: 1 },
  { value: 10 },
  { value: 100 },
  { value: 1000 },
  { value: 10000 },
  { value: 100000 },
  { value: 1000000 },
  { value: 10000000 },
  { value: 100000000 },
  { value: 1000000000 },
];

export function EditIsMultipleOf(props: Omit<OperandEditModalProps, 'node'>) {
  const { t } = useTranslation(['scenarios']);
  const language = useFormatLanguage();
  const nodeSharp = AstBuilderNodeSharpFactory.useSharp();
  const node = nodeSharp.select((s) => s.node as IsMultipleOfAstNode);
  const evaluation = nodeSharp.select((s) => s.validation);

  const divider = node.namedChildren.divider.constant ?? 1;

  return (
    <OperandEditModalContainer {...props} title={t('scenarios:edit_is_multiple_of.title')} size="large">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <EditionAstBuilderOperand
              node={node.namedChildren.value}
              optionsDataType={['Int', 'Float']}
              coerceDataType={['Int']}
              onChange={(newValue) => {
                if (isKnownOperandAstNode(newValue)) {
                  node.namedChildren.value = newValue;
                  nodeSharp.actions.validate();
                }
              }}
              validationStatus={getValidationStatus(evaluation, node.namedChildren.value.id)}
            />
            <div className="border-grey-90 bg-grey-98 flex h-10 w-fit min-w-[40px] items-center justify-center rounded-sm border p-2 text-center">
              <span className="text-s text-grey-00 font-medium">{t('scenarios:edit_is_multiple_of.label')}</span>
            </div>
            <MenuCommand.Menu>
              <MenuCommand.Trigger>
                <MenuCommand.SelectButton>
                  {formatNumber(divider, {
                    language,
                    style: undefined,
                  })}
                </MenuCommand.SelectButton>
              </MenuCommand.Trigger>
              <MenuCommand.Content align="start" sideOffset={4}>
                <MenuCommand.List>
                  <MenuCommand.Group>
                    {dividerOptions.map((dividerOption) => (
                      <MenuCommand.Item
                        key={dividerOption.value}
                        onSelect={() => {
                          node.namedChildren.divider.constant = dividerOption.value;
                        }}
                      >
                        {formatNumber(dividerOption.value, {
                          language,
                          style: undefined,
                        })}
                      </MenuCommand.Item>
                    ))}
                  </MenuCommand.Group>
                </MenuCommand.List>
              </MenuCommand.Content>
            </MenuCommand.Menu>
          </div>
          <EditionEvaluationErrors id={node.id} filterOut={['FUNCTION_ERROR']} />
        </div>
        <div className="flex flex-col gap-4">
          <Examples divider={divider} />
        </div>
      </div>
    </OperandEditModalContainer>
  );
}
