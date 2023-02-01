import { Lightbulb } from '@marble-front/ui/icons';
import React from 'react';

export function Callout({ children }: { children: React.ReactNode }) {
  if (!children) return null;

  return (
    <div className="bg-grey-02 text-s text-grey-100 flex w-fit flex-row items-center gap-2 rounded border-l-2 border-l-purple-100 p-2 font-normal">
      <Lightbulb height="24px" width="24px" className="flex-shrink-0" />
      {children}
    </div>
  );
}
