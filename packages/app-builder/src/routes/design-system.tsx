import { ThemeProvider, useTheme } from '@app-builder/contexts/ThemeContext';
import { type FunctionComponent, useState } from 'react';
import { ButtonV2, Checkbox, Input, Switch, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';

/**
 * Design System Page
 *
 * A standalone page for testing and developing UI components with dark mode support.
 * No authentication required - for development purposes only.
 */

// Color swatch component for displaying color palette
function ColorSwatch({ name, className }: { name: string; className: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`size-16 rounded-v2-md border border-grey-border shadow-sm ${className}`} />
      <span className="text-2xs text-grey-placeholder text-center max-w-20 leading-tight">{name}</span>
    </div>
  );
}

// Surface swatch for semantic surface tokens
function SurfaceSwatch({ name, className }: { name: string; className: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className={`h-20 w-32 rounded-v2-lg border border-grey-border shadow-sm ${className}`} />
      <span className="text-xs text-grey-placeholder">{name}</span>
    </div>
  );
}

// Theme toggle button component
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <ButtonV2 onClick={toggleTheme} variant="secondary" appearance="stroked" size="default">
      <Icon icon={theme === 'dark' ? 'lightbulb' : 'visibility_off'} className="size-5" />
      <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
    </ButtonV2>
  );
}

// Section wrapper component
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-l font-semibold text-grey-primary">{title}</h2>
      <div className="rounded-v2-xl border border-grey-border bg-surface-card p-v2-lg">{children}</div>
    </section>
  );
}

// Subsection for grouping related colors
function ColorGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-s font-medium text-grey-secondary">{title}</h3>
      <div className="flex flex-wrap gap-4">{children}</div>
    </div>
  );
}

// Surface tokens section
function SurfaceTokensSection() {
  return (
    <Section title="Surface Tokens">
      <div className="flex flex-col gap-6">
        <p className="text-s text-grey-placeholder">
          Semantic surface tokens that automatically adapt to light/dark mode.
        </p>
        <div className="flex flex-wrap gap-6">
          <SurfaceSwatch name="surface-page" className="bg-surface-page" />
          <SurfaceSwatch name="surface-card" className="bg-surface-card" />
          <SurfaceSwatch name="surface-sidebar" className="bg-surface-sidebar" />
          <SurfaceSwatch name="surface-elevated" className="bg-surface-elevated" />
          <SurfaceSwatch name="surface-popover" className="bg-surface-popover" />
          <SurfaceSwatch name="surface-row" className="bg-surface-row" />
          <SurfaceSwatch name="surface-row-hover" className="bg-surface-row-hover" />
        </div>
      </div>
    </Section>
  );
}

