import {
  casesI18n,
  CaseStatus,
  caseStatusMapping,
  caseStatusVariants,
  useCaseStatuses,
} from '@app-builder/components/Cases';
import { type CaseStatus as CasesStatusType, caseStatuses } from '@app-builder/models/cases';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { type Namespace } from 'i18next';
import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Button, Modal } from 'ui-design-system';
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
  const { authService } = initServerServices(request);

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

export function EditCaseStatus({
  status: initialStatus,
  caseId,
}: Pick<Schema, 'caseId' | 'status'>) {
  const { t } = useTranslation(handle.i18n);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const dropdownTriggerRef = React.useRef<HTMLButtonElement>(null);
  const focusRef = React.useRef<HTMLButtonElement | null>(null);
  const [hasOpenDialog, setHasOpenDialog] = React.useState(false);
  const fetcher = useFetcher<typeof action>();
  const statuses = useCaseStatuses();

  const handleStatusChange = (status: CasesStatusType) =>
    fetcher.submit(
      { status: status, caseId },
      {
        method: 'PATCH',
        action: getRoute('/ressources/cases/edit-status'),
        encType: 'application/json',
      },
    );

  const handleDialogItemSelect = () => {
    focusRef.current = dropdownTriggerRef.current;
  };

  const handleDialogItemOpenChange = (open: boolean) => {
    setHasOpenDialog(open);
    if (open === false) {
      setDropdownOpen(false);
    }
  };

  return (
    <DropdownMenu.Root open={dropdownOpen} onOpenChange={setDropdownOpen}>
      <div className="flex flex-row items-center gap-4">
        <span className="text-s text-grey-00 font-medium capitalize">{t('cases:case.status')}</span>
        <DropdownMenu.Trigger
          ref={dropdownTriggerRef}
          className={caseStatusVariants({
            color: caseStatusMapping[initialStatus].color,
            type: 'full',
            size: 'big',
            className: 'group',
          })}
        >
          <span className="text-s ml-2 font-semibold capitalize">
            {t(caseStatusMapping[initialStatus].tKey)}
          </span>
          <Icon icon="arrow-2-down" className="group-radix-state-open:rotate-180 size-6" />
        </DropdownMenu.Trigger>
      </div>
      <DropdownMenu.Content
        className="bg-grey-100 border-grey-90 z-50 rounded border p-2 shadow-md will-change-[transform,opacity]"
        side="bottom"
        align="end"
        sideOffset={8}
        hidden={hasOpenDialog}
        onCloseAutoFocus={(event) => {
          if (focusRef.current) {
            focusRef.current.focus();
            focusRef.current = null;
            event.preventDefault();
          }
        }}
      >
        <div className="flex flex-col gap-2">
          {statuses.map((status) =>
            (['open', 'investigating'] as (typeof caseStatuses)[number][]).includes(
              status.value,
            ) ? (
              <DropdownMenu.Item
                key={status.value}
                className="radix-highlighted:bg-purple-98 flex cursor-pointer flex-row items-center gap-2 rounded p-2 align-baseline outline-none transition-colors"
                onClick={() => handleStatusChange(status.value)}
              >
                <CaseStatus type="full" size="big" status={status.value} />
              </DropdownMenu.Item>
            ) : (
              <Modal.Root key={status.value} onOpenChange={handleDialogItemOpenChange}>
                <Modal.Trigger asChild>
                  <DropdownMenu.Item
                    className="radix-highlighted:bg-purple-98 flex flex-row items-center gap-2 rounded p-2 align-baseline outline-none transition-colors"
                    onSelect={(event) => {
                      handleDialogItemSelect();
                      event.preventDefault();
                    }}
                  >
                    <CaseStatus type="full" size="big" status={status.value} />
                  </DropdownMenu.Item>
                </Modal.Trigger>
                <ModalContent
                  status={initialStatus}
                  nextStatus={status.value}
                  handleSubmit={() => handleStatusChange(status.value)}
                />
              </Modal.Root>
            ),
          )}
        </div>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

function ModalContent({
  status,
  nextStatus,
  handleSubmit,
}: {
  handleSubmit: () => void;
  status: (typeof caseStatuses)[number];
  nextStatus: (typeof caseStatuses)[number];
}) {
  const { t } = useTranslation(handle.i18n);

  return (
    <Modal.Content>
      <Modal.Title>{t('cases:change_status_modal.title')}</Modal.Title>
      <div className="flex flex-col gap-6 p-6">
        <div className="text-grey-00 text-s flex flex-row items-center justify-center gap-6 font-medium capitalize">
          <div className="flex w-full flex-1 flex-row items-center justify-end gap-2">
            <Trans
              t={t}
              i18nKey="cases:change_status_modal.description.from"
              components={{
                Status: <CaseStatus type="full" size="big" status={status} />,
              }}
            />
          </div>
          <div className="flex flex-1 flex-row items-center justify-start gap-2">
            <Trans
              t={t}
              i18nKey="cases:change_status_modal.description.to"
              components={{
                Status: <CaseStatus type="full" size="big" status={nextStatus} />,
              }}
            />
          </div>
        </div>
        <div className="flex w-full flex-row gap-2">
          <Modal.Close asChild>
            <Button variant="secondary" className="flex-1 first-letter:capitalize">
              {t('common:close')}
            </Button>
          </Modal.Close>

          <Modal.Close asChild>
            <Button className="flex-1 first-letter:capitalize" onClick={handleSubmit}>
              {t('cases:change_status_modal.change_status')}
            </Button>
          </Modal.Close>
        </div>
      </div>
    </Modal.Content>
  );
}
