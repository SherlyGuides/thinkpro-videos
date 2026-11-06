/* global React, window */
// ThinkPro Academy — "Soil Types and Crops" (Grade 6 Agriculture, Session 20, V1).
// After AG_G6_S20_Video_Script_Soil_Types_and_Crops (4 Nov 2026): 11 scenes as 11 narrated beats,
// three presenter stops (b5, b6, b11 — silent holds, the web player freezes there, TPStory.StopAt)
// and one WOW card (b10). The SOIL PASSPORT is the running idea: every soil gets a stamp with its
// NAME, HOME and CROPS, a row of six small stamps at the foot of the right panel fills up, and the
// six full stamps return in b11. The drawn India map is india-map.js (copied from LP5); the soil
// patches are hand-simplified lon/lat polygons clipped to its outline. STORY STYLE (engine/story-kit.jsx).
const { Sprite, Easing } = window;
const { reveal, windowOp } = window.TPMotion;
const { num, str } = window.TPStage;
const { SK, SERIF, SANS, LEFT_W, PANEL_X, PANEL_W, pop, out3, lerp, drive, Pic, Chip, Badge, Big, Card, SVG, Arrow, T, ChimeAt, Scene, StoryFrame, StopAt, Flip } = window.TPStory;

// ---- Timing: EVERYTHING is keyed to the narration (tools/fit_timing.py → timing.js).
const TM = window.TP_TIMING;
if (!TM) console.error("timing.js missing — run: python3 tools/fit_timing.py videos/lp20-soil-types-and-crops");
const LEAD = TM ? TM.lead : 1.0;
const DUR = TM ? TM.total : 280;
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
const TITLES = { 1: "LP20 – Soil Types and Crops", 2: "6 main soils", 3: "Stamp 1: Alluvial", 4: "Stamp 2: Black soil", 5: "Think",
  6: "Stamp 3: Red soil", 7: "Stamp 4: Laterite", 8: "Stamp 5: Desert soil", 9: "Stamp 6: Mountain soil", 10: "WOW! Regur", 11: "Passport complete!" };
const KICK = "Grade 6 · Agriculture · Session 20";
const KICKS = { 3: "Soil passport", 4: "Soil passport", 5: "Presenter stop", 6: "Soil passport", 7: "Soil passport", 8: "Soil passport", 9: "Soil passport", 10: "WOW fact", 11: "Soil passport" };
const panel = (n, ctx, lines, extra = {}) => ({ kicker: KICKS[n] || KICK, title: ctx.titles[n], lines, max: 8, ...extra });
const L = (text, at, kind = "item", extra = {}) => ({ text, at, kind, ...extra });
// One passport field: a small gold label over its value.
const F = (label, value, at) => ({ at, kind: "plain", text: <span style={{ display: "block" }}>
  <span style={{ display: "block", fontFamily: SANS, fontWeight: 700, fontSize: 18, letterSpacing: "0.12em", color: SK.goldDeep }}>{label}</span>{value}</span> });

// ---- Presenter stops: [beat, sentence index whose pauseAfter is the hold, hold s]
const STOPS = [["b5", 3, 6.0], ["b6", 5, 5.0], ["b11", 5, 8.0]];
const stopFor = (b) => STOPS.find((s) => s[0] === b);
const stopStart = (b) => SE(b, stopFor(b)[1]) + 0.1;           // beat-local start of the hold
const holdOf = (b) => stopFor(b)[2] - 0.2;

// ---- The six soils ---------------------------------------------------------------
const WATER = "#5DB7E8";
const SOILS = [
  { k: "alluvial", name: "ALLUVIAL", c: "#A98F6E", ink: "#fff", home: "Northern plains, river valleys, coastal deltas", crops: "Rice, wheat, sugarcane" },
  { k: "black", name: "BLACK", c: "#2B2420", ink: "#fff", home: "Deccan Plateau", crops: "Cotton" },
  { k: "red", name: "RED", c: "#BE3F2A", ink: "#fff", home: "Eastern and southern Deccan", crops: "Millets, groundnut" },
  { k: "laterite", name: "LATERITE", c: "#8A4A2C", ink: "#fff", home: "Karnataka, Kerala, Tamil Nadu, hills of Odisha and Assam", crops: "Tea, coffee, cashew" },
  { k: "desert", name: "DESERT", c: "#E0BE6A", ink: "#163A2C", home: "Thar Desert", crops: "Bajra, with irrigation" },
  { k: "mountain", name: "MOUNTAIN", c: "#5E4331", ink: "#fff", home: "Hill slopes and Himalayan valleys", crops: "Tea, fruit orchards" },
];

// ---- India map with soil patches --------------------------------------------------
const MAP = window.LP5_MAP;
if (!MAP) console.error("india-map.js missing");
const BASE = "#2C5E49";
const proj = (lon, lat) => [(lon - MAP.lon0) * MAP.k * MAP.cos, (MAP.lat0 - lat) * MAP.k];
const poly = (pts) => "M" + pts.map(([a, b]) => proj(a, b).map((v) => v.toFixed(1)).join(" ")).join(" L") + " Z";
// Simplified teaching patches (lon, lat), clipped to the outline. Red first: laterite sits on top of it.
const PATCH = {
  red: [[[79.5, 24.4], [84, 24.7], [86.2, 23.5], [87.2, 21.6], [85.2, 19.6], [82.4, 17], [80.2, 15.5], [80.3, 12.5], [79.9, 10.4], [78, 7.6], [77, 7.6], [76.8, 11], [75.8, 12.6], [75.1, 14], [76, 15.4], [77.8, 16.8], [78.8, 18.8], [79.6, 20.6], [80.5, 22.5]]],
  black: [[[68.8, 22], [69.5, 23], [71.2, 23.4], [73.5, 23.1], [76, 24.6], [79.5, 24.4], [80.5, 22.5], [79.6, 20.6], [78.8, 18.8], [77.8, 16.8], [76, 15.4], [74.4, 16.2], [73.6, 17.8], [73.2, 20.5], [72.8, 21], [72, 20.5], [70.6, 20.4]]],
  alluvial: [[[73.2, 32.8], [75.5, 32.2], [77.5, 30.6], [80.5, 28.8], [84, 27.2], [88, 26.6], [92, 26.9], [96, 27.8], [95.5, 26.6], [91, 25.9], [89.7, 25.5], [88.8, 21.2], [87.2, 21.2], [86.2, 23.5], [84, 24.7], [81, 25.3], [78.5, 26.2], [77, 27.2], [76, 28.8], [74.2, 29.6], [73, 31]],
    [[85.2, 19.6], [87.4, 21.5], [87.2, 20.3], [86, 19.3]], [[80.2, 15.5], [82.4, 17], [82.6, 16.2], [81, 15.3]], [[78.8, 11.4], [80.3, 11.8], [80.3, 10.2], [79, 10.2]]],
  laterite: [[[73.6, 17.8], [74.4, 16.2], [75.1, 14], [75.8, 12.6], [76.8, 11], [77.4, 8], [76.4, 8.4], [75, 11.8], [74, 14.4], [73.2, 16.2]],
    [[82.6, 19.8], [84.6, 20.8], [85.4, 20.2], [83.4, 18.2], [82.2, 18.2]], [[90.1, 25.9], [93.3, 26.2], [94.6, 26], [94.5, 24.8], [92.2, 24.8], [90.1, 25.2]]],
  desert: [[[72.9, 30.2], [74.2, 29.6], [75.4, 28.2], [74.5, 26.5], [73.2, 25.4], [72, 24.6], [71, 23.6], [68, 23.2], [68, 24.4], [69.5, 27]]],
  mountain: [[[72, 37.6], [81, 37.6], [80, 32.8], [81, 30.5], [84, 28.6], [88, 27.8], [92, 28.4], [97.8, 30], [97.8, 27.8], [96, 27.8], [92, 26.9], [88, 26.6], [84, 27.2], [80.5, 28.8], [77.5, 30.6], [75.5, 32.2], [73.2, 32.8], [72, 34]]],
};
const soilOf = (k) => SOILS.find((s) => s.k === k);
const ORDER = ["red", "black", "alluvial", "laterite", "desert", "mountain"];
// show(k) → 0..1 opacity of each patch. Children are drawn in map coordinates.
function SoilMap({ x, y, s = 1, op = 1, show, id = "lp20clip", children }) {
  if (op <= 0 || !MAP) return null;
  return (
    <SVG op={op}>
      <defs><clipPath id={id}><path d={MAP.outline} />{MAP.islands.map((d, i) => <path key={i} d={d} />)}</clipPath></defs>
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <path d={MAP.outline} fill={BASE} />
        {MAP.islands.map((d, i) => <path key={i} d={d} fill={BASE} />)}
        <g clipPath={`url(#${id})`}>
          {ORDER.map((k) => { const o = show ? show(k) : 0; return o > 0 ? <g key={k} opacity={o}>{PATCH[k].map((p, i) => <path key={i} d={poly(p)} fill={soilOf(k).c} />)}</g> : null; })}
        </g>
        <path d={MAP.outline} fill="none" stroke={SK.cream} strokeWidth={3.2 / Math.max(0.45, s)} strokeLinejoin="round" />
        {MAP.islands.map((d, i) => <path key={i} d={d} fill="none" stroke={SK.cream} strokeWidth={2 / Math.max(0.45, s)} />)}
        {children}
      </g>
    </SVG>
  );
}
// Small "HOME" map in the top-right corner of the photo area: one soil lit.
function HomeMap({ k, lt, at, out = null, x = 1128, y = 56, s = 0.34, pin = null }) {
  const o = out3(lt, at, 0.6) * (out != null ? 1 - reveal(lt, out, 0.5) : 1); if (o <= 0) return null;
  const [px, py] = pin ? proj(pin[0], pin[1]) : [0, 0];
  return (
    <React.Fragment>
      <div style={{ position: "absolute", left: x - 16, top: y - 14, width: 735 * s + 32, height: 822 * s + 58, borderRadius: 18, background: "rgba(5,30,22,0.82)", opacity: o, boxShadow: "0 0 0 2px rgba(255,255,255,0.25)" }} />
      <SoilMap x={x} y={y} s={s} op={o} id={"lp20home" + k} show={(q) => (q === k ? clamp((lt - at - 0.3) / 0.6, 0, 1) : 0)}>
        {pin && <g transform={`translate(${px} ${py})`}><circle r={10 / s * 0.9 + 6 * Math.sin(lt * 4)} fill="none" stroke={SK.gold} strokeWidth={6} /><circle r={9} fill={SK.gold} /></g>}
      </SoilMap>
      <div style={{ position: "absolute", left: x - 16, top: y + 822 * s + 4, width: 735 * s + 32, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 24, color: SK.gold, opacity: o }}>HOME</div>
    </React.Fragment>
  );
}

