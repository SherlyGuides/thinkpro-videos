/* global React, window */
// ThinkPro Academy — "Preparing the Field: Giving Every Seed a Perfect Start!" (Grade 6 Agriculture, Session 23, V1).
// After the AG_G6_S23 script (Subrata, 5 Nov 2026): 11 script scenes as 11 voiced beats, two presenter stops
// (b5, b9: TPStory.StopAt freezes the web player, the export holds the card), one Did-you-know beat (b10, chime).
// Running idea: BEEJ the seed waits in the farmer's pocket while the "READY FOR BEEJ?" checklist ticks off the five
// jobs; at the end Beej goes into the soil. Drawn teaching models in this file (the kit has none of them): Beej,
// Pocket, Check, SoilCut, Ground, BundArt, Beds, Weed, SeaArt, KhadinArt, Rain, Globe, Discuss.
// STORY STYLE (engine/story-kit.jsx). Everything is a pure function of time.
const { Sprite } = window;
const { reveal, windowOp } = window.TPMotion;
const { num, str } = window.TPStage;
const { SK, SERIF, SANS, LEFT_W, PANEL_X, PANEL_W, PAD, pop, out3, lerp, drive,
  Pic, Chip, Badge, Big, Card, SVG, Arrow, T, ChimeAt, Scene, StoryFrame, StopAt, Flip } = window.TPStory;

// ---- Timing: EVERYTHING is keyed to the narration (tools/fit_timing.py → timing.js).
const TM = window.TP_TIMING;
if (!TM) console.error("timing.js missing — run: python3 tools/fit_timing.py videos/lp23-preparing-the-field");
const LEAD = TM ? TM.lead : 1.0;
const DUR = TM ? TM.total : 220;
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
const TITLES = { 1: "LP23 – Preparing the Field", 2: "READY FOR BEEJ?", 3: "1. CLEARING", 4: "2. PLOUGHING", 5: "THINK", 6: "3. LEVELLING",
  7: "4. BUNDING", 8: "5. RAISED BEDS", 9: "WHICH STEP?", 10: "DID YOU KNOW?", 11: "READY FOR BEEJ!" };
const KICK = "Grade 6 · Agriculture · Session 23";
const panel = (n, ctx, lines, extra = {}) => ({ kicker: KICK, title: ctx.titles[n], lines, ...extra });
const L = (text, at, kind = "item", extra = {}) => ({ text, at, kind, ...extra });

// ---- Presenter stops: [beat, sentence index whose pauseAfter is the hold, hold s]
const STOPS = [["b5", 2, 5.0], ["b9", 2, 6.0]];
const stopAt = (b, i) => SE(b, i) + 0.1;

// Stop card placed beside the picture (the kit's StopCard covers the whole photo area).
function Discuss({ lt, at, hold, n, x = 40, y = 560, w = LEFT_W - 80, h = 370, head = "PAUSE AND DISCUSS", q, size = 46, children }) {
  const o = windowOp(lt, at - 0.1, at + hold + 0.4, 0.35); if (o <= 0) return null;
  const p = clamp((lt - at) / hold, 0, 1), C = 2 * Math.PI * 46;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 26, background: "rgba(5,30,22,0.92)", opacity: o, boxSizing: "border-box",
      boxShadow: "0 0 0 3px rgba(226,176,76,0.9)", padding: "32px 52px", transform: `scale(${0.96 + 0.04 * o})` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <svg width="64" height="64" viewBox="0 0 90 90"><circle cx="45" cy="45" r="43" fill={SK.gold} /><rect x="28" y="24" width="12" height="42" rx="4" fill={SK.ink} /><rect x="50" y="24" width="12" height="42" rx="4" fill={SK.ink} /></svg>
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 28, letterSpacing: "0.08em", color: SK.ink, background: SK.gold, padding: "8px 26px", borderRadius: 14, whiteSpace: "nowrap" }}>{head}</div>
      </div>
      {q && <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: size, lineHeight: 1.2, color: SK.white, marginTop: 24 }}>{q}</div>}
      {children}
      <div style={{ position: "absolute", left: 52, bottom: 24, fontFamily: SANS, fontSize: 24, color: SK.dim }}>Stop {n} of {STOPS.length}</div>
    </div>
  );
}
function Tag({ text, x, y, lt, at, out = null, size = 26 }) {
  const o = pop(lt, at) * (out != null ? 1 - reveal(lt, out, 0.4) : 1); if (o <= 0) return null;
  return <div style={{ position: "absolute", left: x, top: y, transform: `translateX(-50%) scale(${0.9 + 0.1 * o})`, transformOrigin: "center top", opacity: clamp(o, 0, 1), fontFamily: SANS, fontWeight: 700,
    fontSize: size, color: SK.white, background: "#B3261E", padding: "6px 18px", borderRadius: 999, whiteSpace: "nowrap", boxShadow: "0 2px 10px rgba(0,0,0,0.25)" }}>{text}</div>;
}

// ---- Colours of the drawn models ---------------------------------------------------
const C = { sky: "#BFE0EC", soil: "#7A5A42", soilHard: "#6A4C37", gap: "#3A281C", soilWet: "#4E3A30", water: "#4C9FD8", waterD: "#2F78B3", leaf: "#5FAE5C", leafD: "#3E8A45",
  seed: "#C9924A", seedD: "#7A4E22", stone: "#9A9A92", root: "#F3E6C4", cloth: "#7C93A8", clothD: "#54697B", bund: "#8A6547", wood: "#B98A4E", red: "#D9483B", pink: "#6B3FA0" };

// ---- BEEJ: the seed with a face. Local origin = centre of the seed; s=1 is about 80 × 90 px. --------
function Beej({ x, y, s = 1, lt = 0, mood = "happy", leaf = 0, rot = 0 }) {
  if (s <= 0) return null;
  const blink = (lt * 0.37) % 1 < 0.035;
  const worried = mood === "worried", wow = mood === "wow";
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      {leaf > 0 && <g transform={`scale(${leaf})`}>
        <path d="M0 -44 C-2 -60 -2 -70 0 -82" stroke={C.leafD} strokeWidth="7" strokeLinecap="round" fill="none" />
        <path d="M0 -80 C-14 -106 -50 -106 -62 -92 C-52 -70 -18 -66 0 -80 Z" fill={C.leaf} stroke={C.leafD} strokeWidth="3" />
        <path d="M0 -80 C14 -106 50 -106 62 -92 C52 -70 18 -66 0 -80 Z" fill={C.leaf} stroke={C.leafD} strokeWidth="3" />
      </g>}
      <path d="M0 -46 C30 -42 42 -6 36 18 C30 42 -30 42 -36 18 C-42 -6 -30 -42 0 -46 Z" fill={C.seed} stroke={C.seedD} strokeWidth="4" />
      <path d="M-20 -24 C-14 -32 -6 -36 2 -36" stroke="rgba(255,255,255,0.45)" strokeWidth="5" strokeLinecap="round" fill="none" />
      {blink
        ? <g stroke="#2A1A0E" strokeWidth="3.5" strokeLinecap="round"><line x1="-20" y1="-4" x2="-8" y2="-4" /><line x1="8" y1="-4" x2="20" y2="-4" /></g>
        : <g><circle cx="-14" cy="-4" r="10" fill="#fff" /><circle cx="14" cy="-4" r="10" fill="#fff" />
            <circle cx={-13 + (worried ? 2 : 0)} cy={worried ? -2 : -3} r="5" fill="#2A1A0E" /><circle cx={15 + (worried ? 2 : 0)} cy={worried ? -2 : -3} r="5" fill="#2A1A0E" /></g>}
      {worried && <g stroke="#2A1A0E" strokeWidth="3.5" strokeLinecap="round"><line x1="-24" y1="-20" x2="-8" y2="-25" /><line x1="24" y1="-20" x2="8" y2="-25" /></g>}
      {worried ? <path d="M-11 22 Q0 10 11 22" stroke="#2A1A0E" strokeWidth="4" strokeLinecap="round" fill="none" />
        : wow ? <ellipse cx="0" cy="18" rx="7" ry="9" fill="#2A1A0E" />
        : <path d="M-14 12 Q0 30 14 12 Z" fill="#7A2E20" stroke="#2A1A0E" strokeWidth="3" strokeLinejoin="round" />}
      {worried && <path d={`M34 ${-26 + ((lt * 0.8) % 1) * 18} q7 12 0 16 q-7 -4 0 -16 Z`} fill={C.water} />}
    </g>
  );
}
// Beej in the farmer's shirt pocket. sink 0 = held above the pocket, 1 = peeking over the edge.
function Pocket({ x, y, s = 1, sink = 1, lt = 0, mood = "happy", hop = 0, empty = false }) {
  const by = lerp(-96, -30, sink) - 26 * hop;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-92" y="-96" width="184" height="192" rx="18" fill={C.cloth} stroke="#fff" strokeWidth="3" />
      {!empty && <Beej x={0} y={by} s={0.72} lt={lt} mood={mood} />}
      <path d="M-62 -14 L62 -14 L62 62 L0 80 L-62 62 Z" fill="#6C8499" stroke={C.clothD} strokeWidth="4" strokeLinejoin="round" />
      <path d="M-62 -2 L62 -2" stroke={C.clothD} strokeWidth="2" strokeDasharray="7 6" />
    </g>
  );
}
// The corner pocket that rides along through the steps. tick = when this step's box ticks: Beej hops.
function Rider({ lt, tick, mood = "happy", x = 118, y = 846 }) {
  const hop = tick != null ? Math.sin(Math.PI * clamp((lt - tick) / 0.6, 0, 1)) : 0;
  return <SVG op={out3(lt, 0.2, 0.5)}><Pocket x={x} y={y} s={0.82} lt={lt} mood={mood} hop={hop} /></SVG>;
}

