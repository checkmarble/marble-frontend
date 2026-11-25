import { SsoSettingsPage } from '@app-builder/components/Settings/Sso/SsoSettingsPage';
import { getSsoSettingsFn } from '@app-builder/server-fns/settings';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_builder/settings/security')({
  loader: () => getSsoSettingsFn(),
  component: SecuritySettings,
});

function SecuritySettings() {
  const settings = Route.useLoaderData();

  return <SsoSettingsPage settings={settings} />;
}
