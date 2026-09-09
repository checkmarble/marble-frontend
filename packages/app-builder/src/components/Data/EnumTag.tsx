import type { EnumValue } from '@app-builder/models/data-model';
import { type EnumField, resolveEnumDisplay } from '@app-builder/models/enum-values';
import { useFormatLanguage } from '@app-builder/utils/format';
import { cn, Tag } from 'ui-design-system';
import { StringCountryComponent } from './DataVisualisation/DataField';

function isCountryEnumField(field: EnumField) {
  return field.semanticSubType === 'country' || field.semanticType === 'country';
}

export function EnumTag({ field, value, className }: { field: EnumField; value: EnumValue; className?: string }) {
  const language = useFormatLanguage();
  const display = resolveEnumDisplay(field, value, language);

  if (isCountryEnumField(field)) {
    return (
      <div className={cn('min-w-0', className)}>
        <StringCountryComponent value={String(value)} />
      </div>
    );
  }

  return (
    <Tag
      color={display.neutral ? 'grey' : 'purple'}
      style={display.color ? { color: display.color, borderColor: display.color } : undefined}
      title={String(value)}
      className={cn('min-w-0 overflow-hidden', className)}
    >
      {display.flag ? <span className="shrink-0">{display.flag}</span> : null}
      <span className="min-w-0 truncate">{display.label || '—'}</span>
    </Tag>
  );
}