// ---- The checklist ------------------------------------------------------------------------
const STEPS = ["Clearing", "Ploughing", "Levelling", "Bunding", "Raised beds"];
// done[i]: beat-local tick time; -1 = already ticked; null = empty. now = step to highlight.
function Check({ lt, y, rowH = 39, size = 25, head = "READY FOR BEEJ?", done = [], now = -1, op = 1, slide = 0 }) {
  if (op <= 0) return null;
  const box = Math.round(size * 1.08);
  return (
    <div style={{ position: "absolute", left: PANEL_X + PAD, top: y, width: PANEL_W - PAD * 2, opacity: op, transform: `translateX(${slide * 460}px)` }}>
      {head && <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 24, letterSpacing: "0.05em", color: SK.goldDeep, borderTop: `2px solid ${SK.gold}`, paddingTop: 8, marginBottom: 6 }}>{head}</div>}
      {STEPS.map((st, i) => {
        const d = done[i], p = d == null ? 0 : d < 0 ? 1 : pop(lt, d, 0.45), on = now === i;
        return (
          <div key={i} style={{ height: rowH, display: "flex", alignItems: "center", gap: 14, padding: "0 8px", margin: "0 -8px", borderRadius: 10, background: on ? "rgba(226,176,76,0.32)" : "transparent" }}>
            <svg width={box} height={box} viewBox="0 0 30 30" style={{ flex: "none", overflow: "visible" }}>
              <rect x="2" y="2" width="26" height="26" rx="5" fill="#fff" stroke={SK.ink} strokeWidth="3" />
              {p > 0 && <path d="M7 15 L13 22 L25 6" stroke="#2E8B57" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" fill="none" transform={`translate(15 15) scale(${p}) translate(-15 -15)`} />}
            </svg>
            <span style={{ fontFamily: SANS, fontWeight: on || p > 0.5 ? 700 : 400, fontSize: size, color: SK.ink }}>{st}</span>
          </div>
        );
      })}
    </div>
  );
}
const COMPACT_Y = 690;
const compact = (lt, n, at) => <Check lt={lt} y={COMPACT_Y} done={STEPS.map((_, i) => (i < n - 1 ? -1 : i === n - 1 ? at : null))} now={n - 1} />;

// ---- Rain falling inside a box (SVG group, local px). -------------------------------------------
function Rain({ x, y, w, h, lt, n = 46, op = 1 }) {
  if (op <= 0) return null;
  return (
    <g opacity={op}>
      {Array.from({ length: n }, (_, i) => {
        const sp = 0.9 + (i % 5) * 0.12, ph = (i * 0.618) % 1, p = (lt * sp + ph) % 1;
        const px = x + ((i * 137.5) % w) - p * 30, py = y + p * h;
        return <line key={i} x1={px} y1={py} x2={px - 7} y2={py + 26} stroke="#2F78B3" strokeOpacity="0.75" strokeWidth={3} strokeLinecap="round" />;
      })}
    </g>
  );
}
const Pipe = ({ x, y, on }) => (
  <g>
    <path d={`M${x - 150} ${y} H${x} V${y + 26}`} stroke="#8D989E" strokeWidth="26" fill="none" strokeLinejoin="round" />
    {on > 0 && <rect x={x - 7} y={y + 34} width={14} height={1} fill={C.water} />}
  </g>
);

// ---- Cut-away of the soil. loose 0 = hard and packed, 1 = crumbly with air spaces. root 0..1 grows. ----
function SoilCut({ id, x, y, w, h, sky = 66, loose = 0, root = 0, kind = "deep", plant = 1 }) {
  const sp = 34, cols = Math.ceil(w / sp), rows = Math.ceil((h - sky) / sp), top = y + sky, mx = x + w / 2;
  const crumbs = [];
  for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) {
    const k = c * 41 + r * 7, u = c / cols, l = clamp(loose * 1.4 - u * 0.4, 0, 1);
    crumbs.push(<circle key={k} cx={x + (c + 0.5) * sp + (rnd(k) - 0.5) * 12 * l} cy={top + (r + 0.5) * sp + (rnd(k + 1) - 0.5) * 12 * l} r={lerp(26, 11 + 5 * rnd(k + 2), l)} fill={l > 0.5 ? (rnd(k + 3) > 0.5 ? C.soil : "#8A6547") : C.soilHard} />);
  }
  const deep = `M${mx} ${top} C${mx - 6} ${top + 90} ${mx + 30} ${top + 170} ${mx + 8} ${top + (h - sky) * 0.92}`;
  const b1 = `M${mx + 5} ${top + 90} C${mx - 50} ${top + 130} ${mx - 90} ${top + 170} ${mx - 120} ${top + (h - sky) * 0.72}`;
  const b2 = `M${mx + 12} ${top + 150} C${mx + 70} ${top + 180} ${mx + 110} ${top + 210} ${mx + 140} ${top + (h - sky) * 0.8}`;
  const stuck = `M${mx} ${top} C${mx - 2} ${top + 30} ${mx + 26} ${top + 46} ${mx + 40} ${top + 34}`;
  const dash = (g) => ({ pathLength: 1, strokeDasharray: `${clamp(g, 0, 1)} 1`, stroke: C.root, strokeLinecap: "round", fill: "none" });
  const pl = plant * 74;
  return (
    <g>
      <defs><clipPath id={id}><rect x={x} y={y} width={w} height={h} rx={18} /></clipPath></defs>
      <g clipPath={`url(#${id})`}>
        <rect x={x} y={y} width={w} height={h} fill={C.sky} />
        <rect x={x} y={top} width={w} height={h - sky} fill={C.gap} />
        <rect x={x} y={top - 2} width={w} height={h - sky + 2} fill={C.gap} />
        {crumbs}
        {kind === "deep"
          ? <g><path d={deep} strokeWidth="9" {...dash(root * 1.1)} /><path d={b1} strokeWidth="6" {...dash((root - 0.4) * 1.8)} /><path d={b2} strokeWidth="6" {...dash((root - 0.5) * 2)} /></g>
          : <path d={stuck} strokeWidth="9" {...dash(root)} />}
        {pl > 0 && <g><line x1={mx} y1={top} x2={mx} y2={top - pl * 0.74} stroke={C.leafD} strokeWidth="6" strokeLinecap="round" />
          <ellipse cx={mx - 16} cy={top - pl * 0.56} rx="20" ry="8" fill={C.leaf} transform={`rotate(-28 ${mx - 16} ${top - pl * 0.56})`} />
          <ellipse cx={mx + 16} cy={top - pl * 0.68} rx="20" ry="8" fill={C.leaf} transform={`rotate(28 ${mx + 16} ${top - pl * 0.68})`} /></g>}
      </g>
      <rect x={x} y={y} width={w} height={h} rx={18} stroke="rgba(255,255,255,0.6)" strokeWidth="3" fill="none" />
    </g>
  );
}
// Arrow that grows from a→b as p goes 0→1.
const Grow = ({ x1, y1, x2, y2, p, color, sw = 8, head = 24 }) => (p <= 0 ? null : <Arrow x1={x1} y1={y1} x2={lerp(x1, x2, p)} y2={lerp(y1, y2, p)} color={color} sw={sw} head={head} />);

