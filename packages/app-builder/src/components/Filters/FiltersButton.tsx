import { useTranslation } from 'react-i18next';
import { Button, type ButtonV2Props } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { filtersI18n } from './filters-i18n';

type FiltersButtonProps = Omit<ButtonV2Props, 'variant' | 'color' | 'ref'>;

export const FiltersButton = function FiltersButton({
  ref,
  className,
  ...props
}: FiltersButtonProps & { ref?: React.Ref<HTMLButtonElement> }) {
  const { t } = useTranslation(filtersI18n);
  return (
    <Button size="medium" variant="secondary" ref={ref} {...props}>
      <Icon icon="filters" className="size-4" />
      <span className="text-s font-semibold first-letter:capitalize">{t('filters:filters')}</span>
    </Button>
  );
};
