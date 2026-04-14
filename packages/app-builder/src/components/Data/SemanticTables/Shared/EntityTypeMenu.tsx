import { type FtmEntityV2, ftmEntities } from '@app-builder/models/data-model';
import { useDataModel } from '@app-builder/services/data/data-model';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn, MenuCommand, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { requiresLink } from '../CreateTable/createTable-types';
import { isLinkableTable } from './semanticData-types';

interface EntityTypeMenuProps {
  entityType: FtmEntityV2 | 'unset' | null | undefined;
  isChanged?: boolean;
  onSelect: (entityType: FtmEntityV2) => void;
  /** Override whether entities requiring a link (transaction/event/account) are selectable.
   * Defaults to checking the persisted data model for linkable tables. */
  canSelectTypeThatNeedsAPerson?: boolean;
}

export function EntityTypeMenu({
  entityType,
  isChanged = false,
  onSelect,
  canSelectTypeThatNeedsAPerson: canSelectProp,
}: EntityTypeMenuProps) {
  const { t } = useTranslation(['data']);
  const [open, setOpen] = useState(false);
  const dataModel = useDataModel();

  const canSelectFromDataModel = useMemo(() => dataModel.some(isLinkableTable), [dataModel]);
  const canSelectTypeThatNeedsAPerson = canSelectProp ?? canSelectFromDataModel;

  const options = useMemo(
    () =>
      ftmEntities
        .filter((entity) => !requiresLink(entity) || canSelectTypeThatNeedsAPerson)
        .map((entity) => ({
          label: t(`data:upload_data.ftm_entity.${entity}`),
          value: entity,
        })),
    [t, canSelectTypeThatNeedsAPerson],
  );

  return (
    <MenuCommand.Menu open={open} onOpenChange={setOpen}>
      <MenuCommand.Trigger>
        <Tag color={isChanged ? 'red' : 'grey'} className="cursor-pointer gap-1">
          {isChanged && <Icon icon="tip" className="size-3" />}
          {entityType && entityType !== 'unset'
            ? t(`data:upload_data.ftm_entity.${entityType}`)
            : t('data:upload_data.object_placeholder')}
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