// ---- Passport pieces --------------------------------------------------------------
// A round ink stamp that thumps down at `at` (big → small, slight tilt).
function RoundStamp({ s, n, x, y, r = 104, lt, at, tilt = -9 }) {
  const p = reveal(lt, at, 0.32); if (p <= 0) return null;
  const e = Easing.easeInCubic(p), sc = lerp(2.3, 1, e) + 0.06 * Math.sin(Math.PI * reveal(lt, at + 0.32, 0.25));
  const col = s.k === "black" || s.k === "mountain" ? s.c : s.c;
  return (
    <div style={{ position: "absolute", left: x - r, top: y - r, width: 2 * r, height: 2 * r, opacity: clamp(p * 2, 0, 1), transform: `scale(${sc}) rotate(${tilt}deg)`, zIndex: 2 }}>
      <svg width={2 * r} height={2 * r} viewBox="-110 -110 220 220">
        <circle r="106" fill={SK.cream} />
        <circle r="98" fill="none" stroke={col} strokeWidth="7" />
        <circle r="84" fill="none" stroke={col} strokeWidth="2.5" />
        <text y="-34" textAnchor="middle" fontFamily={SANS} fontWeight="700" fontSize="20" letterSpacing="2" fill={col}>STAMP {n}</text>
        <text y="16" textAnchor="middle" fontFamily={SERIF} fontWeight="700" fontSize={s.name.length > 6 ? 31 : 40} fill={col}>{s.name}</text>
        <text y="52" textAnchor="middle" fontFamily={SANS} fontWeight="700" fontSize="20" letterSpacing="2" fill={col}>SOIL</text>
      </svg>
    </div>
  );
}
// Row of six little stamps at the foot of the right panel. done = how many were filled before this
// beat; thumpAt = when the current one lands (null = none in this beat).
function Track({ lt, done = 0, thumpAt = null, at = 0.2 }) {
  const o = out3(lt, at, 0.6); if (o <= 0) return null;
  const x0 = PANEL_X + 39, gap = 68, y = 884, r = 29;
  return (
    <SVG op={o}>
      {SOILS.map((s, i) => {
        const cx = x0 + r + i * gap, on = i < done, cur = i === done && thumpAt != null;
        const p = cur ? reveal(lt, thumpAt, 0.3) : on ? 1 : 0;
        return (
          <g key={s.k} transform={`translate(${cx} ${y})`}>
            <circle r={r} fill="none" stroke={SK.inkDim} strokeWidth={2.5} strokeDasharray="5 5" />
            <text y={8} textAnchor="middle" fontFamily={SANS} fontWeight="700" fontSize="22" fill={SK.inkDim}>{i + 1}</text>
            {p > 0 && <g transform={`scale(${lerp(1.9, 1, Easing.easeInCubic(p))})`} opacity={clamp(p * 2, 0, 1)}>
              <circle r={r} fill={s.c} stroke={SK.cream} strokeWidth={2.5} /><circle r={r - 6} fill="none" stroke={s.ink} strokeWidth={1.5} opacity={0.7} />
              <text y={8} textAnchor="middle" fontFamily={SANS} fontWeight="700" fontSize="23" fill={s.ink}>{i + 1}</text></g>}
          </g>
        );
      })}
    </SVG>
  );
}
// The passport book: closed cover → opens to six empty stamp circles.
function Book({ x, y, lt, at, open, marks = [] }) {
  const o = pop(lt, at, 0.7); if (o <= 0) return null;
  const p = Easing.easeInOutCubic(reveal(lt, open, 1.0)), W2 = 270, H = 380;
  return (
    <SVG op={o}>
      <g transform={`translate(${x} ${y})`}>
        <rect x={-W2 - 8} y={-8} width={2 * W2 + 16} height={H + 16} rx={14} fill="#123A2B" opacity={p} />
        {[0, 1].map((side) => <g key={side} opacity={p} transform={`translate(${side ? 4 : -W2 - 4} 0)`}>
          <rect width={W2} height={H} rx={8} fill={SK.cream} />
          {[0, 1, 2].map((i) => { const cx = W2 / 2, cy = 66 + i * 122; const n = side * 3 + i + 1;
            return <g key={i}><circle cx={cx} cy={cy} r={50} fill="none" stroke={SK.goldDeep} strokeWidth={3} strokeDasharray="8 8" />
              <text x={cx} y={cy + 12} textAnchor="middle" fontFamily={SERIF} fontWeight="700" fontSize="36" fill={SK.goldDeep}>{n}</text></g>; })}
        </g>)}
        <rect x={-2} y={0} width={4} height={H} fill={SK.goldDeep} opacity={p} />
        {p < 1 && <g transform={`scale(${1 - p} 1)`}>
          <rect x={-W2 / 2 - 4} width={W2} height={H} rx={12} fill="#1E5631" stroke={SK.gold} strokeWidth={5} />
          <text y={140} textAnchor="middle" x={-4} fontFamily={SERIF} fontWeight="700" fontSize="44" fill={SK.gold}>SOIL</text>
          <text y={196} textAnchor="middle" x={-4} fontFamily={SERIF} fontWeight="700" fontSize="44" fill={SK.gold}>PASSPORT</text>
          <circle cx={-4} cy={280} r={36} fill="none" stroke={SK.gold} strokeWidth={4} />
        </g>}
      </g>
      {marks}
    </SVG>
  );
}
// A full stamp card (b11).
function StampCard({ s, n, x, y, w = 436, h = 292, lt, at, glow = 0 }) {
  const o = pop(lt, at, 0.5); if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, boxSizing: "border-box", background: SK.cream, borderRadius: 18, opacity: clamp(o, 0, 1), transform: `scale(${0.86 + 0.14 * o}) rotate(${(n % 2 ? -0.6 : 0.6)}deg)`,
      boxShadow: glow > 0 ? `0 0 0 ${7 * glow}px ${SK.gold}, 0 8px 24px rgba(0,0,0,0.35)` : "0 8px 24px rgba(0,0,0,0.35)", overflow: "hidden" }}>
      <div style={{ background: s.c, color: s.ink, fontFamily: SERIF, fontWeight: 700, fontSize: 34, padding: "9px 20px", display: "flex", justifyContent: "space-between" }}><span>{s.name}</span><span>{n}</span></div>
      <div style={{ padding: "10px 20px", fontFamily: SANS, color: SK.ink }}>
        <div style={{ fontWeight: 700, fontSize: 17, letterSpacing: "0.12em", color: SK.goldDeep }}>HOME</div>
        <div style={{ fontSize: 25, lineHeight: 1.14, marginBottom: 8 }}>{s.home}</div>
        <div style={{ fontWeight: 700, fontSize: 17, letterSpacing: "0.12em", color: SK.goldDeep }}>CROPS</div>
        <div style={{ fontSize: 25, lineHeight: 1.14 }}>{s.crops}</div>
      </div>
    </div>
  );
}

