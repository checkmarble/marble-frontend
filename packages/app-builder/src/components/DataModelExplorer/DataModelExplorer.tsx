import { type ReactElement, useState } from 'react';
import { Button, MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';

export type TabItem = { pivotValue: string; tableName: string };

export type DataModelExplorerProps = {
  initialTab: TabItem;
  children: (tabState: TabItem, addTab: (tab: TabItem) => void) => ReactElement;
};

export function DataModelExplorer(props: DataModelExplorerProps) {
  const [lastActive, setLastActive] = useState<TabItem | null>(null);
  const [currentTab, setCurrentTab] = useState(props.initialTab);
  const [closingHistory, setClosingHistory] = useState<TabItem[]>([]);
  const [tabs, setTabs] = useState([props.initialTab]);

  const addTab = (tab: TabItem) => {
    setTabs((t) => [...t, tab]);
    setLastActive(currentTab);
    setCurrentTab(tab);
  };

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
          options={[
            {
              label: 'Reopen last closed tab',
              value: 'open_last_closed',
              disabled: closingHistory.length === 0,
            },
          ]}
          onSelect={(opt) => {
            switch (opt) {
              case 'open_last_closed': {
                const tab = closingHistory[closingHistory.length - 1];
                if (!tab) return;

                setClosingHistory((ch) => ch.slice(0, -1));
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
      <div>{props.children(currentTab, addTab)}</div>
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

function TabBarActions(props: {
  className?: string;
  options: { label: string; disabled: boolean; value: string }[];
  onSelect: (opt: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <MenuCommand.Menu open={open} onOpenChange={setOpen}>
      <MenuCommand.Trigger>
        <Button size="icon" variant="secondary" className={props.className}>
          <Icon icon="more-menu" className="size-4" />
        </Button>
      </MenuCommand.Trigger>
      <MenuCommand.Content align="end" sideOffset={4}>
        <MenuCommand.List>
          {props.options.map((opt) => (
            <MenuCommand.Item
              disabled={opt.disabled}
              key={opt.value}
              onSelect={() => props.onSelect(opt.value)}
            >
              {opt.label}
            </MenuCommand.Item>
          ))}
        </MenuCommand.List>
      </MenuCommand.Content>
    </MenuCommand.Menu>
  );
}
