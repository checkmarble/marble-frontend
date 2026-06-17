import { Callout } from '@app-builder/components/Callout';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import {
  type DestroyDataModelReport,
  DestroyDataModelReportRef,
  hasBlockingConflicts,
  type TableModel,
} from '@app-builder/models/data-model';
import { useDeleteTableMutation } from '@app-builder/queries/data/delete-table';
import { useDataModelFeatureAccess } from '@app-builder/services/data/data-model';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { Link } from '@tanstack/react-router';
import { TFunction } from 'i18next';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Input, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { dataI18n } from '../data-i18n';

interface DeleteTableModalProps {
  table: TableModel;
  onDeleted?: () => void;
  children?: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
export type DeleteDataModelEntityType = 'table' | 'field' | 'link' | 'pivot';

export function DeleteTableModal({ table, onDeleted, children, open, onOpenChange }: DeleteTableModalProps) {
  const { t } = useTranslation(dataI18n);
  const { isDeleteDataModelTableAvailable } = useDataModelFeatureAccess();
  const [report, setReport] = useState<DestroyDataModelReport | null>(null);
  const deleteTableMutation = useDeleteTableMutation();
  const revalidate = useLoaderRevalidator();
  const [confirmationText, setConfirmationText] = useState('');
  const [isBlocked, setIsBlocked] = useState(false);
  const [hasArchivedIterations, setHasArchivedIterations] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  if (!isDeleteDataModelTableAvailable) {
    return null;
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) setReport(null);
    onOpenChange(nextOpen);
  };

  const handleOpenModal = async () => {
    try {
      const report = await deleteTableMutation.mutateAsync({
        tableId: table.id,
        perform: false,
      });

      setReport(report);
      setIsBlocked(hasBlockingConflicts(report));
      setHasArchivedIterations(report.archivedIterations.length > 0);
      onOpenChange(true);
      return;
    } catch {
      onOpenChange(false);
    }
  };

  const handleConfirmDelete = async () => {
    const report = await deleteTableMutation.mutateAsync({
      tableId: table.id,
      perform: true,
    });

    if (report.performed) {
      toast.success(t('common:success.deleted'));

      handleOpenChange(false);
      revalidate();
      onDeleted?.();
    }
  };

  const handleClose = () => {
    handleOpenChange(false);
  };

  useEffect(() => {
    if (!open) {
      handleOpenChange(false);
      return;
    }

    void handleOpenModal();
  }, [open, table.id]);

