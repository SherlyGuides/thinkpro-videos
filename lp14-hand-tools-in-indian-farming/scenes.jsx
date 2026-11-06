/* global React, window */
// ThinkPro Academy — "Hand Tools in Indian Farming" (Grade 6 Agriculture, Session 14, V1).
// After AG_G6_S14 Video Script Draft 1 (Subrata, 4 Nov 2026): 10 script scenes as 9 voiced beats
// (script scene 6, the silent leaf break, is the tail of b5 after Stop 3), four presenter stops
// (TPStory.StopAt: the web player freezes, the export holds the card), one WOW card (b6).
// Central model: the TOOL RACK of six drawn hand tools in the corner of the photo area; each lights
// when it is named, the job labels hide for the matching game at Stop 2. Everything local to this
// file is drawn flat: tools, the rack, the world dot map, the harvester, the safety card.
// STORY STYLE (engine/story-kit.jsx). Pure function of time.
const { Sprite } = window;
const { reveal, windowOp } = window.TPMotion;
const { num, str } = window.TPStage;
const { SK, SERIF, SANS, LEFT_W, pop, out3, lerp, drive,
  Pic, Chip, Badge, Big, Card, SVG, Arrow, T, ChimeAt, Scene, StoryFrame, StopAt, Break } = window.TPStory;

// ---- Timing: EVERYTHING is keyed to the narration (tools/fit_timing.py → timing.js).
const TM = window.TP_TIMING;
if (!TM) console.error("timing.js missing — run: python3 tools/fit_timing.py videos/lp14-hand-tools-in-indian-farming");
const LEAD = TM ? TM.lead : 1.0;
const DUR = TM ? TM.total : 215;
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
const NB = 9;
const CAPS = {};
if (TM) for (let n = 1; n <= NB; n++) CAPS[n] = capsFor("b" + n);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// ---- Panel copy. Title defaults mirror the DC data-props (titleNText) — keep in sync. ----
const TITLES = { 1: "LP14 – Hand Tools in Indian Farming", 2: "Hand tools hold their ground", 3: "Six hand tools", 4: "Where hand tools win",
  5: "Hand tool super-powers", 6: "WOW! Sickle and kama", 7: "The same clever answer", 8: "The journey", 9: "The answer – and stay safe" };
const KICK = "Grade 6 · Agriculture · Session 14";
const KICKS = { 6: "WOW fact", 7: "WOW fact" };
const panel = (n, ctx, lines, extra = {}) => ({ kicker: KICKS[n] || KICK, title: ctx.titles[n], lines, ...extra });
const L = (text, at, kind = "item", extra = {}) => ({ text, at, kind, ...extra });

// ---- Presenter stops: [beat, sentence index whose pauseAfter holds it, hold s, question]
const STOPS = [
  ["b1", 6, 5.0, "Why might a farmer choose the khurpi? Make a guess."],
  ["b3", 12, 6.0, "Match each tool to its job:"],
  ["b5", 5, 6.0, "Compare the khurpi and the tractor. Which is better for a small vegetable garden? Why?"],
  ["b9", 8, 8.0, null],   // quick check card
];
const QUICK = ["Name four hand tools and their jobs.", "Where are hand tools better than machines?", "Give two reasons hand tools are useful.",
  "Which Japanese tool looks like the Indian sickle?", "Why do you think farmers far apart made similar tools?"];
const stopAt = (b, i) => SE(b, i) + 0.1;                       // beat-local start of the hold
const stopFor = (b) => STOPS.find((s) => s[0] === b);
// Stop card with its own heading and a box, so the thing being discussed can stay in view.
function StopBox({ lt, b, heading = "PAUSE AND DISCUSS", box = {}, qSize = 56, children }) {
  const s = stopFor(b), at = stopAt(b, s[1]), hold = s[2] - 0.2, n = STOPS.indexOf(s) + 1;
  const o = windowOp(lt, at, at + hold + 0.4, 0.35); if (o <= 0) return null;
  const { x = 40, y = 60, w = LEFT_W - 80, h = 880, pad = 44 } = box;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 26, background: "#07221A", opacity: o, zIndex: 3,
      boxShadow: "0 0 0 3px rgba(226,176,76,0.9)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: pad, boxSizing: "border-box", textAlign: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
        <svg width="64" height="64" viewBox="0 0 90 90"><circle cx="45" cy="45" r="43" fill={SK.gold} /><rect x="28" y="24" width="12" height="42" rx="4" fill={SK.ink} /><rect x="50" y="24" width="12" height="42" rx="4" fill={SK.ink} /></svg>
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 32, letterSpacing: "0.08em", color: SK.ink, background: SK.gold, padding: "10px 30px", borderRadius: 14 }}>{heading}</div>
      </div>
      {s[3] && <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: qSize, lineHeight: 1.2, color: SK.white, marginTop: 30 }}>{s[3]}</div>}
      {children}
      <div style={{ fontFamily: SANS, fontSize: 26, color: SK.dim, marginTop: 26 }}>Stop {n} of {STOPS.length}</div>
    </div>
  );
}

