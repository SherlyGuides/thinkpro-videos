/* global React, window */
// ThinkPro Academy — "Farming on Slopes and Nursery Beds" (Grade 6 Agriculture, Session 24, V1).
// After AG_G6_S24 Video Script (Subrata, 5 Nov 2026): 11 script scenes = 11 voiced beats, three presenter
// stops (b4 think, b8 sort it, b11 quick check: TPStory.StopAt freezes the web player, the export holds).
// Running idea: two halves, STEPS (terraces) and START (nursery beds), tracked by the two pills at the foot
// of the panel. Central models, both drawn here: the HILL (a bare slope cut one level at a time into terraces,
// rain races or rests on it) and the NURSERY BED (seeds, water, shade, weed, seedlings growing).
// STORY STYLE (engine/story-kit.jsx). Pure function of time.
const { Sprite } = window;
const { reveal, windowOp } = window.TPMotion;
const { num, str } = window.TPStage;
const { SK, SERIF, SANS, LEFT_W, pop, out3, lerp, drive,
  Pic, Chip, Badge, Big, Card, SVG, Arrow, T, ChimeAt, Scene, StoryFrame, StopAt, Flip } = window.TPStory;

// ---- Timing: EVERYTHING is keyed to the narration (tools/fit_timing.py → timing.js).
const TM = window.TP_TIMING;
if (!TM) console.error("timing.js missing — run: python3 tools/fit_timing.py videos/lp24-farming-on-slopes-and-nursery-beds");
const LEAD = TM ? TM.lead : 1.0;
const DUR = TM ? TM.total : 250;
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
const TITLES = { 1: "LP24 – Farming on Slopes and Nursery Beds", 2: "Terrace farming", 3: "Terraces: three big jobs", 4: "Think: why does water slow down?",
  5: "Nursery bed", 6: "2 ways to sow", 7: "How do farmers choose?", 8: "Sort it", 9: "Did you know?", 10: "The big idea", 11: "Quick check" };
const KICK = "Grade 6 · Agriculture · Session 24";
const panel = (n, ctx, lines, extra = {}) => ({ kicker: KICK, title: ctx.titles[n], lines, ...extra });
const L = (text, at, kind = "item", extra = {}) => ({ text, at, kind, ...extra });

// ---- Presenter stops: [beat, sentence index whose pauseAfter is the hold, hold s]
const STOPS = [["b4", 2, 15.0], ["b8", 2, 15.0], ["b11", 3, 15.0]];
const stopAt = (b, i) => SE(b, i) + 0.1;
const stopFor = (b) => STOPS.find((s) => s[0] === b);
const PauseIcon = ({ s = 56 }) => <svg width={s} height={s} viewBox="0 0 90 90" style={{ flex: "none" }}><circle cx="45" cy="45" r="43" fill={SK.gold} /><rect x="28" y="24" width="12" height="42" rx="4" fill={SK.ink} /><rect x="50" y="24" width="12" height="42" rx="4" fill={SK.ink} /></svg>;
// The scenes want the model to stay in view at a stop, so this is a compact positioned card, not the full-stage StopCard.
function StopBar({ lt, b, x, y, w, h, heading, children, size = 44 }) {
  const s = stopFor(b), at = stopAt(b, s[1]), n = STOPS.indexOf(s) + 1;
  const o = windowOp(lt, at, at + s[2] + 0.2, 0.35); if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 22, background: "rgba(5,30,22,0.9)", opacity: o, zIndex: 3, boxShadow: "0 0 0 3px rgba(226,176,76,0.9)",
      display: "flex", flexDirection: "column", justifyContent: "center", padding: "20px 36px", boxSizing: "border-box" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <PauseIcon />
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 28, letterSpacing: "0.08em", color: SK.ink, background: SK.gold, padding: "6px 22px", borderRadius: 12 }}>{heading}</div>
      </div>
      <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: size, lineHeight: 1.18, color: SK.white, marginTop: 18 }}>{children}</div>
      <div style={{ fontFamily: SANS, fontSize: 24, color: SK.dim, marginTop: 14 }}>Stop {n} of {STOPS.length}</div>
    </div>
  );
}

// ---- Running idea: the two halves, in the panel just above the logo --------------------
const Pill = ({ text, on, x, y, w = 188 }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, boxSizing: "border-box", textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 25, letterSpacing: "0.1em",
    padding: "5px 0", borderRadius: 999, color: on ? SK.ink : SK.inkDim, background: on ? SK.gold : "transparent", boxShadow: `0 0 0 2px ${on ? SK.goldDeep : SK.inkLine}` }}>{text}</div>
);
function Halves({ lt, steps, start, at = 0.2 }) {
  const o = out3(lt, at, 0.6); if (o <= 0) return null;
  return <div style={{ position: "absolute", left: 0, top: 0, opacity: o }}>
    <Pill text="STEPS" on={steps} x={1476} y={872} /><Pill text="START" on={start} x={1696} y={872} /></div>;
}

// ---- Small drawn pieces ------------------------------------------------------------------
function Sprout({ x, y, g, s = 1, color = "#6FBF6E" }) {
  if (g <= 0) return null;
  const h = 70 * g * s;
  return (
    <g transform={`translate(${x} ${y})`}>
      <line x1={0} y1={0} x2={0} y2={-h} stroke={color} strokeWidth={5 * s} strokeLinecap="round" />
      <ellipse cx={-12 * s * g} cy={-h * 0.6} rx={16 * s * g} ry={6 * s * g} fill={color} transform={`rotate(-30 ${-12 * s * g} ${-h * 0.6})`} />
      <ellipse cx={12 * s * g} cy={-h * 0.85} rx={16 * s * g} ry={6 * s * g} fill={color} transform={`rotate(30 ${12 * s * g} ${-h * 0.85})`} />
    </g>
  );
}
const dropPath = (cx, cy, r) => `M${cx} ${cy - r * 1.5} C ${cx} ${cy - r * 1.5}, ${cx - r} ${cy - r * 0.2}, ${cx - r} ${cy + r * 0.3} A ${r} ${r} 0 0 0 ${cx + r} ${cy + r * 0.3} C ${cx + r} ${cy - r * 0.2}, ${cx} ${cy - r * 1.5}, ${cx} ${cy - r * 1.5} Z`;
// A flat hill farmer. shake 0..1 = shaking his head.
function Farmer({ x, y, s = 1, lt = 0, shake = 0 }) {
  const a = 13 * Math.sin(lt * 8) * shake;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-13} y={-40} width={10} height={40} rx={4} fill="#4A3B31" /><rect x={3} y={-40} width={10} height={40} rx={4} fill="#4A3B31" />
      <path d="M-20 -36 L-16 -92 Q 0 -102 16 -92 L20 -36 Z" fill={SK.cream} />
      <rect x={-28} y={-88} width={9} height={40} rx={4} fill="#B98559" transform="rotate(10 -24 -88)" /><rect x={19} y={-88} width={9} height={40} rx={4} fill="#B98559" transform="rotate(-10 24 -88)" />
      <g transform={`rotate(${a} 0 -100)`}>
        <circle cx={0} cy={-114} r={15} fill="#B98559" />
        <path d="M-17 -118 Q 0 -140 17 -118 Z" fill="#E9E2CF" />
      </g>
    </g>
  );
}

