import { type OpenSanctionsCatalogDto } from 'marble-api';

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
