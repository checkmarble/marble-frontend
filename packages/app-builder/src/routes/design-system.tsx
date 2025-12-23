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
    <div className="flex flex-col gap-1">
      <div className={`h-16 w-24 rounded-lg border border-grey-90 ${className}`} />
      <span className="text-xs text-grey-50">{name}</span>
    </div>
  );
}

// Theme toggle button component
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <ButtonV2 onClick={toggleTheme} variant="secondary" appearance="stroked">
      <Icon icon={theme === 'dark' ? 'lightbulb' : 'visibility_off'} className="size-5" />
      <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
    </ButtonV2>
  );
}

// Section wrapper component
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-l font-semibold text-grey-00">{title}</h2>
      <div className="rounded-xl border border-grey-90 bg-surface-card p-6">{children}</div>
    </section>
  );
}

// Color palette section - testing both semantic and numeric names
function ColorPaletteSection() {
  return (
    <Section title="Color Palette">
      <div className="flex flex-col gap-6">
        {/* Grey scale - SEMANTIC names (new) */}
        <div>
          <h3 className="mb-3 text-s font-medium text-grey-50">Grey - Semantic Names (New)</h3>
          <div className="flex flex-wrap gap-4">
            <ColorSwatch name="grey-primary" className="bg-grey-primary" />
            <ColorSwatch name="grey-hover" className="bg-grey-hover" />
            <ColorSwatch name="grey-secondary" className="bg-grey-secondary" />
            <ColorSwatch name="grey-placeholder" className="bg-grey-placeholder" />
            <ColorSwatch name="grey-disabled" className="bg-grey-disabled" />
            <ColorSwatch name="grey-border" className="bg-grey-border" />
            <ColorSwatch name="grey-background" className="bg-grey-background" />
            <ColorSwatch name="grey-background-light" className="bg-grey-background-light" />
            <ColorSwatch name="grey-white" className="bg-grey-white" />
          </div>
        </div>

        {/* Grey scale - NUMERIC names (backward compatible) */}
        <div>
          <h3 className="mb-3 text-s font-medium text-grey-50">Grey - Numeric Aliases (Old)</h3>
          <div className="flex flex-wrap gap-4">
            <ColorSwatch name="grey-00" className="bg-grey-00" />
            <ColorSwatch name="grey-50" className="bg-grey-50" />
            <ColorSwatch name="grey-80" className="bg-grey-80" />
            <ColorSwatch name="grey-90" className="bg-grey-90" />
            <ColorSwatch name="grey-95" className="bg-grey-95" />
            <ColorSwatch name="grey-98" className="bg-grey-98" />
            <ColorSwatch name="grey-100" className="bg-surface-card" />
          </div>
        </div>

        {/* Purple scale - SEMANTIC names (new) */}
        <div>
          <h3 className="mb-3 text-s font-medium text-grey-50">Purple - Semantic Names (New)</h3>
          <div className="flex flex-wrap gap-4">
            <ColorSwatch name="purple-primary-outline" className="bg-purple-primary-outline" />
            <ColorSwatch name="purple-primary" className="bg-purple-primary" />
            <ColorSwatch name="purple-secondary" className="bg-purple-secondary" />
            <ColorSwatch name="purple-hover" className="bg-purple-hover" />
            <ColorSwatch name="purple-disabled" className="bg-purple-disabled" />
            <ColorSwatch name="purple-border" className="bg-purple-border" />
            <ColorSwatch name="purple-border-light" className="bg-purple-border-light" />
            <ColorSwatch name="purple-background" className="bg-purple-background" />
            <ColorSwatch name="purple-background-light" className="bg-purple-background-light" />
          </div>
        </div>

        {/* Purple scale - NUMERIC names (backward compatible) */}
        <div>
          <h3 className="mb-3 text-s font-medium text-grey-50">Purple - Numeric Aliases (Old)</h3>
          <div className="flex flex-wrap gap-4">
            <ColorSwatch name="purple-60" className="bg-purple-60" />
            <ColorSwatch name="purple-65" className="bg-purple-65" />
            <ColorSwatch name="purple-82" className="bg-purple-82" />
            <ColorSwatch name="purple-85" className="bg-purple-85" />
            <ColorSwatch name="purple-96" className="bg-purple-96" />
            <ColorSwatch name="purple-98" className="bg-purple-background-light" />
          </div>
        </div>

        {/* Semantic colors */}
        <div>
          <h3 className="mb-3 text-s font-medium text-grey-50">Other Colors</h3>
          <div className="flex flex-wrap gap-4">
            <ColorSwatch name="green-38" className="bg-green-38" />
            <ColorSwatch name="red-47" className="bg-red-47" />
            <ColorSwatch name="yellow-50" className="bg-yellow-50" />
            <ColorSwatch name="orange-50" className="bg-orange-50" />
            <ColorSwatch name="blue-58" className="bg-blue-58" />
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
      <div className="flex flex-col gap-4">
        <p className="text-2xl font-semibold text-grey-00">Text 2XL - Heading</p>
        <p className="text-l font-semibold text-grey-00">Text L - Subheading</p>
        <p className="text-m text-grey-00">Text M - Body text</p>
        <p className="text-s text-grey-00">Text S - Small text</p>
        <p className="text-r text-grey-50">Text R - Regular text (secondary)</p>
        <p className="text-xs text-grey-50">Text XS - Extra small (placeholder)</p>
        <p className="text-2xs text-grey-80">Text 2XS - Tiny (disabled)</p>
      </div>
    </Section>
  );
}

