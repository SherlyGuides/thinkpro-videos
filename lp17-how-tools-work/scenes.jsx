/* global React, window */
// ThinkPro Academy — "How Tools Work" (Grade 6 Agriculture, Session 17, V1).
// After AG_G6_S17 Video Script (Subrata, 4 Nov 2026): 12 script scenes as 11 voiced beats (script scene 8,
// the silent break, is the last 2.6 s of the b7 hold; the bell is the b8 chime), five presenter stops,
// right/wrong SAFETY RULE cards, blue FOR TEACHERS and orange FOR STUDENTS banners.
// Central model: THE RACK of eight flat tools (ToolArt), silhouettes in b1, back in colour in b11; a gold
// magnifying glass finds each working end before its job is named. People are engine/people-kit.jsx rigs,
// so the "wrong way" is acted out slowly and safely, and no real child is shown.
// Local additions (no engine change): ToolArt/Rack/Mag/Box/Mark/StopBox, tools held at a fixed world angle.
// STORY STYLE (engine/story-kit.jsx). Pure function of time.
const { Sprite } = window;
const { reveal, windowOp } = window.TPMotion;
const { num, str } = window.TPStage;
const { SK, SERIF, SANS, LEFT_W, pop, out3, lerp, drive,
  Pic, Chip, Badge, Big, Card, SVG, Arrow, T, ChimeAt, Scene, StoryFrame, StopAt, Break } = window.TPStory;
const { Student, poseAt, walk, POSES, LabTable, NurseryBags } = window.TPPeople;

// ---- Timing: EVERYTHING is keyed to the narration (tools/fit_timing.py → timing.js).
const TM = window.TP_TIMING;
if (!TM) console.error("timing.js missing — run: python3 tools/fit_timing.py videos/lp17-how-tools-work");
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

// ---- Panel copy. Title defaults mirror the DC data-props (titleNText) — keep in sync. ----
const TITLES = { 1: "LP17 – How Tools Work", 2: "Handle and working end", 3: "Clue one: a sharp edge", 4: "Clue two: a pointed or curved blade",
  5: "Clue three: a scoop", 6: "Clue four: teeth", 7: "Clue five: the rose", 8: "The 7 safety rules", 9: "For teachers", 10: "For students", 11: "The answer" };
const KICK = "Grade 6 · Agriculture · Session 17";
const KICKS = { 8: "Safety first", 9: "Teachers, this is for you", 10: "Students, this is for you" };
const panel = (n, ctx, lines, extra = {}) => ({ kicker: KICKS[n] || KICK, title: ctx.titles[n], lines, ...extra });
const L = (text, at, kind = "item", extra = {}) => ({ text, at, kind, ...extra });

// ---- Colours for this video ---------------------------------------------------------
const YEL = "#F2C94C", RED = "#C62828", GRN = "#2E7D32", BLUE = "#1F6FB8", ORANGE = "#E07B1F";
const WALL = "#CFE0D2", FLOOR = "#B9B0A0", SOIL = "#5C4A3E", SOILD = "#46372D";
const PAL = { w: "#B97F48", wd: "#8A5A30", s: "#B7C2C6", sd: "#7F8C91", e: "#F4FAFB", r: "#C62828", g: "#2E8B57", gd: "#1F6B42", k: "#3B3B3B" };
const SIL = "#0A2B20";
const PSIL = { w: SIL, wd: SIL, s: SIL, sd: SIL, e: SIL, r: SIL, g: SIL, gd: SIL, k: SIL };

// ---- The eight tools: local coords, (0,0) = top of the handle, the working end at the far +y end. ----
// `open` 0..1 opens the secateurs, `lock` 0..1 slides the catch shut.
function ToolArt({ kind, c = PAL, open = 0, lock = 1 }) {
  const sil = c === PSIL;
  switch (kind) {
    case "sickle": return <g>
      <rect x="-13" y="0" width="26" height="130" rx="11" fill={c.w} /><rect x="-13" y="118" width="26" height="16" fill={c.wd} />
      <path d="M-11 136 C 90 128, 182 214, 122 330 C 142 236, 72 178, 9 170 Z" fill={c.s} />
      {!sil && <path d="M9 170 C 72 178, 142 236, 122 330" stroke={c.e} strokeWidth="5" strokeLinecap="round" fill="none" />}
    </g>;
    case "secateurs": { const th = 2 + 15 * open; return <g>
      <g transform={`rotate(${-th} 0 150)`}>
        <path d="M-5 150 C -20 95, -36 50, -30 6 q 3 -8 12 -5 C -4 50, 6 100, 8 150 Z" fill={c.r} />
        <path d="M-9 148 L9 148 C 18 200, 12 245, -2 282 C -6 240, -10 195, -9 148 Z" fill={c.s} />
        {!sil && <path d="M9 150 C 18 200, 12 245, -2 282" stroke={c.e} strokeWidth="4" fill="none" strokeLinecap="round" />}
      </g>
      <g transform={`rotate(${th} 0 150)`}>
        <path d="M5 150 C 20 95, 36 50, 30 6 q -3 -8 -12 -5 C 4 50, -6 100, -8 150 Z" fill={c.r} />
        <path d="M9 148 L-9 148 C -22 190, -22 225, -14 250 C -2 225, 8 190, 9 148 Z" fill={c.sd} />
      </g>
      <circle cx="0" cy="150" r="9" fill={c.k} />
      <rect x={-28 + 6 * (1 - lock)} y="22" width={lerp(14, 56, lock)} height="9" rx="4" fill={sil ? c.k : SK.gold} />
    </g>; }
    case "khurpi": return <g>
      <path d="M-11 0 q11 -6 22 0 L14 112 h-28 Z" fill={c.w} /><rect x="-14" y="110" width="28" height="14" fill={c.wd} />
      <rect x="-5" y="124" width="10" height="28" fill={c.sd} />
      <path d="M-8 150 L-50 170 C -52 215, -20 272, 0 306 C 20 272, 52 215, 50 170 L8 150 Z" fill={c.s} />
      {!sil && <path d="M-50 170 C -52 215, -20 272, 0 306 C 20 272, 52 215, 50 170" stroke={c.e} strokeWidth="4" fill="none" />}
    </g>;
    case "hoe": return <g>
      <rect x="-9" y="0" width="18" height="372" rx="8" fill={c.w} />
      <path d="M0 360 C 0 408, 36 418, 64 398" stroke={c.sd} strokeWidth="13" fill="none" strokeLinecap="round" />
      <path d="M44 388 L132 382 L146 470 C 110 482, 74 482, 40 472 Z" fill={c.s} />
      {!sil && <path d="M146 470 C 110 482, 74 482, 40 472" stroke={c.e} strokeWidth="5" fill="none" strokeLinecap="round" />}
    </g>;
    case "trowel": return <g>
      <path d="M-13 0 q13 -7 26 0 L15 104 q-15 8 -30 0 Z" fill={c.w} />
      <path d="M0 106 C 0 128, 0 134, 0 152" stroke={c.sd} strokeWidth="11" fill="none" />
      <path d="M-6 148 L6 148 C 46 156, 54 190, 48 216 C 38 262, 12 292, 0 304 C -12 292, -38 262, -48 216 C -54 190, -46 156, -6 148 Z" fill={c.s} />
      {!sil && <path d="M-26 186 C -18 168, 18 168, 26 186 C 26 226, 10 258, 0 270 C -10 258, -26 226, -26 186 Z" fill={c.sd} opacity="0.55" />}
    </g>;
    case "shovel": return <g>
      <path d="M-30 0 h60 v12 q-14 8 -22 22 h-16 q-8 -14 -22 -22 Z" fill={c.wd} />
      <rect x="-9" y="24" width="18" height="290" fill={c.w} /><rect x="-12" y="296" width="24" height="30" fill={c.sd} />
      <path d="M-16 310 L16 310 C 64 314, 76 338, 74 362 L68 432 C 62 462, 22 482, 0 494 C -22 482, -62 462, -68 432 L-74 362 C -76 338, -64 314, -16 310 Z" fill={c.s} />
      {!sil && <path d="M-40 352 C -30 338, 30 338, 40 352 C 44 410, 18 448, 0 460 C -18 448, -44 410, -40 352 Z" fill={c.sd} opacity="0.55" />}
    </g>;
    case "rake": return <g>
      <rect x="-9" y="0" width="18" height="384" rx="8" fill={c.w} />
      <rect x="-96" y="380" width="192" height="16" rx="5" fill={c.sd} />
      {Array.from({ length: 11 }, (_, i) => <path key={i} d={`M${-90 + i * 18 - 4} 394 h8 l-4 56 Z`} fill={c.s} />)}
    </g>;
    case "can": return <g>
      <path d="M-72 18 C -96 90, -96 150, -74 190" stroke={c.gd} strokeWidth="13" fill="none" />
      <path d="M-58 60 C -40 -6, 30 -6, 48 60" stroke={c.gd} strokeWidth="13" fill="none" />
      <path d="M46 196 L196 84" stroke={c.g} strokeWidth="24" />
      <path d="M-76 60 h128 l10 170 q0 8 -8 8 h-132 q-8 0 -8 -8 Z" fill={c.g} /><ellipse cx="-12" cy="60" rx="64" ry="11" fill={c.gd} />
      <g transform="translate(196 84) rotate(53)"><path d="M-13 4 L13 4 L38 -30 L-38 -30 Z" fill={c.gd} /><rect x="-44" y="-40" width="88" height="13" rx="5" fill={c.s} />{!sil && [-30, -15, 0, 15, 30].map((d) => <circle key={d} cx={d} cy="-34" r="2.6" fill={c.k} />)}</g>
    </g>;
    default: return null;
  }
}
// Working-end point of each tool (where the magnifying glass goes), overall length, width offset.
const ENDS = { sickle: [105, 225], secateurs: [2, 215], khurpi: [0, 225], hoe: [92, 435], trowel: [0, 225], shovel: [0, 400], rake: [0, 425], can: [224, 58] };
const toWorld = (x, y, s, r, p) => { const a = r * Math.PI / 180, c = Math.cos(a), si = Math.sin(a); return [x + s * (p[0] * c - p[1] * si), y + s * (p[0] * si + p[1] * c)]; };
function Tool({ kind, x, y, s = 1, r = 0, sil = 0, open = 0, lock = 1, op = 1 }) {
  return <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} opacity={op}>
    {sil < 1 && <g opacity={1 - sil}><ToolArt kind={kind} open={open} lock={lock} /></g>}
    {sil > 0 && <g opacity={sil}><ToolArt kind={kind} c={PSIL} open={open} lock={lock} /></g>}
  </g>;
}
// A tool held in a rig's hand at a fixed WORLD angle A (0 = straight down, 90 = forward), whatever the arm does.
const held = (pose, kind, { k = 0.25, g = 0, A = 0, side = "R", open = 0, lock = 1 } = {}) => {
  const p = { ...POSES.stand, ...pose };
  const sum = p.lean + (side === "R" ? p.chest + p.sR + p.eR + p.wR : p.sL + p.eL + p.wL);
  return <g transform={`rotate(${sum - A}) scale(${k}) translate(0 ${-g})`}><ToolArt kind={kind} open={open} lock={lock} /></g>;
};

// Stage position of a rig's right hand (rig pose p, feet x,y, height h, facing f); lean tips the torso about the hips.
function handXY(x, y, h, pose, f = 1) {
  const p = { ...POSES.stand, ...pose }, s = h / 100, d = Math.PI / 180, l = -p.lean * d;
  const sx = 7 * Math.cos(l) + 27 * Math.sin(l), sy = -46 + 7 * Math.sin(l) - 27 * Math.cos(l) + p.dy;
  const a1 = (p.sR + p.lean + p.chest) * d, a2 = (p.sR + p.eR + p.lean + p.chest) * d;
  return [x + f * s * (sx + 16 * Math.sin(a1) + 15.5 * Math.sin(a2)), y + s * (sy + 16 * Math.cos(a1) + 15.5 * Math.cos(a2))];
}
// A lean forward in this rig is a NEGATIVE lean (engine POSES.kneel leans back), so kneeling is re-posed here.
const KNEEL = { ...POSES.kneel, lean: -14, head: 12 }, KNEELH = { ...POSES.kneelHold, lean: -12 };

