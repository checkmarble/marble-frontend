import type { SanctionCheckMatchPayload } from '@app-builder/models/sanction-check';
import { useTranslation } from 'react-i18next';
import { Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { sanctionsI18n } from './sanctions-i18n';

export function MatchResult({ entity }: { entity: SanctionCheckMatchPayload }) {
  const { t } = useTranslation(sanctionsI18n);

  const entitySchema = entity.schema.toLowerCase() as Lowercase<typeof entity.schema>;

  return (
    <div className="text-s bg-grey-98 flex items-center rounded">
      <div className="flex items-center gap-2 p-4">
        <span className="max-w-60 truncate font-semibold">{entity.caption}</span>
        <span>{t(`sanctions:entity.schema.${entitySchema}`)}</span>
        <Tag color="grey" className="shrink-0">
          {t('sanctions:match.similarity', {
            percent: Math.round(entity.score * 100),
          })}
        </Tag>
      </div>
      <div className="ml-auto flex p-2">
        <a
          href={`https://www.opensanctions.org/entities/${entity.id}`}
          target="_blank"
          className="border-grey-90 bg-grey-100 flex items-center gap-2 rounded border p-1"
          rel="noreferrer"
        >
          OpenSanctions
          <Icon icon="openinnew" className="size-4" />
        </a>
      </div>
    </div>
  );
}
