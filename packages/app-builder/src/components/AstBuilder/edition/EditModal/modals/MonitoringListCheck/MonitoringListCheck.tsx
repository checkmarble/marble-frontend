import { AstBuilderDataSharpFactory } from '@app-builder/components/AstBuilder/Provider';
import { Callout } from '@app-builder/components/Callout';
import { type DataModel } from '@app-builder/models';
import {
  isUpDirectionCheck,
  type LinkedObjectCheck,
  type LinkedTableCheck,
  type MonitoringListCheckAstNode,
  NewMonitoringListCheckAstNode,
  type ObjectPathSegment,
  toMonitoringListCheckConfig,
} from '@app-builder/models/astNode/monitoring-list-check';
import { categoriesToTopics, type ScreeningCategory, topicsToCategories } from '@app-builder/models/screening';
import { useCallbackRef } from '@marble/shared';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ButtonV2, Modal } from 'ui-design-system';

import { AstBuilderNodeSharpFactory } from '../../../node-store';
import { type OperandEditModalProps } from '../../EditModal';
import { AdvancedSetupsSection } from './AdvancedSetupsSection';
import { FilterSection } from './FilterSection';
import { ObjectSelector } from './ObjectSelector';
import { type Step, Stepper } from './Stepper';

type WizardStep = 1 | 2 | 3;

/**
 * Convert API config pathToTarget (string[]) to UI ObjectPathSegment[]
 * Requires dataModel to resolve table names from link names
 */
function pathToTargetToSegments(
  pathToTarget: string[],
  dataModel: DataModel,
  triggerTableName: string,
): ObjectPathSegment[] {
  if (pathToTarget.length === 0) return [];

  const segments: ObjectPathSegment[] = [];
  let currentTableName = triggerTableName;

  for (const linkName of pathToTarget) {
    const currentTable = dataModel.find((t) => t.name === currentTableName);
    if (!currentTable) break;

    const link = currentTable.linksToSingle.find((l) => l.name === linkName);
    if (!link) break;

    segments.push({ linkName, tableName: link.parentTableName });
    currentTableName = link.parentTableName;
  }

  return segments;
}

/**
 * Convert API LinkedTableCheck[] to UI LinkedObjectCheck[]
 */
function linkedTableChecksToObjectChecks(linkedTableChecks: LinkedTableCheck[]): LinkedObjectCheck[] {
  return linkedTableChecks.map((check) => {
    if (isUpDirectionCheck(check)) {
      return {
        tableName: check.tableName,
        fieldPath: [{ linkName: check.linkToSingleName, tableName: check.tableName }],
        direction: 'up' as const,
        enabled: true,
        validated: true,
      };
    } else {
      return {
        tableName: check.tableName,
        fieldPath: [],
        direction: 'down' as const,
        enabled: true,
        validated: true,
        navigationOptionRef: check.navigationOption,
      };
    }
  });
}

