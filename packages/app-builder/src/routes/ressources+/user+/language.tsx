import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { setLanguagePayloadSchema } from '@app-builder/queries/settings/set-language';
import { initServerServices } from '@app-builder/services/init.server';
import { type ActionFunctionArgs } from '@remix-run/node';

export async function action({ request }: ActionFunctionArgs) {
  const { i18nextService, toastSessionService } = initServerServices(request);

  const raw = await request.json();
  const payload = setLanguagePayloadSchema.safeParse(raw);

  if (!payload.success) {
    return Response.json({ success: false, error: payload.error });
  }

  try {
    const { cookie } = await i18nextService.setLanguage(request, payload.data?.preferredLanguage);

    return Response.json(
      { success: true },
      {
        headers: {
          'Set-Cookie': cookie,
        },
      },
    );
  } catch (_error) {
    const toastSession = await toastSessionService.getSession(request);
    setToastMessage(toastSession, {
      type: 'error',
      messageKey: 'common:errors.unknown',
    });

    return Response.json(
      { success: false },
      {
        headers: {
          'Set-Cookie': await toastSessionService.commitSession(toastSession),
        },
      },
    );
  }
}
