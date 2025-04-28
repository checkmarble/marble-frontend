import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { type CurrentUser } from '@app-builder/models';
import { initServerServices } from '@app-builder/services/init.server';
import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { getFieldErrors } from '@app-builder/utils/form';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { useForm, useStore } from '@tanstack/react-form';
import { capitalize } from 'radash';
import { useMemo, useState } from 'react';
import { Avatar, Button, MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

const schema = z.object({ assigneeId: z.string().nullable(), caseId: z.string() });

type EditAssigneeIdForm = z.infer<typeof schema>;

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

  if (data.assigneeId) {
    await cases.assignUser({
      caseId: data.caseId,
      userId: data.assigneeId,
    });
  } else {
    await cases.unassignUser({
      caseId: data.caseId,
    });
  }

  return { success: true, errors: [] };
}

export const EditCaseAssignee = ({
  assigneeId,
  currentUser,
  id,
}: {
  assigneeId?: string;
  currentUser: CurrentUser;
  id: string;
}) => {
  const { submit } = useFetcher<typeof action>();
  const [open, setOpen] = useState(false);
  const { getOrgUserById, orgUsers } = useOrganizationUsers();

  const form = useForm({
    onSubmit: ({ value }) =>
      submit(value, {
        method: 'PATCH',
        action: getRoute('/ressources/cases/edit-assignee'),
        encType: 'application/json',
      }),
    defaultValues: { assigneeId, caseId: id } as EditAssigneeIdForm,
    validators: {
      onChange: schema,
      onBlur: schema,
      onSubmit: schema,
    },
  });

  const selectedUserId = useStore(form.store, (state) => state.values.assigneeId);

  const assignee = useMemo(
    () => (selectedUserId ? getOrgUserById(selectedUserId) : null),
    [selectedUserId, getOrgUserById],
  );

  return (
    <form.Field name="assigneeId">
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
            ) : (
              <Button
                variant="secondary"
                size="small"
                onClick={() => field.handleChange(currentUser.actorIdentity.userId as string)}
              >
                <Icon icon="plus" className="text-grey-50 size-4" />
                <span className="text-grey-50 text-xs">Assigned to me</span>
              </Button>
            )}
            <MenuCommand.Menu open={open} onOpenChange={setOpen}>
              <MenuCommand.Trigger>
                <Button variant="secondary" size={assignee ? 'icon' : 'small'}>
                  <Icon icon={assignee ? 'edit-square' : 'plus'} className="text-grey-50 size-4" />
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
          </div>
          <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
        </div>
      )}
    </form.Field>
  );
};
