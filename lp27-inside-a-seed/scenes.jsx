/* global React, window */
// ThinkPro Academy — "Inside a Seed: A Tiny Plant Waiting to Wake Up!" (Grade 6 Agriculture, Session 27, V1).
// After AG_G6_S26 Video Script (Subrata, 5 Nov 2026): 11 script scenes = 11 voiced beats, three presenter
// stops (TPStory.StopAt: the web player freezes, the export holds the card), one "Did you know?" run.
// Central model: the seed as a TIFFIN BOX — box = seed coat, lunch = food store, traveller = embryo. The
// KIT strip along the foot of the photo area lights one tile per part (b3–b5). Everything drawn lives in
// this file: Seed, SplitBean + Embryo, Tiffin, MaizeGrain, Sprouting (the germination rig used by b7, b8, b9).
// STORY STYLE (engine/story-kit.jsx). Pure function of time.
const { Sprite } = window;
const { reveal, windowOp } = window.TPMotion;
const { num, str } = window.TPStage;
const { SK, SERIF, SANS, LEFT_W, pop, out3, lerp, drive,
  Pic, Chip, Badge, Big, SVG, Arrow, T, ChimeAt, Scene, StoryFrame, StopAt, Flip } = window.TPStory;

// ---- Timing: EVERYTHING is keyed to the narration (tools/fit_timing.py → timing.js).
const TM = window.TP_TIMING;
if (!TM) console.error("timing.js missing — run: python3 tools/fit_timing.py videos/lp27-inside-a-seed");
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
const rnd = (i) => { const x = Math.sin(i * 12.9898 + 4.1) * 43758.5453; return x - Math.floor(x); };
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, t) => { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], t))).join(",")})`; };

// ---- Panel copy. Title defaults mirror the DC data-props (titleNText) — keep in sync. ----
const TITLES = { 1: "LP27 – Inside a Seed", 2: "A seed = a survival kit", 3: "1. Seed coat", 4: "2. Food store", 5: "3. Embryo", 6: "Label it",
  7: "Germination begins", 8: "Root first, shoot next", 9: "Put in order", 10: "Did you know?", 11: "Quick check" };
const KICK = "Grade 6 · Agriculture · Session 27";
const KICKS = { 10: "Did you know?" };
const panel = (n, ctx, lines, extra = {}) => ({ kicker: KICKS[n] || KICK, title: ctx.titles[n], lines, ...extra });
const L = (text, at, kind = "item", extra = {}) => ({ text, at, kind, ...extra });

// ---- Presenter stops: [beat, sentence index whose pauseAfter is the hold, hold s]
const STOPS = [["b6", 2, 15.0], ["b9", 1, 15.0], ["b11", 3, 15.0]];
const stopAt = (b, i) => SE(b, i) + 0.1;                       // beat-local start of the hold
const stopFor = (b) => STOPS.find((s) => s[0] === b);
// A slim stop bar across the top of the photo area, so the frozen picture stays in view.
function StopBar({ lt, b, head, y = 44 }) {
  const s = stopFor(b), at = stopAt(b, s[1]), hold = s[2] - 0.2, n = STOPS.indexOf(s) + 1;
  const o = windowOp(lt, at, at + hold + 0.4, 0.35); if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 40, top: y, width: LEFT_W - 80, height: 104, borderRadius: 20, background: "rgba(5,30,22,0.92)", opacity: o, zIndex: 3,
      boxShadow: "0 0 0 3px rgba(226,176,76,0.9)", display: "flex", alignItems: "center", gap: 22, padding: "0 170px 0 28px", boxSizing: "border-box" }}>
      <svg width="60" height="60" viewBox="0 0 90 90"><circle cx="45" cy="45" r="43" fill={SK.gold} /><rect x="28" y="24" width="12" height="42" rx="4" fill={SK.ink} /><rect x="50" y="24" width="12" height="42" rx="4" fill={SK.ink} /></svg>
      <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 38, letterSpacing: "0.04em", color: SK.white, whiteSpace: "nowrap" }}>{head}</div>
      <div style={{ marginLeft: "auto", fontFamily: SANS, fontSize: 25, color: SK.dim, whiteSpace: "nowrap" }}>Stop {n} of {STOPS.length}</div>
    </div>
  );
}

// ---- Drawn seed ------------------------------------------------------------------
const COAT = "#8A5230", COAT_D = "#5E3419", COAT_L = "#B57A4A", COTY = "#F3DF9C", COTY_D = "#D9BC66", COTY_DEEP = "#C39A3F";
const LEAF = "#6FBF6E", LEAF_D = "#3F8F4E", SHOOT_PALE = "#D8E6A0", ROOT = "#F4EDD2", ROOT_D = "#B9A777", STEEL = "#D6DEE4", STEEL_D = "#8C99A3", STEEL_DK = "#5C6972";
const SOIL = "#5A4030", SOIL_D = "#3F2C20";
const BEAN = "M-104 0 C-104 -46 -56 -64 0 -64 C56 -64 106 -46 106 0 C106 40 70 58 38 50 C22 46 14 40 0 40 C-14 40 -24 46 -40 50 C-74 58 -104 40 -104 0 Z";
function Defs() {
  return (
    <defs>
      <radialGradient id="s26coat" cx="38%" cy="28%" r="85%"><stop offset="0" stopColor={COAT_L} /><stop offset="0.55" stopColor={COAT} /><stop offset="1" stopColor={COAT_D} /></radialGradient>
      <radialGradient id="s26coty" cx="42%" cy="34%" r="80%"><stop offset="0" stopColor="#FBEFC0" /><stop offset="0.7" stopColor={COTY} /><stop offset="1" stopColor={COTY_D} /></radialGradient>
      <linearGradient id="s26steel" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stopColor="#9AA7B1" /><stop offset="0.22" stopColor="#EEF3F6" /><stop offset="0.5" stopColor={STEEL} /><stop offset="0.8" stopColor="#F4F7F9" /><stop offset="1" stopColor={STEEL_D} /></linearGradient>
      <radialGradient id="s26glow" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor={SK.gold} stopOpacity="0.85" /><stop offset="1" stopColor={SK.gold} stopOpacity="0" /></radialGradient>
    </defs>
  );
}
// Whole bean, about 200 × 130 at s = 1, centred on (x,y). wr = wrinkles, crack = split along the back.
function Seed({ x, y, s = 1, rot = 0, wr = 0, crack = 0 }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path d={BEAN} fill="url(#s26coat)" stroke={COAT_D} strokeWidth={2.5} />
      <ellipse cx={-34} cy={-36} rx={34} ry={11} fill="#fff" opacity={0.2 * (1 - wr)} transform="rotate(-12 -34 -36)" />
      <ellipse cx={0} cy={36} rx={13} ry={4.5} fill="#E8D9B8" />
      {wr > 0 && <g stroke={COAT_D} strokeWidth={2.4} strokeLinecap="round" fill="none" opacity={wr}>
        <path d="M-70 -34 C-52 -18 -60 2 -44 16" /><path d="M-30 -50 C-20 -26 -30 -6 -14 8" /><path d="M16 -52 C6 -30 22 -14 10 6" /><path d="M56 -40 C46 -18 60 -4 48 18" /><path d="M78 -14 C70 0 80 10 70 26" />
      </g>}
      {crack > 0 && <g>
        <path d={`M0 ${-68} L-${9 * crack} -46 L${8 * crack} -28 L-${7 * crack} -8 L${6 * crack} 10 L0 28 L${16 * crack} 8 L${22 * crack} -10 L${26 * crack} -30 L${18 * crack} -50 Z`} fill={COTY} stroke={COAT_D} strokeWidth={2.5} strokeLinejoin="round" />
      </g>}
    </g>
  );
}
// The living baby plant: radicle (root end), plumule (two folded leaves). Local size about 90 wide.
// sleep > 0 draws the closed eye. Tips (local): radicle (-34,30), plumule (46,-16).
function Embryo({ x = 0, y = 0, s = 1, breath = 1, sleep = 0, rot = 0 }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s * breath})`}>
      <path d="M20 -18 C-2 -24 -22 -6 -25 13 C-26 21 -30 27 -35 30 C-25 33 -14 27 -10 16 C-6 4 6 -3 20 -3 Z" fill={ROOT} stroke={ROOT_D} strokeWidth={1.4} strokeLinejoin="round" />
      <path d="M16 -11 C28 -26 44 -25 49 -16 C41 -6 28 -3 16 -11 Z" fill={LEAF} stroke={LEAF_D} strokeWidth={1.2} />
      <path d="M16 -9 C28 -4 41 3 39 11 C28 14 18 5 16 -9 Z" fill="#8FD07F" stroke={LEAF_D} strokeWidth={1.2} />
      {sleep > 0 && <g opacity={sleep}>
        <path d="M-7 -5 C-5 -2 -1 -2 1 -5" stroke={SK.ink} strokeWidth={1.3} fill="none" strokeLinecap="round" />
        <circle cx={-10} cy={0} r={2.4} fill="#F0A58A" opacity={0.7} />
      </g>}
    </g>
  );
}
// One half of a split bean, inner face up. coat = brown rim stays, emb = embryo opacity.
function SplitBean({ x, y, s = 1, flip = false, rot = 0, emb = 1, breath = 1, sleep = 0, coatOn = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${flip ? -s : s} ${s})`}>
      <path d={BEAN} fill="url(#s26coty)" stroke={COTY_DEEP} strokeWidth={2} />
      <path d="M-70 -30 C-40 -46 30 -50 76 -22" stroke={COTY_D} strokeWidth={2} fill="none" opacity={0.6} />
      <path d="M-82 8 C-60 -8 -46 -8 -36 2" stroke={COTY_D} strokeWidth={2} fill="none" opacity={0.6} />
      <path d={BEAN} fill="none" stroke={COAT} strokeWidth={7} opacity={coatOn} />
      {emb > 0 && <g opacity={emb}><Embryo x={2} y={6} s={0.82} breath={breath} sleep={sleep} /></g>}
    </g>
  );
}
function Glow({ x, y, r, op = 1 }) { return op > 0 ? <circle cx={x} cy={y} r={r} fill="url(#s26glow)" opacity={op} /> : null; }

// ---- Tiffin box (cut-away), centred on (x,y). open 0→1 lifts the lid; lunch + traveller show inside.
function Tiffin({ x, y, s = 1, open = 0, lunch = 1, trav = 1, lt = 0, glowBox = 0, glowLunch = 0, glowTrav = 0 }) {
  const lidY = -200, lidRot = -15 * open, inner = clamp(open * 1.6, 0, 1), breath = 1 + 0.035 * Math.sin(lt * 2.2);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {glowBox > 0 && <rect x={-322} y={-198} width={644} height={392} rx={46} fill="none" stroke={SK.gold} strokeWidth={16} opacity={0.65 * glowBox} />}
      {/* body */}
      <rect x={-310} y={-186} width={620} height={368} rx={36} fill="url(#s26steel)" stroke={STEEL_DK} strokeWidth={4} />
      <rect x={-284} y={-162} width={568} height={320} rx={24} fill="#223D35" opacity={inner} />
      <rect x={-284} y={-162} width={568} height={320} rx={24} fill="none" stroke={STEEL_D} strokeWidth={3} opacity={inner} />
      {/* lunch, left */}
      {inner > 0 && <g opacity={inner * lunch}>
        {glowLunch > 0 && <ellipse cx={-122} cy={40} rx={158} ry={118} fill="url(#s26glow)" opacity={glowLunch} />}
        <path d="M-258 148 C-258 40 -118 14 -28 148 Z" fill="#FBF7EA" stroke="#D9D0B8" strokeWidth={3} />
        {[[-200, 104], [-160, 78], [-120, 90], [-168, 122], [-104, 128], [-74, 120], [-132, 60]].map(([a, b], i) => <ellipse key={i} cx={a} cy={b} rx={9} ry={4} fill="#E6DEC6" transform={`rotate(${i * 37} ${a} ${b})`} />)}
        <ellipse cx={-70} cy={-46} rx={62} ry={62} fill="#D6A65E" stroke="#A97A38" strokeWidth={3} />
        <ellipse cx={-102} cy={-62} rx={62} ry={62} fill="#E3B872" stroke="#A97A38" strokeWidth={3} />
        {[[-120, -80], [-84, -46], [-124, -38], [-86, -96]].map(([a, b], i) => <circle key={i} cx={a} cy={b} r={6} fill="#A97A38" opacity={0.6} />)}
        <path d="M-226 -112 h86 l-10 66 c-2 12 -56 12 -66 0 Z" fill={STEEL} stroke={STEEL_DK} strokeWidth={3} />
        <ellipse cx={-183} cy={-112} rx={43} ry={11} fill="#E5A92F" stroke={STEEL_DK} strokeWidth={3} />
      </g>}
      {/* traveller, right */}
      {inner > 0 && <g opacity={inner * trav}>
        {glowTrav > 0 && <circle cx={150} cy={36} r={140} fill="url(#s26glow)" opacity={glowTrav} />}
        <path d="M30 136 C60 92 220 84 268 128 C224 164 76 170 30 136 Z" fill={LEAF_D} />
        <path d="M46 134 C100 118 200 112 258 128" stroke={LEAF} strokeWidth={4} fill="none" />
        <Embryo x={150} y={42} s={2.05} breath={breath} sleep={1} />
        {[0, 1, 2].map((i) => { const p = ((lt * 0.45 + i / 3) % 1); return <text key={i} x={236 + p * 34} y={-30 - p * 86} fontFamily={SANS} fontWeight={700} fontSize={22 + p * 14} fill={SK.white} opacity={Math.sin(p * Math.PI) * 0.9}>z</text>; })}
      </g>}
            {/* lid */}
      <g transform={`translate(0 ${lidY}) rotate(${lidRot} -300 0)`}>
        <rect x={-326} y={-34} width={652} height={70} rx={30} fill="url(#s26steel)" stroke={STEEL_DK} strokeWidth={4} />
        <rect x={-54} y={-62} width={108} height={30} rx={14} fill={STEEL_D} stroke={STEEL_DK} strokeWidth={3} />
      </g>
    </g>
  );
}

// Maize grain, long section. cut 0→1 wipes from the whole grain to the section; lit lights the endosperm.
function MaizeGrain({ x, y, s = 1, cut = 0, lit = 0 }) {
  const G = "M0 -150 C86 -150 118 -86 104 -8 C92 62 42 136 8 150 C-2 154 -10 150 -16 146 C-54 124 -96 58 -106 -8 C-118 -88 -84 -150 0 -150 Z";
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d={G} fill="#E9B332" stroke="#A9741A" strokeWidth={4} />
      <ellipse cx={-38} cy={-84} rx={26} ry={44} fill="#fff" opacity={0.25} transform="rotate(14 -38 -84)" />
      {cut > 0 && <g opacity={cut}>
        <path d={G} fill="#F7E6B5" stroke="#C07B16" strokeWidth={9} />
        <path d="M0 -136 C74 -136 104 -80 92 -10 C82 44 52 92 26 120 C20 72 -44 60 -66 12 C-90 -8 -96 -24 -94 -40 C-98 -96 -70 -136 0 -136 Z" fill={lit > 0 ? mix("#F7E6B5", "#F5C63C", lit) : "#F7E6B5"} />
        {lit > 0 && <ellipse cx={8} cy={-36} rx={120} ry={130} fill="url(#s26glow)" opacity={0.65 * lit} />}
        <path d="M-62 26 C-44 64 8 76 18 118 C10 138 -6 140 -14 132 C-46 108 -78 62 -80 30 C-76 22 -68 20 -62 26 Z" fill="#C9D784" stroke="#7E9440" strokeWidth={3} />
      </g>}
    </g>
  );
}

// Sprouting rig: origin = centre of the seed. sw swell, wr wrinkles, cr crack, r root 0→1, hr root hairs,
// p shoot 0→1, q hook straightening 0→1, lf leaves open 0→1, gr green 0→1, sp food spent 0→1 (seed shrinks).
function Sprouting({ x, y, s = 1, sw = 1, wr = 0, cr = 0, r = 0, hr = 0, p = 0, q = 0, lf = 0, gr = 0, sp = 0, rootLen = 300, shootLen = 340, rot = 0 }) {
  const seedS = sw * (1 - 0.34 * sp);
  // Root: a gently wandering line going down.
  const rootPts = []; const RN = 34;
  for (let i = 0; i <= RN; i++) { const u = (i / RN) * r; rootPts.push([-8 + 20 * Math.sin(u * 4.2) * u, 26 + rootLen * u]); }
  const rootD = "M" + rootPts.map((pt) => pt.join(" ")).join(" L");
  // Shoot: straight up, the last part curled over into a hook until q straightens it.
  const shootPts = []; const SN = 40; let sx = 10, sy = -6, ang = -Math.PI / 2; const stp = (shootLen * p) / SN;
  for (let i = 0; i <= SN; i++) {
    shootPts.push([sx, sy]);
    const u = i / SN, bend = (1 - q) * (u > 0.45 ? 3.6 / (SN * 0.55) : 0);
    ang += bend; sx += Math.cos(ang) * stp; sy += Math.sin(ang) * stp;
  }
  const tip = shootPts[SN], shootD = "M" + shootPts.map((pt) => pt.join(" ")).join(" L");
  const tipDeg = (ang * 180) / Math.PI + 90, stem = mix(SHOOT_PALE, LEAF_D, gr), leafC = mix("#E5DB8E", LEAF, gr), leafD = mix("#BDB467", LEAF_D, gr);
  const lfSz = 0.45 + 0.75 * lf;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      {r > 0 && <path d={rootD} stroke={ROOT} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" fill="none" />}
      {hr > 0 && rootPts.map((pt, i) => { if (i < 7 || i % 2) return null; const side = (i / 2) % 2 ? 1 : -1, len = (18 + 16 * rnd(i)) * hr;
        return <line key={i} x1={pt[0]} y1={pt[1]} x2={pt[0] + side * len} y2={pt[1] + 8 * hr} stroke={ROOT} strokeWidth={3} strokeLinecap="round" />; })}
      <Seed x={0} y={0} s={0.42 * seedS} wr={wr} crack={cr} />
      {p > 0 && <path d={shootD} stroke={stem} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" fill="none" />}
      {p > 0.05 && <g transform={`translate(${tip[0]} ${tip[1]}) rotate(${tipDeg}) scale(${lfSz})`}>
        <path d="M0 0 C-30 -14 -52 -40 -66 -74 C-30 -72 -4 -44 0 0 Z" fill={leafC} stroke={leafD} strokeWidth={2} transform={`rotate(${-52 * lf + 26})`} />
        <path d="M0 0 C30 -14 52 -40 66 -74 C30 -72 4 -44 0 0 Z" fill={leafC} stroke={leafD} strokeWidth={2} transform={`rotate(${52 * lf - 26})`} />
      </g>}
    </g>
  );
}

// ---- Small icons ------------------------------------------------------------------
function Sun({ x, y, r = 54, lt = 0, op = 1 }) {
  if (op <= 0) return null;
  return (
    <g transform={`translate(${x} ${y})`} opacity={op}>
      {Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * 2 * Math.PI + lt * 0.2; return <line key={i} x1={Math.cos(a) * r * 1.22} y1={Math.sin(a) * r * 1.22} x2={Math.cos(a) * r * (1.56 + 0.1 * Math.sin(lt * 3 + i))} y2={Math.sin(a) * r * (1.56 + 0.1 * Math.sin(lt * 3 + i))} stroke="#F5C63C" strokeWidth={r / 7} strokeLinecap="round" />; })}
      <circle r={r} fill="#F5C63C" /><circle r={r * 0.72} fill="#FBDD6E" />
    </g>
  );
}
function Drop({ x, y, s = 1, op = 1, color = "#7CC4F2" }) { return op > 0 ? <path transform={`translate(${x} ${y}) scale(${s})`} opacity={op} d="M0 -24 C10 -8 18 2 18 12 A18 18 0 0 1 -18 12 C-18 2 -10 -8 0 -24 Z" fill={color} stroke="#3D8EC4" strokeWidth={2} /> : null; }
function Beetle({ x, y, s = 1, flip = false, lt = 0 }) {
  const k = Math.sin(lt * 18) * 3;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      {[-16, 0, 16].map((d, i) => <line key={i} x1={d} y1={8} x2={d - 8 + (i % 2 ? k : -k)} y2={26} stroke="#111" strokeWidth={4} strokeLinecap="round" />)}
      <ellipse cx={0} cy={0} rx={34} ry={20} fill="#2A2F3A" />
      <path d="M-34 0 C-14 -8 14 -8 34 0" stroke="#6E7A8E" strokeWidth={2.5} fill="none" />
      <circle cx={-36} cy={-1} r={12} fill="#14161C" />
      <path d="M-44 -6 L-58 -14 M-44 3 L-60 8" stroke="#14161C" strokeWidth={4} strokeLinecap="round" />
    </g>
  );
}
function Bubbles({ x, y, s = 1, op = 1, lt = 0 }) {
  if (op <= 0) return null;
  return <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op} stroke="#DDF0FB" strokeWidth={3.5} fill="rgba(200,230,250,0.22)">
    <circle cx={-14} cy={10 - 3 * Math.sin(lt * 2)} r={15} /><circle cx={14} cy={-8 + 3 * Math.sin(lt * 2.4)} r={20} /><circle cx={-8} cy={-26 - 2 * Math.sin(lt * 3)} r={9} />
  </g>;
}
// Dark drawing stage: rounded panel in the photo area.
function Stage2({ x, y, w, h, op = 1, fill = "#0B3326" }) { return op > 0 ? <rect x={x} y={y} width={w} height={h} rx={18} fill={fill} stroke="rgba(255,255,255,0.45)" strokeWidth={3} opacity={op} /> : null; }
// Photo that zooms by `scale` about (ox,oy), for camera moves Pic's Ken Burns cannot do (pull-backs).
function Cam({ slot, label, x, y, w, h, lt, at = 0, dur = 0.7, out = null, outDur = 0.6, scale = 1, ox = "50%", oy = "50%", dim = 0 }) {
  const o = out3(lt, at, dur) * (out != null ? 1 - reveal(lt, out, outDur) : 1); if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 18, overflow: "hidden", opacity: o, boxShadow: "0 0 0 3px rgba(255,255,255,0.55)", background: SK.bgDeep }}>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${scale})`, transformOrigin: `${ox} ${oy}` }}>
        <Pic slot={slot} label={label} x={0} y={0} w={w} h={h} lt={1} at={0} dur={0.01} fx="none" border={false} r={0} />
      </div>
      {dim > 0 && <div style={{ position: "absolute", inset: 0, background: `rgba(5,30,22,${dim})` }} />}
    </div>
  );
}

