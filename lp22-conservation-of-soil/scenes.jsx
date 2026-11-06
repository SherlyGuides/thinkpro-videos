/* global React, window */
// ThinkPro Academy — "Conservation of Soil" (Grade 6 Agriculture, Session 22, V1).
// After AG_G6_S22 Video Script (Subrata, 4 Nov 2026): 12 script scenes as 12 voiced beats, three
// presenter stops (b5, b9, b12; TPStory.StopAt: the web player freezes, the export holds), one WOW card
// (b10, chime). Running idea: the SOIL SHIELDS. A rack of six shields sits in the right panel; each
// method pops a big shield over the picture, which flies into the rack (b6–b8). All six surround the
// farm in b12. Every method = a photo plus a small drawn diagram that shows the mechanism (rain on
// straw, roots gripping, water pausing on steps, bunds holding water, furrows as tiny dams).
// STORY STYLE (engine/story-kit.jsx). Pure function of time.
const { Sprite } = window;
const { reveal, windowOp } = window.TPMotion;
const { num, str } = window.TPStage;
const { SK, SERIF, SANS, LEFT_W, pop, out3, lerp, drive,
  Pic, Chip, Badge, Big, SVG, Arrow, T, ChimeAt, Scene, StoryFrame, StopAt, Flip } = window.TPStory;

// ---- Timing: EVERYTHING is keyed to the narration (tools/fit_timing.py → timing.js).
const TM = window.TP_TIMING;
if (!TM) console.error("timing.js missing — run: python3 tools/fit_timing.py videos/lp22-conservation-of-soil");
const LEAD = TM ? TM.lead : 1.0;
const DUR = TM ? TM.total : 260;
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
const NB = 12;
const CAPS = {};
if (TM) for (let n = 1; n <= NB; n++) CAPS[n] = capsFor("b" + n);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rnd = (i) => { const x = Math.sin(i * 12.9898 + 4.1) * 43758.5453; return x - Math.floor(x); };

// ---- Panel copy. Title defaults mirror the DC data-props (titleNText) — keep in sync. ----
const TITLES = { 1: "LP22 – Conservation of Soil", 2: "Soil conservation", 3: "Topsoil", 4: "Soil erosion", 5: "Look around", 6: "Soil Shields 1 and 2",
  7: "Soil Shields 3 and 4", 8: "Soil Shields 5 and 6", 9: "Your turn", 10: "WOW! Living root bridges", 11: "Why it matters", 12: "Quick check" };
const KICK = "Grade 6 · Agriculture · Session 22";
const KICKS = { 10: "WOW!" };
const panel = (n, ctx, lines, extra = {}) => ({ kicker: KICKS[n] || KICK, title: ctx.titles[n], lines, ...extra });
const L = (text, at, kind = "item", extra = {}) => ({ text, at, kind, ...extra });

// ---- Presenter stops: [beat, sentence index whose pauseAfter is the hold, hold s]
const STOPS = [["b5", 1, 15.0], ["b9", 2, 15.0], ["b12", 3, 15.0]];
const stopAt = (b, i) => SE(b, i) + 0.1;                       // beat-local start of the hold
const stopFor = (b) => STOPS.find((s) => s[0] === b);
const PauseIcon = ({ s = 70 }) => <svg width={s} height={s} viewBox="0 0 90 90" style={{ flex: "none" }}><circle cx="45" cy="45" r="43" fill={SK.gold} /><rect x="28" y="24" width="12" height="42" rx="4" fill={SK.ink} /><rect x="50" y="24" width="12" height="42" rx="4" fill={SK.ink} /></svg>;
// The kit's StopCard covers the whole picture with a fixed heading. The script's stops have their own
// headings (LOOK AROUND, YOUR TURN, QUICK CHECK) and "freeze on" a picture, so this is a strip that
// keeps the picture visible, placed at top/height.
function StopStrip({ lt, b, heading, question, top = 640, height = 300, left = 40, width = LEFT_W - 80 }) {
  const s = stopFor(b), at = stopAt(b, s[1]), hold = s[2] - 0.2, n = STOPS.indexOf(s) + 1;
  const o = windowOp(lt, at, at + hold + 0.4, 0.35); if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left, top, width, height, borderRadius: 26, background: "rgba(5,30,22,0.9)", opacity: o, zIndex: 3,
      boxShadow: "0 0 0 3px rgba(226,176,76,0.9)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 50px", boxSizing: "border-box", textAlign: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
        <PauseIcon s={60} />
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 32, letterSpacing: "0.08em", color: SK.ink, background: SK.gold, padding: "8px 28px", borderRadius: 14 }}>{heading}</div>
      </div>
      {question && <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 50, lineHeight: 1.18, color: SK.white, marginTop: 20 }}>{question}</div>}
      <div style={{ fontFamily: SANS, fontSize: 26, color: SK.dim, marginTop: 16 }}>Stop {n} of {STOPS.length}</div>
    </div>
  );
}
// Red warning tag (the kit's Chip has no red tone).
function Tag({ text, x, y, lt, at, out = null, size = 28 }) {
  const o = pop(lt, at) * (out != null ? 1 - reveal(lt, out, 0.4) : 1); if (o <= 0) return null;
  return <div style={{ position: "absolute", left: x, top: y, transform: `translateX(-50%) scale(${0.9 + 0.1 * o})`, transformOrigin: "center top", opacity: o, fontFamily: SANS, fontWeight: 700, zIndex: 2,
    fontSize: size, color: SK.white, background: "#B3261E", padding: "6px 18px", borderRadius: 999, whiteSpace: "nowrap", boxShadow: "0 2px 10px rgba(0,0,0,0.25)" }}>{text}</div>;
}

// ---- Picture area ----------------------------------------------------------------
const PX = 40, PY = 50, PW = LEFT_W - 80, PH = 930;
const Full = (p) => <Pic x={PX} y={PY} w={PW} h={PH} {...p} />;

