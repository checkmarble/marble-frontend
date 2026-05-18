import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import { isNotFoundHttpError } from '@app-builder/models/http-errors';
import {
  type AvailableFeatures,
  adaptScreening,
  adaptScreeningFile,
  adaptScreeningMatch,
  adaptScreeningMatchPayload,
  type OpenSanctionEntitySchema,
  type Screening,
  ScreeningAvailableFiltersAdapted,
  type ScreeningFile,
  type ScreeningMatch,
  type ScreeningMatchPayload,
  type ScreeningMatchStatus,
} from '@app-builder/models/screening';
import { adaptScreeningAiSuggestion, type ScreeningAiSuggestion } from '@app-builder/models/screening-ai-suggestion';
import {
  adaptOpenSanctionsDatasetFreshness,
  type OpenSanctionsDatasetFreshness,
} from '@app-builder/models/screening-dataset';
import { type OpenSanctionsCatalogDto } from 'marble-api';
import * as R from 'remeda';
export interface ScreeningRepository {
  listScreenings(args: { decisionId: string }): Promise<Screening[]>;
  listDatasets(): Promise<OpenSanctionsCatalogDto>;
  getDatasetFreshness(): Promise<OpenSanctionsDatasetFreshness>;
  updateMatchStatus(args: {
    matchId: string;
    status: Extract<ScreeningMatchStatus, 'no_hit' | 'confirmed_hit'>;
    comment?: string;
    whitelist?: boolean;
  }): Promise<ScreeningMatch>;
  searchScreeningMatches(args: {
    screeningId: string;
    entityType: OpenSanctionEntitySchema;
    fields: Record<string, string>;
  }): Promise<ScreeningMatchPayload[]>;
  refineScreening(args: {
    screeningId: string;
    entityType: OpenSanctionEntitySchema;
    fields: Record<string, string>;
  }): Promise<Screening>;
  listScreeningFiles(args: { screeningId: string }): Promise<ScreeningFile[]>;
  enrichMatch(args: { matchId: string }): Promise<ScreeningMatch>;
  freeformSearch(args: {
    entityType: OpenSanctionEntitySchema;
    fields: Record<string, string>;
    datasets?: string[];
    threshold?: number;
    limit?: number;
  }): Promise<ScreeningMatchPayload[]>;
  getAiSuggestions(args: { screeningId: string }): Promise<ScreeningAiSuggestion[]>;
  enrichedData(args: { entityId: string }): Promise<ScreeningMatchPayload>;
  getAvailableFilters(args: { feature: AvailableFeatures }): Promise<ScreeningAvailableFiltersAdapted>;
}