// ---- The KIT strip: box / lunch / traveller → seed coat / food store / embryo ---------
const KIT = [["BOX", "SEED COAT"], ["LUNCH", "FOOD STORE"], ["TRAVELLER", "EMBRYO"]];
function KitIcon({ i, on }) {
  const dim = on ? 1 : 0.5;
  return (
    <svg width="74" height="74" viewBox="-50 -50 100 100" style={{ flex: "none", opacity: dim }}>
      <Defs />
      {i === 0 && <g><rect x={-38} y={-14} width={76} height={46} rx={8} fill="url(#s26steel)" stroke={STEEL_DK} strokeWidth={2} /><rect x={-42} y={-30} width={84} height={16} rx={7} fill="url(#s26steel)" stroke={STEEL_DK} strokeWidth={2} /></g>}
      {i === 1 && <g><circle cx={-8} cy={2} r={26} fill="#E3B872" stroke="#A97A38" strokeWidth={2} /><path d="M-40 34 C-40 2 8 -6 36 34 Z" fill="#FBF7EA" stroke="#D9D0B8" strokeWidth={2} /></g>}
      {i === 2 && <Embryo x={-6} y={4} s={0.9} sleep={1} />}
    </svg>
  );
}
function KitStrip({ lt, ons, active = -1 }) {
  return (
    <div style={{ position: "absolute", left: 40, top: 866, width: 1360, height: 104, display: "flex", gap: 20 }}>
      {KIT.map(([a, b], i) => {
        const o = ons[i] == null ? 0 : out3(lt, ons[i], 0.5), act = active === i;
        return (
          <div key={i} style={{ flex: 1, display: "flex", alignItems: "center", gap: 14, padding: "0 18px", boxSizing: "border-box", borderRadius: 16,
            background: "rgba(5,30,22,0.6)", boxShadow: `0 0 0 ${act ? 4 : 2}px ${act ? SK.gold : "rgba(255,255,255,0.22)"}` }}>
            <KitIcon i={i} on={o > 0.5} />
            <div style={{ whiteSpace: "nowrap", lineHeight: 1.1 }}>
              <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 21, letterSpacing: "0.1em", color: SK.gold }}>{a}</div>
              <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 34, color: SK.white, opacity: o }}>{b}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// b1 — the seed, the giant tree, the big question
function B1(ctx) {
  return ({ localTime: lt, duration }) => {
    const cQuiet = S("b1", 1), cLife = W("b1", "lifeless"), cOne = S("b1", 3), cThis = W("b1", "this", 1), cTree = W("b1", "giant"), cQ = S("b1", 4), cHow = W("b1", "how"), cBig = W("b1", "big", 1);
    const pull = drive(lt, cOne, cTree + 0.5), wig = lt > cQ ? Math.sin((lt - cQ) * 15) * 9 * Math.exp(-(((lt - cQ - 0.8) % 2.4 + 2.4) % 2.4) * 2.4) : 0;
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[1]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(1, ctx, [L("A Tiny Plant Waiting to Wake Up!", 0.8, "head"), L("How can something SO small hold something SO big?", cHow, "think")])}>
        <Cam slot="mango_tree" label="A giant mango tree towers overhead" x={40} y={60} w={1360} h={900} lt={lt} at={cOne} scale={lerp(3.4, 1, pull)} oy="96%" dim={0.55 * out3(lt, cQ, 0.7)} />
        <Cam slot="seed_fingertip" label="A single small seed rests on a fingertip" x={40} y={60} w={1360} h={900} lt={lt} at={0.1} out={cOne + 0.5} outDur={0.8}
          scale={lerp(1.5, 1.0, drive(lt, 0.2, cOne + 1.4))} />
        <SVG op={out3(lt, cQ, 0.6)}>
          <Defs />
          <Glow x={320} y={640} r={230} op={0.8} />
          <Seed x={320} y={640} s={1.25} rot={wig} />
        </SVG>
        <Chip text="a giant tree!" x={720} y={84} lt={lt} at={cThis} out={cQ} tone="gold" size={34} />
        <Big x={560} y={140} w={800} lt={lt} at={cHow} size={66} align="right">How can something SO small…</Big>
        <Big x={560} y={520} w={800} lt={lt} at={cBig - 0.9} size={66} align="right" color={SK.gold}>…hold something SO big?</Big>
      </Scene>
    );
  };
}

