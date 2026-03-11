import { Highlight } from '@app-builder/components/Highlight';
import { useCurrentScenarioIteration } from '@app-builder/routes/_builder+/detection+/scenarios+/$scenarioId+/i+/$iterationId+/_layout';
import { Link } from '@remix-run/react';
import { type TFunction } from 'i18next';
import { matchSorter } from 'match-sorter';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { cn, MenuContent, MenuGroup, MenuGroupLabel, MenuItem, MenuPopover, MenuRoot } from 'ui-design-system';
import { Icon } from 'ui-icons';

interface LabelledScenarioIteration {
  id: string;
  type: 'draft' | 'live version' | 'version';
  version: number | null;
  updatedAt: string;
  linkTo: string;
  formattedVersion: string;
  formattedLive?: string;
  formattedArchived?: string;
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

export function getFormattedLive({ type }: Pick<LabelledScenarioIteration, 'type'>, t: TFunction<['scenarios']>) {
  return type === 'live version' ? t('scenarios:live') : undefined;
}

export function getFormattedArchived({ archived }: { archived: boolean }, t: TFunction<['scenarios']>) {
  return archived ? t('scenarios:archived') : undefined;
}

function sortScenarioIteration(lhs: LabelledScenarioIteration, rhs: LabelledScenarioIteration) {
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
    <MenuRoot searchValue={searchValue} onSearch={setSearchValue} rtl={i18n.dir() === 'rtl'}>
      {children}
      <MenuPopover className="flex max-h-[min(400px,var(--popover-available-height))] flex-col min-w-48 rounded-xl py-4">
        <ScenarioIterationContent searchValue={deferredSearchValue} labelledScenarioIteration={scenarioIterations} />
      </MenuPopover>
    </MenuRoot>
  );
}

interface ScenarioIterationContentProps {
  labelledScenarioIteration: LabelledScenarioIteration[];
  searchValue: string;
}

function ScenarioIterationContent({ labelledScenarioIteration, searchValue }: ScenarioIterationContentProps) {
  const { t } = useTranslation(['common', 'scenarios']);
  const currentScenario = useCurrentScenarioIteration();

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
      <MenuContent>
        <MenuGroup className="flex flex-col gap-2 overflow-y-auto p-2">
          {!matches.length ? (
            <div className="text-grey-disabled w-full text-center">{t('common:help_center.no_results')}</div>
          ) : (
            <MenuGroupLabel className="px-4">{t('scenarios:home.versions_label')}</MenuGroupLabel>
          )}

          {matches.map((iteration) => (
            <MenuItem
              key={iteration.id}
              className=" bg-surface-card data-active-item:bg-purple-background-light data-active-item:border-purple-primary flex scroll-my-2 flex-row items-center justify-between gap-2 py-2 px-4 outline-hidden"
              render={<Link to={iteration.linkTo} />}
            >
              <span className="text-s flex flex-row gap-1">
                <Highlight
                  className={cn('capitalize', { 'text-purple-primary': iteration.id === currentScenario.id })}
                  query={searchValue}
                  text={iteration.formattedVersion}
                />
                {iteration.formattedLive ? (
                  <span className="text-purple-primary capitalize">{iteration.formattedLive}</span>
                ) : null}
                {iteration.formattedArchived ? (
                  <span className="text-grey-secondary capitalize">{iteration.formattedArchived}</span>
                ) : null}
              </span>
              {iteration.id === currentScenario.id ? (
                <span className="text-purple-primary ml-auto">
                  <Icon icon="tick" className="size-4" />
                </span>
              ) : null}
            </MenuItem>
          ))}
        </MenuGroup>
      </MenuContent>
    </>
  );
}
