import { type CustomList } from '@app-builder/models/custom-list';
import { type StringListValue } from '@app-builder/models/scoring';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';

interface ListValueInputProps {
  value: StringListValue;
  customLists: CustomList[];
  onChange: (v: StringListValue) => void;
}

export function ListValueInput({ value, customLists, onChange }: ListValueInputProps) {
  const { t } = useTranslation(['user-scoring']);
  const [inputText, setInputText] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, []);

  const isCustomListSelected = value.type === 'customList' && value.listId !== '';
  const stringValues = value.type === 'stringList' ? value.values : [];
  const isStringListMode = stringValues.length > 0;

  const filteredLists = useMemo(
    () => customLists.filter((l) => l.name.toLowerCase().includes(inputText.toLowerCase())),
    [customLists, inputText],
  );

  const shouldShowDropdown = isDropdownOpen && !isStringListMode && !isCustomListSelected && filteredLists.length > 0;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputText.trim()) {
      e.preventDefault();
      onChange({ type: 'stringList', values: [...stringValues, inputText.trim()] });
      setInputText('');
      setIsDropdownOpen(false);
    }
    if (e.key === 'Backspace' && inputText === '' && stringValues.length > 0) {
      onChange({ type: 'stringList', values: stringValues.slice(0, -1) });
    }
    if (e.key === 'Escape') {
      setIsDropdownOpen(false);
    }
  };

  if (isCustomListSelected) {
    const list = customLists.find((l) => l.id === value.listId);
    const listName = list?.name ?? value.listId;
    return (
      <div
        className="flex flex-1 items-center gap-2 rounded-v2-md border border-grey-border px-2 h-10 cursor-pointer hover:bg-grey-bg"
        onClick={() => {
          onChange({ type: 'customList', listId: '' });
          setInputText(listName);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
      >
        <span className="flex-1 text-s text-grey-primary">{listName}</span>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative flex-1">
      <div
        className="flex flex-wrap items-center gap-1 rounded-md border border-grey-border px-2 py-1 min-h-10 cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {stringValues.map((v, i) => (
          <span
            key={i}
            className="flex items-center gap-1 rounded-full border border-grey-border bg-grey-bg px-2 py-0.5 text-xs text-grey-primary"
          >
            {v}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange({ type: 'stringList', values: stringValues.filter((_, j) => j !== i) });
              }}
              className="text-grey-secondary hover:text-grey-primary"
            >
              <Icon icon="cross" className="size-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={(e) => {
            setInputText(e.target.value);
            setIsDropdownOpen(true);
          }}
          onKeyDown={handleKeyDown}
          className="flex-1 min-w-20 bg-transparent text-s text-grey-primary outline-none"
          placeholder={stringValues.length === 0 ? t('user-scoring:switch.string.search_placeholder') : ''}
        />
      </div>
      {shouldShowDropdown && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-grey-border bg-white shadow-md max-h-48 overflow-y-auto">
          {filteredLists.map((list) => (
            <button
              key={list.id}
              type="button"
              className="w-full px-3 py-2 text-left text-s text-grey-primary hover:bg-grey-bg"
              onMouseDown={(e) => {
                e.preventDefault();
                onChange({ type: 'customList', listId: list.id });
                setInputText('');
                setIsDropdownOpen(false);
              }}
            >
              {list.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
