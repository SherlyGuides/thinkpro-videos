/* global React, window */
// ThinkPro Academy — "Seed Treatment: Giving Seeds a Healthy Head Start!" (Grade 6 Agriculture, Session 29, V1).
// After AG_G6_S28 Video Script (Subrata, 5 Nov 2026): 11 script scenes as 11 voiced beats, three presenter stops
// (TPStory.StopAt: the built-in countdown dial runs during the hold), one Did-you-know card (b10, chime).
// Running idea: SEED SHIELD. Each treatment adds a glowing shield round a seed. The seed and shields are DRAWN here,
// so they can flash, bounce threats off and build up; photos carry the scenes behind them.
// SAFETY (script, binding): no child handles any treatment. Chemical treatment shows only a trained adult with gloves
// and mask, with no product names, amounts or steps on screen.
// STORY STYLE (engine/story-kit.jsx). Pure function of time.
const { Sprite } = window;
const { reveal, windowOp } = window.TPMotion;
const { num, str } = window.TPStage;
const { SK, SERIF, SANS, LEFT_W, pop, out3, lerp, drive, photoSrc,
  Pic, Chip, Badge, Big, Card, SVG, Arrow, T, ChimeAt, Scene, StoryFrame, StopAt } = window.TPStory;

// ---- Session number: change it HERE (and title1Text in Video.dc.html, defs + data-props). --------
const SESSION = 29;
const SLUG = "lp29-seed-treatment";

// ---- Timing: EVERYTHING is keyed to the narration (tools/fit_timing.py → timing.js).
const TM = window.TP_TIMING;
if (!TM) console.error("timing.js missing — run: python3 tools/fit_timing.py videos/" + SLUG);
const LEAD = TM ? TM.lead : 1.0;
const DUR = TM ? TM.total : 225;
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
const TITLES = { 1: `LP${SESSION} – Seed Treatment`, 2: "Seed treatment", 3: "Threats to seeds", 4: "Why treat seeds?", 5: "Think", 6: "Traditional wisdom",
  7: "Modern seed treatment", 8: "Safety first", 9: "What would you do?", 10: "Did you know?", 11: "The big idea" };
const KICK = `Grade 6 · Agriculture · Session ${SESSION}`;
const KICKS = { 3: "Seed Shield", 4: "Seed Shield", 5: "Seed Shield", 6: "Seed Shield", 7: "Seed Shield", 11: "Seed Shield" };
const panel = (n, ctx, lines, extra = {}) => ({ kicker: KICKS[n] || KICK, title: ctx.titles[n], lines, ...extra });
const L = (text, at, kind = "item", extra = {}) => ({ text, at, kind, ...extra });

// ---- Presenter stops: [beat, sentence index whose pauseAfter is the hold, hold s]
const STOPS = [["b5", 1, 15.0], ["b9", 2, 15.0], ["b11", 4, 15.0]];
const stopAt = (b, i) => SE(b, i) + 0.1;                       // beat-local start of the hold
const stopFor = (b) => STOPS.find((s) => s[0] === b);
function StopBand({ lt, b, heading, children, y = 670, h = 250 }) {
  const s = stopFor(b), at = stopAt(b, s[1]), hold = s[2] - 0.2, n = STOPS.indexOf(s) + 1;
  const o = windowOp(lt, at, at + hold + 0.4, 0.35); if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 40, top: y, width: LEFT_W - 80, height: h, borderRadius: 24, background: "rgba(5,30,22,0.92)", opacity: o, zIndex: 3,
      boxShadow: "0 0 0 3px rgba(226,176,76,0.9)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "16px 50px", boxSizing: "border-box", textAlign: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <svg width="54" height="54" viewBox="0 0 90 90"><circle cx="45" cy="45" r="43" fill={SK.gold} /><rect x="28" y="24" width="12" height="42" rx="4" fill={SK.ink} /><rect x="50" y="24" width="12" height="42" rx="4" fill={SK.ink} /></svg>
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 28, letterSpacing: "0.08em", color: SK.ink, background: SK.gold, padding: "7px 24px", borderRadius: 12 }}>{heading}</div>
      </div>
      <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 44, lineHeight: 1.16, color: SK.white, marginTop: 14 }}>{children}</div>
      <div style={{ fontFamily: SANS, fontSize: 24, color: SK.dim, marginTop: 10 }}>Stop {n} of {STOPS.length}</div>
    </div>
  );
}

