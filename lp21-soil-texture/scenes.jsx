/* global React, window */
// ThinkPro Academy — "LP21 – Soil Texture" (Grade 6 Agriculture, Session 21, V1).
// After AG_G6_S21_Video_Script_Soil_Texture (Subrata, 4 Nov 2026): 11 script scenes = 11 voiced beats,
// three presenter stops (b5, b8, b11; TPStory.StopAt freezes the web player, the export holds the card),
// one WOW card (cocopeat). Running idea: SANDY, SILTY and CLAY are three characters and a soil's texture
// is who is in the team (Mate, drawn here). Other central models: the funnel test (Funnel: b5 stop, plays
// silently after the stop, carries into b6, loam in b7), the gaps view (Pores: b4 sand, b6 clay) and the
// soil jars (Jar: b10, b11). STORY STYLE (engine/story-kit.jsx). Pure function of time.
const { Sprite } = window;
const { reveal, windowOp } = window.TPMotion;
const { num, str } = window.TPStage;
const { SK, SERIF, SANS, LEFT_W, pop, out3, lerp, drive,
  Pic, Chip, Badge, Big, Card, SVG, Arrow, T, ChimeAt, Scene, StoryFrame, StopAt, Flip } = window.TPStory;

// ---- Timing: EVERYTHING is keyed to the narration (tools/fit_timing.py → timing.js).
const TM = window.TP_TIMING;
if (!TM) console.error("timing.js missing — run: python3 tools/fit_timing.py videos/lp21-soil-texture");
const LEAD = TM ? TM.lead : 1.0;
const DUR = TM ? TM.total : 265;
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
const rnd = (i) => { const x = Math.sin(i * 12.9898 + 4.1) * 43758.5453; return x - Math.floor(x); };

// ---- Panel copy. Title defaults mirror the DC data-props (titleNText) — keep in sync. ----
const TITLES = { 1: "LP21 – Soil Texture", 2: "Soil texture", 3: "Why texture matters", 4: "Sandy soil", 5: "Predict", 6: "Clayey soil",
  7: "Loamy soil", 8: "Feel test", 9: "WOW! Cocopeat", 10: "Recap", 11: "Quick check" };
const KICK = "Agriculture · Grade 6 · Session 21";
const panel = (n, ctx, lines, extra = {}) => ({ kicker: KICK, title: ctx.titles[n], lines, ...extra });
const L = (text, at, kind = "item", extra = {}) => ({ text, at, kind, ...extra });

// ---- Presenter stops: [beat, sentence whose pauseAfter holds it, stop s, heading, question].
// b5 and b8 hold longer than the stop: the rest of the silence plays the answer.
const STOPS = [
  ["b5", 3, 5.0, "PREDICT", "Which glass fills FIRST? Which fills LAST?"],
  ["b8", 5, 5.0, "FEEL TEST", "Which soil is which?"],
  ["b11", 1, 6.0, "QUICK CHECK", "Which soil suits each crop?"],
];
const stopAt = (b, i) => SE(b, i) + 0.1;
const stopFor = (b) => STOPS.find((s) => s[0] === b);
const stopEnd = (b) => { const s = stopFor(b); return stopAt(b, s[1]) + s[2]; };
// The kit's StopCard fills the photo area; these stops must leave the picture in view, so this is a band
// across the top with a heading of its own.
function StopBand({ lt, b }) {
  const s = stopFor(b), at = stopAt(b, s[1]), n = STOPS.indexOf(s) + 1;
  const o = windowOp(lt, at, at + s[2], 0.3); if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 40, top: 60, width: LEFT_W - 80, height: 190, borderRadius: 22, background: "rgba(5,30,22,0.92)", opacity: o, zIndex: 3,
      boxShadow: "0 0 0 3px rgba(226,176,76,0.9)", display: "flex", alignItems: "center", gap: 34, padding: "0 40px", boxSizing: "border-box" }}>
      <svg width="96" height="96" viewBox="0 0 90 90" style={{ flex: "none" }}><circle cx="45" cy="45" r="43" fill={SK.gold} /><rect x="28" y="24" width="12" height="42" rx="4" fill={SK.ink} /><rect x="50" y="24" width="12" height="42" rx="4" fill={SK.ink} /></svg>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 28, letterSpacing: "0.08em", color: SK.ink, background: SK.gold, padding: "6px 22px", borderRadius: 12 }}>{s[3]}</span>
          <span style={{ fontFamily: SANS, fontSize: 24, color: SK.dim }}>Stop {n} of {STOPS.length}</span>
        </div>
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 50, lineHeight: 1.15, color: SK.white, marginTop: 14, whiteSpace: "nowrap" }}>{s[4]}</div>
      </div>
    </div>
  );
}

// ---- Palette for the soils ---------------------------------------------------------
const C = { sand: "#E3C27E", sandD: "#C39F5C", silt: "#B7977A", siltD: "#94775C", clay: "#BC6A42", clayD: "#964D2C", loam: "#5E4330", water: "#6EC6F2", waterD: "#3E9FD4", face: "#2B2118" };

// Red warning tag (the kit's Chip has no red tone).
function Tag({ text, x, y, lt, at, out = null, size = 28 }) {
  const o = pop(lt, at) * (out != null ? 1 - reveal(lt, out, 0.4) : 1); if (o <= 0) return null;
  return <div style={{ position: "absolute", left: x, top: y, transform: `translateX(-50%) scale(${0.9 + 0.1 * o})`, transformOrigin: "center top", opacity: o, fontFamily: SANS, fontWeight: 700,
    fontSize: size, color: SK.white, background: "#B3261E", padding: "6px 18px", borderRadius: 999, whiteSpace: "nowrap", boxShadow: "0 2px 10px rgba(0,0,0,0.25)" }}>{text}</div>;
}

