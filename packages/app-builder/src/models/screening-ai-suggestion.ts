import { type ScreeningAiSuggestionDto } from 'marble-api';

export type ScreeningAiSuggestionConfidence = 'probable_false_positive' | 'inconclusive' | 'investigate';

export type ScreeningAiSuggestion = {
  matchId: string;
  entityId: string;
  confidence: ScreeningAiSuggestionConfidence;
  reason: string;
  version: string;
  createdAt: string;
};

export function adaptScreeningAiSuggestion(dto: ScreeningAiSuggestionDto): ScreeningAiSuggestion {
  return {
    matchId: dto.match_id,
    entityId: dto.entity_id,
    confidence: dto.confidence,
    reason: dto.reason,
    version: dto.version,
    createdAt: dto.created_at,
  };
}