// b2 — seed turns into a tiffin box; box, lunch, traveller
function B2(ctx) {
  return ({ localTime: lt, duration }) => {
    const cTif = W("b2", "tiffin"), cBox = W("b2", "box", 1), cLunch = W("b2", "lunch"), cTrav = W("b2", "traveller"), cThree = W("b2", "three"), cOpen = S("b2", 5), cFirst = W("b2", "strong");
    const morph = drive(lt, cTif - 0.2, cTif + 0.9), open = drive(lt, cFirst - 0.4, cFirst + 0.8), gl = (at) => windowOp(lt, at, at + 1.8, 0.3);
    const seedO = 1 - clamp(morph * 1.5, 0, 1), boxO = clamp(morph * 1.5 - 0.3, 0, 1), boxS = lerp(0.3, 1, Easing2(morph));
    const three = out3(lt, cThree, 0.4);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[2]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(2, ctx, [L("Box → SEED COAT", cBox), L("Lunch → FOOD STORE", cLunch), L("Traveller → EMBRYO", cTrav)])}>
        <SVG>
          <Defs />
          <Stage2 x={40} y={60} w={1360} h={900} />
          {seedO > 0 && <g opacity={seedO}><Glow x={720} y={520} r={260} op={0.7} /><Seed x={720} y={520} s={1.7 + 0.8 * morph} /></g>}
          {boxO > 0 && <g opacity={boxO}><Tiffin x={720} y={610} s={boxS * 1.12} open={open} lt={lt} glowBox={gl(cBox)} glowLunch={gl(cLunch)} glowTrav={gl(cTrav)} /></g>}
          {three > 0 && [[1250, 420, 1], [190, 590, 2], [1250, 590, 3]].map(([cx, cy, n], i) => {
            const o = out3(lt, cThree + i * 0.25, 0.4); return <g key={n} opacity={o}><circle cx={cx} cy={cy} r={38} fill={SK.gold} /><T x={cx} y={cy + 15} size={42} color={SK.ink} bold serif>{n}</T></g>;
          })}
        </SVG>
        <Chip text="BOX" x={1250} y={470} lt={lt} at={cBox} tone="gold" size={36} />
        <Chip text="LUNCH" x={190} y={640} lt={lt} at={cLunch} tone="gold" size={36} />
        <Chip text="TRAVELLER" x={1250} y={640} lt={lt} at={cTrav} tone="gold" size={36} />
      </Scene>
    );
  };
}
const Easing2 = (t) => 1 - Math.pow(1 - t, 3);