// ---- A weed (b3): spiky, thirsty, deep-rooted. ----------------------------------------------------
function Weed({ x, y, g }) {
  if (g <= 0) return null;
  const leaves = [-62, -40, -18, 6, 28, 52];
  return (
    <g transform={`translate(${x} ${y}) scale(${g})`}>
      {leaves.map((a, i) => <path key={i} transform={`rotate(${a})`} d={`M0 0 C-22 ${-100 - i * 8} -14 ${-190 - i * 6} 0 ${-250 + Math.abs(a)} C14 ${-190 - i * 6} 22 ${-100 - i * 8} 0 0 Z`} fill={i % 2 ? "#3E7A3A" : "#2F6530"} stroke="#214D24" strokeWidth="3" />)}
      <path d="M0 0 C-10 60 20 110 -6 180 M0 30 C-40 60 -70 90 -86 150 M4 40 C50 60 74 96 84 140" stroke={C.root} strokeWidth="7" strokeLinecap="round" fill="none" />
    </g>
  );
}

// ---- The bumpy → flat field in side view (b6). Height falls from a high left to a low right corner. ---
const hRaw = (u) => (0.5 - u) * 1.15 + 0.24 * Math.sin(u * 10);
function Ground({ lt, sweep, pour, puddle, even, fair, plankOp }) {
  const X0 = 40, W_ = 1360, base = 640, A = 190, N = 140;
  const fl = (u) => clamp((sweep - u) / 0.06, 0, 1);
  const gy = (u) => base - A * hRaw(u) * (1 - fl(u));
  let maxY = 0; for (let i = 0; i <= N; i++) maxY = Math.max(maxY, base - A * hRaw(i / N));
  const pts = []; for (let i = 0; i <= N; i++) pts.push(`${X0 + i / N * W_} ${gy(i / N).toFixed(1)}`);
  const yL = maxY - puddle * 150;
  const cols = [];
  for (let i = 0; i < N; i++) {
    const u = (i + 0.5) / N, g = gy(u), cw = W_ / N + 1, cx = X0 + i / N * W_;
    if (puddle > 0.01 && g > yL) cols.push(<rect key={i} x={cx} y={yL} width={cw} height={g - yL} fill={C.water} />);
    if (even > 0 && u < even * 1.15) cols.push(<rect key={"e" + i} x={cx} y={g - 16} width={cw} height={16} fill={C.water} />);
  }
  const trickle = [];
  for (let i = 8; i <= 110; i++) trickle.push(`${X0 + i / N * W_} ${(gy(i / N) - 4).toFixed(1)}`);
  const seeds = [0.08, 0.2, 0.32, 0.44, 0.56, 0.68, 0.8, 0.92];
  const plankX = X0 + clamp(sweep, 0, 1) * W_;
  return (
    <g>
      <defs><clipPath id="groundClip"><rect x={X0} y={50} width={W_} height={880} rx={18} /></clipPath></defs>
      <g clipPath="url(#groundClip)">
        <rect x={X0} y={50} width={W_} height={880} fill={C.sky} />
        {cols}
        <polygon points={`${X0} 930 ${pts.join(" ")} ${X0 + W_} 930`} fill={C.soil} stroke={C.soilHard} strokeWidth="5" />
        {/* cracks on the high, dry ground */}
        {[0.05, 0.12, 0.19, 0.26].map((u, i) => { const x = X0 + u * W_, y = gy(u), o = 1 - fl(u);
          return <path key={i} opacity={o} d={`M${x} ${y} l-8 18 l12 14 l-9 20`} stroke={C.gap} strokeWidth="4" fill="none" strokeLinejoin="round" />; })}
        {seeds.map((u, i) => { const x = X0 + u * W_, y = gy(u) + 30, f = pop(lt, fair + i * 0.09, 0.4);
          return <g key={i}><ellipse cx={x} cy={y} rx="11" ry="14" fill={C.seed} stroke={C.seedD} strokeWidth="3" />
            {f > 0 && <path transform={`translate(${x} ${y - 30}) scale(${f})`} d="M0 -16 C8 -4 11 2 11 7 A11 11 0 0 1 -11 7 C-11 2 -8 -4 0 -16 Z" fill={C.water} stroke="#fff" strokeWidth="2" />}</g>; })}
        {pour > 0 && <g opacity={pour}>
          <rect x={X0 + 0.113 * W_ - 8} y={150} width={16} height={gy(0.12) - 150} fill={C.water} />
          {even <= 0 && <polyline points={trickle.join(" ")} stroke={C.water} strokeWidth="9" fill="none" strokeDasharray="26 12" strokeDashoffset={-lt * 70} />}
        </g>}
        <Pipe x={X0 + 0.113 * W_} y={110} on={pour} />
        {plankOp > 0 && <g opacity={plankOp} transform={`translate(${plankX} ${base})`}>
          <line x1="16" y1="-16" x2="150" y2="-40" stroke={C.gap} strokeWidth="5" />
          <rect x="-16" y="-36" width="34" height="38" rx="4" fill={C.wood} stroke={C.seedD} strokeWidth="4" />
        </g>}
      </g>
    </g>
  );
}

// ---- Bunds (b7, and small in b10). Local box 1360 × 880, drawn at the origin of its <g>. -----------
function BundArt({ id, lt, bund = 1, rain = 0, hold = 0, wet = 0, nogo = 0 }) {
  const gy = 620, H = 130 * bund;
  const wall = (a, b) => `M${a - 96} ${gy} L${a - 30} ${gy - H} L${b + 30} ${gy - H} L${b + 96} ${gy} Z`;
  const wy = gy - 92 * hold * (1 - 0.45 * wet);
  return (
    <g>
      <defs><clipPath id={id}><rect x={0} y={0} width={1360} height={880} rx={18} /></clipPath></defs>
      <g clipPath={`url(#${id})`}>
        <rect width={1360} height={880} fill={C.sky} />
        <rect y={gy} width={1360} height={260} fill={C.soil} />
        {wet > 0 && <rect x={200} y={gy} width={960} height={190 * wet} fill={C.soilWet} />}
        {hold > 0 && <rect x={190} y={wy} width={980} height={gy - wy} fill={C.water} />}
        <path d={wall(130, 170)} fill={C.bund} stroke={C.soilHard} strokeWidth="5" strokeLinejoin="round" />
        <path d={wall(1190, 1230)} fill={C.bund} stroke={C.soilHard} strokeWidth="5" strokeLinejoin="round" />
        {[360, 520, 680, 840, 1000].map((x, i) => <g key={i}><line x1={x} y1={gy} x2={x} y2={gy - 130} stroke={C.leafD} strokeWidth="6" />
          <ellipse cx={x - 14} cy={gy - 100} rx="19" ry="8" fill={C.leaf} transform={`rotate(-30 ${x - 14} ${gy - 100})`} /><ellipse cx={x + 14} cy={gy - 124} rx="19" ry="8" fill={C.leaf} transform={`rotate(30 ${x + 14} ${gy - 124})`} /></g>)}
        <Rain x={0} y={-30} w={1360} h={gy} lt={lt} n={60} op={rain} />
        {wet > 0.1 && [300, 480, 660, 840, 1020].map((x, i) => <Arrow key={i} x1={x} y1={gy + 22} x2={x} y2={gy + 40 + 110 * wet} color="#9CCBEB" sw={7} head={20} op={wet} />)}
        {nogo > 0 && <g opacity={nogo}>
          <path d={`M1120 ${gy - 110} q90 -70 180 40`} stroke="#7A5A42" strokeWidth="11" fill="none" strokeDasharray="18 12" />
          <g transform={`translate(1212 ${gy - 150})`} stroke={C.red} strokeWidth="13" strokeLinecap="round"><line x1="-26" y1="-26" x2="26" y2="26" /><line x1="26" y1="-26" x2="-26" y2="26" /></g>
        </g>}
      </g>
      <rect width={1360} height={880} rx={18} stroke="rgba(255,255,255,0.6)" strokeWidth="3" fill="none" />
    </g>
  );
}

