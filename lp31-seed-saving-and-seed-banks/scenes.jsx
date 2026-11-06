/* global React, window */
// ThinkPro Academy — "Seed Saving and Seed Banks: Protecting Tomorrow's Harvest!" (Grade 6 Agriculture, V1).
// After AG_G6_S31 Video Script (Subrata, 6 Nov 2026): 14 script scenes as 14 voiced beats, three presenter stops
// (TPStory.StopAt draws the built-in countdown dial top right, x 1262→1402, y 34→174: keep that corner clear), one Did-you-know card (b13, chime).
// Running idea: Seeds as Treasure. Meera follows Grandmother as a handful of seeds becomes a labelled treasure jar,
// then the camera zooms out to the village, national and world seed banks. The FIVE-STEP STRIP under the photo
// (b3–b7, b14) and the JAR LABEL are drawn, so they tick and write themselves.
// India maps use the official outline (engine/toon-india.js), loaded in Video.dc.html.
// STORY STYLE (engine/story-kit.jsx). Pure function of time.
const { Sprite } = window;
const { reveal, windowOp } = window.TPMotion;
const { num, str } = window.TPStage;
const { SK, SERIF, SANS, LEFT_W, pop, out3, lerp, drive,
  Pic, Chip, Badge, Big, Card, SVG, Arrow, ChimeAt, Scene, StoryFrame, StopAt, Flip } = window.TPStory;

// ---- SESSION NUMBER: change it here only. It drives the first panel title and the kicker. ----
const SESSION = 31;
const LP_TITLE = `LP${SESSION} – Seed Saving and Seed Banks`;
const KICK = `Grade 6 · Agriculture · Session ${SESSION}`;

// ---- Timing: EVERYTHING is keyed to the narration (tools/fit_timing.py → timing.js).
const TM = window.TP_TIMING;
if (!TM) console.error("timing.js missing — run: python3 tools/fit_timing.py videos/lp31-seed-saving-and-seed-banks");
const LEAD = TM ? TM.lead : 1.0;
const DUR = TM ? TM.total : 240;
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
const NB = 14;
const CAPS = {};
if (TM) for (let n = 1; n <= NB; n++) CAPS[n] = capsFor("b" + n);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rnd = (i) => { const x = Math.sin(i * 12.9898 + 4.1) * 43758.5453; return x - Math.floor(x); };

// ---- Panel copy. Title defaults mirror the DC data-props (titleNText) — keep in sync. ----
const TITLES = { 1: LP_TITLE, 2: "Seed saving", 3: "Step 1: Select", 4: "Step 2: Dry", 5: "Step 3: Clean", 6: "Step 4: Store", 7: "Step 5: Label", 8: "Spot the mistakes!",
  9: "What about thousands of varieties?", 10: "Community seed banks", 11: "National and international seed banks", 12: "Think", 13: "Did you know?", 14: "The big idea" };
const KICKS = { 3: "Seeds as Treasure", 4: "Seeds as Treasure", 5: "Seeds as Treasure", 6: "Seeds as Treasure", 7: "Seeds as Treasure", 8: "Seeds as Treasure", 9: "Seeds as Treasure", 10: "Seeds as Treasure", 11: "Seeds as Treasure", 12: "Seeds as Treasure", 13: "Seeds as Treasure", 14: "Seeds as Treasure" };
const panel = (n, ctx, lines, extra = {}) => ({ kicker: KICKS[n] || KICK, title: ctx.titles[n], lines, ...extra });
const L = (text, at, kind = "item", extra = {}) => ({ text, at, kind, ...extra });

// ---- Layout ------------------------------------------------------------------------
const BOX = { x: 40, y: 60, w: 1360, h: 860 };     // full photo area
const TOP = { x: 40, y: 60, w: 1360, h: 790 };     // photo area above the five-step strip

// ---- Presenter stops: [beat, sentence index whose pauseAfter is the hold, hold s]
const STOPS = [["b8", 2, 15.0], ["b12", 1, 15.0], ["b14", 3, 15.0]];
const stopAt = (b, i) => SE(b, i) + 0.1;                       // beat-local start of the hold
const stopFor = (b) => STOPS.find((s) => s[0] === b);
function PauseIcon({ size = 54 }) {
  return <svg width={size} height={size} viewBox="0 0 90 90"><circle cx="45" cy="45" r="43" fill={SK.gold} /><rect x="28" y="24" width="12" height="42" rx="4" fill={SK.ink} /><rect x="50" y="24" width="12" height="42" rx="4" fill={SK.ink} /></svg>;
}
// A low band that leaves the frozen picture in view (the kit's StopCard would cover it).
function StopBand({ lt, b, heading, children, x = 40, y = 700, w = LEFT_W - 80, h = 220, size = 44 }) {
  const s = stopFor(b), at = stopAt(b, s[1]), hold = s[2] - 0.2, n = STOPS.indexOf(s) + 1;
  const o = windowOp(lt, at, at + hold + 0.4, 0.35); if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 24, background: "rgba(5,30,22,0.92)", opacity: o, zIndex: 3,
      boxShadow: "0 0 0 3px rgba(226,176,76,0.9)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "14px 40px", boxSizing: "border-box", textAlign: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <PauseIcon size={46} />
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 26, letterSpacing: "0.08em", color: SK.ink, background: SK.gold, padding: "6px 22px", borderRadius: 12 }}>{heading}</div>
      </div>
      {children && <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: size, lineHeight: 1.16, color: SK.white, marginTop: 12 }}>{children}</div>}
      <div style={{ fontFamily: SANS, fontSize: 24, color: SK.dim, marginTop: 8 }}>Stop {n} of {STOPS.length}</div>
    </div>
  );
}

