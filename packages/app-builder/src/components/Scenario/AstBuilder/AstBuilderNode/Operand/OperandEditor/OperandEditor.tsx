import {
  type AstNode,
  type ConstantAstNode,
  type ConstantType,
  type DataType,
} from '@app-builder/models';
import { type OperandType } from '@app-builder/models/operand-type';
import {
  type AstNodeErrors,
  type ValidationStatus,
} from '@app-builder/services/validation/ast-node-validation';
import { useCallbackRef } from '@app-builder/utils/hooks';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Input,
  MenuButton,
  type MenuButtonProps,
  MenuCombobox,
  MenuContent,
  MenuItem,
  MenuPopover,
  MenuRoot,
  ScrollAreaV2,
} from 'ui-design-system';
import { Icon, type IconName } from 'ui-icons';

import { OperandLabel } from '../OperandLabel';
import { OperandEditModal } from './OperandEditModal/OperandEditModal';
import { OperandEditorDiscoveryResults } from './OperandEditorDiscoveryResults';
import {
  OperandEditorProvider,
  useBottomOptions,
  useDiscoveryResults,
  useOperandEditorActions,
  useOperandEditorOpen,
  useSearchValue,
} from './OperandEditorProvider';
import { OperandEditorSearchResults } from './OperandEditorSearchResults';

export function OperandEditor({
  astNode,
  dataType,
  operandType,
  displayName,
  placeholder,
  returnValue,
  onSave,
  validationStatus,
  astNodeErrors,
  options,
  coerceToConstant,
}: {
  astNode: AstNode;
  dataType: DataType;
  operandType: OperandType;
  displayName: string;
  placeholder?: string;
  returnValue?: string;
  onSave: (astNode: AstNode) => void;
  validationStatus: ValidationStatus;
  astNodeErrors?: AstNodeErrors;
  options: {
    astNode: AstNode;
    dataType: DataType;
    operandType: OperandType;
    displayName: string;
  }[];
  coerceToConstant?: (searchValue: string) => {
    astNode: ConstantAstNode<ConstantType>;
    displayName: string;
    dataType: DataType;
  }[];
}) {
  return (
    <OperandEditorProvider onSave={onSave}>
      <OperandMenu
        astNode={astNode}
        astNodeErrors={astNodeErrors}
        options={options}
        coerceToConstant={coerceToConstant}
      >
        <OperandMenuButton
          astNode={astNode}
          placeholder={placeholder}
          dataType={dataType}
          operandType={operandType}
          displayName={displayName}
          returnValue={returnValue}
          validationStatus={validationStatus}
        />
        <MenuPopover className="w-96 flex-col">
          <OperandEditorContent />
        </MenuPopover>
      </OperandMenu>
      <OperandEditModal />
    </OperandEditorProvider>
  );
}

function OperandEditorContent() {
  const { t } = useTranslation('scenarios');

  const bottomOptions = useBottomOptions();
  const searchValue = useSearchValue();
  const discoveryResults = useDiscoveryResults();

  return (
    <>
      <MenuCombobox
        render={
          <Input
            className="m-2 shrink-0"
            type="search"
            startAdornment="search"
            placeholder={t('edit_operand.search.placeholder')}
          />
        }
      />
      <MenuContent>
        <div className="scrollbar-gutter-stable flex flex-col gap-2 overflow-y-auto p-2 pr-[calc(0.5rem-var(--scrollbar-width))]">
          {searchValue === '' ? (
            <OperandEditorDiscoveryResults
              discoveryResults={discoveryResults}
            />
          ) : (
            <OperandEditorSearchResults />
          )}
        </div>
        {bottomOptions.length > 0 ? (
          <BottomOptions options={bottomOptions} />
        ) : null}
      </MenuContent>
    </>
  );
}

interface BottomOptionProps {
  icon: IconName;
  label: string;
  onSelect: () => void;
}

function BottomOptions({ options }: { options: BottomOptionProps[] }) {
  return (
    <ScrollAreaV2
      orientation="horizontal"
      className="border-t-grey-10 sticky bottom-0 shrink-0 border-t"
    >
      <div className="flex w-fit shrink-0 flex-row gap-2 p-2">
        {options.map(({ icon, label, onSelect }) => (
          <MenuItem
            key={label}
            render={
              <Button
                variant="secondary"
                className="data-[active-item]:bg-purple-05 scroll-mx-2 data-[active-item]:border-purple-100"
                onClick={onSelect}
              >
                <Icon icon={icon} className="size-4" />
                <span className="line-clamp-1">{label}</span>
              </Button>
            }
          />
        ))}
      </div>
    </ScrollAreaV2>
  );
}

function OperandMenu({
  children,
  astNode,
  astNodeErrors,
  options,
  coerceToConstant,
}: {
  children: React.ReactNode;
  astNode: AstNode;
  astNodeErrors?: AstNodeErrors;
  options: {
    astNode: AstNode;
    dataType: DataType;
    operandType: OperandType;
    displayName: string;
  }[];
  coerceToConstant?: (searchValue: string) => {
    astNode: ConstantAstNode<ConstantType>;
    displayName: string;
    dataType: DataType;
  }[];
}) {
  const searchValue = useSearchValue();
  const operandEditorOpen = useOperandEditorOpen();
  const { setOperandEditorOpen, onSearch } = useOperandEditorActions();
  const setOpen = useCallbackRef((open: boolean) => {
    setOperandEditorOpen(
      open,
      astNode,
      options,
      coerceToConstant,
      astNodeErrors,
    );
  });

  return (
    <MenuRoot
      open={operandEditorOpen}
      searchValue={searchValue}
      onSearch={onSearch}
      setOpen={setOpen}
    >
      {children}
    </MenuRoot>
  );
}

interface OperandMenuButtonProps extends MenuButtonProps {
  astNode: AstNode;
  dataType: DataType;
  operandType: OperandType;
  displayName: string;
  placeholder?: string;
  returnValue?: string;
  validationStatus: ValidationStatus;
}

const OperandMenuButton = React.forwardRef<
  HTMLDivElement,
  OperandMenuButtonProps
>(function OperandMenuButton(
  {
    astNode,
    placeholder,
    dataType,
    operandType,
    displayName,
    returnValue,
    validationStatus,
    ...props
  },
  ref,
) {
  return (
    <MenuButton
      ref={ref}
      {...props}
      render={
        <OperandLabel
          interactionMode="editor"
          astNode={astNode}
          placeholder={placeholder}
          dataType={dataType}
          operandType={operandType}
          displayName={displayName}
          returnValue={returnValue}
          validationStatus={validationStatus}
        />
      }
    />
  );
});
