import { languages } from '@app-builder/models/ai-settings';
import { useState } from 'react';
import { MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';

interface LanguageDropdownProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function LanguageDropdown({ value, onChange, disabled }: LanguageDropdownProps) {
  const [open, setOpen] = useState(false);
  const currentLanguage = languages.get(value) ?? 'English';

  return (
    <MenuCommand.Menu open={disabled ? false : open} onOpenChange={disabled ? undefined : setOpen}>
      <MenuCommand.Trigger>
        <button
          type="button"
          disabled={disabled}
          className="bg-purple-96 text-purple-65 text-xs font-medium px-v2-sm py-v2-xs rounded-sm flex items-center gap-v2-xs w-fit disabled:opacity-50 disabled:cursor-not-allowed"
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
