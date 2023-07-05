import { type Decision } from '@marble-front/api/marble';
import { Tag, type TagProps } from '@marble-front/ui/design-system';
import { type ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';

import { decisionI18n } from './decision-i18n';

export interface OutcomeProps extends Omit<TagProps, 'color'> {
  outcome: Decision['outcome'];
}

const outcomeMapping: Record<
  OutcomeProps['outcome'],
  { color: TagProps['color']; tKey: ParseKeys<['decisions']> }
> = {
  approve: { color: 'green', tKey: 'decisions:outcome.approve' },
  review: { color: 'yellow', tKey: 'decisions:outcome.review' },
  decline: { color: 'red', tKey: 'decisions:outcome.decline' },
  null: { color: 'grey', tKey: 'decisions:outcome.null' },
  unknown: { color: 'grey', tKey: 'decisions:outcome.unknown' },
};

export function Outcome({ outcome, ...tagProps }: OutcomeProps) {
  const { t } = useTranslation(decisionI18n);

  const { color, tKey } = outcomeMapping[outcome] ?? outcomeMapping.unknown;

  return (
    <Tag {...tagProps} color={color}>
      {t(tKey)}
    </Tag>
  );
}
