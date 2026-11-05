/* global React, window */
// ThinkPro Academy — "Types of Seeds: Monocots and Dicots" (Grade 6 Agriculture, Session 27, V1).
// After AG_G6_S27 Video Script (Subrata, 5 Nov 2026): 11 script scenes as 11 voiced beats, three presenter stops
// (TPStory.StopAt: the web player freezes, the export holds the card), one Did-you-know card (b9, chime).
// Running idea: Seed Detectives. Central model: the CLUE BOARD at the foot of the panel, which fills cell by
// cell (b2–b4) and becomes the big table in b8. Veins and seeds are DRAWN, so they can light up and split.
// STORY STYLE (engine/story-kit.jsx). Pure function of time.
const { Sprite } = window;
const { reveal, windowOp } = window.TPMotion;
const { num, str } = window.TPStage;
const { SK, SERIF, SANS, LEFT_W, pop, out3, lerp, drive,
  Pic, Chip, Badge, Big, Card, SVG, Arrow, T, ChimeAt, Scene, StoryFrame, StopAt, Break } = window.TPStory;

// ---- Timing: EVERYTHING is keyed to the narration (tools/fit_timing.py → timing.js).
const TM = window.TP_TIMING;
if (!TM) console.error("timing.js missing — run: python3 tools/fit_timing.py videos/lp27-types-of-seeds-monocots-and-dicots");
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
const TITLES = { 1: "LP27 – Types of Seeds: Monocots and Dicots", 2: "Clue 1: Cotyledons", 3: "Monocots", 4: "Dicots", 5: "Look around", 6: "The experiment",
  7: "What we find", 8: "Clue board", 9: "Did you know?", 10: "The big idea", 11: "Quick check" };
const KICK = "Grade 6 · Agriculture · Session 27";
const KICKS = { 5: "Seed Detectives", 6: "Seed Detectives", 7: "Seed Detectives", 8: "Seed Detectives", 9: "Seed Detectives", 10: "Seed Detectives", 11: "Seed Detectives" };
const panel = (n, ctx, lines, extra = {}) => ({ kicker: KICKS[n] || KICK, title: ctx.titles[n], lines, ...extra });
const L = (text, at, kind = "item", extra = {}) => ({ text, at, kind, ...extra });

// ---- Presenter stops: [beat, sentence index whose pauseAfter is the hold, hold s]
const STOPS = [["b5", 3, 5.0], ["b6", 4, 5.0], ["b11", 3, 6.0]];
const stopAt = (b, i) => SE(b, i) + 0.1;                       // beat-local start of the hold
const stopFor = (b) => STOPS.find((s) => s[0] === b);
// The kit's StopCard fills the photo area. These stops freeze ON a picture (the two leaves, the knife
// over the seeds), so this is a low band that leaves the picture in view.
function StopBand({ lt, b, heading, children, y = 670, h = 280 }) {
  const s = stopFor(b), at = stopAt(b, s[1]), hold = s[2] - 0.2, n = STOPS.indexOf(s) + 1;
  const o = windowOp(lt, at, at + hold + 0.4, 0.35); if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 40, top: y, width: LEFT_W - 80, height: h, borderRadius: 24, background: "rgba(5,30,22,0.92)", opacity: o, zIndex: 3,
      boxShadow: "0 0 0 3px rgba(226,176,76,0.9)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 50px", boxSizing: "border-box", textAlign: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <svg width="54" height="54" viewBox="0 0 90 90"><circle cx="45" cy="45" r="43" fill={SK.gold} /><rect x="28" y="24" width="12" height="42" rx="4" fill={SK.ink} /><rect x="50" y="24" width="12" height="42" rx="4" fill={SK.ink} /></svg>
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 28, letterSpacing: "0.08em", color: SK.ink, background: SK.gold, padding: "7px 24px", borderRadius: 12 }}>{heading}</div>
      </div>
      <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 46, lineHeight: 1.18, color: SK.white, marginTop: 20 }}>{children}</div>
      <div style={{ fontFamily: SANS, fontSize: 24, color: SK.dim, marginTop: 14 }}>Stop {n} of {STOPS.length} · press play to continue</div>
    </div>
  );
}

