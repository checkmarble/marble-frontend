import { useFetcher } from '@remix-run/react';
import { Select } from '@marble-front/ui/design-system';
import { authenticator } from '@marble-front/builder/services/auth/auth.server';
import { usersApi } from '@marble-front/builder/services/marble-api';
import { json, type ActionArgs } from '@remix-run/node';

import * as z from 'zod';

import { parseForm } from '@marble-front/builder/utils/input-validation';
import {
  commitSession,
  getSession,
} from '@marble-front/builder/services/auth/session.server';
import { setToastMessage } from '../../../components/MarbleToaster';
import { supportedLngs } from '@marble-front/builder/config/i18n/i18n-config';
import { redirectBack } from 'remix-utils';
import { setLanguage } from '@marble-front/builder/config/i18n/i18next.server';
import { useTranslation } from 'react-i18next';

const formSchema = z.object({
  preferredLanguage: z.enum(supportedLngs),
});

export async function action({ request }: ActionArgs) {
  const session = await getSession(request.headers.get('cookie'));
  try {
    const { preferredLanguage } = await parseForm(request, formSchema);

    const user = await authenticator.isAuthenticated(request);
    if (user)
      await usersApi.putUsersUserId({
        userId: user.id,
        userPreferences: {
          preferredLanguage,
        },
      });

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
