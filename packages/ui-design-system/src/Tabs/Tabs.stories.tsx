import { type Meta, type StoryFn } from '@storybook/react';
import { useState } from 'react';

import { Tabs, tabClassName } from './Tabs';

const Story: Meta<typeof Tabs> = {
  component: Tabs,
  title: 'Tabs',
};
export default Story;

export const Default: StoryFn<typeof Tabs> = () => {
  const [activeTab, setActiveTab] = useState('account');
  const tabs = ['account', 'password', 'settings'];

  return (
    <div className="flex flex-col gap-4">
      <Tabs>
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            className={tabClassName}
            data-status={activeTab === tab ? 'active' : undefined}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </Tabs>
      <div className="p-4">
        {activeTab === 'account' && (
          <div className="flex flex-col gap-2">
            <h3 className="text-l font-semibold">Account</h3>
            <p className="text-s text-grey-placeholder">
              Make changes to your account here. Click save when you&apos;re done.
            </p>
          </div>
        )}
        {activeTab === 'password' && (
          <div className="flex flex-col gap-2">
            <h3 className="text-l font-semibold">Password</h3>
            <p className="text-s text-grey-placeholder">
              Change your password here. After saving, you&apos;ll be logged out.
            </p>
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="flex flex-col gap-2">
            <h3 className="text-l font-semibold">Settings</h3>
            <p className="text-s text-grey-placeholder">Manage your application settings.</p>
          </div>
        )}
      </div>
    </div>
  );
};
