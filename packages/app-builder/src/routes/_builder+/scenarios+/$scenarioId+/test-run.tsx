import { ErrorComponent, Page, scenarioI18n } from '@app-builder/components';
import { Spinner } from '@app-builder/components/Spinner';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUID } from '@app-builder/utils/short-uuid';
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useRouteError } from '@remix-run/react';
import { captureRemixErrorBoundaryError } from '@sentry/remix';
import { type Namespace } from 'i18next';
import { type Dispatch, type SetStateAction, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, Button, Separator, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { useCurrentScenario } from './_layout';

export const handle = {
  i18n: [...scenarioI18n] satisfies Namespace,
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService } = serverServices;
  const scenarioId = fromParams(params, 'scenarioId');
  const { decision } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const scheduledExecutions = await decision.listScheduledExecutions({
    scenarioId,
  });

  return json({
    scheduledExecutions,
  });
}

const Header = ({
  showFilters,
}: {
  showFilters: Dispatch<SetStateAction<boolean>>;
}) => {
  return (
    <div className="flex flex-row items-center justify-between">
      <span className="text-m font-semibold">History</span>
      <div className="flex flex-row gap-4">
        <Button
          variant="outline"
          onPointerDown={() => showFilters((prev) => !prev)}
        >
          <Icon icon="filters" className="size-6" />
          <span>Filters</span>
        </Button>
        <Button variant="primary">
          <Icon icon="plus" className="size-6" />
          <span>Nouveau testrun</span>
        </Button>
      </div>
    </div>
  );
};

const Filter = () => {
  return (
    <div className="bg-purple-05 flex flex-row items-center gap-2 rounded-[4px] p-2 text-purple-100">
      <div className="flex flex-row items-center gap-1">
        <Icon icon="calendar-month" className="size-5" />
        <span className="text-s font-semibold">Date:</span>
        <span className="text-s">07.11.24</span>
      </div>
      <Icon
        icon="cross"
        className="hover:text-purple-120 size-6 cursor-pointer font-semibold"
      />
    </div>
  );
};

const Filters = () => {
  return (
    <div className="flex flex-row items-center justify-between">
      <div className="flex flex-row items-center gap-2">
        <Filter />
        <Button variant="tertiary">
          <Icon icon="plus" className="size-6" />
          <span>New Filter</span>
        </Button>
      </div>
      <Button variant="tertiary">
        <Icon icon="cross" className="size-6" />
        <span>Clear filters</span>
      </Button>
    </div>
  );
};

export default function TestRun() {
  const { t } = useTranslation(handle.i18n);
  const _data = useLoaderData<typeof loader>();

  const currentScenario = useCurrentScenario();

  const [isFiltersShowned, showFilters] = useState(true);

  return (
    <Page.Main>
      <Page.Header className="gap-4">
        <Page.BackLink
          to={getRoute('/scenarios/:scenarioId/home', {
            scenarioId: fromUUID(currentScenario.id),
          })}
        />
        <p className="line-clamp-2 text-start">{currentScenario.name}</p>
        <p className="text-grey-50 line-clamp-2">
          {t('scenarios:home.testrun')}
        </p>
      </Page.Header>

      <Page.Container>
        <Page.Description>
          {t('scenarios:testrun.description')}
        </Page.Description>
        <Page.Content className="max-w-screen-lg">
          <div className="flex max-w-[725px] flex-col gap-[14px]">
            <div className="flex flex-col gap-4">
              <Header showFilters={showFilters} />
              <Separator className="bg-grey-10" />
              {isFiltersShowned ? <Filters /> : null}
            </div>
            <div className="flex flex-col gap-2">
              <div className="grid-cols-test-run text-s grid font-semibold">
                <span className="px-4">Version</span>
                <span className="px-4">Period</span>
                <span className="px-4">Creator</span>
                <span className="px-4">Log</span>
                <span className="px-4">Status</span>
              </div>
              <div className="grid-cols-test-run bg-grey-00 border-grey-10 grid items-center rounded-lg border p-4">
                <div>
                  <div className="flex flex-row items-center gap-1">
                    <Tag
                      size="big"
                      color="grey-light"
                      className="border-grey-10 gap-1 border px-4 py-2"
                    >
                      <span className="text-grey-100 font-semibold">V3</span>
                      <span className="font-semibold text-purple-100">
                        Live
                      </span>
                    </Tag>
                    <Icon
                      icon="arrows-right-left"
                      className="text-grey-100 size-5"
                    />
                    <Tag
                      size="big"
                      color="grey-light"
                      className="border-grey-10 border px-4 py-2"
                    >
                      V4
                    </Tag>
                  </div>
                </div>
                <div className="px-2">
                  <span className="text-s inline-flex flex-row items-center gap-1">
                    From
                    <span className="font-semibold">04.10.24</span>
                    To
                    <span className="font-semibold">04.11.24</span>
                  </span>
                </div>
                <div className="px-3">
                  <Avatar firstName="Jean" lastName="Christophe" />
                </div>
                <div className="px-4">
                  <Button variant="secondary" className="px-1.5 py-2">
                    <Icon icon="decision" className="size-5" />
                  </Button>
                </div>
                <div className="px-4">
                  <Tag
                    border="square"
                    size="big"
                    className="inline-flex flex-row items-center gap-2 bg-purple-100"
                  >
                    <Spinner className="size-3" />
                    <span className="text-grey-00 text-s font-semibold">
                      Ongoing
                    </span>
                  </Tag>
                </div>
              </div>
            </div>
          </div>
        </Page.Content>
      </Page.Container>
    </Page.Main>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  captureRemixErrorBoundaryError(error);

  return <ErrorComponent error={error} />;
}
