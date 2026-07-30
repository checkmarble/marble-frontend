import { ExternalLink } from '@app-builder/components/ExternalLink';
import { ContinuousScreeningConfiguration } from '@app-builder/queries/continuous-screening/configurations';
import { useDataModelQuery } from '@app-builder/queries/data/get-data-model';
import { useUploadTableQuery } from '@app-builder/queries/data/upload-table';
import { ingestingDataByCsvDocHref } from '@app-builder/services/documentation-href';
import { useFormatDateTime } from '@app-builder/utils/format';
import { UploadLog } from 'marble-api';
import { toggle } from 'radash';
import { type MouseEvent, type SyntheticEvent, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Button, Card, cn, MenuCommand, Switch, Tag, TagProps, Typo } from 'ui-design-system';
import { Icon } from 'ui-icons';
import {
  DownloadCsvTemplate,
  UploadForm,
  type UploadFormIntermediateStepProps,
} from '../Data/SemanticTables/UploadData/UploadIngestionComponents';
import { Panel } from '../Panel';

export function PanelAddCsv({
  configuration,
  configsPerObjectType,
}: {
  configuration: ContinuousScreeningConfiguration;
  configsPerObjectType: Map<string, ContinuousScreeningConfiguration[]>;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedObjectType, setSelectedObjectType] = useState<string | null>(null);
  const { t } = useTranslation(['continuousScreening', 'upload']);
  const dataModelQuery = useDataModelQuery();

  const objectTypes = configuration.objectTypes;
  const selectedTableModel = useMemo(
    () =>
      selectedObjectType
        ? (dataModelQuery.data?.dataModel.find((table) => table.name === selectedObjectType) ?? null)
        : null,
    [dataModelQuery.data?.dataModel, selectedObjectType],
  );

  const openPanelForObjectType = (objectType: string) => {
    setSelectedObjectType(objectType);
    setPanelOpen(true);
  };

  const handlePanelOpenChange = (open: boolean) => {
    setPanelOpen(open);
    if (!open) {
      setSelectedObjectType(null);
    }
  };

  const handleAddClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (objectTypes.length === 1) {
      openPanelForObjectType(objectTypes[0]!);
    }
  };

  const stopRowInteraction = (e: SyntheticEvent) => {
    e.stopPropagation();
  };

  return (
    <div onClick={stopRowInteraction} onPointerDown={stopRowInteraction}>
      {objectTypes.length > 1 ? (
        <MenuCommand.Menu open={menuOpen} onOpenChange={setMenuOpen}>
          <MenuCommand.Trigger>
            <Button variant="primary" appearance="stroked" onClick={(e) => e.stopPropagation()}>
              <Icon icon="plus" className="size-4" />
              <span className="truncate">{t('continuousScreening:configurations.csv.button.addCsv')}</span>
            </Button>
          </MenuCommand.Trigger>
          <MenuCommand.Content align="end" sideOffset={4}>
            <MenuCommand.List>
              <MenuCommand.Group heading={t('upload:select_one_table')}>
                {objectTypes.map((objectType) => (
                  <MenuCommand.Item
                    key={objectType}
                    value={objectType}
                    onSelect={() => {
                      setMenuOpen(false);
                      openPanelForObjectType(objectType);
                    }}
                  >
                    {objectType}
                  </MenuCommand.Item>
                ))}
              </MenuCommand.Group>
            </MenuCommand.List>
          </MenuCommand.Content>
        </MenuCommand.Menu>
      ) : (
        <Button variant="primary" appearance="stroked" onClick={handleAddClick}>
          <Icon icon="plus" className="size-4" />
          {t('continuousScreening:configurations.csv.button.addCsv')}
        </Button>
      )}

      <Panel.Root open={panelOpen} onOpenChange={handlePanelOpenChange}>
        <Panel.Container>
          <Panel.Content>
            <Panel.Header>
              {t('continuousScreening:configurations.csv.button.title', {
                objectType: selectedObjectType,
              })}
            </Panel.Header>
            <div className="space-y-md">
              <p className="text-s whitespace-pre-wrap text-grey-secondary">
                <Trans
                  t={t}
                  i18nKey="upload:upload_callout_1"
                  components={{
                    DocLink: <ExternalLink href={ingestingDataByCsvDocHref} />,
                  }}
                  values={{ objectType: selectedObjectType }}
                />
                <br />
                {t('upload:upload_callout_2')}
              </p>

              {selectedObjectType && selectedTableModel ? (
                <DownloadCsvTemplate tableModel={selectedTableModel} objectType={selectedObjectType} />
              ) : null}

              {selectedObjectType ? (
                <UploadForm
                  objectType={selectedObjectType}
                  intermediateSteps={[
                    ({ file, onNext, onBack }) => (
                      <CsvUploadConfirmStep
                        file={file}
                        configs={configsPerObjectType.get(selectedObjectType) ?? []}
                        onNext={onNext}
                        onBack={onBack}
                      />
                    ),
                  ]}
                />
              ) : null}
            </div>
            {selectedObjectType ? (
              <PastUploads objectType={selectedObjectType} configsPerObjectType={configsPerObjectType} />
            ) : null}
          </Panel.Content>
        </Panel.Container>
      </Panel.Root>
    </div>
  );
}

