import { Callout } from '@app-builder/components/Callout';
import { ExternalLink } from '@app-builder/components/ExternalLink';
import { pivotValuesDocHref } from '@app-builder/services/documentation-href';
import { getRoute } from '@app-builder/utils/routes';
import { Link } from '@remix-run/react';
import { Trans, useTranslation } from 'react-i18next';
import { Input } from 'ui-design-system';

import { decisionsI18n } from '../../decisions-i18n';
import { usePivotValueFilter } from '../DecisionFiltersContext';

export function PivotValueFilter() {
  const { t } = useTranslation(decisionsI18n);
  const { hasPivots, selectedPivotValue, setSelectedPivotValue } =
    usePivotValueFilter();

  if (hasPivots) {
    return (
      <div className="flex flex-col gap-2 p-2">
        <Callout>
          <span className="max-w-xs whitespace-pre text-balance">
            <Trans
              t={t}
              i18nKey="decisions:pivot_detail.description.small"
              components={{
                DocLink: <ExternalLink href={pivotValuesDocHref} />,
              }}
            />
          </span>
        </Callout>
        <Input
          value={selectedPivotValue ?? ''}
          onChange={(event) => {
            setSelectedPivotValue(event.target.value || null);
          }}
          autoFocus
        />
      </div>
    );
  }

  return (
    <Callout variant="outlined">
      <span className="max-w-sm whitespace-pre text-balance">
        <Trans
          t={t}
          i18nKey="decisions:pivot_detail.missing_pivot_definition"
          components={{
            DataModelLink: (
              <Link
                to={getRoute('/data/schema')}
                className="hover:text-purple-120 focus:text-purple-120 font-semibold lowercase text-purple-100 hover:underline focus:underline"
              />
            ),
            DocLink: <ExternalLink href={pivotValuesDocHref} />,
          }}
        />
      </span>
    </Callout>
  );
}
