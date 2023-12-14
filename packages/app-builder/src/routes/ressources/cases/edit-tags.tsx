import { CaseTag, CaseTags } from '@app-builder/components/Cases/CaseTags';
import { FormSelectWithCombobox } from '@app-builder/components/Form/FormSelectWithCombobox';
import { serverServices } from '@app-builder/services/init.server';
import { useOrganizationTags } from '@app-builder/services/organization/organization-tags';
import { getRoute } from '@app-builder/utils/routes';
import { stringToStringArray } from '@app-builder/utils/schema/stringToJSONSchema';
import { conform, useForm } from '@conform-to/react';
import { parse } from '@conform-to/zod';
import { type ActionArgs, json } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { matchSorter } from 'match-sorter';
import { useDeferredValue, useId, useMemo, useState } from 'react';
import { Input, ScrollArea } from 'ui-design-system';
import { z } from 'zod';

const schema = z.object({
  caseTagIds: stringToStringArray,
  caseId: z.string(),
});

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
  await cases.setTags({
    caseId: submission.value.caseId,
    tagIds: submission.value.caseTagIds,
  });

  return json(submission);
}

export function EditCaseTags({
  defaultCaseTagIds,
  caseId,
}: {
  defaultCaseTagIds: string[];
  caseId: string;
}) {
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
        setSearchValue={setSearchValue}
        onSelectedValuesChange={(selectedValues) => {
          setCaseTagIds(selectedValues);
        }}
        onOpenChange={(open) => {
          if (!open) form.ref.current?.requestSubmit();
        }}
      >
        <FormSelectWithCombobox.Trigger className="w-full">
          <CaseTags caseTagIds={caseTagIds} />
        </FormSelectWithCombobox.Trigger>
        <FormSelectWithCombobox.Content>
          <div className="flex flex-col gap-2 p-2">
            <FormSelectWithCombobox.Combobox
              render={<Input />}
              autoSelect
              autoFocus
            />
            <ScrollArea.Viewport className="max-h-40">
              <FormSelectWithCombobox.ComboboxList>
                {matches.map((tag) => (
                  <FormSelectWithCombobox.ComboboxItem
                    key={tag.id}
                    value={tag.id}
                  >
                    <CaseTag tagId={tag.id} />
                  </FormSelectWithCombobox.ComboboxItem>
                ))}
              </FormSelectWithCombobox.ComboboxList>
            </ScrollArea.Viewport>
          </div>
        </FormSelectWithCombobox.Content>
      </FormSelectWithCombobox.Root>
    </fetcher.Form>
  );
}
