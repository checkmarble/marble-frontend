import { type AggregationAstNode, isAggregation } from '@app-builder/models/astNode/aggregation';
import { isPayload, type PayloadAstNode } from '@app-builder/models/astNode/data-accessor';
import { getDataTypeIcon } from '@app-builder/models/data-model';
import {
  type AllowedScoringRuleSourceType,
  isAllowedScoringRuleType,
  isMaxRiskLevelInRange,
  SCORING_LEVELS_COLORS,
  type ScoreImpact,
  scoringLevelEntries,
} from '@app-builder/models/scoring';
import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { cn, type SelectOption, SelectV2, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';

export type FieldPillProps = {
  field: PayloadAstNode | AggregationAstNode;
  fieldType: AllowedScoringRuleSourceType | 'Undefined' | null;
};

export function FieldPill({ field, fieldType }: FieldPillProps) {
  const typeIcon = isAllowedScoringRuleType(fieldType) ? getDataTypeIcon(fieldType) : null;

  return (
    <Tag color="grey" className="gap-sm">
      {getFieldLabel(field)}
      {typeIcon ? <Icon icon={typeIcon} className="size-4" /> : null}
    </Tag>
  );
}

export function getFieldLabel(field: PayloadAstNode | AggregationAstNode): string {
  if (isPayload(field)) return field.children[0].constant;
  if (isAggregation(field)) return field.namedChildren['fieldName'].constant as string;
  return '…';
}

interface SwitchCaseRowProps {
  impact: ScoreImpact;
  children: ReactNode;
  maxRiskLevel: number;
  matched?: boolean;
}

export function SwitchCaseRow({ impact, children, maxRiskLevel, matched = false }: SwitchCaseRowProps) {
  const { t } = useTranslation(['user-scoring']);

  const colors = isMaxRiskLevelInRange(maxRiskLevel) ? SCORING_LEVELS_COLORS[maxRiskLevel] : {};

  return (
    <li className={cn('flex items-center gap-sm', matched && 'text-grey-primary font-medium')}>
      <div className={cn('ms-md list-item list-disc whitespace-nowrap', matched && 'marker:text-purple-primary')}>
        <div
          className={cn('flex items-center gap-sm', matched && 'rounded-sm bg-purple-background-light px-xs py-0.5')}
        >
          <span className="inline-flex items-center gap-sm">
            {children} {t('user-scoring:switch.then')}
          </span>
          <Tag color="grey">
            score {impact.modifier > 0 ? '+' : ''}
            {impact.modifier}
          </Tag>
          {impact.floor !== undefined ? (
            <>
              <span>{t('user-scoring:switch.and')}</span>
              <Tag color="grey" className="gap-xs">
                <span>{t('user-scoring:switch.floor_label')}</span>
                <div className="rounded-full size-3" style={{ backgroundColor: colors[impact.floor] }} />
              </Tag>
            </>
          ) : null}
        </div>
      </div>
    </li>
  );
}

export function FieldPlaceholder() {
  return (
    <div className="flex h-10 flex-1 items-center gap-sm rounded border border-grey-border bg-white px-xs">
      <div className="flex size-6 items-center justify-center rounded-xs bg-grey-light">
        <Icon icon="field" className="size-4" />
      </div>
      <span className="flex-1 text-s text-grey-placeholder">—</span>
      <Icon icon="caret-down" className="size-5 text-grey-placeholder" />
    </div>
  );
}

interface RiskLevelSelectProps {
  floor: number | undefined;
  maxRiskLevel: number;
  onChange: (floor: number | undefined) => void;
}

export function RiskLevelSelect({ floor, maxRiskLevel, onChange }: RiskLevelSelectProps) {
  const { t } = useTranslation(['user-scoring']);

  const levelEntries = isMaxRiskLevelInRange(maxRiskLevel)
    ? scoringLevelEntries(SCORING_LEVELS_COLORS[maxRiskLevel])
    : [];
  const options: SelectOption<number | null>[] = [
    { label: t('user-scoring:switch.add_floor'), value: null },
    ...levelEntries.map(([level, color]) => ({
      label: (
        <span className="flex gap-xs items-center">
          <span>{t('user-scoring:switch.floor_label')} </span>
          <div className="size-4 rounded-full shrink-0" style={{ backgroundColor: color }}></div>
        </span>
      ),
      value: level,
    })),
  ];

  return (
    <SelectV2
      value={floor ?? null}
      placeholder={t('user-scoring:switch.add_floor')}
      options={options}
      onChange={(v) => onChange(v ?? undefined)}
      className="w-30"
    />
  );
}
