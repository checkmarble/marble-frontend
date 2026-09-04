import { Checkbox, ExpandableGroupTagLine, MenuCommand, Tag } from 'ui-design-system';
import { type GraphFilterOption } from './lib/graph-query-filters';

interface GraphMultiFilterSelectProps {
  options: GraphFilterOption[];
  value: string[];
  onToggle: (value: string) => void;
  placeholder: string;
}

export function GraphMultiFilterSelect({ options, value, onToggle, placeholder }: GraphMultiFilterSelectProps) {
  const selectedOptions = options.filter((option) => value.includes(option.value));

  return (
    <MenuCommand.Menu persistOnSelect>
      <MenuCommand.Trigger>
        <MenuCommand.SelectButton className="w-full" size="medium" aria-label={placeholder}>
          {selectedOptions.length === 0 ? (
            <span className="text-grey-placeholder text-s">{placeholder}</span>
          ) : (
            <ExpandableGroupTagLine
              classname="gap-xs"
              items={selectedOptions.map((option) => (
                <Tag key={option.value} color="purple" size="small">
                  {option.label}
                </Tag>
              ))}
              /* The menu lists every option with its checkbox, so the overflow count
                 stays inert text instead of a popover trigger nested in this button. */
              moreButton={(overflow) => (
                <Tag color="purple" size="small" className="shrink-0">
                  +{overflow}
                </Tag>
              )}
            />
          )}
        </MenuCommand.SelectButton>
      </MenuCommand.Trigger>
      <MenuCommand.Content sameWidth align="start" sideOffset={4}>
        <MenuCommand.List>
          {options.map((option) => (
            <MenuCommand.Item
              key={option.value}
              value={`${option.label} ${option.value}`}
              className="flex items-center justify-start gap-sm"
              onSelect={() => onToggle(option.value)}
            >
              <Checkbox size="small" checked={value.includes(option.value)} />
              {option.label}
            </MenuCommand.Item>
          ))}
        </MenuCommand.List>
      </MenuCommand.Content>
    </MenuCommand.Menu>
  );
}
