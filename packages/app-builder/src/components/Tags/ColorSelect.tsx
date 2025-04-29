import { type TagColor, tagColors } from '@app-builder/models/tags';
import { useState } from 'react';
import { Button, MenuCommand } from 'ui-design-system';

import { ColorPreview } from './ColorPreview';

export const ColorSelect = ({
  onChange,
  value,
}: {
  onChange: (color: TagColor) => void;
  value: TagColor;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <MenuCommand.Menu open={open} onOpenChange={setOpen}>
      <MenuCommand.Trigger>
        <Button variant="secondary" className="h-10 gap-4">
          <ColorPreview color={value} />
          <MenuCommand.Arrow />
        </Button>
      </MenuCommand.Trigger>
      <MenuCommand.Content className="mt-2" sameWidth>
        <MenuCommand.List>
          {tagColors.map((color) => (
            <MenuCommand.Item
              className="cursor-pointer"
              key={color}
              value={color}
              onSelect={(c) => onChange(c as TagColor)}
            >
              <ColorPreview color={color} />
            </MenuCommand.Item>
          ))}
        </MenuCommand.List>
      </MenuCommand.Content>
    </MenuCommand.Menu>
  );
};