  return (
    <Modal.Root open={open} onOpenChange={handleOpenChange}>
      {children ? <Modal.Trigger onClick={handleOpenModal}>{children}</Modal.Trigger> : null}
      <Modal.Content>
        <Modal.Title>{t('data:delete_table.title', { name: table.name })}</Modal.Title>
        {report ? (
          <div className="flex flex-col gap-4 overflow-y-auto p-6">
            {isBlocked ? (
              <BlockedDeletionContent report={report} entityType={'table'} entityName={table.name} t={t} />
            ) : hasArchivedIterations ? (
              <DraftDeletionContent report={report} entityType={'table'} entityName={table.name} t={t} />
            ) : (
              <SimpleDeletionContent entityType={'table'} entityName={table.name} t={t} />
            )}

            {!isBlocked ? (
              <div className="flex flex-col gap-2">
                <label htmlFor="delete-confirmation" className="text-s text-grey-primary">
                  {t('data:delete.type_to_confirm', { text: table.name })}
                </label>
                <Input
                  id="delete-confirmation"
                  type="text"
                  value={confirmationText}
                  onChange={(e) => {
                    setConfirmationText(e.target.value);
                    setIsConfirmed(e.target.value === table.name);
                  }}
                  placeholder={table.name}
                  autoComplete="off"
                />
              </div>
            ) : null}
          </div>
        ) : null}
        <Modal.Footer>
          <Modal.FooterButton isCloseButton label={t('common:cancel')} onClick={handleClose} />
          {isBlocked ? (
            <Modal.FooterButton label={t('data:delete.understood')} onClick={handleClose} />
          ) : (
            <Modal.FooterButton
              variant="destructive"
              label={t('common:delete')}
              onClick={handleConfirmDelete}
              disabled={deleteTableMutation.isPending || !isConfirmed}
              isLoading={deleteTableMutation.isPending}
              leadingIcon="delete"
            />
          )}
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}

function SimpleDeletionContent({
  entityType,
  entityName,
  t,
}: {
  entityType: DeleteDataModelEntityType;
  entityName: string;
  t: TFunction;
}) {
  return <p className="text-s text-grey-primary">{t(`data:delete_${entityType}.confirm`, { name: entityName })}</p>;
}

function DraftDeletionContent({
  report,
  entityType,
  entityName,
  t,
}: {
  report: DestroyDataModelReport;
  entityType: DeleteDataModelEntityType;
  entityName: string;
  t: TFunction;
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-s text-grey-primary">{t('data:delete.drafts_linked', { name: entityName })}</p>

      <ul className="text-s text-grey-primary list-disc pl-4">
        {report.archivedIterations.map((iteration) => (
          <li key={iteration.id}>{iteration.label}</li>
        ))}
      </ul>

      <p className="text-s text-grey-primary">{t('data:delete.will_archive_drafts')}</p>
    </div>
  );
}

function BlockedDeletionContent({
  report,
  entityType,
  entityName,
  t,
}: {
  report: DestroyDataModelReport;
  entityType: DeleteDataModelEntityType;
  entityName: string;
  t: TFunction;
}) {
  const { conflicts, archivedIterations } = report;
  const hasArchivedIterations = archivedIterations.length > 0;

  // Split scenario iterations into draft and active
  const allScenarioIterations = Object.entries(conflicts.scenarioIterations);
  const draftScenarioIterations = allScenarioIterations.filter(([, iteration]) => iteration.draft);
  const activeScenarioIterations = allScenarioIterations.filter(([, iteration]) => !iteration.draft);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-s text-grey-primary">{t('data:delete.active_scenarios_linked', { name: entityName })}</p>

      {/* Draft scenario iterations that need modification */}
      {draftScenarioIterations.length > 0 ? (
        <div className="flex flex-col gap-2">
          <Callout color="purple" icon="lightbulb">
            {t('data:delete.draft_scenarios_need_modification', {
              count: draftScenarioIterations.length,
            })}
          </Callout>
          <ul className="text-s text-grey-primary list-disc pl-4">
            {draftScenarioIterations.map(([iterationId, iteration]) => {
              const shortId = fromUUIDtoSUUID(iteration.scenarioId);
              return (
                <li key={iterationId} className="flex items-center gap-2">
                  <span>{iteration.name}</span>
                  <Link
                    to="/detection/scenarios/$scenarioId"
                    params={{ scenarioId: shortId }}
                    className="text-purple-primary text-s flex items-center gap-1 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t('data:delete.view')}
                    <Icon icon="openinnew" className="size-4" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {/* Active scenario iterations that need modification */}
      {activeScenarioIterations.length > 0 ? (
        <div className="flex flex-col gap-2">
          <Callout color="purple" icon="lightbulb">
            {t('data:delete.active_scenarios_need_modification', {
              count: activeScenarioIterations.length,
            })}
          </Callout>
          <ul className="text-s text-grey-primary list-disc pl-4">
            {activeScenarioIterations.map(([iterationId, iteration]) => {
              const shortId = fromUUIDtoSUUID(iteration.scenarioId);
              return (
                <li key={iterationId} className="flex items-center gap-2">
                  <span>{iteration.name}</span>
                  <Link
                    to="/detection/scenarios/$scenarioId"
                    params={{ scenarioId: shortId }}
                    className="text-purple-primary text-s flex items-center gap-1 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t('data:delete.view')}
                    <Icon icon="openinnew" className="size-4" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {/* Archived iterations (will be archived on deletion) */}
      {hasArchivedIterations ? (
        <div className="flex flex-col gap-2">
          <Callout color="purple" icon="lightbulb">
            {t('data:delete.drafts_will_be_archived', {
              count: archivedIterations.length,
            })}
          </Callout>
          <ul className="text-s text-grey-primary list-disc pl-4">
            {archivedIterations.map((iteration) => (
              <li key={iteration.id}>{iteration.label}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Scenarios using this as trigger object */}
      {conflicts.scenarios.length > 0 ? (
        <div className="flex flex-col gap-2">
          <p className="text-s text-grey-primary font-medium">{t('data:delete.scenarios_using_trigger')}</p>
          <ul className="text-s text-grey-primary list-disc pl-4">
            {conflicts.scenarios.map((scenario) => (
              <li key={scenario.id} className="flex items-center gap-2">
                <span>{scenario.label}</span>
                <ScenarioLink item={scenario} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Workflows using this resource */}
      {conflicts.workflows.length > 0 ? (
        <div className="flex flex-col gap-2">
          <p className="text-s text-grey-primary font-medium">{t('data:delete.workflows_affected')}</p>
          <ul className="text-s text-grey-primary list-disc pl-4">
            {conflicts.workflows.map((workflow) => (
              <li key={workflow.id} className="flex items-center gap-2">
                <span>{workflow.label}</span>
                <ScenarioLink item={workflow} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Links using this resource */}
      {conflicts.links.length > 0 ? (
        <Callout color="orange" icon="warning">
          {t('data:delete.links_count', { count: conflicts.links.length })}
        </Callout>
      ) : null}

      {/* Pivots using this resource */}
      {conflicts.pivots.length > 0 ? (
        <Callout color="orange" icon="warning">
          {t('data:delete.pivots_count', { count: conflicts.pivots.length })}
        </Callout>
      ) : null}

      {/* Other blocking conflicts */}
      {conflicts.continuousScreening ? (
        <Callout color="orange" icon="warning">
          {t('data:delete.continuous_screening_affected')}
        </Callout>
      ) : null}

      {conflicts.testRuns ? (
        <Callout color="orange" icon="warning">
          {t('data:delete.test_runs_affected')}
        </Callout>
      ) : null}

      {conflicts.analyticsSettings > 0 ? (
        <Callout color="orange" icon="warning">
          {t('data:delete.analytics_settings_affected', { count: conflicts.analyticsSettings })}
        </Callout>
      ) : null}
    </div>
  );
}

function ScenarioLink({ item }: { item: DestroyDataModelReportRef }) {
  const { t } = useTranslation(dataI18n);

  // Don't render link if id is missing
  if (!item.id) {
    return null;
  }

  // Convert UUID to short UUID for URL-friendly format
  const shortId = fromUUIDtoSUUID(item.id);

  return (
    <Link
      to="/detection/scenarios/$scenarioId"
      params={{ scenarioId: shortId }}
      className="text-purple-primary text-s flex items-center gap-1 hover:underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      {t('data:delete.view')}
      <Icon icon="openinnew" className="size-4" />
    </Link>
  );
}
