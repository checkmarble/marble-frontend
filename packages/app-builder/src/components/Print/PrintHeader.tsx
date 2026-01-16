import { useFormatDateTime } from '@app-builder/utils/format';
import { type FunctionComponent, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface PrintHeaderProps {
  /**
   * Main title of the print page
   */
  title: string;
  /**
   * Optional subtitle or description
   */
  subtitle?: string;
  /**
   * Whether to show the timestamp and user
   */
  showTimestamp?: boolean;
  /**
   * User name to display (who generated the print)
   */
  userName?: string;
  /**
   * Optional additional content to render in the header
   */
  children?: ReactNode;
}

/**
 * Header component for print pages showing title and optional timestamp.
 */
export const PrintHeader: FunctionComponent<PrintHeaderProps> = ({
  title,
  subtitle,
  showTimestamp = true,
  userName,
  children,
}) => {
  const { t } = useTranslation(['common']);
  const formatDateTime = useFormatDateTime();
  const timestamp = formatDateTime(new Date(), { dateStyle: 'short', timeStyle: 'short' });

  return (
    <div className="mb-4 border-b border-grey-border pb-2">
      <h1 className="text-l font-bold text-grey-primary">{title}</h1>
      {subtitle && <p className="text-s text-grey-placeholder mt-1">{subtitle}</p>}
      {showTimestamp && (
        <p className="text-xs text-grey-placeholder mt-1">
          {t('common:print.generated_at_by', {
            date: timestamp,
            user: userName,
            defaultValue: `Generated on ${timestamp}${userName ? ` by ${userName}` : ''}`,
          })}
        </p>
      )}
      {children}
    </div>
  );
};

export default PrintHeader;
