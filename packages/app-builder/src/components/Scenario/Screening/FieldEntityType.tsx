import { SearchableSchema } from '@app-builder/constants/screening-entity';
import { useEntityName } from '@app-builder/hooks/useEntityName';
import { useEditorMode } from '@app-builder/services/editor/editor-mode';
import { useState } from 'react';
import { MenuCommand } from 'ui-design-system';

export const FieldEntityType = ({
  entityType,
  onChange,
}: {
  entityType?: SearchableSchema;
  onChange: (entityType: SearchableSchema) => void;
}) => {
  const editor = useEditorMode();
  const { getEntityName } = useEntityName();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-md">
      <MenuCommand.Menu persistOnSelect={false} open={open} onOpenChange={setOpen}>
        <MenuCommand.Trigger>
          <MenuCommand.SelectButton className="w-52" disabled={editor === 'view'}>
            <span className="text-grey-primary text-s font-medium">{getEntityName(entityType)}</span>
          </MenuCommand.SelectButton>
        </MenuCommand.Trigger>
        <MenuCommand.Content sameWidth className="mt-sm">
          <MenuCommand.List>
            <MenuCommand.Item onSelect={() => onChange('Thing')}>{getEntityName('Thing')}</MenuCommand.Item>
            <MenuCommand.Item onSelect={() => onChange('Person')}>{getEntityName('Person')}</MenuCommand.Item>
            <MenuCommand.Item onSelect={() => onChange('Organization')}>
              {getEntityName('Organization')}
            </MenuCommand.Item>
            <MenuCommand.Item onSelect={() => onChange('Vehicle')}>{getEntityName('Vehicle')}</MenuCommand.Item>
          </MenuCommand.List>
        </MenuCommand.Content>
      </MenuCommand.Menu>
    </div>
  );
};
