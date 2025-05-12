import type { OpenSanctionsCatalogDto, OpenSanctionsDatasetFreshnessDto } from 'marble-api';

export type OpenSanctionsCatalogDataset = {
  name: string;
  title: string;
};

export type OpenSanctionsCatalogSection = {
  name: string;
  title: string;
  datasets: OpenSanctionsCatalogDataset[];
};

export type OpenSanctionsCatalog = {
  sections: OpenSanctionsCatalogSection[];
};

export function adaptOpenSanctionsCatalog(catalog: OpenSanctionsCatalogDto): OpenSanctionsCatalog {
  return {
    sections: catalog.sections.map((s) => ({
      name: s.name,
      title: s.title,
      datasets: s.datasets.map((d) => ({
        name: d.name,
        title: d.title,
      })),
    })),
  };
}

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
