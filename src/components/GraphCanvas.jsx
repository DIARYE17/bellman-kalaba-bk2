import { useEffect, useRef } from "react";

const INF = 1e9;

const PATH_COLORS = ["#EF9F27", "#378ADD", "#E0598B", "#7C5CD6", "#1D9E75", "#D64545"];

function buildLayers(n) {
  if (n <= 1) return [[0]];
  if (n === 2) return [[0], [1]];
  const MAX_PER_COL = 4;
  const middle = n - 2;
  const numCols = Math.ceil(middle / MAX_PER_COL);
  const layers = [[0]];
  for (let c = 0; c < numCols; c++) {
    const col = [];
    for (let r = 0; r < MAX_PER_COL; r++) {
      const idx = c * MAX_PER_COL + r + 1;
      if (idx <= n - 2) col.push(idx);
    }
    layers.push(col);
  }
  layers.push([n - 1]);
  return layers;
}

function canvasHeight(n) {
  const maxInCol = Math.min(Math.max(0, n - 2), 4);
  return Math.max(300, maxInCol * 90 + 80);
}

function computePositions(n, W, H) {
  const layers = buildLayers(n);
  const positions = new Array(n);
  const padX = 60, padY = 50;
  const layerX = layers.length === 1
    ? [W / 2]
    : layers.map((_, li) => padX + (li / (layers.length - 1)) * (W - 2 * padX));
  for (let li = 0; li < layers.length; li++) {
    const group = layers[li];
    const cx = layerX[li];
    for (let ri = 0; ri < group.length; ri++) {
      const cy = group.length === 1 ? H / 2 : padY + (ri / (group.length - 1)) * (H - 2 * padY);
      positions[group[ri]] = { x: cx, y: cy };
    }
  }
  return positions;
}

function drawArrow(ctx, x1, y1, x2, y2, color, lw, label, curved, curveOffset = 0) {
  const dx = x2 - x1, dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 1) return;
  const R = 22;
  const sx = x1 + (dx / dist) * R, sy = y1 + (dy / dist) * R;
  const ex = x2 - (dx / dist) * R, ey = y2 - (dy / dist) * R;
  const perp = { x: -dy / dist, y: dx / dist };
  const bend = curved ? 26 + curveOffset : curveOffset;
  const cpx = (sx + ex) / 2 + perp.x * bend;
  const cpy = (sy + ey) / 2 + perp.y * bend;

  ctx.beginPath();
  ctx.moveTo(sx, sy);
  if (bend !== 0) ctx.quadraticCurveTo(cpx, cpy, ex, ey);
  else ctx.lineTo(ex, ey);
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.stroke();

  const t = 0.92;
  const tx = bend !== 0 ? (1-t)*(1-t)*sx + 2*(1-t)*t*cpx + t*t*ex : sx + t*(ex-sx);
  const ty = bend !== 0 ? (1-t)*(1-t)*sy + 2*(1-t)*t*cpy + t*t*ey : sy + t*(ey-sy);
  const angle = Math.atan2(ey - ty, ex - tx);
  ctx.beginPath();
  ctx.moveTo(ex, ey);
  ctx.lineTo(ex - 12*Math.cos(angle-0.42), ey - 12*Math.sin(angle-0.42));
  ctx.lineTo(ex - 12*Math.cos(angle+0.42), ey - 12*Math.sin(angle+0.42));
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();

  if (label !== null && label !== undefined) {
    const lx = (sx + ex) / 2 + perp.x * (bend + 15);
    const ly = (sy + ey) / 2 + perp.y * (bend + 15);
    const txt = label % 1 === 0 ? String(label) : label.toFixed(1);
    ctx.font = "700 12px system-ui";
    const tw = ctx.measureText(txt).width;
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.beginPath();
    ctx.roundRect(lx - tw/2 - 4, ly - 9, tw + 8, 18, 4);
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(txt, lx, ly);
  }
}

