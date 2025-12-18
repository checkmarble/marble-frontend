import { B } from "./sharpstate.es-CeF1Mf5b.js";
import { J as protectArray } from "./services-middleware-DR8Hua1Y.js";
import { c as intersection, o as object, k as array, f_ as record, s as string, _ as _enum, n as number, p as boolean, gk as union, m as literal } from "./short-uuid-MIi3jWzx.js";
const FTM_ENTITIES = ["Person", "Company", "Organization", "Vessel", "Airplane"];
const FTM_ENTITIES_PROPERTIES = {
  Person: [
    "name",
    "firstName",
    "lastName",
    "email",
    "phone",
    "nationality",
    "birthDate",
    "birthCountry",
    "citizenship",
    "passportNumber",
    "socialSecurityNumber",
    "idNumber",
    "country"
  ],
  Company: [
    "name",
    "registrationNumber",
    "jurisdiction",
    "country",
    "isinCode",
    "email",
    "phone",
    "website",
    "mainCountry"
  ],
  Organization: ["name", "registrationNumber", "jurisdiction", "country", "email", "phone", "website", "mainCountry"],
  Vessel: ["name", "imoNumber", "registrationNumber", "mmsi", "callSign", "country", "flag"],
  Airplane: ["name", "registrationNumber", "country"]
};
const FTM_ENTITIES_SUGGESTIONS = {
  "Person.name": { semanticType: "name", semanticSubType: "caption" },
  "Person.firstName": { semanticType: "name", semanticSubType: "first_name" },
  "Person.lastName": { semanticType: "name", semanticSubType: "last_name" },
  "Person.email": { semanticType: "link", semanticSubType: "email" },
  "Person.phone": { semanticType: "link", semanticSubType: "phone" },
  "Person.country": { semanticType: "country" },
  "Person.birthDate": { semanticType: "date_of_birth" },
  "Company.name": { semanticType: "name", semanticSubType: "caption" },
  "Company.registrationNumber": { semanticType: "unique_id", semanticSubType: "registration_number" },
  "Company.country": { semanticType: "country" },
  "Company.email": { semanticType: "link", semanticSubType: "email" },
  "Company.phone": { semanticType: "link", semanticSubType: "phone" },
  "Company.website": { semanticType: "link", semanticSubType: "url" },
  "Company.mainCountry": { semanticType: "country" },
  "Organization.name": { semanticType: "name", semanticSubType: "caption" },
  "Organization.registrationNumber": { semanticType: "unique_id", semanticSubType: "registration_number" },
  "Organization.jurisdiction": { semanticType: "country" },
  "Organization.country": { semanticType: "country" },
  "Organization.email": { semanticType: "link", semanticSubType: "email" },
  "Organization.phone": { semanticType: "link", semanticSubType: "phone" },
  "Organization.website": { semanticType: "link", semanticSubType: "url" },
  "Organization.mainCountry": { semanticType: "country" },
  "Vessel.name": { semanticType: "name", semanticSubType: "caption" },
  "Vessel.registrationNumber": { semanticType: "unique_id", semanticSubType: "registration_number" },
  "Vessel.country": { semanticType: "country" },
  "Airplane.name": { semanticType: "name", semanticSubType: "caption" },
  "Airplane.registrationNumber": { semanticType: "unique_id", semanticSubType: "registration_number" },
  "Airplane.country": { semanticType: "country" }
};
function getFtmEntitySuggestion(key) {
  return FTM_ENTITIES_SUGGESTIONS[key];
}
const buildStepper = (options) => {
  return B({
    name: options.name,
    initializer: (mode, initialData, onSubmit, { initialStep = 0 } = {}) => {
      return {
        __internals: {
          name: options.name,
          initialStep,
          currentStep: initialStep,
          steps: options.steps,
          validator: options.validator,
          mode,
          onSubmit
        },
        data: initialData
      };
    }
  }).withActions({
    setMode(api, mode, step) {
      const __internals = api.value.__internals;
      __internals.mode = mode;
      if (step !== void 0) {
        __internals.currentStep = step;
      }
    },
    setCurrentStep(api, step) {
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
    }
  }).withComputed({
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
      return __internals.steps.slice(0, __internals.currentStep + 1).every((step) => step.schema.safeParse(data).success);
    },
    isValid(state) {
      const __internals = state.__internals;
      return __internals.validator.safeParse(state.data).success;
    }
  });
};
const generalInfoStepSchema = object({
  name: string(),
  description: string()
});
const objectMappingStepSchema = object({
  mappingConfigs: protectArray(
    array(
      object({
        objectType: string(),
        ftmEntity: _enum(FTM_ENTITIES),
        fieldMapping: record(string(), string().nullable())
      })
    )
  )
}).refine(
  (data) => data.mappingConfigs.length > 0 && data.mappingConfigs.some((m) => Object.values(m.fieldMapping).filter((v) => !!v).length > 0),
  {
    message: "At least one mapping config must be provided",
    path: ["mappingConfigs"]
  }
);
const scoringConfigurationStepSchema = object({
  matchThreshold: number(),
  matchLimit: number(),
  inboxId: string().nullable(),
  inboxName: string().nullable()
}).refine((data) => data.inboxId !== null || data.inboxName !== null, {
  message: "Either inboxId or inboxName must be provided",
  path: ["inboxId", "inboxName"]
});
const datasetSelectionStepSchema = object({
  datasets: record(string(), boolean())
}).refine((data) => Object.values(data.datasets).filter(Boolean).length > 0, {
  message: "At least one dataset must be selected",
  path: ["datasets"]
});
const createContinuousScreeningConfigSchema = intersection(
  generalInfoStepSchema,
  intersection(objectMappingStepSchema, intersection(scoringConfigurationStepSchema, datasetSelectionStepSchema))
);
const ContinuousScreeningConfigurationStepper = buildStepper({
  name: "ContinuousScreeningConfigurationStepper",
  steps: [
    { name: "generalInfo", schema: generalInfoStepSchema },
    { name: "objectMapping", schema: objectMappingStepSchema },
    { name: "datasetSelection", schema: datasetSelectionStepSchema },
    { name: "scoringConfiguration", schema: scoringConfigurationStepSchema }
  ],
  validator: createContinuousScreeningConfigSchema
});
const reviewMatchPayloadSchema = object({
  matchId: string(),
  status: union([literal("confirmed_hit"), literal("no_hit")]),
  comment: string().optional()
});
export {
  ContinuousScreeningConfigurationStepper as C,
  FTM_ENTITIES as F,
  FTM_ENTITIES_PROPERTIES as a,
  createContinuousScreeningConfigSchema as c,
  getFtmEntitySuggestion as g,
  reviewMatchPayloadSchema as r
};