// ---- The Soil Shields -----------------------------------------------------------------
const SHIELD_D = "M0 -58 C18 -48 36 -44 50 -44 L50 0 C50 32 26 50 0 60 C-26 50 -50 32 -50 0 L-50 -44 C-36 -44 -18 -48 0 -58 Z";
const SHIELDS = ["Mulching", "Trees, grass", "Terraces", "Bunds", "Contour", "No bare fields"];
function Glyph({ n, c = SK.ink }) {
  const sw = { stroke: c, strokeWidth: 6, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" };
  switch (n) {
    case 1: return <g {...sw}><line x1={-30} y1={20} x2={30} y2={20} /><line x1={-26} y1={8} x2={-8} y2={-4} /><line x1={-8} y1={10} x2={12} y2={-6} /><line x1={8} y1={8} x2={28} y2={-2} /></g>;
    case 2: return <g {...sw}><g stroke="none" fill={c}><circle cx={0} cy={-24} r={15} /><circle cx={-15} cy={-10} r={13} /><circle cx={15} cy={-10} r={13} /></g><line x1={0} y1={-8} x2={0} y2={18} /><path d="M-30 18 L30 18 M0 18 L-14 34 M0 18 L14 34" /></g>;
    case 3: return <path d="M-32 -18 L-14 -18 L-14 0 L6 0 L6 18 L28 18 L28 32" {...sw} />;
    case 4: return <g {...sw}><path d="M-34 24 L-24 -2 L-12 -2 L-4 24" /><path d="M34 24 L24 -2 L12 -2 L4 24" /><line x1={-34} y1={24} x2={34} y2={24} /></g>;
    case 5: return <g {...sw}><path d="M-32 -16 Q0 -36 32 -16" /><path d="M-32 6 Q0 -14 32 6" /><path d="M-32 28 Q0 8 32 28" /></g>;
    default: return <g {...sw}><line x1={-32} y1={24} x2={32} y2={24} />{[-24, -8, 8, 24].map((x) => <line key={x} x1={x} y1={22} x2={x + 3} y2={-6} />)}</g>;
  }
}
function Shield({ x, y, s = 1, n, lit = true, op = 1, name }) {
  if (op <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
      <path d={SHIELD_D} fill={lit ? SK.gold : "rgba(22,58,44,0.05)"} stroke={lit ? SK.ink : SK.inkDim} strokeWidth={lit ? 3 : 2.5} strokeDasharray={lit ? "none" : "7 6"} />
      {lit ? <Glyph n={n} /> : <text x={0} y={16} textAnchor="middle" fontFamily={SERIF} fontWeight="700" fontSize="44" fill={SK.inkDim}>{n}</text>}
      {name && <text x={0} y={86} textAnchor="middle" fontFamily={SANS} fontWeight="700" fontSize="26" fill={SK.white}>{name}</text>}
    </g>
  );
}
// Rack in the panel. ats[i]: the moment shield i+1 is earned (beat-local; -99 = already earned, 1e9 = later).
// An earned shield pops big over the picture, holds a moment, then flies into its slot.
const RX = [1525, 1660, 1795], RY = [786, 892], RS = 0.72, HERO = [720, 300];
function Rack({ lt, ats, hero = HERO }) {
  return (
    <SVG>
      <text x={1660} y={732} textAnchor="middle" fontFamily={SANS} fontWeight="700" fontSize="19" letterSpacing="2.5" fill={SK.goldDeep}>SOIL SHIELDS</text>
      {ats.map((at, i) => {
        const x = RX[i % 3], y = RY[Math.floor(i / 3)], n = i + 1, name = SHIELDS[i];
        const lit = lt >= at + 0.9;
        return <g key={i}>
          <Shield x={x} y={y} s={RS} n={n} lit={lit} />
          <text x={x} y={y + 60} textAnchor="middle" fontFamily={SANS} fontWeight="700" fontSize="20" fill={lit ? SK.ink : SK.inkDim}>{name}</text>
        </g>;
      })}
      {ats.map((at, i) => {
        if (lt < at || lt > at + 1.8) return null;
        const q = drive(lt, at + 0.9, at + 1.7), a = pop(lt, at, 0.5), x = lerp(hero[0], RX[i % 3], q), y = lerp(hero[1], RY[Math.floor(i / 3)], q);
        return <Shield key={"f" + i} x={x} y={y} s={lerp(2.6 * a, RS, q)} n={i + 1} name={q < 0.05 ? `SHIELD ${i + 1}` : null} />;
      })}
    </SVG>
  );
}

// ---- Rain, used by all the diagrams ------------------------------------------------------
// hit(px) = the ground under the drop. spl(px) = splash colour.
function Rain({ x, w, top, hit, lt, n = 34, speed = 1.3, op = 1, spl = () => "#BFE3F7" }) {
  if (op <= 0) return null;
  return (
    <g opacity={op}>
      {Array.from({ length: n }, (_, i) => {
        const px = x + w * rnd(i + 11), f = hit(px), per = 0.8 + 0.4 * rnd(i + 70);
        const ph = (lt * speed / per + rnd(i + 31)) % 1, cy = lerp(top, f, Math.min(1, ph / 0.86));
        if (ph > 0.86) { const k = (ph - 0.86) / 0.14, c = spl(px);
          return <g key={i} stroke={c} strokeWidth={3} strokeLinecap="round" opacity={1 - k}><line x1={px} y1={f} x2={px - 12 * k - 2} y2={f - 16 * k} /><line x1={px} y1={f} x2={px + 12 * k + 2} y2={f - 16 * k} /></g>; }
        return <line key={i} x1={px} y1={cy - 16} x2={px} y2={cy} stroke="#9FD2F0" strokeWidth={3} strokeLinecap="round" />;
      })}
    </g>
  );
}
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
// Diagram card over a photo: local coordinates 0..w, 0..h, clipped.
const DX = 720, DY = 460, DW = 660, DH = 490;
function Dia({ id, lt, at, out = null, x = DX, y = DY, w = DW, h = DH, children }) {
  const o = out3(lt, at, 0.6) * (out != null ? 1 - reveal(lt, out, 0.45) : 1); if (o <= 0) return null;
  return (
    <SVG op={o}>
      <defs><clipPath id={id}><rect x={0} y={0} width={w} height={h} rx={20} /></clipPath></defs>
      <g transform={`translate(${x} ${y})`}>
        <rect x={0} y={0} width={w} height={h} rx={20} fill="#0B2E22" />
        <g clipPath={`url(#${id})`}>{children}</g>
        <rect x={0} y={0} width={w} height={h} rx={20} stroke={SK.gold} strokeWidth={3} />
      </g>
    </SVG>
  );
}
const SOIL_T = "#3B2A20", SOIL_M = "#6E5138", SOIL_L = "#A5825A", BLUE = "#6FB7E0", MUD = "#B98A5E";

// --- Shield 1: straw blanket. Bare soil spits up; straw takes the rain instead.
const STRAW = Array.from({ length: 90 }, (_, i) => ({ x: 8 + 644 * rnd(i + 200), y: 296 - 16 * rnd(i + 300), a: -30 + 60 * rnd(i + 400), l: 26 + 14 * rnd(i + 500) }));
function Mulch({ lt, coverAt }) {
  const G = 310, spread = (px) => clamp((lt - coverAt) / 1.8 - px / 660, -1, 1);
  const covered = (px) => spread(px) > 0;
  return <g>
    <rect x={0} y={G} width={DW} height={DH - G} fill={SOIL_M} /><rect x={0} y={G} width={DW} height={52} fill={SOIL_T} />
    {[120, 330, 540].map((x) => <Sprout key={x} x={x} y={G} g={1} s={1.4} />)}
    {STRAW.map((s, i) => { const o = clamp(spread(s.x) * 5, 0, 1); if (o <= 0) return null;
      const r = s.a * Math.PI / 180; return <line key={i} x1={s.x} y1={s.y + 8} x2={s.x + s.l * Math.cos(r)} y2={s.y + 8 + s.l * Math.sin(r) * 0.5} stroke={i % 3 ? "#E0BE6A" : "#C79E4C"} strokeWidth={5} strokeLinecap="round" opacity={o} />; })}
    <Rain x={0} w={DW} top={-10} hit={(px) => covered(px) ? G - 22 : G} lt={lt} n={40} spl={(px) => covered(px) ? "#BFE3F7" : MUD} />
    <T x={DW / 2} y={DH - 34} size={30} bold color={SK.cream} op={1 - reveal(lt, coverAt + 1, 0.4)}>Bare soil: rain knocks it loose</T>
    <T x={DW / 2} y={DH - 34} size={30} bold color={SK.gold} op={reveal(lt, coverAt + 1.2, 0.4)}>Straw takes the hit, like a blanket</T>
  </g>;
}
// --- Shield 2: roots fan out and grip the slope. Loose grains stop sliding once they grip.
const ROOTS = [[-110, 60], [-70, 130], [-24, 170], [28, 170], [78, 120], [120, 52]];
function Rooted({ ox, oy, g, s = 1 }) {
  return <g transform={`translate(${ox} ${oy}) scale(${s})`}>
    {ROOTS.map(([dx, dy], i) => <g key={i}>
      <path d={`M0 0 Q ${dx * 0.3} ${dy * 0.7} ${dx} ${dy}`} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - g} stroke="#E9DCC0" strokeWidth={7} strokeLinecap="round" />
      <path d={`M${dx * 0.55} ${dy * 0.62} q ${dx * 0.2 + 16} 14 ${dx * 0.3 + (i % 2 ? 18 : -18)} ${dy * 0.3 + 14}`} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - clamp(g * 2 - 1, 0, 1)} stroke="#E9DCC0" strokeWidth={4} strokeLinecap="round" />
    </g>)}
  </g>;
}
function RootsDia({ lt, growAt, gripAt }) {
  const sy = (x) => 150 + 0.26 * x, g = drive(lt, growAt, gripAt - 0.2), gr = out3(lt, growAt - 0.3, 1.4);
  const slide = 1 - reveal(lt, gripAt - 0.4, 0.5);
  return <g>
    <path d={`M0 ${sy(0)} L${DW} ${sy(DW)} L${DW} ${DH} L0 ${DH} Z`} fill={SOIL_M} />
    <path d={`M0 ${sy(0)} L${DW} ${sy(DW)} L${DW} ${sy(DW) + 46} L0 ${sy(0) + 46} Z`} fill={SOIL_T} />
    {[150, 420].map((x, i) => <g key={x}>
      <Rooted ox={x} oy={sy(x) + 4} g={g} s={i ? 1.05 : 1.15} />
      <g transform={`translate(${x} ${sy(x)})`} opacity={gr}><rect x={-6} y={-110 * gr} width={12} height={110 * gr} rx={4} fill="#7A5A3A" /><circle cx={0} cy={-124 * gr} r={46 * gr} fill="#5FAE63" /><circle cx={-26 * gr} cy={-98 * gr} r={28 * gr} fill="#4E9A5E" /><circle cx={28 * gr} cy={-96 * gr} r={30 * gr} fill="#6FBF6E" /></g>
    </g>)}
    {[40, 90, 240, 285, 330, 520, 580, 630].map((x, i) => <g key={x} stroke="#8BD48A" strokeWidth={5} strokeLinecap="round" opacity={gr}>
      <line x1={x} y1={sy(x)} x2={x - 7} y2={sy(x) - 28 * gr} /><line x1={x} y1={sy(x)} x2={x + 2} y2={sy(x) - 36 * gr} /><line x1={x} y1={sy(x)} x2={x + 10} y2={sy(x) - 26 * gr} /></g>)}
    <g opacity={slide}>{Array.from({ length: 14 }, (_, i) => { const p = (lt * 0.28 + rnd(i + 5)) % 1, x = p * DW; return <circle key={i} cx={x} cy={sy(x) - 6 - 5 * rnd(i)} r={5 + 3 * rnd(i + 9)} fill={MUD} />; })}</g>
    <T x={DW - 20} y={60} size={30} bold anchor="end" color={SK.gold} op={reveal(lt, gripAt - 0.3, 0.4)}>Roots grip like fingers</T>
    <T x={DW - 20} y={60} size={30} bold anchor="end" color={SK.cream} op={1 - reveal(lt, gripAt - 0.3, 0.4)}>Roots grow into the soil</T>
  </g>;
}
// --- Shield 3: a slope morphs into steps. Water races first, then pauses on every step.
const N_STEP = 5, STX = (i) => 20 + i * 124, SLOPE = (x) => 90 + 0.56 * x;
const TREAD = (i) => SLOPE(STX(i) + 62);
function TerraceDia({ lt, cutAt, slowAt }) {
  const m = drive(lt, cutAt, cutAt + 1.8);
  const pts = [[0, SLOPE(0)]];
  for (let i = 0; i < N_STEP; i++) { pts.push([STX(i), lerp(SLOPE(STX(i)), TREAD(i), m)]); pts.push([STX(i + 1), lerp(SLOPE(STX(i + 1)), TREAD(i), m)]); }
  pts.push([DW, SLOPE(STX(N_STEP))]);
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0]} ${p[1]}`).join(" ");
  const pool = out3(lt, slowAt, 1.0), race = 1 - reveal(lt, cutAt, 0.6);
  const per = 6, q = ((lt - slowAt) % per + per) % per / per * N_STEP, si = Math.floor(q), f = q - si;   // one drop walking down the steps
  const bx = lerp(STX(si) + 8, STX(si + 1) - 8, Math.min(1, f / 0.75)), by = f < 0.75 ? TREAD(si) - 12 : lerp(TREAD(si), si < N_STEP - 1 ? TREAD(si + 1) : TREAD(si), (f - 0.75) / 0.25) - 12;
  return <g>
    <path d={`${d} L${DW} ${DH} L0 ${DH} Z`} fill={SOIL_M} />
    <path d={d} stroke="#6FBF6E" strokeWidth={10} strokeLinejoin="round" fill="none" />
    <g opacity={race}>{[0, 1, 2].map((k) => <line key={k} x1={0} y1={SLOPE(0) - 8} x2={DW} y2={SLOPE(DW) - 8} stroke={k === 1 ? MUD : BLUE} strokeWidth={8} strokeLinecap="round" strokeDasharray="46 110" strokeDashoffset={-lt * 640 - k * 52} />)}</g>
    {pool > 0 && Array.from({ length: N_STEP }, (_, i) => <rect key={i} x={STX(i) + 4} y={TREAD(i) - 13 * pool - 4} width={116} height={13 * pool} rx={4} fill={BLUE} />)}
    {lt > slowAt && <circle cx={bx} cy={by - 6} r={12} fill="#CFEBFA" />}
    <Rain x={0} w={DW} top={-10} hit={(px) => { const i = clamp(Math.floor((px - 20) / 124), 0, N_STEP - 1); return lerp(SLOPE(px), TREAD(i), m) - 6; }} lt={lt} n={22} />
    <T x={DW - 24} y={56} size={30} bold anchor="end" color={SK.white} op={1 - reveal(lt, slowAt, 0.4)}>A steep slope: water races</T>
    <T x={DW - 24} y={56} size={30} bold anchor="end" color={SK.gold} op={reveal(lt, slowAt, 0.4)}>Water pauses on each step</T>
  </g>;
}
// --- Shield 4: bunds rise; water stays in the field and soaks down.
function BundDia({ lt, wallAt, keepAt }) {
  const G = 300, bh = 74 * out3(lt, wallAt, 1.0), lvl = 50 * drive(lt, wallAt + 0.5, keepAt + 1.2), run = 1 - reveal(lt, wallAt, 0.5);
  const wall = (a, b, c, e) => `M${a} ${G} L${b} ${G - bh} L${c} ${G - bh} L${e} ${G} Z`;
  return <g>
    <rect x={0} y={G} width={DW} height={DH - G} fill={SOIL_M} /><rect x={0} y={G} width={DW} height={40} fill={SOIL_T} />
    {lvl > 0 && <rect x={120} y={G - lvl} width={420} height={lvl} fill={BLUE} opacity={0.9} />}
    {lvl > 0 && Array.from({ length: 16 }, (_, i) => { const p = (lt * 0.3 + rnd(i + 3)) % 1, x = 140 + 380 * rnd(i + 8); return <circle key={i} cx={x} cy={G + 4 + p * 120} r={6} fill={BLUE} opacity={(1 - p) * 0.9} />; })}
    {[150, 330, 500].map((x) => <Sprout key={x} x={x} y={G} g={1} s={1.2} />)}
    <path d={wall(60, 88, 122, 150)} fill="#8A6A48" /><path d={wall(510, 538, 572, 600)} fill="#8A6A48" />
    <g opacity={run}>{[-1, 1].map((sg) => [0, 1].map((k) => <line key={sg + "" + k} x1={330} y1={G - 7} x2={330 + sg * 340} y2={G - 7} stroke={k ? MUD : BLUE} strokeWidth={8} strokeLinecap="round" strokeDasharray="36 90" strokeDashoffset={-lt * 420 - k * 44} />))}</g>
    <Rain x={0} w={DW} top={-10} hit={(px) => px > 120 && px < 540 ? G - lvl : G - (px > 60 && px < 150 || px > 510 && px < 600 ? bh : 0)} lt={lt} n={30} />
    <T x={DW / 2} y={DH - 34} size={30} bold color={SK.cream} op={1 - reveal(lt, wallAt + 0.6, 0.4)}>No walls: water and soil run away</T>
    <T x={DW / 2} y={DH - 34} size={30} bold color={SK.gold} op={reveal(lt, wallAt + 0.8, 0.4)}>Water and soil stay inside</T>
  </g>;
}
// --- Shield 5: the same slope from above, ploughed two ways.
const FW = 400, FH = 490;
const CURVE = (k) => { const y = 66 + k * 58, c = 34; return `M0 ${y + c} C ${FW * 0.3} ${y - c}, ${FW * 0.7} ${y - c}, ${FW} ${y + c}`; };
function FieldFrom({ x, y, children, id }) {
  return <g transform={`translate(${x} ${y})`}>
    <defs><linearGradient id={id} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#7A5B41" /><stop offset="1" stopColor="#5A4230" /></linearGradient><clipPath id={id + "c"}><rect width={FW} height={FH} rx={14} /></clipPath></defs>
    <rect width={FW} height={FH} rx={14} fill={`url(#${id})`} /><g clipPath={`url(#${id}c)`}>{children}</g><rect width={FW} height={FH} rx={14} stroke="rgba(255,255,255,0.5)" strokeWidth={3} />
  </g>;
}
function ContourDia({ lt, alongAt, downAt, furrowAt }) {
  const W2 = 960, H2 = 700;
  return <Dia id="dc" lt={lt} at={alongAt} x={410} y={240} w={W2} h={H2}>
    <FieldFrom x={500} y={110} id="cf1">
      {Array.from({ length: 7 }, (_, k) => <path key={k} d={CURVE(k)} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - drive(lt, alongAt + k * 0.2, alongAt + 1.3 + k * 0.2)} stroke="#2E2018" strokeWidth={13} strokeLinecap="round" fill="none" />)}
      {Array.from({ length: 7 }, (_, k) => <path key={k} d={CURVE(k)} stroke={BLUE} strokeWidth={7} strokeLinecap="round" fill="none" opacity={out3(lt, furrowAt + k * 0.12, 0.6)} pathLength={1} strokeDasharray="0.1 0.05" />)}
      <Rain x={0} w={FW} top={0} hit={() => 470} lt={lt} n={16} op={out3(lt, furrowAt, 0.5)} />
    </FieldFrom>
    <T x={700} y={72} size={32} bold color={SK.gold}>ALONG the curves</T>
    <g opacity={out3(lt, downAt, 0.5)}>
      <FieldFrom x={60} y={110} id="cf2">
        {Array.from({ length: 8 }, (_, k) => <line key={k} x1={36 + k * 47} y1={-6} x2={36 + k * 47} y2={FH + 6} stroke="#2E2018" strokeWidth={13} />)}
        {Array.from({ length: 8 }, (_, k) => <line key={k} x1={36 + k * 47} y1={0} x2={36 + k * 47} y2={FH} stroke={k % 2 ? BLUE : MUD} strokeWidth={8} strokeLinecap="round" strokeDasharray="30 54" strokeDashoffset={-lt * 300 - k * 25} />)}
        <ellipse cx={FW / 2} cy={FH + 6} rx={230} ry={46 * out3(lt, downAt + 0.4, 2)} fill={MUD} />
      </FieldFrom>
      <T x={260} y={72} size={32} bold color="#FF9C8C">STRAIGHT down</T>
    </g>
    <g opacity={out3(lt, alongAt, 0.5)}><Arrow x1={476} y1={150} x2={476} y2={560} color="rgba(255,255,255,0.7)" sw={4} head={16} /></g>
    <text transform="translate(464 355) rotate(-90)" textAnchor="middle" fontFamily={SANS} fontWeight="700" fontSize="22" fill={SK.dim}>downhill</text>
  </Dia>;
}
// --- Shield 6: bare soil is an easy target; covered soil is not.
function BareDia({ lt, at, targetAt }) {
  const G = 300, mid = DW / 2;
  return <Dia id="db" lt={lt} at={at}>
    <rect x={0} y={G} width={DW} height={DH - G} fill={SOIL_M} /><rect x={0} y={G} width={DW} height={40} fill={SOIL_T} />
    <line x1={mid} y1={0} x2={mid} y2={DH} stroke="rgba(255,255,255,0.3)" strokeWidth={3} strokeDasharray="10 10" />
    {Array.from({ length: 34 }, (_, i) => <line key={i} x1={mid + 12 + i * 9} y1={G + 2} x2={mid + 14 + i * 9 + 6 * (rnd(i) - 0.5)} y2={G - 30 - 16 * rnd(i + 4)} stroke={i % 3 ? "#E0BE6A" : "#8BD48A"} strokeWidth={5} strokeLinecap="round" />)}
    <Rain x={0} w={DW} top={-10} hit={(px) => px > mid ? G - 26 : G} lt={lt} n={26} spl={(px) => px > mid ? "#BFE3F7" : MUD} />
    {Array.from({ length: 16 }, (_, i) => { const p = (lt * 0.5 + rnd(i + 2)) % 1, x = p * mid, y = G - 8 - p * 110 * rnd(i + 7); return <circle key={i} cx={x} cy={y} r={4 + 4 * rnd(i)} fill={MUD} opacity={Math.min(1, (1 - p) * 3)} />; })}
    {[60, 150].map((y, k) => <Arrow key={k} x1={10} y1={y + 40} x2={190} y2={y + 40} color="rgba(255,255,255,0.75)" sw={5} head={16} />)}
    <T x={mid / 2} y={DH - 34} size={30} bold color="#FF9C8C" op={reveal(lt, targetAt, 0.4)}>BARE: easy target</T>
    <T x={mid * 1.5} y={DH - 34} size={30} bold color={SK.gold}>COVERED: safe</T>
  </Dia>;
}
// --- The slow clock (b3, back in b11).
function Clock({ cx, cy, r = 90, lt, speed = 0.35 }) {
  const m = lt * speed * 360, h = m / 12;
  return <g transform={`translate(${cx} ${cy})`}>
    <circle r={r} fill={SK.cream} stroke={SK.gold} strokeWidth={7} />
    {Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6; return <line key={i} x1={Math.sin(a) * r * 0.82} y1={-Math.cos(a) * r * 0.82} x2={Math.sin(a) * r * 0.92} y2={-Math.cos(a) * r * 0.92} stroke={SK.ink} strokeWidth={i % 3 ? 3 : 6} strokeLinecap="round" />; })}
    <line x1={0} y1={0} x2={0} y2={-r * 0.5} stroke={SK.ink} strokeWidth={8} strokeLinecap="round" transform={`rotate(${h})`} />
    <line x1={0} y1={0} x2={0} y2={-r * 0.74} stroke={SK.goldDeep} strokeWidth={5} strokeLinecap="round" transform={`rotate(${m})`} />
    <circle r={8} fill={SK.ink} />
  </g>;
}
// --- Layer-cake cutaway of the ground.
function Profile({ lt, at, topOp = 1, bandAt = 1e9 }) {
  const o = out3(lt, at, 0.7); if (o <= 0) return null;
  const X = 40, R = 1400, Y0 = 300;
  const edge = (y, a, ph) => { let d = `M${X} ${y}`; for (let x = X; x <= R; x += 40) d += ` L${x} ${y + a * Math.sin(x * 0.016 + ph)}`; return d; };
  const layer = (y, ph, c) => <path d={`${edge(y, 9, ph)} L${R} 980 L${X} 980 Z`} fill={c} />;
  const band = 26 * clamp((lt - bandAt) / 4, 0, 1);
  return <SVG op={o}>
    <defs><clipPath id="pc"><rect x={X} y={Y0 - 90} width={R - X} height={770} rx={20} /></clipPath></defs>
    <g clipPath="url(#pc)">
      <rect x={X} y={Y0 - 90} width={R - X} height={110} fill="#0B2E22" />
      {layer(Y0, 0, "#2C2018")} {layer(470, 1, SOIL_M)} {layer(660, 2.2, SOIL_L)} {layer(830, 3.4, "#6F7371")}
      <g opacity={topOp}>
        <path d={`${edge(Y0, 0, 0)} L${R} 470 L${X} 470 Z`} fill={SOIL_T} />
        {Array.from({ length: 34 }, (_, i) => { const x = X + 20 + i * 39 + 12 * rnd(i), l = 50 + 90 * rnd(i + 2), k = 26 * (rnd(i + 6) - 0.5);
          return <path key={i} d={`M${x} ${Y0} q ${k} ${l * 0.5} ${k * 0.3} ${l}`} stroke="#D9C8A5" strokeWidth={3} fill="none" />; })}
        {Array.from({ length: 44 }, (_, i) => { const x = X + 1320 * rnd(i + 20), y = Y0 + 16 + 140 * rnd(i + 40); return <rect key={i} x={x} y={y} width={10 + 8 * rnd(i)} height={6} rx={2} fill={i % 2 ? "#A9783F" : "#7F9A4E"} transform={`rotate(${180 * rnd(i + 60)} ${x} ${y})`} />; })}
        {[[280, 380], [660, 430], [860, 350]].map(([x, y], i) => <path key={i} d={`M${x} ${y} q 26 ${-22 + 8 * Math.sin(lt * 1.6 + i)} 52 0 t 52 0 t 52 0`} stroke="#D98C8C" strokeWidth={11} strokeLinecap="round" fill="none" />)}
      </g>
      {Array.from({ length: 12 }, (_, i) => <ellipse key={i} cx={X + 70 + i * 112 + 30 * rnd(i)} cy={690 + 120 * rnd(i + 80)} rx={18 + 16 * rnd(i)} ry={10 + 8 * rnd(i + 3)} fill="#8E7354" />)}
      {[[200, 860, 300, 950], [600, 840, 520, 960], [1000, 870, 1100, 960]].map((p, i) => <line key={i} x1={p[0]} y1={p[1]} x2={p[2]} y2={p[3]} stroke="#4A4E4C" strokeWidth={5} />)}
      {band > 0 && <rect x={X} y={Y0 - band} width={R - X} height={band} fill="#5A3D2A" />}
      <g opacity={topOp}>{Array.from({ length: 44 }, (_, i) => { const x = X + 14 + i * 31; return <path key={i} d={`M${x} ${Y0 - band} l -6 -22 M${x} ${Y0 - band} l 2 -28 M${x} ${Y0 - band} l 9 -20`} stroke="#6FBF6E" strokeWidth={4} strokeLinecap="round" />; })}</g>
    </g>
  </SVG>;
}
// --- Time-lapse tiles (b4): the land changes shape.
function LandTile({ i, x, lt, at, label }) {
  const o = out3(lt, at, 0.5); if (o <= 0) return null;
  const Y = 230, W_ = 430, H_ = 560, m = drive(lt, at + 0.2, at + 3.4);
  const id = "tile" + i;
  const pts = [];
  for (let px = 0; px <= W_; px += 10) {
    const u = px / W_; let h;
    if (i === 0) { const d = Math.abs(u - 0.5) * 2, sharp = Math.pow(1 - d, 1.2), round = 0.5 * (1 + Math.cos(Math.PI * d)); h = 70 + lerp(sharp * 380, round * 200, m); }
    else if (i === 1) { const e = lerp(0.62, 0.34, m), jag = 16 * m * Math.sin(u * 40) ; h = u < e ? 300 + jag * 0.3 : 110 + 190 * clamp(1 - (u - e) / 0.1, 0, 1); }
    else { const d = Math.abs(u - 0.5) * 2, wd = lerp(0.1, 0.72, m), dp = lerp(40, 250, m); h = 310 - dp * clamp(1 - d / wd, 0, 1) ** 1.3; }
    pts.push([px, H_ - h]);
  }
  const d = `M0 ${H_} ` + pts.map((p) => `L${p[0]} ${p[1]}`).join(" ") + ` L${W_} ${H_} Z`;
  const line = pts.map((p, k) => `${k ? "L" : "M"}${p[0]} ${p[1]}`).join(" ");
  return <SVG op={o}>
    <defs><clipPath id={id}><rect width={W_} height={H_} rx={18} /></clipPath></defs>
    <g transform={`translate(${x} ${Y})`}>
      <rect width={W_} height={H_} rx={18} fill="#10382C" />
      <g clipPath={`url(#${id})`}>
        {i === 1 && <rect x={0} y={H_ - 150} width={W_} height={150} fill={BLUE} />}
        <path d={d} fill={SOIL_M} /><path d={line} stroke="#6FBF6E" strokeWidth={8} fill="none" strokeLinejoin="round" />
        {i === 2 && m > 0.02 && <ellipse cx={W_ * 0.5} cy={H_ - 310 + lerp(40, 250, m) + 4} rx={lerp(8, 34, m)} ry={7} fill={BLUE} />}
        {i === 1 && Array.from({ length: 5 }, (_, k) => { const p = ((lt - at) * 0.5 + k * 0.2) % 1, ex = W_ * lerp(0.62, 0.34, m) + 30 + k * 16; return m > 0.05 && m < 0.98 ? <rect key={k} x={ex} y={H_ - 300 + p * 170} width={20} height={16} rx={3} fill={MUD} opacity={1 - p} transform={`rotate(${p * 120} ${ex} ${H_ - 300 + p * 170})`} /> : null; })}
      </g>
      <rect width={W_} height={H_} rx={18} stroke="rgba(255,255,255,0.5)" strokeWidth={3} />
      <T x={W_ / 2} y={48} size={36} bold serif color={SK.gold}>{label}</T>
    </g>
  </SVG>;
}

