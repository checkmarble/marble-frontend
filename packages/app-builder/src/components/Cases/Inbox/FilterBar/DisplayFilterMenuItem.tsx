import type { Filters } from '@app-builder/queries/cases/get-cases';
import { match } from 'ts-pattern';
import { MenuCommand } from 'ui-design-system';
import { AssigneeFilterMenuItem } from './AssigneeFilterMenuItem';
import { DateRangeFilterMenu } from './DateRangeFilterMenu';
import { InboxFilterLabel } from './FilterLabel';

type DisplayFilterMenuItemProps = {
  filterName: keyof Filters;
  onSelect: (filters: Partial<Filters>) => void;
};

export const DisplayFilterMenuItem = ({ filterName, onSelect }: DisplayFilterMenuItemProps) => {
  return match(filterName)
    .with('name', () => null)
    .with('statuses', () => (
      <MenuCommand.Item value={filterName} onSelect={() => onSelect({ [filterName]: ['closed'] })}>
        <InboxFilterLabel name={filterName} />
      </MenuCommand.Item>
    ))
    .with('includeSnoozed', () => (
      <MenuCommand.Item value={filterName} onSelect={() => onSelect({ [filterName]: true })}>
        <InboxFilterLabel name={filterName} />
      </MenuCommand.Item>
    ))
    .with('excludeAssigned', () => (
      <MenuCommand.Item value={filterName} onSelect={() => onSelect({ [filterName]: true })}>
        <InboxFilterLabel name={filterName} />
      </MenuCommand.Item>
    ))
    .with('assignee', () => (
      <MenuCommand.SubMenu
        arrow={false}
        hover={false}
        trigger={
          <span>
            <InboxFilterLabel name={filterName} />
          </span>
        }
      >
        <AssigneeFilterMenuItem onSelect={(userId) => onSelect({ [filterName]: userId })} />
      </MenuCommand.SubMenu>
    ))
    .with('dateRange', () => (
      <MenuCommand.SubMenu
        arrow={false}
        hover={false}
        trigger={
          <span>
            <InboxFilterLabel name={filterName} />
          </span>
        }
        className="max-h-[600px]"
      >
        <DateRangeFilterMenu onSelect={(value) => onSelect({ [filterName]: value })} />
      </MenuCommand.SubMenu>
    ))
    .exhaustive();
};
