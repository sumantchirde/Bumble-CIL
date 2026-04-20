import { Profile, EngineeredFeatures, FeatureImportanceItem } from '../types';

export function computeEngineeredFeatures(profile: Profile): EngineeredFeatures {
  const recency_score = Math.exp(-profile.candidate.cand_last_active_hours / 24);
  const match_urgency = Math.exp(-profile.matchContext.match_age_hours / 24);
  const engagement_index =
    (profile.initiator.init_prior_conv_rate * 10 +
      profile.candidate.cand_profile_completeness * 5 +
      profile.matchContext.shared_interests_count) /
    18;
  return { recency_score, match_urgency, engagement_index };
}

export function computeCILScore(profile: Profile): number {
  const eng = computeEngineeredFeatures(profile);
  const { candidate: c, initiator: i, matchContext: m } = profile;

  const log_odds =
    2.0 * i.init_prior_conv_rate +
    1.5 * eng.recency_score +
    1.2 * eng.match_urgency +
    0.8 * c.cand_profile_completeness +
    0.6 * (m.shared_interests_count / 8) +
    0.5 * (i.init_subscription ? 1 : 0) -
    0.4 * Math.log1p(c.cand_avg_response_time_h) -
    0.3 * Math.log1p(i.init_last_active_hours) +
    0.3 * (c.cand_photos / 6) +
    0.4 * (c.cand_reciprocal_like ? 1 : 0) +
    0.3 * (m.time_of_day_evening ? 1 : 0) -
    0.2 * Math.log1p(m.distance_km) -
    3.8;

  return 1 / (1 + Math.exp(-log_odds));
}

export function rankProfiles(profiles: Profile[]): Profile[] {
  const scored = profiles.map((p) => ({
    ...p,
    engineered: computeEngineeredFeatures(p),
    cil_score: computeCILScore(p),
  }));
  return scored
    .sort((a, b) => (b.cil_score ?? 0) - (a.cil_score ?? 0))
    .map((p, i) => ({ ...p, rank: i + 1 }));
}

export function getCILLabel(score: number): { label: string; color: string } {
  if (score >= 0.65) return { label: 'Very Likely', color: '#22c55e' };
  if (score >= 0.45) return { label: 'Likely', color: '#84cc16' };
  if (score >= 0.28) return { label: 'Possible', color: '#f59e0b' };
  return { label: 'Unlikely', color: '#ef4444' };
}

export const FEATURE_IMPORTANCES: FeatureImportanceItem[] = [
  { feature: 'init_prior_conv_rate', label: "Initiator Conv. Rate", importance: 0.198, category: 'initiator' },
  { feature: 'recency_score', label: 'Candidate Recency', importance: 0.176, category: 'engineered' },
  { feature: 'match_urgency', label: 'Match Urgency', importance: 0.154, category: 'engineered' },
  { feature: 'cand_profile_completeness', label: 'Profile Completeness', importance: 0.132, category: 'candidate' },
  { feature: 'engagement_index', label: 'Engagement Index', importance: 0.098, category: 'engineered' },
  { feature: 'cand_reciprocal_like', label: 'Mutual Like', importance: 0.087, category: 'candidate' },
  { feature: 'shared_interests_count', label: 'Shared Interests', importance: 0.065, category: 'context' },
  { feature: 'init_subscription', label: 'Premium User', importance: 0.043, category: 'initiator' },
  { feature: 'cand_avg_response_time_h', label: 'Avg Response Time', importance: 0.038, category: 'candidate' },
  { feature: 'distance_km', label: 'Distance (km)', importance: 0.032, category: 'context' },
  { feature: 'cand_photos', label: 'Photo Count', importance: 0.028, category: 'candidate' },
  { feature: 'time_of_day_evening', label: 'Evening Match', importance: 0.021, category: 'context' },
];

export const MODEL_METRICS = {
  roc_auc: 0.8247,
  pr_auc: 0.5891,
  cv_auc_mean: 0.8183,
  cv_auc_std: 0.0124,
  precision: 0.68,
  recall: 0.72,
  f1: 0.70,
  positive_rate: 0.181,
  train_size: 6400,
  test_size: 1600,
  control_rate: 0.185,
  treatment_rate: 0.228,
  lift_pct: 23.2,
};

export const ROC_POINTS: [number, number][] = [
  [0, 0], [0.03, 0.22], [0.06, 0.38], [0.10, 0.52],
  [0.15, 0.63], [0.20, 0.70], [0.28, 0.78], [0.35, 0.83],
  [0.42, 0.87], [0.50, 0.90], [0.60, 0.93], [0.70, 0.96],
  [0.80, 0.975], [0.90, 0.988], [1.0, 1.0],
];

export const PR_POINTS: [number, number][] = [
  [0.0, 1.0], [0.05, 0.85], [0.10, 0.78], [0.15, 0.72],
  [0.20, 0.67], [0.28, 0.62], [0.35, 0.57], [0.42, 0.52],
  [0.50, 0.47], [0.58, 0.41], [0.65, 0.36], [0.72, 0.30],
  [0.80, 0.26], [0.88, 0.22], [0.95, 0.19], [1.0, 0.181],
];
