import { decisionsI18n } from '@app-builder/components';
import { isScreeningError, type Screening } from '@app-builder/models/screening';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Collapsible } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { MatchCard } from '../Screenings/MatchCard';
import { ScreeningErrors } from '../Screenings/ScreeningErrors';
import { ScreeningStatusTag } from '../Screenings/ScreeningStatusTag';

export function ScreeningDetail({ screening }: { screening: Screening }) {
  const hasError = isScreeningError(screening);

  return (
    <Collapsible.Container className="bg-surface-card">
      <Collapsible.Title>
        <div className="flex grow items-center justify-between">
          <span>{screening.config.name}</span>
          <ScreeningStatusTag
            status={screening.status}
            pendingHitCount={screening.matches.filter((m) => m.status === 'pending').length}
            className="h-8"
          />
        </div>
      </Collapsible.Title>
      <Collapsible.Content>
        <div className="flex flex-col gap-md">
          {hasError ? <ScreeningErrors screening={screening} /> : null}
          {screening.request ? <SearchInput request={screening.request} /> : null}
          <div className="flex flex-col gap-sm">
            {screening.matches.map((match) => (
              <MatchCard
                readonly
                key={match.id}
                screening={screening}
                unreviewable={hasError || screening.partial}
                match={match}
              />
            ))}
          </div>
        </div>
      </Collapsible.Content>
    </Collapsible.Container>
  );
}

const SearchInput = ({ request }: { request: NonNullable<Screening['request']> }) => {
  const { t } = useTranslation(decisionsI18n);
  const searchInputList = R.pipe(
    R.values(request.queries),
    R.flatMap((query) => R.values(query.properties)),
    R.flat(),
  );

  return (
    <div className="flex items-center gap-sm">
      <span>{t('screenings:search_input')}</span>
      {searchInputList.map((input, i) => (
        <div key={i} className="border-grey-border flex items-center gap-sm rounded-sm border p-sm">
          <span className="bg-grey-background size-6 rounded-xs p-xs">
            <Icon icon="string" className="size-4" />
          </span>
          {input}
        </div>
      ))}
    </div>
  );
};
