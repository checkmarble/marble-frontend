import { Highlight } from '@app-builder/components/Highlight';
import { Link } from '@remix-run/react';
import { type TFunction } from 'i18next';
import { matchSorter } from 'match-sorter';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Input,
  MenuCombobox,
  MenuContent,
  MenuItem,
  MenuPopover,
  MenuRoot,
} from 'ui-design-system';

interface LabelledScenarioIteration {
  id: string;
  type: 'draft' | 'live version' | 'version';
  version: number | null;
  updatedAt: string;
  linkTo: string;
  formattedVersion: string;
  formattedLive?: string;
  formattedUpdatedAt: string;
}

interface ScenarioIterationMenuProps {
  labelledScenarioIteration: LabelledScenarioIteration[];
  /**
   * Should be a MenuButton component.
   * @example <MenuButton>V1</MenuButton>
   */
  children: JSX.Element;
}

export function getFormattedVersion(
  { version }: Pick<LabelledScenarioIteration, 'version'>,
  t: TFunction<['scenarios']>,
) {
  return version ? `V${version}` : t('scenarios:draft');
}

export function getFormattedLive(
  { type }: Pick<LabelledScenarioIteration, 'type'>,
  t: TFunction<['scenarios']>,
) {
  return type === 'live version' ? t('scenarios:live') : undefined;
}

function sortScenarioIteration(
  lhs: LabelledScenarioIteration,
  rhs: LabelledScenarioIteration,
) {
  if (lhs.type === 'draft' && rhs.type !== 'draft') {
    return -1;
  }
  if (lhs.type !== 'draft' && rhs.type === 'draft') {
    return 1;
  }
  return lhs.updatedAt > rhs.updatedAt ? -1 : 1;
}

export function ScenarioIterationMenu({
  labelledScenarioIteration: scenarioIterations,
  children,
}: ScenarioIterationMenuProps) {
  const { i18n } = useTranslation();
  const [searchValue, setSearchValue] = React.useState('');
  const deferredSearchValue = React.useDeferredValue(searchValue);

  return (
    <MenuRoot
      searchValue={searchValue}
      onSearch={setSearchValue}
      rtl={i18n.dir() === 'rtl'}
    >
      {children}
      <MenuPopover className="flex max-h-[min(400px,_var(--popover-available-height))] flex-col">
        <ScenarioIterationContent
          searchValue={deferredSearchValue}
          labelledScenarioIteration={scenarioIterations}
        />
      </MenuPopover>
    </MenuRoot>
  );
}

interface ScenarioIterationContentProps {
  labelledScenarioIteration: LabelledScenarioIteration[];
  searchValue: string;
}

function ScenarioIterationContent({
  labelledScenarioIteration,
  searchValue,
}: ScenarioIterationContentProps) {
  const { t } = useTranslation(['common']);

  const matches = React.useMemo(
    () =>
      matchSorter(labelledScenarioIteration, searchValue, {
        keys: ['formattedVersion', 'formattedLive', 'formattedUpdatedAt'],
        baseSort: (a, b) => sortScenarioIteration(a.item, b.item),
      }),
    [labelledScenarioIteration, searchValue],
  );

  return (
    <>
      <MenuCombobox render={<Input className="mx-2 mt-2 shrink-0" />} />

      <MenuContent>
        <div className="flex flex-col gap-2 overflow-y-auto p-2">
          {!matches.length ? (
            <div className="text-grey-25 w-full text-center">
              {t('common:help_center.no_results')}
            </div>
          ) : null}
          {matches.map((iteration) => (
            <MenuItem
              key={iteration.id}
              className="border-grey-05 bg-grey-00 data-[active-item]:bg-purple-05 flex scroll-my-2 flex-row items-center justify-between gap-2 rounded border p-2 outline-none data-[active-item]:border-purple-100"
              render={<Link to={iteration.linkTo} />}
            >
              <span className="text-s flex flex-row gap-1 font-semibold">
                <Highlight
                  className="text-grey-100 capitalize"
                  query={searchValue}
                  text={iteration.formattedVersion}
                />
                {iteration.formattedLive ? (
                  <span className="capitalize text-purple-100">
                    {iteration.formattedLive}
                  </span>
                ) : null}
              </span>
              <Highlight
                className="text-grey-25 text-xs"
                query={searchValue}
                text={iteration.formattedUpdatedAt}
              />
            </MenuItem>
          ))}
        </div>
      </MenuContent>
    </>
  );
}
