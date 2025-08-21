import { decisionsI18n } from '@app-builder/components';
import { isSanctionCheckError, type SanctionCheck } from '@app-builder/models/sanction-check';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Collapsible } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { MatchCard } from '../Sanctions/MatchCard';
import { SanctionCheckErrors } from '../Sanctions/SanctionCheckErrors';
import { SanctionStatusTag } from '../Sanctions/SanctionStatusTag';

export function SanctionCheckDetail({ sanctionCheck }: { sanctionCheck: SanctionCheck }) {
  const hasError = isSanctionCheckError(sanctionCheck);

  return (
    <Collapsible.Container className="bg-grey-100">
      <Collapsible.Title>
        <div className="flex grow items-center justify-between">
          <span>{sanctionCheck.config.name}</span>
          <SanctionStatusTag status={sanctionCheck.status} border="square" className="h-8" />
        </div>
      </Collapsible.Title>
      <Collapsible.Content>
        <div className="flex flex-col gap-4">
          {hasError ? <SanctionCheckErrors sanctionCheck={sanctionCheck} /> : null}
          {sanctionCheck.request ? <SearchInput request={sanctionCheck.request} /> : null}
          <div className="flex flex-col gap-2">
            {sanctionCheck.matches.map((match) => (
              <MatchCard
                readonly
                key={match.id}
                unreviewable={hasError || sanctionCheck.partial}
                match={match}
              />
            ))}
          </div>
        </div>
      </Collapsible.Content>
    </Collapsible.Container>
  );
}

const SearchInput = ({ request }: { request: NonNullable<SanctionCheck['request']> }) => {
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
