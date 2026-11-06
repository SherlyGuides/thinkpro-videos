/* global React, window */
// ThinkPro Academy — "Plantation Crops and Horticulture" (Grade 6 Agriculture, Session 11, V1).
// After AG_G6_S11_Video_Script_Plantation_Crops_and_Horticulture (Draft 1, 4 Nov 2026): 11 scenes as
// 10 narrated beats (scene 6, the silent leaf break + chime, sits in the tail of b5), five presenter
// stops (silent holds — the web player freezes there, TPStory.StopAt), two orange WOW cards (b6, b7).
// The two BADGES are the running idea: PLANTATION = gold estate badge (factory + ship), HORTICULTURE
// = woven basket. STORY STYLE (engine/story-kit.jsx). Drawn here, no engine changes: world map +
// globe (hand-simplified lon/lat coastlines), badges, basket, bark cut-away, soil cut-away, gauges.
const { Sprite, Easing } = window;
const { reveal, windowOp } = window.TPMotion;
const { num, str } = window.TPStage;
const { SK, SERIF, SANS, LEFT_W, pop, out3, lerp, drive, Pic, Chip, Badge, Big, Card, SVG, Arrow, T, ChimeAt, Scene, StoryFrame, StopAt, Break } = window.TPStory;

// ---- Timing: EVERYTHING is keyed to the narration (tools/fit_timing.py → timing.js).
const TM = window.TP_TIMING;
if (!TM) console.error("timing.js missing — run: python3 tools/fit_timing.py videos/lp11-plantation-crops-and-horticulture");
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
const NB = 10;
const CAPS = {};
if (TM) for (let n = 1; n <= NB; n++) CAPS[n] = capsFor("b" + n);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// ---- Panel copy. Title defaults mirror the DC data-props (titleNText) — keep in sync. ----
const TITLES = { 1: "LP11 – Plantation Crops and Horticulture", 2: "Plantation crops", 3: "Tea, coffee and rubber", 4: "What plantations need", 5: "Rubber tapping",
  6: "WOW! India", 7: "WOW! The world", 8: "Horticulture", 9: "What horticulture needs", 10: "The answer" };
const KICK = "Grade 6 · Agriculture · Session 11";
const KICKS = { 6: "WOW fact", 7: "WOW fact" };
const panel = (n, ctx, lines, extra = {}) => ({ kicker: KICKS[n] || KICK, title: ctx.titles[n], lines, ...extra });
const L = (text, at, kind = "item", extra = {}) => ({ text, at, kind, ...extra });

// ---- Presenter stops: [beat, sentence index whose pauseAfter is the hold, hold s]
const STOPS = [["b1", 7, 5.0], ["b4", 7, 6.0], ["b7", 6, 5.0], ["b9", 4, 7.0], ["b10", 7, 8.0]];
const stopAt = (b, i) => SE(b, i) + 0.1;                       // beat-local start of the hold
const stopFor = (b) => STOPS.find((s) => s[0] === b);
const holdOf = (b) => stopFor(b)[2] - 0.2;
const stopStart = (b) => stopAt(b, stopFor(b)[1]);
const BRK = () => SE("b5", 5) + 0.1;                           // the silent leaf break (script scene 6)

// ---- Shared pieces ---------------------------------------------------------------
const WATER = "#5DB7E8", ORANGE = "#E8701E", LATEX = "#FBF8EE", SEA = "#1C5A6E", LAND_C = "#6FBF6E";
function Arr({ x1, y1, x2, y2, lt, at, color = SK.gold, sw = 6 }) { return <Arrow x1={x1} y1={y1} x2={x2} y2={y2} color={color} sw={sw} op={out3(lt, at, 0.5)} />; }
function Run({ x1, y1, x2, y2, lt, at, n = 1 }) {                 // a dot running along an arrow
  if (lt < at) return null;
  return <g>{Array.from({ length: n }, (_, k) => { const p = ((lt - at) * 0.6 + k / n) % 1; return <circle key={k} cx={lerp(x1, x2, p)} cy={lerp(y1, y2, p)} r={9} fill={SK.cream} opacity={1 - p} />; })}</g>;
}
// Round photo tile with a chip under it.
function Node({ slot, label, x, y, r = 90, lt, at, size = 24, out = null, tone = "cream", chip = true }) {
  const o = pop(lt, at, 0.6) * (out != null ? 1 - reveal(lt, out, 0.4) : 1); if (o <= 0) return null;
  return (
    <React.Fragment>
      <Pic slot={slot} label={label} x={x - r} y={y - r} w={2 * r} h={2 * r} r={r} lt={lt} at={at} out={out} fx="pop" style={{ boxShadow: "0 0 0 4px " + SK.cream }} />
      {chip && <Chip text={label} x={x} y={y + r + 12} lt={lt} at={at + 0.15} out={out} size={size} tone={tone} />}
    </React.Fragment>
  );
}
// PLANTATION badge: the large-estate badge, a gold disc with a factory above a ship.
function EstateMark({ x, y, s = 1, label = false }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle r={64} fill={SK.gold} stroke={SK.goldDeep} strokeWidth={5} />
      <circle r={55} fill="none" stroke={SK.ink} strokeOpacity={0.35} strokeWidth={2} />
      {/* factory */}
      <path d="M-36 2 L-36 -18 L-20 -6 L-20 -18 L-4 -6 L-4 -18 L12 -6 L12 -42 L26 -42 L26 2 Z" fill={SK.ink} />
      <rect x={-29} y={-6} width={8} height={7} fill={SK.gold} /><rect x={-14} y={-6} width={8} height={7} fill={SK.gold} /><rect x={1} y={-6} width={8} height={7} fill={SK.gold} />
      {/* ship + wave */}
      <path d="M-34 13 L34 13 L25 31 L-24 31 Z" fill={SK.ink} />
      <rect x={-10} y={5} width={20} height={8} fill={SK.ink} />
      <path d="M-40 39 q 10 -7 20 0 t 20 0 t 20 0 t 20 0" stroke={SK.ink} strokeWidth={4} fill="none" strokeLinecap="round" />
      {label && <text y={100} textAnchor="middle" fontFamily={SERIF} fontWeight="700" fontSize={30} fill={SK.gold}>PLANTATION</text>}
    </g>
  );
}
function EstateBadge({ x, y, s = 0.6, lt, at, out = null, label = false }) {
  const o = pop(lt, at, 0.5) * (out != null ? 1 - reveal(lt, out, 0.4) : 1); if (o <= 0) return null;
  return <SVG op={o}><EstateMark x={x} y={y} s={s * (0.85 + 0.15 * o)} label={label} /></SVG>;
}
// HORTICULTURE badge: the woven basket. items = [{ color, at }] (each shows from its own time).
function HortBasket({ cx, cy, s = 1, lt, at = 0, items = [], label = true, glow = 0, op = 1 }) {
  const o = pop(lt, at, 0.7) * op; if (o <= 0) return null;
  const spots = [[-78, -4], [-34, -12], [12, -10], [58, -6], [-56, 8], [-10, 6], [36, 8], [84, 4]];
  return (
    <SVG op={o}>
      <g transform={`translate(${cx} ${cy}) scale(${s * (0.9 + 0.1 * o)})`}>
        {glow > 0 && <ellipse cx={0} cy={10} rx={190} ry={120} fill={SK.gold} opacity={0.28 * glow} />}
        <ellipse cx={0} cy={-58} rx={128} ry={30} fill="#5E3B1E" />
        {items.map((it, i) => { const k = pop(lt, it.at, 0.5); if (k <= 0) return null; const [x, y] = spots[i % spots.length];
          return <circle key={i} cx={x} cy={-60 + y - 12 * k} r={24} fill={it.color} stroke="rgba(0,0,0,0.25)" strokeWidth={2} opacity={k} />; })}
        <path d="M-130 -58 L -95 92 Q 0 112 95 92 L 130 -58 Q 0 -30 -130 -58 Z" fill="#B57A3E" stroke="#6E4520" strokeWidth={5} strokeLinejoin="round" />
        {[-20, 15, 50].map((y) => <path key={y} d={`M${-124 + (y + 58) * 0.23} ${y} Q 0 ${y + 24} ${124 - (y + 58) * 0.23} ${y}`} stroke="#8A5A2B" strokeWidth={5} fill="none" />)}
        {[-80, -40, 0, 40, 80].map((x) => <line key={x} x1={x * 1.08} y1={-44} x2={x * 0.8} y2={98} stroke="#8A5A2B" strokeWidth={4} />)}
        <path d="M-130 -58 Q 0 -30 130 -58" stroke="#E0A867" strokeWidth={9} fill="none" strokeLinecap="round" />
      </g>
      {label && <text x={cx} y={cy + 150 * s} textAnchor="middle" fontFamily={SERIF} fontWeight="700" fontSize={34 * Math.max(0.8, s)} fill={SK.gold}>HORTICULTURE</text>}
    </SVG>
  );
}
const HORT_ITEMS = (at) => ["#F2A33A", "#F4D24B", "#D8402E", "#D8402E", "#5E9C3A", "#F0882A", "#E6B422", "#7A4A2A"].map((color, i) => ({ color, at: at + i * 0.08 }));
// A round photo that pops at (x0,y0), then at `t0` falls into the basket mouth at (x1,y1) and is gone.
function Fall({ slot, label, x0, y0, x1, y1, r0 = 100, r1 = 30, lt, at, t0 }) {
  if (lt < at) return null;
  const k = Easing.easeInCubic(clamp((lt - t0) / 0.8, 0, 1)), gone = reveal(lt, t0 + 0.75, 0.15);
  if (gone >= 1) return null;
  const x = lerp(x0, x1, k), y = lerp(y0, y1, k) - Math.sin(k * Math.PI) * 60, r = lerp(r0, r1, k);
  return (
    <React.Fragment>
      <Pic slot={slot} label={label} x={x - r} y={y - r} w={2 * r} h={2 * r} r={r} lt={lt} at={at} fx="pop" op={1 - gone} style={{ boxShadow: "0 0 0 4px " + SK.cream }} />
      <Chip text={label} x={x0} y={y0 + r0 + 12} lt={lt} at={at + 0.15} size={28} tone="gold" />
    </React.Fragment>
  );
}
// Bright orange WOW card: arrives big in the middle, then settles top-left as a badge at `settle`.
function WowCard({ lt, at, settle, text }) {
  const o = pop(lt, at, 0.7); if (o <= 0) return null;
  const k = Easing.easeInOutCubic(reveal(lt, settle, 0.6));
  const x = lerp(250, 40, k), y = lerp(370, 44, k), sc = lerp(1.9, 1, k) * (0.8 + 0.2 * o), tw = 1 + 0.08 * Math.sin(lt * 6);
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: Math.min(1, o), transform: `scale(${sc})`, transformOrigin: "left top", display: "flex", alignItems: "center", gap: 20,
      background: ORANGE, padding: "10px 30px", borderRadius: 18, boxShadow: "0 6px 20px rgba(0,0,0,0.35)", whiteSpace: "nowrap" }}>
      <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 62, color: SK.white }}>WOW!</span>
      <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 44, color: SK.white }}>{text}</span>
      <svg width="56" height="56" viewBox="-35 -35 70 70" style={{ transform: `scale(${tw}) rotate(${lt * 30}deg)` }}>
        <path d="M0 -32 L 7 -7 L 32 0 L 7 7 L 0 32 L -7 7 L -32 0 L -7 -7 Z" fill={SK.gold} /></svg>
    </div>
  );
}
// The countdown now comes from StopAt in engine/story-kit.jsx.
const Count = () => null;
// Pause card over the photo area (gold pause icon + heading). Compact: the frozen scene stays visible above it.
function StopShell({ lt, at, hold, heading, n, children, top = 60, h = 900, bg = "rgba(5,30,22,0.92)", pad = "34px 60px" }) {
  const o = windowOp(lt, at - 0.3, at + hold + 0.4, 0.35); if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 40, top, width: LEFT_W - 80, height: h, borderRadius: 26, background: bg, opacity: o,
      boxShadow: "0 0 0 3px rgba(226,176,76,0.9)", padding: pad, boxSizing: "border-box" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
        <svg width="66" height="66" viewBox="0 0 90 90"><circle cx="45" cy="45" r="43" fill={SK.gold} /><rect x="28" y="24" width="12" height="42" rx="4" fill={SK.ink} /><rect x="50" y="24" width="12" height="42" rx="4" fill={SK.ink} /></svg>
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 42, color: SK.white }}>{heading}</div>
      </div>
      {children}
      <div style={{ position: "absolute", left: 60, bottom: 22, fontFamily: SANS, fontSize: 24, color: SK.dim }}>Stop {n} of 5</div>
      <Count lt={lt} at={at} hold={hold} x={LEFT_W - 80 - 160} y={h - 150} />
    </div>
  );
}
const stopText = (size = 46) => ({ fontFamily: SERIF, fontWeight: 700, fontSize: size, lineHeight: 1.2, color: SK.white, marginTop: 20, maxWidth: 1080 });

