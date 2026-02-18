import { Callout } from '@app-builder/components/Callout';
import { ExternalLink, linkClasses } from '@app-builder/components/ExternalLink';
import { pivotValuesDocHref } from '@app-builder/services/documentation-href';
import { getRoute } from '@app-builder/utils/routes';
import { Link } from '@remix-run/react';
import { type KeyboardEvent } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Button, Input } from 'ui-design-system';

import { decisionsI18n } from '../../decisions-i18n';
import { usePivotValueFilter } from '../DecisionFiltersContext';
import { useFiltersMenuContext } from '../DecisionFiltersMenu';

export function PivotValueFilter() {
  const { t } = useTranslation(decisionsI18n);
  const { hasPivots, selectedPivotValue, setSelectedPivotValue } = usePivotValueFilter();
  const { closeMenu } = useFiltersMenuContext();

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      closeMenu();
    }
  };

  if (hasPivots) {
    return (
      <div className="flex w-72 flex-col gap-2 p-2">
        <Callout>
          <span className="whitespace-pre-wrap text-balance">
            <Trans
              t={t}
              i18nKey="decisions:pivot_detail.description.small"
              components={{
                DocLink: <ExternalLink href={pivotValuesDocHref} />,
              }}
            />
          </span>
        </Callout>
        <div className="flex gap-2">
          <Input
            className="flex-1"
            value={selectedPivotValue ?? ''}
            onChange={(event) => {
              setSelectedPivotValue(event.target.value || null);
            }}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <Button variant="secondary" onClick={closeMenu}>
            {t('common:validate')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-72 p-2">
      <Callout variant="outlined">
        <span className="whitespace-pre-wrap text-balance">
          <Trans
            t={t}
            i18nKey="decisions:pivot_detail.missing_pivot_definition"
            components={{
              DataModelLink: <Link to={getRoute('/data/schema')} className={linkClasses} />,
              DocLink: <ExternalLink href={pivotValuesDocHref} />,
            }}
          />
        </span>
      </Callout>
    </div>
  );
}
