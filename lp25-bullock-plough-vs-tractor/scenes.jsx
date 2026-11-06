/* global React, window */
// ThinkPro Academy — "Bullock Plough vs Tractor" (Grade 6 Agriculture, Session 25, V1).
// After AG_G6_S25_Video_Script_Bullock_Plough_vs_Tractor (Subrata, 5 Nov 2026): 11 scenes as 11
// narrated beats, three presenter stops (b6, b8, b11: silent holds, the web player freezes there,
// TPStory.StopAt) and one Did-you-know scene (b9). Running idea: RIGHT TOOL, RIGHT FARM (three farmer
// cards, b7–b8). Central model: the same drawn FIELD seen from above, ploughed strip by strip, slowly
// by the bullocks (b3) and fast by the tractor (b4). STORY STYLE (engine/story-kit.jsx).
const { Sprite, Easing } = window;
const { reveal, windowOp } = window.TPMotion;
const { num, str } = window.TPStage;
const { SK, SERIF, SANS, LEFT_W, pop, out3, lerp, drive, Pic, Chip, Badge, Big, Card, SVG, Arrow, T, ChimeAt, Scene, StoryFrame, StopAt, Flip } = window.TPStory;

// ---- Timing: EVERYTHING is keyed to the narration (tools/fit_timing.py → timing.js).
const TM = window.TP_TIMING;
if (!TM) console.error("timing.js missing — run: python3 tools/fit_timing.py videos/lp25-bullock-plough-vs-tractor");
const LEAD = TM ? TM.lead : 1.0;
const DUR = TM ? TM.total : 240;
const BEAT = (id) => TM.beats[id];
function W(id, pat, n = 0, lead = 0.25) {
  let c = 0;
  for (const [w, st] of BEAT(id).words) if (w === pat || w.startsWith(pat)) { if (c++ === n) return LEAD + st - lead; }
  console.warn("cue word not found:", id, pat); return LEAD;
}
const S = (id, i, lead = 0.25) => LEAD + BEAT(id).sentences[i].start - lead;
const SE = (id, i) => LEAD + BEAT(id).sentences[i].end;
function capsFor(id) {
  const rows = [], sents = BEAT(id).sentences;
  sents.forEach((s, si) => s.lines.forEach((ln, li) => {
    const start = LEAD + ln.start - 0.08;
    const end = li < s.lines.length - 1 ? LEAD + s.lines[li + 1].start - 0.08
      : Math.min(LEAD + ln.end + 0.35, sents[si + 1] ? LEAD + sents[si + 1].start - 0.12 : Infinity);
    rows.push([start, end, ln.text]);
  }));
  return rows;
}
const NB = 11;
const CAPS = {};
if (TM) for (let n = 1; n <= NB; n++) CAPS[n] = capsFor("b" + n);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// ---- Panel copy. Title defaults mirror the DC data-props (titleNText) — keep in sync. ----
const TITLES = { 1: "LP25 – Bullock Plough vs Tractor", 2: "The bullock plough", 3: "The catch: bullocks", 4: "The tractor", 5: "The catch: tractors", 6: "Think!",
  7: "Right tool, right farm", 8: "The big question", 9: "Did you know?", 10: "The big idea", 11: "Quick check" };
const KICK = "Grade 6 · Agriculture · Session 25";
const KICKS = { 6: "Stop 1", 8: "Stop 2", 9: "Did you know?", 11: "Stop 3" };
const panel = (n, ctx, lines, extra = {}) => ({ kicker: KICKS[n] || KICK, title: ctx.titles[n], lines, ...extra });
const L = (text, at, kind = "item", extra = {}) => ({ text, at, kind, ...extra });
const YES = (t, at) => L("✔ " + t, at, "plain");
const NO = (t, at) => L("✘ " + t, at, "plain");

// ---- Presenter stops: [beat, sentence index whose pauseAfter is the hold, hold s]
const STOPS = [["b6", 2, 15.0], ["b8", 3, 15.0], ["b11", 3, 15.0]];
const stopAt = (b, i) => SE(b, i) + 0.1;
const stopFor = (b) => STOPS.find((s) => s[0] === b);
const holdOf = (b) => stopFor(b)[2] - 0.2;
const stopStart = (b) => stopAt(b, stopFor(b)[1]);
const stopN = (b) => STOPS.indexOf(stopFor(b)) + 1;

