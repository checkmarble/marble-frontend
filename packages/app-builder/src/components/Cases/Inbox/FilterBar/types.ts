import { InboxWithCasesCount } from '@app-builder/models/inbox';

export type PartialInbox = Pick<InboxWithCasesCount, 'id' | 'name'> & { casesCount?: number };
