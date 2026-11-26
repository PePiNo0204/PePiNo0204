// Genera los radares SVG de autoevaluación a partir de skills.json
import { readFileSync, writeFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync(new URL("../skills.json", import.meta.url)));
const W = 560, H = 380, cx = W / 2, cy = 205, R = 115, MAX = 10;
const pt = (i, n, r) => { const a = -Math.PI / 2 + (2 * Math.PI * i) / n; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
const poly = (pts) => pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
for (const r of cfg.radars) {
  const e = Object.entries(r.skills), n = e.length;
  const grid = [2, 4, 6, 8, 10].map((l) => `<polygon points="${poly(e.map((_, i) => pt(i, n, (R * l) / MAX)))}" fill="none" stroke="#30363d"/>`).join("");
  const axes = e.map((_, i) => { const [x, y] = pt(i, n, R); return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#30363d"/>`; }).join("");
  const vals = e.map(([, v], i) => pt(i, n, (R * Math.min(v, MAX)) / MAX));
  const labels = e.map(([k, v], i) => { const [x, y] = pt(i, n, R + 26); const anchor = Math.abs(x - cx) < 5 ? "middle" : x > cx ? "start" : "end";
    return `<text x="${x}" y="${y}" text-anchor="${anchor}" dominant-baseline="middle" fill="#c9d1d9" font-size="12">${esc(k)} <tspan fill="${r.color}">${v}</tspan></text>`; }).join("");
  const dots = vals.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.5" fill="${r.color}"/>`).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Segoe UI, Ubuntu, sans-serif">
<rect width="${W}" height="${H}" rx="10" fill="#0d1117" stroke="#30363d"/>
<text x="20" y="32" fill="${r.color}" font-size="16" font-weight="600" font-family="Consolas, monospace">~/skills/${esc(r.title.toLowerCase().replace(/\s+/g, "_"))}</text>
${grid}${axes}<polygon points="${poly(vals)}" fill="${r.color}" fill-opacity="0.25" stroke="${r.color}" stroke-width="2"/>${dots}${labels}
</svg>`;
  writeFileSync(new URL(`../assets/${r.file}`, import.meta.url), svg);
  console.log("ok", r.file);
}
