import { OutcomeBadge } from '@app-builder/components/Decisions';
import { type ScreeningOutcome } from '@app-builder/models/outcome';
import { useState } from 'react';
import { MenuCommand } from 'ui-design-system';

export const FieldOutcomes = ({
  selectedOutcome,
  outcomes,
  disabled,
  name,
  onChange,
  onBlur,
}: {
  selectedOutcome?: ScreeningOutcome;
  outcomes: ScreeningOutcome[];
  disabled?: boolean;
  name?: string;
  onChange?: (value: ScreeningOutcome) => void;
  onBlur?: () => void;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <MenuCommand.Menu
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          onBlur?.();
        }
      }}
    >
      <MenuCommand.Trigger>
        <MenuCommand.SelectButton
          name={name}
          disabled={disabled}
          className="hover:bg-grey-background-light w-full border-0 transition-colors"
        >
          {selectedOutcome ? <OutcomeBadge size="sm" outcome={selectedOutcome} /> : null}
        </MenuCommand.SelectButton>
      </MenuCommand.Trigger>
      <MenuCommand.Content align="start" className="mt-sm">
        <MenuCommand.List>
          {outcomes.map((outcome) => (
            <MenuCommand.Item
              key={outcome}
              value={outcome}
              onSelect={() => {
                onChange?.(outcome);
                setOpen(false);
              }}
            >
              <OutcomeBadge size="sm" outcome={outcome} />
            </MenuCommand.Item>
          ))}
        </MenuCommand.List>
      </MenuCommand.Content>
    </MenuCommand.Menu>
  );
};
