import { casesI18n } from '@app-builder/components/Cases/cases-i18n';
import { initServerServices } from '@app-builder/services/init.server';
import { useOrganizationTags } from '@app-builder/services/organization/organization-tags';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { useForm } from '@tanstack/react-form';
import { type Namespace } from 'i18next';
import { type Tag } from 'marble-api';
import { pick, toggle } from 'radash';
import { useMemo, useState } from 'react';
import { Button, MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

export const handle = {
  i18n: [...casesI18n, 'common'] satisfies Namespace,
};

const schema = z.object({
  caseId: z.string(),
  tagIds: z.array(z.string()),
});

type SimpleTag = Pick<Tag, 'color' | 'id' | 'name'>;

export async function action({ request }: ActionFunctionArgs) {
  const { authService } = initServerServices(request);

  const [raw, { cases }] = await Promise.all([
    request.json(),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const { success, data, error } = schema.safeParse(raw);

  if (!success) return { success: false, errors: error.flatten() };

  await cases.setTags(data);

  return { success: true };
}

const TagPreview = ({ name, onClear }: { name: string; onClear?: () => void }) => (
  <div className="bg-purple-96 flex size-fit flex-row items-center gap-2 rounded-full px-2 py-1">
    <span className="text-purple-65 text-xs font-normal">{name}</span>
    {onClear ? (
      <Icon onClick={onClear} icon="cross" className="text-purple-65 size-4 cursor-pointer" />
    ) : null}
  </div>
);

export const EditCaseTags = ({ caseId, tagIds }: { caseId: string; tagIds: string[] }) => {
  const { submit } = useFetcher<typeof action>();
  const { orgTags } = useOrganizationTags();
  const [open, setOpen] = useState(false);

  const formattedTags = useMemo(
    () =>
      orgTags.reduce(
        (acc, curr) => {
          acc[curr.id] = pick(curr, ['color', 'id', 'name']);
          return acc;
        },
        {} as Record<string, SimpleTag>,
      ),
    [orgTags],
  );

  const form = useForm({
    onSubmit: ({ value }) =>
      submit(value, {
        method: 'PATCH',
        action: getRoute('/ressources/cases/edit-tags'),
        encType: 'application/json',
      }),
    defaultValues: { caseId, tagIds },
    validators: {
      onChange: schema,
      onBlur: schema,
      onSubmit: schema,
    },
  });

  return (
    <form.Field name="tagIds">
      {(field) => (
        <div className="flex items-center gap-2">
          {field.state.value.map((id) => (
            <TagPreview
              key={id}
              name={formattedTags[id]!.name}
              onClear={() => {
                field.handleChange(toggle(field.state.value, id));
                form.handleSubmit();
              }}
            />
          ))}
          <MenuCommand.Menu open={open} onOpenChange={setOpen}>
            <MenuCommand.Trigger>
              <Button className="w-fit px-1" variant="secondary" size="icon">
                <Icon icon="edit-square" className="size-4" />
              </Button>
            </MenuCommand.Trigger>
            <MenuCommand.Content sameWidth className="mt-2" side="bottom">
              <MenuCommand.List>
                {orgTags.map(({ id }) => (
                  <MenuCommand.Item
                    key={id}
                    onSelect={() => {
                      field.handleChange(toggle(field.state.value, id));
                      form.handleSubmit();
                    }}
                  >
                    <TagPreview key={id} name={formattedTags[id]!.name} />
                  </MenuCommand.Item>
                ))}
              </MenuCommand.List>
            </MenuCommand.Content>
          </MenuCommand.Menu>
        </div>
      )}
    </form.Field>
  );
};
