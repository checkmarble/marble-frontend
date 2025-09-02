'use client';

import { Tabs as RadixTabs } from 'radix-ui';
import * as React from 'react';

import { cn } from '../utils';

const Tabs = RadixTabs.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof RadixTabs.List>,
  React.ComponentPropsWithoutRef<typeof RadixTabs.List>
>(({ className, ...props }, ref) => (
  <RadixTabs.List
    ref={ref}
    className={cn(
      'bg-grey-100 border-grey-90 text-grey-50 inline-flex items-center justify-center gap-0.5 rounded-lg border p-0.5',
      className,
    )}
    {...props}
  />
));
TabsList.displayName = RadixTabs.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof RadixTabs.Trigger>,
  React.ComponentPropsWithoutRef<typeof RadixTabs.Trigger>
>(({ className, ...props }, ref) => (
  <RadixTabs.Trigger
    ref={ref}
    className={cn(
      'focus-visible:outline-grey-00 hover:bg-grey-95 data-[state=active]:bg-purple-96 data-[state=active]:text-purple-65 inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 font-medium transition-all focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50',
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = RadixTabs.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof RadixTabs.Content>,
  React.ComponentPropsWithoutRef<typeof RadixTabs.Content>
>(({ className, ...props }, ref) => (
  <RadixTabs.Content ref={ref} className={cn('', className)} {...props} />
));
TabsContent.displayName = RadixTabs.Content.displayName;

export { Tabs, TabsContent, TabsList, TabsTrigger };
