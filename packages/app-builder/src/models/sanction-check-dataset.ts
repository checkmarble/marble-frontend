import { type OpenSanctionsDatasetFreshnessDto } from 'marble-api';

export type OpenSanctionsUpstreamDatasetFreshness = {
  version: string;
  name: string;
  lastExport: string;
};

export type OpenSanctionsDatasetFreshness = {
  upstream: OpenSanctionsUpstreamDatasetFreshness;
  version: string;
  upToDate: boolean;
};

export function adaptOpenSanctionsDatasetFreshness(
  datasetFreshness: OpenSanctionsDatasetFreshnessDto,
): OpenSanctionsDatasetFreshness {
  return {
    upstream: {
      version: datasetFreshness.upstream.version,
      name: datasetFreshness.upstream.name,
      lastExport: datasetFreshness.upstream.last_export,
    },
    version: datasetFreshness.version,
    upToDate: datasetFreshness.up_to_date,
  };
}
