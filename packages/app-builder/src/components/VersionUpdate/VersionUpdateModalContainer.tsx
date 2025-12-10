import { useVersionUpdateQuery } from '@app-builder/queries/version-update';
import { useLocalStorage } from '@app-builder/utils/hooks';
import { type FunctionComponent, useEffect, useState } from 'react';
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

  const snoozeState = snoozeStorage.get();
  const shouldFetch = !snoozeState || Date.now() > snoozeState.expiry;

  const { data, isSuccess } = useVersionUpdateQuery({ enabled: shouldFetch });

  useEffect(() => {
    if (isSuccess && data?.needsUpdate) {
      setOpen(true);
    }
  }, [isSuccess, data]);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen && data) {
      snoozeStorage.set({ expiry: Date.now() + SNOOZE_DURATION_MS, version: data.version });
    }
    setOpen(isOpen);
  };

  if (!isSuccess || !data?.needsUpdate) return null;

  return (
    <VersionUpdateModal
      open={open}
      onOpenChange={handleOpenChange}
      version={data.version}
      releaseNotes={data.releaseNotes}
      releaseUrl={data.releaseUrl}
    />
  );
};
