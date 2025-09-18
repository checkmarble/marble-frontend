import { type LegacyAnalyticsDto } from 'marble-api';

export interface Analytics {
  embeddingType: 'global_dashboard' | 'unknown_embedding_type';
  signedEmbeddingUrl: string;
}

export function adaptAnalytics(analyticsDto: LegacyAnalyticsDto): Analytics {
  return {
    embeddingType: analyticsDto.embedding_type,
    signedEmbeddingUrl: analyticsDto.signed_embedding_url,
  };
}