// ---- The rack ---------------------------------------------------------------------------
const RACK = [["sickle", "Sickle", 0.82, -36], ["secateurs", "Secateurs", 0.95, 0], ["khurpi", "Khurpi", 0.92, 0], ["hoe", "Hoe", 0.6, -30],
  ["trowel", "Trowel", 0.92, 0], ["shovel", "Shovel", 0.58, 0], ["rake", "Rake", 0.64, 0], ["can", "Watering can", 0.5, -44]];
// silAt(i) 0..1 per tool. Board drawn from x,y at a 1:1 scale (W 1360 × H 440).
function Rack({ x = 0, y = 0, s = 1, sil = () => 0, names = 1, tick = () => 0, op = 1, only = null }) {
  const cw = 170;
  return <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
    <rect x="0" y="0" width="1360" height="440" rx="14" fill="#D9C39A" />
    {[0, 1, 2, 3].map((i) => <line key={i} x1="0" y1={88 * (i + 1)} x2="1360" y2={88 * (i + 1)} stroke="#C2A878" strokeWidth="3" />)}
    <rect x="0" y="0" width="1360" height="440" rx="14" fill="none" stroke="#A98A58" strokeWidth="6" />
    {RACK.map(([k, nm, ts, dx], i) => { if (only && !only.includes(k)) return null; const cx = cw * i + cw / 2, tk = tick(i);
      return <g key={k}>
        <rect x={cx - 74} y="16" width="148" height="34" rx="6" fill="#FFF8E7" opacity={names} stroke="#A98A58" strokeWidth="2" />
        <text x={cx} y="41" textAnchor="middle" fontFamily={SANS} fontWeight="700" fontSize="23" fill={SK.ink} opacity={names}>{nm}</text>
        <path d={`M${cx - 6} 58 q 6 -4 12 0 v 12 q -6 8 -12 0`} fill="#5D5D5D" />
        <Tool kind={k} x={cx + dx} y={72} s={ts} sil={sil(i)} />
        {tk > 0 && <g transform={`translate(${cx + 56} 408) scale(${tk})`}><circle r="21" fill={GRN} /><path d="M-10 0 l7 8 l13 -15" stroke="#fff" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></g>}
      </g>; })}
  </g>;
}

// ---- Shared pieces ----------------------------------------------------------------------
function Mag({ x, y, r = 62, op = 1, s = 1 }) {
  if (op <= 0) return null;
  return <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
    <line x1={r * 0.74} y1={r * 0.74} x2={r * 1.9} y2={r * 1.9} stroke="#7A4A22" strokeWidth="18" strokeLinecap="round" />
    <circle r={r} fill="rgba(255,255,255,0.16)" stroke={SK.gold} strokeWidth="11" />
    <path d={`M${-r * 0.58} ${-r * 0.2} A ${r * 0.62} ${r * 0.62} 0 0 1 ${-r * 0.1} ${-r * 0.6}`} stroke="#fff" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.8" />
  </g>;
}
// The glass flies in to (tx,ty) from `at`, then circles the spot; leaves at `out`.
function Finder({ tx, ty, lt, at, out = 1e9, from = [720, 1000], r = 62 }) {
  const k = drive(lt, at, at + 1.0), a = (lt - at) * 3.1, rr = 24 * k;
  const o = reveal(lt, at, 0.3) * (1 - reveal(lt, out, 0.4)); if (o <= 0) return null;
  return <Mag x={lerp(from[0], tx, k) + rr * Math.cos(a)} y={lerp(from[1], ty, k) + rr * Math.sin(a)} r={r} op={o} />;
}
// Scene box: a clipped wall-and-floor set. `f` = floor y, children are stage-coordinate SVG.
function Box({ x, y, w, h, f, op = 1, floor = FLOOR, wall = WALL, children, id }) {
  if (op <= 0) return null;
  const cid = "bx-" + id;
  return <SVG op={op}>
    <defs><clipPath id={cid}><rect x={x} y={y} width={w} height={h} rx="18" /></clipPath></defs>
    <g clipPath={`url(#${cid})`}>
      <rect x={x} y={y} width={w} height={f - y} fill={wall} />
      <rect x={x} y={f} width={w} height={y + h - f} fill={floor} />
      <rect x={x} y={f - 4} width={w} height="6" fill="rgba(0,0,0,0.14)" />
      {children}
    </g>
    <rect x={x} y={y} width={w} height={h} rx="18" stroke="rgba(255,255,255,0.55)" strokeWidth="3" />
  </SVG>;
}
// Green tick / red cross stamp.
function Mark({ x, y, ok = true, lt, at, s = 1, out = null }) {
  const o = pop(lt, at, 0.45) * (out != null ? 1 - reveal(lt, out, 0.3) : 1); if (o <= 0) return null;
  return <g transform={`translate(${x} ${y}) scale(${s * o})`} opacity={clamp(o, 0, 1)}>
    <circle r="42" fill={ok ? GRN : RED} stroke="#fff" strokeWidth="5" />
    {ok ? <path d="M-20 2 l14 15 l26 -30" stroke="#fff" strokeWidth="9" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      : <path d="M-17 -17 L17 17 M17 -17 L-17 17" stroke="#fff" strokeWidth="9" strokeLinecap="round" />}
  </g>;
}
// A rake lying on the floor, teeth up. (x,y) = middle of the head on the floor, handle running left.
const RakeUp = ({ x, y, s = 1 }) => <g transform={`translate(${x} ${y}) scale(${s})`}>
  <rect x="-360" y="-12" width="360" height="15" rx="7" fill={PAL.w} /><rect x="-96" y="-14" width="192" height="16" rx="5" fill={PAL.sd} />
  {Array.from({ length: 11 }, (_, i) => <path key={i} d={`M${-90 + i * 18 - 4} -12 h8 l-4 -60 Z`} fill={PAL.s} />)}
</g>;
// Big red strike across an unsafe object (the "crossed-out" of the script).
const Strike = ({ x, y, r = 110, o = 1 }) => o > 0 ? <g opacity={o}><circle cx={x} cy={y} r={r} stroke={RED} strokeWidth="11" /><line x1={x - r * 0.7} y1={y + r * 0.7} x2={x + r * 0.7} y2={y - r * 0.7} stroke={RED} strokeWidth="11" /></g> : null;
// Banner across the top of the picture area.
function Banner({ text, color, lt, at = 0.1, x = 40, y = 60, w = 1360, children }) {
  const o = out3(lt, at, 0.5); if (o <= 0) return null;
  return <div style={{ position: "absolute", left: x, top: y, width: w, height: 76, borderRadius: 14, background: color, opacity: o, display: "flex", alignItems: "center", padding: "0 28px", boxSizing: "border-box",
    transform: `translateY(${(1 - o) * -14}px)`, boxShadow: "0 4px 16px rgba(0,0,0,0.3)" }}>
    <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 40, letterSpacing: "0.06em", color: "#fff", flex: "none" }}>{text}</div>
    <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>{children}</div>
  </div>;
}
function PhaseTab({ text, lt, a, b }) {
  const on = lt >= a && lt < b;
  return <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 25, letterSpacing: "0.05em", padding: "6px 18px", borderRadius: 999, background: on ? "#fff" : "rgba(255,255,255,0.18)", color: on ? SK.ink : "rgba(255,255,255,0.8)" }}>{text}</div>;
}
// Clue heading on the left of the picture: "CLUE 1" + the shape, then what it does.
function ClueHead({ n, shape, job, lt, at, jobAt, out = 1e9 }) {
  const o = 1 - reveal(lt, out, 0.4);
  return <div style={{ position: "absolute", left: 0, top: 0, width: 1440, height: 130, opacity: o }}>
    <Badge text={`CLUE ${n}`} x={50} y={52} lt={lt} at={at} size={32} />
    <Chip text={shape} x={240} y={56} lt={lt} at={at + 0.25} tone="cream" size={36} anchor="left" />
    {job && <Chip text={`→ ${job}`} x={1392} y={56} lt={lt} at={jobAt} tone="gold" size={36} anchor="right" />}
  </div>;
}
// Numbered step chips laid out along the foot of a scene.
function Steps({ items, x, y, lt, size = 28, gap = 16, out = null }) {
  const o = out != null ? 1 - reveal(lt, out, 0.4) : 1; if (o <= 0) return null;
  return <div style={{ position: "absolute", left: x, top: y, display: "flex", gap, opacity: o }}>
    {items.map(([t, at], i) => { const q = pop(lt, at, 0.45); if (q <= 0) return null;
      return <div key={i} style={{ transform: `scale(${0.9 + 0.1 * q})`, opacity: clamp(q, 0, 1), fontFamily: SANS, fontWeight: 700, fontSize: size, color: SK.ink, background: SK.cream, borderRadius: 12, padding: "7px 18px", whiteSpace: "nowrap", boxShadow: "0 2px 10px rgba(0,0,0,0.3)" }}>{t}</div>; })}
  </div>;
}
// A dark card holding a big tool. Returns HTML + SVG together.
function ToolCard({ x, y, w, h, lt, at, out, kind, tx, ty, s = 1, r = 0, name, nameAt, open = 0, lock = 1 }) {
  const o = out3(lt, at, 0.6) * (out != null ? 1 - reveal(lt, out, 0.45) : 1); if (o <= 0) return null;
  return <>
    <Card x={x} y={y} w={w} h={h} lt={lt} at={at} out={out} />
    <SVG op={o}><Tool kind={kind} x={tx} y={ty} s={s} r={r} open={open} lock={lock} /></SVG>
    {name && <Chip text={name} x={x + w / 2} y={y + h - 58} lt={lt} at={nameAt != null ? nameAt : at + 0.3} size={30} out={out} />}
  </>;
}

// Presenter stops: [beat, sentence index whose pauseAfter is the hold, hold s, question]
const STOPS = [
  ["b1", 3, 5.0, "Pick one shape. What job do you think it does?"],
  ["b7", 2, 5.2, null],   // shapes-to-jobs card; the remaining 2.8 s of that pause is the visual break
  ["b8", 7, 7.0, null],   // spot the mistake (the drawn lab picture)
  ["b10", 3, 6.0, null],  // try it
  ["b11", 4, 7.5, null],  // quick check card
];
const QUICK = ["What do a sharp edge, a scoop and teeth each do?", "Why does a watering can have a rose?", "Which way should the working end point when you carry a tool?",
  "Who must be with you when you use a cutting tool?", "What do you do with a tool after use?"];
const stopAt = (b, i) => SE(b, i) + 0.1;
const stopFor = (b) => STOPS.find((s) => s[0] === b);
// A stop card of any size, so the picture it freezes on can stay in view.
function StopBox({ lt, b, heading = "PAUSE AND DISCUSS", x = 40, y = 60, w = LEFT_W - 80, h = 880, q, size = 52, children }) {
  const s = stopFor(b), at = stopAt(b, s[1]), hold = s[2] - 0.2, n = STOPS.indexOf(s) + 1;
  const o = windowOp(lt, at, at + hold + 0.4, 0.35); if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 24, background: "rgba(5,30,22,0.96)", opacity: o, zIndex: 3,
      boxShadow: "0 0 0 3px rgba(226,176,76,0.9)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "22px 44px", boxSizing: "border-box", textAlign: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <svg width="54" height="54" viewBox="0 0 90 90"><circle cx="45" cy="45" r="43" fill={SK.gold} /><rect x="28" y="24" width="12" height="42" rx="4" fill={SK.ink} /><rect x="50" y="24" width="12" height="42" rx="4" fill={SK.ink} /></svg>
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 30, letterSpacing: "0.08em", color: SK.ink, background: SK.gold, padding: "8px 26px", borderRadius: 14 }}>{heading}</div>
      </div>
      {q && <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: size, lineHeight: 1.18, color: SK.white, marginTop: 16 }}>{q}</div>}
      {children}
      <div style={{ fontFamily: SANS, fontSize: 24, color: SK.dim, marginTop: 14 }}>Stop {n} of {STOPS.length}</div>
    </div>
  );
}

