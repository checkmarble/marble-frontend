import { decisionsI18n } from '@app-builder/components';
import { type SanctionCheck } from '@app-builder/models/sanction-check';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Collapsible } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { MatchCard } from '../Sanctions/MatchCard';
import { SanctionStatusTag } from '../Sanctions/SanctionStatusTag';

export function SanctionCheckDetail({
  sanctionCheck,
}: {
  sanctionCheck: SanctionCheck;
}) {
  const { t } = useTranslation(decisionsI18n);
  const searchInputs = R.pipe(
    R.values(sanctionCheck.request.queries),
    R.flatMap((query) => R.values(query.properties)),
    R.flat(),
  );

  return (
    <Collapsible.Container className="bg-grey-100">
      <Collapsible.Title>
        <div className="flex grow items-center justify-between">
          <span>{t('decisions:sanction_check.title')}</span>
          <SanctionStatusTag
            status={sanctionCheck.status}
            border="square"
            className="h-8"
          />
        </div>
      </Collapsible.Title>
      <Collapsible.Content>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span>{t('sanctions:search_input')}</span>
            {searchInputs.map((input, i) => (
              <div
                key={i}
                className="border-grey-90 flex items-center gap-2 rounded border p-2"
              >
                <span className="bg-grey-95 size-6 rounded-sm p-1">
                  <Icon icon="string" className="size-4" />
                </span>
                {input}
              </div>
            ))}
          </div>
          {sanctionCheck.matches.map((match) => (
            <MatchCard readonly key={match.id} match={match} />
          ))}
        </div>
      </Collapsible.Content>
    </Collapsible.Container>
  );
}
