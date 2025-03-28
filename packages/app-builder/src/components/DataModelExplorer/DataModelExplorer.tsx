import { type ReactElement, useState } from 'react';
import { Button, MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';

export type DataModelExplorerProps = {
  children: (tabState: (typeof INITIAL_TABS)[number]) => ReactElement;
};

const INITIAL_TABS = [
  { pivotValue: 'something', tableName: 'transactions' },
  { pivotValue: 'something', tableName: 'accounts' },
  { pivotValue: 'account', tableName: 'users' },
  { pivotValue: 'user', tableName: 'companies' },
];

export function DataModelExplorer(props: DataModelExplorerProps) {
  const [lastActive, setLastActive] = useState<(typeof INITIAL_TABS)[number] | null>(null);
  const [currentTab, setCurrentTab] = useState(INITIAL_TABS[0]!);
  const [closingHistory, setClosingHistory] = useState<typeof INITIAL_TABS>([]);
  const [tabs, setTabs] = useState(INITIAL_TABS);

  return (
    <div className="flex flex-col gap-3">
      <div className="before:bg-grey-90 relative pr-40 before:absolute before:inset-x-0 before:bottom-0 before:h-px">
        {tabs.map((tab, i) => (
          <DataModelExplorerTab
            current={tab === currentTab}
            key={`${tab.pivotValue}_${tab.tableName}`}
            label={`${tab.pivotValue}_${tab.tableName}`}
            onClick={() => {
              setLastActive(currentTab);
              setCurrentTab(tab);
            }}
            onClose={() => {
              if (tab === currentTab) {
                const nextTab = lastActive ?? tabs[i + 1] ?? tabs[i - 1];
                if (nextTab) {
                  setLastActive(null);
                  setCurrentTab(nextTab);
                }
              }

              setClosingHistory((ch) => [...ch, tab]);
              setTabs((t) => [...t.slice(0, i), ...t.slice(i + 1)]);
            }}
          />
        ))}
        <TabBarActions
          className="absolute right-2 top-2"
          onSelect={(opt) => {
            switch (opt) {
              case 'open_last_closed': {
                const tab = closingHistory[closingHistory.length - 1];
                if (!tab) return;

                setTabs((t) => [...t, tab]);
                setCurrentTab(tab);
                break;
              }
              default:
                break;
            }
          }}
        />
      </div>
      <div>{props.children(currentTab)}</div>
    </div>
  );
}

function DataModelExplorerTab(props: {
  current: boolean;
  label: string;
  onClick: () => void;
  onClose: () => void;
}) {
  return (
    <button
      aria-current={props.current}
      type="button"
      className="group/tab border-grey-00 text-m relative inline-flex min-h-10 items-center gap-2 p-3 font-semibold aria-[current=true]:border-b-2"
      onClick={props.onClick}
    >
      {props.label}
      <Icon
        icon="cross"
        className="invisible size-5 group-hover/tab:visible"
        onClick={(e) => {
          e.stopPropagation();
          props.onClose?.();
        }}
      />
    </button>
  );
}

function TabBarActions(props: { className?: string; onSelect: (opt: string) => void }) {
  return (
    <MenuCommand.Menu>
      <MenuCommand.Trigger>
        <Button size="icon" variant="secondary" className={props.className}>
          <Icon icon="more-menu" className="size-4" />
        </Button>
      </MenuCommand.Trigger>
      <MenuCommand.Content align="end" sideOffset={4}>
        <MenuCommand.List>
          <MenuCommand.Item onSelect={() => props.onSelect('open_last_closed')}>
            Reopen last closed tab
          </MenuCommand.Item>
        </MenuCommand.List>
      </MenuCommand.Content>
    </MenuCommand.Menu>
  );
}
