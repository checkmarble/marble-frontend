import {
  sampleDateFormats,
  sampleHoursFormats,
  supportedLngs,
} from '@app-builder/services/i18n/i18n-config';
import { initServerServices } from '@app-builder/services/init.server';
import { parseForm } from '@app-builder/utils/input-validation';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { redirectBack } from 'remix-utils/redirect-back';
import { Button, MenuCommand } from 'ui-design-system';
import * as z from 'zod/v4';

import { setToastMessage } from '../../../components/MarbleToaster';
import { useFormatPreferencesHook } from '../../../utils/format';

const formSchema = z.object({
  preferredLanguage: z.enum(supportedLngs).optional(),
  preferredDate: z.enum(Object.keys(sampleDateFormats) as [string, ...string[]]).optional(),
  preferredHours: z.enum(Object.keys(sampleHoursFormats) as [string, ...string[]]).optional(),
});

// Helper function to get human-readable language names
function getLanguageDisplayName(languageCode: string): string {
  const languageNames: Record<string, string> = {
    en: 'English',
    fr: 'Français',
    ar: 'العربية',
  };

  return languageNames[languageCode] ?? languageCode;
}

export async function action({ request }: ActionFunctionArgs) {
  const { i18nextService, toastSessionService } = initServerServices(request);

  try {
    const { preferredLanguage, preferredDate, preferredHours } = await parseForm(
      request,
      formSchema,
    );

    const headers = new Headers();

    // Set language if provided
    if (preferredLanguage) {
      const { cookie } = await i18nextService.setLanguage(request, preferredLanguage);
      headers.append('Set-Cookie', cookie);
    }

    // Set date format if provided
    if (preferredDate) {
      const { cookie } = await i18nextService.setDateFormat(request, preferredDate);
      headers.append('Set-Cookie', cookie);
    }

    // Set hours format if provided
    if (preferredHours) {
      const { cookie } = await i18nextService.setHoursFormat(request, preferredHours);
      headers.append('Set-Cookie', cookie);
    }

    return redirectBack(request, {
      fallback: getRoute('/scenarios'),
      headers,
    });
  } catch (_error) {
    const toastSession = await toastSessionService.getSession(request);
    setToastMessage(toastSession, {
      type: 'error',
      messageKey: 'common:errors.unknown',
    });

    return Response.json(
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
  const formatPreferences = useFormatPreferencesHook();
  const fetcher = useFetcher<typeof action>();

  if (supportedLngs.every((lng: string) => lng.startsWith('en'))) return null;

  return (
    <div className="flex flex-col gap-2">
      <MenuCommand.Menu>
        <MenuCommand.Trigger>
          <Button variant="secondary" className="h-10 gap-2">
            {getLanguageDisplayName(language)}
            <MenuCommand.Arrow />
          </Button>
        </MenuCommand.Trigger>
        <MenuCommand.Content sameWidth>
          <MenuCommand.List>
            {supportedLngs.map((lng) => {
              return (
                <MenuCommand.Item
                  key={lng}
                  value={lng}
                  onSelect={(selectedLanguage) => {
                    fetcher.submit(
                      { preferredLanguage: selectedLanguage },
                      { method: 'POST', action: getRoute('/ressources/user/language') },
                    );
                  }}
                >
                  {getLanguageDisplayName(lng)}
                </MenuCommand.Item>
              );
            })}
          </MenuCommand.List>
        </MenuCommand.Content>
      </MenuCommand.Menu>
      <MenuCommand.Menu>
        <MenuCommand.Trigger>
          <Button variant="secondary" className="h-10 gap-2">
            {formatPreferences.dateFormatDisplay || 'Unknown Format'}
            <MenuCommand.Arrow />
          </Button>
        </MenuCommand.Trigger>
        <MenuCommand.Content sameWidth>
          <MenuCommand.List>
            {Object.values(sampleDateFormats).map((dateFormat) => {
              return (
                <MenuCommand.Item
                  key={dateFormat.value}
                  value={dateFormat.value}
                  onSelect={(selectedDate) => {
                    fetcher.submit(
                      { preferredDate: selectedDate },
                      { method: 'POST', action: getRoute('/ressources/user/language') },
                    );
                  }}
                >
                  {dateFormat.displayName}
                </MenuCommand.Item>
              );
            })}
          </MenuCommand.List>
        </MenuCommand.Content>
      </MenuCommand.Menu>
      <MenuCommand.Menu>
        <MenuCommand.Trigger>
          <Button variant="secondary" className="h-10 gap-2">
            {formatPreferences.hoursFormatDisplay || 'Unknown Format'}
            <MenuCommand.Arrow />
          </Button>
        </MenuCommand.Trigger>

        <MenuCommand.Content sameWidth>
          <MenuCommand.List>
            {Object.values(sampleHoursFormats).map((hoursFormat) => {
              return (
                <MenuCommand.Item
                  key={hoursFormat.value}
                  value={hoursFormat.value}
                  onSelect={(selectedHours) => {
                    fetcher.submit(
                      { preferredHours: selectedHours },
                      { method: 'POST', action: getRoute('/ressources/user/language') },
                    );
                  }}
                >
                  {hoursFormat.displayName}
                </MenuCommand.Item>
              );
            })}
          </MenuCommand.List>
        </MenuCommand.Content>
      </MenuCommand.Menu>
    </div>
  );
}
