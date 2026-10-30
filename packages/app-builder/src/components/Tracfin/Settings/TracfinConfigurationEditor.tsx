import { Page } from '@app-builder/components/Page';
import type { DataModel } from '@app-builder/models/data-model';
import type { TracfinConfiguration } from '@app-builder/models/tracfin';
import type { TracfinCatalogIndex } from '@app-builder/models/tracfin/catalog-index';
import { useMemo } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button, Tag, Typo } from 'ui-design-system';
import { ConflictPanel } from './ConflictPanel';
import { MappingsSection } from './MappingsSection';
import { OrganisationSettingsForm } from './OrganisationSettingsForm';
import { SaveFailureBanner } from './SaveFailureBanner';
import { getTracfinSettingsLayout } from './settings-layout';
import { useTracfinConfigurationEditor } from './useTracfinConfigurationEditor';

type TracfinConfigurationEditorProps = {
  /** The configuration as loaded (`null`: none yet, the first save creates it). The form starts from it once. */
  initialConfiguration: TracfinConfiguration | null;
  catalogIndex: TracfinCatalogIndex;
  dataModel: DataModel;
  reloadConfiguration: () => Promise<TracfinConfiguration | null>;
};

export function TracfinConfigurationEditor({
  initialConfiguration,
  catalogIndex,
  dataModel,
  reloadConfiguration,
}: TracfinConfigurationEditorProps) {
  const { t } = useTranslation(['tracfin', 'common']);
  const settingsLayout = useMemo(() => getTracfinSettingsLayout(catalogIndex), [catalogIndex]);
  const editor = useTracfinConfigurationEditor({
    initialConfiguration,
    catalogIndex,
    settingsLayout,
    reloadConfiguration,
  });

  const save = async () => {
    if (await editor.save()) toast.success(t('tracfin:settings.saved'));
  };

  return (
    <Page.Content width="readable">
      <div className="flex flex-wrap items-start justify-between gap-md">
        <div className="flex flex-col gap-xs">
          <Typo as="h1" variant="title1">
            {t('tracfin:settings.title')}
          </Typo>
          <p className="text-s text-grey-secondary">{t('tracfin:settings.description')}</p>
          <p className="text-grey-secondary text-xs">
            {editor.revision === 0
              ? t('tracfin:settings.no_configuration_yet')
              : t('tracfin:settings.revision', { revision: editor.revision })}
          </p>
        </div>
        <div className="flex items-center gap-sm">
          {editor.dirty ? (
            <Tag size="small" color="orange">
              {t('tracfin:settings.unsaved_changes')}
            </Tag>
          ) : null}
          <Button
            variant="secondary"
            appearance="stroked"
            disabled={!editor.dirty || editor.isSaving}
            onClick={editor.reset}
          >
            {t('tracfin:settings.reset')}
          </Button>
          <Button variant="primary" disabled={!editor.dirty || editor.isSaving} onClick={save}>
            {t('tracfin:settings.save')}
          </Button>
        </div>
      </div>

      {editor.failure ? (
        <SaveFailureBanner
          failure={editor.failure}
          general={editor.placement.general}
          isReloading={editor.isReloading}
          reloadFailed={editor.reloadFailed}
          comparing={editor.comparison !== null}
          onReload={editor.reloadServerVersion}
        />
      ) : null}

      {editor.comparison ? (
        <ConflictPanel
          comparison={editor.comparison}
          onKeepLocalEdits={editor.keepLocalEdits}
          onTakeServerVersion={editor.takeServerVersion}
        />
      ) : null}

      {/* Nothing is edited while a save is in flight: the answer replaces the form. */}
      <fieldset disabled={editor.isSaving} className="m-0 flex min-w-0 flex-col gap-xl border-0 p-0">
        <OrganisationSettingsForm
          layout={settingsLayout}
          settings={editor.state.settings}
          onSettingsChange={editor.setSettings}
          errors={editor.placement.bySettingField}
        />
        <MappingsSection
          mappings={editor.state.mappings}
          catalogIndex={catalogIndex}
          dataModel={dataModel}
          errors={editor.placement.byMappingId}
          onAdd={editor.addMapping}
          onDuplicate={editor.duplicateMapping}
          onRemove={editor.removeMapping}
          onChange={editor.updateMapping}
          onChooseHop={editor.chooseHop}
        />
      </fieldset>
    </Page.Content>
  );
}
