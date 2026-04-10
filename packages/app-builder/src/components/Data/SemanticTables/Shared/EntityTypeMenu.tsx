import { type FtmEntityV2, ftmEntities } from '@app-builder/models/data-model';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn, MenuCommand, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';

interface EntityTypeMenuProps {
  entityType: FtmEntityV2 | 'unset' | null | undefined;
  isChanged?: boolean;
  onSelect: (entityType: FtmEntityV2) => void;
}

export function EntityTypeMenu({ entityType, isChanged = false, onSelect }: EntityTypeMenuProps) {
  const { t } = useTranslation(['data']);
  const [open, setOpen] = useState(false);

  const options = useMemo(
    () =>
      ftmEntities.map((entity) => ({
        label: t(`data:upload_data.ftm_entity.${entity}`),
        value: entity,
      })),
    [t],
  );

  return (
    <MenuCommand.Menu open={open} onOpenChange={setOpen}>
      <MenuCommand.Trigger>
        <Tag color={isChanged ? 'red' : 'grey'} className="cursor-pointer gap-1">
          {isChanged && <Icon icon="tip" className="size-3" />}
          {entityType ? t(`data:upload_data.ftm_entity.${entityType}`) : t('data:upload_data.object_placeholder')}
          <Icon icon="caret-down" className={cn('size-3 transition-transform', open && 'rotate-180')} />
        </Tag>
      </MenuCommand.Trigger>
      <MenuCommand.Content sideOffset={4}>
        <MenuCommand.List>
          {options.map((option) => (
            <MenuCommand.Item key={option.value} onSelect={() => onSelect(option.value)}>
              {option.label}
            </MenuCommand.Item>
          ))}
        </MenuCommand.List>
      </MenuCommand.Content>
    </MenuCommand.Menu>
  );
}
