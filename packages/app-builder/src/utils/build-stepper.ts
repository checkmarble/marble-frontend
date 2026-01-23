import { createSharpFactory } from 'sharpstate';
import { ZodType, z } from 'zod/v4';

type Step = {
  name: string;
  schema: z.ZodSchema;
};

type BuildStepperOptions<Steps extends readonly Step[], Validator extends ZodType, InitialData> = {
  name: string;
  steps: Steps;
  validator: Validator;
  __types: {
    initialData: InitialData;
  };
};

type StepperData<Steps extends readonly Step[], Validator extends ZodType, InitialData> = {
  __internals: {
    name: string;
    initialStep: number;
    currentStep: number;
    steps: Steps;
    validator: Validator;
    mode: 'view' | 'edit' | 'create';
    onSubmit: (data: z.infer<Validator>) => void;
  };
  data: InitialData;
};

export type Identity<T> = T extends object ? {} & { [P in keyof T]: T[P] } : T;

export const buildStepper = <Steps extends readonly Step[], Validator extends ZodType, InitialData>(
  options: BuildStepperOptions<Steps, Validator, InitialData>,
) => {
  return createSharpFactory({
    name: options.name,
    initializer: (
      mode: 'view' | 'edit' | 'create',
      initialData: InitialData,
      onSubmit: (data: z.infer<Validator>) => void,
      { initialStep = 0 }: { initialStep?: number } = {},
    ): StepperData<Steps, Validator, InitialData> => {
      return {
        __internals: {
          name: options.name,
          initialStep,
          currentStep: initialStep,
          steps: options.steps,
          validator: options.validator,
          mode,
          onSubmit,
        },
        data: initialData,
      };
    },
  })
    .withActions({
      setMode(api, mode: 'view' | 'edit' | 'create', step?: number) {
        const __internals = api.value.__internals;
        __internals.mode = mode;
        if (step !== undefined) {
          __internals.currentStep = step;
        }
      },
      setCurrentStep(api, step: number) {
        const __internals = api.value.__internals;
        if (Math.max(0, Math.min(__internals.steps.length - 1, step)) !== step) {
          console.warn(`[${__internals.name}] Step ${step} is out of bounds`);
          return;
        }
        __internals.currentStep = step;
      },
      submit(api) {
        const __internals = api.value.__internals;
        const data = api.value.data;

        const validationResult = __internals.validator.safeParse(data);
        if (validationResult.success) {
          __internals.onSubmit(validationResult.data);
        }
      },
    })
    .withComputed({
      currentStep(state) {
        return state.__internals.currentStep;
      },
      hasNext(state) {
        const __internals = state.__internals;
        return __internals.currentStep < __internals.steps.length - 1;
      },
      hasPrevious(state) {
        const __internals = state.__internals;
        return __internals.currentStep > __internals.initialStep;
      },
      canGoNext(state) {
        const __internals = state.__internals;
        const data = state.data;

        return __internals.steps
          .slice(0, __internals.currentStep + 1)
          .every((step) => step.schema.safeParse(data).success);
      },
      isValid(state) {
        const __internals = state.__internals;
        return __internals.validator.safeParse(state.data).success;
      },
    });
};