// ---- Shared pieces ---------------------------------------------------------------
const RED = "#D9483B", SOIL_RAW = "#B99468", SOIL_PL = "#5A3B26", WATER = "#5DB7E8", AIR = "#BFE0EE", GRAIN = "#8A5F3C";
function PauseMark({ size = 64 }) {
  return <svg width={size} height={size} viewBox="0 0 90 90" style={{ flex: "none" }}><circle cx="45" cy="45" r="43" fill={SK.gold} /><rect x="28" y="24" width="12" height="42" rx="4" fill={SK.ink} /><rect x="50" y="24" width="12" height="42" rx="4" fill={SK.ink} /></svg>;
}
// Thin "press play" strip for a presenter stop.
function StopNote({ b, lt, x = 40, y = 900, w = 1360 }) {
  const at = stopStart(b), o = windowOp(lt, at - 0.2, at + holdOf(b) + 0.3, 0.35); if (o <= 0) return null;
  return <div style={{ position: "absolute", left: x, top: y, width: w, textAlign: "center", opacity: o, fontFamily: SANS, fontSize: 26, color: SK.dim }}>Stop {stopN(b)} of 3</div>;
}
// The FIELD from above: `rows` strips ploughed in a snake, done = 0→1 of the whole field.
function PlanField({ x, y, w, h, rows = 16, done = 0, head = "bullock", lt = 0, op = 1 }) {
  if (op <= 0) return null;
  const rh = h / rows, total = done * rows, n = Math.floor(total), f = total - n, strips = [];
  for (let i = 0; i < rows; i++) {
    const row = rows - 1 - i, ry = y + row * rh, frac = i < n ? 1 : i === n ? f : 0;
    if (frac <= 0) continue;
    const rx = i % 2 === 0 ? x : x + w * (1 - frac);
    strips.push(<rect key={i} x={rx} y={ry} width={w * frac} height={rh + 0.5} fill={SOIL_PL} />);
    strips.push(<line key={"l" + i} x1={rx} x2={rx + w * frac} y1={ry + rh / 2} y2={ry + rh / 2} stroke="rgba(255,255,255,0.14)" strokeWidth={2} />);
  }
  const hi = Math.min(n, rows - 1), hRow = rows - 1 - hi, hx = hi % 2 === 0 ? x + w * f : x + w * (1 - f), hy = y + hRow * rh + rh / 2;
  return (
    <g opacity={op}>
      <rect x={x} y={y} width={w} height={h} rx={10} fill={SOIL_RAW} />
      {[...Array(9)].map((_, i) => <circle key={i} cx={x + ((i * 173 + 40) % w)} cy={y + ((i * 97 + 30) % h)} r={5} fill="rgba(90,110,50,0.45)" />)}
      {strips}
      <rect x={x} y={y} width={w} height={h} rx={10} stroke={SK.cream} strokeWidth={4} fill="none" />
      {done > 0 && done < 1 && (head === "tractor"
        ? <g transform={`translate(${hx} ${hy})`}><rect x={-26} y={-16} width={52} height={32} rx={6} fill={RED} stroke={SK.white} strokeWidth={3} /><rect x={-20} y={-23} width={14} height={7} fill="#222" /><rect x={-20} y={16} width={14} height={7} fill="#222" /></g>
        : <g transform={`translate(${hx} ${hy})`}><ellipse rx={16} ry={9} fill={SK.cream} stroke={SK.ink} strokeWidth={2.5} /><ellipse cy={-4} rx={4} ry={3} fill={SK.ink} /></g>)}
    </g>
  );
}
// Clock + sun crossing the sky: time racing. `spin` = turns of the minute hand.
function TimeSky({ x, y, w, h, sun, spin, lt, op = 1, label }) {
  if (op <= 0) return null;
  const sx = x + 60 + (w - 330) * sun, sy = y + h - 40 - Math.sin(sun * Math.PI) * (h - 110), cx = x + w - 120, cy = y + h / 2, r = 94, a = spin * 2 * Math.PI;
  return (
    <g opacity={op}>
      <rect x={x} y={y} width={w} height={h} rx={18} fill={`rgb(${lerp(120, 90, sun)},${lerp(190, 140, sun)},${lerp(230, 200, sun)})`} />
      <path d={`M${x + 60} ${y + h - 40} Q ${x + (w - 270) / 2} ${y - 90 + h * 0.15} ${x + w - 270} ${y + h - 40}`} stroke="rgba(255,255,255,0.55)" strokeWidth={3} strokeDasharray="8 10" fill="none" />
      <circle cx={sx} cy={sy} r={38} fill="#FFD25A" stroke="#FFE9A8" strokeWidth={8} />
      <circle cx={cx} cy={cy} r={r} fill={SK.cream} stroke={SK.ink} strokeWidth={7} />
      {[...Array(12)].map((_, i) => { const t = (i / 12) * 2 * Math.PI; return <line key={i} x1={cx + Math.sin(t) * (r - 15)} y1={cy - Math.cos(t) * (r - 15)} x2={cx + Math.sin(t) * (r - 7)} y2={cy - Math.cos(t) * (r - 7)} stroke={SK.ink} strokeWidth={4} />; })}
      <line x1={cx} y1={cy} x2={cx + Math.sin(a / 12) * 46} y2={cy - Math.cos(a / 12) * 46} stroke={SK.ink} strokeWidth={9} strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={cx + Math.sin(a) * 72} y2={cy - Math.cos(a) * 72} stroke={RED} strokeWidth={6} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={8} fill={SK.ink} />
      {label && <T x={x + 26} y={y + 42} anchor="start" size={30} bold color={SK.ink}>{label}</T>}
    </g>
  );
}
// Field + time panel on the right of b3 and b4 (the same picture, so the two can be compared).
const FIELD = { x: 700, y: 400, w: 700, h: 480 };
// Cut-away: the plough blade passes and the hard ground behind it turns into loose furrows.
function PloughCut({ x, y, w, h, k, lt, op = 1 }) {
  if (op <= 0) return null;
  const gy = y + 150, bx = x + 40 + (w - 110) * k;
  const bumps = []; for (let i = 0; x + 40 + i * 62 < bx - 34; i++) bumps.push(i);
  const clods = []; for (let i = 0; i < 44; i++) { const cx = x + 30 + ((i * 83) % (w - 60)), cy = gy + 28 + ((i * 47) % 130); if (cx < bx - 36) clods.push([cx, cy, 11 + (i % 4) * 3]); }
  return (
    <g opacity={op}>
      <defs><clipPath id="lp25cut"><rect x={x} y={y} width={w} height={h} rx={18} /></clipPath></defs>
      <g clipPath="url(#lp25cut)">
        <rect x={x} y={y} width={w} height={h} fill="#A9D4EA" />
        <rect x={x} y={gy} width={w} height={h - 150} fill="#6B4A32" />
        {[...Array(26)].map((_, i) => <circle key={i} cx={x + 20 + ((i * 131) % (w - 40))} cy={gy + 240 + ((i * 59) % (h - 410))} r={5} fill="rgba(0,0,0,0.16)" />)}
        <rect x={x} y={gy} width={Math.max(0, bx - x - 26)} height={190} fill="#9A6E48" />
        {bumps.map((i) => <ellipse key={i} cx={x + 60 + i * 62} cy={gy} rx={34} ry={22} fill="#9A6E48" />)}
        {clods.map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} fill="#7E5636" />)}
        <g transform={`translate(${bx} ${gy})`}>
          <path d="M-8 -130 L 34 -130 L 14 40 L 58 118 L -22 58 Z" fill="#C7CCD1" stroke={SK.ink} strokeWidth={5} strokeLinejoin="round" />
          <rect x={-130} y={-154} width={210} height={26} rx={8} fill="#A9743F" stroke={SK.ink} strokeWidth={4} />
        </g>
      </g>
      <rect x={x} y={y} width={w} height={h} rx={18} stroke="rgba(255,255,255,0.7)" strokeWidth={3} fill="none" />
    </g>
  );
}
// A round wallet-to-bill note that flies along a little arc.
function Note({ x0, y0, x1, y1, lt, at, d = 0.9 }) {
  const p = clamp((lt - at) / d, 0, 1); if (lt < at || p >= 1) return null;
  const e = Easing.easeOutCubic(p), x = lerp(x0, x1, e), y = lerp(y0, y1, e) - Math.sin(p * Math.PI) * 90;
  return <g transform={`translate(${x} ${y}) rotate(${p * 200 - 30})`} opacity={1 - p * p}><rect x={-44} y={-23} width={88} height={46} rx={5} fill="#BFE3B4" stroke="#4E8A49" strokeWidth={3} /><text y={9} textAnchor="middle" fontFamily={SANS} fontWeight="700" fontSize={26} fill="#2E6B2B">₹</text></g>;
}
function Wallet({ x, y }) {
  return <g transform={`translate(${x} ${y})`}><rect x={-120} y={-80} width={240} height={160} rx={22} fill="#7A4A26" stroke={SK.ink} strokeWidth={5} /><path d="M-120 -40 H 120" stroke="#5A3418" strokeWidth={5} /><rect x={60} y={-22} width={74} height={52} rx={14} fill="#A06A3A" stroke={SK.ink} strokeWidth={4} /><circle cx={92} cy={4} r={9} fill={SK.gold} /></g>;
}
function PriceTag({ x, y }) {
  return <g transform={`translate(${x} ${y}) rotate(-8)`}><path d="M-110 -60 H 90 L 140 0 L 90 60 H -110 Z" fill={SK.gold} stroke={SK.ink} strokeWidth={5} strokeLinejoin="round" /><circle cx={94} cy={0} r={11} fill={SK.ink} /><text x={-18} y={22} textAnchor="middle" fontFamily={SERIF} fontWeight="700" fontSize={62} fill={SK.ink}>₹₹₹₹</text></g>;
}
function RepairBill({ x, y }) {
  return <g transform={`translate(${x} ${y}) rotate(4)`}><rect x={-96} y={-124} width={192} height={248} rx={8} fill={SK.cream} stroke={SK.ink} strokeWidth={5} />
    <text y={-80} textAnchor="middle" fontFamily={SERIF} fontWeight="700" fontSize={32} fill={SK.ink}>REPAIR</text>
    {[-52, -14, 24].map((v) => <g key={v}><line x1={-72} x2={22} y1={v} y2={v} stroke={SK.inkLine} strokeWidth={7} /><text x={72} y={v + 9} textAnchor="end" fontFamily={SANS} fontWeight="700" fontSize={24} fill={SK.ink}>₹₹</text></g>)}
    <line x1={-72} x2={72} y1={56} y2={56} stroke={SK.ink} strokeWidth={4} /><text x={72} y={96} textAnchor="end" fontFamily={SANS} fontWeight="700" fontSize={30} fill={RED}>₹₹₹₹₹</text></g>;
}
function Pump({ x, y, lt, at }) {
  const n = Math.max(0, lt - at) * 137.3, d = (v) => String(Math.floor(v) % 10);
  const digits = [d(n / 100), d(n / 10), d(n), d(n * 10)];
  return <g transform={`translate(${x} ${y})`}><rect x={-92} y={-150} width={184} height={300} rx={16} fill={RED} stroke={SK.ink} strokeWidth={5} /><rect x={-70} y={-122} width={140} height={84} rx={8} fill="#10231C" />
    <text y={-62} textAnchor="middle" fontFamily="'Courier New', monospace" fontWeight="700" fontSize={52} fill="#7CF29C">{digits.join("")}</text>
    <text y={18} textAnchor="middle" fontFamily={SERIF} fontWeight="700" fontSize={34} fill={SK.white}>DIESEL</text>
    <path d="M92 -60 C 150 -60, 150 40, 128 80" stroke={SK.ink} strokeWidth={10} fill="none" strokeLinecap="round" /><rect x={112} y={78} width={34} height={58} rx={7} fill={SK.ink} /><rect x={-108} y={150} width={216} height={22} rx={6} fill="#444" /></g>;
}
// Soil cut-away: the tyre rolls across and squeezes the air spaces shut, then a root and a raindrop stall.
function SoilCut({ x, y, w, h, lt, cRoll, cRoots, op = 1 }) {
  if (op <= 0) return null;
  const gy = y + 180, rollP = clamp((lt - cRoll) / 3.2, 0, 1), tx = x - 170 + (w + 340) * rollP, parts = [], sp = 76, cols = Math.ceil(w / sp) + 1, rows = 11;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) parts.push([r, c, (c * 37 + r * 53) % 11 - 5, (c * 29 + r * 71) % 9 - 4]);
  const surf = (px) => clamp((tx - px) / 90, 0, 1);
  const root = out3(lt, cRoots, 1.1), rx = x + w * 0.5, dropP = clamp((lt - cRoots - 0.4) / 0.8, 0, 1), rootLen = 150 * root;
  return (
    <g opacity={op}>
      <defs><clipPath id="lp25soil"><rect x={x} y={y} width={w} height={h} rx={18} /></clipPath></defs>
      <g clipPath="url(#lp25soil)">
        <rect x={x} y={y} width={w} height={h} fill="#A9D4EA" />
        <rect x={x} y={gy} width={w} height={h - 180} fill={AIR} />
        {parts.map(([r, c, jx, jy], i) => { const px0 = x + c * sp + jx + (r % 2) * 38, k = surf(px0), py = gy + 40 + r * sp * lerp(1, 0.84, k) + jy * (1 - k) - 18 * k;
          return <circle key={i} cx={px0} cy={py} r={lerp(30, 48, k)} fill={i % 3 ? "#7E5636" : "#6B4A32"} />; })}
        <g opacity={root}>
          <path d={`M${rx} ${gy - 86} V ${gy}`} stroke="#4E9B47" strokeWidth={9} strokeLinecap="round" />
          <path d={`M${rx} ${gy - 60} q -40 -34 -66 -14 q 34 26 66 14 Z M${rx} ${gy - 76} q 40 -34 66 -14 q -34 26 -66 14 Z`} fill="#62B85A" />
          <path d={`M${rx} ${gy} q -14 ${rootLen * 0.4} 8 ${rootLen * 0.7} q 16 ${rootLen * 0.15} 4 ${rootLen * 0.3}`} stroke="#FFF6DF" strokeWidth={12} strokeLinecap="round" fill="none" />
        </g>
        {dropP > 0 && <g><path transform={`translate(${rx + 230} ${lerp(y + 20, gy - 26, Easing.easeInCubic(dropP))})`} d="M0 -30 C 18 -6, 18 16, 0 18 C -18 16, -18 -6, 0 -30 Z" fill={WATER} stroke="#2E86B8" strokeWidth={3} />
          {dropP >= 1 && <ellipse cx={rx + 230} cy={gy - 8} rx={lerp(30, 110, clamp((lt - cRoots - 1.2) / 2, 0, 1))} ry={12} fill={WATER} stroke="#2E86B8" strokeWidth={2} />}</g>}
        {root >= 1 && <g><path d={`M${rx - 16} ${gy + 150} l 32 32 m 0 -32 l -32 32`} stroke={RED} strokeWidth={9} strokeLinecap="round" /></g>}
        {dropP >= 1 && <path d={`M${rx + 214} ${gy + 26} l 32 32 m 0 -32 l -32 32`} stroke={RED} strokeWidth={9} strokeLinecap="round" />}
        {rollP > 0 && rollP < 1 && <g transform={`translate(${tx} ${gy - 120})`}>
          <circle r={158} fill="#1E1E1E" />
          <g transform={`rotate(${rollP * 720})`}>{[...Array(14)].map((_, i) => <rect key={i} x={-13} y={-168} width={26} height={30} rx={4} fill="#333" transform={`rotate(${i * 360 / 14})`} />)}</g>
          <circle r={82} fill={RED} stroke={SK.ink} strokeWidth={6} /><circle r={26} fill="#E9E2CF" />
        </g>}
      </g>
      <rect x={x} y={y} width={w} height={h} rx={18} stroke="rgba(255,255,255,0.7)" strokeWidth={3} fill="none" />
    </g>
  );
}
// The three farmer cards: the running idea (b7, b8).
const FARMERS = [["village_hill", "Tiny plot on a HILL", "Small hill plot"], ["punjab_wheat", "BIG, flat field", "Large flat field"], ["farmer_waits", "FEW days a year,\nlittle money", "Small budget"]];
function FarmerCard({ i, lt, at, x, y, w = 430, h = 560 }) {
  const [slot, line] = FARMERS[i], o = pop(lt, at, 0.6); if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 22, background: SK.cream, overflow: "hidden", opacity: Math.min(1, o), transform: `scale(${0.86 + 0.14 * o})`, boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }}>
      <Pic slot={slot} label={FARMERS[i][2]} x={0} y={0} w={w} h={h - 190} r={0} lt={lt} at={at} border={false} fx="zoom" />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 190, padding: "16px 22px", boxSizing: "border-box", textAlign: "center" }}>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 28, letterSpacing: "0.1em", color: SK.goldDeep }}>FARMER {i + 1}</div>
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 38, lineHeight: 1.14, color: SK.ink, marginTop: 8, whiteSpace: "pre-line" }}>{line}</div>
      </div>
    </div>
  );
}
function HireSign({ x, y, lt, at, op = 1 }) {
  const o = pop(lt, at, 0.6) * op; if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 430, height: 130, opacity: Math.min(1, o), transform: `rotate(${-1.5 + 1.5 * o}deg) scale(${0.8 + 0.2 * o})`, background: "#B98149", border: `5px solid ${SK.ink}`, borderRadius: 12, boxSizing: "border-box",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "8px 14px", textAlign: "center", fontFamily: SERIF, fontWeight: 700, fontSize: 36, lineHeight: 1.1, color: "#FFF6DF", boxShadow: "0 6px 16px rgba(0,0,0,0.35)" }}>Tractor for hire,<br />by the hour.</div>
  );
}
function NoTractor({ x, y, lt, at, r = 90, out = null }) {
  const o = pop(lt, at, 0.6) * (out != null ? 1 - reveal(lt, out, 0.4) : 1); if (o <= 0) return null;
  return <React.Fragment>
    <Pic slot="tool_machines" label="Tractor" x={x - r} y={y - r} w={2 * r} h={2 * r} r={r} lt={lt} at={at} out={out} fx="pop" style={{ boxShadow: "0 0 0 5px " + SK.cream }} />
    <SVG op={Math.min(1, o)}><circle cx={x} cy={y} r={r} stroke={RED} strokeWidth={13} /><line x1={x - r * 0.7} y1={y - r * 0.7} x2={x + r * 0.7} y2={y + r * 0.7} stroke={RED} strokeWidth={13} /></SVG>
  </React.Fragment>;
}