// ---- The central model: the HILL --------------------------------------------------------
// cut 0 = a bare straight slope, 1 = six terraces, one level at a time, each with a low edge at its outer lip.
// rain = rain falling; race = water, mud and seeds racing down the bare slope; pile = what collects at the foot;
// pool = water resting on each step; soak = water soaking into the step; trickle = gentle overflow; grow = rice.
const STEPS_N = 6;
function Hill({ x, y, w, h, lt, cut = 0, rain = 0, race = 0, pile = 0, pool = 0, soak = 0, trickle = 0, grow = 0, farmer = 1, shake = 0, glowStep = -1, op = 1 }) {
  if (op <= 0) return null;
  const tx = x + w * 0.2, ty = y + h * 0.3, bx = x + w * 0.985, by = y + h * 0.9, N = STEPS_N;
  const A = (s) => [lerp(tx, bx, s), lerp(ty, by, s)];
  const steps = Array.from({ length: N }, (_, i) => {
    const [ax, ay] = A(i / N), [zx, zy] = A((i + 1) / N), c = Easing3(clamp(cut * N - i, 0, 1));
    const mx = (ax + zx) / 2, my = (ay + zy) / 2;
    return { i, ax, ay, zx, zy, c, cx: lerp(mx, ax, c), cy: lerp(my, zy, c) };
  });
  const d = [`M${x} ${y + h}`, `L${x} ${ty}`, `L${tx} ${ty}`];
  steps.forEach((s) => { d.push(`L${s.cx} ${s.cy}`, `L${s.zx} ${s.zy}`); });
  d.push(`L${x + w} ${by}`, `L${x + w} ${y + h}`, "Z");
  const clip = `hill-${Math.round(x)}-${Math.round(w)}`;
  return (
    <SVG op={op}>
      <defs><clipPath id={clip}><rect x={x} y={y} width={w} height={h} rx={18} /></clipPath></defs>
      <g clipPath={`url(#${clip})`}>
        <rect x={x} y={y} width={w} height={h} fill="#A9D3E2" />
        <rect x={x} y={y} width={w} height={h} fill="#3B5866" opacity={0.55 * rain} />
        {rain > 0 && [[0.3, 0.09, 150, 50], [0.5, 0.06, 190, 60], [0.72, 0.1, 170, 54], [0.9, 0.07, 150, 46]].map(([px, py, rx, ry], i) =>
          <ellipse key={i} cx={x + px * w + 12 * Math.sin(lt * 0.4 + i)} cy={y + py * h} rx={rx} ry={ry} fill="#5F7480" opacity={rain} />)}
        {rain > 0 && Array.from({ length: 80 }, (_, i) => {
          const p = (lt * (1.5 + 0.5 * rnd(i)) + rnd(i + 40)) % 1, rx = x + rnd(i + 90) * (w + 80), ry = y + 60 + p * h;
          return <line key={i} x1={rx} y1={ry} x2={rx - 7} y2={ry + 26} stroke="#E6F5FC" strokeWidth={3} opacity={0.75 * rain} />;
        })}
        <path d={d.join(" ")} fill={SK.soil} />
        <path d={d.slice(1, -3).join(" ").replace(/^L/, "M")} stroke="#8A6A48" strokeWidth={7} fill="none" strokeLinejoin="round" />
        {/* the mud that reaches the foot of the hill */}
        {pile > 0 && <g><ellipse cx={bx - 50} cy={by + 12} rx={170 * pile} ry={46 * pile} fill="#A8743F" />
          {Array.from({ length: 10 }, (_, i) => <ellipse key={i} cx={bx - 170 * pile * 0.8 + rnd(i) * 300 * pile} cy={by - 4 * pile + rnd(i + 20) * 34 * pile} rx={7} ry={4.5} fill={SK.gold} />)}</g>}
        {steps.map((s) => {
          const tw = s.zx - s.ax, pH = 16 * pool * s.c, lip = 18 * s.c;
          return <g key={s.i}>
            {soak > 0 && s.c > 0.5 && <ellipse cx={s.ax + tw / 2 - 6} cy={s.zy + 2} rx={(tw - 20) / 2} ry={Math.min(s.zy - s.ay, 56) * soak} fill="#3E6E8E" opacity={0.55} />}
            {pH > 0.5 && <rect x={s.ax + 3} y={s.zy - pH} width={tw - 16} height={pH} fill="#7FD3F7" opacity={0.92} />}
            {grow > 0 && s.c > 0.5 && Array.from({ length: 5 }, (_, k) => <Sprout key={k} x={s.ax + (k + 0.6) * (tw - 16) / 5} y={s.zy} g={grow} s={Math.min(0.9, tw / 170)} color="#4FA75A" />)}
            {lip > 0.5 && <rect x={s.zx - 15} y={s.zy - lip} width={15} height={lip} rx={3} fill="#C9B79A" stroke="#8A6A48" strokeWidth={2} />}
            {glowStep === s.i && <rect x={s.ax - 4} y={s.zy - 30} width={tw + 8} height={40} rx={10} stroke={SK.gold} strokeWidth={5} fill="none" />}
          </g>;
        })}
        {/* gentle overflow from each step to the next */}
        {trickle > 0 && steps.slice(0, N - 1).map((s) => { const nxt = steps[s.i + 1], fall = nxt.zy - s.zy;
          return [0, 1, 2].map((k) => { const p = (lt * 0.35 + k / 3 + s.i * 0.17) % 1; return <path key={`${s.i}-${k}`} d={dropPath(s.zx + 8, s.zy - 6 + p * fall, 7)} fill="#7FD3F7" stroke="#2F7FA8" strokeWidth={1.5} opacity={trickle * (1 - p * 0.4)} />; }); })}
        {/* water, mud and seeds racing down the bare slope */}
        {race > 0 && Array.from({ length: 46 }, (_, i) => {
          const p = (lt * (0.62 + 0.25 * rnd(i)) + rnd(i + 7)) % 1, [px, py] = A(p), off = -8 - rnd(i + 3) * 18, k = i % 4;
          if (k === 1) return <ellipse key={i} cx={px} cy={py + off} rx={7} ry={4.5} fill={SK.gold} stroke="#9E7320" strokeWidth={1.5} opacity={race} />;
          if (k === 2) return <circle key={i} cx={px} cy={py + off} r={8} fill="#A8743F" opacity={race} />;
          return <ellipse key={i} cx={px} cy={py + off} rx={20} ry={6} fill="#7FD3F7" opacity={race} transform={`rotate(${Math.atan2(by - ty, bx - tx) * 57.3} ${px} ${py + off})`} />;
        })}
        {farmer > 0 && <g opacity={farmer}><Farmer x={lerp(x, tx, 0.62)} y={ty} s={Math.min(1.1, w / 800)} lt={lt} shake={shake} /></g>}
      </g>
      <rect x={x} y={y} width={w} height={h} rx={18} stroke="rgba(255,255,255,0.55)" strokeWidth={3} fill="none" />
    </SVG>
  );
}
const Easing3 = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// ---- Icons (flat, centred on 0,0, about 70 px radius) ------------------------------------
function IconDrop() { return <g><path d={dropPath(0, -2, 34)} fill="#7FD3F7" /><path d="M-46 62 Q -24 48 0 62 T 46 62" stroke="#BFE3F7" strokeWidth={7} strokeLinecap="round" fill="none" /></g>; }
function IconSoil() { return <g><path d="M-56 18 Q -30 -30 0 -22 Q 34 -32 56 18 Z" fill="#7B5A3C" /><path d="M-66 16 L66 16 Q 58 56 0 56 Q -58 56 -66 16 Z" fill="#C9966C" />
  {[[-26, -2], [8, -8], [28, 4]].map(([a, b], i) => <circle key={i} cx={a} cy={b} r={5} fill="#5C4A3E" />)}</g>; }