// ---- Shared pieces ---------------------------------------------------------------
const FX = 40, FY = 40, FW = 1360, FH = 930;   // the photo area
// Round photo tile with a chip under it.
function Node({ slot, label, x, y, r = 130, lt, at, size = 26, out = null }) {
  return (
    <React.Fragment>
      <Pic slot={slot} label={label} x={x - r} y={y - r} w={2 * r} h={2 * r} r={r} lt={lt} at={at} out={out} fx="pop" style={{ boxShadow: "0 0 0 5px " + SK.cream }} />
      <Chip text={label} x={x} y={y + r + 12} lt={lt} at={at + 0.15} out={out} size={size} />
    </React.Fragment>
  );
}
// Clip + frame for a drawn scene inside the photo area.
function Frame({ id, op = 1, children }) {
  return (
    <SVG op={op}>
      <defs><clipPath id={id}><rect x={FX} y={FY} width={FW} height={FH} rx={18} /></clipPath></defs>
      <g clipPath={`url(#${id})`}>{children}</g>
      <rect x={FX} y={FY} width={FW} height={FH} rx={18} stroke="rgba(255,255,255,0.55)" strokeWidth={3} />
    </SVG>
  );
}
// The countdown now comes from StopAt in engine/story-kit.jsx.
const Count = () => null;
// Compact pause bar: leaves the picture visible behind the question.
function StopBar({ lt, at, hold, text, n, x = 70, y = 64, w = 1300 }) {
  const o = windowOp(lt, at - 0.3, at + hold + 0.4, 0.35); if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: 150, borderRadius: 22, background: "rgba(5,30,22,0.92)", opacity: o, boxShadow: "0 0 0 3px rgba(226,176,76,0.9)",
      display: "flex", alignItems: "center", gap: 24, padding: "0 24px", boxSizing: "border-box" }}>
      <svg width="84" height="84" viewBox="0 0 90 90" style={{ flex: "none" }}><circle cx="45" cy="45" r="43" fill={SK.gold} /><rect x="28" y="24" width="12" height="42" rx="4" fill={SK.ink} /><rect x="50" y="24" width="12" height="42" rx="4" fill={SK.ink} /></svg>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 40, lineHeight: 1.12, color: SK.white }}>{text}</div>
        <div style={{ fontFamily: SANS, fontSize: 24, color: SK.dim, marginTop: 6 }}>Stop {n} of 3</div>
      </div>
      <div style={{ position: "relative", width: 110, height: 110, flex: "none" }}><Count lt={lt} at={at} hold={hold} x={0} y={0} /></div>
    </div>
  );
}
// A flat glass jar of soil.
function Jar({ x, y, c, lt, at, lit = 0, w = 170, h = 280 }) {
  const o = pop(lt, at, 0.5); if (o <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${(0.9 + 0.1 * o) * (1 + 0.07 * lit)})`} opacity={clamp(o, 0, 1)}>
      {lit > 0 && <ellipse cx={0} cy={h * 0.1} rx={w * 0.72} ry={h * 0.66} fill={SK.gold} opacity={0.32 * lit} />}
      <rect x={-w / 2} y={-h / 2 + 34} width={w} height={h - 34} rx={22} fill="rgba(255,255,255,0.14)" stroke="rgba(255,255,255,0.8)" strokeWidth={4} />
      <rect x={-w / 2 + 8} y={-h / 2 + 88} width={w - 16} height={h - 96} rx={15} fill={c} />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => <circle key={i} cx={-w / 2 + 26 + (i * 37) % (w - 50)} cy={-h / 2 + 112 + (i * 61) % (h - 140)} r={3 + (i % 3)} fill="rgba(255,255,255,0.14)" />)}
      <rect x={-w / 2 - 6} y={-h / 2} width={w + 12} height={40} rx={10} fill="#C9B79A" stroke="#7D6A4E" strokeWidth={3} />
      <rect x={-w / 2 + 16} y={-h / 2 + 52} width={12} height={h - 80} rx={6} fill="rgba(255,255,255,0.28)" />
    </g>
  );
}

// ============================================================================
// Scene 1 — a handful of soil, six jars, the big question.
function B1(ctx) {
  return ({ localTime: lt, duration }) => {
    const b = "b1", cIs = W(b, "is"), cBrown = W(b, "brown"), cBlack = W(b, "black"), cRed = W(b, "red"), cQ = W(b, "here"), cWheat = W(b, "why"), cCot = W(b, "while"), cFeet = W(b, "part");
    const jars = ["#A98F6E", "#2B2420", "#BE3F2A", "#8A4A2C", "#E0BE6A", "#5E4331"];
    const lit = (i) => (i === 0 ? windowOp(lt, cBrown, cBlack, 0.2) : i === 1 ? windowOp(lt, cBlack, cRed, 0.2) : i === 2 ? windowOp(lt, cRed, cQ - 0.2, 0.2) : 0);
    const soilUp = Easing.easeOutCubic(reveal(lt, cFeet + 0.2, 0.9));
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[1]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(1, ctx, [L("Soil types of India", 1.0, "big"), L("Why wheat here, cotton there?", cQ + 0.3, "think")])}>
        <Pic slot="soil_hand" label="A farmer's hand scooping up soil" x={FX} y={FY} w={FW} h={FH} lt={lt} at={0.2} out={cIs} kenDur={8} />
        <Frame id="b1j" op={windowOp(lt, cIs, cWheat + 0.5, 0.45)}>
          <rect x={FX} y={FY} width={FW} height={FH} fill={SK.bgDeep} />
          <rect x={FX} y={700} width={FW} height={18} fill="#C9B79A" />
          <rect x={FX} y={718} width={FW} height={260} fill="#123A2B" />
          {jars.map((c, i) => <Jar key={i} x={200 + i * 208} y={560} c={c} lt={lt} at={cIs + 0.1 * i} lit={lit(i)} />)}
        </Frame>
        <Pic slot="crop_wheat" label="Wheat in Punjab" x={FX} y={FY} w={672} h={FH} lt={lt} at={cWheat} fx="zoom" />
        <Pic slot="field_cotton" label="Cotton in Maharashtra" x={FX + 688} y={FY} w={672} h={FH} lt={lt} at={cCot} fx="zoom" />
        <Chip text="Punjab: WHEAT" x={376} y={70} lt={lt} at={cWheat + 0.5} size={34} tone="gold" />
        <Chip text="Maharashtra: COTTON" x={1064} y={70} lt={lt} at={cCot + 0.5} size={34} tone="gold" />
        {soilUp > 0 && <div style={{ position: "absolute", left: FX, top: 970 - 260 * soilUp, width: FW, height: 260 * soilUp, background: "linear-gradient(90deg,#A98F6E 0%,#A98F6E 49.4%,#0F3D2E 49.4%,#0F3D2E 50.6%,#2B2420 50.6%)", borderRadius: "0 0 18px 18px" }} />}
        <Big x={FX} y={760} w={672} size={46} align="center" lt={lt} at={cFeet + 0.9}>Soil under wheat</Big>
        <Big x={FX + 688} y={760} w={672} size={46} align="center" lt={lt} at={cFeet + 0.9}>Soil under cotton</Big>
      </Scene>
    );
  };
}

// Scene 2 — the map, six patches, the passport book opens.
function B2(ctx) {
  return ({ localTime: lt, duration }) => {
    const b = "b2", cMap = 0.2, cSix = W(b, "six"), cFav = W(b, "favourite"), cPass = W(b, "passport"), cName = W(b, "name"), cHome = W(b, "home"), cCrops = W(b, "crops", 1);
    const step = (cFav + 1.0 - cSix) / 6, t6 = (i) => cSix + i * step;
    const show = (k) => out3(lt, t6(SOILS.findIndex((s) => s.k === k)), 0.5);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[2]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(2, ctx, [L("Six main soils of India:", cSix, "head"), ...SOILS.map((s, i) => ({ at: t6(i) + 0.15, kind: "plain", text: <span style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ width: 30, height: 30, borderRadius: 8, background: s.c, boxShadow: "0 0 0 2px rgba(22,58,44,0.3)" }} />{s.name[0] + s.name.slice(1).toLowerCase()}</span> }))])}>
        <SoilMap x={40} y={70} s={1.0} op={out3(lt, cMap, 0.8)} show={show} />
        <Book x={1100} y={230} lt={lt} at={cPass - 1.2} open={cPass} />
        <Chip text="NAME" x={950} y={660} lt={lt} at={cName} size={34} tone="gold" />
        <Chip text="HOME" x={1100} y={660} lt={lt} at={cHome} size={34} tone="gold" />
        <Chip text="CROPS" x={1254} y={660} lt={lt} at={cCrops} size={34} tone="gold" />
        <Track lt={lt} done={0} at={cPass} />
      </Scene>
    );
  };
}

// Scene 3 — a river builds the northern plains, layer after layer.
function RiverDraw({ lt, cFlow, cDrop, cEnd, cYears }) {
  const k = drive(lt, cDrop, cEnd), L0 = 930, top = L0 - 240 * k;                // ground level rises with the layers
  const mx = 800, slope = (f) => [lerp(480, mx, f) + 34 * Math.sin(f * Math.PI * 3), lerp(205, top - 18, f)];
  const flat = (f) => [lerp(mx, 1400, f), top - 18];
  const go = reveal(lt, cFlow, 1.2);
  const ptcl = [];
  for (let i = 0; i < 46; i++) {
    const f = (lt * 0.13 + i / 46) % 1;
    let x, y, o = go;
    if (f < 0.42) [x, y] = slope(f / 0.42);
    else { const u = (f - 0.42) / 0.58, slow = 1 - (1 - u) * (1 - u); [x, y] = flat(slow); y += 16 * Math.sin(i * 2.4); if (lt > cDrop && u > 0.28) { y += (u - 0.28) * 70; o *= clamp((1 - u) * 5, 0, 1); } }
    ptcl.push(<circle key={i} cx={x} cy={y + 4 * Math.sin(i * 1.7)} r={3.6 + (i % 3)} fill="#E9D3A8" opacity={o} />);
  }
  const bands = [0, 1, 2, 3, 4, 5], bh = 40, bc = ["#8F7757", "#B59A78", "#9A8263", "#BFA583", "#A98F6E", "#C7AE8B"];
  return (
    <React.Fragment>
      <rect x={FX} y={FY} width={FW} height={FH} fill="#BFE3F0" />
      <rect x={FX} y={930} width={FW} height={60} fill="#5E5146" />
      {bands.map((i) => { const h = clamp(k * 6 - i, 0, 1) * bh; return h > 0 ? <rect key={i} x={FX} y={L0 - i * bh - h} width={FW} height={h} fill={bc[i]} /> : null; })}
      <path d={`M${mx} ${top - 26} L1400 ${top - 26} L1400 ${top + 2} L${mx} ${top + 2} Z`} fill={WATER} />
      <path d="M40 960 L40 640 L210 260 L330 400 L490 170 L650 420 L860 960 Z" fill="#7C8B8C" />
      <path d="M490 170 L446 234 L478 222 L500 246 L526 226 L552 268 Z M210 260 L178 332 L208 318 L234 340 L252 322 Z" fill="#F4F8FA" />
      <path d={"M" + [...Array(25)].map((_, i) => slope(i / 24).map((v) => v.toFixed(1)).join(" ")).join(" L")} stroke={WATER} strokeWidth={24} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={go} />
      {ptcl}
    </React.Fragment>
  );
}
function B3(ctx) {
  return ({ localTime: lt, duration }) => {
    const b = "b3", cRiv = W(b, "rivers"), cTiny = W(b, "tiny"), cDrop = W(b, "where"), cLay = W(b, "layer"), cTh = W(b, "thousands"), cPl = W(b, "that"), cFert = W(b, "alluvial", 1), cExc = W(b, "excellent"), cR = W(b, "rice"), cWh = W(b, "wheat"), cCane = W(b, "sugarcane");
    const cDraw = Math.max(0.3, S(b, 1) - 1.0);
    const yrs = Math.round(lerp(10, 10000, Easing.easeOutCubic(clamp((lt - cTh + 0.8) / 2.4, 0, 1))) / 10) * 10;
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[3]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(3, ctx, [F("MADE BY", "Rivers", cRiv + 0.3), F("HOME", "Northern plains, river valleys, coastal deltas", cPl + 0.6), F("CROPS", "Rice, wheat, sugarcane", cR)])}>
        <Frame id="b3f" op={windowOp(lt, 0.1, cPl + 0.6, 0.5)}><RiverDraw lt={lt} cFlow={cDraw + 0.3} cDrop={cDrop} cEnd={cPl} cYears={cTh} /></Frame>
        <Chip text="Mountains" x={470} y={84} lt={lt} at={cDraw + 0.4} out={cPl} size={30} />
        <Chip text="Layer after layer" x={1090} y={470} lt={lt} at={cLay + 1.4} out={cPl} size={30} tone="gold" />
        <Chip text="Tiny bits of soil" x={760} y={330} lt={lt} at={cTiny} out={cPl} size={30} tone="gold" />
        <Chip text="Water slows: soil drops" x={1090} y={470} lt={lt} at={cDrop + 0.4} out={cLay + 1.2} size={30} tone="gold" />
        {lt > cTh - 0.6 && lt < cPl + 0.4 && <div style={{ position: "absolute", left: 960, top: 90, width: 400, textAlign: "center", opacity: out3(lt, cTh - 0.6, 0.4), background: "rgba(5,30,22,0.82)", borderRadius: 18, padding: "12px 0" }}>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 72, color: SK.gold, lineHeight: 1.05 }}>{yrs.toLocaleString("en-GB")}</div>
          <div style={{ fontFamily: SANS, fontSize: 30, color: SK.white }}>years…</div></div>}
        <Pic slot="zone_plains" label="The northern plains" x={FX} y={FY} w={FW} h={FH} lt={lt} at={cPl} fx="zoom" />
        <HomeMap k="alluvial" lt={lt} at={cPl + 0.6} />
        <Chip text="Fertile · easy to plough" x={420} y={70} lt={lt} at={cFert + 0.4} size={34} tone="gold" />
        <Node slot="crop_rice" label="Rice" x={250} y={720} r={120} lt={lt} at={cR} />
        <Node slot="crop_wheat" label="Wheat" x={560} y={720} r={120} lt={lt} at={cWh} />
        <Node slot="field_cane" label="Sugarcane" x={870} y={720} r={120} lt={lt} at={cCane} />
        <RoundStamp s={SOILS[0]} n={1} x={1270} y={680} lt={lt} at={cWh + 0.3} />
        <Track lt={lt} done={0} thumpAt={cWh + 0.3} />
      </Scene>
    );
  };
}

// Scene 4 — lava → dark rock → black soil → clay → cotton.
function LavaDraw({ lt, cLava, cCool, cBreak }) {
  const fl = drive(lt, cLava, cLava + 3.2), cool = reveal(lt, cCool, 2), brk = drive(lt, cBreak, cBreak + 2.6);
  const glow = (lt * 3) % 1;
  const hot = (a) => `rgb(${Math.round(lerp(238, 58, a))},${Math.round(lerp(106, 50, a))},${Math.round(lerp(34, 48, a))})`;
  const L0 = 780, cones = [[290, 310], [1060, 350]];
  const specks = [];
  for (let i = 0; i < 90; i++) { const x = FX + 20 + (i * 151) % 1320, y = L0 - 12 + (i * 37) % 46; specks.push(<circle key={i} cx={x} cy={y} r={3 + i % 4} fill="#17120F" opacity={clamp(brk * 2.2 - ((i % 10) / 10), 0, 1)} />); }
  const cracks = [[180, 0], [420, 30], [640, -18], [860, 22], [1120, -6], [1300, 26]];
  return (
    <React.Fragment>
      <rect x={FX} y={FY} width={FW} height={FH} fill="#6F7078" />
      <rect x={FX} y={L0} width={FW} height={210} fill="#6A5A4C" />
      {cones.map(([cx, top], i) => <path key={i} d={`M${cx - 240} ${L0} L${cx - 42} ${top} L${cx + 42} ${top} L${cx + 240} ${L0} Z`} fill="#4B4039" opacity={1 - 0.75 * brk} />)}
      {/* lava down the cones and across the plateau */}
      <g opacity={reveal(lt, cLava - 0.2, 0.4)}>
        {cones.map(([cx, top], i) => <g key={i}>
          <path d={`M${cx - 44} ${top + 2} Q ${cx} ${top - 16} ${cx + 44} ${top + 2} L ${cx + 44 + 70 * fl} ${top + 200 * fl} Q ${cx} ${top + 240 * fl} ${cx - 44 - 90 * fl} ${top + 210 * fl} Z`} fill={hot(cool)} opacity={1 - brk * 0.8} />
          {cool < 0.4 && [0, 1, 2, 3].map((j) => <circle key={j} cx={cx + (j - 1.5) * 26 + 10 * Math.sin(lt * 5 + j)} cy={top - 24 - ((glow + j * 0.25) % 1) * 90} r={7 - j} fill="#F9B24A" />)}
        </g>)}
        <rect x={FX} y={L0 - 70 * fl} width={FW} height={70 * fl + 10} fill={hot(cool)} />
        {cool < 1 && [0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M${100 + i * 240 + 30 * Math.sin(lt + i)} ${L0 - 44 * fl} q 50 -14 100 0 t 100 0`} stroke="#FBC564" strokeWidth={5} fill="none" opacity={fl * (1 - cool)} />)}
        {cracks.map(([x, d], i) => <path key={i} d={`M${x} ${L0 - 70 * fl} l ${d} 30 l ${-d * 0.6} 22 l ${d * 0.5} 24`} stroke="#14100E" strokeWidth={5} fill="none" opacity={clamp(brk * 3 - i * 0.2, 0, 1)} />)}
      </g>
      <rect x={FX} y={L0 - 70 - 30 * brk} width={FW} height={110 * brk + 2} fill="#1E1916" opacity={clamp(brk * 2, 0, 1)} />
      <g transform={`translate(0 ${-92})`}>{specks}</g>
    </React.Fragment>
  );
}
function B4(ctx) {
  return ({ localTime: lt, duration }) => {
    const b = "b4", cLava = W(b, "volcanoes"), cCool = W(b, "lava", 1), cBreak = W(b, "slowly"), cBl = W(b, "black"), cClay = W(b, "rich"), cHold = W(b, "clay", 1), cLong = W(b, "long"), cWhich = W(b, "which"), cCot = W(b, "cotton"), cNick = W(b, "that"), cBCS = W(b, "black", 2);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[4]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(4, ctx, [F("HOME", "Deccan Plateau (Maharashtra, Gujarat, Madhya Pradesh)", cLava + 1.2), F("MADE FROM", "Ancient volcanic rock", cBreak), F("SUPERPOWER", "Holds water", cHold), F("CROP", "Cotton", cCot)])}>
        <Frame id="b4f" op={windowOp(lt, 0.1, cClay + 0.4, 0.5)}><LavaDraw lt={lt} cLava={cLava} cCool={cCool} cBreak={cBreak} /></Frame>
        <Big x={90} y={100} w={700} size={64} lt={lt} at={0.5} out={cLava + 0.3}>Millions of years ago…</Big>
        <Chip text="LAVA" x={700} y={560} lt={lt} at={cLava + 0.6} out={cCool} size={36} tone="gold" />
        <Chip text="Dark rock" x={700} y={560} lt={lt} at={cCool + 0.8} out={cBreak + 1} size={36} />
        <Chip text="Black soil" x={700} y={560} lt={lt} at={cBl} out={cClay + 0.3} size={36} tone="gold" />
        <HomeMap k="black" lt={lt} at={cLava + 1.2} out={cClay} />
        <Pic slot="clay_squeeze" label="Squeezing wet black soil: it is sticky" x={FX} y={FY} w={FW} h={FH} lt={lt} at={cClay} out={cHold} fx="zoom" />
        <Chip text="Sticky CLAY" x={720} y={70} lt={lt} at={cClay + 0.5} out={cHold} size={36} tone="gold" />
        <Pic slot="soil_water" label="Clay holds on to water" x={FX} y={FY} w={FW} h={FH} lt={lt} at={cHold} out={cWhich} fx="zoom" />
        <Chip text="Clay holds on to water" x={720} y={70} lt={lt} at={cHold + 0.5} out={cWhich} size={36} tone="gold" />
        <Pic slot="deccan_black" label="Black soil stays moist" x={FX} y={FY} w={FW} h={FH} lt={lt} at={cLong} out={cCot} fx="zoom" />
        <Pic slot="field_cotton" label="Cotton in black soil" x={FX} y={FY} w={FW} h={FH} lt={lt} at={cCot} fx="zoom" />
        <Badge text="BLACK COTTON SOIL" x={110} y={830} lt={lt} at={cBCS} size={46} />
        <RoundStamp s={SOILS[1]} n={2} x={1270} y={680} lt={lt} at={cBCS + 0.9} />
        <Track lt={lt} done={1} thumpAt={cBCS + 0.9} />
      </Scene>
    );
  };
}

