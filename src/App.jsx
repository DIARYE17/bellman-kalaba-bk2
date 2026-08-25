import { useState } from "react";
import AddArcForm from "./components/AddArcForm";
import GraphCanvas from "./components/GraphCanvas";
import ResultSteps from "./components/ResultSteps";

const INF = 1e9;
const EPS = 1e-6;

// ── Algorithme ──────────────────────────────────────────────
function arcsToMatrix(arcs, n) {
  const m = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 0 : INF))
  );
  for (const { from, to, val } of arcs) {
    if (from >= 0 && from < n && to >= 0 && to < n) m[from][to] = val;
  }
  return m;
}

function runBellmanKalaba(arcs, n, mode) {
  const isMin = mode === "min";
  const WORST = isMin ? INF : -INF;
  const matrix = arcsToMatrix(arcs, n);

  // k=1 : Vi(1) = v(i, n) si l'arc existe, sinon WORST.
  let Vk = matrix.map((row, i) => {
    if (i === n - 1) return 0;
    const direct = row[n - 1];
    return direct >= INF ? WORST : direct;
  });
  const steps = [{ k: 1, vals: [...Vk], choices: new Array(n).fill(null), prev: null }];

  for (let k = 2; k <= n - 1; k++) {
    const Vk1 = [...Vk];
    const choices = new Array(n).fill(null);
    for (let i = 0; i < n - 1; i++) {
      let best = WORST, bestJ = null;
      for (let j = 0; j < n; j++) {
        const arc = matrix[i][j];
        if (arc >= INF) continue;
        const prev = Vk[j];
        if (prev === WORST) continue;
        const cand = arc + prev;
        if (isMin ? cand < best : cand > best) { best = cand; bestJ = j; }
      }
      if (bestJ !== null && (isMin ? best < Vk1[i] : best > Vk1[i])) {
        Vk1[i] = best; choices[i] = bestJ;
      }
    }
    steps.push({ k, vals: [...Vk1], choices, prev: [...Vk] });
    if (Vk1.every((v, i) => v === Vk[i])) break;
    Vk = Vk1;
  }

  const finalVals = steps[steps.length - 1].vals;
  const allPaths = findAllOptimalPaths(matrix, finalVals, n, isMin);

  return { steps, finalVals, paths: allPaths };
}

/**
 * Recherche en profondeur de TOUS les chemins simples de x1 à xn dont la
 * somme des valeurs d'arcs est égale à la valeur optimale finalVals[0].
 *
 * IMPORTANT : on ne peut PAS élaguer une branche seulement parce que la
 * somme partielle est < target (cas max) ou > target (cas min), car la
 * somme se construit progressivement en ajoutant des arcs positifs ou
 * négatifs au fil du chemin — une somme partielle "trop petite" en max
 * peut très bien grandir ensuite jusqu'à atteindre exactement la cible.
 * Le seul élagage valide et sûr est sur la borne déjà connue Vj pour
 * chaque sommet intermédiaire (cf. variante avec bornes ci-dessous) ;
 * à défaut, on fait une recherche exhaustive (le graphe reste petit).
 */
function findAllOptimalPaths(matrix, finalVals, n, isMin, maxPaths = 20) {
  const WORST = isMin ? INF : -INF;
  const target = finalVals[0];
  if (target === WORST) return [];

  const tol = Math.max(1, Math.abs(target)) * 1e-6;
  const results = [];
  const visited = new Array(n).fill(false);
  const currentPath = [0];
  visited[0] = true;

  function dfs(node, accSum) {
    if (results.length >= maxPaths) return;

    if (node === n - 1) {
      if (Math.abs(accSum - target) < tol) {
        results.push([...currentPath]);
      }
      return;
    }

    for (let j = 0; j < n; j++) {
      if (visited[j]) continue;
      const arc = matrix[node][j];
      if (arc >= INF) continue;

      const newSum = accSum + arc;

      // Élagage sûr : si même en empruntant la MEILLEURE continuation
      // connue depuis xj (= finalVals[j], qui représente déjà le
      // min/max optimal de xj vers xn) on ne peut pas atteindre la
      // cible, alors cette branche est inutile.
      const remainingBest = finalVals[j];
      if (remainingBest === WORST) continue; // xj n'atteint jamais xn

      const bestPossible = newSum + remainingBest;
      if (isMin && bestPossible > target + tol) continue;
      if (!isMin && bestPossible < target - tol) continue;

      visited[j] = true;
      currentPath.push(j);
      dfs(j, newSum);
      currentPath.pop();
      visited[j] = false;

      if (results.length >= maxPaths) return;
    }
  }

  dfs(0, 0);
  return results;
}