// b3 — seed coat: rain, a beetle, the hot sun; the seed stays safe
function RainOnSeed({ lt, from, to, cx, cy, rx }) {
  if (lt < from - 0.1 || lt > to + 1.2) return null;
  return <g>{Array.from({ length: 16 }, (_, i) => {
    const per = 1.1, offs = rnd(i) * per, t = lt - from - offs; if (t < 0) return null;
    const n = Math.floor(t / per); if (from + offs + n * per > to) return null;
    const p = (t % per) / per, dx = lerp(-rx, rx, rnd(i + 40)), hitY = cy - 96 * Math.sqrt(Math.max(0.04, 1 - (dx / rx) * (dx / rx))) * 1.32, top = 90;
    if (p < 0.6) { const q = p / 0.6; return <Drop key={i} x={cx + dx} y={lerp(top, hitY, q * q)} s={0.6} op={0.95} />; }
    const q = (p - 0.6) / 0.4, side = dx >= 0 ? 1 : -1;
    return <Drop key={i} x={cx + dx + side * 70 * q} y={hitY - 62 * Math.sin(q * Math.PI * 0.85) + 26 * q * q} s={0.48} op={1 - q} />;
  })}</g>;
}
function B3(ctx) {
  return ({ localTime: lt, duration }) => {
    const cOne = S("b3", 0), cCoat = W("b3", "seed"), cTough = W("b3", "tough"), cOuter = W("b3", "outer"), cBoxW = W("b3", "box"), cShield = W("b3", "shields"), cDry = W("b3", "drying"), cSafe = W("b3", "safe");
    const st = out3(lt, cShield - 0.5, 0.6), bx = 720, by = 590;
    const beetleIn = drive(lt, cShield + 0.4, cShield + 1.5), beetleOut = drive(lt, cDry + 0.6, cDry + 1.8), nib = windowOp(lt, cShield + 1.5, cDry + 0.6, 0.15) * Math.abs(Math.sin(lt * 7)) * 12;
    const sunO = out3(lt, cDry - 0.2, 0.6), safe = out3(lt, cSafe, 0.5);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[3]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(3, ctx, [L("Outer protective covering", cOuter), L("Shields the seed from DAMAGE", cShield), L("Stops it DRYING OUT", cDry)])}>
        <Cam slot="bean_dry" label="A dry bean seed, smooth tough skin" x={40} y={60} w={1360} h={790} lt={lt} at={0.1} out={cShield - 0.4} scale={lerp(1, 1.5, drive(lt, 0.3, cShield))} />
        <Chip text="SEED COAT = the box" x={720} y={84} lt={lt} at={cCoat} out={cShield - 0.4} tone="gold" size={36} />
        <SVG op={st}>
          <Defs />
          <Stage2 x={40} y={60} w={1360} h={790} />
          <rect x={42} y={702} width={1356} height={146} rx={14} fill={SOIL} />
          <path d="M42 702 C300 690 500 712 720 700 C980 690 1180 712 1398 702" stroke={SOIL_D} strokeWidth={6} fill="none" />
          <Sun x={1240} y={190} r={72} lt={lt} op={sunO} />
          {[0, 1, 2].map((i) => <Arrow key={i} x1={1130 - i * 26} y1={236 + i * 52} x2={960 - i * 34} y2={400 + i * 44} color="#F5C63C" sw={6} head={22} op={sunO * (0.7 + 0.3 * Math.sin(lt * 3 + i))} />)}
          <RainOnSeed lt={lt} from={cShield - 0.3} to={cDry + 0.6} cx={bx} cy={by} rx={190} />
          <path d={BEAN} transform={`translate(${bx} ${by}) scale(2.14)`} fill="none" stroke="#9FE3B0" strokeWidth={3} opacity={0.5 + 0.25 * Math.sin(lt * 4)} />
          <Seed x={bx} y={by} s={2} />
          {beetleIn > 0 && <g opacity={1 - clamp(beetleOut * 1.3 - 0.3, 0, 1)}><Beetle x={lerp(1340, 1020 - nib, beetleIn) + beetleOut * 330} y={680} s={1.5} lt={lt * (beetleIn < 1 || beetleOut > 0 ? 1 : 0.3)} /></g>}
        </SVG>
        <Chip text="Safe inside" x={720} y={790} lt={lt} at={cSafe} tone="gold" size={32} op={safe} />
        <KitStrip lt={lt} ons={[cCoat, null, null]} active={0} />
      </Scene>
    );
  };
}

