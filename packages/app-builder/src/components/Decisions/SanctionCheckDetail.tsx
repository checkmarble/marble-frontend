import { decisionsI18n } from '@app-builder/components';
import { type SanctionCheck } from '@app-builder/models/sanction-check';
import { useTranslation } from 'react-i18next';
import { Collapsible } from 'ui-design-system';

import { MatchCard } from '../Sanctions/MatchCard';

export function SanctionCheckDetail({
  sanctionCheck,
}: {
  sanctionCheck: SanctionCheck;
}) {
  const { t } = useTranslation(decisionsI18n);

  return (
    <Collapsible.Container className="bg-grey-100">
      <Collapsible.Title>
        {t('decisions:sanction_check.title')}
      </Collapsible.Title>
      <Collapsible.Content>
        <div className="flex flex-col gap-2">
          {sanctionCheck.matches.map((match) => (
            <MatchCard readonly key={match.id} match={match} />
          ))}
        </div>
      </Collapsible.Content>
    </Collapsible.Container>
  );
}
