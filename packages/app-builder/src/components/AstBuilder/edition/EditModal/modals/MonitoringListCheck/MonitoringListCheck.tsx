import { AstBuilderDataSharpFactory } from '@app-builder/components/AstBuilder/Provider';
import { Callout } from '@app-builder/components/Callout';
import { type MonitoringListCheckAstNode } from '@app-builder/models/astNode/monitoring-list-check';
import { useTranslation } from 'react-i18next';
import { Modal } from 'ui-design-system';

import { AstBuilderNodeSharpFactory } from '../../../node-store';
import { OperandEditModalContainer } from '../../Container';
import { type OperandEditModalProps } from '../../EditModal';
import { FilterSection } from './FilterSection';
import { ObjectSelector } from './ObjectSelector';

export function EditMonitoringListCheck(props: Omit<OperandEditModalProps, 'node'>) {
  const { t } = useTranslation(['scenarios']);
  const dataModel = AstBuilderDataSharpFactory.select((s) => s.data.dataModel);
  const screeningConfigs = AstBuilderDataSharpFactory.select((s) => s.data.screeningConfigs) ?? [];
  const triggerObjectTable = AstBuilderDataSharpFactory.useSharp().computed.triggerObjectTable.value;
  const nodeSharp = AstBuilderNodeSharpFactory.useSharp();
  const node = nodeSharp.select((s) => s.node as MonitoringListCheckAstNode);

  const currentTableName = node.namedChildren.objectTableName.constant;
  const currentPath = node.namedChildren.objectPath.constant;

  const handleObjectChange = (tableName: string, path: string[]) => {
    nodeSharp.update(() => {
      node.namedChildren.objectTableName.constant = tableName;
      node.namedChildren.objectPath.constant = path;
    });
    nodeSharp.actions.validate();
  };

  const handleScreeningConfigChange = (configId: string | null) => {
    nodeSharp.update(() => {
      node.namedChildren.screeningConfigId.constant = configId;
      if (configId) {
        node.namedChildren.hitTypes.constant = [];
      }
    });
    nodeSharp.actions.validate();
  };

  const handleHitTypesChange = (hitTypes: MonitoringListCheckAstNode['namedChildren']['hitTypes']['constant']) => {
    nodeSharp.update(() => {
      node.namedChildren.hitTypes.constant = hitTypes;
      if (hitTypes.length > 0) {
        node.namedChildren.screeningConfigId.constant = null;
      }
    });
    nodeSharp.actions.validate();
  };

  return (
    <OperandEditModalContainer
      {...props}
      title={t('scenarios:monitoring_list_check.title')}
      size="large"
      className="max-h-[70dvh] gap-6 overflow-auto"
    >
      <Callout variant="outlined">
        <Modal.Description className="whitespace-pre-wrap">
          {t('scenarios:monitoring_list_check.description')}
        </Modal.Description>
      </Callout>

      <ObjectSelector
        dataModel={dataModel}
        triggerObjectTable={triggerObjectTable}
        currentTableName={currentTableName}
        currentPath={currentPath}
        onChange={handleObjectChange}
      />

      <FilterSection
        screeningConfigs={screeningConfigs}
        currentScreeningConfigId={node.namedChildren.screeningConfigId.constant}
        currentHitTypes={node.namedChildren.hitTypes.constant}
        onScreeningConfigChange={handleScreeningConfigChange}
        onHitTypesChange={handleHitTypesChange}
      />
    </OperandEditModalContainer>
  );
}
