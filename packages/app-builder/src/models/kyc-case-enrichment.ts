import { GroundingCitationDto, KycAnalysisDto } from 'marble-api/generated/marblecore-api';

export type GroundingCitation = {
  title: string;
  domain: string;
  url: string;
  date: string;
};

export type KycCaseEnrichment = {
  analysis: string;
  entityName: string;
  citations: GroundingCitation[];
};

export function adaptGroundingCitation(dto: GroundingCitationDto): GroundingCitation {
  return {
    title: dto.title,
    domain: dto.domain,
    url: dto.url,
    date: dto.date,
  };
}

export function adaptKycCaseEnrichment(dto: KycAnalysisDto): KycCaseEnrichment {
  return {
    analysis: dto.analysis,
    entityName: dto.entity_name,
    citations: dto.citations.map(adaptGroundingCitation),
  };
}
