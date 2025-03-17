import { CaseContributors } from '@app-builder/components/Cases/CaseContributors';
import { SelectCaseTags } from '@app-builder/components/Cases/CaseTags';
import { FormInput } from '@app-builder/components/Form/Tanstack/FormInput';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { type CaseDetail } from '@app-builder/models/cases';
import { type Inbox } from '@app-builder/models/inbox';
import { serverServices } from '@app-builder/services/init.server';
import { useOrganizationTags } from '@app-builder/services/organization/organization-tags';
import { formatDateTime, useFormatLanguage } from '@app-builder/utils/format';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { useForm } from '@tanstack/react-form';
import { pick } from 'radash';
import { useTranslation } from 'react-i18next';
import { Button, Select } from 'ui-design-system';
import { z } from 'zod';

const editInboxSchema = z.object({
  id: z.string(),
  tags: z.array(z.string()),
  inboxId: z.string().min(1),
  name: z.string().min(1),
  tagsHasChanged: z.boolean(),
});

type EditInboxForm = z.infer<typeof editInboxSchema>;

export async function action({ request }: ActionFunctionArgs) {
  const {
    authService,
    i18nextService: { getFixedT },
    toastSessionService: { getSession, commitSession },
  } = serverServices;

  const [t, session, rawData, { cases }] = await Promise.all([
    getFixedT(request, ['common']),
    getSession(request),
    request.json(),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const { data, success, error } = editInboxSchema.safeParse(rawData);

  if (!success) {
    return json(
      { status: 'error', errors: error.flatten() },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  }

  try {
    const promises = [
      cases.updateCase({
        caseId: data.id,
        body: pick(data, ['inboxId', 'name']),
      }),
    ];

    if (data.tagsHasChanged) {
      promises.push(
        cases.setTags({
          caseId: data.id,
          tagIds: data.tags,
        }),
      );
    }

    await Promise.all(promises);

    setToastMessage(session, {
      type: 'success',
      message: t('common:success.save'),
    });

    return json(
      { status: 'success', errors: [] },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  } catch (error) {
    setToastMessage(session, {
      type: 'error',
      message: t('common:errors.unknown'),
    });

    return json(
      { status: 'error', errors: [] },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  }
}

export function EditCase({ detail, inboxes }: { detail: CaseDetail; inboxes: Inbox[] }) {
  const { t } = useTranslation(['common', 'cases']);
  const fetcher = useFetcher<typeof action>();
  const language = useFormatLanguage();
  const { orgTags } = useOrganizationTags();

  const form = useForm({
    defaultValues: {
      ...pick(detail, ['id', 'name', 'inboxId']),
      tags: detail.tags.map(({ tagId }) => tagId),
      tagsHasChanged: false,
    } as EditInboxForm,
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        fetcher.submit(value, {
          method: 'POST',
          action: getRoute('/ressources/cases/edit'),
          encType: 'application/json',
        });
        formApi.setFieldValue('tagsHasChanged', false);
      }
    },
    validators: {
      onChange: editInboxSchema,
      onBlur: editInboxSchema,
      onSubmit: editInboxSchema,
    },
  });

  return (
    <form
      className="bg-grey-100 border-grey-90 grid grid-cols-[max-content_1fr] grid-rows-[repeat(5,_minmax(40px,_min-content))] items-center gap-2 rounded-lg border p-4 lg:p-6"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <form.Field name="name">
        {(field) => (
          <div className="col-span-2 grid grid-cols-subgrid items-center">
            <FormLabel name={field.name} className="text-s font-semibold first-letter:capitalize">
              {t('cases:case.name')}
            </FormLabel>
            <FormInput
              type="text"
              name={field.name}
              defaultValue={field.state.value}
              autoComplete="off"
              onBlur={field.handleBlur}
              valid={field.state.meta.errors.length === 0}
              onChange={(e) => field.handleChange(e.currentTarget.value)}
            />
          </div>
        )}
      </form.Field>

      <div className="text-s font-semibold first-letter:capitalize">{t('cases:case.date')}</div>
      <time dateTime={detail.createdAt}>
        {formatDateTime(detail.createdAt, {
          language,
          timeStyle: undefined,
        })}
      </time>

      <form.Field name="inboxId">
        {(field) => (
          <div className="col-span-2 grid grid-cols-subgrid items-center">
            <FormLabel name={field.name} className="text-s font-semibold first-letter:capitalize">
              {t('cases:case.inbox')}
            </FormLabel>
            <Select.Default
              className="w-full"
              defaultValue={field.state.value}
              onValueChange={field.handleChange}
            >
              {inboxes.map((inbox) => (
                <Select.DefaultItem key={inbox.id} value={inbox.id}>
                  {inbox.name}
                </Select.DefaultItem>
              ))}
            </Select.Default>
          </div>
        )}
      </form.Field>

      <form.Field name="tags">
        {(field) => (
          <div className="col-span-2 grid grid-cols-subgrid items-center">
            <FormLabel name={field.name} className="text-s font-semibold first-letter:capitalize">
              {t('cases:case.tags')}
            </FormLabel>
            <SelectCaseTags
              name={field.name}
              orgTags={orgTags}
              selectedTagIds={field.state.value}
              onChange={(newTags) => {
                field.handleChange(newTags);
                form.setFieldValue('tagsHasChanged', true);
              }}
            />
          </div>
        )}
      </form.Field>

      <div className="text-s font-semibold first-letter:capitalize">
        {t('cases:case.contributors')}
      </div>
      <CaseContributors contributors={detail.contributors} />

      <Button type="submit" className="flex-1">
        {t('common:save')}
      </Button>
    </form>
  );
}
