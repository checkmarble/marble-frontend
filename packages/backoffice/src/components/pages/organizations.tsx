import { listOrganizationsQueryOptions } from '@bo/data/organization';
import { Link } from '@tanstack/react-router';
import { MouseEventHandler, useState } from 'react';
import { Button, PanelRoot } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { GridContentLoader } from '../common/GridContentLoader';
import { SuspenseQuery } from '../core/SuspenseQuery';
import { CreateOrganizationPanel } from '../organisms/CreateOrganizationPanel';

const ErrorComponent = ({ error, reset }: { error: any; reset: () => void }) => {
  return (
    <div className="col-span-full p-v2-lg flex flex-col gap-v2-md items-center">
      <span>Something went wrong while fetching organizations</span>
      <Button variant="secondary" onClick={() => reset()}>
        Retry
      </Button>
    </div>
  );
};

const handleRowClick: MouseEventHandler = (e) => {
  const rowLink = e.currentTarget.querySelector('[data-row-link]');
  if (rowLink && rowLink !== e.target && rowLink instanceof HTMLAnchorElement) {
    rowLink.dispatchEvent(new MouseEvent(e.type, e.nativeEvent));
  }
};

export const OrganizationsPage = () => {
  const [isCreatingOrg, setIsCreatingOrg] = useState(false);

  return (
    <div className="flex flex-col gap-v2-md">
      <div className="flex items-center justify-between">
        <h1 className="text-h1">Organizations</h1>
        <Button variant="primary" onClick={() => setIsCreatingOrg(true)}>
          <Icon icon="plus" className="size-4" />
          Create organization
        </Button>
      </div>
      <div className="grid grid-cols-[0px_1fr_calc(var(--spacing)*100)_auto] bg-surface-card border border-grey-border rounded-v2-md">
        <div className="grid grid-cols-subgrid col-span-full border-b border-grey-border items-center font-medium">
          <div></div>
          <div className="p-v2-md">Name</div>
          <div className="p-v2-md">ID</div>
          <div className="p-v2-md">Actions</div>
        </div>
        <SuspenseQuery
          query={listOrganizationsQueryOptions()}
          fallback={<GridContentLoader />}
          errorComponent={ErrorComponent}
        >
          {(organizations) => (
            <>
              {organizations.map((organization) => (
                <div
                  key={organization.id}
                  className="grid grid-cols-subgrid col-span-full cursor-pointer hover:bg-surface-row-hover"
                  onClick={handleRowClick}
                >
                  <div className="invisible">
                    <Link data-row-link to="/organizations/$orgId" params={{ orgId: organization.id }} />
                  </div>
                  <div className="p-v2-md">{organization.name}</div>
                  <div className="p-v2-md">{organization.id}</div>
                  <div className="p-v2-md"></div>
                </div>
              ))}
            </>
          )}
        </SuspenseQuery>
      </div>
      <PanelRoot open={isCreatingOrg} onOpenChange={setIsCreatingOrg}>
        <CreateOrganizationPanel />
      </PanelRoot>
    </div>
  );
};
