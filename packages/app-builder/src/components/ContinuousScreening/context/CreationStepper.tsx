import { createSharpFactory } from 'sharpstate';

type CreationStepperValue = {
  step: 'step-1' | 'step-2' | 'step-3';
  value: {
    name: string;
    description: string;
    lists: Record<string, boolean>;
  };
};

type InitialData = {
  name: string;
  description: string;
};

export const CreationStepperSharp = createSharpFactory({
  name: 'CreationStepper',
  initializer: ({ name, description }: InitialData): CreationStepperValue => ({
    step: 'step-1',
    value: {
      name,
      description,
      lists: {},
    },
  }),
}).withActions({
  toggleList(api, listName: string) {
    api.value.value.lists[listName] = !api.value.value.lists[listName];
  },
});
