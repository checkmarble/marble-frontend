import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { type FileAnnotation } from '@app-builder/models';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { useCallbackRef } from '@marble/shared';
import { type ActionFunctionArgs } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import invariant from 'tiny-invariant';
import { Button, Modal } from 'ui-design-system';

export async function action({ request, params }: ActionFunctionArgs) {
  const {
    authService,
    i18nextService: { getFixedT },
    toastSessionService: { getSession, commitSession },
  } = initServerServices(request);

  const [t, session, { dataModelRepository }] = await Promise.all([
    getFixedT(request, ['common']),
    getSession(request),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const annotationId = params['annotationId'];
  invariant(annotationId, 'Expected annotationId param to be present in url');

  try {
    await dataModelRepository.deleteAnnotation(annotationId);

    setToastMessage(session, {
      type: 'success',
      message: t('common:success.deleted'),
    });

    return Response.json(
      { success: true },
      { headers: { 'Set-Cookie': await commitSession(session) } },
    );
  } catch (err) {
    setToastMessage(session, {
      type: 'error',
      message: t('common:errors.unknown'),
    });

    return Response.json(
      { success: false, errors: [] },
      { headers: { 'Set-Cookie': await commitSession(session) } },
    );
  }
}

type RemoveFileAnnotationProps = {
  annotation: FileAnnotation;
  onClose: () => void;
  onDelete?: () => void;
};

export function RemoveFileAnnotation({ annotation, onClose, onDelete }: RemoveFileAnnotationProps) {
  const { t } = useTranslation(['cases', 'common']);
  const fetcher = useFetcher<typeof action>({ key: `remove_file_${annotation.id}` });
  const filenames = annotation.payload.files.map((f) => f.filename);

  const handleDelete = useCallbackRef(() => {
    fetcher.submit(
      {},
      {
        method: 'POST',
        action: getRoute('/ressources/data/delete-annotation/:annotationId', {
          annotationId: annotation.id,
        }),
      },
    );
  });

  useEffect(() => {
    if (fetcher.data?.success) {
      onDelete?.();
      onClose();
    }
  }, [fetcher, onDelete, onClose]);

  return (
    <Modal.Root open>
      <Modal.Content>
        <Modal.Title>
          <Trans
            t={t}
            i18nKey="cases:annotations.delete_files.title"
            components={{
              Filenames: <span className="text-purple-65" />,
            }}
            values={{
              filenames,
            }}
          />
        </Modal.Title>
        <div className="flex justify-between gap-4 p-6">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            {t('common:cancel')}
          </Button>
          <Button variant="primary" color="red" className="flex-1" onClick={handleDelete}>
            {t('common:delete')}
          </Button>
        </div>
      </Modal.Content>
    </Modal.Root>
  );
}