// ---- Small set pieces --------------------------------------------------------------------
const Pot = ({ x, y, s = 1, fill = 1 }) => <g transform={`translate(${x} ${y}) scale(${s})`}><path d="M-46 -60 h92 l-12 60 h-68 Z" fill="#B4623A" /><rect x="-52" y="-72" width="104" height="16" rx="3" fill="#C97547" /><rect x="-44" y={-72 + 8 - 6 * fill} width="88" height={8} fill={SOIL} opacity={fill > 0 ? 1 : 0} /></g>;
function Weed({ x, y, s = 1, lift = 0 }) {   // y = ground line; root below ground, lifted by `lift` px
  return <g transform={`translate(${x} ${y - lift}) scale(${s})`}>
    <path d="M0 0 C -2 22, 4 40, 0 66 M0 26 C -14 36, -18 46, -22 58 M2 34 C 14 44, 18 54, 20 66" stroke="#F3EAD7" strokeWidth="5" fill="none" strokeLinecap="round" />
    <path d="M0 0 C -2 -30, 2 -44, 0 -66" stroke="#3E8E41" strokeWidth="6" fill="none" />
    <ellipse cx="-22" cy="-40" rx="26" ry="10" fill="#4CAF50" transform="rotate(26 -22 -40)" /><ellipse cx="22" cy="-52" rx="26" ry="10" fill="#4CAF50" transform="rotate(-26 22 -52)" /><ellipse cx="-14" cy="-70" rx="20" ry="8" fill="#66BB6A" transform="rotate(40 -14 -70)" />
  </g>;
}
function Seedling({ x, y, flat = 0, s = 1 }) {
  return <g transform={`translate(${x} ${y}) rotate(${78 * flat}) scale(${s})`}>
    <line x1="0" y1="0" x2="0" y2="-44" stroke="#5FB35E" strokeWidth="5" strokeLinecap="round" />
    <ellipse cx="-13" cy="-48" rx="15" ry="6" fill="#6FBF6E" transform="rotate(-24 -13 -48)" /><ellipse cx="13" cy="-48" rx="15" ry="6" fill="#6FBF6E" transform="rotate(24 13 -48)" />
  </g>;
}
const Leaf = ({ x, y, r = 0, c = "#B9772E" }) => <ellipse cx={x} cy={y} rx="17" ry="8" fill={c} transform={`rotate(${r} ${x} ${y})`} />;
const Clump = ({ x, y, r = 34 }) => <path d={`M${x - r} ${y} q ${r * 0.1} ${-r * 0.8} ${r * 0.8} ${-r * 0.85} q ${r} ${-r * 0.1} ${r * 1.2} ${r * 0.85} Z`} fill={SOILD} />;
const Sign = ({ x, y, text, c = RED, size = 25 }) => { const w = text.length * size * 0.56 + 30; return <g><rect x={x - w / 2} y={y - size - 8} width={w} height={size + 20} rx="10" fill={c} /><text x={x} y={y + 3} textAnchor="middle" fontFamily={SANS} fontWeight="700" fontSize={size} fill="#fff">{text}</text></g>; };
const Eye = ({ x, y, s = 1 }) => <g transform={`translate(${x} ${y}) scale(${s})`}><path d="M-52 0 Q 0 -44 52 0 Q 0 44 -52 0 Z" fill="#fff" stroke={SK.ink} strokeWidth="5" /><circle r="19" fill={BLUE} /><circle r="8" fill={SK.ink} /></g>;
const AID = ({ x, y, s = 1 }) => <g transform={`translate(${x} ${y}) scale(${s})`}><rect x="-52" y="-46" width="104" height="82" rx="8" fill="#fff" stroke="#B0B0B0" strokeWidth="3" /><rect x="-16" y="-58" width="32" height="14" rx="5" fill="#B0B0B0" /><rect x="-9" y="-30" width="18" height="50" fill={RED} /><rect x="-25" y="-14" width="50" height="18" fill={RED} /></g>;
// Hands behind the back (listening); a raised hand.
const LISTEN = { ...POSES.stand, sL: -26, eL: 40, sR: -26, eR: 40, head: 4 };
const RAISE = { ...POSES.stand, sR: 168, eR: -8, sL: 4, eL: -6, head: -6 };
const SWING = (a) => ({ ...POSES.stand, sR: a, eR: -10, sL: a - 8, eL: -8, lean: -3, hL: 12, kL: 0, hR: -10, head: -6 });

// ============================================================================
function B1(ctx) {
  return ({ localTime: lt, duration }) => {
    const cLook = S("b1", 1), cShapes = S("b1", 2), cQ = S("b1", 3), s = stopFor("b1"), stop = stopAt("b1", s[1]);
    const a = out3(lt, cLook, 0.6), panK = drive(lt, cLook, cShapes), fit = drive(lt, cShapes - 0.3, cShapes + 0.9);
    const zoom = lerp(1.7, 1, fit), xCam = lerp(lerp(40, -870, panK), 40, fit), yCam = lerp(100, 110, fit);
    const silAt = (i) => reveal(lt, cShapes + 0.5 + i * 0.12, 0.5);
    const Up = cQ - 0.2, rackY = lerp(yCam, 60, drive(lt, Up, Up + 0.8));
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[1]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(1, ctx, [L("Welcome to the agriculture lab", 0.5), L("BIG QUESTION", cQ, "head"), L("How can you tell what a tool does just by looking at its SHAPE?", cQ + 0.4, "big"), L(s[3], stop, "think")])}>
        <Pic slot="lab_rack" label="The school agriculture lab with its tool rack" x={40} y={60} w={1360} h={860} lt={lt} at={0} fx="zoom" zoom={1.1} out={cLook + 0.1} />
        <SVG op={a}>
          <defs><clipPath id="b1c"><rect x="40" y="60" width="1360" height="860" rx="18" /></clipPath></defs>
          <g clipPath="url(#b1c)"><Rack x={xCam} y={rackY} s={zoom} sil={silAt} names={1 - reveal(lt, cShapes, 0.5)} /></g>
        </SVG>
        <Card x={40} y={530} w={1360} h={370} lt={lt} at={cQ} out={stop - 0.1} pad={30}>
          <Badge text="BIG QUESTION" x={30} y={26} lt={lt} at={cQ} size={30} />
          <div style={{ position: "absolute", left: 34, top: 112, width: 1290, fontFamily: SERIF, fontWeight: 700, fontSize: 58, lineHeight: 1.2, color: SK.white, opacity: out3(lt, cQ + 0.8, 0.6) }}>
            Can you tell what a tool does, just by looking at its <span style={{ color: SK.gold }}>SHAPE</span>?</div>
        </Card>
        <StopBox lt={lt} b="b1" x={40} y={530} h={370} q={s[3]} size={50} />
      </Scene>
    );
  };
}

function B2(ctx) {
  return ({ localTime: lt, duration }) => {
    const cH = W("b2", "handle"), cW = W("b2", "working"), cShape = S("b2", 1), cClue = W("b2", "clue");
    const hop = out3(lt, 0.2, 0.6);
    const [ex, ey] = toWorld(170, 400, 1.75, -90, ENDS.hoe);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[2]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(2, ctx, [L("Every tool =", cH - 1, "head"), L("HANDLE (you hold it)", cH), L("+ WORKING END (it does the job)", cW), L("The SHAPE of the working end is a CLUE to its job", cShape + 0.3, "big")])}>
        <Card x={40} y={60} w={1360} h={530} lt={lt} at={0.1} />
        <SVG op={hop}>
          <Tool kind="hoe" x={170} y={400} s={1.75} r={-90} />
          <g transform="translate(330 392)" opacity={out3(lt, cH, 0.4)}><rect x="-16" y="-34" width="60" height="68" rx="26" fill={window.TPPeople.SKIN.tan} /><path d="M-6 -34 v68 M10 -34 v68 M26 -34 v68" stroke="rgba(0,0,0,0.2)" strokeWidth="3" /></g>
          <g opacity={out3(lt, cH, 0.5)}><line x1="400" y1="300" x2="400" y2="382" stroke={SK.white} strokeWidth="5" /><circle cx="400" cy="390" r="8" fill={SK.white} /></g>
          <Finder tx={ex} ty={ey} lt={lt} at={cW - 0.2} from={[1100, 900]} r={92} />
        </SVG>
        <Chip text="HANDLE" x={400} y={240} lt={lt} at={cH} tone="cream" size={36} />
        <Chip text="WORKING END" x={1090} y={84} lt={lt} at={cW} tone="gold" size={36} />
        <Pic slot="hoe" label="A hoe breaking up soil" x={40} y={620} w={300} h={290} lt={lt} at={cW} fx="pop" />
        <div style={{ position: "absolute", left: 380, top: 650, width: 1020, fontFamily: SERIF, fontWeight: 700, fontSize: 64, lineHeight: 1.16, color: SK.white, opacity: out3(lt, cShape, 0.6) }}>
          The <span style={{ color: SK.gold }}>SHAPE</span> of the working end<br />is your <span style={{ color: SK.gold, display: "inline-block", transform: `scale(${1 + 0.16 * Math.sin(Math.PI * reveal(lt, cClue, 0.7))})` }}>CLUE!</span></div>
      </Scene>
    );
  };
}

