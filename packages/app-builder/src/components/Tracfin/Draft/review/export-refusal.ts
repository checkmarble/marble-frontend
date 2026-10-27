/**
 * The 422 of an export: the draft holds text that XML 1.0 cannot carry (or twice the same attribute),
 * so no file is written. Backend `Export` wraps `XMLFieldError` (`usecases/tracfin/xml.go`):
 *
 *   XML export <field id> block <block id> value <value id>: <reason>: unprocessable entity
 *
 * where `<reason>` is `Forbidden XML character U+XXXX`, `Invalid UTF-8` or
 * `Duplicate XML attribute on one occurrence`, and `<value id>` is empty for a value without an id.
 * The trailing `: unprocessable entity` comes from the wrapped sentinel error and is tolerated, as is
 * any other wrapping around the message.
 */
export type ExportRefusalReason = 'forbidden_character' | 'invalid_utf8' | 'duplicate_attribute' | 'other';

export type ExportRefusal = {
  fieldId: string;
  blockId: string;
  valueId: string | null;
  reason: ExportRefusalReason;
  /** `U+0000` for a forbidden character. */
  codePoint: string | null;
  /** What the server said about the value, without the wrapper. */
  detail: string;
};

const REFUSAL = /XML export (\S*) block (\S*) value (\S*): (.*)$/s;
const CODE_POINT = /Forbidden XML character (U\+[0-9A-Fa-f]{4,6})/;

export function parseExportRefusal(message: string | null | undefined): ExportRefusal | null {
  if (!message) return null;
  const match = REFUSAL.exec(message);
  if (!match) return null;
  const [, fieldId = '', blockId = '', valueId = '', rest = ''] = match;
  if (fieldId === '' || blockId === '') return null;
  const detail = rest.replace(/:\s*unprocessable entity\s*$/i, '').trim();
  const codePoint = CODE_POINT.exec(detail)?.[1]?.toUpperCase() ?? null;
  const reason: ExportRefusalReason = codePoint
    ? 'forbidden_character'
    : /^Invalid UTF-8/i.test(detail)
      ? 'invalid_utf8'
      : /^Duplicate XML attribute/i.test(detail)
        ? 'duplicate_attribute'
        : 'other';
  return { fieldId, blockId, valueId: valueId === '' ? null : valueId, reason, codePoint, detail };
}
