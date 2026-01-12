import {
  cloneElement,
  type FunctionComponent,
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

interface PrintViewProps {
  /**
   * Content to render in the print window
   */
  children: ReactNode;
  /**
   * Button or element that triggers the print view
   */
  trigger: ReactElement;
  /**
   * Page title shown in the print window
   */
  title?: string;
  /**
   * Callback before print dialog opens
   */
  onBeforePrint?: () => void;
}

/**
 * Copies stylesheets from the parent document to the print window
 */
function copyStylesToWindow(printWindow: Window): void {
  const styleSheets = Array.from(document.styleSheets);

  styleSheets.forEach((sheet) => {
    try {
      if (sheet.href) {
        // External stylesheet - create link element
        const link = printWindow.document.createElement('link');
        link.rel = 'stylesheet';
        link.href = sheet.href;
        printWindow.document.head.appendChild(link);
      } else if (sheet.cssRules) {
        // Inline styles - create style element
        const style = printWindow.document.createElement('style');
        const cssRules = Array.from(sheet.cssRules)
          .map((rule) => rule.cssText)
          .join('\n');
        style.textContent = cssRules;
        printWindow.document.head.appendChild(style);
      }
    } catch {
      // Cross-origin stylesheets - try to link anyway
      if (sheet.href) {
        const link = printWindow.document.createElement('link');
        link.rel = 'stylesheet';
        link.href = sheet.href;
        printWindow.document.head.appendChild(link);
      }
    }
  });

  // Add print-specific styles
  const printStyles = printWindow.document.createElement('style');
  printStyles.textContent = `
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .no-print {
        display: none !important;
      }
    }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: white;
      margin: 0;
      padding: 1rem;
    }
    .print-container {
      width: 100%;
    }
    @media print {
      body {
        padding: 0;
      }
    }
  `;
  printWindow.document.head.appendChild(printStyles);
}

/**
 * PrintView component that opens content in a new window for printing.
 *
 * Usage:
 * ```tsx
 * <PrintView
 *   title="Search Results"
 *   trigger={<Button>Print</Button>}
 * >
 *   <MyContent />
 * </PrintView>
 * ```
 */
export const PrintView: FunctionComponent<PrintViewProps> = ({ children, trigger, title = 'Print', onBeforePrint }) => {
  const [printWindow, setPrintWindow] = useState<Window | null>(null);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const isInitializedRef = useRef(false);

  const handlePrint = useCallback(() => {
    onBeforePrint?.();

    // Open new window
    const newWindow = window.open('', '_blank', 'width=800,height=600');
    if (!newWindow) {
      console.error('Failed to open print window. Check popup blocker settings.');
      return;
    }

    // Set up the document structure using DOM manipulation
    newWindow.document.title = title;

    // Add meta tags
    const charset = newWindow.document.createElement('meta');
    charset.setAttribute('charset', 'utf-8');
    newWindow.document.head.appendChild(charset);

    const viewport = newWindow.document.createElement('meta');
    viewport.name = 'viewport';
    viewport.content = 'width=device-width, initial-scale=1';
    newWindow.document.head.appendChild(viewport);

    // Copy styles
    copyStylesToWindow(newWindow);

    // Create container
    const printRoot = newWindow.document.createElement('div');
    printRoot.id = 'print-root';
    printRoot.className = 'print-container';
    newWindow.document.body.appendChild(printRoot);

    // Set state to trigger portal render
    setPrintWindow(newWindow);
    setContainer(printRoot);
    isInitializedRef.current = true;
  }, [title, onBeforePrint]);

  // Handle print after content is rendered
  useEffect(() => {
    if (printWindow && container && isInitializedRef.current) {
      // Wait for styles to load and content to render
      const timeoutId = setTimeout(() => {
        printWindow.print();
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [printWindow, container]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (printWindow && !printWindow.closed) {
        printWindow.close();
      }
    };
  }, [printWindow]);

  // Clone trigger and attach onClick handler
  const triggerWithHandler = cloneElement(trigger, {
    onClick: (e: React.MouseEvent) => {
      trigger.props.onClick?.(e);
      handlePrint();
    },
  });

  return (
    <>
      {triggerWithHandler}
      {container && printWindow && !printWindow.closed && createPortal(children, container)}
    </>
  );
};

export default PrintView;