// ---- Shared pieces ---------------------------------------------------------------
const BOX = { x: 40, y: 60, w: 1360, h: 860 };
const RED = "#B3261E";
const SH1 = "#D79A54", SH2 = "#8BD48A", SH3 = "#7CC8F2";       // shield 1 cow dung, 2 neem, 3 modern
function Show({ lt, a, b = 1e9, f = 0.4, children }) {
  const o = windowOp(lt, a, b, f); if (o <= 0) return null;
  return <div style={{ position: "absolute", inset: 0, opacity: o }}>{children}</div>;
}
function Stamp({ text, x, y, lt, at, rot = -7, size = 74, out = null, color = RED }) {
  const p = reveal(lt, at, 0.32); if (p <= 0) return null;
  const o = Math.min(1, p * 2.2) * (out != null ? 1 - reveal(lt, out, 0.4) : 1); if (o <= 0) return null;
  const sc = 1.9 - 0.9 * Math.pow(p, 3), kick = 0.05 * Math.sin(Math.PI * clamp((lt - at - 0.32) / 0.22, 0, 1));
  return <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${sc + kick})`, opacity: o, zIndex: 4, fontFamily: SERIF, fontWeight: 700, fontSize: size,
    letterSpacing: "0.08em", color, background: "rgba(246,241,227,0.94)", border: `8px solid ${color}`, borderRadius: 14, padding: "6px 34px", whiteSpace: "nowrap", boxShadow: "0 8px 24px rgba(0,0,0,0.35)" }}>{text}</div>;
}
// A plain dark stage inside the photo area, for the drawn seed.
function Dark({ lt = 0, at = -9, x = BOX.x, y = BOX.y, w = BOX.w, h = BOX.h, out = null }) {
  const o = out3(lt, at, 0.4) * (out != null ? 1 - reveal(lt, out, 0.4) : 1); if (o <= 0) return null;
  return <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 18, background: "#0A2B20", opacity: o, boxShadow: "0 0 0 3px rgba(255,255,255,0.55)" }} />;
}
// The cut-away: sky strip, surface line, soil. The soil photo sits on the drawn soil once it exists.
function Under({ surface = 210, lt = 0, at = 0 }) {
  const o = out3(lt, at, 0.4); if (o <= 0) return null;
  const src = photoSrc("soil_section"), sy = surface - BOX.y, H = BOX.h - sy;
  return (
    <div style={{ position: "absolute", left: BOX.x, top: BOX.y, width: BOX.w, height: BOX.h, borderRadius: 18, overflow: "hidden", background: "#A9D3E6", opacity: o, boxShadow: "0 0 0 3px rgba(255,255,255,0.55)" }}>
      <div style={{ position: "absolute", left: 0, top: sy, width: BOX.w, height: H, background: "#4A3526" }} />
      {src ? <img src={src} alt="" style={{ position: "absolute", left: 0, top: sy, width: BOX.w, height: H, objectFit: "cover" }} />
        : <svg width={BOX.w} height={H} style={{ position: "absolute", left: 0, top: sy }}>{Array.from({ length: 46 }, (_, i) =>
            <ellipse key={i} cx={rnd(i) * BOX.w} cy={20 + rnd(i + 50) * (H - 30)} rx={6 + rnd(i + 90) * 16} ry={4 + rnd(i + 130) * 9} fill={i % 3 ? "#5C4A3E" : "#3A2A1E"} />)}</svg>}
      <div style={{ position: "absolute", left: 0, top: sy - 6, width: BOX.w, height: 14, background: "#3C8A44" }} />
    </div>
  );
}
function Clip({ children }) {
  return <g clipPath="url(#tp-box)"><clipPath id="tp-box"><rect x={BOX.x} y={BOX.y} width={BOX.w} height={BOX.h} rx="18" /></clipPath>{children}</g>;
}
const SEED_D = "M0 -62 C 40 -56 58 -14 50 22 C 42 56 18 68 0 68 C -18 68 -42 56 -50 22 C -58 -14 -40 -56 0 -62 Z";
// The seed character. mood: happy | worried. mould 0..1 grey fuzz, bite 0..1 a nibbled corner, tint = coat colour.
function SeedBody({ x, y, s = 1, rot = 0, mood = "happy", mould = 0, bite = 0, tint = "#C98F4E", edge = "#7A4E22", face = true, op = 1 }) {
  if (op <= 0) return null;
  const id = `sb${Math.round(x)}_${Math.round(y)}`;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={op}>
      {bite > 0 && <mask id={id}><rect x="-90" y="-90" width="180" height="180" fill="#fff" /><circle cx="46" cy="-30" r={36 * bite} fill="#000" /><circle cx="22" cy="-52" r={20 * bite} fill="#000" /></mask>}
      <path d={SEED_D} fill={tint} stroke={edge} strokeWidth="4" mask={bite > 0 ? `url(#${id})` : undefined} />
      {face && <g>
        <circle cx="-18" cy="2" r="6.5" fill="#2B1C10" /><circle cx="18" cy="2" r="6.5" fill="#2B1C10" />
        {mood === "happy"
          ? <path d="M-15 22 Q0 36 15 22" stroke="#2B1C10" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          : <path d="M-14 32 Q0 20 14 32" stroke="#2B1C10" strokeWidth="4.5" strokeLinecap="round" fill="none" />}
      </g>}
      {mould > 0 && Array.from({ length: 26 }, (_, i) => { const a = rnd(i + 3) * 6.283, r = 18 + rnd(i + 40) * 40;
        return <circle key={i} cx={Math.cos(a) * r} cy={Math.sin(a) * r * 1.2} r={(7 + rnd(i + 70) * 11) * clamp(mould * 1.6 - rnd(i) * 0.6, 0, 1)} fill={i % 2 ? "#B9BFBB" : "#8F9692"} opacity="0.92" />; })}
    </g>
  );
}
const SHIELD_D = "M0 -100 C 34 -100 66 -92 92 -76 C 102 -10 86 66 0 112 C -86 66 -102 -10 -92 -76 C -66 -92 -34 -100 0 -100 Z";
// One shield layer. p 0..1 draws it round; flash 0..1 a white hit.
function Shield({ x, y, s = 1, color = SK.gold, p = 1, flash = 0 }) {
  if (p <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d={SHIELD_D} fill={color} fillOpacity={0.12 * p + 0.25 * flash} />
      <path d={SHIELD_D} pathLength="1" strokeDasharray={`${p} 1.02`} stroke={color} strokeOpacity="0.3" strokeWidth={22 / s} strokeLinecap="round" fill="none" />
      <path d={SHIELD_D} pathLength="1" strokeDasharray={`${p} 1.02`} stroke={flash > 0.3 ? "#fff" : color} strokeWidth={(6 + 6 * flash) / s} strokeLinecap="round" fill="none" />
    </g>
  );
}
// Seed + its shields. layers: [{ c, p, flash }], innermost first.
function Hero({ x, y, s = 1, lt = 0, layers = [], mood = "happy", face = true }) {
  const b = 1 + 0.012 * Math.sin(lt * 2.2);
  return <g>
    {layers.map((l, i) => <Shield key={i} x={x} y={y - 2 * s} s={(1.18 + 0.3 * i) * s * b} color={l.c} p={l.p == null ? 1 : l.p} flash={l.flash || 0} />)}
    <SeedBody x={x} y={y} s={s} mood={mood} face={face} />
  </g>;
}
// A sprout rising from a seed at (x,y). g 0..1. h = height above the seed.
function Sprout({ x, y, g, h = 300, sw = 9, leaves = 1 }) {
  if (g <= 0) return null;
  const top = y - 60 - h * g, d = `M${x} ${y - 50} C ${x - 14} ${y - 50 - h * g * 0.4}, ${x + 14} ${y - 50 - h * g * 0.7}, ${x} ${top}`;
  const lf = clamp((g - 0.45) / 0.45, 0, 1) * leaves;
  return <g>
    {[-1, 0, 1].map((k) => <path key={k} d={`M${x + k * 8} ${y + 58} q ${k * 26} ${40 * g} ${k * 16} ${90 * g}`} stroke="#E9DFC4" strokeWidth="5" strokeLinecap="round" fill="none" />)}
    <path d={d} stroke="#5FAE4E" strokeWidth={sw} strokeLinecap="round" fill="none" />
    {lf > 0 && [-1, 1].map((sd) => <path key={sd} transform={`translate(${x} ${top + 8}) scale(${sd * lf} ${lf})`} d="M0 0 C 26 -44, 78 -46, 104 -24 C 78 8, 26 16, 0 0 Z" fill="#6CC05A" stroke="#3E8A3C" strokeWidth="3" />)}
  </g>;
}
// Soil insect, walking. flip = facing right. wig = leg motion phase.
function Insect({ x, y, s = 1, flip = false, wig = 0 }) {
  return <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
    {[-26, 0, 26].map((lx, i) => { const k = 8 * Math.sin(wig + i * 2.1); return <g key={i}>
      <path d={`M${lx} 8 L ${lx - 8 + k} 42`} stroke="#1C1712" strokeWidth="6" strokeLinecap="round" /><path d={`M${lx} -8 L ${lx - 8 - k} -42`} stroke="#1C1712" strokeWidth="6" strokeLinecap="round" /></g>; })}
    <ellipse cx="8" cy="0" rx="52" ry="30" fill="#3A2C22" stroke="#EDE3C9" strokeWidth="3" />
    <path d="M-30 0 L 56 0" stroke="#EDE3C9" strokeWidth="2.5" opacity="0.6" />
    <circle cx="-48" cy="0" r="20" fill="#2B2019" stroke="#EDE3C9" strokeWidth="3" /><circle cx="-54" cy="-7" r="5" fill="#fff" />
    <path d="M-60 -14 q -22 -18 -36 -12 M-60 12 q -22 18 -36 12" stroke="#EDE3C9" strokeWidth="3" strokeLinecap="round" fill="none" />
  </g>;
}
// Grey fungal threads creeping in from a side. p 0..1 grown; dir -1 grows left, +1 right.
const THREADS = Array.from({ length: 7 }, (_, i) => {
  const y0 = 300 + i * 80, l = 300 + rnd(i + 7) * 130, ey = y0 + (510 - y0) * 0.5 + (rnd(i + 21) - 0.5) * 60, mx = l * 0.5, my = y0 + (rnd(i + 11) - 0.5) * 110;
  return { y0, l, ey, mx, my, bx: mx + 90, by: my + (i % 2 ? 80 : -80) };
});
function Threads({ x, p, color = "#D5DAD6" }) {
  if (p <= 0) return null;
  return <g transform={`translate(${x} 0)`}>{THREADS.map((t, i) => {
    const q = clamp(p * 1.3 - rnd(i + 2) * 0.3, 0, 1);
    return <g key={i} stroke={color} strokeLinecap="round" fill="none">
      <path d={`M0 ${t.y0} Q ${t.mx} ${t.my} ${t.l} ${t.ey}`} pathLength="1" strokeDasharray={`${q} 1.02`} strokeWidth="9" />
      <path d={`M${t.mx * 0.9} ${(t.y0 + t.my) / 2} Q ${t.bx - 40} ${t.by} ${t.bx} ${t.by}`} pathLength="1" strokeDasharray={`${clamp(q * 1.4 - 0.5, 0, 1)} 1.02`} strokeWidth="6" />
      {q > 0.9 && <circle cx={t.l} cy={t.ey} r={11 * (q - 0.9) * 10} fill={color} stroke="none" />}
    </g>; })}</g>;
}
// Spiky germ that pops. p 1 → 0.
function Germ({ x, y, s = 1, p = 1, c = "#7B4FA8", wob = 0 }) {
  if (p <= 0) return null;
  return <g transform={`translate(${x} ${y + 6 * Math.sin(wob)}) scale(${s * p})`} opacity={p}>
    {Array.from({ length: 9 }, (_, i) => <path key={i} transform={`rotate(${i * 40})`} d="M-8 -26 L0 -46 L8 -26 Z" fill={c} />)}
    <circle r="30" fill={c} /><circle cx="-10" cy="-5" r="5" fill="#fff" /><circle cx="10" cy="-5" r="5" fill="#fff" /><path d="M-9 13 Q0 5 9 13" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" fill="none" />
  </g>;
}
// Red cross drawn over a picture.
function Cross({ x, y, r = 110, lt, at, sw = 26 }) {
  const a = clamp(reveal(lt, at, 0.22), 0, 1), b = clamp(reveal(lt, at + 0.16, 0.22), 0, 1); if (a <= 0) return null;
  return <g strokeLinecap="round" fill="none">
    <path d={`M${x - r} ${y - r} L ${x + r} ${y + r}`} pathLength="1" strokeDasharray={`${a} 1.02`} stroke="#fff" strokeWidth={sw + 12} /><path d={`M${x - r} ${y - r} L ${x + r} ${y + r}`} pathLength="1" strokeDasharray={`${a} 1.02`} stroke={RED} strokeWidth={sw} />
    {b > 0 && <><path d={`M${x + r} ${y - r} L ${x - r} ${y + r}`} pathLength="1" strokeDasharray={`${b} 1.02`} stroke="#fff" strokeWidth={sw + 12} /><path d={`M${x + r} ${y - r} L ${x - r} ${y + r}`} pathLength="1" strokeDasharray={`${b} 1.02`} stroke={RED} strokeWidth={sw} /></>}
  </g>;
}
// The running tally at the foot of the cream panel: which shields the seed has so far.
function ShieldMeter({ lt, a = null, b = null, c = null, at = -99 }) {
  const o = out3(lt, at, 0.5); if (o <= 0) return null;
  const on = (when) => when == null ? 0 : clamp(reveal(lt, when, 0.7), 0, 1);
  const rows = [["Cow-dung slurry", SH1, a], ["Neem water", SH2, b], ["Modern", SH3, c]];
  return (
    <div style={{ position: "absolute", left: 1476, top: 690, width: 408, height: 214, borderRadius: 14, background: SK.bg0, opacity: o, boxSizing: "border-box", padding: "10px 14px", boxShadow: `0 0 0 3px ${SK.gold}` }}>
      <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 25, letterSpacing: "0.1em", color: SK.gold, textAlign: "center" }}>SEED SHIELD</div>
      <svg width="150" height="150" viewBox="-150 -150 300 300" style={{ position: "absolute", left: 10, top: 52 }}>
        <Shield x={0} y={0} s={0.86} color={SH1} p={on(a)} /><Shield x={0} y={0} s={1.08} color={SH2} p={on(b)} /><Shield x={0} y={0} s={1.3} color={SH3} p={on(c)} />
        <SeedBody x={0} y={0} s={0.72} face={false} />
      </svg>
      <div style={{ position: "absolute", left: 164, top: 56, right: 10 }}>
        {rows.map(([t, col, when], i) => { const p = on(when); return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, height: 48, opacity: 0.45 + 0.55 * p }}>
            <div style={{ flex: "none", width: 20, height: 20, borderRadius: 5, background: p > 0.5 ? col : "transparent", boxShadow: `0 0 0 2px ${col}` }} />
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 22, color: SK.white, whiteSpace: "nowrap" }}>{t}</div>
          </div>); })}
      </div>
    </div>
  );
}
// Labelled name tag under the big seed on the side card.
function Tag({ text, x, y, lt, at, out = null, size = 28, bg = SK.gold, fg = SK.ink, anchor = "center" }) {
  const o = pop(lt, at, 0.45) * (out != null ? 1 - reveal(lt, out, 0.4) : 1); if (o <= 0) return null;
  return <div style={{ position: "absolute", left: x, top: y, transform: `translateX(${anchor === "left" ? 0 : -50}%) scale(${0.85 + 0.15 * o})`, opacity: clamp(o, 0, 1), fontFamily: SANS, fontWeight: 700, fontSize: size, color: fg, background: bg,
    padding: "6px 20px", borderRadius: 10, whiteSpace: "nowrap", boxShadow: "0 3px 12px rgba(0,0,0,0.35)" }}>{text}</div>;
}