// ---- The running idea: the three particle characters ---------------------------------
const MATE = {
  sand: { body: "M-92 -30 C -84 -82, -30 -104, 18 -98 C 72 -92, 104 -48, 98 4 C 94 58, 52 98, -2 98 C -58 98, -106 44, -92 -30 Z", fill: C.sand, dots: C.sandD, eye: 13, sp: 34, ey: -16, m: 30, my: 28, sw: 7 },
  silt: { body: "M-60 0 C -60 -38, -30 -60, 2 -60 C 38 -60, 60 -32, 60 2 C 60 36, 34 60, 0 60 C -34 60, -60 34, -60 0 Z", fill: C.silt, dots: C.siltD, eye: 9, sp: 22, ey: -10, m: 19, my: 18, sw: 5 },
  clay: { body: "M-50 -6 C -46 -18, -22 -22, 4 -21 C 30 -20, 50 -16, 52 -2 C 54 12, 32 20, 4 21 C -26 22, -54 12, -50 -6 Z", fill: C.clay, dots: C.clayD, eye: 5.5, sp: 15, ey: -5, m: 10, my: 8, sw: 3.5 },
};
function Mate({ kind, x, y, s = 1, o = 1, happy = 1 }) {
  if (o <= 0 || s <= 0) return null;
  const M = MATE[kind];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={clamp(o, 0, 1)}>
      <path d={M.body} fill={M.fill} />
      {kind !== "clay" && [[-52, 42], [58, 34], [-30, 66], [40, -58], [-58, -36], [20, 70]].map(([dx, dy], i) => { const k = kind === "sand" ? 1 : 0.6; return <circle key={i} cx={dx * k} cy={dy * k} r={M.sw * 0.8} fill={M.dots} />; })}
      {[-1, 1].map((d) => <g key={d}><circle cx={d * M.sp} cy={M.ey} r={M.eye} fill={SK.white} /><circle cx={d * M.sp + M.eye * 0.2} cy={M.ey + M.eye * 0.15} r={M.eye * 0.55} fill={C.face} /></g>)}
      <path d={`M${-M.m} ${M.my} Q 0 ${M.my + M.m * 0.9 * happy}, ${M.m} ${M.my}`} stroke={C.face} strokeWidth={M.sw} strokeLinecap="round" />
    </g>
  );
}
const hop = (lt, ph = 0, a = 6) => a * Math.sin(lt * 3.2 + ph);
// The three, arms linked. x = centre, y = ground line for Sandy; s scales the group.
function Team({ x, y, s = 1, o = 1, lt = 0 }) {
  if (o <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
      <path d="M-120 10 Q -75 62, -30 10 M30 10 Q 95 62, 160 -10" stroke={SK.cream} strokeWidth="10" strokeLinecap="round" />
      <Mate kind="sand" x={-195} y={-10 + hop(lt, 0)} s={1} />
      <Mate kind="silt" x={0} y={-14 + hop(lt, 1.4)} s={1.05} />
      <Mate kind="clay" x={210} y={-22 + hop(lt, 2.6)} s={1.25} />
    </g>
  );
}
// Three-part bar: how much of each is in the team. mix = [sand, silt, clay], summing to 1.
function MixBar({ x, y, w, h, mix, o = 1 }) {
  if (o <= 0) return null;
  let a = x; const cols = [C.sand, C.silt, C.clay], names = ["SAND", "SILT", "CLAY"];
  return (
    <g opacity={o}>
      {mix.map((m, i) => { const bw = m * w, r = <g key={i}><rect x={a} y={y} width={Math.max(0, bw - 3)} height={h} rx={10} fill={cols[i]} />
        {bw > 110 && <T x={a + bw / 2} y={y + h / 2 + 11} size={32} bold color={SK.ink}>{names[i]}</T>}</g>; a += bw; return r; })}
    </g>
  );
}

// ---- Gaps view: why water rushes through sand and sits on clay ------------------------
function Pores({ kind, x, y, w, h, lt, at, out = null }) {
  const o = out3(lt, at, 0.6) * (out != null ? 1 - reveal(lt, out, 0.5) : 1); if (o <= 0) return null;
  const t = lt - at, H = h, Wd = w;
  let body;
  if (kind === "sand") {
    const r = 64, g = 30, cols = 4, step = 2 * r + g, ox = (Wd - cols * step + g) / 2, rows = 5, oy = 96;
    body = <>
      {Array.from({ length: cols * rows }, (_, i) => <circle key={i} cx={ox + r + (i % cols) * step} cy={oy + r + Math.floor(i / cols) * (2 * r + 14)} r={r} fill={i % 3 === 1 ? C.sandD : C.sand} />)}
      {Array.from({ length: 30 }, (_, i) => { const col = i % (cols - 1), dx = ox + 2 * r + g / 2 + col * step, p = ((Math.max(0, t) * 0.75 + rnd(i)) % 1);
        return <ellipse key={"d" + i} cx={dx} cy={p * H} rx={10} ry={22} fill={C.water} />; })}
    </>;
  } else {
    const fw = 124, fh = 24, top = 200, rowsN = 12;
    body = <>
      <rect x={0} y={96} width={Wd} height={top - 96 + 4} fill={C.water} />
      {Array.from({ length: rowsN }, (_, r) => Array.from({ length: 7 }, (_, c) => <rect key={r * 10 + c} x={-40 + c * (fw + 3) + (r % 2 ? 62 : 0)} y={top + r * (fh + 3)} width={fw} height={fh} rx={11} fill={(r + c) % 3 === 1 ? C.clayD : C.clay} />))}
      {[0, 1].map((i) => { const p = (((Math.max(0, t) + i * 4.5) % 9) / 9); return <ellipse key={i} cx={210 + i * 240} cy={top + p * (H - top)} rx={7} ry={11} fill={C.water} opacity={0.9} />; })}
    </>;
  }
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 18, overflow: "hidden", opacity: o, background: "#2A1C12", boxShadow: "0 0 0 3px rgba(255,255,255,0.55)" }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: "absolute", inset: 0 }}>{body}</svg>
    </div>
  );
}

