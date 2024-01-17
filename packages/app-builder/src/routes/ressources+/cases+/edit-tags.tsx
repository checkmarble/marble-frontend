import { CaseTag, CaseTags } from '@app-builder/components/Cases/CaseTags';
import { FormSelectWithCombobox } from '@app-builder/components/Form/FormSelectWithCombobox';
import { type CurrentUser, isAdmin } from '@app-builder/models';
import { serverServices } from '@app-builder/services/init.server';
import { useOrganizationTags } from '@app-builder/services/organization/organization-tags';
import { getRoute } from '@app-builder/utils/routes';
import { stringToStringArray } from '@app-builder/utils/schema/stringToJSONSchema';
import { conform, useForm } from '@conform-to/react';
import { parse } from '@conform-to/zod';
import * as Tooltip from '@radix-ui/react-tooltip';
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { Link, useFetcher } from '@remix-run/react';
import { matchSorter } from 'match-sorter';
import { useDeferredValue, useId, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Input } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

const schema = z.object({
  caseTagIds: stringToStringArray,
  caseId: z.string(),
});

export async function action({ request }: ActionFunctionArgs) {
  const { authService } = serverServices;
  const { cases } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const formData = await request.formData();
  const submission = parse(formData, { schema });

  if (submission.intent !== 'submit' || !submission.value) {
    return json(submission);
  }
  await cases.setTags({
    caseId: submission.value.caseId,
    tagIds: submission.value.caseTagIds,
  });

  return json(submission);
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

  const formId = useId();
  const [form, fields] = useForm({
    id: formId,
    defaultValue: { caseTagIds: defaultCaseTagIds, caseId },
    lastSubmission: fetcher.data,
    onValidate({ formData }) {
      return parse(formData, {
        schema,
      });
    },
  });

  const { orgTags } = useOrganizationTags();

  const [value, setSearchValue] = useState('');
  const [caseTagIds, setCaseTagIds] = useState(defaultCaseTagIds);
  const searchValue = useDeferredValue(value);

  const matches = useMemo(
    () => matchSorter(orgTags, searchValue, { keys: ['name'] }),
    [orgTags, searchValue],
  );

  const notTags = orgTags.length === 0;
  if (notTags) {
    return (
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
    );
  }

  return (
    <fetcher.Form
      method="post"
      className="w-full"
      action={getRoute('/ressources/cases/edit-tags')}
      {...form.props}
    >
      <input {...conform.input(fields.caseId, { type: 'hidden' })} />
      <FormSelectWithCombobox.Root
        config={fields.caseTagIds}
        searchValue={searchValue}
        onSearchValueChange={setSearchValue}
        onSelectedValueChange={(selectedValues) => {
          setCaseTagIds(selectedValues);
        }}
        onOpenChange={(open) => {
          if (!open && !R.equals(defaultCaseTagIds, caseTagIds))
            form.ref.current?.requestSubmit();
        }}
      >
        <FormSelectWithCombobox.Select className="w-full">
          <CaseTags caseTagIds={caseTagIds} />
          <FormSelectWithCombobox.Arrow />
        </FormSelectWithCombobox.Select>
        <FormSelectWithCombobox.Popover className="z-50 flex flex-col gap-2 p-2">
          <FormSelectWithCombobox.Combobox
            render={<Input className="shrink-0" />}
            autoSelect
            autoFocus
          />
          <FormSelectWithCombobox.ComboboxList>
            {matches.map((tag) => (
              <FormSelectWithCombobox.ComboboxItem key={tag.id} value={tag.id}>
                <CaseTag tagId={tag.id} />
              </FormSelectWithCombobox.ComboboxItem>
            ))}
            {matches.length === 0 ? (
              <p className="text-grey-50 flex items-center justify-center p-2">
                {t('cases:case_detail.tags.empty_matches')}
              </p>
            ) : null}
          </FormSelectWithCombobox.ComboboxList>
        </FormSelectWithCombobox.Popover>
      </FormSelectWithCombobox.Root>
    </fetcher.Form>
  );
}
