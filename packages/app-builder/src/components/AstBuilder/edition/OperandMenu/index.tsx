import { type AstNode, NewUndefinedAstNode } from '@app-builder/models';
import { type ReactNode, useState } from 'react';
import { Button, MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { DiscoveryList } from './DiscoveryList';
import { SearchResults } from './SearchResults';
import { type SmartMenuListProps } from './types';

export function AstBuilderOperandMenu({
  children,
  defaultOpen = false,
  onSelect,
}: {
  children: ReactNode;
  defaultOpen?: boolean;
  onSelect: (node: AstNode) => void;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <MenuCommand.Menu open={open} onOpenChange={setOpen}>
      {children}
      <MenuCommand.Content
        sameWidth
        sideOffset={4}
        align="start"
        className="w-96"
      >
        <MenuCommand.Combobox placeholder="Select or create an operand" />
        <SmartMenuList onSelect={onSelect} />
        <div className="border-grey-90 border-t p-2">
          <MenuCommand.HeadlessItem
            forceMount
            onSelect={() => onSelect(NewUndefinedAstNode())}
          >
            <Button type="button" variant="secondary">
              <Icon icon="restart-alt" className="size-4" />
              Clean
            </Button>
          </MenuCommand.HeadlessItem>
        </div>
      </MenuCommand.Content>
    </MenuCommand.Menu>
  );
}

function SmartMenuList(props: SmartMenuListProps) {
  const search = MenuCommand.useStore((s) => s.search);

  return search.length === 0 ? (
    <DiscoveryList {...props} />
  ) : (
    <SearchResults search={search} {...props} />
  );
}