function B3(ctx) {
  return ({ localTime: lt, duration }) => {
    const c1 = S("b3", 0), cCut = W("b3", "cut"), cSick = W("b3", "sickle"), cSec = W("b3", "secateurs"), cWith = S("b3", 3), cDeep = W("b3", "deep"), cSq = W("b3", "squeeze"),
      cLock = S("b3", 4), cOnly = S("b3", 5), cTeach = W("b3", "teacher");
    const A = 1 - reveal(lt, cWith - 0.1, 0.45), B = windowOp(lt, cWith, cOnly + 0.1, 0.4), C = out3(lt, cOnly, 0.5);
    const inn = drive(lt, cDeep - 0.2, cDeep + 1.2), sq = drive(lt, cSq, cSq + 1.3), lock = reveal(lt, cLock + 0.4, 0.3);
    const open = lerp(lerp(0, 1, reveal(lt, cWith, 0.6)), 0, sq);
    // Secateurs lie handles-right, blades-left; pivot on stage at (sx,sy). The twig slides in from the tips.
    const sx = 540, sy = 410, ss = 2, cutDone = sq >= 1, fall = clamp((lt - (cSq + 1.3)) / 0.8, 0, 1);
    const twigX = lerp(sx - 350, sx - 110, inn), catchX = sx + 248;
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[3]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(3, ctx, [L("SHARP EDGE → CUTS", cCut, "big"), L("Sickle: cuts crops", cSick), L("Secateurs: cut stems and branches", cSec),
          L("Place the stem deep in the blades", cDeep), L("Squeeze slowly", cSq), L("Lock the catch after use", cLock), L("Only when your teacher says so", cOnly, "think")], { max: 6 })}>
        {A > 0 && <div style={{ position: "absolute", inset: 0, opacity: A }}>
          <ClueHead n={1} shape="SHARP EDGE" job="CUTS" lt={lt} at={c1} jobAt={cCut} />
          <ToolCard x={40} y={140} w={670} h={760} lt={lt} at={0.15} kind="sickle" tx={140} ty={190} s={1.45} r={0} name="Sickle: cuts crops" nameAt={cSick} />
          <Pic slot="sickle" label="A farmer cuts the crop with a sickle" x={400} y={240} w={290} h={290} lt={lt} at={cSick} fx="pop" />
          <ToolCard x={730} y={140} w={670} h={760} lt={lt} at={0.5} kind="secateurs" tx={900} ty={210} s={1.4} name="Secateurs: cut stems and branches" nameAt={cSec} />
          <SVG>
            <Finder tx={285} ty={495} lt={lt} at={0.3} out={cSec - 0.2} />
            <Finder tx={902} ty={510} lt={lt} at={cSec} from={[1300, 900]} />
          </SVG>
        </div>}
        {B > 0 && <div style={{ position: "absolute", inset: 0, opacity: B }}>
          <Card x={40} y={60} w={900} h={740} lt={lt} at={cWith} />
          <SVG>
            <rect x={twigX - 11} y={130} width="22" height={sy - 130} rx="9" fill="#8A6A45" />
            <rect x={twigX - 11} y={sy - 4} width="22" height="330" rx="9" fill="#8A6A45" opacity={1 - fall} transform={`translate(${fall * 26} ${fall * 170})`} />
            <g transform={`translate(${sx} ${sy}) rotate(90) scale(${ss}) translate(0 -150)`}><ToolArt kind="secateurs" open={open} lock={lock} /></g>
            <Arrow x1={sx - 330} y1={700} x2={sx - 130} y2={700} color={SK.gold} op={windowOp(lt, cDeep - 0.2, cSq, 0.3)} />
            <g opacity={windowOp(lt, cSq, cLock, 0.3)}>
              <Arrow x1={sx + 200} y1={sy - 170} x2={sx + 200} y2={sy - 60} color={SK.gold} /><Arrow x1={sx + 200} y1={sy + 170} x2={sx + 200} y2={sy + 60} color={SK.gold} />
            </g>
            {lock > 0 && <circle cx={catchX} cy={sy} r={40 + 70 * reveal(lt, cLock + 0.4, 0.5)} stroke={SK.gold} strokeWidth="6" opacity={1 - reveal(lt, cLock + 0.4, 0.5)} />}
          </SVG>
          <Chip text="deep between the blades" x={270} y={90} lt={lt} at={cDeep} size={30} />
          <Chip text="squeeze slowly" x={700} y={90} lt={lt} at={cSq} size={30} tone="gold" />
          <Chip text="catch locked" x={700} y={690} lt={lt} at={cLock + 0.4} size={34} tone="gold" />
          <Pic slot="secateurs_snip" label="Secateurs cutting a dry twig deep between the blades" x={970} y={60} w={430} h={600} lt={lt} at={cWith + 0.2} fx="zoom" />
        </div>}
        {C > 0 && <div style={{ position: "absolute", inset: 0, opacity: C }}>
          <Box id="b3c" x={40} y={60} w={1360} h={850} f={760} op={1}>
            <g transform="translate(180 130)"><rect x="0" y="0" width="520" height="470" rx="12" fill="#D9C39A" stroke="#A98A58" strokeWidth="6" />
              <rect x="170" y="16" width="180" height="40" rx="6" fill="#FFF8E7" stroke="#A98A58" strokeWidth="2" /><text x="260" y="45" textAnchor="middle" fontFamily={SANS} fontWeight="700" fontSize="27" fill={SK.ink}>Sickle</text>
              <Tool kind="sickle" x={210} y={70} s={1.1} />
              <g opacity={pop(lt, cTeach - 0.5, 0.5)}><path d="M360 110 L400 90" stroke="#555" strokeWidth="3" /><Sign x={420} y={150} text="Teacher only" size={30} /></g></g>
            <Student x={1010} y={770} h={520} pose={poseAt(lt, [[0, "stand"], [cOnly + 0.5, "point"]])} facing={-1} outfit="teacher" adult skin="brown" lt={lt} at={cOnly} seed={2} />
          </Box>
        </div>}
      </Scene>
    );
  };
}

function B4(ctx) {
  return ({ localTime: lt, duration }) => {
    const c1 = S("b4", 0), cDig = W("b4", "dig"), cLoose = W("b4", "loosen"), cWeed = W("b4", "pull"), cKh = S("b4", 2), cKneel = W("b4", "kneel"), cSlide = W("b4", "slide"), cLift = W("b4", "lift"),
      cHoe = S("b4", 3), cPull = W("b4", "short"), cFar = W("b4", "keep");
    const A = 1 - reveal(lt, cKh - 0.1, 0.45), B = windowOp(lt, cKh, cHoe + 0.1, 0.4), C = out3(lt, cHoe, 0.5);
    const ground = 660;
    const pk = poseAt(lt, [[0, "stand"], [cKneel, KNEEL], [cSlide, { ...KNEEL, sR: 40, eR: 2 }], [cLift, { ...KNEEL, sR: 74, eR: -6 }]], 0.8);
    const slide = drive(lt, cSlide, cSlide + 1.1), lift = drive(lt, cLift + 0.2, cLift + 1.5);
    const pullT = clamp(lt - cPull, 0, 99), ph = Math.sin(pullT * 3.6) * (lt < cFar + 2 ? 1 : 0.5);
    const ph2 = { ...POSES.stand, sR: 42 + 13 * ph, eR: 16, sL: 28 + 13 * ph, eL: 10, lean: -7, hL: 12, kL: 0, hR: -12, kR: 6, head: 12 };
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[4]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(4, ctx, [L("POINTED or CURVED BLADE", c1 + 0.3, "big"), L("→ DIGS", cDig), L("→ LOOSENS SOIL", cLoose), L("→ REMOVES WEEDS", cWeed),
          L("Khurpi: kneel, slide in beside the weed, lift the root out", cKh), L("Hoe: short pulls, blade far from your feet", cHoe)], { max: 6 })}>
        {A > 0 && <div style={{ position: "absolute", inset: 0, opacity: A }}>
          <ClueHead n={2} shape="POINTED or CURVED BLADE" lt={lt} at={c1} />
          <ToolCard x={40} y={140} w={670} h={620} lt={lt} at={0.15} kind="khurpi" tx={375} ty={190} s={1.15} name="Khurpi" />
          <ToolCard x={730} y={140} w={670} h={620} lt={lt} at={0.5} kind="hoe" tx={1010} ty={160} s={0.95} name="Hoe" />
          <SVG>
            <Finder tx={375} ty={448} lt={lt} at={0.3} out={c1 + 1.3} from={[100, 900]} />
            <Finder tx={1098} ty={572} lt={lt} at={c1 + 1.3} from={[1300, 900]} />
          </SVG>
          <Steps x={40} y={790} lt={lt} size={38} gap={20} items={[["DIGS", cDig], ["LOOSENS SOIL", cLoose], ["PULLS OUT WEEDS", cWeed]]} />
        </div>}
        {B > 0 && <div style={{ position: "absolute", inset: 0, opacity: B }}>
          <Box id="b4k" x={40} y={60} w={1360} h={850} f={ground} floor={SOIL}>
            <rect x="40" y={ground + 110} width="1360" height="200" fill={SOILD} opacity="0.5" />
            <Student x={430} y={ground} h={420} pose={pk} facing={1} girl skin="tan" gloves lt={lt} seed={1} propR={held(pk, "khurpi", { k: 0.15, g: 60, A: lerp(lerp(40, 16, slide), 60, lift) })} />
            <Weed x={720} y={ground} s={1.5} lift={lift * 130} />
            <Arrow x1={720 + 100} y1={ground + 40} x2={720 + 100} y2={ground - 120} color={SK.gold} op={windowOp(lt, cLift, cHoe, 0.3)} />
          </Box>
          <Pic slot="khurpi_weed" label="A khurpi lifts a weed out, root and all" x={980} y={80} w={400} h={290} lt={lt} at={cKh + 0.3} fx="zoom" />
          <Steps x={70} y={80} lt={lt} items={[["1 Kneel", cKneel], ["2 Slide in beside the weed", cSlide], ["3 Lift it out, root and all", cLift]]} />
        </div>}
        {C > 0 && <div style={{ position: "absolute", inset: 0, opacity: C }}>
          <Box id="b4h" x={40} y={60} w={1360} h={850} f={ground + 100} floor={SOIL}>
            <Student x={380} y={ground + 100} h={500} pose={ph2} facing={1} girl={false} skin="brown" lt={lt} seed={3} propR={held(ph2, "hoe", { k: 0.25, g: 120, A: 50 })} />
            <g opacity={out3(lt, cFar, 0.5)}><line x1="420" y1={ground + 145} x2={900} y2={ground + 145} stroke={SK.gold} strokeWidth="7" /><path d={`M420 ${ground + 125} v40 M900 ${ground + 125} v40`} stroke={SK.gold} strokeWidth="7" /></g>
            <Arrow x1={1010} y1={ground - 100} x2={810} y2={ground - 100} color={SK.white} op={windowOp(lt, cPull, cFar + 1, 0.3)} />
          </Box>
          <Chip text="far from your feet" x={660} y={ground + 170} lt={lt} at={cFar} tone="gold" size={32} />
          <Chip text="short, gentle pulls" x={860} y={ground - 170} lt={lt} at={cPull} size={32} />
          <Pic slot="hoe" label="A hoe breaking up soil" x={1040} y={80} w={340} h={340} lt={lt} at={cHoe + 0.3} fx="pop" />
        </div>}
      </Scene>
    );
  };
}

