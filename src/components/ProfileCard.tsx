import { MapPin, Clock, Heart } from 'lucide-react';
import { Profile } from '../types';

interface ProfileCardProps {
  profile: Profile | { id: string; name: string; age: number; photo: string; features?: any };
  isInitiator?: boolean;
}

export default function ProfileCard({ profile, isInitiator = false }: ProfileCardProps) {
  const isCandidate = 'candidate' in profile && 'matchContext' in profile;

  if (!isCandidate && !isInitiator) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-sm w-full mx-auto">
      <div className="relative">
        <img
          src={profile.photo}
          alt={profile.name}
          className="w-full h-72 object-cover object-top"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=600';
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <h2 className="text-white text-2xl font-black">{profile.name}, {profile.age}</h2>
        </div>
      </div>

      {isCandidate && (
        <div className="p-3 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-50 rounded-xl p-2.5">
              <div className="flex items-center gap-1.5 mb-0.5">
                <MapPin size={14} className="text-bumble-gold" />
                <span className="text-xs font-semibold text-gray-700">{(profile as any).matchContext.distance_km.toFixed(1)} km</span>
              </div>
              <span className="text-base font-black text-bumble-dark">Distance</span>
            </div>
            <div className="bg-gray-50 rounded-xl p-2.5">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Clock size={14} className="text-bumble-gold" />
                <span className="text-xs font-semibold text-gray-700">Active {(profile as any).candidate.cand_last_active_hours < 1 ? 'now' : `${(profile as any).candidate.cand_last_active_hours.toFixed(0)}h ago`}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-bumble-light rounded-xl p-2.5">
              <div className="text-xs font-semibold text-bumble-dark/70 mb-1">Profile</div>
              <span className="text-base font-black text-bumble-dark">{((profile as any).candidate.cand_profile_completeness * 100).toFixed(0)}%</span>
              <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${(profile as any).candidate.cand_profile_completeness * 100}%` }} />
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-2.5">
              <div className="text-xs font-semibold text-gray-600 mb-1">Response</div>
              <span className="text-base font-black text-bumble-dark">{(profile as any).candidate.cand_avg_response_time_h.toFixed(1)}h</span>
            </div>
          </div>

          {(profile as any).candidate.cand_reciprocal_like && (
            <div className="bg-bumble-light rounded-xl p-2.5 flex items-center gap-2">
              <Heart size={16} className="text-bumble-gold fill-bumble-gold" />
              <span className="text-xs font-bold text-bumble-dark">Mutual Like</span>
            </div>
          )}

          {(profile as any).additionalPhotos.length > 0 && (
            <div>
              <span className="text-xs font-semibold text-gray-600">{(profile as any).candidate.cand_photos} Photos</span>
              <div className="grid grid-cols-4 gap-1 mt-1.5">
                {(profile as any).additionalPhotos.map((photo: string, idx: number) => (
                  <img
                    key={idx}
                    src={photo}
                    alt=""
                    className="w-full h-14 object-cover rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = profile.photo;
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="bg-gray-50 rounded-xl p-2.5">
            <span className="text-xs text-gray-500 italic">{(profile as any).bio}</span>
            <span className="text-xs text-gray-400 block mt-1">{(profile as any).candidate.cand_bio_length_words} words</span>
          </div>
        </div>
      )}

      {isInitiator && (
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-bumble-light rounded-xl p-3">
              <div className="text-xs font-semibold text-bumble-dark/70">On Platform</div>
              <div className="text-lg font-black text-bumble-dark">{Math.floor((profile as any).features.init_days_on_platform)} days</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-xs font-semibold text-gray-600">Conv. Rate</div>
              <div className="text-lg font-black text-bumble-dark">{(((profile as any).features.init_prior_conv_rate) * 100).toFixed(0)}%</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-xs font-semibold text-gray-600">Daily Swipes</div>
              <div className="text-lg font-black text-bumble-dark">{(profile as any).features.init_daily_swipes}</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-xs font-semibold text-gray-600">Last Active</div>
              <div className="text-lg font-black text-bumble-dark">{((profile as any).features.init_last_active_hours).toFixed(1)}h ago</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-xs font-semibold text-gray-600">Matches (24h)</div>
              <div className="text-lg font-black text-bumble-dark">{(profile as any).features.init_matches_24h}</div>
            </div>
            <div className={`rounded-xl p-3 ${(profile as any).features.init_subscription ? 'bg-bumble-light' : 'bg-gray-50'}`}>
              <div className="text-xs font-semibold text-gray-600">Premium</div>
              <div className={`text-lg font-black ${(profile as any).features.init_subscription ? 'text-bumble-dark' : 'text-gray-400'}`}>
                {(profile as any).features.init_subscription ? 'Yes' : 'No'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