// Scene 5 — two pots, the same water. Stop 1.
function Pot({ x, y, c, lt, at, wet, leak = 0 }) {
  // x,y = top-centre. wet 0..1 darkens the soil; leak 0..1 = puddle under the pot.
  return (
    <g transform={`translate(${x} ${y})`}>
      {leak > 0 && <ellipse cx={0} cy={342} rx={250 * leak} ry={30 * leak} fill={WATER} opacity={0.85} />}
      <path d="M-170 0 L170 0 L128 310 L-128 310 Z" fill="#B2623A" stroke="#7A3F22" strokeWidth={5} strokeLinejoin="round" />
      <path d="M-156 30 L156 30 L148 86 L-148 86 Z" fill={c} />
      <path d="M-152 44 L152 44 L146 86 L-146 86 Z" fill="rgba(20,40,70,1)" opacity={0.3 * wet} />
      <rect x={-188} y={-20} width={376} height={34} rx={10} fill="#C87547" stroke="#7A3F22" strokeWidth={5} />
    </g>
  );
}
function B5(ctx) {
  return ({ localTime: lt, duration }) => {
    const b = "b5", cSame = W(b, "same"), cSand = W(b, "sandy"), cClay = W(b, "clay"), cWhich = W(b, "which"), cTalk = W(b, "talk"), at = stopStart(b), hold = holdOf(b);
    const pour = Math.min(lt, cTalk);                                     // freeze frame at the stop
    const fl = windowOp(pour, cSame, cWhich + 0.6, 0.4);
    const seep = drive(pour, cSand + 0.5, cTalk), lvl = reveal(pour, cClay, 1.6);
    const P = [[400, 410, "#E0BE6A", "SANDY SOIL"], [1040, 410, "#2B2420", "CLAY SOIL"]];
    const stream = (x, y) => [0, 1, 2, 3, 4, 5, 6].map((i) => { const u = (pour * 1.7 + i / 7) % 1; return <circle key={i} cx={x + 3 * Math.sin(i * 2)} cy={y + u * 120} r={7} fill={WATER} opacity={fl} />; });
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[5]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(5, ctx, [L("Sandy soil or clay soil:", cWhich, "head"), L("which stays wet LONGER?", cWhich + 0.5, "think"), L("Talk to your partner.", cTalk, "big")])}>
        <Frame id="b5f"><rect x={FX} y={FY} width={FW} height={FH} fill="#DCE9DF" /><rect x={FX} y={760} width={FW} height={210} fill="#B9A58A" /></Frame>
        <SVG>
          {P.map(([x, y, c, name], i) => <g key={i}>
            {/* the can */}
            <g transform={`translate(${x - 90} 296)`} opacity={out3(lt, cSame - 0.2, 0.4)}>
              <rect x={-70} y={-54} width={120} height={96} rx={14} fill="#6E8C9C" /><path d="M50 -24 L112 -6 L112 12 L50 18 Z" fill="#6E8C9C" /><text x={-10} y={8} textAnchor="middle" fontFamily={SANS} fontWeight="700" fontSize="24" fill="#fff">Water</text>
            </g>
            {stream(x + 22, 306)}
            {i === 1 && <path d={`M${-150 + x} ${y + 34} L${150 + x} ${y + 34} L${150 + x} ${y + 34 - 26 * lvl} L${-150 + x} ${y + 34 - 26 * lvl} Z`} fill={WATER} opacity={lvl} />}
            <Pot x={x} y={y} c={c} wet={i === 0 ? 0.4 * seep : lvl} leak={i === 0 ? seep : 0} />
            {i === 0 && lt > cSand + 0.6 && [0, 1, 2, 3, 4].map((j) => { const u = (pour * 1.3 + j / 5) % 1; return <circle key={j} cx={x + (j - 2) * 34} cy={y + 314 + u * 30} r={7} fill={WATER} opacity={seep > 0 ? 1 : 0} />; })}
          </g>)}
        </SVG>
        <Chip text="Sandy soil" x={400} y={530} lt={lt} at={cSand} size={36} />
        <Chip text="Clay soil" x={1040} y={530} lt={lt} at={cClay} size={36} />
        <Chip text="Same water" x={720} y={260} lt={lt} at={cSame} out={at - 0.2} size={36} tone="gold" />
        <StopBar lt={lt} at={at} hold={hold} n={1} text="Sandy soil or clay soil: which stays wet LONGER?" />
        <Track lt={lt} done={2} />
      </Scene>
    );
  };
}