// ---- World coastlines, hand-simplified [lon, lat]. A teaching sketch: no borders. ------
const LANDS = [
  [[-168,66],[-162,70],[-156,71],[-141,70],[-128,70],[-115,68],[-95,68],[-94,72],[-85,70],[-81,67],[-88,64],[-94,60],[-92,57],[-82,55],[-80,52],[-79,55],[-77,58],[-78,62],[-70,62],[-65,59],[-60,55],[-56,52],[-60,50],[-66,50],[-65,45],[-70,43],[-74,40],[-76,35],[-81,31],[-80,25],[-82,28],[-84,30],[-90,29],[-97,27],[-97,22],[-95,18],[-91,19],[-90,21],[-87,21],[-88,16],[-83,15],[-83,10],[-79,9],[-80,7],[-85,10],[-90,13],[-95,16],[-102,18],[-106,22],[-110,27],[-113,31],[-110,24],[-115,30],[-118,34],[-122,37],[-124,42],[-124,48],[-130,54],[-135,58],[-145,60],[-152,59],[-158,56],[-165,54],[-160,59],[-165,62]],
  [[-73,78],[-60,82],[-35,83],[-20,80],[-22,72],[-35,66],[-43,60],[-50,62],[-54,68],[-60,75]],
  [[-77,8],[-72,12],[-62,11],[-52,5],[-50,0],[-44,-2],[-35,-6],[-35,-9],[-39,-16],[-41,-22],[-48,-26],[-53,-33],[-58,-35],[-57,-38],[-63,-41],[-65,-45],[-68,-50],[-68,-54],[-73,-53],[-75,-47],[-73,-38],[-71,-30],[-70,-18],[-76,-14],[-81,-6],[-80,0],[-77,4]],
  [[-17,15],[-17,21],[-13,28],[-9,33],[-6,36],[3,37],[10,37],[11,33],[20,31],[25,32],[32,31],[35,28],[37,21],[39,16],[43,12],[51,12],[49,6],[42,-1],[39,-6],[40,-15],[35,-20],[35,-25],[32,-29],[27,-34],[19,-34],[15,-27],[12,-18],[13,-8],[9,-1],[9,4],[4,6],[-4,5],[-8,4],[-13,8]],
  [[-9,37],[-9,43],[-2,43],[-1,46],[-5,48],[2,51],[8,54],[8,57],[11,54],[20,55],[24,59],[30,60],[22,60],[21,65],[17,62],[18,59],[13,56],[11,59],[5,59],[5,62],[14,68],[25,71],[40,67],[44,68],[60,69],[68,73],[80,73],[100,77],[113,74],[130,71],[150,71],[170,70],[180,68],[177,63],[165,60],[162,56],[157,51],[156,58],[150,59],[142,59],[136,54],[140,48],[135,43],[130,42],[127,40],[129,36],[126,34],[125,39],[121,40],[118,38],[122,37],[120,33],[122,30],[119,25],[114,22],[109,21],[106,18],[109,13],[105,9],[102,12],[100,13],[99,10],[103,2],[101,3],[98,8],[98,15],[94,17],[91,22],[87,21],[82,16],[80,13],[78,8],[76,10],[73,17],[72,21],[68,23],[62,25],[57,26],[50,30],[51,25],[56,24],[59,22],[55,17],[45,13],[43,15],[39,21],[35,28],[35,32],[36,36],[30,36],[27,37],[26,40],[29,41],[35,42],[41,41],[37,45],[30,46],[28,42],[24,40],[23,37],[20,40],[14,45],[18,40],[16,38],[12,43],[8,44],[3,43],[0,39],[-5,36]],
  [[114,-22],[122,-18],[129,-15],[136,-12],[140,-17],[142,-11],[146,-19],[153,-26],[150,-37],[144,-38],[138,-34],[131,-31],[124,-33],[115,-34]],
  [[-5,50],[1,51],[0,54],[-3,58],[-6,57],[-3,54]], [[-10,52],[-6,52],[-6,55],[-10,54]], [[-24,65],[-14,66],[-14,64],[-22,63]],
  [[130,32],[136,34],[141,37],[141,41],[140,41],[137,37],[132,35]], [[141,42],[145,43],[142,45]],
  [[95,5],[104,-3],[106,-6],[101,-3]], [[106,-6],[114,-7],[114,-8],[106,-7]], [[109,1],[113,3],[117,7],[118,1],[115,-4],[110,-2]], [[119,1],[125,1],[122,-4],[120,-5]],
  [[131,-1],[141,-3],[150,-10],[141,-9]], [[44,-16],[49,-12],[50,-16],[47,-25],[44,-23]], [[80,9.5],[82,7.5],[80.5,6]], [[120,18],[122,18],[124,12],[126,7],[122,8],[120,14]],
  [[173,-35],[178,-38],[174,-41]], [[172,-41],[174,-42],[167,-46]], [[-84,22],[-75,20],[-78,20]], [[-74,20],[-69,19],[-72,18]],
];
const MK = 3.85;
const mapXY = (m, lon, lat) => [m.x + (lon + 170) * MK, m.y + (80 - lat) * MK * 1.1];
function WorldMap({ m, op = 1 }) {
  if (op <= 0) return null;
  const d = LANDS.map((p) => "M" + p.map(([a, b]) => mapXY(m, a, b).map((v) => v.toFixed(1)).join(" ")).join(" L") + " Z").join(" ");
  return <path d={d} opacity={op} fill={LAND_C} fillOpacity={0.75} stroke={SK.cream} strokeOpacity={0.5} strokeWidth={1.5} strokeLinejoin="round" />;
}
// Orthographic globe; points on the far side slide to the rim so land wraps round the edge.
function ortho(lon, lat, lon0, lat0) {
  const R = Math.PI / 180, p = lat * R, p0 = lat0 * R, d = (lon - lon0) * R;
  const x = Math.cos(p) * Math.sin(d), y = Math.cos(p0) * Math.sin(p) - Math.sin(p0) * Math.cos(p) * Math.cos(d);
  const c = Math.sin(p0) * Math.sin(p) + Math.cos(p0) * Math.cos(p) * Math.cos(d);
  if (c >= 0) return [x, -y, true];
  const n = Math.hypot(x, y) || 1; return [x / n, -y / n, false];
}
function Globe({ cx, cy, r, lon0, lat0 = 8, lt, marks = [], op = 1 }) {
  if (op <= 0) return null;
  return (
    <g opacity={op}>
      <circle cx={cx} cy={cy} r={r + 10} fill={SK.gold} opacity={0.12} />
      <circle cx={cx} cy={cy} r={r} fill={SEA} stroke={SK.cream} strokeWidth={4} />
      {LANDS.map((p, i) => { const q = p.map(([a, b]) => ortho(a, b, lon0, lat0)); if (!q.some((v) => v[2])) return null;
        return <path key={i} d={"M" + q.map(([x, y]) => (cx + x * r).toFixed(1) + " " + (cy + y * r).toFixed(1)).join(" L") + " Z"} fill={LAND_C} stroke={SK.cream} strokeOpacity={0.45} strokeWidth={1} strokeLinejoin="round" />; })}
      {marks.map((k, i) => { if (k.op <= 0) return null; const [x, y, vis] = ortho(k.lon, k.lat, lon0, lat0); if (!vis) return null;
        const px = cx + x * r, py = cy + y * r, pu = (lt * 1.2) % 1;
        return <g key={i} opacity={k.op}><circle cx={px} cy={py} r={14 + pu * 34} fill="none" stroke={SK.gold} strokeWidth={4} opacity={1 - pu} /><circle cx={px} cy={py} r={13} fill={SK.gold} stroke={SK.ink} strokeWidth={2} /></g>; })}
    </g>
  );
}
// India outline (engine/toon-india.js) with lit dots.
const IN = window.TP_INDIA;
const inXY = (lon, lat) => [(lon - IN.lon0) * IN.k * IN.cos, (IN.lat0 - lat) * IN.k];
function IndiaMini({ x, y, s, lt, op = 1, dots = [] }) {
  if (op <= 0 || !IN) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
      <path d={IN.outline} fill={SK.bg1} stroke={SK.cream} strokeWidth={3 / s} strokeLinejoin="round" />
      {dots.map((d, i) => { if (d.op <= 0) return null; const [px, py] = inXY(d.lon, d.lat), pu = (lt * 1.2) % 1;
        return <g key={i} opacity={d.op}><circle cx={px} cy={py} r={(12 + pu * 30) / s} fill="none" stroke={SK.gold} strokeWidth={4 / s} opacity={1 - pu} /><circle cx={px} cy={py} r={11 / s} fill={SK.gold} stroke={SK.ink} strokeWidth={2 / s} /></g>; })}
    </g>
  );
}
// Small flat worker silhouette (b4 "LOTS of people"): generic, no faces.
function Worker({ x, y, s = 1, color = "#E7DDBE" }) {
  return <g transform={`translate(${x} ${y}) scale(${s})`} fill={color}><circle cy={-52} r={11} /><path d="M-13 -39 L13 -39 L10 -12 L-10 -12 Z" /><rect x={-10} y={-12} width={8} height={32} rx={3} /><rect x={2} y={-12} width={8} height={32} rx={3} /></g>;
}
function Thermo({ x, y, k, lt }) {
  const h = 110 * k;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-14} y={-140} width={28} height={150} rx={14} fill="#F2F2EC" />
      <circle cy={22} r={26} fill="#F2F2EC" />
      <circle cy={22} r={18} fill="#D8402E" />
      <rect x={-7} y={10 - h} width={14} height={h + 8} rx={6} fill="#D8402E" />
      {[0, 1, 2, 3].map((i) => <line key={i} x1={20} x2={32} y1={-120 + i * 34} y2={-120 + i * 34} stroke="#F2F2EC" strokeWidth={3} />)}
    </g>
  );
}
function Dial({ x, y, k }) {
  const a = -Math.PI + Math.PI * 0.82 * k, R0 = 74;
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={`M${-R0} 0 A ${R0} ${R0} 0 0 1 ${R0} 0`} stroke="rgba(255,255,255,0.3)" strokeWidth={16} fill="none" strokeLinecap="round" />
      <path d={`M${-R0} 0 A ${R0} ${R0} 0 0 1 ${R0 * Math.cos(a)} ${R0 * Math.sin(a)}`} stroke={WATER} strokeWidth={16} fill="none" strokeLinecap="round" opacity={k > 0.01 ? 1 : 0} />
      <line x1={0} y1={0} x2={60 * Math.cos(a)} y2={60 * Math.sin(a)} stroke="#F2F2EC" strokeWidth={6} strokeLinecap="round" />
      <circle r={10} fill="#F2F2EC" />
    </g>
  );
}