// ---- Raised beds (b8), side view. --------------------------------------------------------------
function Beds({ lt, rise, rain, drain, plants }) {
  const X0 = 40, gy = 760, H = 150 * rise, CX = [210, 550, 890, 1230];
  const veg = (x, y, i) => {
    const kind = i % 3, g = plants;
    if (g <= 0) return null;
    return (
      <g key={x} transform={`translate(${x} ${y}) scale(${g})`}>
        <path d="M0 0 C-6 16 6 26 0 44 M0 4 C-10 14 -16 22 -18 34 M0 4 C10 14 16 22 18 34" stroke={C.root} strokeWidth="4" strokeLinecap="round" fill="none" />
        <line x1="0" y1="0" x2="0" y2="-70" stroke={C.leafD} strokeWidth="6" strokeLinecap="round" />
        <ellipse cx="-18" cy="-44" rx="22" ry="10" fill={C.leaf} transform="rotate(-25 -18 -44)" /><ellipse cx="18" cy="-58" rx="22" ry="10" fill={C.leaf} transform="rotate(25 18 -58)" />
        {kind === 0 && <g fill={C.red}><circle cx="-13" cy="-22" r="10" /><circle cx="14" cy="-32" r="10" /><circle cx="-4" cy="-72" r="9" /></g>}
        {kind === 1 && <g fill={C.pink}><ellipse cx="14" cy="-26" rx="10" ry="17" /><ellipse cx="-13" cy="-22" rx="9" ry="15" /></g>}
        {kind === 2 && <g fill={C.leafD}><ellipse cx="-14" cy="-22" rx="18" ry="12" /><ellipse cx="14" cy="-26" rx="18" ry="12" /><ellipse cx="0" cy="-78" rx="15" ry="12" /></g>}
      </g>
    );
  };
  const wy = gy - 62 * drain;
  return (
    <g>
      <defs><clipPath id="bedsClip"><rect x={X0} y={50} width={1360} height={880} rx={18} /></clipPath></defs>
      <g clipPath="url(#bedsClip)">
        <rect x={X0} y={50} width={1360} height={880} fill={C.sky} />
        <rect x={X0} y={gy} width={1360} height={180} fill={C.soilHard} />
        {drain > 0 && <rect x={X0} y={wy} width={1360} height={gy - wy} fill={C.water} />}
        {CX.map((c, i) => <path key={i} d={`M${c - 156} ${gy} L${c - 118} ${gy - H} L${c + 118} ${gy - H} L${c + 156} ${gy} Z`} fill={C.soil} stroke={C.soilHard} strokeWidth="5" strokeLinejoin="round" />)}
        {CX.map((c, i) => [-70, 70].map((d, j) => veg(c + d, gy - H, i * 2 + j)))}
        <Rain x={X0} y={20} w={1360} h={gy - 180} lt={lt} n={64} op={rain} />
        {drain > 0 && [380, 720, 1060].map((x, i) => <g key={i} opacity={clamp(drain * 2, 0, 1)}>
          <Arrow x1={x - 92} y1={gy - 158} x2={x - 22} y2={gy - 58} color={C.waterD} sw={8} head={22} /><Arrow x1={x + 92} y1={gy - 158} x2={x + 22} y2={gy - 58} color={C.waterD} sw={8} head={22} /></g>)}
      </g>
    </g>
  );
}

// ---- Did-you-know models (local box 450 × 590 at the origin). ----------------------------------
function Globe({ cx, cy, r, lt }) {
  const ph = lt * 0.9;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#2D7FB8" stroke={SK.cream} strokeWidth={4} />
      {[0, 1, 2].map((i) => { const rx = Math.abs(Math.cos(ph + i * Math.PI / 3)) * r; return <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={r} fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth={2} />; })}
      <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke="rgba(255,255,255,0.55)" strokeWidth={2} />
      <path d={`M${cx - r * 0.5 + r * 0.3 * Math.sin(ph)} ${cy - r * 0.3} q${r * 0.3} ${-r * 0.3} ${r * 0.6} 0 q${r * 0.15} ${r * 0.3} ${-r * 0.15} ${r * 0.48} q${-r * 0.4} ${r * 0.1} ${-r * 0.45} ${-r * 0.48} Z`} fill="#6FBF6E" />
    </g>
  );
}
function SeaArt({ lt, dike, drain }) {
  const land = 330, sea = 210;
  return (
    <g>
      <defs><clipPath id="seaClip"><rect width={450} height={400} rx={16} /></clipPath></defs>
      <g clipPath="url(#seaClip)">
        <rect width={450} height={400} fill={C.sky} />
        <rect y={sea} width={150} height={190} fill={C.waterD} />
        <path d={`M100 400 L150 ${sea - 40} L196 ${sea - 40} L262 ${land} L450 ${land} L450 400 Z`} fill={C.leaf} stroke={C.leafD} strokeWidth="4" />
        <path d={`M300 ${land} l16 0 l6 20 l14 0 l6 -20 l16 0`} stroke={C.leafD} strokeWidth="4" fill={C.water} opacity={drain} />
        <line x1="0" y1={sea} x2="450" y2={sea} stroke="#fff" strokeWidth="4" strokeDasharray="14 10" />
        {[0, 1, 2, 3].map((i) => <path key={i} d={`M${6 + i * 36 + 8 * Math.sin(lt + i)} ${sea + 22} q14 -10 28 0`} stroke="#fff" strokeOpacity="0.6" strokeWidth="3" fill="none" />)}
      </g>
      <text x={442} y={sea - 12} textAnchor="end" fontFamily={SANS} fontWeight="700" fontSize="26" fill={SK.ink}>sea level</text>
      <text x={173} y={sea - 54} textAnchor="middle" fontFamily={SANS} fontWeight="700" fontSize="26" fill={SK.ink} opacity={dike}>dike</text>
      <text x={355} y={385} textAnchor="middle" fontFamily={SANS} fontWeight="700" fontSize="26" fill={SK.white}>farmland</text>
      <Arrow x1={395} y1={sea + 8} x2={395} y2={land - 6} color={C.red} sw={6} head={18} op={dike} />
    </g>
  );
}
function KhadinArt({ lt, water, moist, grow, rain }) {
  const slope = "M0 150 L450 290 L450 400 L0 400 Z";
  const wallX = 330;
  const wy = 258 - 66 * water, wx = (wy - 150) / 103 * wallX;
  return (
    <g>
      <defs><clipPath id="khClip"><rect width={450} height={400} rx={16} /></clipPath></defs>
      <g clipPath="url(#khClip)">
        <rect width={450} height={400} fill="#EBD9B0" />
        <circle cx="70" cy="66" r="36" fill={SK.gold} />
        <path d={`M0 150 L${wallX} 253 L${wallX} 400 L0 400 Z`} fill={moist > 0.5 ? "#8E6C4C" : "#C9A66B"} />
        <path d={`M${wallX} 253 L450 290 L450 400 L${wallX} 400 Z`} fill="#C9A66B" />
        {water > 0 && <path d={`M${wx} ${wy} L${wallX} ${wy} L${wallX} 255 Z`} fill={C.water} />}
        <path d={`M${wallX - 34} 262 L${wallX - 8} 196 L${wallX + 16} 196 L${wallX + 44} 268 Z`} fill={C.bund} stroke={C.soilHard} strokeWidth="4" strokeLinejoin="round" />
        {grow > 0 && [120, 170, 220, 262].map((x, i) => { const y = 150 + (x / wallX) * 103; return <g key={i} transform={`translate(${x} ${y}) scale(${grow})`}>
          <line x1="0" y1="0" x2="0" y2="-82" stroke={C.leafD} strokeWidth="5" /><path d="M0 -12 q-22 -18 -30 -8 M0 -26 q22 -18 30 -8" stroke={C.leaf} strokeWidth="5" fill="none" />
          <ellipse cx="0" cy="-94" rx="8" ry="20" fill="#A98C46" /></g>; })}
        <Rain x={0} y={-30} w={450} h={230} lt={lt} n={22} op={rain} />
        {rain > 0.3 && <Arrow x1={40} y1={134} x2={170} y2={172} color={C.waterD} sw={7} head={20} op={rain} />}
      </g>
    </g>
  );
}