// Buttons section
function ButtonsSection() {
  return (
    <Section title="Buttons (ButtonV2)">
      <div className="flex flex-col gap-6">
        {/* Primary filled */}
        <div>
          <h3 className="mb-3 text-s font-medium text-grey-50">Primary Filled</h3>
          <div className="flex flex-wrap items-center gap-4">
            <ButtonV2 variant="primary" appearance="filled">
              Primary
            </ButtonV2>
            <ButtonV2 variant="primary" appearance="filled" size="default">
              Default Size
            </ButtonV2>
            <ButtonV2 variant="primary" appearance="filled" disabled>
              Disabled
            </ButtonV2>
          </div>
        </div>

        {/* Primary stroked */}
        <div>
          <h3 className="mb-3 text-s font-medium text-grey-50">Primary Stroked</h3>
          <div className="flex flex-wrap items-center gap-4">
            <ButtonV2 variant="primary" appearance="stroked">
              Stroked
            </ButtonV2>
            <ButtonV2 variant="primary" appearance="stroked" disabled>
              Disabled
            </ButtonV2>
          </div>
        </div>

        {/* Primary link */}
        <div>
          <h3 className="mb-3 text-s font-medium text-grey-50">Link</h3>
          <div className="flex flex-wrap items-center gap-4">
            <ButtonV2 variant="primary" appearance="link">
              Primary Link
            </ButtonV2>
            <ButtonV2 variant="primary" appearance="link" disabled>
              Disabled
            </ButtonV2>
            <ButtonV2 variant="secondary" appearance="link">
              Secondary Link
            </ButtonV2>
            <ButtonV2 variant="secondary" appearance="link" disabled>
              Disabled
            </ButtonV2>
          </div>
        </div>

        {/* Secondary Filled */}
        <div>
          <h3 className="mb-3 text-s font-medium text-grey-50">Secondary Filled</h3>
          <div className="flex flex-wrap items-center gap-4">
            <ButtonV2 variant="secondary" appearance="filled">
              Secondary
            </ButtonV2>
            <ButtonV2 variant="secondary" appearance="filled" disabled>
              Disabled
            </ButtonV2>
          </div>
        </div>

        {/* Secondary Stroked */}
        <div>
          <h3 className="mb-3 text-s font-medium text-grey-50">Secondary Stroked</h3>
          <div className="flex flex-wrap items-center gap-4">
            <ButtonV2 variant="secondary" appearance="stroked">
              Stroked
            </ButtonV2>
            <ButtonV2 variant="secondary" appearance="stroked" disabled>
              Disabled
            </ButtonV2>
          </div>
        </div>

        {/* Destructive */}
        <div>
          <h3 className="mb-3 text-s font-medium text-grey-50">Destructive</h3>
          <div className="flex flex-wrap items-center gap-4">
            <ButtonV2 variant="destructive">Destructive</ButtonV2>
            <ButtonV2 variant="destructive" disabled>
              Disabled
            </ButtonV2>
          </div>
        </div>

        {/* Icon mode */}
        <div>
          <h3 className="mb-3 text-s font-medium text-grey-50">Icon Mode</h3>
          <div className="flex flex-wrap items-center gap-4">
            <ButtonV2 variant="primary" mode="icon">
              <Icon icon="plus" className="size-5" />
            </ButtonV2>
            <ButtonV2 variant="secondary" mode="icon">
              <Icon icon="edit" className="size-5" />
            </ButtonV2>
            <ButtonV2 variant="destructive" mode="icon">
              <Icon icon="delete" className="size-5" />
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
        <div>
          <h3 className="mb-3 text-s font-medium text-grey-50">Text Input States</h3>
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
        <div>
          <h3 className="mb-3 text-s font-medium text-grey-50">With Adornments</h3>
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
        <div>
          <h3 className="mb-3 text-s font-medium text-grey-50">Checkboxes</h3>
          <div className="flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2">
              <Checkbox checked={checked} onCheckedChange={(value) => setChecked(value === true)} />
              <span className="text-s text-grey-00">Default checkbox</span>
            </label>
            <label className="flex items-center gap-2">
              <Checkbox checked disabled />
              <span className="text-s text-grey-80">Disabled checked</span>
            </label>
            <label className="flex items-center gap-2">
              <Checkbox disabled />
              <span className="text-s text-grey-80">Disabled unchecked</span>
            </label>
          </div>
        </div>

        {/* Switches */}
        <div>
          <h3 className="mb-3 text-s font-medium text-grey-50">Switches</h3>
          <div className="flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2">
              <Switch checked={switchOn} onCheckedChange={setSwitchOn} />
              <span className="text-s text-grey-00">Toggle switch</span>
            </label>
            <label className="flex items-center gap-2">
              <Switch checked disabled />
              <span className="text-s text-grey-80">Disabled on</span>
            </label>
            <label className="flex items-center gap-2">
              <Switch disabled />
              <span className="text-s text-grey-80">Disabled off</span>
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
        <div>
          <h3 className="mb-3 text-s font-medium text-grey-50">Colors</h3>
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
        <div>
          <h3 className="mb-3 text-s font-medium text-grey-50">Sizes</h3>
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
    <div className="h-screen overflow-y-auto bg-grey-95 transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-grey-90 bg-surface-card px-8 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-grey-00">Design System</h1>
            <p className="text-s text-grey-50">
              Current theme: <span className="font-medium">{theme}</span>
            </p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-6xl px-8 py-8">
        <div className="flex flex-col gap-8">
          <ColorPaletteSection />
          <TypographySection />
          <ButtonsSection />
          <InputsSection />
          <CheckboxesSection />
          <TagsSection />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-grey-90 bg-surface-card px-8 py-4">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs text-grey-50">Marble Design System - Development Page</p>
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