// Scene 6 — the rusting nail, red fields, Karnataka, Stop 2.
function Nail({ k, lt }) {
  // k 0..1 = rust. Flat nail lying across the frame.
  const spots = [[-360, -6, 40], [-250, 8, 54], [-120, -4, 46], [10, 6, 60], [140, -7, 44], [270, 4, 52], [370, -3, 36], [-430, 0, 34]];
  return (
    <g transform="translate(720 420) rotate(-8)">
      <rect x={-470} y={-23} width={880} height={46} fill="#9BA5AC" />
      <rect x={-470} y={-23} width={880} height={14} fill="#C6CED3" />
      <path d="M410 -23 L560 0 L410 23 Z" fill="#8C959C" />
      <rect x={-510} y={-74} width={44} height={148} rx={10} fill="#8C959C" />
      <rect x={-510} y={-74} width={16} height={148} rx={8} fill="#C6CED3" />
      <g opacity={clamp(k * 1.5, 0, 1)}>{spots.map(([x, y, r], i) => { const g = clamp(k * 2 - i * 0.12, 0, 1); return <ellipse key={i} cx={x} cy={y} rx={r * g * 1.5} ry={Math.min(25, r * g * 0.62)} fill={i % 2 ? "#A5482A" : "#BE5A33"} />; })}</g>
      <rect x={-470} y={-23} width={880} height={46} fill="#A9502F" opacity={clamp(k * 1.6 - 0.6, 0, 1)} />
      <rect x={-510} y={-74} width={44} height={148} rx={10} fill="#8F4327" opacity={clamp(k * 1.6 - 0.7, 0, 1)} />
    </g>
  );
}
function B6(ctx) {
  return ({ localTime: lt, duration }) => {
    const b = "b6", cSeen = W(b, "have"), cRust = W(b, "turn"), cRed = W(b, "red", 1), cIron = W(b, "from"), cFind = W(b, "you'll"), cKa = W(b, "karnataka"), cMil = W(b, "farmers"), cGn = W(b, "and", 0), cGround = W(b, "groundnuts"), cLook = W(b, "look"), at = stopStart(b), hold = holdOf(b);
    const k = drive(lt, cSeen + 0.4, cRed + 0.2);
    const day = Math.round(lerp(1, 60, clamp((lt - cSeen - 0.4) / Math.max(1, cRed + 0.2 - cSeen - 0.4), 0, 1)));
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[6]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(6, ctx, [F("COLOUR FROM", "Iron", cIron), F("HOME", "Eastern and southern Deccan, including south Karnataka, Tamil Nadu, Odisha", cFind + 0.4), F("CROPS", "Millets, groundnut", cMil + 0.3)])}>
        <Frame id="b6f" op={windowOp(lt, 0.1, cFind + 0.3, 0.5)}><rect x={FX} y={FY} width={FW} height={FH} fill="#E8E2D2" />
          <Nail k={k} lt={lt} />
          <circle cx={720} cy={420} r={0} />
          {lt > cIron && <g opacity={out3(lt, cIron, 0.6)}><rect x={300} y={640} width={840} height={130} rx={22} fill={SOILS[2].c} />
            <text x={720} y={724} textAnchor="middle" fontFamily={SERIF} fontWeight="700" fontSize="64" fill="#fff">IRON makes it red</text></g>}
        </Frame>
        {lt > cSeen && lt < cFind && <div style={{ position: "absolute", left: 80, top: 76, opacity: out3(lt, cSeen, 0.4), fontFamily: SERIF, fontWeight: 700, fontSize: 52, color: SK.ink, background: "rgba(255,255,255,0.75)", padding: "6px 26px", borderRadius: 14 }}>Day {day}</div>}
        <Pic slot="red_field" label="Red soil fields in southern India" x={FX} y={FY} w={FW} h={FH} lt={lt} at={cFind} fx="zoom" kenDur={22} />
        <HomeMap k="red" lt={lt} at={cFind + 0.5} pin={cKa < lt ? [76.2, 14] : null} />
        <Chip text="KARNATAKA" x={1212} y={410} lt={lt} at={cKa} out={at - 0.2} size={30} tone="gold" />
        <Pic slot="ragi_red" label="Ragi (a millet) in red soil" x={80} y={120} w={500} h={560} lt={lt} at={cMil} out={at - 0.4} fx="pop" />
        <Pic slot="groundnut_red" label="Groundnut plants in red soil" x={600} y={120} w={500} h={560} lt={lt} at={cGround} out={at - 0.4} fx="pop" />
        <Chip text="Ragi" x={330} y={700} lt={lt} at={cMil + 0.2} out={at - 0.4} size={32} />
        <Chip text="Groundnut" x={850} y={700} lt={lt} at={cGround + 0.2} out={at - 0.4} size={32} />
        <RoundStamp s={SOILS[2]} n={3} x={1270} y={680} lt={lt} at={cLook - 0.1} />
        <StopBar lt={lt} at={at} hold={hold} n={2} w={1040} text="What colour is the soil near YOUR school?" />
        <Track lt={lt} done={2} thumpAt={cLook - 0.1} />
      </Scene>
    );
  };
}

