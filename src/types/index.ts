export interface InitiatorFeatures {
  init_days_on_platform: number;
  init_prior_conv_rate: number;
  init_daily_swipes: number;
  init_last_active_hours: number;
  init_matches_24h: number;
  init_subscription: boolean;
}

export interface CandidateFeatures {
  cand_profile_completeness: number;
  cand_last_active_hours: number;
  cand_avg_response_time_h: number;
  cand_photos: number;
  cand_bio_length_words: number;
  cand_reciprocal_like: boolean;
}

export interface MatchContextFeatures {
  shared_interests_count: number;
  distance_km: number;
  match_age_hours: number;
  time_of_day_evening: boolean;
}

export interface EngineeredFeatures {
  recency_score: number;
  match_urgency: number;
  engagement_index: number;
}

export interface Interest {
  label: string;
  icon: string;
}

export interface Profile {
  id: string;
  name: string;
  age: number;
  photo: string;
  additionalPhotos: string[];
  bio: string;
  interests: string[];
  initiator: InitiatorFeatures;
  candidate: CandidateFeatures;
  matchContext: MatchContextFeatures;
  engineered?: EngineeredFeatures;
  cil_score?: number;
  rank?: number;
}

export type ViewTab = 'initiator' | 'rankings' | 'matchProfile';

export interface FeatureImportanceItem {
  feature: string;
  label: string;
  importance: number;
  category: 'initiator' | 'candidate' | 'context' | 'engineered';
}
