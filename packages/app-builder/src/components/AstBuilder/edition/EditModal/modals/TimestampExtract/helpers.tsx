import { type CurrentUser, isAdmin } from '@app-builder/models';
import { type ValidTimestampExtractParts } from '@app-builder/models/astNode/time';
import { getRoute } from '@app-builder/utils/routes';
import { Link } from '@remix-run/react';
import { type TFunction } from 'i18next';
import { Trans } from 'react-i18next';
import { assertNever } from 'typescript-utils';

export function getNoTimezoneSetupWarning(currentUser: CurrentUser, t: TFunction<['scenarios']>): React.ReactNode {
  return isAdmin(currentUser) ? (
    <span className="text-red-47">
      <Trans
        t={t}
        i18nKey="scenarios:edit_timestamp_extract.missing_default_timezone_admin"
        components={{
          SettingsLink: (
            <Link
              className="text-m hover:text-purple-60 focus:text-purple-60 text-purple-65 relative font-normal hover:underline focus:underline"
              to={getRoute('/settings/scenarios')}
            />
          ),
        }}
      />
    </span>
  ) : (
    <span className="text-red-47">{t('scenarios:edit_timestamp_extract.missing_default_timezone_non_admin')}</span>
  );
}

export function returnTimestampExtractInformation(
  t: TFunction<['scenarios'], undefined>,
  part: ValidTimestampExtractParts,
): string {
  switch (part) {
    case 'year':
      return t(`scenarios:edit_timestamp_extract.explanation.year`);
    case 'month':
      return t(`scenarios:edit_timestamp_extract.explanation.month`);
    case 'day_of_month':
      return t(`scenarios:edit_timestamp_extract.explanation.day_of_month`);
    case 'day_of_week':
      return t(`scenarios:edit_timestamp_extract.explanation.day_of_week`);
    case 'hour':
      return t(`scenarios:edit_timestamp_extract.explanation.hour`);
    default:
      assertNever('Untranslated operator', part);
  }
}
