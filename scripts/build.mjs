// Genera los SVG del perfil (whoami + radares, tema claro y oscuro) desde skills.json
import { readFileSync, writeFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync(new URL("../skills.json", import.meta.url)));
const out = (f, s) => { writeFileSync(new URL(`../assets/${f}`, import.meta.url), s); console.log("ok", f); };
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const themes = {
  dark: { bg: "#0d1117", border: "#30363d", grid: "#30363d", text: "#e6edf3", muted: "#8b949e" },
  light: { bg: "#ffffff", border: "#d0d7de", grid: "#d0d7de", text: "#1f2328", muted: "#57606a" },
};
const FONT = `font-family="JetBrains Mono, Consolas, monospace"`;
for (const [mode, t] of Object.entries(themes)) {
  // whoami
  const w = cfg.whoami, W = 960, lh = 30, H = 110 + w.lines.length * lh;
  const rows = w.lines.map(([k, v], i) => `<text x="40" y="${118 + i * lh}" font-size="17"><tspan fill="#22c55e">${esc(k.padEnd(12))}</tspan><tspan fill="${t.muted}">: </tspan><tspan fill="${t.text}">${esc(v)}</tspan></text>`).join("");
  out(`whoami-${mode}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" ${FONT} xml:space="preserve">
<rect width="${W}" height="${H}" rx="12" fill="${t.bg}" stroke="${t.border}"/>
<circle cx="28" cy="26" r="7" fill="#ff5f57"/><circle cx="50" cy="26" r="7" fill="#febc2e"/><circle cx="72" cy="26" r="7" fill="#28c840"/>
<text x="${W / 2}" y="31" text-anchor="middle" fill="${t.muted}" font-size="14">bash — ${esc(w.user)}</text>
<line x1="0" y1="48" x2="${W}" y2="48" stroke="${t.border}"/>
<text x="40" y="82" font-size="17"><tspan fill="#22c55e">${esc(w.user)}</tspan><tspan fill="${t.text}">:~$ whoami --verbose</tspan></text>
${rows}
<text x="40" y="${H - 18}" font-size="17" fill="#22c55e">▌<animate attributeName="opacity" values="1;0;1" dur="1.1s" repeatCount="indefinite"/></text>
</svg>`);
  // radares
  for (const r of cfg.radars) {
    const RW = 480, RH = 420, cx = RW / 2, cy = 225, R = 125, MAX = 10;
    const e = Object.entries(r.skills), n = e.length;
    const pt = (i, rad) => { const a = -Math.PI / 2 + (2 * Math.PI * i) / n; return [cx + rad * Math.cos(a), cy + rad * Math.sin(a)]; };
    const poly = (p) => p.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
    const grid = [2, 4, 6, 8, 10].map((l) => `<polygon points="${poly(e.map((_, i) => pt(i, (R * l) / MAX)))}" fill="none" stroke="${t.grid}"/>`).join("");
    const axes = e.map((_, i) => { const [x, y] = pt(i, R); return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="${t.grid}"/>`; }).join("");
    const vals = e.map(([, v], i) => pt(i, (R * Math.min(v, MAX)) / MAX));
    const labels = e.map(([k, v], i) => { const [x, y] = pt(i, R + 22); const a = Math.abs(x - cx) < 5 ? "middle" : x > cx ? "start" : "end";
      return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="${a}" dominant-baseline="middle" fill="${t.text}" font-size="12">${esc(k)} <tspan fill="${r.color}" font-weight="700">${v}</tspan></text>`; }).join("");
    const dots = vals.map(([x, y]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.5" fill="${r.color}"/>`).join("");
    out(`${r.name}-${mode}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" width="${RW}" height="${RH}" viewBox="0 0 ${RW} ${RH}" ${FONT}>
<rect width="${RW}" height="${RH}" rx="12" fill="${t.bg}" stroke="${t.border}"/>
<text x="20" y="34" fill="${r.color}" font-size="15" font-weight="700">~/signals/${esc(r.title)}</text>
${grid}${axes}<polygon points="${poly(vals)}" fill="${r.color}" fill-opacity="0.22" stroke="${r.color}" stroke-width="2"/>${dots}${labels}
</svg>`);
  }
}
