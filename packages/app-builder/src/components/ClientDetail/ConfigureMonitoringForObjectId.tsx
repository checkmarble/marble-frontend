import { type ContinuousScreeningConfig } from '@app-builder/models/continuous-screening';
import { useContinuousScreeningConfigurationsQuery } from '@app-builder/queries/continuous-screening/configurations';
import { useUpdateObjectMonitoringMutation } from '@app-builder/queries/continuous-screening/update-object-monitoring';
import { toggle } from 'radash';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button, cn, MenuCommand, Modal, Switch, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';

type ConfigureMonitoringForObjectIdProps = {
  objectType: string;
  objectId: string;
  activeConfigurations: ContinuousScreeningConfig[];
  label?: string;
};

export const ConfigureMonitoringForObjectId = ({
  objectType,
  objectId,
  activeConfigurations,
  label,
}: ConfigureMonitoringForObjectIdProps) => {
  const { t } = useTranslation(['common', 'client360']);
  const [open, setOpen] = useState(false);
  const [selectedStableIds, setSelectedStableIds] = useState<string[]>([]);
  const configurationsQuery = useContinuousScreeningConfigurationsQuery();
  const updateMutation = useUpdateObjectMonitoringMutation();

  const activeStableIds = useMemo(() => activeConfigurations.map((config) => config.stableId), [activeConfigurations]);

  const eligibleConfigurations = useMemo(() => {
    const configs = configurationsQuery.data ?? [];
    return configs.filter(
      (config) =>
        config.objectTypes.includes(objectType) && (config.enabled || activeStableIds.includes(config.stableId)),
    );
  }, [configurationsQuery.data, objectType, activeStableIds]);

  const selectedConfigurations = useMemo(
    () => eligibleConfigurations.filter((config) => selectedStableIds.includes(config.stableId)),
    [eligibleConfigurations, selectedStableIds],
  );

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setSelectedStableIds(activeStableIds);
    }
    setOpen(nextOpen);
  };

  const handleToggleConfig = (stableId: string) => {
    setSelectedStableIds((current) => toggle(current, stableId));
  };

  const handleValidate = async () => {
    await updateMutation.mutateAsync(
      {
        objectType,
        objectId,
        configStableIds: selectedStableIds,
      },
      {
        onSuccess: () => toast.success(t('common:success.save')),
        onError: () => toast.error(t('common:errors.unknown')),
      },
    );
    setOpen(false);
  };

  return (
    <Modal.Root open={open} onOpenChange={handleOpenChange}>
      <Modal.Trigger asChild>
        <Button mode={label ? 'normal' : 'icon'} appearance={label ? 'link' : 'stroked'} variant="secondary">
          {label ?? ''}
          <Icon icon={label ? 'plus' : 'edit-square'} className="size-4" />
        </Button>
      </Modal.Trigger>
      <Modal.Content size="small">
        <Modal.Title>{t('client360:client_detail.monitoring_hits.put_under_monitoring')}</Modal.Title>
        <div className="flex flex-col gap-lg p-lg">
          <div className="flex flex-col gap-sm">
            <span className="text-s font-medium">{t('client360:client_detail.monitoring_hits.configurations')}</span>
            <MenuCommand.Menu persistOnSelect>
              <MenuCommand.Trigger>
                <button
                  type="button"
                  className={cn(
                    'border-grey-border bg-grey-background-light flex min-h-10 w-full items-center gap-sm rounded-md border px-sm py-xs text-start',
                    'hover:border-grey-secondary focus-visible:ring-purple-primary focus-visible:ring-2 focus-visible:outline-hidden',
                  )}
                >
                  <div className="flex flex-1 flex-wrap gap-xs">
                    {selectedConfigurations.map((config) => (
                      <RemovableConfigTag
                        key={config.stableId}
                        label={config.name}
                        onRemove={() => handleToggleConfig(config.stableId)}
                      />
                    ))}
                  </div>
                  <Icon
                    icon="caret-down"
                    className="text-grey-secondary size-4 shrink-0 group-radix-state-open:rotate-180 transition-transform duration-200"
                  />
                </button>
              </MenuCommand.Trigger>
              <MenuCommand.Content
                className="w-[var(--radix-popover-trigger-width)]"
                side="bottom"
                align="start"
                sideOffset={8}
              >
                <MenuCommand.List>
                  {eligibleConfigurations.map((config) => {
                    const isSelected = selectedStableIds.includes(config.stableId);
                    return (
                      <MenuCommand.Item
                        key={config.stableId}
                        value={config.name}
                        className="cursor-pointer"
                        onSelect={() => handleToggleConfig(config.stableId)}
                      >
                        <span className="grow truncate">{config.name}</span>
                        {isSelected ? <Icon icon="tick" className="text-purple-primary size-5 shrink-0" /> : null}
                      </MenuCommand.Item>
                    );
                  })}
                  <MenuCommand.Empty>
                    <div className="text-grey-secondary px-md py-xs text-xs">{t('common:no_data_to_display')}</div>
                  </MenuCommand.Empty>
                </MenuCommand.List>
              </MenuCommand.Content>
            </MenuCommand.Menu>
          </div>
          <div className="flex items-center gap-sm">
            <Switch id="skip-initial-screening" checked disabled />
            <label htmlFor="skip-initial-screening" className="text-s text-grey-secondary">
              {t('client360:client_detail.monitoring_hits.skip_initial_screening')}
            </label>
          </div>
        </div>
        <Modal.Footer>
          <Modal.FooterButton isCloseButton label={t('common:cancel')} />
          <Modal.FooterButton
            type="button"
            label={t('common:validate')}
            onClick={handleValidate}
            isLoading={updateMutation.isPending}
            disabled={updateMutation.isPending}
          />
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
};

const RemovableConfigTag = ({ label, onRemove }: { label: string; onRemove: () => void }) => {
  return (
    <Tag
      color="purple"
      size="small"
      className="group cursor-pointer hover:bg-purple-primary/20 transition-colors"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onRemove();
      }}
    >
      <span className="flex items-center gap-xs">
        <span className="max-w-[20ch] truncate">{label}</span>
        <Icon icon="cross" className="size-3 shrink-0" />
      </span>
    </Tag>
  );
};
