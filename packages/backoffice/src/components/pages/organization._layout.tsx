import { Link } from '@tanstack/react-router';
import { OrganizationDto } from 'marble-api';
import { ReactNode } from 'react';
import { Tabs, Typo, tabClassName } from 'ui-design-system';

const ORGANIZATION_TABS = ['overview', 'users' /* , 'settings' */] as const;

type OrganizationLayoutProps = {
  organization: OrganizationDto;
  children: ReactNode;
};

export function OrganizationLayout({ organization, children }: OrganizationLayoutProps) {
  return (
    <div className="flex flex-col gap-md">
      <div className="flex items-center justify-between">
        <Typo variant="title1">{organization.name}</Typo>
        <Tabs>
          {ORGANIZATION_TABS.map((tab) => (
            <Link
              key={tab}
              to={`/organizations/$orgId/${tab}`}
              params={{ orgId: organization.id }}
              className={tabClassName}
            >
              {tab}
            </Link>
          ))}
        </Tabs>
      </div>
      <div>{children}</div>
    </div>
  );
}
