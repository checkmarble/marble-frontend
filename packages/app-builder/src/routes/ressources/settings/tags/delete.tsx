import { serverServices } from '@app-builder/services/init.server';
import { parseForm } from '@app-builder/utils/input-validation';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionArgs, redirect } from '@remix-run/node';
import { Form, useNavigation } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { type Tag } from 'marble-api';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from 'ui-design-system';
import { Delete } from 'ui-icons';
import { z } from 'zod';

export const handle = {
  i18n: ['settings', 'common'] satisfies Namespace,
};

const deleteTagFormSchema = z.object({
  tagId: z.string().uuid(),
});

export async function action({ request }: ActionArgs) {
  const { authService } = serverServices;
  const { apiClient } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const formData = await parseForm(request, deleteTagFormSchema);

  await apiClient.deleteTag(formData.tagId);
  return redirect(getRoute('/settings/tags'));
}

export function DeleteTag({ tag }: { tag: Tag }) {
  const { t } = useTranslation(handle.i18n);

  const [open, setOpen] = useState(false);

  const navigation = useNavigation();
  useEffect(() => {
    if (navigation.state === 'loading') {
      setOpen(false);
    }
  }, [navigation.state]);

  if (tag.cases_count !== 0) {
    return (
      <Delete
        width="24px"
        height="24px"
        className="group-hover:text-grey-25 cursor-not-allowed"
        aria-label={t('settings:tags.delete_tag')}
      />
    );
  }

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Delete
          width="24px"
          height="24px"
          aria-label={t('settings:tags.delete_tag')}
        />
      </Modal.Trigger>
      <Modal.Content>
        <DeleteTagContent tagId={tag.id} />
      </Modal.Content>
    </Modal.Root>
  );
}

const DeleteTagContent = ({ tagId }: { tagId: string }) => {
  const { t } = useTranslation(handle.i18n);

  return (
    <Form action={getRoute('/ressources/settings/tags/delete')} method="DELETE">
      <Modal.Title>{t('settings:tags.delete_tag.title')}</Modal.Title>
      <div className="bg-grey-00 flex flex-col gap-8 p-8">
        <div className="text-s flex flex-1 flex-col gap-4">
          <input name="tagId" value={tagId} type="hidden" />
          <p className="text-center">{t('settings:tags.delete_tag.content')}</p>
        </div>
        <div className="flex flex-1 flex-row gap-2">
          <Modal.Close asChild>
            <Button className="flex-1" variant="secondary" name="cancel">
              {t('common:cancel')}
            </Button>
          </Modal.Close>
          <Button
            color="red"
            className="flex-1"
            variant="primary"
            type="submit"
            name="delete"
          >
            <Delete width={'24px'} height={'24px'} />
            {t('common:delete')}
          </Button>
        </div>
      </div>
    </Form>
  );
};
