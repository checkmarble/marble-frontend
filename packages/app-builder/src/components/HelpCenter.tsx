import {
  blockingReviewDocHref,
  executeAScenarioDocHref,
  pivotValuesDocHref,
  ruleSnoozesDocHref,
  scenarioDecisionDocHref,
  webhooksEventsDocHref,
  webhooksSetupDocHref,
} from '@app-builder/services/documentation-href';
import { formatNumber, useFormatLanguage } from '@app-builder/utils/format';
import { useComposedRefs } from '@app-builder/utils/hooks/use-compose-refs';
import { getRoute } from '@app-builder/utils/routes';
import * as Ariakit from '@ariakit/react';
import { useLocation } from '@remix-run/react';
import { matchSorter } from 'match-sorter';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import {
  Input,
  Kbd,
  MenuButton,
  MenuCombobox,
  MenuContent,
  MenuItem,
  MenuPopover,
  MenuRoot,
  Tag,
} from 'ui-design-system';

interface Resource {
  label: string;
  href: string;
  tags?: string[];
}

interface FlatResource extends Resource {
  category: string;
}

interface HelpCenterProps {
  defaultTab: string;
  resources: Record<string, Resource[]>;
  MenuButton: React.ReactElement;
  ChatWithUsButton?: React.ReactElement;
}

export function HelpCenter({
  defaultTab,
  resources,
  ChatWithUsButton,
  MenuButton: renderMenuButton,
}: HelpCenterProps) {
  const { i18n } = useTranslation();
  const [searchValue, setSearchValue] = React.useState('');
  const deferredSearchValue = React.useDeferredValue(searchValue);

  return (
    <MenuRoot
      searchValue={searchValue}
      onSearch={setSearchValue}
      rtl={i18n.dir() === 'rtl'}
    >
      <MenuButton render={renderMenuButton} />
      <MenuPopover
        className="flex h-[600px] max-h-[var(--popover-available-height)] w-[400px] max-w-[var(--popover-available-width)] flex-col"
        render={<Ariakit.FocusTrapRegion enabled />}
      >
        <HelpCenterContent
          defaultTab={defaultTab}
          resources={resources}
          ChatWithUsButton={ChatWithUsButton}
          searchValue={deferredSearchValue}
        />
      </MenuPopover>
    </MenuRoot>
  );
}

interface HelpCenterContentProps {
  defaultTab: string;
  resources: Record<string, Resource[]>;
  ChatWithUsButton?: React.ReactElement;
  searchValue: string;
}

function HelpCenterContent({
  defaultTab,
  resources,
  ChatWithUsButton,
  searchValue,
}: HelpCenterContentProps) {
  const { t, i18n } = useTranslation(['common']);
  const language = useFormatLanguage();
  const categories = React.useMemo(() => R.keys(resources), [resources]);

  const [tabId, setTabId] = React.useState(defaultTab);
  const deferredTabId = React.useDeferredValue(tabId);

  const flatResources: FlatResource[] = React.useMemo(
    () =>
      R.pipe(
        resources,
        R.entries(),
        R.flatMap(([category, resources]) =>
          R.pipe(
            resources,
            R.map((resource) => ({ ...resource, category })),
          ),
        ),
      ),
    [resources],
  );

  const matches = React.useMemo(() => {
    const allMatches = matchSorter(flatResources, searchValue, {
      keys: ['label', 'tags'],
    });
    const groups: Record<string, FlatResource[]> = R.groupBy(
      allMatches,
      R.prop('category'),
    );
    return groups;
  }, [flatResources, searchValue]);

  const currentResources = matches[deferredTabId] || [];

  return (
    <Ariakit.TabProvider
      defaultSelectedId={tabId}
      setSelectedId={(id) => {
        if (!id) return;
        setTabId(id);
      }}
      rtl={i18n.dir() === 'rtl'}
    >
      <MenuCombobox render={<Input className="mx-2 mt-2 shrink-0" />} />

      <Ariakit.TabList
        aria-label="Categories"
        className="shrink-0 overflow-x-auto"
      >
        <div className="flex w-fit flex-row gap-2 p-2">
          {categories.map((category) => {
            const resourcesLength = matches[category]?.length ?? 0;
            return (
              <CategoryTab
                key={category}
                id={category}
                disabled={resourcesLength === 0}
              >
                {category} {formatNumber(resourcesLength, { language })}
              </CategoryTab>
            );
          })}
        </div>
      </Ariakit.TabList>
      <div className="border-grey-10 bg-grey-02 flex h-full flex-col overflow-hidden border-y">
        <Ariakit.TabPanel
          tabId={deferredTabId}
          className="flex flex-col overflow-hidden"
        >
          <MenuContent>
            <div className="flex flex-col gap-2 overflow-y-auto p-2">
              {!currentResources.length ? (
                <div className="text-grey-25 w-full text-center">
                  {t('common:help_center.no_results')}
                </div>
              ) : null}
              {currentResources.map((resource) => (
                <MenuItem
                  key={`${resource.category}-${resource.label}`}
                  className="border-grey-05 bg-grey-00 data-[active-item]:bg-purple-05 flex scroll-my-2 flex-col gap-2 rounded border p-2 outline-none data-[active-item]:border-purple-100"
                  render={
                    // eslint-disable-next-line jsx-a11y/anchor-has-content
                    <a href={resource.href} target="_blank" rel="noreferrer" />
                  }
                >
                  {resource.label}
                  {resource.tags ? (
                    <div className="flex flex-wrap gap-1">
                      {resource.tags.map((tag) => (
                        <Tag color="grey" key={tag}>
                          {tag}
                        </Tag>
                      ))}
                    </div>
                  ) : null}
                </MenuItem>
              ))}
            </div>
          </MenuContent>
        </Ariakit.TabPanel>
      </div>

      {ChatWithUsButton ? (
        <div className="p-2">
          <Ariakit.MenuDismiss className="w-full" render={ChatWithUsButton} />
        </div>
      ) : null}

      <div className="border-t-grey-10 bg-grey-02 flex gap-4 border-t p-2 text-xs">
        <div className="flex items-center gap-1 whitespace-nowrap">
          <Kbd className="aspect-square">
            ▲<span className="sr-only">Arrow key up</span>
          </Kbd>
          <Kbd className="aspect-square">
            ▼<span className="sr-only">Arrow key down</span>
          </Kbd>
          {t('common:help_center.to_navigate')}
        </div>
        <div className="flex items-center gap-1 whitespace-nowrap">
          <Kbd className="aspect-square">
            ◀︎<span className="sr-only">Arrow key left</span>
          </Kbd>
          <Kbd className="aspect-square">
            ▶︎<span className="sr-only">Arrow key right</span>
          </Kbd>
          {t('common:help_center.to_switch_tabs')}
        </div>
      </div>
    </Ariakit.TabProvider>
  );
}

