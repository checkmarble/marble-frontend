import {
  isDatabaseAccess,
  isPayload,
  type LabelledAst,
} from '@app-builder/models';
import { type AstBuilder } from '@app-builder/services/editor/ast-editor';
import type * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { ArrowRight } from 'ui-icons';

import { Count, Group, GroupHeader, Label } from './Group';
import { OperandDropdownMenu } from './OperandDropdownMenu';
import { OperandOption } from './OperandOption';
import {
  getOperatorTypeIcon,
  getOperatorTypeTKey,
} from './OperandOption/Option';

interface OperandEditorDiscoveryResultsProps {
  builder: AstBuilder;
  options: LabelledAst[];
  onSelect: (option: LabelledAst) => void;
}

export function OperandEditorDiscoveryResults({
  builder,
  options,
  onSelect,
}: OperandEditorDiscoveryResultsProps) {
  const { t } = useTranslation('scenarios');
  const { customListOptions, fieldOptions, functionOptions, enumOptions } =
    R.pipe(
      options,
      R.groupBy.strict((option) => option.operandType),
      ({ Field, CustomList, Function, Enum }) => {
        const customListOptions: LabelledAst[] = CustomList ?? [];
        const fieldOptions: LabelledAst[] = Field ?? [];
        const functionOptions: LabelledAst[] = Function ?? [];
        const enumOptions: LabelledAst[] = Enum ?? [];
        return {
          customListOptions,
          fieldOptions,
          functionOptions,
          enumOptions,
        };
      },
    );

  const fieldByPathOptions = R.pipe(
    fieldOptions,
    R.groupBy.strict((option) => {
      const { astNode } = option;
      if (isPayload(astNode)) {
        return builder.input.triggerObjectTable.name;
      }
      if (isDatabaseAccess(astNode)) {
        return [
          astNode.namedChildren.tableName.constant,
          ...astNode.namedChildren.path.constant,
        ].join('.');
      }
    }),
    R.mapValues((value) => R.sortBy(value, (o) => o.name)),
    R.toPairs,
  );

  return (
    <>
      {enumOptions && enumOptions.length > 0 ? (
        <OperandDiscoverySubmenu options={enumOptions} onSelect={onSelect}>
          <GroupHeader.Container>
            <OperandDiscoveryTitle
              operandType="Enum"
              operandsCount={enumOptions.length}
            />
            <GroupHeader.Icon>
              <ArrowRight />
            </GroupHeader.Icon>
          </GroupHeader.Container>
        </OperandDiscoverySubmenu>
      ) : null}

      <Group>
        <GroupHeader.Container>
          <OperandDiscoveryTitle
            operandType="Field"
            operandsCount={fieldOptions.length}
          />
        </GroupHeader.Container>

        {fieldByPathOptions.map(([path, options]) => (
          <OperandDiscoverySubmenu
            key={path}
            options={options}
            onSelect={onSelect}
          >
            <GroupHeader.Container className="pl-9">
              <GroupHeader.Title className="truncate">
                <Label className="text-grey-100 text-s truncate">
                  <Trans
                    t={t}
                    i18nKey="edit_operand.operator_discovery.from"
                    components={{
                      Path: <span className="truncate font-semibold" />,
                    }}
                    values={{
                      path,
                    }}
                  />
                </Label>
                <Count>{options.length}</Count>
              </GroupHeader.Title>
              <GroupHeader.Icon>
                <ArrowRight />
              </GroupHeader.Icon>
            </GroupHeader.Container>
          </OperandDiscoverySubmenu>
        ))}
      </Group>

      <OperandDiscoverySubmenu options={customListOptions} onSelect={onSelect}>
        <GroupHeader.Container>
          <OperandDiscoveryTitle
            operandType="CustomList"
            operandsCount={customListOptions.length}
          />
          <GroupHeader.Icon>
            <ArrowRight />
          </GroupHeader.Icon>
        </GroupHeader.Container>
      </OperandDiscoverySubmenu>

      <OperandDiscoverySubmenu options={functionOptions} onSelect={onSelect}>
        <GroupHeader.Container>
          <OperandDiscoveryTitle
            operandType="Function"
            operandsCount={functionOptions.length}
          />
          <GroupHeader.Icon>
            <ArrowRight />
          </GroupHeader.Icon>
        </GroupHeader.Container>
      </OperandDiscoverySubmenu>
    </>
  );
}

function OperandDiscoveryTitle({
  operandType,
  operandsCount,
}: {
  operandType: LabelledAst['operandType'];
  operandsCount: number;
}) {
  const { t } = useTranslation('scenarios');
  const Icon = getOperatorTypeIcon(operandType);
  const tKey = getOperatorTypeTKey(operandType);

  return (
    <>
      {Icon ? (
        <GroupHeader.Icon className="text-purple-100">
          <Icon />
        </GroupHeader.Icon>
      ) : null}
      {tKey ? (
        <GroupHeader.Title>
          <Label className="text-grey-100 text-m font-semibold">
            {t(tKey, {
              count: operandsCount,
            })}
          </Label>
          <Count>{operandsCount}</Count>
        </GroupHeader.Title>
      ) : null}
    </>
  );
}

function OperandDiscoverySubmenu({
  options,
  onSelect,
  children,
}: {
  options: LabelledAst[];
  onSelect: (option: LabelledAst) => void;
  children: React.ReactNode;
}) {
  if (options.length === 0) return null;

  return (
    <Group>
      <OperandDropdownMenu.Sub>
        <OperandDropdownMenu.SubTrigger>
          {children}
        </OperandDropdownMenu.SubTrigger>
        <OperandDropdownMenu.SubContent>
          <OperandDropdownMenu.ScrollableViewport className="flex flex-col gap-2 p-2">
            {options.map((option) => (
              <OperandOption
                key={option.name}
                option={option}
                onSelect={() => {
                  onSelect(option);
                }}
              />
            ))}
          </OperandDropdownMenu.ScrollableViewport>
        </OperandDropdownMenu.SubContent>
      </OperandDropdownMenu.Sub>
    </Group>
  );
}
