import type {
  RecommendationExplainer,
  VacationRecommendation,
} from '../types/recommendation.types'

/**
 * Default explainer: simply surfaces the deterministic `reason` the engine
 * already computed. A future AI-powered explainer implements the same
 * `RecommendationExplainer` interface — e.g. rewriting `reason` in a more
 * conversational tone — without touching how recommendations are scored.
 */
export function createDeterministicExplainer(): RecommendationExplainer {
  return {
    explain(recommendation: VacationRecommendation): string {
      return recommendation.reason
    },
  }
}
