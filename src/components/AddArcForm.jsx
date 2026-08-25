import { useState } from "react";

export default function AddArcForm({ n, arcs, onAdd, onRemove }) {
  const [from, setFrom]       = useState("1");
  const [to, setTo]           = useState("2");
  const [val, setVal]         = useState("");
  const [error, setError]     = useState("");
  const [editingIdx, setEditingIdx] = useState(null); // index de la ligne en cours d'édition
  const [editFrom, setEditFrom]     = useState("");
  const [editTo, setEditTo]         = useState("");
  const [editVal, setEditVal]       = useState("");
  const [editError, setEditError]   = useState("");

  const nodeOptions = Array.from({ length: n }, (_, i) => i + 1);

  // ── Ajouter un arc ──
  function handleAdd() {
    const f = parseInt(from);
    const t = parseInt(to);
    const v = parseFloat(val);
    if (isNaN(f) || f < 1 || f > n) { setError(`Origine doit être entre 1 et ${n}`); return; }
    if (isNaN(t) || t < 1 || t > n) { setError(`Destination doit être entre 1 et ${n}`); return; }
    if (f === t) { setError("Origine et destination doivent être différents"); return; }
    if (isNaN(v)) { setError("La valeur doit être un nombre"); return; }
    setError("");
    onAdd(f - 1, t - 1, String(v));
    setVal("");
  }

  function handleAddKey(e) { if (e.key === "Enter") handleAdd(); }

  // ── Ouvrir l'édition d'une ligne ──
  function startEdit(idx) {
    const arc = arcs[idx];
    setEditingIdx(idx);
    setEditFrom(String(arc.from + 1));
    setEditTo(String(arc.to + 1));
    setEditVal(String(arc.val));
    setEditError("");
  }

  function cancelEdit() {
    setEditingIdx(null);
    setEditError("");
  }

  // ── Valider la modification ──
  function commitEdit(idx) {
    const f = parseInt(editFrom);
    const t = parseInt(editTo);
    const v = parseFloat(editVal);
    if (isNaN(f) || f < 1 || f > n) { setEditError(`Origine entre 1 et ${n}`); return; }
    if (isNaN(t) || t < 1 || t > n) { setEditError(`Destination entre 1 et ${n}`); return; }
    if (f === t) { setEditError("Origine ≠ destination"); return; }
    if (isNaN(v)) { setEditError("Valeur invalide"); return; }
    // Supprimer l'ancienne entrée et ajouter la nouvelle
    onRemove(idx);
    // onRemove décale les indices — on re-ajoute via onAdd
    // On utilise setTimeout pour laisser React mettre à jour arcs
    setTimeout(() => onAdd(f - 1, t - 1, String(v)), 0);
    setEditingIdx(null);
    setEditError("");
  }

  function handleEditKey(e, idx) {
    if (e.key === "Enter") commitEdit(idx);
    if (e.key === "Escape") cancelEdit();
  }

  return (
    <div className="arc-form">
      <p className="arc-form-hint">
        Entrez chaque arc : origine, destination et valeur.
      </p>

      {/* ── Ligne de saisie ── */}
      <div className="arc-input-row">
        <div className="arc-field">
          <label>Origine</label>
          <select value={from} onChange={e => { setFrom(e.target.value); setError(""); }}>
            {nodeOptions.map(i => <option key={i} value={i}>x{i}</option>)}
          </select>
        </div>
        <div className="arc-arrow-icon">→</div>
        <div className="arc-field">
          <label>Destination</label>
          <select value={to} onChange={e => { setTo(e.target.value); setError(""); }}>
            {nodeOptions.map(i => <option key={i} value={i}>x{i}</option>)}
          </select>
        </div>
        <div className="arc-field arc-field-val">
          <label>Valeur</label>
          <input
            type="number"
            value={val}
            onChange={e => { setVal(e.target.value); setError(""); }}
            onKeyDown={handleAddKey}
            placeholder="ex: 5"
          />
        </div>
        <button className="btn-add-arc" onClick={handleAdd}>+ Ajouter</button>
      </div>
      {error && <p className="arc-error">{error}</p>}

      {/* ── Tableau des arcs ── */}
      {arcs.length > 0 ? (
        <div className="arc-table-wrap">
          {editError && <p className="arc-error" style={{padding:"6px 10px",margin:0}}>{editError}</p>}
          <table className="arc-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Origine</th>
                <th></th>
                <th>Destination</th>
                <th>Valeur</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {arcs.map((arc, idx) => (
                editingIdx === idx
                  ? /* ── Ligne en édition ── */
                  <tr key={idx} className="row-editing">
                    <td className="arc-idx">{idx + 1}</td>
                    <td>
                      <select
                        className="edit-select"
                        value={editFrom}
                        onChange={e => { setEditFrom(e.target.value); setEditError(""); }}
                        onKeyDown={e => handleEditKey(e, idx)}
                        autoFocus
                      >
                        {nodeOptions.map(i => <option key={i} value={i}>x{i}</option>)}
                      </select>
                    </td>
                    <td className="arc-arr">→</td>
                    <td>
                      <select
                        className="edit-select"
                        value={editTo}
                        onChange={e => { setEditTo(e.target.value); setEditError(""); }}
                        onKeyDown={e => handleEditKey(e, idx)}
                      >
                        {nodeOptions.map(i => <option key={i} value={i}>x{i}</option>)}
                      </select>
                    </td>
                    <td>
                      <input
                        className="edit-input"
                        type="number"
                        value={editVal}
                        onChange={e => { setEditVal(e.target.value); setEditError(""); }}
                        onKeyDown={e => handleEditKey(e, idx)}
                      />
                    </td>
                    <td>
                      <div className="edit-actions">
                        <button className="btn-confirm" onClick={() => commitEdit(idx)} title="Valider">✓</button>
                        <button className="btn-cancel-edit" onClick={cancelEdit} title="Annuler">✕</button>
                      </div>
                    </td>
                  </tr>
                  : /* ── Ligne normale ── */
                  <tr key={idx} className={editingIdx !== null && editingIdx !== idx ? "row-dimmed" : ""}>
                    <td className="arc-idx">{idx + 1}</td>
                    <td><span className="node-chip src-chip">x{arc.from + 1}</span></td>
                    <td className="arc-arr">→</td>
                    <td><span className="node-chip dst-chip">x{arc.to + 1}</span></td>
                    <td className="arc-val-cell">{arc.val}</td>
                    <td>
                      <button
                        className="btn-edit"
                        onClick={() => startEdit(idx)}
                        disabled={editingIdx !== null}
                        title="Modifier cet arc"
                      >
                        ✎ Modifier
                      </button>
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="arc-empty">Aucun arc saisi. Ajoutez des arcs ci-dessus.</div>
      )}
    </div>
  );
}
