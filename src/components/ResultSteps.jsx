const INF = 1e9;
const PATH_COLORS = ["#EF9F27", "#378ADD", "#E0598B", "#7C5CD6", "#1D9E75", "#D64545"];

function fmt(val) {
  if (val >= INF || val <= -INF) return "∞";
  return val % 1 === 0 ? String(val) : val.toFixed(2);
}

export default function ResultSteps({ steps, finalVals, paths, n, mode }) {
  const isMin = mode === "min";
  const WORST = isMin ? INF : -INF;
  const optVal = finalVals[0];
  const noPath = optVal === WORST || paths.length === 0;

  return (
    <section className="results-section">
      <h2 className="section-title">Résultats des itérations</h2>

      <div className="steps-grid">
        {steps.map((step) => (
          <div key={step.k} className="step-card">
            <div className="step-header">Étape k = {step.k}</div>
            <table className="step-table">
              <thead>
                <tr>
                  <th>Sommet</th>
                  <th>V<sub>i</sub>({step.k})</th>
                  <th>j*</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: n }, (_, i) => {
                  const val = step.vals[i];
                  const changed = step.prev && step.prev[i] !== val;
                  return (
                    <tr key={i} className={i === n-1 ? "row-dst" : changed ? "row-changed" : ""}>
                      <td>x{i+1}</td>
                      <td>{fmt(val)}</td>
                      <td>
                        {i === n-1 ? "—"
                          : step.choices?.[i] != null ? `x${step.choices[i]+1}` : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {noPath ? (
        <div className="path-result no-path">
          <span>Aucun chemin de x1 vers x{n} trouvé.</span>
        </div>
      ) : (
        <div className="paths-list">
          <div className="paths-list-header">
            <span className="path-label">Valeur {isMin ? "minimale" : "maximale"} :</span>
            <span className="path-val">{fmt(optVal)}</span>
            <span className="path-sep">·</span>
            <span className="path-label">
              {paths.length} chemin{paths.length > 1 ? "s" : ""} optimal{paths.length > 1 ? "ux" : ""} trouvé{paths.length > 1 ? "s" : ""}
            </span>
          </div>
          {paths.map((path, pi) => (
            <div key={pi} className="path-result path-result-item" style={{ borderLeftColor: PATH_COLORS[pi % PATH_COLORS.length] }}>
              <span
                className="path-dot"
                style={{ background: PATH_COLORS[pi % PATH_COLORS.length] }}
              />
              <span className="path-label-small">Chemin {pi + 1} :</span>
              <span className="path-nodes">
                {path.map((idx, k) => (
                  <span key={k}>
                    {k > 0 && <span className="arrow"> → </span>}
                    <span className={idx === 0 || idx === n-1 ? "node-hl" : ""}>x{idx+1}</span>
                  </span>
                ))}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
