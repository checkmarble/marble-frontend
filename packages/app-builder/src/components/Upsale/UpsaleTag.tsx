import { Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';

interface UpsaleTagProps {
  onClick?: () => void;
  showStar?: boolean;
}

export function UpsaleTag({ onClick, showStar }: UpsaleTagProps) {
  // const { t } = useTranslation(['common']);

  return (
    <div className="flex items-center gap-v2-xs cursor-pointer" onClick={onClick}>
      <Tag
        color="yellow"
        size="small"
        border="rounded-sm"
        className="border border-[#fde9af] bg-[#fef6df] text-[#eea200]"
      >
        {/* {t('common:upsale.discover')} */}
        {showStar && ' ✨'}
      </Tag>
      <Icon icon="arrow-right" className="size-5 text-purple-65" />
    </div>
  );
}
