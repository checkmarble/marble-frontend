import { useVersionUpdateQuery } from '@app-builder/queries/version-update';
import { COOKIE_NAME, type PreferencesCookie } from '@app-builder/utils/preferences-cookies/config';
import { setPreferencesCookie } from '@app-builder/utils/preferences-cookies/preferences-cookies-write';
import Cookie from 'js-cookie';
import { type FunctionComponent, useCallback, useEffect, useState } from 'react';
import { VersionUpdateModal } from './VersionUpdateModal';

const SNOOZE_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function getSnoozeState(): Pick<PreferencesCookie, 'versionSnoozeExpiry' | 'versionSnoozedVersion'> {
  try {
    const raw = Cookie.get(COOKIE_NAME);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return {
      versionSnoozeExpiry: parsed.versionSnoozeExpiry ? Number(parsed.versionSnoozeExpiry) : undefined,
      versionSnoozedVersion: parsed.versionSnoozedVersion,
    };
  } catch {
    return {};
  }
}

function isSnoozed(version: string): boolean {
  const { versionSnoozeExpiry, versionSnoozedVersion } = getSnoozeState();

  if (!versionSnoozeExpiry || !versionSnoozedVersion) return false;

  const isExpired = Date.now() > versionSnoozeExpiry;
  const isSameVersion = versionSnoozedVersion === version;

  return !isExpired && isSameVersion;
}

export const VersionUpdateModalContainer: FunctionComponent = () => {
  const [open, setOpen] = useState(false);
  const { data, isSuccess } = useVersionUpdateQuery();

  useEffect(() => {
    if (isSuccess && data?.needsUpdate && !isSnoozed(data.version)) {
      setOpen(true);
    }
  }, [isSuccess, data]);

  const handleSnooze = useCallback(() => {
    if (!data) return;

    setPreferencesCookie('versionSnoozeExpiry', Date.now() + SNOOZE_DURATION_MS);
    setPreferencesCookie('versionSnoozedVersion', data.version);
    setOpen(false);
  }, [data]);

  if (!data?.needsUpdate) return null;

  return (
    <VersionUpdateModal
      open={open}
      onOpenChange={setOpen}
      version={data.version}
      releaseNotes={data.releaseNotes}
      releaseUrl={data.releaseUrl}
      onSnooze={handleSnooze}
    />
  );
};
