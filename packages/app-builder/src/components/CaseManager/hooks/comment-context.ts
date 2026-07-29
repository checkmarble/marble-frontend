import { createSimpleContext } from '@marble/shared';

type CommentContextValue = {
  info: {
    objectId: string;
    objectType: string;
  } | null;
  set: (value: { objectId: string; objectType: string }) => void;
};

export const CommentContext = createSimpleContext<CommentContextValue>('CommentContext');