// ---- Drawn tools --------------------------------------------------------------------
const WOOD = "#9C6B3E", WOOD_D = "#6E4626", STONE = "#B9B2A6", STONE_D = "#7E776C", IRON = "#5D6670", IRON_D = "#2E343A", STEEL = "#C9D2DA", STEEL_D = "#7F8C96", RED = "#D23A2E", ORANGE = "#F07A1A";
const BLADE = "M0 0 C 40 -150, 220 -170, 250 -40 C 210 -120, 70 -110, 22 6 Z";
const KAMA_BLADE = "M0 0 C 34 -128, 214 -162, 256 -52 C 200 -112, 72 -100, 22 6 Z";
// Sickle, side view, handle down. kind: stone (wood with flint teeth) | iron | steel.
function Sickle({ x = 0, y = 0, s = 1, kind = "steel", glow = 0, op = 1, rot = 0 }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={op}>
      {glow > 0 && <path d={BLADE} fill="none" stroke={SK.gold} strokeWidth={24} opacity={0.75 * glow} strokeLinejoin="round" />}
      <rect x={-18} y={-4} width={36} height={130} rx={14} fill={WOOD} transform="rotate(-12)" />
      {kind === "stone"
        ? <g><path d={BLADE} fill={WOOD_D} />
            {Array.from({ length: 7 }, (_, i) => { const t = 0.12 + i * 0.12, bx = lerp(24, 236, t), by = -40 - 92 * Math.sin(Math.PI * t) + 26;
              return <path key={i} d={`M${bx - 13} ${by} L${bx} ${by + 22} L${bx + 13} ${by} Z`} fill={STONE} stroke={STONE_D} strokeWidth={2} />; })}</g>
        : <path d={BLADE} fill={kind === "iron" ? IRON : STEEL} stroke={kind === "iron" ? IRON_D : STEEL_D} strokeWidth={3} />}
    </g>
  );
}
function Kama({ x = 0, y = 0, s = 1, glow = 0, op = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
      {glow > 0 && <path d={KAMA_BLADE} fill="none" stroke={SK.gold} strokeWidth={24} opacity={0.75 * glow} strokeLinejoin="round" />}
      <rect x={-13} y={-4} width={26} height={180} rx={10} fill="#C79A5B" transform="rotate(-8)" />
      <path d={KAMA_BLADE} fill="#E8EEF2" stroke={STEEL_D} strokeWidth={3} />
    </g>
  );
}
// The six rack tools, drawn upright around (0,0), about 200 px tall at s = 1.
function HandTool({ kind, s = 1 }) {
  const g = (c) => <g transform={`scale(${s})`}>{c}</g>;
  if (kind === "spade") return g(<g><rect x={-7} y={-96} width={14} height={130} fill={WOOD} /><rect x={-28} y={-108} width={56} height={15} rx={7} fill={WOOD_D} />
    <path d="M-38 30 L38 30 L38 66 Q 26 96 0 106 Q -26 96 -38 66 Z" fill={STEEL} stroke={STEEL_D} strokeWidth={3} /></g>);
  if (kind === "hoe") return g(<g><rect x={-6} y={-108} width={12} height={196} rx={5} fill={WOOD} />
    <path d="M-10 76 L10 76 L8 92 L-58 112 L-70 84 Z" fill={IRON} stroke={IRON_D} strokeWidth={3} /></g>);
  if (kind === "sickle") return <Sickle x={-92 * s} y={22 * s} s={0.74 * s} kind="iron" />;
  if (kind === "khurpi") return g(<g><rect x={-15} y={-100} width={30} height={84} rx={12} fill={WOOD} /><rect x={-5} y={-18} width={10} height={36} fill={IRON_D} />
    <path d="M-34 18 Q 0 4 34 18 L 10 92 L0 104 L -10 92 Z" fill={IRON} stroke={IRON_D} strokeWidth={3} /></g>);
  if (kind === "shears") return g(<g>
    <path d="M6 6 Q 30 -48 16 -104 Q -8 -62 -8 2 Z" fill={STEEL} stroke={STEEL_D} strokeWidth={3} /><path d="M-6 6 Q -30 -48 -16 -104 Q 8 -62 8 2 Z" fill="#E8EEF2" stroke={STEEL_D} strokeWidth={3} />
    <path d="M6 2 Q 22 40 42 104" stroke={RED} strokeWidth={15} strokeLinecap="round" fill="none" /><path d="M-6 2 Q -22 40 -42 104" stroke={RED} strokeWidth={15} strokeLinecap="round" fill="none" />
    <circle r={9} fill={IRON_D} /></g>);
  if (kind === "drill") return g(<g><line x1={-10} y1={60} x2={46} y2={-96} stroke={WOOD} strokeWidth={10} strokeLinecap="round" /><line x1={26} y1={-102} x2={66} y2={-88} stroke={WOOD_D} strokeWidth={12} strokeLinecap="round" />
    <path d="M-44 -6 L28 -6 L14 44 L-30 44 Z" fill="#3E8F5E" stroke="#1F5E3A" strokeWidth={3} /><rect x={-11} y={44} width={10} height={40} fill={IRON} />
    <circle cx={-6} cy={78} r={30} fill={IRON_D} /><circle cx={-6} cy={78} r={15} fill={STEEL} /><circle cx={-6} cy={78} r={5} fill={IRON_D} /></g>);
  return null;
}
const TOOLS = [["spade", "SPADE", "digging"], ["hoe", "HOE", "loosening, weeding"], ["sickle", "SICKLE", "harvesting"],
  ["khurpi", "KHURPI", "weeding"], ["shears", "PRUNING SHEARS", "cutting branches"], ["drill", "HAND SEED DRILL", "planting in rows"]];

// ---- The central model: the tool rack ---------------------------------------------------
// on[i] = time tool i lights; jobs = opacity of the job labels (0 hides them for the matching game).
function Rack({ x, y, w, h, lt, on, jobs = 1, at = 0, out = null, jobOn = null }) {
  const o = out3(lt, at, 0.6) * (out != null ? 1 - reveal(lt, out, 0.4) : 1); if (o <= 0) return null;
  const cw = w / 2, rows = 3, ch = (h - 24) / rows;
  const cur = on.reduce((a, t, i) => (lt >= t ? i : a), -1);
  return (
    <SVG op={o}>
      <rect x={x} y={y} width={w} height={h} rx={16} fill="#4B3122" stroke="rgba(255,255,255,0.45)" strokeWidth={3} />
      {[1, 2, 3].map((k) => <line key={k} x1={x + (w * k) / 4} y1={y + 6} x2={x + (w * k) / 4} y2={y + h - 6} stroke="rgba(0,0,0,0.20)" strokeWidth={3} />)}
      {[0, 1, 2].map((r) => <rect key={r} x={x + 12} y={y + 14 + r * ch} width={w - 24} height={13} rx={6} fill={WOOD} stroke={WOOD_D} strokeWidth={2} />)}
      {TOOLS.map(([k, name, job], i) => {
        const c = i % 2, r = Math.floor(i / 2), cx = x + cw * (c + 0.5), top = y + 12 + r * ch, v = out3(lt, on[i], 0.5), now = i === cur;
        const pulse = now && lt < on[i] + 3 ? Math.sin(Math.PI * clamp((lt - on[i]) / 3, 0, 1)) : 0;
        const jo = jobs * (jobOn ? out3(lt, jobOn[i], 0.5) : 1);
        return <g key={k}>
          {v > 0 && <rect x={cx - cw / 2 + 8} y={top + 2} width={cw - 16} height={ch - 8} rx={14} fill={SK.gold} opacity={0.14 * v + 0.42 * pulse} />}
          <circle cx={cx} cy={top + 10} r={7} fill={SK.gold} opacity={0.5 + 0.5 * v} />
          <g transform={`translate(${cx} ${top + 96})`} opacity={0.38 + 0.62 * v}><HandTool kind={k} s={0.72} /></g>
          <text x={cx} y={top + 196} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={k === "drill" || k === "shears" ? 20 : 24} fill={v > 0.4 ? SK.white : "rgba(255,255,255,0.55)"}>{name}</text>
          <text x={cx} y={top + 222} textAnchor="middle" fontFamily={SANS} fontSize={20} fill={SK.gold} opacity={jo}>{job}</text>
        </g>;
      })}
    </SVG>
  );
}
const ALL_ON = [0, 0, 0, 0, 0, 0];

