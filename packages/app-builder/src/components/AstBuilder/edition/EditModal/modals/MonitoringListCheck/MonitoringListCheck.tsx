import { AstBuilderDataSharpFactory } from '@app-builder/components/AstBuilder/Provider';
import { Callout } from '@app-builder/components/Callout';
import {
  type LinkedObjectCheck,
  type MonitoringListCheckAstNode,
} from '@app-builder/models/astNode/monitoring-list-check';
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

export function EditMonitoringListCheck(props: Omit<OperandEditModalProps, 'node'>) {
  const { t } = useTranslation(['common', 'scenarios']);
  const dataModel = AstBuilderDataSharpFactory.select((s) => s.data.dataModel);
  const screeningConfigs = AstBuilderDataSharpFactory.select((s) => s.data.screeningConfigs) ?? [];
  const triggerObjectTable = AstBuilderDataSharpFactory.useSharp().computed.triggerObjectTable.value;
  const nodeSharp = AstBuilderNodeSharpFactory.useSharp();
  const node = nodeSharp.select((s) => s.node as MonitoringListCheckAstNode);

  const [currentStep, setCurrentStep] = useState<WizardStep>(1);

  const currentTableName = node.namedChildren.objectTableName.constant;
  const currentPath = node.namedChildren.objectPath.constant;

  // Get the selected table model
  const selectedTable = useMemo(() => {
    return dataModel.find((t) => t.name === currentTableName);
  }, [dataModel, currentTableName]);

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

  const handleObjectChange = (
    tableName: string,
    path: MonitoringListCheckAstNode['namedChildren']['objectPath']['constant'],
  ) => {
    nodeSharp.update(() => {
      node.namedChildren.objectTableName.constant = tableName;
      node.namedChildren.objectPath.constant = path;
    });
    nodeSharp.actions.validate();
  };

  const handleTopicsChange = (topics: MonitoringListCheckAstNode['namedChildren']['topics']['constant']) => {
    nodeSharp.update(() => {
      node.namedChildren.topics.constant = topics;
    });
    nodeSharp.actions.validate();
  };

  const handleLinkedObjectChecksChange = (checks: LinkedObjectCheck[]) => {
    nodeSharp.update(() => {
      node.namedChildren.linkedObjectChecks.constant = checks;
    });
    nodeSharp.actions.validate();
  };

  const handleOpenChange = useCallbackRef((open: boolean) => {
    if (!open) {
      props.onCancel();
    }
  });

  const handleImplicitClose = useCallbackRef((event: Event) => {
    event.preventDefault();
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
    props.onSave(node);
  };

  const canProceedFromStep1 = !!currentTableName;
  const isLastStep = currentStep === totalSteps;

  // Step 3 validation: all enabled "down" checks must be validated
  const linkedObjectChecks = node.namedChildren.linkedObjectChecks.constant;
  const hasUnvalidatedDownChecks = linkedObjectChecks.some(
    (check) => check.enabled && check.direction === 'down' && !check.validated,
  );
  const canSaveFromStep3 = !hasUnvalidatedDownChecks;

  return (
    <Modal.Root open onOpenChange={handleOpenChange}>
      <Modal.Content size="medium" onInteractOutside={handleImplicitClose} onEscapeKeyDown={handleImplicitClose}>
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
              currentTableName={currentTableName}
              currentPath={currentPath}
              onChange={handleObjectChange}
            />
          )}

          {/* Step 2: Filter Options */}
          {currentStep === 2 && (
            <FilterSection currentTopics={node.namedChildren.topics.constant} onTopicsChange={handleTopicsChange} />
          )}

          {/* Step 3: Advanced Setups (if applicable) */}
          {currentStep === 3 && selectedTable && (
            <AdvancedSetupsSection
              dataModel={dataModel}
              selectedTable={selectedTable}
              screeningConfigs={screeningConfigs}
              linkedObjectChecks={node.namedChildren.linkedObjectChecks.constant}
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
}
