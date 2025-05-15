import type { AstNode } from '@app-builder/models';
import { type ReactNode, useState } from 'react';
import { Button, MenuCommand } from 'ui-design-system';
import { Icon, type IconName } from 'ui-icons';

import { DiscoveryList } from './DiscoveryList';
import { SearchResults } from './SearchResults';
import type { SmartMenuListProps } from './types';

export type BottomAction = {
  id: string;
  icon?: IconName;
  label: string;
  onSelect: () => void;
};

export function AstBuilderOperandMenu({
  children,
  defaultOpen = false,
  onSelect,
  bottomActions,
}: {
  children: ReactNode;
  defaultOpen?: boolean;
  onSelect: (node: AstNode) => void;
  bottomActions: BottomAction[];
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <MenuCommand.Menu open={open} onOpenChange={setOpen}>
      {children}
      <MenuCommand.Content sameWidth sideOffset={4} align="start" className="w-96">
        <MenuCommand.Combobox placeholder="Select or create an operand" />
        <SmartMenuList onSelect={onSelect} />
        {bottomActions.length > 0 ? (
          <div className="border-grey-90 flex gap-2 overflow-x-auto border-t p-2">
            {bottomActions.map((action) => {
              return (
                <MenuCommand.HeadlessItem key={action.id} forceMount onSelect={action.onSelect}>
                  <Button type="button" variant="secondary">
                    {action.icon ? <Icon icon={action.icon} className="size-4" /> : null}
                    {action.label}
                  </Button>
                </MenuCommand.HeadlessItem>
              );
            })}
          </div>
        ) : null}
      </MenuCommand.Content>
    </MenuCommand.Menu>
  );
}

function SmartMenuList(props: SmartMenuListProps) {
  const search = MenuCommand.State.useSharp().value.search;

  return search.trim().length === 0 ? (
    <DiscoveryList {...props} />
  ) : (
    <SearchResults search={search} {...props} />
  );
}
