import { supportedLngs } from '@app-builder/services/i18n/i18n-config';
import { serverServices } from '@app-builder/services/init.server';
import { parseForm } from '@app-builder/utils/input-validation';
import { type ActionArgs, json } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { Select } from '@ui-design-system';
import { useTranslation } from 'react-i18next';
import { redirectBack } from 'remix-utils';
import * as z from 'zod';

import { setToastMessage } from '../../../components/MarbleToaster';

const formSchema = z.object({
  preferredLanguage: z.enum(supportedLngs),
});

export async function action({ request }: ActionArgs) {
  const {
    i18nextService,
    sessionService: { getSession, commitSession },
  } = serverServices;

  const session = await getSession(request);
  try {
    const { preferredLanguage } = await parseForm(request, formSchema);

    // const user = await authenticator.isAuthenticated(request);
    // if (user)
    //   await usersApi.putUsersUserId({
    //     userId: user.id,
    //     userPreferences: {
    //       preferredLanguage,
    //     },
    //   });

    i18nextService.setLanguage(session, preferredLanguage);

    return redirectBack(request, {
      fallback: '/home',
      headers: { 'Set-Cookie': await commitSession(session) },
    });
  } catch (error) {
    setToastMessage(session, {
      type: 'error',
      messageKey: 'common:errors.unknown',
    });

    return json(
      {
        success: false as const,
      },
      { headers: { 'Set-Cookie': await commitSession(session) } }
    );
  }
}

/**
 * The component is hidden when there is only one language available.
 */
export function LanguagePicker() {
  const { i18n } = useTranslation<'common'>();
  const fetcher = useFetcher<typeof action>();

  if (supportedLngs.every((lng: string) => lng.startsWith('en'))) return null;

  return (
    <Select.Default
      value={i18n.language}
      onValueChange={(newPreferredLanguage) => {
        fetcher.submit(
          { preferredLanguage: newPreferredLanguage },
          { method: 'POST', action: '/ressources/user/language' }
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