export function makeGetScreeningRepository() {
  return (marbleCoreApiClient: MarbleCoreApi): ScreeningRepository => ({
    getAvailableFilters: async ({ feature }) => {
      const listFeature: ScreeningAvailableFiltersAdapted =
        await marbleCoreApiClient.listScreeningAvailableFilters(feature);
      // FOR TESTING
      // {
      //   provider: 'lexisnexis',
      //   sections: {
      //     sanctions: {
      //       self: 'sanctions',
      //       datasets: [
      //         { name: 'eulist', title: 'eulist' },
      //         { name: 'li-fma-s', title: 'li-fma-s' },
      //         { name: 'fr-minefe', title: 'fr-minefe' },
      //         { name: 'mc-siccfin', title: 'mc-siccfin' },
      //         { name: 'ofac', title: 'ofac' },
      //         { name: 'ua-nsdc', title: 'ua-nsdc' },
      //         { name: 'rosfinmon', title: 'rosfinmon' },
      //         { name: 'seco', title: 'seco' },
      //         { name: 'uk-fcolist', title: 'uk-fcolist' },
      //         { name: 'au-dfat', title: 'au-dfat' },
      //         { name: 'jp-mof', title: 'jp-mof' },
      //         { name: 'ca-spmeru', title: 'ca-spmeru' },
      //         { name: 'md-isc-s', title: 'md-isc-s' },
      //         { name: 'au-cwlaw', title: 'au-cwlaw' },
      //         { name: 'us-dos-s', title: 'us-dos-s' },
      //         { name: 'nz-rsr', title: 'nz-rsr' },
      //         { name: 'za-tfslist', title: 'za-tfslist' },
      //         { name: 'ua-sfms', title: 'ua-sfms' },
      //         { name: 'kr-mosf-s', title: 'kr-mosf-s' },
      //         { name: 'va-lxviii', title: 'va-lxviii' },
      //         { name: 'ar-repet-s', title: 'ar-repet-s' },
      //         { name: 'il-modtl', title: 'il-modtl' },
      //         { name: 'by-kgb-s', title: 'by-kgb-s' },
      //         { name: 'hk-hkmas', title: 'hk-hkmas' },
      //         { name: 'kr-kofiu', title: 'kr-kofiu' },
      //         { name: 'nz-police', title: 'nz-police' },
      //         { name: 'id-ppatk-s', title: 'id-ppatk-s' },
      //         { name: 'tr-mtfa5', title: 'tr-mtfa5' },
      //         { name: 'bh-mia-dtl', title: 'bh-mia-dtl' },
      //         { name: 'us-ofacssi', title: 'us-ofacssi' },
      //         { name: 'mx-uif1267', title: 'mx-uif1267' },
      //         { name: 'un-sc-1267', title: 'un-sc-1267' },
      //         { name: 'sa-pctc-nl', title: 'sa-pctc-nl' },
      //         { name: 'ca-spmeir', title: 'ca-spmeir' },
      //         { name: 'ca-spmebu', title: 'ca-spmebu' },
      //         { name: 'il-mof', title: 'il-mof' },
      //         { name: 'ae-ntlter', title: 'ae-ntlter' },
      //         { name: 'us-dos-fto', title: 'us-dos-fto' },
      //         { name: 'iq-tffc-nl', title: 'iq-tffc-nl' },
      //         { name: 'mx-uif1988', title: 'mx-uif1988' },
      //         { name: 'psca', title: 'psca' },
      //         { name: 'tt-fiu-sl', title: 'tt-fiu-sl' },
      //         { name: 'mx-uif1737', title: 'mx-uif1737' },
      //         { name: 'un-sc-1988', title: 'un-sc-1988' },
      //         { name: 'un-sc-1737', title: 'un-sc-1737' },
      //         { name: 'uk-proter', title: 'uk-proter' },
      //         { name: 'un-sc-1718', title: 'un-sc-1718' },
      //         { name: 'tr-mtfa7', title: 'tr-mtfa7' },
      //         { name: 'mx-uif1718', title: 'mx-uif1718' },
      //         { name: 'pk-nacta-p', title: 'pk-nacta-p' },
      //         { name: 'ph-atcsan', title: 'ph-atcsan' },
      //         { name: 'id-ppa1718', title: 'id-ppa1718' },
      //         { name: 'id-ppa1737', title: 'id-ppa1737' },
      //         { name: 'qa-ntdl', title: 'qa-ntdl' },
      //         { name: 'lv-fiu-s', title: 'lv-fiu-s' },
      //         { name: 'us-doscuba', title: 'us-doscuba' },
      //         { name: 'uz-dcec-nl', title: 'uz-dcec-nl' },
      //         { name: 'kw-mofa-nl', title: 'kw-mofa-nl' },
      //         { name: 'ca-spmeua', title: 'ca-spmeua' },
      //         { name: 'au - ans', title: 'au - ans' },
      //         { name: 'us-eo13382', title: 'us-eo13382' },
      //         { name: 'tr-mtfa6', title: 'tr-mtfa6' },
      //         { name: 'ca-spmeve', title: 'ca-spmeve' },
      //         { name: 'kr-pmo', title: 'kr-pmo' },
      //         { name: 'ng-nscnsl', title: 'ng-nscnsl' },
      //         { name: 'pl-moia-s', title: 'pl-moia-s' },
      //         { name: 'ca-spmeni', title: 'ca-spmeni' },
      //         { name: 'pk-nacta-o', title: 'pk-nacta-o' },
      //         { name: 'ca-syria', title: 'ca-syria' },
      //         { name: 'my-moha-s', title: 'my-moha-s' },
      //         { name: 'kz-fma-fte', title: 'kz-fma-fte' },
      //         { name: 'nz-un-1373', title: 'nz-un-1373' },
      //         { name: 'us-dos-tel', title: 'us-dos-tel' },
      //         { name: 'in-mha', title: 'in-mha' },
      //         { name: 'ch-fdfa-ve', title: 'ch-fdfa-ve' },
      //         { name: 'ca-spmesd', title: 'ca-spmesd' },
      //         { name: 'iq-tffc-il', title: 'iq-tffc-il' },
      //         { name: 'ru-psd252', title: 'ru-psd252' },
      //         { name: 'ru-fsb-tl', title: 'ru-fsb-tl' },
      //         { name: 'un-sc-1591', title: 'un-sc-1591' },
      //         { name: 'uk-hmt-ibt', title: 'uk-hmt-ibt' },
      //         { name: 'tj - nbt', title: 'tj - nbt' },
      //         { name: 'un-sc-2140', title: 'un-sc-2140' },
      //         { name: 'kg-sfiu', title: 'kg-sfiu' },
      //         { name: 'ca-jvcfoa', title: 'ca-jvcfoa' },
      //         { name: 'ru-d1300', title: 'ru-d1300' },
      //         { name: 'us-nsdnmbs', title: 'us-nsdnmbs' },
      //         { name: 'tn-nsl', title: 'tn-nsl' },
      //         { name: 'ca-riunrst', title: 'ca-riunrst' },
      //         { name: 'fincen 311', title: 'fincen 311' },
      //         { name: 'om-nctc-ll', title: 'om-nctc-ll' },
      //         { name: 'kz-clssr', title: 'kz-clssr' },
      //         { name: 'ca-spmeprc', title: 'ca-spmeprc' },
      //         { name: 'ca-spmeby', title: 'ca-spmeby' },
      //         { name: 'ke-pota-se', title: 'ke-pota-se' },
      //         { name: 'sg-masfmr', title: 'sg-masfmr' },
      //         { name: 'ca-spmehta', title: 'ca-spmehta' },
      //         { name: 'un-sc-751', title: 'un-sc-751' },
      //         { name: 'bis', title: 'bis' },
      //         { name: 'us-ofaccmc', title: 'us-ofaccmc' },
      //         { name: 'am-cba-dl', title: 'am-cba-dl' },
      //         { name: 'ke-tfs-dl', title: 'ke-tfs-dl' },
      //         { name: 'bg-com-s', title: 'bg-com-s' },
      //         { name: 'lb-isf-ntl', title: 'lb-isf-ntl' },
      //         { name: 'jo-tc-nl', title: 'jo-tc-nl' },
      //         { name: 'ca-spmemd', title: 'ca-spmemd' },
      //         { name: 'ch-fdfa-sy', title: 'ch-fdfa-sy' },
      //         { name: 'lt-fcis-s', title: 'lt-fcis-s' },
      //         { name: 'cz-mfa-nsl', title: 'cz-mfa-nsl' },
      //         { name: 'us-eo12938', title: 'us-eo12938' },
      //         { name: 'bd-bfiu-ds', title: 'bd-bfiu-ds' },
      //         { name: 'ca-spmelk', title: 'ca-spmelk' },
      //         { name: 'uk-rusr18a', title: 'uk-rusr18a' },
      //         { name: 'bf-ccga-nl', title: 'bf-ccga-nl' },
      //         { name: 'ca-trcl', title: 'ca-trcl' },
      //         { name: 'us-cbws', title: 'us-cbws' },
      //         { name: 'pl-gifi-s', title: 'pl-gifi-s' },
      //         { name: 'au-ans-sst', title: 'au-ans-sst' },
      //         { name: 'cz-ism-ct', title: 'cz-ism-ct' },
      //         { name: 'sg-trcl', title: 'sg-trcl' },
      //         { name: 'us-eo13808', title: 'us-eo13808' },
      //         { name: 'un-sc-2653', title: 'un-sc-2653' },
      //         { name: 'us-nppa', title: 'us-nppa' },
      //         { name: 'at-onb', title: 'at-onb' },
      //         { name: 'ca-spmegt', title: 'ca-spmegt' },
      //         { name: 'eg-dtl', title: 'eg-dtl' },
      //         { name: 'sg-agc', title: 'sg-agc' },
      //         { name: 'un-1718-dv', title: 'un-1718-dv' },
      //         { name: 'au-ans-phg', title: 'au-ans-phg' },
      //         { name: 'ca-spmeht', title: 'ca-spmeht' },
      //         { name: 'cn-taosc', title: 'cn-taosc' },
      //         { name: 'mz-gifim-s', title: 'mz-gifim-s' },
      //         { name: 'un-sc-1533', title: 'un-sc-1533' },
      //         { name: 'us-ds-sst', title: 'us-ds-sst' },
      //         { name: 'us-eo14064', title: 'us-eo14064' },
      //         { name: 'kz-fma-ita', title: 'kz-fma-ita' },
      //         { name: 'lk-fiu1373', title: 'lk-fiu1373' },
      //         { name: 'ma-cnasnu', title: 'ma-cnasnu' },
      //         { name: 'tw-mjib-sl', title: 'tw-mjib-sl' },
      //         { name: 'uk-dbt-cl', title: 'uk-dbt-cl' },
      //         { name: 'us-bis-cl', title: 'us-bis-cl' },
      //         { name: 'us-dos231a', title: 'us-dos231a' },
      //         { name: 'cn-mfasana', title: 'cn-mfasana' },
      //         { name: 'eu-trcl', title: 'eu-trcl' },
      //         { name: 'my-miti-cl', title: 'my-miti-cl' },
      //         { name: 'us-eiba', title: 'us-eiba' },
      //         { name: 'au-dfat-cl', title: 'au-dfat-cl' },
      //         { name: 'cn-mps-s', title: 'cn-mps-s' },
      //         { name: 'rw-fic-dsl', title: 'rw-fic-dsl' },
      //         { name: 'so-namlc-s', title: 'so-namlc-s' },
      //         { name: 'un-sc-2048', title: 'un-sc-2048' },
      //         { name: 'un-sc-2127', title: 'un-sc-2127' },
      //         { name: 'un-srcl', title: 'un-srcl' },
      //         { name: 'ch-seco-te', title: 'ch-seco-te' },
      //       ],
      //     },
      //     peps: {
      //       self: 'pep',
      //       topics: {
      //         geography: [
      //           { name: 'pep.geo.eu', title: 'pep.geo.eu' },
      //           { name: 'pep.geo.us', title: 'pep.geo.us' },
      //         ],
      //         kind: [
      //           { name: 'pep.kind.primary', title: 'pep.kind.primary' },
      //           { name: 'pep.kind.secondary', title: 'pep.kind.secondary' },
      //         ],
      //         position: [
      //           { name: 'pep.position.headofstate', title: 'pep.position.headofstate' },
      //           { name: 'pep.position.legislative', title: 'pep.position.legislative' },
      //         ],
      //         status: [
      //           { name: 'pep.status.active', title: 'pep.status.active' },
      //           { name: 'pep.status.inactive', title: 'pep.status.inactive' },
      //         ],
      //       },
      //     },
      //     adverse_media: {
      //       self: 'adversemedia',
      //       topics: {
      //         source: [
      //           { name: 'adversemedia.media', title: 'adversemedia.media' },
      //           { name: 'adversemedia.enforcements', title: 'adversemedia.enforcements' },
      //         ],
      //       },
      //     },
      //   },
      // };

      // listFeature.conditional_filters = [
      //   {
      //     key: 'kind_of_peps',
      //     name: 'kind_of_peps_options',
      //     topics: [
      //       { name: 'primary.option1', title: 'Primary PEP option 1' },
      //       { name: 'primary.option2', title: 'Primary PEP option 2' },
      //       { name: 'primary.option3', title: 'Primary PEP option 3' },
      //       { name: 'primary.option4', title: 'Primary PEP option 4' },
      //       { name: 'option5', title: 'Any PEP option 5' },
      //       { name: 'option6', title: 'Any PEP option 6' },
      //       { name: 'option7', title: 'Any PEP option 7' },
      //       { name: 'option8', title: 'Any PEP option 8' },
      //       { name: 'option9', title: 'Any PEP option 9' },
      //       { name: 'option10', title: 'Any PEP option 10' },
      //     ],
      //   },
      // ];
      return listFeature;
    },
    listDatasets: async () => {
      try {
        return await marbleCoreApiClient.listOpenSanctionDatasets();
      } catch {
        // Return empty catalog if datasets service fails (404, 500, etc.)
        return { sections: [] };
      }
    },
    getDatasetFreshness: async () => {
      return adaptOpenSanctionsDatasetFreshness(await marbleCoreApiClient.getDatasetsFreshness());
    },
    listScreenings: async ({ decisionId }) => {
      try {
        return R.map(await marbleCoreApiClient.listScreenings(decisionId), adaptScreening);
      } catch (error) {
        // Return empty array if decision not found (404)
        if (isNotFoundHttpError(error)) {
          return [];
        }
        throw error;
      }
    },
    updateMatchStatus: async ({ matchId, status, comment, whitelist }) => {
      return adaptScreeningMatch(
        await marbleCoreApiClient.updateScreeningMatch(matchId, {
          status,
          comment,
          whitelist,
        }),
      );
    },
    searchScreeningMatches: async ({ screeningId, entityType, fields }) => {
      const dto = {
        screening_id: screeningId,
        query: {
          [entityType]: fields,
        },
      };
      return R.map(await marbleCoreApiClient.searchScreeningMatches(dto), adaptScreeningMatchPayload);
    },
    enrichedData: async ({ entityId }) => {
      return adaptScreeningMatchPayload(await marbleCoreApiClient.getEnrichedData(entityId));
    },
    refineScreening: async ({ screeningId, entityType, fields }) => {
      const dto = {
        screening_id: screeningId,
        query: {
          [entityType]: fields,
        },
      };
      return adaptScreening(await marbleCoreApiClient.refineScreening(dto));
    },
    listScreeningFiles: async ({ screeningId }) => {
      return R.map(await marbleCoreApiClient.listScreeningFiles(screeningId), adaptScreeningFile);
    },
    enrichMatch: async ({ matchId }) => {
      return adaptScreeningMatch(await marbleCoreApiClient.enrichScreeningMatch(matchId));
    },
    freeformSearch: async ({ entityType, fields, datasets, threshold, limit }) => {
      const dto = {
        query: {
          [entityType]: fields,
        },
        datasets,
        threshold,
      };
      const results = await marbleCoreApiClient.freeformSearch(dto, { limit });
      return R.map(results, (result) => adaptScreeningMatchPayload(result.payload));
    },
    getAiSuggestions: async ({ screeningId }) => {
      return R.map(await marbleCoreApiClient.getScreeningAiSuggestions(screeningId), adaptScreeningAiSuggestion);
    },
  });
}