export default function App() {
  const [n, setN]           = useState(5);
  const [arcs, setArcs]     = useState([]);
  const [mode, setMode]     = useState("min");
  const [result, setResult] = useState(null);
  const [error, setError]   = useState("");

  function handleAdd(from, to, valStr) {
    const val = parseFloat(valStr);
    if (isNaN(val)) return;
    setArcs(prev => {
      const filtered = prev.filter(a => !(a.from === from && a.to === to));
      return [...filtered, { from, to, val }];
    });
    setResult(null);
  }

  function handleRemove(idx) {
    setArcs(prev => prev.filter((_, i) => i !== idx));
    setResult(null);
  }

  function handleNChange(newN) {
    setN(newN);
    setArcs(prev => prev.filter(a => a.from < newN && a.to < newN));
    setResult(null);
  }

  function run() {
    if (arcs.length === 0) { setError("Ajoutez au moins un arc avant de lancer."); return; }
    setError("");
    setResult(runBellmanKalaba(arcs, n, mode));
  }

  return (
    <div className="app">
      <header>
        <h1>Bellman – Kalaba</h1>
        <p className="subtitle">Chemin de valeur optimale dans un graphe orienté valué</p>
      </header>

      <main>
        <div className="steps-layout">

          {/* ── ÉTAPE 1 : Nombre de sommets ── */}
          <div className="step-panel">
            <div className="step-label">
              <span className="step-num">1</span>
              <span>Nombre de sommets</span>
            </div>
            <div className="step-body">
              <p className="step-hint">
                Choisissez n. <strong>x1</strong> est l'origine, <strong>x{n}</strong> est la destination.
              </p>
              <div className="n-row">
                <input
                  type="number"
                  min={2}
                  value={n}
                  onChange={e => handleNChange(Math.max(2, +e.target.value))}
                  className="n-big-input"
                />
                <span className="n-desc">sommets — de x1 à x{n}</span>
              </div>
            </div>
          </div>

          {/* ── ÉTAPE 2 : Saisie des arcs ── */}
          <div className="step-panel">
            <div className="step-label">
              <span className="step-num">2</span>
              <span>Saisir les arcs du graphe</span>
            </div>
            <AddArcForm n={n} arcs={arcs} onAdd={handleAdd} onRemove={handleRemove} />
          </div>

          {/* ── ÉTAPE 3 : Min ou Max ── */}
          <div className="step-panel">
            <div className="step-label">
              <span className="step-num">3</span>
              <span>Type d'optimisation</span>
            </div>
            <div className="step-body">
              <p className="step-hint">Cherche-t-on le chemin de valeur minimale ou maximale ?</p>
              <div className="mode-cards">
                <div
                  className={`mode-card ${mode === "min" ? "mode-card-active" : ""}`}
                  onClick={() => { setMode("min"); setResult(null); }}
                >
                  <div className="mode-card-icon">↓</div>
                  <div className="mode-card-title">Minimum</div>
                  <div className="mode-card-desc">Plus court chemin, coût minimal, distance minimale…</div>
                </div>
                <div
                  className={`mode-card ${mode === "max" ? "mode-card-active" : ""}`}
                  onClick={() => { setMode("max"); setResult(null); }}
                >
                  <div className="mode-card-icon">↑</div>
                  <div className="mode-card-title">Maximum</div>
                  <div className="mode-card-desc">Chemin le plus long, profit maximal, capacité maximale…</div>
                </div>
              </div>
            </div>
          </div>

          {/* ── ÉTAPE 4 : Lancer ── */}
          <div className="step-panel step-panel-launch">
            <div className="step-label">
              <span className="step-num">4</span>
              <span>Lancer l'algorithme</span>
            </div>
            <div className="step-body">
              <p className="step-hint">
                {arcs.length} arc{arcs.length > 1 ? "s" : ""} saisi{arcs.length > 1 ? "s" : ""} · {n} sommets · mode {mode === "min" ? "minimum" : "maximum"}
              </p>
              {error && <p className="launch-error">{error}</p>}
              <button className="btn-launch" onClick={run}>
                ▶ Lancer Bellman-Kalaba
              </button>
            </div>
          </div>

        </div>

        {/* ── GRAPHE ── */}
        <div className="graph-section">
          <h2 className="section-title">
            Graphe
            {result && result.paths.length > 0 && (
              <span className="graph-subtitle">
                {" — "}{result.paths.length} chemin{result.paths.length > 1 ? "s" : ""} optimal{result.paths.length > 1 ? "ux" : ""} en surbrillance
              </span>
            )}
          </h2>
          <GraphCanvas n={n} arcs={arcs} paths={result?.paths ?? []} />
        </div>

        {/* ── RÉSULTATS ── */}
        {result && (
          <ResultSteps
            steps={result.steps}
            finalVals={result.finalVals}
            paths={result.paths}
            n={n}
            mode={mode}
          />
        )}
      </main>
    </div>
  );
}
