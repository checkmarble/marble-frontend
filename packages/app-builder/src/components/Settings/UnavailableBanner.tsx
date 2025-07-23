import { useOrganizationDetails } from '@app-builder/services/organization/organization-detail';
import { Icon } from 'ui-icons';
import { AvailabilityToggle } from './AvailabilityToggle';

export function UnavailableBanner() {
  const { currentUser } = useOrganizationDetails();

  if (currentUser.available !== false) {
    return null;
  }

  console.log('currentUser', currentUser);

  return (
    <div className="fixed bottom-0 start-0 flex justify-between w-full p-2 border-t bg-red-74 border-grey-90">
      <div className="flex items-center mx-auto">
        <p className="flex items-center text-md text-grey-00 dark:text-grey-50">
          <span className="inline-flex p-1 me-3 text-grey-00 rounded-full w-6 h-6 items-center justify-center">
            <Icon icon="account-circle-off" className="size-5" />
          </span>
          <span className="font-semibold text-grey-00">You are set offline.</span>
          <AvailabilityToggle />
        </p>
      </div>
      <div className="flex items-center">
        <button
          data-dismiss-target="#bottom-banner"
          type="button"
          className="shrink-0 inline-flex justify-center w-7 h-7 items-center text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 dark:hover:bg-gray-600 dark:hover:text-white"
        >
          <Icon icon="cross" className="size-5" />
          <span className="sr-only">Close banner</span>
        </button>
      </div>
    </div>
  );
}
