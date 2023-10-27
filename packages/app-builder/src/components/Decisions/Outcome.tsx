import { type ParseKeys } from 'i18next';
import { type Decision } from 'marble-api';
import { useTranslation } from 'react-i18next';
import { Tag, type TagProps } from 'ui-design-system';

import { decisionsI18n } from './decisions-i18n';

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
  const { t } = useTranslation(decisionsI18n);

  const { color, tKey } = outcomeMapping[outcome] ?? outcomeMapping.unknown;

  return (
    <Tag {...tagProps} color={color}>
      {t(tKey)}
    </Tag>
  );
}