// ---- Shared pieces ---------------------------------------------------------------
const CLAY = "#B5693A", CLAY_D = "#8A4A26", RED = "#B3261E", GREEN = "#2E8B4F", WATER = "#4FB3E8", BAG = "#D9C39A", BAG_D = "#9E8558";
function Show({ lt, a, b = 1e9, f = 0.4, children }) {
  const o = windowOp(lt, a, b, f); if (o <= 0) return null;
  return <div style={{ position: "absolute", inset: 0, opacity: o }}>{children}</div>;
}
// A round mark that pops on a photo: tick (good) or cross (skip).
function Mark({ x, y, lt, at, good = true, r = 62 }) {
  const o = pop(lt, at, 0.45); if (o <= 0) return null;
  return <g transform={`translate(${x} ${y}) scale(${o})`}>
    <circle r={r} fill={good ? GREEN : RED} stroke="#fff" strokeWidth="6" />
    {good ? <path d={`M${-r * 0.48} ${r * 0.04} L${-r * 0.12} ${r * 0.4} L${r * 0.52} ${-r * 0.36}`} stroke="#fff" strokeWidth={r * 0.2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      : <path d={`M${-r * 0.4} ${-r * 0.4} L${r * 0.4} ${r * 0.4} M${r * 0.4} ${-r * 0.4} L${-r * 0.4} ${r * 0.4}`} stroke="#fff" strokeWidth={r * 0.2} strokeLinecap="round" fill="none" />}
  </g>;
}
// THE FIVE-STEP STRIP: the running checklist under the photo. ticks[i] = beat-local time step i ticks
// (-99 = already ticked, null = not yet); cur = the step being taught (gold).
const STEPS = ["SELECT", "DRY", "CLEAN", "STORE", "LABEL"];
function StepStrip({ lt, ticks = [], cur = -1, at = -99, out = null, y = 866 }) {
  const o = out3(lt, at, 0.5) * (out != null ? 1 - reveal(lt, out, 0.4) : 1); if (o <= 0) return null;
  const gap = 24, w = (1360 - 4 * gap) / 5, h = 78;
  return <div style={{ position: "absolute", left: 40, top: y, width: 1360, height: h, opacity: o }}>
    {STEPS.map((name, i) => {
      const t = ticks[i], p = t == null ? 0 : reveal(lt, t, 0.45), active = i === cur && !(p > 0), bump = 1 + 0.07 * Math.sin(Math.PI * p);
      const bg = p > 0 ? GREEN : active ? SK.gold : "rgba(255,255,255,0.10)", fg = p > 0 ? SK.white : active ? SK.ink : SK.dim;
      return <div key={i} style={{ position: "absolute", left: i * (w + gap), top: 0, width: w, height: h, borderRadius: 14, background: bg, color: fg, boxSizing: "border-box",
        boxShadow: active ? `0 0 0 3px ${SK.white}` : "0 0 0 2px rgba(255,255,255,0.35)", transform: `scale(${bump})`, display: "flex", alignItems: "center", paddingLeft: 16, gap: 12 }}>
        <div style={{ flex: "none", width: 46, height: 46 }}>
          <svg width="46" height="46" viewBox="0 0 46 46"><circle cx="23" cy="23" r="21" fill={p > 0 ? SK.white : "none"} stroke={fg} strokeWidth="3" />
            {p > 0 ? <path d="M11 24 L20 33 L35 14" pathLength="1" strokeDasharray={`${p} 1.02`} stroke={GREEN} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              : <text x="23" y="32" textAnchor="middle" fontFamily={SANS} fontWeight="700" fontSize="26" fill={fg}>{i + 1}</text>}</svg>
        </div>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 34, letterSpacing: "0.05em" }}>{name}</div>
      </div>;
    })}
  </div>;
}
// Flat treasure jar (clay pot + lid). Bottom-centre at x,y.
function Jar({ x, y, s = 1, lid = 1, glow = 0 }) {
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    {glow > 0 && <g opacity={glow}>{[...Array(10)].map((_, i) => { const a = i * Math.PI / 5; return <line key={i} x1={Math.cos(a) * 250} y1={-270 + Math.sin(a) * 250} x2={Math.cos(a) * 330} y2={-270 + Math.sin(a) * 330} stroke={SK.gold} strokeWidth="10" strokeLinecap="round" />; })}</g>}
    <path d="M-120 -500 L120 -500 L136 -446 C232 -390 250 -190 196 -70 C176 -22 130 0 90 0 L-90 0 C-130 0 -176 -22 -196 -70 C-250 -190 -232 -390 -136 -446 Z" fill={CLAY} stroke={CLAY_D} strokeWidth="6" />
    <path d="M-212 -300 C-120 -274 120 -274 212 -300" stroke={CLAY_D} strokeWidth="5" fill="none" />
    <g transform={`translate(0 ${-60 * (1 - lid)})`} opacity={lid > 0 ? 1 : 0}>
      <rect x="-146" y="-530" width="292" height="46" rx="14" fill={CLAY_D} /><circle cx="0" cy="-546" r="22" fill={CLAY_D} />
    </g>
  </g>;
}
// The jar label: writes itself row by row. HTML so the text stays crisp. x,y = top-left, width 450 at scale 1.
function JarLabel({ x, y, lt, at, t1, t2, t3, scale = 1, rot = -2, out = null }) {
  const o = pop(lt, at, 0.5) * (out != null ? 1 - reveal(lt, out, 0.4) : 1); if (o <= 0) return null;
  const Row = ({ k, v, t }) => { const p = reveal(lt, t, 0.6);
    return <div style={{ height: 66, borderBottom: "2px solid rgba(22,58,44,0.22)", display: "flex", alignItems: "baseline", gap: 14 }}>
      <div style={{ flex: "none", width: 92, fontFamily: SANS, fontWeight: 700, fontSize: 20, letterSpacing: "0.08em", color: SK.goldDeep }}>{k}</div>
      <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 32, lineHeight: "60px", color: SK.ink, whiteSpace: "nowrap", clipPath: `inset(-10px ${100 - 100 * p}% -10px 0)` }}>{v}</div>
    </div>; };
  return <div style={{ position: "absolute", left: x, top: y, width: 450, boxSizing: "border-box", padding: "10px 22px 16px", borderRadius: 12, background: SK.cream, opacity: clamp(o, 0, 1), zIndex: 2,
    transform: `rotate(${rot}deg) scale(${scale * (0.9 + 0.1 * o)})`, transformOrigin: "top left", boxShadow: `0 0 0 3px ${CLAY_D}, 0 8px 20px rgba(0,0,0,0.35)` }}>
    <Row k="NAME" v="Ragi" t={t1} /><Row k="DATE" v="Nov 2026" t={t2} /><Row k="SOURCE" v="Grandmother's field" t={t3} />
  </div>;
}
// Cartoon weevil. flip = facing right. run = legs going fast.
function Weevil({ x, y, s = 1, flip = false, lt = 0, run = false, op = 1 }) {
  if (op <= 0) return null;
  const w = Math.sin(lt * (run ? 34 : 12));
  return <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} opacity={op}>
    {[-26, 0, 26].map((lx, i) => <path key={i} d={`M${lx} 22 L${lx + (i % 2 ? 1 : -1) * w * 10} 48`} stroke="#2A1A10" strokeWidth="6" strokeLinecap="round" />)}
    <ellipse cx="0" cy="0" rx="50" ry="30" fill="#4A2E1B" stroke="#2A1A10" strokeWidth="4" />
    <path d="M-8 -28 C-4 -8 -4 12 -8 28" stroke="#2A1A10" strokeWidth="3" fill="none" />
    <circle cx="-52" cy="-6" r="20" fill="#5C3A22" stroke="#2A1A10" strokeWidth="4" />
    <path d="M-68 -2 L-104 12" stroke="#2A1A10" strokeWidth="9" strokeLinecap="round" />
    <circle cx="-56" cy="-14" r="8" fill="#fff" /><circle cx="-59" cy="-13" r="3.5" fill="#000" />
    <path d="M-48 -24 L-34 -44 M-58 -26 L-54 -48" stroke="#2A1A10" strokeWidth="4" strokeLinecap="round" />
  </g>;
}
// Flat cloth seed bag. Bottom-centre at x,y.
function Bag({ x, y, s = 1, op = 1, text }) {
  if (op <= 0) return null;
  return <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
    <path d="M-34 -150 C-20 -138 20 -138 34 -150 L44 -120 C96 -92 110 -30 92 -8 Q84 0 70 0 L-70 0 Q-84 0 -92 -8 C-110 -30 -96 -92 -44 -120 Z" fill={BAG} stroke={BAG_D} strokeWidth="5" />
    <path d="M-42 -120 C-20 -112 20 -112 42 -120" stroke={RED} strokeWidth="9" strokeLinecap="round" fill="none" />
  </g>;
}
// Small bag → bigger bag, shown on a dark strip over the photo.
function BagSwap({ lt, at, x = 890, y = 296, w = 500, more = at, out = null }) {
  const o = out3(lt, at, 0.5) * (out != null ? 1 - reveal(lt, out, 0.4) : 1), b = pop(lt, more, 0.6); if (o <= 0) return null;
  return <div style={{ position: "absolute", left: x, top: y, width: w, height: 300, borderRadius: 20, background: SK.card, opacity: o, boxShadow: "0 0 0 2px rgba(255,255,255,0.3)", transform: "scale(0.78)", transformOrigin: "top right" }}>
    <svg width={w} height="300" viewBox={`0 0 ${w} 300`}>
      <Bag x={100} y={230} s={0.62} />
      <Arrow x1={172} y1={170} x2={244} y2={170} color={SK.gold} sw={8} head={24} op={clamp(b, 0, 1)} />
      <Bag x={366} y={232} s={1.0 * clamp(b, 0.05, 1.1)} />
      <text x={100} y={276} textAnchor="middle" fontFamily={SANS} fontWeight="700" fontSize="28" fill={SK.white}>borrow</text>
      <text x={366} y={276} textAnchor="middle" fontFamily={SANS} fontWeight="700" fontSize="28" fill={SK.gold} opacity={clamp(b, 0, 1)}>return MORE</text>
    </svg>
  </div>;
}
// Thermometer falling to −18 °C. x,y = top-left of a card 170 × h.
function Thermo({ x, y, h = 560, lt, a, b, from = 20, to = -18 }) {
  const o = out3(lt, a, 0.5); if (o <= 0) return null;
  const v = lerp(from, to, drive(lt, a, b)), lo = -25, hi = 30, tt = 40, bb = h - 160, Y = (d) => bb - (d - lo) / (hi - lo) * (bb - tt), cx = 62;
  const shown = Math.round(v), txt = (shown < 0 ? "−" : "") + Math.abs(shown) + " °C";
  return <div style={{ position: "absolute", left: x, top: y, width: 200, height: h, borderRadius: 20, background: SK.card, opacity: o, boxShadow: "0 0 0 2px rgba(255,255,255,0.3)", zIndex: 2 }}>
    <svg width="200" height={h} viewBox={`0 0 200 ${h}`}>
      <rect x={cx - 15} y={tt - 16} width="30" height={bb - tt + 40} rx="15" fill="#fff" />
      <circle cx={cx} cy={bb + 34} r="30" fill="#fff" /><circle cx={cx} cy={bb + 34} r="22" fill={WATER} />
      <rect x={cx - 8} y={Y(v)} width="16" height={bb + 20 - Y(v)} fill={WATER} />
      {[20, 0, -18].map((d) => <g key={d}><line x1={cx + 20} y1={Y(d)} x2={cx + 40} y2={Y(d)} stroke="#fff" strokeWidth="3" /><text x={cx + 48} y={Y(d) + 10} fontFamily={SANS} fontWeight="700" fontSize="28" fill="#fff">{d < 0 ? "−" + -d : d}</text></g>)}
      <text x="100" y={h - 26} textAnchor="middle" fontFamily={SERIF} fontWeight="700" fontSize="42" fill={SK.gold}>{txt}</text>
    </svg>
  </div>;
}
// A big number that counts up (b13).
function Count({ x, y, w = 470, h = 200, lt, a, b, to, dec = 0, unit, sub, size = 92 }) {
  const o = out3(lt, a, 0.5); if (o <= 0) return null;
  const v = to * drive(lt, a, b);
  return <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 22, background: "rgba(5,30,22,0.88)", opacity: o, zIndex: 2, boxShadow: "0 0 0 3px rgba(226,176,76,0.9)", textAlign: "center", boxSizing: "border-box", paddingTop: 14 }}>
    <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: size, lineHeight: 1.05, color: SK.gold, whiteSpace: "nowrap" }}>{v.toFixed(dec)}{unit}</div>
    <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 32, color: SK.white, marginTop: 4, whiteSpace: "nowrap" }}>{sub}</div>
  </div>;
}

