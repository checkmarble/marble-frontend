import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { EditInboxPayload, editInboxPayloadSchema, useEditInboxMutation } from '@app-builder/queries/cases/edit-inbox';
import { useGetInboxesQuery } from '@app-builder/queries/cases/get-inboxes';
import { getFieldErrors } from '@app-builder/utils/form';
import { useForm, useStore } from '@tanstack/react-form';
import { useState } from 'react';
import { match } from 'ts-pattern';
import { Button, MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { Spinner } from '../Spinner';

export const EditCaseInbox = ({ inboxId, id }: { inboxId: string; id: string }) => {
  const editInboxMutation = useEditInboxMutation();
  const revalidate = useLoaderRevalidator();
  const inboxesQuery = useGetInboxesQuery();
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
  const selectedInbox = inboxesQuery.data?.inboxes.find(({ id: inboxId }) => inboxId === selectedInboxId) ?? null;

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
            {selectedInbox ? <span>{selectedInbox.name}</span> : null}
            <MenuCommand.Menu open={open} onOpenChange={setOpen}>
              <MenuCommand.Trigger>
                <Button disabled={!inboxesQuery.isSuccess} className="w-fit p-0.5" variant="secondary" size="icon">
                  <Icon icon="edit-square" className="text-grey-secondary size-4" />
                </Button>
              </MenuCommand.Trigger>
              <MenuCommand.Content className="mt-2 min-w-[250px]">
                {match(inboxesQuery)
                  .with({ isPending: true }, () => <Spinner className="size-4" />)
                  .with({ isError: true }, () => <div>Error...</div>)
                  .with({ isSuccess: true }, ({ data }) => {
                    return (
                      <MenuCommand.List>
                        {data.inboxes.map(({ id, name }) => (
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
                                <Icon icon="tick" className="text-purple-primary size-6" />
                              ) : null}
                            </span>
                          </MenuCommand.Item>
                        ))}
                      </MenuCommand.List>
                    );
                  })
                  .exhaustive()}
              </MenuCommand.Content>
            </MenuCommand.Menu>
          </div>
          <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
        </div>
      )}
    </form.Field>
  );
};
