import type { Meta, StoryFn } from '@storybook/react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from './Tabs';

const Story: Meta<typeof Tabs> = {
  component: Tabs,
  title: 'Tabs',
};
export default Story;

export const Default: StoryFn<typeof Tabs> = () => (
  <Tabs defaultValue="account">
    <TabsList>
      <TabsTrigger value="account">Account</TabsTrigger>
      <TabsTrigger value="password">Password</TabsTrigger>
    </TabsList>
    <TabsContent value="account">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h3 className="text-l font-semibold">Account</h3>
          <p className="text-s text-grey-50">
            Make changes to your account here. Click save when you&apos;re done.
          </p>
        </div>
      </div>
    </TabsContent>
    <TabsContent value="password">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h3 className="text-l font-semibold">Password</h3>
          <p className="text-s text-grey-50">
            Change your password here. After saving, you&apos;ll be logged out.
          </p>
        </div>
      </div>
    </TabsContent>
  </Tabs>
);
