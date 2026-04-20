import { Profile } from '../types';
import { getCILLabel, FEATURE_IMPORTANCES, computeEngineeredFeatures } from '../utils/cilModel';

interface CILGaugeProps {
  score: number;
}

function CILGauge({ score }: CILGaugeProps) {
  const pct = Math.min(Math.max(score, 0), 1);
  const { label, color } = getCILLabel(score);
  const radius = 72;
  const cx = 90;
  const cy = 90;
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

  const ticks = [0, 0.25, 0.5, 0.75, 1.0];

  return (
    <div className="flex flex-col items-center">
      <svg width="180" height="130" viewBox="0 0 180 130">
        <path d={arcPath(startAngle, endAngle, radius)} fill="none" stroke="#E5E7EB" strokeWidth="14" strokeLinecap="round" />
        <path d={arcPath(startAngle, valueAngle, radius)} fill="none" stroke={color} strokeWidth="14" strokeLinecap="round" />
        {ticks.map((t) => {
          const a = startAngle + totalAngle * t;
          const ix = cx + (radius - 20) * Math.cos(toRad(a));
          const iy = cy + (radius - 20) * Math.sin(toRad(a));
          const ox = cx + (radius + 4) * Math.cos(toRad(a));
          const oy = cy + (radius + 4) * Math.sin(toRad(a));
          return <line key={t} x1={ix} y1={iy} x2={ox} y2={oy} stroke="#D1D5DB" strokeWidth="1.5" />;
        })}
        <text x={cx} y={cy - 10} textAnchor="middle" className="text-3xl" style={{ fontSize: 30, fontWeight: 900, fill: color }}>
          {(pct * 100).toFixed(0)}%
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" style={{ fontSize: 11, fontWeight: 700, fill: color }}>
          {label}
        </text>
        <text x={cx} y={cy + 26} textAnchor="middle" style={{ fontSize: 9, fill: '#9CA3AF' }}>
          CIL Score
        </text>
      </svg>
    </div>
  );
}

interface FeatureContributionProps {
  profile: Profile;
}