// ============================================================================================
// b1 — Meet Beej
function B1(ctx) {
  return ({ localTime: lt, duration }) => {
    const cBeej = W("b1", "meet"), cThis = S("b1", 1), cSt = W("b1", "stones"), cWe = W("b1", "weeds"), cTh = W("b1", "thorns"), cQ = S("b1", 2);
    const palmOut = 1 - reveal(lt, cThis, 0.5);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[1]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(1, ctx, [L("Giving Every Seed a Perfect Start!", 0.6, "big"), L("Big question: what must a farmer do BEFORE the first seed goes in?", cQ, "think")])}>
        <Pic slot="palm_empty" label="A farmer's open, empty palm" x={40} y={50} w={1360} h={880} lt={lt} at={0.1} out={cThis} fx="zoom" />
        <SVG op={palmOut}><Beej x={720} y={470} s={3.6 * pop(lt, cBeej + 0.1, 0.6)} lt={lt} rot={Math.sin(lt * 1.6) * 3} /></SVG>
        <Chip text="BEEJ: a tiny seed with a BIG future" x={720} y={130} lt={lt} at={cBeej + 0.5} out={cThis} tone="gold" size={38} />
        <Pic slot="rough_field" label="A rough, untouched field: stones, weeds, thorny bushes" x={40} y={50} w={1360} h={880} lt={lt} at={cThis} fx="pan" />
        <Chip text="stones" x={380} y={560} lt={lt} at={cSt} size={36} out={cQ} />
        <Chip text="weeds" x={760} y={470} lt={lt} at={cWe} size={36} out={cQ} />
        <Chip text="thorns" x={1140} y={560} lt={lt} at={cTh} size={36} out={cQ} />
        <SVG op={out3(lt, cThis + 0.4, 0.5)}><g><circle cx={170} cy={800} r={92} fill="rgba(5,30,22,0.6)" /><Beej x={170} y={800} s={1.5} lt={lt} mood="worried" /></g></SVG>
        <Card x={210} y={100} w={1020} h={230} lt={lt} at={cQ} pad={30}>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 26, letterSpacing: "0.1em", color: SK.gold }}>THE BIG QUESTION</div>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 52, lineHeight: 1.18, color: SK.white, marginTop: 10 }}>What must a farmer do <span style={{ color: SK.gold }}>BEFORE</span> the first seed goes in?</div>
        </Card>
      </Scene>
    );
  };
}
// b2 — Beej goes in the pocket, the checklist slides on
function B2(ctx) {
  return ({ localTime: lt, duration }) => {
    const cWork = S("b2", 1), cFive = S("b2", 2), cTick = S("b2", 3);
    const slide = 1 - out3(lt, cWork + 0.6, 0.8), sink = drive(lt, cWork, cWork + 1.6);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[2]} showCaps={ctx.caps} capSize={ctx.capSize} panel={panel(2, ctx, [])}>
        <Pic slot="farmer_sleeves" label="The farmer rolls up his sleeves at the edge of the field" x={40} y={50} w={1360} h={880} lt={lt} at={0.1} fx="zoom" />
        <Card x={460} y={720} w={900} h={170} lt={lt} at={0.3} out={cFive} pad={24}>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 48, lineHeight: 1.25, textAlign: "center", color: SK.white }}>A healthy crop begins with a <span style={{ color: SK.gold, whiteSpace: "nowrap" }}>WELL-PREPARED</span> field</div>
        </Card>
        <SVG op={out3(lt, 0.3, 0.5)}><Pocket x={220} y={700} s={1.7} sink={sink} lt={lt} mood={lt > cFive ? "happy" : "wow"} hop={lt > cTick ? Math.sin(Math.PI * clamp((lt - cTick) / 0.6, 0, 1)) : 0} /></SVG>
        <Badge text="FIVE JOBS" x={540} y={770} lt={lt} at={cFive} size={52} />
        <Chip text="between Beej and the perfect start" x={1135} y={790} lt={lt} at={cFive + 0.4} size={32} />
        <Check lt={lt} y={190} rowH={84} size={36} head={null} done={[null, null, null, null, null]} slide={slide} op={1 - slide * 0.5} />
      </Scene>
    );
  };
}
// b3 — Clearing
function B3(ctx) {
  return ({ localTime: lt, duration }) => {
    const cStep = W("b3", "clearing"), cSt = W("b3", "stones"), cWe = W("b3", "weeds"), cBu = W("b3", "bushes"), cWhy = W("b3", "why"),
      cWater = W("b3", "water"), cSun = W("b3", "sunlight"), cFood = W("b3", "food"), cBlock = W("b3", "stones", 1);
    const wipe = drive(lt, cSt, S("b3", 2) - 0.2), a = 1 - reveal(lt, cWhy, 0.5), b = reveal(lt, cWhy, 0.5);
    const mx = 800, soil = 560;
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[3]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(3, ctx, [L("Remove:", cSt - 0.2, "head"), L("stones", cSt), L("weeds", cWe), L("bushes and unwanted plants", cBu), L("Weeds steal water, sunlight and food", cWater, "think")])}>
        <div style={{ position: "absolute", inset: 0, opacity: a }}>
          <Pic slot="rough_field" label="The rough field" x={40} y={50} w={900} h={705} lt={lt} at={0.1} fx="none" />
          <Pic slot="clear_field" label="The same field, now clear" x={40} y={50} w={900} h={705} lt={lt} at={cSt} dur={0.2} fx="none" style={{ clipPath: `inset(0 ${(1 - wipe) * 100}% 0 0)` }} />
          <Pic slot="clear_stones" label="Picking up stones, piling them at the edge" x={960} y={50} w={440} h={225} lt={lt} at={cSt} fx="pop" />
          <Pic slot="clear_weeds" label="Pulling out weeds" x={960} y={290} w={440} h={225} lt={lt} at={cWe} fx="pop" />
          <Pic slot="clear_bushes" label="Cutting away bushes" x={960} y={530} w={440} h={225} lt={lt} at={cBu} fx="pop" />
          <Chip text="OUT: stones" x={1180} y={225} lt={lt} at={cSt + 0.2} tone="gold" size={26} />
          <Chip text="OUT: weeds" x={1180} y={465} lt={lt} at={cWe + 0.2} tone="gold" size={26} />
          <Chip text="OUT: bushes" x={1180} y={705} lt={lt} at={cBu + 0.2} tone="gold" size={26} />
          <Badge text="STEP 1: CLEARING" x={250} y={800} lt={lt} at={cStep} size={48} />
        </div>
        <SVG op={b}>
          <defs><clipPath id="stealClip"><rect x={40} y={50} width={1360} height={880} rx={18} /></clipPath></defs>
          <g clipPath="url(#stealClip)">
            <rect x={40} y={50} width={1360} height={880} fill={C.sky} />
            <rect x={40} y={soil} width={1360} height={380} fill={C.soil} />
            <circle cx={1230} cy={170} r={74} fill={SK.gold} />
            <Weed x={360} y={soil} g={out3(lt, cWhy, 0.7)} />
            <path d={`M${mx} ${soil + 36} C${mx} ${soil + 80} ${mx + 18} ${soil + 110} ${mx + 18} ${soil + 150}`} stroke={C.root} strokeWidth="9" strokeLinecap="round" fill="none" />
            <Beej x={mx} y={soil - 8} s={1.25} lt={lt} mood={lt > cWater ? "worried" : "wow"} leaf={1} />
            <g opacity={pop(lt, cBlock, 0.5)}><path d={`M${mx - 90} ${soil + 200} q10 -56 92 -58 q100 -2 110 54 q-4 52 -104 54 q-96 2 -98 -50 Z`} fill={C.stone} stroke="#66665F" strokeWidth="5" /></g>
            <Grow x1={1120} y1={210} x2={500} y2={300} p={reveal(lt, cSun, 0.8)} color="#B8861B" />
            <Grow x1={mx - 40} y1={soil + 50} x2={460} y2={soil + 50} p={reveal(lt, cWater, 0.8)} color={C.waterD} />
            <Grow x1={mx - 40} y1={soil + 130} x2={470} y2={soil + 130} p={reveal(lt, cFood, 0.8)} color="#E2C68A" />
          </g>
        </SVG>
        <div style={{ position: "absolute", inset: 0, opacity: b }}>
          <Chip text="sunlight" x={800} y={200} lt={lt} at={cSun} tone="gold" size={32} />
          <Chip text="water" x={640} y={590} lt={lt} at={cWater} size={32} />
          <Chip text="food" x={640} y={670} lt={lt} at={cFood} size={32} />
          <Chip text="WEED" x={360} y={80} lt={lt} at={cWhy + 0.3} tone="green" size={32} />
          <Tag text="stones block roots" x={1120} y={700} lt={lt} at={cBlock} size={32} />
        </div>
        <Rider lt={lt} tick={cStep} mood={lt > cWater ? "worried" : "happy"} />
        {compact(lt, 1, cStep)}
      </Scene>
    );
  };
}
// b4 — Ploughing
function B4(ctx) {
  return ({ localTime: lt, duration }) => {
    const cStep = W("b4", "ploughing"), cLoose = W("b4", "loosens"), cTurn = W("b4", "turns"), cSpace = W("b4", "tiny"), cAir = W("b4", "air"), cWat = W("b4", "water"),
      cRoot = W("b4", "roots"), cDeep = W("b4", "deep");
    const loose = drive(lt, cLoose, cSpace), root = drive(lt, cRoot, SE("b4", 3) + 0.4);
    const arrows = [[230, "#fff", cAir], [430, C.water, cWat], [1010, "#fff", cAir + 0.2], [1210, C.water, cWat + 0.2]];
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[4]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(4, ctx, [L("Loosens and turns the soil", cLoose), L("Air and water get IN", cAir), L("Roots grow DEEPER", cDeep)])}>
        <Pic slot="hero_plough" label="A pair of bullocks pull a plough" x={40} y={50} w={670} h={330} lt={lt} at={0.1} fx="pan" />
        <Pic slot="tractor_plough" label="A tractor pulls a plough through the soil" x={730} y={50} w={670} h={330} lt={lt} at={cLoose} fx="pan" />
        <Chip text="bullock-drawn plough" x={375} y={330} lt={lt} at={0.5} size={26} />
        <Chip text="tractor plough" x={1065} y={330} lt={lt} at={cLoose + 0.3} size={26} />
        <Badge text="STEP 2: PLOUGHING" x={70} y={70} lt={lt} at={cStep} size={36} />
        <SVG>
          <SoilCut id="cut4" x={40} y={400} w={1360} h={530} loose={loose} root={root} />
          {arrows.map(([x, col, at], i) => <Grow key={i} x1={x} y1={420} x2={x} y2={lerp(600, 690, i % 2)} p={reveal(lt, at, 0.8)} color={col} sw={10} head={30} />)}
        </SVG>
        <Tag text="hard, packed" x={1160} y={500} lt={lt} at={0.5} out={cLoose + 0.6} size={30} />
        <Chip text="loose, crumbly" x={1060} y={415} lt={lt} at={cTurn + 0.5} tone="gold" size={30} />
        <Chip text="AIR" x={230} y={410} lt={lt} at={cAir} size={28} />
        <Chip text="WATER" x={430} y={410} lt={lt} at={cWat} size={28} />
        <Chip text="roots go DEEP" x={880} y={760} lt={lt} at={cDeep} tone="gold" size={30} />
        <Rider lt={lt} tick={cStep} />
        {compact(lt, 2, cStep)}
      </Scene>
    );
  };
}
// b5 — Think: why would roots struggle?
function B5(ctx) {
  return ({ localTime: lt, duration }) => {
    const cQ = S("b5", 1), st = stopAt("b5", 2), g = drive(lt, 0.3, cQ + 1.6);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[5]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(5, ctx, [L("Why would roots struggle in hard soil?", cQ, "big")])}>
        <SVG op={out3(lt, 0.1, 0.5)}>
          <SoilCut id="cut5a" x={40} y={50} w={670} h={490} loose={0} root={g} kind="stuck" />
          <SoilCut id="cut5b" x={730} y={50} w={670} h={490} loose={1} root={g} />
        </SVG>
        <Tag text="HARD, PACKED SOIL" x={190} y={68} lt={lt} at={0.5} size={28} />
        <Chip text="LOOSE SOIL" x={920} y={68} lt={lt} at={0.7} tone="gold" size={28} />
        <Chip text="Quick stop!" x={720} y={620} lt={lt} at={0.3} out={st - 0.2} tone="gold" size={52} />
        <Discuss lt={lt} at={st} hold={4.8} n={1} q="Why would roots struggle in hard soil?" size={56} />
        <Check lt={lt} y={COMPACT_Y} done={[-1, -1, null, null, null]} />
      </Scene>
    );
  };
}
// b6 — Levelling
function B6(ctx) {
  return ({ localTime: lt, duration }) => {
    const cStep = W("b6", "levelling"), cLook = W("b6", "look"), cRun = W("b6", "water"), cLow = W("b6", "low"), cPud = W("b6", "puddles"), cHigh = W("b6", "high"), cDry = W("b6", "dry"),
      cFlat = W("b6", "so"), cNow = W("b6", "now"), cFair = W("b6", "fair");
    const after = reveal(lt, cFlat, 0.5);
    const puddle = drive(lt, cRun, cHigh + 0.4) * (1 - after);
    const sweep = drive(lt, cFlat + 0.1, cNow + 0.4) * 1.1;
    const even = drive(lt, cNow + 0.4, cFair + 1.1);
    const pour = (lt < cFlat ? reveal(lt, cRun - 0.2, 0.3) * (1 - after) : 0) + (lt >= cNow ? reveal(lt, cNow, 0.3) : 0);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[6]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(6, ctx, [L("Makes the field flat", cFlat), L("Water spreads EVENLY", cNow), L("No puddles, no dry patches", cFair)])}>
        <SVG op={out3(lt, 0.1, 0.5)}><Ground lt={lt} sweep={sweep} pour={pour} puddle={puddle} even={even} fair={cFair} plankOp={reveal(lt, cFlat, 0.3) * (1 - reveal(lt, cNow + 0.5, 0.4))} /></SVG>
        <Badge text="STEP 3: LEVELLING" x={520} y={80} lt={lt} at={cStep} size={44} op={1 - after} />
        <Chip text="A bumpy field" x={760} y={190} lt={lt} at={cLook} out={cFlat} size={34} />
        <Tag text="LOW spot: puddles" x={1170} y={560} lt={lt} at={cPud} out={cFlat} size={32} />
        <Tag text="HIGH spot: dry" x={260} y={420} lt={lt} at={cDry} out={cFlat} size={32} />
        <Pic slot="level_plank" label="A wooden plank pulled by bullocks" x={340} y={70} w={500} h={300} lt={lt} at={cFlat} fx="pop" />
        <Pic slot="level_tractor" label="A tractor-drawn leveller" x={860} y={70} w={500} h={300} lt={lt} at={cFlat + 0.5} fx="pop" />
        <Chip text="plank leveller" x={590} y={320} lt={lt} at={cFlat + 0.3} size={26} />
        <Chip text="tractor leveller" x={1110} y={320} lt={lt} at={cFlat + 0.8} size={26} />
        <Chip text="FLAT: a FAIR share for every seed" x={720} y={415} lt={lt} at={cFair} tone="gold" size={38} />
        <Rider lt={lt} tick={cStep} mood={lt > cLook && lt < cFlat ? "worried" : "happy"} />
        {compact(lt, 3, cStep)}
      </Scene>
    );
  };
}
// b7 — Bunding
function B7(ctx) {
  return ({ localTime: lt, duration }) => {
    const cStep = W("b7", "bunding"), cBuild = S("b7", 1), cBunds = W("b7", "bunds"), cHold = S("b7", 2), cWash = S("b7", 3), cMoist = S("b7", 4), cM = W("b7", "moist");
    const a = 1 - reveal(lt, cHold, 0.5), b = reveal(lt, cHold, 0.5);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[7]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(7, ctx, [L("Small earthen walls around the field", cBunds), L("Hold rainwater", cHold), L("Reduce erosion", cWash), L("Save moisture", cM)])}>
        <div style={{ position: "absolute", inset: 0, opacity: a }}>
          <Pic slot="bund_build" label="Farmers shape low walls of earth around the field" x={40} y={50} w={1360} h={880} lt={lt} at={0.1} fx="zoom" />
          <Badge text="STEP 4: BUNDING" x={70} y={80} lt={lt} at={cStep} size={44} />
          <Chip text="BUNDS: small walls of earth" x={720} y={760} lt={lt} at={cBunds} tone="gold" size={40} />
        </div>
        <SVG op={b}><g transform="translate(40 50)">
          <BundArt id="bund7" lt={lt} bund={1} rain={reveal(lt, cHold, 0.5) * (1 - reveal(lt, cMoist, 0.8))} hold={drive(lt, cHold, cWash + 0.3)} wet={drive(lt, cMoist, SE("b7", 4) + 0.4)} nogo={reveal(lt, cWash, 0.5)} />
        </g></SVG>
        <div style={{ position: "absolute", inset: 0, opacity: b }}>
          <Chip text="HOLD rainwater" x={290} y={340} lt={lt} at={cHold + 0.2} tone="gold" size={34} />
          <Pic slot="soil_erosion" label="Without bunds, rain washes soil away" x={880} y={80} w={330} h={210} lt={lt} at={cWash} fx="pop" />
          <Tag text="without bunds" x={1045} y={236} lt={lt} at={cWash + 0.2} size={24} />
          <Chip text="soil stays in" x={1045} y={300} lt={lt} at={cWash + 0.3} tone="gold" size={30} />
          <Pic slot="soil_moist" label="Moist soil" x={230} y={80} w={330} h={210} lt={lt} at={cMoist} fx="pop" />
          <Chip text="MOIST for longer" x={720} y={840} lt={lt} at={cM} tone="gold" size={34} />
        </div>
        <Rider lt={lt} tick={cStep} />
        {compact(lt, 4, cStep)}
      </Scene>
    );
  };
}
// b8 — Raised beds
function B8(ctx) {
  return ({ localTime: lt, duration }) => {
    const cStep = W("b8", "raised"), cRows = S("b8", 1), cAbove = W("b8", "above"), cWhen = S("b8", 2), cExtra = W("b8", "extra"), cPaths = W("b8", "paths"), cDrown = W("b8", "drown"),
      cVeg0 = S("b8", 3), cVeg = W("b8", "vegetables");
    const a = 1 - reveal(lt, cWhen, 0.5), mid = reveal(lt, cWhen, 0.5) * (1 - reveal(lt, cVeg0, 0.5));
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[8]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(8, ctx, [L("Raised rows of soil", cRows), L("Extra water DRAINS away", cExtra), L("Great for VEGETABLES", cVeg)])}>
        <div style={{ position: "absolute", inset: 0, opacity: a }}>
          <Pic slot="beds_make" label="Farmers pull soil into long raised rows" x={40} y={50} w={1360} h={880} lt={lt} at={0.1} fx="zoom" />
          <Badge text="STEP 5: RAISED BEDS" x={70} y={80} lt={lt} at={cStep} size={44} />
          <Chip text="long rows of soil" x={500} y={700} lt={lt} at={cRows + 0.2} size={36} />
          <Chip text="lifted ABOVE the ground" x={940} y={700} lt={lt} at={cAbove} tone="gold" size={36} />
        </div>
        <SVG op={mid}><Beds lt={lt} rise={1} rain={reveal(lt, cWhen, 0.5)} drain={drive(lt, cExtra, cDrown + 0.3)} plants={1} /></SVG>
        <div style={{ position: "absolute", inset: 0, opacity: mid }}>
          <Chip text="heavy rain" x={720} y={80} lt={lt} at={cWhen + 0.3} size={34} />
          <Chip text="EXTRA water drains into the paths" x={720} y={150} lt={lt} at={cExtra} tone="gold" size={36} />
          <Chip text="roots stay out of the water" x={720} y={838} lt={lt} at={cDrown} size={32} />
        </div>
        <Pic slot="beds_veg" label="Tomatoes, brinjal and spinach growing on raised beds" x={40} y={50} w={1360} h={880} lt={lt} at={cVeg0} fx="zoom" />
        <Chip text="tomatoes" x={420} y={120} lt={lt} at={cVeg} tone="gold" size={36} />
        <Chip text="brinjal" x={720} y={120} lt={lt} at={cVeg + 0.25} tone="gold" size={36} />
        <Chip text="spinach" x={1020} y={120} lt={lt} at={cVeg + 0.5} tone="gold" size={36} />
        <Rider lt={lt} tick={cStep} />
        {compact(lt, 5, cStep)}
      </Scene>
    );
  };
}
// b9 — Which step?
function B9(ctx) {
  return ({ localTime: lt, duration }) => {
    const cTurn = S("b9", 0), cF = S("b9", 1), cP = S("b9", 2), st = stopAt("b9", 2);
    const Q = ({ x, at }) => <div style={{ position: "absolute", left: x, top: 372, width: 90, height: 90, borderRadius: 45, background: SK.gold, color: SK.ink, opacity: clamp(pop(lt, at + 0.4), 0, 1),
      fontFamily: SERIF, fontWeight: 700, fontSize: 66, lineHeight: "90px", textAlign: "center", boxShadow: "0 4px 14px rgba(0,0,0,0.35)" }}>?</div>;
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[9]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(9, ctx, [L("Field floods after rain → ?", cF, "big"), L("Puddles in one corner, dry in another → ?", cP, "big")])}>
        <Big x={40} y={190} w={1360} lt={lt} at={cTurn} out={cF} size={92} align="center">Your turn!</Big>
        <Pic slot="flood_field" label="A field flooding after rain" x={40} y={50} w={670} h={430} lt={lt} at={cF} fx="pop" />
        <Pic slot="puddle_field" label="Puddles in one corner, dry soil in another" x={730} y={50} w={670} h={430} lt={lt} at={cP} fx="pop" />
        <Chip text="Floods after rain" x={320} y={70} lt={lt} at={cF + 0.3} size={32} />
        <Chip text="Puddles here, dry there" x={1010} y={70} lt={lt} at={cP + 0.3} size={32} />
        <Q x={330} at={cF} /><Q x={1020} at={cP} />
        <Discuss lt={lt} at={st} hold={5.8} n={2} head="WHICH STEP?" q="Which step helps each field?" size={56} y={510} h={420} />
        <Check lt={lt} y={COMPACT_Y} done={[-1, -1, -1, -1, -1]} />
      </Scene>
    );
  };
}
// b10 — Did you know? Three stops round the world
function B10(ctx) {
  return ({ localTime: lt, duration }) => {
    const cDyk = S("b10", 0), cAlike = W("b10", "farmers"), cTN = S("b10", 1), cBunds = W("b10", "bunds"), cRain = W("b10", "rainwater"), cNL = S("b10", 2), cQuarter = W("b10", "quarter"), cBelow = W("b10", "below"),
      cDrain = S("b10", 3), cRaj = S("b10", 4), cKh = W("b10", "khadin"), cWall = W("b10", "uses"), cMoist = W("b10", "moist"), cBajra = W("b10", "bajra");
    const toCorner = out3(lt, cTN - 0.2, 0.7), gx = lerp(720, 1320, toCorner), gy = lerp(250, 112, toCorner), gr = lerp(150, 62, toCorner);
    const flipOut = 1 - reveal(lt, cTN - 0.3, 0.4);
    const side = (a, o) => clamp(out3(lt, a, 0.5) * (o != null ? 1 - reveal(lt, o, 0.4) : 1), 0, 1);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[10]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(10, ctx, [L("Tamil Nadu and Odisha: bunds save rainwater", cBunds), L("Netherlands: about a QUARTER of the land is below sea level, so drainage channels", cQuarter), L("Rajasthan: KHADIN systems hold rain for dry lands", cKh)], { max: 6 })}>
        <SVG op={pop(lt, cDyk, 0.7)}><Globe cx={gx} cy={gy} r={gr} lt={lt} /></SVG>
        <div style={{ position: "absolute", inset: 0, opacity: flipOut }}>
          <Flip x={300} y={460} w={840} h={260} lt={lt} at={cAlike} q="Farmers all over the world think ALIKE!" n="" label="DID YOU KNOW?" size={52} />
        </div>
        <Badge text="DID YOU KNOW?" x={50} y={70} lt={lt} at={cTN} size={40} />
        <Pic slot="tn_bunds" label="Rice fields with earthen bunds in Tamil Nadu" x={40} y={200} w={880} h={730} lt={lt} at={cTN} out={cNL} fx="zoom" dur={0.6} />
        <Pic slot="nl_polder" label="The Netherlands: flat green fields, drainage channels, a dike" x={40} y={200} w={880} h={730} lt={lt} at={cNL} out={cRaj} fx="pan" dur={0.6} />
        <Pic slot="khadin_wall" label="A khadin: rainwater behind a long earthen wall" x={40} y={200} w={880} h={730} lt={lt} at={cRaj} out={cBajra} fx="zoom" dur={0.6} />
        <Pic slot="khadin_bajra" label="Green bajra on the moist land behind the wall" x={40} y={200} w={880} h={730} lt={lt} at={cBajra} fx="zoom" dur={0.6} />
        <Chip text="STOP 1: TAMIL NADU and ODISHA" x={70} y={222} lt={lt} at={cTN + 0.1} out={cNL} tone="gold" size={32} anchor="left" />
        <Chip text="STOP 2: THE NETHERLANDS" x={70} y={222} lt={lt} at={cNL + 0.1} out={cRaj} tone="gold" size={32} anchor="left" />
        <Chip text="STOP 3: RAJASTHAN" x={70} y={222} lt={lt} at={cRaj + 0.1} tone="gold" size={32} anchor="left" />
        <SVG op={side(cTN + 0.2, cNL)}><g transform="translate(944 290) scale(0.334)">
          <BundArt id="bund10" lt={lt} rain={1} hold={drive(lt, cTN, cRain)} /></g></SVG>
        <div style={{ position: "absolute", left: 944, top: 600, width: 456, textAlign: "center", opacity: side(cBunds, cNL), fontFamily: SERIF, fontWeight: 700, fontSize: 38, lineHeight: 1.2, color: SK.white }}>Bunds save precious rainwater, for generations</div>
        <SVG op={side(cNL + 0.2, cRaj)}><g transform="translate(947 240)"><SeaArt lt={lt} dike={reveal(lt, cBelow, 0.5)} drain={reveal(lt, cDrain, 0.5)} /></g></SVG>
        <div style={{ position: "absolute", left: 944, top: 662, width: 456, textAlign: "center", opacity: side(cQuarter, cRaj), fontFamily: SERIF, fontWeight: 700, fontSize: 38, lineHeight: 1.2, color: SK.white }}>About <span style={{ color: SK.gold }}>¼</span> of the land is below sea level</div>
        <SVG op={side(cRaj + 0.2)}><g transform="translate(947 240)"><KhadinArt lt={lt} rain={reveal(lt, cRaj, 0.5) * (1 - reveal(lt, cMoist, 0.5))} water={drive(lt, cWall, cMoist + 0.2) * (1 - reveal(lt, cMoist + 0.8, 0.6))} moist={reveal(lt, cMoist, 0.4)} grow={out3(lt, cBajra, 0.8)} /></g></SVG>
        <div style={{ position: "absolute", left: 944, top: 662, width: 456, textAlign: "center", opacity: side(cKh), fontFamily: SERIF, fontWeight: 700, fontSize: 38, lineHeight: 1.2, color: SK.white }}>{lt < cBajra ? "The KHADIN: a long earthen wall" : "Moist soil grows BAJRA"}</div>
      </Scene>
    );
  };
}
// b11 — Checklist complete: Beej goes into the soil
function B11(ctx) {
  return ({ localTime: lt, duration }) => {
    const cDone = W("b11", "checklist"), cFrom = S("b11", 2), cRice = W("b11", "rice"), cPold = W("b11", "polders"), cSame = W("b11", "same"), cFarm = S("b11", 3), cPlant = W("b11", "plant"),
      cPrep = W("b11", "prepares"), cGive = S("b11", 4), cBest = W("b11", "best");
    const names = ["clearing", "ploughing", "levelling", "bunding", "raised"].map((w) => W("b11", w));
    let now = -1; names.forEach((t, i) => { if (lt >= t && lt < (names[i + 1] || names[i] + 1.2)) now = i; });
    const carry = drive(lt, cFarm, cPrep), sinkIn = drive(lt, cPrep + 0.6, cGive + 0.2);
    const bx = lerp(1180, 720, carry), by = lerp(266, 590, carry) - 130 * Math.sin(Math.PI * carry) + sinkIn * 150;
    const spr = pop(lt, cBest, 0.7);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[11]} showCaps={ctx.caps} capSize={ctx.capSize} panel={panel(11, ctx, [])}>
        <Pic slot="ready_field" label="The prepared field, ready for Beej" x={40} y={50} w={1360} h={880} lt={lt} at={0.1} fx="zoom" zoom={1.06} />
        <Pic slot="tn_bunds" label="Rice fields of India" x={70} y={80} w={400} h={260} lt={lt} at={cRice} out={cFarm} fx="pop" />
        <Pic slot="nl_polder" label="Polders of the Netherlands" x={490} y={80} w={400} h={260} lt={lt} at={cPold} out={cFarm} fx="pop" />
        <Chip text="India" x={270} y={294} lt={lt} at={cRice + 0.2} out={cFarm} size={26} />
        <Chip text="The Netherlands" x={690} y={294} lt={lt} at={cPold + 0.2} out={cFarm} size={26} />
        <Chip text="ONE lesson" x={1110} y={190} lt={lt} at={cSame} out={cFarm} tone="gold" size={40} />
        <SVG op={out3(lt, cFarm, 0.6)}>
          <path d="M42 690 Q720 660 1398 690 L1398 912 Q1398 928 1382 928 L58 928 Q42 928 42 912 Z" fill={C.soil} stroke={C.soilHard} strokeWidth="4" />
          {Array.from({ length: 46 }, (_, i) => <circle key={i} cx={70 + (i * 311.3) % 1310} cy={720 + (i * 53.7) % 190} r={5 + (i % 4) * 2} fill={i % 2 ? "#8A6547" : C.soilHard} />)}
        </SVG>
        <SVG op={out3(lt, 0.3, 0.5) * (1 - reveal(lt, cPrep + 0.2, 0.5))}><Pocket x={1180} y={420} s={1.6} sink={1 - reveal(lt, cFarm - 0.6, 0.5)} lt={lt} empty={lt >= cFarm - 0.1} /></SVG>
        <SVG op={reveal(lt, cFarm - 0.1, 0.1) * (lt < cBest ? 1 : 0)}><Beej x={bx} y={by} s={1.3} lt={lt} mood={lt > cPrep ? "wow" : "happy"} /></SVG>
        <SVG op={clamp(spr, 0, 1)}><g>
          <path d="M720 740 C716 700 724 660 720 610" stroke={C.leafD} strokeWidth="11" strokeLinecap="round" fill="none" />
          <path d="M720 742 C712 780 734 810 716 850 M720 760 C690 780 672 800 664 836 M722 762 C752 782 768 800 776 832" stroke={C.root} strokeWidth="6" strokeLinecap="round" fill="none" />
          <Beej x={720} y={560 + (1 - spr) * 40} s={1.5} lt={lt} leaf={clamp(spr, 0, 1)} />
        </g></SVG>
        <Big x={100} y={120} w={1240} lt={lt} at={cPrep} size={70} align="center">A farmer <span style={{ color: SK.gold }}>PREPARES</span> the land</Big>
        <Chip text="its BEST chance to grow!" x={720} y={230} lt={lt} at={cBest} tone="gold" size={44} />
        <Check lt={lt} y={170} rowH={76} size={34} head={null} done={[-1, -1, -1, -1, -1]} now={now} />
        <div style={{ position: "absolute", left: PANEL_X + PAD, top: 580, width: PANEL_W - PAD * 2, opacity: out3(lt, cDone, 0.6), fontFamily: SANS, fontWeight: 700, fontSize: 27, lineHeight: 1.3, color: SK.goldDeep }}>
          Clear → Plough → Level → Bund → Raised beds</div>
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
const COLLAGE = [{ slot: "rough_field", x: -60, y: -40, w: 760, h: 520, ph: 0 }, { slot: "hero_plough", x: 640, y: -80, w: 760, h: 520, ph: 2 },
  { slot: "tn_bunds", x: -80, y: 520, w: 700, h: 560, ph: 4 }, { slot: "ready_field", x: 560, y: 560, w: 820, h: 560, ph: 1 }];
function Lp23Scenes(props = {}) {
  const caps = props.showCaptions === "false" ? false : props.showCaptions !== false;
  const titles = {};
  for (let n = 1; n <= NB; n++) titles[n] = str(props["title" + n + "Text"], TITLES[n]);
  const ctx = { caps, titles, capSize: num(props.captionSize, 34) };
  const B = [B1, B2, B3, B4, B5, B6, B7, B8, B9, B10, B11];
  const beats = B.map((Bn, i) => { const t = BEAT("b" + (i + 1)); return [t.start, t.start + t.dur, Bn]; });
  return (
    <StoryFrame props={props} dur={DUR} persistKey="thinkpro-lp23-preparing-the-field" collage={COLLAGE}>
      {beats.map(([s, e, Bn], i) => (
        <Sprite key={i} start={s} end={e}>{Bn(ctx)}</Sprite>
      ))}
      {STOPS.map(([b, i, hold]) => <StopAt key={b} t={BEAT(b).start + stopAt(b, i)} hold={hold - 0.2} />)}
      <ChimeAt t={BEAT("b10").start + S("b10", 0, 0)} />
      <AudioSync />
    </StoryFrame>
  );
}
window.Lp23Scenes = Lp23Scenes;
