import { type Meta, type StoryFn } from '@storybook/react';
import { type ReactNode, useMemo, useState } from 'react';
import { Icon, type IconName, iconNames, Logo, type LogoName, logoNames } from 'ui-icons';

import { cn } from '../utils';

const Story: Meta = {
  title: 'Icons',
};

export default Story;

function IconGallery<T extends string>({
  names,
  renderItem,
  autoWidth = false,
}: {
  names: readonly T[];
  renderItem: (name: T) => ReactNode;
  autoWidth?: boolean;
}) {
  const [search, setSearch] = useState('');

  const filteredNames = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return names;
    return names.filter((name) => name.toLowerCase().includes(query));
  }, [names, search]);

  return (
    <div className="bg-surface-page text-grey-primary flex flex-col gap-md p-md">
      <input
        type="search"
        placeholder="Search icons…"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="border-grey-border text-s text-grey-primary max-w-sm rounded-sm border px-sm py-xs"
      />
      <p className="text-s text-grey-secondary">
        {filteredNames.length} of {names.length}
      </p>
      <div
        className={cn(autoWidth ? 'flex flex-wrap' : 'grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))]', 'gap-sm')}
      >
        {filteredNames.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => navigator.clipboard.writeText(name)}
            title="Click to copy name"
            className={cn(
              'border-grey-border hover:bg-grey-background flex flex-col items-center gap-xs rounded-sm border p-sm text-center transition-colors',
              autoWidth && 'w-fit',
            )}
          >
            {renderItem(name)}
            <span className="text-xs text-grey-secondary break-all">{name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export const AllIcons: StoryFn = () => (
  <IconGallery<IconName>
    names={iconNames}
    renderItem={(name) => <Icon icon={name} className="size-6 text-grey-primary" />}
  />
);

export const AllLogos: StoryFn = () => (
  <IconGallery<LogoName>
    names={logoNames}
    autoWidth
    renderItem={(name) => <Logo logo={name} className="h-8 w-auto" />}
  />
);