// ---- India: official outline (engine/toon-india.js) ------------------------------------
const INDIA = () => window.TP_INDIA;
const proj = (lon, lat) => { const m = INDIA(); return [(lon - m.lon0) * m.k * m.cos, (m.lat0 - lat) * m.k]; };
let _poly = null;
function inIndia(x, y) {
  if (!_poly) { const nums = (INDIA().outline.match(/-?[0-9.]+/g) || []).map(Number); _poly = []; for (let i = 0; i + 1 < nums.length; i += 2) _poly.push([nums[i], nums[i + 1]]); }
  let c = false;
  for (let i = 0, j = _poly.length - 1; i < _poly.length; j = i++) { const [xi, yi] = _poly[i], [xj, yj] = _poly[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; }
  return c;
}
// n seeded points inside the outline (map units), inset from the coast a little.
const _pts = {};
function dotsIn(n, seed) {
  const k = n + "/" + seed; if (_pts[k]) return _pts[k];
  const m = INDIA(), out = []; let i = 0;
  while (out.length < n && i < n * 60) { const x = rnd(seed + i * 2) * m.w, y = rnd(seed + 7 + i * 2 + 0.5) * m.h; i++;
    if (inIndia(x, y) && inIndia(x + 8, y) && inIndia(x - 8, y) && inIndia(x, y + 8) && inIndia(x, y - 8)) out.push([x, y]); }
  return (_pts[k] = out);
}
function IndiaShape({ fill = "#3F7D5A", line = "#F6F1E3", sw = 2.5 }) {
  const m = INDIA();
  return <g><path d={m.outline} fill={fill} stroke={line} strokeWidth={sw} strokeLinejoin="round" />
    {(m.islands || []).map((d, i) => <path key={i} d={d} fill={fill} stroke={line} strokeWidth={sw * 0.6} />)}</g>;
}

// ---- Beats -----------------------------------------------------------------------
function B1(ctx) {
  return ({ localTime: lt, duration }) => {
    const cQ = W("b1", "meera"), cNext = W("b1", "next");
    const bub = pop(lt, cNext - 0.3, 0.6), q = pop(lt, cNext + 0.2, 0.6);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[1]} showCaps={ctx.caps} capSize={ctx.capSize} fi={0.1}
        panel={panel(1, ctx, [L("Protecting Tomorrow's Harvest!", 0.6, "head"), L("Where will NEXT season's seeds come from?", cNext, "think")])}>
        <Pic slot="harvest_day" label="Harvest day: Meera tugs Grandmother's sari" x={BOX.x} y={BOX.y} w={BOX.w} h={BOX.h} lt={lt} at={0} fx="zoom" dur={0.5} />
        <Chip text="Meera" x={280} y={760} lt={lt} at={cQ} size={34} />
        <SVG op={clamp(bub, 0, 1)}><circle cx={930} cy={520} r={24} fill={SK.white} /><circle cx={870} cy={590} r={15} fill={SK.white} /></SVG>
        {bub > 0.01 && <div style={{ position: "absolute", left: 930, top: 96, width: 440, height: 400, borderRadius: "50%", overflow: "hidden", opacity: clamp(bub, 0, 1), transform: `scale(${0.8 + 0.2 * bub})`, boxShadow: "0 0 0 10px #fff, 0 10px 30px rgba(0,0,0,0.4)" }}>
          <Pic slot="rainfed_village" label="" x={0} y={0} w={440} h={400} lt={lt} at={-5} fx="none" r={0} border={false} />
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SERIF, fontWeight: 700, fontSize: 230, color: SK.gold, textShadow: "0 4px 18px rgba(0,0,0,0.6)", opacity: clamp(q, 0, 1) }}>?</div>
        </div>}
        <Chip text="NEXT season?" x={1150} y={520} lt={lt} at={cNext + 0.2} tone="gold" size={38} />
      </Scene>
    );
  };
}
function PriceTag({ x, y, lt, at, crossed = false, sw = 0 }) {
  const o = pop(lt, at, 0.5); if (o <= 0) return null;
  const rot = -8 + 5 * Math.sin(lt * 1.6) * (crossed ? 0 : 1);
  return <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${o})`}>
    <path d="M-90 -50 L60 -50 L110 0 L60 50 L-90 50 Q-104 50 -104 36 L-104 -36 Q-104 -50 -90 -50 Z" fill={crossed ? SK.cream : SK.gold} stroke={SK.ink} strokeWidth="4" />
    <circle cx="74" cy="0" r="10" fill={SK.bg0} />
    <text x="-20" y="22" textAnchor="middle" fontFamily={SANS} fontWeight="700" fontSize="62" fill={SK.ink}>₹</text>
    {crossed && <path d="M-110 56 L100 -56" stroke={RED} strokeWidth="13" strokeLinecap="round" />}
  </g>;
}
function B2(ctx) {
  return ({ localTime: lt, duration }) => {
    const cSave = W("b2", "save"), cHealthy = W("b2", "healthy"), cName = W("b2", "saving"), cOld = W("b2", "old"), cAlive = W("b2", "alive"), cLess = W("b2", "less");
    const k = drive(lt, cName - 0.4, cName + 0.5), lx = lerp(40, -700, k), rx = lerp(730, 40, k), rw = lerp(670, 1360, k);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[2]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(2, ctx, [L("Saving seeds from healthy, mature plants for the next season", cName, "big"), L("✔ Preserves useful crop varieties", cAlive, "plain"), L("✔ Less need to BUY seeds", cLess, "plain")])}>
        <div style={{ position: "absolute", left: BOX.x, top: BOX.y, width: BOX.w, height: BOX.h, overflow: "hidden", borderRadius: 18 }}>
          <Pic slot="seed_shop" label="A shop with seed packets" x={lx - 40} y={0} w={670} h={860} lt={lt} at={0} fx="zoom" />
          <Pic slot="pot_open" label="Grandmother's clay pot, no price tag" x={rx - 40} y={0} w={rw} h={860} lt={lt} at={0} fx="zoom" />
        </div>
        <SVG op={1 - k}><PriceTag x={250} y={190} lt={lt} at={0.5} /><PriceTag x={1080} y={190} lt={lt} at={cSave} crossed /></SVG>
        <Chip text="Buy every season" x={375} y={740} lt={lt} at={0.6} out={cName - 0.4} size={34} />
        <Chip text="Save your own: no price tag" x={1065} y={740} lt={lt} at={cHealthy} out={cName - 0.4} tone="gold" size={34} />
        <Chip text="SEED SAVING" x={720} y={110} lt={lt} at={cName + 0.1} tone="gold" size={58} />
        <Chip text="An old farming tradition" x={720} y={740} lt={lt} at={cOld} out={cAlive - 0.1} size={38} />
        <Chip text="Useful crop varieties stay ALIVE" x={720} y={740} lt={lt} at={cAlive} size={38} />
      </Scene>
    );
  };
}
function B3(ctx) {
  return ({ localTime: lt, duration }) => {
    const cStep = W("b3", "step"), cHealthy = W("b3", "healthy"), cDis = W("b3", "disease"), cFeat = W("b3", "features"), cBig = W("b3", "big"), cStrong = W("b3", "strong"), cGood = W("b3", "good"), cBest = W("b3", "best");
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[3]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(3, ctx, [L("Healthy, DISEASE-FREE plants", cHealthy), L("With the features you WANT", cFeat)])}>
        <Pic slot="select_field" label="Grandmother and Meera in the ragi field" x={40} y={60} w={680} h={790} lt={lt} at={0} fx="zoom" />
        <Pic slot="plant_sick" label="A yellow, spotted plant" x={740} y={60} w={320} h={790} lt={lt} at={cHealthy - 0.2} fx="pop" />
        <Pic slot="plant_best" label="The tallest, healthiest plant" x={1080} y={60} w={320} h={790} lt={lt} at={cHealthy} fx="pop" />
        <SVG><Mark x={900} y={150} lt={lt} at={cDis} good={false} /><Mark x={1240} y={150} lt={lt} at={cHealthy + 0.3} /></SVG>
        <Chip text="skip it" x={900} y={740} lt={lt} at={cDis + 0.2} size={34} />
        <Chip text="pick from this one" x={1240} y={740} lt={lt} at={cHealthy + 0.5} tone="gold" size={30} />
        <Chip text="big grains" x={70} y={560} lt={lt} at={cBig} size={36} anchor="left" />
        <Chip text="strong stems" x={70} y={636} lt={lt} at={cStrong} size={36} anchor="left" />
        <Chip text="good taste" x={70} y={712} lt={lt} at={cGood} size={36} anchor="left" />
        <StepStrip lt={lt} cur={0} ticks={[cBest]} at={cStep - 0.3} />
      </Scene>
    );
  };
}
// Tiny droplets rising out of the seeds. Pure function of lt.
function Drops({ lt, a, b, x0, x1, y0 = 720, y1 = 190, n = 26 }) {
  const o = windowOp(lt, a, b, 0.5); if (o <= 0) return null;
  return <SVG op={o}>{[...Array(n)].map((_, i) => { const p = (lt * 0.42 + rnd(i)) % 1, x = lerp(x0, x1, rnd(i + 30)) + 14 * Math.sin(lt * 1.4 + i), y = lerp(y0, y1, p), s = (0.7 + 0.8 * rnd(i + 9)) * (1 - 0.5 * p);
    return <path key={i} transform={`translate(${x} ${y}) scale(${s})`} d="M0 -22 C10 -8 15 0 15 8 A15 15 0 1 1 -15 8 C-15 0 -10 -8 0 -22 Z" fill={WATER} stroke="#fff" strokeWidth="2.5" opacity={clamp(Math.min(p, 1 - p) * 6, 0, 0.95)} />; })}</SVG>;
}
function SeedProblem({ x, lt, at, kind, text }) {
  const o = pop(lt, at, 0.5); if (o <= 0) return null;
  return <div style={{ position: "absolute", left: x, top: 590, width: 420, height: 230, borderRadius: 20, background: "rgba(5,30,22,0.9)", boxShadow: `0 0 0 3px ${RED}`, opacity: clamp(o, 0, 1), transform: `scale(${0.85 + 0.15 * o})`, zIndex: 2, textAlign: "center" }}>
    <svg width="420" height="160" viewBox="0 0 420 160">
      <g transform="translate(210 100)">
        <ellipse cx="0" cy="0" rx="72" ry="50" fill="#8E4A2E" stroke="#5E2E1B" strokeWidth="4" />
        {kind === "mould" && [[-34, -16, 15], [14, -26, 12], [36, 8, 17], [-10, 18, 13], [-46, 16, 9]].map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} fill="#B9D6C2" stroke="#7FA890" strokeWidth="2" />)}
        {kind === "sprout" && <g><path d="M30 -38 C40 -66 34 -80 56 -92" stroke="#7CC47F" strokeWidth="9" strokeLinecap="round" fill="none" /><path d="M56 -92 C30 -100 22 -84 26 -72 C42 -68 54 -76 56 -92 Z" fill="#7CC47F" /><path d="M-40 40 C-46 54 -60 56 -66 70" stroke="#EFE4CC" strokeWidth="6" strokeLinecap="round" fill="none" /></g>}
      </g>
    </svg>
    <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 36, color: SK.white }}>{text}</div>
  </div>;
}
function B4(ctx) {
  return ({ localTime: lt, duration }) => {
    const cDried = W("b4", "dried"), cExtra = W("b4", "extra"), cDamp = W("b4", "damp"), cMould = W("b4", "mouldy"), cSprout = W("b4", "start");
    const k = drive(lt, cExtra - 0.2, cExtra + 0.7), lw = lerp(1360, 670, k);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[4]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(4, ctx, [L("Remove EXTRA moisture", cExtra)])}>
        <Pic slot="dry_sun" label="Seeds spread on a mat in the sun" x={40} y={60} w={lw} h={790} lt={lt} at={0} fx="zoom" />
        <Pic slot="dry_shade" label="The mat moved into the shade" x={730} y={60} w={670} h={790} lt={lt} at={cExtra + 0.3} fx="zoom" />
        <Chip text="in the sun" x={lerp(720, 375, k)} y={80} lt={lt} at={cDried} size={36} tone="gold" />
        <Chip text="then in the shade" x={1065} y={80} lt={lt} at={cExtra + 0.7} size={36} />
        <Drops lt={lt} a={cDried} b={cDamp + 0.3} x0={100} x1={1340} />
        <SeedProblem x={165} lt={lt} at={cMould - 0.1} kind="mould" text="mouldy" />
        <SeedProblem x={855} lt={lt} at={cSprout} kind="sprout" text="sprouting" />
        <StepStrip lt={lt} cur={1} ticks={[-99, cDamp - 0.2]} />
      </Scene>
    );
  };
}
function B5(ctx) {
  return ({ localTime: lt, duration }) => {
    const cStep = W("b5", "step"), cDust = W("b5", "dust"), cBroken = W("b5", "broken"), cUn = W("b5", "unwanted"), cRem = W("b5", "removed");
    const o = windowOp(lt, 0.3, duration + 1, 0.5);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[5]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(5, ctx, [L("Remove dust and unwanted material", cDust)])}>
        <Pic slot="winnow" label="Grandmother winnows the seeds in a bamboo tray" x={TOP.x} y={TOP.y} w={TOP.w} h={TOP.h} lt={lt} at={0} fx="zoom" />
        <SVG op={o}>{[...Array(70)].map((_, i) => { const p = (lt * 0.5 + rnd(i)) % 1, x = lerp(560, 1390, Math.pow(p, 0.8)) + 30 * rnd(i + 3), y = 470 - 120 * p + 170 * (rnd(i + 11) - 0.5) * (0.3 + p) + 12 * Math.sin(lt * 2 + i), r = 3 + 6 * rnd(i + 5);
          return <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.55} transform={`rotate(${i * 37 + lt * 90} ${x} ${y})`} fill={i % 3 ? "#D9C39A" : "#A58B60"} opacity={clamp(Math.min(p * 8, (1 - p) * 3), 0, 0.9)} />; })}</SVG>
        <Chip text="dust" x={1000} y={120} lt={lt} at={cDust} size={38} />
        <Chip text="broken bits" x={1190} y={200} lt={lt} at={cBroken} size={38} />
        <Chip text="unwanted material" x={1130} y={280} lt={lt} at={cUn} size={38} />
        <StepStrip lt={lt} cur={2} ticks={[-99, -99, cRem]} />
      </Scene>
    );
  };
}
function B6(ctx) {
  return ({ localTime: lt, duration }) => {
    const cSeeds = W("b6", "seeds"), cCool = W("b6", "cool"), cDry = W("b6", "dry"), cAir = W("b6", "airtight"), cSafe = W("b6", "safe"), cSec = W("b6", "secret"), cHand = W("b6", "handful"), cNeem = W("b6", "neem"), cNat = W("b6", "natural"), cPest = W("b6", "pests");
    const wrun = drive(lt, cNat + 0.5, cPest + 1.0), wx = lerp(180, -160, wrun);
    const wIn = reveal(lt, cNat - 0.4, 0.5), wxIn = lerp(-160, 180, wIn), turned = lt > cNat + 0.4;
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[6]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(6, ctx, [L("COOL, DRY, AIRTIGHT container", cCool), L("Protects from moisture and insects", cSafe), L("Tip: add dried NEEM LEAVES", cNeem, "think")])}>
        <Show lt={lt} a={-1} b={cSec + 0.2}>
          <Pic slot="store_fill" label="Seeds going into a clay pot and a metal tin" x={TOP.x} y={TOP.y} w={TOP.w} h={TOP.h} lt={lt} at={0} fx="zoom" />
          <Chip text="COOL" x={330} y={100} lt={lt} at={cCool} tone="gold" size={46} />
          <Chip text="DRY" x={720} y={100} lt={lt} at={cDry} tone="gold" size={46} />
          <Chip text="AIRTIGHT" x={1110} y={100} lt={lt} at={cAir} tone="gold" size={46} />
          <Chip text="safe from moisture and insects" x={720} y={740} lt={lt} at={cSafe} size={36} />
        </Show>
        <Show lt={lt} a={cSec - 0.2}>
          <div style={{ position: "absolute", left: 40, top: 60, width: 880, height: 790, overflow: "hidden", borderRadius: 18 }}>
            <Pic slot="neem_tuck" label="Grandmother tucks dried neem leaves into the pot" x={0} y={0} w={880} h={790} lt={lt} at={cSec - 0.2} fx="zoom" />
            <SVG><Weevil x={lt > cNat + 0.4 ? wx : wxIn} y={700} s={1.5} flip={!turned ? true : false} run lt={lt} op={lt < cNat - 0.4 ? 0 : 1} /></SVG>
          </div>
          <Chip text="dried NEEM LEAVES" x={480} y={84} lt={lt} at={cNeem} tone="gold" size={42} />
          <Pic slot="kothi_bin" label="Lid on tight, in a cool, shaded corner" x={940} y={60} w={460} h={790} lt={lt} at={cPest - 0.2} fx="zoom" pos="70% center" />
          <Chip text="lid on, cool corner" x={1170} y={84} lt={lt} at={cPest + 0.1} size={34} />
        </Show>
        <StepStrip lt={lt} cur={3} ticks={[-99, -99, -99, cPest + 0.5]} />
      </Scene>
    );
  };
}
function B7(ctx) {
  return ({ localTime: lt, duration }) => {
    const cName = W("b7", "name"), cDate = W("b7", "date"), cFrom = W("b7", "from"), cId = W("b7", "identify"), cWrite = W("b7", "write");
    const lidK = out3(lt, 0.1, 0.5), glow = out3(lt, cId, 0.7) * (0.65 + 0.35 * Math.sin(lt * 3));
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[7]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(7, ctx, [L("Seed NAME", cName), L("Collection DATE", cDate), L("SOURCE", cFrom)])}>
        <Pic slot="meera_label" label="Meera writes the label" x={40} y={60} w={560} h={790} lt={lt} at={0} fx="zoom" />
        <SVG><Jar x={1010} y={840} s={1.2} lid={lidK} glow={glow} /></SVG>
        <JarLabel x={778} y={420} lt={lt} at={cWrite} t1={cName} t2={cDate} t3={cFrom} scale={1.06} />
        <Chip text="Our treasure jar" x={1010} y={84} lt={lt} at={cId} tone="gold" size={38} />
        <StepStrip lt={lt} cur={4} ticks={[-99, -99, -99, -99, cId]} />
      </Scene>
    );
  };
}
function B8(ctx) {
  return ({ localTime: lt, duration }) => {
    const cLook = W("b8", "look"), cMis = W("b8", "mistakes"), hAt = stopAt("b8", 2);
    const wx = lerp(1320, 1010, drive(lt, 0.6, hAt));   // freezes with the picture
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[8]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(8, ctx, [L("What has gone wrong with this seed jar?", cLook, "think")])}>
        <Pic slot="mistake_jar" label="A seed jar with everything wrong" x={BOX.x} y={BOX.y} w={BOX.w} h={BOX.h} lt={lt} at={0} fx="zoom" kenDur={40} />
        <SVG><Weevil x={wx} y={610} s={1.05} lt={Math.min(lt, hAt)} /></SVG>
        <StopBand lt={lt} b="b8" heading="SPOT THE MISTAKES!">What has gone wrong with this seed jar?</StopBand>
      </Scene>
    );
  };
}
// One continuous camera: pot → village → India. q 0 = pot fills the box, 1 = village fills it, 2 = whole map.
function ZoomOut({ lt, q, cross, dots }) {
  const m = INDIA(), W0 = BOX.w, H0 = BOX.h, s = 0.98, mx = (W0 - m.w * s) / 2, my = (H0 - m.h * s) / 2, [vx, vy] = proj(76.6, 13.6);
  const pv = [mx + vx * s, my + vy * s], F = 8, vw = W0 / F, vh = H0 / F, pw = vw / F, ph = vh / F;
  const pp = [pv[0] + vw * 0.1, pv[1] + vh * 0.12], Z = Math.pow(F * F, 1 - q / 2), lerp2 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
  const C = q <= 1 ? lerp2(pp, pv, (1 / Z - 1 / (F * F)) / (1 / F - 1 / (F * F))) : lerp2(pv, [W0 / 2, H0 / 2], (1 / Z - 1 / F) / (1 - 1 / F));
  const st = (P) => [W0 / 2 + Z * (P[0] - C[0]), H0 / 2 + Z * (P[1] - C[1])];
  const [tx, ty] = st([mx, my]), [v0x, v0y] = st([pv[0] - vw / 2, pv[1] - vh / 2]), [p0x, p0y] = st([pp[0] - pw / 2, pp[1] - ph / 2]);
  const vOp = 1 - clamp((q - 1.62) / 0.28, 0, 1), pOp = 1 - clamp((q - 0.72) / 0.22, 0, 1), pin = clamp((q - 1.75) / 0.2, 0, 1), dotsIn0 = dotsIn(420, 11);
  return <div style={{ position: "absolute", left: BOX.x, top: BOX.y, width: W0, height: H0, overflow: "hidden", borderRadius: 18, background: SK.bgDeep, boxShadow: "0 0 0 3px rgba(255,255,255,0.55)" }}>
    {q > 0.9 && <svg width={W0} height={H0} viewBox={`0 0 ${W0} ${H0}`} style={{ position: "absolute", left: 0, top: 0 }}>
      <g transform={`translate(${tx} ${ty}) scale(${Z * s})`}><IndiaShape sw={3 / (Z * s)} />
        {dotsIn0.map(([x, y], i) => { const p = pop(lt, dots + rnd(i + 3) * 2.4, 0.4); return p > 0.02 ? <circle key={i} cx={x} cy={y} r={5.2 * clamp(p, 0, 1.2)} fill={["#E2B04C", "#F6F1E3", "#E8A87C", "#9CD6A0", "#F2D16B"][i % 5]} /> : null; })}
      </g></svg>}
    {vOp > 0 && <Pic slot="village_homes" label="A village full of homes" x={v0x} y={v0y} w={vw * Z} h={vh * Z} lt={lt} at={-5} fx="none" op={vOp} r={Math.min(18, vw * Z * 0.03)} />}
    {pOp > 0 && <Pic slot="pot_open" label="Grandmother's single pot" x={p0x} y={p0y} w={pw * Z} h={ph * Z} lt={lt} at={-5} fx="none" op={pOp} r={Math.min(18, pw * Z * 0.03)} />}
    {pin > 0 && <svg width={W0} height={H0} viewBox={`0 0 ${W0} ${H0}`} style={{ position: "absolute", left: 0, top: 0 }}><circle cx={st(pv)[0]} cy={st(pv)[1]} r={13} fill={SK.gold} stroke="#fff" strokeWidth="4" opacity={pin} /></svg>}
  </div>;
}
function B9(ctx) {
  return ({ localTime: lt, duration }) => {
    const cFew = W("b9", "few"), cBut = W("b9", "but"), cTh = W("b9", "thousands"), cFut = W("b9", "future"), cSB = W("b9", "banks", 0, 0.9);
    const q = drive(lt, 0.5, cBut) + drive(lt, cTh - 0.2, cFut + 0.2);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[9]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(9, ctx, [L("Enter: SEED BANKS!", cSB, "big")])}>
        <ZoomOut lt={lt} q={q} dots={cFut - 1.2} />
        <Chip text="One family's pot" x={720} y={84} lt={lt} at={0.3} out={cBut - 0.9} size={38} />
        <Chip text="A whole village" x={720} y={84} lt={lt} at={cBut - 0.6} out={cFut - 1.3} size={38} />
        <Chip text="THOUSANDS of varieties" x={1140} y={110} lt={lt} at={cFut} tone="gold" size={38} />
        <Badge text="SEED BANKS!" x={90} y={110} lt={lt} at={cSB} size={58} />
      </Scene>
    );
  };
}
function B10(ctx) {
  return ({ localTime: lt, duration }) => {
    const cEx = W("b10", "exchange"), cBo = W("b10", "borrow"), cRet = W("b10", "return"), cMore = W("b10", "more"), cGrow = W("b10", "growing"), cLocal = W("b10", "local");
    const P = ({ slot, label, a, b }) => <Show lt={lt} a={a} b={b} f={0.45}><Pic slot={slot} label={label} x={BOX.x} y={BOX.y} w={BOX.w} h={BOX.h} lt={lt} at={a} fx="zoom" kenDur={10} dur={0.3} /></Show>;
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[10]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(10, ctx, [L("Farmers EXCHANGE, BORROW and PRESERVE local seeds", cEx, "big")])}>
        <P slot="bank_shelves" label="A village community seed bank: shelves of labelled clay pots" a={-1} b={cEx + 0.2} />
        <P slot="bank_swap" label="Two farmers swap seeds and shake hands" a={cEx} b={cBo + 0.4} />
        <P slot="bank_borrow" label="A farmer borrows a small bag of seeds" a={cBo + 0.2} b={cRet + 0.2} />
        <P slot="bank_return" label="The same farmer returns a bigger bag" a={cRet} b={cLocal + 0.2} />
        <P slot="bank_shelves" label="Shelves of labelled clay pots" a={cLocal} b={duration + 2} />
        <Chip text="EXCHANGE" x={720} y={84} lt={lt} at={cEx} out={cBo + 0.1} tone="gold" size={46} />
        <Chip text="BORROW" x={720} y={84} lt={lt} at={cBo} out={cRet} tone="gold" size={46} />
        <BagSwap lt={lt} at={cRet} more={cMore} out={cLocal - 0.2} />
        <Chip text="the bank keeps growing" x={720} y={760} lt={lt} at={cGrow} out={cLocal} size={38} />
        <Chip text="PRESERVE" x={720} y={84} lt={lt} at={cLocal} tone="gold" size={46} />
        <Chip text="safe, in local hands" x={720} y={760} lt={lt} at={cLocal + 0.5} size={38} />
      </Scene>
    );
  };
}
function B11(ctx) {
  return ({ localTime: lt, duration }) => {
    const cNat = W("b11", "national"), cInt = W("b11", "international"), cRec = W("b11", "recorded"), cCold = W("b11", "cold"), cDry = W("b11", "dry"), cSurv = W("b11", "survive");
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[11]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(11, ctx, [L("Carefully DOCUMENTED collections", cRec), L("Stored under CONTROLLED cold, dry conditions", cCold)])}>
        <Pic slot="scientist_computer" label="A scientist records data on a computer" x={BOX.x} y={BOX.y} w={BOX.w} h={BOX.h} lt={lt} at={0} fx="zoom" out={cCold} />
        <Pic slot="cold_room" label="The cold room: rows of sealed packets" x={BOX.x} y={BOX.y} w={BOX.w} h={BOX.h} lt={lt} at={cCold - 0.1} fx="zoom" />
        <Chip text="every seed RECORDED" x={720} y={760} lt={lt} at={cRec} out={cCold - 0.4} tone="gold" size={42} />
        <Chip text="COLD" x={640} y={760} lt={lt} at={cCold + 0.1} tone="gold" size={46} />
        <Chip text="DRY" x={800} y={760} lt={lt} at={cDry} tone="gold" size={46} />
        <Chip text="survives for MANY years" x={640} y={84} lt={lt} at={cSurv} size={38} />
        <Thermo x={1170} y={100} h={620} lt={lt} a={cCold + 0.1} b={cCold + 2.4} />
      </Scene>
    );
  };
}
function B12(ctx) {
  return ({ localTime: lt, duration }) => {
    const cWhy = W("b12", "why"), cMore = W("b12", "more");
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[12]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(12, ctx, [L("Why do farmers return MORE seeds than they borrowed?", cWhy, "think")])}>
        <Pic slot="bank_return" label="The same farmer returns a bigger bag" x={BOX.x} y={BOX.y} w={BOX.w} h={BOX.h} lt={lt} at={0} fx="none" />
        <BagSwap lt={lt} at={cWhy} more={cMore} />
        <StopBand lt={lt} b="b12" heading="THINK">Why do farmers return MORE seeds than they borrowed?</StopBand>
      </Scene>
    );
  };
}
function B13(ctx) {
  return ({ localTime: lt, duration }) => {
    const c1 = S("b13", 2), c2 = S("b13", 4), c3 = S("b13", 5), cTr = W("b13", "priceless"), cFour = W("b13", "four"), cSamp = W("b13", "samples"), cNine = W("b13", "nine"), c150 = W("b13", "150"), cSwap = W("b13", "swap");
    const cVault = W("b13", "svalbard"), c13 = W("b13", "13"), cMinus = W("b13", "minus");
    const nDots = 150, dots = dotsIn(nDots, 3), mS = 0.72, mX = 860, mY = 80;
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[13]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(13, ctx, [L("INDIA: National Genebank, ICAR-NBPGR, New Delhi: about 4.5 LAKH samples, among the world's largest", c1),
          L("NAVDANYA (\"nine seeds\"): 150+ community seed banks across India", c2), L("WORLD: Svalbard Global Seed Vault, Norway: over 13 LAKH samples, kept at −18 °C", c3)])}>
        <Show lt={lt} a={-1} b={c1 + 0.2}>
          <Flip x={320} y={230} w={800} h={400} lt={lt} at={0.5} q={<span>India and the world protect seeds like <span style={{ color: SK.goldDeep }}>PRICELESS</span> treasure!</span>} size={60} />
        </Show>
        <Show lt={lt} a={c1 - 0.2} b={c2 + 0.2}>
          <Pic slot="genebank_building" label="The National Genebank, New Delhi" x={40} y={60} w={670} h={860} lt={lt} at={c1 - 0.2} fx="zoom" />
          <Pic slot="national_bank" label="Its cold rooms" x={730} y={60} w={670} h={860} lt={lt} at={cSamp - 1.6} fx="zoom" />
          <Chip text="National Genebank, New Delhi" x={375} y={160} lt={lt} at={c1 + 0.4} size={34} />
          <Count x={480} y={420} lt={lt} a={cFour} b={cFour + 2} to={4.5} dec={1} unit=" LAKH" sub="samples" />
          <Chip text="one of the BIGGEST in the world" x={720} y={760} lt={lt} at={S("b13", 3) + 0.2} tone="gold" size={40} />
        </Show>
        <Show lt={lt} a={c2 - 0.2} b={c3 + 0.2}>
          <Pic slot="navdanya_field" label="Navdanya farmers in a field" x={40} y={60} w={800} h={860} lt={lt} at={c2 - 0.2} fx="zoom" />
          <SVG><rect x={860} y={60} width={540} height={860} rx={18} fill={SK.bgDeep} />
            <g transform={`translate(${mX - 14} ${mY + 200}) scale(${mS})`}><IndiaShape sw={3} />
              {dots.map(([x, y], i) => { const p = pop(lt, c150 + (i / nDots) * (cSwap - c150), 0.35); return p > 0.02 ? <circle key={i} cx={x} cy={y} r={7 * clamp(p, 0, 1.2)} fill={SK.gold} stroke="#fff" strokeWidth="1.5" /> : null; })}
            </g></SVG>
          <Chip text="NAVDANYA = nine seeds" x={440} y={84} lt={lt} at={cNine} tone="gold" size={40} />
          <Count x={900} y={78} w={460} h={176} lt={lt} a={c150} b={c150 + 1.8} to={150} unit="+" sub="community seed banks" size={84} />
        </Show>
        <Show lt={lt} a={c3 - 0.2}>
          <Pic slot="svalbard_entrance" label="Svalbard Global Seed Vault entrance in the snow" x={BOX.x} y={BOX.y} w={BOX.w} h={BOX.h} lt={lt} at={c3 - 0.2} fx="zoom" />
          <Chip text="Svalbard Global Seed Vault, Norway" x={720} y={84} lt={lt} at={cVault} tone="gold" size={38} />
          <Count x={660} y={640} w={480} h={200} lt={lt} a={c13} b={c13 + 1.8} to={13} unit=" LAKH+" sub="seed samples" />
          <Thermo x={1170} y={200} h={620} lt={lt} a={cMinus - 0.4} b={cMinus + 0.9} />
        </Show>
        <Badge text="DID YOU KNOW?" x={60} y={78} lt={lt} at={0.1} size={36} op={lt < c2 ? 1 : 0} />
      </Scene>
    );
  };
}
// A question card (Flip) with its answer pill under it.
function QA({ y, n, q, lt, at, ansAt, ans }) {
  return <React.Fragment>
    <Flip x={690} y={y} w={560} h={152} lt={lt} at={at} q={q} n={n} size={34} />
    <Chip text={ans} x={970} y={y + 164} lt={lt} at={ansAt} tone="gold" size={34} />
  </React.Fragment>;
}
function B14(ctx) {
  return ({ localTime: lt, duration }) => {
    const c0 = S("b14", 0), c1 = S("b14", 1), c2 = S("b14", 2), c3 = S("b14", 3), a1 = S("b14", 4), a2 = S("b14", 5), a3 = S("b14", 6), cSave = S("b14", 7);
    const steps = [W("b14", "select"), W("b14", "dry"), W("b14", "clean"), W("b14", "store"), W("b14", "label", 1)];
    const k = drive(lt, cSave + 0.1, cSave + 0.9), pw = lerp(640, 1360, k), ph = lerp(790, 860, k);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[14]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(14, ctx, [L("Quick check", c0, "head"), L("1. The five steps?", c1, "plain"), L("2. Why add neem leaves?", c2, "plain"), L("3. Three things on a seed label?", c3, "plain"),
          L("Save seeds today, protect TOMORROW'S harvest", cSave, "big")])}>
        <Pic slot="meera_shelf" label="Meera places her jar on the community seed bank shelf" x={40} y={60} w={pw} h={ph} lt={lt} at={0} fx="zoom" kenDur={30} />
        <JarLabel x={150} y={620} lt={lt} at={0.3} t1={-9} t2={-9} t3={-9} scale={0.78} out={cSave} />
        <Show lt={lt} a={c0 - 0.1} b={cSave + 0.4}>
          <QA y={60} n={1} q="Name the FIVE steps of seed saving." lt={lt} at={c1} ansAt={a1} ans="Select, dry, clean, store, label" />
          <QA y={330} n={2} q="Why add NEEM leaves?" lt={lt} at={c2} ansAt={a2} ans="To keep PESTS away" />
          <QA y={600} n={3} q="What THREE things go on the label?" lt={lt} at={c3} ansAt={a3} ans="Name, date and source" />
        </Show>
        <StepStrip lt={lt} ticks={steps} at={c1} out={cSave} />
        <StopBand lt={lt} b="b14" heading="QUICK CHECK" x={70} y={80} w={580} h={130} />
        <Card x={210} y={700} w={1020} h={170} lt={lt} at={cSave + 0.2} />
        <Big x={40} y={716} w={1360} lt={lt} at={cSave + 0.2} size={56} align="center">Save seeds today,<br />protect <span style={{ color: SK.gold }}>TOMORROW'S</span> harvest</Big>
      </Scene>
    );
  };
}

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
const COLLAGE = [{ slot: "golden_field", x: -60, y: -40, w: 760, h: 520, ph: 0 }, { slot: "rainfed_village", x: 640, y: -80, w: 760, h: 520, ph: 2 },
  { slot: "kothi_bin", x: -80, y: 520, w: 700, h: 560, ph: 4 }, { slot: "national_bank", x: 560, y: 560, w: 820, h: 560, ph: 1 }];
function Lp31Scenes(props = {}) {
  const caps = props.showCaptions === "false" ? false : props.showCaptions !== false;
  const titles = {};
  for (let n = 1; n <= NB; n++) titles[n] = str(props["title" + n + "Text"], TITLES[n]);
  const ctx = { caps, titles, capSize: num(props.captionSize, 34) };
  const B = [B1, B2, B3, B4, B5, B6, B7, B8, B9, B10, B11, B12, B13, B14];
  const beats = B.map((Bn, i) => { const t = BEAT("b" + (i + 1)); return [t.start, t.start + t.dur, Bn]; });
  return (
    <StoryFrame props={props} dur={DUR} persistKey="thinkpro-lp31-seed-saving-and-seed-banks" collage={COLLAGE}>
      {beats.map(([s, e, Bn], i) => (
        <Sprite key={i} start={s} end={e}>{Bn(ctx)}</Sprite>
      ))}
      {STOPS.map(([b, i, hold]) => <StopAt key={b} t={BEAT(b).start + stopAt(b, i)} hold={hold - 0.2} />)}
      <ChimeAt t={BEAT("b13").start + S("b13", 0, 0)} />
      <AudioSync />
    </StoryFrame>
  );
}
window.Lp31Scenes = Lp31Scenes;
