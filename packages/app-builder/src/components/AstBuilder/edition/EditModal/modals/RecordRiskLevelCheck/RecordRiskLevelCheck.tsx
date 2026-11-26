import { AstBuilderDataSharpFactory } from '@app-builder/components/AstBuilder/Provider';
import { Callout } from '@app-builder/components/Callout';
import { type RecordRiskLevelCheckAstNode } from '@app-builder/models/astNode/risk';
import {
  getScoringLevelLabel,
  isMaxRiskLevelInRange,
  SCORING_LEVELS_COLORS,
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

  const maxRiskLevel =
    scoringSettings && isMaxRiskLevelInRange(scoringSettings.maxRiskLevel) ? scoringSettings.maxRiskLevel : null;
  const levelColorsEntries = maxRiskLevel ? scoringLevelEntries(SCORING_LEVELS_COLORS[maxRiskLevel]) : null;

  const levelsOptions: SelectOption<number>[] =
    levelColorsEntries && maxRiskLevel
      ? levelColorsEntries.map(([level, color]) => {
          const label = getScoringLevelLabel(t, maxRiskLevel, level);
          return {
            value: level,
            label: () => (
              <div className="flex gap-sm items-center">
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
      <div className="flex flex-col gap-sm">
        <div className="flex items-center gap-sm">
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
