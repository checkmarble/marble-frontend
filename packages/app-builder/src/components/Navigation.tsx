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
      <span className="line-clamp-1 text-start opacity-0 transition-opacity group-hover/sidebar:opacity-100 delay-400 group-hover/sidebar:delay-200">
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
      <span className="line-clamp-1 text-start opacity-0 transition-opacity group-hover/sidebar:opacity-100 delay-400 group-hover/sidebar:delay-200">
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

export function OrganizationSwitcher() {
  const { org, organizations } = useOrganizationDetails();
  const { t } = useTranslation('navigation');

  if (!org) return null;
  const userOrg = organizations.find((o) => o.id === org.id);
  if (!userOrg) return null;

  const orgWords = org.name.split(' ');
  return (
    <MenuCommand.Menu>
      <MenuCommand.Trigger>
        <button
          role="button"
          className="flex gap-sm items-center justify-start border-grey-border rounded-md group-hover/sidebar:p-sm group-hover/sidebar:border transition-all duration-200 group-hover/sidebar:delay-200"
        >
          <div>
            <div className="flex items-center justify-center group-hover/sidebar:justify-start flex-1 group-hover/sidebar:gap-xs">
              <Avatar firstName={orgWords[0]} lastName={orgWords[1]} size="xs" />
              {userOrg.environment === 'staging' ? (
                <div className="flex items-center justify-center gap-xs -ms-1.5 group-hover/sidebar:translate-x-1.5 p-xs bg-purple-primary rounded-full h-6 w-min-6 shrink-0">
                  <Icon icon="tool" className="size-4 text-white" />
                  <span className="text-white text-xs hidden group-hover/sidebar:inline">
                    {t(`organization.${userOrg.environment}`)}
                  </span>
                </div>
              ) : (
                <span className="group-hover/sidebar:inline-flex hidden gap-xs text-xs">
                  <span>{org.name}</span>
                  <span>{'-'}</span>
                  <span className="truncate">{t(`organization.${userOrg.environment}`)}</span>
                </span>
              )}
            </div>
            {userOrg.environment === 'staging' && <span className="text-xs">{org.name}</span>}
          </div>
          <Icon icon="arrow-down" className="size-4 shrink-0 hidden group-hover/sidebar:block" />
        </button>
      </MenuCommand.Trigger>
      <MenuCommand.Content side="bottom" align="start" sameWidth sideOffset={4}>
        <MenuCommand.List>
          {organizations.map((organization) => (
            <MenuCommand.Item key={organization.id}>
              <span className="inline-flex items-center gap-xs">
                <span>{organization.name}</span>
                {organization.environment === 'staging' && (
                  <Icon icon="tool" className="size-5 text-white bg-purple-primary rounded-full" />
                )}
              </span>
            </MenuCommand.Item>
          ))}
        </MenuCommand.List>
      </MenuCommand.Content>
    </MenuCommand.Menu>
  );
}
