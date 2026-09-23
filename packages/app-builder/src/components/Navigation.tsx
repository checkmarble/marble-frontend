import { useNewOrganizationId } from '@app-builder/hooks/useNewOrganizationId';
import { useOrganizationDetails } from '@app-builder/services/organization/organization-detail';
import { Link } from '@tanstack/react-router';
import { cva } from 'class-variance-authority';
import { type Namespace, type ParseKeys } from 'i18next';
import type { JSX } from 'react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, cn, MenuCommand } from 'ui-design-system';
import { Icon, type IconProps } from 'ui-icons';

//TODO(split apps): refactor this to be translation agnostic: directly pass the translated string (it will help separate the navigation.json file per "app")
export const navigationI18n = ['navigation'] satisfies Namespace;

export interface SidebarLinkProps {
  Icon: (props: Omit<IconProps, 'icon'>) => JSX.Element;
  labelTKey: ParseKeys<['navigation']>;
  to: string;
  children?: React.ReactNode;
  className?: string;
}

export const sidebarLink = cva('text-s flex flex-row items-center gap-sm rounded-xs p-sm font-medium w-full', {
  variants: {
    isActive: {
      true: 'bg-purple-background text-purple-primary dark:bg-grey-background-light dark:text-purple-hover',
      false:
        'text-grey-primary hover:bg-purple-background hover:text-purple-primary dark:text-grey-primary dark:hover:bg-grey-background-light dark:hover:text-purple-hover',
    },
  },
  defaultVariants: {
    isActive: false,
  },
});

export function SidebarLink({ Icon, labelTKey, to, children, className }: SidebarLinkProps) {
  const { t } = useTranslation(navigationI18n);

  return (
    <Link
      className={sidebarLink({ className })}
      activeProps={{ className: sidebarLink({ isActive: true, className }) }}
      to={to}
    >
      <Icon className="size-6 shrink-0" />
      <span className="line-clamp-1 text-start opacity-0 transition-opacity group-sidebar-open:opacity-100 delay-400 group-sidebar-open:delay-200">
        {t(labelTKey)}
      </span>
      {children}
    </Link>
  );
}

export interface SidebarButtonProps extends Omit<React.ComponentPropsWithoutRef<'button'>, 'children'> {
  Icon: (props: Omit<IconProps, 'icon'>) => JSX.Element;
  labelTKey: ParseKeys<['navigation']>;
}

export const SidebarButton = function SidebarButton({
  ref,
  Icon,
  labelTKey,
  className,
  ...props
}: SidebarButtonProps & { ref?: React.Ref<HTMLButtonElement> }) {
  const { t } = useTranslation(navigationI18n);

  return (
    <button ref={ref} className={sidebarLink({ className })} {...props}>
      <Icon className="size-6 shrink-0" />
      <span className="line-clamp-1 text-start opacity-0 transition-opacity group-sidebar-open:opacity-100 delay-400 group-sidebar-open:delay-200">
        {t(labelTKey)}
      </span>
    </button>
  );
};

export interface TabLinkProps {
  Icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
  labelTKey: ParseKeys<['navigation']>;
  to: string;
}

export function TabLink({ Icon, labelTKey, to }: TabLinkProps) {
  const { t } = useTranslation(navigationI18n);

  return (
    <Link
      className={cn(
        'text-s flex flex-row items-center gap-sm rounded-sm px-md py-sm font-medium',
        'text-grey-primary hover:bg-purple-background hover:text-purple-primary dark:text-grey-primary dark:hover:bg-grey-background-light dark:hover:text-purple-hover',
      )}
      activeProps={{
        className: cn(
          'text-s flex flex-row items-center gap-sm rounded-sm px-md py-sm font-medium',
          'bg-purple-background text-purple-primary dark:bg-grey-background-light dark:text-purple-hover',
        ),
      }}
      to={to}
    >
      <Icon className="size-6 shrink-0" />
      <span className="first-letter:capitalize">{t(labelTKey)}</span>
    </Link>
  );
}

const sidebarIconInsetClassName = 'ps-[calc(var(--spacing-sm)-var(--default-border-width))]';
const stagingClusterInsetClassName = 'ps-2xs';
const sidebarRevealRowClassName =
  'grid grid-rows-[0fr] transition-[grid-template-rows] duration-150 delay-400 group-sidebar-open:grid-rows-[1fr] group-sidebar-open:delay-200 motion-reduce:delay-0 motion-reduce:duration-0';
const sidebarChevronClassName =
  'grid shrink-0 grid-cols-[0fr] transition-[grid-template-columns] duration-150 delay-400 group-sidebar-open:grid-cols-[1fr] group-sidebar-open:delay-200 motion-reduce:delay-0 motion-reduce:duration-0';

