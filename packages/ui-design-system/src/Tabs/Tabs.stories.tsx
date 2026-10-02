import { type Meta, type StoryFn } from '@storybook/react';
import { useId, useState } from 'react';
import { capitalize } from 'remeda';
import { Tabs } from './Tabs';

const Story: Meta<typeof Tabs> = {
  component: Tabs,
  title: 'Tabs',
};
export default Story;

export const Buttons: StoryFn<typeof Tabs> = () => {
  const [activeTab, setActiveTab] = useState('account');
  const tabs = ['account', 'password', 'settings'];
  const tabsId = useId();

  return (
    <div className="flex flex-col gap-md">
      <Tabs id={tabsId} value={activeTab} onValueChange={setActiveTab}>
        {tabs.map((tab) => (
          <Tabs.Button key={tab} value={tab}>
            {capitalize(tab)}
          </Tabs.Button>
        ))}
      </Tabs>
      <Tabs.Panel tabsId={tabsId} value={activeTab} className="p-md">
        {activeTab === 'account' && (
          <div className="flex flex-col gap-sm">
            <h3 className="text-l font-semibold">Account</h3>
            <p className="text-s text-grey-placeholder">
              Make changes to your account here. Click save when you&apos;re done.
            </p>
          </div>
        )}
        {activeTab === 'password' && (
          <div className="flex flex-col gap-sm">
            <h3 className="text-l font-semibold">Password</h3>
            <p className="text-s text-grey-placeholder">
              Change your password here. After saving, you&apos;ll be logged out.
            </p>
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="flex flex-col gap-sm">
            <h3 className="text-l font-semibold">Settings</h3>
            <p className="text-s text-grey-placeholder">Manage your application settings.</p>
          </div>
        )}
      </Tabs.Panel>
    </div>
  );
};

export const Links: StoryFn<typeof Tabs> = () => {
  return (
    <Tabs.Nav>
      <Tabs.Link href="#overview" aria-current="page">
        Overview
      </Tabs.Link>
      <Tabs.Link href="#analytics">Analytics</Tabs.Link>
      <Tabs.Link href="#cases">Cases</Tabs.Link>
    </Tabs.Nav>
  );
};

export const Grey: StoryFn<typeof Tabs> = () => {
  const [activeTab, setActiveTab] = useState('client-1');
  const tabs = ['client-1', 'client-2', 'client-3'];

  return (
    <div className="flex flex-col gap-md">
      <Tabs color="grey" value={activeTab} onValueChange={setActiveTab}>
        {tabs.map((tab) => (
          <Tabs.Button key={tab} value={tab}>
            {capitalize(tab.replace('-', ' '))}
          </Tabs.Button>
        ))}
      </Tabs>
      <Tabs.Nav color="grey">
        <Tabs.Link href="#overview" aria-current="page">
          Overview
        </Tabs.Link>
        <Tabs.Link href="#analytics">Analytics</Tabs.Link>
        <Tabs.Link href="#cases">Cases</Tabs.Link>
      </Tabs.Nav>
    </div>
  );
};

export const Fluid: StoryFn<typeof Tabs> = () => {
  const [activeTab, setActiveTab] = useState('client-1');
  const tabs = ['client-1', 'client-2', 'client-3', 'client-4', 'client-5', 'client-6'];

  return (
    <div className="max-w-xs">
      <Tabs variant="fluid" value={activeTab} onValueChange={setActiveTab}>
        {tabs.map((tab) => (
          <Tabs.Button key={tab} value={tab}>
            {capitalize(tab.replace('-', ' '))}
          </Tabs.Button>
        ))}
      </Tabs>
    </div>
  );
};
