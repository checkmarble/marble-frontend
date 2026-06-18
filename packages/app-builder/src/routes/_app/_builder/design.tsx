import { Page } from '@app-builder/components';
import { BreadCrumbLink, type BreadCrumbProps, BreadCrumbs } from '@app-builder/components/Breadcrumbs';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Button, Checkbox, type CheckedState, cn, Radio, Switch, Typo } from 'ui-design-system';
import { Icon } from 'ui-icons';

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
          <div className="flex flex-col gap-3xl">
            <Section title="Radio" description="Figma node 1206-800">
              <RadioMatrix />
            </Section>
            <Section title="Checkbox" description="Figma node 2-472">
              <CheckboxMatrix />
            </Section>
            <Section title="Switch" description="Figma node 2-580">
              <SwitchMatrix />
            </Section>
            <Section title="Button" description="Figma node 881-9199">
              <ButtonMatrix />
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
    <section className="flex flex-col gap-md max-w-5xl">
      <header className="flex items-center justify-between">
        <div>
          <Typo variant="title2">{title}</Typo>
          {description ? <p className="text-s text-grey-secondary">{description}</p> : null}
        </div>
        <Button type="button" onClick={() => setDark((v) => !v)} variant="secondary" appearance="stroked" size="medium">
          {dark ? 'Light preview' : 'Dark preview'}
        </Button>
      </header>
      <div className={cn('border-grey-border bg-grey-white rounded-lg border p-lg', dark && 'dark bg-grey-background')}>
        <div className={dark ? 'text-grey-white' : undefined}>{children}</div>
      </div>
    </section>
  );
}

function VariantCell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex w-32 flex-col items-center gap-sm">
      <div className="flex h-10 items-center justify-center">{children}</div>
      <span className="text-grey-secondary text-center text-xs">{label}</span>
    </div>
  );
}

function MatrixRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-sm">
      <span className="w-20 shrink-0 text-xs font-medium">{label}</span>
      <div className="flex flex-wrap gap-sm">{children}</div>
    </div>
  );
}

function RadioMatrix() {
  return (
    <div className="flex flex-col gap-lg">
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
      <div className="grid grid-cols-2 gap-md">
        <InteractiveRadio size="regular" />
        <InteractiveRadio size="small" />
      </div>
    </div>
  );
}

function InteractiveRadio({ size }: { size: Size }) {
  const [value, setValue] = useState('option1');
  return (
    <div className="border-grey-border mt-sm flex flex-col gap-sm border-t pt-md">
      <span className="text-s font-medium">Interactive {size}</span>
      <Radio.Root value={value} onValueChange={setValue} size={size}>
        <label className="text-s flex items-center gap-sm">
          <Radio.Item value="option1" />
          Option 1
        </label>
        <label className="text-s flex items-center gap-sm">
          <Radio.Item value="option2" />
          Option 2
        </label>
        <label className="text-s text-grey-disabled flex items-center gap-sm">
          <Radio.Item value="option3" disabled />
          Option 3 (disabled)
        </label>
      </Radio.Root>
    </div>
  );
}

function CheckboxMatrix() {
  return (
    <div className="flex flex-col gap-lg">
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
      <div className="grid grid-cols-2 gap-md">
        <InteractiveCheckbox size="regular" />
        <InteractiveCheckbox size="small" />
      </div>
    </div>
  );
}

function SwitchMatrix() {
  return (
    <div className="flex flex-col gap-lg">
      <div className="flex flex-wrap gap-lg">
        <VariantCell label="off">
          <Switch checked={false} />
        </VariantCell>
        <VariantCell label="on">
          <Switch checked />
        </VariantCell>
        <VariantCell label="off disabled">
          <Switch checked={false} disabled />
        </VariantCell>
        <VariantCell label="on disabled">
          <Switch checked disabled />
        </VariantCell>
      </div>
      <InteractiveSwitch />
    </div>
  );
}

function InteractiveSwitch() {
  const [on, setOn] = useState(false);
  return (
    <div className="border-grey-border mt-sm flex flex-col gap-sm border-t pt-md">
      <span className="text-s font-medium">Interactive</span>
      <div className="flex items-center gap-md">
        <Switch checked={on} onCheckedChange={setOn} id="design-switch" />
        <label htmlFor="design-switch" className="text-s">
          Click me — current: {String(on)}
        </label>
      </div>
    </div>
  );
}

