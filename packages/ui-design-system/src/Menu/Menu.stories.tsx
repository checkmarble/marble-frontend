import { MenuGroupLabel, MenuSeparator } from '@ariakit/react';
import { type Meta, type StoryFn } from '@storybook/react';
import { Fragment, useDeferredValue, useMemo, useState } from 'react';

import { Button } from '../Button/Button';
import { Input } from '../Input/Input';
import { ScrollAreaV2 } from '../ScrollArea/ScrollArea';
import {
  MenuButton,
  MenuCombobox,
  MenuContent,
  MenuGroup,
  MenuItem,
  MenuPopover,
  MenuRoot,
  SubMenuButton,
  SubMenuRoot,
} from './Menu';

const fruits = ['apple', 'banana', 'blueberry', 'grapes', 'pineapple', 'pear'];
const vegetables = ['carrot', 'cucumber', 'lettuce', 'onion'];

const groceries = [
  'milk',
  'cheese',
  'yogurt',
  { label: 'fruits', items: fruits },
  { label: 'vegetables', items: vegetables },
];

function renderItems(items: typeof groceries, group?: string) {
  return items.map((item) => {
    const key = typeof item === 'string' ? item : item.label;

    const element =
      typeof item === 'string' ? (
        <MenuItem
          name={group}
          className="data-[active-item]:bg-purple-05 rounded p-2 outline-none"
        >
          {item}
        </MenuItem>
      ) : (
        <Fragment>
          <MenuSeparator />
          <MenuGroup>
            <MenuGroupLabel className="text-grey-50 text-xs">
              {item.label}
            </MenuGroupLabel>
            {renderItems(item.items, item.label)}
          </MenuGroup>
        </Fragment>
      );

    return <Fragment key={key}>{element}</Fragment>;
  });
}

function renderMatches(matches: typeof groceries | null) {
  if (!matches) return null;
  if (!matches.length) {
    return <div>No results</div>;
  }
  return renderItems(matches);
}

function MenuWithCombobox({ items }: { items: typeof groceries }) {
  const [searchValue, setSearchValue] = useState('');
  const deferredSearchValue = useDeferredValue(searchValue);

  const flattenedItems = useMemo(
    () =>
      items.flatMap((item) => (typeof item === 'string' ? [item] : item.items)),
    [items],
  );
  const matches = useMemo(() => {
    if (!deferredSearchValue) return null;
    return flattenedItems.filter((item) => item.includes(deferredSearchValue));
  }, [deferredSearchValue, flattenedItems]);

  return (
    <MenuRoot searchValue={searchValue} onSearch={setSearchValue}>
      <MenuButton render={<Button />}>Open</MenuButton>
      <MenuPopover className="flex flex-col gap-2 p-2">
        <MenuCombobox render={<Input className="shrink-0" />} />
        <MenuContent>
          <ScrollAreaV2 type="auto">
            {renderMatches(matches) || renderItems(items)}
          </ScrollAreaV2>
        </MenuContent>
      </MenuPopover>
    </MenuRoot>
  );
}

const Story: Meta = {
  title: 'MenuWithCombobox',
  component: MenuWithCombobox,
};
export default Story;

export const Default: StoryFn = () => <MenuWithCombobox items={groceries} />;

export const WithoutCombobox: StoryFn = () => (
  <MenuRoot>
    <MenuButton render={<Button />}>Open</MenuButton>
    <MenuPopover className="flex flex-col gap-2 p-2">
      <ScrollAreaV2 type="auto">{renderItems(groceries)}</ScrollAreaV2>
    </MenuPopover>
  </MenuRoot>
);

function renderNestedItems(items: typeof groceries, group?: string) {
  return items.map((item) => {
    const key = typeof item === 'string' ? item : item.label;

    const element =
      typeof item === 'string' ? (
        <MenuItem
          name={group}
          className="data-[active-item]:bg-purple-05 rounded p-2 outline-none"
        >
          {item}
        </MenuItem>
      ) : (
        <Fragment>
          <MenuSeparator className="my-2" />
          <SubMenuRoot>
            <SubMenuButton className="data-[active-item]:bg-purple-05 flex flex-row justify-between gap-2 rounded p-2 outline-none">
              <span>{item.label}</span>
              <span>{'>'}</span>
            </SubMenuButton>
            <MenuPopover className="flex flex-col gap-2 p-2" gutter={16}>
              <MenuContent>
                <ScrollAreaV2 type="auto">
                  {renderItems(item.items, item.label)}
                </ScrollAreaV2>
              </MenuContent>
            </MenuPopover>
          </SubMenuRoot>
        </Fragment>
      );

    return <Fragment key={key}>{element}</Fragment>;
  });
}

function NestedMenuWithCombobox({ items }: { items: typeof groceries }) {
  const [searchValue, setSearchValue] = useState('');
  const deferredSearchValue = useDeferredValue(searchValue);

  const flattenedItems = useMemo(
    () =>
      items.flatMap((item): { label: string; group?: string }[] =>
        typeof item === 'string'
          ? [{ label: item }]
          : item.items.map((label) => ({ label, group: item.label })),
      ),
    [items],
  );
  const matches = useMemo(() => {
    if (!deferredSearchValue) return null;
    const matches = flattenedItems.filter((item) =>
      item.label.includes(deferredSearchValue),
    );
    return matches.reduce<typeof items>((acc, item) => {
      if (item.group) {
        const group = acc.find(
          (val): val is { label: string; items: string[] } =>
            typeof val !== 'string' && val.label === item.group,
        );
        if (group) {
          group.items.push(item.label);
        } else {
          acc.push({ label: item.group, items: [item.label] });
        }
      } else {
        acc.push(item.label);
      }
      return acc;
    }, []);
  }, [deferredSearchValue, flattenedItems]);

  return (
    <MenuRoot searchValue={searchValue} onSearch={setSearchValue}>
      <MenuButton render={<Button />}>Open</MenuButton>
      <MenuPopover className="flex flex-col gap-2 p-2">
        <MenuCombobox render={<Input className="shrink-0" />} />
        <MenuContent>
          <ScrollAreaV2 type="auto">
            {renderMatches(matches) || renderNestedItems(items)}
          </ScrollAreaV2>
        </MenuContent>
      </MenuPopover>
    </MenuRoot>
  );
}

export const Nested: StoryFn = () => (
  <NestedMenuWithCombobox items={groceries} />
);

export const NestedWithoutCombobox: StoryFn = () => (
  <MenuRoot>
    <MenuButton render={<Button />}>Open</MenuButton>
    <MenuPopover className="flex flex-col gap-2 p-2">
      <ScrollAreaV2 type="auto">{renderNestedItems(groceries)}</ScrollAreaV2>
    </MenuPopover>
  </MenuRoot>
);
