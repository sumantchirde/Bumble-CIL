import { MODEL_METRICS, ROC_POINTS, PR_POINTS, FEATURE_IMPORTANCES } from '../utils/cilModel';

const W = 200;
const H = 160;
const PAD = 20;

function mapPoint(x: number, y: number): [number, number] {
  return [PAD + x * (W - 2 * PAD), H - PAD - y * (H - 2 * PAD)];
}

function pointsToPath(pts: [number, number][]): string {
  return pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
}

function ROCCurve() {
  const mapped = ROC_POINTS.map(([x, y]) => mapPoint(x, y) as [number, number]);
  const diag = [mapPoint(0, 0), mapPoint(1, 1)];

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <h4 className="text-xs font-black text-bumble-dark uppercase tracking-wider mb-2">ROC Curve</h4>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#E5E7EB" strokeWidth="1" />
        <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="#E5E7EB" strokeWidth="1" />
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const [x1, y1] = mapPoint(t, 0);
          const [, y2] = mapPoint(t, 1);
          const [x3,] = mapPoint(0, t);
          const [x4,] = mapPoint(1, t);
          return (
            <g key={t}>
              <line x1={x1} y1={H - PAD} x2={x1} y2={H - PAD - 3} stroke="#9CA3AF" strokeWidth="0.8" />
              <line x1={PAD} y1={y1} x2={PAD + 3} y2={y1} stroke="#9CA3AF" strokeWidth="0.8" />
              <text x={x1} y={H - PAD + 9} textAnchor="middle" style={{ fontSize: 6, fill: '#9CA3AF' }}>{t}</text>
              <text x={PAD - 4} y={y2} textAnchor="end" dominantBaseline="middle" style={{ fontSize: 6, fill: '#9CA3AF' }}>{t}</text>
              <line x1={x3} y1={y1} x2={x4} y2={y1} stroke="#F3F4F6" strokeWidth="0.5" />
            </g>
          );
        })}
        <path d={pointsToPath(diag)} fill="none" stroke="#D1D5DB" strokeWidth="1" strokeDasharray="4 3" />
        <path d={`${pointsToPath(mapped)} L ${mapPoint(1, 0)[0]} ${mapPoint(1, 0)[1]} L ${mapPoint(0, 0)[0]} ${mapPoint(0, 0)[1]} Z`}
          fill="#FFC629" fillOpacity="0.15" />
        <path d={pointsToPath(mapped)} fill="none" stroke="#FFC629" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <text x={W - PAD - 2} y={PAD + 10} textAnchor="end" style={{ fontSize: 7.5, fontWeight: 700, fill: '#FFC629' }}>
          AUC = {MODEL_METRICS.roc_auc.toFixed(4)}
        </text>
        <text x={PAD} y={H - PAD - 6} style={{ fontSize: 6.5, fill: '#6B7280' }}>FPR</text>
        <text x={PAD + 6} y={PAD + 6} style={{ fontSize: 6.5, fill: '#6B7280' }}>TPR</text>
      </svg>
    </div>
  );
}

function PRCurve() {
  const mapped = PR_POINTS.map(([x, y]) => mapPoint(x, y) as [number, number]);
  const baseline = [mapPoint(0, MODEL_METRICS.positive_rate), mapPoint(1, MODEL_METRICS.positive_rate)];

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <h4 className="text-xs font-black text-bumble-dark uppercase tracking-wider mb-2">Precision-Recall Curve</h4>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#E5E7EB" strokeWidth="1" />
        <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="#E5E7EB" strokeWidth="1" />
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const [x1] = mapPoint(t, 0);
          const [, y2] = mapPoint(0, t);
          return (
            <g key={t}>
              <line x1={x1} y1={H - PAD} x2={x1} y2={H - PAD - 3} stroke="#9CA3AF" strokeWidth="0.8" />
              <line x1={PAD} y1={y2} x2={PAD + 3} y2={y2} stroke="#9CA3AF" strokeWidth="0.8" />
              <text x={x1} y={H - PAD + 9} textAnchor="middle" style={{ fontSize: 6, fill: '#9CA3AF' }}>{t}</text>
              <text x={PAD - 4} y={y2} textAnchor="end" dominantBaseline="middle" style={{ fontSize: 6, fill: '#9CA3AF' }}>{t}</text>
            </g>
          );
        })}
        <path d={pointsToPath(baseline)} fill="none" stroke="#D1D5DB" strokeWidth="1" strokeDasharray="4 3" />
        <path d={`${pointsToPath(mapped)} L ${mapPoint(1, 0)[0]} ${mapPoint(1, 0)[1]} L ${mapPoint(0, 0)[0]} ${mapPoint(0, 0)[1]} Z`}
          fill="#E63946" fillOpacity="0.12" />
        <path d={pointsToPath(mapped)} fill="none" stroke="#E63946" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <text x={W - PAD - 2} y={PAD + 10} textAnchor="end" style={{ fontSize: 7.5, fontWeight: 700, fill: '#E63946' }}>
          PR-AUC = {MODEL_METRICS.pr_auc.toFixed(4)}
        </text>
        <text x={PAD} y={H - PAD - 6} style={{ fontSize: 6.5, fill: '#6B7280' }}>Recall</text>
        <text x={PAD + 6} y={PAD + 6} style={{ fontSize: 6.5, fill: '#6B7280' }}>Precision</text>
      </svg>
    </div>
  );
}