// b4 — the food store: cotyledons in a bean, endosperm in maize, food flows to the baby plant
function B4(ctx) {
  return ({ localTime: lt, duration }) => {
    const cTwo = S("b4", 0), cBeanW = W("b4", "bean"), cHalves = W("b4", "thick"), cCoty = W("b4", "cotyledons"), cMaize = W("b4", "maize"), cEndo = W("b4", "endosperm"),
      cFeeds = S("b4", 3), cLeaves = W("b4", "green"), cOwn = W("b4", "own"), cSun = W("b4", "sunlight"), cPhoto = W("b4", "photosynthesis");
    const end = cFeeds - 0.3, open = drive(lt, cHalves - 0.5, cHalves + 1.0), cut = drive(lt, cMaize + 0.2, cMaize + 1.3), lit = out3(lt, cEndo, 0.6);
    const secO = 1 - reveal(lt, end, 0.5), feedO = out3(lt, end + 0.2, 0.6);
    const grow = drive(lt, cFeeds + 0.2, cLeaves + 1.0), lf = drive(lt, cLeaves, cOwn + 0.4), flowOff = 1 - reveal(lt, cOwn, 0.8);
    const flowPts = [[0, -44], [-58, -18], [62, -34]];
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[4]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(4, ctx, [L("ENDOSPERM or COTYLEDONS", cCoty, "big"), L("Feeds the baby plant UNTIL it can make its own food", cFeeds), L("PHOTOSYNTHESIS", cPhoto, "head")])}>
        <div style={{ position: "absolute", inset: 0, opacity: secO }}>
          <Pic slot="bean_soaked" label="A soaked bean split into two halves" x={40} y={60} w={670} h={300} lt={lt} at={cBeanW - 0.3} fx="zoom" />
          <Pic slot="maize_cut" label="A maize grain cut in half" x={730} y={60} w={670} h={300} lt={lt} at={cMaize - 0.3} fx="zoom" />
        </div>
        <SVG op={1 - reveal(lt, cBeanW - 0.3, 0.4)}>
          <Defs />
          <Stage2 x={40} y={60} w={1360} h={790} />
          <Tiffin x={720} y={500} s={0.95} open={1} lt={lt} glowLunch={0.9} trav={0.35} />
        </SVG>
        <SVG op={secO}>
          <Defs />
          <g opacity={out3(lt, cBeanW - 0.3, 0.5)}>
            <Stage2 x={40} y={376} w={670} h={474} />
            {open < 0.14 && <Seed x={375} y={610} s={1.38} />}
            {open >= 0.14 && <g>
              <SplitBean x={375 - 160 * open} y={610} s={1.38} flip rot={-10 * open} emb={0} />
              <SplitBean x={375 + 160 * open} y={610} s={1.38} rot={10 * open} emb={1} />
            </g>}
          </g>
          <g opacity={out3(lt, cMaize - 0.3, 0.5)}>
            <Stage2 x={730} y={376} w={670} h={474} />
            <MaizeGrain x={1065} y={636} s={1.1} cut={cut} lit={lit} />
            {cut > 0 && cut < 1 && <line x1={1065} y1={402} x2={1065} y2={830} stroke="#fff" strokeWidth={4} opacity={Math.sin(cut * Math.PI)} />}
          </g>
        </SVG>
        <div style={{ opacity: secO }}>
          <Chip text="COTYLEDONS" x={375} y={392} lt={lt} at={cCoty} tone="gold" size={32} />
          <Chip text="ENDOSPERM" x={1065} y={392} lt={lt} at={cEndo} tone="gold" size={32} />
        </div>
        <SVG op={feedO}>
          <Defs />
          <Stage2 x={40} y={60} w={1360} h={790} />
          <rect x={42} y={640} width={1356} height={208} rx={14} fill={SOIL} />
          <SplitBean x={420} y={470} s={2.7} emb={1} breath={1 + 0.02 * Math.sin(lt * 2.4)} />
          {flowOff > 0 && flowPts.map((f, j) => Array.from({ length: 4 }, (_, i) => {
            const p = ((lt * 0.5 + i / 4 + j * 0.13) % 1), sx = 420 + f[0] * 2.7, sy = 470 + f[1] * 2.7, ex = 426, ey = 486;
            return <circle key={`${j}-${i}`} cx={lerp(sx, ex, p)} cy={lerp(sy, ey, p)} r={9} fill={SK.gold} stroke="#fff" strokeWidth={2} opacity={Math.sin(p * Math.PI) * flowOff} />;
          }))}
          {grow > 0 && <Arrow x1={720} y1={470} x2={840} y2={470} color={SK.gold} op={out3(lt, cLeaves, 0.4)} />}
          <Sprouting x={1040} y={700} s={1} sw={0.9} r={0.6 * grow} hr={grow} p={grow} q={lf} lf={lf} gr={lf} sp={lf} rootLen={120} shootLen={300} />
          <Sun x={1270} y={180} r={66} lt={lt} op={out3(lt, cSun, 0.5)} />
          {[0, 1, 2].map((i) => <Arrow key={i} x1={1190 - i * 40} y1={210 + i * 46} x2={1130 - i * 60} y2={300 + i * 26} color="#F5C63C" sw={5} head={18} op={out3(lt, cSun + 0.2 + i * 0.15, 0.4)} />)}
        </SVG>
        <Chip text="food flows to the baby plant" x={420} y={100} lt={lt} at={cFeeds + 0.4} out={cOwn} tone="cream" size={32} />
        <Chip text="PHOTOSYNTHESIS" x={720} y={92} lt={lt} at={cPhoto} tone="gold" size={42} />
        <KitStrip lt={lt} ons={[-5, cTwo, null]} active={1} />
      </Scene>
    );
  };
}

// b5 — the embryo: zoom into the split bean, label radicle and plumule, the tree begins here
function B5(ctx) {
  return ({ localTime: lt, duration }) => {
    const cThree = S("b5", 0), cEmb = W("b5", "embryo"), cLiving = W("b5", "living"), cSleep = W("b5", "sleeping"), cLook = S("b5", 2), cRad = W("b5", "radicle"), cRoot = W("b5", "root"), cPlum = W("b5", "plumule"), cShootW = W("b5", "shoot"), cAll = S("b5", 5), cRight = W("b5", "right");
    const C = [1000, 440], E = [2, 6], z = lerp(1.9, 6.6, drive(lt, cEmb - 0.2, cLook + 0.4)), br = 1 + 0.035 * Math.sin(lt * 2.1);
    const glow = out3(lt, cLiving, 0.7), P = (px, py) => [C[0] + z * (px - E[0]), C[1] + z * (py - E[1])];
    const rad = P(2 - 34 * 0.82, 6 + 30 * 0.82), plu = P(2 + 40 * 0.82, 6 - 14 * 0.82), ghost = out3(lt, cAll + 0.2, 1.2);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[5]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(5, ctx, [L("The LIVING baby plant", cLiving), L("RADICLE → the tiny ROOT", cRad), L("PLUMULE → the tiny SHOOT", cPlum)])}>
        <Pic slot="bean_embryo" label="The tiny embryo inside a split bean" x={40} y={60} w={480} h={790} lt={lt} at={0.1} fx="zoom" zoom={1.3} kenDur={18} />
        <SVG>
          <Defs />
          <clipPath id="s26b5"><rect x={540} y={60} width={860} height={790} rx={18} /></clipPath>
          <Stage2 x={540} y={60} w={860} h={790} />
          <g clipPath="url(#s26b5)">
            <SplitBean x={C[0] - z * E[0]} y={C[1] - z * E[1]} s={z} emb={0} coatOn={1} />
            <Glow x={C[0] + 30} y={C[1]} r={70 * z} op={0.75 * glow} />
            <Embryo x={C[0]} y={C[1]} s={0.82 * z} breath={br} sleep={clamp(reveal(lt, cSleep, 0.5), 0, 1)} />
          </g>
          {ghost > 0 && <g opacity={ghost * 0.9}>
            <path d={`M${plu[0] + 10} ${plu[1] - 50} C ${plu[0] + 10} 320 ${plu[0] + 20} 280 ${plu[0] + 14} 244`} stroke={SK.goldDeep} strokeWidth={9} fill="none" strokeLinecap="round" />
            <path d={`M${plu[0] - 150} 210 C ${plu[0] - 175} 110 ${plu[0] - 60} 76 ${plu[0] + 14} 82 C ${plu[0] + 90} 74 ${plu[0] + 200} 112 ${plu[0] + 165} 212 C ${plu[0] + 100} 256 ${plu[0] - 90} 256 ${plu[0] - 150} 210 Z`} stroke={SK.goldDeep} strokeWidth={7} fill="rgba(111,191,110,0.55)" />
          </g>}
          <g opacity={out3(lt, cRad, 0.4)}><line x1={rad[0]} y1={rad[1]} x2={760} y2={740} stroke={SK.white} strokeWidth={4} /><circle cx={rad[0]} cy={rad[1]} r={8} fill={SK.gold} /></g>
          <g opacity={out3(lt, cPlum, 0.4)}><line x1={plu[0]} y1={plu[1]} x2={1250} y2={730} stroke={SK.white} strokeWidth={4} /><circle cx={plu[0]} cy={plu[1]} r={8} fill={SK.gold} /></g>
        </SVG>
        <Chip text="EMBRYO" x={970} y={84} lt={lt} at={cEmb} tone="gold" size={36} out={cAll} />
        <Chip text="RADICLE · tiny root" x={760} y={738} lt={lt} at={cRad} tone="gold" size={30} />
        <Chip text="PLUMULE · tiny shoot" x={1200} y={738} lt={lt} at={cPlum} tone="gold" size={30} />
        <KitStrip lt={lt} ons={[-5, -5, cThree]} active={2} />
      </Scene>
    );
  };
}