// ---- The funnel test ------------------------------------------------------------------
// tp = seconds since this cup started to pour (negative = not yet).
const LEVEL = { sand: (t) => 0.82 * drive(t, 0.8, 3.4), clay: (t) => 0.14 * clamp((t - 2) / 16, 0, 1), loam: (t) => 0.42 * drive(t, 1.8, 8) };
const FTOP = 390, GTOP = 660, GH = 210, GW = 190;
function Funnel({ cx, kind, lt, at, tp, op = 1, q = 0 }) {
  const o = pop(lt, at) * op; if (o <= 0) return null;
  const soil = { sand: C.sand, clay: C.clay, loam: C.loam }[kind];
  const t = tp;
  const tilt = t <= 0 ? 0 : 62 * clamp(t / 0.7, 0, 1) * (1 - clamp((t - 2.2) / 0.6, 0, 1));
  const left = 1 - clamp((t - 0.4) / 1.7, 0, 1);              // water left in the cup
  const lvl = LEVEL[kind](Math.max(0, t)) * GH;
  const pondH = kind === "clay" ? 44 * clamp((t - 0.8) / 1.2, 0, 1) * (1 - 0.3 * clamp((t - 6) / 14, 0, 1)) : (kind === "loam" ? 30 : 16) * clamp((t - 0.8) / 0.8, 0, 1) * (1 - clamp((t - 2.6) / 1.6, 0, 1));
  const stemEnd = FTOP + 240;
  const beats = kind === "clay" ? 2.4 : 0.55;
  const drops = t > (kind === "clay" ? 2 : 1.8) && !(kind === "sand")
    ? [0, 1, 2].map((i) => { const p = (((t + i * beats) % (beats * 3)) / (beats * 3)); return [p]; }) : [];
  const stream = kind === "sand" && t > 0.8 && t < 3.3;
  const sc = 0.8 + 0.2 * Math.min(1, o);
  return (
    <SVG op={Math.min(1, o)}>
      <g transform={`translate(${cx} 0) scale(${sc}) translate(${-cx} 0)`}>
        {/* cup */}
        <g transform={`translate(${cx - 118} 330) rotate(${tilt})`}>
          <path d="M-46 -48 L46 -48 L38 48 L-38 48 Z" fill="rgba(255,255,255,0.22)" stroke={SK.white} strokeWidth="4" />
          {left > 0 && <path d={`M${-44 + 6 * (1 - left * 0.8)} ${46 - 86 * left * 0.8 - 2} L${44 - 6 * (1 - left * 0.8)} ${46 - 86 * left * 0.8 - 2} L38 46 L-38 46 Z`} fill={C.water} />}
        </g>
        {t > 0.6 && t < 2.3 && <path d={`M${cx - 62} 318 Q ${cx - 30} 330, ${cx - 26} ${FTOP + 22}`} stroke={C.water} strokeWidth="11" strokeLinecap="round" />}
        {/* funnel with soil */}
        <path d={`M${cx - 118} ${FTOP + 38} L${cx + 118} ${FTOP + 38} L${cx + 20} ${FTOP + 158} L${cx - 20} ${FTOP + 158} Z`} fill={soil} />
        {pondH > 0 && <path d={`M${cx - 118 - pondH * 0.82} ${FTOP + 38 - pondH} L${cx + 118 + pondH * 0.82} ${FTOP + 38 - pondH} L${cx + 118} ${FTOP + 38} L${cx - 118} ${FTOP + 38} Z`} fill={C.water} />}
        <path d={`M${cx - 150} ${FTOP} L${cx + 150} ${FTOP} L${cx + 20} ${FTOP + 160} L${cx + 20} ${stemEnd} L${cx - 20} ${stemEnd} L${cx - 20} ${FTOP + 160} Z`} fill="rgba(255,255,255,0.10)" stroke={SK.white} strokeWidth="5" strokeLinejoin="round" />
        {/* falling water */}
        {stream && <rect x={cx - 10} y={stemEnd - 6} width={20} height={GTOP + GH - stemEnd - lvl + 6} fill={C.water} />}
        {drops.map(([p], i) => <ellipse key={i} cx={cx} cy={stemEnd + p * (GTOP + GH - stemEnd - lvl)} rx={8} ry={13} fill={C.water} />)}
        {/* glass */}
        {lvl > 0 && <rect x={cx - GW / 2 + 4} y={GTOP + GH - lvl} width={GW - 8} height={lvl - 3} fill={C.water} rx={6} />}
        <path d={`M${cx - GW / 2} ${GTOP} L${cx - GW / 2} ${GTOP + GH} L${cx + GW / 2} ${GTOP + GH} L${cx + GW / 2} ${GTOP}`} stroke={SK.white} strokeWidth="6" strokeLinejoin="round" strokeLinecap="round" />
        {q > 0 && <text x={cx} y={GTOP + 140} textAnchor="middle" fontFamily={SERIF} fontWeight="700" fontSize="100" fill={SK.gold} opacity={q}>?</text>}
      </g>
    </SVG>
  );
}
const FX = { sand: 280, clay: 720, loam: 1160 };
function Rig({ lt, ats, tp, q = 0, ops = {} }) {
  return <>{["sand", "clay", "loam"].map((k, i) => <React.Fragment key={k}>
    <Funnel cx={FX[k]} kind={k} lt={lt} at={ats[i]} tp={tp} q={q} op={ops[k] == null ? 1 : ops[k]} />
    <Chip text={k.toUpperCase()} x={FX[k]} y={884} lt={lt} at={ats[i]} tone="cream" size={28} op={ops[k] == null ? 1 : ops[k]} />
  </React.Fragment>)}</>;
}

// ---- Soil jars --------------------------------------------------------------------------
function JarFill({ cx, top, w, bot, kind, id }) {
  const x0 = cx - w / 2, Ht = bot - top, parts = [];
  const add = (fn, n) => { for (let i = 0; i < n; i++) parts.push(fn(i)); };
  if (kind === "sand") add((i) => <circle key={i} cx={x0 + rnd(i) * w} cy={top + rnd(i + 90) * Ht} r={10 + rnd(i + 40) * 9} fill={i % 3 ? C.sandD : "#F0D69C"} />, Math.round(w * Ht / 1500));
  if (kind === "clay") add((i) => <ellipse key={i} cx={x0 + rnd(i) * w} cy={top + rnd(i + 90) * Ht} rx={18} ry={3.5} fill={C.clayD} />, Math.round(w * Ht / 500));
  if (kind === "loam") add((i) => i % 3 === 0 ? <circle key={i} cx={x0 + rnd(i) * w} cy={top + rnd(i + 90) * Ht} r={9} fill={C.sand} /> : i % 3 === 1
    ? <circle key={i} cx={x0 + rnd(i) * w} cy={top + rnd(i + 90) * Ht} r={5} fill={C.silt} /> : <ellipse key={i} cx={x0 + rnd(i) * w} cy={top + rnd(i + 90) * Ht} rx={11} ry={3} fill={C.clay} />, Math.round(w * Ht / 650));
  return <g clipPath={`url(#${id})`}><rect x={x0} y={top} width={w} height={Ht} fill={{ sand: C.sand, clay: C.clay, loam: C.loam }[kind]} />{parts}</g>;
}
function Jar({ cx, y, w, h, kind, lt, at, id, face = true, op = 1 }) {
  const o = pop(lt, at) * op; if (o <= 0) return null;
  const x0 = cx - w / 2, neck = h * 0.13, s = w / 300;
  return (
    <SVG op={Math.min(1, o)}>
      <defs><clipPath id={id}><rect x={x0 + 5} y={y + neck} width={w - 10} height={h - neck - 5} rx={26 * s + 8} /></clipPath></defs>
      <JarFill cx={cx} top={y + h * 0.3} w={w} bot={y + h} kind={kind} id={id} />
      <rect x={x0} y={y + neck} width={w} height={h - neck} rx={26 * s + 10} stroke={SK.white} strokeWidth="6" fill="rgba(255,255,255,0.08)" />
      <rect x={x0 + w * 0.08} y={y} width={w * 0.84} height={neck + 4} rx={8} fill={SK.gold} />
      {face && kind === "sand" && <Mate kind="sand" x={cx} y={y + h * 0.65} s={0.82 * s + 0.2} />}
      {face && kind === "clay" && <Mate kind="clay" x={cx} y={y + h * 0.66} s={1.25 * s + 0.3} />}
      {face && kind === "loam" && <g><Mate kind="sand" x={cx - w * 0.26} y={y + h * 0.66} s={0.46 * s} /><Mate kind="silt" x={cx + w * 0.03} y={y + h * 0.7} s={0.62 * s} /><Mate kind="clay" x={cx + w * 0.3} y={y + h * 0.66} s={0.85 * s} /></g>}
    </SVG>
  );
}