function FeatureImportanceChart() {
  const max = FEATURE_IMPORTANCES[0].importance;
  const categoryColors: Record<string, string> = {
    initiator: '#FFC629',
    candidate: '#FB923C',
    engineered: '#60A5FA',
    context: '#34D399',
  };

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <h4 className="text-xs font-black text-bumble-dark uppercase tracking-wider mb-3">Feature Importance (SHAP)</h4>
      <div className="space-y-2">
        {[...FEATURE_IMPORTANCES].reverse().map((f) => (
          <div key={f.feature} className="flex items-center gap-2">
            <span className="text-[10px] text-gray-500 w-32 flex-shrink-0 text-right leading-tight">{f.label}</span>
            <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${(f.importance / max) * 100}%`,
                  backgroundColor: categoryColors[f.category],
                }}
              />
            </div>
            <span className="text-[10px] font-mono text-gray-500 w-8">{(f.importance * 100).toFixed(1)}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-4 mt-3 flex-wrap">
        {[['#FFC629', 'Initiator'], ['#FB923C', 'Candidate'], ['#60A5FA', 'Engineered'], ['#34D399', 'Context']].map(([color, label]) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-[10px] text-gray-500">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConfusionMatrix() {
  const tn = 1142, fp = 118, fn = 79, tp = 261;
  const cells = [[tn, fp], [fn, tp]];
  const labels = ['No Conv', 'Conv Started'];
  const maxVal = Math.max(tn, fp, fn, tp);

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <h4 className="text-xs font-black text-bumble-dark uppercase tracking-wider mb-3">Confusion Matrix (thr=0.35)</h4>
      <div className="flex items-center gap-2">
        <div>
          <div className="text-[9px] text-gray-400 mb-1 text-center">Predicted</div>
          <div className="grid grid-cols-2 gap-1">
            {cells.map((row, ri) =>
              row.map((val, ci) => {
                const intensity = val / maxVal;
                const isCorrect = ri === ci;
                return (
                  <div
                    key={`${ri}-${ci}`}
                    className="w-16 h-14 rounded-xl flex flex-col items-center justify-center"
                    style={{
                      backgroundColor: isCorrect
                        ? `rgba(255, 198, 41, ${0.2 + intensity * 0.6})`
                        : `rgba(229, 57, 70, ${0.15 + intensity * 0.3})`,
                    }}
                  >
                    <span className="text-base font-black text-bumble-dark">{val}</span>
                    <span className="text-[9px] text-gray-500">{labels[ci]}</span>
                  </div>
                );
              })
            )}
          </div>
          <div className="flex gap-1 mt-1">
            {labels.map((l) => (
              <div key={l} className="w-16 text-center text-[9px] text-gray-400">{l}</div>
            ))}
          </div>
        </div>
        <div className="ml-2 space-y-3">
          {labels.map((l) => (
            <div key={l} className="text-[9px] text-gray-400 w-14 leading-tight">{l}<br/><span className="font-bold text-gray-600">actual</span></div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ABLiftCard() {
  const { control_rate, treatment_rate, lift_pct } = MODEL_METRICS;
  const exceedsTarget = lift_pct >= 20;

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <h4 className="text-xs font-black text-bumble-dark uppercase tracking-wider mb-3">Simulated A/B Lift</h4>
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-gray-50 rounded-xl p-2.5 text-center">
          <div className="text-lg font-black text-gray-600">{(control_rate * 100).toFixed(1)}%</div>
          <div className="text-[10px] text-gray-400 font-semibold">Control</div>
          <div className="text-[9px] text-gray-400">Random order</div>
        </div>
        <div className="bg-bumble-light rounded-xl p-2.5 text-center">
          <div className="text-lg font-black text-bumble-dark">{(treatment_rate * 100).toFixed(1)}%</div>
          <div className="text-[10px] text-bumble-dark/70 font-semibold">Treatment</div>
          <div className="text-[9px] text-gray-400">CIL-ranked</div>
        </div>
        <div className={`rounded-xl p-2.5 text-center ${exceedsTarget ? 'bg-green-50' : 'bg-orange-50'}`}>
          <div className={`text-lg font-black ${exceedsTarget ? 'text-green-600' : 'text-orange-500'}`}>+{lift_pct.toFixed(1)}%</div>
          <div className="text-[10px] text-gray-500 font-semibold">Lift</div>
          <div className="text-[9px] text-gray-400">vs baseline</div>
        </div>
      </div>
      <div className={`rounded-xl p-2.5 text-center text-xs font-bold ${exceedsTarget ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
        CEO Target: +20.0% — {exceedsTarget ? 'Target Achieved' : 'Needs Tuning'}
      </div>
    </div>
  );
}

export default function ModelDashboard() {
  const { roc_auc, pr_auc, cv_auc_mean, cv_auc_std, precision, recall, f1, positive_rate, train_size, test_size } = MODEL_METRICS;

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="bg-bumble-gold rounded-2xl p-4 shadow-lg">
        <h2 className="text-bumble-dark text-base font-black mb-2">
          Bumble Inc. — Conversation Initiation Likelihood (CIL) Model
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: 'ROC-AUC', value: roc_auc.toFixed(4) },
            { label: 'PR-AUC', value: pr_auc.toFixed(4) },
            { label: '5-Fold CV AUC', value: `${cv_auc_mean.toFixed(4)} ±${cv_auc_std.toFixed(4)}` },
            { label: 'Positive Rate', value: `${(positive_rate * 100).toFixed(1)}%` },
          ].map((m) => (
            <div key={m.label} className="bg-white/40 rounded-xl p-2.5 text-center">
              <div className="text-bumble-dark font-black text-sm">{m.value}</div>
              <div className="text-bumble-dark/70 text-[10px] font-semibold">{m.label}</div>
            </div>
          ))}
        </div>
        <div className="mt-2 text-[11px] text-bumble-dark/70 text-center">
          XGBoost + Platt Calibration &nbsp;|&nbsp; Train: {train_size.toLocaleString()} &nbsp;|&nbsp; Test: {test_size.toLocaleString()}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: 'Precision', value: precision, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Recall', value: recall, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'F1 Score', value: f1, color: 'text-bumble-dark', bg: 'bg-bumble-light' },
        ].map((m) => (
          <div key={m.label} className={`${m.bg} rounded-2xl p-4 text-center shadow`}>
            <div className={`text-3xl font-black ${m.color}`}>{(m.value * 100).toFixed(0)}%</div>
            <div className="text-xs text-gray-500 font-semibold mt-0.5">{m.label}</div>
            <div className="text-[10px] text-gray-400">Conv Started class</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ROCCurve />
        <PRCurve />
      </div>

      <FeatureImportanceChart />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ConfusionMatrix />
        <ABLiftCard />
      </div>

      <div className="bg-white rounded-2xl shadow p-4">
        <h4 className="text-xs font-black text-bumble-dark uppercase tracking-wider mb-3">Model Architecture</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
          {[
            ['XGBoost', 'n_estimators=300'],
            ['Max Depth', '4'],
            ['Learning Rate', '0.05'],
            ['Calibration', 'Platt (Sigmoid)'],
          ].map(([name, value]) => (
            <div key={name} className="bg-gray-50 rounded-xl p-2.5">
              <div className="text-xs font-black text-bumble-dark">{name}</div>
              <div className="text-[10px] text-gray-500 font-mono mt-0.5">{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
