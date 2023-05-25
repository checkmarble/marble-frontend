import { supportedLngs } from '@marble-front/builder/config/i18n/i18n-config';
import { setLanguage } from '@marble-front/builder/config/i18n/i18next.server';
import {
  commitSession,
  getSession,
} from '@marble-front/builder/services/auth/session.server';
import { parseForm } from '@marble-front/builder/utils/input-validation';
import { Select } from '@marble-front/ui/design-system';
import { type ActionArgs, json } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { redirectBack } from 'remix-utils';
import * as z from 'zod';

import { setToastMessage } from '../../../components/MarbleToaster';

const formSchema = z.object({
  preferredLanguage: z.enum(supportedLngs),
});

export async function action({ request }: ActionArgs) {
  const session = await getSession(request.headers.get('cookie'));
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

    setLanguage(session, preferredLanguage);

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

export function LanguagePicker() {
  const { i18n } = useTranslation<'common'>();
  const fetcher = useFetcher<typeof action>();

  return (
    <Select.Default
      value={i18n.language}
      onValueChange={(newPreferredLanguage) => {
        fetcher.submit(
          { preferredLanguage: newPreferredLanguage },
          { method: 'post', action: '/ressources/user/language' }
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
