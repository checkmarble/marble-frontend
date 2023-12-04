import {
  casesI18n,
  CaseStatus,
  caseStatusMapping,
  caseStatusVariants,
  useCaseStatuses,
} from '@app-builder/components/Cases';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { caseStatusSchema } from '@app-builder/utils/schema/filterSchema';
import { conform, useForm } from '@conform-to/react';
import { getFieldsetConstraint, parse } from '@conform-to/zod';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { type ActionArgs, json } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Button, Modal } from 'ui-design-system';
import { Arrow2Down } from 'ui-icons';
import { z } from 'zod';

export const handle = {
  i18n: [...casesI18n, 'common'] satisfies Namespace,
};

const schema = z.object({
  caseId: z.string(),
  status: caseStatusSchema,
  nextStatus: caseStatusSchema,
});
type Schema = z.infer<typeof schema>;

export async function action({ request }: ActionArgs) {
  const { authService } = serverServices;
  const { cases } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const formData = await request.formData();
  const submission = parse(formData, { schema });

  if (submission.intent !== 'submit' || !submission.value) {
    return json(submission);
  }

  await cases.updateCase({
    caseId: submission.value.caseId,
    body: { status: submission.value.nextStatus },
  });

  return json(submission);
}

export function EditCaseStatus({
  status,
  caseId,
}: Pick<Schema, 'caseId' | 'status'>) {
  const { t } = useTranslation(handle.i18n);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hasOpenDialog, setHasOpenDialog] = useState(false);
  const dropdownTriggerRef = useRef<HTMLButtonElement>(null);
  const focusRef = useRef<HTMLButtonElement | null>(null);

  function handleDialogItemSelect() {
    focusRef.current = dropdownTriggerRef.current;
  }

  function handleDialogItemOpenChange(open: boolean) {
    setHasOpenDialog(open);
    if (open === false) {
      setDropdownOpen(false);
    }
  }

  const caseStatus = caseStatusMapping[status];
  const statuses = useCaseStatuses();
  const nextStatuses = useMemo(
    () => statuses.filter((nextStatus) => nextStatus.value !== status),
    [statuses, status],
  );

  return (
    <DropdownMenu.Root open={dropdownOpen} onOpenChange={setDropdownOpen}>
      <div className="flex flex-row items-center gap-4">
        <span className="text-s text-grey-100 font-medium capitalize">
          {t('cases:case.status')}
        </span>
        <DropdownMenu.Trigger
          ref={dropdownTriggerRef}
          className={caseStatusVariants({
            color: caseStatusMapping[status].color,
            variant: 'contained',
            className:
              'group flex h-10 flex-row items-center gap-1 rounded px-2',
          })}
        >
          <span className="text-s ml-2 font-semibold capitalize">
            {t(caseStatus.tKey)}
          </span>
          <Arrow2Down
            height="24px"
            width="24px"
            className="group-radix-state-open:rotate-180"
          />
        </DropdownMenu.Trigger>
      </div>
      <DropdownMenu.Content
        className="bg-grey-00 border-grey-10 rounded border p-2 shadow-md will-change-[transform,opacity]"
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
          {nextStatuses.map((nextStatus) => (
            <Modal.Root
              key={nextStatus.value}
              onOpenChange={handleDialogItemOpenChange}
            >
              <Modal.Trigger asChild>
                <DropdownMenu.Item
                  className="radix-highlighted:bg-purple-05 flex flex-row gap-2 rounded p-2 outline-none transition-colors"
                  onSelect={(event) => {
                    handleDialogItemSelect();
                    event.preventDefault();
                  }}
                >
                  <CaseStatus status={nextStatus.value} />
                  <span className="text-s text-grey-100 first-letter:capitalize">
                    {nextStatus.label}
                  </span>
                </DropdownMenu.Item>
              </Modal.Trigger>
              <Modal.Content>
                <ModalContent
                  caseId={caseId}
                  status={status}
                  nextStatus={nextStatus.value}
                  onSubmitSuccess={() => {
                    handleDialogItemOpenChange(false);
                  }}
                />
              </Modal.Content>
            </Modal.Root>
          ))}
        </div>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

function ModalContent({
  status,
  caseId,
  nextStatus,
  onSubmitSuccess,
}: Schema & { onSubmitSuccess: () => void }) {
  const { t } = useTranslation(handle.i18n);
  const fetcher = useFetcher<typeof action>();

  const formId = useId();
  const [form, fieldset] = useForm({
    id: formId,
    defaultValue: { caseId, status, nextStatus },
    lastSubmission: fetcher.data,
    constraint: getFieldsetConstraint(schema),
    onValidate({ formData }) {
      return parse(formData, {
        schema,
      });
    },
  });

  useEffect(() => {
    if (fetcher.data?.intent === 'submit' && fetcher.data?.value) {
      onSubmitSuccess();
    }
  }, [fetcher.data?.intent, fetcher.data?.value, onSubmitSuccess]);

  return (
    <fetcher.Form
      method="post"
      action={getRoute('/ressources/cases/edit-status')}
      {...form.props}
    >
      <Modal.Title>{t('cases:change_status_modal.title')}</Modal.Title>
      <div className="bg-grey-00 flex flex-col gap-8 p-8">
        <input {...conform.input(fieldset.caseId, { type: 'hidden' })} />
        <input {...conform.input(fieldset.status, { type: 'hidden' })} />
        <input {...conform.input(fieldset.nextStatus, { type: 'hidden' })} />
        <div className="text-grey-100 text-s flex flex-row items-center justify-center gap-6 font-medium capitalize">
          <div className="flex w-full flex-1 flex-row items-center justify-end gap-2">
            <Trans
              t={t}
              i18nKey="cases:change_status_modal.description.from"
              components={{
                Status: (
                  <span
                    className={caseStatusVariants({
                      color: caseStatusMapping[status].color,
                      variant: 'contained',
                      className: 'flex h-10 w-fit items-center rounded px-2',
                    })}
                  />
                ),
              }}
              values={{
                status: t(caseStatusMapping[status].tKey),
              }}
            />
          </div>
          <div className="flex flex-1 flex-row items-center justify-start gap-2">
            <Trans
              t={t}
              i18nKey="cases:change_status_modal.description.to"
              components={{
                Status: (
                  <span
                    className={caseStatusVariants({
                      color: caseStatusMapping[status].color,
                      variant: 'contained',
                      className: 'flex h-10 w-fit items-center rounded px-2',
                    })}
                  />
                ),
              }}
              values={{
                status: t(caseStatusMapping[nextStatus].tKey),
              }}
            />
          </div>
        </div>
        <div className="flex w-full flex-row gap-2">
          <Modal.Close asChild>
            <Button
              variant="secondary"
              className="flex-1 first-letter:capitalize"
            >
              {t('common:close')}
            </Button>
          </Modal.Close>

          <Button type="submit" className="flex-1 first-letter:capitalize">
            {t('cases:change_status_modal.change_status')}
          </Button>
        </div>
      </div>
    </fetcher.Form>
  );
}
