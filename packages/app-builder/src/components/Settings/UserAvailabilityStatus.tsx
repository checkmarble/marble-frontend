import { useUnavailabilitySettings } from '@app-builder/queries/personal-settings';
import { SetMyselfAvailable } from './SetMyselfAvailable';
import { SetMyselfUnavailable } from './SetMyselfUnavailable';

export function UserAvailabilityStatus({
  isAutoAssignmentAvailable,
}: {
  isAutoAssignmentAvailable: boolean;
}) {
  const { query: unavailabilityQuery } = useUnavailabilitySettings();

  if (!isAutoAssignmentAvailable) {
    return null;
  }

  if (unavailabilityQuery.isSuccess && unavailabilityQuery.data.until === null) {
    return <SetMyselfUnavailable />;
  }

  if (unavailabilityQuery.isSuccess && unavailabilityQuery.data.until !== null) {
    return <SetMyselfAvailable />;
  }

  return null;
}
