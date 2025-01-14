import { type Pivot } from '@app-builder/models';
import { type LicenseEntitlements } from '@app-builder/models/license';
import { type RuleSnooze } from '@app-builder/models/rule-snooze';
import { AddRuleSnooze } from '@app-builder/routes/ressources+/cases+/add-rule-snooze';
import { formatDateTime, useFormatLanguage } from '@app-builder/utils/format';
import * as Ariakit from '@ariakit/react';
import clsx from 'clsx';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Button, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { CopyToClipboardButton } from '../CopyToClipboardButton';
import { PivotDetails } from '../Data/PivotDetails';
import { Nudge } from '../Nudge';
import { casesI18n } from './cases-i18n';

export function RuleSnoozes({
  ruleSnoozes,
  pivotValues,
  isCreateSnoozeAvailable,
  entitlements,
  decisionId,
  ruleId,
}: {
  ruleSnoozes: RuleSnooze[];
  entitlements: LicenseEntitlements;
  pivotValues: {
    pivot: Pivot;
    value: string;
  }[];
  isCreateSnoozeAvailable: boolean;
  decisionId: string;
  ruleId: string;
}) {
  const { t, i18n } = useTranslation(casesI18n);
  const language = useFormatLanguage();

  return (
    <div className="flex flex-col gap-2">
      <div className="text-grey-100 text-xs font-medium">
        {t('cases:case_detail.pivot_values')}
      </div>
      <div className="grid grid-cols-[repeat(4,_max-content)] items-center gap-2">
        {pivotValues.map(({ pivot, value }) => {
          const snooze = ruleSnoozes.find(
            (snooze) => snooze.pivotValue === value,
          );
          return (
            <React.Fragment key={pivot.id}>
              <Tag
                size="big"
                border="square"
                color={pivot.type === 'field' ? 'grey' : 'purple'}
                className="col-start-1 flex flex-row gap-2"
              >
                <span className="flex-1">{pivot.type}</span>
                <Ariakit.HovercardProvider
                  showTimeout={0}
                  hideTimeout={0}
                  placement={i18n.dir() === 'ltr' ? 'right' : 'left'}
                >
                  <Ariakit.HovercardAnchor
                    tabIndex={-1}
                    className={clsx(
                      'cursor-pointer transition-colors',
                      pivot.type === 'field' &&
                        'text-grey-25 hover:text-grey-50',
                      pivot.type === 'link' &&
                        'text-purple-50 hover:text-purple-100',
                    )}
                  >
                    <Icon icon="tip" className="size-5" />
                  </Ariakit.HovercardAnchor>
                  <Ariakit.Hovercard
                    portal
                    gutter={16}
                    className="bg-grey-00 border-grey-10 flex w-fit rounded border p-2 shadow-md"
                  >
                    <PivotDetails pivot={pivot} />
                  </Ariakit.Hovercard>
                </Ariakit.HovercardProvider>
              </Tag>
              <CopyToClipboardButton toCopy={value} className="bg-grey-00">
                <span className="text-s line-clamp-1 max-w-40 font-normal">
                  {value}
                </span>
              </CopyToClipboardButton>

              {snooze ? (
                <div className="text-s text-grey-00 flex h-8 flex-row items-center justify-center gap-1 rounded bg-[#AAA6CC] p-2 font-semibold">
                  <Icon icon="snooze" className="size-6" />
                  <span className="flex-1">
                    {t('cases:case_detail.add_rule_snooze.snoozed')}
                  </span>

                  <Ariakit.HovercardProvider
                    showTimeout={0}
                    hideTimeout={0}
                    placement={i18n.dir() === 'ltr' ? 'right' : 'left'}
                  >
                    <Ariakit.HovercardAnchor
                      tabIndex={-1}
                      className="cursor-pointer opacity-50 transition-opacity hover:opacity-100"
                    >
                      <Icon icon="tip" className="size-5" />
                    </Ariakit.HovercardAnchor>
                    <Ariakit.Hovercard
                      portal
                      gutter={16}
                      className="bg-grey-00 border-grey-10 flex w-fit rounded border p-2 shadow-md"
                    >
                      <span className="text-grey-100 text-s">
                        {t('cases:case_detail.pivot_values.snooze_from_to', {
                          from: formatDateTime(snooze.startsAt, { language }),
                          to: formatDateTime(snooze.endsAt, { language }),
                        })}
                      </span>
                    </Ariakit.Hovercard>
                  </Ariakit.HovercardProvider>
                </div>
              ) : (
                match(entitlements.ruleSnoozes)
                  .with('allowed', () =>
                    isCreateSnoozeAvailable ? (
                      <AddRuleSnooze decisionId={decisionId} ruleId={ruleId}>
                        <Button className="h-8 w-fit pl-2">
                          <Icon icon="snooze" className="size-6" />
                          {t(
                            'cases:case_detail.add_rule_snooze.snooze_this_value',
                          )}
                        </Button>
                      </AddRuleSnooze>
                    ) : (
                      <span className="text-grey-50 col-span-2 text-xs">
                        {t('cases:case_detail.add_rule_snooze.no_access')}
                      </span>
                    ),
                  )
                  .with('restricted', () => (
                    <Button className="relative h-8 w-fit pl-2" disabled>
                      <Icon icon="snooze" className="size-6" />
                      {t('cases:case_detail.add_rule_snooze.snooze_this_value')}
                      <Nudge
                        className="border-purple-25 absolute -right-3 -top-3 size-6 border"
                        content={t('cases:case_detail.add_rule_snooze.nudge')}
                        link="https://docs.checkmarble.com/docs/rule-snoozes"
                      />
                    </Button>
                  ))
                  .with('test', () =>
                    isCreateSnoozeAvailable ? (
                      <AddRuleSnooze decisionId={decisionId} ruleId={ruleId}>
                        <Button className="relative h-8 w-fit pl-2">
                          <Icon icon="snooze" className="size-6" />
                          {t(
                            'cases:case_detail.add_rule_snooze.snooze_this_value',
                          )}
                          <Nudge
                            className="absolute -right-3 -top-3 size-6 border border-purple-50"
                            kind="test"
                            content={t(
                              'cases:case_detail.add_rule_snooze.nudge',
                            )}
                            link="https://docs.checkmarble.com/docs/rule-snoozes"
                          />
                        </Button>
                      </AddRuleSnooze>
                    ) : (
                      <span className="text-grey-50 col-span-2 text-xs">
                        {t('cases:case_detail.add_rule_snooze.no_access')}
                      </span>
                    ),
                  )
                  .exhaustive()
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
