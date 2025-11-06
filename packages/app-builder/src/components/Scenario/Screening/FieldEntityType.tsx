import { type SEARCH_ENTITIES } from '@app-builder/constants/screening-entity';
import { useEditorMode } from '@app-builder/services/editor/editor-mode';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Button, MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { scenarioI18n } from '../scenario-i18n';

export const FieldEntityType = ({
  entityType,
  onChange,
}: {
  entityType?: keyof typeof SEARCH_ENTITIES;
  onChange: (entityType: keyof typeof SEARCH_ENTITIES) => void;
}) => {
  const editor = useEditorMode();
  const { t } = useTranslation(scenarioI18n);
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <MenuCommand.Menu persistOnSelect={false} open={open} onOpenChange={setOpen}>
        <MenuCommand.Trigger>
          <Button variant="secondary" size="medium" className="w-52 justify-between" disabled={editor === 'view'}>
            <span className="text-grey-00 text-s font-medium">
              {match(entityType)
                .with('Thing', () => t('scenarios:edit_sanction.entity_type.thing'))
                .with('Person', () => t('scenarios:edit_sanction.entity_type.person'))
                .with('Organization', () => t('scenarios:edit_sanction.entity_type.organization'))
                .with('Vehicle', () => t('scenarios:edit_sanction.entity_type.vehicle'))
                .otherwise(() => entityType)}
            </span>
            <Icon icon="caret-down" className="text-grey-50 size-4" />
          </Button>
        </MenuCommand.Trigger>
        <MenuCommand.Content sameWidth className="mt-2">
          <MenuCommand.List>
            <MenuCommand.Item onSelect={() => onChange('Thing')}>
              {t('scenarios:edit_sanction.entity_type.thing')}
            </MenuCommand.Item>
            <MenuCommand.Item onSelect={() => onChange('Person')}>
              {t('scenarios:edit_sanction.entity_type.person')}
            </MenuCommand.Item>
            <MenuCommand.Item onSelect={() => onChange('Organization')}>
              {t('scenarios:edit_sanction.entity_type.organization')}
            </MenuCommand.Item>
            <MenuCommand.Item onSelect={() => onChange('Vehicle')}>
              {t('scenarios:edit_sanction.entity_type.vehicle')}
            </MenuCommand.Item>
          </MenuCommand.List>
        </MenuCommand.Content>
      </MenuCommand.Menu>
    </div>
  );
};
