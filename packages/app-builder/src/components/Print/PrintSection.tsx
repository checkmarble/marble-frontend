import clsx from 'clsx';
import { type FunctionComponent, type ReactNode } from 'react';
import { Typo } from 'ui-design-system';

interface PrintSectionProps {
  /**
   * Section title
   */
  title?: string;
  /**
   * Section content
   */
  children: ReactNode;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Section container for print pages with optional title.
 * Uses break-inside-avoid to prevent page breaks within the section.
 */
export const PrintSection: FunctionComponent<PrintSectionProps> = ({ title, children, className }) => {
  return (
    <div className={clsx('mb-md break-inside-avoid', className)}>
      {title && <Typo variant="title2">{title}</Typo>}
      {children}
    </div>
  );
};

export default PrintSection;
