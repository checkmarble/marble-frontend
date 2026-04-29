import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useListConfigQuery = (useCase: 'screening' | 'continuous-screening') => {
  const getListConfig = useServerFn(() => getListConfigFn(useCase));

  return useQuery({
    queryKey: ['screening', 'datasets'],
    queryFn: async () => {
      const result = await getListConfig();
      return result;
    },
  });
};

type ListConfig = {
  provider: string;
  sections: {
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
      role: { name: string }[];
      geography: { name: string }[];
      position: { name: string }[];
    };
    'adverse-media'?: {
      geography: { name: string }[];
      category: { name: string }[];
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
    });
  });
}