// ---- Shared pieces ---------------------------------------------------------------
const MONO_C = "#2F6FB3", DI_C = "#B3541E", RED = "#B3261E";
function Show({ lt, a, b = 1e9, f = 0.4, children }) {
  const o = windowOp(lt, a, b, f); if (o <= 0) return null;
  return <div style={{ position: "absolute", inset: 0, opacity: o }}>{children}</div>;
}
// A rubber stamp landing: big and light → pressed down with a small overshoot.
function Stamp({ text, x, y, lt, at, rot = -7, size = 74, out = null }) {
  const p = reveal(lt, at, 0.32); if (p <= 0) return null;
  const o = Math.min(1, p * 2.2) * (out != null ? 1 - reveal(lt, out, 0.4) : 1); if (o <= 0) return null;
  const sc = 1.9 - 0.9 * Math.pow(p, 3), kick = 0.05 * Math.sin(Math.PI * clamp((lt - at - 0.32) / 0.22, 0, 1));
  return <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${sc + kick})`, opacity: o, zIndex: 4, fontFamily: SERIF, fontWeight: 700, fontSize: size,
    letterSpacing: "0.08em", color: RED, background: "rgba(246,241,227,0.94)", border: `8px solid ${RED}`, borderRadius: 14, padding: "6px 34px", whiteSpace: "nowrap", boxShadow: "0 8px 24px rgba(0,0,0,0.35)" }}>{text}</div>;
}
// Group tag: blue MONOCOT / rust DICOT, used everywhere the group is named.
function Group({ kind, x, y, lt, at, size = 34, out = null, anchor = "left", text }) {
  const o = pop(lt, at, 0.5) * (out != null ? 1 - reveal(lt, out, 0.4) : 1); if (o <= 0) return null;
  return <div style={{ position: "absolute", left: x, top: y, transform: `translateX(${anchor === "center" ? "-50%" : "0"}) scale(${0.85 + 0.15 * o})`, transformOrigin: "left top", opacity: o, fontFamily: SANS, fontWeight: 700,
    fontSize: size, letterSpacing: "0.08em", color: SK.white, background: kind === "mono" ? MONO_C : DI_C, padding: "6px 22px", borderRadius: 10, whiteSpace: "nowrap", boxShadow: "0 3px 12px rgba(0,0,0,0.35)" }}>{text || (kind === "mono" ? "MONOCOT" : "DICOT")}</div>;
}
// The clue board: the running idea. It sits at the foot of the cream panel and fills in as the video goes on.
// f = { c1m, c1d, c2m, c2d, c3m, c3d }: beat-local time each cell fills (-99 = already filled).
const ALLCLUES = { c1m: -99, c1d: -99, c2m: -99, c2d: -99, c3m: -99, c3d: -99 };
function ClueBoard({ lt, f = {}, at = -99 }) {
  const o = out3(lt, at, 0.5); if (o <= 0) return null;
  const rows = [["Cotyledons", "1", "2", "c1"], ["Leaf shape", "narrow", "broad", "c2"], ["Veins", "parallel", "net-like", "c3"]];
  const cell = (txt, when, color) => { const p = when == null ? 0 : pop(lt, when, 0.45);
    return <div style={{ flex: 1, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 23, color, opacity: clamp(p, 0, 1), transform: `scale(${0.7 + 0.3 * p})` }}>{txt}</div>; };
  return (
    <div style={{ position: "absolute", left: 1476, top: 668, width: 408, height: 256, borderRadius: 14, background: SK.bg0, opacity: o, boxSizing: "border-box", padding: "10px 14px", boxShadow: `0 0 0 3px ${SK.gold}` }}>
      <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 25, letterSpacing: "0.1em", color: SK.gold, textAlign: "center" }}>CLUE BOARD</div>
      <div style={{ display: "flex", marginTop: 6, paddingLeft: 128 }}>
        <div style={{ flex: 1, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 21, color: "#9CC6F2" }}>MONOCOT</div>
        <div style={{ flex: 1, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 21, color: "#F2B48C" }}>DICOT</div>
      </div>
      {rows.map(([name, m, d, k]) => (
        <div key={k} style={{ display: "flex", alignItems: "center", height: 49, borderTop: "1px solid rgba(255,255,255,0.22)" }}>
          <div style={{ width: 128, flex: "none", fontFamily: SANS, fontSize: 21, color: SK.dim }}>{name}</div>
          {cell(m, f[k + "m"], SK.white)}{cell(d, f[k + "d"], SK.white)}
        </div>))}
    </div>
  );
}
const pathOf = (pts, close) => "M" + pts.map((p) => p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" L ") + (close ? " Z" : "");
// A stroke that draws itself. p 0..1. Lit gold with a soft wider stroke under it.
function Draw({ d, p, color = SK.gold, sw = 4, glow = true }) {
  if (p <= 0) return null;
  return <g>
    {glow && <path d={d} pathLength="1" strokeDasharray={`${p} 1.02`} stroke={color} strokeOpacity="0.3" strokeWidth={sw * 2.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />}
    <path d={d} pathLength="1" strokeDasharray={`${p} 1.02`} stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </g>;
}
// Monocot leaf, base at the foot, tip at the top. W = half-width. The veins follow the blade, side by side, and stop short of each other.
function MonoLeaf({ cx, top, h, W: hwMax, p = 0, op = 1, fill = "#3C9450" }) {
  if (op <= 0) return null;
  const hw = (t) => hwMax * Math.pow(Math.min(1, t / 0.14), 0.6) * Math.pow(1 - Math.pow(t, 6), 0.75);
  const Y = (t) => top + h - t * h, ts = Array.from({ length: 61 }, (_, i) => i / 60);
  const out = [...ts.map((t) => [cx - hw(t), Y(t)]), ...ts.slice().reverse().map((t) => [cx + hw(t), Y(t)])];
  const ks = [-0.76, -0.51, -0.26, 0, 0.26, 0.51, 0.76];
  return <g opacity={op}>
    <rect x={cx - hwMax * 0.28} y={top + h - 6} width={hwMax * 0.56} height={46} rx={6} fill="#2C7A40" />
    <path d={pathOf(out, true)} fill={fill} stroke="#2C7A40" strokeWidth="3" />
    {ks.map((k, i) => { const end = 0.95 - 0.09 * Math.abs(k); const pts = ts.filter((t) => t >= 0.03 && t <= end).map((t) => [cx + k * hw(t), Y(t)]);
      return <g key={i}><path d={pathOf(pts)} stroke="#7CC47F" strokeWidth={k === 0 ? 4 : 2.5} fill="none" /><Draw d={pathOf(pts)} p={clamp(p * 1.25 - 0.25 * rnd(i + 3), 0, 1)} sw={k === 0 ? 6 : 4} /></g>; })}
  </g>;
}
// Dicot leaf geometry: midrib, side veins, ties between them, finer ties between those (the net).
function diGeom(cx, top, h, hwMax) {
  const Y = (t) => top + h - t * h, hw = (t) => hwMax * Math.pow(Math.max(0, Math.sin(Math.PI * Math.pow(t, 0.72))), 0.8);
  const ts = Array.from({ length: 61 }, (_, i) => i / 60);
  const outline = [...ts.map((t) => [cx - hw(t), Y(t)]), ...ts.slice().reverse().map((t) => [cx + hw(t), Y(t)])];
  const mid = ts.filter((t) => t <= 0.97).map((t) => [cx, Y(t)]);
  const sides = {}, ties = [], fine = [], routes = [];
  [-1, 1].forEach((sd) => {
    const vs = [];
    for (let j = 0; j < 7; j++) {
      const t0 = 0.08 + 0.115 * j, tm = Math.min(t0 + 0.17, 0.96), ex = cx + sd * 0.93 * hw(tm), ey = Y(tm), qx = cx + sd * 0.5 * hw(tm), qy = Y(t0 + 0.035);
      const v = Array.from({ length: 13 }, (_, i) => { const u = i / 12; return [(1 - u) * (1 - u) * cx + 2 * u * (1 - u) * qx + u * u * ex, (1 - u) * (1 - u) * Y(t0) + 2 * u * (1 - u) * qy + u * u * ey]; });
      vs.push(v); routes.push([...mid.filter((m) => m[1] >= Y(t0)), ...v]);
    }
    sides[sd] = vs;
    for (let j = 0; j < 6; j++) {
      const ms = [0.3, 0.52, 0.74].map((f, k) => { const i = Math.round(f * 12), A = vs[j][i], B = vs[j + 1][i], sn = rnd(j * 7 + k + sd * 3);
        const M = [(A[0] + B[0]) / 2 + (sn - 0.5) * 16, (A[1] + B[1]) / 2 + (rnd(j + k * 5 + sd) - 0.5) * 12]; ties.push([A, M, B]); return M; });
      for (let k = 0; k < 2; k++) { const A = ms[k], B = ms[k + 1], M = [(A[0] + B[0]) / 2 + (rnd(j + k * 3) - 0.5) * 14, (A[1] + B[1]) / 2 + (rnd(k + j * 9) - 0.5) * 14]; fine.push([A, M, B]); }
    }
  });
  return { outline, mid, sides: [...sides[-1], ...sides[1]], ties, fine, routes };
}
function DiLeaf({ cx, top, h, W: hwMax, a = 0, b = 0, c = 0, d = 0, op = 1, fill = "#3C9450", flow = 0, lt = 0 }) {
  if (op <= 0) return null;
  const g = React.useMemo(() => diGeom(cx, top, h, hwMax), [cx, top, h, hwMax]);
  const R = (arr, stroke, sw) => arr.map((pts, i) => <path key={i} d={pathOf(pts)} stroke={stroke} strokeWidth={sw} fill="none" />);
  return <g opacity={op}>
    <rect x={cx - 6} y={top + h - 6} width={12} height={52} rx={5} fill="#2C7A40" />
    <path d={pathOf(g.outline, true)} fill={fill} stroke="#2C7A40" strokeWidth="3" />
    {R([g.mid], "#7CC47F", 5)}{R(g.sides, "#7CC47F", 3)}{R(g.ties, "#62B06A", 2)}{R(g.fine, "#62B06A", 1.5)}
    <Draw d={pathOf(g.mid)} p={a} sw={7} />
    {g.sides.map((pts, i) => <Draw key={i} d={pathOf(pts)} p={clamp(b * 1.3 - 0.3 * rnd(i), 0, 1)} sw={4.5} />)}
    {g.ties.map((pts, i) => <Draw key={i} d={pathOf(pts)} p={clamp(c * 1.3 - 0.3 * rnd(i + 2), 0, 1)} sw={2.6} glow={false} />)}
    {g.fine.map((pts, i) => <Draw key={i} d={pathOf(pts)} p={clamp(d * 1.3 - 0.3 * rnd(i + 5), 0, 1)} sw={2} glow={false} />)}
    {flow > 0 && <Flows routes={g.routes} lt={lt} op={flow} />}
  </g>;
}
// Dots running along the veins. Water and minerals travel out from the stalk; food travels back.
function Flows({ routes, lt, op }) {
  const at = (r, u) => { const f = clamp(u, 0, 0.9999) * (r.length - 1), i = Math.floor(f), k = f - i; return [lerp(r[i][0], r[i + 1][0], k), lerp(r[i][1], r[i + 1][1], k)]; };
  const kinds = [["#49B4F0", false], ["#A8743F", false], ["#B8F06E", true]], dots = [];
  for (let n = 0; n < 45; n++) { const r = routes[(n * 5) % routes.length], [c, back] = kinds[n % 3], ph = (lt * 0.2 + rnd(n) ) % 1, u = back ? 1 - ph : ph, [x, y] = at(r, u);
    dots.push(<circle key={n} cx={x} cy={y} r="8" fill={c} stroke="#fff" strokeWidth="1.5" opacity={op * clamp(Math.min(ph, 1 - ph) * 10, 0, 1)} />); }
  return <g>{dots}</g>;
}
// Whole dry or soaked bean (kidney). k = how plump.
const BEAN_D = "M-70 -10 C-70 -50 -20 -58 15 -50 C60 -42 80 -15 72 15 C65 48 25 55 0 40 C-12 32 -18 22 -32 26 C-55 33 -70 20 -70 -10 Z";
function Bean({ x, y, s = 1, rot = 0, k = 0, op = 1 }) {
  if (op <= 0) return null;
  const col = k > 0.5 ? "#A9574A" : "#8E3B2E";
  return <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={op}><path d={BEAN_D} fill={col} stroke="#5E241B" strokeWidth={3 / s} />
    <path d="M-14 26 C-8 30 -2 35 6 38" stroke="#F0E3C8" strokeWidth={5} strokeLinecap="round" fill="none" />
    <path d="M-42 -30 C-20 -44 10 -42 30 -34" stroke="rgba(255,255,255,0.25)" strokeWidth={6} strokeLinecap="round" fill="none" /></g>;
}
const MAIZE_D = "M-48 -60 C-20 -75 25 -75 50 -58 C62 -30 40 40 12 72 C5 78 -5 78 -12 72 C-40 40 -62 -30 -48 -60 Z";
function Maize({ x, y, s = 1, rot = 0, op = 1 }) {
  if (op <= 0) return null;
  return <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={op}><path d={MAIZE_D} fill="#E9B23C" stroke="#A9761A" strokeWidth={3 / s} />
    <ellipse cx="0" cy="20" rx="17" ry="36" fill="#F6DE93" /><path d="M-30 -52 C-10 -60 14 -60 32 -50" stroke="rgba(255,255,255,0.4)" strokeWidth={5} strokeLinecap="round" fill="none" /></g>;
}
// Round flat magnifying glass. Through the lens: the same photo, enlarged.
function Lens({ x, y, r = 130, mag = 1.7, slot, box, op = 1, angle = 40 }) {
  if (op <= 0) return null;
  const src = window.TPStory.photoSrc(slot), H = r * 1.5, a = angle * Math.PI / 180, x1 = x + (r + 8) * Math.cos(a), y1 = y + (r + 8) * Math.sin(a), x2 = x + (r + H) * Math.cos(a), y2 = y + (r + H) * Math.sin(a);
  return <div style={{ position: "absolute", inset: 0, opacity: op, zIndex: 2 }}>
    <SVG><line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#4A2E1B" strokeWidth="34" strokeLinecap="round" /><line x1={x1} y1={y1} x2={x1 + 0.3 * (x2 - x1)} y2={y1 + 0.3 * (y2 - y1)} stroke="#D9D2C0" strokeWidth="24" /></SVG>
    <div style={{ position: "absolute", left: x - r, top: y - r, width: 2 * r, height: 2 * r, borderRadius: "50%", overflow: "hidden", background: "rgba(255,255,255,0.14)", boxShadow: "0 0 0 12px #D9D2C0, 0 0 0 15px #4A2E1B, 0 10px 30px rgba(0,0,0,0.5)" }}>
      {src && <img src={src} alt="" style={{ position: "absolute", left: r - (x - box.x) * mag, top: r - (y - box.y) * mag, width: box.w * mag, height: box.h * mag, objectFit: "cover" }} />}
    </div>
  </div>;
}
// Three photos that open one by one and share the row (b3, b4, b9).
function Trio({ lt, y = 60, h = 840, items }) {
  const a = out3(lt, items[1].at, 0.7), b = out3(lt, items[2].at, 0.7), n = 1 + a + b, gap = 20, u = (1360 - (n - 1) * gap) / n;
  const x2 = 40 + u + gap * a, w2 = u * a, x3 = x2 + w2 + gap * b, w3 = u * b;
  const box = [[40, u], [x2, w2], [x3, w3]];
  return items.map((it, i) => box[i][1] < 4 ? null : <React.Fragment key={i}>
    <Pic slot={it.slot} label={it.label} x={box[i][0]} y={y} w={box[i][1]} h={h} lt={lt} at={it.first != null ? it.first : it.at} fx="zoom" />
    <Chip text={it.name} x={box[i][0] + box[i][1] / 2} y={y + h - 74} lt={lt} at={it.at + 0.15} size={36} /></React.Fragment>);
}

// ---- Beats -----------------------------------------------------------------------
function B1(ctx) {
  const box = { x: 40, y: 60, w: 1360, h: 860 };
  return ({ localTime: lt, duration }) => {
    const cNew = W("b1", "new"), cBean = W("b1", "bean"), cMaize = W("b1", "maize"), cBig = W("b1", "big"), cClue = W("b1", "clues");
    const lx = lt < cBean ? lerp(1250, 500, drive(lt, 0.3, cBean)) : lerp(500, 940, drive(lt, cMaize - 0.2, cMaize + 0.8));
    const ly = 430 + 26 * Math.sin(lt * 0.9);
    const photo = !!window.TPStory.photoSrc("case_seeds");
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[1]} showCaps={ctx.caps} capSize={ctx.capSize} fi={0.1}
        panel={panel(1, ctx, [L("Can we guess how many seed leaves a plant has?", 0.6, "head"), L("A BEAN and a MAIZE grain", cBean), L("Can a tiny seed give us CLUES?", cClue, "think")])}>
        <Pic slot="case_seeds" label="" x={box.x} y={box.y} w={box.w} h={box.h} lt={lt} at={0} fx="none" dur={0.5} />
        {!photo && <SVG><Bean x={500} y={430} s={1.3} rot={-8} /><Maize x={940} y={430} s={1.3} rot={8} /></SVG>}
        <Lens x={lx} y={ly} slot="case_seeds" box={box} op={out3(lt, 0.2, 0.5)} />
        <Stamp text="CASE FILE" x={1130} y={170} lt={lt} at={cNew} />
        <Chip text="BEAN" x={500} y={640} lt={lt} at={cBean + 0.1} size={38} />
        <Chip text="MAIZE" x={940} y={640} lt={lt} at={cMaize + 0.1} size={38} />
        <Card x={210} y={726} w={1020} h={112} lt={lt} at={cClue} />
        <Big x={40} y={748} w={1360} lt={lt} at={cClue} size={54} align="center">Can a tiny seed give us <span style={{ color: SK.gold }}>CLUES</span>?</Big>
      </Scene>
    );
  };
}
// Bean seedling in a cut-away of the soil. g 0..1 = growth, open 0..1 = seed leaves apart, lit 0..1 = glow.
function Seedling({ lt, g, open, lit, labelAt }) {
  const gy = 690, x = 370, rootL = 150 * clamp(g * 2, 0, 1), up = 330 * clamp((g - 0.2) / 0.8, 0, 1), arch = (1 - clamp((g - 0.55) / 0.4, 0, 1)) * 46;
  const seedY = gy + 80, topY = gy + 60 - up, ang = lerp(84, 22, open);
  const Coty = ({ sd }) => <g transform={`translate(${x} ${topY}) rotate(${sd * ang})`}>
    {lit > 0 && <ellipse cx={sd * 56} cy={-8} rx={78} ry={46} fill={SK.gold} opacity={0.45 * lit} />}
    <path d={`M0 0 C${sd * 20} -40 ${sd * 96} -44 ${sd * 118} -8 C${sd * 104} 24 ${sd * 30} 28 0 0 Z`} fill="#8CC96E" stroke="#4E8A3C" strokeWidth="3" /></g>;
  return <g>
    <rect x="40" y="60" width="660" height={gy - 60} fill="#CFE8F2" rx="18" />
    <rect x="40" y={gy} width="660" height="240" fill="#5C4A3E" />
    {[...Array(26)].map((_, i) => <circle key={i} cx={60 + rnd(i) * 620} cy={gy + 20 + rnd(i + 40) * 200} r={3 + rnd(i + 9) * 4} fill="#7A6352" />)}
    {g > 0.02 && <path d={`M${x} ${seedY + 14} C${x - 18} ${seedY + 60} ${x + 14} ${seedY + 90} ${x - 6} ${seedY + 14 + rootL}`} stroke="#EFE4CC" strokeWidth="7" strokeLinecap="round" fill="none" />}
    {g > 0.02 && [0.45, 0.7].map((k, i) => <path key={i} d={`M${x} ${seedY + 14 + rootL * k} l${(i ? -1 : 1) * 40 * clamp(g * 2 - 0.5, 0, 1)} 26`} stroke="#EFE4CC" strokeWidth="4" strokeLinecap="round" />)}
    {up > 0 && <path d={`M${x} ${seedY} C${x + arch} ${(seedY + topY) / 2} ${x + arch} ${topY + 40} ${x} ${topY}`} stroke="#6FAF55" strokeWidth="15" strokeLinecap="round" fill="none" />}
    {up > 0 && open > 0.25 && <path d={`M${x} ${topY} c-14 -34 -8 -58 0 -${34 + 44 * open} c8 ${16 + 20 * open} 14 ${34 + 12 * open} 0 ${34 + 44 * open}`} fill="#4FA64C" />}
    {up > 0 ? <g><Coty sd={-1} /><Coty sd={1} /></g> : <Bean x={x} y={seedY} s={0.7} />}
    {up > 0 && <Bean x={x} y={seedY} s={0.45} op={1 - g} />}
  </g>;
}
function B2(ctx) {
  return ({ localTime: lt, duration }) => {
    const cCot = W("b2", "cotyledons"), cSeed = W("b2", "seed"), cCount = W("b2", "count"), cMono = W("b2", "mono"), cDi = W("b2", "di"), cMs = W("b2", "monocots"), cDs = W("b2", "dicots");
    const g = drive(lt, 0.1, cSeed + 0.2), open = drive(lt, cCot, cSeed + 0.8), lit = reveal(lt, cSeed, 0.6);
    const Num = ({ x, word, n, kind, at, nameAt }) => { const o = pop(lt, at, 0.55); if (o <= 0) return null;
      return <div style={{ position: "absolute", left: x, top: 500, width: 310, height: 390, borderRadius: 20, background: kind === "mono" ? MONO_C : DI_C, opacity: clamp(o, 0, 1), transform: `scale(${0.85 + 0.15 * o})`, textAlign: "center", color: SK.white, boxShadow: "0 8px 22px rgba(0,0,0,0.3)" }}>
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 64, marginTop: 22 }}>{word}</div>
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 150, lineHeight: 1.05 }}>{n}</div>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 40, marginTop: 10, opacity: out3(lt, nameAt, 0.4) }}>{kind === "mono" ? "MONOCOTS" : "DICOTS"}</div>
      </div>; };
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[2]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(2, ctx, [L("COTYLEDONS = seed leaves", cSeed, "big"), L("MONO = ONE", cMono), L("DI = TWO", cDi), L("Flowering plants → MONOCOTS and DICOTS", cCount)], { max: 5 })}>
        <SVG><defs><clipPath id="s27soil"><rect x="40" y="60" width="660" height="870" rx="18" /></clipPath></defs>
          <g clipPath="url(#s27soil)"><Seedling lt={lt} g={g} open={open} lit={lit} /></g></SVG>
        <Chip text="COTYLEDONS" x={370} y={200} lt={lt} at={cCot + 0.2} tone="gold" size={38} />
        <Chip text="seed leaves" x={370} y={270} lt={lt} at={cSeed + 0.2} size={30} />
        <Pic slot="seedling_real" label="A real bean seedling" x={740} y={60} w={660} h={410} lt={lt} at={cSeed} fx="zoom" />
        <Num x={740} word="MONO" n="1" kind="mono" at={cMono} nameAt={cMs} />
        <Num x={1090} word="DI" n="2" kind="di" at={cDi} nameAt={cDs} />
        <ClueBoard lt={lt} f={{ c1m: cMono, c1d: cDi }} at={0.3} />
      </Scene>
    );
  };
}
function LeafStage({ lt, at, children }) {
  const o = out3(lt, at, 0.6); if (o <= 0) return null;
  return <div style={{ position: "absolute", inset: 0, opacity: o }}>{children}</div>;
}
function B3(ctx) {
  return ({ localTime: lt, duration }) => {
    const c1 = W("b3", "one"), cM = W("b3", "maize"), cR = W("b3", "rice"), cW = W("b3", "wheat"), cLook = W("b3", "look"), cLong = W("b3", "long"), cNar = W("b3", "narrow"), cVeins = W("b3", "veins"), cSide = W("b3", "side"), cRail = W("b3", "railway"), cPar = W("b3", "parallel");
    const v = drive(lt, cSide, cRail + 0.4);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[3]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(3, ctx, [L("ONE cotyledon", c1, "big"), L("e.g. MAIZE, RICE, WHEAT", cM), L("Leaves: long and NARROW", cLong), L("Veins: PARALLEL", cPar)])}>
        <Show lt={lt} a={-1} b={cLook + 0.3}>
          <Trio lt={lt} items={[{ slot: "field_maize", label: "A maize field", name: "Maize", at: cM, first: 0 }, { slot: "paddy_flooded", label: "A rice field", name: "Rice", at: cR }, { slot: "wheat_winter", label: "A wheat field", name: "Wheat", at: cW }]} />
          <Group kind="mono" x={70} y={90} lt={lt} at={0.1} size={44} text="MONOCOTS" />
          <Chip text="ONE seed leaf" x={380} y={96} lt={lt} at={c1} tone="gold" size={36} anchor="left" />
        </Show>
        <LeafStage lt={lt} at={cLook}>
          <Pic slot="maize_leaf" label="One long, narrow maize leaf" x={40} y={60} w={520} h={840} lt={lt} at={cLook} fx="zoom" pos="center" />
          <SVG><MonoLeaf cx={790} top={70} h={790} W={66} p={v} /></SVG>
          <Chip text="LONG" x={660} y={300} lt={lt} at={cLong} size={32} />
          <Chip text="NARROW" x={660} y={370} lt={lt} at={cNar} size={32} />
          <Pic slot="railway_tracks" label="Railway tracks" x={950} y={120} w={450} h={340} lt={lt} at={cRail} fx="pop" />
          <Chip text="like railway tracks" x={1175} y={480} lt={lt} at={cRail + 0.2} size={32} />
          <Chip text="PARALLEL veins" x={1175} y={570} lt={lt} at={cPar} tone="gold" size={42} />
          <Chip text="side by side, never meeting" x={1175} y={650} lt={lt} at={cSide} size={28} />
        </LeafStage>
        <ClueBoard lt={lt} f={{ c1m: -99, c1d: -99, c2m: cLong, c3m: cPar }} />
      </Scene>
    );
  };
}
function B4(ctx) {
  return ({ localTime: lt, duration }) => {
    const c2 = W("b4", "two"), cB = W("b4", "bean"), cP = W("b4", "pea"), cG = W("b4", "gram"), cHold = W("b4", "hold"), cOne = W("b4", "one"), cBr = W("b4", "branches"), cSm = W("b4", "smaller"), cSm2 = W("b4", "smaller", 1), cNet = W("b4", "fishing"), cNL = W("b4", "netlike");
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[4]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(4, ctx, [L("TWO cotyledons", c2, "big"), L("e.g. BEAN, PEA, GRAM", cB), L("Veins: BRANCHING, NET-LIKE", cNL)])}>
        <Show lt={lt} a={-1} b={cHold + 0.3}>
          <Trio lt={lt} items={[{ slot: "plant_bean", label: "A bean plant", name: "Bean", at: cB, first: 0 }, { slot: "plant_pea", label: "A pea plant", name: "Pea", at: cP }, { slot: "plant_gram", label: "A gram plant", name: "Gram", at: cG }]} />
          <Group kind="di" x={70} y={90} lt={lt} at={0.1} size={44} text="DICOTS" />
          <Chip text="TWO seed leaves" x={290} y={96} lt={lt} at={c2} tone="gold" size={36} anchor="left" />
        </Show>
        <LeafStage lt={lt} at={cHold}>
          <Pic slot="bean_leaf_light" label="A broad bean leaf held up to the light" x={40} y={60} w={520} h={840} lt={lt} at={cHold} fx="zoom" />
          <SVG><DiLeaf cx={785} top={120} h={700} W={205} a={drive(lt, cOne - 0.1, cBr + 0.2)} b={drive(lt, cBr, cSm + 0.3)} c={drive(lt, cSm, cSm2 + 0.3)} d={drive(lt, cSm2, cNet + 0.4)} /></SVG>
          <Chip text="one main vein" x={785} y={70} lt={lt} at={cOne} size={30} />
          <Pic slot="fishing_net" label="A fishing net" x={1010} y={120} w={390} h={340} lt={lt} at={cNet} fx="pop" />
          <Chip text="like a fishing net" x={1205} y={480} lt={lt} at={cNet + 0.2} size={32} />
          <Chip text="NET-LIKE veins" x={1205} y={570} lt={lt} at={cNL} tone="gold" size={42} />
        </LeafStage>
        <ClueBoard lt={lt} f={{ c1m: -99, c1d: -99, c2m: -99, c3m: -99, c2d: cHold, c3d: cNL }} />
      </Scene>
    );
  };
}
function B5(ctx) {
  return ({ localTime: lt, duration }) => {
    const cLook = W("b5", "look"), cPar = W("b5", "parallel"), cNet = W("b5", "netlike"), cQ = W("b5", "monocot");
    const s = 1 + 0.025 * Math.sin(Math.PI * reveal(lt, cPar, 0.7)), s2 = 1 + 0.025 * Math.sin(Math.PI * reveal(lt, cNet, 0.7));
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[5]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(5, ctx, [L("Find a leaf near you:", cLook, "head"), L("PARALLEL or NET-LIKE veins?", cPar), L("Monocot or dicot?", cQ, "think")])}>
        <Pic slot="railway_tracks" label="Railway tracks" x={250} y={70} w={450} h={330} lt={lt} at={0.2} fx="none" />
        <Pic slot="fishing_net" label="A fishing net" x={950} y={70} w={450} h={330} lt={lt} at={0.2} fx="none" />
        <div style={{ position: "absolute", left: 708, top: 60, width: 4, height: 590, background: SK.gold, opacity: 0.8 }} />
        <SVG>
          <g transform={`translate(140 360) scale(${s}) translate(-140 -360)`}><MonoLeaf cx={140} top={70} h={530} W={50} p={1} /></g>
          <g transform={`translate(830 360) scale(${s2}) translate(-830 -360)`}><DiLeaf cx={830} top={70} h={530} W={112} a={1} b={1} c={1} d={1} /></g>
        </SVG>
        <Chip text="PARALLEL" x={475} y={440} lt={lt} at={cPar} tone="gold" size={42} />
        <Chip text="NET-LIKE" x={1175} y={440} lt={lt} at={cNet} tone="gold" size={42} />
        <Group kind="mono" x={475} y={520} lt={lt} at={cQ} size={36} anchor="center" />
        <Group kind="di" x={1175} y={520} lt={lt} at={cQ + 0.2} size={36} anchor="center" />
        <StopBand lt={lt} b="b5" heading="LOOK AROUND">Find a leaf near you. Parallel or net-like veins?</StopBand>
        <ClueBoard lt={lt} f={ALLCLUES} />
      </Scene>
    );
  };
}
function Knife({ x, y, rot = 0, op = 1 }) {
  if (op <= 0) return null;
  return <g transform={`translate(${x} ${y}) rotate(${rot})`} opacity={op}>
    <path d="M-150 -6 L120 -6 C70 34 -80 40 -150 26 Z" fill="#C9D1D6" stroke="#7E8A90" strokeWidth="3" />
    <rect x="-280" y="-14" width="134" height="40" rx="12" fill="#4A2E1B" />
  </g>;
}
function B6(ctx) {
  return ({ localTime: lt, duration }) => {
    const cExp = W("b6", "experiment"), cSoak = W("b6", "soak"), cMz = W("b6", "maize"), cOver = W("b6", "overnight"), cMorn = W("b6", "morning"), cSplit = W("b6", "split"), cPred = W("b6", "predict"), cInside = W("b6", "inside");
    const night = reveal(lt, cOver - 0.2, 0.8) * (1 - reveal(lt, cMorn - 0.5, 0.9)), morn = reveal(lt, cMorn - 0.5, 0.9);
    const hex = (c) => [1, 3, 5].map((i) => parseInt(c.substr(i, 2), 16)), mix = (A, B, t) => A.map((v, i) => lerp(v, B[i], t));
    const sky = `rgb(${mix(mix(hex("#BFE0EC"), hex("#FFE3B0"), morn), hex("#12233F"), night).map(Math.round).join(",")})`;
    const moonP = clamp((lt - cOver) / Math.max(0.5, cMorn - 0.5 - cOver), 0, 1), mx = lerp(180, 1260, moonP), my = 240 - 130 * Math.sin(Math.PI * moonP);
    const place = out3(lt, cMorn, 1.0), plump = drive(lt, cOver, cMorn);
    const drop = (at) => { const p = clamp((lt - at) / 0.55, 0, 1); return lerp(30, 610, p * p); };
    const hover = reveal(lt, cSplit, 0.6);
    const by = (at) => lerp(drop(at), 430, place), ks = lerp(0.95 + 0.25 * plump, 2.5, place);
    const ring = (at, x) => { const p = clamp((lt - at - 0.55) / 0.8, 0, 1); if (p <= 0 || p >= 1) return null; return <ellipse cx={x} cy={566} rx={30 + 110 * p} ry={6 + 12 * p} stroke="#fff" strokeWidth="3" opacity={1 - p} fill="none" />; };
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[6]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(6, ctx, [L("Soak a bean and a maize grain OVERNIGHT", cSoak), L("PREDICT: what will we see inside?", cPred, "think")])}>
        <SVG><defs><clipPath id="s27exp"><rect x="40" y="60" width="1360" height="860" rx="18" /></clipPath></defs>
          <g clipPath="url(#s27exp)">
            <rect x="40" y="60" width="1360" height="860" fill={sky} />
            {night > 0 && [...Array(34)].map((_, i) => <circle key={i} cx={60 + rnd(i) * 1320} cy={80 + rnd(i + 50) * 420} r={2 + rnd(i + 20) * 3} fill="#fff" opacity={night * (0.5 + 0.5 * Math.sin(lt * 3 + i))} />)}
            {night > 0 && <g opacity={night} transform={`translate(${mx} ${my})`}><circle r="56" fill="#F6EFC8" /><circle cx="24" cy="-12" r="48" fill={sky} /></g>}
            {morn > 0 && <circle cx={1290} cy={lerp(420, 190, morn)} r="70" fill="#F7C24B" opacity={morn} />}
            <rect x="40" y="740" width="1360" height="200" fill="#8A5A36" /><rect x="40" y="740" width="1360" height="10" fill="#6E4527" />
            <g opacity={1 - place}>
              <path d="M450 540 L990 540 L930 722 Q926 736 910 736 L530 736 Q514 736 510 722 Z" fill="#C9D1D6" stroke="#7E8A90" strokeWidth="4" />
            </g>
            <Bean x={lerp(620, 470, place)} y={by(cSoak)} s={ks} rot={-8} k={plump} op={lt > cSoak ? 1 : 0} />
            <Maize x={lerp(820, 970, place)} y={by(cMz)} s={ks} rot={6} op={lt > cMz ? 1 : 0} />
            <g opacity={1 - place}>
              <path d="M462 566 L978 566 L930 722 Q926 736 910 736 L530 736 Q514 736 510 722 Z" fill="#4C9FD6" fillOpacity="0.55" />
              {ring(cSoak, 620)}{ring(cMz, 820)}
            </g>
            <Knife x={760} y={lerp(30, 150 + 12 * Math.sin(lt * 2.4), hover)} rot={-4} op={hover} />
            {[470, 970].map((x, i) => { const o = pop(lt, cInside + i * 0.25, 0.5); return o > 0.02 ? <text key={x} x={x} y={470} textAnchor="middle" fontFamily={SERIF} fontWeight="700" fontSize={130 * clamp(o, 0.2, 1.1)} fill="#FFFFFF" stroke="#163A2C" strokeWidth="3">?</text> : null; })}
          </g></SVG>
        <Badge text="EXPERIMENT" x={70} y={90} lt={lt} at={cExp} size={38} />
        <Chip text="bean" x={620} y={480} lt={lt} at={cSoak + 0.6} out={cMorn} size={30} />
        <Chip text="maize grain" x={820} y={480} lt={lt} at={cMz + 0.6} out={cMorn} size={30} />
        <Chip text="overnight" x={720} y={150} lt={lt} at={cOver} out={cMorn - 0.4} tone="gold" size={36} />
        <Chip text="next morning: both plump" x={720} y={606} lt={lt} at={cMorn + 0.8} tone="gold" size={32} out={cPred + 1.6} />
        <StopBand lt={lt} b="b6" heading="PREDICT">What will you find inside each one?</StopBand>
        <ClueBoard lt={lt} f={ALLCLUES} />
      </Scene>
    );
  };
}
function BeanHalf({ x, y, s, sd, lit = 0, baby = false }) {
  return <g transform={`translate(${x} ${y}) scale(${sd * s} ${s}) rotate(90)`}>
    {lit > 0 && <path d={BEAN_D} fill="none" stroke={SK.gold} strokeOpacity={0.5 * lit} strokeWidth={30 / s} />}
    <path d={BEAN_D} fill="#F2E2B8" stroke="#B89A5E" strokeWidth={3 / s} />
    {[...Array(14)].map((_, i) => <circle key={i} cx={-50 + rnd(i) * 100} cy={-36 + rnd(i + 30) * 44} r={2.4} fill="#E2C98D" opacity={lit} />)}
    {baby && <path d="M-16 22 C-14 8 -6 4 4 8 C-2 14 -4 20 -6 28 Z" fill="#7DBB5F" />}
  </g>;
}
function B7(ctx) {
  return ({ localTime: lt, duration }) => {
    const cBean = W("b7", "bean"), cSplit = W("b7", "splits"), cCot = W("b7", "cotyledons"), cFood = W("b7", "stored"), cDi = W("b7", "dicot"), cMz = W("b7", "maize"), cNot = W("b7", "not"),
      cIn = W("b7", "inside"), cThin = W("b7", "thin"), cBaby = W("b7", "baby"), cEndo = W("b7", "endosperm"), cMono = W("b7", "monocot"), cCase = W("b7", "case");
    const sp = drive(lt, cSplit, cSplit + 1.2), sec = reveal(lt, cIn, 0.6), cut = drive(lt, cNot - 0.2, cNot + 0.9);
    const leader = (x1, y1, x2, y2, at) => <Arrow x1={x1} y1={y1} x2={x2} y2={y2} color={SK.white} sw={3} head={13} op={out3(lt, at, 0.4)} />;
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[7]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(7, ctx, [L("BEAN → splits into TWO big cotyledons = DICOT", cSplit), L("MAIZE → ONE cotyledon, plus a big ENDOSPERM = MONOCOT", cIn)])}>
        <Card x={40} y={60} w={650} h={860} lt={lt} at={0.1} />
        <Card x={710} y={60} w={690} h={860} lt={lt} at={cMz - 0.2} />
        <SVG>
          <Bean x={365} y={320} s={2.6} rot={-8} k={1} op={1 - clamp(sp * 3, 0, 1)} />
          {sp > 0 && <g><BeanHalf x={365 - 16 - 110 * sp} y={320} s={2.5} sd={-1} lit={reveal(lt, cFood, 0.5)} baby />
            <BeanHalf x={365 + 16 + 110 * sp} y={320} s={2.5} sd={1} lit={reveal(lt, cFood, 0.5)} /></g>}
          <T x={365} y={345} size={70} bold serif color={SK.gold} op={out3(lt, cCot, 0.4)}>+</T>
          <g opacity={out3(lt, cMz - 0.2, 0.5)}>
            <g opacity={1 - sec}><Maize x={930} y={400} s={3.0} /></g>
            {sec > 0 && <g transform="translate(930 400) scale(3.0)" opacity={sec}>
              <path d={MAIZE_D} fill="#F1CC62" stroke="#A9761A" strokeWidth="1.4" />
              {[...Array(26)].map((_, i) => <circle key={i} cx={-38 + rnd(i) * 76} cy={-58 + rnd(i + 11) * 60} r="1.2" fill="#D9A93A" />)}
              <ellipse cx="-13" cy="40" rx="10" ry="24" transform="rotate(10 -13 40)" fill="#F8F3DC" stroke="#C8B98A" strokeWidth="0.8" />
              <path d="M-12 22 C-10 30 -13 40 -15 50" stroke="#6FA84F" strokeWidth="3.4" strokeLinecap="round" fill="none" />
              <path d="M-20 4 C10 6 20 38 3 67 C7 40 0 20 -20 4 Z" fill="#5FB36A" stroke="#2C7A40" strokeWidth="0.8" />
            </g>}
            {cut > 0 && sec <= 0.01 && <line x1={930} y1={170} x2={930} y2={lerp(170, 640, cut)} stroke="#fff" strokeWidth="5" strokeDasharray="16 12" />}
            {leader(1120, 250, 1010, 290, cEndo)}
            {leader(1120, 470, 978, 470, cThin)}
            {leader(1120, 590, 900, 530, cBaby)}
          </g>
        </SVG>
        <Chip text="BEAN" x={365} y={84} lt={lt} at={cBean} size={36} />
        <Chip text="COTYLEDON" x={190} y={480} lt={lt} at={cCot} tone="gold" size={30} />
        <Chip text="COTYLEDON" x={540} y={480} lt={lt} at={cCot + 0.2} tone="gold" size={30} />
        <Chip text="full of stored food" x={365} y={548} lt={lt} at={cFood} size={32} />
        <Pic slot="bean_split_real" label="A soaked bean, split" x={70} y={640} w={270} h={250} lt={lt} at={cFood} fx="none" />
        <Group kind="di" x={380} y={730} lt={lt} at={cDi} size={46} />
        <Chip text="MAIZE" x={1055} y={84} lt={lt} at={cMz} size={36} />
        <Tag text="does NOT split into two" x={930} y={155} lt={lt} at={cNot} out={cIn + 2.4} />
        <Chip text="ENDOSPERM" x={1120} y={228} lt={lt} at={cEndo} tone="gold" size={28} anchor="left" />
        <Chip text="food store" x={1120} y={288} lt={lt} at={cEndo + 0.5} size={26} anchor="left" />
        <Chip text="COTYLEDON" x={1120} y={448} lt={lt} at={cThin} tone="gold" size={28} anchor="left" />
        <Chip text="baby plant" x={1120} y={570} lt={lt} at={cBaby} size={28} anchor="left" />
        <Pic slot="maize_cut_real" label="A soaked maize grain, cut" x={740} y={700} w={250} h={200} lt={lt} at={cIn + 1} fx="none" />
        <Group kind="mono" x={1030} y={760} lt={lt} at={cMono} size={46} />
        <Stamp text="CASE CLOSED" x={620} y={862} lt={lt} at={cCase} size={70} />
        <ClueBoard lt={lt} f={ALLCLUES} />
      </Scene>
    );
  };
}
// Local: the kit's Chip has no red tone.
function Tag({ text, x, y, lt, at, out = null, size = 28 }) {
  const o = pop(lt, at) * (out != null ? 1 - reveal(lt, out, 0.4) : 1); if (o <= 0) return null;
  return <div style={{ position: "absolute", left: x, top: y, transform: `translateX(-50%) scale(${0.9 + 0.1 * o})`, opacity: clamp(o, 0, 1), fontFamily: SANS, fontWeight: 700,
    fontSize: size, color: SK.white, background: RED, padding: "6px 18px", borderRadius: 999, whiteSpace: "nowrap", boxShadow: "0 2px 10px rgba(0,0,0,0.25)" }}>{text}</div>;
}
function B8(ctx) {
  return ({ localTime: lt, duration }) => {
    const cOne = W("b8", "one"), cNar = W("b8", "narrow"), cPar = W("b8", "parallel"), cMo = W("b8", "monocot"), cTwo = W("b8", "two"), cNet = W("b8", "netlike"), cDi = W("b8", "dicot"), cWith = W("b8", "with"), cBef = W("b8", "before");
    const rows = [["Cotyledons", "1", cOne, "2", cTwo], ["Leaf shape", "narrow", cNar, "broad", cTwo + 0.5], ["Veins", "parallel", cPar, "net-like", cNet], ["Examples", "maize, rice, wheat", cMo, "bean, pea, gram", cDi]];
    const bob = 7 * Math.sin(lt * 2);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[8]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(8, ctx, [L("MONOCOT", cOne, "head"), L("1 cotyledon", cOne), L("narrow leaves", cNar), L("parallel veins", cPar), L("DICOT", cTwo, "head"), L("2 cotyledons", cTwo), L("net-like veins", cNet),
          L("Identify plants even BEFORE flowers or fruits!", cBef, "think")], { max: 8 })}>
        <Show lt={lt} a={0.1} b={cWith + 0.2}>
          <div style={{ position: "absolute", left: 40, top: 60, width: 1360, height: 860, borderRadius: 22, background: SK.cream, boxShadow: `0 0 0 4px ${SK.gold}`, boxSizing: "border-box", padding: "26px 44px" }}>
            <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 50, letterSpacing: "0.1em", color: SK.ink, textAlign: "center" }}>CLUE BOARD</div>
            <div style={{ display: "flex", marginTop: 18 }}>
              <div style={{ width: 340 }} />
              <div style={{ flex: 1, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 46, color: SK.white, background: MONO_C, borderRadius: 12, padding: "10px 0", marginRight: 10 }}>MONOCOT</div>
              <div style={{ flex: 1, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 46, color: SK.white, background: DI_C, borderRadius: 12, padding: "10px 0" }}>DICOT</div>
            </div>
            {rows.map(([n, m, mt, d, dt]) => (
              <div key={n} style={{ display: "flex", alignItems: "center", height: 142, borderBottom: `2px solid ${SK.inkLine}` }}>
                <div style={{ width: 340, fontFamily: SERIF, fontWeight: 700, fontSize: 42, color: SK.ink }}>{n}</div>
                {[[m, mt], [d, dt]].map(([v, t], i) => { const o = pop(lt, t, 0.45); return <div key={i} style={{ flex: 1, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 46, color: SK.ink, opacity: clamp(o, 0, 1), transform: `scale(${0.75 + 0.25 * o})` }}>{v}</div>; })}
              </div>))}
          </div>
        </Show>
        <Show lt={lt} a={cWith} f={0.5}>
          <Pic slot="young_seedlings" label="Young seedlings in a field, no flowers yet" x={40} y={60} w={1360} h={860} lt={lt} at={cWith} fx="zoom" />
          <div style={{ position: "absolute", left: 0, top: bob, width: 760, height: 400 }}><Group kind="mono" x={240} y={230} lt={lt} at={cWith + 0.5} size={46} /></div>
          <div style={{ position: "absolute", left: 0, top: -bob, width: 1400, height: 400 }}><Group kind="di" x={960} y={290} lt={lt} at={cWith + 0.9} size={46} /></div>
          <Chip text="no flowers yet" x={720} y={90} lt={lt} at={cBef} tone="gold" size={38} />
        </Show>
      </Scene>
    );
  };
}
function B9(ctx) {
  return ({ localTime: lt, duration }) => {
    const c0 = S("b9", 0), s2 = S("b9", 2), cR = W("b9", "rice"), cWh = W("b9", "wheat"), cGr = W("b9", "grass"), cPl = W("b9", "plate"), cGi = W("b9", "giant"),
      s5 = S("b9", 5), s6 = S("b9", 6), s7 = S("b9", 7), cLun = W("b9", "lunch"), cDi = W("b9", "dicots"), s9 = S("b9", 9), cNet = W("b9", "transport"), cWa = W("b9", "water"), cMin = W("b9", "minerals"), cFo = W("b9", "food", 2);
    const tilt = drive(lt, s5 + 0.2, s6 + 0.8), sp = drive(lt, cDi + 0.1, cDi + 1.3), lit = reveal(lt, cLun - 0.2, 0.5);
    const box = (x, kind, at) => { const o = pop(lt, at, 0.5); return o > 0 ? <g transform={`translate(${x} 640) scale(${o})`}>
      <rect x="-70" y="-44" width="140" height="92" rx="10" fill="#C9D1D6" stroke="#7E8A90" strokeWidth="3" /><rect x="-76" y="-54" width="152" height="24" rx="8" fill="#E2B04C" stroke="#B8861B" strokeWidth="3" />
      <rect x="-14" y="-74" width="28" height="22" rx="6" fill="none" stroke="#7E8A90" strokeWidth="6" /></g> : null; };
    const Leg = ({ y, c, t, at }) => { const o = pop(lt, at, 0.45); return o <= 0 ? null : <div style={{ position: "absolute", left: 830, top: y, display: "flex", alignItems: "center", gap: 20, opacity: clamp(o, 0, 1) }}>
      <div style={{ width: 44, height: 44, borderRadius: "50%", background: c, boxShadow: "0 0 0 3px #fff" }} /><div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 50, color: SK.white }}>{t}</div></div>; };
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[9]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(9, ctx, [L("Maize, rice and wheat are GRASSES, all monocots", s2), L("COCONUT is a monocot too, even as a tall palm!", s5), L("Peas and beans store food in their TWO cotyledons", s7), L("Leaf veins = the plant's TRANSPORT NETWORK", s9)], { max: 4, titleAt: 0.1 })}>
        <Show lt={lt} a={0} b={s2 + 0.3}>
          <Pic slot="punjab_wheat" label="A golden wheat field" x={40} y={60} w={1360} h={860} lt={lt} at={0} fx="zoom" dim={0.45} />
          <window.TPStory.Flip x={330} y={300} w={780} h={300} lt={lt} at={c0} q="DID YOU KNOW?" size={72} />
        </Show>
        <Show lt={lt} a={s2} b={s5 + 0.2}>
          <Trio lt={lt} y={60} h={860} items={[{ slot: "field_maize", label: "A maize field", name: "Maize", at: s2, first: s2 }, { slot: "south_rice", label: "Rice", name: "Rice", at: cR }, { slot: "punjab_wheat", label: "Golden wheat", name: "Wheat", at: cWh }]} />
          <Card x={230} y={350} w={980} h={270} lt={lt} at={cGr} out={cPl - 0.3} />
          <Big x={40} y={372} w={1360} lt={lt} at={cGr} out={cPl - 0.3} size={120} align="center"><span style={{ color: SK.gold }}>GRASS FAMILY</span></Big>
          <Group kind="mono" x={720} y={530} lt={lt} at={cGr + 0.9} out={cPl - 0.3} size={44} anchor="center" text="ALL MONOCOTS" />
          <Pic slot="plate_grains" label="The food on your plate" x={270} y={130} w={900} h={640} lt={lt} at={cPl} fx="pop" />
          <Chip text="food from GIANT grasses!" x={720} y={700} lt={lt} at={cGi} tone="gold" size={42} />
        </Show>
        <Show lt={lt} a={s5} b={s7 + 0.2}>
          <Pic slot="coconut_palm" label="A tall coconut palm" x={40} y={60} w={800} h={860} lt={lt} at={s5} fx="none" pos={`50% ${lerp(100, 0, tilt)}%`} />
          <Group kind="mono" x={70} y={90} lt={lt} at={s5 + 0.6} size={44} />
          <Chip text="COCONUT PALM" x={420} y={840} lt={lt} at={s5 + 0.3} size={36} />
          <Pic slot="coconut_frond" label="Long leaves, lines side by side" x={860} y={60} w={540} h={640} lt={lt} at={s6} fx="zoom" />
          <Chip text="lines side by side" x={1130} y={720} lt={lt} at={s6 + 0.5} tone="gold" size={38} />
        </Show>
        <Show lt={lt} a={s7} b={s9 + 0.2}>
          <Pic slot="pea_pod" label="An opened pea pod" x={40} y={60} w={760} h={860} lt={lt} at={s7} fx="zoom" />
          <Group kind="di" x={70} y={90} lt={lt} at={s7 + 0.5} size={44} text="DICOTS" />
          <SVG>
            <g transform="translate(1110 290)">
              <circle r="150" cx={0} cy={0} fill="#7BBF52" stroke="#4E8A3C" strokeWidth="4" opacity={1 - clamp(sp * 3, 0, 1)} />
              {sp > 0 && [-1, 1].map((sd) => <g key={sd} transform={`translate(${sd * (6 + 96 * sp)} 0)`}>
                {lit > 0 && <path d={`M0 -150 A150 150 0 0 ${sd > 0 ? 1 : 0} 0 150 Z`} stroke={SK.gold} strokeOpacity={0.55 * lit} strokeWidth="26" fill="none" strokeLinejoin="round" />}
                <path d={`M0 -150 A150 150 0 0 ${sd > 0 ? 1 : 0} 0 150 Z`} fill="#BEE08F" stroke="#4E8A3C" strokeWidth="4" strokeLinejoin="round" /></g>)}
            </g>
            {box(1000, 0, cLun)}{box(1220, 1, cLun + 0.25)}
          </SVG>
          <Chip text="two cotyledons" x={1110} y={60} lt={lt} at={cDi + 0.9} tone="gold" size={36} />
          <Chip text="LUNCH BOXES" x={1110} y={745} lt={lt} at={cLun} tone="gold" size={42} />
          <Chip text="food for the baby plant" x={1110} y={825} lt={lt} at={cLun + 0.8} size={32} />
        </Show>
        <Show lt={lt} a={s9}>
          <Card x={40} y={60} w={1360} h={860} lt={lt} at={s9} />
          <SVG><DiLeaf cx={420} top={90} h={760} W={300} a={drive(lt, s9, s9 + 1.2)} b={drive(lt, s9 + 0.6, s9 + 1.8)} c={drive(lt, s9 + 1, s9 + 2.2)} d={drive(lt, s9 + 1.2, s9 + 2.4)} flow={reveal(lt, cWa - 0.3, 0.6)} lt={lt} /></SVG>
          <Badge text="TRANSPORT NETWORK" x={800} y={160} lt={lt} at={cNet} size={40} />
          <Leg y={340} c="#49B4F0" t="water" at={cWa} /><Leg y={440} c="#A8743F" t="minerals" at={cMin} /><Leg y={540} c="#B8F06E" t="food" at={cFo} />
        </Show>
      </Scene>
    );
  };
}
function B10(ctx) {
  return ({ localTime: lt, duration }) => {
    const cSow = W("b10", "sow"), cLook = W("b10", "looking"), cCl = W("b10", "clues"), cLv = W("b10", "leaves");
    const fl = (i) => 8 * Math.sin(lt * 1.6 + i * 2);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[10]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(10, ctx, [L("A seed is not just something we sow", 0.6, "big"), L("It holds CLUES to the plant's identity and growth", cCl)], { max: 3 })}>
        <Pic slot="big_idea" label="A seed held up under a magnifying glass, a field of plants behind" x={40} y={60} w={1360} h={860} lt={lt} at={0} fx="zoom" zoom={1.1} />
        <div style={{ position: "absolute", left: 0, top: fl(0), width: 400, height: 100 }}><Chip text="cotyledons" x={250} y={150} lt={lt} at={cLook + 0.3} tone="gold" size={38} /></div>
        <div style={{ position: "absolute", left: 0, top: fl(1), width: 400, height: 100 }}><Chip text="leaf shape" x={700} y={110} lt={lt} at={cLv} tone="gold" size={38} /></div>
        <div style={{ position: "absolute", left: 0, top: fl(2), width: 400, height: 100 }}><Chip text="veins" x={1150} y={150} lt={lt} at={cLv + 0.5} tone="gold" size={38} /></div>
        <Card x={140} y={762} w={1160} h={104} lt={lt} at={cCl} />
        <Big x={40} y={784} w={1360} lt={lt} at={cCl} size={48} align="center">A seed holds <span style={{ color: SK.gold }}>CLUES</span> to the plant it will become</Big>
        <ClueBoard lt={lt} f={ALLCLUES} />
      </Scene>
    );
  };
}
function B11(ctx) {
  return ({ localTime: lt, duration }) => {
    const q1 = S("b11", 1), q2 = S("b11", 2), q3 = S("b11", 3), stop = stopAt("b11", 3), a1 = S("b11", 4), a2 = S("b11", 5), a3 = S("b11", 6), cC = S("b11", 7);
    const rows = [["RICE: monocot or dicot?", q1, "mono", "MONOCOT", a1], ["GRAM: monocot or dicot?", q2, "di", "DICOT", a2], ["A leaf with net-like veins belongs to a…?", q3, "di", "DICOT", a3]];
    const hold = windowOp(lt, stop, stop + 5.8, 0.3);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[11]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(11, ctx, [L("1. Monocot or dicot: RICE?", q1), L("2. Monocot or dicot: GRAM?", q2), L("3. A leaf with net-like veins belongs to a…?", q3)])}>
        <div style={{ position: "absolute", left: 40, top: 60, width: 1360, height: 860, borderRadius: 26, background: "rgba(5,30,22,0.86)", boxShadow: "0 0 0 3px rgba(226,176,76,0.9)", boxSizing: "border-box", padding: "40px 60px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20 }}>
            <svg width="62" height="62" viewBox="0 0 90 90"><circle cx="45" cy="45" r="43" fill={SK.gold} /><rect x="28" y="24" width="12" height="42" rx="4" fill={SK.ink} /><rect x="50" y="24" width="12" height="42" rx="4" fill={SK.ink} /></svg>
            <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 34, letterSpacing: "0.08em", color: SK.ink, background: SK.gold, padding: "9px 28px", borderRadius: 14 }}>QUICK CHECK</div>
          </div>
          {rows.map(([q, t, kind, ans, at], i) => { const o = out3(lt, t, 0.5);
            return <div key={i} style={{ position: "relative", height: 190, marginTop: 8, opacity: o, transform: `translateY(${(1 - o) * 12}px)` }}>
              <div style={{ display: "flex", gap: 22, alignItems: "baseline", paddingTop: 22 }}>
                <span style={{ flex: "none", width: 46, fontFamily: SERIF, fontWeight: 700, fontSize: 50, color: SK.gold }}>{i + 1}</span>
                <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 50, lineHeight: 1.15, color: SK.white, whiteSpace: "nowrap" }}>{q}</span></div>
              <Group kind={kind} x={68} y={100} lt={lt} at={at} size={42} text={ans} />
            </div>; })}
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 28, textAlign: "center", fontFamily: SANS, fontSize: 26, color: SK.dim, opacity: hold }}>Stop 3 of {STOPS.length} · press play to continue</div>
        </div>
        <Stamp text="CASE CLOSED" x={1000} y={815} lt={lt} at={cC} size={80} />
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
const COLLAGE = [{ slot: "punjab_wheat", x: -60, y: -40, w: 760, h: 520, ph: 0 }, { slot: "field_maize", x: 640, y: -80, w: 760, h: 520, ph: 2 },
  { slot: "paddy_flooded", x: -80, y: 520, w: 700, h: 560, ph: 4 }, { slot: "wheat_winter", x: 560, y: 560, w: 820, h: 560, ph: 1 }];
function Lp27Scenes(props = {}) {
  const caps = props.showCaptions === "false" ? false : props.showCaptions !== false;
  const titles = {};
  for (let n = 1; n <= NB; n++) titles[n] = str(props["title" + n + "Text"], TITLES[n]);
  const ctx = { caps, titles, capSize: num(props.captionSize, 34) };
  const B = [B1, B2, B3, B4, B5, B6, B7, B8, B9, B10, B11];
  const beats = B.map((Bn, i) => { const t = BEAT("b" + (i + 1)); return [t.start, t.start + t.dur, Bn]; });
  return (
    <StoryFrame props={props} dur={DUR} persistKey="thinkpro-lp27-types-of-seeds-monocots-and-dicots" collage={COLLAGE}>
      {beats.map(([s, e, Bn], i) => (
        <Sprite key={i} start={s} end={e}>{Bn(ctx)}</Sprite>
      ))}
      {STOPS.map(([b, i, hold]) => <StopAt key={b} t={BEAT(b).start + stopAt(b, i)} hold={hold - 0.2} />)}
      <ChimeAt t={BEAT("b9").start + S("b9", 0, 0)} />
      <AudioSync />
    </StoryFrame>
  );
}
window.Lp27Scenes = Lp27Scenes;