function IconFlat() { return <g><rect x={-66} y={22} width={132} height={32} rx={6} fill={SK.soil} /><rect x={-66} y={14} width={132} height={10} rx={4} fill="#C9B79A" />
  {[-44, -14, 16, 46].map((a) => <Sprout key={a} x={a} y={14} g={1} s={0.8} color="#6FBF6E" />)}</g>; }
function IconPacket() { return <g><rect x={-40} y={-56} width={80} height={112} rx={8} fill={SK.cream} /><rect x={-40} y={-56} width={80} height={22} fill={SK.gold} />
  <Sprout x={0} y={32} g={1} s={0.75} color="#4FA75A" />{[-20, 0, 20].map((a) => <ellipse key={a} cx={a} cy={44} rx={6} ry={4} fill="#9E7320" />)}</g>; }
function IconClimate() { return <g><circle cx={-16} cy={-16} r={32} fill={SK.gold} />{Array.from({ length: 8 }, (_, i) => <line key={i} x1={-16} y1={-58} x2={-16} y2={-68} stroke={SK.gold} strokeWidth={6} strokeLinecap="round" transform={`rotate(${i * 45} -16 -16)`} />)}
  <g fill="#E8EEF2"><circle cx={2} cy={26} r={24} /><circle cx={34} cy={14} r={30} /><circle cx={58} cy={30} r={20} /><rect x={0} y={28} width={60} height={22} rx={10} /></g></g>; }
function IconPlough() { return <g stroke={SK.cream} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" fill="none"><path d="M-60 -40 L 16 22" /><path d="M16 22 L 46 44 L 58 16 Z" fill={SK.gold} stroke={SK.gold} /><path d="M-22 -8 L -46 44" /><path d="M-60 -40 L -70 -60" /></g>; }
function IconBubble({ cx, cy, lt, at, kind, r = 82 }) {
  const o = pop(lt, at, 0.6); if (o <= 0) return null;
  return <g transform={`translate(${cx} ${cy}) scale(${(0.7 + 0.3 * o) * r / 82})`} opacity={clamp(o, 0, 1)}>
    <circle r={82} fill={SK.bgDeep} stroke={SK.gold} strokeWidth={5} />{kind}</g>;
}

// ---- NURSERY BED, side view ---------------------------------------------------------------
function NurseryBed({ x, y, w, h, lt, at = 0, seedAt, waterAt, shadeAt, weedAt, growA, growB }) {
  const o = out3(lt, at, 0.6); if (o <= 0) return null;
  const sy = y + h * 0.66, n = 26, g = drive(lt, growA, growB), shade = out3(lt, shadeAt, 0.7);
  const pts = Array.from({ length: n }, (_, i) => x + 70 + (i + 0.5) * (w - 140) / n);
  const weed = drive(lt, weedAt, weedAt + 1.6), weedX = pts[17];
  return (
    <SVG op={o}>
      <rect x={x} y={y} width={w} height={h} rx={16} fill="#0B2E22" stroke="rgba(255,255,255,0.4)" strokeWidth={2} />
      <path d={`M${x + 34} ${y + h - 12} L${x + 60} ${sy} L${x + w - 60} ${sy} L${x + w - 34} ${y + h - 12} Z`} fill="#6B4E36" />
      <line x1={x + 60} y1={sy} x2={x + w - 60} y2={sy} stroke="#A98A66" strokeWidth={7} strokeLinecap="round" />
      {pts.map((px, i) => {
        const d = reveal(lt, seedAt + i * 0.05, 0.4), py = lerp(sy - 70, sy - 2, d); if (d <= 0) return null;
        return <g key={i}>
          {g <= 0.04 && <ellipse cx={px} cy={py} rx={6} ry={4} fill="#E3B55C" />}
          <Sprout x={px} y={sy - 2} g={g * (0.72 + 0.28 * rnd(i))} s={0.8 + 0.25 * g} />
        </g>;
      })}
      {weed < 1 && lt > growA && <g transform={`translate(${weedX + 12} ${sy - 80 * weed})`} opacity={1 - weed * 0.9}>
        <path d="M0 0 L0 -46 M0 -22 L-18 -38 M0 -30 L18 -46" stroke="#C9A23A" strokeWidth={5} strokeLinecap="round" fill="none" /></g>}
      {shade > 0 && <g opacity={shade}>
        {[0.12, 0.5, 0.88].map((k) => <path key={k} d={`M${x + w * k - 26} ${sy} Q ${x + w * k} ${y + 16} ${x + w * k + 26} ${sy}`} stroke="#C9A77A" strokeWidth={5} fill="none" />)}
        <path d={`M${x + 56} ${sy - 96} Q ${x + w / 2} ${y + 4} ${x + w - 56} ${sy - 96} L${x + w - 56} ${sy - 86} Q ${x + w / 2} ${y + 16} ${x + 56} ${sy - 86} Z`} fill="rgba(240,240,225,0.5)" />
      </g>}
      {lt > waterAt && Array.from({ length: 18 }, (_, i) => { const p = ((lt - waterAt) * 0.9 + rnd(i)) % 1, px = x + 90 + rnd(i + 11) * (w - 180), a = windowOp(lt, waterAt, waterAt + 4.5, 0.4);
        return <path key={i} d={dropPath(px, y + 40 + p * (sy - y - 50), 6)} fill="#7FD3F7" opacity={a * (1 - p * 0.4)} />; })}
    </SVG>
  );
}
// Three children + a teacher / three baby plants: the nursery-school comparison.
function Compare({ x, y, w, h, lt, at, kind, label }) {
  const o = pop(lt, at, 0.6); if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 18, background: SK.cream, opacity: clamp(o, 0, 1), transform: `scale(${0.9 + 0.1 * o})`, boxShadow: "0 6px 20px rgba(0,0,0,0.3)", overflow: "hidden" }}>
      <svg width={w} height={h - 54} viewBox={`0 0 ${w} ${h - 54}`} style={{ position: "absolute", left: 0, top: 0 }}>
        <rect x={0} y={h - 84} width={w} height={30} fill={kind === "kids" ? "#D9C9A3" : SK.soil} />
        {kind === "kids" ? [0, 1, 2, 3].map((i) => { const big = i === 0, cx = 80 + i * 92, s = big ? 1.45 : 0.95, base = h - 80;
          return <g key={i} transform={`translate(${cx} ${base}) scale(${s})`}><circle cy={-58} r={15} fill="#B98559" /><path d="M-17 0 L-13 -40 Q 0 -48 13 -40 L17 0 Z" fill={big ? SK.bg1 : ["#E2B04C", "#2F6FB3", "#C4552D"][i - 1]} /></g>; })
          : [0, 1, 2].map((i) => <Sprout key={i} x={110 + i * 110} y={h - 84} g={0.8 + 0.1 * Math.sin(lt * 1.6 + i)} s={1.05} color="#4FA75A" />)}
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 8, textAlign: "center", fontFamily: SERIF, fontWeight: 700, fontSize: 30, color: SK.ink }}>{label}</div>
    </div>
  );
}
// Seed → nursery → field (or seed → field): the route each method takes.
function Route({ x, y, w, h, lt, ats, direct = false }) {
  const o = out3(lt, ats[0] - 0.1, 0.5); if (o <= 0) return null;
  const nodes = direct ? [[x + 130, "seeds"], [x + w - 130, "main field"]] : [[x + 110, "seeds"], [x + w / 2, "nursery bed"], [x + w - 110, "main field"]];
  const cy = y + 66;
  return (
    <SVG op={o}>
      <rect x={x} y={y} width={w} height={h} rx={16} fill="rgba(5,30,22,0.58)" stroke="rgba(255,255,255,0.18)" strokeWidth={2} />
      {nodes.slice(1).map(([nx], i) => <Arrow key={i} x1={nodes[i][0] + 66} y1={cy} x2={nx - 66} y2={cy} color={SK.gold} sw={6} head={20} op={out3(lt, ats[i + 1] - 0.1, 0.4)} />)}
      {nodes.map(([nx, lab], i) => {
        const a = out3(lt, ats[i], 0.4); if (a <= 0) return null;
        const isSeed = lab === "seeds", isBed = lab === "nursery bed";
        return <g key={lab} opacity={a}>
          {isSeed && [-22, 0, 22].map((d, k) => <ellipse key={k} cx={nx + d} cy={cy + (k % 2 ? -10 : 8)} rx={13} ry={8} fill="#E3B55C" stroke="#9E7320" strokeWidth={2} />)}
          {isBed && <g><rect x={nx - 56} y={cy + 8} width={112} height={26} rx={6} fill="#7B5A3C" />{[-40, -20, 0, 20, 40].map((d) => <Sprout key={d} x={nx + d} y={cy + 10} g={0.65} s={0.75} />)}</g>}
          {!isSeed && !isBed && <g><rect x={nx - 60} y={cy - 26} width={120} height={60} rx={8} fill={direct ? SK.soil : "#5C9BC0"} />{[-40, -14, 12, 38].map((d) => <Sprout key={d} x={nx + d} y={cy + 22} g={0.6} s={0.75} />)}</g>}
          <T x={nx} y={y + h - 16} size={24} bold color={SK.cream}>{lab}</T>
        </g>;
      })}
    </SVG>
  );
}