// ---- Other drawings ----------------------------------------------------------------------
function NoSign({ cx, cy, r = 62, op = 1, s = 1 }) {
  if (op <= 0) return null;
  return <g opacity={op} transform={`translate(${cx} ${cy}) scale(${s})`}><circle r={r} fill="rgba(255,255,255,0.0)" stroke={RED} strokeWidth={13} /><line x1={-r * 0.7} y1={-r * 0.7} x2={r * 0.7} y2={r * 0.7} stroke={RED} strokeWidth={13} strokeLinecap="round" /></g>;
}
function Tractor({ s = 1 }) {
  return <g transform={`scale(${s})`}><rect x={-44} y={-20} width={56} height={30} rx={6} fill="#C8352B" /><rect x={-6} y={-46} width={30} height={30} rx={4} fill="#C8352B" stroke="#7A1E18" strokeWidth={3} />
    <rect x={0} y={-40} width={18} height={16} fill="#BFE3F7" /><line x1={-34} y1={-20} x2={-34} y2={-44} stroke="#333" strokeWidth={5} />
    <circle cx={12} cy={22} r={26} fill="#222" /><circle cx={12} cy={22} r={10} fill={SK.gold} /><circle cx={-34} cy={28} r={16} fill="#222" /><circle cx={-34} cy={28} r={6} fill={SK.gold} /></g>;
}
function Pump({ x, y, s = 1 }) {
  return <g transform={`translate(${x} ${y}) scale(${s})`}><rect x={-46} y={-62} width={70} height={124} rx={8} fill={SK.cream} /><rect x={-34} y={-50} width={46} height={34} rx={4} fill="#7FB6D6" />
    <rect x={-58} y={62} width={94} height={12} rx={4} fill={SK.cream} /><path d="M24 -24 L52 -24 L52 34 Q 52 46 42 46" fill="none" stroke={SK.cream} strokeWidth={8} strokeLinecap="round" /></g>;
}
function Plug({ x, y, s = 1 }) {
  return <g transform={`translate(${x} ${y}) scale(${s})`}><rect x={-60} y={-60} width={120} height={120} rx={20} fill={SK.cream} />
    {[[-24, -18], [24, -18], [0, 24]].map(([a, b], i) => <circle key={i} cx={a} cy={b} r={13} fill={SK.ink} />)}</g>;
}
// Flat combine harvester with the curved blades of its cutter on show.
function Harvester({ x, y, s = 1, glow = 0 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-20} y={-58} width={150} height={74} rx={10} fill="#C8352B" /><rect x={-10} y={-104} width={70} height={50} rx={6} fill="#C8352B" stroke="#7A1E18" strokeWidth={3} />
      <rect x={0} y={-96} width={50} height={32} fill="#BFE3F7" /><rect x={80} y={-90} width={50} height={34} rx={6} fill="#A92A21" />
      <circle cx={18} cy={32} r={38} fill="#222" /><circle cx={18} cy={32} r={15} fill={SK.gold} /><circle cx={118} cy={38} r={24} fill="#222" /><circle cx={118} cy={38} r={9} fill={SK.gold} />
      <rect x={-120} y={-12} width={112} height={16} fill={IRON} transform="rotate(10 -8 -4)" />
      <circle cx={-132} cy={8} r={44} fill="none" stroke="#E2C46A" strokeWidth={7} />
      {[0, 60, 120, 180, 240, 300].map((a) => <line key={a} x1={-132} y1={8} x2={-132 + 44 * Math.cos(a * Math.PI / 180)} y2={8 + 44 * Math.sin(a * Math.PI / 180)} stroke="#E2C46A" strokeWidth={5} />)}
      {[0, 1, 2, 3].map((i) => <path key={i} d="M0 0 C 4 -16, 26 -20, 32 -6 C 24 -12, 10 -10, 4 2 Z" transform={`translate(${-192 + i * 32} 56)`} fill={STEEL} stroke={glow > 0 ? SK.gold : STEEL_D} strokeWidth={2 + 6 * glow} />)}
    </g>
  );
}

// ---- World dot map: hand-traced rough continents, drawn as dots (never a generated map). --------
const LAND = [
  [[-166,64],[-157,71],[-128,70],[-110,72],[-90,72],[-82,68],[-94,60],[-82,54],[-78,62],[-66,60],[-56,52],[-66,45],[-70,42],[-76,35],[-81,30],[-80,25],[-83,29],[-90,29],[-97,27],[-97,20],[-90,21],[-87,16],[-83,10],[-79,8],[-85,11],[-95,16],[-105,20],[-112,30],[-117,33],[-124,40],[-124,48],[-132,56],[-150,60],[-160,56]],
  [[-44,60],[-22,70],[-22,78],[-60,79],[-70,76],[-52,68]],
  [[-80,8],[-72,12],[-60,9],[-50,0],[-35,-6],[-39,-16],[-48,-25],[-57,-36],[-65,-42],[-68,-52],[-74,-50],[-72,-30],[-70,-18],[-80,-6]],
  [[-17,15],[-16,22],[-9,31],[-5,36],[10,37],[11,33],[20,31],[32,31],[35,27],[39,15],[44,11],[51,12],[42,-2],[39,-10],[36,-20],[33,-27],[26,-34],[18,-34],[13,-20],[13,-8],[9,0],[9,4],[-4,5],[-12,8]],
  [[-9,37],[-9,43],[-2,44],[-4,48],[3,51],[8,54],[5,59],[6,62],[14,68],[26,71],[40,67],[60,69],[70,73],[100,77],[113,74],[140,73],[170,70],[180,68],[178,62],[165,60],[162,55],[156,52],[156,58],[142,59],[135,54],[141,48],[130,42],[127,35],[125,39],[121,40],[119,35],[122,30],[118,24],[110,21],[106,19],[109,13],[105,9],[101,13],[103,3],[98,8],[97,16],[91,22],[87,21],[80,15],[78,8],[73,17],[72,21],[67,24],[57,25],[60,22],[52,16],[43,13],[35,28],[35,36],[27,37],[26,40],[23,38],[19,42],[13,45],[16,40],[9,44],[3,43],[0,39],[-5,36]],
  [[129,30],[136,33],[142,35],[143,41],[146,43],[142,46],[138,39],[131,35]], [[-6,50],[1,51],[0,54],[-3,58],[-6,57]],
  [[114,-22],[122,-18],[130,-12],[136,-12],[140,-17],[145,-15],[153,-26],[150,-37],[140,-38],[131,-32],[116,-34]],
  [[109,1],[117,7],[118,1],[115,-4],[110,-2]], [[95,5],[104,-3],[106,-6],[101,-3]], [[131,-1],[141,-3],[150,-10],[140,-8]], [[44,-16],[49,-12],[50,-16],[46,-25],[44,-22]], [[120,18],[122,18],[125,7],[122,8]],
];
const inPoly = (x, y, p) => { let c = false; for (let i = 0, j = p.length - 1; i < p.length; j = i++) { const [xi, yi] = p[i], [xj, yj] = p[j]; if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; } return c; };
const MK = 3.84, MX = 50, MY = 66, ml = (lon) => MX + (lon + 170) * MK, mt = (lat) => MY + (78 - lat) * MK;
const DOTS = []; for (let lat = 78; lat > -56; lat -= 3) for (let lon = -170; lon < 180; lon += 3) if (LAND.some((p) => inPoly(lon, lat, p))) DOTS.push([ml(lon), mt(lat)]);
const DOT_EL = DOTS.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={4.6} fill="#8BD48A" opacity={0.42} />);
const PINS = [[-100, 21], [-75, -10], [2, 46], [31, 27], [39, 8], [105, 32], [78, 22, "INDIA"], [138, 37, "JAPAN"]];