function B5(ctx) {
  return ({ localTime: lt, duration }) => {
    const c1 = S("b5", 0), cLift = S("b5", 1), cTr = S("b5", 2), cPots = W("b5", "filling"), cSh = S("b5", 3), cBend = S("b5", 4), cOver = W("b5", "never");
    const A = 1 - reveal(lt, cTr - 0.1, 0.45), B = out3(lt, cTr, 0.5);
    const f = 720;
    const tp = poseAt(lt, [[0, { ...POSES.stand, sR: 62, eR: 20, head: 14 }], [cPots, { ...POSES.stand, sR: 66, eR: 14, head: 16 }]]);
    const spill = clamp((lt - cPots) / 2.2, 0, 1);
    const bend = drive(lt, cBend - 0.1, cBend + 1), rise = drive(lt, cOver - 0.2, cOver + 0.9);
    const k = bend * (1 - rise * 0.8);
    const sp = { ...POSES.stand, sR: 46 + 8 * k, eR: 22, sL: 30, eL: 30, lean: -8 - 4 * k, hL: 42 * k, kL: -60 * k, hR: 34 * k, kR: -58 * k, dy: 13 * k, head: 8 };
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[5]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(5, ctx, [L("SCOOP → LIFTS and MOVES SOIL", cLift, "big"), L("Trowel: small amounts, pots and beds", cTr), L("Shovel: bigger loads", cSh), L("Bend your knees", cBend), L("Don't overload", cOver)])}>
        {A > 0 && <div style={{ position: "absolute", inset: 0, opacity: A }}>
          <ClueHead n={3} shape="SCOOP" job="LIFTS and MOVES SOIL" lt={lt} at={c1} jobAt={cLift} />
          <ToolCard x={40} y={140} w={670} h={760} lt={lt} at={0.15} kind="trowel" tx={375} ty={210} s={1.4} name="Trowel" />
          <ToolCard x={730} y={140} w={670} h={760} lt={lt} at={0.5} kind="shovel" tx={1065} ty={170} s={1.02} name="Shovel" />
          <SVG>
            <Finder tx={375} ty={525} lt={lt} at={0.3} out={c1 + 1.2} from={[100, 900]} />
            <Finder tx={1065} ty={578} lt={lt} at={c1 + 1.2} from={[1300, 900]} />
          </SVG>
        </div>}
        {B > 0 && <div style={{ position: "absolute", inset: 0, opacity: B }}>
          <Box id="b5l" x={40} y={60} w={670} h={850} f={f}>
            <LabTable x={330} y={560} w={340} legH={146} />
            <Pot x={500} y={560} s={1.25} fill={spill} />
            <Student x={190} y={f} h={420} pose={tp} facing={1} girl skin="tan" gloves lt={lt} seed={1} propR={held(tp, "trowel", { k: 0.17, g: 55, A: 112 })} />
            {Array.from({ length: 9 }, (_, i) => { const u = ((lt * 1.3 + i * 0.11) % 1), o = windowOp(lt, cPots, cPots + 2.2, 0.2); return <circle key={i} cx={456 + rnd(i) * 40} cy={420 + u * 60} r="5" fill={SOIL} opacity={o} />; })}
          </Box>
          <Box id="b5r" x={730} y={60} w={670} h={850} f={f} floor={SOIL} op={out3(lt, cSh, 0.5)}>
            <path d="M1150 722 q 80 -110 180 -70 q 70 30 90 70 Z" fill={SOILD} />
            <Student x={880} y={f} h={460} pose={sp} facing={1} girl={false} skin="brown" gloves lt={lt} seed={2} propR={held(sp, "shovel", { k: 0.22, g: 140, A: 50 + 14 * rise })} />
          </Box>
          <Pic slot="trowel_pot" label="A half-full trowel fills a pot" x={60} y={78} w={250} h={170} lt={lt} at={cTr + 0.3} fx="pop" />
          <Pic slot="shovel_load" label="A shovel lifts a small load of soil" x={1080} y={80} w={300} h={210} lt={lt} at={cSh + 0.3} fx="pop" />
          <Chip text="half full" x={520} y={290} lt={lt} at={cTr + 1} size={30} />
          <Chip text="small load" x={1260} y={330} lt={lt} at={cSh + 0.8} size={30} />
          <Chip text="knees bent, back straight" x={1065} y={790} lt={lt} at={cBend + 0.4} size={32} tone="gold" />
          <Chip text="never overload it!" x={1065} y={845} lt={lt} at={cOver} size={32} tone="cream" />
        </div>}
      </Scene>
    );
  };
}

function B6(ctx) {
  return ({ localTime: lt, duration }) => {
    const c1 = S("b6", 0), cLv = W("b6", "collect"), cBreak = W("b6", "break"), cLevel = W("b6", "level"), cPull = S("b6", 2), cNever = S("b6", 3), cStep = S("b6", 4);
    const A = 1 - reveal(lt, cLv + 0.8, 0.45), B = windowOp(lt, cLv + 0.8, cNever + 0.1, 0.4), C = out3(lt, cNever, 0.5);
    const f = 640;
    const gather = drive(lt, cLv + 0.8, cBreak + 0.2), brk = drive(lt, cBreak, cLevel), lvl = drive(lt, cLevel, cPull + 0.4);
    const ph = Math.sin(clamp(lt - cLv, 0, 99) * 2.8);
    const rp = { ...POSES.stand, sR: 44 + 12 * ph, eR: 14, sL: 32 + 12 * ph, eL: 8, lean: -5, hL: 10, hR: -10, kR: 4, head: 10 };
    const step = drive(lt, cNever + 0.4, cStep + 0.3);
    const sw = { ...walk(lt * (1 - step * 0), 0), hR: 34 * Math.sin(Math.PI * clamp(step * 1.1, 0, 1)) + 10, kR: -30 * Math.sin(Math.PI * clamp(step * 1.1, 0, 1)), hL: -10, sL: 8, sR: -8, eL: -10, eR: -10, head: 16 };
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[6]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(6, ctx, [L("TEETH →", c1 + 0.3, "big"), L("COLLECT LEAVES", cLv), L("BREAK CLUMPS", cBreak), L("LEVEL the ground", cLevel), L("Pull towards you", cPull), L("Store it HANGING or teeth DOWN, never teeth up", cNever, "think")], { max: 6 })}>
        {A > 0 && <div style={{ position: "absolute", inset: 0, opacity: A }}>
          <ClueHead n={4} shape="TEETH" lt={lt} at={c1} />
          <ToolCard x={40} y={140} w={1360} h={760} lt={lt} at={0.15} kind="rake" tx={1180} ty={520} s={1.6} r={90} name="Rake" />
          <SVG><Finder tx={510} ty={520} lt={lt} at={0.3} from={[100, 900]} r={90} /></SVG>
        </div>}
        {B > 0 && <div style={{ position: "absolute", inset: 0, opacity: B }}>
          <Box id="b6a" x={40} y={60} w={1360} h={850} f={f} floor={SOIL}>
            {Array.from({ length: 16 }, (_, i) => { const x0 = 760 + rnd(i) * 560, y0 = f + 30 + rnd(i + 30) * 170, x1 = 640 + rnd(i + 9) * 110, y1 = f + 96 + rnd(i + 4) * 40;
              return <Leaf key={i} x={lerp(x0, x1, gather)} y={lerp(y0, y1, gather)} r={rnd(i + 2) * 180 + gather * 60} c={i % 3 ? "#B9772E" : "#8A5A2B"} />; })}
            {[[860, 720], [1040, 790], [1220, 730]].map(([x, y], i) => <g key={i} opacity={lt > cBreak - 0.5 ? 1 : 0}>
              {brk < 0.5 ? <Clump x={x} y={y} r={46} /> : [0, 1, 2, 3].map((j) => <Clump key={j} x={x - 34 + j * 26 + 30 * brk * (j - 1.5)} y={y + (j % 2) * 8} r={lerp(26, 12, lvl)} />)}</g>)}
            <Student x={330} y={f + 40} h={460} pose={rp} facing={1} girl skin="tan" lt={lt} seed={4} propR={held(rp, "rake", { k: 0.25, g: 130, A: 56 })} />
            <Arrow x1={1060} y1={f - 150} x2={860} y2={f - 150} color={SK.white} op={windowOp(lt, cPull - 0.2, cNever, 0.3)} />
          </Box>
          <Pic slot="rake_leaves" label="A rake gathers dry leaves into a pile" x={1040} y={80} w={340} h={240} lt={lt} at={cLv + 1} fx="pop" />
          <Steps x={70} y={80} lt={lt} items={[["Collect leaves", cLv + 0.8], ["Break clumps", cBreak], ["Level the ground", cLevel]]} />
          <Chip text="pull gently towards you" x={930} y={f - 230} lt={lt} at={cPull} size={32} tone="gold" />
        </div>}
        {C > 0 && <div style={{ position: "absolute", inset: 0, opacity: C }}>
          <Box id="b6l" x={40} y={60} w={670} h={850} f={730}>
            <g transform="translate(90 120)"><rect width="560" height="520" rx="10" fill="#E6D9BF" stroke="#A98A58" strokeWidth="6" /><Tool kind="rake" x={280} y={40} s={1.0} /></g>
            <Mark x={640} y={130} lt={lt} at={cNever + 0.3} />
          </Box>
          <Box id="b6r" x={730} y={60} w={670} h={850} f={700}>
            <RakeUp x={1000} y={740} s={1.15} />
            <Student x={lerp(1330, 1160, step)} y={722} h={440} pose={sw} facing={-1} girl={false} skin="brown" lt={lt} seed={5} />
            <Mark x={1300} y={130} lt={lt} at={cNever + 0.3} ok={false} />
          </Box>
          <Chip text="hang it up, or teeth down" x={375} y={800} lt={lt} at={cNever + 0.4} size={32} />
          <Chip text="never teeth-up!" x={1065} y={826} lt={lt} at={cNever + 0.4} size={32} tone="gold" />
          <Pic slot="rake_hung" label="A rake hanging on the wall" x={60} y={80} w={210} h={150} lt={lt} at={cNever + 0.6} fx="pop" />
        </div>}
      </Scene>
    );
  };
}