// Color palette section
function ColorPaletteSection() {
  return (
    <Section title="Color Palette">
      <div className="flex flex-col gap-8">
        {/* Grey scale */}
        <ColorGroup title="Grey">
          <ColorSwatch name="primary" className="bg-grey-primary" />
          <ColorSwatch name="hover" className="bg-grey-hover" />
          <ColorSwatch name="secondary" className="bg-grey-secondary" />
          <ColorSwatch name="placeholder" className="bg-grey-placeholder" />
          <ColorSwatch name="disabled" className="bg-grey-disabled" />
          <ColorSwatch name="border" className="bg-grey-border" />
          <ColorSwatch name="background" className="bg-grey-background" />
          <ColorSwatch name="background-light" className="bg-grey-background-light" />
          <ColorSwatch name="white" className="bg-grey-white" />
        </ColorGroup>

        {/* Purple scale */}
        <ColorGroup title="Purple">
          <ColorSwatch name="primary" className="bg-purple-primary" />
          <ColorSwatch name="hover" className="bg-purple-hover" />
          <ColorSwatch name="secondary" className="bg-purple-secondary" />
          <ColorSwatch name="placeholder" className="bg-purple-placeholder" />
          <ColorSwatch name="disabled" className="bg-purple-disabled" />
          <ColorSwatch name="border" className="bg-purple-border" />
          <ColorSwatch name="border-light" className="bg-purple-border-light" />
          <ColorSwatch name="background" className="bg-purple-background" />
          <ColorSwatch name="background-light" className="bg-purple-background-light" />
        </ColorGroup>

        {/* Green scale */}
        <ColorGroup title="Green">
          <ColorSwatch name="primary" className="bg-green-primary" />
          <ColorSwatch name="hover" className="bg-green-hover" />
          <ColorSwatch name="secondary" className="bg-green-secondary" />
          <ColorSwatch name="placeholder" className="bg-green-placeholder" />
          <ColorSwatch name="disabled" className="bg-green-disabled" />
          <ColorSwatch name="border" className="bg-green-border" />
          <ColorSwatch name="background" className="bg-green-background" />
          <ColorSwatch name="background-light" className="bg-green-background-light" />
        </ColorGroup>

        {/* Red scale */}
        <ColorGroup title="Red">
          <ColorSwatch name="primary" className="bg-red-primary" />
          <ColorSwatch name="hover" className="bg-red-hover" />
          <ColorSwatch name="secondary" className="bg-red-secondary" />
          <ColorSwatch name="placeholder" className="bg-red-placeholder" />
          <ColorSwatch name="disabled" className="bg-red-disabled" />
          <ColorSwatch name="border" className="bg-red-border" />
          <ColorSwatch name="background" className="bg-red-background" />
          <ColorSwatch name="background-light" className="bg-red-background-light" />
        </ColorGroup>

        {/* Yellow scale */}
        <ColorGroup title="Yellow">
          <ColorSwatch name="primary" className="bg-yellow-primary" />
          <ColorSwatch name="hover" className="bg-yellow-hover" />
          <ColorSwatch name="secondary" className="bg-yellow-secondary" />
          <ColorSwatch name="placeholder" className="bg-yellow-placeholder" />
          <ColorSwatch name="disabled" className="bg-yellow-disabled" />
          <ColorSwatch name="border" className="bg-yellow-border" />
          <ColorSwatch name="background" className="bg-yellow-background" />
          <ColorSwatch name="background-light" className="bg-yellow-background-light" />
        </ColorGroup>

        {/* Orange scale */}
        <ColorGroup title="Orange">
          <ColorSwatch name="primary" className="bg-orange-primary" />
          <ColorSwatch name="hover" className="bg-orange-hover" />
          <ColorSwatch name="secondary" className="bg-orange-secondary" />
          <ColorSwatch name="placeholder" className="bg-orange-placeholder" />
          <ColorSwatch name="disabled" className="bg-orange-disabled" />
          <ColorSwatch name="border" className="bg-orange-border" />
          <ColorSwatch name="background" className="bg-orange-background" />
          <ColorSwatch name="background-light" className="bg-orange-background-light" />
        </ColorGroup>

        {/* Blue scale */}
        <ColorGroup title="Blue">
          <ColorSwatch name="blue-58" className="bg-blue-58" />
          <ColorSwatch name="blue-96" className="bg-blue-96" />
        </ColorGroup>
      </div>
    </Section>
  );
}

