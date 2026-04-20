import { Trophy } from 'lucide-react';
import { Profile } from '../types';
import { getCILLabel } from '../utils/cilModel';

interface RankBadgeProps {
  rank: number;
}

function RankBadge({ rank }: RankBadgeProps) {
  if (rank === 1) return <div className="w-7 h-7 rounded-full bg-bumble-gold flex items-center justify-center shadow-md"><Trophy size={14} className="text-bumble-dark" /></div>;
  if (rank === 2) return <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center shadow"><span className="text-xs font-black text-gray-700">2</span></div>;
  if (rank === 3) return <div className="w-7 h-7 rounded-full bg-amber-600/70 flex items-center justify-center shadow"><span className="text-xs font-black text-white">3</span></div>;
  return <div className="w-7 h-7 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center"><span className="text-xs font-black text-gray-500">#{rank}</span></div>;
}

interface ProfileRowProps {
  profile: Profile;
  isSelected: boolean;
  onClick: () => void;
}

function ProfileRow({ profile, isSelected, onClick }: ProfileRowProps) {
  const score = profile.cil_score ?? 0;
  const { label, color } = getCILLabel(score);

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-left ${
        isSelected
          ? 'bg-bumble-gold/20 border-2 border-bumble-gold shadow-md'
          : 'bg-white border-2 border-transparent hover:border-bumble-gold/30 shadow hover:shadow-md'
      }`}
    >
      <RankBadge rank={profile.rank ?? 0} />
      <img
        src={profile.photo}
        alt={profile.name}
        className="w-12 h-12 rounded-xl object-cover object-top flex-shrink-0"
        onError={(e) => {
          (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=300';
        }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="font-black text-bumble-dark text-sm">{profile.name}, {profile.age}</span>
          <span className="text-sm font-black" style={{ color }}>{(score * 100).toFixed(0)}%</span>
        </div>
        <div className="mt-1 w-full bg-gray-100 rounded-full h-1.5">
          <div className="h-full rounded-full transition-all" style={{ width: `${score * 100}%`, backgroundColor: color }} />
        </div>
      </div>
      <div className="flex-shrink-0">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: color + '20', color }}>
          {label}
        </span>
      </div>
    </button>
  );
}

interface RankedMatchesProps {
  profiles: Profile[];
  selectedId: string;
  onSelect: (profile: Profile) => void;
}

export default function RankedMatches({ profiles, selectedId, onSelect }: RankedMatchesProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-bumble-gold/10 border border-bumble-gold/30 rounded-2xl p-4 mb-5">
        <h2 className="text-base font-black text-bumble-dark">CIL-Ranked Matches</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Profiles ordered by Conversation Initiation Likelihood.
        </p>
      </div>

      <div className="space-y-2">
        {profiles.map((p) => (
          <ProfileRow
            key={p.id}
            profile={p}
            isSelected={p.id === selectedId}
            onClick={() => onSelect(p)}
          />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl shadow p-4 text-center">
          <div className="text-2xl font-black text-green-500">
            {profiles.filter((p) => (p.cil_score ?? 0) >= 0.45).length}
          </div>
          <div className="text-xs text-gray-500 mt-0.5 font-semibold">Likely / Very Likely</div>
        </div>
        <div className="bg-white rounded-2xl shadow p-4 text-center">
          <div className="text-2xl font-black text-bumble-gold">
            {profiles[0] ? `${((profiles[0].cil_score ?? 0) * 100).toFixed(0)}%` : '—'}
          </div>
          <div className="text-xs text-gray-500 mt-0.5 font-semibold">Top Match CIL</div>
        </div>
      </div>
    </div>
  );
}
