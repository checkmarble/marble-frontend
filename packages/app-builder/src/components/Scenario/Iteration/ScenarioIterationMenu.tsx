import { Scenario } from '@app-builder/models/scenario';
import { Link } from '@tanstack/react-router';
import { type TFunction } from 'i18next';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { cn, MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';

import type { JSX } from 'react';

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
   * The menu trigger. Must be a ref-forwarding element.
   * @example <button type="button">V1</button>
   */
  children: JSX.Element;
  scenario: Scenario;
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
  scenario,
}: ScenarioIterationMenuProps) {
  // Controlled so that picking a version closes the menu: MenuCommand only closes by
  // calling back through onOpenChange.
  const [open, setOpen] = React.useState(false);

  return (
    <MenuCommand.Menu open={open} onOpenChange={setOpen}>
      <MenuCommand.Trigger>{children}</MenuCommand.Trigger>
      <MenuCommand.Content
        align="start"
        sideOffset={8}
        className="max-h-[min(400px,var(--radix-popover-content-available-height))] min-w-48"
      >
        <ScenarioIterationContent labelledScenarioIteration={scenarioIterations} scenario={scenario} />
      </MenuCommand.Content>
    </MenuCommand.Menu>
  );
}

interface ScenarioIterationContentProps {
  labelledScenarioIteration: LabelledScenarioIteration[];
  scenario: Scenario;
}

function ScenarioIterationContent({ labelledScenarioIteration, scenario }: ScenarioIterationContentProps) {
  const { t } = useTranslation(['common', 'scenarios']);

  const iterations = React.useMemo(
    () => [...labelledScenarioIteration].sort(sortScenarioIteration),
    [labelledScenarioIteration],
  );

  return (
    <>
      <MenuCommand.List>
        <MenuCommand.Group
          className="flex flex-col gap-sm"
          heading={<div className="px-sm">{t('scenarios:home.versions_label')}</div>}
        >
          {iterations.map((iteration) => (
            <MenuCommand.Item
              key={iteration.id}
              value={iteration.id}
              keywords={[
                iteration.formattedVersion,
                iteration.formattedUpdatedAt,
                ...(iteration.formattedLive ? [iteration.formattedLive] : []),
              ]}
              asChild
              className="bg-surface-card aria-selected:border-purple-primary h-auto scroll-my-sm py-xs px-sm"
            >
              <Link to={iteration.linkTo}>
                <span className="text-s flex flex-row gap-xs">
                  <span className={cn('capitalize', { 'text-purple-primary': iteration.id === scenario.id })}>
                    {iteration.formattedVersion}
                  </span>
                  {iteration.formattedLive ? (
                    <span className="text-purple-primary capitalize">{iteration.formattedLive}</span>
                  ) : null}
                  {iteration.formattedArchived ? (
                    <span className="text-grey-secondary capitalize">{iteration.formattedArchived}</span>
                  ) : null}
                </span>
                {iteration.id === scenario.id ? (
                  <span className="text-purple-primary ms-auto">
                    <Icon icon="tick" className="size-4" />
                  </span>
                ) : null}
              </Link>
            </MenuCommand.Item>
          ))}
        </MenuCommand.Group>
        <MenuCommand.Empty>
          <div className="text-grey-disabled w-full text-center">{t('common:help_center.no_results')}</div>
        </MenuCommand.Empty>
      </MenuCommand.List>
    </>
  );
}