const CategoryTab = React.forwardRef<HTMLButtonElement, Ariakit.TabProps>(
  function CategoryTab(props, ref) {
    const internalRef = React.useRef<HTMLButtonElement>(null);
    const composedRef = useComposedRefs(ref, internalRef);
    // Scroll to the selected tab on first render only
    React.useEffect(() => {
      if (!internalRef.current) return;
      const isSelected =
        internalRef.current.getAttribute('aria-selected') === 'true';
      if (isSelected) internalRef.current.scrollIntoView();
    }, []);

    return (
      <Ariakit.Tab
        ref={composedRef}
        className="aria-selected:bg-purple-10 aria-selected:border-purple-10 text-grey-100 bg-grey-05 border-grey-05 flex h-6 scroll-mx-2 flex-row items-center justify-center gap-1 whitespace-pre rounded-full border px-2 text-xs font-medium capitalize aria-selected:text-purple-100 data-[active-item]:border-purple-100"
        accessibleWhenDisabled={false}
        {...props}
      />
    );
  },
);

export function useMarbleCoreResources() {
  const { t } = useTranslation(['common', 'navigation']);

  const location = useLocation();
  const defaultTab = React.useMemo(() => {
    if (location.pathname.startsWith(getRoute('/scenarios/')))
      return t('navigation:scenarios');
    if (location.pathname.startsWith(getRoute('/lists/')))
      return t('navigation:lists');
    if (location.pathname.includes('/workflow')) return 'Workflows';
    if (location.pathname.startsWith(getRoute('/data')))
      return t('navigation:data');
    if (location.pathname.startsWith(getRoute('/settings')))
      return t('navigation:settings');
    if (location.pathname.startsWith(getRoute('/cases/')))
      return t('navigation:case_manager');

    return t('navigation:scenarios');
  }, [location.pathname, t]);

  const resources = React.useMemo(
    () => ({
      [t('navigation:scenarios')]: [
        {
          label: 'Manage Scenarios',
          tags: ['List', 'Create'],
          href: 'https://docs.checkmarble.com/docs/introduction-copy',
        },
        {
          label: 'Executing a scenario',
          href: executeAScenarioDocHref,
        },
        {
          label: 'Edit Scenario',
          href: 'https://docs.checkmarble.com/docs/scenario-edit',
        },
        {
          label: 'Scenario Trigger',
          tags: ['Trigger', 'Run'],
          href: 'https://docs.checkmarble.com/docs/trigger',
        },
        {
          label: 'Scenario Rules',
          tags: ['Edot', 'Clone', 'Delete'],
          href: 'https://docs.checkmarble.com/docs/rule',
        },
        {
          label: 'Scenario Decision',
          tags: ['Outcome', 'Approve', 'Review', 'Block and Review', 'Decline'],
          href: scenarioDecisionDocHref,
        },
        {
          label: 'Formula',
          tags: ['Rule formula', 'Trigger formula'],
          href: 'https://docs.checkmarble.com/docs/formula',
        },
        {
          label: 'Operand',
          tags: ['Lists', 'Fields', 'Functions', 'Constants'],
          href: 'https://docs.checkmarble.com/docs/operand-picker',
        },
        {
          label: 'Operator',
          href: 'https://docs.checkmarble.com/docs/operator',
        },
        {
          label: 'Scenario Lyfecycle',
          tags: [
            'Draft',
            'Version',
            'Live',
            'Prepare',
            'Activate',
            'Deactivate',
          ],
          href: 'https://docs.checkmarble.com/docs/versioning',
        },
      ],
      [t('navigation:lists')]: [
        {
          label: 'Create a List',
          href: 'https://docs.checkmarble.com/docs/manage-rules#create-a-list',
        },
        {
          label: 'Update a List',
          href: 'https://docs.checkmarble.com/docs/manage-rules#update-a-list',
        },
        {
          label: 'Delete a List',
          href: 'https://docs.checkmarble.com/docs/manage-rules#delete-a-list',
        },
        {
          label: 'List in Scenario Builder',
          tags: ['Formula'],
          href: 'https://docs.checkmarble.com/docs/lists-in-scenario-builder',
        },
        {
          label: 'List operators',
          href: 'https://docs.checkmarble.com/docs/list-operators',
        },
      ],
      Workflows: [
        {
          label: 'Manage Workflows',
          tags: ['Create', 'Update', 'Delete'],
          href: 'https://docs.checkmarble.com/docs/manage-lists-copy',
        },
        {
          label: 'Add a Decision to an Existing Case',
          href: 'https://docs.checkmarble.com/docs/adding-a-decision-to-an-existing-case',
        },
      ],
      [t('navigation:data')]: [
        {
          label: 'Create a Table',
          href: 'https://docs.checkmarble.com/docs/create-a-table-or-entity',
        },
        {
          label: 'Create a Field',
          href: 'https://docs.checkmarble.com/docs/create-fields-in-a-table',
        },
        {
          label: 'Edit a Field',
          href: 'https://docs.checkmarble.com/docs/editing-a-field-in-a-table',
        },
        {
          label: 'Create a link',
          href: 'https://docs.checkmarble.com/docs/create-links-between-tables',
        },
        {
          label: 'Pivot values',
          tags: ['Workflow', 'Decision'],
          href: pivotValuesDocHref,
        },
        {
          label: 'Ingesting Data',
          tags: ['Manual', 'CSV'],
          href: 'https://docs.checkmarble.com/docs/ingesting-data',
        },
      ],
      [t('navigation:settings')]: [
        {
          label: 'Create a webhook',
          href: webhooksSetupDocHref,
        },
        {
          label: 'Receive a webhook',
          tags: ['Payload', 'Validate'],
          href: 'https://docs.checkmarble.com/docs/receiving-webhooks',
        },
        {
          label: 'Available events',
          tags: ['Format', 'Payload'],
          href: webhooksEventsDocHref,
        },
      ],
      [t('navigation:case_manager')]: [
        {
          label: 'Rule snoozes',
          href: ruleSnoozesDocHref,
        },
        {
          label: 'Blocking Review',
          href: blockingReviewDocHref,
        },
        {
          label: 'Review a blocked decision',
          tags: ['Block and Review'],
          href: 'https://docs.checkmarble.com/docs/blocking-review#manually-review-a-blocked-decision',
        },
        {
          label: 'List all blocked decision pending for reviews',
          tags: ['Block and Review'],
          href: 'https://docs.checkmarble.com/docs/blocking-review#list-all-blocked-decisions-pending-for-reviews',
        },
      ],
    }),
    [t],
  );

  return { defaultTab, resources };
}

export function useTransfercheckResources() {
  const { t } = useTranslation(['common', 'navigation']);

  const location = useLocation();
  const defaultTab = React.useMemo(() => {
    if (location.pathname.startsWith(getRoute('/transfercheck/transfers/')))
      return t('navigation:transfercheck.transfers');

    return t('navigation:scenarios');
  }, [location.pathname, t]);

  const resources = React.useMemo(
    () => ({
      [t('navigation:transfercheck.transfers')]: [
        {
          label: 'Transfer Scoring Workflow',
          tags: ['Score', 'Feedback', 'Transfer'],
          href: 'https://docs.checkmarble.com/reference/transfer-scoring-workflow#send-a-transfer-and-request-a-score',
        },
        {
          label: 'Transfer Data Format',
          tags: ['Transfer', 'Data'],
          href: 'https://docs.checkmarble.com/reference/transfer-scoring-workflow#data-format',
        },
        {
          label: 'IBAN hasing',
          tags: ['IBAN', 'Data'],
          href: 'https://docs.checkmarble.com/reference/iban-hashing',
        },
      ],
    }),
    [t],
  );

  return { defaultTab, resources };
}
