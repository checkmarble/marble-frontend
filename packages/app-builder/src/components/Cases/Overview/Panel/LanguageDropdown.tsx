import { languages } from '@app-builder/models/ai-settings';
import { useState } from 'react';
import { MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';

interface LanguageDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

export function LanguageDropdown({ value, onChange }: LanguageDropdownProps) {
  const [open, setOpen] = useState(false);
  const currentLanguage = languages.get(value) ?? 'English';

  return (
    <MenuCommand.Menu open={open} onOpenChange={setOpen}>
      <MenuCommand.Trigger>
        <button
          type="button"
          className="bg-purple-96 text-purple-65 text-xs font-medium px-v2-sm py-v2-xs rounded-sm flex items-center gap-v2-xs w-fit"
        >
          Output language: {currentLanguage}
          <Icon icon="caret-down" className="size-4" />
        </button>
      </MenuCommand.Trigger>
      <MenuCommand.Content sameWidth sideOffset={4} align="start" className="min-w-40">
        <MenuCommand.List>
          {Array.from(languages.entries()).map(([code, language]) => (
            <MenuCommand.Item key={code} value={code} onSelect={() => onChange(code)}>
              {language}
            </MenuCommand.Item>
          ))}
        </MenuCommand.List>
      </MenuCommand.Content>
    </MenuCommand.Menu>
  );
}
