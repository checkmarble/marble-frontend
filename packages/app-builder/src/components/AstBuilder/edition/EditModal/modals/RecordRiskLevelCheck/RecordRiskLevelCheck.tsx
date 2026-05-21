import { AstBuilderDataSharpFactory } from '@app-builder/components/AstBuilder/Provider';
import { Callout } from '@app-builder/components/Callout';
import { type RecordRiskLevelCheckAstNode } from '@app-builder/models/astNode/risk';
import {
  isMaxRiskLevelInRange,
  SCORING_LEVELS_COLORS,
  SCORING_LEVELS_LABEL_KEYS,
  scoringLevelEntries,
} from '@app-builder/models/scoring';
import { useTranslation } from 'react-i18next';
import { Modal, SelectOption, SelectV2 } from 'ui-design-system';
import { EditionEvaluationErrors } from '../../../EvaluationErrors';
import { AstBuilderNodeSharpFactory } from '../../../node-store';
import { OperandEditModalContainer } from '../../Container';
import { type OperandEditModalProps } from '../../EditModal';

export function EditRecordRiskLevelCheck(props: Omit<OperandEditModalProps, 'node'>) {
  const { t } = useTranslation(['scenarios', 'common', 'user-scoring']);
  const hasValidLicense = AstBuilderDataSharpFactory.select((s) => s.data.hasValidLicense);
  const nodeSharp = AstBuilderNodeSharpFactory.useSharp();
  const node = nodeSharp.select((s) => s.node as RecordRiskLevelCheckAstNode);
  const scoringSettings = AstBuilderDataSharpFactory.select((s) => s.data.scoringSettings);

  const levelColorsEntries =
    scoringSettings && isMaxRiskLevelInRange(scoringSettings.maxRiskLevel)
      ? scoringLevelEntries(SCORING_LEVELS_COLORS[scoringSettings.maxRiskLevel])
      : null;
  const levelLabelsMap =
    scoringSettings && isMaxRiskLevelInRange(scoringSettings.maxRiskLevel)
      ? SCORING_LEVELS_LABEL_KEYS[scoringSettings.maxRiskLevel]
      : null;

  const levelsOptions: SelectOption<number>[] =
    levelColorsEntries && levelLabelsMap
      ? levelColorsEntries.map(([level, color]) => {
          const label = t(levelLabelsMap[level]);
          return {
            value: level,
            label: () => (
              <div className="flex gap-v2-sm items-center">
                <div className="size-4 rounded-full shrink-0" style={{ backgroundColor: color }} />
                {label}
              </div>
            ),
          };
        })
      : [];

  return (
    <OperandEditModalContainer
      {...props}
      saveDisabled={!hasValidLicense}
      title={t('scenarios:edit_record_risk_level_check.title')}
      size="medium"
    >
      <Callout variant="outlined">
        <Modal.Description className="whitespace-pre-wrap">
          {t('scenarios:edit_record_risk_level_check.description')}
        </Modal.Description>
      </Callout>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="first-letter:uppercase">{t('scenarios:edit_record_risk_level_check.match')}</span>
          <SelectV2<number>
            multiple
            options={levelsOptions}
            value={node.children[0].constant}
            placeholder={t('scenarios:edit_record_risk_level_check.placeholder')}
            onChange={(value) => {
              node.children[0].constant = value;
            }}
          />
        </div>
        <EditionEvaluationErrors id={node.id} filterOut={['FUNCTION_ERROR']} />
      </div>
    </OperandEditModalContainer>
  );
}
