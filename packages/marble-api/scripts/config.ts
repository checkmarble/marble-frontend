import type * as Oazapfts from 'oazapfts';
import { join } from 'path';

export interface Config {
  apiName: string;
  apiSpec: string;
  generatedApi: string;
  apiOptions: Oazapfts.Opts;
}

export const GENERATED_FOLDER = join('src', 'generated');

export const marbleCoreApiConfig: Config = {
  apiName: 'Marble Core API',
  apiSpec: join('openapis', 'marblecore-api.yaml'),
  generatedApi: join(GENERATED_FOLDER, 'marblecore-api.ts'),
  apiOptions: {
    optimistic: true,
    useEnumType: false,
    unionUndefined: false,
    mergeReadWriteOnly: true,
  },
};

export const featureAccessApiConfig: Config = {
  apiName: 'Feature access API',
  apiSpec: join('openapis', 'feature-access-api.yaml'),
  generatedApi: join(GENERATED_FOLDER, 'feature-access-api.ts'),
  apiOptions: {
    optimistic: true,
    useEnumType: false,
    unionUndefined: false,
    mergeReadWriteOnly: true,
  },
};

export const transfercheckApiConfig: Config = {
  apiName: 'Transfercheck API',
  apiSpec: join('openapis', 'transfercheck-api.yaml'),
  generatedApi: join(GENERATED_FOLDER, 'transfercheck-api.ts'),
  apiOptions: {
    optimistic: true,
    useEnumType: false,
    unionUndefined: false,
    mergeReadWriteOnly: true,
  },
};