// Photo with a Chip name at its foot.
const Shot = ({ slot, label, x, y, w, h, lt, at, chip, chipAt, tone = "gold", size = 26, out = null, fx = "zoom", pos }) => <React.Fragment>
  <Pic slot={slot} label={label} x={x} y={y} w={w} h={h} lt={lt} at={at} out={out} fx={fx} pos={pos} />
  {chip && <Chip text={chip} x={x + w / 2} y={y + h - 58} lt={lt} at={chipAt != null ? chipAt : at + 0.2} out={out} tone={tone} size={size} />}
</React.Fragment>;
const Ticks = ({ x, y, w, lt, items, size = 42, gap = 12 }) => <div style={{ position: "absolute", left: x, top: y, width: w }}>
  {items.map(([text, at, gold], i) => { const o = out3(lt, at, 0.5); if (o <= 0) return null;
    return <div key={i} style={{ opacity: o, transform: `translateY(${(1 - o) * 10}px)`, marginBottom: gap, fontFamily: SERIF, fontWeight: 700, fontSize: size, lineHeight: 1.15, color: gold ? SK.gold : SK.white }}>{text}</div>; })}
</div>;

// ============================================================================
// b1 — the machine and the khurpi
function B1(ctx) {
  return ({ localTime: lt, duration }) => {
    const cRoar = W("b1", "roar"), cNow = S("b1", 1), cFarmer = S("b1", 2), cKh = W("b1", "khurpi"), cFast = S("b1", 4), cQ = W("b1", "big"), cStill = W("b1", "still"),
      s = stopFor("b1"), stop = stopAt("b1", s[1]);
    const side = out3(lt, cFarmer, 0.8), low = out3(lt, cQ, 0.7), h = lerp(790, 390, low);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[1]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(1, ctx, [L("Machines: fast and powerful", cFast), L("BIG QUESTION", cQ, "head"), L("In the age of machines, why do farmers STILL use simple hand tools?", cQ + 0.4, "big"), L(s[3], stop, "think")])}>
        <Pic slot="harvester_roar" label="A huge combine harvester roars across a wide wheat field" x={40} y={60} w={lerp(1360, 660, side)} h={h} lt={lt} at={0.1} fx="zoom" zoom={1.16}
          dim={lt > cNow && lt < cFarmer + 0.8 ? 0.25 : 0} />
        <Chip text="ROAR!" x={lerp(720, 370, side)} y={90} lt={lt} at={cRoar} out={cNow} tone="gold" size={48} />
        <Pic slot="farmer_khurpi" label="A farmer kneels between rows of vegetables, weeding with a khurpi" x={740} y={60} w={660} h={h} lt={lt} at={cFarmer} fx="pop" />
        <Chip text="a small khurpi" x={1070} y={h - 10} lt={lt} at={cKh} tone="gold" size={30} />
        <Chip text="fast and powerful" x={370} y={h - 10} lt={lt} at={cFast} size={30} />
        <Card x={40} y={490} w={1360} h={330} lt={lt} at={cQ} pad={30}>
          <Badge text="BIG QUESTION" x={30} y={26} lt={lt} at={cQ} size={30} />
          <div style={{ position: "absolute", left: 30, top: 116, width: 1300, fontFamily: SERIF, fontWeight: 700, fontSize: 56, lineHeight: 1.2, color: SK.white, opacity: out3(lt, cStill - 0.6, 0.6) }}>
            Why do farmers <span style={{ color: SK.gold }}>STILL</span> use simple hand tools?</div>
        </Card>
        <StopBox lt={lt} b="b1" box={{ y: 480, h: 450 }} qSize={50} />
      </Scene>
    );
  };
}
// b2 — timeline strip, then the hand tools step forward
function B2(ctx) {
  const strip = [["stone_sickle_cut", "A sickle with sharp stone blades cuts ripe grain", "stone sickle"], ["iron_plough", "An iron-tipped plough breaks hard ground", "iron plough"],
    ["tractor_field", "A red tractor at work in an Indian field", "tractor"], ["drone_field", "A farm drone flies over a green field", "drone"]];
  return ({ localTime: lt, duration }) => {
    const cOver = S("b2", 0), cCh = W("b2", "changed"), cTod = W("b2", "today"), cInv = W("b2", "inventions"), cBut = S("b2", 3), cNot = W("b2", "not"), cHold = S("b2", 4), cGr = W("b2", "ground");
    const ats = [cOver, cCh, cTod, cInv], dimS = reveal(lt, cBut, 0.6);
    const row = (i) => pop(lt, cBut + i * 0.22, 0.6);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[2]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(2, ctx, [L("Traditional tools → modern machines", cCh), L("But HAND TOOLS still hold their ground!", cHold, "big")])}>
        {strip.map(([slot, lab, chip], i) => { const sl = 1 - out3(lt, ats[i], 0.8), x = 40 + i * 345 + sl * 340, big = 1 - out3(lt, cBut, 0.7), h = lerp(240, 400, big);
          return <React.Fragment key={slot}>
            <Pic slot={slot} label={lab} x={x} y={60} w={325} h={h} lt={lt} at={ats[i]} fx="zoom" op={1 - 0.45 * dimS} />
            <Chip text={chip} x={x + 162} y={60 + h - 54} lt={lt} at={ats[i] + 0.25} size={24} op={1 - 0.3 * dimS} />
          </React.Fragment>; })}
        <SVG op={1}>
          {[0, 1, 2].map((i) => <path key={i} d={`M${360 + i * 345} ${130} l14 20 l-14 20`} stroke={SK.gold} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={out3(lt, ats[i + 1], 0.5) * (1 - 0.5 * dimS)} />)}
          <rect x={40} y={330} width={1360} height={520} rx={22} fill={SK.card} opacity={out3(lt, cBut, 0.5)} />
          {TOOLS.map(([k, name], i) => { const o = row(i); if (o <= 0) return null; const x = 150 + i * 228;
            return <g key={k}>
              <g transform={`translate(${x} ${lerp(650, 560, o)})`} opacity={clamp(o, 0, 1)}><HandTool kind={k} s={1.05} /></g>
              <T x={x} y={714} size={k === "drill" || k === "shears" ? 22 : 26} bold color={SK.cream} op={clamp(o, 0, 1)}>{name.replace("PRUNING ", "").replace("HAND ", "")}</T>
            </g>; })}
        </SVG>
        <Big x={40} y={754} w={1360} lt={lt} at={cHold} size={52} align="center">They still <span style={{ color: SK.gold }}>hold their ground!</span></Big>
        <Chip text="have NOT disappeared" x={720} y={345} lt={lt} at={cNot} tone="gold" size={30} />
      </Scene>
    );
  };
}
// b3 — meet the tools: the rack lights tool by tool, each with an action shot
function B3(ctx) {
  const shots = [["act_spade", "A SPADE digging a pit", "spade"], ["act_hoe", "A HOE loosening soil and pulling weeds", "hoe"], ["act_sickle", "A SICKLE cutting a bunch of ripe paddy", "sickle"],
    ["act_khurpi", "A KHURPI weeding close to small plants", "khurpi"], ["act_shears", "PRUNING SHEARS snipping a dry branch from a fruit tree", "pruning"], ["act_seed_drill", "A HAND-OPERATED SEED DRILL pushed along a row", "handoperated"]];
  const jobWord = ["digging", "loosening", "harvesting", "weeding", "cutting", "planting"];
  const panelText = ["SPADE – digging", "HOE – loosening soil, weeding", "SICKLE – harvesting", "KHURPI – weeding", "PRUNING SHEARS – cutting branches", "HAND SEED DRILL – planting in rows"];
  return ({ localTime: lt, duration }) => {
    const cLet = S("b3", 0), ats = shots.map((x) => W("b3", x[2])), jobAt = jobWord.map((w) => W("b3", w)), s = stopFor("b3"), stop = stopAt("b3", s[1]);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[3]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(3, ctx, [L("SIX HAND TOOLS", cLet, "head"), ...panelText.map((t, i) => L(t, jobAt[i])), L("Match each tool to its job", stop, "think")], { max: 8 })}>
        <Rack x={40} y={60} w={400} h={780} lt={lt} on={ats} jobOn={jobAt} jobs={1 - reveal(lt, stop - 0.2, 0.3)} at={0.1} />
        <Big x={480} y={380} w={920} lt={lt} at={cLet} out={ats[0]} size={72} align="center">Let's meet the <span style={{ color: SK.gold }}>tools!</span></Big>
        {shots.map(([slot, lab], i) => <Shot key={slot} slot={slot} label={lab} x={480} y={60} w={920} h={780} lt={lt} at={ats[i]} out={i < 5 ? ats[i + 1] + 0.25 : null}
          chip={TOOLS[i][1]} chipAt={ats[i] + 0.2} size={34} />)}
        {shots.map(([, , ], i) => <Chip key={i} text={TOOLS[i][2]} x={940} y={720} lt={lt} at={jobAt[i]} out={i < 5 ? ats[i + 1] : stop} size={30} />)}
        <StopBox lt={lt} b="b3" heading="HAVE YOU UNDERSTOOD?" box={{ x: 480, w: 920, h: 780 }} qSize={50}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 18, marginTop: 34, maxWidth: 800 }}>
            {["digging", "weeding", "harvesting", "cutting", "planting"].map((j) => <div key={j} style={{ fontFamily: SANS, fontWeight: 700, fontSize: 40, color: SK.ink, background: SK.cream, padding: "8px 28px", borderRadius: 999 }}>{j}</div>)}
          </div>
        </StopBox>
      </Scene>
    );
  };
}
// b4 — where a tractor gets stuck
function B4(ctx) {
  return ({ localTime: lt, duration }) => {
    const cFast = W("b4", "faster"), cSmall = W("b4", "small"), cSteep = S("b4", 2), cFit = S("b4", 3), cCare = W("b4", "care"), cOne = W("b4", "one"), cTiny = W("b4", "tiny"), cWin = S("b4", 7);
    const ringP = windowOp(lt, cOne, cWin + 0.4, 0.4), sw = 1 + 0.08 * Math.sin(lt * 4);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[4]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(4, ctx, [L("Machines make farming FASTER", cFast), L("Hand tools are best for:", cSmall, "head"), L("SMALL farms", cSmall), L("UNEVEN or hilly land", cSteep), L("Tasks that need PRECISION", cCare)])}>
        <Pic slot="tractor_field" label="A red tractor at work in an Indian field" x={40} y={60} w={1360} h={780} lt={lt} at={0.1} out={cSmall} fx="zoom" />
        <Chip text="FASTER" x={720} y={90} lt={lt} at={cFast} out={cSmall} tone="gold" size={44} />
        <Shot slot="tiny_field" label="A tiny field squeezed between houses" x={40} y={60} w={440} h={600} lt={lt} at={cSmall} chip="SMALL farms" />
        <Shot slot="hill_terraces" label="Steep, uneven terraces on a hillside" x={500} y={60} w={440} h={600} lt={lt} at={cSteep} chip="UNEVEN land" />
        <Shot slot="one_weed" label="Pulling out ONE weed beside a tiny plant" x={960} y={60} w={440} h={600} lt={lt} at={cCare} chip="PRECISION" />
        <SVG op={1}>
          {[260, 720].map((x, i) => { const o = pop(lt, cFit + i * 0.35, 0.5); if (o <= 0) return null;
            return <g key={x} transform={`translate(${x} 330)`}><circle r={84} fill="rgba(5,30,22,0.72)" opacity={clamp(o, 0, 1)} /><g opacity={clamp(o, 0, 1)}><Tractor s={1.1} /></g><NoSign cx={0} cy={0} r={76} op={clamp(o, 0, 1)} /></g>; })}
          <circle cx={1180} cy={320} r={78 * sw} stroke={SK.gold} strokeWidth={8} opacity={ringP} />
        </SVG>
        <Chip text="ONE weed" x={1180} y={200} lt={lt} at={cOne} tone="green" size={28} />
        <Chip text="a tiny plant beside it" x={1180} y={430} lt={lt} at={cTiny} tone="green" size={26} />
        <Chip text="A big machine just cannot fit!" x={490} y={680} lt={lt} at={cFit} out={cCare} tone="cream" size={36} />
        <Big x={40} y={690} w={1360} lt={lt} at={cWin} size={68} align="center"><span style={{ color: SK.gold }}>Hand tools win!</span></Big>
      </Scene>
    );
  };
}
// b5 — cheap, easy to look after, no electricity, no fuel
function B5(ctx) {
  return ({ localTime: lt, duration }) => {
    const cSup = S("b5", 0), cCheap = W("b5", "cheap"), cEasy = W("b5", "easy"), cClean = W("b5", "clean"), cElec = W("b5", "electricity"), cFuel = W("b5", "fuel"),
      s = stopFor("b5"), stop = stopAt("b5", s[1]), breakAt = stop + s[2] + 0.1;
    const tag = (x, y, text, at) => { const o = pop(lt, at, 0.5); if (o <= 0) return null;
      return <div style={{ position: "absolute", left: x, top: y, opacity: clamp(o, 0, 1), transform: `rotate(-3deg) scale(${0.7 + 0.3 * o})`, fontFamily: SANS, fontWeight: 700, fontSize: 40, color: SK.ink, background: SK.cream, padding: "6px 24px 6px 18px", borderRadius: "10px 34px 34px 10px", boxShadow: "0 6px 16px rgba(0,0,0,0.35)" }}>{text}</div>; };
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[5]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(5, ctx, [L("Hand tools are:", cCheap, "head"), L("AFFORDABLE", cCheap), L("EASY to maintain", cEasy), L("NO electricity or fuel needed", cElec), L("Which is better for a small vegetable garden? Why?", stop, "think")])}>
        <Pic slot="farmer_khurpi" label="A farmer weeding with a khurpi" x={40} y={60} w={660} h={380} lt={lt} at={0.1} fx="zoom" />
        <Pic slot="tractor_field" label="A red tractor at work in an Indian field" x={740} y={60} w={660} h={380} lt={lt} at={0.4} fx="zoom" />
        <Chip text="khurpi" x={370} y={380} lt={lt} at={cSup} size={28} />
        <Chip text="tractor" x={1070} y={380} lt={lt} at={cSup + 0.3} size={28} />
        {tag(70, 80, "₹", cCheap)}
        {tag(770, 80, "₹₹₹₹₹₹₹₹", cCheap + 0.5)}
        <Shot slot="sharpen_sickle" label="A farmer sharpens a sickle on a stone" x={40} y={470} w={440} h={370} lt={lt} at={cEasy} chip="sharp" chipAt={W("b5", "sharp")} />
        <Shot slot="oil_hoe" label="A farmer cleans and oils a hoe" x={500} y={470} w={440} h={370} lt={lt} at={cEasy + 0.5} chip="clean" chipAt={cClean} />
        <SVG op={out3(lt, cElec - 0.1, 0.5)}>
          <rect x={960} y={470} width={440} height={370} rx={18} fill={SK.card} />
          <Plug x={1070} y={620} s={1} /><NoSign cx={1070} cy={620} r={86} op={out3(lt, cElec, 0.5)} />
          <Pump x={1290} y={612} s={1} /><NoSign cx={1290} cy={620} r={86} op={out3(lt, cFuel, 0.5)} />
          <T x={1070} y={768} size={32} bold color={SK.gold} op={out3(lt, cElec, 0.5)}>NO electricity</T>
          <T x={1290} y={768} size={32} bold color={SK.gold} op={out3(lt, cFuel, 0.5)}>NO fuel</T>
        </SVG>
        <StopBox lt={lt} b="b5" qSize={40}>
          <div style={{ display: "grid", gridTemplateColumns: "230px 1fr 1fr 1.5fr", gap: 10, width: 1180, marginTop: 28 }}>
            {["", "Cost", "Fuel", "Where it can work"].map((h, i) => <div key={i} style={{ fontFamily: SANS, fontWeight: 700, fontSize: 32, color: SK.gold, padding: "6px 0" }}>{h}</div>)}
            {["khurpi", "tractor"].map((k) => <React.Fragment key={k}>
              <div style={{ height: 150, display: "flex", alignItems: "center", gap: 10, justifyContent: "center", background: "rgba(255,255,255,0.08)", borderRadius: 14 }}>
                <svg width="110" height="130" viewBox="-110 -125 220 250">{k === "khurpi" ? <HandTool kind="khurpi" s={1.05} /> : <Tractor s={2} />}</svg>
                <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 28, color: SK.white, textTransform: "capitalize" }}>{k}</span></div>
              {[0, 1, 2].map((c) => <div key={c} style={{ height: 150, borderRadius: 14, border: "3px dashed rgba(255,255,255,0.35)", boxSizing: "border-box" }} />)}
            </React.Fragment>)}
          </div>
        </StopBox>
        <Break lt={lt} at={breakAt} dur={2.4} />
      </Scene>
    );
  };
}
// b6 — WOW: India's sickle, Japan's kama
function B6(ctx) {
  return ({ localTime: lt, duration }) => {
    const cWow = S("b6", 0, 0.1), cLook = S("b6", 1), cLeft = W("b6", "left"), cSick = W("b6", "sickle"), cRight = W("b6", "right"), cKama = W("b6", "kama"), cRice = W("b6", "rice"),
      cDiff = W("b6", "different"), cSame = W("b6", "same"), cYet = S("b6", 6);
    const slide = drive(lt, cYet - 0.1, cSame + 0.9), glow = out3(lt, cSame + 0.5, 0.6);
    const wp = pop(lt, cWow, 0.6), wk = 1 - out3(lt, cLook + 0.1, 0.7);    // the card starts huge, then moves to the corner
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[6]} showCaps={ctx.caps} capSize={ctx.capSize} fi={0.3}
        panel={panel(6, ctx, [L("INDIA'S SICKLE", cSick, "big"), L("JAPAN'S KAMA", cKama, "big"), L("Both curved harvesting tools", cDiff), L("Both cut crops by hand", cDiff + 0.8), L("Different countries, almost the SAME design!", cSame, "head")], { max: 6 })}>
        <Shot slot="india_sickle" label="An Indian farmer cutting paddy with a curved sickle" x={40} y={60} w={660} h={410} lt={lt} at={cLeft} chip="India · SICKLE" chipAt={cSick} size={30} />
        <Shot slot="japan_kama" label="A Japanese farmer cutting rice with a kama" x={740} y={60} w={660} h={410} lt={lt} at={cRight} chip="Japan · KAMA" chipAt={cKama} size={30} />
        <Chip text="used mostly to cut rice" x={1070} y={80} lt={lt} at={cRice} size={26} />
        <Card x={40} y={494} w={1360} h={366} lt={lt} at={cDiff} pad={0} />
        <SVG op={out3(lt, cDiff, 0.6)}>
          <Sickle x={lerp(330, 560, slide)} y={700} s={0.92} kind="steel" glow={glow} />
          <Kama x={lerp(800, 560, slide)} y={700} s={0.92} glow={glow} op={lerp(1, 0.72, slide)} />
          <T x={445} y={546} size={28} bold color={SK.cream} op={1 - slide}>sickle</T>
          <T x={915} y={546} size={28} bold color={SK.cream} op={1 - slide} anchor="middle">kama</T>
        </SVG>
        <Big x={860} y={590} w={510} lt={lt} at={cSame} size={56}>almost the <span style={{ color: SK.gold }}>SAME</span> design!</Big>
        {wp > 0 && <div style={{ position: "absolute", left: lerp(64, 480, wk), top: lerp(508, 330, wk), zIndex: 2, opacity: clamp(wp * 1.5, 0, 1), transform: `rotate(-4deg) scale(${lerp(0.84, 1.9, wk) * (0.7 + 0.3 * Math.min(1, wp))})`, transformOrigin: "left center",
          background: ORANGE, color: SK.white, fontFamily: SERIF, fontWeight: 700, fontSize: 84, padding: "4px 40px", borderRadius: 20, boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>WOW!</div>}
      </Scene>
    );
  };
}
// b7 — the world's farmers, then the kama in Okinawa
function B7(ctx) {
  return ({ localTime: lt, duration }) => {
    const cFar = S("b7", 0), cProb = W("b7", "problem"), cHow = S("b7", 1), cAns = S("b7", 2), cClev = W("b7", "clever"), cFun = S("b7", 3), cOk = W("b7", "okinawa"), cKama = W("b7", "kama"), cMart = W("b7", "martial");
    const mapO = 1 - 0.8 * reveal(lt, cFun, 0.6);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[7]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(7, ctx, [L("Farmers everywhere found clever ways to solve the SAME problem", cAns, "big"), L("FUN FACT", cFun, "head"), L("In Okinawa, Japan, the kama became part of martial arts training", cOk)])}>
        <SVG op={mapO}>
          <rect x={40} y={46} width={1360} height={568} rx={20} fill={SK.card} />
          {DOT_EL}
          {PINS.map(([lon, lat, name], i) => { const o = pop(lt, cFar + 0.1 + i * 0.32, 0.5); if (o <= 0) return null; const big = !!name, r = big ? 42 : 34;
            return <g key={i} transform={`translate(${ml(lon)} ${mt(lat)}) scale(${clamp(o, 0, 1.2)})`}>
              <circle r={r} fill={big ? SK.gold : SK.cream} stroke={big ? SK.white : SK.gold} strokeWidth={4} /><Sickle x={-r * 0.56} y={r * 0.36} s={r / 195} kind="iron" />
              {name && <text y={-r - 10} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={26} fill={SK.gold} stroke={SK.bgDeep} strokeWidth={5} paintOrder="stroke">{name}</text>}</g>; })}
        </SVG>
        <Big x={40} y={642} w={1360} lt={lt} at={cProb} out={cAns} size={50} align="center">The <span style={{ color: SK.gold }}>SAME</span> problem: how to cut crops by hand?</Big>
        <Big x={40} y={642} w={1360} lt={lt} at={cClev} out={cFun} size={50} align="center">The same clever answer: <span style={{ color: SK.gold }}>a curved blade!</span></Big>
        <Pic slot="karate_kama" label="A karate student practises with a blunt training kama" x={240} y={60} w={960} h={780} lt={lt} at={cFun + 0.2} fx="zoom" />
        <Badge text="FUN FACT" x={280} y={90} lt={lt} at={cFun + 0.2} size={34} />
        <Chip text="Okinawa, Japan" x={720} y={700} lt={lt} at={cOk} tone="gold" size={34} />
        <Chip text="a blunt training kama" x={720} y={770} lt={lt} at={cMart} size={30} />
      </Scene>
    );
  };
}
// b8 — the journey: the curved blade glows in every step
function B8(ctx) {
  return ({ localTime: lt, duration }) => {
    const cJ = S("b8", 0), cStone = W("b8", "stone"), cIron = W("b8", "iron"), cGiant = W("b8", "giant"), cHarv = W("b8", "harvester"), cBut = S("b8", 4), cHands = W("b8", "hands"), cSome = S("b8", 5), cSimple = W("b8", "simplest"), cMost = W("b8", "most");
    const glow = out3(lt, cBut, 0.8), cSteel = cIron + (cGiant - cIron) * 0.6;
    const tiles = [["stone_sickle_cut", "A sickle with sharp stone blades", "stone sickle", cStone], ["blacksmith", "A blacksmith hammers a red-hot iron blade", "iron sickle", cIron],
      ["act_sickle", "A modern steel sickle", "steel sickle", cSteel], ["harvester_roar", "A combine harvester", "combine harvester", cGiant]];
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[8]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(8, ctx, [L("THE JOURNEY", cJ, "head"), L("Ancient tools → modern equipment", cStone), L("The simple sickle is still in farmers' hands", cHands), L("The SIMPLEST inventions are often still the MOST USEFUL!", cSimple, "big")])}>
        <SVG op={out3(lt, 0.15, 0.6)}>{[0, 1, 2, 3].map((i) => <rect key={i} x={40 + i * 345} y={60} width={325} height={350} rx={18} fill="rgba(5,30,22,0.45)" stroke="rgba(255,255,255,0.35)" strokeWidth={3} strokeDasharray="10 10" />)}</SVG>
        <Big x={40} y={520} w={1360} lt={lt} at={cJ} out={cBut - 0.1} size={60} align="center">Ancient tools <span style={{ color: SK.gold }}>→</span> modern equipment</Big>
        {tiles.map(([slot, lab, chip, at], i) => { const x = 40 + i * 345; return <React.Fragment key={slot}>
          <Pic slot={slot} label={lab} x={x} y={60} w={325} h={350} lt={lt} at={at} fx="none" dim={0.62} />
          <Chip text={chip} x={x + 162} y={358} lt={lt} at={at + 0.15} size={24} />
        </React.Fragment>; })}
        <SVG op={1}>
          <Sickle x={110} y={270} s={0.68} kind="stone" glow={glow} op={out3(lt, cStone, 0.5)} />
          <Sickle x={455} y={270} s={0.68} kind="iron" glow={glow} op={out3(lt, cIron, 0.5)} />
          <Sickle x={800} y={270} s={0.68} kind="steel" glow={glow} op={out3(lt, cSteel, 0.5)} />
          <g opacity={out3(lt, cGiant, 0.5)}><Harvester x={1252} y={240} s={0.82} glow={glow} /></g>
          {[0, 1, 2].map((i) => <path key={i} d={`M${360 + i * 345} ${190} l14 20 l-14 20`} stroke={SK.gold} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={out3(lt, tiles[i + 1][3], 0.5)} />)}
        </SVG>
        <Shot slot="act_sickle" label="The simple sickle is still in farmers' hands" x={40} y={440} w={660} h={410} lt={lt} at={cBut} chip="still in farmers' hands" chipAt={cHands} size={30} />
        <Big x={760} y={500} w={620} lt={lt} at={cSimple} size={64}>The <span style={{ color: SK.gold }}>SIMPLEST</span> inventions</Big>
        <Big x={760} y={680} w={620} lt={lt} at={cMost} size={64}>are still the <span style={{ color: SK.gold }}>MOST</span> useful</Big>
      </Scene>
    );
  };
}
// b9 — the answer, safety, quick check
function B9(ctx) {
  return ({ localTime: lt, duration }) => {
    const cSo = S("b9", 0), cCheap = W("b9", "cheap"), cEasy = W("b9", "easy"), cFuel = W("b9", "fuel"), cWork = W("b9", "work"), cRem = S("b9", 5), cSharp = W("b9", "sharp"), cBlade = W("b9", "bladedown"), cAdult = W("b9", "adult"),
      s = stopFor("b9"), stop = stopAt("b9", s[1]);
    const phA = 1 - reveal(lt, cRem - 0.1, 0.5), o = out3(lt, cRem - 0.1, 0.5), sway = Math.sin(lt * 1.6) * 2;
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[9]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(9, ctx, [L("ANSWER", cCheap, "head"), L("Cheap", cCheap), L("Easy to care for", cEasy), L("Need no fuel", cFuel), L("Work where machines can't", cWork), L("SAFETY", cRem, "head"), L("Carry sharp tools blade-down", cBlade), L("Use them only with an adult's help", cAdult)], { max: 8 })}>
        <div style={{ position: "absolute", inset: 0, opacity: phA }}>
          <Shot slot="farmer_khurpi" label="The farmer with the khurpi" x={40} y={60} w={660} h={500} lt={lt} at={0.1} chip="the farmer with the khurpi" chipAt={cSo} size={26} />
          <Shot slot="family_garden" label="A family works in a small garden with a spade and a hoe" x={740} y={60} w={660} h={500} lt={lt} at={cSo + 0.6} chip="a family with a spade and a hoe" chipAt={cSo + 0.9} size={26} />
          <Card x={40} y={584} w={1360} h={270} lt={lt} at={cCheap} pad={0} />
          <Ticks x={100} y={606} w={600} lt={lt} items={[["✓ CHEAP", cCheap, true], ["✓ easy to look after", cEasy]]} size={50} gap={30} />
          <Ticks x={760} y={606} w={640} lt={lt} items={[["✓ need no fuel", cFuel], ["✓ work where machines can't", cWork, true]]} size={50} gap={30} />
        </div>
        <div style={{ position: "absolute", inset: 0, opacity: o }}>
          <Card x={40} y={60} w={1360} h={790} lt={lt} at={cRem - 0.1} pad={0} />
          <div style={{ position: "absolute", left: 80, top: 90, fontFamily: SERIF, fontWeight: 700, fontSize: 52, color: SK.white, background: ORANGE, padding: "6px 34px", borderRadius: 16, opacity: pop(lt, cSharp, 0.5) > 0 ? 1 : 0 }}>These tools are SHARP!</div>
          <SVG op={1}>
            <g opacity={out3(lt, cBlade, 0.5)}>
              <g transform={`translate(420 ${500 + sway})`}>
                <Sickle x={0} y={0} s={1} kind="iron" rot={180} />
                <circle cx={2} cy={-92} r={44} fill="#B9825A" /><path d="M-30 -112 Q 2 -130 34 -112" stroke="#8E5F3E" strokeWidth={6} fill="none" />
              </g>
              <Arrow x1={560} y1={380} x2={560} y2={650} color={SK.gold} sw={10} head={30} />
              <T x={420} y={780} size={42} bold serif color={SK.gold}>Carry them blade-down</T>
            </g>
            <g opacity={out3(lt, cAdult - 1.0, 0.5)}>
              <rect x={840} y={270} width={500} height={24} rx={10} fill={WOOD} stroke={WOOD_D} strokeWidth={3} />
              {[930, 1090, 1250].map((x) => <circle key={x} cx={x} cy={282} r={9} fill={SK.gold} />)}
              <g transform="translate(930 420)"><HandTool kind="spade" s={1.1} /></g>
              <Sickle x={1020} y={440} s={0.8} kind="iron" />
              <g transform="translate(1270 420)"><HandTool kind="hoe" s={1.1} /></g>
              <T x={1090} y={640} size={34} bold color={SK.cream}>Store them on a rack</T>
            </g>
          </SVG>
          <div style={{ position: "absolute", left: 790, top: 690, width: 600, textAlign: "center", fontFamily: SERIF, fontWeight: 700, fontSize: 42, lineHeight: 1.2, color: SK.gold, opacity: out3(lt, cAdult, 0.5) }}>Use them only with an adult's help</div>
        </div>
        <StopBox lt={lt} b="b9" heading="QUICK CHECK">
          <div style={{ marginTop: 26, textAlign: "left", width: 1220 }}>
            {QUICK.map((q, i) => <div key={i} style={{ display: "flex", gap: 22, alignItems: "baseline", marginTop: 14 }}>
              <span style={{ flex: "none", width: 44, fontFamily: SERIF, fontWeight: 700, fontSize: 42, color: SK.gold }}>{i + 1}</span>
              <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 42, lineHeight: 1.2, color: SK.white }}>{q}</span></div>)}
          </div>
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
const COLLAGE = [{ slot: "iron_plough", x: -60, y: -40, w: 760, h: 520, ph: 0 }, { slot: "harvester_roar", x: 640, y: -80, w: 760, h: 520, ph: 2 },
  { slot: "stone_sickle_cut", x: -80, y: 520, w: 700, h: 560, ph: 4 }, { slot: "act_sickle", x: 560, y: 560, w: 820, h: 560, ph: 1 }];
function Lp14Scenes(props = {}) {
  const caps = props.showCaptions === "false" ? false : props.showCaptions !== false;
  const titles = {};
  for (let n = 1; n <= NB; n++) titles[n] = str(props["title" + n + "Text"], TITLES[n]);
  const ctx = { caps, titles, capSize: num(props.captionSize, 34) };
  const B = [B1, B2, B3, B4, B5, B6, B7, B8, B9];
  const beats = B.map((Bn, i) => { const t = BEAT("b" + (i + 1)); return [t.start, t.start + t.dur, Bn]; });
  return (
    <StoryFrame props={props} dur={DUR} persistKey="thinkpro-lp14-hand-tools-in-indian-farming" collage={COLLAGE}>
      {beats.map(([s, e, Bn], i) => (
        <Sprite key={i} start={s} end={e}>{Bn(ctx)}</Sprite>
      ))}
      {STOPS.map(([b, i, hold]) => <StopAt key={b} t={BEAT(b).start + stopAt(b, i)} hold={hold - 0.2} />)}
      <ChimeAt t={BEAT("b6").start + S("b6", 0, 0)} />
      <AudioSync />
    </StoryFrame>
  );
}
window.Lp14Scenes = Lp14Scenes;