function B7(ctx) {
  return ({ localTime: lt, duration }) => {
    const c1 = S("b7", 0), cRain = S("b7", 1), cKnock = W("b7", "knocked"), cHold = S("b7", 2), cSlow = W("b7", "slowly"), s = stopFor("b7"), stop = stopAt("b7", s[1]);
    const A = 1 - reveal(lt, cRain - 0.1, 0.45), B = windowOp(lt, cRain, cHold + 0.1, 0.4), C = windowOp(lt, cHold, stop + 0.4, 0.4);
    const f = 800, knock = drive(lt, cKnock - 0.8, cKnock + 0.3);
    const cp = { ...POSES.stand, sR: 56, eR: 12, sL: 8, eL: -10, lean: -6, head: 16 };
    const cX = 400, cH = 520, ck = 0.21, [chx, chy] = handXY(cX, f, cH, cp), [crx, cry] = toWorld(chx, chy, ck * cH / 100, 26, [224, 58 - 16]);
    const [lrx, lry] = toWorld(205, 215, 1.0, 40, ENDS.can);
    const JOBS = [["sharp edge", "cuts", "sickle", 0.5, 100, -30], ["curved blade", "digs and weeds", "khurpi", 0.7, 0, 0], ["scoop", "lifts and moves soil", "trowel", 0.7, 0, 0], ["teeth", "collects, levels", "rake", 0.5, 0, 0], ["rose", "gentle rain", "can", 0.62, -30, 0]];
    const SHUF = [2, 4, 0, 3, 1];
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[7]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(7, ctx, [L("ROSE SPOUT → water like GENTLE RAIN", c1 + 0.5, "big"), L("Protects delicate plants and seedlings", cRain + 1), L("Hold it low", cHold), L("Water the soil", cHold + 0.9), L("Go slowly", cSlow)])}>
        {A > 0 && <div style={{ position: "absolute", inset: 0, opacity: A }}>
          <ClueHead n={5} shape="THE ROSE" lt={lt} at={c1} />
          <ToolCard x={40} y={140} w={800} h={760} lt={lt} at={0.15} kind="can" tx={330} ty={330} s={1.75} name="Watering can" />
          <SVG><Finder tx={694} ty={456} lt={lt} at={0.3} from={[100, 900]} r={80} /></SVG>
          <Pic slot="watering" label="A watering can with a rose over seedlings" x={870} y={200} w={530} h={530} lt={lt} at={c1 + 1} fx="zoom" />
        </div>}
        {B > 0 && <div style={{ position: "absolute", inset: 0, opacity: B }}>
          <Box id="b7l" x={40} y={60} w={670} h={850} f={f} floor={SOIL}>
            <Tool kind="can" x={205} y={215} s={1.0} r={40} />
            {Array.from({ length: 34 }, (_, i) => { const u = ((lt * 0.9 + rnd(i)) % 1); return <ellipse key={i} cx={lrx + (rnd(i + 8) - 0.2) * 280 * u + 30 * (1 - u)} cy={lry + u * (f - lry)} rx="3" ry="6" fill="#7FC4F0" />; })}
            {[0, 1, 2, 3, 4, 5].map((i) => <Seedling key={i} x={250 + i * 76} y={f} s={1.7} />)}
            <Mark x={630} y={140} lt={lt} at={cRain + 0.3} />
          </Box>
          <Box id="b7r" x={730} y={60} w={670} h={850} f={f} floor={SOIL}>
            <g transform="translate(860 210) rotate(112)"><rect x="-44" y="-90" width="88" height="200" rx="16" fill="#9FD3E8" stroke="#fff" strokeWidth="3" opacity="0.9" /><rect x="-17" y="-128" width="34" height="42" fill="#9FD3E8" stroke="#fff" strokeWidth="3" /></g>
            <path d={`M762 186 C 860 200, 970 330, 1010 ${f}`} stroke="#5FB2E8" strokeWidth="30" strokeLinecap="round" fill="none" opacity={windowOp(lt, cRain, cHold + 1, 0.3)} />
            {[0, 1, 2, 3, 4, 5].map((i) => <Seedling key={i} x={860 + i * 76} y={f} s={1.7} flat={knock * (i % 2 ? -1 : 1) * clamp(1 - Math.abs(i - 2) * 0.1, 0, 1)} />)}
            <Mark x={1320} y={140} lt={lt} at={cKnock} ok={false} />
          </Box>
          <Chip text="gentle rain: seedlings stand" x={375} y={850} lt={lt} at={cRain + 0.3} size={30} />
          <Chip text="poured hard: seedlings flat" x={1065} y={850} lt={lt} at={cKnock} size={30} tone="gold" />
        </div>}
        {C > 0 && <div style={{ position: "absolute", inset: 0, opacity: C }}>
          <Box id="b7c" x={40} y={60} w={1360} h={850} f={f} floor={SOIL}>
            <Student x={cX} y={f} h={cH} pose={cp} facing={1} girl skin="tan" lt={lt} seed={6} propR={held(cp, "can", { k: ck, g: 16, A: -26 })} />
            {Array.from({ length: 20 }, (_, i) => { const u = ((lt * 0.9 + rnd(i)) % 1); return <ellipse key={i} cx={crx + (rnd(i + 8) - 0.3) * 130 * u} cy={cry + u * (f - cry)} rx="3" ry="6" fill="#7FC4F0" />; })}
            {[0, 1, 2, 3].map((i) => <Seedling key={i} x={crx - 50 + i * 76} y={f} s={1.7} />)}
          </Box>
          <Pic slot="rose_close" label="Fine drops from the rose of a watering can" x={960} y={80} w={420} h={300} lt={lt} at={cHold + 0.2} fx="zoom" />
          <Steps x={70} y={80} lt={lt} items={[["Hold it low", cHold], ["Water the soil", cHold + 0.9], ["Go slowly", cSlow]]} />
        </div>}
        {/* Stop 2: shapes in a row, jobs shuffled beneath, for the class to match */}
        <StopBox lt={lt} b="b7" heading="HAVE YOU UNDERSTOOD?" q="Match each shape to its job" size={44}>
          <svg width="1270" height="280" viewBox="0 0 1270 280" style={{ marginTop: 12 }}>
            {JOBS.map(([sh, , k, ts], i) => { const [ex, ey] = ENDS[k], cx = 127 + i * 254; return <g key={k}>
              <rect x={cx - 112} y="4" width="224" height="272" rx="16" fill="rgba(255,255,255,0.1)" />
              <clipPath id={`j${i}`}><rect x={cx - 112} y="4" width="224" height="212" rx="16" /></clipPath>
              <g clipPath={`url(#j${i})`}><Tool kind={k} x={cx - ex * (ts + 0.2)} y={110 - ey * (ts + 0.2)} s={ts + 0.2} /></g>
              <text x={cx} y="256" textAnchor="middle" fontFamily={SANS} fontWeight="700" fontSize="31" fill={SK.gold}>{sh}</text></g>; })}
          </svg>
          <div style={{ display: "flex", gap: 14, marginTop: 14, flexWrap: "nowrap" }}>{SHUF.map((j) => <div key={j} style={{ fontFamily: SANS, fontWeight: 700, fontSize: 27, color: SK.ink, background: SK.cream, borderRadius: 10, padding: "7px 16px", whiteSpace: "nowrap" }}>{JOBS[j][1]}</div>)}</div>
        </StopBox>
        <Break lt={lt} at={stop + s[2] + 0.1} dur={2.5} />
      </Scene>
    );
  };
}

// ---- The seven rules: each pair of mini-scenes draws in two boxes of a yellow card ----------
const RULES = ["Hold it FIRMLY by the handle", "Working end DOWN and AWAY from your body", "NEVER swing or throw", "NEVER leave sharp tools on the floor or table",
  "Cutting tools ONLY with the teacher", "Keep a SAFE DISTANCE from others", "RETURN every tool to its place"];
function Fist({ x, y, r, loose = false, skin = "#CF9668" }) {
  return <g transform={`translate(${x} ${y}) rotate(${r})`}>
    {loose ? <><rect x="-60" y="-62" width="46" height="36" rx="16" fill={skin} /><path d="M-30 -30 q6 22 0 40" stroke={skin} strokeWidth="20" strokeLinecap="round" fill="none" /><path d="M-16 -44 q24 8 30 40" stroke={skin} strokeWidth="18" strokeLinecap="round" fill="none" /></>
      : <><rect x="-54" y="-40" width="108" height="84" rx="30" fill={skin} /><path d="M-26 -40 v84 M0 -40 v84 M26 -40 v84" stroke="rgba(0,0,0,0.22)" strokeWidth="4" /><rect x="-44" y="-58" width="76" height="30" rx="14" fill={skin} /></>}
  </g>;
}
const Rule = {
  0: (l, x, f, ok) => { const tx = x + 200, ty = f - 520 + (ok ? 0 : 16 * Math.sin(l * 2.4)), r = -46, ts = 1.55;
    const [hx, hy] = toWorld(tx, ty, ts, r, [0, ok ? 55 : 6]);
    return <g><Tool kind="trowel" x={tx} y={ty} s={ts} r={r} /><Fist x={hx} y={hy} r={44} loose={!ok} /></g>; },
  1: (l, x, f, ok) => { const dist = (l * 44) % 150, p = walk(l, 1.1);
    const q = ok ? { ...p, sR: 4 + 3 * Math.sin(l * 6), eR: -2 } : { ...p, sR: 92, eR: 6 };
    return <Student x={x + 170 + dist} y={f} h={440} pose={q} facing={1} girl={ok} skin={ok ? "tan" : "brown"} lt={l} seed={2} propR={held(q, "khurpi", { k: 0.17, g: 56, A: ok ? 0 : 120 })} />; },
  2: (l, x, f, ok) => { const a = ok ? 44 : 140 + 26 * Math.sin(l * 1.5); const q = ok ? { ...POSES.stand, sR: 30, eR: 8, head: 8 } : SWING(a);
    return <g>{!ok && <path d={`M${x + 100} ${f - 500} A 300 300 0 0 1 ${x + 520} ${f - 380}`} stroke="rgba(198,40,40,0.45)" strokeWidth="9" strokeDasharray="20 18" />}
      <Student x={x + 300} y={f} h={440} pose={q} facing={1} girl={false} skin="brown" lt={l} seed={3} propR={held(q, "hoe", ok ? { k: 0.27, g: 130, A: 8 } : { k: 0.27, g: 110, A: 120 + 40 * Math.sin(l * 1.5) })} /></g>; },
  3: (l, x, f, ok) => ok
    ? <g><rect x={x + 170} y={f - 500} width="300" height="400" rx="10" fill="#D9C39A" stroke="#A98A58" strokeWidth="5" /><Tool kind="sickle" x={x + 270} y={f - 470} s={0.95} /></g>
    : <g><LabTable x={x + 40} y={f - 220} w={380} legH={200} /><g transform={`translate(${x + 330} ${f - 262}) rotate(-90) scale(0.85)`}><ToolArt kind="sickle" /></g><Strike x={x + 440} y={f - 270} r={118} o={reveal(l, 0.5, 0.4)} /></g>,
  4: (l, x, f, ok) => { const sp = { ...POSES.stand, sR: 62, eR: 18, head: 14 };
    return <g><Student x={x + (ok ? 240 : 310)} y={f} h={400} pose={sp} facing={1} girl skin="tan" lt={l} seed={4} propR={held(sp, "secateurs", { k: 0.17, g: 70, A: 100, open: 0.3 + 0.3 * Math.sin(l * 2) })} />
      {ok ? <Student x={x + 100} y={f} h={510} pose={{ ...POSES.pointDown, lean: -6, head: 16 }} facing={1} outfit="teacher" adult skin="brown" lt={l} seed={5} />
        : <Strike x={x + 470} y={f - 250} r={90} o={reveal(l, 0.5, 0.4)} />}</g>; },
  5: (l, x, f, ok) => { const gap = ok ? 330 : 96, a = { ...POSES.stand, sR: 30, eR: 8 };
    return <g><Student x={x + 320 - gap / 2} y={f} h={400} pose={a} facing={1} girl skin="tan" lt={l} seed={6} propR={held(a, "khurpi", { k: 0.15, g: 56, A: 8 })} />
      <Student x={x + 320 + gap / 2} y={f} h={400} pose={a} facing={-1} girl={false} skin="brown" lt={l} seed={7} propR={held(a, "khurpi", { k: 0.15, g: 56, A: 8 })} />
      {ok ? <g opacity={reveal(l, 0.4, 0.4)}><line x1={x + 320 - gap / 2} y1={f + 34} x2={x + 320 + gap / 2} y2={f + 34} stroke={GRN} strokeWidth="7" /><path d={`M${x + 320 - gap / 2} ${f + 18} v32 M${x + 320 + gap / 2} ${f + 18} v32`} stroke={GRN} strokeWidth="7" /></g>
        : <Sign x={x + 320} y={f - 440} text="too close" size={30} />}</g>; },
  6: (l, x, f, ok) => { const k = drive(l, 0.2, 1.6), up = ok ? { ...POSES.reach, sR: lerp(60, 150, k) } : { ...POSES.stand, sR: 20 };
    return <g><rect x={x + 370} y={f - 500} width="230" height="420" rx="10" fill="#D9C39A" stroke="#A98A58" strokeWidth="5" />
      <rect x={x + 415} y={f - 486} width="140" height="34" rx="6" fill="#FFF8E7" stroke="#A98A58" strokeWidth="2" /><text x={x + 485} y={f - 461} textAnchor="middle" fontFamily={SANS} fontWeight="700" fontSize="23" fill={SK.ink}>Trowel</text>
      <path d={`M${x + 479} ${f - 442} q 6 -4 12 0 v 12 q -6 8 -12 0`} fill="#5D5D5D" />
      <Student x={x + 220} y={f} h={420} pose={up} facing={1} girl skin="tan" lt={l} seed={8} propR={ok && k < 1 ? held(up, "trowel", { k: 0.16, g: 30, A: 10 }) : null} />
      {ok && k >= 1 && <Tool kind="trowel" x={x + 485} y={f - 420} s={0.9} />}
      {!ok && <><g transform={`translate(${x + 130} ${f + 8}) rotate(-85) scale(0.8)`}><ToolArt kind="trowel" /></g><Strike x={x + 250} y={f - 30} r={72} o={reveal(l, 0.5, 0.4)} /></>}</g>; },
};
function LabMistakes({ lt }) {       // Stop 3: the busy lab with the five hidden mistakes, all drawn so each one is exact
  const f = 740, sw = SWING(150), near = { ...POSES.stand, sR: 40, eR: 10 }, kn = KNEELH;
  return <Box id="b8s" x={40} y={60} w={1360} h={850} f={f}>
    <g transform="translate(70 190) scale(0.52)"><Rack names={1} only={["sickle", "secateurs", "khurpi", "trowel", "can"]} /></g>
    <NurseryBags x={830} y={310} n={5} gap={70} />
    <rect x="800" y="372" width="400" height="14" fill="#8D6E63" />
    {/* 1 rake teeth-up on the floor */}
    <RakeUp x={350} y={870} s={0.8} />
    {/* 2 a student swinging a hoe */}
    <Student x={420} y={f + 30} h={380} pose={sw} facing={1} girl={false} skin="brown" lt={lt} seed={1} propR={held(sw, "hoe", { k: 0.24, g: 110, A: 150 })} />
    {/* table: 3 sickle on the edge, 5 secateurs left open */}
    <LabTable x={640} y={560} w={380} legH={170} />
    <g transform="translate(990 520) rotate(-90) scale(0.62)"><ToolArt kind="sickle" /></g>
    <g transform="translate(700 548) rotate(-90) scale(0.62)"><ToolArt kind="secateurs" open={1} lock={0} /></g>
    {/* 4 two students too close */}
    <Student x={1236} y={f + 70} h={380} pose={near} facing={1} girl skin="tan" lt={lt} seed={2} propR={held(near, "trowel", { k: 0.15, g: 40, A: 10 })} />
    <Student x={1318} y={f + 70} h={380} pose={near} facing={-1} girl={false} skin="deep" lt={lt} seed={3} propR={held(near, "khurpi", { k: 0.15, g: 40, A: 10 })} />
    {/* a student doing it properly, for a busy, fair picture */}
    <Pot x={760} y={840} s={0.9} fill={1} />
    <Student x={640} y={f + 130} h={330} pose={kn} facing={1} girl skin="brown" lt={lt} seed={4} gloves />
  </Box>;
}
function B8(ctx) {
  return ({ localTime: lt, duration }) => {
    const cSeven = W("b8", "seven"), rs = Array.from({ length: 7 }, (_, i) => S("b8", i + 1)), s = stopFor("b8"), stop = stopAt("b8", s[1]);
    const ri = rs.reduce((n, t, i) => (lt >= t ? i : n), -1), bx = [70, 730], bw = 640;
    const cardOp = out3(lt, rs[0], 0.5) * (1 - reveal(lt, stop - 0.1, 0.4));
    const introOp = 1 - reveal(lt, rs[0], 0.4);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[8]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(8, ctx, RULES.map((r, i) => L(`${i + 1} ${r}`, rs[i], "plain")), { max: 7 })}>
        {introOp > 0 && <div style={{ position: "absolute", inset: 0, opacity: introOp }}>
          <Big x={40} y={150} w={1360} lt={lt} at={0.3} size={72} align="center">The most important part</Big>
          {Array.from({ length: 7 }, (_, i) => { const q = pop(lt, cSeven + i * 0.1, 0.5); if (q <= 0) return null;
            return <div key={i} style={{ position: "absolute", left: 76 + i * 186, top: 400, width: 170, height: 230, borderRadius: 18, background: "rgba(5,30,22,0.7)", boxShadow: `0 0 0 5px ${YEL}`, transform: `scale(${q})`, opacity: clamp(q, 0, 1),
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: YEL, fontFamily: SERIF, fontWeight: 700 }}>
              <div style={{ fontFamily: SANS, fontSize: 20, letterSpacing: "0.1em" }}>SAFETY RULE</div><div style={{ fontSize: 110, lineHeight: 1.1 }}>{i + 1}</div></div>; })}
        </div>}
        {ri >= 0 && cardOp > 0 && <div style={{ position: "absolute", inset: 0, opacity: cardOp }}>
          <div style={{ position: "absolute", left: 40, top: 60, width: 1360, height: 850, borderRadius: 22, background: "rgba(5,30,22,0.72)", boxShadow: `0 0 0 6px ${YEL}` }} />
          <div style={{ position: "absolute", left: 70, top: 82, display: "flex", alignItems: "center", gap: 22 }}>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 28, letterSpacing: "0.08em", color: SK.ink, background: YEL, padding: "8px 22px", borderRadius: 12, whiteSpace: "nowrap" }}>SAFETY RULE {ri + 1}</div>
            <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 44, color: SK.white, whiteSpace: "nowrap" }}>{RULES[ri]}</div>
          </div>
          <SVG>
            {[true, false].map((ok, k) => { const l = lt - rs[ri], x = bx[k], f = 830, A = Rule[ri](l, x, f, ok);
              return <g key={k}><defs><clipPath id={`r${ri}${k}`}><rect x={x} y="170" width={bw} height="720" rx="16" /></clipPath></defs>
                <g clipPath={`url(#r${ri}${k})`}><rect x={x} y="170" width={bw} height={f - 170} fill={WALL} /><rect x={x} y={f} width={bw} height="60" fill={FLOOR} /><g opacity={1}>{A}</g></g>
                <rect x={x} y="170" width={bw} height="720" rx="16" stroke={ok ? GRN : RED} strokeWidth="6" />
                <Mark x={x + bw - 58} y={228} ok={ok} lt={lt} at={rs[ri] + 0.15 + k * 0.3} /></g>; })}
          </SVG>
          <div style={{ position: "absolute", left: 92, top: 186, fontFamily: SANS, fontWeight: 700, fontSize: 28, color: "#fff", background: GRN, padding: "4px 16px", borderRadius: 8 }}>RIGHT WAY</div>
          <div style={{ position: "absolute", left: 752, top: 186, fontFamily: SANS, fontWeight: 700, fontSize: 28, color: "#fff", background: RED, padding: "4px 16px", borderRadius: 8 }}>WRONG WAY</div>
        </div>}
        {lt > stop - 0.5 && <div style={{ opacity: out3(lt, stop - 0.2, 0.4) }}><LabMistakes lt={stop} />
          <StopBox lt={lt} b="b8" heading="SPOT THE MISTAKE!" x={650} y={72} w={738} h={214} q="Find five unsafe things in this picture" size={36} /></div>}
      </Scene>
    );
  };
}

