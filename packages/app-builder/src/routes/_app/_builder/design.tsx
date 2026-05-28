import { Page } from '@app-builder/components';
import { BreadCrumbLink, type BreadCrumbProps, BreadCrumbs } from '@app-builder/components/Breadcrumbs';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Checkbox, type CheckedState, cn, Radio } from 'ui-design-system';

export const Route = createFileRoute('/_app/_builder/design')({
  staticData: {
    BreadCrumbs: [
      ({ isLast }: BreadCrumbProps) => (
        <BreadCrumbLink to="/design" isLast={isLast}>
          Design system
        </BreadCrumbLink>
      ),
    ],
  },
  component: DesignPage,
});

type Size = 'regular' | 'small';
const SIZES: Size[] = ['regular', 'small'];

function DesignPage() {
  return (
    <Page.Main>
      <Page.Header className="justify-between">
        <BreadCrumbs />
      </Page.Header>
      <Page.Container>
        <Page.Content>
          <div className="flex flex-col gap-12">
            <Section title="Radio" description="Figma node 1206-800">
              <RadioMatrix />
            </Section>
            <Section title="Checkbox" description="Figma node 2-472">
              <CheckboxMatrix />
            </Section>
          </div>
        </Page.Content>
      </Page.Container>
    </Page.Main>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  const [dark, setDark] = useState(false);
  return (
    <section className="flex flex-col gap-4">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-l font-semibold">{title}</h2>
          {description ? <p className="text-s text-grey-secondary">{description}</p> : null}
        </div>
        <button
          type="button"
          onClick={() => setDark((v) => !v)}
          className="border-grey-border hover:bg-grey-background-light rounded-md border px-3 py-1.5 text-xs"
        >
          {dark ? 'Light preview' : 'Dark preview'}
        </button>
      </header>
      <div className={cn('border-grey-border bg-grey-white rounded-lg border p-6', dark && 'dark bg-grey-background')}>
        <div className={dark ? 'text-grey-white' : undefined}>{children}</div>
      </div>
    </section>
  );
}

function VariantCell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex w-32 flex-col items-center gap-2">
      <div className="flex h-10 items-center justify-center">{children}</div>
      <span className="text-grey-secondary text-center text-xs">{label}</span>
    </div>
  );
}

function MatrixRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-20 shrink-0 text-xs font-medium">{label}</span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function RadioMatrix() {
  return (
    <div className="flex flex-col gap-6">
      {SIZES.map((size) => (
        <MatrixRow key={size} label={size}>
          <VariantCell label="unselected">
            <Radio.Root value="" onValueChange={() => undefined} size={size}>
              <Radio.Item value="x" />
            </Radio.Root>
          </VariantCell>
          <VariantCell label="selected">
            <Radio.Root value="x" onValueChange={() => undefined} size={size}>
              <Radio.Item value="x" />
            </Radio.Root>
          </VariantCell>
          <VariantCell label="disabled">
            <Radio.Root value="" onValueChange={() => undefined} size={size}>
              <Radio.Item value="x" disabled />
            </Radio.Root>
          </VariantCell>
          <VariantCell label="selected disabled">
            <Radio.Root value="x" onValueChange={() => undefined} size={size}>
              <Radio.Item value="x" disabled />
            </Radio.Root>
          </VariantCell>
        </MatrixRow>
      ))}
      <InteractiveRadio />
    </div>
  );
}

function InteractiveRadio() {
  const [value, setValue] = useState('option1');
  return (
    <div className="border-grey-border mt-2 flex flex-col gap-2 border-t pt-4">
      <span className="text-s font-medium">Interactive</span>
      <Radio.Root value={value} onValueChange={setValue}>
        <label className="text-s flex items-center gap-2">
          <Radio.Item value="option1" />
          Option 1
        </label>
        <label className="text-s flex items-center gap-2">
          <Radio.Item value="option2" />
          Option 2
        </label>
        <label className="text-s text-grey-disabled flex items-center gap-2">
          <Radio.Item value="option3" disabled />
          Option 3 (disabled)
        </label>
      </Radio.Root>
    </div>
  );
}

function CheckboxMatrix() {
  return (
    <div className="flex flex-col gap-6">
      {SIZES.map((size) => (
        <MatrixRow key={size} label={size}>
          <VariantCell label="unselected">
            <Checkbox size={size} checked={false} />
          </VariantCell>
          <VariantCell label="selected">
            <Checkbox size={size} checked />
          </VariantCell>
          <VariantCell label="indeterminate">
            <Checkbox size={size} checked="indeterminate" />
          </VariantCell>
          <VariantCell label="disabled">
            <Checkbox size={size} checked={false} disabled />
          </VariantCell>
          <VariantCell label="selected disabled">
            <Checkbox size={size} checked disabled />
          </VariantCell>
          <VariantCell label="indeterminate disabled">
            <Checkbox size={size} checked="indeterminate" disabled />
          </VariantCell>
        </MatrixRow>
      ))}
      <InteractiveCheckbox />
    </div>
  );
}

function InteractiveCheckbox() {
  const [checked, setChecked] = useState<CheckedState>(false);
  return (
    <div className="border-grey-border mt-2 flex flex-col gap-2 border-t pt-4">
      <span className="text-s font-medium">Interactive</span>
      <div className="flex items-center gap-2">
        <Checkbox id="design-cb" checked={checked} onCheckedChange={setChecked} />
        <label htmlFor="design-cb" className="text-s">
          Click me — current: {String(checked)}
        </label>
      </div>
    </div>
  );
}
