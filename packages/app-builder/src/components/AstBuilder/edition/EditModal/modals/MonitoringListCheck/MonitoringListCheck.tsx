import { AstBuilderDataSharpFactory } from '@app-builder/components/AstBuilder/Provider';
import { Callout } from '@app-builder/components/Callout';
import {
  fromLinkedTableChecks,
  fromPathToTarget,
  type LinkedObjectCheck,
  type MonitoringListCheckAstNode,
  NewMonitoringListCheckAstNode,
  type ObjectPathSegment,
  toMonitoringListCheckConfig,
} from '@app-builder/models/astNode/monitoring-list-check';
import { type ScreeningCategory, topicsToCategories } from '@app-builder/models/screening';
import { useCreateNavigationOptionMutationV2 } from '@app-builder/queries/data/create-navigation-option';
import { useCallbackRef } from '@marble/shared';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ButtonV2, Modal, Stepper, type StepperStep } from 'ui-design-system';

import { AstBuilderNodeSharpFactory } from '../../../node-store';
import { type OperandEditModalProps } from '../../EditModal';
import { AdvancedSetupsSection, type PendingNavigationOption } from './AdvancedSetupsSection';
import { FilterSection } from './FilterSection';
import { ObjectSelector } from './ObjectSelector';

type WizardStep = 1 | 2 | 3;

export const EditMonitoringListCheck = (props: Omit<OperandEditModalProps, 'node'>) => {
  const { t } = useTranslation(['common', 'scenarios']);
  const scenarioId = AstBuilderDataSharpFactory.select((s) => s.scenarioId);
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
    fromPathToTarget(config.pathToTarget, dataModel, triggerObjectTable.name),
  );
  // UI uses topic categories, API uses individual topic strings - convert on load
  const [selectedTopics, setSelectedTopics] = useState<ScreeningCategory[]>(() =>
    topicsToCategories(config.topicFilters),
  );
  const [linkedObjectChecks, setLinkedObjectChecks] = useState<LinkedObjectCheck[]>(() =>
    fromLinkedTableChecks(config.linkedTableChecks),
  );
  // Track navigation options to create at save time
  const [pendingNavigationOptions, setPendingNavigationOptions] = useState<PendingNavigationOption[]>([]);

  const selectedTable = dataModel.find((t) => t.name === targetTableName);
  const createNavigationOptionMutation = useCreateNavigationOptionMutationV2();

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

  const steps: StepperStep[] = [
    { key: 'object', label: t('scenarios:monitoring_list_check.step_object') },
    { key: 'options', label: t('scenarios:monitoring_list_check.step_options') },
    ...(hasLinkedObjectsUnderMonitoring
      ? [{ key: 'advanced', label: t('scenarios:monitoring_list_check.step_advanced') }]
      : []),
  ];

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

  const handlePendingNavigationOptionAdd = (pending: PendingNavigationOption) => {
    // Replace if same tableName, otherwise add
    setPendingNavigationOptions((prev) => {
      const existing = prev.findIndex((p) => p.tableName === pending.tableName);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = pending;
        return updated;
      }
      return [...prev, pending];
    });
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

  const handleSave = async () => {
    // First, create any pending navigation options
    // The mutation's onSuccess will invalidate builder-options query to refresh dataModel
    for (const pending of pendingNavigationOptions) {
      await createNavigationOptionMutation.mutateAsync({
        scenarioId,
        tableId: pending.tableId,
        sourceFieldId: pending.sourceFieldId,
        targetTableId: pending.targetTableId,
        filterFieldId: pending.filterFieldId,
        orderingFieldId: pending.orderingFieldId,
      });
    }

    // Convert UI state to API config format
    // topicFilters uses category values directly: ['sanctions', 'peps', 'third-parties', 'adverse-media']
    const newConfig = toMonitoringListCheckConfig(targetTableName, pathToTarget, selectedTopics, linkedObjectChecks);

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
              onPendingNavigationOptionAdd={handlePendingNavigationOptionAdd}
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
              <ButtonV2
                variant="primary"
                disabled={createNavigationOptionMutation.isPending || (currentStep === 3 && !canSaveFromStep3)}
                onClick={handleSave}
              >
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
