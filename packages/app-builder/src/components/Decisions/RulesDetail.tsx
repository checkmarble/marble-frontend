import { decisionsI18n } from '@app-builder/components';
import { Score } from '@app-builder/components/Decisions/Score';
import { type ParseKeys } from 'i18next';
import { type Decision } from 'marble-api';
import { useTranslation } from 'react-i18next';
import { Accordion, Collapsible, Tag, type TagProps } from 'ui-design-system';
import { Tip } from 'ui-icons';

export const RulesDetail = ({ rules }: { rules: Decision['rules'] }) => {
  const { t } = useTranslation(decisionsI18n);
  return (
    <Collapsible.Container>
      <Collapsible.Title>{t('decisions:rules.title')}</Collapsible.Title>
      <Collapsible.Content>
        <Accordion.Container>
          {rules.map((rule, index) => (
            <RuleSection
              key={`rule_${index}`}
              value={`rule_${index}`}
              rule={rule}
            />
          ))}
        </Accordion.Container>
      </Collapsible.Content>
    </Collapsible.Container>
  );
};

const RuleSection = ({
  rule,
  value,
}: {
  rule: Decision['rules'][0];
  value: string;
}) => {
  const status = rule.result ? 'triggered' : rule.error ? 'error' : undefined;

  if (rule.description) {
    return <RuleWithDescription rule={rule} status={status} value={value} />;
  }

  return <RuleDetail rule={rule} status={status} />;
};

const RuleWithDescription = ({
  rule,
  status,
  value,
}: {
  rule: Decision['rules'][0];
  status?: RuleStatus;
  value: string;
}) => {
  const { t } = useTranslation(decisionsI18n);

  return (
    <Accordion.Item value={value}>
      <Accordion.Title className="flex flex-1 items-center justify-between gap-4">
        <RuleDetail rule={rule} status={status} />
        <Accordion.Arrow />
      </Accordion.Title>
      <Accordion.Content>
        <div className="bg-purple-10 mt-4 flex gap-2 rounded p-4 text-purple-100">
          <Tip height="20px" width="20px" />
          <div className="flex flex-col gap-2">
            <div className="font-semibold">
              {t('decisions:rules.description')}
            </div>
            <div>{rule.description}</div>
          </div>
        </div>
      </Accordion.Content>
    </Accordion.Item>
  );
};

const RuleDetail = ({
  rule,
  status,
}: {
  rule: Decision['rules'][0];
  status?: RuleStatus;
}) => {
  const { t } = useTranslation(decisionsI18n);
  return (
    <div className="flex grow items-center justify-between">
      <div className="text-s flex items-center gap-2 font-semibold">
        {rule.name}
        {rule.result ? <Score score={rule.score_modifier} /> : null}
      </div>
      {status ? (
        <Tag
          border="square"
          size="big"
          color={ruleStatusMapping[status].color}
          className="capitalize"
        >
          {t(ruleStatusMapping[status].tKey)}
        </Tag>
      ) : null}
    </div>
  );
};

type RuleStatus = 'triggered' | 'error' | 'unknown';
const ruleStatusMapping: Record<
  RuleStatus,
  {
    color: TagProps['color'];
    tKey: ParseKeys<['decisions']>;
  }
> = {
  triggered: { color: 'green', tKey: 'decisions:rules.status.triggered' },
  error: { color: 'red', tKey: 'decisions:rules.status.error' },
  unknown: { color: 'grey', tKey: 'decisions:rules.status.unknown' },
};
