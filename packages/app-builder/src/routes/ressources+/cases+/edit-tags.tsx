import { FormSelectCaseTags } from '@app-builder/components/Cases/CaseTags';
import { FormField } from '@app-builder/components/Form/FormField';
import { FormLabel } from '@app-builder/components/Form/FormLabel';
import { FormSelectWithCombobox } from '@app-builder/components/Form/FormSelectWithCombobox';
import { type CurrentUser, isAdmin } from '@app-builder/models';
import { serverServices } from '@app-builder/services/init.server';
import { useOrganizationTags } from '@app-builder/services/organization/organization-tags';
import { getRoute } from '@app-builder/utils/routes';
import {
  FormProvider,
  getFormProps,
  getInputProps,
  useForm,
} from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import * as Tooltip from '@radix-ui/react-tooltip';
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { Link, useFetcher } from '@remix-run/react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Icon } from 'ui-icons';
import { z } from 'zod';

const schema = z.object({
  caseTagIds: z.array(z.string()),
  caseId: z.string(),
});

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

  await cases.setTags({
    caseId: submission.value.caseId,
    tagIds: submission.value.caseTagIds,
  });

  return json(submission.reply());
}

export function EditCaseTags({
  defaultCaseTagIds,
  caseId,
  user,
}: {
  defaultCaseTagIds: string[];
  caseId: string;
  user: CurrentUser;
}) {
  const { t } = useTranslation(['cases']);
  const fetcher = useFetcher<typeof action>();

  const formRef = React.useRef<HTMLFormElement>(null);
  const [form, fields] = useForm({
    defaultValue: { caseTagIds: defaultCaseTagIds, caseId },
    lastResult: fetcher.data,
    constraint: getZodConstraint(schema),
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema,
      });
    },
  });

  const { orgTags } = useOrganizationTags();
  const orgTagIds = React.useMemo(
    () => orgTags.map((tag) => tag.id),
    [orgTags],
  );

  const notTags = orgTags.length === 0;
  if (notTags) {
    return (
      <>
        <div className="text-s font-semibold first-letter:capitalize">
          {t('cases:case.tags')}
        </div>
        <div className="flex flex-row gap-2">
          <p className="bg-grey-00 text-s text-grey-25">
            {t('cases:case_detail.empty_tag_list')}
          </p>

          <Tooltip.Root delayDuration={0}>
            <Tooltip.Trigger tabIndex={-1}>
              <Icon
                icon="tip"
                className="text-grey-10 size-5 shrink-0 outline-none transition-colors hover:text-purple-100"
              />
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                side="right"
                sideOffset={4}
                className="bg-grey-00 border-grey-10 flex max-h-[400px] max-w-[300px] overflow-y-auto overflow-x-hidden rounded border p-2 shadow-md"
              >
                {isAdmin(user) ? (
                  <Link
                    to={getRoute('/settings/tags')}
                    className="text-purple-100 underline"
                  >
                    {t('cases:case_detail.empty_tag_list.create_tag')}
                  </Link>
                ) : (
                  <p className="bg-grey-00 text-s text-grey-50">
                    {t('cases:case_detail.empty_tag_list.info')}
                  </p>
                )}
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </div>
      </>
    );
  }

  return (
    <FormProvider context={form.context}>
      <fetcher.Form
        ref={formRef}
        method="post"
        className="col-span-2 grid grid-cols-subgrid"
        action={getRoute('/ressources/cases/edit-tags')}
        {...getFormProps(form)}
      >
        <input
          {...getInputProps(fields.caseId, { type: 'hidden' })}
          key={fields.caseId.key}
        />
        <FormField
          name={fields.caseTagIds.name}
          className="col-span-2 grid grid-cols-subgrid items-center"
        >
          <FormLabel className="text-s font-semibold first-letter:capitalize">
            {t('cases:case.tags')}
          </FormLabel>
          <FormSelectWithCombobox.Control
            options={orgTagIds}
            render={({ selectedValues }) => (
              <FormSelectCaseTags
                orgTags={orgTags}
                selectedTagIds={selectedValues}
                onOpenChange={(open) => {
                  if (
                    !open &&
                    !R.isDeepEqual(defaultCaseTagIds, selectedValues)
                  )
                    formRef.current?.requestSubmit();
                }}
              />
            )}
          />
        </FormField>
      </fetcher.Form>
    </FormProvider>
  );
}