// Spacing tokens section
function SpacingSection() {
  const spacings = [
    { name: 'xxs', value: '0.125rem', class: 'w-v2-xxs' },
    { name: 'xs', value: '0.25rem', class: 'w-v2-xs' },
    { name: 'sm', value: '0.5rem', class: 'w-v2-sm' },
    { name: 'md', value: '1rem', class: 'w-v2-md' },
    { name: 'lg', value: '1.5rem', class: 'w-v2-lg' },
    { name: 'xl', value: '2rem', class: 'w-v2-xl' },
    { name: 'xxl', value: '2.5rem', class: 'w-v2-xxl' },
    { name: 'xxxl', value: '3rem', class: 'w-v2-xxxl' },
  ];

  const radiuses = [
    { name: 'xs', value: '0.125rem', class: 'rounded-v2-xs' },
    { name: 's', value: '0.25rem', class: 'rounded-v2-s' },
    { name: 'md', value: '0.5rem', class: 'rounded-v2-md' },
    { name: 'lg', value: '0.75rem', class: 'rounded-v2-lg' },
    { name: 'xl', value: '1rem', class: 'rounded-v2-xl' },
    { name: 'xxl', value: '1.5rem', class: 'rounded-v2-xxl' },
  ];

  return (
    <Section title="Spacing & Radius">
      <div className="flex flex-col gap-8">
        {/* Spacing */}
        <div className="flex flex-col gap-4">
          <h3 className="text-s font-medium text-grey-secondary">Spacing Tokens</h3>
          <div className="flex flex-col gap-3">
            {spacings.map((s) => (
              <div key={s.name} className="flex items-center gap-4">
                <span className="w-16 text-xs font-mono text-grey-placeholder">v2-{s.name}</span>
                <div className={`h-4 bg-purple-primary ${s.class}`} />
                <span className="text-xs text-grey-disabled">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Radius */}
        <div className="flex flex-col gap-4">
          <h3 className="text-s font-medium text-grey-secondary">Border Radius</h3>
          <div className="flex flex-wrap gap-6">
            {radiuses.map((r) => (
              <div key={r.name} className="flex flex-col items-center gap-2">
                <div className={`size-16 border-2 border-purple-primary bg-purple-background ${r.class}`} />
                <span className="text-xs font-mono text-grey-placeholder">v2-{r.name}</span>
                <span className="text-2xs text-grey-disabled">{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

// Typography section
function TypographySection() {
  return (
    <Section title="Typography">
      <div className="flex flex-col gap-6">
        {/* Size scale */}
        <div className="flex flex-col gap-4">
          <h3 className="text-s font-medium text-grey-secondary">Size Scale</h3>
          <div className="flex flex-col gap-3">
            <div className="flex items-baseline gap-4">
              <span className="w-16 text-xs font-mono text-grey-placeholder">2xl</span>
              <p className="text-2xl font-semibold text-grey-primary">The quick brown fox</p>
            </div>
            <div className="flex items-baseline gap-4">
              <span className="w-16 text-xs font-mono text-grey-placeholder">l</span>
              <p className="text-l font-semibold text-grey-primary">The quick brown fox</p>
            </div>
            <div className="flex items-baseline gap-4">
              <span className="w-16 text-xs font-mono text-grey-placeholder">m</span>
              <p className="text-m text-grey-primary">The quick brown fox</p>
            </div>
            <div className="flex items-baseline gap-4">
              <span className="w-16 text-xs font-mono text-grey-placeholder">s</span>
              <p className="text-s text-grey-primary">The quick brown fox</p>
            </div>
            <div className="flex items-baseline gap-4">
              <span className="w-16 text-xs font-mono text-grey-placeholder">r</span>
              <p className="text-r text-grey-primary">The quick brown fox</p>
            </div>
            <div className="flex items-baseline gap-4">
              <span className="w-16 text-xs font-mono text-grey-placeholder">xs</span>
              <p className="text-xs text-grey-primary">The quick brown fox</p>
            </div>
            <div className="flex items-baseline gap-4">
              <span className="w-16 text-xs font-mono text-grey-placeholder">2xs</span>
              <p className="text-2xs text-grey-primary">The quick brown fox</p>
            </div>
          </div>
        </div>

        {/* Text colors */}
        <div className="flex flex-col gap-4">
          <h3 className="text-s font-medium text-grey-secondary">Text Colors</h3>
          <div className="flex flex-col gap-2">
            <p className="text-s text-grey-primary">Primary text - grey-primary</p>
            <p className="text-s text-grey-secondary">Secondary text - grey-secondary</p>
            <p className="text-s text-grey-placeholder">Placeholder text - grey-placeholder</p>
            <p className="text-s text-grey-disabled">Disabled text - grey-disabled</p>
          </div>
        </div>
      </div>
    </Section>
  );
}

// Buttons section
function ButtonsSection() {
  return (
    <Section title="Buttons">
      <div className="flex flex-col gap-8">
        {/* Primary */}
        <div className="flex flex-col gap-4">
          <h3 className="text-s font-medium text-grey-secondary">Primary</h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-xs text-grey-placeholder">Filled</span>
              <div className="flex flex-wrap items-center gap-3">
                <ButtonV2 variant="primary" appearance="filled">
                  Button
                </ButtonV2>
                <ButtonV2 variant="primary" appearance="filled" disabled>
                  Disabled
                </ButtonV2>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs text-grey-placeholder">Stroked</span>
              <div className="flex flex-wrap items-center gap-3">
                <ButtonV2 variant="primary" appearance="stroked">
                  Button
                </ButtonV2>
                <ButtonV2 variant="primary" appearance="stroked" disabled>
                  Disabled
                </ButtonV2>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs text-grey-placeholder">Link</span>
              <div className="flex flex-wrap items-center gap-3">
                <ButtonV2 variant="primary" appearance="link">
                  Link
                </ButtonV2>
                <ButtonV2 variant="primary" appearance="link" disabled>
                  Disabled
                </ButtonV2>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary */}
        <div className="flex flex-col gap-4">
          <h3 className="text-s font-medium text-grey-secondary">Secondary</h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-xs text-grey-placeholder">Filled</span>
              <div className="flex flex-wrap items-center gap-3">
                <ButtonV2 variant="secondary" appearance="filled">
                  Button
                </ButtonV2>
                <ButtonV2 variant="secondary" appearance="filled" disabled>
                  Disabled
                </ButtonV2>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs text-grey-placeholder">Stroked</span>
              <div className="flex flex-wrap items-center gap-3">
                <ButtonV2 variant="secondary" appearance="stroked">
                  Button
                </ButtonV2>
                <ButtonV2 variant="secondary" appearance="stroked" disabled>
                  Disabled
                </ButtonV2>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs text-grey-placeholder">Link</span>
              <div className="flex flex-wrap items-center gap-3">
                <ButtonV2 variant="secondary" appearance="link">
                  Link
                </ButtonV2>
                <ButtonV2 variant="secondary" appearance="link" disabled>
                  Disabled
                </ButtonV2>
              </div>
            </div>
          </div>
        </div>

        {/* Destructive */}
        <div className="flex flex-col gap-4">
          <h3 className="text-s font-medium text-grey-secondary">Destructive</h3>
          <div className="flex flex-wrap items-center gap-3">
            <ButtonV2 variant="destructive">Delete</ButtonV2>
            <ButtonV2 variant="destructive" disabled>
              Disabled
            </ButtonV2>
          </div>
        </div>

        {/* Sizes */}
        <div className="flex flex-col gap-4">
          <h3 className="text-s font-medium text-grey-secondary">Sizes</h3>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex flex-col items-center gap-2">
              <ButtonV2 variant="primary" size="small">
                Small
              </ButtonV2>
              <span className="text-2xs text-grey-placeholder">small</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <ButtonV2 variant="primary" size="default">
                Default
              </ButtonV2>
              <span className="text-2xs text-grey-placeholder">default</span>
            </div>
          </div>
        </div>

        {/* Icon buttons */}
        <div className="flex flex-col gap-4">
          <h3 className="text-s font-medium text-grey-secondary">Icon Mode</h3>
          <div className="flex flex-wrap items-center gap-4">
            <ButtonV2 variant="primary" mode="icon" size="small">
              <Icon icon="plus" className="size-4" />
            </ButtonV2>
            <ButtonV2 variant="primary" mode="icon" size="default">
              <Icon icon="plus" className="size-5" />
            </ButtonV2>
            <ButtonV2 variant="secondary" mode="icon">
              <Icon icon="edit" className="size-4" />
            </ButtonV2>
            <ButtonV2 variant="destructive" mode="icon">
              <Icon icon="delete" className="size-4" />
            </ButtonV2>
          </div>
        </div>
      </div>
    </Section>
  );
}

// Form inputs section
function InputsSection() {
  const [inputValue, setInputValue] = useState('');

  return (
    <Section title="Form Inputs">
      <div className="flex flex-col gap-6">
        {/* Text inputs */}
        <div className="flex flex-col gap-4">
          <h3 className="text-s font-medium text-grey-secondary">Text Input States</h3>
          <div className="grid max-w-md gap-4">
            <Input
              placeholder="Placeholder text..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <Input value="Filled input" readOnly />
            <Input placeholder="Disabled input" disabled />
            <Input placeholder="Error state" borderColor="redfigma-47" />
          </div>
        </div>

        {/* With adornments */}
        <div className="flex flex-col gap-4">
          <h3 className="text-s font-medium text-grey-secondary">With Adornments</h3>
          <div className="grid max-w-md gap-4">
            <Input placeholder="Search..." startAdornment="search" />
            <Input placeholder="Email" endAdornment="send" />
          </div>
        </div>
      </div>
    </Section>
  );
}

// Checkboxes and toggles section
function CheckboxesSection() {
  const [checked, setChecked] = useState(false);
  const [switchOn, setSwitchOn] = useState(false);

  return (
    <Section title="Checkboxes & Toggles">
      <div className="flex flex-col gap-6">
        {/* Checkboxes */}
        <div className="flex flex-col gap-4">
          <h3 className="text-s font-medium text-grey-secondary">Checkboxes</h3>
          <div className="flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2">
              <Checkbox checked={checked} onCheckedChange={(value) => setChecked(value === true)} />
              <span className="text-s text-grey-primary">Default checkbox</span>
            </label>
            <label className="flex items-center gap-2">
              <Checkbox checked disabled />
              <span className="text-s text-grey-disabled">Disabled checked</span>
            </label>
            <label className="flex items-center gap-2">
              <Checkbox disabled />
              <span className="text-s text-grey-disabled">Disabled unchecked</span>
            </label>
          </div>
        </div>

        {/* Switches */}
        <div className="flex flex-col gap-4">
          <h3 className="text-s font-medium text-grey-secondary">Switches</h3>
          <div className="flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2">
              <Switch checked={switchOn} onCheckedChange={setSwitchOn} />
              <span className="text-s text-grey-primary">Toggle switch</span>
            </label>
            <label className="flex items-center gap-2">
              <Switch checked disabled />
              <span className="text-s text-grey-disabled">Disabled on</span>
            </label>
            <label className="flex items-center gap-2">
              <Switch disabled />
              <span className="text-s text-grey-disabled">Disabled off</span>
            </label>
          </div>
        </div>
      </div>
    </Section>
  );
}

// Tags section
function TagsSection() {
  return (
    <Section title="Tags">
      <div className="flex flex-col gap-6">
        {/* Color variants */}
        <div className="flex flex-col gap-4">
          <h3 className="text-s font-medium text-grey-secondary">Colors</h3>
          <div className="flex flex-wrap items-center gap-3">
            <Tag color="purple">Purple</Tag>
            <Tag color="grey">Grey</Tag>
            <Tag color="green">Green</Tag>
            <Tag color="red">Red</Tag>
            <Tag color="yellow">Yellow</Tag>
            <Tag color="orange">Orange</Tag>
            <Tag color="blue">Blue</Tag>
          </div>
        </div>

        {/* Sizes */}
        <div className="flex flex-col gap-4">
          <h3 className="text-s font-medium text-grey-secondary">Sizes</h3>
          <div className="flex flex-wrap items-center gap-3">
            <Tag color="purple" size="small">
              Small
            </Tag>
            <Tag color="purple" size="big">
              Big
            </Tag>
          </div>
        </div>
      </div>
    </Section>
  );
}

// Main content component (needs to be inside ThemeProvider to use useTheme)
function DesignSystemContent() {
  const { theme } = useTheme();

  return (
    <div className="h-screen overflow-y-auto bg-surface-page transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-grey-border bg-surface-card/80 px-v2-lg py-v2-md backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-v2-md">
            <div className="flex size-10 items-center justify-center rounded-v2-lg bg-purple-primary">
              <span className="text-l font-bold text-white">M</span>
            </div>
            <div>
              <h1 className="text-l font-bold text-grey-primary">Design System</h1>
              <p className="text-xs text-grey-placeholder">
                Theme: <span className="font-medium text-grey-secondary">{theme}</span>
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-v2-lg py-v2-xl">
        <div className="flex flex-col gap-v2-xl">
          <SurfaceTokensSection />
          <ColorPaletteSection />
          <SpacingSection />
          <TypographySection />
          <ButtonsSection />
          <InputsSection />
          <CheckboxesSection />
          <TagsSection />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-grey-border bg-surface-card px-v2-lg py-v2-md">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs text-grey-placeholder">Marble Design System v2</p>
        </div>
      </footer>
    </div>
  );
}

// Page component with ThemeProvider wrapper
const DesignSystemPage: FunctionComponent = () => {
  return (
    <ThemeProvider>
      <DesignSystemContent />
    </ThemeProvider>
  );
};

export default DesignSystemPage;
