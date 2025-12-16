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
import { Avatar, ButtonV2, MenuCommand } from 'ui-design-system';
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
              <ButtonV2
                variant="secondary"
                onClick={() => {
                  field.handleChange(currentUser.actorIdentity.userId as string);
                  form.handleSubmit();
                }}
              >
                <Icon icon="plus" className="text-grey-placeholder size-4" />
                <span className="text-grey-placeholder text-xs">
                  {t('cases:case_detail.assign_to_myself_button.label')}
                </span>
              </ButtonV2>
            ) : null}
            {!disabled ? (
              <MenuCommand.Menu open={open} onOpenChange={setOpen}>
                <MenuCommand.Trigger>
                  <ButtonV2 variant="secondary" mode={assignee ? 'icon' : 'normal'}>
                    <Icon icon={assignee ? 'edit-square' : 'plus'} className="text-grey-placeholder size-4" />
                    {!assignee ? <span className="text-grey-placeholder text-xs">Add</span> : null}
                  </ButtonV2>
                </MenuCommand.Trigger>
                <MenuCommand.Content sameWidth className="mt-2">
                  <MenuCommand.Combobox placeholder="Search..." />
                  <MenuCommand.List>
                    {orgUsers.map(({ userId, firstName, lastName }) => (
                      <MenuCommand.Item
                        key={userId}
                        className="cursor-pointer"
                        value={userId}
                        onSelect={() => {
                          field.handleChange(userId === selectedUserId ? null : userId);
                          form.handleSubmit();
                        }}
                      >
                        <span className="inline-flex w-full justify-between">
                          <span>{`${capitalize(firstName)} ${capitalize(lastName)}`}</span>
                          {userId === selectedUserId ? (
                            <Icon icon="tick" className="text-purple-primary size-6" />
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
