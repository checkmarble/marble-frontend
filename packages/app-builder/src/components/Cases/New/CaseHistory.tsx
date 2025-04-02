import { type CaseEvent } from '@app-builder/models/cases';
import { Button, Switch } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const CaseHistory = (_: { id: string; events: CaseEvent[] }) => {
  return (
    <div className="bg-grey-100 flex flex-col gap-1.5">
      <div className="text-r text-grey-00 flex items-center justify-between font-medium">
        <span>Investigation</span>
        <div className="flex items-center gap-2">
          <span>Display logs</span>
          <Switch />
        </div>
      </div>
      <div className="border-grey-90 rounded-lg border">
        <div>Case History</div>
        <div className="border-grey-90 flex items-end gap-4 border-t p-4">
          <div className="flex grow flex-col items-start gap-2.5">
            <textarea
              className="form-textarea text-s w-full resize-none border-none bg-transparent outline-none"
              placeholder="Add a note..."
            />
            <Button type="button" variant="secondary" size="icon">
              <Icon icon="attachment" className="text-grey-50 size-5" />
            </Button>
          </div>
          <Button type="button" variant="primary" size="medium">
            <Icon icon="send" className="size-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
