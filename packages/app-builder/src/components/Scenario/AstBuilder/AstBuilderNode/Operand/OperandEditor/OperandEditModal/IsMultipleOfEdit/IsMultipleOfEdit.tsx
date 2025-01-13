import {
  type AstNode,
  type IsMultipleOfAstNode,
  NewConstantAstNode,
  NewIsMultipleOfAstNode,
} from '@app-builder/models';
import { type AstNodeErrors } from '@app-builder/services/validation/ast-node-validation';
import { formatNumber, useFormatLanguage } from '@app-builder/utils/format';
import { useTranslation } from 'react-i18next';
import { Button, ModalV2, Select } from 'ui-design-system';

import { useIsMultipleOfEditState } from './IsMultipleOfEdit.hook';
import { LeftOperand } from './LeftOperand';

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

export function IsMultipleOfEdit({
  initialIsMultipleOfAstNode,
  initialAstNodeErrors,
  onSave,
}: {
  initialIsMultipleOfAstNode: IsMultipleOfAstNode;
  initialAstNodeErrors: AstNodeErrors;
  onSave: (astNode: AstNode) => void;
}) {
  const { t } = useTranslation(['scenarios', 'common']);
  const language = useFormatLanguage();

  const { value, setValue, divider, setDivider } = useIsMultipleOfEditState(
    initialIsMultipleOfAstNode,
    initialAstNodeErrors,
  );

  const handleSave = () => {
    const isMultipleOfAstNode = NewIsMultipleOfAstNode(
      value.astNode,
      NewConstantAstNode({ constant: divider.value }),
    );
    onSave(isMultipleOfAstNode);
  };

  return (
    <>
      <ModalV2.Title>{t('scenarios:edit_is_multiple_of.title')}</ModalV2.Title>
      <div className="flex flex-col gap-9 p-6">
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <LeftOperand
              astNode={value.astNode}
              astNodeErrors={value.astNodeErrors}
              validationStatus={
                (value.astNodeErrors?.errors ?? []).length > 0
                  ? 'error'
                  : 'valid'
              }
              onChange={setValue}
            />
            <div className="border-grey-90 bg-grey-98 flex h-10 w-fit min-w-[40px] items-center justify-center rounded border p-2 text-center">
              <span className="text-s text-grey-00 font-medium">
                {t('scenarios:edit_is_multiple_of.label')}
              </span>
            </div>
            <Select.Default
              value={divider.value.toString()}
              onValueChange={(value) => setDivider(parseInt(value, 10))}
            >
              {dividerOptions.map((dividerOption) => (
                <Select.DefaultItem
                  key={dividerOption.value}
                  value={dividerOption.value.toString()}
                >
                  {formatNumber(dividerOption.value, {
                    language,
                    style: undefined,
                  })}
                </Select.DefaultItem>
              ))}
            </Select.Default>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <Examples divider={divider.value} />
        </div>
        <div className="flex flex-1 flex-row gap-2">
          <ModalV2.Close
            render={
              <Button className="flex-1" variant="secondary" name="cancel" />
            }
          >
            {t('common:cancel')}
          </ModalV2.Close>
          <Button
            className="flex-1"
            variant="primary"
            name="save"
            onClick={() => handleSave()}
          >
            {t('common:save')}
          </Button>
        </div>
      </div>
    </>
  );
}

function Examples({ divider }: { divider: number }) {
  const { t } = useTranslation(['common', 'scenarios']);
  const language = useFormatLanguage();

  return (
    <table className="border-grey-90 table-auto border-collapse border">
      <caption className="sr-only">
        {t('scenarios:edit_is_multiple_of.examples.caption')}
      </caption>
      <thead>
        <tr>
          <th className="text-grey-00 bg-grey-98 border-grey-90 border px-2 text-start text-xs font-normal capitalize">
            {t('scenarios:edit_is_multiple_of.examples.value')}
          </th>
          <th className="text-grey-00 bg-grey-98 border-grey-90 border px-2 text-start text-xs font-normal capitalize">
            {t('scenarios:edit_is_multiple_of.examples.result')}
          </th>
        </tr>
      </thead>
      <tbody>
        {[
          {
            left: 5,
          },
          {
            left: 20,
          },
          {
            left: 700,
          },
          {
            left: 2000,
          },
          {
            left: 380000,
          },
          {
            left: 380002,
          },
          {
            left: 380002.1,
          },
        ].map(({ left }) => (
          <tr key={`${left}`}>
            <td className="text-grey-00 border-grey-90 border px-2 text-xs font-normal">
              {formatNumber(left, {
                language,
                style: undefined,
              })}
            </td>
            <td className="text-grey-00 border-grey-90 border px-2 text-xs font-normal">
              {t(`common:${left % divider === 0}`)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
