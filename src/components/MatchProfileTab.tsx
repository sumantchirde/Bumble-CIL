import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Profile } from '../types';
import { computeEngineeredFeatures, FEATURE_IMPORTANCES } from '../utils/cilModel';
import ProfileCard from './ProfileCard';
import FirstMessageModal from './FirstMessageModal';
import { InitiatorProfile } from '../utils/profiles';

interface MatchProfileTabProps {
  profile: Profile;
  initiator: InitiatorProfile;
}

function CILGauge({ score }: { score: number }) {
  const pct = Math.min(Math.max(score, 0), 1);
  const getLabel = (s: number) => {
    if (s >= 0.65) return { label: 'Very Likely', color: '#22c55e' };
    if (s >= 0.45) return { label: 'Likely', color: '#84cc16' };
    if (s >= 0.28) return { label: 'Possible', color: '#f59e0b' };
    return { label: 'Unlikely', color: '#ef4444' };
  };
  const { label, color } = getLabel(score);
  const radius = 56;
  const cx = 70;
  const cy = 70;
  const startAngle = -210;
  const endAngle = 30;
  const totalAngle = endAngle - startAngle;
  const valueAngle = startAngle + totalAngle * pct;

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const arcPath = (startDeg: number, endDeg: number, r: number) => {
    const x1 = cx + r * Math.cos(toRad(startDeg));
    const y1 = cy + r * Math.sin(toRad(startDeg));
    const x2 = cx + r * Math.cos(toRad(endDeg));
    const y2 = cy + r * Math.sin(toRad(endDeg));
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  };

  return (
    <div className="flex flex-col items-center bg-white rounded-2xl shadow p-4">
      <svg width="140" height="110" viewBox="0 0 140 140">
        <path d={arcPath(startAngle, endAngle, radius)} fill="none" stroke="#E5E7EB" strokeWidth="11" strokeLinecap="round" />
        <path d={arcPath(startAngle, valueAngle, radius)} fill="none" stroke={color} strokeWidth="11" strokeLinecap="round" />
        <text x={cx} y={cy - 8} textAnchor="middle" style={{ fontSize: 24, fontWeight: 900, fill: color }}>
          {(pct * 100).toFixed(0)}%
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" style={{ fontSize: 10, fontWeight: 700, fill: color }}>
          {label}
        </text>
      </svg>
    </div>
  );
}

function FeatureContribution({ profile }: { profile: Profile }) {
  const eng = computeEngineeredFeatures(profile);
  const { candidate: c, initiator: i, matchContext: m } = profile;

  const contributions = [
    { label: "Conv. Rate", value: 2.0 * i.init_prior_conv_rate, max: 2.0 },
    { label: "Recency", value: 1.5 * eng.recency_score, max: 1.5 },
    { label: "Urgency", value: 1.2 * eng.match_urgency, max: 1.2 },
    { label: "Profile", value: 0.8 * c.cand_profile_completeness, max: 0.8 },
    { label: "Interests", value: 0.6 * (m.shared_interests_count / 8), max: 0.6 },
  ];

  return (
    <div className="bg-white rounded-2xl shadow p-4 space-y-2.5">
      <h4 className="text-xs font-black text-bumble-dark uppercase">Feature Contributions</h4>
      {contributions.map((c) => (
        <div key={c.label} className="flex items-center gap-2">
          <span className="text-xs text-gray-500 w-20">{c.label}</span>
          <div className="flex-1 bg-gray-100 rounded-full h-2">
            <div className="h-full rounded-full bg-bumble-gold" style={{ width: `${(c.value / c.max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function EngineeredSignals({ profile }: { profile: Profile }) {
  const eng = computeEngineeredFeatures(profile);

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <h4 className="text-xs font-black text-bumble-dark uppercase mb-3">Engineered Signals</h4>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Recency', value: (eng.recency_score * 100).toFixed(0) + '%' },
          { label: 'Urgency', value: (eng.match_urgency * 100).toFixed(0) + '%' },
          { label: 'Engagement', value: (eng.engagement_index * 100).toFixed(0) + '%' },
        ].map((item) => (
          <div key={item.label} className="bg-bumble-light rounded-xl p-2.5 text-center">
            <div className="text-base font-black text-bumble-dark">{item.value}</div>
            <div className="text-[10px] font-bold text-bumble-dark/70">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SHAPTopDrivers() {
  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <h4 className="text-xs font-black text-bumble-dark uppercase mb-3">SHAP — Top Drivers</h4>
      <div className="space-y-1.5">
        {FEATURE_IMPORTANCES.slice(0, 5).map((f) => (
          <div key={f.feature} className="flex items-center gap-2">
            <span className="text-[11px] text-gray-500 w-28">{f.label}</span>
            <div className="flex-1 bg-gray-100 rounded-full h-1.5">
              <div className="h-full rounded-full bg-bumble-gold" style={{ width: `${(f.importance / 0.198) * 100}%` }} />
            </div>
            <span className="text-[10px] font-mono text-gray-500 w-8">{(f.importance * 100).toFixed(1)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MatchProfileTab({ profile }: MatchProfileTabProps) {
  const score = profile.cil_score ?? 0;

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start max-w-5xl mx-auto">
      <div className="w-full lg:w-auto lg:flex-shrink-0 lg:max-w-sm">
        <ProfileCard profile={profile} isInitiator={false} />
      </div>

      <div className="w-full lg:flex-1 space-y-3">
        <CILGauge score={score} />
        <FeatureContribution profile={profile} />
        <EngineeredSignals profile={profile} />
        <SHAPTopDrivers />
      </div>
    </div>
  );
}
