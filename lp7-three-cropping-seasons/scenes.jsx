/* global React, window */
// ThinkPro Academy — "The Three Cropping Seasons in India" (Grade 6 Agriculture, Session 7, V1).
// After AG_G6_S7_Video_Script___Three_Cropping_Seasons (Subrata, 3 Nov 2026): one field through
// the year, the three seasons, the five things crops need, one country / many calendars, wheat in
// great heat, a Do-you-know card (kharif = autumn, rabi = spring), the Netherlands greenhouses,
// and the answer. Four presenter stops (TPStory.StopAt freezes the web player; the export holds the
// card). The SEASON WHEEL (a circular year: kharif rain blue-green, rabi cool blue, zaid sunny
// orange) is the central visual model, shown in the corner and lit for the active season.
// Beat ids match the script's scene numbers; scene 9 (the leaf break) closes b8, so there is no b9.
// STORY STYLE (engine/story-kit.jsx). Pure function of time.
const { Sprite } = window;
const { reveal, windowOp } = window.TPMotion;
const { num, str } = window.TPStage;
const { SK, SERIF, SANS, LEFT_W, pop, out3, lerp, drive,
  Pic, Chip, Badge, Big, Card, SVG, Arrow, Ring, T, ChimeAt, Scene, StoryFrame, StopAt, Break } = window.TPStory;

// ---- Timing: EVERYTHING is keyed to the narration (tools/fit_timing.py → timing.js).
const TM = window.TP_TIMING;
if (!TM) console.error("timing.js missing — run: python3 tools/fit_timing.py videos/lp7-three-cropping-seasons");
const LEAD = TM ? TM.lead : 1.0;
const DUR = TM ? TM.total : 230;
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
const IDS = ["b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8", "b10", "b11", "b12"];
const CAPS = {};
if (TM) IDS.forEach((b) => { CAPS[b] = capsFor(b); });
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// ---- Panel copy. Title defaults mirror the DC data-props (titleNText, N = scene number) — keep in sync.
const TITLES = { 1: "LP7 – Three Cropping Seasons", 2: "Cropping seasons", 3: "Kharif · Rabi · Zaid", 4: "What crops need", 5: "What crops need",
  6: "Example", 7: "One country, many calendars", 8: "Too hot for wheat", 10: "Do you know?", 11: "Wow! The Netherlands", 12: "The answer" };
const KICK = "Grade 6 · Agriculture · Session 7";
const KICKS = { 4: "Needs 1 and 2 of 5", 5: "Needs 3, 4 and 5 of 5", 10: "Do you know?", 11: "Wow!", 12: "Our big question" };
const panel = (n, ctx, lines, extra = {}) => ({ kicker: KICKS[n] || KICK, title: ctx.titles[n], lines, ...extra });
const L = (text, at, kind = "item", extra = {}) => ({ text, at, kind, ...extra });

// ---- Presenter stops: [beat, sentence whose pauseAfter is the hold, offset after it, hold s, n]
const STOPS = [["b1", 3, 2.4, 3.9, 1], ["b3", 4, 0.2, 4.0, 2], ["b7", 3, 0.2, 4.0, 3], ["b12", 2, 0.3, 7.0, 4]];
const stopFor = (b) => STOPS.find((s) => s[0] === b);
const stopAt = (b) => { const s = stopFor(b); return SE(b, s[1]) + s[2]; };   // beat-local start of the hold
const holdOf = (b) => stopFor(b)[3];