// ============================================================================
function B1(ctx) {
  return ({ localTime: lt, duration }) => {
    const cHill = S("b1", 0), cRain = W("b1", "rain"), cWhoosh = W("b1", "whoosh"), cQ = S("b1", 3), cThis = W("b1", "this");
    const rain = out3(lt, cRain, 0.6), race = out3(lt, cWhoosh, 0.4), pile = drive(lt, cWhoosh + 0.8, cQ + 0.4);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[1]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(1, ctx, [L("Making Every Piece of Land Count!", 0.4, "big"), L("BIG QUESTION", cQ, "head"), L("How can anyone grow crops on a slope?", cQ + 0.3)])}>
        <Hill x={40} y={60} w={900} h={840} lt={lt} rain={rain} race={race} pile={pile} shake={reveal(lt, cQ, 0.5)} />
        <Pic slot="farmer_hilltop" label="A farmer on a steep bare hillside in the rain" x={970} y={60} w={430} h={400} lt={lt} at={cHill} fx="zoom" />
        <Pic slot="soil_erosion" label="Rain washing soil off a bare slope" x={970} y={60} w={430} h={400} lt={lt} at={cWhoosh} fx="zoom" zoom={1.2} />
        <Chip text="soil · water · seeds" x={1185} y={396} lt={lt} at={W("b1", "soil")} tone="gold" size={26} />
        <Card x={970} y={490} w={430} h={410} lt={lt} at={cQ} pad={26}>
          <Badge text="BIG QUESTION" x={26} y={26} lt={lt} at={cQ} size={28} />
          <div style={{ position: "absolute", left: 26, top: 110, width: 380, fontFamily: SERIF, fontWeight: 700, fontSize: 46, lineHeight: 1.18, color: SK.white, opacity: out3(lt, cQ + 0.8, 0.6) }}>
            How can anyone grow crops on a <span style={{ color: SK.gold }}>slope</span> like <span style={{ color: SK.gold, fontSize: 56 }}>THIS?</span></div>
        </Card>
        <Chip text="STEEP hill" x={560} y={120} lt={lt} at={W("b1", "steep")} out={cWhoosh} size={30} />
        <Chip text="WHOOSH!" x={520} y={120} lt={lt} at={cWhoosh} out={cThis + 1} tone="gold" size={40} />
      </Scene>
    );
  };
}
function B2(ctx) {
  return ({ localTime: lt, duration }) => {
    const cTF = W("b2", "terrace"), cCut = W("b2", "cut"), cStair = W("b2", "staircase"), cEach = S("b2", 2), cWatch = S("b2", 3), cStop = W("b2", "stops"), cSoak = W("b2", "soaks");
    const cut = drive(lt, cCut, cEach - 0.1), rain = out3(lt, cWatch, 0.5) * (1 - reveal(lt, duration - 2.2, 1.0));
    const pool = out3(lt, cStop - 0.8, 1.0), soak = out3(lt, cSoak, 1.0), grow = drive(lt, cSoak + 0.8, duration - 0.2);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[2]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(2, ctx, [L("TERRACE FARMING", cTF, "big"), L("Hill slopes cut into flat, step-like platforms", cCut), L("called TERRACES", cEach, "head"), L("Water STOPS on each step and soaks in", cStop)])}>
        <Hill x={40} y={60} w={900} h={840} lt={lt} cut={cut} rain={rain} pool={pool} soak={soak} trickle={pool * 0.9} grow={grow} glowStep={lt > cEach && lt < cWatch ? 2 : -1} />
        <Chip text="TERRACE" x={560} y={250} lt={lt} at={cEach} out={cWatch} tone="gold" size={34} />
        <SVG op={out3(lt, cEach + 0.1, 0.4) * (1 - reveal(lt, cWatch, 0.4))}><Arrow x1={580} y1={310} x2={530} y2={520} color={SK.gold} sw={6} /></SVG>
        <Chip text="the water STOPS… and soaks in" x={560} y={120} lt={lt} at={cStop} tone="gold" size={30} />
        <Pic slot="village_hill" label="A hill village with step-like terraces" x={970} y={60} w={430} h={270} lt={lt} at={cTF} fx="zoom" />
        <Pic slot="terrace_cut" label="Farmers cut a hillside into flat steps" x={970} y={350} w={430} h={270} lt={lt} at={cCut} fx="zoom" />
        <Chip text="cut into flat steps" x={1185} y={566} lt={lt} at={cCut + 0.3} size={24} />
        <Pic slot="terrace_rice" label="Green rice growing on terraces" x={970} y={640} w={430} h={260} lt={lt} at={cStair} fx="zoom" />
        <Chip text="a giant staircase" x={1185} y={836} lt={lt} at={cStair + 0.2} size={24} tone="gold" />
        <Halves lt={lt} steps start={false} at={cTF} />
      </Scene>
    );
  };
}
function B3(ctx) {
  const jobs = [["one", "terrace_trickle", "Water trickles gently from one terrace to the next", "SLOW DOWN rainwater", <IconDrop />], ["two", "terrace_edge", "A terrace edge holds the soil in place", "REDUCE soil erosion", <IconSoil />],
    ["three", "terrace_rice", "Green rice growing on terraces", "Create LEVEL land for crops", <IconFlat />]];
  return ({ localTime: lt, duration }) => {
    const cThree = S("b3", 0), ats = [W("b3", "one"), W("b3", "two"), W("b3", "three", 1)];
    const on = (i) => lt >= ats[i] && (i === 2 || lt < ats[i + 1]);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[3]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(3, ctx, [L("TERRACES:", cThree, "head"), L("1. SLOW DOWN rainwater", ats[0], "plain"), L("2. REDUCE soil erosion", ats[1], "plain"), L("3. Create LEVEL land for crops", ats[2], "plain")])}>
        <Hill x={40} y={60} w={820} h={840} lt={lt} cut={1} pool={1} soak={out3(lt, ats[0], 0.6)} trickle={1} grow={1} glowStep={on(1) ? 1 : on(2) ? 3 : -1} />
        <Badge text="3 BIG JOBS" x={330} y={90} lt={lt} at={cThree} size={36} />
        {jobs.map(([k, slot, lab, txt, ic], i) => { const y = 60 + i * 285;
          return <React.Fragment key={k}>
            <Pic slot={slot} label={lab} x={890} y={y} w={510} h={270} lt={lt} at={ats[i]} fx="pop" dim={lt > ats[i] + 0.3 && !on(i) ? 0.35 : 0} style={on(i) ? { boxShadow: `0 0 0 5px ${SK.gold}` } : null} />
            <SVG op={1}><IconBubble cx={960} cy={y + 76} lt={lt} at={ats[i] + 0.1} kind={ic} r={62} /></SVG>
            <div style={{ position: "absolute", left: 906, top: y + 206, width: 480, opacity: out3(lt, ats[i] + 0.2, 0.5), fontFamily: SERIF, fontWeight: 700, fontSize: 31, color: SK.white, background: "rgba(5,30,22,0.78)", padding: "6px 12px", borderRadius: 10, boxSizing: "border-box", whiteSpace: "nowrap" }}>{i + 1}. {txt}</div>
          </React.Fragment>; })}
        <Halves lt={lt} steps start={false} />
      </Scene>
    );
  };
}
function B4(ctx) {
  return ({ localTime: lt, duration }) => {
    const cStop = S("b4", 0), cWhy = S("b4", 1), cTalk = S("b4", 2), s = stopFor("b4"), stop = stopAt("b4", s[1]);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[4]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(4, ctx, [L("THINK", cStop, "head"), L("Why does water slow down on a flat step?", cWhy), L("Talk to your partner", cTalk, "think")])}>
        <Hill x={40} y={60} w={1360} h={840} lt={0} cut={1} pool={1} grow={1} />
        <Chip text="Quick stop!" x={1000} y={120} lt={lt} at={cStop} out={stop} tone="gold" size={40} />
        <Big x={660} y={200} w={700} lt={lt} at={cWhy} out={stop} size={46} color={SK.ink} serif>
          <span style={{ textShadow: "none" }}>Why does water slow down on a FLAT step, but race down a slope?</span></Big>
        <StopBar lt={lt} b="b4" x={640} y={90} w={730} h={340} heading="THINK">Why does water slow down on a flat step?</StopBar>
        <Halves lt={lt} steps start={false} />
      </Scene>
    );
  };
}
function B5(ctx) {
  return ({ localTime: lt, duration }) => {
    const cBed = W("b5", "nursery"), cSchool = S("b5", 1), cBaby = W("b5", "baby"), cPatch = W("b5", "small"), cSown = W("b5", "sown"), cWater = W("b5", "waters"), cShade = W("b5", "shades"),
      cProt = W("b5", "protects"), cUntil = W("b5", "until"), cStrong = W("b5", "strong"), cMove = W("b5", "move");
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[5]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(5, ctx, [L("A small, carefully prepared patch of soil", cPatch), L("Seeds sown FIRST", cSown), L("Seedlings cared for until STRONG", cStrong, "big")])}>
        <Pic slot="bed_patch" label="A small nursery bed under a light shade cover" x={40} y={60} w={880} h={560} lt={lt} at={0.15} fx="zoom" />
        <Pic slot="bed_sow" label="A farmer sprinkles seeds thickly on the bed" x={40} y={60} w={880} h={560} lt={lt} at={cSown} fx="zoom" />
        <Pic slot="bed_water" label="Gently watering the nursery bed" x={40} y={60} w={880} h={560} lt={lt} at={cWater} fx="zoom" />
        <Pic slot="bed_weed" label="Pulling out a weed from the nursery bed" x={40} y={60} w={880} h={560} lt={lt} at={cProt} fx="zoom" />
        <Pic slot="bed_carpet" label="A carpet of tiny green seedlings" x={40} y={60} w={880} h={560} lt={lt} at={cUntil} fx="zoom" />
        <Pic slot="bed_strong" label="Strong seedlings, ready to move" x={40} y={60} w={880} h={560} lt={lt} at={cStrong} fx="zoom" />
        <Badge text="NURSERY BED" x={60} y={80} lt={lt} at={cBed} size={34} />
        <NurseryBed x={40} y={640} w={880} h={260} lt={lt} at={cPatch} seedAt={cSown} waterAt={cWater} shadeAt={cShade} weedAt={cProt} growA={cWater + 0.3} growB={cStrong + 0.6} />
        <Compare x={950} y={60} w={450} h={270} lt={lt} at={cSchool} kind="kids" label="Nursery school" />
        <Compare x={950} y={350} w={450} h={270} lt={lt} at={cBaby} kind="plants" label="Nursery bed" />
        <Card x={950} y={640} w={450} h={260} lt={lt} at={cWater - 0.1} pad={24}>
          {[["✓ waters", cWater], ["✓ shades", cShade], ["✓ protects", cProt]].map(([t, a], i) => <div key={t} style={{ opacity: out3(lt, a, 0.4), fontFamily: SANS, fontWeight: 700, fontSize: 38, lineHeight: 1.26, color: i === 2 ? SK.gold : SK.white }}>{t}</div>)}
        </Card>
        <Chip text="STRONG → main field" x={480} y={648} lt={lt} at={cMove} tone="gold" size={30} />
        <Halves lt={lt} steps={false} start at={cBed} />
      </Scene>
    );
  };
}
function B6(ctx) {
  const Half = ({ lt, x, title, tone, seq, at }) => <React.Fragment>
    <Badge text={title} x={x} y={60} lt={lt} at={at} size={32} />
    {seq.map(([slot, lab, a, tag]) => <React.Fragment key={slot}>
      <Pic slot={slot} label={lab} x={x} y={130} w={660} h={370} lt={lt} at={a} fx="zoom" />
      <Chip text={tag} x={x + 330} y={444} lt={lt} at={a + 0.15} out={seq[seq.findIndex((q) => q[0] === slot) + 1] ? seq[seq.findIndex((q) => q[0] === slot) + 1][2] : null} size={26} />
    </React.Fragment>)}
  </React.Fragment>;
  return ({ localTime: lt, duration }) => {
    const cTwo = S("b6", 0), cNF = S("b6", 1), cNur = W("b6", "nursery", 1), cHeal = W("b6", "healthiest"), cTrans = W("b6", "transplanted"), cRice = W("b6", "rice"), cTom = W("b6", "tomato"), cChi = W("b6", "chilli"),
      cSD = S("b6", 3), cStr = W("b6", "straight"), cPrep = W("b6", "prepared"), cWh = W("b6", "wheat"), cMz = W("b6", "maize"), cPu = W("b6", "pulses");
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[6]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(6, ctx, [L("NURSERY FIRST", cNF, "head"), L("Raise seedlings, then TRANSPLANT", cNur), L("e.g. rice, tomato, chilli", cRice, "sub"), L("SOW DIRECTLY", cSD, "head"), L("Seeds go straight into the field", cStr), L("e.g. wheat, maize, pulses", cWh, "sub")], { max: 7 })}>
        <Half lt={lt} x={40} title="1 · NURSERY FIRST" at={cNF} seq={[["bed_strong", "Strong seedlings in the nursery", cNF, "seeds grow up in the nursery"], ["pull_seedlings", "Healthy seedlings pulled from the nursery", cHeal, "healthy seedlings pulled"],
          ["seedling_bundles", "Seedlings tied in bundles", cTrans - 0.5, "tied in bundles"], ["transplant_field", "Transplanting by hand into a flooded field", cTrans + 0.9, "TRANSPLANTED by hand"]]} />
        <Half lt={lt} x={740} title="2 · SOW DIRECTLY" at={cSD} seq={[["sow_scatter", "Scattering seeds straight into a prepared field", cSD, "scattered by hand"], ["seed_drill", "A seed drill sows straight into the prepared field", cPrep, "or sown by a drill"], ["rows", "Young plants coming up where they were sown", cWh - 0.3, "they sprout where they fall"]]} />
        <Route x={40} y={520} w={660} h={170} lt={lt} ats={[cNF, cNur, cTrans]} />
        <Route x={740} y={520} w={660} h={170} lt={lt} ats={[cSD, cStr]} direct />
        {[["rice", cRice, 150], ["tomato", cTom, 370], ["chilli", cChi, 590]].map(([t, a, x]) => <Chip key={t} text={t} x={x} y={716} lt={lt} at={a} tone="gold" size={36} />)}
        {[["wheat", cWh, 850], ["maize", cMz, 1070], ["pulses", cPu, 1290]].map(([t, a, x]) => <Chip key={t} text={t} x={x} y={716} lt={lt} at={a} tone="gold" size={36} />)}
        <Big x={40} y={380} w={1360} lt={lt} at={cTwo} out={cNF} size={72} align="center">TWO ways to sow</Big>
        <Halves lt={lt} steps={false} start />
      </Scene>
    );
  };
}
function B7(ctx) {
  const cx = 720, cy = 475, items = [["crop", 720, 150, "Crop", <IconPacket />], ["soil", 1160, 340, "Soil", <IconSoil />], ["climate", 1010, 690, "Climate", <IconClimate />], ["water", 430, 690, "Water available", <IconDrop />], ["method", 280, 340, "Farming method", <IconPlough />]];
  return ({ localTime: lt, duration }) => {
    const cQ = S("b7", 0), cDep = W("b7", "depends"), ats = items.map((it) => W("b7", it[0]));
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[7]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(7, ctx, items.map((it, i) => L(it[3], ats[i])))}>
        <SVG op={1}>{items.map(([k, x, y], i) => <line key={k} x1={cx} y1={cy} x2={x} y2={y} stroke={SK.gold} strokeWidth={4} strokeDasharray="4 12" strokeLinecap="round" opacity={out3(lt, ats[i], 0.4)} />)}</SVG>
        <Pic slot="farmer_think" label="A farmer stops to think" x={cx - 170} y={cy - 170} w={340} h={340} r={170} lt={lt} at={0.2} fx="zoom" pos="center top" />
        <SVG op={1}>{items.map(([k, x, y, , ic], i) => <IconBubble key={k} cx={x} cy={y} lt={lt} at={ats[i]} kind={ic} />)}</SVG>
        {items.map(([k, x, y, lab], i) => <Chip key={k} text={lab} x={x} y={y + 90} lt={lt} at={ats[i] + 0.1} size={30} tone={i === 0 ? "gold" : "cream"} />)}
        <Big x={60} y={76} w={460} lt={lt} at={cQ} out={cDep} size={46}>So which way is better?</Big>
        <Badge text="It DEPENDS!" x={60} y={84} lt={lt} at={cDep} size={40} />
        <Halves lt={lt} steps={false} start />
      </Scene>
    );
  };
}
function B8(ctx) {
  return ({ localTime: lt, duration }) => {
    const cTurn = S("b8", 0), cRice = W("b8", "rice"), cWheat = W("b8", "wheat"), s = stopFor("b8"), stop = stopAt("b8", s[1]);
    const q = 1 + 0.08 * Math.sin(lt * 4) * reveal(lt, stop, 0.3);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[8]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(8, ctx, [L("Rice → ?", cRice, "big"), L("Wheat → ?", cWheat, "big"), L("Nursery first, or sow directly?", cRice + 0.5, "think")])}>
        <Pic slot="card_rice" label="A rice seedling in a flooded field" x={40} y={310} w={660} h={480} lt={lt} at={cRice - 0.2} fx="zoom" />
        <Pic slot="card_wheat" label="A wheat grain dropped into dry soil" x={740} y={310} w={660} h={480} lt={lt} at={cWheat - 0.2} fx="zoom" />
        {[["RICE", 40, cRice], ["WHEAT", 740, cWheat]].map(([t, x, a]) => { const o = pop(lt, a, 0.5); if (o <= 0) return null;
          return <div key={t} style={{ position: "absolute", left: x + 20, top: 700, width: 620, height: 72, borderRadius: 14, background: "rgba(5,30,22,0.85)", opacity: clamp(o, 0, 1), display: "flex", alignItems: "center", justifyContent: "center", gap: 18, fontFamily: SERIF, fontWeight: 700, fontSize: 46, color: SK.white }}>
            {t} → <span style={{ color: SK.gold, display: "inline-block", transform: `scale(${q})` }}>?</span></div>; })}
        <Chip text="Your turn!" x={720} y={120} lt={lt} at={cTurn} out={stop} tone="gold" size={44} />
        <StopBar lt={lt} b="b8" x={40} y={60} w={1360} h={230} heading="SORT IT" size={40}>Nursery first, or sow directly?</StopBar>
        <Halves lt={lt} steps={false} start />
      </Scene>
    );
  };
}
function B9(ctx) {
  return ({ localTime: lt, duration }) => {
    const cDyk = S("b9", 0), cSpec = S("b9", 1), cIn = W("b9", "india"), cNag = W("b9", "nagaland"), cSik = W("b9", "sikkim"), cUtt = W("b9", "uttarakhand"), cPh = W("b9", "philippines"), cBan = W("b9", "banaue"),
      cTwoK = W("b9", "two"), cUn = W("b9", "unesco"), cCh = W("b9", "china's"), cYu = W("b9", "yuanyang"), cHani = W("b9", "hani"), cMir = W("b9", "mirrors"), cWon = S("b9", 5), cOne = W("b9", "one"), cHun = W("b9", "hundreds");
    const flip = 1 - reveal(lt, cSpec + 0.8, 0.5);
    const sheen = clamp((lt - cMir) / 2.2, 0, 1);
    const P = { x: 40, y: 60, w: 1360, h: 840, lt, fx: "pan", kenDur: 8 };
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[9]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(9, ctx, [L("India: Nagaland, Sikkim, Uttarakhand", cIn), L("Philippines: Cordillera rice terraces, UNESCO World Heritage Site, about 2,000 years old", cPh), L("China: Yuanyang terraces (UNESCO), built by the Hani people over about 1,300 years", cCh),
          L("One tiny nursery bed → HUNDREDS of seedlings", cOne, "big")], { max: 3 })}>
        <Pic slot="terrace_rice" label="Green rice growing on terraces" {...P} at={0.1} dim={0.45} />
        <Pic slot="dyk_nagaland" label="Rice terraces in Nagaland" {...P} at={cNag - 0.3} />
        <Pic slot="dyk_sikkim" label="Rice terraces in Sikkim" {...P} at={cSik - 0.2} />
        <Pic slot="dyk_uttarakhand" label="Terraced fields in Uttarakhand" {...P} at={cUtt - 0.2} />
        <Pic slot="dyk_banaue" label="Ancient rice terraces in the mountains around Banaue" {...P} at={cPh - 0.1} />
        <Pic slot="dyk_yuanyang" label="Yuanyang terraces filled with water at sunrise" {...P} at={cCh - 0.1} />
        {sheen > 0 && sheen < 1 && lt < cWon && <div style={{ position: "absolute", left: 40, top: 60, width: 1360, height: 840, borderRadius: 18, overflow: "hidden", pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: -120, left: lerp(-500, 1500, sheen), width: 260, height: 1100, background: "rgba(255,255,255,0.32)", transform: "rotate(16deg)" }} /></div>}
        <Pic slot="dyk_hundreds" label="One tiny nursery bed, hundreds of seedlings" {...P} at={cWon - 0.1} fx="zoom" zoom={1.25} />
        <Chip text="the world's most SPECTACULAR farms" x={720} y={760} lt={lt} at={cSpec + 0.8} out={cIn} size={36} tone="gold" />
        {[["INDIA", cIn, cPh], ["PHILIPPINES", cPh, cCh], ["CHINA", cCh, cWon]].map(([t, a, o]) => <Chip key={t} text={t} x={80} y={84} anchor="left" lt={lt} at={a} out={o} tone="gold" size={36} />)}
        {[["Nagaland", cNag, cSik], ["Sikkim", cSik, cUtt], ["Uttarakhand", cUtt, cPh]].map(([t, a, o]) => <Chip key={t} text={t} x={720} y={770} lt={lt} at={a} out={o} size={36} />)}
        <Chip text="around Banaue" x={720} y={770} lt={lt} at={cBan} out={cTwoK} size={36} />
        <Chip text="about 2,000 years ago" x={720} y={770} lt={lt} at={cTwoK} out={cUn} size={36} tone="gold" />
        <Chip text="UNESCO World Heritage Site" x={720} y={770} lt={lt} at={cUn} out={cCh} size={36} tone="gold" />
        <Chip text="Yuanyang terraces, Yunnan" x={720} y={770} lt={lt} at={cYu} out={cHani} size={36} />
        <Chip text="built by the Hani people" x={720} y={770} lt={lt} at={cHani} out={cMir} size={36} />
        <Chip text="shining like giant MIRRORS" x={720} y={770} lt={lt} at={cMir} out={cWon} size={36} tone="gold" />
        <Chip text="1 tiny nursery bed → HUNDREDS of young plants" x={720} y={770} lt={lt} at={cHun} tone="gold" size={36} />
        <div style={{ position: "absolute", inset: 0, opacity: flip, pointerEvents: "none" }}>
          <Flip x={420} y={280} w={600} h={300} lt={lt} at={cDyk} q="DID YOU KNOW?" size={62} />
        </div>
        <Halves lt={lt} steps start />
      </Scene>
    );
  };
}
function B10(ctx) {
  return ({ localTime: lt, duration }) => {
    const cBig = S("b10", 0), cFlat = S("b10", 1), cSmart = W("b10", "smart"), cProd = W("b10", "productive"), cStart = S("b10", 3);
    const m = drive(lt, cSmart, cSmart + 1.4);       // the split closes into one wide shot
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[10]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(10, ctx, [L("No perfectly flat land? No problem!", cFlat, "big"), L("STEPS for slopes", cSmart), L("+ a good START for seeds", cStart)])}>
        <Pic slot="hill_farm" label="A thriving hill farm" x={40} y={60} w={1360} h={840} lt={lt} at={cSmart + 0.4} dur={1.2} fx="zoom" zoom={1.1} />
        <Pic slot="terrace_rice" label="Green rice growing on terraces" x={lerp(40, 200, m)} y={60} w={670} h={840} lt={lt} at={0.1} out={cSmart + 0.4} outDur={1.0} fx="zoom" />
        <Pic slot="bed_carpet" label="A carpet of tiny green seedlings" x={lerp(730, 570, m)} y={60} w={670} h={840} lt={lt} at={0.3} out={cSmart + 0.4} outDur={1.0} fx="zoom" />
        <Badge text="STEPS" x={70} y={90} lt={lt} at={cBig} op={1 - m} size={40} />
        <Badge text="START" x={760} y={90} lt={lt} at={cBig + 0.3} op={1 - m} size={40} />
        <div style={{ position: "absolute", left: 40, top: 500, width: 1360, textAlign: "center", opacity: out3(lt, cFlat, 0.6) * (1 - m) }}>
          <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 56, color: SK.white, background: "rgba(5,30,22,0.8)", padding: "14px 34px", borderRadius: 16 }}>No perfectly flat land? No problem!</span></div>
        <Chip text="steep slopes → productive farms" x={720} y={700} lt={lt} at={cProd} tone="gold" size={38} />
        <div style={{ position: "absolute", left: 40, top: 770, width: 1360, display: "flex", justifyContent: "center", opacity: clamp(pop(lt, cStart, 0.6), 0, 1) }}>
          <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 44, color: SK.ink, background: SK.gold, padding: "8px 30px", borderRadius: 14 }}>STEPS for slopes + a good START for seeds</span></div>
        <Halves lt={lt} steps start />
      </Scene>
    );
  };
}
function B11(ctx) {
  const rows = [["Step-like platforms on hills are called?", "TERRACES"], ["Where are seedlings raised before transplanting?", "A NURSERY BED"], ["Seeds planted straight into the field: which method?", "SOW DIRECTLY"]];
  return ({ localTime: lt, duration }) => {
    const qs = [S("b11", 1), S("b11", 2), S("b11", 3)], s = stopFor("b11"), stop = stopAt("b11", s[1]), ans = [S("b11", 4), S("b11", 5), S("b11", 6)], cLast = S("b11", 7);
    const holdOp = windowOp(lt, stop, stop + s[2], 0.3);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[11]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(11, ctx, [L("1. Step-like platforms on hills are called?", qs[0]), L("2. Where are seedlings raised before transplanting?", qs[1]), L("3. Seeds planted straight into the field: which method?", qs[2])])}>
        <Pic slot="hill_farm" label="A thriving hill farm" x={40} y={60} w={1360} h={840} lt={lt} at={0} dur={0.4} fx="zoom" />
        <div style={{ position: "absolute", left: 40, top: 60, width: 1360, height: 840, borderRadius: 18, background: "rgba(5,30,22,0.8)", boxShadow: "0 0 0 3px rgba(226,176,76,0.9)", opacity: out3(lt, 0.2, 0.5) }} />
        <div style={{ position: "absolute", left: 90, top: 90, display: "flex", alignItems: "center", gap: 18, opacity: out3(lt, S("b11", 0), 0.5) }}>
          <PauseIcon s={64} /><div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 32, letterSpacing: "0.08em", color: SK.ink, background: SK.gold, padding: "8px 26px", borderRadius: 12 }}>QUICK CHECK</div></div>
        <div style={{ position: "absolute", left: 620, top: 112, fontFamily: SANS, fontSize: 26, color: SK.dim, opacity: holdOp }}>Stop 3 of 3</div>
        {rows.map(([q, a], i) => { const y = 190 + i * 185, o = out3(lt, qs[i], 0.5), ao = pop(lt, ans[i], 0.5); if (o <= 0) return null;
          return <div key={i} style={{ position: "absolute", left: 90, top: y, width: 1270, opacity: o, transform: `translateY(${(1 - o) * 12}px)` }}>
            <div style={{ display: "flex", gap: 20, alignItems: "baseline", fontFamily: SERIF, fontWeight: 700, fontSize: 44, lineHeight: 1.18, color: SK.white, whiteSpace: "nowrap" }}><span style={{ color: SK.gold }}>{i + 1}</span><span>{q}</span></div>
            {ao > 0 && <div style={{ display: "inline-block", marginLeft: 44, marginTop: 14, opacity: clamp(ao, 0, 1), transform: `scale(${0.8 + 0.2 * ao})`, transformOrigin: "left center", fontFamily: SANS, fontWeight: 700, fontSize: 42, color: SK.ink, background: SK.gold, padding: "4px 28px", borderRadius: 12 }}>{a}</div>}
          </div>; })}
        <Big x={40} y={760} w={1360} lt={lt} at={cLast} size={54} align="center"><span style={{ color: SK.gold }}>Making EVERY piece of land count!</span></Big>
        <Halves lt={lt} steps start />
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
const COLLAGE = [{ slot: "soil_erosion", x: -60, y: -40, w: 760, h: 520, ph: 0 }, { slot: "village_hill", x: 640, y: -80, w: 760, h: 520, ph: 2 },
  { slot: "paddy_flooded", x: -80, y: 520, w: 700, h: 560, ph: 4 }, { slot: "seed_drill", x: 560, y: 560, w: 820, h: 560, ph: 1 }];
function Lp24Scenes(props = {}) {
  const caps = props.showCaptions === "false" ? false : props.showCaptions !== false;
  const titles = {};
  for (let n = 1; n <= NB; n++) titles[n] = str(props["title" + n + "Text"], TITLES[n]);
  const ctx = { caps, titles, capSize: num(props.captionSize, 34) };
  const B = [B1, B2, B3, B4, B5, B6, B7, B8, B9, B10, B11];
  const beats = B.map((Bn, i) => { const t = BEAT("b" + (i + 1)); return [t.start, t.start + t.dur, Bn]; });
  return (
    <StoryFrame props={props} dur={DUR} persistKey="thinkpro-lp24-farming-on-slopes-and-nursery-beds" collage={COLLAGE}>
      {beats.map(([s, e, Bn], i) => (
        <Sprite key={i} start={s} end={e}>{Bn(ctx)}</Sprite>
      ))}
      {STOPS.map(([b, i, hold]) => <StopAt key={b} t={BEAT(b).start + stopAt(b, i)} hold={hold - 0.2} />)}
      <ChimeAt t={BEAT("b9").start + S("b9", 0, 0)} />
      <AudioSync />
    </StoryFrame>
  );
}
window.Lp24Scenes = Lp24Scenes;