// ---- The trade map (b9): a stylised map; India is the official outline from india-map.js. ----
const MAP = window.LP5_MAP;
const LON0 = -18, LAT0 = 46, MK = 4.72;
const mp = (lon, lat, m) => [m.x + (lon - LON0) * MK, m.y + (LAT0 - lat) * MK * 1.07];
const LANDS = [
  [[-17, 15], [-16, 21], [-13, 27], [-9, 32], [-6, 36], [3, 37], [10, 37], [11, 33], [20, 32], [25, 32], [33, 31], [35, 28], [37, 21], [39, 15], [43, 12], [51, 12], [47, 4], [41, -2], [39, -7], [40, -15], [35, -20], [35, -24], [31, -29], [26, -34], [20, -35], [18, -32], [14, -23], [12, -15], [13, -6], [9, 0], [9, 4], [4, 6], [-4, 5], [-8, 4], [-13, 8]],
  [[26, 37], [27, 41], [35, 42], [42, 41], [49, 46], [135, 46], [131, 43], [127, 39], [129, 35], [126, 34], [125, 38], [121, 39], [118, 38], [122, 37], [120, 33], [122, 30], [119, 25], [114, 22], [108, 21], [106, 18], [109, 13], [105, 9], [100, 13], [103, 2], [101, 3], [98, 8], [97, 16], [94, 16], [92, 21], [89, 22], [80, 15], [80, 10], [77.5, 8], [73, 19], [69, 22], [67, 25], [57, 25], [56, 27], [50, 30], [48, 30], [51, 25], [56, 24], [59, 22], [55, 17], [45, 13], [43, 13], [39, 21], [35, 28], [35, 36], [30, 36]],
  [[-9, 37], [-9, 44], [-1, 44], [-1, 46], [27, 46], [28, 41], [24, 38], [22, 37], [20, 40], [15, 44], [17, 40], [12, 38], [8, 44], [3, 42], [-1, 37]],
  [[49, -12], [50, -16], [47, -25], [44, -24], [44, -16]], [[95, 5], [104, -3], [106, -6], [101, -3]], [[109, 1], [117, 6], [118, 1], [115, -4], [110, -2]], [[106, -6], [114, -7], [114, -8], [106, -7.5]],
  [[120, 18], [122, 18], [124, 12], [126, 7], [122, 7], [120, 14]], [[131, 33], [136, 35], [141, 37], [142, 43], [140, 41], [133, 36]],
  [[114, -22], [122, -18], [130, -12], [136, -12], [140, -17], [145, -15], [153, -27], [150, -37], [140, -38], [132, -32], [124, -33], [115, -34]],
  [[131, -1], [141, -3], [150, -10], [141, -9], [133, -4]],
];
function TradeMap({ m, lt, at, targets }) {
  const o = out3(lt, at, 0.6); if (o <= 0 || !MAP) return null;
  const toD = (p) => "M" + p.map(([a, b]) => mp(a, b, m).map((v) => v.toFixed(1)).join(" ")).join(" L") + " Z";
  const [hx, hy] = mp(78, 21, m), sx = (26 * 0.93 * 0 + MK) / (26 * 0.93), [ox, oy] = mp(MAP.lon0, MAP.lat0, m), sy = (MK * 1.07) / 26;
  return (
    <SVG op={o}>
      <rect x={m.x - 14} y={m.y - 14} width={m.w + 28} height={m.h + 28} rx={20} fill="#2E6F96" stroke="rgba(255,255,255,0.5)" strokeWidth={3} />
      <clipPath id="lp25map"><rect x={m.x - 14} y={m.y - 14} width={m.w + 28} height={m.h + 28} rx={20} /></clipPath>
      <g clipPath="url(#lp25map)">
        {LANDS.map((p, i) => <path key={i} d={toD(p)} fill="#6FA374" stroke="#57895C" strokeWidth={2} strokeLinejoin="round" />)}
        <g transform={`translate(${ox} ${oy}) scale(${sx} ${sy})`}>
          <path d={MAP.outline} fill={SK.gold} stroke={SK.white} strokeWidth={6} strokeLinejoin="round" />
          {MAP.islands.map((d, i) => <path key={i} d={d} fill={SK.gold} stroke={SK.white} strokeWidth={3} />)}
        </g>
        {targets.map(([lon, lat, t], i) => { const [x2, y2] = mp(lon, lat, m), a = out3(lt, t, 0.7); if (a <= 0) return null;
          const p = ((lt - t) * 0.45) % 1;
          return <g key={i}><Arrow x1={hx} y1={hy} x2={lerp(hx, x2, a)} y2={lerp(hy, y2, a)} color={SK.white} sw={7} head={24} /><circle cx={lerp(hx, x2, p)} cy={lerp(hy, y2, p)} r={10} fill={RED} stroke={SK.white} strokeWidth={3} /></g>; })}
      </g>
    </SVG>
  );
}
// The screen in the cab: the GPS path is drawn as perfectly even strips.
function GpsScreen({ x, y, w, h, lt, at, op = 1 }) {
  if (op <= 0) return null;
  const rows = 8, p = clamp((lt - at) / 8, 0, 1) * rows, n = Math.floor(p), f = p - n, ix = x + 34, iy = y + 34, iw = w - 68, ih = h - 96, rh = ih / rows;
  return (
    <g opacity={op}>
      <rect x={x} y={y} width={w} height={h} rx={26} fill="#10231C" stroke={SK.cream} strokeWidth={6} />
      <rect x={ix} y={iy} width={iw} height={ih} rx={8} fill="#27503F" />
      {[...Array(rows)].map((_, i) => { const fr = i < n ? 1 : i === n ? f : 0; if (fr <= 0) return null; const rx = i % 2 ? ix + iw * (1 - fr) : ix, yy = iy + i * rh;
        return <rect key={i} x={rx} y={yy + 3} width={iw * fr} height={rh - 6} rx={3} fill="#3FAF7A" />; })}
      {n < rows && <circle cx={n % 2 ? ix + iw * (1 - f) : ix + iw * f} cy={iy + n * rh + rh / 2} r={13} fill={SK.gold} stroke={SK.white} strokeWidth={4} />}
      <T x={x + w / 2} y={y + h - 20} size={30} bold color={SK.leaf}>GPS path: no strip twice</T>
    </g>
  );
}