// ============================================================================
function B1(ctx) {
  return ({ localTime: lt, duration }) => {
    const cSoil = W("b1", "that"), cUp = W("b1", "somewhere"), cBig = W("b1", "here");
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[1]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(1, ctx, [L("After rain, a river runs BROWN", S("b1", 0)), L("That brown is SOIL", cSoil), L("A farmer just lost part of a field", cUp), L("How do we stop the land from running away?", cBig, "think")])}>
        <Full slot="river_brown" label="River in spate, thick and brown" lt={lt} at={0} fx="zoom" zoom={1.28} kenDur={11} out={cUp} />
        <Chip text="That brown colour is SOIL" x={720} y={90} lt={lt} at={cSoil} out={cUp} size={36} tone="gold" />
        <Full slot="gully_field" label="Farm field upstream, cut by gullies" lt={lt} at={cUp} fx="pan" dim={lt > cBig ? 0.45 * reveal(lt, cBig, 0.6) : 0} />
        <Chip text="Upstream: a farmer's field" x={720} y={90} lt={lt} at={cUp + 0.3} out={cBig} size={32} />
        <Big x={120} y={380} w={1200} lt={lt} at={cBig + 0.3} size={72} align="center">How do we stop the land from running away?</Big>
      </Scene>
    );
  };
}
function B2(ctx) {
  return ({ localTime: lt, duration }) => {
    const cSC = W("b2", "soil"), cWash = W("b2", "washed"), cBlow = W("b2", "blown"), cFert = W("b2", "fertile"), cKids = W("b2", "children");
    const a = pop(lt, cSC, 0.8), pulse = 1 + 0.015 * Math.sin(lt * 2.4), cx = 900, cy = 460, top = cy - 58 * 4.6;
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[2]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(2, ctx, [L("SOIL CONSERVATION =", cSC, "head"), L("Protecting soil from being washed or blown away", cWash), L("+ keeping it fertile for the FUTURE", cFert)])}>
        <Full slot="farmer_children" label="Farmer and two children in a healthy green field" lt={lt} at={0} fx="zoom" kenDur={16} />
        <SVG>
          {a > 0 && <g transform={`translate(${cx} ${cy}) scale(${4.6 * a * pulse})`}><path d={SHIELD_D} fill="rgba(226,176,76,0.2)" stroke={SK.gold} strokeWidth={2} /></g>}
          {[720, 820, 900, 980, 1080].map((x, i) => { const o = out3(lt, cWash + i * 0.08, 0.3); const p = ((lt * 1.2 + i * 0.3) % 1), y = lerp(40, top + Math.abs(x - cx) * 0.2 - 6, Math.min(1, p / 0.8));
            return o > 0 && <g key={x} opacity={o}><line x1={x} y1={y - 44} x2={x} y2={y} stroke="#9FD2F0" strokeWidth={8} strokeLinecap="round" />{p > 0.8 && <path d={`M${x - 26} ${y - 8} Q ${x} ${y - 40} ${x + 26} ${y - 8}`} stroke="#CFEBFA" strokeWidth={6} fill="none" strokeLinecap="round" />}</g>; })}
          {[300, 470, 640].map((y, i) => { const o = out3(lt, cBlow + i * 0.08, 0.3); const p = ((lt * 0.9 + i * 0.35) % 1), x = lerp(110, cx - 50 * 4.6 - 30, p);
            return o > 0 && <g key={y} opacity={o * Math.min(1, (1 - p) * 8)}><path d={`M${x - 150} ${y} q 70 -26 150 0`} stroke="#F4EAD2" strokeWidth={8} fill="none" strokeLinecap="round" /></g>; })}
        </SVG>
        <Chip text="for our children and grandchildren" x={900} y={850} lt={lt} at={cKids} size={34} tone="gold" />
        <Chip text="WASHED away" x={900} y={70} lt={lt} at={cWash} out={cFert} size={30} />
        <Chip text="BLOWN away" x={250} y={200} lt={lt} at={cBlow} out={cFert} size={30} />
      </Scene>
    );
  };
}
function B3(ctx) {
  return ({ localTime: lt, duration }) => {
    const cTop = S("b3", 0), cSoil = W("b3", "this"), cNut = W("b3", "nutrients"), cSlow = W("b3", "but"), cTh = W("b3", "thousand"), cCm = W("b3", "for"), cLose = W("b3", "lose");
    const years = Math.round(1000 * clamp((lt - cSlow) / Math.max(0.5, cTh + 0.5 - cSlow), 0, 1) / 10) * 10;
    const topOp = 1 - 0.8 * reveal(lt, cLose + 0.2, 1.2);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[3]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(3, ctx, [L("The RICHEST layer", cSoil, "head"), L("Full of nutrients and organic matter", cNut), L("Takes about 1,000 years to form just a few centimetres", cTh)])}>
        <Profile lt={lt} at={0.1} topOp={topOp} bandAt={cSlow} />
        <SVG op={out3(lt, cSoil, 0.5)}>
          <T x={1370} y={388} size={40} bold serif anchor="end" color={SK.gold} op={topOp}>TOPSOIL</T>
        </SVG>
        <SVG op={out3(lt, cSoil + 0.5, 0.6)}>
          <T x={1370} y={650} size={30} bold anchor="end" color={SK.white}>Lighter layers</T>
          <T x={1370} y={920} size={30} bold anchor="end" color={SK.white}>Rock</T>
        </SVG>
        <Pic slot="soil_humus" label="Real topsoil, close up" x={70} y={330} w={360} h={240} lt={lt} at={cNut} out={cLose} fx="pop" />
        <Chip text="Leaves · roots · nutrients" x={250} y={590} lt={lt} at={cNut + 0.4} out={cLose} size={26} />
        <SVG op={out3(lt, cSlow, 0.6)}>
          <Clock cx={150} cy={130} r={84} lt={lt} speed={0.5} />
          <T x={260} y={125} size={54} bold serif anchor="start" color={SK.gold}>{years.toLocaleString("en-GB")} years</T>
          <T x={260} y={172} size={32} anchor="start" color={SK.white} op={reveal(lt, cCm, 0.4)}>for just a few centimetres of topsoil</T>
        </SVG>
        <Tag text="Lost? Not back in OUR lifetime" x={720} y={236} lt={lt} at={cLose + 0.4} size={34} />
      </Scene>
    );
  };
}
function B4(ctx) {
  return ({ localTime: lt, duration }) => {
    const cWater = W("b4", "flowing"), cWind = W("b4", "and"), cEro = W("b4", "this"), cYears = W("b4", "over"), cHills = W("b4", "wearing"), cBank = W("b4", "eating"), cVal = W("b4", "and", 1);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[4]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(4, ctx, [L("Carried away by:", cWater, "head"), L("WATER", cWater), L("WIND", cWind), L("Slowly changes hills, riverbanks and valleys", cYears)])}>
        <Pic slot="soil_erosion" label="Rain carries soil off a bare slope" x={40} y={PY} w={670} h={PH} lt={lt} at={0.2} fx="zoom" out={cYears} />
        <Pic slot="wind_dust" label="Dry wind lifts dust into a brown cloud" x={730} y={PY} w={670} h={PH} lt={lt} at={cWind} fx="pan" out={cYears} />
        <SVG op={1 - reveal(lt, cYears, 0.5)}>
          <Rain x={50} w={650} top={60} hit={() => 960} lt={lt} n={46} speed={1.1} op={out3(lt, cWater, 0.5)} spl={() => MUD} />
          <g opacity={out3(lt, cWind + 0.3, 0.5)}>{[220, 400, 590, 760].map((y, i) => { const p = ((lt * 0.6 + i * 0.27) % 1), x = lerp(760, 1400, p);
            return <path key={y} d={`M${x - 130} ${y} q 60 -24 130 0 t 80 -6`} stroke="#F4EAD2" strokeWidth={7} fill="none" strokeLinecap="round" opacity={Math.min(1, p * 5, (1 - p) * 5) * 0.8} />; })}</g>
        </SVG>
        <Chip text="WATER" x={375} y={80} lt={lt} at={cWater} out={cYears} size={38} tone="gold" />
        <Chip text="WIND" x={1065} y={80} lt={lt} at={cWind} out={cYears} size={38} tone="gold" />
        <Big x={40} y={840} w={1360} lt={lt} at={cEro} out={cYears} size={84} align="center">SOIL EROSION</Big>
        <Chip text="Over many years..." x={720} y={120} lt={lt} at={cYears} size={38} tone="gold" />
        <LandTile i={0} x={40} lt={lt} at={cHills} label="HILLS" />
        <LandTile i={1} x={505} lt={lt} at={cBank} label="RIVERBANKS" />
        <LandTile i={2} x={970} lt={lt} at={cVal} label="VALLEYS" />
      </Scene>
    );
  };
}
function B5(ctx) {
  return ({ localTime: lt, duration }) => {
    const s = stopFor("b5");
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[5]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(5, ctx, [L("Have you seen erosion near your home or school?", S("b5", 1), "plain"), L("Where?", W("b5", "where"), "think")])}>
        <Full slot="riverbank_crumble" label="A riverbank crumbling into the water" lt={lt} at={0} fx="zoom" kenDur={6} zoom={1.08} />
        <Chip text="Quick stop!" x={720} y={90} lt={lt} at={S("b5", 0)} out={stopAt("b5", s[1])} size={40} tone="gold" />
        <StopStrip lt={lt} b="b5" heading="LOOK AROUND" question="Have you seen erosion near your home or school?" top={620} height={320} />
      </Scene>
    );
  };
}
function B6(ctx) {
  return ({ localTime: lt, duration }) => {
    const c1 = W("b6", "shield", 0), cCover = W("b6", "farmers", 0), cBlank = W("b6", "like"), c2 = W("b6", "shield", 1), cRoots = W("b6", "their"), cFing = W("b6", "fingers");
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[6]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(6, ctx, [L("SHIELD 1: MULCHING", c1, "head"), L("Cover soil with dry leaves or straw", cCover), L("SHIELD 2: TREES AND GRASS", c2, "head"), L("Roots hold soil together", cRoots)])}>
        <Full slot="gully_field" label="Farm field cut by gullies" lt={lt} at={0} fx="pan" dim={0.5} out={c1} />
        <Big x={120} y={380} w={1200} lt={lt} at={0.3} out={c1} size={78} align="center">How do farmers fight back?</Big>
        <Full slot="mulch_straw" label="A farmer spreads dry straw between rows of plants" lt={lt} at={c1} out={c2} fx="zoom" />
        <Dia id="d1" lt={lt} at={cCover} out={c2}><Mulch lt={lt} coverAt={cBlank - 0.6} /></Dia>
        <Full slot="slope_saplings" label="Saplings and grass on a once-bare slope" lt={lt} at={c2} fx="pan" />
        <Dia id="d2" lt={lt} at={c2 + 0.9}><RootsDia lt={lt} growAt={c2 + 1.0} gripAt={cFing} /></Dia>
        <Rack lt={lt} ats={[c1, c2, 1e9, 1e9, 1e9, 1e9]} />
      </Scene>
    );
  };
}
function B7(ctx) {
  return ({ localTime: lt, duration }) => {
    const c3 = W("b7", "shield", 0), cHills = W("b7", "on"), cSteps = W("b7", "farmers"), cSlow = W("b7", "so"), c4 = W("b7", "shield", 1), cWall = W("b7", "small"), cKeep = W("b7", "they");
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[7]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(7, ctx, [L("SHIELD 3: TERRACES", c3, "head"), L("Steps cut into hill slopes", cSteps), L("SHIELD 4: BUNDS", c4, "head"), L("Small walls around fields", cWall)])}>
        <Full slot="terrace_hills" label="Steep hills cut into giant steps" lt={lt} at={0} out={c4} fx="zoom" />
        <Dia id="d3" lt={lt} at={cHills - 0.2} out={c4}><TerraceDia lt={lt} cutAt={cSteps} slowAt={cSlow} /></Dia>
        <Full slot="bund_field" label="Farmers build a low mud wall around a field" lt={lt} at={c4} fx="pan" />
        <Dia id="d4" lt={lt} at={c4 + 1.5}><BundDia lt={lt} wallAt={cWall} keepAt={cKeep} /></Dia>
        <Rack lt={lt} ats={[-99, -99, c3, c4, 1e9, 1e9]} />
      </Scene>
    );
  };
}
function B8(ctx) {
  return ({ localTime: lt, duration }) => {
    const c5 = W("b8", "shield", 0), cAlong = W("b8", "farmers"), cDown = W("b8", "not"), cFurrow = W("b8", "each"), cDam = W("b8", "like"), c6 = W("b8", "and"), cBare = W("b8", "bare", 1), cNever = W("b8", "never");
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[8]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(8, ctx, [L("SHIELD 5: CONTOUR PLOUGHING", c5, "head"), L("Plough ALONG the curves of a slope", cAlong), L("SHIELD 6: NO BARE FIELDS", c6, "head"), L("Keep soil covered after harvest", cNever)])}>
        <Full slot="contour_aerial" label="From above: ploughing in curves that follow the slope" lt={lt} at={0} out={c6} fx="zoom" />
        {lt < c6 + 0.5 && <div style={{ opacity: 1 - reveal(lt, c6, 0.45) }}><ContourDia lt={lt} alongAt={cAlong} downAt={cDown} furrowAt={cFurrow} /></div>}
        <Chip text="Each furrow = a tiny dam" x={890} y={150} lt={lt} at={cDam} out={c6} size={34} tone="gold" />
        <Full slot="stubble_field" label="After harvest: stubble covers the field" lt={lt} at={c6} fx="pan" />
        <BareDia lt={lt} at={cNever + 1.0} targetAt={W("b8", "easy")} />
        <Rack lt={lt} ats={[-99, -99, -99, -99, c5, c6]} hero={[300, 300]} />
      </Scene>
    );
  };
}
function B9(ctx) {
  return ({ localTime: lt, duration }) => {
    const cA = S("b9", 1), cB = S("b9", 2), s = stopFor("b9"), stop = stopAt("b9", s[1]);
    const qCard = (x, at, text) => { const o = out3(lt, at, 0.5); return o > 0 && <div style={{ position: "absolute", left: x, top: 620, width: 670, height: 130, borderRadius: 18, background: SK.cream, opacity: o, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "10px 24px", boxSizing: "border-box",
      fontFamily: SERIF, fontWeight: 700, fontSize: 38, lineHeight: 1.15, color: SK.ink, boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }}>{text}</div>; };
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[9]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(9, ctx, [L("Steep hillside → which shield?", cA), L("Flat field losing rainwater → which shield?", cB)])}>
        <Badge text="YOUR TURN" x={570} y={36} lt={lt} at={S("b9", 0)} size={38} />
        <Pic slot="tea_garden" label="A farm on a steep hillside" x={40} y={130} w={670} h={470} lt={lt} at={cA} fx="pop" />
        <Pic slot="flat_runoff" label="A flat field: rainwater runs off" x={730} y={130} w={670} h={470} lt={lt} at={cB} fx="pop" />
        {qCard(40, cA, "Steep hillside: which shield?")}
        {qCard(730, cB, "Flat field losing rainwater: which shield?")}
        <StopStrip lt={lt} b="b9" heading="YOUR TURN" top={770} height={200} />
        <Rack lt={lt} ats={[-99, -99, -99, -99, -99, -99]} />
      </Scene>
    );
  };
}
function B10(ctx) {
  return ({ localTime: lt, duration }) => {
    const cF = W("b10", "in"), cGrow = W("b10", "they"), cGen = W("b10", "for"), cRub = W("b10", "rubber"), cLiv = W("b10", "until"), cHun = W("b10", "some"), cGrip = W("b10", "look"), cHold = W("b10", "that"), cLes = W("b10", "nature's");
    const rootG = drive(lt, cGen + 0.3, cLiv + 1.4);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[10]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(10, ctx, [L("Meghalaya", cF, "head"), L("Grown from roots of RUBBER FIG trees", cRub), L("Some over 100 years old", cHun), L("Roots grip soil on steep slopes", cGrip)])}>
        <Flip x={420} y={250} w={600} h={380} lt={lt} at={0.25} n={null} q={<span style={{ fontSize: 96, color: SK.goldDeep }}>WOW!</span>} />
        <Full slot="sohra_rain" label="Misty forest and streams of Meghalaya" lt={lt} at={cF} out={cGrow} fx="zoom" />
        <Chip text="Meghalaya" x={720} y={90} lt={lt} at={cF + 0.3} out={cGrow} size={38} tone="gold" />
        <Full slot="root_bridge" label="A living root bridge in a misty forest" lt={lt} at={cGrow} out={cHun} fx="pan" />
        <Big x={120} y={90} w={1200} lt={lt} at={cGrow + 0.1} out={cGen} size={72} align="center">They GROW them!</Big>
        <Dia id="d5" lt={lt} at={cGen} out={cHun} x={760} y={560} w={620} h={390}>
          <path d="M0 150 L150 150 L190 390 L0 390 Z" fill={SOIL_M} /><path d="M620 150 L470 150 L430 390 L620 390 Z" fill={SOIL_M} />
          <rect x={150} y={330} width={320} height={60} fill={BLUE} />
          <rect x={46} y={40} width={36} height={112} fill="#7A5A3A" /><circle cx={64} cy={56} r={58} fill="#4E9A5E" />
          {[0, 1, 2, 3, 4].map((k) => <path key={k} d={`M70 ${138 + k * 2} C 200 ${200 + k * 8}, 400 ${200 + k * 8}, ${490 + k * 10} ${150 + k * 3}`} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - clamp(rootG * 1.3 - k * 0.07, 0, 1)} stroke="#E9DCC0" strokeWidth={8} strokeLinecap="round" fill="none" />)}
          <T x={310} y={70} size={30} bold color={SK.gold}>Roots guided across</T>
          <T x={310} y={110} size={28} color={SK.cream} op={reveal(lt, cLiv, 0.5)}>a strong, LIVING bridge</T>
        </Dia>
        <Full slot="double_decker" label="The double-decker root bridge; people walk across" lt={lt} at={cHun} out={cGrip} fx="zoom" />
        <Chip text="More than 100 years old" x={720} y={90} lt={lt} at={cHun + 0.3} out={cGrip} size={38} tone="gold" />
        <Full slot="roots_grip" label="Roots gripping rocks and earth on a steep bank" lt={lt} at={cGrip} fx="zoom" zoom={1.2} dim={0.5 * reveal(lt, cLes, 0.6)} />
        <Chip text="Roots hold soil together" x={720} y={90} lt={lt} at={cHold} out={cLes} size={36} tone="gold" />
        <Big x={120} y={320} w={1200} lt={lt} at={cLes + 0.4} size={76} align="center">Protect the <span style={{ color: SK.gold }}>TREES</span>, and they protect the <span style={{ color: SK.gold }}>LAND</span>.</Big>
        <Badge text="WOW!" x={70} y={70} lt={lt} at={cF} size={40} />
      </Scene>
    );
  };
}
function B11(ctx) {
  return ({ localTime: lt, duration }) => {
    const c = [W("b11", "healthy"), W("b11", "healthier"), W("b11", "better"), W("b11", "and")], cRem = W("b11", "and", 1), cStorm = W("b11", "what"), cCent = W("b11", "can");
    const tiles = [["healthy_soil", "Healthy soil"], ["tn_paddy", "Healthy crops"], ["plate_food", "Food on a plate"], ["rainfed_village", "A green, safe village"]];
    const X = (i) => 70 + i * 340, Y = lerp(300, 130, reveal(lt, cRem, 0.7)), D = 280, up = 1 - 0.32 * reveal(lt, cRem, 0.6);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[11]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(11, ctx, [L("Healthy soil →", c[0]), L("healthier crops →", c[1]), L("more food →", c[2]), L("safer environment", c[3]), L("Soil forms VERY slowly", cRem, "head")])}>
        <Big x={120} y={380} w={1200} lt={lt} at={0.2} out={c[0]} size={76} align="center">Why does all this matter?</Big>
        {tiles.map(([slot, label], i) => <React.Fragment key={slot}>
          <Pic slot={slot} label={label} x={X(i)} y={Y} w={D} h={D} r={D / 2} lt={lt} at={c[i]} fx="pop" op={up} />
          <Chip text={label} x={X(i) + D / 2} y={Y + D + 16} lt={lt} at={c[i] + 0.2} size={26} op={up} />
        </React.Fragment>)}
        <SVG op={up}>{[0, 1, 2].map((i) => <Arrow key={i} x1={X(i) + D + 8} y1={Y + D / 2} x2={X(i + 1) - 8} y2={Y + D / 2} color={SK.gold} sw={8} head={20} op={out3(lt, c[i + 1] - 0.1, 0.4)} />)}</SVG>
        <SVG op={out3(lt, cRem, 0.6)}><Clock cx={720} cy={680} r={120} lt={lt} speed={0.5} /></SVG>
        <Big x={100} y={640} w={460} lt={lt} at={cStorm} size={54} align="center">One storm</Big>
        <Big x={880} y={640} w={460} lt={lt} at={cCent} size={54} align="center" color={SK.gold}>CENTURIES to replace</Big>
      </Scene>
    );
  };
}
function B12(ctx) {
  return ({ localTime: lt, duration }) => {
    const q = [W("b12", "name"), W("b12", "what"), W("b12", "and")], a = [W("b12", "water"), W("b12", "mulching"), W("b12", "contour")], cEnd = W("b12", "protect");
    const SP = [[260, 150], [720, 150], [1180, 150], [260, 830], [720, 830], [1180, 830]];
    const ans = ["WATER and WIND", "MULCHING", "CONTOUR PLOUGHING"];
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[12]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(12, ctx, [L("1. Two forces that cause erosion?", q[0]), L("2. Covering soil with straw is called?", q[1]), L("3. Ploughing along the curves of a slope is called?", q[2])])}>
        <Full slot="rainfed_village" label="The farm" lt={lt} at={0} fx="zoom" kenDur={30} dim={0.32} />
        <SVG>{SP.map(([x, y], i) => { const o = pop(lt, 0.3 + i * 0.22, 0.5); return <Shield key={i} x={x} y={y} s={1.15 * o} n={i + 1} op={clamp(o, 0, 1)} />; })}</SVG>
        {[0, 1, 2].map((i) => { const x = 70 + i * 440, y = 250, w = 420, h = 320, o = out3(lt, q[i], 0.4) * (1 - reveal(lt, cEnd, 0.5)); if (o <= 0) return null;
          return <div key={i} style={{ position: "absolute", left: 0, top: 0, opacity: o }}>
            {lt < a[i] + 0.4 && <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 22, background: SK.gold, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }}>
              <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 24, letterSpacing: "0.12em", color: SK.ink }}>QUESTION {i + 1}</div>
              <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 130, color: SK.ink, lineHeight: 1.1 }}>?</div></div>}
            <Flip x={x} y={y} w={w} h={h} lt={lt} at={a[i]} q={ans[i]} n={i + 1} label="ANSWER" size={46} />
          </div>; })}
        <StopStrip lt={lt} b="b12" heading="QUICK CHECK" top={590} height={140} left={270} width={900} />
        <Big x={120} y={340} w={1200} lt={lt} at={cEnd + 0.3} size={72} align="center">Protect the soil, and the soil will feed us <span style={{ color: SK.gold }}>ALL</span>.</Big>
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
const COLLAGE = [{ slot: "soil_erosion", x: -60, y: -40, w: 760, h: 520, ph: 0 }, { slot: "tea_garden", x: 640, y: -80, w: 760, h: 520, ph: 2 },
  { slot: "healthy_soil", x: -80, y: 520, w: 700, h: 560, ph: 4 }, { slot: "rainfed_village", x: 560, y: 560, w: 820, h: 560, ph: 1 }];
function Lp22Scenes(props = {}) {
  const caps = props.showCaptions === "false" ? false : props.showCaptions !== false;
  const titles = {};
  for (let n = 1; n <= NB; n++) titles[n] = str(props["title" + n + "Text"], TITLES[n]);
  const ctx = { caps, titles, capSize: num(props.captionSize, 34) };
  const B = [B1, B2, B3, B4, B5, B6, B7, B8, B9, B10, B11, B12];
  const beats = B.map((Bn, i) => { const t = BEAT("b" + (i + 1)); return [t.start, t.start + t.dur, Bn]; });
  return (
    <StoryFrame props={props} dur={DUR} persistKey="thinkpro-lp22-conservation-of-soil" collage={COLLAGE}>
      {beats.map(([s, e, Bn], i) => (
        <Sprite key={i} start={s} end={e}>{Bn(ctx)}</Sprite>
      ))}
      {STOPS.map(([b, i, hold]) => <StopAt key={b} t={BEAT(b).start + stopAt(b, i)} hold={hold - 0.2} />)}
      <ChimeAt t={BEAT("b10").start + S("b10", 0, 0)} />
      <AudioSync />
    </StoryFrame>
  );
}
window.Lp22Scenes = Lp22Scenes;
