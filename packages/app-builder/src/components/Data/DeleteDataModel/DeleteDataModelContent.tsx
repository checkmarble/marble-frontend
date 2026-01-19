import { Callout } from '@app-builder/components/Callout';
import {
  type DestroyDataModelReport,
  type DestroyDataModelReportRef,
  hasBlockingConflicts,
} from '@app-builder/models/data-model';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { type TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { dataI18n } from '../data-i18n';

export type DeleteDataModelEntityType = 'table' | 'field' | 'link' | 'pivot';

interface DeleteDataModelContentProps {
  report: DestroyDataModelReport | null;
  entityType: DeleteDataModelEntityType;
  entityName: string;
  onConfirm?: () => void;
  onClose: () => void;
  isPending?: boolean;
}

export function DeleteDataModelContent({
  report,
  entityType,
  entityName,
  onConfirm,
  onClose,
  isPending,
}: DeleteDataModelContentProps) {
  const { t } = useTranslation(dataI18n);

  if (!report) {
    return null;
  }

  const isBlocked = hasBlockingConflicts(report);
  const hasArchivedIterations = report.archivedIterations.length > 0;

  return (
    <>
      <Modal.Title>{t(`data:delete_${entityType}.title`, { name: entityName })}</Modal.Title>
      <div className="flex flex-col gap-4 p-6">
        {isBlocked ? (
          <BlockedDeletionContent report={report} entityType={entityType} entityName={entityName} t={t} />
        ) : hasArchivedIterations ? (
          <DraftDeletionContent report={report} entityType={entityType} entityName={entityName} t={t} />
        ) : (
          <SimpleDeletionContent entityType={entityType} entityName={entityName} t={t} />
        )}

        <div className="flex justify-end gap-2">
          <Modal.Close asChild>
            <Button variant="secondary" onClick={onClose}>
              {t('common:cancel')}
            </Button>
          </Modal.Close>
          {isBlocked ? (
            <Button variant="primary" onClick={onClose}>
              {t('data:delete.understood')}
            </Button>
          ) : (
            <Button color="red" variant="primary" onClick={onConfirm} disabled={isPending}>
              <Icon icon="delete" className="size-5" />
              {t('common:delete')}
            </Button>
          )}
        </div>
      </div>
    </>
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
            {draftScenarioIterations.map(([scenarioId, iteration]) => {
              const shortId = fromUUIDtoSUUID(scenarioId);
              return (
                <li key={scenarioId} className="flex items-center gap-2">
                  <span>{iteration.name}</span>
                  <a
                    href={getRoute('/scenarios/:scenarioId', { scenarioId: shortId })}
                    className="text-purple-primary text-s flex items-center gap-1 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t('data:delete.view')}
                    <Icon icon="openinnew" className="size-4" />
                  </a>
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
            {activeScenarioIterations.map(([scenarioId, iteration]) => {
              const shortId = fromUUIDtoSUUID(scenarioId);
              return (
                <li key={scenarioId} className="flex items-center gap-2">
                  <span>{iteration.name}</span>
                  <a
                    href={getRoute('/scenarios/:scenarioId', { scenarioId: shortId })}
                    className="text-purple-primary text-s flex items-center gap-1 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t('data:delete.view')}
                    <Icon icon="openinnew" className="size-4" />
                  </a>
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
    <a
      href={getRoute('/scenarios/:scenarioId', { scenarioId: shortId })}
      className="text-purple-primary text-s flex items-center gap-1 hover:underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      {t('data:delete.view')}
      <Icon icon="openinnew" className="size-4" />
    </a>
  );
}