// b6 — label it: a split bean with three blank labels, frozen
function B6(ctx) {
  return ({ localTime: lt, duration }) => {
    const cName = S("b6", 1), BX = 700, BY = 520, BS = 4.2;
    const lab = [[BX - 60, BY - 66 * BS, 190, 230, 1], [BX - 76 * BS * 0.6, BY - 10 * BS, 170, 620, 2], [BX + 10, BY + 26, 1200, 690, 3]];
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[6]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(6, ctx, [L("Outer covering?", cName), L("Food store?", cName + 0.5), L("Living baby plant?", cName + 1.0)])}>
        <SVG>
          <Defs />
          <Stage2 x={40} y={60} w={1360} h={900} />
          <SplitBean x={BX} y={BY} s={BS} />
          {lab.map(([px, py, lx, ly], i) => { const o = out3(lt, cName + i * 0.35, 0.5); return <g key={i} opacity={o}>
            <line x1={px} y1={py} x2={lx + (lx < 700 ? 90 : -90)} y2={ly} stroke={SK.white} strokeWidth={4} />
            <circle cx={px} cy={py} r={9} fill={SK.gold} />
            <rect x={lx - 110} y={ly - 42} width={220} height={84} rx={14} fill={SK.cream} stroke={SK.gold} strokeWidth={4} />
            <T x={lx} y={ly + 19} size={54} color={SK.goldDeep} bold serif>?</T>
          </g>; })}
        </SVG>
        <StopBar lt={lt} b="b6" head="LABEL IT" y={60} />
      </Scene>
    );
  };
}

// b7 — germination begins: water, air, warmth; soak, swell, crack
function B7(ctx) {
  return ({ localTime: lt, duration }) => {
    const cGerm = W("b7", "germination"), cRightW = W("b7", "right"), cWater = W("b7", "water"), cAir = W("b7", "air"), cWarm = W("b7", "warmth"), cSoak = W("b7", "soaks"), cSwell = W("b7", "swells"), cThen = S("b7", 4), cCrack = W("b7", "crack"), cBreak = W("b7", "breaks");
    const sw = lerp(1, 1.42, drive(lt, cSoak, cThen)), wr = out3(lt, cSwell, 0.9) * (1 - 0.5 * reveal(lt, cCrack, 0.4)), cr = Easing2(reveal(lt, cCrack + 0.1, 0.35));
    const shake = lt > cThen && lt < cCrack + 0.2 ? Math.sin(lt * 46) * 3 : 0, bang = windowOp(lt, cCrack, cCrack + 1.7, 0.1);
    const bx = 1000, by = 580;
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[7]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(7, ctx, [L("Right conditions: WATER, AIR and WARMTH", cRightW, "head"), L("Seed ABSORBS water", cSoak), L("SWELLS", cSwell), L("Seed coat BREAKS open", cBreak)])}>
        <Pic slot="bean_cotton" label="A bean on damp cotton wool" x={40} y={60} w={520} h={530} lt={lt} at={0.1} fx="zoom" kenDur={20} />
        <SVG>
          <Defs />
          <Stage2 x={40} y={610} w={520} h={350} />
          {[["Water", 140, cWater], ["Air", 300, cAir], ["Warmth", 460, cWarm]].map(([t, x, at], i) => {
            const o = pop(lt, at); if (o <= 0) return null;
            return <g key={i} opacity={clamp(o, 0, 1)}>
              {i === 0 && <Drop x={x} y={750} s={2.1} />}
              {i === 1 && <Bubbles x={x} y={760} s={1.5} lt={lt} />}
              {i === 2 && <Sun x={x} y={756} r={36} lt={lt} />}
              <T x={x} y={896} size={34} bold>{t}</T>
            </g>;
          })}
          <Stage2 x={580} y={60} w={820} h={900} />
          <ellipse cx={bx} cy={by + 150} rx={330} ry={84} fill="#F4F2EC" />
          {Array.from({ length: 16 }, (_, i) => <ellipse key={i} cx={bx + lerp(-270, 270, rnd(i + 3))} cy={by + 150 + lerp(-46, 46, rnd(i + 21))} rx={52} ry={18} fill="#fff" opacity={0.8} />)}
          <ellipse cx={bx} cy={by + 160} rx={260} ry={46} fill="#BFD9E8" opacity={0.5} />
          {lt > cSoak - 0.2 && lt < cThen + 0.4 && Array.from({ length: 8 }, (_, i) => {
            const p = ((lt * 0.7 + i / 8) % 1), a = (i / 8) * Math.PI * 2, r = lerp(300, 170 * sw, p);
            return <Drop key={i} x={bx + Math.cos(a) * r} y={by + Math.sin(a) * r * 0.62} s={0.55} op={Math.sin(p * Math.PI)} />;
          })}
          <Seed x={bx + shake} y={by} s={1.75 * sw} wr={wr} crack={cr} />
          {bang > 0 && <g opacity={bang}>
            {Array.from({ length: 10 }, (_, i) => { const a = -Math.PI * 0.95 + (i / 9) * Math.PI * 0.9, k = reveal(lt, cCrack, 0.4), r0 = 215, r1 = r0 + 70 * k;
              return <line key={i} x1={bx + Math.cos(a) * r0} y1={by + Math.sin(a) * r0} x2={bx + Math.cos(a) * r1} y2={by + Math.sin(a) * r1} stroke={SK.gold} strokeWidth={8} strokeLinecap="round" />; })}
            <T x={bx} y={230} size={92} color={SK.gold} bold serif>CRACK!</T>
          </g>}
        </SVG>
        <Chip text="GERMINATION" x={990} y={84} lt={lt} at={cGerm} out={cCrack - 0.2} tone="gold" size={38} />
        <Chip text="SOAKS up water" x={990} y={860} lt={lt} at={cSoak} out={cSwell} tone="cream" size={32} />
        <Chip text="SWELLS" x={990} y={860} lt={lt} at={cSwell} out={cCrack} tone="cream" size={32} />
        <Chip text="Seed coat BREAKS open" x={990} y={860} lt={lt} at={cBreak} tone="cream" size={32} />
      </Scene>
    );
  };
}

// A clear glass jar, side view, filled with soil. Seed sits against the glass.
function Jar({ x, y, w, h, soilY }) {
  return (
    <g>
      <rect x={x} y={soilY} width={w} height={y + h - soilY} rx={26} fill={SOIL} />
      <path d={`M${x} ${soilY} q ${w / 4} -14 ${w / 2} 0 t ${w / 2} 0`} fill={SOIL} stroke={SOIL_D} strokeWidth={4} />
      {Array.from({ length: 36 }, (_, i) => <circle key={i} cx={x + 24 + rnd(i) * (w - 48)} cy={soilY + 24 + rnd(i + 50) * (y + h - soilY - 48)} r={2 + 4 * rnd(i + 90)} fill={SOIL_D} opacity={0.75} />)}
      <rect x={x} y={y} width={w} height={h} rx={26} fill="rgba(210,235,245,0.09)" stroke="rgba(235,248,255,0.85)" strokeWidth={7} />
      <rect x={x - 10} y={y - 8} width={w + 20} height={20} rx={10} fill="rgba(225,242,250,0.3)" />
      <rect x={x + 22} y={y + 36} width={16} height={h - 90} rx={8} fill="#fff" opacity={0.16} />
    </g>
  );
}
// b8 — root first, shoot next, inside a glass jar
function B8(ctx) {
  return ({ localTime: lt, duration }) => {
    const cRoot = W("b8", "root"), cFirst = W("b8", "first"), cRad = W("b8", "radicle"), cDown = W("b8", "down"), cHold = W("b8", "hold"), cDrink = W("b8", "drink"), cNext = S("b8", 2), cPlum = W("b8", "plumule"), cUp = W("b8", "up"), cSun = W("b8", "sunlight"), cSlow = S("b8", 4), cOwn = W("b8", "own"), cTrav = S("b8", 6);
    const JX = 110, JY = 110, JW = 620, JH = 720, SY = 400, sdX = 420, sdY = 490;
    const r = drive(lt, cRoot, cDrink + 0.3), hr = drive(lt, cHold, cNext), p = drive(lt, cNext, cSlow - 0.1), q = drive(lt, cPlum + 0.6, cSlow), lf = drive(lt, cSlow, cOwn), gr = drive(lt, cSlow + 0.3, cOwn + 0.6), sp = drive(lt, cOwn, cTrav + 1.2);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[8]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(8, ctx, [L("RADICLE grows DOWN into the soil", cDown), L("PLUMULE grows UP towards sunlight", cUp), L("First leaves → the plant makes its OWN food", cOwn)])}>
        <SVG>
          <Defs />
          <Stage2 x={40} y={60} w={1360} h={900} />
          <Jar x={JX} y={JY} w={JW} h={JH} soilY={SY} />
          <Sprouting x={sdX} y={sdY} s={1.2} sw={1.32} cr={1} r={r} hr={hr} p={p} q={q} lf={lf} gr={gr} sp={sp} rootLen={245} shootLen={245} />
          <Sun x={1290} y={170} r={68} lt={lt} op={out3(lt, cSun, 0.5)} />
          <g opacity={out3(lt, cTrav, 0.5)}><Tiffin x={1250} y={850} s={0.26} open={1} lunch={0} trav={0} /></g>
          <Arrow x1={860} y1={470} x2={860} y2={770} color={SK.white} sw={9} head={32} op={out3(lt, cDown, 0.5)} />
          <Arrow x1={860} y1={380} x2={860} y2={120} color={LEAF} sw={9} head={32} op={out3(lt, cUp, 0.5)} />
        </SVG>
        <Chip text="ROOT comes out FIRST" x={420} y={870} lt={lt} at={cFirst} out={cNext} tone="gold" size={34} />
        <Chip text="RADICLE · DOWN" x={900} y={590} lt={lt} at={cDown} tone="gold" size={32} anchor="left" />
        <Chip text="holds the plant, drinks water" x={900} y={648} lt={lt} at={cHold} tone="cream" size={27} anchor="left" />
        <Chip text="PLUMULE · UP" x={900} y={230} lt={lt} at={cUp} tone="gold" size={32} anchor="left" />
        <Pic slot="jar_seedling" label="A bean seedling in a clear glass jar" x={900} y={320} w={460} h={240} lt={lt} at={cSlow} fx="zoom" />
        <Chip text="The lunch is finished!" x={420} y={870} lt={lt} at={cTrav} tone="gold" size={34} />
      </Scene>
    );
  };
}

