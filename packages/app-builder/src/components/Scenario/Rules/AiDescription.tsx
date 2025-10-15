import { useWritingText } from '@app-builder/hooks/useWritingText';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Markdown } from 'ui-design-system';
import { Icon } from 'ui-icons';

type AiDescriptionProps = {
  isPending: boolean;
  description: string | undefined;
};

export function AiDescription({ isPending, description }: AiDescriptionProps) {
  const { t } = useTranslation(['scenarios']);
  const { text: displayedDescription, isDone } = useWritingText(description, 5);
  const descriptionElementRef = useRef<HTMLDivElement>(null);
  const descriptionContainerRef = useRef<HTMLDivElement>(null);
  const [currentHeight, setCurrentHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (isDone) {
      if (descriptionElementRef.current) {
        const rect = descriptionElementRef.current.getBoundingClientRect();
        setCurrentHeight(rect.height + 2);
      }
    }
  }, [isDone]);

  useEffect(() => {
    if (descriptionElementRef.current) {
      const rect = descriptionElementRef.current.getBoundingClientRect();
      if (currentHeight && rect.height > currentHeight - 2) {
        setCurrentHeight(undefined);
      }
    }
  }, [displayedDescription]);

  return (
    <div className="text-default rounded-v2-md border border-purple-96 bg-purple-98 text-purple-65 flex flex-col gap-v2-sm p-v2-md">
      <div className="flex items-center gap-v2-xs">
        <Icon icon="ai-review" className="size-5" />
        <div>{t('scenarios:rules.ai_description.title')}</div>
      </div>
      {description ? (
        <div
          ref={descriptionContainerRef}
          className="bg-white rounded-v2-s border border-l-2 border-l-purple-65 border-grey-95  text-black text-small overflow-hidden transition-all duration-500"
          style={{ height: currentHeight ? `${currentHeight}px` : undefined }}
        >
          <div ref={descriptionElementRef} className="p-v2-sm ">
            <Markdown>{displayedDescription}</Markdown>
          </div>
        </div>
      ) : null}
      {isPending && description ? (
        <div>{t('scenarios:rules.ai_description.check_reformulation')}</div>
      ) : null}
    </div>
  );
}