export const EditMonitoringListCheck = (props: Omit<OperandEditModalProps, 'node'>) => {
  const { t } = useTranslation(['common', 'scenarios']);
  const dataModel = AstBuilderDataSharpFactory.select((s) => s.data.dataModel);
  const screeningConfigs = AstBuilderDataSharpFactory.select((s) => s.data.screeningConfigs) ?? [];
  const triggerObjectTable = AstBuilderDataSharpFactory.useSharp().computed.triggerObjectTable.value;
  const nodeSharp = AstBuilderNodeSharpFactory.useSharp();
  const node = nodeSharp.select((s) => s.node as MonitoringListCheckAstNode);

  const [currentStep, setCurrentStep] = useState<WizardStep>(1);

  // Extract UI state from config
  const config = node.namedChildren.config.constant;

  // UI state - initialized from config
  const [targetTableName, setTargetTableName] = useState(config.targetTableName);
  const [pathToTarget, setPathToTarget] = useState<ObjectPathSegment[]>(() =>
    pathToTargetToSegments(config.pathToTarget, dataModel, triggerObjectTable.name),
  );
  // UI uses topic categories, API uses individual topic strings - convert on load
  const [selectedTopics, setSelectedTopics] = useState<ScreeningCategory[]>(() =>
    topicsToCategories(config.topicFilters),
  );
  const [linkedObjectChecks, setLinkedObjectChecks] = useState<LinkedObjectCheck[]>(() =>
    linkedTableChecksToObjectChecks(config.linkedTableChecks),
  );

  // Get the selected table model
  const selectedTable = useMemo(() => {
    return dataModel.find((t) => t.name === targetTableName);
  }, [dataModel, targetTableName]);

  // Determine if we need step 3 (advanced setups)
  // Step 3 is shown when the selected object has related tables also under monitoring
  const hasLinkedObjectsUnderMonitoring = useMemo(() => {
    if (!selectedTable) return false;

    const monitoredTables = new Set(screeningConfigs.flatMap((config) => config.objectTypes));

    // Check "up" direction: parent tables (via linksToSingle)
    const hasParentUnderMonitoring = selectedTable.linksToSingle.some((link) =>
      monitoredTables.has(link.parentTableName),
    );

    // Check "down" direction: child tables (tables that have links pointing to selectedTable)
    const hasChildUnderMonitoring = dataModel.some((table) => {
      if (table.name === selectedTable.name) return false;
      return table.linksToSingle.some(
        (link) => link.parentTableName === selectedTable.name && monitoredTables.has(table.name),
      );
    });

    return hasParentUnderMonitoring || hasChildUnderMonitoring;
  }, [selectedTable, dataModel, screeningConfigs]);

  const totalSteps = hasLinkedObjectsUnderMonitoring ? 3 : 2;

  const steps: Step[] = useMemo(() => {
    const baseSteps: Step[] = [
      { key: 'object', label: t('scenarios:monitoring_list_check.step_object') },
      { key: 'options', label: t('scenarios:monitoring_list_check.step_options') },
    ];

    if (hasLinkedObjectsUnderMonitoring) {
      baseSteps.push({ key: 'advanced', label: t('scenarios:monitoring_list_check.step_advanced') });
    }

    return baseSteps;
  }, [t, hasLinkedObjectsUnderMonitoring]);

  const handleObjectChange = (tableName: string, path: ObjectPathSegment[]) => {
    setTargetTableName(tableName);
    setPathToTarget(path);
    // Reset linked object checks when object changes
    setLinkedObjectChecks([]);
  };

  const handleTopicsChange = (topics: ScreeningCategory[]) => {
    setSelectedTopics(topics);
  };

  const handleLinkedObjectChecksChange = (checks: LinkedObjectCheck[]) => {
    setLinkedObjectChecks(checks);
  };

  const handleOpenChange = useCallbackRef((open: boolean) => {
    if (!open) {
      props.onCancel();
    }
  });

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((currentStep + 1) as WizardStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as WizardStep);
    }
  };

  const handleSave = () => {
    // Convert selected topics to individual topic strings for the API
    const topicFilters = categoriesToTopics(selectedTopics);

    // Convert UI state to API config format
    const newConfig = toMonitoringListCheckConfig(targetTableName, pathToTarget, topicFilters, linkedObjectChecks);

    // Create new node with updated config
    const updatedNode = NewMonitoringListCheckAstNode({
      targetTableName: newConfig.targetTableName,
      pathToTarget: newConfig.pathToTarget,
      topicFilters: newConfig.topicFilters,
      linkedTableChecks: newConfig.linkedTableChecks,
    });

    // Preserve the original node ID
    updatedNode.id = node.id;

    props.onSave(updatedNode);
  };

  const canProceedFromStep1 = !!targetTableName;
  const isLastStep = currentStep === totalSteps;

  // Step 3 validation: all enabled "down" checks must be validated
  const hasUnvalidatedDownChecks = linkedObjectChecks.some(
    (check) => check.enabled && check.direction === 'down' && !check.validated,
  );
  const canSaveFromStep3 = !hasUnvalidatedDownChecks;

  return (
    <Modal.Root open onOpenChange={handleOpenChange}>
      <Modal.Content size="medium">
        <Modal.Title>{t('scenarios:monitoring_list_check.title')}</Modal.Title>

        <div className="flex max-h-[70dvh] flex-col gap-6 overflow-auto p-4">
          {/* Stepper */}
          <Stepper steps={steps} currentStep={currentStep - 1} />

          {/* Help text - only on step 1 */}
          {currentStep === 1 && (
            <Callout variant="outlined">
              <Modal.Description className="whitespace-pre-wrap">
                {t('scenarios:monitoring_list_check.description')}
              </Modal.Description>
            </Callout>
          )}

          {/* Step 1: Object Selection */}
          {currentStep === 1 && (
            <ObjectSelector
              dataModel={dataModel}
              triggerObjectTable={triggerObjectTable}
              screeningConfigs={screeningConfigs}
              currentTableName={targetTableName}
              currentPath={pathToTarget}
              onChange={handleObjectChange}
            />
          )}

          {/* Step 2: Filter Options - topics */}
          {currentStep === 2 && <FilterSection selectedTopics={selectedTopics} onTopicsChange={handleTopicsChange} />}

          {/* Step 3: Advanced Setups (if applicable) */}
          {currentStep === 3 && selectedTable && (
            <AdvancedSetupsSection
              dataModel={dataModel}
              selectedTable={selectedTable}
              screeningConfigs={screeningConfigs}
              linkedObjectChecks={linkedObjectChecks}
              onLinkedObjectChecksChange={handleLinkedObjectChecksChange}
            />
          )}
        </div>

        <Modal.Footer>
          <div className="flex gap-v2-sm justify-end p-v2-md">
            {currentStep > 1 ? (
              <ButtonV2 variant="secondary" onClick={handleBack}>
                {t('scenarios:monitoring_list_check.back')}
              </ButtonV2>
            ) : (
              <Modal.Close asChild>
                <ButtonV2 variant="secondary">{t('common:cancel')}</ButtonV2>
              </Modal.Close>
            )}

            {isLastStep ? (
              <ButtonV2 variant="primary" disabled={currentStep === 3 && !canSaveFromStep3} onClick={handleSave}>
                {t('scenarios:monitoring_list_check.validate')}
              </ButtonV2>
            ) : (
              <ButtonV2 variant="primary" disabled={!canProceedFromStep1} onClick={handleNext}>
                {t('scenarios:monitoring_list_check.next')}
              </ButtonV2>
            )}
          </div>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
};
