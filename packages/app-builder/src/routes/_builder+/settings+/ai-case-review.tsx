import { AiAssistSettingsPage } from '@app-builder/components/Settings/AiAssist/AiAssistSettingsPage';
import { isAdmin } from '@app-builder/models';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type LoaderFunctionArgs } from '@remix-run/node';
import { redirect, useLoaderData } from '@remix-run/react';

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService, appConfigRepository } = initServerServices(request);
  const { user, aiAssistSettings } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  if (!isAdmin(user)) {
    return redirect(getRoute('/'));
  }
  const [appConfig, settings] = await Promise.all([
    appConfigRepository.getAppConfig(),
    aiAssistSettings.getAiAssistSettings(),
  ]);

  if (!appConfig.isManagedMarble) {
    return redirect(getRoute('/'));
  }
  return { settings };
}

export default function AICaseReviewSettings() {
  const { settings } = useLoaderData<typeof loader>();

  return <AiAssistSettingsPage settings={settings} />;
}