function B9(ctx) {
  return ({ localTime: lt, duration }) => {
    const cBefore = S("b9", 1), cNoLoose = W("b9", "no"), cRust = W("b9", "broken"), cSt = S("b9", 2), cAid = W("b9", "keep"), cDur = S("b9", 3), cGroups = W("b9", "work"), cEye = W("b9", "keep", 1), cAfter = S("b9", 4), cLeave = W("b9", "before", 1);
    const f = 770, A = windowOp(lt, 0, cSt + 0.1, 0.3), B = windowOp(lt, cSt, cDur + 0.1, 0.4), C = windowOp(lt, cDur, cAfter + 0.1, 0.4), D = out3(lt, cAfter, 0.5);
    const tick = (a, d) => (i) => pop(lt, a + i * d, 0.35);
    const demo = poseAt(lt, [[0, { ...POSES.stand, sR: 42, eR: 16, sL: 28, eL: 10, lean: -5, head: 10 }]]);
    const n8 = Math.min(8, Math.floor(clamp((lt - cAfter - 0.2) / 0.32, 0, 8)));
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[9]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(9, ctx, [L("BEFORE", cBefore, "head"), L("Count and check every tool", cBefore + 0.3), L("Set up stations", cSt), L("Keep the first-aid box ready", cAid),
          L("DURING", cDur, "head"), L("Demonstrate first", cDur + 0.4), L("Small groups", cGroups), L("Cutting tools only under your eye", cEye), L("AFTER", cAfter, "head"), L("Count every tool back before students leave", cAfter + 0.3)], { max: 7 })}>
        {A > 0 && <div style={{ position: "absolute", inset: 0, opacity: A }}>
          <Box id="b9a" x={40} y={150} w={1360} h={760} f={f}>
            <Rack x={330} y={210} s={0.72} tick={tick(cBefore + 0.8, 0.34)} />
            <Student x={190} y={f + 40} h={520} pose={{ ...POSES.point, sR: 72 + 6 * Math.sin(lt * 3), head: -6 }} facing={1} outfit="teacher" adult skin="brown" lt={lt} seed={1} />
          </Box>
          <Pic slot="teacher_check" label="Checking that a tool handle is tight" x={1080} y={560} w={300} h={210} lt={lt} at={cNoLoose} fx="pop" />
          <Chip text="no loose handles" x={510} y={570} lt={lt} at={cNoLoose} size={32} tone="gold" />
          <Chip text="no broken or rusty edges" x={830} y={570} lt={lt} at={cRust} size={32} tone="gold" />
        </div>}
        {B > 0 && <div style={{ position: "absolute", inset: 0, opacity: B }}>
          <Box id="b9b" x={40} y={150} w={1360} h={760} f={f}>
            {[0, 1, 2].map((i) => { const x = 110 + i * 310, q = pop(lt, cSt + 0.2 + i * 0.3, 0.5); return <g key={i} opacity={clamp(q, 0, 1)}><LabTable x={x} y={560} w={270} legH={190} />
              <Tool kind={["trowel", "khurpi", "can"][i]} x={x + 56} y={i === 2 ? 498 : 548} s={i === 2 ? 0.34 : 0.5} r={i === 2 ? 0 : -90} />
              <rect x={x + 60} y="430" width="150" height="40" rx="8" fill="#FFF8E7" stroke="#A98A58" strokeWidth="2" /><text x={x + 135} y="460" textAnchor="middle" fontFamily={SANS} fontWeight="700" fontSize="25" fill={SK.ink}>Station {i + 1}</text></g>; })}
            <g opacity={clamp(pop(lt, cAid, 0.5), 0, 1)}><AID x={1120} y={516} s={1.15} /><LabTable x={1010} y={560} w={220} legH={190} /></g>
          </Box>
          <Chip text="3–4 students at each station" x={560} y={190} lt={lt} at={cSt + 0.6} size={32} />
          <Pic slot="first_aid" label="The first-aid box, open and ready" x={1090} y={170} w={290} h={210} lt={lt} at={cAid} fx="pop" />
        </div>}
        {C > 0 && <div style={{ position: "absolute", inset: 0, opacity: C }}>
          <Box id="b9c" x={40} y={150} w={1360} h={760} f={f}>
            <Student x={300} y={f + 40} h={510} pose={demo} facing={1} outfit="teacher" adult skin="brown" lt={lt} seed={1} propR={held(demo, "hoe", { k: 0.27, g: 130, A: 40 })} />
            {[[800, 1, "tan", 1], [900, 0, "brown", 2], [1000, 1, "deep", 3], [1100, 0, "light", 4]].map(([x, g, sk, sd], i) => <Student key={i} x={x} y={f + 30} h={380} pose={LISTEN} facing={-1} girl={!!g} skin={sk} lt={lt} at={cGroups - 0.2 + i * 0.1} seed={sd} />)}
            <g opacity={clamp(pop(lt, cEye, 0.5), 0, 1)}><Eye x={1190} y={290} s={1.4} /></g>
          </Box>
          <Chip text="show it slowly first" x={420} y={190} lt={lt} at={cDur + 0.4} size={32} />
          <Chip text="small groups" x={950} y={320} lt={lt} at={cGroups} size={32} />
          <Chip text="cutting tools under your eye" x={1060} y={190} lt={lt} at={cEye} size={32} tone="gold" />
        </div>}
        {D > 0 && <div style={{ position: "absolute", inset: 0, opacity: D }}>
          <Box id="b9d" x={40} y={150} w={1360} h={760} f={f}>
            <Rack x={330} y={210} s={0.72} tick={tick(cAfter + 0.2, 0.32)} />
            <Student x={190} y={f + 40} h={520} pose={{ ...POSES.point, sR: 72 + 6 * Math.sin(lt * 3), head: -6 }} facing={1} outfit="teacher" adult skin="brown" lt={lt} seed={1} />
          </Box>
          <Big x={330} y={560} w={1000} lt={lt} at={cAfter + 0.2} size={70} color={SK.ink}>{n8} of 8 back</Big>
          <Chip text="before anyone leaves" x={840} y={590} lt={lt} at={cLeave} size={34} tone="gold" anchor="left" />
        </div>}
        <Banner text="FOR TEACHERS" color={BLUE} lt={lt}><PhaseTab text="BEFORE" lt={lt} a={cBefore} b={cDur} /><PhaseTab text="DURING" lt={lt} a={cDur} b={cAfter} /><PhaseTab text="AFTER" lt={lt} a={cAfter} b={1e9} /></Banner>
      </Scene>
    );
  };
}