// ---- Beats -----------------------------------------------------------------------
function B1(ctx) {
  const XS = [240, 480, 720, 960, 1200], Y = 470;
  return ({ localTime: lt, duration }) => {
    const s1 = S("b1", 0 + 1), cMould = W("b1", "mouldy"), cEat = W("b1", "eaten"), cGaps = W("b1", "gaps"), s2 = S("b1", 2), cProt = W("b1", "protect");
    const g = drive(lt, s1, cGaps + 0.2), m = reveal(lt, cMould, 1.2), bt = reveal(lt, cEat + 0.2, 0.9), ix = lerp(1330, 1062, drive(lt, cEat - 0.7, cEat + 0.2));
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[1]} showCaps={ctx.caps} capSize={ctx.capSize} fi={0.1}
        panel={panel(1, ctx, [L("Giving Seeds a Healthy Head Start!", 0.6, "head"), L("Can we protect a seed BEFORE it goes into the soil?", s2 + 1.2, "think")])}>
        <Show lt={lt} a={0} b={s1 + 0.2}>
          <Pic slot="sow_scatter" label="A farmer sows a row of seeds" x={BOX.x} y={BOX.y} w={BOX.w} h={BOX.h} lt={lt} at={0} fx="zoom" dur={0.5} />
        </Show>
        <Show lt={lt} a={s1} b={cGaps + 0.5}>
          <Under lt={lt} at={s1} />
          <SVG>
            {[0, 2, 4].map((i) => <Sprout key={i} x={XS[i]} y={Y} g={g * (i === 2 ? 0.9 : 1)} h={i === 4 ? 250 : 300} />)}
            {XS.map((x, i) => <SeedBody key={i} x={x} y={Y} s={1.05} rot={[-8, 6, -4, 5, 8][i]} mood={i === 1 || i === 3 ? "worried" : "happy"} mould={i === 1 ? m : 0} bite={i === 3 ? bt : 0} />)}
            {ix < 1320 && <Insect x={ix} y={Y - 30} s={0.9} wig={lt * 14} />}
          </SVG>
          <Chip text="mouldy" x={480} y={620} lt={lt} at={cMould + 0.1} size={38} />
          <Chip text="eaten" x={960} y={620} lt={lt} at={cEat + 0.1} size={38} />
        </Show>
        <Show lt={lt} a={cGaps} >
          <Pic slot="row_gaps" label="The row comes up patchy, with gaps" x={BOX.x} y={BOX.y} w={BOX.w} h={BOX.h} lt={lt} at={cGaps} fx="zoom" dim={lt > s2 ? 0.28 : 0} />
          <Stamp text="GAPS!" x={1120} y={210} lt={lt} at={cGaps + 0.15} out={s2 + 0.5} />
          <Card x={150} y={330} w={1140} h={300} lt={lt} at={cProt} />
          <Big x={190} y={366} w={1060} lt={lt} at={cProt} size={68} align="center">Can we protect a seed <span style={{ color: SK.gold }}>BEFORE</span> it goes into the soil?</Big>
        </Show>
      </Scene>
    );
  };
}
function B2(ctx) {
  const GERMS = [[300, 320, 1], [520, 210, 0.8], [700, 420, 1.1], [980, 300, 0.9], [420, 640, 0.9], [860, 640, 1.05], [1160, 520, 0.8]];
  return ({ localTime: lt, duration }) => {
    const s1 = S("b2", 1), s2 = S("b2", 2), cGerm = W("b2", "germs"), s3 = S("b2", 3), cProt = W("b2", "protection"), s4 = S("b2", 4), cSh = W("b2", "shield");
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[2]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(2, ctx, [L("SEED TREATMENT", s1, "big"), L("= a protective treatment given to seeds BEFORE sowing", s4)])}>
        <Show lt={lt} a={0} b={s2 + 0.2}>
          <Dark />
          <SVG><Hero x={720} y={330} s={1.5} lt={lt} /></SVG>
          <Big x={BOX.x} y={560} w={BOX.w} lt={lt} at={0.4} out={s1 - 0.2} size={84} align="center">YES we can!</Big>
          <Big x={BOX.x} y={560} w={BOX.w} lt={lt} at={s1} size={92} align="center" color={SK.gold}>SEED TREATMENT</Big>
        </Show>
        <Show lt={lt} a={s2} b={s3 + 0.2}>
          <Pic slot="hand_wash" label="A child washes their hands with soap" x={BOX.x} y={BOX.y} w={BOX.w} h={BOX.h} lt={lt} at={s2} fx="zoom" zoom={1.08} />
          <SVG>{GERMS.map(([x, y, sc], i) => <Germ key={i} x={x} y={y} s={sc * Math.min(1, pop(lt, s2 + 0.1 + i * 0.06, 0.4))} p={1 - reveal(lt, cGerm + 0.15 + i * 0.1, 0.35)} wob={lt * 3 + i} />)}</SVG>
          <Chip text="germs gone" x={720} y={840} lt={lt} at={cGerm + 0.8} tone="gold" size={38} />
        </Show>
        <Show lt={lt} a={s3} b={s4 + 0.2}>
          <Dark />
          <SVG><Hero x={720} y={440} s={1.7} lt={lt} layers={[{ c: SK.gold, p: drive(lt, cProt - 0.2, cProt + 1) }]} /></SVG>
        </Show>
        <Show lt={lt} a={s4}>
          <Pic slot="farmer_basket" label="A farmer holds a basket of seeds, ready to treat them" x={40} y={60} w={900} h={860} lt={lt} at={s4} fx="zoom" />
          <Dark lt={lt} at={s4} x={960} w={440} />
          <SVG><Hero x={1180} y={440} s={1.15} lt={lt} layers={[{ c: SK.gold, p: 1, flash: lt > cSh ? 1 - reveal(lt, cSh + 0.1, 0.6) : 0 }]} /></SVG>
          <Tag text="like a SHIELD!" x={1180} y={700} lt={lt} at={cSh} size={40} />
        </Show>
      </Scene>
    );
  };
}
function B3(ctx) {
  const CX = 720, CY = 520;
  return ({ localTime: lt, duration }) => {
    const s1 = S("b3", 1), cIns = W("b3", "insects"), s3 = S("b3", 3), cDam = W("b3", "damage"), cBef = W("b3", "before"), cSp = W("b3", "sprouting");
    const hit = cDam + 0.1, flash = lt > hit ? 1 - reveal(lt, hit, 0.7) : 0, back = drive(lt, hit, hit + 0.9);
    const t = drive(lt, s1, s1 + 3.2) * (1 - 0.86 * back);
    const walk = drive(lt, cIns - 0.2, hit), ix = back > 0 ? lerp(918, 1290, back) : lerp(1440, 918, walk);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[3]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(3, ctx, [L("Disease-causing FUNGI", s1), L("INSECTS", cIns), L("Other threats, before and during germination", s3)])}>
        <Under lt={lt} surface={170} />
        <SVG>
          <Clip><Threads x={40} p={t} /></Clip>
          <Sprout x={CX} y={CY} g={0.32 * reveal(lt, cSp, 1)} h={200} />
          <Hero x={CX} y={CY} s={1.15} lt={lt} mood={lt < hit ? "worried" : "happy"} layers={[{ c: SK.gold, flash }]} />
          <Clip>{lt >= cIns - 0.3 && <Insect x={ix} y={CY + 30} s={1.05} flip={back > 0} wig={(back > 0 && back < 1) || walk < 1 ? lt * 14 : 0} />}</Clip>
        </SVG>
        <Chip text="FUNGI" x={250} y={190} lt={lt} at={s1 + 0.2} size={40} />
        <Chip text="INSECTS" x={1190} y={190} lt={lt} at={cIns + 0.1} size={40} />
        <Chip text="and other threats" x={720} y={190} lt={lt} at={s3 + 0.1} tone="gold" size={36} />
        <Chip text="before it sprouts, or while it is sprouting" x={720} y={800} lt={lt} at={cBef} size={34} />
      </Scene>
    );
  };
}
function B4(ctx) {
  return ({ localTime: lt, duration }) => {
    const s1 = S("b4", 1), s2 = S("b4", 2), s3 = S("b4", 3), s4 = S("b4", 4);
    const rows = [["FEWER diseases", s1 + 0.3], ["PROTECTED seedlings", s2 + 0.2], ["HEALTHY and EVEN", s3 + 0.5]];
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[4]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(4, ctx, [L("FEWER seed-borne diseases", s1), L("PROTECTS young seedlings", s2), L("HEALTHY, more EVEN sprouting", s3)])}>
        <Pic slot="row_gaps" label="Untreated: patchy, uneven seedlings, some yellow and sick" x={40} y={60} w={672} h={860} lt={lt} at={0} fx="zoom" zoom={1.06} />
        <Pic slot="field_rows" label="Treated: neat rows of healthy, even seedlings" x={728} y={60} w={672} h={860} lt={lt} at={0.4} fx="zoom" zoom={1.06} />
        <Chip text="UNTREATED" x={376} y={84} lt={lt} at={0.5} size={38} />
        <Chip text="TREATED" x={1064} y={84} lt={lt} at={0.9} tone="green" size={38} />
        <SVG><g opacity={out3(lt, 1.1, 0.5)}><circle cx={1302} cy={214} r={88} fill="rgba(5,30,22,0.8)" /><Hero x={1302} y={214} s={0.52} lt={lt} layers={[{ c: SK.gold }]} /></g></SVG>
        {rows.map(([t, at], i) => <Tag key={i} text={t} x={1064} y={610 + i * 86} lt={lt} at={at} size={38} />)}
        <Stamp text="Look at the difference!" x={720} y={500} lt={lt} at={s4} size={50} rot={-2} color={SK.bg1} />
      </Scene>
    );
  };
}
function B5(ctx) {
  const Q = [[330, 200, 90], [520, 470, 64], [1120, 180, 72], [1020, 500, 96], [210, 420, 60], [1240, 400, 58], [720, 120, 54]];
  return ({ localTime: lt, duration }) => {
    const s1 = S("b5", 1), st = stopAt("b5", 1);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[5]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(5, ctx, [L("Name TWO threats that seed treatment protects against", s1, "think")])}>
        <Dark />
        <SVG>
          <Hero x={720} y={340} s={1.3} lt={lt} layers={[{ c: SK.gold }]} />
          {Q.map(([x, y, sz], i) => <T key={i} x={x} y={y + 8 * Math.sin(lt * 1.5 + i)} size={sz} serif bold color={SK.gold} op={clamp(pop(lt, s1 + i * 0.12, 0.45), 0, 1)}>?</T>)}
        </SVG>
        <StopBand lt={lt} b="b5" heading="THINK">Name TWO threats that seed treatment protects against</StopBand>
      </Scene>
    );
  };
}
function B6(ctx) {
  const PX = 40, PW = 960, CX = 1210;
  const P = (p) => ({ x: PX, y: 60, w: PW, h: 860, ...p });
  return ({ localTime: lt, duration }) => {
    const s1 = S("b6", 1), cSm = W("b6", "smooth"), cWa = W("b6", "water"), s2 = S("b6", 2), cMade = W("b6", "made"), cTree = W("b6", "tree"), s3 = S("b6", 3), cTr = W("b6", "traditional");
    const shA = cWa + 0.2, shB = cTree + 0.2;
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[6]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(6, ctx, [L("Coating seeds with COW-DUNG SLURRY", s1 + 0.3), L("Treating with NEEM-based water preparations", s2 + 0.3)], { bottom: null })}>
        <Show lt={lt} a={0} b={s1 + 0.2}>
          <Pic slot="village_store" label="An Indian farming village" x={BOX.x} y={BOX.y} w={BOX.w} h={BOX.h} lt={lt} at={0} fx="zoom" />
          <Chip text="for a LONG time" x={720} y={840} lt={lt} at={W("b6", "long")} tone="gold" size={42} />
        </Show>
        <Show lt={lt} a={s1} b={s2 + 0.2}>
          <Pic slot="dung_mix" label="An elder mixes cow dung and water into a smooth slurry" {...P({})} lt={lt} at={s1} fx="zoom" />
          <Chip text="cow dung + water" x={520} y={90} lt={lt} at={cSm} size={38} />
          <Pic slot="dung_dry" label="Coated seeds drying in the shade" x={590} y={560} w={380} h={330} lt={lt} at={cWa + 0.1} fx="pop" />
        </Show>
        <Show lt={lt} a={s2} b={cMade + 0.2}>
          <Pic slot="neem_crush" label="Neem leaves are crushed" {...P({})} lt={lt} at={s2} fx="zoom" />
          <Chip text="NEEM" x={520} y={90} lt={lt} at={s2 + 0.3} tone="green" size={40} />
        </Show>
        <Show lt={lt} a={cMade} b={s3 + 0.2}>
          <Pic slot="neem_mix" label="Crushed neem soaked in water" {...P({})} lt={lt} at={cMade} fx="zoom" />
          <Chip text="NEEM water" x={520} y={90} lt={lt} at={cMade + 0.1} tone="green" size={40} />
          <Pic slot="neem_dip" label="Seeds dipped in green neem water" x={590} y={560} w={380} h={330} lt={lt} at={cTree - 0.2} fx="pop" />
        </Show>
        <Show lt={lt} a={s3}>
          <Pic slot="field_neem" label="A farmer's field with a neem tree at its edge" {...P({})} lt={lt} at={s3} fx="zoom" />
          <Badge text="TRADITIONAL WISDOM" x={120} y={830} lt={lt} at={cTr} size={40} />
        </Show>
        {lt > s1 - 0.3 && <>
          <Dark lt={lt} at={s1 - 0.3} x={1020} w={380} />
          <SVG op={out3(lt, s1 - 0.3, 0.4)}><Hero x={CX} y={400} s={0.98} lt={lt} layers={[{ c: SH1, p: drive(lt, shA, shA + 1) }, { c: SH2, p: drive(lt, shB, shB + 1) }]} /></SVG>
          <Tag text="Shield 1" x={CX} y={640} lt={lt} at={shA + 0.4} size={34} bg={SH1} />
          <Tag text="Shield 2" x={CX} y={710} lt={lt} at={shB + 0.4} size={34} bg={SH2} />
        </>}
        <ShieldMeter lt={lt} at={s1 - 0.3} a={shA} b={shB} />
      </Scene>
    );
  };
}
// Petri dish: the friendly green fungus spreads and stops the harmful grey one.
function Petri({ cx, cy, r, lt, g, k }) {
  const blob = (x0, y0, R, seed) => { const pts = Array.from({ length: 48 }, (_, i) => { const a = i / 48 * 6.283, rr = R * (1 + 0.07 * Math.sin(a * 5 + seed) + 0.05 * Math.sin(a * 9 + seed * 2)); return [x0 + Math.cos(a) * rr, y0 + Math.sin(a) * rr]; });
    return "M" + pts.map((p) => p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" L ") + " Z"; };
  return <g>
    <circle cx={cx} cy={cy} r={r + 16} fill="#DCE6E3" stroke="#fff" strokeWidth="5" />
    <circle cx={cx} cy={cy} r={r} fill="#EFE6C8" stroke="#9FB0AA" strokeWidth="3" />
    <clipPath id="tp-petri"><circle cx={cx} cy={cy} r={r - 3} /></clipPath>
    <g clipPath="url(#tp-petri)">
      <path d={blob(cx + r * 0.62, cy + 8, r * (0.12 + 0.46 * k), 2)} fill="#8C9490" stroke="#5F6663" strokeWidth="3" />
      <path d={blob(cx - r * 0.58, cy - 6, r * (0.12 + 0.98 * g), 5)} fill="#59B868" stroke="#2F8043" strokeWidth="3" />
      {g > 0.3 && Array.from({ length: 16 }, (_, i) => <circle key={i} cx={cx - r * 0.85 + rnd(i) * r * 1.3 * g} cy={cy - r * 0.55 + rnd(i + 30) * r * 1.1} r={5} fill="#BFE9B8" />)}
    </g>
  </g>;
}
function B7(ctx) {
  const CX = 1210;
  return ({ localTime: lt, duration }) => {
    const s1 = S("b7", 1), cFr = W("b7", "friendly"), s2 = S("b7", 2), cPr = W("b7", "products"), s3 = S("b7", 3), cCrop = W("b7", "crop"), cProb = W("b7", "problem");
    const sh = cPr + 0.2, gr = drive(lt, cFr - 0.3, s2 - 0.1), kk = drive(lt, s1, cFr + 0.8);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[7]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(7, ctx, [L("BIOLOGICAL: friendly microbes", s1 + 0.3), L("CHEMICAL: specially formulated products", s2 + 0.3), L("Choice depends on the CROP and the PROBLEM", s3 + 0.3)])}>
        <Show lt={lt} a={0} b={s1 + 0.2}>
          <Pic slot="lab_seeds" label="Scientists study seeds under microscopes" x={BOX.x} y={BOX.y} w={BOX.w} h={BOX.h} lt={lt} at={0} fx="zoom" />
        </Show>
        <Show lt={lt} a={s1} b={s2 + 0.2}>
          <Dark lt={lt} at={s1} w={960} />
          <SVG><Petri cx={520} cy={450} r={320} lt={lt} g={gr} k={kk} /></SVG>
          <Chip text="BIOLOGICAL" x={520} y={84} lt={lt} at={s1 + 0.2} tone="gold" size={40} />
          <Chip text="friendly" x={300} y={830} lt={lt} at={cFr + 0.1} tone="green" size={36} />
          <Chip text="harmful" x={760} y={830} lt={lt} at={s1 + 0.8} size={36} />
        </Show>
        <Show lt={lt} a={s2} b={s3 + 0.2}>
          <Pic slot="coating_machine" label="Seeds tumble in a coating machine and come out evenly coloured" x={40} y={60} w={960} h={860} lt={lt} at={s2} fx="zoom" />
          <Chip text="CHEMICAL" x={520} y={84} lt={lt} at={s2 + 0.3} tone="gold" size={40} />
        </Show>
        <Show lt={lt} a={s3}>
          <Dark lt={lt} at={s3} w={960} />
          <Big x={40} y={150} w={960} lt={lt} at={s3} size={72} align="center">Which one is used?</Big>
          <Tag text="the CROP" x={300} y={360} lt={lt} at={cCrop} size={54} />
          <Tag text="the PROBLEM" x={740} y={360} lt={lt} at={cProb} size={54} />
          <SVG>
            <Arrow x1={320} y1={470} x2={470} y2={600} color={SK.gold} op={out3(lt, cCrop + 0.2, 0.4)} />
            <Arrow x1={720} y1={470} x2={570} y2={600} color={SK.gold} op={out3(lt, cProb + 0.2, 0.4)} />
          </SVG>
          <Big x={40} y={640} w={960} lt={lt} at={cProb + 0.4} size={54} align="center" color={SK.gold} serif={false}>BIOLOGICAL or CHEMICAL</Big>
        </Show>
        {lt > s1 - 0.3 && <>
          <Dark lt={lt} at={s1 - 0.3} x={1020} w={380} />
          <SVG op={out3(lt, s1 - 0.3, 0.4)}><Hero x={CX} y={400} s={0.98} lt={lt} layers={[{ c: SH1 }, { c: SH2 }, { c: SH3, p: drive(lt, sh, sh + 1) }]} /></SVG>
          <Tag text="Shield 3" x={CX} y={680} lt={lt} at={sh + 0.4} size={34} bg={SH3} />
        </>}
        <ShieldMeter lt={lt} a={-99} b={-99} c={sh} />
      </Scene>
    );
  };
}
function Warn({ x, y, s = 1 }) {
  return <g transform={`translate(${x} ${y}) scale(${s})`}><path d="M0 -44 L 50 40 L -50 40 Z" fill="#FFD84A" stroke="#fff" strokeWidth="5" strokeLinejoin="round" /><rect x="-5" y="-16" width="10" height="34" rx="4" fill={RED} /><circle cx="0" cy="29" r="6" fill={RED} /></g>;
}
function B8(ctx) {
  return ({ localTime: lt, duration }) => {
    const s1 = S("b8", 1), cTr = W("b8", "trained"), s2 = S("b8", 2), s3 = S("b8", 3), cEat = W("b8", "eaten"), s4 = S("b8", 4), cFed = W("b8", "fed"), s5 = S("b8", 5);
    const u = drive(lt, s1 - 0.5, s1 + 0.3), by = lerp(330, 60, u), bh = lerp(280, 100, u), fs = lerp(112, 58, u);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[8]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(8, ctx, [L("Chemical treatments: TRAINED ADULTS ONLY", s1 + 0.3), L("Follow instructions and safety precautions", s2), L("Treated seeds: NEVER food, NEVER animal feed", s3 + 0.4)])}>
        {lt < s1 + 0.4 && <Dark />}
        <Show lt={lt} a={s1 - 0.1} b={s3 + 0.2}>
          <Pic slot="adult_label" label="A trained adult in gloves and a mask reads a label carefully" x={40} y={180} w={1360} h={740} lt={lt} at={s1 - 0.1} fx="zoom" />
          <Tag text="TRAINED ADULTS ONLY" x={720} y={210} lt={lt} at={cTr} size={46} />
          <Tag text="follows the instructions and safety rules" x={720} y={830} lt={lt} at={s2 + 0.2} size={34} bg={SK.cream} />
        </Show>
        <Show lt={lt} a={s3}>
          <Pic slot="sack_treated" label="A sack of brightly coloured treated seeds" x={40} y={180} w={560} h={740} lt={lt} at={s3} fx="zoom" />
          <Tag text="treated seeds" x={320} y={200} lt={lt} at={s3 + 0.3} size={36} bg={SK.cream} />
          <Pic slot="plate_meal" label="A plate of food" x={620} y={200} w={380} h={420} lt={lt} at={cEat - 0.3} fx="pop" />
          <Pic slot="cow_trough" label="A cow's feed trough" x={1020} y={200} w={380} h={420} lt={lt} at={cFed - 0.3} fx="pop" />
          <SVG><Cross x={810} y={410} lt={lt} at={cEat + 0.1} /><Cross x={1210} y={410} lt={lt} at={cFed + 0.1} /></SVG>
          <Tag text="NEVER food" x={810} y={640} lt={lt} at={cEat + 0.3} size={40} bg={RED} fg={SK.white} />
          <Tag text="NEVER animal feed" x={1210} y={640} lt={lt} at={cFed + 0.3} size={36} bg={RED} fg={SK.white} />
          <Stamp text="SOWING ONLY" x={1010} y={800} lt={lt} at={W("b8", "sowing")} size={60} color={SK.bg1} rot={-3} />
        </Show>
        <div style={{ position: "absolute", left: 40, top: by, width: 1360, height: bh, borderRadius: 16, background: RED, boxShadow: "0 0 0 3px #fff, 0 8px 22px rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", gap: 30 * (1 + (1 - u)) }}>
          <svg width={lerp(180, 90, u)} height={lerp(180, 90, u)} viewBox="-60 -56 120 112"><Warn x={0} y={0} /></svg>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: fs, letterSpacing: "0.06em", color: SK.white }}>SAFETY FIRST</div>
        </div>
      </Scene>
    );
  };
}
function B9(ctx) {
  return ({ localTime: lt, duration }) => (
    <Scene lt={lt} dur={duration} captions={CAPS[9]} showCaps={ctx.caps} capSize={ctx.capSize}
      panel={panel(9, ctx, [L("You find a sack of brightly coloured seeds…", S("b9", 1), "think")])}>
      <Pic slot="storeroom_sack" label="A child finds an open sack of bright pink seeds in a storeroom (not touching it)" x={BOX.x} y={BOX.y} w={BOX.w} h={BOX.h} lt={lt} at={0} fx="zoom" zoom={1.06} pos="center top" />
      <StopBand lt={lt} b="b9" heading="WHAT WOULD YOU DO?">You find a sack of brightly coloured seeds…</StopBand>
    </Scene>
  );
}
function B10(ctx) {
  const F = window.TPStory.Flip;
  return ({ localTime: lt, duration }) => {
    const c0 = S("b10", 0), s2 = S("b10", 2), s3 = S("b10", 3), cSt = W("b10", "starve"), s4 = S("b10", 4), s5 = S("b10", 5), cGu = W("b10", "guard"), s6 = S("b10", 6), cMic = W("b10", "microbes"), cNut = W("b10", "nutrients"), cBag = W("b10", "backpack"),
      s7 = S("b10", 7), cIron = W("b10", "iron"), cMach = W("b10", "machines"), cBird = W("b10", "birds");
    const turn = cSt - 0.3, ins = lt < turn ? lerp(1400, 1130, drive(lt, s2 + 0.5, turn)) : lerp(1130, 1460, drive(lt, turn + 0.2, turn + 2));
    const pk = drive(lt, cBag - 0.6, cBag + 0.1), open = drive(lt, s6 + 0.3, cMic - 0.1) * (1 - pk);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[10]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(10, ctx, [L("NEEM contains natural compounds that put off certain pests", s2), L("TRICHODERMA: a friendly fungus that guards seeds and roots", s4), L("Seed COATINGS can carry helpful microbes or nutrients", s6), L("JAPAN: precision coatings, e.g. iron-coated rice seed for machine sowing", s7)], { max: 2 })}>
        <Show lt={lt} a={0} b={s2 + 0.2}>
          <Pic slot="field_neem" label="A field with a neem tree" x={BOX.x} y={BOX.y} w={BOX.w} h={BOX.h} lt={lt} at={0} fx="zoom" dim={0.5} />
          <F x={330} y={290} w={780} h={300} lt={lt} at={c0} q="DID YOU KNOW?" size={72} />
        </Show>
        <Show lt={lt} a={s2} b={s4 + 0.2}>
          <Pic slot="neem_tree" label="The neem tree" x={40} y={60} w={760} h={860} lt={lt} at={s2} fx="zoom" />
          <Dark lt={lt} at={s2} x={820} w={580} />
          <SVG>
            <Hero x={1000} y={470} s={1.05} lt={lt} layers={[{ c: SH2 }]} />
            <g clipPath="url(#tp-card)"><clipPath id="tp-card"><rect x="820" y="60" width="580" height="860" rx="18" /></clipPath>
              {lt >= s2 + 0.4 && <Insect x={ins} y={lt < turn ? 620 : lerp(620, 560, drive(lt, turn, turn + 2))} s={0.9} flip={lt >= turn + 0.1} wig={lt * 12} />}</g>
          </SVG>
          <Tag text="pests put off" x={1110} y={150} lt={lt} at={s2 + 1.4} size={36} />
          <Stamp text="NO THANKS!" x={1110} y={800} lt={lt} at={cSt} size={50} color={SK.bg1} />
        </Show>
        <Show lt={lt} a={s4} b={s6 + 0.2}>
          <Under lt={lt} at={s4} surface={150} />
          <SVG>
            <path d="M720 150 C 700 330, 760 480, 700 840" stroke="#E9DFC4" strokeWidth="26" strokeLinecap="round" fill="none" />
            <path d="M712 420 C 620 480, 560 520, 420 560 M716 560 C 820 610, 900 620, 1040 700 M720 300 C 800 340, 860 350, 960 340" stroke="#E9DFC4" strokeWidth="14" strokeLinecap="round" fill="none" />
            <Clip><Threads x={40} p={0.55 * drive(lt, s5, s5 + 2) * (1 - 0.55 * drive(lt, s6 - 1.4, s6))} />
            {Array.from({ length: 34 }, (_, i) => { const a = i / 34 * 6.283 * 3 + lt * 0.4, r = 80 + (i % 5) * 34, sp = pop(lt, s4 + 0.3 + i * 0.025, 0.4);
              return sp > 0 ? <circle key={i} cx={724 + Math.cos(a) * r * 1.5} cy={470 + Math.sin(a) * r * 2.2} r={11 * clamp(sp, 0, 1.2)} fill="#7FD58A" stroke="#2F8043" strokeWidth="3" /> : null; })}</Clip>
          </SVG>
          <Chip text="TRICHODERMA: friendly fungus" x={1060} y={180} lt={lt} at={s4 + 0.2} tone="green" size={36} />
          <Chip text="guards the root" x={1120} y={780} lt={lt} at={cGu} tone="gold" size={38} />
        </Show>
        <Show lt={lt} a={s6} b={s7 + 0.2}>
          <Dark lt={lt} at={s6} />
          <SVG>
            <g transform="translate(720 490)">
              {pk > 0 && <g transform={`scale(${clamp(pop(lt, cBag - 0.4, 0.45), 0, 1.1)})`}>
                <path d="M122 -70 q -44 70 -6 130 M250 -92 q -60 -40 -116 -6" stroke="#fff" strokeWidth="9" fill="none" />
                <rect x="122" y="-92" width="150" height="190" rx="34" fill="#C2452D" stroke="#fff" strokeWidth="5" /><rect x="144" y="-12" width="106" height="78" rx="16" fill="#E2694E" stroke="#fff" strokeWidth="4" />
                <path d="M162 -92 q 35 -44 70 0" stroke="#fff" strokeWidth="8" fill="none" /></g>}
              <SeedBody x={0} y={0} s={2.2} face={false} />
              {[["#59B868", -78, -40, cMic], ["#59B868", -24, -92, cMic + 0.2], ["#59B868", 56, -74, cMic + 0.35], ["#4CA8E8", -62, 66, cNut], ["#4CA8E8", 30, 40, cNut + 0.15], ["#4CA8E8", 78, 16, cNut + 0.3]].map(([c, x, y, at], i) => {
                const o = clamp(pop(lt, at, 0.4), 0, 1.1) * (1 - pk); return o > 0.01 ? <g key={i} transform={`translate(${lerp(x, 190, pk)} ${lerp(y, 20, pk)}) scale(${o})`}>{c === "#59B868"
                  ? <g><rect x="-30" y="-15" width="60" height="30" rx="15" fill={c} stroke="#fff" strokeWidth="3" /><circle cx="-8" cy="-3" r="3.5" fill="#fff" /><circle cx="8" cy="-3" r="3.5" fill="#fff" /></g>
                  : <path d="M0 -26 C 20 0, 22 22, 0 26 C -22 22, -20 0, 0 -26 Z" fill={c} stroke="#fff" strokeWidth="3" />}</g> : null; })}
              {[-1, 1].map((sd) => <g key={sd} transform={`rotate(${sd * 62 * open} 0 150)`}>
                <path d={sd < 0 ? "M0 -146 C -92 -132 -136 -30 -118 50 C -100 124 -44 158 0 158 L 0 -146 Z" : "M0 -146 C 92 -132 136 -30 118 50 C 100 124 44 158 0 158 L 0 -146 Z"} fill="#E2B04C" stroke="#8C6414" strokeWidth="5" />
              </g>)}
              {open < 0.2 && <g transform="scale(2.2)">
                <circle cx="-18" cy="2" r="6.5" fill="#2B1C10" /><circle cx="18" cy="2" r="6.5" fill="#2B1C10" /><path d="M-15 22 Q0 36 15 22" stroke="#2B1C10" strokeWidth="4.5" strokeLinecap="round" fill="none" /></g>}
            </g>
          </SVG>
          <Chip text="seed coating" x={720} y={84} lt={lt} at={s6 + 0.2} tone="gold" size={38} />
          <Tag text="helpful microbes" x={290} y={330} lt={lt} at={cMic} size={36} bg="#59B868" />
          <Tag text="nutrients" x={290} y={590} lt={lt} at={cNut} size={36} bg="#7CC8F2" />
          <Tag text="like a backpack!" x={960} y={760} lt={lt} at={cBag} size={38} />
        </Show>
        <Show lt={lt} a={s7}>
          <Pic slot="japan_sow" label="Japan: a machine sows coated rice seed in a rice field" x={BOX.x} y={BOX.y} w={BOX.w} h={BOX.h} lt={lt} at={s7} fx="zoom" />
          <Chip text="JAPAN" x={150} y={84} lt={lt} at={s7 + 0.2} tone="gold" size={40} />
          <div style={{ position: "absolute", left: 1040, top: 90, width: 330, height: 330, borderRadius: 20, background: "rgba(5,30,22,0.82)", boxShadow: "0 0 0 3px rgba(226,176,76,0.9)", opacity: out3(lt, cIron - 0.3, 0.5) }} />
          <SVG op={out3(lt, cIron - 0.3, 0.5)}>
            {[-1, 0, 1].map((k) => <g key={k} transform={`translate(${1205 + k * 76} 236) rotate(${k * 14}) scale(0.56 1.1)`}><SeedBody x={0} y={0} tint="#8A5A3A" edge="#3D3D3D" face={false} /></g>)}
            <T x={1205} y={382} size={34} bold>thin layer of IRON</T>
          </SVG>
          <Tag text="sown evenly by machine" x={500} y={700} lt={lt} at={cMach} size={38} bg={SK.cream} />
          <Tag text="protected from birds" x={500} y={780} lt={lt} at={cBird} size={38} />
        </Show>
      </Scene>
    );
  };
}
function B11(ctx) {
  const GX = 720, GY = 560, SURF = 340;
  return ({ localTime: lt, duration }) => {
    const cBig = W("b11", "big"), s1 = S("b11", 1), q1 = S("b11", 2), q2 = S("b11", 3), q3 = S("b11", 4), st = stopAt("b11", 4), a1 = S("b11", 5), a2 = S("b11", 6), a3 = S("b11", 7);
    const y = lerp(170, GY, drive(lt, 0.3, 2.2)), g = drive(lt, 2, cBig + 1.2), hold = windowOp(lt, st, st + 14.8, 0.3);
    const rows = [["One traditional treatment?", q1, "Cow-dung slurry or neem", a1], ["Who may handle chemical treatments?", q2, "TRAINED adults only", a2], ["Can treated seeds be eaten?", q3, "NEVER!", a3]];
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[11]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(11, ctx, [L("Small seed, BIG difference", cBig, "big"), L("QUICK CHECK", s1, "head"), L("1. One traditional treatment?", q1), L("2. Who may handle chemical treatments?", q2), L("3. Can treated seeds be eaten?", q3)], { max: 5 })}>
        <Show lt={lt} a={0} b={s1 + 0.2}>
          <Under lt={lt} surface={SURF} />
          <SVG>
            <Sprout x={GX} y={GY} g={g} h={330} sw={14} leaves={1.5} />
            {[-420, 420].map((dx, i) => <g key={i} opacity={clamp(g * 4 - 0.3, 0, 1)}><Sprout x={GX + dx} y={GY} g={g * (i ? 0.95 : 0.9)} h={300} sw={12} leaves={1.3} /><SeedBody x={GX + dx} y={GY} s={0.82} /></g>)}
            <Hero x={GX} y={y} s={0.82} lt={lt} layers={[{ c: SH1 }, { c: SH2 }, { c: SH3 }]} />
          </SVG>
          <Card x={210} y={770} w={1020} h={120} lt={lt} at={cBig} />
          <Big x={BOX.x} y={790} w={BOX.w} lt={lt} at={cBig} size={60} align="center">Small seed, <span style={{ color: SK.gold }}>BIG</span> difference</Big>
        </Show>
        <Show lt={lt} a={s1}>
          <div style={{ position: "absolute", left: 40, top: 60, width: 1360, height: 860, borderRadius: 26, background: "rgba(5,30,22,0.92)", boxShadow: "0 0 0 3px rgba(226,176,76,0.9)", boxSizing: "border-box", padding: "36px 60px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20 }}>
              <svg width="62" height="62" viewBox="0 0 90 90"><circle cx="45" cy="45" r="43" fill={SK.gold} /><rect x="28" y="24" width="12" height="42" rx="4" fill={SK.ink} /><rect x="50" y="24" width="12" height="42" rx="4" fill={SK.ink} /></svg>
              <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 34, letterSpacing: "0.08em", color: SK.ink, background: SK.gold, padding: "9px 28px", borderRadius: 14 }}>QUICK CHECK</div>
            </div>
            {rows.map(([q, t, ans, at], i) => { const o = out3(lt, t, 0.5);
              return <div key={i} style={{ position: "relative", height: 210, marginTop: 8, opacity: o, transform: `translateY(${(1 - o) * 12}px)` }}>
                <div style={{ display: "flex", gap: 22, alignItems: "baseline", paddingTop: 22 }}>
                  <span style={{ flex: "none", width: 46, fontFamily: SERIF, fontWeight: 700, fontSize: 50, color: SK.gold }}>{i + 1}</span>
                  <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 52, lineHeight: 1.15, color: SK.white, whiteSpace: "nowrap" }}>{q}</span></div>
                <Tag text={ans} x={68} y={106} lt={lt} at={at} size={44} anchor="left" />
              </div>; })}
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 22, textAlign: "center", fontFamily: SANS, fontSize: 26, color: SK.dim, opacity: hold }}>Stop 3 of {STOPS.length}</div>
          </div>
        </Show>
        <ShieldMeter lt={lt} a={-99} b={-99} c={-99} />
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
const COLLAGE = [{ slot: "field_rows", x: -60, y: -40, w: 760, h: 520, ph: 0 }, { slot: "field_neem", x: 640, y: -80, w: 760, h: 520, ph: 2 },
  { slot: "sow_scatter", x: -80, y: 520, w: 700, h: 560, ph: 4 }, { slot: "village_store", x: 560, y: 560, w: 820, h: 560, ph: 1 }];
function Lp28Scenes(props = {}) {
  const caps = props.showCaptions === "false" ? false : props.showCaptions !== false;
  const titles = {};
  for (let n = 1; n <= NB; n++) titles[n] = str(props["title" + n + "Text"], TITLES[n]);
  const ctx = { caps, titles, capSize: num(props.captionSize, 34) };
  const B = [B1, B2, B3, B4, B5, B6, B7, B8, B9, B10, B11];
  const beats = B.map((Bn, i) => { const t = BEAT("b" + (i + 1)); return [t.start, t.start + t.dur, Bn]; });
  return (
    <StoryFrame props={props} dur={DUR} persistKey={"thinkpro-" + SLUG} collage={COLLAGE}>
      {beats.map(([s, e, Bn], i) => (
        <Sprite key={i} start={s} end={e}>{Bn(ctx)}</Sprite>
      ))}
      {STOPS.map(([b, i, hold]) => <StopAt key={b} t={BEAT(b).start + stopAt(b, i)} hold={hold - 0.2} />)}
      <ChimeAt t={BEAT("b10").start + S("b10", 0, 0)} />
      <AudioSync />
    </StoryFrame>
  );
}
window.Lp28Scenes = Lp28Scenes;
