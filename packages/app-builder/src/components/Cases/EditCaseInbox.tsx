import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { type Inbox } from '@app-builder/models/inbox';
import { EditInboxPayload, editInboxPayloadSchema, useEditInboxMutation } from '@app-builder/queries/cases/edit-inbox';
import { getFieldErrors } from '@app-builder/utils/form';
import { useForm, useStore } from '@tanstack/react-form';
import { useMemo, useState } from 'react';
import { Button, MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const EditCaseInbox = ({ inboxId, id, inboxes }: { inboxId: string; id: string; inboxes: Inbox[] }) => {
  const editInboxMutation = useEditInboxMutation();
  const revalidate = useLoaderRevalidator();
  const [open, setOpen] = useState(false);

  const form = useForm({
    onSubmit: ({ value }) => {
      editInboxMutation.mutateAsync(value).then(() => {
        revalidate();
      });
    },
    defaultValues: { inboxId, caseId: id } as EditInboxPayload,
    validators: {
      onSubmit: editInboxPayloadSchema,
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
      validators={{
        onBlur: editInboxPayloadSchema.shape.inboxId,
        onChange: editInboxPayloadSchema.shape.inboxId,
      }}
    >
      {(field) => (
        <div className="flex w-full gap-1">
          <div className="flex items-center gap-2">
            {selectedInbox ? <span className="text-xs font-medium">{selectedInbox.name}</span> : null}
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
                        {id === selectedInboxId ? <Icon icon="tick" className="text-purple-65 size-6" /> : null}
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