const BUTTON_APPEARANCES = ['filled', 'stroked', 'link'] as const;
const BUTTON_VARIANTS = ['primary', 'secondary', 'destructive'] as const;
const BUTTON_SIZES = ['small', 'medium', 'large'] as const;
const BUTTON_ICON_COLORS = ['primary', 'grey', 'red'] as const;
// Icon glyph scales with button size (Figma: small 16 / medium 20 / large 24).
const BUTTON_ICON_GLYPH = { small: 'size-4', medium: 'size-5', large: 'size-6' } as const;

function ButtonMatrix() {
  return (
    <div className="flex flex-col gap-xl">
      {/* variant × appearance, medium (size="medium") */}
      {BUTTON_APPEARANCES.map((appearance) => (
        <MatrixRow key={appearance} label={appearance}>
          {BUTTON_VARIANTS.map((variant) => (
            <VariantCell key={variant} label={variant}>
              <Button variant={variant} appearance={appearance} size="medium">
                Button
              </Button>
            </VariantCell>
          ))}
          <VariantCell label="disabled">
            <Button variant="primary" appearance={appearance} size="medium" disabled>
              Button
            </Button>
          </VariantCell>
        </MatrixRow>
      ))}

      {/* sizes — small / medium / large */}
      <div className="border-grey-border flex flex-col gap-md border-t pt-md">
        <span className="text-s font-medium">Sizes</span>
        <div className="flex flex-wrap items-center gap-md">
          {BUTTON_SIZES.map((size) => (
            <VariantCell key={size} label={size}>
              <Button variant="primary" size={size}>
                <Icon icon="plus" className={BUTTON_ICON_GLYPH[size]} />
                Button
              </Button>
            </VariantCell>
          ))}
        </div>
      </div>

      {/* Icon button (mode="icon") — Figma node 4-554 */}
      <div className="border-grey-border flex flex-col gap-md border-t pt-md">
        <span className="text-s font-medium">Icon button (Figma 4-554)</span>
        {/* filled, color axis × sizes */}
        {BUTTON_ICON_COLORS.map((color) => (
          <MatrixRow key={color} label={`filled ${color}`}>
            {BUTTON_SIZES.map((size) => (
              <VariantCell key={size} label={size}>
                <Button variant="primary" color={color} mode="icon" size={size} aria-label="add">
                  <Icon icon="plus" className={BUTTON_ICON_GLYPH[size]} />
                </Button>
              </VariantCell>
            ))}
            <VariantCell label="disabled">
              <Button variant="primary" color={color} mode="icon" size="medium" disabled aria-label="add">
                <Icon icon="plus" className="size-5" />
              </Button>
            </VariantCell>
          </MatrixRow>
        ))}
        {/* bordered (stroked) icon buttons */}
        <MatrixRow label="stroked">
          {BUTTON_SIZES.map((size) => (
            <VariantCell key={size} label={size}>
              <Button variant="primary" appearance="stroked" mode="icon" size={size} aria-label="edit">
                <Icon icon="edit-square" className={BUTTON_ICON_GLYPH[size]} />
              </Button>
            </VariantCell>
          ))}
          <VariantCell label="secondary">
            <Button variant="secondary" mode="icon" size="medium" aria-label="edit">
              <Icon icon="edit-square" className="size-5" />
            </Button>
          </VariantCell>
        </MatrixRow>
      </div>
    </div>
  );
}

function InteractiveCheckbox({ size }: { size: Size }) {
  const [checked, setChecked] = useState<CheckedState>(false);
  return (
    <div className="border-grey-border mt-sm flex flex-col gap-sm border-t pt-md">
      <span className="text-s font-medium">Interactive {size}</span>
      <div className="flex items-center gap-sm">
        <Checkbox id={`design-cb-${size}`} checked={checked} onCheckedChange={setChecked} size={size} />
        <label htmlFor={`design-cb-${size}`} className="text-s">
          Click me — current: {String(checked)}
        </label>
      </div>
    </div>
  );
}