function CsvUploadConfirmStep({
  file,
  configs,
  onNext,
  onBack,
}: UploadFormIntermediateStepProps & {
  configs: ContinuousScreeningConfiguration[];
}) {
  const { t } = useTranslation(['continuousScreening', 'common']);
  const [placeUnderMonitoring, setPlaceUnderMonitoring] = useState(true);
  const [selectedStableIds, setSelectedStableIds] = useState(() => configs.map((config) => config.stableId));
  const [skipInitialScreening, setSkipInitialScreening] = useState(true);

  const selectedConfigurations = useMemo(
    () => configs.filter((config) => selectedStableIds.includes(config.stableId)),
    [configs, selectedStableIds],
  );

  const canValidate = !placeUnderMonitoring || selectedStableIds.length > 0;

  const handleToggleConfig = (stableId: string) => {
    setSelectedStableIds((current) => toggle(current, stableId));
  };

  return (
    <div className="border-grey-placeholder flex flex-col gap-lg rounded-sm border-2 border-dashed p-lg">
      <div className="flex flex-wrap items-center gap-sm">
        <span className="text-s text-grey-primary">
          {t('continuousScreening:configurations.csv.confirm.going_to_upload')}
        </span>
        <Tag
          color="grey"
          size="small"
          className="cursor-pointer"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onBack();
          }}
        >
          <span className="flex items-center gap-xs">
            <span className="max-w-[24ch] truncate">{file.name}</span>
            <Icon icon="cross" className="size-3 shrink-0" />
          </span>
        </Tag>
      </div>

      <div className="flex flex-col gap-md">
        <div className="flex flex-col gap-sm">
          <div className="flex items-center gap-sm">
            <Switch
              id="place-under-monitoring"
              checked={placeUnderMonitoring}
              onCheckedChange={(checked) => {
                setPlaceUnderMonitoring(checked);
                if (!checked) {
                  setSelectedStableIds([]);
                } else if (selectedStableIds.length === 0) {
                  setSelectedStableIds(configs.map((config) => config.stableId));
                }
              }}
            />
            <label htmlFor="place-under-monitoring" className="text-s text-grey-primary">
              {t('continuousScreening:configurations.csv.confirm.place_under_monitoring')}
            </label>
          </div>

          {placeUnderMonitoring ? (
            <div className="ps-2xl">
              <MenuCommand.Menu persistOnSelect>
                <MenuCommand.Trigger>
                  <button
                    type="button"
                    className={cn(
                      'border-grey-border bg-surface-card flex min-h-10 w-full items-center gap-sm rounded-md border px-sm py-xs text-start',
                      'hover:border-grey-secondary focus-visible:ring-purple-primary focus-visible:ring-2 focus-visible:outline-hidden',
                    )}
                  >
                    <div className="flex flex-1 flex-wrap gap-xs">
                      {selectedConfigurations.length > 0 ? (
                        selectedConfigurations.map((config) => (
                          <RemovableConfigTag
                            key={config.stableId}
                            label={config.name}
                            onRemove={() => handleToggleConfig(config.stableId)}
                          />
                        ))
                      ) : (
                        <span className="text-s text-grey-secondary">
                          {t('continuousScreening:configurations.csv.confirm.configuration_placeholder')}
                        </span>
                      )}
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
                    {configs.map((config) => {
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
          ) : null}
        </div>

        <div className="flex items-center gap-sm">
          <Switch
            id="skip-initial-screening"
            checked={skipInitialScreening}
            onCheckedChange={setSkipInitialScreening}
          />
          <label htmlFor="skip-initial-screening" className="text-s text-grey-primary">
            {t('continuousScreening:configurations.csv.confirm.skip_initial_screening')}
          </label>
        </div>
      </div>

      <div className="flex items-center justify-end gap-sm">
        <Button variant="secondary" onClick={onBack}>
          {t('common:cancel')}
        </Button>
        <Button
          variant="primary"
          onClick={() =>
            onNext({
              monitor: String(placeUnderMonitoring),
              skip_screening: String(skipInitialScreening),
              ...(placeUnderMonitoring ? { monitoring_config_id: selectedStableIds } : {}),
            })
          }
          disabled={!canValidate}
        >
          {t('continuousScreening:configurations.csv.confirm.validate_upload')}
        </Button>
      </div>
    </div>
  );
}

function RemovableConfigTag({ label, onRemove }: { label: string; onRemove: () => void }) {
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
}

function PastUploads({
  objectType,
  configsPerObjectType,
}: {
  objectType: string;
  configsPerObjectType: Map<string, ContinuousScreeningConfiguration[]>;
}) {
  const { t } = useTranslation('upload');
  const formatDateTime = useFormatDateTime();

  const uploadLogsQuery = useUploadTableQuery(objectType, true, {
    refetchInterval: 1_000,
  });

  return (
    <div className="mt-2xl flex flex-col gap-sm">
      <Typo variant="subtitle1">{t('upload:past_uploads')}</Typo>
      {Array.isArray(uploadLogsQuery?.data) &&
        uploadLogsQuery.data.map((uploadLog) => (
          <Card key={uploadLog.started_at} className="p-md">
            <div className="flex items-center justify-between">
              <div className="space-y-xs ">
                <p className="font-semibold text-sm">
                  {uploadLog.finished_at
                    ? t('upload:uploaded_at_date', {
                        date: formatDateUpload(uploadLog.finished_at, formatDateTime),
                      })
                    : t('upload:started_at_date', {
                        date: formatDateUpload(uploadLog.started_at, formatDateTime),
                      })}
                </p>
                <p className="text-sm text-grey-secondary">
                  {t('upload:record_vs_ingested', {
                    linesProcessed: uploadLog.lines_processed,
                    total: uploadLog.num_rows_ingested,
                  })}
                </p>
              </div>
              <TagStatus status={uploadLog.status} />
            </div>
            {/* TODO: uncomment when the back send relevant data
            configsPerObjectType.has(objectType) && (
              <div className="flex gap-sm flex-wrap items-center">
                <p className="text-sm text-grey-secondary">{t('upload:active_screenings')}</p>
                {Array.from(configsPerObjectType.get(objectType)!).map((config) => (
                  <Tag key={config.id} color="white" size="medium">
                    {config.name}
                  </Tag>
                ))}
              </div>
            )*/}
          </Card>
        ))}
    </div>
  );
}

function TagStatus({ status }: { status: UploadLog['status'] }) {
  const { t } = useTranslation(['upload']);
  const color = match(status)
    .with('pending', 'progressing', () => 'yellow' as TagProps['color'])
    .with('success', () => 'green' as TagProps['color'])
    .with('failure', () => 'red' as TagProps['color'])
    .otherwise(() => 'grey' as TagProps['color']);
  const text = t(`upload:status_${status}`);
  return <Tag color={color}>{text}</Tag>;
}

function formatDateUpload(date: string, formatDateTime: ReturnType<typeof useFormatDateTime>) {
  const hour = formatDateTime(date, { hour: 'numeric', minute: 'numeric' });
  const shortDate = formatDateTime(date, { day: '2-digit', month: '2-digit', year: 'numeric' });
  return `${hour} - ${shortDate}`;
}