// b9 — four jumbled picture cards, frozen
const ORDER = [
  { t: "Swells", st: { sw: 1.5, wr: 0.7 }, y: 10 },
  { t: "Leaves open", st: { sw: 1.2, cr: 1, r: 0.7, hr: 1, p: 1, q: 1, lf: 1, gr: 1, sp: 0.5, shootLen: 210, rootLen: 110 }, y: 90 },
  { t: "Root grows", st: { sw: 1.3, cr: 1, r: 1, hr: 1, rootLen: 130 }, y: -10 },
  { t: "Coat breaks", st: { sw: 1.5, wr: 0.4, cr: 1 }, y: 10 },
];
function B9(ctx) {
  return ({ localTime: lt, duration }) => {
    const cTurn = S("b9", 0), cPut = S("b9", 1), rots = [-3.5, 2.5, -2, 3.2], W0 = 310, H0 = 500, Xs = [60, 400, 740, 1080], Ys = [200, 290, 170, 250];
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[9]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(9, ctx, ORDER.map((o, i) => L(o.t, cPut + i * 0.3)))}>
        {ORDER.map((c, i) => {
          const o = pop(lt, cTurn + 0.2 + i * 0.3, 0.55); if (o <= 0) return null;
          const showT = c.t === "Leaves open" ? 170 : c.t === "Root grows" ? 150 : 170;
          return (
            <div key={i} style={{ position: "absolute", left: Xs[i], top: Ys[i], width: W0, height: H0, borderRadius: 20, background: "#163F31", opacity: clamp(o, 0, 1),
              transform: `rotate(${rots[i]}deg) scale(${0.8 + 0.2 * o})`, boxShadow: `0 0 0 4px ${SK.cream}, 0 12px 26px rgba(0,0,0,0.35)`, overflow: "hidden" }}>
              <svg width={W0} height={H0 - 84} viewBox={`0 0 ${W0} ${H0 - 84}`} style={{ position: "absolute", left: 0, top: 0 }}>
                <Defs />
                <rect x={0} y={236} width={W0} height={H0} fill={SOIL} />
                <Sprouting x={W0 / 2} y={270} s={0.88} {...c.st} />
              </svg>
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 84, background: SK.cream, display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: SERIF, fontWeight: 700, fontSize: 36, color: SK.ink }}>{c.t}</div>
            </div>
          );
        })}
        <StopBar lt={lt} b="b9" head="PUT IN ORDER" y={60} />
      </Scene>
    );
  };
}

// b10 — did you know? coco de mer, orchid dust, the old lotus seed, a seedling on its side
function B10(ctx) {
  return ({ localTime: lt, duration }) => {
    const cDyk = S("b10", 0), cNature = S("b10", 1), cCoco = S("b10", 2), cSey = W("b10", "seychelles"), cKg = W("b10", "kilograms"), cOne = S("b10", 3), cChild = W("b10", "child"),
      cOrch = S("b10", 4), cDust = W("b10", "dust"), cMill = W("b10", "million"), cLotus = S("b10", 6), cThou = W("b10", "one", 2), cSprout = W("b10", "sprouted"), cMore = S("b10", 7), cTurn = W("b10", "turn"), cCurve = W("b10", "curves"), cGrav = W("b10", "gravity"), cBack = W("b10", "back");
    const rotA = -90 + 90 * drive(lt, cTurn, cTurn + 1.0), bendR = drive(lt, cCurve - 0.1, cGrav + 0.5), bendS = drive(lt, cGrav + 0.5, cBack + 0.9), shot4 = out3(lt, cMore - 0.1, 0.6);
    const burst = reveal(lt, cOrch + 0.5, 3.4), jx = 720, jy = 480, split = drive(lt, cOne - 0.5, cOne + 0.2);
    const side = (dir, bend, len) => { const pts = [[0, 0]]; let x = 0, y = 0, a = dir > 0 ? 0 : Math.PI; const sign = dir > 0 ? -1 : -1; const N = 30;
      for (let i = 0; i < N; i++) { const u = i / N; if (u > 0.42) a += sign * bend * (Math.PI / 2) / (N * 0.58) * (dir > 0 ? 1 : 1); x += Math.cos(a) * len / N; y += Math.sin(a) * len / N; pts.push([x, y]); }
      return { d: "M" + pts.map((p) => p.join(" ")).join(" L"), tip: pts[N], a }; };
    const sh = side(1, bendS, 250), rt = side(-1, bendR, 230);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[10]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(10, ctx, [L("Coco de mer (Seychelles): the WORLD'S BIGGEST seed, 10–25 kg", cCoco), L("Orchids: over a MILLION dust-like seeds in one pod", cMill), L("Lotus: a seed about 1,300 years old still sprouted!", cSprout), L("Roots follow GRAVITY down; shoots grow up", cGrav)], { max: 4 })}>
        <SVG op={1 - reveal(lt, cCoco, 0.4)}><Stage2 x={40} y={60} w={1360} h={900} /></SVG>
        {lt < cCoco + 0.2 && <Flip x={270} y={170} w={900} h={380} lt={lt} at={cDyk} q="Did you know?" size={78} />}
        {lt < cCoco + 0.2 && <Big x={140} y={620} w={1160} lt={lt} at={cNature} size={58} align="center" color={SK.gold}>Nature has some EXTRAORDINARY seeds!</Big>}
        {/* Shot 1 */}
        <Pic slot="coco_palm" label="A coco de mer palm in the Seychelles" x={40} y={60} w={lerp(1360, 670, split)} h={900} lt={lt} at={cCoco} out={cOrch - 0.1} fx="zoom" />
        <Pic slot="coco_seed" label="A giant coco de mer seed on a weighing scale, child beside it" x={730} y={60} w={670} h={900} lt={lt} at={cOne - 0.2} out={cOrch - 0.1} fx="zoom" />
        <Chip text="Seychelles" x={lerp(720, 375, split)} y={90} lt={lt} at={cSey} out={cOrch - 0.1} tone="gold" size={34} />
        <Chip text="10 to 25 kg" x={1065} y={90} lt={lt} at={cKg - 0.8} out={cOrch - 0.1} tone="gold" size={42} />
        <Chip text="WORLD'S BIGGEST SEED" x={lerp(720, 375, split)} y={850} lt={lt} at={W("b10", "biggest")} out={cOrch - 0.1} tone="cream" size={32} />
        <Chip text="as heavy as a child" x={1065} y={850} lt={lt} at={cChild} out={cOrch - 0.1} tone="cream" size={32} />
        {/* Shot 2 */}
        <Pic slot="orchid_pod" label="An orchid seed pod bursting open" x={40} y={60} w={1360} h={900} lt={lt} at={cOrch} out={cLotus - 0.1} fx="zoom" />
        <SVG op={windowOp(lt, cOrch + 0.3, cLotus, 0.4)}>
          {Array.from({ length: 150 }, (_, i) => { const a = rnd(i) * Math.PI * 2, d = 40 + 560 * Math.sqrt(rnd(i + 200)) * Easing2(burst), dr = lt * 0.5 + i;
            return <circle key={i} cx={720 + Math.cos(a) * d * 1.3 + 8 * Math.sin(dr)} cy={500 + Math.sin(a) * d * 0.72 + 6 * Math.cos(dr)} r={1.6 + 2.6 * rnd(i + 400)} fill="#FFF6D8" opacity={0.85} />; })}
        </SVG>
        <Chip text="as fine as DUST" x={720} y={90} lt={lt} at={cDust} out={cLotus - 0.1} tone="gold" size={38} />
        <Chip text="over a MILLION seeds in one pod" x={720} y={860} lt={lt} at={cMill} out={cLotus - 0.1} tone="cream" size={34} />
        {/* Shot 3 */}
        <Pic slot="lotus_sprout" label="An old lotus seed sprouts in a bowl of water" x={40} y={60} w={1360} h={900} lt={lt} at={cLotus} out={cMore - 0.1} fx="zoom" />
        <Chip text="about 1,300 years old" x={720} y={90} lt={lt} at={cThou} out={cMore - 0.1} tone="gold" size={44} />
        <Chip text="and it SPROUTED!" x={720} y={860} lt={lt} at={cSprout} out={cMore - 0.1} tone="cream" size={34} />
        {/* Shot 4 */}
        <SVG op={shot4}>
          <Defs />
          <Stage2 x={40} y={60} w={1360} h={900} />
          <g transform={`translate(${jx} ${jy}) rotate(${rotA})`}>
            <rect x={-380} y={-210} width={760} height={420} rx={34} fill="rgba(210,235,245,0.08)" stroke="rgba(235,248,255,0.85)" strokeWidth={7} />
          </g>
          {/* the seedling: rotates with the jar, and its bending parts turn back with gravity */}
          <g transform={`translate(${jx} ${jy}) rotate(${rotA})`}>
            <path d={rt.d} transform="translate(-30 6)" stroke={ROOT} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d={sh.d} transform="translate(26 -2)" stroke={LEAF_D} strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <g transform={`translate(${26 + sh.tip[0]} ${-2 + sh.tip[1]}) rotate(${(sh.a * 180) / Math.PI + 90}) scale(1.15)`}>
              <path d="M0 0 C-30 -14 -52 -40 -66 -74 C-30 -72 -4 -44 0 0 Z" fill={LEAF} stroke={LEAF_D} strokeWidth={2} transform="rotate(-26)" />
              <path d="M0 0 C30 -14 52 -40 66 -74 C30 -72 4 -44 0 0 Z" fill={LEAF} stroke={LEAF_D} strokeWidth={2} transform="rotate(26)" />
            </g>
            <Seed x={0} y={0} s={0.52} rot={90} wr={0.5} />
          </g>
          <Arrow x1={1240} y1={250} x2={1240} y2={660} color={SK.gold} sw={10} head={36} op={out3(lt, cGrav, 0.5)} />
        </SVG>
        <Chip text="GRAVITY" x={1240} y={180} lt={lt} at={cGrav} tone="gold" size={36} />
        <Chip text="root curves DOWN" x={470} y={716} lt={lt} at={cCurve} tone="cream" size={32} />
        <Chip text="shoot turns back UP" x={960} y={190} lt={lt} at={cBack} tone="cream" size={32} />
      </Scene>
    );
  };
}

