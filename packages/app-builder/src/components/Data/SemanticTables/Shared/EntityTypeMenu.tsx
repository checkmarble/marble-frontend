import {
  FtmEntityPersonOption,
  type FtmEntityV2,
  ftmEntities,
  ftmEntityPersonOptions,
} from '@app-builder/models/data-model';
import { useDataModel } from '@app-builder/services/data/data-model';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn, MenuCommand, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { requiresLink } from '../CreateTable/createTable-types';
import { isLinkableTable } from './semanticData-types';

type EntityType = FtmEntityV2 | 'unset' | null | undefined;
type EntitySubtype = FtmEntityPersonOption | 'unset' | null | undefined;
interface EntityTypeMenuProps {
  entityType: EntityType;
  entitySubtype: EntitySubtype;
  isChanged?: boolean;
  onSelect: (entityType: FtmEntityV2, entitySubtype?: FtmEntityPersonOption) => void;
  /** Override whether entities requiring a link (transaction/event/account) are selectable.
   * Defaults to checking the persisted data model for linkable tables. */
  canSelectTypeThatNeedsAPerson?: boolean;
}

export function EntityTypeMenu({
  entityType,
  entitySubtype,
  isChanged = false,
  onSelect,
  canSelectTypeThatNeedsAPerson: canSelectProp,
}: EntityTypeMenuProps) {
  const { t } = useTranslation(['data']);
  const [open, setOpen] = useState(false);
  const [openSubType, setOpenSubType] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<EntityType>(entityType);
  const [selectedPersonEntity, setSelectedPersonEntity] = useState<EntitySubtype>(entitySubtype);

  const dataModel = useDataModel();

  const canSelectFromDataModel = useMemo(() => dataModel.some(isLinkableTable), [dataModel]);
  const entitySubtypeOptions = useMemo(
    () =>
      ftmEntityPersonOptions.map((subtype) => ({
        label: t(`data:upload_data.ftm_entity_person.${subtype}`),
        value: subtype,
      })),
    [t],
  );
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

  function handleSelectEntity(option: FtmEntityV2, personOption?: FtmEntityPersonOption) {
    setSelectedEntity(option);
    if (option !== 'person') onSelect(option, undefined);
  }

  function handleSelectSubEntity(option: FtmEntityPersonOption) {
    if (selectedEntity !== 'person') return;
    setSelectedPersonEntity(option);
    onSelect(selectedEntity, option);
  }

  return (
    <div className="flex gap-2">
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
              <MenuCommand.Item key={option.value} onSelect={() => handleSelectEntity(option.value)}>
                {option.label}
              </MenuCommand.Item>
            ))}
          </MenuCommand.List>
        </MenuCommand.Content>
      </MenuCommand.Menu>
      {selectedEntity === 'person' && (
        <MenuCommand.Menu open={openSubType} onOpenChange={setOpenSubType}>
          <MenuCommand.Trigger>
            <Tag className="cursor-pointer gap-1" color="grey">
              {entitySubtypeOptions.find((option) => option.value === selectedPersonEntity)?.label ??
                t('data:upload_data.object_placeholder')}
              <Icon icon="caret-down" className={cn('size-3 transition-transform', openSubType && 'rotate-180')} />
            </Tag>
          </MenuCommand.Trigger>
          <MenuCommand.Content sideOffset={4}>
            <MenuCommand.List>
              {entitySubtypeOptions.map((option) => (
                <MenuCommand.Item key={option.value} onSelect={() => handleSelectSubEntity(option.value)}>
                  {option.label}
                </MenuCommand.Item>
              ))}
            </MenuCommand.List>
          </MenuCommand.Content>
        </MenuCommand.Menu>
      )}
    </div>
  );
}
