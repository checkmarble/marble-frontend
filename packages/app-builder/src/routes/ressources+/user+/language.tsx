import { supportedLngs } from '@app-builder/services/i18n/i18n-config';
import { serverServices } from '@app-builder/services/init.server';
import { parseForm } from '@app-builder/utils/input-validation';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { redirectBack } from 'remix-utils/redirect-back';
import { Select } from 'ui-design-system';
import * as z from 'zod';

import { setToastMessage } from '../../../components/MarbleToaster';

const formSchema = z.object({
  preferredLanguage: z.enum(supportedLngs),
});

export async function action({ request }: ActionFunctionArgs) {
  const { i18nextService, authSessionService, toastSessionService } =
    serverServices;

  try {
    const { preferredLanguage } = await parseForm(request, formSchema);
    const authSession = await authSessionService.getSession(request);

    // const user = await authenticator.isAuthenticated(request);
    // if (user)
    //   await usersApi.putUsersUserId({
    //     userId: user.id,
    //     userPreferences: {
    //       preferredLanguage,
    //     },
    //   });

    i18nextService.setLanguage(authSession, preferredLanguage);

    return redirectBack(request, {
      fallback: getRoute('/scenarios/'),
      headers: {
        'Set-Cookie': await authSessionService.commitSession(authSession),
      },
    });
  } catch (error) {
    const toastSession = await toastSessionService.getSession(request);
    setToastMessage(toastSession, {
      type: 'error',
      messageKey: 'common:errors.unknown',
    });

    return json(
      {
        success: false as const,
      },
      {
        headers: {
          'Set-Cookie': await toastSessionService.commitSession(toastSession),
        },
      },
    );
  }
}

/**
 * The component is hidden when there is only one language available.
 */
export function LanguagePicker() {
  const {
    i18n: { language },
  } = useTranslation<'common'>();
  const fetcher = useFetcher<typeof action>();

  if (supportedLngs.every((lng: string) => lng.startsWith('en'))) return null;

  return (
    <Select.Default
      value={language}
      onValueChange={(newPreferredLanguage) => {
        fetcher.submit(
          { preferredLanguage: newPreferredLanguage },
          { method: 'POST', action: getRoute('/ressources/user/language') },
        );
      }}
    >
      {supportedLngs.map((lng) => {
        return (
          <Select.DefaultItem key={lng} value={lng}>
            {lng}
          </Select.DefaultItem>
        );
      })}
    </Select.Default>
  );
}
