import { type PartnerDto } from 'marble-api/generated/transfercheck-api';

export interface Partner {
  id: string;
  createdAt: string;
  name: string;
}

export function adaptPartner(dto: PartnerDto): Partner {
  return {
    id: dto.id,
    createdAt: dto.created_at,
    name: dto.name,
  };
}