function drawNode(ctx, x, y, label, type, isDark, nodeR) {
  const palette = {
    src: { fill: isDark ? "#1D9E75" : "#E1F5EE", stroke: "#1D9E75", text: isDark ? "#fff" : "#085041" },
    dst: { fill: isDark ? "#0F6E56" : "#D4EDE6", stroke: "#0F6E56", text: isDark ? "#fff" : "#04342C" },
    mid: { fill: isDark ? "#3C3489" : "#E6F1FB", stroke: isDark ? "#7F77DD" : "#185FA5", text: isDark ? "#B5D4F4" : "#0C447C" },
  };
  const c = palette[type];
  ctx.beginPath();
  ctx.arc(x, y + 2, nodeR, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0,0,0,0.08)";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, y, nodeR, 0, Math.PI * 2);
  ctx.fillStyle = c.fill;
  ctx.fill();
  ctx.strokeStyle = c.stroke;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.font = `700 ${nodeR >= 18 ? 13 : 11}px system-ui`;
  ctx.fillStyle = c.text;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, x, y);
}

export default function GraphCanvas({ n, arcs, paths = [] }) {
  const canvasRef = useRef(null);
  const H = canvasHeight(n);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const DPR = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth || 500;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    const ctx = canvas.getContext("2d");
    ctx.scale(DPR, DPR);

    const isDark = matchMedia("(prefers-color-scheme: dark)").matches;
    const positions = computePositions(n, W, H);
    const nodeR = n <= 10 ? 22 : n <= 15 ? 17 : 14;

    // Pour chaque arc (i,j), liste des index de chemins optimaux qui l'empruntent
    const arcToPathIdx = new Map(); // "i-j" -> [pathIdx, ...]
    paths.forEach((p, pi) => {
      for (let k = 0; k + 1 < p.length; k++) {
        const key = `${p[k]}-${p[k+1]}`;
        if (!arcToPathIdx.has(key)) arcToPathIdx.set(key, []);
        arcToPathIdx.get(key).push(pi);
      }
    });

    const arcSet = new Set(arcs.map(a => `${a.from}-${a.to}`));
    const edgeColor = isDark ? "#888780" : "#B4B2A9";

    // 1) Dessiner les arcs non optimaux d'abord (en gris, dessous)
    for (const arc of arcs) {
      const key = `${arc.from}-${arc.to}`;
      if (arcToPathIdx.has(key)) continue;
      const hasBoth = arcSet.has(`${arc.to}-${arc.from}`);
      drawArrow(
        ctx,
        positions[arc.from].x, positions[arc.from].y,
        positions[arc.to].x,   positions[arc.to].y,
        edgeColor, 1.5, arc.val, hasBoth, 0
      );
    }

    // 2) Dessiner les arcs optimaux, avec décalage si plusieurs chemins partagent / overlapent
    for (const arc of arcs) {
      const key = `${arc.from}-${arc.to}`;
      const pathIdxs = arcToPathIdx.get(key);
      if (!pathIdxs) continue;
      const hasBoth = arcSet.has(`${arc.to}-${arc.from}`);
      // Si l'arc appartient à plusieurs chemins simultanément, on le dessine une fois en couleur du 1er chemin
      // mais avec un offset différent par chemin pour bien voir tous les tracés qui se chevauchent
      pathIdxs.forEach((pi, order) => {
        const color = PATH_COLORS[pi % PATH_COLORS.length];
        const offset = (order - (pathIdxs.length - 1) / 2) * 10;
        drawArrow(
          ctx,
          positions[arc.from].x, positions[arc.from].y,
          positions[arc.to].x,   positions[arc.to].y,
          color, 3, arc.val, hasBoth, offset
        );
      });
    }

    for (let i = 0; i < n; i++) {
      const type = i === 0 ? "src" : i === n - 1 ? "dst" : "mid";
      drawNode(ctx, positions[i].x, positions[i].y, `x${i+1}`, type, isDark, nodeR);
    }
  }, [n, arcs, paths, H]);

  return (
    <div className="graph-wrapper">
      <canvas ref={canvasRef} style={{ width: "100%", height: H, display: "block" }} />
      <div className="graph-legend">
        <span className="leg src-leg">x1 — origine</span>
        <span className="leg dst-leg">x{n} — destination</span>
        <span className="leg mid-leg">intermédiaire</span>
        {paths.map((_, i) => (
          <span
            key={i}
            className="leg path-leg"
            style={{
              background: `${PATH_COLORS[i % PATH_COLORS.length]}22`,
              color: PATH_COLORS[i % PATH_COLORS.length],
            }}
          >
            chemin {i + 1}
          </span>
        ))}
      </div>
    </div>
  );
}
