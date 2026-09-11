import { EnumTag } from '@app-builder/components/Data/EnumTag';
import type { DataModelField } from '@app-builder/models';
import type { ValueSwitchDimension } from '@app-builder/models/astNode/value-switch';
import { isEnumField } from '@app-builder/models/enum-values';
import { isMaxRiskLevelInRange, SCORING_LEVELS_COLORS, SCORING_LEVELS_LABEL_KEYS } from '@app-builder/models/scoring';
import { useTranslation } from 'react-i18next';
import { cn, Tag } from 'ui-design-system';
import { AstBuilderDataSharpFactory } from './Provider';

export function ValueSwitchValueTag({
  dimension,
  value,
  field,
  className,
}: {
  dimension: ValueSwitchDimension;
  value: string | number;
  field?: DataModelField;
  className?: string;
}) {
  const { t } = useTranslation(['user-scoring']);
  const data = AstBuilderDataSharpFactory.select((state) => state.data);
  const scoringSettings = data.scoringSettings;
  if (field && isEnumField(field)) {
    return <EnumTag field={field} value={value} className={className} />;
  }

  if (
    dimension.type === 'risk-level' &&
    typeof value === 'number' &&
    scoringSettings &&
    isMaxRiskLevelInRange(scoringSettings.maxRiskLevel)
  ) {
    const color = SCORING_LEVELS_COLORS[scoringSettings.maxRiskLevel][value];
    const labelKey = SCORING_LEVELS_LABEL_KEYS[scoringSettings.maxRiskLevel][value];
    const label = labelKey ? t(labelKey) : String(value);
    return (
      <Tag
        className={cn('flex min-w-0 overflow-hidden rounded-sm', className)}
        style={{ borderColor: color, color }}
        title={label}
      >
        <span className="min-w-0 truncate">{label}</span>
      </Tag>
    );
  }

  const label = String(value) || '—';
  return (
    <Tag className={cn('flex min-w-0 overflow-hidden rounded-sm', className)} title={label}>
      <span className="min-w-0 truncate">{label}</span>
    </Tag>
  );
}
