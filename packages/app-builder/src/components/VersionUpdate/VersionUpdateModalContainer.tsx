import { useVersionUpdateQuery } from '@app-builder/queries/version-update';
import { useLocalStorage } from '@app-builder/utils/hooks';
import { type FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { VersionUpdateModal } from './VersionUpdateModal';

const STORAGE_KEY = 'version-snooze';
const SNOOZE_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

interface SnoozeState {
  expiry: number;
  version: string;
}

export const VersionUpdateModalContainer: FunctionComponent = () => {
  const [open, setOpen] = useState(false);
  const snoozeStorage = useLocalStorage<SnoozeState>(STORAGE_KEY);

  const shouldFetch = useMemo(() => {
    const state = snoozeStorage.get();
    return !state || Date.now() > state.expiry;
  }, [snoozeStorage]);

  const { data, isSuccess } = useVersionUpdateQuery({ enabled: shouldFetch });

  useEffect(() => {
    if (isSuccess && data?.needsUpdate) {
      setOpen(true);
    }
  }, [isSuccess, data]);

  const handleSnooze = useCallback(() => {
    if (!data) return;

    snoozeStorage.set({ expiry: Date.now() + SNOOZE_DURATION_MS, version: data.version });
    setOpen(false);
  }, [data, snoozeStorage]);

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
