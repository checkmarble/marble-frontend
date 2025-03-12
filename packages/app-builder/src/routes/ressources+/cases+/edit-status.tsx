import {
  casesI18n,
  CaseStatus,
  caseStatusMapping,
  caseStatusVariants,
  useCaseStatuses,
} from '@app-builder/components/Cases';
import { caseStatuses } from '@app-builder/models/cases';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { type Namespace } from 'i18next';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';
import { z } from 'zod';

export const handle = {
  i18n: [...casesI18n, 'common'] satisfies Namespace,
};

const schema = z.object({
  caseId: z.string(),
  status: z.enum(caseStatuses),
});

type Schema = z.infer<typeof schema>;

export async function action({ request }: ActionFunctionArgs) {
  const { authService } = serverServices;

  const [raw, { cases }] = await Promise.all([
    request.json(),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const { success, data } = schema.safeParse(raw);

  if (!success) return json({ success: 'false' });

  await cases.updateCase({
    caseId: data.caseId,
    body: { status: data.status },
  });

  return json({ success: 'true' });
}

export function EditCaseStatus({ status, caseId }: Pick<Schema, 'caseId' | 'status'>) {
  const { t } = useTranslation(handle.i18n);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const dropdownTriggerRef = React.useRef<HTMLButtonElement>(null);
  const fetcher = useFetcher<typeof action>();
  const statuses = useCaseStatuses();

  return (
    <DropdownMenu.Root open={dropdownOpen} onOpenChange={setDropdownOpen}>
      <div className="flex flex-row items-center gap-4">
        <span className="text-s text-grey-00 font-medium capitalize">{t('cases:case.status')}</span>
        <DropdownMenu.Trigger
          ref={dropdownTriggerRef}
          className={caseStatusVariants({
            color: caseStatusMapping[status].color,
            type: 'full',
            size: 'big',
            className: 'group',
          })}
        >
          <span className="text-s ml-2 font-semibold capitalize">
            {t(caseStatusMapping[status].tKey)}
          </span>
          <Icon icon="arrow-2-down" className="group-radix-state-open:rotate-180 size-6" />
        </DropdownMenu.Trigger>
      </div>
      <DropdownMenu.Content
        className="bg-grey-100 border-grey-90 z-50 rounded border p-2 shadow-md will-change-[transform,opacity]"
        side="bottom"
        align="end"
        sideOffset={8}
      >
        <div className="flex flex-col gap-2">
          {statuses.map((status) => (
            <DropdownMenu.Item
              key={status.value}
              className="radix-highlighted:bg-purple-98 flex cursor-pointer flex-row items-center gap-2 rounded p-2 align-baseline outline-none transition-colors"
              onClick={() => {
                fetcher.submit(
                  { status: status.value, caseId },
                  {
                    method: 'PATCH',
                    action: getRoute('/ressources/cases/edit-status'),
                    encType: 'application/json',
                  },
                );
              }}
            >
              <CaseStatus type="full" size="big" status={status.value} />
            </DropdownMenu.Item>
          ))}
        </div>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