function FeatureContribution({ profile }: FeatureContributionProps) {
  const eng = computeEngineeredFeatures(profile);
  const { candidate: c, initiator: i, matchContext: m } = profile;

  const contributions = [
    { label: "Conv. Rate", value: 2.0 * i.init_prior_conv_rate, max: 2.0, category: 'initiator' as const, raw: `${(i.init_prior_conv_rate * 100).toFixed(0)}%` },
    { label: "Recency", value: 1.5 * eng.recency_score, max: 1.5, category: 'engineered' as const, raw: `${(eng.recency_score * 100).toFixed(0)}%` },
    { label: "Urgency", value: 1.2 * eng.match_urgency, max: 1.2, category: 'engineered' as const, raw: `${(eng.match_urgency * 100).toFixed(0)}%` },
    { label: "Profile", value: 0.8 * c.cand_profile_completeness, max: 0.8, category: 'candidate' as const, raw: `${(c.cand_profile_completeness * 100).toFixed(0)}%` },
    { label: "Interests", value: 0.6 * (m.shared_interests_count / 8), max: 0.6, category: 'context' as const, raw: `${m.shared_interests_count}` },
    { label: "Mutual Like", value: 0.4 * (c.cand_reciprocal_like ? 1 : 0), max: 0.4, category: 'candidate' as const, raw: c.cand_reciprocal_like ? 'Yes' : 'No' },
    { label: "Premium", value: 0.5 * (i.init_subscription ? 1 : 0), max: 0.5, category: 'initiator' as const, raw: i.init_subscription ? 'Yes' : 'No' },
    { label: "Response", value: Math.max(0, -0.4 * Math.log1p(c.cand_avg_response_time_h)), max: 0, category: 'candidate' as const, raw: `${c.cand_avg_response_time_h.toFixed(1)}h`, negative: true },
    { label: "Distance", value: Math.max(0, -0.2 * Math.log1p(m.distance_km)), max: 0, category: 'context' as const, raw: `${m.distance_km.toFixed(1)}km`, negative: true },
  ];

  const categoryColors: Record<string, string> = {
    initiator: 'bg-bumble-gold',
    candidate: 'bg-orange-400',
    engineered: 'bg-blue-400',
    context: 'bg-emerald-400',
  };

  return (
    <div className="space-y-2">
      {contributions.map((c) => (
        <div key={c.label} className="flex items-center gap-2">
          <span className="text-xs text-gray-500 w-20 flex-shrink-0 text-right">{c.label}</span>
          <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
            {!c.negative ? (
              <div
                className={`h-full rounded-full transition-all ${categoryColors[c.category]}`}
                style={{ width: `${(c.value / c.max) * 100}%` }}
              />
            ) : (
              <div className="h-full rounded-full bg-red-400" style={{ width: `${Math.min(c.value * 100, 100)}%` }} />
            )}
          </div>
          <span className="text-xs font-mono text-gray-600 w-12 flex-shrink-0">{c.raw}</span>
        </div>
      ))}
      <div className="flex gap-3 pt-1 flex-wrap">
        {[['bumble-gold', 'Initiator'], ['orange-400', 'Candidate'], ['blue-400', 'Engineered'], ['emerald-400', 'Context']].map(([color, label]) => (
          <div key={label} className="flex items-center gap-1">
            <div className={`w-2.5 h-2.5 rounded-full bg-${color}`} />
            <span className="text-[10px] text-gray-500">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface CILPanelProps {
  profile: Profile;
}

export default function CILPanel({ profile }: CILPanelProps) {
  const score = profile.cil_score ?? 0;
  const { label } = getCILLabel(score);
  const engFeatures = computeEngineeredFeatures(profile);

  return (
    <div className="space-y-4 max-w-sm w-full mx-auto lg:max-w-none">
      <div className="bg-white rounded-2xl shadow-lg p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black text-bumble-dark uppercase tracking-wider">CIL Score</h3>
          {profile.rank && (
            <span className="bg-bumble-gold text-bumble-dark text-xs font-black px-2 py-0.5 rounded-full">
              Rank #{profile.rank}
            </span>
          )}
        </div>
        <CILGauge score={score} />
        <p className="text-center text-xs text-gray-500 -mt-2">
          {label} to start a conversation
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-5">
        <h3 className="text-sm font-black text-bumble-dark uppercase tracking-wider mb-3">Feature Contributions</h3>
        <FeatureContribution profile={profile} />
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-4">
        <h3 className="text-sm font-black text-bumble-dark uppercase tracking-wider mb-3">Engineered Signals</h3>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Recency', value: (engFeatures.recency_score * 100).toFixed(0) + '%', desc: 'cand active' },
            { label: 'Urgency', value: (engFeatures.match_urgency * 100).toFixed(0) + '%', desc: 'match fresh' },
            { label: 'Engagement', value: (engFeatures.engagement_index * 100).toFixed(0) + '%', desc: 'combined' },
          ].map((item) => (
            <div key={item.label} className="bg-bumble-light rounded-xl p-2.5 text-center">
              <div className="text-lg font-black text-bumble-dark">{item.value}</div>
              <div className="text-[10px] font-bold text-bumble-dark/70">{item.label}</div>
              <div className="text-[9px] text-gray-400 font-mono">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-4">
        <h3 className="text-sm font-black text-bumble-dark uppercase tracking-wider mb-3">SHAP — Top Drivers</h3>
        <div className="space-y-1.5">
          {FEATURE_IMPORTANCES.slice(0, 6).map((f) => (
            <div key={f.feature} className="flex items-center gap-2">
              <span className="text-[11px] text-gray-500 w-32 flex-shrink-0">{f.label}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                <div
                  className="h-full rounded-full bg-bumble-gold"
                  style={{ width: `${(f.importance / 0.198) * 100}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-gray-500 w-8">{(f.importance * 100).toFixed(1)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