// Scene 7 — heat + heavy rain leach a hillside; tea, coffee, cashew.
function HillDraw({ lt, cHot, cRain, cSoak, cAway }) {
  const k = drive(lt, cSoak, cAway + 1.2), rain = reveal(lt, cRain, 0.5), rcol = (i) => (i ? "#9C5A36" : "#7C4A2E");
  const nut = [];
  for (let i = 0; i < 26; i++) {
    const x = 240 + (i * 83) % 960, y0 = 420 + (i * 47) % 110 + (x - 240) * 0.22, u = (lt * 0.35 + i * 0.13) % 1;
    const o = (1 - k) + k * (lt > cSoak ? 1 - u : 1);
    nut.push(<circle key={i} cx={x} cy={y0 + (lt > cSoak ? u * 260 * k : 0)} r={9} fill="#8BD48A" opacity={clamp(o, 0, 1) * (1 - 0.92 * clamp(k * 1.2 - 0.2, 0, 1))} />);
  }
  const drops = [];
  for (let i = 0; i < 60; i++) { const x = 80 + (i * 97) % 1280, u = (lt * 1.3 + i * 0.077) % 1; drops.push(<line key={i} x1={x - u * 40} y1={120 + u * 300} x2={x - 8 - u * 40} y2={146 + u * 300} stroke="#CFE9F8" strokeWidth={4} strokeLinecap="round" opacity={rain} />); }
  const surface = "M40 370 L1400 640";
  return (
    <React.Fragment>
      <rect x={FX} y={FY} width={FW} height={FH} fill="#8FB6C8" />
      <rect x={FX} y={FY} width={FW} height={FH} fill="#5C6E7A" opacity={rain * 0.7} />
      <g transform="translate(240 170)" opacity={1 - rain * 0.65}><circle r={74} fill={SK.gold} />{[0, 1, 2, 3, 4, 5, 6, 7].map((i) => { const a = i * Math.PI / 4 + lt * 0.3; return <line key={i} x1={92 * Math.cos(a)} y1={92 * Math.sin(a)} x2={122 * Math.cos(a)} y2={122 * Math.sin(a)} stroke={SK.gold} strokeWidth={9} strokeLinecap="round" />; })}</g>
      <g opacity={rain}><path d="M680 180 a 58 58 0 0 1 46 -82 a 76 76 0 0 1 138 8 a 50 50 0 0 1 70 74 Z" fill="#DDE6EE" /><path d="M1010 200 a 50 50 0 0 1 40 -70 a 66 66 0 0 1 118 6 a 44 44 0 0 1 60 64 Z" fill="#C9D4DE" /></g>
      <path d="M40 370 L1400 640 L1400 990 L40 990 Z" fill="#6C4A32" />
      <path d={`M40 370 L1400 640 L1400 ${640 + 110} L40 ${370 + 110} Z`} fill="#9A5A36" />
      <path d={`M40 370 L1400 640 L1400 ${640 + 110} L40 ${370 + 110} Z`} fill="#B5482A" opacity={k} />
      <path d={`M40 ${370 + 110} L1400 ${640 + 110}`} stroke="#3E2A1C" strokeWidth={5} opacity={k} />
      {nut}
      {drops}
      {[0, 1, 2, 3].map((i) => { const u = (lt * 0.6 + i * 0.25) % 1, x = 340 + i * 240; return <Arrow key={i} x1={x} y1={420 + (x - 340) * 0.2 + u * 40} x2={x} y2={520 + (x - 340) * 0.2 + u * 40} color={WATER} sw={9} head={24} op={reveal(lt, cSoak, 0.5) * (1 - u * 0.6)} />; })}
    </React.Fragment>
  );
}
function B7(ctx) {
  return ({ localTime: lt, duration }) => {
    const b = "b7", cHot = W(b, "hot"), cRain = W(b, "rains"), cSoak = W(b, "rain", 1), cNut = W(b, "nutrients"), cAway = W(b, "away"), cBut = W(b, "but"), cTea = W(b, "tea"), cCof = W(b, "coffee"), cCash = W(b, "cashew"), cKa = W(b, "karnataka");
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[7]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(7, ctx, [F("MADE BY", "Heavy rain and heat", cRain), F("CROPS", "Tea, coffee, cashew", cTea), F("HOME", "Karnataka, Kerala, Tamil Nadu, hills of Odisha and Assam", cKa)])}>
        <Frame id="b7f" op={windowOp(lt, 0.1, cBut + 0.3, 0.5)}><HillDraw lt={lt} cHot={cHot} cRain={cRain} cSoak={cSoak} cAway={cAway} /></Frame>
        <Chip text="HOT" x={240} y={282} lt={lt} at={cHot} out={cBut} size={36} tone="gold" />
        <Chip text="HEAVY RAIN" x={960} y={224} lt={lt} at={cRain} out={cBut} size={36} tone="gold" />
        <Chip text="Nutrients wash away" x={1050} y={860} lt={lt} at={cNut} out={cBut} size={32} />
        <Chip text="A hard, red, iron-rich layer" x={420} y={860} lt={lt} at={cAway + 0.5} out={cBut} size={32} />
        <Pic slot="laterite_hill" label="Hard red laterite soil on a rainy hill" x={FX} y={FY} w={FW} h={FH} lt={lt} at={cBut} fx="zoom" kenDur={12} />
        <Node slot="manure" label="Plenty of manure" x={360} y={290} r={150} lt={lt} at={cBut + 0.8} out={cTea - 0.2} size={30} />
        <Pic slot="tea_garden" label="A tea garden" x={70} y={70} w={430} h={560} lt={lt} at={cTea} fx="pop" />
        <Pic slot="coffee_shade" label="Coffee under shade trees" x={516} y={70} w={430} h={560} lt={lt} at={cCof} fx="pop" />
        <Pic slot="cashew_tree" label="A cashew tree with its fruit" x={962} y={70} w={410} h={560} lt={lt} at={cCash} fx="pop" />
        <Chip text="Tea" x={285} y={644} lt={lt} at={cTea + 0.2} size={32} />
        <Chip text="Coffee" x={731} y={644} lt={lt} at={cCof + 0.2} size={32} />
        <Chip text="Cashew" x={1167} y={644} lt={lt} at={cCash + 0.2} size={32} />
        <HomeMap k="laterite" lt={lt} at={cKa - 0.2} x={620} y={716} s={0.2} pin={[75.6, 12.4]} />
        <RoundStamp s={SOILS[3]} n={4} x={1270} y={710} r={90} lt={lt} at={cKa} />
        <Track lt={lt} done={3} thumpAt={cKa} />
      </Scene>
    );
  };
}

