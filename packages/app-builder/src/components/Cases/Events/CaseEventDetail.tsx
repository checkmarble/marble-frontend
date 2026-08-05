import { CaseAssignedDetail } from '@app-builder/components/Cases/Events/CaseAssignedDetail';
import { CaseCreatedDetail } from '@app-builder/components/Cases/Events/CaseCreated';
import { CaseSnoozedDetail } from '@app-builder/components/Cases/Events/CaseSnoozed';
import { CaseUnsnoozedDetail } from '@app-builder/components/Cases/Events/CaseUnsnoozed';
import { CommentAddedDetail } from '@app-builder/components/Cases/Events/CommentAdded';
import { DecisionAddedDetail } from '@app-builder/components/Cases/Events/DecisionAdded';
import { DecisionReviewedDetail } from '@app-builder/components/Cases/Events/DecisionReviewed';
import { EntityAnnotated } from '@app-builder/components/Cases/Events/EntityAnnotated';
import { FileAddedDetail } from '@app-builder/components/Cases/Events/FileAdded';
import { InboxChangedDetail } from '@app-builder/components/Cases/Events/InboxChanged';
import { NameUpdatedDetail } from '@app-builder/components/Cases/Events/NameUpdated';
import { OutcomeUpdatedDetail } from '@app-builder/components/Cases/Events/OutcomeUpdated';
import { RuleSnoozeCreatedDetail } from '@app-builder/components/Cases/Events/RuleSnoozed';
import { SarCreatedDetail } from '@app-builder/components/Cases/Events/SarCreated';
import { SarDeletedDetail } from '@app-builder/components/Cases/Events/SarDeleted';
import { SarFileUploadedDetail } from '@app-builder/components/Cases/Events/SarFileUploaded';
import { SarStatusChangedDetail } from '@app-builder/components/Cases/Events/SarStatusChanged';
import { StatusUpdatedDetail } from '@app-builder/components/Cases/Events/StatusUpdated';
import { TagsUpdatedDetail } from '@app-builder/components/Cases/Events/TagsUpdated';
import { type CaseEvent } from '@app-builder/models/cases';
import { match } from 'ts-pattern';

export function CaseEventDetail({ event }: { event: CaseEvent }) {
  return match(event)
    .with({ eventType: 'case_created' }, (e) => <CaseCreatedDetail event={e} />)
    .with({ eventType: 'status_updated' }, (e) => <StatusUpdatedDetail event={e} />)
    .with({ eventType: 'outcome_updated' }, (e) => <OutcomeUpdatedDetail event={e} />)
    .with({ eventType: 'decision_added' }, (e) => <DecisionAddedDetail event={e} />)
    .with({ eventType: 'comment_added' }, (e) => <CommentAddedDetail event={e} />)
    .with({ eventType: 'name_updated' }, (e) => <NameUpdatedDetail event={e} />)
    .with({ eventType: 'tags_updated' }, (e) => <TagsUpdatedDetail event={e} />)
    .with({ eventType: 'file_added' }, (e) => <FileAddedDetail event={e} />)
    .with({ eventType: 'inbox_changed' }, (e) => <InboxChangedDetail event={e} />)
    .with({ eventType: 'rule_snooze_created' }, (e) => <RuleSnoozeCreatedDetail event={e} />)
    .with({ eventType: 'decision_reviewed' }, (e) => <DecisionReviewedDetail event={e} />)
    .with({ eventType: 'case_snoozed' }, (e) => <CaseSnoozedDetail event={e} />)
    .with({ eventType: 'case_unsnoozed' }, (e) => <CaseUnsnoozedDetail event={e} />)
    .with({ eventType: 'case_assigned' }, (e) => <CaseAssignedDetail event={e} />)
    .with({ eventType: 'sar_created' }, (e) => <SarCreatedDetail event={e} />)
    .with({ eventType: 'sar_deleted' }, (e) => <SarDeletedDetail event={e} />)
    .with({ eventType: 'sar_status_changed' }, (e) => <SarStatusChangedDetail event={e} />)
    .with({ eventType: 'sar_file_uploaded' }, (e) => <SarFileUploadedDetail event={e} />)
    .with({ eventType: 'entity_annotated' }, (e) => <EntityAnnotated event={e} />)
    .exhaustive();
}