// b11 — quick check, answers on their cues, then the seed grows into the giant tree
function B11(ctx) {
  return ({ localTime: lt, duration }) => {
    const cQC = S("b11", 0), Qs = [S("b11", 1), S("b11", 2), S("b11", 3)], As = [S("b11", 4), S("b11", 5), S("b11", 6)], cSo = S("b11", 7), cPlant = S("b11", 8), cWake = S("b11", 9), s = stopFor("b11"), stop = stopAt("b11", s[1]);
    const QA = [["Which part protects the seed?", "The SEED COAT"], ["What is the tiny root called?", "The RADICLE"], ["Which comes out first, root or shoot?", "The ROOT!"]];
    const qcO = 1 - reveal(lt, cSo - 0.2, 0.6), hint = windowOp(lt, stop, stop + s[2] - 0.1, 0.3);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[11]} showCaps={ctx.caps} capSize={ctx.capSize} fo={0.9}
        panel={panel(11, ctx, [L("1. Which part protects the seed?", Qs[0]), L("2. What is the tiny root called?", Qs[1]), L("3. Which comes out first, root or shoot?", Qs[2])])}>
        <Cam slot="seed_fingertip" label="The tiny seed from the start" x={40} y={60} w={1360} h={900} lt={lt} at={cSo - 0.4} out={cPlant - 1.0} scale={1.08} />
        <Pic slot="young_plant" label="The seed is now a young green plant" x={40} y={60} w={1360} h={900} lt={lt} at={cPlant - 1.4} dur={1.0} out={cWake + 0.3} outDur={1.0} fx="zoom" />
        <Cam slot="mango_tree" label="The giant mango tree" x={40} y={60} w={1360} h={900} lt={lt} at={cWake} dur={1.2} scale={lerp(1.25, 1, drive(lt, cWake, duration))} oy="90%" />
        <Big x={100} y={120} w={1240} lt={lt} at={cWake + 0.1} size={84} align="center" color={SK.white}>waiting to WAKE UP!</Big>
        <div style={{ opacity: qcO }}>
          {qcO > 0 && <div style={{ position: "absolute", left: 40, top: 60, width: 1360, height: 900, borderRadius: 22, background: "rgba(5,30,22,0.94)", boxShadow: "0 0 0 3px rgba(226,176,76,0.9)", opacity: out3(lt, cQC - 0.2, 0.5) }}>
            <div style={{ position: "absolute", left: 60, top: 50, fontFamily: SERIF, fontWeight: 700, fontSize: 40, letterSpacing: "0.06em", color: SK.ink, background: SK.gold, padding: "10px 30px", borderRadius: 14 }}>QUICK CHECK</div>
            {QA.map(([q, a], i) => { const qo = out3(lt, Qs[i], 0.5), ao = pop(lt, As[i], 0.5); return (
              <div key={i} style={{ position: "absolute", left: 60, top: 180 + i * 215, width: 1240, opacity: qo }}>
                <div style={{ display: "flex", gap: 24, alignItems: "baseline" }}>
                  <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 56, color: SK.gold }}>{i + 1}</span>
                  <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 52, color: SK.white, whiteSpace: "nowrap" }}>{q}</span>
                </div>
                <div style={{ marginLeft: 56, marginTop: 14, height: 72 }}>
                  {ao > 0 && <span style={{ display: "inline-block", opacity: clamp(ao, 0, 1), transform: `scale(${0.85 + 0.15 * ao})`, transformOrigin: "left center", fontFamily: SANS, fontWeight: 700, fontSize: 44, color: SK.ink, background: SK.cream, padding: "6px 26px", borderRadius: 14 }}>{a}</span>}
                </div>
              </div>
            ); })}
            <div style={{ position: "absolute", right: 40, top: 66, fontFamily: SANS, fontSize: 26, color: SK.dim, opacity: hint }}>Stop 3 of 3</div>
          </div>}
        </div>
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
const COLLAGE = [{ slot: "mango_tree", x: -60, y: -40, w: 760, h: 520, ph: 0 }, { slot: "field_maize", x: 640, y: -80, w: 760, h: 520, ph: 2 },
  { slot: "soil_moist", x: -80, y: 520, w: 700, h: 560, ph: 4 }, { slot: "young_plant", x: 560, y: 560, w: 820, h: 560, ph: 1 }];
function Lp26Scenes(props = {}) {
  const caps = props.showCaptions === "false" ? false : props.showCaptions !== false;
  const titles = {};
  for (let n = 1; n <= NB; n++) titles[n] = str(props["title" + n + "Text"], TITLES[n]);
  const ctx = { caps, titles, capSize: num(props.captionSize, 34) };
  const B = [B1, B2, B3, B4, B5, B6, B7, B8, B9, B10, B11];
  const beats = B.map((Bn, i) => { const t = BEAT("b" + (i + 1)); return [t.start, t.start + t.dur, Bn]; });
  return (
    <StoryFrame props={props} dur={DUR} persistKey="thinkpro-lp27-inside-a-seed" collage={COLLAGE}>
      {beats.map(([s, e, Bn], i) => (
        <Sprite key={i} start={s} end={e}>{Bn(ctx)}</Sprite>
      ))}
      {STOPS.map(([b, i, hold]) => <StopAt key={b} t={BEAT(b).start + stopAt(b, i)} hold={hold - 0.2} />)}
      <ChimeAt t={BEAT("b10").start + S("b10", 0, 0)} />
      <AudioSync />
    </StoryFrame>
  );
}
window.Lp26Scenes = Lp26Scenes;
