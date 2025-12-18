import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { c as createContinuousScreeningConfigSchema, r as reviewMatchPayloadSchema } from "./continuous-screenings-DX2ib6rI.js";
import { a2 as sanitizeTruthyDatasets } from "./services-middleware-DR8Hua1Y.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { a as isContinuousScreeningAvailable } from "./feature-access-B8PIS8ad.js";
import { _ as createServerFn, x as redirect } from "../server.js";
import { o as object, s as string } from "./short-uuid-MIi3jWzx.js";
import "./sharpstate.es-CeF1Mf5b.js";
import "node:crypto";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
const getContinuousScreeningConfigurationFn_createServerFn_handler = createServerRpc({
  id: "8d9af50984926e24e1d954ca748ae0549e6d1b2ad9e2a9efb7e3a25c140c326e",
  name: "getContinuousScreeningConfigurationFn",
  filename: "src/server-fns/continuous-screening.ts"
}, (opts) => getContinuousScreeningConfigurationFn.__executeServer(opts));
const getContinuousScreeningConfigurationFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(object({
  stableId: string()
})).handler(getContinuousScreeningConfigurationFn_createServerFn_handler, async ({
  context,
  data
}) => {
  const config = await context.authInfo.continuousScreening.getConfiguration(data.stableId);
  return {
    config
  };
});
const listContinuousScreeningConfigurationsFn_createServerFn_handler = createServerRpc({
  id: "e2057feec54b9c65463e5e5049fab560872be0e2364a37913ed87fce9cf5c98d",
  name: "listContinuousScreeningConfigurationsFn",
  filename: "src/server-fns/continuous-screening.ts"
}, (opts) => listContinuousScreeningConfigurationsFn.__executeServer(opts));
const listContinuousScreeningConfigurationsFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).handler(listContinuousScreeningConfigurationsFn_createServerFn_handler, async ({
  context
}) => {
  const {
    continuousScreening,
    entitlements,
    inbox
  } = context.authInfo;
  const configurations = isContinuousScreeningAvailable(entitlements) ? await continuousScreening.listConfigurations() : [];
  const inboxes = await inbox.listInboxes();
  const configurationsWithInbox = configurations.map((config) => {
    const inboxItem = inboxes.find((inbox2) => inbox2.id === config.inboxId);
    return {
      ...config,
      inbox: inboxItem
    };
  });
  return {
    configurations: configurationsWithInbox
  };
});
const createContinuousScreeningConfigurationFn_createServerFn_handler = createServerRpc({
  id: "4f4c03013ad5745c2e6065c2028b7d8a55eafaeb72ed4cd83c7c480865d0b881",
  name: "createContinuousScreeningConfigurationFn",
  filename: "src/server-fns/continuous-screening.ts"
}, (opts) => createContinuousScreeningConfigurationFn.__executeServer(opts));
const createContinuousScreeningConfigurationFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(createContinuousScreeningConfigSchema).handler(createContinuousScreeningConfigurationFn_createServerFn_handler, async ({
  context,
  data
}) => {
  try {
    const {
      inboxName,
      ...payload
    } = data;
    let inboxId;
    if (payload.inboxId === null) {
      if (!inboxName) {
        throw new Error("Inbox name is required when no inbox is selected");
      }
      const newInbox = await context.authInfo.inbox.createInbox({
        name: inboxName
      });
      inboxId = newInbox.id;
    } else {
      inboxId = payload.inboxId;
    }
    await context.authInfo.continuousScreening.createConfiguration({
      ...payload,
      inboxId,
      datasets: sanitizeTruthyDatasets(payload.datasets)
    });
    throw redirect({
      to: "/continuous-screening/configurations"
    });
  } catch (error) {
    if (error instanceof Response && error.status >= 300 && error.status < 400) throw error;
    throw new Error("Failed to create configuration");
  }
});
const dismissContinuousScreeningFn_createServerFn_handler = createServerRpc({
  id: "1656d7f8c414c8212f0b15864ec148e50c260e727b88b57405ec2a5cd4948c8f",
  name: "dismissContinuousScreeningFn",
  filename: "src/server-fns/continuous-screening.ts"
}, (opts) => dismissContinuousScreeningFn.__executeServer(opts));
const dismissContinuousScreeningFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(object({
  screeningId: string()
})).handler(dismissContinuousScreeningFn_createServerFn_handler, async ({
  context,
  data
}) => {
  try {
    await context.authInfo.continuousScreening.dismiss(data.screeningId);
  } catch {
    throw new Error("Failed to dismiss screening");
  }
});
const loadMoreContinuousScreeningMatchesFn_createServerFn_handler = createServerRpc({
  id: "de09a804f89994e7c4b71dfae5351566175497947b3fa1b429fd992507f6f196",
  name: "loadMoreContinuousScreeningMatchesFn",
  filename: "src/server-fns/continuous-screening.ts"
}, (opts) => loadMoreContinuousScreeningMatchesFn.__executeServer(opts));
const loadMoreContinuousScreeningMatchesFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(object({
  screeningId: string()
})).handler(loadMoreContinuousScreeningMatchesFn_createServerFn_handler, async ({
  context,
  data
}) => {
  try {
    await context.authInfo.continuousScreening.loadMoreMatches(data.screeningId);
  } catch {
    throw new Error("Failed to load more matches");
  }
});
const reviewContinuousScreeningMatchFn_createServerFn_handler = createServerRpc({
  id: "65bdacf95e97ec0a55a69b83fde6b36289c73a42072ae668760591a64c05f0ab",
  name: "reviewContinuousScreeningMatchFn",
  filename: "src/server-fns/continuous-screening.ts"
}, (opts) => reviewContinuousScreeningMatchFn.__executeServer(opts));
const reviewContinuousScreeningMatchFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(reviewMatchPayloadSchema).handler(reviewContinuousScreeningMatchFn_createServerFn_handler, async ({
  context,
  data
}) => {
  try {
    await context.authInfo.continuousScreening.updateMatchStatus(data);
  } catch {
    throw new Error("Failed to review match");
  }
});
const updateContinuousScreeningConfigurationFn_createServerFn_handler = createServerRpc({
  id: "f8f975475cd1f94c061db5e0fc94dc68631a5ce17d2b663c51ffc90322224c92",
  name: "updateContinuousScreeningConfigurationFn",
  filename: "src/server-fns/continuous-screening.ts"
}, (opts) => updateContinuousScreeningConfigurationFn.__executeServer(opts));
const updateContinuousScreeningConfigurationFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(createContinuousScreeningConfigSchema.and(object({
  configStableId: string()
}))).handler(updateContinuousScreeningConfigurationFn_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    inboxName,
    configStableId,
    ...payload
  } = data;
  let inboxId;
  if (payload.inboxId === null) {
    if (!inboxName) {
      throw new Error("Inbox name is required when no inbox is selected");
    }
    const newInbox = await context.authInfo.inbox.createInbox({
      name: inboxName
    });
    inboxId = newInbox.id;
  } else {
    inboxId = payload.inboxId;
  }
  await context.authInfo.continuousScreening.updateConfiguration(configStableId, {
    ...payload,
    inboxId,
    datasets: sanitizeTruthyDatasets(payload.datasets)
  });
});
export {
  createContinuousScreeningConfigurationFn_createServerFn_handler,
  dismissContinuousScreeningFn_createServerFn_handler,
  getContinuousScreeningConfigurationFn_createServerFn_handler,
  listContinuousScreeningConfigurationsFn_createServerFn_handler,
  loadMoreContinuousScreeningMatchesFn_createServerFn_handler,
  reviewContinuousScreeningMatchFn_createServerFn_handler,
  updateContinuousScreeningConfigurationFn_createServerFn_handler
};
