import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { cn, Tag } from 'ui-design-system';
import { Icon, type IconName } from 'ui-icons';

import { UpsaleModal } from './UpsaleModal';

interface ConfigRowProps {
  isRestricted: boolean;
  canEdit: boolean;
  label: string;
  /** Tag to display when canEdit is true (e.g., "Configuré", "3/5 configurés") */
  statusTag?: ReactNode;
  /** Icon to show when canEdit is true. Defaults to 'edit' */
  editIcon?: IconName;
  /** Show wand icon in upsale modal for AI-related features */
  showWand?: boolean;
  /** Title for the upsale modal */
  onClick: () => void;
}

export function ConfigRow({
  isRestricted,
  canEdit,
  label,
  statusTag,
  editIcon = 'edit',
  showWand,
  onClick,
}: ConfigRowProps) {
  const { t } = useTranslation(['cases']);

  return (
    <div
      className={cn('border rounded-v2-lg p-v2-md flex flex-col gap-v2-md', {
        'border-[#ada7fd] bg-[#f7f6ff]': isRestricted,
        'border-grey-border bg-grey-background-light': !isRestricted,
      })}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 flex items-center gap-v2-xs">
          <span className="text-s font-medium">{label}</span>
          {match({ isRestricted, canEdit })
            .with({ isRestricted: true }, () => null)
            .with({ canEdit: true }, () => statusTag)
            .otherwise(() => (
              <Tag color="purple" size="small" border="rounded-sm">
                {t('cases:overview.config.view_only')}
              </Tag>
            ))}
        </div>
        {match({ isRestricted, canEdit })
          .with({ isRestricted: true }, () => <UpsaleModal showWand={showWand} />)
          .with({ canEdit: true }, () => (
            <Icon
              icon={editIcon}
              className="size-5 cursor-pointer text-purple-65 hover:text-purple-60"
              onClick={onClick}
            />
          ))
          .otherwise(() => (
            <Icon icon="eye" className="size-5 cursor-pointer text-purple-65" onClick={onClick} />
          ))}
      </div>
    </div>
  );
}