// Scene 8 — Thar sand, irrigation, bajra.
function B8(ctx) {
  return ({ localTime: lt, duration }) => {
    const b = "b8", cThar = W(b, "in"), cSandy = W(b, "it"), cSlip = W(b, "water"), cBut = W(b, "but"), cCanal = W(b, "with"), cHardy = W(b, "they"), cBaj = W(b, "bajra");
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[8]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(8, ctx, [F("HOME", "Thar Desert (Rajasthan, Gujarat)", cThar), F("TEXTURE", "Sandy, dry, holds little water", cSandy + 0.3), F("CROP", "Bajra, with irrigation", cBaj)])}>
        <Pic slot="thar_dunes" label="Sand dunes of the Thar Desert" x={FX} y={FY} w={FW} h={FH} lt={lt} at={0.2} fx="pan" out={cSlip} kenDur={12} />
        <HomeMap k="desert" lt={lt} at={cThar + 0.2} out={cSlip} />
        <Pic slot="sand_fingers" label="Sand slipping through fingers" x={FX} y={FY} w={FW} h={FH} lt={lt} at={cSlip - 1.4} out={cCanal} fx="zoom" />
        <Chip text="Water slips through quickly" x={720} y={70} lt={lt} at={cSlip + 0.4} out={cCanal} size={36} tone="gold" />
        <Pic slot="bajra_canal" label="Green bajra beside an irrigation canal" x={FX} y={FY} w={FW} h={FH} lt={lt} at={cCanal} fx="zoom" kenDur={10} />
        <Chip text="Canals + careful irrigation" x={460} y={70} lt={lt} at={cCanal + 0.6} size={36} tone="gold" />
        <Badge text="BAJRA: a hardy crop" x={110} y={830} lt={lt} at={cBaj} size={46} />
        <RoundStamp s={SOILS[4]} n={5} x={1270} y={680} lt={lt} at={cHardy + 0.4} />
        <Track lt={lt} done={4} thumpAt={cHardy + 0.4} />
      </Scene>
    );
  };
}

// Scene 9 — steep slopes, terraces, tea and apples.
function Steps({ lt, at, out }) {
  const o = out3(lt, at, 0.5) * (1 - reveal(lt, out, 0.4)); if (o <= 0) return null;
  const pts = [[0, 0], [90, 0], [90, 56], [180, 56], [180, 112], [270, 112], [270, 168], [360, 168]];
  return (
    <SVG op={o}>
      <g transform="translate(880 530)">
        <rect x={-34} y={-54} width={430} height={330} rx={20} fill="rgba(5,30,22,0.82)" />
        <path d={"M" + pts.map((p) => p.join(" ")).join(" L") + " L360 256 L0 256 Z"} fill="#6B4A33" />
        {[0, 1, 2, 3].map((i) => <rect key={i} x={i * 90 + 6} y={i * 56 - 10} width={78} height={10} rx={3} fill="#7CC47F" />)}
        {[0, 1, 2].map((i) => <rect key={i} x={(i + 1) * 90 - 7} y={i * 56} width={14} height={60} fill="#B6AFA3" />)}
        {[0, 1, 2, 3].map((i) => { const u = (lt * 1.2 + i * 0.25) % 1; return <line key={i} x1={45 + i * 90} y1={-46 + i * 56 + u * 24} x2={45 + i * 90} y2={-30 + i * 56 + u * 24} stroke={WATER} strokeWidth={5} strokeLinecap="round" />; })}
      </g>
    </SVG>
  );
}
function B9(ctx) {
  return ({ localTime: lt, duration }) => {
    const b = "b9", cOn = W(b, "on", 1), cSteps = W(b, "steps"), cTer = W(b, "terraces"), cThis = W(b, "this"), cTea = W(b, "tea"), cFruit = W(b, "fruit"), cApple = W(b, "apple"), cHim = W(b, "himalayas");
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[9]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(9, ctx, [F("HOME", "Hill slopes and Himalayan valleys", 1.4), L("Terraces hold the soil in place", cTer + 0.3, "think"), F("CROPS", "Tea, fruit orchards", cTea + 0.3)])}>
        <Pic slot="terraces" label="Step-like terraced fields in the Himalayas" x={FX} y={FY} w={FW} h={FH} lt={lt} at={0.2} out={cOn} fx="zoom" />
        <HomeMap k="mountain" lt={lt} at={1.2} out={cOn} />
        <Pic slot="soil_erosion" label="Rain washing soil off a slope" x={FX} y={FY} w={FW} h={FH} lt={lt} at={cOn} out={cSteps} fx="zoom" />
        <Chip text="Rain can wash soil away" x={720} y={70} lt={lt} at={cOn + 0.5} out={cSteps} size={36} tone="gold" />
        <Pic slot="terraces" label="Step-like terraced fields in the Himalayas" x={FX} y={FY} w={FW} h={FH} lt={lt} at={cSteps} out={cTea} fx="pan" kenDur={8} />
        <Chip text="TERRACES" x={460} y={70} lt={lt} at={cTer} out={cTea} size={40} tone="gold" />
        <Steps lt={lt} at={cTer + 0.3} out={cThis + 0.5} />
        <Pic slot="train_tea" label="Tea on a misty hillside" x={FX} y={FY} w={FW} h={FH} lt={lt} at={cTea} out={cApple} fx="zoom" kenDur={8} />
        <Chip text="Tea gardens" x={420} y={70} lt={lt} at={cTea + 0.3} out={cApple} size={36} tone="gold" />
        <Pic slot="apple_orchard" label="An apple orchard in the Himalayas" x={FX} y={FY} w={FW} h={FH} lt={lt} at={cApple} fx="zoom" kenDur={8} />
        <Chip text="Fruit orchards: apples" x={420} y={70} lt={lt} at={cApple + 0.3} size={36} tone="gold" />
        <RoundStamp s={SOILS[5]} n={6} x={1270} y={680} lt={lt} at={cApple + 0.3} />
        <Track lt={lt} done={5} thumpAt={cApple + 0.3} />
      </Scene>
    );
  };
}