function B10(ctx) {
  return ({ localTime: lt, duration }) => {
    const cBefore = S("b10", 1), cGlove = W("b10", "wear", 1), cListen = W("b10", "listen"), cWhile = S("b10", 2), cStay = W("b10", "stay"), cTell = W("b10", "tell"), cAfter = S("b10", 3), cDry = W("b10", "dry"), cBack = W("b10", "put"), cWash = W("b10", "wash"),
      s = stopFor("b10"), stop = stopAt("b10", s[1]);
    const f = 770, A = windowOp(lt, 0, cListen + 0.1, 0.3), A2 = windowOp(lt, cListen, cWhile + 0.1, 0.4), B = windowOp(lt, cWhile, cAfter + 0.1, 0.4), C = windowOp(lt, cAfter, stop + 0.2, 0.4), D = out3(lt, stop, 0.4);
    const glove = poseAt(lt, [[0, "stand"], [cGlove, "glovesOn"]]);
    const kh = KNEELH;
    const tell = poseAt(lt, [[0, kh], [cTell, RAISE]]);
    const wk = { ...walk(stop * 1 + 0.3, 1.1), sR: 4, eR: -2 };
    const tiles = [["Clean", cAfter + 0.4, "tool_clean", "Wiping a trowel clean and dry"], ["Dry", cDry, null, null], ["Put back", cBack, null, null], ["Wash your hands", cWash, "hand_wash", "Washing hands at the tap"]];
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[10]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(10, ctx, [L("BEFORE", cBefore, "head"), L("Closed shoes", cBefore + 0.4), L("Gloves for soil work", cGlove), L("Listen first", cListen),
          L("DURING", cWhile, "head"), L("One tool, one job", cWhile + 0.5), L("Stay at your station", cStay), L("Tell the teacher at once about any cut or broken tool", cTell),
          L("AFTER", cAfter, "head"), L("Clean, dry, return, wash your hands", cAfter + 0.4)], { max: 6 })}>
        {A > 0 && <div style={{ position: "absolute", inset: 0, opacity: A }}>
          <Box id="b10a" x={40} y={150} w={1360} h={760} f={f}>
            <Student x={330} y={f + 40} h={560} pose={glove} facing={1} girl skin="tan" gloves={lt > cGlove + 0.4} lt={lt} seed={1} />
          </Box>
          <Pic slot="shoes_gloves" label="Closed shoes and soil gloves" x={660} y={210} w={700} h={460} lt={lt} at={cBefore + 0.3} fx="zoom" />
          <Chip text="closed shoes" x={830} y={700} lt={lt} at={cBefore + 0.5} size={34} />
          <Chip text="gloves for soil work" x={1160} y={700} lt={lt} at={cGlove} size={34} tone="gold" />
        </div>}
        {A2 > 0 && <div style={{ position: "absolute", inset: 0, opacity: A2 }}>
          <Box id="b10b" x={40} y={150} w={1360} h={760} f={f}>
            <Student x={1150} y={f + 40} h={510} pose={{ ...POSES.hold, head: 8 }} facing={-1} outfit="teacher" adult skin="brown" lt={lt} seed={1} propR={held(POSES.hold, "trowel", { k: 0.17, g: 40, A: 80 })} />
            {[[240, 1, "tan"], [410, 0, "brown"], [580, 1, "deep"], [750, 0, "light"]].map(([x, g, sk], i) => <Student key={i} x={x} y={f + 30} h={400} pose={LISTEN} facing={1} girl={!!g} skin={sk} lt={lt} seed={i + 2} gloves />)}
          </Box>
          <Chip text="hands behind your back: LISTEN" x={560} y={200} lt={lt} at={cListen + 0.2} size={34} tone="gold" />
        </div>}
        {B > 0 && <div style={{ position: "absolute", inset: 0, opacity: B }}>
          <Box id="b10c" x={40} y={150} w={1360} h={760} f={f + 30} floor={SOIL}>
            <rect x="210" y="330" width="240" height="56" rx="8" fill="#FFF8E7" stroke="#A98A58" strokeWidth="3" /><text x="330" y="370" textAnchor="middle" fontFamily={SANS} fontWeight="700" fontSize="32" fill={SK.ink}>Station 1</text>
            <line x1="330" y1="386" x2="330" y2={f + 30} stroke="#A98A58" strokeWidth="9" />
            <Student x={470} y={f + 60} h={430} pose={tell} facing={1} girl skin="tan" gloves lt={lt} seed={2} propL={null} propR={lt < cTell ? held(tell, "khurpi", { k: 0.16, g: 56, A: 26 }) : null} />
            <Weed x={690} y={f + 30} s={1.1} />
            <Student x={lerp(1600, 1000, drive(lt, cTell, cTell + 1.4))} y={f + 40} h={520} pose={walk(lt, drive(lt, cTell, cTell + 1.4) < 1 ? 1.2 : 0)} facing={-1} outfit="teacher" adult skin="brown" lt={lt} seed={1} />
          </Box>
          <Chip text="one tool, one job" x={330} y={190} lt={lt} at={cWhile + 0.5} size={34} />
          <Chip text="stay at your station" x={720} y={190} lt={lt} at={cStay} size={34} />
          <Chip text="tell your teacher AT ONCE" x={1110} y={190} lt={lt} at={cTell} size={34} tone="gold" />
        </div>}
        {C > 0 && <div style={{ position: "absolute", inset: 0, opacity: C }}>
          {tiles.map(([t, at, slot, label], i) => { const x = 40 + i * 345, q = out3(lt, at, 0.4); if (q <= 0) return null;
            return <div key={t}><Card x={x} y={160} w={325} h={620} lt={lt} at={at} />
              {slot && <Pic slot={slot} label={label} x={x + 14} y={174} w={297} h={440} lt={lt} at={at} fx="pop" />}
              {!slot && <SVG op={q}>{i === 1
                ? <g><Tool kind="trowel" x={x + 162} y={230} s={0.95} /><path d={`M${x + 60} 520 q 50 -60 100 -20 q 50 40 100 -10 v 90 h -200 Z`} fill="#FFB74D" /></g>
                : <g><rect x={x + 40} y="200" width="245" height="390" rx="10" fill="#D9C39A" stroke="#A98A58" strokeWidth="5" /><path d={`M${x + 156} 224 q 6 -4 12 0 v 12 q -6 8 -12 0`} fill="#5D5D5D" /><Tool kind="trowel" x={x + 162} y={lerp(300, 236, drive(lt, at, at + 0.9))} s={0.95} /></g>}</SVG>}
              <div style={{ position: "absolute", left: x, top: 640, width: 325, textAlign: "center", opacity: q, fontFamily: SERIF, fontWeight: 700, fontSize: 36, color: SK.white, lineHeight: 1.1 }}><span style={{ color: SK.gold }}>{i + 1}</span><br />{t}</div></div>; })}
        </div>}
        {D > 0 && <div style={{ position: "absolute", inset: 0, opacity: D }}>
          <Box id="b10d" x={40} y={150} w={1360} h={760} f={f}>
            <Student x={1000} y={f + 40} h={560} pose={wk} facing={1} girl skin="tan" lt={lt} seed={1} propR={held(wk, "khurpi", { k: 0.17, g: 56, A: 0 })} />
          </Box>
          <StopBox lt={lt} b="b10" heading="TRY IT!" x={60} y={210} w={760} h={500} q="Practise picking up, carrying and returning a tool the safe way" size={44} />
        </div>}
        <Banner text="FOR STUDENTS" color={ORANGE} lt={lt}><PhaseTab text="BEFORE" lt={lt} a={cBefore} b={cWhile} /><PhaseTab text="WHILE" lt={lt} a={cWhile} b={cAfter} /><PhaseTab text="AFTER" lt={lt} a={cAfter} b={1e9} /></Banner>
      </Scene>
    );
  };
}

function B11(ctx) {
  return ({ localTime: lt, duration }) => {
    const cYes = S("b11", 1), cClue = S("b11", 2), cRem = S("b11", 3), cEasy = W("b11", "right"), cEasier = W("b11", "easier"), cWay = W("b11", "right", 1), cSafe = W("b11", "safer");
    const sil = (i) => 1 - reveal(lt, cYes + i * 0.14, 0.5);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[11]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(11, ctx, [L("ANSWER", cYes, "head"), L("The SHAPE of the working end tells you the job", cClue, "big"), L("The RIGHT TOOL makes work easier", cEasier), L("The RIGHT WAY of handling it makes work SAFER!", cSafe, "big")])}>
        <SVG op={out3(lt, 0.1, 0.6)}><Rack x={40} y={60} s={1} sil={sil} names={1} /></SVG>
        <Badge text="YES!" x={1190} y={520} lt={lt} at={cYes} size={56} />
        <Big x={40} y={530} w={1140} lt={lt} at={cClue} size={50} align="left">The shape of the working end is your clue.</Big>
        <Card x={40} y={700} w={670} h={190} lt={lt} at={cEasy} pad={22}><div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 44, color: SK.white, lineHeight: 1.2 }}>The <span style={{ color: SK.gold }}>RIGHT TOOL</span><br />makes work <span style={{ opacity: out3(lt, cEasier, 0.4), color: SK.leaf }}>EASIER</span></div></Card>
        <Card x={730} y={700} w={670} h={190} lt={lt} at={cWay} pad={22}><div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 44, color: SK.white, lineHeight: 1.2 }}>The <span style={{ color: SK.gold }}>RIGHT WAY</span> of handling it<br />makes work <span style={{ opacity: out3(lt, cSafe, 0.4), color: SK.leaf }}>SAFER!</span></div></Card>
        <StopBox lt={lt} b="b11" heading="QUICK CHECK">
          <div style={{ marginTop: 22, textAlign: "left", width: 1160 }}>{QUICK.map((q, i) => <div key={i} style={{ display: "flex", gap: 20, marginBottom: 18, fontFamily: SANS, fontSize: 38, lineHeight: 1.2, color: SK.white }}>
            <span style={{ flex: "none", fontFamily: SERIF, fontWeight: 700, color: SK.gold }}>{i + 1}</span><span>{q}</span></div>)}</div>
        </StopBox>
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
const COLLAGE = [{ slot: "hoe", x: -60, y: -40, w: 760, h: 520, ph: 0 }, { slot: "watering", x: 640, y: -80, w: 760, h: 520, ph: 2 },
  { slot: "khurpi", x: -80, y: 520, w: 700, h: 560, ph: 4 }, { slot: "seedlings", x: 560, y: 560, w: 820, h: 560, ph: 1 }];
function Lp17Scenes(props = {}) {
  const caps = props.showCaptions === "false" ? false : props.showCaptions !== false;
  const titles = {};
  for (let n = 1; n <= NB; n++) titles[n] = str(props["title" + n + "Text"], TITLES[n]);
  const ctx = { caps, titles, capSize: num(props.captionSize, 34) };
  const B = [B1, B2, B3, B4, B5, B6, B7, B8, B9, B10, B11];
  const beats = B.map((Bn, i) => { const t = BEAT("b" + (i + 1)); return [t.start, t.start + t.dur, Bn]; });
  return (
    <StoryFrame props={props} dur={DUR} persistKey="thinkpro-lp17-how-tools-work" collage={COLLAGE}>
      {beats.map(([s, e, Bn], i) => (
        <Sprite key={i} start={s} end={e}>{Bn(ctx)}</Sprite>
      ))}
      {STOPS.map(([b, i, hold]) => <StopAt key={b} t={BEAT(b).start + stopAt(b, i)} hold={hold - 0.2} />)}
      <ChimeAt t={BEAT("b8").start + LEAD - 0.35} />
      <AudioSync />
    </StoryFrame>
  );
}
window.Lp17Scenes = Lp17Scenes;
