import * as Label from '@radix-ui/react-label';
import { type Decision } from 'marble-api';
import { useState } from 'react';
import { Checkbox } from 'ui-design-system';

import { Outcome } from '../Outcome';

const outcomes = [
  'approve',
  'review',
  'decline',
] satisfies Decision['outcome'][];

export function OutcomeFilter() {
  const [selectedOutcomes, setSelectedOutcomes] = useState([]);

  return (
    <div className="flex flex-col gap-2 p-2">
      {outcomes.map((outcome) => {
        return (
          <div key={outcome} className="flex flex-row items-center gap-2">
            <Checkbox
              id={outcome}
              checked={selectedOutcomes.includes(outcome)}
              onCheckedChange={(checked) => {
                if (checked) {
                  setSelectedOutcomes((prev) => [...prev, outcome]);
                } else {
                  setSelectedOutcomes((prev) =>
                    prev.filter((prevOutcome) => prevOutcome !== outcome)
                  );
                }
              }}
            />
            <Label.Root htmlFor={outcome} className="w-full">
              <Outcome
                outcome={outcome}
                border="square"
                size="big"
                className="w-full"
              />
            </Label.Root>
          </div>
        );
      })}
    </div>
  );
}
