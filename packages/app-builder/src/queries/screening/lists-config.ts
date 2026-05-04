import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import * as R from 'remeda';

export type ListConfigFilters = {
  sanctions?: NonNullable<ListConfig['sections']>['sanctions'];
  peps?: NonNullable<ListConfig['sections']>['peps'];
  'adverse-media'?: NonNullable<ListConfig['sections']>['adverse-media'];
};

function normalizeListConfig(config: ListConfig): ListConfigFilters {
  const sanctionFilter = config.filters?.sanctions?.datasets ?? [];
  const pepFilter = R.flat(config.filters?.peps?.topics ?? []);
  const adverseFilter = config.filters?.adverse_media?.topics ?? [];

  const sanctions = config.sections?.sanctions
    ? sanctionFilter.length > 0
      ? {
          ...config.sections.sanctions,
          datasets: config.sections.sanctions.datasets
            .map((g) => ({ ...g, datasets: R.filter(g.datasets, (d) => sanctionFilter.includes(d.name)) }))
            .filter((g) => g.datasets.length > 0),
        }
      : config.sections.sanctions
    : undefined;

  const pepsSection = config.sections?.peps;
  const peps = pepsSection
    ? pepFilter.length > 0
      ? Object.fromEntries(
          Object.entries(pepsSection).map(([key, value]) =>
            Array.isArray(value)
              ? [key, R.filter(value as { name: string }[], (i) => pepFilter.includes(i.name))]
              : [key, value],
          ),
        )
      : pepsSection
    : undefined;

  const adverseSection = config.sections?.['adverse-media'];
  const adverseMedia = adverseSection
    ? adverseFilter.length > 0
      ? Object.fromEntries(
          Object.entries(adverseSection).map(([key, value]) => [
            key,
            R.filter(value, (i) => adverseFilter.includes(i.name)),
          ]),
        )
      : adverseSection
    : undefined;

  return { sanctions, peps, 'adverse-media': adverseMedia };
}

export const useListConfigQuery = (useCase: 'screening' | 'continuous-screening') => {
  const getListConfig = useServerFn(() => getListConfigFn(useCase));

  return useQuery({
    queryKey: ['screening', 'datasets'],
    queryFn: async () => {
      const result = await getListConfig();
      return normalizeListConfig(result);
    },
  });
};

type ListConfig = {
  provider: string;
  sections?: {
    sanctions?: {
      self: string;
      datasets: {
        name: string;
        title: string;
        datasets: {
          name: string;
          title: string;
        }[];
      }[];
    };
    peps?: {
      self: string;
      [key: string]: { name: string }[] | string;
    };
    'adverse-media'?: {
      [key: string]: { name: string }[];
    };
  };
  filters?: {
    sanctions: {
      datasets: string[];
    };
    peps: {
      topics: string[][];
    };
    adverse_media: {
      topics: string[];
    };
  };
};

async function getListConfigFn(useCase: 'screening' | 'continuous-screening'): Promise<ListConfig> {
  return new Promise((resolve) => {
    resolve({
      provider: 'lexisnexis',
      sections: {
        sanctions: {
          self: 'sanction',
          datasets: [
            {
              name: 'na',
              title: 'North America',
              datasets: [
                {
                  name: 'us_nk_jointventures',
                  title: 'US Advisory on North Korean Joint Ventures',
                },
                {
                  name: 'us_klepto_hr_visa',
                  title: 'US Anti-Kleptocracy and Human Rights Visa Restrictions',
                },
                {
                  name: 'us_bis_denied',
                  title: 'US BIS Denied Persons List',
                },
                {
                  name: 'us_state_terrorist_exclusion',
                  title: 'US Department of State Terrorist Exclusion',
                },
                {
                  name: 'us_ddtc_debarred',
                  title: 'US Directorate of Defense Trade Controls AECA Debarments',
                },
                {
                  name: 'us_dod_chinese_milcorps',
                  title: 'US DoD Chinese military companies',
                },
                {
                  name: 'us_ofac_cons',
                  title: 'US OFAC Consolidated (non-SDN) List',
                },
                {
                  name: 'us_ofac_sdn',
                  title: 'US OFAC Specially Designated Nationals (SDN) List',
                },
                {
                  name: 'us_special_leg',
                  title: 'US Special Legislative Exclusions',
                },
                {
                  name: 'us_cuba_sanctions',
                  title: 'US State Department Cuba Sanctions',
                },
                {
                  name: 'us_trade_csl',
                  title: 'US Trade Consolidated Screening List (CSL)',
                },
                {
                  name: 'us_dhs_uflpa',
                  title: 'US UFLPA Entity List',
                },
              ],
            },

            {
              name: 'other',
              title: 'Other',
              datasets: [
                {
                  name: 'ext_abuja_mou_psc',
                  title: 'Abuja MoU Port State Control Inspections',
                },
              ],
            },
          ],
        },
        peps: {
          self: 'role.pep',
          role: [{ name: 'pep.kind.primary' }, { name: 'pep.kind.secondary' }],
          geography: [{ name: 'pep.geo.europe' }, { name: 'pep.geo.america' }],
          position: [{ name: 'pep.position.emperor' }],
        },
        'adverse-media': {
          geography: [{ name: 'media.geo.europe' }, { name: 'media.geo.america' }],
          category: [{ name: 'media.cat.one' }, { name: 'media.cat.two' }],
        },
      },
      // filters: {
      //   sanctions: {
      //     datasets: ['one', 'two'],
      //   },
      //   peps: {
      //     topics: [['one', 'two2']],
      //   },
      //   adverse_media: {
      //     topics: ['one', 'two'],
      //   },
      // },
    });
  });
}
