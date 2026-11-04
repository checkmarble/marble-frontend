import { useTranslation } from 'react-i18next';
import { isKnownPrefillDiagnosticCode } from '../prefill/diagnostic-codes';
import { isReviewDiagnosticCode } from './diagnostic-model';

/**
 * The i18n key of the French text of a diagnostic, or `null` for a code no text exists for.
 * A few codes exist in two layers with two meanings (`UNKNOWN_CODE` of the prefill is a client value
 * with no TRACFIN match; the validation's is a code absent from the catalogue): the layer decides, and
 * the `sources` layer is the prefill's.
 */
export function diagnosticTextKey(diagnostic: { code: string; layer: string }): string | null {
  const prefill = isKnownPrefillDiagnosticCode(diagnostic.code) ? `draft.prefill.diagnostics.${diagnostic.code}` : null;
  const review = isReviewDiagnosticCode(diagnostic.code) ? `draft.review.diagnostics.${diagnostic.code}` : null;
  return diagnostic.layer === 'sources' ? (prefill ?? review) : (review ?? prefill);
}

/** The French text of a diagnostic; without a text for its code, the server's own message (never an empty line). */
export function useReviewDiagnosticText() {
  const { t } = useTranslation(['tracfin']);
  return (diagnostic: { code: string; layer: string; message: string }): string => {
    const key = diagnosticTextKey(diagnostic);
    if (key) return t(`tracfin:${key}`);
    return diagnostic.message.trim() !== ''
      ? diagnostic.message
      : t('tracfin:draft.prefill.diagnostics.UNKNOWN_DIAGNOSTIC', { code: diagnostic.code });
  };
}
