import clsx from 'clsx';
import { type FunctionComponent, type ReactNode } from 'react';

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
    <div className={clsx('mb-4 break-inside-avoid', className)}>
      {title && <h2 className="text-m font-semibold text-grey-primary mb-2">{title}</h2>}
      {children}
    </div>
  );
};

export default PrintSection;
