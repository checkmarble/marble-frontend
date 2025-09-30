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
    <Collapsible.Container className="bg-grey-100">
      <Collapsible.Title>
        <div className="flex grow items-center justify-between">
          <span>{screening.config.name}</span>
          <ScreeningStatusTag status={screening.status} border="square" className="h-8" />
        </div>
      </Collapsible.Title>
      <Collapsible.Content>
        <div className="flex flex-col gap-4">
          {hasError ? <ScreeningErrors screening={screening} /> : null}
          {screening.request ? <SearchInput request={screening.request} /> : null}
          <div className="flex flex-col gap-2">
            {screening.matches.map((match) => (
              <MatchCard
                readonly
                key={match.id}
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
    <div className="flex items-center gap-2">
      <span>{t('sanctions:search_input')}</span>
      {searchInputList.map((input, i) => (
        <div key={i} className="border-grey-90 flex items-center gap-2 rounded-sm border p-2">
          <span className="bg-grey-95 size-6 rounded-xs p-1">
            <Icon icon="string" className="size-4" />
          </span>
          {input}
        </div>
      ))}
    </div>
  );
};
