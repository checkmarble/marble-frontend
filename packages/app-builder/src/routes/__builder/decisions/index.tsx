import {
  DecisionFiltersMenu,
  decisionsI18n,
  DecisionsList,
  ErrorComponent,
  Page,
} from '@app-builder/components';
import { decisionFilters } from '@app-builder/components/Decisions/Filters/filters';
import { serverServices } from '@app-builder/services/init.server';
import { parseQuerySafe } from '@app-builder/utils/input-validation';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUID } from '@app-builder/utils/short-uuid';
import { json, type LoaderArgs, redirect } from '@remix-run/node';
import { Form, useLoaderData, useRouteError } from '@remix-run/react';
import { captureRemixErrorBoundaryError } from '@sentry/remix';
import { type Namespace } from 'i18next';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input } from 'ui-design-system';
import { Decision, Filters, Search } from 'ui-icons';
import * as z from 'zod';

export const handle = {
  i18n: ['common', 'navigation', ...decisionsI18n] satisfies Namespace,
};

const decisionFiltersSchema = z.object({
  outcome: z.array(z.enum(['approve', 'review', 'decline'])).optional(),
  triggerObject: z.array(z.string()).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  scenarioId: z.array(z.string()).optional(),
});

export async function loader({ request }: LoaderArgs) {
  const { authService } = serverServices;
  const { apiClient } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const parsedQuery = await parseQuerySafe(request, decisionFiltersSchema);
  if (!parsedQuery.success) {
    return redirect(getRoute('/decisions'));
  }

  const decisions = await apiClient.listDecisions(parsedQuery.data);

  return json({
    decisions,
    filters: parsedQuery.data,
  });
}

export default function Decisions() {
  const { t } = useTranslation(handle.i18n);
  const { decisions, filters } = useLoaderData<typeof loader>();
  const [decisionId, setDecisionId] = useState<string | null>(null);

  const decisionIdToParams = (decisionId: string | null) => {
    try {
      return fromUUID(decisionId ?? '');
    } catch {
      return decisionId;
    }
  };

  return (
    <Page.Container>
      <Page.Header>
        <Decision className="mr-2" height="24px" width="24px" />
        {t('navigation:decisions')}
      </Page.Header>

      <Page.Content>
        <DecisionsList decisions={decisions} />
        <div className="flex flex-col gap-4">
          <div className="flex justify-between gap-4">
            <Form
              className="flex gap-1"
              method="GET"
              action={getRoute('/decisions/:decisionId', {
                decisionId: decisionIdToParams(decisionId) ?? '',
              })}
            >
              <Input
                type="search"
                aria-label={t('decisions:search.placeholder')}
                placeholder={t('decisions:search.placeholder')}
                value={decisionId ?? ''}
                onChange={(e) => setDecisionId(e.target.value)}
              />
              <Button type="submit">
                <Search />
                {t('common:search')}
              </Button>
            </Form>
            <div className="flex gap-4">
              <DecisionFiltersMenu filters={decisionFilters}>
                <Button className="flex flex-row gap-2" variant="secondary">
                  <Filters className="text-l" />
                  <span className="text-s font-semibold first-letter:capitalize">
                    {t('decisions:filters')}
                  </span>
                </Button>
              </DecisionFiltersMenu>
              {/* <Button>Add to case</Button> */}
            </div>
          </div>
          <DecisionsList decisions={decisions} />
        </div>
      </Page.Content>
    </Page.Container>
  );
}

// Temporary disabled
// function ToggleLiveUpdate() {
//   const id = useId();
//   const { t } = useTranslation(handle.i18n);
//   const revalidator = useRevalidator();
//   const [liveUpdate, setLiveUpdate] = useState(false);
//   const visibilityState = useVisibilityChange();

//   useEffect(() => {
//     if (!liveUpdate || visibilityState === 'hidden') return;

//     const interval = setInterval(() => {
//       revalidator.revalidate();
//     }, 5000);

//     return () => {
//       clearInterval(interval);
//     };
//   }, [liveUpdate, revalidator, visibilityState]);

//   return (
//     <div className="flex flex-row items-center gap-2">
//       <Checkbox
//         id={id}
//         onCheckedChange={(checked) => {
//           if (checked === 'indeterminate') return;
//           setLiveUpdate(checked);
//         }}
//       />
//       <Label htmlFor={id} className="text-s whitespace-nowrap">
//         {t('decisions:live_update')}
//       </Label>
//     </div>
//   );
// }

export function ErrorBoundary() {
  const error = useRouteError();
  captureRemixErrorBoundaryError(error);
  return <ErrorComponent error={error} />;
}
