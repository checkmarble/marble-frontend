import { Page } from '@app-builder/components/Page';
import { ScreeningNavigationTabs } from '@app-builder/components/Screenings/Navigation/Tabs';
import { formatDateAtTime } from '@app-builder/utils/datetime';
import { useFormatLanguage, useFormatTimezone } from '@app-builder/utils/format';
import { useTranslation } from 'react-i18next';
import { Card, cn, DefaultTooltip, Tag, Typo } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { Callout } from '../Callout';
import { pageLayoutGutter } from '../Page/page-layout';
import { Panel } from '../Panel';

export function ObservabilityPage() {
  return (
    <Page.Main>
      <Page.Content>
        <div className={cn('flex flex-col gap-lg', pageLayoutGutter.gap)}>
          <ScreeningNavigationTabs />
          <div className={cn('grid lg:grid-cols-2', pageLayoutGutter.gap)}>
            <Card className="p-md grid gap-sm ">
              <header className="flex justify-between items-center">
                <div className="flex gap-xs">
                  <Typo variant="title2">Client data indexing</Typo>
                  <DefaultTooltip content="Client data indexing is the process of indexing client data into the database.">
                    <Icon icon="tip" className="size-4" />
                  </DefaultTooltip>
                </div>
                <div className="flex gap-sm items-center">
                  <Tag color="yellow">Pending: +1000</Tag>
                  <PanelCientIndexing />
                </div>
              </header>
              <Callout color="purple">Your data indexing in Marble.</Callout>
              <ClientDataIndexing
                data={[
                  { indexingDate: '2026-07-03T12:00:00Z', indexingValue: 2130, indexingStatus: 'pending' },
                  { indexingDate: '2026-07-02T12:00:00Z', indexingValue: 1230, indexingStatus: 'completed' },
                  { indexingDate: '2026-07-01T12:00:00Z', indexingValue: 4322, indexingStatus: 'failed' },
                ]}
              />
            </Card>
            <div></div>
          </div>
          <div></div>
        </div>
      </Page.Content>
    </Page.Main>
  );
}

type ClientDataIndexingProps = {
  data: {
    indexingDate: string;
    indexingValue: number;
    indexingStatus: 'pending' | 'completed' | 'failed';
  }[];
};

function ClientDataIndexing({ data }: ClientDataIndexingProps) {
  const { t } = useTranslation(['continuousScreening']);
  const locale = useFormatLanguage();
  const timezone = useFormatTimezone();

  return (
    <div className="grid grid-cols-2 gap-md w-fit">
      {data.map((item) => {
        const formattedDate = formatDateAtTime(item.indexingDate, {
          locale,
          timeZone: timezone,
          todayLabel: t('continuousScreening:observability.today'),
          yesterdayLabel: t('continuousScreening:observability.yesterday'),
          atSeparator: t('continuousScreening:observability.date_time_separator'),
        });

        return (
          <div key={item.indexingDate} className="grid col-span-full grid-cols-subgrid items-center">
            <time dateTime={item.indexingDate} className="text-grey-secondary">
              {formattedDate}
            </time>
            <Tag
              color={
                item.indexingStatus === 'pending' ? 'yellow' : item.indexingStatus === 'completed' ? 'green' : 'red'
              }
              className="gap-sm"
            >
              <Icon
                icon={
                  item.indexingStatus === 'pending'
                    ? 'waiting_for_action'
                    : item.indexingStatus === 'completed'
                      ? 'checked'
                      : 'x'
                }
                className="size-4"
              />
              {item.indexingValue}
            </Tag>
          </div>
        );
      })}
    </div>
  );
}

function PanelCientIndexing() {
  return (
    <Panel.Root>
      <Icon icon="eye" className="size-4" />
    </Panel.Root>
  );
}