// ---- Seasons: the same colour every time a season appears -------------------------------
// Angles: degrees clockwise from the top of the wheel; the year runs June (top) → May.
const SEA = {
  kharif: { name: "KHARIF", c: "#2FA394", a0: 0, a1: 150, icon: "rain", when: "monsoon" },
  rabi: { name: "RABI", c: "#4C8FE0", a0: 150, a1: 300, icon: "snow", when: "winter" },
  zaid: { name: "ZAID", c: "#F0882A", a0: 300, a1: 360, icon: "sun", when: "summer" },
};
const KEYS = ["kharif", "rabi", "zaid"];
const mid = (k) => (SEA[k].a0 + SEA[k].a1) / 2;
const pt = (cx, cy, r, a) => [cx + r * Math.sin(a * Math.PI / 180), cy - r * Math.cos(a * Math.PI / 180)];
function sector(cx, cy, ri, ro, a0, a1) {
  const [x0, y0] = pt(cx, cy, ro, a0), [x1, y1] = pt(cx, cy, ro, a1), [x2, y2] = pt(cx, cy, ri, a1), [x3, y3] = pt(cx, cy, ri, a0);
  const lg = a1 - a0 > 180 ? 1 : 0;
  return `M${x0} ${y0} A${ro} ${ro} 0 ${lg} 1 ${x1} ${y1} L${x2} ${y2} A${ri} ${ri} 0 ${lg} 0 ${x3} ${y3} Z`;
}
// Small flat weather icons (white), centred on x,y, size s ≈ 1 → 40 px.
function Icon({ kind, x, y, s = 1, color = SK.white }) {
  if (kind === "rain") return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={color} stroke={color}>
      <ellipse cx={-8} cy={-6} rx={14} ry={10} stroke="none" /><ellipse cx={8} cy={-10} rx={14} ry={13} stroke="none" /><rect x={-20} y={-6} width={40} height={10} rx={5} stroke="none" />
      {[-12, 0, 12].map((dx) => <line key={dx} x1={dx} y1={10} x2={dx - 4} y2={22} strokeWidth={3} strokeLinecap="round" />)}
    </g>);
  if (kind === "snow") return (
    <g transform={`translate(${x} ${y}) scale(${s})`} stroke={color} strokeWidth={3.5} strokeLinecap="round">
      {[0, 60, 120].map((a) => <line key={a} x1={0} y1={-18} x2={0} y2={18} transform={`rotate(${a})`} />)}
      {[0, 60, 120, 180, 240, 300].map((a) => <path key={a} d="M-6 -13 L0 -8 L6 -13" fill="none" transform={`rotate(${a})`} />)}
    </g>);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} stroke={color} strokeWidth={3.5} strokeLinecap="round">
      <circle r={10} fill={color} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => <line key={a} x1={0} y1={-15} x2={0} y2={-21} transform={`rotate(${a})`} />)}
    </g>);
}
// The SEASON WHEEL. lit: {kharif,rabi,zaid} 0..1 brightness (default all on);
// split 0..1 pulls the three parts apart; hand: angle of the year pointer (null = none).
function Wheel({ cx, cy, r = 110, lt, at = 0, op = 1, lit, split = 0, hand = null, labels = true, hub = "YEAR" }) {
  const o = out3(lt, at, 0.7) * op; if (o <= 0) return null;
  const sc = 0.85 + 0.15 * o;
  return (
    <SVG op={o}>
      <g transform={`translate(${cx} ${cy}) scale(${sc}) translate(${-cx} ${-cy})`}>
        <circle cx={cx} cy={cy} r={r * 1.06} fill="rgba(5,30,22,0.55)" />
        {KEYS.map((k) => {
          const s = SEA[k], l = lit ? lit[k] : 1, m = mid(k), [dx, dy] = pt(0, 0, split * r * 0.1, m);
          const [px, py] = pt(cx + dx, cy + dy, r * 0.64, m), ix = px, iy = py - r * 0.1, tx = px, ty = py + r * 0.14;
          return (
            <g key={k}>
              <path d={sector(cx + dx, cy + dy, r * 0.27, r * (1 + 0.06 * l), s.a0 + 1, s.a1 - 1)} fill={s.c} opacity={0.28 + 0.72 * l}
                stroke={l > 0.5 ? SK.white : "rgba(255,255,255,0.3)"} strokeWidth={l > 0.5 ? 3 : 1.5} />
              <Icon kind={s.icon} x={ix} y={iy} s={r / 120 * (0.9 + 0.2 * l)} color={l > 0.3 ? SK.white : "rgba(255,255,255,0.55)"} />
              {labels && <text x={tx} y={ty + r * 0.06} textAnchor="middle" fontFamily={SANS} fontWeight="700" fontSize={r * 0.15} fill={SK.white} opacity={0.5 + 0.5 * l}>{s.name}</text>}
            </g>
          );
        })}
        <circle cx={cx} cy={cy} r={r * 0.24} fill={SK.cream} />
        <text x={cx} y={cy + r * 0.05} textAnchor="middle" fontFamily={SANS} fontWeight="700" fontSize={r * 0.11} fill={SK.ink} letterSpacing="0.08em">{hub}</text>
        {hand != null && (() => { const [hx, hy] = pt(cx, cy, r * 1.12, hand);
          return <g><line x1={cx} y1={cy} x2={hx} y2={hy} stroke={SK.gold} strokeWidth={Math.max(4, r * 0.045)} strokeLinecap="round" />
            <circle cx={hx} cy={hy} r={Math.max(7, r * 0.07)} fill={SK.gold} stroke={SK.ink} strokeWidth={2} /><circle cx={cx} cy={cy} r={r * 0.07} fill={SK.gold} /></g>; })()}
      </g>
    </SVG>
  );
}
// Brightness for one active season (others dimmed), cross-faded between cue times.
// steps: [[t, key|null], …] in time order; null = all on.
function litAt(lt, steps, d = 0.5) {
  const v = (k, key) => key == null ? 1 : (k === key ? 1 : 0.15);
  const res = { kharif: 1, rabi: 1, zaid: 1 };
  steps.forEach(([t, key]) => { const p = reveal(lt, t, d); if (p > 0) KEYS.forEach((k) => { res[k] = lerp(res[k], v(k, key), p); }); });
  return res;
}
// Year-pointer angle eased between cue times. steps: [[t, angle], …].
function handAt(lt, steps, d = 0.9) {
  let a = steps[0][1];
  steps.forEach(([t, ang], i) => { if (i > 0) { const p = drive(lt, t, t + d); a = lerp(a, ang, p); } });
  return a;
}
// Season label pill in the season's colour.
function SChip({ k, text, x, y, lt, at, out = null, size = 26 }) {
  const o = pop(lt, at) * (out != null ? 1 - reveal(lt, out, 0.4) : 1); if (o <= 0) return null;
  return <div style={{ position: "absolute", left: x, top: y, transform: `translateX(-50%) scale(${0.9 + 0.1 * o})`, transformOrigin: "center top", opacity: o, fontFamily: SANS, fontWeight: 700,
    fontSize: size, color: SK.white, background: SEA[k].c, padding: "6px 18px", borderRadius: 999, whiteSpace: "nowrap", boxShadow: "0 2px 10px rgba(0,0,0,0.3)", border: "2px solid rgba(255,255,255,0.7)" }}>{text}</div>;
}
// Falling rain / snow over a box (pure function of time).
function Fall({ x, y, w, h, lt, op = 1, kind = "rain", n = 46 }) {
  if (op <= 0) return null;
  return (
    <SVG op={op}>
      <defs><clipPath id={`clip-${kind}-${x}-${y}`}><rect x={x} y={y} width={w} height={h} rx={18} /></clipPath></defs>
      <g clipPath={`url(#clip-${kind}-${x}-${y})`}>
        {Array.from({ length: n }, (_, i) => {
          const sp = kind === "rain" ? 0.9 + (i % 5) * 0.12 : 0.12 + (i % 4) * 0.03, ph = (i * 0.618) % 1;
          const p = (lt * sp + ph) % 1, px = x + ((i * 137.5) % w) + (kind === "snow" ? 14 * Math.sin(lt * 1.3 + i) : -p * 30), py = y - 30 + p * (h + 60);
          return kind === "rain"
            ? <line key={i} x1={px} y1={py} x2={px - 7} y2={py + 26} stroke="rgba(220,240,255,0.75)" strokeWidth={2.5} strokeLinecap="round" />
            : <circle key={i} cx={px} cy={py} r={3 + (i % 3)} fill="rgba(255,255,255,0.9)" />;
        })}
      </g>
    </SVG>
  );
}
// Drawn thermometer; level 0..1 (cool → hot), colour follows the level.
function Thermo({ x, y, h = 300, level, op = 1, label }) {
  if (op <= 0) return null;
  const col = level > 0.6 ? "#E5532E" : level > 0.35 ? "#F0882A" : "#4C8FE0", top = y + 10 + (1 - level) * (h - 30);
  return (
    <SVG op={op}>
      <rect x={x - 18} y={y} width={36} height={h} rx={18} fill="rgba(255,255,255,0.16)" stroke={SK.cream} strokeWidth={3} />
      <rect x={x - 9} y={top} width={18} height={y + h - top + 6} rx={9} fill={col} />
      <circle cx={x} cy={y + h + 22} r={30} fill={col} stroke={SK.cream} strokeWidth={3} />
      {[0, 1, 2, 3, 4].map((i) => <line key={i} x1={x + 20} y1={y + 30 + i * (h - 60) / 4} x2={x + 34} y2={y + 30 + i * (h - 60) / 4} stroke={SK.cream} strokeWidth={3} />)}
      {label && <T x={x} y={y - 16} size={30} bold serif color={col}>{label}</T>}
    </SVG>
  );
}
// Flat plant glyph (stem + leaves + head); grow 0..1 stretches it.
function Plant({ x, y, s = 1, grow = 1, droop = 0, color = "#6FBF6E", head = "#E3B55C" }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s} ${s * (0.45 + 0.55 * grow)})`}>
      <path d={`M0 0 Q ${droop * 30} -80 ${droop * 60} -150`} stroke={color} strokeWidth={9} strokeLinecap="round" fill="none" />
      <ellipse cx={-30} cy={-70 + droop * 30} rx={32} ry={12} fill={color} transform={`rotate(${-30 + droop * 50} -30 ${-70 + droop * 30})`} />
      <ellipse cx={30 + droop * 20} cy={-100 + droop * 30} rx={32} ry={12} fill={color} transform={`rotate(${30 + droop * 40} ${30 + droop * 20} ${-100 + droop * 30})`} />
      {head && <ellipse cx={droop * 60} cy={-162} rx={14} ry={28} fill={head} stroke="#9E7320" strokeWidth={2} transform={`rotate(${droop * 40} ${droop * 60} -162)`} />}
    </g>
  );
}
// Crop tile: square photo + label chip.
function Tile({ slot, label, x, y, s = 160, lt, at, out = null, k, size = 22 }) {
  return (
    <React.Fragment>
      <Pic slot={slot} label={label} x={x} y={y} w={s} h={s} r={16} lt={lt} at={at} out={out} fx="pop" />
      {k ? <SChip k={k} text={label} x={x + s / 2} y={y + s - 18} lt={lt} at={at + 0.15} out={out} size={size} />
        : <Chip text={label} x={x + s / 2} y={y + s - 18} lt={lt} at={at + 0.15} out={out} size={size} />}
    </React.Fragment>
  );
}
// "Pause and discuss" presenter card, placed on the photo area (the photos stay visible around it).
function Discuss({ lt, at, hold, n, x = 40, y = 60, w = LEFT_W - 80, h = 400, head = "PAUSE AND DISCUSS", headSize = 28, q, items, size = 46, bg = 0.9, children }) {
  const o = windowOp(lt, at - 0.1, at + hold + 0.4, 0.35); if (o <= 0) return null;
  const p = clamp((lt - at) / hold, 0, 1), C = 2 * Math.PI * 46;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 26, background: `rgba(5,30,22,${bg})`, opacity: o, boxSizing: "border-box",
      boxShadow: "0 0 0 3px rgba(226,176,76,0.9)", padding: "36px 52px", transform: `scale(${0.96 + 0.04 * o})` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <svg width="64" height="64" viewBox="0 0 90 90"><circle cx="45" cy="45" r="43" fill={SK.gold} /><rect x="28" y="24" width="12" height="42" rx="4" fill={SK.ink} /><rect x="50" y="24" width="12" height="42" rx="4" fill={SK.ink} /></svg>
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: headSize, letterSpacing: "0.08em", color: SK.ink, background: SK.gold, padding: "8px 26px", borderRadius: 14, whiteSpace: "nowrap" }}>{head}</div>
      </div>
      {q && <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: size, lineHeight: 1.2, color: SK.white, marginTop: 26 }}>{q}</div>}
      {items && items.map((it, i) => <div key={i} style={{ display: "flex", gap: 20, marginTop: i ? 14 : 26, fontFamily: SERIF, fontWeight: 700, fontSize: 36, lineHeight: 1.2, color: SK.white }}>
        <span style={{ color: SK.gold, width: 34, flex: "none" }}>{i + 1}</span><span>{it}</span></div>)}
      {children}
      <div style={{ position: "absolute", left: 52, bottom: 26, fontFamily: SANS, fontSize: 24, color: SK.dim }}>Stop {n} of 4</div>
    </div>
  );
}

// ============================================================================
// 1 · One field through the year → the big question → Think! → Stop 1
const FIELDS = [["field_kharif", "kharif", "Rains: RICE"], ["field_rabi", "rabi", "Winter: WHEAT"], ["field_zaid", "zaid", "Summer: WATERMELONS"]];
function B1(ctx) {
  return ({ localTime: lt, duration }) => {
    const cWatch = S("b1", 0), cRice = W("b1", "rice"), cWheat = W("b1", "wheat"), cMelon = W("b1", "watermelons"), cSame = S("b1", 2), cQ = S("b1", 3), cDiff = W("b1", "different");
    const thinkA = SE("b1", 3) + 0.1, thinkB = thinkA + 2.1, st = stopAt("b1");
    const ats = [cRice, cWheat, cMelon], row = reveal(lt, cSame, 0.9), big = 1 - row;
    const lit = litAt(lt, [[0, null], [cRice, "kharif"], [cWheat, "rabi"], [cMelon, "zaid"], [cSame, null]]);
    const hand = handAt(lt, [[0, -30], [cRice - 0.6, mid("kharif")], [cWheat - 0.6, mid("rabi")], [cMelon - 0.6, mid("zaid")], [cSame, 360 + mid("kharif")]]);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS.b1} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(1, ctx, [L("One field, through the year", cWatch, "sub"), L("Rains: rice · winter: wheat · summer: watermelons", cRice), L("Same field, same farmer", cSame),
          L("BIG QUESTION", cQ, "head"), L("Why does a farmer grow different crops in summer and in winter?", cQ + 0.3, "big"), L("Stop 1: make a guess!", st, "think")], { max: 7 })}>
        {/* the time-lapse: one big frame, the seasons cross-fade in it */}
        <div style={{ position: "absolute", inset: 0, opacity: big }}>
          <Pic slot="field_kharif" label="The field in the monsoon: green paddy" x={40} y={60} w={1100} h={720} lt={lt} at={0} out={cWheat} fx="zoom" />
          <Pic slot="field_rabi" label="The same field in winter: golden wheat" x={40} y={60} w={1100} h={720} lt={lt} at={cWheat} out={cMelon} fx="zoom" />
          <Pic slot="field_zaid" label="The same field in summer: watermelons" x={40} y={60} w={1100} h={720} lt={lt} at={cMelon} fx="zoom" />
          <Fall x={40} y={60} w={1100} h={720} lt={lt} op={windowOp(lt, 0.2, cWheat, 0.5)} kind="rain" />
          <SVG op={windowOp(lt, cMelon, cSame + 1, 0.6)}><circle cx={1030} cy={150} r={90 + 8 * Math.sin(lt * 3)} fill="#FFD36B" opacity={0.45} /><circle cx={1030} cy={150} r={55} fill="#FFE08A" opacity={0.9} /></SVG>
          {FIELDS.map(([, k, lab], i) => <SChip key={k} k={k} text={lab} x={590} y={700} lt={lt} at={ats[i]} out={i < 2 ? ats[i + 1] : cSame} size={34} />)}
          <Chip text="Watch this field…" x={590} y={80} lt={lt} at={cWatch} out={cRice} tone="gold" size={32} />
        </div>
        <Wheel cx={1280} cy={200} r={110} lt={lt} at={0.3} op={big} lit={lit} hand={hand} />
        {/* same field, same farmer: the three versions side by side */}
        {FIELDS.map(([slot, k, lab], i) => <React.Fragment key={slot}>
          <Pic slot={slot} label={lab} x={40 + i * 460} y={70} w={440} h={300} lt={lt} at={cSame + 0.1 + i * 0.15} fx="pop" style={{ boxShadow: `0 0 0 5px ${SEA[k].c}` }} />
          <SChip k={k} text={lab} x={260 + i * 460} y={340} lt={lt} at={cSame + 0.3 + i * 0.15} size={26} />
        </React.Fragment>)}
        <Chip text="Same field · same farmer" x={720} y={420} lt={lt} at={cSame + 0.4} out={cQ} tone="gold" size={32} />
        <Big x={60} y={430} w={1000} lt={lt} at={cQ} out={st - 0.2} size={50}>Why does a farmer grow <span style={{ color: SK.gold }}>DIFFERENT</span> crops in summer and winter?</Big>
        <SVG op={1}><Ring cx={1230} cy={620} r={70} from={thinkA} to={thinkB} lt={lt} n={2} /></SVG>
        <Chip text="Think!" x={1230} y={720} lt={lt} at={thinkA - 0.1} out={thinkB + 0.1} tone="gold" size={36} />
        <Chip text="?" x={1230} y={430} lt={lt} at={cDiff} out={thinkB} tone="gold" size={60} />
        <Discuss lt={lt} at={st} hold={holdOf("b1")} n={1} y={430} h={500} q="Why change the crop? Make a guess." size={56} />
      </Scene>
    );
  };
}
// 2 · Why seasons matter: what + when; water, land and resources used wisely
function B2(ctx) {
  const res = [["icon_water", "Water", "water"], ["icon_land", "Land", "land"], ["icon_tools", "Other resources", "resources"]];
  return ({ localTime: lt, duration }) => {
    const cWhat = W("b2", "what"), cWhen = W("b2", "when"), cUnder = S("b2", 1), ats = res.map((r) => W("b2", r[2])), cWise = W("b2", "wisely");
    const hand = (lt * 30) % 360;
    return (
      <Scene lt={lt} dur={duration} captions={CAPS.b2} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(2, ctx, [L("CROPPING SEASONS help farmers decide…", S("b2", 0), "head"), L("WHAT to grow", cWhat), L("WHEN to grow it", cWhen),
          L("Use water, land and other resources WISELY", cUnder, "big")])}>
        <Pic slot="farmer_notebook" label="A farmer plans the year in a notebook" x={40} y={60} w={680} h={540} lt={lt} at={0} fx="zoom" />
        <Wheel cx={1060} cy={250} r={175} lt={lt} at={0.4} hand={hand} />
        {/* notebook: ticks */}
        <div style={{ position: "absolute", left: 760, top: 470, width: 640, height: 150, borderRadius: 16, background: SK.cream, opacity: out3(lt, cWhat - 0.3, 0.5), boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
          backgroundImage: "repeating-linear-gradient(0deg, rgba(22,58,44,0) 0 44px, rgba(76,143,224,0.35) 44px 46px)", padding: "18px 30px", boxSizing: "border-box" }}>
          {[["WHAT to grow", cWhat], ["WHEN to grow it", cWhen]].map(([t, at]) => <div key={t} style={{ display: "flex", alignItems: "center", gap: 18, height: 56, fontFamily: SERIF, fontWeight: 700, fontSize: 38, color: SK.ink }}>
            <span style={{ width: 40, height: 40, borderRadius: 8, border: `3px solid ${SK.ink}`, display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#1E8A4A", fontSize: 40 }}>{lt >= at + 0.3 ? "✓" : ""}</span>
            <span style={{ opacity: out3(lt, at, 0.4) }}>{t}</span></div>)}
        </div>
        {/* resources slide into neat boxes */}
        {res.map(([slot, lab], i) => { const x = 40 + i * 460, a = out3(lt, ats[i], 0.7);
          return <React.Fragment key={slot}>
            <div style={{ position: "absolute", left: x, top: 650, width: 440, height: 250, borderRadius: 18, border: `3px dashed rgba(255,255,255,${0.25 + 0.4 * a})`, background: `rgba(255,255,255,${0.04 + 0.06 * a})`, opacity: out3(lt, cUnder, 0.5) }} />
            <div style={{ position: "absolute", left: 0, top: (1 - a) * -260, width: "100%", height: "100%", opacity: a }}>
              <Pic slot={slot} label={lab} x={x + 20} y={665} w={220} h={220} r={16} lt={lt} at={ats[i]} fx="none" border={false} />
            </div>
            <div style={{ position: "absolute", left: x + 250, top: 735, width: 180, fontFamily: SERIF, fontWeight: 700, fontSize: 34, lineHeight: 1.15, color: SK.white, opacity: a }}>{lab}</div>
          </React.Fragment>; })}
        <Chip text="…used more WISELY" x={1180} y={600} lt={lt} at={cWise} tone="gold" size={30} />
      </Scene>
    );
  };
}
// 3 · The wheel splits: kharif, rabi, zaid → Stop 2 (sort the crops)
const SCROPS = { kharif: [["crop_rice", "Rice", "rice"], ["crop_maize", "Maize", "maize"], ["crop_cotton", "Cotton", "cotton"]],
  rabi: [["crop_wheat", "Wheat", "wheat"], ["crop_mustard", "Mustard", "mustard"], ["crop_gram", "Gram", "gram"]],
  zaid: [["crop_watermelon", "Watermelon", "watermelon"], ["crop_muskmelon", "Muskmelon", "watermelon"], ["crop_cucumber", "Cucumber", "cucumber"]] };
const SNOTE = { kharif: "sown with the monsoon rains", rabi: "sown as winter begins", zaid: "a short summer season" };
function B3(ctx) {
  return ({ localTime: lt, duration }) => {
    const cThree = W("b3", "three"), cK = W("b3", "kharif"), cR = W("b3", "rabi"), cZ = W("b3", "zaid"), cAll = S("b3", 4), st = stopAt("b3");
    const segAt = { kharif: cK, rabi: cR, zaid: cZ };
    const lit = litAt(lt, [[0, null], [cK, "kharif"], [cR, "rabi"], [cZ, "zaid"], [cAll, null]]);
    const split = drive(lt, cThree, cThree + 1.0), cardsOut = st - 0.4;
    const needs = [["Rain", "rain", 130, 120, 1], ["Temperature", "temperature", 660, 120], ["Sunlight", "sunlight", 130, 820], ["Water", "water", 660, 820, 1]];
    const loose = [["crop_rice", "Rice"], ["crop_wheat", "Wheat"], ["crop_watermelon", "Watermelon"], ["crop_mustard", "Mustard"], ["crop_maize", "Maize"], ["crop_cucumber", "Cucumber"]];
    return (
      <Scene lt={lt} dur={duration} captions={CAPS.b3} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(3, ctx, [L("THREE main cropping seasons", cThree, "head"),
          L("KHARIF – sown with the monsoon rains, harvested in autumn: rice, maize, cotton", cK),
          L("RABI – sown at the start of winter, harvested in spring: wheat, mustard, gram", cR),
          L("ZAID – a short summer season in between: watermelon, muskmelon, cucumber", cZ),
          L("Rain, temperature, sunlight and water decide each season", cAll, "big"), L("Stop 2: put each crop in its season", st, "think")], { max: 6 })}>
        <Wheel cx={420} cy={470} r={300} lt={lt} at={0.2} lit={lit} split={split} />
        <SVG op={1}>{KEYS.map((k) => { const [x, y] = pt(420, 470, 300 * 1.2, mid(k)); return <g key={k} opacity={windowOp(lt, segAt[k], cAll, 0.4)}><circle cx={x} cy={y} r={14} fill={SEA[k].c} stroke={SK.white} strokeWidth={3} /></g>; })}</SVG>
        {needs.map(([t, w, x, y, n]) => <Chip key={t} text={t} x={x} y={y - 20} lt={lt} at={W("b3", w, n || 0)} out={st} tone="gold" size={28} />)}
        {/* one card per season, built as it is named */}
        {KEYS.map((k, i) => { const top = 70 + i * 280, at = segAt[k], o = out3(lt, at, 0.6) * (1 - reveal(lt, cardsOut, 0.4));
          return o > 0 && <div key={k} style={{ position: "absolute", left: 0, top: 0, opacity: o }}>
            <div style={{ position: "absolute", left: 820, top, width: 580, height: 260, borderRadius: 20, background: "rgba(5,30,22,0.6)", boxShadow: `0 0 0 4px ${SEA[k].c}`, transform: `translateX(${(1 - o) * 40}px)` }} />
            <div style={{ position: "absolute", left: 844, top: top + 12, fontFamily: SERIF, fontWeight: 700, fontSize: 36, color: SEA[k].c, textShadow: "0 1px 0 rgba(0,0,0,0.4)", whiteSpace: "nowrap" }}>{SEA[k].name}
              <span style={{ fontFamily: SANS, fontWeight: 400, fontSize: 24, color: SK.white, marginLeft: 14 }}>{SNOTE[k]}</span></div>
            {SCROPS[k].map(([slot, lab, w], j) => <Tile key={slot} slot={slot} label={lab} x={850 + j * 180} y={top + 66} s={160} lt={lt} at={W("b3", w) + (lab === "Muskmelon" ? 0.4 : 0)} k={k} size={20} />)}
          </div>; })}
        {/* Stop 2: crop cards float loose beside the wheel */}
        <Discuss lt={lt} at={st} hold={holdOf("b3")} n={2} x={800} y={60} w={600} h={330} head="HAVE YOU UNDERSTOOD?" headSize={22} q="Put each crop in its season." size={42} />
        {loose.map(([slot, lab], i) => { const o = windowOp(lt, st - 0.1, st + holdOf("b3") + 0.4, 0.35), bob = 8 * Math.sin(lt * 2 + i * 1.3);
          return o > 0 && <div key={slot} style={{ position: "absolute", left: 0, top: bob, width: 0, height: 0, opacity: o }}>
            <Tile slot={slot} label={lab} x={820 + (i % 3) * 195} y={420 + Math.floor(i / 3) * 240} s={170} lt={lt} at={st + i * 0.08} size={22} />
          </div>; })}
      </Scene>
    );
  };
}
// 4 · Needs 1 and 2: temperature (thermometer, warm- and cool-lovers) and water (bucket vs cup)
function B4(ctx) {
  return ({ localTime: lt, duration }) => {
    const cWhy = S("b4", 0), cBecause = S("b4", 1), cFirst = W("b4", "first"), cWarm = W("b4", "warm"), cCool = W("b4", "cool"), cSecond = W("b4", "second"),
      cRice = W("b4", "rice"), cMore = W("b4", "more"), cMil = W("b4", "millets");
    const swing = lt < cWarm ? 0.5 : lt < cCool ? lerp(0.5, 0.85, drive(lt, cWarm, cWarm + 0.8)) : lerp(0.85, 0.2, drive(lt, cCool, cCool + 0.8)) + (lt > cCool + 1 ? 0.33 * (0.5 - 0.5 * Math.cos((lt - cCool - 1) * 1.4)) : 0);
    const warmG = clamp((swing - 0.3) / 0.5, 0, 1), coolG = clamp((0.8 - swing) / 0.5, 0, 1);
    const pour = windowOp(lt, cRice, duration, 0.4), sip = windowOp(lt, cMil, duration, 0.4);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS.b4} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(4, ctx, [L("Different crops need different conditions", cBecause, "big"), L("1 TEMPERATURE", cFirst, "head"), L("some like it warm, some like it cool", cWarm),
          L("2 WATER NEEDS", cSecond, "head"), L("rice needs far more water than millets or gram", cRice)])}>
        <Big x={60} y={80} w={1300} lt={lt} at={cWhy} out={cFirst} size={58}>Why do farmers change their crops?</Big>
        <Big x={60} y={230} w={1300} lt={lt} at={cBecause} out={cFirst} size={46} color={SK.gold}>Because different crops need different conditions.</Big>
        {/* 1 TEMPERATURE */}
        <Card x={40} y={60} w={660} h={840} lt={lt} at={cFirst} />
        <div style={{ opacity: out3(lt, cFirst, 0.6) }}>
          <Badge text="1  TEMPERATURE" x={70} y={86} lt={lt} at={cFirst} size={32} />
          <Thermo x={150} y={260} h={420} level={swing} op={1} />
          <SVG op={1}>
            <rect x={240} y={700} width={430} height={30} rx={8} fill={SK.soil} />
            {[290, 360].map((x, i) => <Plant key={x} x={x} y={700} s={0.95} grow={warmG} droop={0.25 * (1 - warmG)} color="#E5A04A" head={null} />)}
            {[540, 610].map((x, i) => <Plant key={x} x={x} y={700} s={0.95} grow={coolG} droop={0.25 * (1 - coolG)} color="#6FA9E8" head={null} />)}
            <T x={325} y={780} size={28} bold color="#F0A860" op={out3(lt, cWarm, 0.5)}>love WARM</T>
            <T x={575} y={780} size={28} bold color="#8CC0F5" op={out3(lt, cCool, 0.5)}>prefer COOL</T>
          </SVG>
          <Chip text="warm" x={150} y={190} lt={lt} at={cWarm} out={cCool} tone="gold" size={24} />
          <Chip text="cool" x={150} y={190} lt={lt} at={cCool} size={24} />
        </div>
        {/* 2 WATER */}
        <Badge text="2  WATER" x={740} y={30} lt={lt} at={cSecond} size={32} />
        <Pic slot="paddy_flooded" label="A flooded rice field" x={740} y={100} w={660} h={420} lt={lt} at={cSecond} fx="zoom" />
        <SVG op={out3(lt, cRice - 0.2, 0.5)}>
          {/* big bucket tipping, a thick stream */}
          <g transform={`translate(1210 160) rotate(${-35 * pour})`}><path d="M-70 -60 L70 -60 L55 60 L-55 60 Z" fill="#7FB0D9" stroke={SK.cream} strokeWidth={5} /><path d="M-70 -60 Q 0 -110 70 -60" stroke={SK.cream} strokeWidth={5} fill="none" /></g>
          <path d={`M1150 140 Q 1120 ${220 + 20 * Math.sin(lt * 9)} 1110 420`} stroke="rgba(150,205,250,0.85)" strokeWidth={34 * pour} strokeLinecap="round" fill="none" />
        </SVG>
        <Chip text="RICE: lots and lots of water" x={1070} y={470} lt={lt} at={cMore} tone="gold" size={28} />
        <Tile slot="crop_millets" label="Millets" x={740} y={560} s={240} lt={lt} at={cMil} />
        <Tile slot="crop_gram" label="Gram" x={1000} y={560} s={240} lt={lt} at={W("b4", "gram")} />
        <SVG op={out3(lt, cMil, 0.5)}>
          <g transform={`translate(1320 600) rotate(${-40 * sip})`}><path d="M-26 -24 L26 -24 L20 24 L-20 24 Z" fill="#7FB0D9" stroke={SK.cream} strokeWidth={4} /></g>
          <path d="M1300 600 Q 1290 650 1290 700" stroke="rgba(150,205,250,0.85)" strokeWidth={8 * sip} strokeLinecap="round" fill="none" strokeDasharray="10 14" strokeDashoffset={-lt * 60} />
        </SVG>
        <Chip text="a little" x={1310} y={720} lt={lt} at={cMil + 0.3} size={24} />
      </Scene>
    );
  };
}
// 5 · Needs 3, 4, 5: sunlight, growing period, water available
function B5(ctx) {
  return ({ localTime: lt, duration }) => {
    const cSun = W("b5", "third"), cLong = W("b5", "long"), cStrong = W("b5", "strong"), cGrow = W("b5", "fourth"), cQuick = W("b5", "quickly"), cMonths = W("b5", "months"),
      cFifth = W("b5", "fifth"), cRain = W("b5", "rain"), cIrr = W("b5", "irrigation"), cSoil = W("b5", "soil");
    const sp = (lt * 0.25) % 1, [sx, sy] = [80 + sp * 360, 300 - Math.sin(sp * Math.PI) * 120];
    const fast = drive(lt, cQuick, cQuick + 1.2), slow = drive(lt, cMonths - 0.3, cMonths + 4.5);
    const col = (i) => 40 + i * 460;
    return (
      <Scene lt={lt} dur={duration} captions={CAPS.b5} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(5, ctx, [L("3 SUNLIGHT", cSun, "head"), L("how long, and how strong", cLong), L("4 GROWING PERIOD", cGrow, "head"), L("some crops need more time to mature", cQuick),
          L("5 WATER AVAILABLE", cFifth, "head"), L("rain · irrigation · soil moisture", cRain)], { max: 7 })}>
        {/* 3 SUNLIGHT */}
        <Card x={col(0)} y={60} w={440} h={840} lt={lt} at={cSun} />
        <Badge text="3  SUNLIGHT" x={col(0) + 24} y={84} lt={lt} at={cSun} size={30} />
        <SVG op={out3(lt, cSun, 0.6)}>
          <path d={`M${col(0) + 40} 300 Q ${col(0) + 220} 60 ${col(0) + 400} 300`} stroke="rgba(255,255,255,0.3)" strokeWidth={3} strokeDasharray="10 10" fill="none" />
          <line x1={col(0) + 30} y1={302} x2={col(0) + 410} y2={302} stroke={SK.soil} strokeWidth={8} />
          <circle cx={col(0) + sx - 40} cy={sy} r={36 + (lt > cStrong ? 8 * Math.sin(lt * 4) : 0)} fill="#FFD36B" opacity={0.4} />
          <circle cx={col(0) + sx - 40} cy={sy} r={26} fill="#FFD36B" />
        </SVG>
        {[["Long summer day", 0.92, "#F0882A", cLong], ["Short winter day", 0.55, "#4C8FE0", cLong + 0.5]].map(([t, w, c, at], i) => { const g = drive(lt, at, at + 1);
          return <div key={t} style={{ position: "absolute", left: col(0) + 30, top: 360 + i * 120, opacity: out3(lt, at, 0.4) }}>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 26, color: SK.white, marginBottom: 8 }}>{t}</div>
            <div style={{ width: 380, height: 34, borderRadius: 10, background: "rgba(255,255,255,0.12)" }}><div style={{ width: 380 * w * g, height: 34, borderRadius: 10, background: c }} /></div></div>; })}
        <Chip text="how LONG · how STRONG" x={col(0) + 220} y={640} lt={lt} at={cStrong} tone="gold" size={28} />
        <Big x={col(0) + 30} y={720} w={380} lt={lt} at={S("b5", 1) + 1.2} size={32}>…changes how plants grow</Big>
        {/* 4 GROWING PERIOD */}
        <Card x={col(1)} y={60} w={440} h={840} lt={lt} at={cGrow} />
        <Badge text="4  GROWING PERIOD" x={col(1) + 24} y={84} lt={lt} at={cGrow} size={30} />
        {[["crop_cucumber", "Ready quickly", fast, "a few weeks", cQuick], ["crop_cotton", "Many months", slow, "many months", cMonths]].map(([slot, t, g, d, at], i) => (
          <React.Fragment key={slot}>
            <Pic slot={slot} label={t} x={col(1) + 30} y={180 + i * 340} w={150} h={150} r={14} lt={lt} at={at - 0.3} fx="pop" />
            <div style={{ position: "absolute", left: col(1) + 200, top: 190 + i * 340, opacity: out3(lt, at - 0.3, 0.4) }}>
              <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 30, color: SK.white }}>{t}</div>
              <div style={{ display: "flex", gap: 4, marginTop: 14 }}>{Array.from({ length: 6 }, (_, m) => <div key={m} style={{ width: 32, height: 40, borderRadius: 6,
                background: g * 6 > m + (i === 0 ? 4.5 : 0) ? (i === 0 ? "#F0882A" : "#2FA394") : "rgba(255,255,255,0.14)", border: "2px solid rgba(255,255,255,0.35)" }} />)}</div>
              <div style={{ fontFamily: SANS, fontSize: 24, color: SK.gold, marginTop: 10, fontWeight: 700 }}>{d}</div>
            </div>
          </React.Fragment>))}
        <div style={{ position: "absolute", left: col(1) + 30, top: 860, fontFamily: SANS, fontSize: 20, color: SK.dim, opacity: out3(lt, cQuick, 0.4) }}>each box = one month</div>
        {/* 5 WATER AVAILABLE */}
        <Card x={col(2)} y={60} w={440} h={840} lt={lt} at={cFifth} />
        <Badge text="5  WATER AVAILABLE" x={col(2) + 24} y={84} lt={lt} at={cFifth} size={28} />
        {[["water_rain", "Rain", cRain], ["water_channel", "Irrigation", cIrr], ["soil_moist", "Water in the soil", cSoil]].map(([slot, t, at], i) => <React.Fragment key={slot}>
          <Pic slot={slot} label={t} x={col(2) + 24} y={160 + i * 240} w={392} h={220} r={14} lt={lt} at={at} fx="pop" />
          <Chip text={t} x={col(2) + 220} y={160 + i * 240 + 180} lt={lt} at={at + 0.15} tone="gold" size={24} /></React.Fragment>)}
      </Scene>
    );
  };
}
// 6 · Example: wheat in the cool rabi season, watermelon in the hot summer
function B6(ctx) {
  return ({ localTime: lt, duration }) => {
    const cWheat = W("b6", "wheat"), cCool = W("b6", "cool"), cMelon = W("b6", "watermelons"), cSun = W("b6", "sun");
    const sway = 2 * Math.sin(lt * 1.4);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS.b6} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(6, ctx, [L("WHEAT → cool RABI season", cWheat, "big"), L("WATERMELON → hot summer (ZAID)", cMelon, "big")])}>
        <div style={{ position: "absolute", inset: 0, transform: `rotate(${sway * 0.3}deg)`, transformOrigin: "370px 900px" }}>
          <Pic slot="wheat_winter" label="Wheat in the cool winter air" x={40} y={60} w={660} h={640} lt={lt} at={0} fx="zoom" style={{ boxShadow: `0 0 0 5px ${SEA.rabi.c}` }} />
        </div>
        <div style={{ position: "absolute", left: 40, top: 60, width: 660, height: 640, borderRadius: 18, background: "linear-gradient(180deg, rgba(76,143,224,0.35), rgba(76,143,224,0))", opacity: out3(lt, cCool, 0.8) }} />
        <Fall x={40} y={60} w={660} h={640} lt={lt} op={0.35 * out3(lt, cCool, 0.8)} kind="snow" n={30} />
        <Pic slot="melon_pile" label="Watermelons glowing in the summer heat" x={740} y={60} w={660} h={640} lt={lt} at={cMelon - 0.4} fx="zoom" style={{ boxShadow: `0 0 0 5px ${SEA.zaid.c}` }} />
        <div style={{ position: "absolute", left: 740, top: 60, width: 660, height: 640, borderRadius: 18, background: "radial-gradient(70% 50% at 80% 10%, rgba(255,190,80,0.55), rgba(240,136,42,0))", opacity: out3(lt, cSun, 0.8) * (0.85 + 0.15 * Math.sin(lt * 3)) }} />
        <SChip k="rabi" text="WHEAT → cool RABI" x={370} y={620} lt={lt} at={cWheat} size={34} />
        <SChip k="zaid" text="WATERMELON → hot summer" x={1070} y={620} lt={lt} at={cMelon} size={34} />
        <Wheel cx={720} cy={830} r={85} lt={lt} at={0.3} lit={litAt(lt, [[0, "rabi"], [cMelon, "zaid"]])} labels />
      </Scene>
    );
  };
}
// 7 · One country, many growing calendars → Stop 3 (wheat in great heat?)
// Map: official-boundary outline + islands from india-map.js (copied from LP5).
const MAP = window.LP5_MAP;
if (!MAP) console.error("india-map.js missing");
const proj = (lon, lat) => [(lon - MAP.lon0) * MAP.k * MAP.cos, (MAP.lat0 - lat) * MAP.k];
function B7(ctx) {
  const MX = 90, MY = 48, MS = 0.96;
  const m = (lon, lat) => { const [x, y] = proj(lon, lat); return [MX + x * MS, MY + y * MS]; };
  return ({ localTime: lt, duration }) => {
    const cBig = S("b7", 0), cNorth = W("b7", "north"), cSouth = W("b7", "south"), cDiff = W("b7", "different", 1), cRain = W("b7", "rain"), cOne = W("b7", "one"), cMany = W("b7", "many"), st = stopAt("b7");
    // lon/lat: Punjab–Haryana wheat belt; Kaveri delta, Godavari delta, Kuttanad, Mandya rice lands
    const [nx, ny] = m(75.6, 30.4), south = [m(79.1, 10.8), m(81.8, 16.7), m(76.4, 9.5), m(76.9, 12.5)];
    // calendars pop out over open ground and sea around the map, not on the marked regions
    const calendars = [[m(69.4, 33.2), "rabi"], [m(90.0, 31.0), "kharif"], [m(69.0, 18.0), "zaid"], [m(86.0, 14.0), "kharif"], [m(88.5, 18.5), "rabi"]];
    const mapOut = st - 0.3;
    return (
      <Scene lt={lt} dur={duration} captions={CAPS.b7} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(7, ctx, [L("India is BIG: the climate changes from place to place", cBig), L("North: wheat in winter", cNorth), L("Parts of the south: rice in different seasons, depending on rain and irrigation", cSouth),
          L("ONE COUNTRY, MANY GROWING CALENDARS!", cOne, "big"), L("Stop 3: wheat in a very hot summer?", st, "think")])}>
        <div style={{ position: "absolute", inset: 0, opacity: 1 - reveal(lt, mapOut, 0.5) }}>
          <SVG op={out3(lt, 0.2, 0.8)}>
            <g transform={`translate(${MX} ${MY}) scale(${MS})`}>
              <path d={MAP.outline} fill="#2E7A4F" stroke={SK.cream} strokeWidth={4} strokeLinejoin="round" />
              {MAP.islands.map((d, i) => <path key={i} d={d} fill="#2E7A4F" stroke={SK.cream} strokeWidth={2.5} strokeLinejoin="round" />)}
            </g>
            {/* north: a winter wheat field glows */}
            <g opacity={out3(lt, cNorth, 0.6)}>
              <circle cx={nx} cy={ny} r={44 + 4 * Math.sin(lt * 3)} fill={SEA.rabi.c} opacity={0.45} /><circle cx={nx} cy={ny} r={18} fill={SK.gold} stroke={SK.ink} strokeWidth={3} />
              <Icon kind="snow" x={nx + 44} y={ny - 34} s={0.9} />
            </g>
            {/* south: rice fields light up one after another, in different seasons */}
            {south.map(([x, y], i) => { const on = lt > cSouth ? (Math.floor((lt - cSouth) * 1.4) % south.length === i ? 1 : 0.25) : 0;
              const k = KEYS[i % 3];
              return <g key={i} opacity={out3(lt, cSouth + i * 0.2, 0.4)}><circle cx={x} cy={y} r={24} fill={SEA[k].c} opacity={0.3 + 0.6 * on} /><circle cx={x} cy={y} r={10} fill={SK.leaf} stroke={SK.ink} strokeWidth={2} /></g>; })}
            <T x={m(78.6, 22.6)[0]} y={m(78.6, 22.6)[1]} size={30} bold color={SK.cream} op={out3(lt, cBig, 0.6)}>INDIA</T>
          </SVG>
          {calendars.map(([[x, y], k], i) => { const o = pop(lt, cMany + i * 0.15, 0.5); if (o <= 0) return null;
            return <div key={i} style={{ position: "absolute", left: x - 55, top: y - 50, width: 110, height: 96, borderRadius: 12, background: SK.cream, opacity: o, transform: `scale(${o})`, boxShadow: "0 6px 16px rgba(0,0,0,0.35)", overflow: "hidden" }}>
              <div style={{ height: 30, background: SEA[k].c, fontFamily: SANS, fontWeight: 700, fontSize: 17, color: SK.white, textAlign: "center", lineHeight: "30px" }}>{SEA[k].name}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4, padding: 8 }}>{Array.from({ length: 8 }, (_, j) => <div key={j} style={{ height: 22, borderRadius: 3, background: j < 3 + i % 3 ? SEA[k].c : "rgba(22,58,44,0.18)" }} />)}</div>
            </div>; })}
          <Pic slot="green_rev" label="North: wheat fields in winter" x={860} y={60} w={540} h={330} lt={lt} at={cNorth} fx="zoom" style={{ boxShadow: `0 0 0 5px ${SEA.rabi.c}` }} />
          <Chip text="NORTH: wheat in winter" x={1130} y={340} lt={lt} at={cNorth + 0.2} size={26} />
          <Pic slot="south_rice" label="South: rice in different seasons" x={860} y={430} w={540} h={330} lt={lt} at={cSouth} fx="pan" style={{ boxShadow: `0 0 0 5px ${SEA.kharif.c}` }} />
          <Chip text="SOUTH: rice in different seasons" x={1130} y={710} lt={lt} at={cDiff} size={26} />
          <Chip text="depends on rain and irrigation" x={1130} y={790} lt={lt} at={cRain} tone="gold" size={26} />
          <Big x={60} y={850} w={800} lt={lt} at={cOne} size={44} color={SK.gold}>ONE country, MANY calendars!</Big>
        </div>
        {/* Stop 3: a wheat plant under a blazing summer sun */}
        <Pic slot="wheat_heat" label="A wheat plant under a blazing summer sun" x={40} y={60} w={1360} h={540} lt={lt} at={mapOut} fx="zoom" />
        <Thermo x={1300} y={120} h={330} level={lerp(0.5, 0.97, drive(lt, mapOut, mapOut + 1.5))} op={out3(lt, mapOut, 0.5)} label="45 °C" />
        <Discuss lt={lt} at={st} hold={holdOf("b7")} n={3} y={620} h={330} q="What might happen if a farmer grows wheat in a very hot summer?" size={44} />
      </Scene>
    );
  };
}
// 8 · Too hot for wheat: stressed, ripens too fast, small grains, smaller sack → leaf break
function Sack({ x, y, s = 1, op = 1, label }) {
  if (op <= 0) return null;
  return (
    <SVG op={op}>
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <path d="M-80 -110 Q -60 -130 -40 -112 L 40 -112 Q 60 -130 80 -110 L 100 80 Q 0 120 -100 80 Z" fill="#C9A66B" stroke="#7E5E2E" strokeWidth={5} />
        <path d="M-46 -112 Q 0 -96 46 -112" stroke="#7E5E2E" strokeWidth={6} fill="none" />
        <ellipse cx={0} cy={-118} rx={36} ry={10} fill="#E3B55C" />
      </g>
      {label && <T x={x} y={y + 150 * s} size={26} bold color={SK.white}>{label}</T>}
    </SVG>
  );
}
function B8(ctx) {
  return ({ localTime: lt, duration }) => {
    const cCool = W("b8", "cool"), cHot = W("b8", "hot"), cStress = W("b8", "stressed"), cRipen = W("b8", "ripen"), cSmall = W("b8", "small"), cHarvest = W("b8", "harvest"), breakAt = SE("b8", 2) + 0.2;
    return (
      <Scene lt={lt} dur={duration} captions={CAPS.b8} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(8, ctx, [L("Wheat likes it COOL", cCool, "big"), L("TOO HOT FOR WHEAT:", cHot, "head"), L("plants get stressed", cStress), L("ripen too quickly", cRipen),
          L("grains stay small", cSmall), L("less harvest", cHarvest)], { max: 7 })}>
        <Pic slot="wheat_heat" label="Wheat under the hot sun: curled leaves" x={40} y={60} w={760} h={600} lt={lt} at={0} fx="zoom" />
        <SChip k="rabi" text="Wheat likes it COOL" x={420} y={80} lt={lt} at={cCool} out={cHot} size={32} />
        <Thermo x={720} y={140} h={300} level={lt < cHot ? 0.3 : lerp(0.3, 0.97, drive(lt, cHot, cHot + 1.2))} op={out3(lt, 0.3, 0.5)} label={lt < cHot ? "cool" : "very hot"} />
        <div style={{ position: "absolute", left: 40, top: 60, width: 760, height: 600, borderRadius: 18, background: "radial-gradient(80% 60% at 70% 0%, rgba(255,120,40,0.45), rgba(255,120,40,0))", opacity: out3(lt, cHot, 0.8) * (0.8 + 0.2 * Math.sin(lt * 4)), pointerEvents: "none" }} />
        <Chip text="the plants get STRESSED" x={420} y={600} lt={lt} at={cStress} out={cRipen} tone="gold" size={30} />
        <Chip text="…and ripen too QUICKLY" x={420} y={600} lt={lt} at={cRipen} tone="gold" size={30} />
        <Pic slot="grains_compare" label="Plump winter grains beside small, shrivelled grains" x={840} y={60} w={560} h={380} lt={lt} at={cSmall - 0.2} fx="pop" />
        <SChip k="rabi" text="cool: plump grains" x={985} y={400} lt={lt} at={cSmall + 0.2} size={22} />
        <Chip text="too hot: small grains" x={1255} y={400} lt={lt} at={cSmall + 0.5} size={22} />
        <Sack x={960} y={640} s={1} op={out3(lt, cHarvest - 0.3, 0.5)} label="cool winter" />
        <Sack x={1240} y={680} s={0.6} op={out3(lt, cHarvest, 0.5)} label="too hot" />
        <Chip text="a SMALLER harvest" x={1110} y={840} lt={lt} at={cHarvest + 0.3} tone="gold" size={28} />
        <Break lt={lt} at={breakAt} dur={2.3} />
      </Scene>
    );
  };
}
// 10 · Do you know? kharif = autumn, rabi = spring (Arabic and Persian), named after the harvest
function B10(ctx) {
  return ({ localTime: lt, duration }) => {
    const cK = W("b10", "kharif"), cAut = W("b10", "autumn"), cR = W("b10", "rabi"), cSpr = W("b10", "spring"), cArab = W("b10", "arabic"), cHarv = W("b10", "harvested");
    const leaves = Array.from({ length: 14 }, (_, i) => i), blooms = Array.from({ length: 14 }, (_, i) => i);
    const lf = out3(lt, cAut, 0.6), bl = out3(lt, cSpr, 0.6);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS.b10} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(10, ctx, [L("KHARIF means AUTUMN", cK, "big"), L("RABI means SPRING", cR, "big"), L("The words came to India from Arabic and Persian", cArab),
          L("Each season is named after its HARVEST time", cHarv, "head"), L("Source: Wikipedia – Kharif crop; Rabi crop", cHarv + 1.0, "source")])}>
        <Card x={50} y={50} w={1340} h={880} lt={lt} at={0} pad={0} />
        <Badge x={92} y={82} lt={lt} at={S("b10", 0)} />
        {[["kharif", 90, "خريف", "KHARIF", "= AUTUMN", cK, cAut], ["rabi", 740, "ربيع", "RABI", "= SPRING", cR, cSpr]].map(([k, x, ar, en, mean, at, mAt]) => (
          <div key={k} style={{ position: "absolute", left: x, top: 180, width: 610, height: 520, borderRadius: 22, background: "rgba(255,255,255,0.05)", boxShadow: `0 0 0 3px ${SEA[k].c}`, opacity: out3(lt, at - 0.2, 0.6), overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 30, width: "100%", textAlign: "center", fontFamily: "'Geeza Pro', 'Noto Naskh Arabic', 'Times New Roman', serif", fontSize: 130, color: SK.gold, direction: "rtl",
              opacity: out3(lt, at, 0.8), transform: `translateY(${(1 - out3(lt, at, 0.8)) * 20}px)` }}>{ar}</div>
            <div style={{ position: "absolute", top: 250, width: "100%", textAlign: "center", fontFamily: SERIF, fontWeight: 700, fontSize: 72, color: SEA[k].c, letterSpacing: "0.06em", textShadow: "0 2px 0 rgba(0,0,0,0.3)" }}>{en}</div>
            <div style={{ position: "absolute", top: 350, width: "100%", textAlign: "center", fontFamily: SERIF, fontWeight: 700, fontSize: 58, color: SK.white, opacity: out3(lt, mAt, 0.5) }}>{mean}</div>
          </div>))}
        <SVG op={1}>
          {/* KHARIF turns into autumn leaves, RABI into spring blossoms */}
          {leaves.map((i) => { const p = ((lt - cAut) * 0.18 + i * 0.071) % 1, x = 120 + (i * 263) % 560 + 25 * Math.sin(lt * 1.5 + i), y = 190 + p * 500;
            return <g key={"l" + i} opacity={lf * Math.min(1, (1 - p) * 4)} transform={`translate(${x} ${y}) rotate(${lt * 60 + i * 40})`}>
              <path d="M0 -16 C 12 -8, 12 8, 0 16 C -12 8, -12 -8, 0 -16 Z" fill={["#D9822B", "#B5541E", "#E3B04C"][i % 3]} /></g>; })}
          {blooms.map((i) => { const p = ((lt - cSpr) * 0.16 + i * 0.071) % 1, x = 770 + (i * 197) % 560 + 20 * Math.sin(lt * 1.2 + i), y = 690 - p * 480;
            return <g key={"b" + i} opacity={bl * Math.min(1, (1 - p) * 4, p * 6)} transform={`translate(${x} ${y})`}>
              {[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx={0} cy={-8} rx={6} ry={9} fill="#F6B6C8" transform={`rotate(${a})`} />)}<circle r={4} fill="#F6D36B" /></g>; })}
        </SVG>
        <Chip text="from Arabic and Persian" x={720} y={730} lt={lt} at={cArab} tone="gold" size={30} />
        <SChip k="kharif" text="harvested in AUTUMN" x={395} y={800} lt={lt} at={cHarv} size={30} />
        <SChip k="rabi" text="harvested in SPRING" x={1045} y={800} lt={lt} at={cHarv + 0.3} size={30} />
      </Scene>
    );
  };
}
// 11 · WOW! The Netherlands: glass greenhouses, vegetables all year, 2nd-largest food exporter
function B11(ctx) {
  return ({ localTime: lt, duration }) => {
    const cTravel = W("b11", "travel"), cNL = W("b11", "netherlands"), cGlass = W("b11", "glass"), cHeat = W("b11", "heat"), cLight = W("b11", "light"), cWater = W("b11", "water"),
      cAll = W("b11", "all"), cSnow = W("b11", "snows"), cSmall = W("b11", "small"), cSecond = W("b11", "secondlargest");
    const fly = drive(lt, cTravel, cTravel + 2.2);
    const A = [130, 250], B = [330, 80], C = [230, 40];
    const bz = (t) => [(1 - t) * (1 - t) * A[0] + 2 * (1 - t) * t * C[0] + t * t * B[0], (1 - t) * (1 - t) * A[1] + 2 * (1 - t) * t * C[1] + t * t * B[1]];
    const [px, py] = bz(fly);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS.b11} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(11, ctx, [L("THE NETHERLANDS · Europe", cNL, "head"), L("Climate-controlled glass greenhouses: heat, light and water", cGlass), L("Vegetables ALL year round – even in the snow", cAll),
          L("A small country that is the world's SECOND-largest exporter of food and farm products (by value)", cSecond, "big"), L("Source: Wikipedia – Agriculture in the Netherlands", cSecond + 1.5, "source")])}>
        <Badge text="WOW!" x={60} y={70} lt={lt} at={0.2} size={40} />
        {/* travel card: India → the Netherlands */}
        <Card x={980} y={60} w={420} h={300} lt={lt} at={cTravel - 0.3} pad={0}>
          <svg width="420" height="300" viewBox="0 0 420 300" style={{ display: "block" }}>
            <path d={`M${A[0]} ${A[1]} Q ${C[0]} ${C[1]} ${B[0]} ${B[1]}`} stroke="rgba(255,255,255,0.35)" strokeWidth={3} strokeDasharray="8 8" fill="none" />
            <circle cx={A[0]} cy={A[1]} r={12} fill={SK.leaf} stroke={SK.ink} strokeWidth={3} /><text x={A[0]} y={A[1] + 38} textAnchor="middle" fontFamily={SANS} fontWeight="700" fontSize="24" fill={SK.white}>India</text>
            <g opacity={out3(lt, cNL, 0.5)}><circle cx={B[0]} cy={B[1]} r={16} fill={SK.gold} stroke={SK.ink} strokeWidth={3} />
              <text x={B[0] - 10} y={B[1] + 44} textAnchor="middle" fontFamily={SERIF} fontWeight="700" fontSize="26" fill={SK.gold}>Netherlands</text>
              <text x={B[0] - 10} y={B[1] + 72} textAnchor="middle" fontFamily={SANS} fontSize="20" fill={SK.dim}>Europe</text></g>
            <g transform={`translate(${px} ${py}) rotate(${-40 + fly * 70})`} opacity={windowOp(lt, cTravel, cTravel + 2.6, 0.3)}><path d="M14 0 L-10 -9 L-6 0 L-10 9 Z" fill={SK.white} /></g>
          </svg>
        </Card>
        <Pic slot="nl_greenhouses" label="Rows of glowing glass greenhouses" x={40} y={160} w={900} h={600} lt={lt} at={cNL} out={cAll} fx="pan" />
        <Pic slot="greenhouse_snow" label="Tomatoes and peppers inside while snow falls outside" x={40} y={160} w={900} h={600} lt={lt} at={cAll} out={cSmall} fx="zoom" />
        <Fall x={40} y={160} w={900} h={600} lt={lt} op={0.8 * windowOp(lt, cSnow - 0.2, cSmall, 0.5)} kind="snow" n={40} />
        <Pic slot="nl_export" label="Food boxes ship out from the Netherlands" x={40} y={160} w={900} h={600} lt={lt} at={cSmall} fx="zoom" />
        <Chip text="glass GREENHOUSES" x={490} y={175} lt={lt} at={cGlass} out={cAll} tone="gold" size={30} />
        <Chip text="vegetables ALL year – even when it snows!" x={490} y={175} lt={lt} at={cAll} out={cSmall} tone="gold" size={30} />
        <Chip text="a SMALL country…" x={490} y={175} lt={lt} at={cSmall} tone="gold" size={30} />
        {/* what the farmers control */}
        <Card x={980} y={400} w={420} h={300} lt={lt} at={cHeat - 0.3} out={cSmall} pad={26}>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 22, letterSpacing: "0.14em", color: SK.gold, marginBottom: 12 }}>FARMERS CONTROL</div>
          {[["Heat", cHeat, "#F0882A"], ["Light", cLight, "#FFD36B"], ["Water", cWater, "#7FB0D9"]].map(([t, at, c]) => <div key={t} style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 10, opacity: out3(lt, at, 0.4),
            fontFamily: SERIF, fontWeight: 700, fontSize: 40, color: SK.white }}><span style={{ width: 30, height: 30, borderRadius: 15, background: c }} />{t}<span style={{ color: SK.leaf, marginLeft: "auto" }}>✓</span></div>)}
        </Card>
        {/* the WOW number */}
        <div style={{ position: "absolute", left: 980, top: 400, width: 420, height: 380, borderRadius: 22, background: SK.gold, opacity: pop(lt, cSecond, 0.6), transform: `scale(${0.85 + 0.15 * pop(lt, cSecond, 0.6)})`,
          boxShadow: "0 10px 30px rgba(0,0,0,0.35)", textAlign: "center", padding: "26px 24px", boxSizing: "border-box" }}>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 150, lineHeight: 1, color: SK.ink }}>2<span style={{ fontSize: 70 }}>nd</span></div>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 34, lineHeight: 1.15, color: SK.ink, marginTop: 14 }}>largest exporter of food and farm products in the world</div>
        </div>
        <Chip text="the world's SECOND-largest food exporter!" x={490} y={690} lt={lt} at={cSecond + 0.3} size={28} />
      </Scene>
    );
  };
}
// 12 · The answer: back to the field, its three seasons; nature sets, technology stretches → Stop 4 (quick check)
const QUICK = ["Name the three cropping seasons.", "Which season is wheat grown in?", "Which needs more water: rice or millets?", "What happens to wheat in great heat?", "How do greenhouses help farmers?"];
function B12(ctx) {
  return ({ localTime: lt, duration }) => {
    const cQ = S("b12", 0), cBecause = S("b12", 1), cT = W("b12", "temperature"), cW = W("b12", "water"), cS = W("b12", "sunlight"), cTime = W("b12", "time"),
      cNat = W("b12", "nature"), cTech = W("b12", "technology"), st = stopAt("b12");
    // the field cycles through its three seasons (about 2.2 s each) until TECHNOLOGY
    const cyc = (lt / 2.2) % 3, idx = Math.floor(cyc), f = clamp((cyc - idx - 0.75) / 0.25, 0, 1);
    const fOp = (i) => (i === idx ? 1 : i === (idx + 1) % 3 ? f : 0) * (1 - reveal(lt, cTech, 0.6));
    const lit = { kharif: 0.15, rabi: 0.15, zaid: 0.15 }; lit[KEYS[idx]] = 1 - f * 0.85; lit[KEYS[(idx + 1) % 3]] = 0.15 + f * 0.85;
    const hand = mid(KEYS[idx]) + f * (mid(KEYS[(idx + 1) % 3]) - mid(KEYS[idx]) + (idx === 2 ? 360 : 0));
    const needs = [["temperature", cT, "#F0882A"], ["water", cW, "#7FB0D9"], ["sunlight", cS, "#FFD36B"], ["time", cTime, SK.leaf]];
    return (
      <Scene lt={lt} dur={duration} captions={CAPS.b12} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(12, ctx, [L("ANSWER", cQ, "head"), L("Different crops need different temperature, water, sunlight and time", cBecause),
          L("NATURE SETS THE SEASONS –", cNat, "big"), L("TECHNOLOGY CAN EXTEND THEM!", cTech, "big"), L("Stop 4: quick check", st, "think")])}>
        {FIELDS.map(([slot, , lab], i) => { const o = fOp(i); return o > 0 && <div key={slot} style={{ position: "absolute", inset: 0, opacity: o }}>
          <Pic slot={slot} label={lab} x={40} y={60} w={860} h={560} lt={lt} at={0} fx="none" /></div>; })}
        <Pic slot="greenhouse_field" label="A small greenhouse glows at the edge of the field in winter" x={40} y={60} w={860} h={560} lt={lt} at={cTech} fx="zoom" />
        <Wheel cx={1170} cy={230} r={160} lt={lt} at={0.3} lit={lt < cTech ? lit : { kharif: 1, rabi: 1, zaid: 1 }} hand={lt < cTech ? hand : null} hub={lt < cTech ? "YEAR" : "ALL YEAR"} />
        <Big x={60} y={80} w={820} lt={lt} at={cQ} out={cBecause} size={44}>So, what is the answer to our big question?</Big>
        <Card x={940} y={420} w={460} h={300} lt={lt} at={cBecause} pad={24}>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 22, letterSpacing: "0.12em", color: SK.gold }}>EACH CROP NEEDS ITS OWN…</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 16 }}>{needs.map(([t, at, c]) => <span key={t} style={{ opacity: out3(lt, at, 0.4), transform: `scale(${0.8 + 0.2 * pop(lt, at, 0.5)})`,
            fontFamily: SERIF, fontWeight: 700, fontSize: 34, color: SK.ink, background: c, padding: "8px 20px", borderRadius: 999 }}>{t}</span>)}</div>
        </Card>
        <Big x={60} y={650} w={860} lt={lt} at={cNat} size={50}><span style={{ color: SK.leaf }}>NATURE</span> sets the seasons,</Big>
        <Big x={60} y={730} w={860} lt={lt} at={cTech} size={50}>but <span style={{ color: SK.gold }}>TECHNOLOGY</span> can stretch them!</Big>
        <Discuss lt={lt} at={st} hold={holdOf("b12")} n={4} y={60} h={880} head="QUICK CHECK" items={QUICK} bg={0.97} />
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
const COLLAGE = [{ slot: "field_kharif", x: -60, y: -40, w: 760, h: 520, ph: 0 }, { slot: "field_rabi", x: 640, y: -80, w: 760, h: 520, ph: 2 },
  { slot: "field_zaid", x: -80, y: 520, w: 700, h: 560, ph: 4 }, { slot: "crop_wheat", x: 560, y: 560, w: 820, h: 560, ph: 1 }];
const B = { b1: B1, b2: B2, b3: B3, b4: B4, b5: B5, b6: B6, b7: B7, b8: B8, b10: B10, b11: B11, b12: B12 };
function CroppingScenes(props = {}) {
  const caps = props.showCaptions === "false" ? false : props.showCaptions !== false;
  const titles = {};
  IDS.forEach((b) => { const n = +b.slice(1); titles[n] = str(props["title" + n + "Text"], TITLES[n]); });
  const ctx = { caps, titles, capSize: num(props.captionSize, 34) };
  return (
    <StoryFrame props={props} dur={DUR} persistKey="thinkpro-lp7-three-cropping-seasons" collage={COLLAGE}>
      {IDS.map((b) => { const t = BEAT(b); return <Sprite key={b} start={t.start} end={t.start + t.dur}>{B[b](ctx)}</Sprite>; })}
      {STOPS.map(([b]) => <StopAt key={b} t={BEAT(b).start + stopAt(b)} hold={holdOf(b)} />)}
      <ChimeAt t={BEAT("b10").start + S("b10", 0, 0)} />
      <AudioSync />
    </StoryFrame>
  );
}
window.CroppingScenes = CroppingScenes;
