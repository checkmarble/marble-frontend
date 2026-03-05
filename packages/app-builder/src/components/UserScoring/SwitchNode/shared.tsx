import { type AggregationAstNode, isAggregation } from '@app-builder/models/astNode/aggregation';
import { isPayload, type PayloadAstNode } from '@app-builder/models/astNode/data-accessor';
import { getDataTypeIcon } from '@app-builder/models/data-model';
import {
  type AllowedScoringRuleSourceType,
  isAllowedScoringRuleType,
  SCORING_LEVELS_COLORS,
  type ScoreImpact,
} from '@app-builder/models/scoring';
import { type ReactNode } from 'react';
import { type SelectOption, SelectV2, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';

export type FieldPillProps = {
  field: PayloadAstNode | AggregationAstNode;
  fieldType: AllowedScoringRuleSourceType | 'Undefined' | null;
};

export function FieldPill({ field, fieldType }: FieldPillProps) {
  const typeIcon = isAllowedScoringRuleType(fieldType) ? getDataTypeIcon(fieldType) : null;

  return (
    <div className="flex h-6 shrink-0 items-center gap-1 rounded-full border border-grey-border bg-white px-2">
      <span className="whitespace-nowrap text-xs text-grey-placeholder flex items-center gap-v2-xs">
        {getFieldLabel(field)}
        {typeIcon ? <Icon icon={typeIcon} className="size-4" /> : null}
      </span>
    </div>
  );
}

export function getFieldLabel(field: PayloadAstNode | AggregationAstNode): string {
  if (isPayload(field)) return field.children[0].constant;
  if (isAggregation(field)) return field.namedChildren['fieldName'].constant as string;
  return '…';
}

export function SwitchCaseRow({
  impact,
  children,
  maxRiskLevel,
}: {
  impact: ScoreImpact;
  children: ReactNode;
  maxRiskLevel: number;
}) {
  const colors = SCORING_LEVELS_COLORS[maxRiskLevel as keyof typeof SCORING_LEVELS_COLORS];

  return (
    <li className="flex items-center gap-v2-sm">
      <div className="ml-v2-md list-item list-disc whitespace-nowrap">
        <div className="flex items-center gap-v2-sm">
          <span>{children}:</span>
          <Tag color="grey">score +{impact.modifier}</Tag>
          {impact.floor !== undefined ? (
            <>
              <span>and</span>
              <Tag color="grey" className="gap-v2-xs">
                <span>seuil =</span>
                <div className="rounded-full size-3" style={{ backgroundColor: colors?.[impact.floor] }} />
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
    <div className="flex h-10 flex-1 items-center gap-2 rounded border border-grey-border bg-white px-2">
      <div className="flex size-6 items-center justify-center rounded-xs bg-grey-light">
        <Icon icon="field" className="size-4" />
      </div>
      <span className="flex-1 text-s text-grey-placeholder">—</span>
      <Icon icon="caret-down" className="size-5 text-grey-placeholder" />
    </div>
  );
}

export function RiskLevelSelect({
  floor,
  maxRiskLevel,
  onChange,
}: {
  floor: number | undefined;
  maxRiskLevel: number;
  onChange: (floor: number | undefined) => void;
}) {
  const levels = SCORING_LEVELS_COLORS[maxRiskLevel as keyof typeof SCORING_LEVELS_COLORS] ?? [];
  const options: SelectOption<number | null>[] = [
    { label: '+ seuil', value: null },
    ...levels.map((color, i) => ({
      label: (
        <span className="flex gap-v2-xs items-center">
          <span>Seuil = </span>
          <div className="size-4 rounded-full shrink-0" style={{ backgroundColor: color }}></div>
        </span>
      ),
      value: i,
    })),
  ];

  return (
    <SelectV2
      value={floor ?? null}
      placeholder="+ seuil"
      options={options}
      onChange={(v) => onChange(v ?? undefined)}
      className="w-30"
    />
  );
}
