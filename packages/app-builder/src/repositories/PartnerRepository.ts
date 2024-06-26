import { type TransfercheckApi } from '@app-builder/infra/transfercheck-api';
import { adaptPartner, type Partner } from '@app-builder/models/partner';

export interface PartnerRepository {
  getPartner(partnerId: string): Promise<Partner>;
}

export function makeGetPartnerRepository() {
  return (transfercheckApi: TransfercheckApi): PartnerRepository => ({
    getPartner: async (partnerId) => {
      const { partner } = await transfercheckApi.getPartner(partnerId);

      return adaptPartner(partner);
    },
  });
}
