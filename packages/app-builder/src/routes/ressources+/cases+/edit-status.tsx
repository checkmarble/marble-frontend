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
import { getFormProps, getInputProps, useForm } from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
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
  nextStatus: z.enum(caseStatuses),
});
type Schema = z.infer<typeof schema>;

export async function action({ request }: ActionFunctionArgs) {
  const { authService } = serverServices;
  const { cases } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema });

  if (submission.status !== 'success') {
    return json(submission.reply());
  }

  await cases.updateCase({
    caseId: submission.value.caseId,
    body: { status: submission.value.nextStatus },
  });

  return json(submission.reply());
}

export function EditCaseStatus({ status, caseId }: Pick<Schema, 'caseId' | 'status'>) {
  const { t } = useTranslation(handle.i18n);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [hasOpenDialog, setHasOpenDialog] = React.useState(false);
  const dropdownTriggerRef = React.useRef<HTMLButtonElement>(null);
  const focusRef = React.useRef<HTMLButtonElement | null>(null);

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
  const nextStatuses = React.useMemo(
    () => statuses.filter((nextStatus) => nextStatus.value !== status),
    [statuses, status],
  );

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
          <span className="text-s ml-2 font-semibold capitalize">{t(caseStatus.tKey)}</span>
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
          {nextStatuses.map((nextStatus) => (
            <Modal.Root key={nextStatus.value} onOpenChange={handleDialogItemOpenChange}>
              <Modal.Trigger asChild>
                <DropdownMenu.Item
                  className="radix-highlighted:bg-purple-98 flex flex-row items-center gap-2 rounded p-2 align-baseline outline-none transition-colors"
                  onSelect={(event) => {
                    handleDialogItemSelect();
                    event.preventDefault();
                  }}
                >
                  <CaseStatus type="full" size="big" status={nextStatus.value} />
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

  const [form, fields] = useForm({
    defaultValue: { caseId, status, nextStatus },
    lastResult: fetcher.data,
    constraint: getZodConstraint(schema),
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema,
      });
    },
  });

  React.useEffect(() => {
    if (fetcher.data?.status === 'success') {
      onSubmitSuccess();
    }
  }, [fetcher.data?.intent, fetcher.data?.status, onSubmitSuccess]);

  return (
    <fetcher.Form
      method="post"
      action={getRoute('/ressources/cases/edit-status')}
      {...getFormProps(form)}
    >
      <Modal.Title>{t('cases:change_status_modal.title')}</Modal.Title>
      <div className="flex flex-col gap-6 p-6">
        <input {...getInputProps(fields.caseId, { type: 'hidden' })} key={fields.caseId.key} />
        <input {...getInputProps(fields.status, { type: 'hidden' })} key={fields.status.key} />
        <input
          {...getInputProps(fields.nextStatus, { type: 'hidden' })}
          key={fields.nextStatus.key}
        />
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

          <Button type="submit" className="flex-1 first-letter:capitalize">
            {t('cases:change_status_modal.change_status')}
          </Button>
        </div>
      </div>
    </fetcher.Form>
  );
}