// ---- Beats ------------------------------------------------------------------------
// Scene 1 — sunrise, bells on one side, an engine on the other, VS.
function B1(ctx) {
  return ({ localTime: lt, duration }) => {
    const cBells = W("b1", "bells"), cEng = W("b1", "engine"), cQ = W("b1", "which"), cWrong = W("b1", "wrong");
    const shake = lt > cEng && lt < cEng + 1.6 ? Math.sin(lt * 70) * 3 * (cEng + 1.6 - lt) : 0;
    const swing = lt > cBells ? Math.sin((lt - cBells) * 9) * 22 * Math.exp(-(lt - cBells) * 0.55) : 0;
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[1]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(1, ctx, [L("Tradition Meets Technology!", cBells, "big"), L("Bullock plough", cBells), L("vs", cEng, "think"), L("Tractor", cEng), L("Which one is better?", cQ, "think")])}>
        <Pic slot="hero_plough" label="A pair of bullocks with neck bells pulls a wooden plough" x={40} y={60} w={670} h={830} lt={lt} at={0.1} fx="zoom" pos="60% center" />
        <div style={{ position: "absolute", inset: 0, transform: `translate(${shake}px, ${shake * 0.4}px)` }}>
          <Pic slot="tractor_sunrise" label="A red tractor roars to life" x={730} y={60} w={670} h={830} lt={lt} at={0.5} fx="zoom" />
        </div>
        <SVG op={out3(lt, cBells - 0.1, 0.4)}>
          <g transform={`translate(375 230) rotate(${swing})`}><path d="M-44 44 C -44 -30, -24 -60, 0 -60 C 24 -60, 44 -30, 44 44 L 58 62 H -58 Z" fill={SK.gold} stroke={SK.ink} strokeWidth={5} strokeLinejoin="round" /><circle cy={72} r={14} fill={SK.ink} /><rect x={-9} y={-82} width={18} height={24} rx={7} fill={SK.ink} /></g>
          {[0, 1, 2].map((i) => { const p = ((lt - cBells + i * 0.4) * 0.8) % 1; return <g key={i} opacity={(1 - p) * 0.9}><path d={`M${455 + p * 60} ${170 + p * -10} q ${24 + p * 16} 60 0 120`} stroke={SK.white} strokeWidth={6} fill="none" strokeLinecap="round" /><path d={`M${295 - p * 60} ${170 + p * -10} q ${-24 - p * 16} 60 0 120`} stroke={SK.white} strokeWidth={6} fill="none" strokeLinecap="round" /></g>; })}
        </SVG>
        <SVG op={out3(lt, cEng - 0.1, 0.4)}>
          {[0, 1, 2, 3, 4].map((i) => { const p = ((lt - cEng + i * 0.42) * 0.55) % 1; return <circle key={i} cx={1090 + p * 120 + Math.sin(p * 7) * 14} cy={320 - p * 240} r={18 + p * 46} fill={`rgba(60,60,60,${0.55 * (1 - p)})`} />; })}
        </SVG>
        <Chip text="BELLS" x={375} y={100} lt={lt} at={cBells} tone="gold" size={34} />
        <Chip text="ENGINE" x={1065} y={100} lt={lt} at={cEng} tone="gold" size={34} />
        <SVG op={pop(lt, cBells + 1, 0.6)}><circle cx={720} cy={475} r={92} fill={SK.gold} stroke={SK.cream} strokeWidth={8} /><T x={720} y={504} size={84} bold serif color={SK.ink}>VS</T></SVG>
        <Chip text="Which one is better?" x={720} y={790} lt={lt} at={cQ} out={cWrong} tone="gold" size={42} />
        <Chip text="…or is that the WRONG question?" x={720} y={790} lt={lt} at={cWrong + 0.45} tone="gold" size={42} />
      </Scene>
    );
  };
}
// Scene 2 — the pair at work, the blade loosening the soil, then the tight corner of a hill plot.
function B2(ctx) {
  return ({ localTime: lt, duration }) => {
    const cPair = W("b2", "pair"), cLoose = W("b2", "loosens"), cCost = W("b2", "costs"), cFuel = W("b2", "needs"), cSmall = W("b2", "perfect"), cHilly = W("b2", "especially"), cTrac = W("b2", "tractor"), cSow = W("b2", "sowing");
    const k = drive(lt, cPair + 0.4, cCost - 0.2);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[2]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(2, ctx, [L("BULLOCK PLOUGH", 0.5, "head"), YES("Low cost", cCost), YES("NO fuel needed", cFuel), YES("Good for SMALL fields", cSmall), YES("Reaches places tractors can't", cHilly)])}>
        <Pic slot="hero_plough" label="A pair of bullocks and a farmer guiding the plough" x={40} y={60} w={1360} h={830} lt={lt} at={0.1} out={cPair + 0.1} fx="zoom" />
        <Pic slot="iron_plough" label="The blade cuts and lifts the soil" x={40} y={60} w={640} h={830} lt={lt} at={cPair} out={cSmall} fx="zoom" />
        <SVG op={windowOp(lt, cPair, cSmall + 0.2, 0.4)}><PloughCut x={700} y={60} w={700} h={830} k={k} lt={lt} /></SVG>
        <Chip text="hard ground" x={1270} y={770} lt={lt} at={cPair + 0.4} out={cSmall} size={28} />
        <Chip text="LOOSE soil" x={850} y={330} lt={lt} at={cLoose + 0.4} out={cSmall} tone="gold" size={32} />
        <Chip text="ready for sowing" x={1050} y={770} lt={lt} at={cSow} out={cSmall} size={28} />
        <Chip text="₹ It costs LITTLE" x={360} y={110} lt={lt} at={cCost} out={cSmall} tone="gold" size={38} />
        <Chip text="NO fuel" x={360} y={180} lt={lt} at={cFuel} out={cSmall} tone="gold" size={38} />
        <Pic slot="hill_plot_bullocks" label="Bullocks turn in a tight corner of a narrow hill plot" x={40} y={60} w={1360} h={830} lt={lt} at={cSmall} fx="zoom" />
        <Chip text="SMALL fields" x={260} y={100} lt={lt} at={cSmall + 0.3} tone="gold" size={36} />
        <Chip text="narrow, hilly plots" x={600} y={100} lt={lt} at={cHilly} size={36} />
        <NoTractor x={1250} y={210} lt={lt} at={cTrac} r={105} />
      </Scene>
    );
  };
}
// Scene 3 — the sun crosses the sky, the clock spins, and only one corner of the field is done.
function B3(ctx) {
  return ({ localTime: lt, duration }) => {
    const cBig = W("b3", "big"), cTime = W("b3", "time"), cWork = W("b3", "hard"), cAnim = W("b3", "animals");
    const run = clamp((lt - cBig) / (duration - cBig - 0.6), 0, 1);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[3]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(3, ctx, [L("BUT…", 0.4, "big"), NO("SLOW on large areas", cTime), NO("Hard physical work", cWork)])}>
        <Pic slot="big_field_corner" label="A huge field: only one corner is ploughed, the bullocks are tired" x={40} y={60} w={640} h={830} lt={lt} at={0.1} fx="zoom" pos="30% center" />
        <SVG op={out3(lt, 0.3, 0.6)}>
          <TimeSky x={700} y={60} w={700} h={320} sun={run} spin={run * 9} lt={lt} label="A long day…" />
          <PlanField {...FIELD} rows={16} done={run * 0.13} head="bullock" lt={lt} />
        </SVG>
        <Chip text="A BIG field" x={1050} y={410} lt={lt} at={cBig} size={30} />
        <Chip text="only this much after a whole day!" x={1050} y={640} lt={lt} at={cWork - 0.1} tone="gold" size={32} />
        <Chip text="tired farmer, tired animals" x={360} y={800} lt={lt} at={cAnim - 0.4} tone="gold" size={30} />
      </Scene>
    );
  };
}
// Scene 4 — the same field, finished in a flash; then quick cuts of its other jobs.
function B4(ctx) {
  return ({ localTime: lt, duration }) => {
    const cLarge = W("b4", "large"), cFast = W("b4", "faster"), cHeavy = W("b4", "heavy"), cMore = W("b4", "more", 1), cSow = W("b4", "sowing"), cMark = W("b4", "market"), cMuch = W("b4", "much", 1), cEff = W("b4", "efficiently");
    const run = clamp((lt - cLarge) / (cHeavy - cLarge), 0, 1);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[4]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(4, ctx, [L("TRACTOR", 0.4, "head"), YES("Ploughs BIG areas FAST", cFast), YES("Pulls HEAVY equipment", cHeavy), YES("Also sows, transports produce and more", cMore)])}>
        <Pic slot="tractor_big_plough" label="A tractor pulls a wide, heavy plough across a big field" x={40} y={60} w={640} h={830} lt={lt} at={0.1} out={cMore} fx="zoom" />
        <SVG op={windowOp(lt, 0.3, cMore + 0.2, 0.5)}>
          <TimeSky x={700} y={60} w={700} h={320} sun={run * 0.14} spin={run * 0.6} lt={lt} label="Just a short time…" />
          <PlanField {...FIELD} rows={16} done={Easing.easeInOutCubic(run)} head="tractor" lt={lt} />
        </SVG>
        <Chip text="The same BIG field" x={1050} y={410} lt={lt} at={cLarge} out={cMore} size={30} />
        <Chip text="DONE!" x={1050} y={610} lt={lt} at={cHeavy} out={cMore} tone="gold" size={62} />
        <Chip text="HEAVY equipment" x={360} y={800} lt={lt} at={cHeavy} out={cMore} tone="gold" size={34} />
        <Chip text="soil ready, more efficiently" x={360} y={100} lt={lt} at={cEff - 0.3} out={cMore - 0.5} size={30} />
        <Pic slot="tractor_big_plough" label="Ploughing" x={40} y={60} w={1360} h={830} lt={lt} at={cMore} out={cSow} fx="pan" />
        <Pic slot="tractor_drill" label="The tractor pulls a seed drill" x={40} y={60} w={1360} h={830} lt={lt} at={cSow} out={cMark} fx="zoom" />
        <Pic slot="tractor_trailer" label="A trailer full of sacks heads to market" x={40} y={60} w={1360} h={830} lt={lt} at={cMark} fx="pan" />
        <Chip text="MORE than ploughing" x={720} y={100} lt={lt} at={cMore} out={cSow} tone="gold" size={42} />
        <Chip text="SOWING" x={720} y={100} lt={lt} at={cSow + 0.45} out={cMark} tone="gold" size={42} />
        <Chip text="To MARKET" x={720} y={100} lt={lt} at={cMark + 0.45} tone="gold" size={42} />
        <Chip text="…and much more!" x={720} y={800} lt={lt} at={cMuch} size={38} />
      </Scene>
    );
  };
}
// Scene 5 — money flying out, then the tyre that squeezes the soil shut.
function B5(ctx) {
  return ({ localTime: lt, duration }) => {
    const cExp = W("b5", "expensive"), cRep = W("b5", "repair"), cDie = W("b5", "diesel"), cHeavy = W("b5", "heavy"), cSq = W("b5", "squeeze"), cComp = W("b5", "compaction"), cRoots = W("b5", "roots");
    const money = 1 - reveal(lt, cHeavy - 0.4, 0.5), soil = out3(lt, cHeavy - 0.2, 0.6);
    const notes = []; [[cExp, 480, 290], [cRep, 850, 300], [cDie, 1190, 330]].forEach(([a, x1, y1], j) => { for (let i = 0; i < 6; i++) notes.push(<Note key={j + "-" + i} x0={220} y0={640} x1={x1} y1={y1 + (i % 3) * 22} lt={lt} at={a + i * 0.32} />); });
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[5]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(5, ctx, [L("BUT…", 0.4, "big"), NO("EXPENSIVE to buy and maintain", cExp), NO("Needs DIESEL", cDie), NO("Too much use can COMPACT the soil", cSq), L("COMPACTION: soil squeezed tight", cComp, "think")])}>
        <div style={{ position: "absolute", inset: 0, opacity: money }}>
          <Card x={40} y={60} w={1360} h={830} lt={lt} at={0} />
          <SVG op={1}>
            <Wallet x={220} y={700} />
            <g opacity={pop(lt, cExp, 0.5)}><PriceTag x={500} y={300} /></g>
            <g opacity={pop(lt, cRep, 0.5)}><RepairBill x={850} y={330} /></g>
            <g opacity={pop(lt, cDie, 0.5)}><Pump x={1190} y={330} lt={lt} at={cDie} /></g>
            {notes}
          </SVG>
          <Chip text="to BUY" x={500} y={420} lt={lt} at={cExp + 0.2} tone="gold" size={32} />
          <Chip text="to REPAIR" x={850} y={480} lt={lt} at={cRep + 0.1} tone="gold" size={32} />
          <Chip text="DIESEL or other fuel" x={1190} y={530} lt={lt} at={cDie + 0.2} tone="gold" size={32} />
        </div>
        <div style={{ position: "absolute", inset: 0, opacity: soil }}>
          <Pic slot="tyre_soil" label="A heavy tyre presses into the soil" x={40} y={60} w={420} h={830} lt={lt} at={cHeavy - 0.2} fx="zoom" />
          <SVG op={1}><SoilCut x={480} y={60} w={920} h={830} lt={lt} cRoll={cSq - 0.5} cRoots={cRoots} /></SVG>
          <Chip text="air spaces in the soil" x={740} y={100} lt={lt} at={cHeavy} out={cSq - 0.7} tone="gold" size={30} />
          <Chip text="SQUEEZED tight" x={700} y={100} lt={lt} at={cSq + 1.8} out={cComp} tone="gold" size={36} />
          <Chip text="COMPACTION" x={680} y={100} lt={lt} at={cComp} tone="gold" size={46} />
          <Chip text="roots stuck" x={800} y={440} lt={lt} at={cRoots + 1.2} size={30} />
          <Chip text="water stuck" x={1170} y={330} lt={lt} at={cRoots + 1.4} size={30} />
        </div>
      </Scene>
    );
  };
}
// Scene 6 — Stop 1: two plates, freeze.
function B6(ctx) {
  return ({ localTime: lt, duration }) => {
    const cB = W("b6", "bullock"), cT = W("b6", "tractor"), at = stopStart("b6"), hold = holdOf("b6");
    const Plate = ({ x, slot, label, name, a, tok }) => {
      const o = pop(lt, a, 0.6); if (o <= 0) return null;
      return <React.Fragment>
        <SVG op={Math.min(1, o)}><circle cx={x} cy={430} r={270} fill="#F7F3E8" stroke={SK.creamEdge} strokeWidth={10} /><circle cx={x} cy={430} r={224} stroke={SK.goldDeep} strokeWidth={4} /></SVG>
        <Pic slot={slot} label={label} x={x - 205} y={225} w={410} h={410} r={205} lt={lt} at={a} fx="pop" border={false} />
        <Chip text={name} x={x} y={100} lt={lt} at={a + 0.1} tone="gold" size={38} />
        <Pic slot={tok} label={name} x={x + 150} y={100} w={120} h={120} r={60} lt={lt} at={a + 0.2} fx="pop" style={{ boxShadow: "0 0 0 4px " + SK.cream }} />
      </React.Fragment>;
    };
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[6]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(6, ctx, [L("⏸ THINK", 0.4, "big"), L("What does each one need to keep working?", cB, "plain")])}>
        <Big x={40} y={380} w={1360} lt={lt} at={0.3} out={cB - 0.2} size={96} align="center" color={SK.gold}>Quick stop!</Big>
        <Plate x={380} slot="green_fodder" label="Green fodder" name="BULLOCK" a={cB} tok="hero_plough" />
        <Plate x={1060} slot="fuel_can" label="A fuel can" name="TRACTOR" a={cT} tok="tool_machines" />
        <div style={{ position: "absolute", left: 40, top: 730, width: 1360, display: "flex", justifyContent: "center", alignItems: "center", gap: 20, opacity: windowOp(lt, at - 0.2, at + hold + 0.3, 0.35) }}>
          <PauseMark size={70} /><div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 46, color: SK.white }}>What does each one need to keep working?</div></div>
        <StopNote b="b6" lt={lt} y={830} />
      </Scene>
    );
  };
}
// Scene 7 — Right Tool, Right Farm: three farmers; Farmer 3 hires.
function B7(ctx) {
  return ({ localTime: lt, duration }) => {
    const cMeet = W("b7", "meet"), c1 = W("b7", "farmer", 1), c2 = W("b7", "farmer", 2), c3 = W("b7", "farmer", 3), cHire = W("b7", "hire"), cMany = W("b7", "many"), cBuy = W("b7", "buying");
    const X = [40, 505, 970];
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[7]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(7, ctx, [L("Small hill plot → ?", c1, "plain"), L("Large flat field → ?", c2, "plain"), L("Small budget → HIRE, don't buy", cHire, "plain")])}>
        <Big x={40} y={40} w={1360} lt={lt} at={0.3} size={54} align="center" color={SK.gold}>Right Tool, Right Farm</Big>
        {[c1, c2, c3].map((a, i) => <FarmerCard key={i} i={i} lt={lt} at={a} x={X[i]} y={130} />)}
        {[0, 1].map((i) => <Chip key={i} text="Which tool?" x={X[i] + 215} y={730} lt={lt} at={(i ? c2 : c1) + 0.8} tone="gold" size={40} />)}
        <HireSign x={X[2]} y={708} lt={lt} at={cMany} />
        <Chip text="HIRE, don't buy" x={X[2] + 215} y={848} lt={lt} at={cHire} tone="gold" size={34} />
        <Chip text="Many small farmers in India" x={480} y={848} lt={lt} at={cMany} size={32} />
      </Scene>
    );
  };
}
// Scene 8 — Stop 2: freeze on the cards, the big question in large letters.
function B8(ctx) {
  return ({ localTime: lt, duration }) => {
    const cQ = W("b8", "should"), cShare = W("b8", "sharing"), cDis = W("b8", "discuss"), at = stopStart("b8");
    const X = [40, 505, 970], dim = out3(lt, cQ - 0.3, 0.6);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[8]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(8, ctx, [L("⏸ THE BIG QUESTION", 0.4, "big"), L("Should EVERY farmer buy a tractor?", cQ, "plain"), L("Or is SHARING and HIRING smarter?", cShare, "plain")])}>
        {[0, 1, 2].map((i) => <FarmerCard key={i} i={i} lt={lt + 10} at={0} x={X[i]} y={130} />)}
        <HireSign x={X[2]} y={708} lt={lt + 10} at={0} />
        <div style={{ position: "absolute", left: 20, top: 40, width: 1400, height: 880, borderRadius: 22, background: "rgba(5,30,22,0.93)", opacity: dim }} />
        <Big x={60} y={170} w={1320} lt={lt} at={cQ} size={76} align="center">Should EVERY farmer buy a tractor?</Big>
        <Big x={60} y={400} w={1320} lt={lt} at={cShare} size={68} align="center" color={SK.gold}>Or is SHARING and HIRING smarter?</Big>
        <div style={{ position: "absolute", left: 40, top: 720, width: 1360, display: "flex", justifyContent: "center", alignItems: "center", gap: 20, opacity: out3(lt, cDis, 0.5) }}>
          <PauseMark size={70} /><div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 52, color: SK.white }}>Discuss!</div></div>
        <StopNote b="b8" lt={lt} y={820} />
      </Scene>
    );
  };
}
// Scene 9 — Did you know: hills, the factory and the world, GPS.
function B9(ctx) {
  return ({ localTime: lt, duration }) => {
    const cDyk = S("b9", 0), cBoth = S("b9", 1), cVill = S("b9", 2), cSame = S("b9", 3), cBig = W("b9", "biggest"), cIndian = S("b9", 4), cAfr = W("b9", "africa"), cAsia = W("b9", "asia"), cBey = W("b9", "beyond"),
      cGps = S("b9", 5), cMapP = W("b9", "map"), cPrec = W("b9", "precise"), cStrip = S("b9", 6), cSave = W("b9", "save");
    const m = { x: 570, y: 130, w: 816, h: 450 };
    const targets = [[22, 2, cAfr], [112, 30, cAsia], [148, -24, cBey]];
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[9]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(9, ctx, [L("Bullocks still plough small and hilly plots across India", cVill), L("India: world's LARGEST tractor producer", cBig), L("29% of world output in 2013", cBig + 0.6, "sub"), L("Exports to Africa, Asia and beyond", cAfr), L("GPS-guided tractors cut OVERLAP and save fuel", cStrip)], { max: 5 })}>
        <div style={{ position: "absolute", inset: 0, opacity: 1 - reveal(lt, cVill - 0.1, 0.4) }}>
          <Badge x={520} y={150} lt={lt} at={cDyk} size={44} text="DID YOU KNOW?" />
          <Flip x={270} y={290} w={900} h={380} lt={lt} at={cBoth} q="India's farming story has BOTH tradition AND technology!" size={52} />
        </div>
        <Pic slot="terrace_bullocks" label="Bullocks plough a narrow terraced plot in the hills" x={40} y={60} w={1360} h={830} lt={lt} at={cVill} out={cSame} fx="zoom" />
        <Chip text="TRADITION: bullocks still valued in the hills" x={720} y={100} lt={lt} at={cVill + 0.5} out={cSame} tone="gold" size={38} />
        <Pic slot="tractor_factory" label="New tractors roll off an Indian factory line" x={40} y={60} w={1360} h={830} lt={lt} at={cSame} out={cIndian} fx="pan" />
        <Chip text="TECHNOLOGY" x={720} y={100} lt={lt} at={cSame + 0.3} out={cIndian} tone="gold" size={38} />
        <Chip text="World's BIGGEST tractor producer" x={720} y={800} lt={lt} at={cBig} out={cIndian} tone="gold" size={44} />
        <div style={{ position: "absolute", inset: 0, opacity: windowOp(lt, cIndian - 0.1, cGps + 0.1, 0.4) }}>
          <Pic slot="tractors_port" label="New tractors wait at a port to be shipped" x={40} y={60} w={500} h={830} lt={lt} at={cIndian - 0.1} fx="zoom" />
          <TradeMap m={m} lt={lt} at={cIndian} targets={targets} />
          <Chip text="AFRICA" x={mp(22, 2, m)[0]} y={mp(22, 2, m)[1] + 18} lt={lt} at={cAfr} tone="gold" size={30} />
          <Chip text="ASIA" x={mp(112, 30, m)[0]} y={mp(112, 30, m)[1] - 54} lt={lt} at={cAsia} tone="gold" size={30} />
          <Chip text="…and beyond!" x={mp(128, -24, m)[0]} y={mp(128, -24, m)[1] + 30} lt={lt} at={cBey} tone="gold" size={30} />
          <Chip text="Indian-made tractors, around the world" x={978} y={650} lt={lt} at={cIndian + 0.5} size={34} />
        </div>
        <Pic slot="tractor_straight" label="A modern tractor drives in perfectly straight lines" x={40} y={60} w={680} h={830} lt={lt} at={cGps} out={cStrip} fx="zoom" />
        <Pic slot="tractor_gps" label="A screen in the cab shows the GPS path" x={40} y={60} w={680} h={830} lt={lt} at={cStrip} fx="zoom" />
        <SVG op={out3(lt, cGps, 0.6)}><GpsScreen x={740} y={90} w={660} h={600} lt={lt} at={cMapP} /></SVG>
        <Chip text="Like a map on your phone" x={1070} y={720} lt={lt} at={cMapP} out={cStrip} size={32} />
        <Chip text="No overlap = less fuel" x={1070} y={720} lt={lt} at={cSave - 0.3} tone="gold" size={38} />
        <Chip text="PRECISE paths" x={380} y={100} lt={lt} at={cPrec} out={cStrip} tone="gold" size={36} />
      </Scene>
    );
  };
}
// Scene 10 — the big idea, bullocks and tractor at sunset.
function B10(ctx) {
  return ({ localTime: lt, duration }) => {
    const cIdea = W("b10", "big"), cBest = W("b10", "best"), cBig = W("b10", "biggest"), cSuit = W("b10", "suits"), cLand = W("b10", "land"), cBud = W("b10", "budget"), cCrop = W("b10", "crop"), cNeed = W("b10", "needs");
    const words = [["LAND", cLand], ["BUDGET", cBud], ["CROP", cCrop], ["NEEDS", cNeed]];
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[10]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(10, ctx, [L("The best tool is not the BIGGEST", cBig, "big"), L("It is the one that suits the LAND, BUDGET, CROP and NEEDS", cSuit, "plain")])}>
        <Pic slot="both_sunset" label="Bullocks and a tractor side by side at sunset" x={40} y={60} w={1360} h={830} lt={lt} at={0.1} fx="zoom" zoom={1.08} />
        <Big x={80} y={110} w={1280} lt={lt} at={cBest} size={62} align="center">The best tool is not the BIGGEST.</Big>
        <Big x={80} y={200} w={1280} lt={lt} at={cSuit} size={54} align="center" color={SK.gold}>It is the one that SUITS the farm.</Big>
        {words.map(([t, a], i) => <Chip key={t} text={t} x={270 + i * 300} y={740} lt={lt} at={a} tone="gold" size={46} />)}
      </Scene>
    );
  };
}
// Scene 11 — Stop 3: the quick check; after the pause each answer flips in.
const QCK = [["One advantage of a bullock plough?", "No fuel, low cost, or good for small fields", 180], ["One problem with using a tractor too much?", "It can COMPACT the soil", 415], ["What do many small farmers do instead of buying a tractor?", "They HIRE one", 650]];
function B11(ctx) {
  return ({ localTime: lt, duration }) => {
    const qAt = [S("b11", 1), S("b11", 2), S("b11", 3)], aAt = [S("b11", 4), S("b11", 5), S("b11", 6)], cEnd = S("b11", 7);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[11]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(11, ctx, [L("⏸ QUICK CHECK", 0.4, "big"), L("1. One advantage of a bullock plough?", qAt[0], "plain"), L("2. One problem with using a tractor too much?", qAt[1], "plain"), L("3. What do many small farmers do instead of buying a tractor?", qAt[2], "plain")])}>
        <Big x={60} y={50} w={1320} lt={lt} at={0.3} size={60} color={SK.gold}>Quick check!</Big>
        {QCK.map(([q, a, y], i) => <React.Fragment key={i}>
          <Card x={40} y={y} w={820} h={215} lt={lt} at={qAt[i]} pad={24}>
            <div style={{ display: "flex", alignItems: "center", gap: 24, height: "100%" }}>
              <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 70, color: SK.gold }}>{i + 1}</span>
              <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 42, lineHeight: 1.16, color: SK.white }}>{q}</span></div>
          </Card>
          {lt < aAt[i] + 0.02 && <div style={{ position: "absolute", left: 880, top: y, width: 520, height: 215, borderRadius: 22, background: SK.gold, opacity: out3(lt, qAt[i], 0.5), display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: SERIF, fontWeight: 700, fontSize: 120, color: SK.ink }}>?</div>}
          <Flip x={880} y={y} w={520} h={215} lt={lt} at={aAt[i]} q={a} size={i === 0 ? 40 : 48} />
        </React.Fragment>)}
        <StopNote b="b11" lt={lt} y={880} />
        <Chip text="Right tool, right farm!" x={720} y={872} lt={lt} at={cEnd} tone="gold" size={46} />
      </Scene>
    );
  };
}

