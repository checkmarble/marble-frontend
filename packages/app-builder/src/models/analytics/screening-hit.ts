import type { ScreeningHitTableResponseDto } from 'marble-api';

export type ScreeningHitTableResponse = {
  configId: string;
  name: string;
  execs: number;
  hits: number;
  hitRatio: number;
  avgHitsPerScreening: number;
};

export const adaptScreeningHitTable = (
  val: ScreeningHitTableResponseDto[],
): ScreeningHitTableResponse[] => {
  console.log(val);
  return val.map((v) => ({
    configId: v.config_id,
    name: v.name,
    execs: v.execs,
    hits: v.hits,
    hitRatio: v.hit_ratio,
    avgHitsPerScreening: v.avg_hits_per_screening,
  }));
};
