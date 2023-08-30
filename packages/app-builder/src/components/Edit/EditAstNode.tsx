import {
  adaptLabelledAstFromAllIdentifiers,
  type AstNode,
  isAggregation,
  NewUndefinedAstNode,
  undefinedAstNodeName,
} from '@app-builder/models';
import {
  useEditorIdentifiers,
  useEditorOperators,
  useGetIdentifierOptions,
  useGetOperatorName,
  useIsEditedOnce,
} from '@app-builder/services/editor';
import { getInvalidStates } from '@app-builder/services/validation/scenario-validation';
import { Combobox, Select } from '@ui-design-system';
import { forwardRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { FormControl, FormField, FormItem, FormMessage } from '../Form';
import {
  adaptAggregationViewModel,
  AggregationEditModal,
} from './AggregationEdit';

export function EditAstNode({ name }: { name: string }) {
  const isFirstChildEditedOnce = useIsEditedOnce(`${name}.children.0`);
  const isNameEditedOnce = useIsEditedOnce(name);

  return (
    <FormField
      name={name}
      render={({ fieldState: { error } }) => {
        const invalidStates = getInvalidStates(error);

        return (
          <div className="relative">
            <div className="flex flex-row gap-1">
              <FormField
                name={`${name}.children.0`}
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormControl>
                      <EditOperand
                        {...field}
                        invalid={
                          fieldState.invalid ||
                          invalidStates.root ||
                          invalidStates.children[field.name]
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name={`${name}.name`}
                render={({ field, fieldState }) => (
                  <FormItem className={isFirstChildEditedOnce ? '' : 'hidden'}>
                    <FormControl>
                      <EditOperator
                        {...field}
                        invalid={
                          fieldState.invalid ||
                          invalidStates.root ||
                          invalidStates.name
                        }
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                name={`${name}.children.1`}
                render={({ field, fieldState }) => (
                  <FormItem className={isNameEditedOnce ? '' : 'hidden'}>
                    <FormControl>
                      <EditOperand
                        {...field}
                        invalid={
                          fieldState.invalid ||
                          invalidStates.root ||
                          invalidStates.children[field.name]
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {invalidStates.root && isFirstChildEditedOnce && <FormMessage />}
          </div>
        );
      }}
    />
  );
}

export const EditOperand = forwardRef<
  HTMLInputElement,
  {
    name: string;
    value: AstNode;
    onChange: (value: AstNode) => void;
    onBlur: () => void;
    invalid: boolean;
  }
>(({ name, onChange, onBlur, value, invalid }, ref) => {
  const editorIdentifier = useEditorIdentifiers();
  const getIdentifierOptions = useGetIdentifierOptions();
  const selectedItem = value
    ? adaptLabelledAstFromAllIdentifiers(value, editorIdentifier)
    : null;

  const [inputValue, setInputValue] = useState(selectedItem?.label ?? '');

  const items = getIdentifierOptions(inputValue);

  const filteredItems = items.filter((item) =>
    item.label.toLowerCase().includes(inputValue.toLowerCase())
  );

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingAggregation, setEditingAggregation] =
    useState<AstNode>(NewUndefinedAstNode);
  const editAggregation = (node: AstNode) => {
    setEditingAggregation(node);
    setModalOpen(true);
  };

  const { setValue } = useFormContext();

  return (
    <>
      <Combobox.Root<(typeof items)[0]>
        value={selectedItem}
        onChange={(value) => {
          setInputValue(value?.label ?? '');
          if (value?.astNode && isAggregation(value.astNode)) {
            editAggregation(value.astNode);
          }
          onChange(value?.astNode ?? NewUndefinedAstNode());
        }}
        nullable
      >
        <div className="relative">
          <Combobox.Input
            ref={ref}
            aria-invalid={invalid}
            displayValue={(item?: (typeof items)[number]) => item?.label ?? ''}
            onChange={(event) => setInputValue(event.target.value)}
            onBlur={onBlur}
          />
          <Combobox.Options className="w-fit">
            {filteredItems.map((item) => (
              <Combobox.Option
                key={item.label}
                value={item}
                className="flex flex-col gap-1"
              >
                <span>{item.label}</span>
              </Combobox.Option>
            ))}
          </Combobox.Options>
        </div>
      </Combobox.Root>
      {editingAggregation.name !== undefinedAstNodeName && (
        <AggregationEditModal
          initialAggregation={adaptAggregationViewModel(editingAggregation)}
          modalOpen={modalOpen}
          setModalOpen={setModalOpen}
          onSave={(aggregationAstNode) => {
            setValue(name, aggregationAstNode);
          }}
        />
      )}
    </>
  );
});
EditOperand.displayName = 'EditOperand';

const EditOperator = forwardRef<
  HTMLButtonElement,
  {
    name: string;
    value: string | null;
    onChange: (value: string | null) => void;
    onBlur: () => void;
    invalid: boolean;
  }
>(({ name, value, onChange, onBlur, invalid }, ref) => {
  const operators = useEditorOperators();
  const getOperatorName = useGetOperatorName();

  return (
    <Select.Root
      name={name}
      value={value ?? undefined}
      onValueChange={(selectedId) => {
        onChange(selectedId ?? null);
      }}
    >
      <Select.Trigger
        ref={ref}
        aria-invalid={invalid}
        className="focus:border-purple-100 aria-[invalid=true]:border-red-100"
        onBlur={onBlur}
      >
        <Select.Value placeholder="..." />
      </Select.Trigger>
      <Select.Content className="max-h-60">
        <Select.Viewport>
          {operators.map((operator) => {
            return (
              <Select.Item
                className="min-w-[110px]"
                key={operator.name}
                value={operator.name}
              >
                <Select.ItemText>
                  <span className="text-s text-grey-100 font-semibold">
                    {getOperatorName(operator.name)}
                  </span>
                </Select.ItemText>
              </Select.Item>
            );
          })}
        </Select.Viewport>
      </Select.Content>
    </Select.Root>
  );
});
EditOperator.displayName = 'EditOperator';
