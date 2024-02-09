import { type AnalyticsDto } from 'marble-api';

export interface Analytics {
  embeddingId: 'global_dashboard' | 'unknown_embedding_id';
  signedEmbeddingUrl: string;
}

export function adaptAnalytics(analyticsDto: AnalyticsDto): Analytics {
  return {
    embeddingId: analyticsDto.embedding_id,
    signedEmbeddingUrl: analyticsDto.signed_embedding_url,
  };
}
