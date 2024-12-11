import {
  type AstNode,
  type IsRoundedAstNode,
  NewConstantAstNode,
  NewIsRoundedAstNode,
} from '@app-builder/models';
import { type AstNodeErrors } from '@app-builder/services/validation/ast-node-validation';
import { formatNumber, useFormatLanguage } from '@app-builder/utils/format';
import { useTranslation } from 'react-i18next';
import { Button, ModalV2, Select } from 'ui-design-system';

import { useIsRoundedEditState } from './IsRoundedEdit.hook';
import { LeftOperand } from './LeftOperand';

const thresholdOptions = [
  { value: '1' },
  { value: '10' },
  { value: '100' },
  { value: '1000' },
  { value: '10000' },
  { value: '100000' },
  { value: '1000000' },
  { value: '10000000' },
  { value: '100000000' },
  { value: '1000000000' },
];

export function IsRoundedEdit({
  initialIsRoundedAstNode,
  initialAstNodeErrors,
  onSave,
}: {
  initialIsRoundedAstNode: IsRoundedAstNode;
  initialAstNodeErrors: AstNodeErrors;
  onSave: (astNode: AstNode) => void;
}) {
  const { t } = useTranslation(['scenarios', 'common']);
  const language = useFormatLanguage();

  const { value, setValue, threshold, setThreshold } = useIsRoundedEditState(
    initialIsRoundedAstNode,
    initialAstNodeErrors,
  );

  const handleSave = () => {
    const isRoundedAstNode = NewIsRoundedAstNode(
      value.astNode,
      NewConstantAstNode({ constant: threshold.value }),
    );
    onSave(isRoundedAstNode);
  };

  return (
    <>
      <ModalV2.Title>{t('scenarios:edit_is_rounded.title')}</ModalV2.Title>
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
            <div className="border-grey-10 bg-grey-02 flex h-10 w-fit min-w-[40px] items-center justify-center rounded border p-2 text-center">
              <span className="text-s text-grey-100 font-medium">
                is multiple of
              </span>
            </div>
            <Select.Default
              value={threshold.value.toString()}
              onValueChange={(value) => setThreshold(parseInt(value, 10))}
            >
              {thresholdOptions.map((thresholdOption) => (
                <Select.DefaultItem
                  key={thresholdOption.value}
                  value={thresholdOption.value}
                >
                  {formatNumber(parseInt(thresholdOption.value, 10), {
                    language,
                    style: undefined,
                  })}
                </Select.DefaultItem>
              ))}
            </Select.Default>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <Examples threshold={threshold.value} />
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

function Examples({ threshold }: { threshold: number }) {
  const { t } = useTranslation(['common', 'scenarios']);
  const language = useFormatLanguage();

  return (
    <table className="border-grey-10 table-auto border-collapse border">
      <caption className="sr-only">
        {t('scenarios:edit_is_rounded.examples.caption')}
      </caption>
      <thead>
        <tr>
          <th className="text-grey-100 bg-grey-02 border-grey-10 border px-2 text-start text-xs font-normal capitalize">
            {t('scenarios:edit_is_rounded.examples.value')}
          </th>
          <th className="text-grey-100 bg-grey-02 border-grey-10 border px-2 text-start text-xs font-normal capitalize">
            {t('scenarios:edit_is_rounded.examples.result')}
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
            <td className="text-grey-100 border-grey-10 border px-2 text-xs font-normal">
              {formatNumber(left, {
                language,
                style: undefined,
              })}
            </td>
            <td className="text-grey-100 border-grey-10 border px-2 text-xs font-normal">
              {t(`common:${left % threshold === 0}`)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
