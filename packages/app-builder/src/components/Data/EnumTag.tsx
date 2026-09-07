import type { EnumValue } from '@app-builder/models/data-model';
import { type EnumField, resolveEnumDisplay } from '@app-builder/models/enum-values';
import { useFormatLanguage } from '@app-builder/utils/format';
import { Tag } from 'ui-design-system';

export function EnumTag({ field, value }: { field: EnumField; value: EnumValue }) {
  const language = useFormatLanguage();
  const display = resolveEnumDisplay(field, value, language);
  return (
    <Tag
      color={display.neutral ? 'grey' : 'purple'}
      style={display.color ? { color: display.color, borderColor: display.color } : undefined}
      title={String(value)}
    >
      {display.flag ? <span>{display.flag}</span> : null}
      {display.label || '—'}
    </Tag>
  );
}
