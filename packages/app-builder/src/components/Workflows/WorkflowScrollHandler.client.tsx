import { useEffect } from 'react';
import { useWorkflow } from './WorkflowProvider';

export function WorkflowScrollHandler() {
  const { shouldScrollToBottom, setShouldScrollToBottom, rules } = useWorkflow();

  useEffect(() => {
    if (shouldScrollToBottom) {
      // Use setTimeout to ensure the DOM has been updated with the new rule
      setTimeout(() => {
        // Find the scrollable container (Page.Main with overflow-y-auto)
        const scrollableContainer = document.querySelector('.h-screen.overflow-y-auto');
        if (scrollableContainer) {
          scrollableContainer.scrollTo({
            top: scrollableContainer.scrollHeight,
            behavior: 'smooth',
          });
        } else {
          // Fallback to window scroll if container not found
          window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: 'smooth',
          });
        }
        setShouldScrollToBottom(false);
      }, 100);
    }
  }, [shouldScrollToBottom, rules, setShouldScrollToBottom]);

  return null; // This component only handles side effects
}