// Scene 10 — WOW: regur, summer cracks, air, monsoon closes them, cotton stays green.
function CrackDraw({ lt, cCrack, cAir, cRain, cDry }) {
  const op = reveal(lt, cCrack - 0.2, 0.8) * (1 - reveal(lt, cRain + 0.8, 2)), rain = reveal(lt, cRain, 0.6) * (1 - reveal(lt, cDry, 0.8)), G = 480;
  const sum = 1 - rain;
  const dryCol = `rgb(${Math.round(lerp(43, 88, sum * 0.6))},${Math.round(lerp(36, 72, sum * 0.6))},${Math.round(lerp(32, 60, sum * 0.6))})`;
  const cracks = [190, 430, 700, 950, 1210];
  const drops = [];
  for (let i = 0; i < 56; i++) { const x = 70 + (i * 101) % 1300, u = (lt * 1.4 + i * 0.09) % 1; drops.push(<line key={i} x1={x} y1={70 + u * 390} x2={x - 6} y2={98 + u * 390} stroke="#CFE9F8" strokeWidth={4} strokeLinecap="round" opacity={rain} />); }
  const plants = [120, 330, 570, 830, 1080, 1320];
  return (
    <React.Fragment>
      <rect x={FX} y={FY} width={FW} height={FH} fill="#E9C98A" />
      <rect x={FX} y={FY} width={FW} height={FH} fill="#5C6E7A" opacity={rain * 0.85} />
      <g transform="translate(1210 160)" opacity={sum}><circle r={72} fill={SK.gold} /></g>
      <rect x={FX} y={G} width={FW} height={510} fill={dryCol} />
      {cracks.map((x, i) => <path key={i} d={`M${x - 34 * op} ${G - 1} L${x + 34 * op} ${G - 1} L${x + 9 * op} ${G + 150} L${x + 22 * op} ${G + 240} L${x} ${G + 370} L${x - 10 * op} ${G + 220} L${x - 22 * op} ${G + 120} Z`} fill="#0F0C0A" opacity={clamp(op * 2, 0, 1)} />)}
      {cracks.map((x, i) => { const u = (lt * 0.55 + i * 0.2) % 1, a = reveal(lt, cAir, 0.6) * (1 - reveal(lt, cRain, 0.4)); return <Arrow key={i} x1={x} y1={G - 150 + u * 70} x2={x} y2={G + 30 + u * 110} color={SK.cream} sw={10} head={28} op={a} />; })}
      {plants.map((x, i) => <g key={i} transform={`translate(${x} ${G})`}>
        <path d="M0 0 L0 -112" stroke="#2F7D3C" strokeWidth={9} />
        {[[-36, -40], [34, -60], [-30, -84], [28, -104]].map(([dx, dy], j) => <ellipse key={j} cx={dx} cy={dy} rx={36} ry={17} fill="#3F9E4C" transform={`rotate(${dx < 0 ? 22 : -22} ${dx} ${dy})`} />)}
        {[[-12, -120], [14, -128]].map(([dx, dy], j) => <circle key={j} cx={dx} cy={dy} r={15} fill="#fff" />)}
      </g>)}
      {drops}
    </React.Fragment>
  );
}
function B10(ctx) {
  return ({ localTime: lt, duration }) => {
    const b = "b10", cWow = 0.25, cName = W(b, "the"), cReg = W(b, "regur"), cHot = W(b, "in"), cDeep = W(b, "deep"), cAir = W(b, "air"), cMix = W(b, "and", 1), cSelf = W(b, "people"), cHold = W(b, "because"), cDry = W(b, "cotton"), cLess = W(b, "less");
    const cDraw = cHot + 0.7;
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[10]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(10, ctx, [L("REGUR", cReg, "big"), L("Summer cracks let AIR in", cAir + 0.3), L("“Self-ploughing” soil", cSelf + 0.3), L("Holds so much water that cotton can grow with less rain", cHold + 0.4)])}>
        <Pic slot="soil_cracks" label="Deep cracks in dry black soil" x={FX} y={FY} w={FW} h={FH} lt={lt} at={0.1} out={cDraw + 0.8} fx="zoom" dim={0.28} />
        {lt < cDraw + 0.4 && <div style={{ position: "absolute", inset: 0, opacity: 1 - reveal(lt, cDraw - 0.1, 0.4) }}>
          <Flip x={320} y={200} w={800} h={440} lt={lt} at={cWow + 0.3} size={120} q={lt > cReg ? "REGUR" : "WOW!"} />
          {lt > cReg + 0.3 && <div style={{ position: "absolute", left: 320, width: 800, top: 680, textAlign: "center", fontFamily: SERIF, fontWeight: 700, fontSize: 46, color: SK.white, opacity: out3(lt, cReg + 0.3, 0.5), textShadow: "0 2px 14px rgba(0,0,0,0.7)" }}>the black soil of the Deccan</div>}
        </div>}
        <Frame id="b10f" op={out3(lt, cDraw, 0.6) * (1 - reveal(lt, cLess + 1.1, 0.5))}><CrackDraw lt={lt} cCrack={cDeep} cAir={cAir} cRain={cHold} cDry={cDry} /></Frame>
        <Chip text="Hot summer" x={1160} y={260} lt={lt} at={cDraw + 0.3} out={cHold} size={34} tone="gold" />
        <Chip text="Air rushes in" x={320} y={120} lt={lt} at={cAir} out={cHold} size={36} tone="gold" />
        <Big x={70} y={760} w={1300} size={64} align="center" lt={lt} at={cSelf + 0.1} out={cHold}>“SELF-PLOUGHING” soil</Big>
        <Chip text="Soil mixed and refreshed" x={720} y={700} lt={lt} at={cMix + 0.2} out={cSelf} size={36} />
        <Chip text="Monsoon rain: the cracks close" x={720} y={80} lt={lt} at={cHold + 0.3} out={cDry} size={36} tone="gold" />
        <Chip text="Less rain: cotton stays green" x={720} y={80} lt={lt} at={cDry + 0.3} out={cLess + 1.1} size={36} tone="gold" />
        <Pic slot="field_cotton" label="Cotton stays green" x={FX} y={FY} w={FW} h={FH} lt={lt} at={cLess + 0.9} fx="zoom" />
        <Track lt={lt} done={6} />
      </Scene>
    );
  };
}

// Scene 11 — the full passport, quick check, Stop 3, the last line.
function B11(ctx) {
  return ({ localTime: lt, duration }) => {
    const b = "b11", cQ = W(b, "quick"), cWhich = W(b, "which"), cRice = W(b, "rice"), cCot = W(b, "cotton"), cTea = W(b, "tea"), at = stopStart(b), hold = holdOf(b),
      cA = W(b, "alluvial"), cB = W(b, "black"), cL = W(b, "laterite"), cNext = W(b, "next"), cGrow = W(b, "grow");
    const X = (i) => 62 + (i % 3) * 446, Y = (i) => 52 + Math.floor(i / 3) * 302, cw = 436, ch = 292;
    // Crop tiles: wait in a row under the stamps, then slide to their soil on the answer.
    const tiles = [["crop_wheat", "Rice and wheat", 190, cRice, cA, 0], ["cotton_boll", "Cotton", 500, cCot, cB, 1], ["tea_garden", "Tea, coffee, cashew", 810, cTea, cL, 3]];
    const gl = (t, end) => windowOp(lt, t + 0.5, cNext, 0.3);
    const endOp = out3(lt, cNext, 0.7);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[11]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(11, ctx, [L("Quick check: which soil?", cQ, "head"), L("1. Rice and wheat → ?", cRice), L("2. Cotton → ?", cCot), L("3. Tea, coffee, cashew in heavy rain → ?", cTea),
          L("Alluvial", cA + 0.2, "big"), L("Black", cB + 0.2, "big"), L("Laterite", cL + 0.2, "big")])}>
        {SOILS.map((s, i) => <StampCard key={s.k} s={s} n={i + 1} x={X(i)} y={Y(i)} w={cw} h={ch} lt={lt} at={0.2 + i * 0.18}
          glow={i === 0 ? gl(cA) : i === 1 ? gl(cB) : i === 3 ? gl(cL) : 0} />)}
        {tiles.map(([slot, label, x0, t0, ans, si]) => {
          if (lt < t0) return null;
          const m = Easing.easeInOutCubic(reveal(lt, ans, 0.8));
          const x = lerp(x0, X(si) + cw - 66, m), y = lerp(790, Y(si) + ch - 62, m), r = lerp(100, 50, m);
          return <React.Fragment key={slot}>
            <Pic slot={slot} label={label} x={x - r} y={y - r} w={2 * r} h={2 * r} r={r} lt={lt} at={t0} fx="pop" style={{ boxShadow: "0 0 0 4px " + SK.gold }} />
            <Chip text={label} x={x0} y={900} lt={lt} at={t0 + 0.15} out={ans} size={28} />
          </React.Fragment>;
        })}
        {lt > at - 0.3 && lt < at + hold + 0.4 && <div style={{ position: "absolute", left: 1030, top: 680, width: 270, textAlign: "center", opacity: windowOp(lt, at - 0.3, at + hold + 0.4, 0.35) }}>
          <div style={{ position: "relative", height: 116 }}><Count lt={lt} at={at} hold={hold} x={80} y={0} /></div>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 36, color: SK.gold }}>Which soil?</div>
          <div style={{ fontFamily: SANS, fontSize: 23, color: SK.dim, lineHeight: 1.15, marginTop: 4 }}>Stop 3 of 3</div>
        </div>}
        <Pic slot="soil_hand" label="A farmer's hand scooping up soil" x={FX} y={FY} w={FW} h={FH} lt={lt} at={cNext} fx="zoom" kenDur={8} />
        <Big x={70} y={760} w={1300} size={72} align="center" lt={lt} at={cGrow - 0.2}>What can it GROW?</Big>
        <Track lt={lt} done={6} />
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
const COLLAGE = [{ slot: "field_cotton", x: -60, y: -40, w: 760, h: 520, ph: 0 }, { slot: "zone_plains", x: 640, y: -80, w: 760, h: 520, ph: 2 },
  { slot: "soil_cracks", x: -80, y: 520, w: 700, h: 560, ph: 4 }, { slot: "tea_garden", x: 560, y: 560, w: 820, h: 560, ph: 1 }];
function SoilScenes(props = {}) {
  const caps = props.showCaptions === "false" ? false : props.showCaptions !== false;
  const titles = {};
  for (let n = 1; n <= NB; n++) titles[n] = str(props["title" + n + "Text"], TITLES[n]);
  const ctx = { caps, titles, capSize: num(props.captionSize, 34) };
  const B = [B1, B2, B3, B4, B5, B6, B7, B8, B9, B10, B11];
  const beats = B.map((Bn, i) => { const t = BEAT("b" + (i + 1)); return [t.start, t.start + t.dur, Bn]; });
  return (
    <StoryFrame props={props} dur={DUR} persistKey="thinkpro-lp20-soil-types-and-crops" collage={COLLAGE}>
      {beats.map(([s, e, Bn], i) => (
        <Sprite key={i} start={s} end={e}>{Bn(ctx)}</Sprite>
      ))}
      {STOPS.map(([b]) => <StopAt key={b} t={BEAT(b).start + stopStart(b)} hold={holdOf(b)} />)}
      <ChimeAt t={BEAT("b10").start + 0.4} />
      <AudioSync />
    </StoryFrame>
  );
}
window.SoilScenes = SoilScenes;