// Plays the fitted audio in step with the timeline (preview only).
function AudioSync() {
  const tl = window.useTimeline();
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!window.TP_AUDIO) return;
    const a = ref.current || (ref.current = new Audio(window.TP_AUDIO));
    const playing = tl.playing || tl.extPlaying;
    if (playing) {
      if (Math.abs(a.currentTime - tl.time) > 0.35) a.currentTime = tl.time;
      if (a.paused) a.play().catch(() => {});
    } else {
      if (!a.paused) a.pause();
      if (Math.abs(a.currentTime - tl.time) > 0.05) a.currentTime = tl.time;
    }
  }, [tl.time, tl.playing, tl.extPlaying]);
  return null;
}

// ============================================================================
const COLLAGE = [{ slot: "hero_plough", x: -60, y: -40, w: 760, h: 520, ph: 0 }, { slot: "village_hill", x: 640, y: -80, w: 760, h: 520, ph: 2 },
  { slot: "punjab_wheat", x: -80, y: 520, w: 700, h: 560, ph: 4 }, { slot: "farmer_waits", x: 560, y: 560, w: 820, h: 560, ph: 1 }];
function Lp25Scenes(props = {}) {
  const caps = props.showCaptions === "false" ? false : props.showCaptions !== false;
  const titles = {};
  for (let n = 1; n <= NB; n++) titles[n] = str(props["title" + n + "Text"], TITLES[n]);
  const ctx = { caps, titles, capSize: num(props.captionSize, 34) };
  const B = [B1, B2, B3, B4, B5, B6, B7, B8, B9, B10, B11];
  const beats = B.map((Bn, i) => { const t = BEAT("b" + (i + 1)); return [t.start, t.start + t.dur, Bn]; });
  return (
    <StoryFrame props={props} dur={DUR} persistKey="thinkpro-lp25-bullock-plough-vs-tractor" collage={COLLAGE}>
      {beats.map(([s, e, Bn], i) => (
        <Sprite key={i} start={s} end={e}>{Bn(ctx)}</Sprite>
      ))}
      {STOPS.map(([b, i, hold]) => <StopAt key={b} t={BEAT(b).start + stopAt(b, i)} hold={hold - 0.2} />)}
      <ChimeAt t={BEAT("b9").start + S("b9", 0)} />
      <AudioSync />
    </StoryFrame>
  );
}
window.Lp25Scenes = Lp25Scenes;
