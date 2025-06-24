import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { type Inbox } from '@app-builder/models/inbox';
import { initServerServices } from '@app-builder/services/init.server';
import { getFieldErrors } from '@app-builder/utils/form';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { useForm, useStore } from '@tanstack/react-form';
import { useMemo, useState } from 'react';
import { Button, MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

const schema = z.object({ inboxId: z.string(), caseId: z.string() });

type EditInboxIdForm = z.infer<typeof schema>;

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

  await cases.updateCase({
    caseId: data.caseId,
    body: { inboxId: data.inboxId },
  });

  return { success: true, errors: [] };
}

export const EditCaseInbox = ({
  inboxId,
  id,
  inboxes,
}: {
  inboxId: string;
  id: string;
  inboxes: Inbox[];
}) => {
  const { submit } = useFetcher<typeof action>();
  const [open, setOpen] = useState(false);

  const form = useForm({
    onSubmit: ({ value }) =>
      submit(value, {
        method: 'PATCH',
        action: getRoute('/ressources/cases/edit-inbox'),
        encType: 'application/json',
      }),
    defaultValues: { inboxId, caseId: id } as EditInboxIdForm,
    validators: {
      onSubmit: schema,
    },
  });

  const selectedInboxId = useStore(form.store, (state) => state.values.inboxId);

  const selectedInbox = useMemo(
    () => inboxes.find(({ id: inboxId }) => inboxId === selectedInboxId) as Inbox,
    [inboxes, selectedInboxId],
  );

  return (
    <form.Field
      name="inboxId"
      validators={{ onBlur: schema.shape.inboxId, onChange: schema.shape.inboxId }}
    >
      {(field) => (
        <div className="flex w-full gap-1">
          <div className="flex items-center gap-2">
            {selectedInbox ? (
              <span className="text-xs font-medium">{selectedInbox.name}</span>
            ) : null}
            <MenuCommand.Menu open={open} onOpenChange={setOpen}>
              <MenuCommand.Trigger>
                <Button className="w-fit p-0.5" variant="secondary" size="icon">
                  <Icon icon="edit-square" className="text-grey-50 size-4" />
                </Button>
              </MenuCommand.Trigger>
              <MenuCommand.Content className="mt-2 min-w-[250px]">
                <MenuCommand.List>
                  {inboxes.map(({ id, name }) => (
                    <MenuCommand.Item
                      key={id}
                      className="cursor-pointer"
                      onSelect={() => {
                        field.handleChange(id);
                        form.handleSubmit();
                      }}
                    >
                      <span className="inline-flex w-full justify-between">
                        <span className="text-s">{name}</span>
                        {id === selectedInboxId ? (
                          <Icon icon="tick" className="text-purple-65 size-6" />
                        ) : null}
                      </span>
                    </MenuCommand.Item>
                  ))}
                </MenuCommand.List>
              </MenuCommand.Content>
            </MenuCommand.Menu>
          </div>
          <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
        </div>
      )}
    </form.Field>
  );
};