// ============================================================================
// Scene 1 — the small farm and the giant estate, the big question, Stop 1.
function B1(ctx) {
  return ({ localTime: lt, duration }) => {
    const cFam = W("b1", "family"), cRows = W("b1", "rows"), cThis = W("b1", "this", 1), cEye = W("b1", "eye"), cHund = W("b1", "hundreds"), cQ = W("b1", "question"), cPl = W("b1", "plantation"),
      at = stopStart("b1"), hold = holdOf("b1");
    const fly = drive(lt, cThis, cThis + 7), sc = lerp(1.5, 1, fly);       // the drone rises: the estate opens out
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[1]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(1, ctx, [L("PLANTATION CROPS AND HORTICULTURE", 0.4, "big"), L("BIG QUESTION", cQ, "head"), L("What makes a plantation different from an ordinary farm?", cPl, "think")])}>
        <Pic slot="small_farm" label="A small family farm: a few rows of crops, one farmer" x={40} y={60} w={670} h={600} lt={lt} at={0.1} fx="zoom" />
        <Chip text="ONE family" x={375} y={84} lt={lt} at={cFam} tone="gold" size={34} />
        <Chip text="a few rows of crops" x={375} y={590} lt={lt} at={cRows} size={30} />
        {lt >= cThis - 0.1 && <div style={{ position: "absolute", left: 730, top: 60, width: 670, height: 600, borderRadius: 18, overflow: "hidden", opacity: out3(lt, cThis, 0.5), boxShadow: "0 0 0 3px rgba(255,255,255,0.55)" }}>
          <Pic slot="tea_estate" label="An endless tea estate with hundreds of workers" x={0} y={0} w={670} h={600} r={0} lt={lt} at={cThis} fx="none" border={false} style={{ transform: `scale(${sc})` }} />
        </div>}
        <Chip text="as far as the eye can see" x={1065} y={84} lt={lt} at={cEye} tone="gold" size={32} />
        <Chip text="HUNDREDS of workers" x={1065} y={590} lt={lt} at={cHund} size={30} />
        <Card x={40} y={680} w={1360} h={180} lt={lt} at={cQ} out={at - 0.35} pad={26}>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 24, letterSpacing: "0.14em", color: SK.gold }}>OUR BIG QUESTION</div>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 44, color: SK.white, marginTop: 10, opacity: out3(lt, cPl, 0.5) }}>What makes a PLANTATION different?</div>
        </Card>
        <StopShell lt={lt} at={at} hold={hold} heading="PAUSE AND DISCUSS" n={1} top={675} h={285} pad="20px 60px">
          <div style={stopText(44)}>Spot three differences between the two farms.</div>
        </StopShell>
      </Scene>
    );
  };
}
// Scene 2 — where the two harvests go; how big the estate is next to the small farm.
function B2(ctx) {
  return ({ localTime: lt, duration }) => {
    const cPl = W("b2", "plantation"), cLarge = W("b2", "large"), cHuge = W("b2", "huge"), cSell = W("b2", "sell"), cFood = W("b2", "food"), cFam = W("b2", "family"), cLoc = W("b2", "local");
    const grow = out3(lt, cHuge, 1.2);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[2]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(2, ctx, [L("PLANTATION CROPS", cPl, "big"), L("Grown on LARGE farms", cLarge), L("Over HUGE areas", cHuge), L("Mainly to SELL (commercial)", cSell),
          L("FOOD GRAINS", cFood, "head"), L("Often for the family or the local market", cFam)])}>
        {/* the estate row */}
        <Pic slot="tea_estate" label="The tea estate" x={40} y={60} w={420} h={395} lt={lt} at={cPl} fx="zoom" />
        <Chip text="LARGE farm" x={250} y={380} lt={lt} at={cLarge} tone="gold" size={30} />
        <Pic slot="tea_truck" label="Trucks carry the harvest away" x={520} y={60} w={420} h={395} lt={lt} at={cSell} fx="pop" />
        <Chip text="grown to SELL" x={730} y={380} lt={lt} at={cSell + 0.2} tone="gold" size={30} />
        <EstateBadge x={870} y={132} s={0.72} lt={lt} at={cSell + 0.4} />
        <SVG op={1}><Arr x1={464} y1={258} x2={516} y2={258} lt={lt} at={cSell} /><Run x1={464} y1={258} x2={506} y2={258} lt={lt} at={cSell} /></SVG>
        {/* how big: the estate next to the small farm, same scale */}
        <SVG op={out3(lt, cHuge - 0.1, 0.5)}>
          <rect x={960} y={60} width={440} height={395} rx={18} fill={SK.card} stroke="rgba(255,255,255,0.18)" strokeWidth={2} />
          <text x={1180} y={102} textAnchor="middle" fontFamily={SANS} fontWeight="700" fontSize={24} fill={SK.gold} letterSpacing="2">SAME SCALE</text>
          <rect x={990} y={425 - 280 * grow} width={300 * grow} height={280 * grow} rx={6} fill="#3F9A5B" stroke={SK.cream} strokeWidth={3} />
          {grow > 0.9 && Array.from({ length: 8 }, (_, i) => <line key={i} x1={1000} x2={1280} y1={165 + i * 34} y2={165 + i * 34} stroke="#2C7A45" strokeWidth={6} />)}
          <text x={1140} y={290} textAnchor="middle" fontFamily={SERIF} fontWeight="700" fontSize={34} fill={SK.white} opacity={grow}>the estate</text>
          <rect x={1320} y={399} width={26} height={26} rx={3} fill={SK.gold} stroke={SK.cream} strokeWidth={2} />
          <text x={1333} y={385} textAnchor="middle" fontFamily={SANS} fontWeight="700" fontSize={20} fill={SK.cream}>small</text>
          <text x={1333} y={363} textAnchor="middle" fontFamily={SANS} fontSize={20} fill={SK.cream}>the</text>
        </SVG>
        {/* the small farm row */}
        <Pic slot="small_farm" label="The small family farm" x={40} y={480} w={420} h={395} lt={lt} at={cFood} fx="zoom" />
        <Chip text="FOOD GRAINS" x={250} y={800} lt={lt} at={cFood + 0.2} tone="gold" size={30} />
        <Pic slot="family_kitchen" label="The harvest goes to the family kitchen" x={520} y={480} w={420} h={395} lt={lt} at={cFam} fx="pop" />
        <Chip text="the family" x={730} y={800} lt={lt} at={cFam + 0.2} size={30} />
        <Pic slot="local_market" label="The local market" x={980} y={480} w={420} h={395} lt={lt} at={cLoc} fx="pop" />
        <Chip text="the local market" x={1190} y={800} lt={lt} at={cLoc + 0.2} size={30} />
        <SVG op={1}><Arr x1={464} y1={678} x2={516} y2={678} lt={lt} at={cFam} /><Arr x1={944} y1={678} x2={976} y2={678} lt={lt} at={cLoc} /><Run x1={464} y1={678} x2={506} y2={678} lt={lt} at={cFam} /></SVG>
      </Scene>
    );
  };
}
// Scene 3 — three journeys: to the factory, then out across a world map.
const JOURNEYS = [["tea_leaves", "Tea leaves", "tea_factory", "Factory", "tea_packets", "Tea packets"],
  ["coffee_cherries", "Coffee cherries", "roasted_beans", "Roasted beans", "cafe_cup", "A far-away café"],
  ["rubber_latex", "Rubber latex", "rubber_factory", "Factory", "tyres_gloves", "Tyres and gloves"]];
