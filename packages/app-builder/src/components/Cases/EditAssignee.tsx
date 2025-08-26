import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { type CurrentUser } from '@app-builder/models';
import {
  EditAssigneePayload,
  editAssigneePayloadSchema,
  useEditAssigneeMutation,
} from '@app-builder/queries/cases/edit-assignee';
import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { getFieldErrors } from '@app-builder/utils/form';
import { useForm, useStore } from '@tanstack/react-form';
import { capitalize } from 'radash';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, Button, MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const EditCaseAssignee = ({
  disabled,
  assigneeId,
  currentUser,
  id,
}: {
  disabled: boolean;
  assigneeId?: string;
  currentUser: CurrentUser;
  id: string;
}) => {
  const { t } = useTranslation(['cases']);
  const editAssigneeMutation = useEditAssigneeMutation();
  const revalidate = useLoaderRevalidator();
  const [open, setOpen] = useState(false);
  const { getOrgUserById, orgUsers } = useOrganizationUsers();

  const form = useForm({
    defaultValues: { assigneeId, caseId: id } as EditAssigneePayload,
    onSubmit: ({ value }) => {
      editAssigneeMutation.mutateAsync(value).then(() => {
        revalidate();
      });
    },
    validators: {
      onSubmit: editAssigneePayloadSchema,
    },
  });

  const selectedUserId = useStore(form.store, (state) => state.values.assigneeId);

  const assignee = useMemo(
    () => (selectedUserId ? getOrgUserById(selectedUserId) : null),
    [selectedUserId, getOrgUserById],
  );

  return (
    <form.Field
      name="assigneeId"
      validators={{
        onBlur: editAssigneePayloadSchema.shape.assigneeId,
        onChange: editAssigneePayloadSchema.shape.assigneeId,
      }}
    >
      {(field) => (
        <div className="flex w-full gap-1">
          <div className="flex items-center gap-2">
            {assignee ? (
              <span className="inline-flex items-center gap-1">
                <Avatar size="xs" firstName={assignee?.firstName} lastName={assignee?.lastName} />
                <span className="inline-flex gap-0.5 text-xs font-medium">
                  {`${capitalize(assignee?.firstName)} ${capitalize(assignee?.lastName)}`}
                  {currentUser.actorIdentity.userId === assignee?.userId ? (
                    <span className="text-xs font-medium">(you)</span>
                  ) : null}
                </span>
              </span>
            ) : !disabled ? (
              <Button
                variant="secondary"
                size="xs"
                onClick={() => {
                  field.handleChange(currentUser.actorIdentity.userId as string);
                  form.handleSubmit();
                }}
              >
                <Icon icon="plus" className="text-grey-50 size-4" />
                <span className="text-grey-50 text-xs">
                  {t('cases:case_detail.assign_to_myself_button.label')}
                </span>
              </Button>
            ) : null}
            {!disabled ? (
              <MenuCommand.Menu open={open} onOpenChange={setOpen}>
                <MenuCommand.Trigger>
                  <Button variant="secondary" size={assignee ? 'icon' : 'xs'}>
                    <Icon
                      icon={assignee ? 'edit-square' : 'plus'}
                      className="text-grey-50 size-4"
                    />
                    {!assignee ? <span className="text-grey-50 text-xs">Add</span> : null}
                  </Button>
                </MenuCommand.Trigger>
                <MenuCommand.Content sameWidth className="mt-2">
                  <MenuCommand.Combobox placeholder="Search..." />
                  <MenuCommand.List>
                    {orgUsers.map(({ userId, firstName, lastName }) => (
                      <MenuCommand.Item
                        key={userId}
                        className="cursor-pointer"
                        onSelect={() => {
                          field.handleChange(userId === selectedUserId ? null : userId);
                          form.handleSubmit();
                        }}
                      >
                        <span className="inline-flex w-full justify-between">
                          <span>{`${capitalize(firstName)} ${capitalize(lastName)}`}</span>
                          {userId === selectedUserId ? (
                            <Icon icon="tick" className="text-purple-65 size-6" />
                          ) : null}
                        </span>
                      </MenuCommand.Item>
                    ))}
                  </MenuCommand.List>
                </MenuCommand.Content>
              </MenuCommand.Menu>
            ) : null}
          </div>
          <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
        </div>
      )}
    </form.Field>
  );
};