const COMBO_BOX_THRESHOLD = 10;

export function OrganizationSwitcher() {
  const { org, organizations } = useOrganizationDetails();
  const { t } = useTranslation('navigation');
  const changeOrganizationId = useNewOrganizationId();
  const [menuOpen, setMenuOpen] = React.useState(false);

  if (!org) return null;
  const userOrg = organizations.find((o) => o.id === org.id);
  if (!userOrg) return null;

  const orgWords = org.name.split(' ');
  const isStaging = userOrg.environment === 'staging';
  const environmentLabel = t(`organization.${userOrg.environment}`);

  const handleChangeOrganizationId = (organizationId: string) => {
    if (organizationId === org.id) return;
    changeOrganizationId(organizationId);
  };

  return (
    <MenuCommand.Menu open={menuOpen} onOpenChange={setMenuOpen}>
      <MenuCommand.Trigger>
        <button
          type="button"
          className={cn(
            'flex min-w-0 flex-row items-center overflow-hidden rounded-md border border-transparent py-[calc(var(--spacing-sm)-var(--default-border-width))] transition-[padding,margin-inline,width,border-color] duration-150 delay-400 group-sidebar-open:border-grey-border group-sidebar-open:px-xs group-sidebar-open:py-[calc(var(--spacing-sm)+var(--spacing-xs)-var(--default-border-width))] group-sidebar-open:delay-200 motion-reduce:delay-0 motion-reduce:duration-0',
            isStaging
              ? '-mx-xs w-[calc(100%+2*var(--spacing-xs))] group-sidebar-open:mx-0 group-sidebar-open:w-full'
              : 'w-full',
          )}
        >
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <div className="flex min-w-0 items-center">
              <div
                className={cn(
                  'flex shrink-0 items-center',
                  isStaging ? stagingClusterInsetClassName : sidebarIconInsetClassName,
                )}
              >
                <Avatar firstName={orgWords[0]} lastName={orgWords[1]} size="xs" />
                {isStaging ? (
                  <div className="-ms-1.5 flex h-6 max-w-6 shrink-0 items-center overflow-hidden rounded-full bg-purple-primary transition-[max-width,margin-inline-start] duration-150 delay-400 group-sidebar-open:ms-xs group-sidebar-open:max-w-40 group-sidebar-open:delay-200 motion-reduce:delay-0 motion-reduce:duration-0">
                    <span className="flex size-6 shrink-0 items-center justify-center">
                      <Icon icon="tool" className="size-4 text-white" />
                    </span>
                    <span className="pe-xs text-xs whitespace-nowrap text-white">{environmentLabel}</span>
                  </div>
                ) : null}
              </div>
              {isStaging ? null : (
                <>
                  <div className="w-sm shrink-0" />
                  <span className="flex shrink-0 items-center gap-xs text-xs whitespace-nowrap">
                    <span>{org.name}</span>
                    <span>{'-'}</span>
                    <span>{environmentLabel}</span>
                  </span>
                </>
              )}
            </div>
            {isStaging ? (
              <div className={sidebarRevealRowClassName}>
                <div className="min-h-0 overflow-hidden">
                  <span
                    className={cn('block pt-2xs text-start text-xs whitespace-nowrap', stagingClusterInsetClassName)}
                  >
                    {org.name}
                  </span>
                </div>
              </div>
            ) : null}
          </div>
          <div className={sidebarChevronClassName}>
            <div className="min-w-0 overflow-hidden">
              <Icon
                icon="arrow-down"
                className="ms-xs me-[calc(var(--spacing-sm)-var(--default-border-width))] size-4 transition-transform duration-200 group-radix-state-open:rotate-180 motion-reduce:transition-none"
              />
            </div>
          </div>
        </button>
      </MenuCommand.Trigger>
      <MenuCommand.Content side="bottom" align="start" sameWidth sideOffset={4}>
        {organizations.length > COMBO_BOX_THRESHOLD ? <MenuCommand.Combobox /> : null}
        <MenuCommand.List>
          {organizations.map((organization) => (
            <MenuCommand.Item
              key={organization.id}
              className="cursor-pointer"
              onSelect={() => handleChangeOrganizationId(organization.id)}
            >
              <span className="inline-flex items-center gap-xs">
                <span>{organization.name}</span>
                {organization.environment === 'staging' && (
                  <Icon icon="tool" className="size-5 p-2xs text-white bg-purple-primary rounded-full" />
                )}
              </span>
            </MenuCommand.Item>
          ))}
        </MenuCommand.List>
      </MenuCommand.Content>
    </MenuCommand.Menu>
  );
}