function B3(ctx) {
  return ({ localTime: lt, duration }) => {
    const cWords = [W("b3", "tea"), W("b3", "coffee"), W("b3", "rubber")], cPl = W("b3", "plantation"), cFact = W("b3", "factories"), cMk = W("b3", "markets"), cWorld = W("b3", "world");
    const m = { x: 60, y: 175 }, rows = 1 - reveal(lt, cMk - 0.3, 0.5), bright = out3(lt, cMk - 0.3, 0.6), ys = [165, 420, 675], xs = [210, 660, 1110];
    const [ix, iy] = mapXY(m, 79, 20);
    const pins = [[8, 50, "tea_packets", "Tea packets"], [-90, 38, "cafe_cup", "A far-away café"], [136, 36, "tyres_gloves", "Tyres and gloves"]];
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[3]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(3, ctx, [L("TEA", cWords[0], "big"), L("COFFEE", cWords[1], "big"), L("RUBBER", cWords[2], "big"), L("For INDUSTRIES…", cFact), L("…and INTERNATIONAL MARKETS", cMk)])}>
        <SVG op={1}><WorldMap m={m} op={0.22 + 0.78 * bright} /></SVG>
        <EstateBadge x={1320} y={120} s={0.8} lt={lt} at={cPl} />
        <Chip text="PLANTATION crops" x={660} y={22} lt={lt} at={cPl + 0.1} out={cMk - 0.3} size={26} tone="gold" />
        <div style={{ position: "absolute", inset: 0, opacity: rows }}>
          {JOURNEYS.map(([s1, l1, s2, l2, s3, l3], i) => { const a = cWords[i], mid = cFact + i * 0.25, end = cFact + 0.7 + i * 0.25, y = ys[i];
            return <React.Fragment key={s1}>
              <SVG op={1}>
                <Arr x1={xs[0] + 104} y1={y} x2={xs[1] - 104} y2={y} lt={lt} at={mid - 0.2} sw={7} />
                <Arr x1={xs[1] + 104} y1={y} x2={xs[2] - 104} y2={y} lt={lt} at={end - 0.2} sw={7} />
                <Run x1={xs[0] + 104} y1={y} x2={xs[1] - 124} y2={y} lt={lt} at={mid} /><Run x1={xs[1] + 104} y1={y} x2={xs[2] - 124} y2={y} lt={lt} at={end} />
              </SVG>
              <Node slot={s1} label={l1} x={xs[0]} y={y} r={92} lt={lt} at={a} size={24} />
              <Node slot={s2} label={l2} x={xs[1]} y={y} r={92} lt={lt} at={mid} size={24} />
              <Node slot={s3} label={l3} x={xs[2]} y={y} r={92} lt={lt} at={end} size={24} tone="gold" />
            </React.Fragment>; })}
        </div>
        {bright > 0 && <SVG op={bright}>
          {pins.map(([lo, la], i) => { const [x, y] = mapXY(m, lo, la), cx = (ix + x) / 2, cy = Math.min(iy, y) - 150 + i * 30, at = cMk + i * 0.3, d = out3(lt, at, 0.8), p = ((lt - at) * 0.55) % 1, q = lt > at ? p : 0;
            const px = (1 - q) * (1 - q) * ix + 2 * q * (1 - q) * cx + q * q * x, py = (1 - q) * (1 - q) * iy + 2 * q * (1 - q) * cy + q * q * y;
            return <g key={i}><path d={`M${ix} ${iy} Q ${cx} ${cy} ${x} ${y}`} stroke={SK.gold} strokeWidth={5} strokeDasharray="14 10" fill="none" opacity={d} />{lt > at && <circle cx={px} cy={py} r={10} fill={SK.cream} />}</g>; })}
          <circle cx={ix} cy={iy} r={12} fill={SK.gold} stroke={SK.ink} strokeWidth={2} />
        </SVG>}
        {bright > 0 && pins.map(([lo, la, s, lab], i) => { const [x, y] = mapXY(m, lo, la), at = cMk + 0.4 + i * 0.3; return <Node key={s} slot={s} label={lab} x={x} y={y - 20} r={62} lt={lt} at={at} size={22} />; })}
        <Pic slot="cargo_ship" label="A ship full of cargo" x={520} y={640} w={360} h={230} lt={lt} at={cMk + 0.2} fx="pop" />
        <Chip text="all around the WORLD" x={700} y={800} lt={lt} at={cWorld} tone="gold" size={28} />
      </Scene>
    );
  };
}
// Scene 4 — rain and mist, warm and humid; then the four jobs. Stop 2 freezes on them.
const JOBS = [["work_plant", "1  PLANTING", "plant", 1], ["work_prune", "2  PRUNING", "prune", 0], ["work_pluck", "3  PLUCKING", "pluck", 0], ["tea_factory", "4  PROCESSING", "process", 0]];
function B4(ctx) {
  return ({ localTime: lt, duration }) => {
    const cWarm = W("b4", "warm"), cHum = W("b4", "humid"), cRain = W("b4", "rain"), cLots = W("b4", "lots"), cWork = W("b4", "workers"), ats = JOBS.map((j) => W("b4", j[2], j[3])), at = stopStart("b4"), hold = holdOf("b4");
    const hills = 1 - reveal(lt, ats[0] - 0.15, 0.4), cAnd = S("b4", 3), squeeze = drive(lt, at - 0.5, at + 0.1);
    const raining = windowOp(lt, cRain, cWork + 0.3, 0.4);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[4]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(4, ctx, [L("NEEDS", cWarm, "head"), L("WARM", cWarm), L("HUMID", cHum), L("Enough RAINFALL", cRain), L("LOTS of human labour:", cLots, "big"),
          L("PLANTING · PRUNING · PLUCKING · PROCESSING", ats[0]), L("HAVE YOU UNDERSTOOD?", at, "head")], { max: 7 })}>
        {hills > 0 && <div style={{ position: "absolute", inset: 0, opacity: hills }}>
          <Pic slot="tea_garden" label="Rain and mist over green hills" x={40} y={60} w={1360} h={820} lt={lt} at={0.1} fx="zoom" />
          <SVG op={1}>
            {raining > 0 && Array.from({ length: 46 }, (_, i) => { const p = ((lt * 1.3 + i * 0.137) % 1), x = 60 + (i * 83) % 1320, y = 70 + p * 760; return <line key={i} x1={x} y1={y} x2={x - 8} y2={y + 30} stroke="#DCEEFA" strokeWidth={4} strokeLinecap="round" opacity={raining * 0.8} />; })}
            {[[80, 620, cWarm], [340, 620, cHum], [600, 620, cRain]].map(([x, y, a], i) => <rect key={i} x={x} y={y} width={240} height={240} rx={20} fill="rgba(5,30,22,0.72)" opacity={out3(lt, a, 0.5)} />)}
            {out3(lt, cWarm, 0.5) > 0 && <g opacity={out3(lt, cWarm, 0.5)}><Thermo x={200} y={785} k={out3(lt, cWarm, 1.4)} lt={lt} /></g>}
            {out3(lt, cHum, 0.5) > 0 && <g opacity={out3(lt, cHum, 0.5)}><Dial x={460} y={770} k={out3(lt, cHum, 1.4)} /></g>}
            {out3(lt, cRain, 0.5) > 0 && <g opacity={out3(lt, cRain, 0.5)} transform="translate(720 730)"><path d="M-60 0 a 28 28 0 0 1 22 -40 a 36 36 0 0 1 66 4 a 24 24 0 0 1 32 36 Z" fill="#DDE6EE" />
              {[-36, -6, 24].map((dx, i) => { const p = ((lt * 1.2 + i * 0.33) % 1); return <line key={i} x1={dx} y1={14 + p * 40} x2={dx - 6} y2={30 + p * 40} stroke={WATER} strokeWidth={5} strokeLinecap="round" opacity={1 - p} />; })}</g>}
          </SVG>
          <Chip text="WARM" x={200} y={634} lt={lt} at={cWarm + 0.1} tone="gold" size={28} />
          <Chip text="HUMID" x={460} y={634} lt={lt} at={cHum + 0.1} tone="gold" size={28} />
          <Chip text="RAIN" x={720} y={634} lt={lt} at={cRain + 0.1} tone="gold" size={28} />
          <Card x={880} y={620} w={500} h={240} lt={lt} at={cAnd} pad={20}>
            <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 42, color: SK.gold, textAlign: "center" }}>LOTS of people!</div>
          </Card>
          <SVG op={1}>{Array.from({ length: 20 }, (_, i) => <g key={i} opacity={pop(lt, cAnd + 0.1 + i * 0.03, 0.3)}><Worker x={920 + (i % 10) * 45} y={770 + Math.floor(i / 10) * 72} s={0.85} /></g>)}</SVG>
        </div>}
        {JOBS.map(([slot, lab], i) => { const a = ats[i], gx = 40 + (i % 2) * 690, gy = 60 + Math.floor(i / 2) * 420, rx = 40 + i * 345,
            x = lerp(gx, rx, squeeze), y = lerp(gy, 60, squeeze), w = lerp(670, 325, squeeze), h = lerp(400, 370, squeeze);
          return <React.Fragment key={slot}>
            <Pic slot={slot} label={lab.slice(3)} x={x} y={y} w={w} h={h} lt={lt} at={a} fx="pop" />
            <Chip text={lab} x={x + w / 2} y={y + h - 56} lt={lt} at={a + 0.15} tone="gold" size={lerp(32, 26, squeeze)} />
          </React.Fragment>; })}
        <StopShell lt={lt} at={at} hold={hold} heading="HAVE YOU UNDERSTOOD?" n={2} top={450} h={510}>
          <div style={{ ...stopText(54), marginTop: 34 }}>Name the four jobs on a plantation.</div>
          <div style={{ ...stopText(54), color: SK.gold }}>Why are so many workers needed?</div>
        </StopShell>
      </Scene>
    );
  };
}
// Scene 5 — rubber tapping at dawn: the cut, the latex, the cup. Then the silent leaf break (scene 6).
function B5(ctx) {
  return ({ localTime: lt, duration }) => {
    const cW = W("b5", "wondered"), cSlant = W("b5", "slanting"), cBark = W("b5", "bark"), cEarly = W("b5", "early"), cWhite = W("b5", "white"), cLatex = W("b5", "latex"), cDrips = W("b5", "drips"), cBec = W("b5", "becomes"), brk = BRK();
    const cut = drive(lt, cSlant - 0.2, cBark + 1.2), run = clamp((lt - cWhite) / 1.6, 0, 1), level = clamp((lt - cDrips - 0.4) / 4, 0, 1), sun = out3(lt, cW, cEarly - cW + 1.6);
    const A = [1215, 300], B = [915, 470], cx = lerp(A[0], B[0], cut), cy = lerp(A[1], B[1], cut), CUPY = 710;
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[5]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(5, ctx, [L("RUBBER TAPPING", cW, "big"), L("A slanting cut in the bark", cSlant), L("Done early in the morning", cEarly), L("White LATEX flows into a cup", cLatex)])}>
        <Pic slot="rubber_cut" label="Dawn: a worker cuts a thin slanting line in the bark" x={40} y={60} w={640} h={460} lt={lt} at={0.1} fx="zoom" />
        <Chip text="early in the morning" x={360} y={84} lt={lt} at={cEarly} tone="gold" size={30} />
        <Pic slot="rubber_row" label="A row of rubber trees with cups in the early light" x={40} y={540} w={640} h={340} lt={lt} at={cDrips} fx="pan" />
        <EstateBadge x={620} y={600} s={0.6} lt={lt} at={cBec} />
        <SVG op={out3(lt, 0.3, 0.6)}>
          <defs><linearGradient id="lp11dawn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5E7FA8" /><stop offset="0.75" stopColor="#F2B878" /><stop offset="1" stopColor="#F6D9A0" /></linearGradient></defs>
          <rect x={700} y={60} width={700} height={820} rx={20} fill="url(#lp11dawn)" />
          <circle cx={800} cy={lerp(620, 170, sun)} r={52} fill="#FFD76A" opacity={0.95} />
          <rect x={880} y={60} width={370} height={820} fill="#6E5540" />
          <rect x={880} y={60} width={30} height={820} fill="#5A4433" /><rect x={1220} y={60} width={30} height={820} fill="#5A4433" />
          {[120, 240, 560, 640, 800, 850].map((y, i) => <path key={y} d={`M${900 + (i * 37) % 120} ${y} q 60 ${i % 2 ? 12 : -12} 130 2`} stroke="#57412F" strokeWidth={5} fill="none" strokeLinecap="round" />)}
          {/* the cut, drawn as the knife moves */}
          {cut > 0 && <line x1={A[0]} y1={A[1]} x2={cx} y2={cy} stroke="#2E1F14" strokeWidth={13} strokeLinecap="round" />}
          {cut > 0 && cut < 1 && <path transform={`translate(${cx} ${cy}) rotate(-30)`} d="M0 0 L 66 -12 L 104 -2 L 66 8 Z" fill="#C9D2D6" stroke="#54616A" strokeWidth={3} />}
          {/* latex runs down the cut, then the spout, then drips */}
          {run > 0 && <path d={`M${A[0]} ${A[1]} L${B[0]} ${B[1]} L ${B[0]} 588`} stroke={LATEX} strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${run} 1`} />}
          <path d={`M${B[0] - 18} 590 L ${B[0] + 18} 590 L ${B[0]} 612 Z`} fill="#AEB6B8" opacity={out3(lt, cSlant, 0.5)} />
          {lt > cDrips && [0, 1].map((i) => { const p = ((lt - cDrips) * 0.9 + i / 2) % 1; return <path key={i} transform={`translate(${B[0]} ${lerp(612, CUPY - 6 - level * 40, p)})`} d="M0 -12 C 7 -2, 7 8, 0 9 C -7 8, -7 -2, 0 -12 Z" fill={LATEX} />; })}
          {/* the cup, tied to the trunk */}
          <line x1={850} y1={CUPY + 6} x2={1250} y2={CUPY + 6} stroke="#3B2E22" strokeWidth={5} opacity={out3(lt, cSlant, 0.5)} />
          <g opacity={out3(lt, cSlant, 0.5)}>
            <path d={`M${B[0] - 62} ${CUPY} L ${B[0] + 62} ${CUPY} L ${B[0] + 44} ${CUPY + 92} L ${B[0] - 44} ${CUPY + 92} Z`} fill="#3C3F3E" stroke="#1F2221" strokeWidth={4} />
            {level > 0 && <path d={`M${B[0] - 58 + 14 * (1 - level)} ${CUPY + 82 - 70 * level} L ${B[0] + 58 - 14 * (1 - level)} ${CUPY + 82 - 70 * level} L ${B[0] + 44} ${CUPY + 88} L ${B[0] - 44} ${CUPY + 88} Z`} fill={LATEX} />}
          </g>
        </SVG>
        <Chip text="a thin, SLANTING cut" x={1130} y={190} lt={lt} at={cSlant + 0.3} tone="gold" size={30} />
        <Chip text="white LATEX" x={1150} y={640} lt={lt} at={cLatex} tone="gold" size={34} />
        <Chip text="drips slowly into a cup" x={1120} y={700} lt={lt} at={cDrips} size={28} />
        <Chip text="LATEX becomes RUBBER!" x={1050} y={810} lt={lt} at={cBec} tone="gold" size={36} />
        <Break lt={lt} at={brk} dur={2.4} />
      </Scene>
    );
  };
}
// Scene 7 — WOW card for INDIA: Assam, then Darjeeling and its GI seal.
function B6(ctx) {
  return ({ localTime: lt, duration }) => {
    const cWow = W("b6", "wow"), cAs = W("b6", "assam"), cLarge = W("b6", "largest"), cDar = W("b6", "darjeeling"), cMist = W("b6", "misty"), cFam = W("b6", "famous"), cFla = W("b6", "flavour"), cFirst = W("b6", "first"), cLab = W("b6", "label"), cOnly = W("b6", "only");
    const MX = 975, MY = 178, MS = 0.56, seal = pop(lt, cLab, 0.7);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[6]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(6, ctx, [L("ASSAM: the world's LARGEST tea-growing region by production", cAs, "big"), L("DARJEELING tea: famous worldwide for its flavour and aroma", cFam), L("In 2004: India's FIRST product with a GI tag", cFirst, "think")])}>
        <Pic slot="assam_valley" label="Tea gardens to the horizon, Brahmaputra valley, Assam" x={40} y={170} w={920} h={700} lt={lt} at={cAs} out={cDar} fx="pan" />
        <Chip text="ASSAM" x={500} y={190} lt={lt} at={cAs + 0.15} out={cDar} tone="gold" size={36} />
        <Chip text="the world's LARGEST tea-growing region" x={500} y={790} lt={lt} at={cLarge} out={cDar} size={32} />
        <Pic slot="darjeeling_hills" label="Misty Darjeeling hillsides with tea estates" x={40} y={170} w={920} h={700} lt={lt} at={cDar} fx="zoom" />
        <Chip text="DARJEELING" x={500} y={190} lt={lt} at={cDar + 0.15} tone="gold" size={36} />
        <Chip text="misty Himalayan hills" x={500} y={790} lt={lt} at={cMist} out={cFam} size={32} />
        <Chip text="special flavour and smell" x={500} y={790} lt={lt} at={cFla} out={cFirst} tone="cream" size={32} />
        <SVG op={out3(lt, cAs, 0.6) * (1 - reveal(lt, cFirst - 0.1, 0.4))}>
          <IndiaMini x={MX} y={MY} s={MS} lt={lt} dots={[{ lon: 92.9, lat: 26.2, op: 1 - reveal(lt, cDar, 0.4) }, { lon: 88.27, lat: 27.04, op: out3(lt, cDar, 0.5) }]} />
        </SVG>
        <Chip text="ASSAM" x={1310} y={268} lt={lt} at={cAs + 0.1} out={cDar} tone="gold" size={26} />
        <Chip text="DARJEELING" x={1250} y={258} lt={lt} at={cDar + 0.1} out={cFirst} tone="gold" size={26} />
        {/* the cup and the gold seal cover the map */}
        <Pic slot="darjeeling_cup" label="A cup of golden Darjeeling tea" x={985} y={170} w={415} h={400} lt={lt} at={cFirst} fx="pop" />
        {seal > 0 && <SVG op={Math.min(1, seal)}>
          <g transform={`translate(1192 700) scale(${seal}) rotate(${-8 + 3 * Math.sin(lt)})`}>
            {Array.from({ length: 16 }, (_, i) => <path key={i} transform={`rotate(${i * 22.5})`} d="M-22 -104 L 0 -130 L 22 -104 Z" fill={SK.gold} />)}
            <circle r={108} fill={SK.gold} stroke={SK.goldDeep} strokeWidth={6} />
            <circle r={90} fill="none" stroke={SK.ink} strokeWidth={3} />
            <text y={34} textAnchor="middle" fontFamily={SERIF} fontWeight="700" fontSize={92} fill={SK.ink}>GI</text>
          </g>
        </SVG>}
        <Chip text="can ONLY come from Darjeeling" x={500} y={790} lt={lt} at={cOnly} tone="gold" size={34} />
        <WowCard lt={lt} at={cWow} settle={cAs - 0.1} text="INDIA" />
      </Scene>
    );
  };
}
// Scene 8 — WOW card for the WORLD: the globe turns to Thailand, then to Côte d'Ivoire. Stop 3.
function B7(ctx) {
  return ({ localTime: lt, duration }) => {
    const cWow = W("b7", "wow"), cTh = W("b7", "thailand"), cOne = W("b7", "one"), cTy = W("b7", "tyres"), cGl = W("b7", "gloves"), cMore = W("b7", "more", 1), cWest = W("b7", "west"), cCi = W("b7", "cte"), cIv = W("b7", "ivory"), cTop = W("b7", "top"), at = stopStart("b7"), hold = holdOf("b7");
    const lon0 = 101 - 160 * (1 - drive(lt, cWow, cTh + 0.8)) - 106.5 * drive(lt, cWest - 0.2, cCi + 1.1);
    const main = 1 - reveal(lt, at - 0.4, 0.4), share = out3(lt, cOne, 1.4), a = -Math.PI / 2 + 2 * Math.PI / 3 * share, PX = 1200, PY = 330, PR = 140;
    const thOut = cWest - 0.1;
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[7]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(7, ctx, [L("THAILAND: the world's largest producer of natural rubber", cTh, "big"), L("About ONE THIRD of the world's supply", cOne), L("For tyres, gloves and more", cTy), L("CÔTE D'IVOIRE (Ivory Coast): Africa's top producer", cCi, "big"), L("Look around you…", at, "think")])}>
        <div style={{ position: "absolute", inset: 0, opacity: main }}>
          <SVG op={1}><Globe cx={245} cy={410} r={195} lon0={lon0} lt={lt} op={out3(lt, cWow, 0.6)} marks={[{ lon: 101, lat: 15, op: windowOp(lt, cTh, thOut + 0.2, 0.3) }, { lon: -5.5, lat: 7.5, op: out3(lt, cCi, 0.5) }]} /></SVG>
          <Chip text="THAILAND" x={245} y={640} lt={lt} at={cTh + 0.1} out={thOut} tone="gold" size={34} />
          <Chip text="CÔTE D'IVOIRE" x={245} y={640} lt={lt} at={cCi + 0.1} tone="gold" size={34} />
          <Chip text="the Ivory Coast" x={245} y={704} lt={lt} at={cIv} size={28} />
          <Pic slot="thai_rubber" label="Rows of rubber trees in Thailand" x={470} y={170} w={520} h={400} lt={lt} at={cTh} out={thOut} fx="zoom" />
          <EstateBadge x={530} y={232} s={0.6} lt={lt} at={cTh + 0.4} out={thOut} />
          <SVG op={windowOp(lt, cOne - 0.2, thOut + 0.3, 0.4)}>
            <circle cx={PX} cy={PY} r={PR} fill={SK.cream} />
            <path d={`M${PX} ${PY} L ${PX} ${PY - PR} A ${PR} ${PR} 0 0 1 ${PX + PR * Math.cos(a)} ${PY + PR * Math.sin(a)} Z`} fill={ORANGE} />
            <text x={PX} y={PY + PR + 46} textAnchor="middle" fontFamily={SERIF} fontWeight="700" fontSize={38} fill={SK.gold}>about ONE THIRD</text>
            <text x={PX} y={PY + PR + 80} textAnchor="middle" fontFamily={SANS} fontSize={25} fill={SK.white}>of the world's natural rubber</text>
          </SVG>
          <Node slot="item_tyres" label="tyres" x={560} y={720} r={100} lt={lt} at={cTy} out={thOut} size={28} tone="gold" />
          <Node slot="item_gloves" label="gloves" x={830} y={720} r={100} lt={lt} at={cGl} out={thOut} size={28} tone="gold" />
          <Node slot="item_balloons" label="balloons" x={1100} y={720} r={100} lt={lt} at={cMore} out={thOut} size={28} tone="gold" />
          <Pic slot="ivory_rubber" label="A rubber plantation in Côte d'Ivoire, West Africa" x={470} y={170} w={930} h={700} lt={lt} at={cWest} fx="zoom" />
          <Chip text="WEST AFRICA" x={935} y={190} lt={lt} at={cWest + 0.15} tone="gold" size={32} />
          <Chip text="Africa's TOP rubber producer" x={935} y={790} lt={lt} at={cTop} tone="gold" size={34} />
          <WowCard lt={lt} at={cWow} settle={cTh - 0.1} text="THE WORLD" />
        </div>
        <Pic slot="item_tyres" label="Tyres" x={40} y={60} w={670} h={420} lt={lt} at={at - 0.4} fx="zoom" kenDur={8} />
        <Pic slot="item_gloves" label="Rubber gloves" x={730} y={60} w={670} h={420} lt={lt} at={at - 0.4} fx="zoom" kenDur={8} />
        <StopShell lt={lt} at={at} hold={hold} heading="PAUSE AND DISCUSS" n={3} top={500} h={460}>
          <div style={{ ...stopText(50), marginTop: 36 }}>Look around you. What can you see that is made of rubber?</div>
        </StopShell>
      </Scene>
    );
  };
}
// Scene 9 — the horticulture basket fills; half to the local market, half onto a plane.
const HORT = [["hort_fruits", "FRUITS", "fruits"], ["hort_veg", "VEGETABLES", "vegetables"], ["hort_flowers", "FLOWERS", "flowers"], ["hort_spices", "SPICES", "spices"]];
function B8(ctx) {
  return ({ localTime: lt, duration }) => {
    const cH = W("b8", "horticulture"), ats = HORT.map((h) => W("b8", h[2])), cLoc = W("b8", "local"), cSent = W("b8", "sent"), BX = 720, BY = 680, xs = [190, 530, 880, 1220];
    const tiles = HORT.map((_, i) => ats[i] + 0.1);
    const go = (t) => Easing.easeInOutCubic(clamp((lt - t) / 1.4, 0, 1));
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[8]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(8, ctx, [L("HORTICULTURE", cH, "big"), L("Growing:", ats[0], "head"), L("FRUITS", ats[0]), L("VEGETABLES", ats[1]), L("FLOWERS", ats[2]), L("SPICES", ats[3]), L("For local needs AND international markets", cLoc, "think")], { max: 7 })}>
        <Big x={60} y={34} w={1000} lt={lt} at={cH} out={cLoc - 0.2} size={48} color={SK.gold}>Let's meet HORTICULTURE</Big>
        {HORT.map(([s, lab], i) => <Fall key={s} slot={s} label={lab} x0={xs[i]} y0={260} x1={BX} y1={BY - 70} lt={lt} at={tiles[i]} t0={tiles[i] + 1.25} />)}
        <Pic slot="local_market" label="The local market" x={40} y={70} w={590} h={380} lt={lt} at={cLoc} fx="zoom" />
        <Chip text="our LOCAL MARKETS" x={335} y={90} lt={lt} at={cLoc + 0.15} tone="gold" size={30} />
        <Pic slot="cargo_plane" label="Fresh crops fly to other countries" x={810} y={70} w={590} h={380} lt={lt} at={cSent} fx="zoom" />
        <Chip text="to OTHER COUNTRIES" x={1105} y={90} lt={lt} at={cSent + 0.15} tone="gold" size={30} />
        <SVG op={1}>
          <Arr x1={BX - 170} y1={BY - 40} x2={lerp(BX - 170, 380, out3(lt, cLoc, 0.5))} y2={lerp(BY - 40, 470, out3(lt, cLoc, 0.5))} lt={lt} at={cLoc} sw={9} />
          <Arr x1={BX + 170} y1={BY - 40} x2={lerp(BX + 170, 1060, out3(lt, cSent, 0.5))} y2={lerp(BY - 40, 470, out3(lt, cSent, 0.5))} lt={lt} at={cSent} sw={9} />
        </SVG>
        <HortBasket cx={BX} cy={BY} s={1} lt={lt} at={cH + 0.2} glow={0.6 * reveal(lt, ats[3] + 1.2, 0.4)} items={HORT_ITEMS(0).map((it, i) => ({ ...it, at: tiles[Math.floor(i / 2)] + 1.8 + (i % 2) * 0.2 }))} />
        {/* two small baskets: half to market, half to the plane */}
        <HortBasket cx={lerp(BX - 150, 380, go(cLoc + 0.3))} cy={lerp(BY - 30, 520, go(cLoc + 0.3))} s={0.34} lt={lt} at={cLoc + 0.3} label={false} op={1 - reveal(lt, cLoc + 1.6, 0.3)} items={HORT_ITEMS(cLoc).slice(0, 4)} />
        <HortBasket cx={lerp(BX + 150, 1060, go(cSent + 0.3))} cy={lerp(BY - 30, 520, go(cSent + 0.3))} s={0.34} lt={lt} at={cSent + 0.3} label={false} op={1 - reveal(lt, cSent + 1.6, 0.3)} items={HORT_ITEMS(cSent).slice(4)} />
      </Scene>
    );
  };
}
// Scene 10 — soil cut-away: fertile, well drained; sun and calendar; Stop 4 (the sorting game).
const SORT = [["tea_leaves", "Tea"], ["mango_close", "Mango"], ["rubber_latex", "Rubber"], ["rose_close", "Rose"], ["coffee_cherries", "Coffee"], ["cardamom_close", "Cardamom"]];
function B9(ctx) {
  return ({ localTime: lt, duration }) => {
    const cF = W("b9", "fertile"), cW = W("b9", "well"), cSt = W("b9", "stand"), cRo = W("b9", "roots"), cCl = W("b9", "climate"), cRg = W("b9", "regular"), at = stopStart("b9"), hold = holdOf("b9");
    const X0 = 580, X1 = 1400, GY = 370, BOT = 880, TX = 950, flow = out3(lt, cF, 0.6), main = 1 - reveal(lt, at - 0.4, 0.4), sOp = windowOp(lt, at - 0.3, at + hold + 0.4, 0.35);
    const pebbles = Array.from({ length: 30 }, (_, i) => [X0 + 20 + (i * 137) % (X1 - X0 - 40), 745 + (i * 53) % 118, 8 + (i * 7) % 9]);
    const specks = Array.from({ length: 40 }, (_, i) => [X0 + 20 + (i * 113) % (X1 - X0 - 40), GY + 24 + (i * 71) % 330]);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[9]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(9, ctx, [L("HORTICULTURE NEEDS:", cF, "head"), L("FERTILE soil", cF), L("WELL-DRAINED soil: water does not stand", cW), L("The right CLIMATE", cCl), L("A REGULAR supply of water", cRg), L("HAVE YOU UNDERSTOOD?", at, "head")], { max: 6 })}>
        <div style={{ position: "absolute", inset: 0, opacity: main }}>
          <Pic slot="orchard" label="An orchard of fruit trees" x={40} y={60} w={520} h={400} lt={lt} at={0.1} fx="zoom" />
          <Pic slot="drip_close" label="A drip pipe waters the soil" x={40} y={480} w={520} h={400} lt={lt} at={cRg} fx="zoom" />
          <Chip text="REGULAR water" x={300} y={810} lt={lt} at={cRg + 0.2} tone="gold" size={30} />
          <SVG op={flow}>
            <rect x={X0} y={60} width={X1 - X0} height={GY - 60} rx={20} fill="rgba(160,205,235,0.25)" />
            <rect x={X0} y={GY} width={X1 - X0} height={BOT - GY} rx={20} fill="#2E2016" stroke="rgba(255,255,255,0.3)" strokeWidth={3} />
            <rect x={X0} y={735} width={X1 - X0} height={BOT - 735} rx={20} fill="#6B5A48" />
            {pebbles.map(([x, y, r], i) => <ellipse key={i} cx={x} cy={y} rx={r + 4} ry={r} fill={i % 2 ? "#8E7C68" : "#A0917E"} />)}
            {specks.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={4} fill={SK.gold} opacity={0.7 * out3(lt, cF + i * 0.02, 0.5)} />)}
            {/* the tree */}
            <g transform={`translate(${TX} ${GY})`}>
              {[[-120, 170], [-60, 250], [10, 300], [80, 240], [140, 160]].map(([dx, d], i) => <path key={i} d={`M0 0 Q ${dx * 0.4} ${d * 0.5} ${dx} ${d}`} stroke="#C9B48A" strokeWidth={8 - i * 0.6} fill="none" strokeLinecap="round" />)}
              <rect x={-16} y={-110} width={32} height={110} rx={8} fill="#6E4A2E" />
              <circle cx={-66} cy={-150} r={62} fill="#3F8F4A" /><circle cx={66} cy={-150} r={62} fill="#3F8F4A" /><circle cx={0} cy={-190} r={72} fill="#4BA155" />
              {[[-84, -150], [-30, -180], [36, -210], [84, -150], [18, -130]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={15} fill="#F2A33A" stroke="#B4701A" strokeWidth={2} />)}
            </g>
            {/* drip pipe + water that soaks in, passes the roots and drains away */}
            <rect x={X0 + 10} y={GY - 14} width={X1 - X0 - 20} height={14} rx={7} fill="#1E2A24" />
            {[760, 1130, 1270].map((x, k) => lt > cF + 0.3 && <circle key={x} cx={x} cy={GY - 2 + ((lt * 0.9 + k * 0.3) % 1) * 14} r={7} fill={WATER} />)}
            {lt > cW && Array.from({ length: 21 }, (_, i) => { const p = ((lt * 0.28 + i * 0.1427) % 1), x = [760, 1130, 1270][i % 3] + 26 * Math.sin(i * 2.1 + p * 6), y = lerp(GY + 4, BOT - 10, p);
              return <circle key={i} cx={x} cy={y} r={8} fill={WATER} opacity={Math.min(1, (lt - cW) * 2) * (1 - Math.max(0, (p - 0.8) * 5))} />; })}
            {lt > cSt && <g opacity={out3(lt, cSt, 0.4)}>{[0, 1, 2].map((i) => { const y = 780 + ((lt * 0.6 + i * 0.33) % 1) * 70, x = 1340; return <path key={i} d={`M${x - 16} ${y} L ${x} ${y + 18} L ${x + 16} ${y}`} stroke={SK.white} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.85} />; })}</g>}
            {/* sun + calendar: the right season */}
            {out3(lt, cCl, 0.5) > 0 && <g opacity={out3(lt, cCl, 0.5)}>
              <g transform="translate(1320 130)"><circle r={40} fill={SK.gold} />{[0, 1, 2, 3, 4, 5, 6, 7].map((i) => { const a = i * Math.PI / 4 + lt * 0.4; return <line key={i} x1={52 * Math.cos(a)} y1={52 * Math.sin(a)} x2={70 * Math.cos(a)} y2={70 * Math.sin(a)} stroke={SK.gold} strokeWidth={7} strokeLinecap="round" />; })}</g>
              <g transform="translate(1130 76)"><rect width={110} height={110} rx={12} fill={SK.cream} /><rect width={110} height={30} rx={12} fill="#B3261E" /><rect y={20} width={110} height={12} fill="#B3261E" />
                {[0, 1, 2].map((r) => [0, 1, 2, 3].map((c) => <rect key={r + "-" + c} x={14 + c * 22} y={46 + r * 18} width={14} height={11} rx={2} fill={r === 1 && c === 2 ? SK.gold : "#C8C2B0"} />))}</g>
            </g>}
          </SVG>
          <Chip text="FERTILE soil" x={1120} y={392} lt={lt} at={cF + 0.1} tone="gold" size={30} />
          <Chip text="WELL-DRAINED" x={700} y={670} lt={lt} at={cW} tone="gold" size={30} />
          <Chip text="water drains away below the roots" x={1090} y={684} lt={lt} at={cRo} size={26} />
          <Chip text="the right CLIMATE" x={715} y={84} lt={lt} at={cCl} tone="gold" size={30} />
        </div>
        <StopShell lt={lt} at={at} hold={hold} heading="HAVE YOU UNDERSTOOD?" n={4}>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 44, color: SK.gold, marginTop: 16 }}>Plantation or horticulture?</div>
        </StopShell>
        {sOp > 0 && <SVG op={sOp}><EstateMark x={230} y={560} s={1.75} label={false} /><T x={230} y={740} size={36} bold serif color={SK.gold}>PLANTATION</T></SVG>}
        <HortBasket cx={1195} cy={570} s={0.82} lt={lt} at={at - 0.3} op={sOp} items={HORT_ITEMS(at - 0.3)} />
        {SORT.map(([s, lab], i) => { const o = pop(lt, at + 0.2 + i * 0.12, 0.5) * sOp; if (o <= 0) return null; const x = 500 + (i % 3) * 225, y = 380 + Math.floor(i / 3) * 265 + 8 * Math.sin(lt * 2 + i);
          return <React.Fragment key={s}>
            <Pic slot={s} label={lab} x={x - 88} y={y - 88} w={176} h={176} r={88} lt={lt} at={at} fx="none" op={Math.min(1, o)} style={{ boxShadow: "0 0 0 4px " + SK.cream }} />
            <Chip text={lab} x={x} y={y + 96} lt={lt} at={at + 0.3 + i * 0.12} size={28} op={sOp} />
          </React.Fragment>; })}
      </Scene>
    );
  };
}
// Scene 11 — the answer (back to the two farms), then Stop 5: the quick check.
const QUICK = ["What is a plantation crop?", "Name three plantation crops.", "What four jobs do plantation workers do?", "What is horticulture?", "Which Indian state is the world's largest tea-growing region?"];
function B10(ctx) {
  return ({ localTime: lt, duration }) => {
    const cSo = W("b10", "so"), cHuge = W("b10", "huge"), cSell = W("b10", "sell"), cFac = W("b10", "factories"), cWarm = W("b10", "warm"), cMany = W("b10", "many"), cHort = W("b10", "horticulture"), cFr = W("b10", "fruits"), at = stopStart("b10"), hold = holdOf("b10");
    const main = 1 - reveal(lt, at - 0.4, 0.4), R = 40;
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[10]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(10, ctx, [L("ANSWER", cSo, "head"), L("PLANTATIONS are HUGE", cHuge), L("Grown to SELL to industries and the world", cSell), L("Need warm, wet weather and MANY workers", cWarm),
          L("HORTICULTURE brings us fruits, vegetables, flowers and spices", cHort, "big"), L("QUICK CHECK", at, "head"), L("Compare with your differences from Stop 1", at + 0.3, "think")], { max: 6 })}>
        <div style={{ position: "absolute", inset: 0, opacity: main }}>
          <Pic slot="small_farm" label="The small family farm" x={R} y={60} w={420} h={560} lt={lt} at={0.1} fx="zoom" />
          <Pic slot="tea_estate" label="The tea estate" x={R + 440} y={60} w={920} h={560} lt={lt} at={0.3} fx="zoom" />
          <EstateBadge x={1320} y={140} s={0.8} lt={lt} at={cSo} />
          <Chip text="huge area" x={700} y={90} lt={lt} at={cHuge} tone="gold" size={36} />
          <Chip text="grown to sell" x={1040} y={170} lt={lt} at={cSell} tone="gold" size={36} />
          <Chip text="factories and the world" x={760} y={440} lt={lt} at={cFac} tone="gold" size={36} />
          <Chip text="warm, wet weather" x={1140} y={320} lt={lt} at={cWarm} size={32} />
          <Chip text="many workers" x={1180} y={530} lt={lt} at={cMany} tone="gold" size={36} />
          <Pic slot="orchard" label="An orchard of fruit trees" x={R} y={640} w={670} h={240} lt={lt} at={cHort} fx="pan" />
          <Pic slot="flower_field" label="A flower field" x={730} y={640} w={670} h={240} lt={lt} at={cHort + 0.3} fx="pan" />
          <HortBasket cx={720} cy={770} s={0.5} lt={lt} at={cFr} label={false} items={HORT_ITEMS(cFr)} />
        </div>
        <StopShell lt={lt} at={at} hold={hold} heading="QUICK CHECK" n={5}>
          {QUICK.map((q, i) => <div key={i} style={{ display: "flex", gap: 22, alignItems: "baseline", marginTop: i === 0 ? 40 : 26, opacity: out3(lt, at + 0.2 + i * 0.25, 0.5) }}>
            <span style={{ flex: "none", width: 44, fontFamily: SERIF, fontWeight: 700, fontSize: 40, color: SK.gold }}>{i + 1}</span>
            <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 38, color: SK.white, background: "rgba(255,255,255,0.08)", padding: "8px 24px", borderRadius: 16 }}>{q}</span></div>)}
        </StopShell>
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
const COLLAGE = [{ slot: "tea_garden", x: -60, y: -40, w: 760, h: 520, ph: 0 }, { slot: "coffee_cherries", x: 640, y: -80, w: 760, h: 520, ph: 2 },
  { slot: "orchard", x: -80, y: 520, w: 700, h: 560, ph: 4 }, { slot: "tea_leaves", x: 560, y: 560, w: 820, h: 560, ph: 1 }];
function PlantScenes(props = {}) {
  const caps = props.showCaptions === "false" ? false : props.showCaptions !== false;
  const titles = {};
  for (let n = 1; n <= NB; n++) titles[n] = str(props["title" + n + "Text"], TITLES[n]);
  const ctx = { caps, titles, capSize: num(props.captionSize, 34) };
  const B = [B1, B2, B3, B4, B5, B6, B7, B8, B9, B10];
  const beats = B.map((Bn, i) => { const t = BEAT("b" + (i + 1)); return [t.start, t.start + t.dur, Bn]; });
  return (
    <StoryFrame props={props} dur={DUR} persistKey="thinkpro-lp11-plantation-crops-and-horticulture" collage={COLLAGE}>
      {beats.map(([s, e, Bn], i) => (
        <Sprite key={i} start={s} end={e}>{Bn(ctx)}</Sprite>
      ))}
      {STOPS.map(([b, i, hold]) => <StopAt key={b} t={BEAT(b).start + stopAt(b, i)} hold={hold - 0.2} />)}
      <ChimeAt t={BEAT("b5").start + BRK() + 1.2} />
      <AudioSync />
    </StoryFrame>
  );
}
window.PlantScenes = PlantScenes;