// ---- Beats --------------------------------------------------------------------------------
function B1(ctx) {
  return ({ localTime: lt, duration }) => {
    const cRough = W("b1", "rough"), cSmooth = W("b1", "smooth"), cQ = S("b1", 3), d = 0.5 * out3(lt, cQ, 0.6);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[1]} showCaps={ctx.caps} capSize={ctx.capSize} fi={0.2}
        panel={panel(1, ctx, [L("Rough and grainy?", cRough), L("Or smooth and sticky?", cSmooth), L("Why does one soil feel so different from another?", cQ, "think")])}>
        <Pic slot="hands_dry" label="Fingers rub dry, gritty soil" x={40} y={60} w={670} h={880} lt={lt} at={0.1} dim={d} kenDur={18} />
        <Pic slot="hands_wet" label="Fingers squeeze wet, sticky soil" x={730} y={60} w={670} h={880} lt={lt} at={0.3} dim={d} kenDur={18} />
        <Chip text="ROUGH" x={375} y={860} lt={lt} at={cRough} size={36} />
        <Chip text="SMOOTH" x={1065} y={860} lt={lt} at={cSmooth} size={36} tone="gold" />
        <Big x={120} y={370} w={1200} lt={lt} at={cQ + 0.2} size={70} align="center">Why does one soil feel so different from another?</Big>
      </Scene>
    );
  };
}
function B2(ctx) {
  return ({ localTime: lt, duration }) => {
    const cTex = W("b2", "soil"), cTeam = S("b2", 1), cIf = S("b2", 3), cDep = S("b2", 4);
    const aSand = W("b2", "sand"), aSilt = W("b2", "silt"), aClay = W("b2", "clay");
    const bBig = W("b2", "biggest"), bMid = W("b2", "middle"), bTiny = W("b2", "tiny", 1);
    const cCoin = W("b2", "coin"), cGrain = W("b2", "sand", 2), cSix = W("b2", "six");
    // Line-up
    const cLine = aSand - 0.3, lineOp = windowOp(lt, cLine, cIf, 0.4);
    // Scale picture
    const grainR = 24 + 306 * drive(lt, cGrain, cSix + 0.9), scaleOp = windowOp(lt, cIf, cDep, 0.4);
    const floors = Math.round(6 * clamp((lt - (cSix - 1.1)) / 1.4, 0, 1));
    const coinO = pop(lt, cCoin, 0.5);
    // Team mix
    const mixOp = windowOp(lt, cDep, duration, 0.4), k = lt - cDep;
    const MIX = [[0.7, 0.2, 0.1], [0.12, 0.23, 0.65], [0.4, 0.38, 0.22]];
    const m1 = drive(k, 1.0, 1.7), m2 = drive(k, 2.4, 3.1);
    const mix = [0, 1, 2].map((i) => lerp(lerp(MIX[0][i], MIX[1][i], m1), MIX[2][i], m2));
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[2]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(2, ctx, [L("= the mix of 3 particles", cTex + 0.6, "big"), L("SAND: biggest", bBig), L("SILT: middle", bMid), L("CLAY: tiniest", bTiny)])}>
        <Pic slot="soil_magnify" label="A handful of soil under a magnifying glass" x={40} y={60} w={1360} h={880} lt={lt} at={0.1} out={cLine + 0.1} zoom={1.45} kenDur={cLine + 1} />
        <Chip text="SOIL TEXTURE" x={720} y={90} lt={lt} at={cTex} out={cTeam} tone="gold" size={44} />
        {/* line-up */}
        <Card x={40} y={60} w={1360} h={880} lt={lt} at={cLine} out={cIf} />
        <SVG op={lineOp}>
          <Mate kind="sand" x={340} y={470 + hop(lt, 0, 7)} s={2.1 * pop(lt, aSand)} />
          <Mate kind="silt" x={830} y={500 + hop(lt, 1.5, 6)} s={1.9 * pop(lt, aSilt)} />
          <Mate kind="clay" x={1190} y={530 + hop(lt, 3, 5)} s={1.15 * pop(lt, aClay)} />
        </SVG>
        <Chip text="SAND" x={340} y={730} lt={lt} at={aSand} out={cIf} size={38} />
        <Chip text="SILT" x={830} y={730} lt={lt} at={aSilt} out={cIf} size={38} />
        <Chip text="CLAY" x={1190} y={730} lt={lt} at={aClay} out={cIf} size={38} />
        <Chip text="biggest" x={340} y={810} lt={lt} at={bBig} out={cIf} tone="gold" size={30} />
        <Chip text="middle" x={830} y={810} lt={lt} at={bMid} out={cIf} tone="gold" size={30} />
        <Chip text="tiniest" x={1190} y={810} lt={lt} at={bTiny} out={cIf} tone="gold" size={30} />
        {/* coin and building */}
        <Card x={40} y={60} w={1360} h={880} lt={lt} at={cIf} out={cDep} />
        <SVG op={scaleOp}>
          <line x1={70} y1={884} x2={1370} y2={884} stroke={SK.line} strokeWidth="4" />
          {Array.from({ length: floors }, (_, i) => { const fy = 884 - (i + 1) * 110; return <g key={i}>
            <rect x={110} y={fy} width={250} height={110} fill={i % 2 ? "#D7CDB8" : "#C7BBA2"} stroke={SK.ink} strokeWidth="3" />
            {[0, 1, 2].map((c) => <rect key={c} x={136 + c * 70} y={fy + 26} width={46} height={58} fill={SK.bg0} />)}
            <T x={92} y={fy + 68} size={30} bold color={SK.gold}>{i + 1}</T></g>; })}
          <Mate kind="sand" x={720} y={884 - grainR} s={grainR / 100} />
          <circle cx={1230} cy={878} r={6} fill={C.clay} />
          {/* the coin, nearly lost beside the grain; the ring blows it up */}
          {coinO > 0 && <g opacity={Math.min(1, coinO)}>
            <circle cx={1230} cy={878} r={6} fill={SK.gold} />
            <line x1={1230} y1={870} x2={1230} y2={640} stroke={SK.gold} strokeWidth="3" strokeDasharray="8 8" />
            <circle cx={1230} cy={520} r={116 * Math.min(1, coinO)} fill={SK.gold} stroke={SK.goldDeep} strokeWidth="6" />
            <circle cx={1230} cy={520} r={92 * Math.min(1, coinO)} stroke={SK.goldDeep} strokeWidth="3" fill="none" />
            <Mate kind="clay" x={1230} y={520} s={1.5 * Math.min(1, coinO)} />
          </g>}
        </SVG>
        <Chip text="a clay particle" x={1230} y={790} lt={lt} at={cIf + 0.3} out={cCoin} size={30} />
        <Chip text="a sand grain" x={720} y={780} lt={lt} at={cIf + 0.3} out={cGrain + 0.8} size={30} />
        <Chip text="clay = a coin" x={1230} y={340} lt={lt} at={cCoin + 0.2} out={cDep} tone="gold" size={30} />
        <Chip text="six storeys" x={235} y={190} lt={lt} at={cSix} out={cDep} size={30} />
        <Chip text="one big sand grain" x={720} y={150} lt={lt} at={cSix} out={cDep} tone="gold" size={30} />
        {/* who is in the team */}
        <Card x={40} y={60} w={1360} h={880} lt={lt} at={cDep} />
        <SVG op={mixOp}>
          <Mate kind="sand" x={300} y={300 + hop(lt, 0, 6)} s={1.4 * (0.6 + 0.7 * mix[0])} />
          <Mate kind="silt" x={720} y={300 + hop(lt, 1.5, 6)} s={1.5 * (0.6 + 0.7 * mix[1])} />
          <Mate kind="clay" x={1140} y={300 + hop(lt, 3, 6)} s={1.8 * (0.6 + 0.7 * mix[2])} />
          <MixBar x={120} y={560} w={1200} h={150} mix={mix} />
        </SVG>
        <Chip text="the team" x={720} y={760} lt={lt} at={cDep + 0.2} tone="gold" size={34} />
      </Scene>
    );
  };
}
// One of the three things texture decides: icon + word, lit on its spoken word.
function Why({ kind, y, lt, at, word, line }) {
  const o = pop(lt, at, 0.6); if (o <= 0) return null;
  const cx = 760, cy = y + 140, t = lt - at;
  return <>
    <SVG op={Math.min(1, o)}><g transform={`translate(${cx} ${cy})`}>
      <circle r={112} fill="rgba(255,255,255,0.08)" stroke={SK.gold} strokeWidth="5" />
      {kind === "hold" && <g><path d="M-82 16 Q 0 -12, 82 16 L 76 66 Q 0 92, -76 66 Z" fill={C.loam} />
        <path transform={`translate(0 ${6 + 4 * Math.sin(lt * 3)})`} d="M0 -70 C 0 -70, -36 -24, -36 2 A 36 36 0 0 0 36 2 C 36 -24, 0 -70, 0 -70 Z" fill={C.water} /></g>}
      {kind === "drain" && <g><path d="M-58 -62 L58 -62 L38 34 L-38 34 Z" fill="#B5633A" /><rect x={-68} y={-78} width={136} height={22} rx={6} fill="#C97648" />
        {[0, 1, 2].map((i) => { const p = ((t * 0.9 + i / 3) % 1); return <ellipse key={i} cx={0} cy={40 + p * 56} rx={8} ry={12} fill={C.water} opacity={1 - p * 0.5} />; })}</g>}
      {kind === "root" && <g><rect x={-84} y={-22} width={168} height={92} rx={12} fill={C.loam} />
        <path d="M0 -22 C 0 -46, -2 -60, 0 -78" stroke="#6FBF6E" strokeWidth="7" strokeLinecap="round" /><ellipse cx={-18} cy={-68} rx={20} ry={8} fill="#6FBF6E" /><ellipse cx={18} cy={-62} rx={20} ry={8} fill="#6FBF6E" />
        <path d="M0 -22 L0 62 M0 8 L-40 44 M0 22 L38 54" stroke={C.sand} strokeWidth="6" strokeLinecap="round" strokeDasharray="130" strokeDashoffset={130 - 130 * clamp(t / 1.6, 0, 1)} /></g>}
    </g></SVG>
    <div style={{ position: "absolute", left: 910, top: y + 60, width: 470, opacity: Math.min(1, o), fontFamily: SERIF, fontWeight: 700, fontSize: 62, color: SK.gold }}>{word}</div>
    <div style={{ position: "absolute", left: 910, top: y + 142, width: 470, opacity: Math.min(1, o), fontFamily: SANS, fontSize: 32, color: SK.white, lineHeight: 1.2 }}>{line}</div>
  </>;
}
function B3(ctx) {
  return ({ localTime: lt, duration }) => {
    const cThree = S("b3", 1), ats = [W("b3", "hold"), W("b3", "drains"), W("b3", "roots")], rows = [S("b3", 2), S("b3", 3), S("b3", 4)], cCrop = S("b3", 5);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[3]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(3, ctx, [L("How much water it HOLDS", ats[0]), L("How fast water DRAINS", ats[1]), L("How easily ROOTS grow", ats[2]), L("→ which CROP to plant", cCrop, "big")])}>
        <Pic slot="farmer_packets" label="A farmer with soil in one hand and seed packets" x={40} y={60} w={1360} h={880} lt={lt} at={0.1} out={cThree + 0.2} />
        <Pic slot="farmer_packets" label="A farmer with soil in one hand and seed packets" x={40} y={60} w={540} h={880} lt={lt} at={cThree} fx="none" />
        {[60, 360, 660].map((y, i) => <React.Fragment key={y}>
          <Card x={600} y={y} w={800} h={280} lt={lt} at={cThree + i * 0.2} />
          <Big x={600} y={y + 92} w={800} lt={lt} at={cThree + i * 0.2} out={rows[i]} size={84} align="center" color={SK.gold}>{i + 1}</Big>
        </React.Fragment>)}
        <Why kind="hold" y={60} lt={lt} at={rows[0]} word="HOLD" line="how much water it keeps" />
        <Why kind="drain" y={360} lt={lt} at={rows[1]} word="DRAIN" line="how quickly water leaves" />
        <Why kind="root" y={660} lt={lt} at={rows[2]} word="ROOTS" line="how easily they grow" />
        <Chip text="which crop suits the land?" x={310} y={860} lt={lt} at={cCrop} tone="gold" size={32} />
      </Scene>
    );
  };
}
function B4(ctx) {
  return ({ localTime: lt, duration }) => {
    const cFeel = S("b4", 1), cGaps = S("b4", 2), cLittle = W("b4", "little"), cCrops = S("b4", 3), cG = W("b4", "groundnut"), cM = W("b4", "watermelon");
    const mateO = pop(lt, 0.4) * (1 - reveal(lt, cGaps, 0.4));
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[4]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(4, ctx, [L("Feels: rough, grainy", cFeel), L("Water: drains FAST", W("b4", "water")), L("Holds: little water, few nutrients", cLittle), L("Crops: groundnut, watermelon (with irrigation)", cCrops)])}>
        <Pic slot="sand_trickle" label="Sand trickles through fingers" x={40} y={60} w={1360} h={880} lt={lt} at={0.1} out={cGaps + 0.2} />
        <SVG op={mateO}><Mate kind="sand" x={1240} y={780 + hop(lt)} s={1.25 * pop(lt, 0.4)} /></SVG>
        <Chip text="rough and grainy" x={720} y={840} lt={lt} at={cFeel} out={cGaps} size={36} />
        <Pic slot="sand_water" label="Water poured on sandy soil vanishes" x={40} y={60} w={660} h={880} lt={lt} at={cGaps} out={cCrops} />
        <Pores kind="sand" x={740} y={60} w={660} h={880} lt={lt} at={cGaps} out={cCrops} />
        <Chip text="big gaps" x={1070} y={76} lt={lt} at={cGaps + 0.3} out={cCrops} tone="gold" size={32} />
        <Tag text="holds very LITTLE" x={370} y={840} lt={lt} at={cLittle} out={cCrops} size={34} />
        <Pic slot="groundnut_drip" label="A groundnut field with a drip line" x={40} y={60} w={670} h={880} lt={lt} at={cCrops} />
        <Pic slot="melon_bank" label="Watermelons on a sandy riverbank" x={730} y={60} w={670} h={880} lt={lt} at={cCrops + 0.3} />
        <Chip text="GROUNDNUT" x={375} y={860} lt={lt} at={cG} tone="gold" size={34} />
        <Chip text="WATERMELON" x={1065} y={860} lt={lt} at={cM} tone="gold" size={34} />
        <Chip text="with proper irrigation" x={720} y={90} lt={lt} at={cCrops + 0.3} size={32} />
      </Scene>
    );
  };
}
// The pour starts when the stop ends, in the silent tail of b5, and carries on under b6.
const pourStart = () => stopEnd("b5") + 0.1;
function B5(ctx) {
  return ({ localTime: lt, duration }) => {
    const cSame = W("b5", "same"), ats = [0.5, 0.8, 1.1], cFirst = W("b5", "first"), tp = lt - pourStart(), sEnd = stopEnd("b5");
    const q = out3(lt, cFirst, 0.4) * (1 - reveal(lt, sEnd - 0.4, 0.4));
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[5]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(5, ctx, [L("Which glass fills FIRST?", cFirst), L("Which fills LAST?", W("b5", "last"))])}>
        <Big x={40} y={120} w={LEFT_W - 80} lt={lt} at={cSame} out={stopAt("b5", 3) - 0.3} size={72} align="center">The SAME water</Big>
        <Rig lt={lt} ats={ats} tp={tp} q={q} />
        <Tag text="FIRST" x={FX.sand} y={GTOP - 40 + 0} lt={lt} at={pourStart() + 3.1} size={32} />
        <StopBand lt={lt} b="b5" />
      </Scene>
    );
  };
}
function B6(ctx) {
  return ({ localTime: lt, duration }) => {
    const b5s = BEAT("b5").start, b6s = BEAT("b6").start, tp = b6s + lt - (b5s + pourStart());
    const cFlake = S("b6", 1), cStick = W("b6", "sticky"), cHold = S("b6", 2), cWater = W("b6", "waterlogged"), cRice = S("b6", 3), cP = W("b6", "paddy");
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[6]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(6, ctx, [L("Feels: smooth, sticky when wet", W("b6", "smooth")), L("Water: holds a LOT", W("b6", "holds")), L("Drains: SLOWLY, may become waterlogged", W("b6", "drains")), L("Crop: paddy rice", cP)])}>
        {lt < cFlake + 0.8 && <div style={{ position: "absolute", inset: 0, opacity: 1 - reveal(lt, cFlake, 0.5) }}>
          <Rig lt={1} ats={[0, 0, 0]} tp={tp} ops={{ sand: 0.4, loam: 0.4 }} />
          <Tag text="FIRST" x={FX.sand} y={GTOP - 40} lt={1} at={0} size={32} />
          <Chip text="LAST: only a slow drip" x={FX.clay} y={120} lt={lt} at={0.2} tone="gold" size={36} />
        </div>}
        <Pic slot="clay_ball" label="Wet clay pressed into a smooth, sticky ball" x={40} y={60} w={660} h={880} lt={lt} at={cFlake} out={cHold} />
        <Pores kind="clay" x={740} y={60} w={660} h={880} lt={lt} at={cFlake} out={cHold} />
        <Chip text="packed tightly" x={1070} y={76} lt={lt} at={cFlake + 0.3} out={cHold} tone="gold" size={32} />
        <Chip text="SMOOTH and STICKY" x={370} y={840} lt={lt} at={cStick} out={cHold} size={34} />
        <Pic slot="soil_rain" label="Puddles standing on a clay field after rain" x={40} y={60} w={1360} h={880} lt={lt} at={cHold} out={cRice} />
        <Tag text="WATERLOGGED" x={720} y={840} lt={lt} at={cWater} out={cRice} size={38} />
        <Pic slot="paddy_flooded" label="A flooded paddy field with rice seedlings" x={40} y={60} w={1360} h={880} lt={lt} at={cRice} />
        <Chip text="PADDY RICE" x={720} y={840} lt={lt} at={cP} tone="gold" size={42} />
      </Scene>
    );
  };
}
function B7(ctx) {
  return ({ localTime: lt, duration }) => {
    const cBal = S("b7", 1), cKeep = S("b7", 2), cExtra = W("b7", "extra"), cRich = S("b7", 3), cMany = W("b7", "many"), cV = W("b7", "vegetables"), cF = W("b7", "fruits"), cFld = W("b7", "field"), cLove = S("b7", 4);
    const inP = drive(lt, 0.4, 2.4), teamOp = windowOp(lt, 0, cBal + 0.3, 0.3), link = out3(lt, 2.2, 0.5);
    const mixOp = windowOp(lt, cBal, cKeep, 0.4);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[7]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(7, ctx, [L("Balanced mix of sand, silt and clay", cBal), L("Holds ENOUGH water, drains the EXTRA", cKeep), L("Usually rich in nutrients", cRich), L("Crops: vegetables, fruits, many field crops", cMany)])}>
        <Card x={40} y={60} w={1360} h={880} lt={lt} at={0.05} out={cBal} />
        <SVG op={teamOp}>
          <path d="M560 590 Q 610 660, 660 590 M780 590 Q 860 660, 950 570" stroke={SK.cream} strokeWidth="12" strokeLinecap="round" opacity={link} />
          <Mate kind="sand" x={lerp(-240, 410, inP)} y={560 + hop(lt, 0)} s={1.5} />
          <Mate kind="silt" x={720} y={lerp(-140, 550, inP) + hop(lt, 1.4)} s={1.6} />
          <Mate kind="clay" x={lerp(1680, 1050, inP)} y={540 + hop(lt, 2.6)} s={1.9} />
        </SVG>
        <Chip text="the TEAM PLAYER" x={720} y={180} lt={lt} at={W("b7", "team")} out={cBal} tone="gold" size={46} />
        <Chip text="LOAMY" x={720} y={760} lt={lt} at={W("b7", "loamy")} out={cBal} size={46} />
        <Pic slot="soil_moist" label="Dark, rich loam crumbling from a hand" x={40} y={60} w={660} h={880} lt={lt} at={cBal} out={cMany} />
        <Card x={740} y={60} w={660} h={880} lt={lt} at={cBal} out={cMany} />
        <SVG op={mixOp}>
          <Team x={1060} y={390} s={1} lt={lt} />
          <MixBar x={790} y={590} w={560} h={110} mix={[0.4, 0.38, 0.22]} />
        </SVG>
        <Chip text="BALANCED" x={1070} y={740} lt={lt} at={W("b7", "balanced")} out={cKeep} tone="gold" size={36} />
        {lt >= cKeep - 0.1 && lt < cMany + 0.6 && <div style={{ position: "absolute", inset: 0, opacity: 1 - reveal(lt, cMany, 0.5) }}>
          <Funnel cx={1070} kind="loam" lt={lt} at={cKeep} tp={lt - cKeep - 0.3} />
          <Chip text="keeps ENOUGH" x={1070} y={100} lt={lt} at={W("b7", "enough")} tone="gold" size={32} />
          <Chip text="the EXTRA drains" x={1070} y={884} lt={lt} at={cExtra} size={30} />
        </div>}
        <Chip text="rich in nutrients" x={370} y={840} lt={lt} at={cRich} out={cMany} tone="gold" size={36} />
        <Pic slot="veg_garden" label="A vegetable garden" x={40} y={60} w={440} h={880} lt={lt} at={cMany} />
        <Pic slot="orchard" label="A fruit orchard" x={500} y={60} w={440} h={880} lt={lt} at={cF} />
        <Pic slot="field_rabi" label="A wheat field" x={960} y={60} w={440} h={880} lt={lt} at={cFld} />
        <Chip text="vegetables" x={260} y={860} lt={lt} at={cV} size={32} />
        <Chip text="fruits" x={720} y={860} lt={lt} at={cF} size={32} />
        <Chip text="field crops" x={1180} y={860} lt={lt} at={cFld} size={32} />
        <SVG op={out3(lt, cLove, 0.5)}><Team x={720} y={lerp(1000, 500, out3(lt, cLove, 0.6))} s={1.25} lt={lt} /></SVG>
      </Scene>
    );
  };
}
function B8(ctx) {
  const SHOTS = [["feel_sand", "Moist sandy soil falls apart", "Falls apart?", "SANDY"], ["feel_clay", "Clay pushed out into a long ribbon", "Long, sticky ribbon?", "CLAYEY"], ["feel_loam", "Loam holds together, then crumbles", "Holds, then crumbles?", "LOAMY"]];
  return ({ localTime: lt, duration }) => {
    const ats = [S("b8", 2), S("b8", 3), S("b8", 4)], rev = stopEnd("b8"), r = (i) => rev + 0.1 + i * 0.7;
    const line = (i, q) => (lt >= r(i) ? `${q} → ${SHOTS[i][3]}` : `${q} → ?`);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[8]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(8, ctx, [L(line(0, "Falls apart"), ats[0]), L(line(1, "Long sticky ribbon"), ats[1]), L(line(2, "Holds, then crumbles"), ats[2])])}>
        <Pic slot="soil_water" label="Wet a little soil in your hands" x={40} y={60} w={1360} h={880} lt={lt} at={0.1} out={ats[0]} />
        <Chip text="just your FINGERS" x={720} y={840} lt={lt} at={W("b8", "fingers")} out={ats[0]} tone="gold" size={38} />
        <Badge text="FEEL TEST" x={560} y={130} lt={lt} at={ats[0]} op={1 - reveal(lt, stopAt("b8", 5) - 0.3, 0.3)} size={44} />
        {SHOTS.map(([slot, label, q, ans], i) => { const x = 40 + i * 460; return <React.Fragment key={slot}>
          <Pic slot={slot} label={label} x={x} y={280} w={440} h={640} lt={lt} at={ats[i]} fx="pop" />
          <Chip text={q} x={x + 220} y={850} lt={lt} at={ats[i] + 0.2} size={30} />
          <Chip text={ans} x={x + 220} y={300} lt={lt} at={r(i)} tone="gold" size={42} />
        </React.Fragment>; })}
        <StopBand lt={lt} b="b8" />
      </Scene>
    );
  };
}
function B9(ctx) {
  return ({ localTime: lt, duration }) => {
    const cInd = S("b9", 1), cMt = W("b9", "mountains"), cThrow = S("b9", 2), cNow = S("b9", 3), cPeat = W("b9", "cocopeat"), cWorld = W("b9", "world", 1),
      cDry = S("b9", 4), cTen = W("b9", "ten"), cLong = W("b9", "longer"), cWaste = S("b9", 5);
    const ten = Math.round(10 * clamp((lt - cTen) / 1.5, 0, 1));
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[9]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(9, ctx, [L("India: among the world's top coconut producers", cInd), L("Made from coconut HUSKS", cMt), L("Holds up to 10× its dry weight in water", cTen), L("Waste → resource", cWaste, "big")])}>
        {lt < cInd + 0.5 && <div style={{ position: "absolute", inset: 0, opacity: 1 - reveal(lt, cInd, 0.5) }}>
          <Badge text="WOW!" x={610} y={150} lt={lt} at={0.1} size={64} />
          <Flip x={230} y={290} w={980} h={420} lt={lt} at={0.5} q="The Secret of Kerala's Soil!" size={72} />
        </div>}
        <Pic slot="kerala_backwater" label="Coconut palms along a Kerala backwater" x={40} y={60} w={1360} h={880} lt={lt} at={cInd} out={cMt + 0.2} fx="pan" />
        <Pic slot="husk_pile" label="A mountain of brown coconut husks" x={40} y={60} w={1360} h={880} lt={lt} at={cMt} out={cNow + 0.2} />
        <Chip text="MOUNTAINS of husks" x={720} y={90} lt={lt} at={cMt + 0.3} out={cThrow} tone="gold" size={38} />
        <Tag text="once thrown away" x={720} y={840} lt={lt} at={cThrow} out={cNow} size={38} />
        <Pic slot="husk_shredder" label="A machine shreds husks into cocopeat" x={40} y={60} w={1360} h={880} lt={lt} at={cNow} out={cDry + 0.2} />
        <Chip text="COCOPEAT" x={720} y={90} lt={lt} at={cPeat} out={cDry} tone="gold" size={44} />
        <Chip text="used all over the WORLD" x={720} y={840} lt={lt} at={cWorld} out={cDry} size={36} />
        <Pic slot="peat_dry" label="A dry, hard cocopeat block" x={40} y={60} w={660} h={880} lt={lt} at={cDry} out={cLong} />
        <Pic slot="peat_wet" label="The block swells up in water" x={40} y={60} w={660} h={880} lt={lt} at={cTen} out={cLong} />
        <Card x={740} y={60} w={660} h={880} lt={lt} at={cDry} out={cLong} />
        <SVG op={windowOp(lt, cDry, cLong, 0.4)}>
          <rect x={800} y={780} width={100} height={70} rx={10} fill={C.loam} />
          <T x={850} y={892} size={28} color={SK.white} bold>1 handful</T>
          {Array.from({ length: ten }, (_, i) => <g key={i}><path transform={`translate(${985 + (i % 5) * 76} ${790 - Math.floor(i / 5) * 110})`} d="M0 -46 C 0 -46, -26 -14, -26 6 A 26 26 0 0 0 26 6 C 26 -14, 0 -46, 0 -46 Z" fill={C.water} /></g>)}
          <T x={1138} y={892} size={28} color={SK.white} bold>{ten > 0 ? `${ten} times its weight` : ""}</T>
        </SVG>
        <Big x={760} y={130} w={620} lt={lt} at={cTen} out={cLong} size={124} align="center" color={SK.gold}>10×</Big>
        <Pic slot="peat_tray" label="Seedlings grow in cocopeat" x={40} y={60} w={1360} h={880} lt={lt} at={cLong} />
        <Tag text="WASTE" x={480} y={820} lt={lt} at={W("b9", "waste")} size={42} />
        <SVG op={out3(lt, W("b9", "valuable"), 0.4)}><Arrow x1={610} y1={850} x2={770} y2={850} color={SK.gold} sw={9} head={28} /></SVG>
        <Chip text="RESOURCE" x={930} y={820} lt={lt} at={W("b9", "resource")} tone="gold" size={42} />
      </Scene>
    );
  };
}
function B10(ctx) {
  const COLS = [{ k: "sand", n: "SANDY", x: 260 }, { k: "clay", n: "CLAYEY", x: 720 }, { k: "loam", n: "LOAMY", x: 1180 }];
  function Cell({ x, y, h, lt, at, text }) {
    const o = pop(lt, at); if (o <= 0) return null;
    return <div style={{ position: "absolute", left: x - 205, top: y, width: 410, height: h, borderRadius: 16, background: SK.cream, opacity: Math.min(1, o), transform: `scale(${0.9 + 0.1 * Math.min(1, o)})`,
      display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", fontFamily: SERIF, fontWeight: 700, fontSize: 38, lineHeight: 1.12, color: SK.ink, boxShadow: "0 6px 16px rgba(0,0,0,0.3)" }}>{text}</div>;
  }
  return ({ localTime: lt, duration }) => {
    const a = [S("b10", 1), S("b10", 2), S("b10", 3)];
    const cells = [
      [["rough", W("b10", "rough")], ["drains fast", W("b10", "drains")], ["holds little", W("b10", "holds")]],
      [["smooth and sticky", W("b10", "smooth")], ["holds a lot", W("b10", "holds", 1)], ["drains slowly", W("b10", "drains", 1)]],
      [["the balanced team", W("b10", "balanced")], ["good for MANY crops", W("b10", "many")]],
    ];
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[10]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(10, ctx, [L("Sandy: drains fast, holds little", a[0]), L("Clayey: holds lots, drains slowly", a[1]), L("Loamy: balanced, suits many crops", a[2])])}>
        {COLS.map((c, i) => <React.Fragment key={c.k}>
          <Jar cx={c.x} y={66} w={240} h={290} kind={c.k} lt={lt} at={0.2 + i * 0.25} id={`jar10-${c.k}`} />
          <Chip text={c.n} x={c.x} y={366} lt={lt} at={a[i]} tone="gold" size={34} />
          {cells[i].map(([txt, at], r) => { const two = cells[i].length === 2, h = two ? 233 : 148; return <Cell key={r} x={c.x} y={432 + r * (h + 16)} h={h} lt={lt} at={at} text={txt} />; })}
        </React.Fragment>)}
      </Scene>
    );
  };
}
function B11(ctx) {
  // Cards leave the left column for their jar; jars are out of order so the class has to think.
  const CROPS = [{ slot: "tn_paddy", label: "A paddy field", name: "Paddy rice", row: 2 }, { slot: "melon_bank", label: "Watermelons on a sandy riverbank", name: "Watermelon with irrigation", row: 0 }, { slot: "veg_garden", label: "A vegetable garden", name: "Vegetables, fruits", row: 1 }];
  const JARS = [["sand", "SANDY"], ["loam", "LOAMY"], ["clay", "CLAYEY"]];
  const Y0 = 268, RH = 228;
  return ({ localTime: lt, duration }) => {
    const ats = [W("b11", "paddy"), W("b11", "watermelon"), W("b11", "vegetables")], sEnd = stopEnd("b11"), ans = [S("b11", 2), S("b11", 3), S("b11", 4)], cLast = S("b11", 5);
    const rigOut = cLast + 0.1, rigOp = 1 - reveal(lt, rigOut, 0.5);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[11]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(11, ctx, [L(lt >= ans[0] ? "Paddy rice → CLAYEY" : "Paddy rice → ?", ats[0]), L(lt >= ans[1] ? "Watermelon with irrigation → SANDY" : "Watermelon with irrigation → ?", ats[1]), L(lt >= ans[2] ? "Vegetables and fruits → LOAMY" : "Vegetables and fruits → ?", ats[2])])}>
        {rigOp > 0 && <div style={{ position: "absolute", inset: 0, opacity: rigOp }}>
          <Big x={40} y={120} w={LEFT_W - 80} lt={lt} at={0.2} op={1 - windowOp(lt, stopAt("b11", 1) - 0.3, sEnd + 0.3, 0.3)} size={64} align="center">Which soil suits each crop?</Big>
          {JARS.map(([k, n], i) => { const y = Y0 + i * RH; return <React.Fragment key={k}>
            <Jar cx={1270} y={y + 4} w={170} h={200} kind={k} lt={lt} at={0.3 + i * 0.2} id={`jar11-${k}`} />
            <Chip text={n} x={1060} y={y + 82} lt={lt} at={0.3 + i * 0.2} tone="gold" size={32} />
          </React.Fragment>; })}
          {CROPS.map((c, i) => { // paddy crosses first then drops; the others rise first, so no card passes over another
            const first = drive(lt, ans[i], ans[i] + 0.5), then = drive(lt, ans[i] + 0.3, ans[i] + 0.9), mx = i === 0 ? first : then, my = i === 0 ? then : first;
            const x = lerp(60, 540, mx), y = lerp(Y0 + i * RH, Y0 + c.row * RH, my);
            return <React.Fragment key={c.slot}>
              <Pic slot={c.slot} label={c.label} x={x} y={y} w={380} h={208} lt={lt} at={ats[i]} fx="pop" />
              <Chip text={c.name} x={x + 190} y={y + 150} lt={lt} at={ats[i]} size={26} />
              <SVG op={out3(lt, ans[i] + 0.8, 0.3)}><Arrow x1={930} y1={Y0 + c.row * RH + 104} x2={978} y2={Y0 + c.row * RH + 104} color={SK.gold} sw={7} head={20} /></SVG>
            </React.Fragment>; })}
        </div>}
        <Pic slot="hands_dry" label="Fingers rub dry, gritty soil" x={40} y={60} w={440} h={880} lt={lt} at={cLast + 0.2} />
        <Pic slot="hands_wet" label="Fingers squeeze wet, sticky soil" x={500} y={60} w={440} h={880} lt={lt} at={W("b11", "squeeze")} />
        <Pic slot="veg_garden" label="A vegetable garden" x={960} y={60} w={440} h={880} lt={lt} at={W("b11", "ask")} />
        <Chip text="RUB it" x={260} y={850} lt={lt} at={W("b11", "rub")} tone="gold" size={38} />
        <Chip text="SQUEEZE it" x={720} y={850} lt={lt} at={W("b11", "squeeze")} tone="gold" size={38} />
        <Chip text="What can it GROW?" x={1180} y={850} lt={lt} at={W("b11", "ask")} tone="gold" size={36} />
        <StopBand lt={lt} b="b11" />
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
const COLLAGE = [{ slot: "soil_magnify", x: -60, y: -40, w: 760, h: 520, ph: 0 }, { slot: "paddy_flooded", x: 640, y: -80, w: 760, h: 520, ph: 2 },
  { slot: "soil_moist", x: -80, y: 520, w: 700, h: 560, ph: 4 }, { slot: "field_rabi", x: 560, y: 560, w: 820, h: 560, ph: 1 }];
function Lp21Scenes(props = {}) {
  const caps = props.showCaptions === "false" ? false : props.showCaptions !== false;
  const titles = {};
  for (let n = 1; n <= NB; n++) titles[n] = str(props["title" + n + "Text"], TITLES[n]);
  const ctx = { caps, titles, capSize: num(props.captionSize, 34) };
  const B = [B1, B2, B3, B4, B5, B6, B7, B8, B9, B10, B11];
  const beats = B.map((Bn, i) => { const t = BEAT("b" + (i + 1)); return [t.start, t.start + t.dur, Bn]; });
  return (
    <StoryFrame props={props} dur={DUR} persistKey="thinkpro-lp21-soil-texture" collage={COLLAGE}>
      {beats.map(([s, e, Bn], i) => (
        <Sprite key={i} start={s} end={e}>{Bn(ctx)}</Sprite>
      ))}
      {STOPS.map(([b, i, hold]) => <StopAt key={b} t={BEAT(b).start + stopAt(b, i)} hold={hold - 0.2} />)}
      <ChimeAt t={BEAT("b9").start + S("b9", 0, 0)} />
      <AudioSync />
    </StoryFrame>
  );
}
window.Lp21Scenes = Lp21Scenes;
