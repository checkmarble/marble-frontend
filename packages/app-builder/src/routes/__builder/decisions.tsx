import {
  ErrorComponent,
  Outcome,
  type OutcomeProps,
  Page,
} from '@app-builder/components';
import { serverServices } from '@app-builder/services/init.server';
import { formatDateTime } from '@app-builder/utils/format';
import { useVisibilityChange } from '@app-builder/utils/hooks';
import { type Decision } from '@marble-api';
import { Label } from '@radix-ui/react-label';
import { json, type LoaderArgs } from '@remix-run/node';
import { useLoaderData, useRevalidator, useRouteError } from '@remix-run/react';
import { type ColumnDef, getCoreRowModel } from '@tanstack/react-table';
import { Checkbox, Input, Table, useVirtualTable } from '@ui-design-system';
import { Decision as DecisionIcon, Search } from '@ui-icons';
import clsx from 'clsx';
import { type Namespace } from 'i18next';
import { useEffect, useId, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';

import {
  DecisionsRightPanel,
  useDecisionsRightPanelState,
} from '../ressources/decisions/decision-detail.$decisionId';

export const handle = {
  i18n: ['decisions', 'navigation'] satisfies Namespace,
};

export async function loader({ request }: LoaderArgs) {
  const { authService } = serverServices;
  const { apiClient } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const decisions = await apiClient.listDecisions();
  return json(decisions);
}

export default function DecisionsPage() {
  const { decisionId, setDecisionId } = useDecisionsRightPanelState();

  const { t, i18n } = useTranslation(handle.i18n);
  const decisions = useLoaderData<typeof loader>();

  const columns = useMemo<ColumnDef<Decision, string>[]>(
    () => [
      {
        id: 'scenario.name',
        accessorFn: (row) => row.scenario.name,
        header: t('decisions:scenario.name'),
        size: 200,
      },
      {
        id: 'trigger_object_type',
        accessorFn: (row) => row.trigger_object_type,
        header: t('decisions:trigger_object.type'),
        size: 100,
      },
      {
        id: 'score',
        accessorFn: (row) => row.score,
        header: t('decisions:score'),
        size: 100,
      },
      {
        id: 'outcome',
        accessorFn: (row) => row.outcome,
        header: t('decisions:outcome'),
        size: 100,
        cell: ({ getValue }) => (
          <Outcome
            border="square"
            size="big"
            outcome={getValue<OutcomeProps['outcome']>()}
          />
        ),
      },
      {
        id: 'created_at',
        accessorFn: (row) => formatDateTime(i18n.language, row.created_at),
        header: t('decisions:created_at'),
        size: 200,
      },
    ],
    [i18n.language, t]
  );

  const { table, getBodyProps, rows, getContainerProps } = useVirtualTable({
    data: decisions,
    columns,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    enableSorting: false,
  });

  return (
    <Page.Container>
      <Page.Header>
        <DecisionIcon className="mr-2" height="24px" width="24px" />
        {t('navigation:decisions')}
      </Page.Header>
      <DecisionsRightPanel.Root>
        <Page.Content scrollable={false}>
          <div className="flex flex-row justify-between gap-2">
            <Input
              className="w-full max-w-sm"
              type="search"
              aria-label={t('decisions:search.placeholder')}
              placeholder={t('decisions:search.placeholder')}
              startAdornment={<Search />}
              value={decisionId ?? ''}
              onKeyDownCapture={(e) => {
                if (e.code === 'Escape') {
                  setDecisionId();
                }
              }}
              onChange={(event) => {
                setDecisionId(event.target.value);
              }}
              onClick={(e) => {
                e.stopPropagation(); // To prevent DecisionsRightPanel from closing
              }}
            />
            <ToggleLiveUpdate />
          </div>
          <Table.Container {...getContainerProps()}>
            <Table.Header headerGroups={table.getHeaderGroups()} />
            <Table.Body {...getBodyProps()}>
              {rows.map((row) => {
                return (
                  <Table.Row
                    key={row.id}
                    className={clsx(
                      'hover:bg-grey-02 cursor-pointer',
                      row.original.id === decisionId && 'bg-grey-02'
                    )}
                    row={row}
                    onClick={(e) => {
                      setDecisionId(row.original.id);
                      e.stopPropagation(); // To prevent DecisionsRightPanel from closing
                    }}
                  />
                );
              })}
            </Table.Body>
          </Table.Container>
        </Page.Content>
      </DecisionsRightPanel.Root>
    </Page.Container>
  );
}

function ToggleLiveUpdate() {
  const id = useId();
  const { t } = useTranslation(handle.i18n);
  const revalidator = useRevalidator();
  const [liveUpdate, setLiveUpdate] = useState(false);
  const visibilityState = useVisibilityChange();

  useEffect(() => {
    if (!liveUpdate || visibilityState === 'hidden') return;

    const interval = setInterval(() => {
      revalidator.revalidate();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [liveUpdate, revalidator, visibilityState]);

  return (
    <div className="flex flex-row items-center gap-2">
      <Checkbox
        id={id}
        onCheckedChange={(checked) => {
          if (checked === 'indeterminate') return;
          setLiveUpdate(checked);
        }}
      />
      <Label htmlFor={id} className="text-s whitespace-nowrap">
        {t('decisions:live_update')}
      </Label>
    </div>
  );
}

export function ErrorBoundary() {
  return <ErrorComponent error={useRouteError()} />;
}
