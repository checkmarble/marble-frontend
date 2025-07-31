import { useUnavailabilitySettings } from '@app-builder/queries/personal-settings';
import { useState } from 'react';
import { Icon } from 'ui-icons';

export function UnavailableBanner() {
  const { query: unavailabilityQuery } = useUnavailabilitySettings();

  const [isOpen, setIsOpen] = useState(true);
  if (
    !isOpen ||
    unavailabilityQuery?.isPending ||
    (unavailabilityQuery?.isSuccess && unavailabilityQuery.data?.until === null)
  ) {
    return null;
  }

  return (
    <div className="fixed z-10 bottom-0 start-0 flex justify-between w-full p-2 border-t bg-red-43 border-grey-90 shadow-sticky-top">
      <div className="flex items-center mx-auto">
        <p className="flex items-center text-md text-grey-100 dark:text-grey-50">
          <span className="inline-flex p-1 me-3 text-grey-100 rounded-full w-6 h-6 items-center justify-center">
            <Icon icon="account-circle-off" className="size-5" />
          </span>
          <span className="font-semibold text-grey-100">You are set offline.</span>
        </p>
      </div>
      <div className="flex items-center">
        <button
          onClick={() => setIsOpen(false)}
          data-dismiss-target="#bottom-banner"
          type="button"
          className="shrink-0 inline-flex justify-center w-7 h-7 items-center text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 dark:hover:bg-gray-600 dark:hover:text-white"
        >
          <Icon icon="cross" className="size-6 text-grey-100" />
        </button>
      </div>
    </div>
  );
}
