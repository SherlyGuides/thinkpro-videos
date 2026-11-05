/* global React, window */
// ThinkPro Academy — "Medicinal Plants" (Grade 6 Agriculture, Session 12, V1).
// After AG_G6_S12_Video_Script_Medicinal_Plants (Draft 1, 4 Nov 2026): 11 scenes as 10 narrated
// beats (scene 7, the silent leaf break, sits in the tail of b6), four presenter stops (silent
// holds — the web player freezes there, TPStory.StopAt), two Do-you-know scenes (b7 India, b8
// World) and one red SAFETY FIRST card (b9: the ONLY red in the video). The five collectable
// PLANT CARDS and NEEM (the one plant that helps people AND crops) are the running idea.
// Drawn here (no engine change): India outline from engine/toon-india.js, an orthographic GLOBE
// with rough coastlines and no country borders, caterpillars, money jar, bees, thermometer.
const { Sprite, Easing } = window;
const { reveal, windowOp } = window.TPMotion;
const { num, str } = window.TPStage;
const { SK, SERIF, SANS, LEFT_W, pop, out3, lerp, drive, Pic, Chip, Badge, Big, Card, SVG, Arrow, ChimeAt, Scene, StoryFrame, StopAt, Break } = window.TPStory;

// ---- Timing: EVERYTHING is keyed to the narration (tools/fit_timing.py → timing.js).
const TM = window.TP_TIMING;
if (!TM) console.error("timing.js missing — run: python3 tools/fit_timing.py videos/lp12-medicinal-plants");
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
const TITLES = { 1: "LP12 – Medicinal Plants", 2: "What are medicinal plants?", 3: "Five famous plants", 4: "What they need to grow", 5: "Neem protects crops!",
  6: "Good for farmers, good for farms", 7: "Do you know? India", 8: "Do you know? World", 9: "Safety first!", 10: "The answer" };
const KICK = "Grade 6 · Agriculture · Session 12";
const KICKS = { 7: "Do you know?", 8: "Do you know?" };
const panel = (n, ctx, lines, extra = {}) => ({ kicker: KICKS[n] || KICK, title: ctx.titles[n], lines, ...extra });
const L = (text, at, kind = "item", extra = {}) => ({ text, at, kind, ...extra });

// ---- Presenter stops: [beat, sentence index whose pauseAfter is the hold, hold s]
const STOPS = [["b1", 8, 5.0], ["b3", 12, 6.0], ["b9", 5, 5.0], ["b10", 6, 8.0]];
const stopFor = (b) => STOPS.find((s) => s[0] === b);
const stopAt = (b, i) => SE(b, i) + 0.1;                       // beat-local start of the hold
const stopStart = (b) => stopAt(b, stopFor(b)[1]);
const holdOf = (b) => stopFor(b)[2] - 0.2;

// ---- Shared pieces ---------------------------------------------------------------
const RED = "#C8281E";            // b9 ONLY: the script keeps red for the safety card.
const HEAT = "#E8901E", WATER = "#5DB7E8", LAND = "#6FBF6E", SEA = "#2D7FB8", MAPG = "#2E7A4F";
function Arr({ x1, y1, x2, y2, lt, at, color = SK.gold, sw = 6 }) { return <Arrow x1={x1} y1={y1} x2={x2} y2={y2} color={color} sw={sw} op={out3(lt, at, 0.5)} />; }
function Node({ slot, label, x, y, r = 90, lt, at, size = 24, out = null, tone = "cream", chip = true, chipY }) {
  const o = pop(lt, at, 0.6) * (out != null ? 1 - reveal(lt, out, 0.4) : 1); if (o <= 0) return null;
  return (
    <React.Fragment>
      <Pic slot={slot} label={label} x={x - r} y={y - r} w={2 * r} h={2 * r} r={r} lt={lt} at={at} out={out} fx="pop" style={{ boxShadow: "0 0 0 4px " + SK.cream }} />
      {chip && <Chip text={label} x={x} y={chipY != null ? chipY : y + r + 12} lt={lt} at={at + 0.15} out={out} size={size} tone={tone} />}
    </React.Fragment>
  );
}
// Camera flies OUT: the picture starts pushed in and eases back to fit.
function Fly({ slot, label, x, y, w, h, lt, at, out = null, from = 1.5, dur = 2.4 }) {
  const k = 1 + (from - 1) * (1 - Easing.easeInOutCubic(clamp((lt - at) / dur, 0, 1)));
  const o = out3(lt, at, 0.6) * (out != null ? 1 - reveal(lt, out, 0.5) : 1); if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 18, overflow: "hidden", opacity: o, boxShadow: "0 0 0 3px rgba(255,255,255,0.55)" }}>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${k})`, transformOrigin: "50% 45%" }}>
        <Pic slot={slot} label={label} x={0} y={0} w={w} h={h} r={0} lt={lt} at={at - 5} fx="none" border={false} />
      </div>
    </div>
  );
}
// Countdown ring shown during a presenter hold (the export holds; the web player freezes).
function Count({ lt, at, hold, x, y }) {
  if (lt < at - 0.2 || lt > at + hold + 0.3) return null;
  const p = clamp((lt - at) / hold, 0, 1), n = Math.max(1, Math.ceil(hold * (1 - p)));
  return (
    <svg width="100" height="100" viewBox="0 0 130 130" style={{ position: "absolute", left: x, top: y }}>
      <circle cx="65" cy="65" r="54" stroke="rgba(255,255,255,0.3)" strokeWidth="8" fill="none" />
      <circle cx="65" cy="65" r="54" stroke={SK.gold} strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 54 * (1 - p)} ${2 * Math.PI * 54}`} transform="rotate(-90 65 65)" />
      <text x="65" y="85" textAnchor="middle" fontFamily={SERIF} fontWeight="700" fontSize="56" fill={SK.white}>{n}</text>
    </svg>
  );
}
// Pause card: leaves the frozen picture visible above it. Default box stays clear of the no-go zone.
function StopBox({ lt, b, n, head = "PAUSE AND DISCUSS", x = 40, y = 440, w = 1360, h = 360, children }) {
  const at = stopStart(b), hold = holdOf(b);
  const o = windowOp(lt, at, at + hold + 0.2, 0.35); if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 26, background: "rgba(5,30,22,0.93)", opacity: o, boxSizing: "border-box",
      boxShadow: "0 0 0 3px rgba(226,176,76,0.9), 0 10px 30px rgba(0,0,0,0.4)", padding: "26px 44px", transform: `translateY(${(1 - o) * 16}px)` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <svg width="58" height="58" viewBox="0 0 90 90"><circle cx="45" cy="45" r="43" fill={SK.gold} /><rect x="28" y="24" width="12" height="42" rx="4" fill={SK.ink} /><rect x="50" y="24" width="12" height="42" rx="4" fill={SK.ink} /></svg>
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 28, letterSpacing: "0.08em", color: SK.ink, background: SK.gold, padding: "8px 26px", borderRadius: 14 }}>{head}</div>
      </div>
      {children}
      <div style={{ position: "absolute", left: 44, bottom: 20, fontFamily: SANS, fontSize: 23, color: SK.dim }}>Stop {n} of 4 · press play to continue</div>
      <Count lt={lt} at={at} hold={hold} x={w - 134} y={h - 118} />
    </div>
  );
}
const StopQ = ({ children, size = 44 }) => <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: size, lineHeight: 1.2, color: SK.white, marginTop: 20 }}>{children}</div>;

// India outline from engine/toon-india.js (official boundary, never generated). s = map scale.
function IndiaMap({ x, y, s = 1, id, op = 1, fill = MAPG, children }) {
  const M = window.TP_INDIA; if (!M || op <= 0) return null;
  return (
    <SVG op={op}>
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <defs><clipPath id={"india-" + id}><path d={M.outline} /></clipPath></defs>
        <path d={M.outline} fill={fill} stroke={SK.cream} strokeWidth={4 / s} strokeLinejoin="round" />
        {children && <g clipPath={`url(#india-${id})`}>{children}</g>}
      </g>
    </SVG>
  );
}
// Rough coastlines for the GLOBE, lon/lat. Land only: no country borders are drawn.
const LANDS = [
  [[-17, 15], [-16, 21], [-10, 30], [-6, 35], [10, 37], [11, 33], [20, 31], [32, 31], [35, 25], [38, 18], [43, 12], [51, 12], [48, 5], [41, -2], [39, -8], [40, -16], [35, -23], [32, -29], [26, -34], [19, -34], [15, -27], [12, -17], [13, -8], [9, 0], [9, 4], [3, 6], [-8, 4], [-13, 8]],
  [[-9, 37], [-9, 43], [-2, 44], [-4, 48], [2, 51], [8, 54], [10, 57], [5, 59], [6, 62], [14, 67], [25, 71], [40, 67], [60, 69], [70, 73], [100, 76], [130, 72], [160, 70], [178, 66], [170, 60], [162, 56], [156, 52], [155, 59], [140, 54], [135, 45], [128, 40], [126, 35], [121, 40], [118, 38], [122, 31], [120, 26], [114, 22], [108, 21], [106, 18], [109, 13], [105, 9], [100, 13], [103, 2], [99, 8], [98, 16], [94, 17], [90, 22], [86, 20], [80, 15], [80, 10], [77, 8], [73, 17], [72, 21], [67, 25], [57, 25], [56, 27], [50, 30], [48, 30], [52, 24], [56, 24], [59, 22], [54, 17], [45, 13], [43, 15], [39, 22], [35, 28], [35, 35], [27, 37], [26, 40], [23, 38], [19, 41], [14, 45], [18, 40], [16, 38], [12, 43], [8, 44], [3, 43], [0, 39], [-5, 36]],
  [[114, -22], [122, -18], [130, -12], [136, -12], [140, -17], [145, -15], [153, -26], [150, -37], [143, -39], [135, -34], [125, -33], [115, -34]],
  [[130, 33], [136, 34], [141, 36], [141, 41], [139, 38], [133, 36]],
  [[95, 5], [100, 2], [106, -5], [102, -4]],
  [[109, 1], [117, 7], [118, 1], [114, -4], [110, -2]],
];
const MADA = [[49.3, -12], [50.4, -15.5], [49.5, -18], [47.5, -24.5], [45.5, -25.5], [43.6, -23.5], [44, -20], [44.5, -16.5], [46.5, -15.5]];
const rad = (d) => d * Math.PI / 180;
function ortho(lon0, lat0) {
  const l0 = rad(lon0), p0 = rad(lat0);
  return ([lon, lat]) => { const l = rad(lon), p = rad(lat), d = l - l0;
    let x = Math.cos(p) * Math.sin(d), y = Math.cos(p0) * Math.sin(p) - Math.sin(p0) * Math.cos(p) * Math.cos(d);
    const c = Math.sin(p0) * Math.sin(p) + Math.cos(p0) * Math.cos(p) * Math.cos(d);
    if (c < 0) { const m = Math.hypot(x, y) || 1; x /= m; y /= m; }     // behind: pin to the limb
    return [x, y, c]; };
}
function Globe({ cx, cy, r, lon, lat, glow = null, mada = 0, lt = 0 }) {
  const P = ortho(lon, lat), d = (pts) => "M" + pts.map((q) => { const [x, y] = P(q); return `${(cx + x * r).toFixed(1)} ${(cy - y * r).toFixed(1)}`; }).join(" L") + " Z";
  const G = glow ? P(glow.at) : null;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={SEA} stroke={SK.cream} strokeWidth={4} />
      {LANDS.map((pts, i) => <path key={i} d={d(pts)} fill={LAND} stroke="rgba(10,43,32,0.5)" strokeWidth={1.5} strokeLinejoin="round" />)}
      {G && G[2] > 0 && <circle cx={cx + G[0] * r} cy={cy - G[1] * r} r={glow.r * (1 + 0.06 * Math.sin(lt * 3))} fill={SK.gold} opacity={0.5 * glow.op} />}
      {mada > 0 && <g opacity={mada}><circle cx={cx + P([46.8, -19])[0] * r} cy={cy - P([46.8, -19])[1] * r} r={46 + 5 * Math.sin(lt * 3)} fill={SK.gold} opacity={0.42} /><path d={d(MADA)} fill={SK.gold} stroke={SK.ink} strokeWidth={2} /></g>}
      {mada <= 0 && <path d={d(MADA)} fill={LAND} />}
    </g>
  );
}
// Small flat leaf (India's "hundreds of plant icons").
const Leaf = ({ x, y, s, rot, c }) => <path transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} d="M0 0 C 6 -9, 18 -9, 24 0 C 18 9, 6 9, 0 0 Z" fill={c} />;
const LEAVES = Array.from({ length: 320 }, (_, i) => { const a = (i * 7919) % 735, b = (i * 104729) % 822, c = (i * 131) % 3;
  return { x: a, y: b, r: (i * 47) % 360, t: ((i * 37) % 320) / 320, c: ["#BFE8A4", "#8BD48A", "#E2B04C"][c] }; });
// Hungry caterpillar (flat): dir +1 faces right; wig = body wiggle; sniff = head bob.
function Caterpillar({ x, y, s = 1, dir = 1, lt, sniff = 0 }) {
  const seg = [0, 1, 2, 3, 4, 5];
  return (
    <g transform={`translate(${x} ${y}) scale(${s * dir} ${s})`}>
      {seg.map((i) => <circle key={i} cx={-i * 30} cy={-22 - 7 * Math.abs(Math.sin(lt * 7 + i * 0.8))} r={24} fill={i % 2 ? "#D6E04C" : "#A8C832"} stroke="#3C5216" strokeWidth={3} />)}
      <g transform={`translate(30 ${-30 - 7 * sniff * Math.abs(Math.sin(lt * 9))})`}>
        <circle r={26} fill="#E8B63A" stroke="#3C5216" strokeWidth={3} />
        <circle cx={10} cy={-6} r={6} fill="#fff" /><circle cx={12} cy={-6} r={3} fill="#1a1a1a" />
        <path d="M10 -24 q 6 -16 18 -18 M-4 -25 q 0 -16 8 -22" stroke="#3C5216" strokeWidth={3} fill="none" strokeLinecap="round" />
      </g>
    </g>
  );
}
function Bee({ x, y, lt }) {
  const f = 0.6 + 0.4 * Math.sin(lt * 40);
  return <g transform={`translate(${x} ${y})`}>
    <ellipse cx={-3} cy={-13} rx={10} ry={13 * f} fill="rgba(255,255,255,0.8)" /><ellipse cx={7} cy={-13} rx={8} ry={11 * f} fill="rgba(255,255,255,0.65)" />
    <ellipse rx={16} ry={11} fill={SK.gold} stroke="#3B2316" strokeWidth={2.5} />
    <path d="M-6 -10 V 10 M 3 -11 V 11" stroke="#3B2316" strokeWidth={4} /></g>;
}
function Sky({ kind, x, y, lt, op, s = 1 }) {
  if (op <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
      {kind === "sun" && <g><circle r={44} fill={SK.gold} />{[0, 1, 2, 3, 4, 5, 6, 7].map((i) => { const a = i * Math.PI / 4 + lt * 0.4; return <line key={i} x1={56 * Math.cos(a)} y1={56 * Math.sin(a)} x2={76 * Math.cos(a)} y2={76 * Math.sin(a)} stroke={SK.gold} strokeWidth={7} strokeLinecap="round" />; })}</g>}
      {kind === "rain" && <g><path d="M-60 0 a 28 28 0 0 1 22 -40 a 36 36 0 0 1 66 4 a 24 24 0 0 1 32 36 Z" fill="#DDE6EE" />
        {[-36, -6, 24].map((dx, i) => { const p = ((lt * 1.2 + i * 0.33) % 1); return <line key={i} x1={dx} y1={14 + p * 40} x2={dx - 6} y2={30 + p * 40} stroke={WATER} strokeWidth={5} strokeLinecap="round" opacity={1 - p} />; })}</g>}
    </g>
  );
}

// ============================================================================
// b1 — the courtyard, four plants, the big question, Stop 1.
function B1(ctx) {
  return ({ localTime: lt, duration }) => {
    const cTul = W("b1", "tulsi"), cNeem = W("b1", "neem"), cTur = W("b1", "turmeric"), cAloe = W("b1", "aloe"), cHomes = W("b1", "these"), cQ = W("b1", "question"),
      cHow = W("b1", "how"), cPeople = W("b1", "people"), cCrops = W("b1", "crops"), at = stopStart("b1"), hold = holdOf("b1");
    const split = drive(lt, cQ, cQ + 1.2) * (1 - drive(lt, at - 0.3, at + 0.4)), yard = lerp(1360, 670, split), yardH = lerp(740, 540, split);
    const tiles = [["tulsi", "Tulsi", cTul], ["neem_leaves", "Neem", cNeem], ["turmeric_root", "Turmeric", cTur], ["aloe_plant", "Aloe vera", cAloe]];
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[1]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(1, ctx, [L("MEDICINAL PLANTS", 0.4, "big"), L("Used in Indian homes for hundreds of years", cHomes), L("BIG QUESTION", cQ, "head"),
          L("How can ONE plant help to protect both PEOPLE and CROPS?", cHow, "think")])}>
        <Pic slot="courtyard" label="A sunny Indian courtyard: tulsi, neem, turmeric, aloe vera" x={40} y={60} w={yard} h={yardH} lt={lt} at={0.1} fx="zoom" kenDur={24} />
        <Fly slot="field_neem" label="A farmer's field with a neem tree at its edge" x={730} y={60} w={670} h={540} lt={lt} at={cQ + 0.3} out={at - 0.3} />
        {tiles.map(([s, l, a], i) => <Node key={s} slot={s} label={l} x={230 + i * 327} y={600} r={110} lt={lt} at={a} out={cQ} size={30} tone="gold" chipY={722} />)}
        <Chip text="Used for HUNDREDS of years" x={720} y={84} lt={lt} at={cHomes + 0.8} out={cQ} size={32} />
        <Chip text="PEOPLE" x={375} y={84} lt={lt} at={cPeople} out={at - 0.3} tone="gold" size={36} />
        <Chip text="CROPS" x={1065} y={84} lt={lt} at={cCrops} out={at - 0.3} tone="gold" size={36} />
        <Card x={40} y={620} w={1360} h={180} lt={lt} at={cQ + 0.2} out={at - 0.2} pad={26}>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 24, letterSpacing: "0.14em", color: SK.gold }}>OUR BIG QUESTION</div>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 46, color: SK.white, marginTop: 10, opacity: out3(lt, cHow, 0.5) }}>How can ONE plant help protect both PEOPLE and CROPS?</div>
        </Card>
        <StopBox lt={lt} b="b1" n={1}>
          <StopQ>Which of these plants grow at your home or school? How does your family use them?</StopQ>
        </StopBox>
      </Scene>
    );
  };
}
// b2 — plant parts go into a clean factory, products come out on a shelf.
function B2(ctx) {
  return ({ localTime: lt, duration }) => {
    const cMed = W("b2", "medicinal"), cHeal = W("b2", "healing"), cExp = W("b2", "experts"), cMake = W("b2", "medicines"), cHerb = W("b2", "herbal"), cNat = W("b2", "natural");
    const ins = [["neem_leaves", "LEAVES", 240, cMed + 0.2], ["ashwagandha", "ROOTS", 420, cMed + 0.6], ["herb_flowers", "FLOWERS", 600, cMed + 1.0]];
    const flow = windowOp(lt, cExp - 0.6, duration, 0.4);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[2]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(2, ctx, [L("Grown for their HEALING properties", cHeal, "big"), L("medicines", cMake), L("herbal products", cHerb), L("natural remedies", cNat)])}>
        <Big x={60} y={46} w={1300} lt={lt} at={cHeal} size={46} color={SK.gold}>Grown for their HEALING properties</Big>
        {ins.map(([s, l, y, a]) => <Node key={s} slot={s} label={l} x={140} y={y} r={84} lt={lt} at={a} size={22} tone="gold" chipY={y + 46} />)}
        <Pic slot="factory" label="A clean herbal medicine factory" x={320} y={140} w={520} h={420} lt={lt} at={cMed + 0.6} fx="zoom" />
        <Pic slot="shop_shelf" label="Bottles, creams, tablets and teas on a shop shelf" x={930} y={140} w={470} h={420} lt={lt} at={cExp} fx="zoom" />
        <SVG op={flow}>
          {ins.map(([, , y], i) => { const p = (lt * 0.8 + i / 3) % 1; const px = lerp(228, 320, p), py = lerp(y, 350, p); return <circle key={i} cx={px} cy={py} r={11} fill={SK.leaf} stroke={SK.bgDeep} strokeWidth={2} opacity={Math.min(1, (1 - p) * 5)} />; })}
          <Arr x1={850} y1={350} x2={920} y2={350} lt={lt} at={cExp} />
        </SVG>
        <Node slot="prod_bottle" label="Bottles" x={420} y={680} r={88} lt={lt} at={cMake} size={22} chipY={724} />
        <Node slot="prod_tablets" label="Tablets" x={620} y={680} r={88} lt={lt} at={cMake + 0.3} size={22} chipY={724} />
        <Node slot="prod_cream" label="Creams" x={860} y={680} r={88} lt={lt} at={cHerb} size={22} chipY={724} />
        <Node slot="prod_tea" label="Herbal teas" x={1110} y={680} r={88} lt={lt} at={cNat} size={22} chipY={724} />
      </Scene>
    );
  };
}
// One collectable card. Flips in at `at`; the part-used label shows from `labelAt`, hidden on Stop 2.
const CARD_W = 256, CARD_H = 470;
function PlantCard({ x, y, slot, name, part, use, lt, at, labelAt, hide = 0 }) {
  const p = reveal(lt, at, 0.7); if (p <= 0) return null;
  const front = p > 0.5, sx = Math.max(0.02, Math.abs(1 - 2 * Easing.easeInOutCubic(p))), lab = out3(lt, labelAt, 0.5);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: CARD_W, height: CARD_H, transform: `scaleX(${sx})`, borderRadius: 20, overflow: "hidden", boxSizing: "border-box",
      background: front ? SK.cream : SK.gold, boxShadow: `0 0 0 3px ${SK.gold}, 0 8px 22px rgba(0,0,0,0.3)` }}>
      {front ? <React.Fragment>
        <Pic slot={slot} label={name} x={10} y={10} w={CARD_W - 20} h={236} r={14} lt={lt} at={at - 5} fx="none" border={false} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 256, textAlign: "center", fontFamily: SERIF, fontWeight: 700, fontSize: 31, color: SK.ink }}>{name}</div>
        <div style={{ position: "absolute", left: 10, right: 10, top: 304, height: 86, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
          <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 25, lineHeight: 1.12, color: SK.white, background: SK.bg1, padding: "6px 12px", borderRadius: 12, opacity: lab * (1 - hide), position: "absolute" }}>{part}</span>
          <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 54, color: SK.ink, background: SK.gold, padding: "0 26px", borderRadius: 14, opacity: hide, position: "absolute" }}>?</span>
        </div>
        <div style={{ position: "absolute", left: 10, right: 10, top: 396, textAlign: "center", fontFamily: SANS, fontSize: 23, lineHeight: 1.1, color: SK.ink, opacity: lab * (1 - hide) }}>{use}</div>
      </React.Fragment> : <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SERIF, fontWeight: 700, fontSize: 120, color: SK.ink }}>?</div>}
    </div>
  );
}
// b3 — five plant cards flip over and line up; India → the world; Stop 2 (matching game).
function B3(ctx) {
  return ({ localTime: lt, duration }) => {
    const cFive = W("b3", "five"), cT = W("b3", "tulsi"), cN = W("b3", "neem"), cU = W("b3", "turmeric"), cA = W("b3", "aloe"), cS = W("b3", "ashwagandha"),
      cPeople = W("b3", "people"), cWorld = W("b3", "over"), at = stopStart("b3");
    const cards = [["tulsi", "TULSI", "LEAVES", "herbal teas", cT, W("b3", "whose", 0)], ["neem_leaves", "NEEM", "LEAVES, SEEDS AND OIL", "all useful", cN, W("b3", "whose", 1)],
      ["turmeric_root", "TURMERIC", "THE YELLOW ROOT", "bright yellow", cU, W("b3", "bright")], ["aloe_gel", "ALOE VERA", "GEL", "cool, inside thick leaves", cA, W("b3", "cool")],
      ["ashwagandha", "ASHWAGANDHA", "ROOTS", "herbal products", cS, W("b3", "whose", 2)]];
    const map = out3(lt, cPeople + 0.7, 0.6) * (1 - reveal(lt, at - 0.2, 0.3)), hide = reveal(lt, at - 0.1, 0.4);
    const mx = 720, my = 690, ends = [[-300, -40], [-330, 50], [-280, 130], [300, -40], [330, 50], [280, 130]];
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[3]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(3, ctx, [L("FIVE FAMOUS MEDICINAL PLANTS", cFive, "big"), L("tulsi", cT), L("neem", cN), L("turmeric", cU), L("aloe vera", cA), L("ashwagandha", cS),
          L("Big LOCAL and INTERNATIONAL markets", cPeople, "think")], { max: 7 })}>
        <Big x={60} y={56} w={1300} lt={lt} at={cFive} out={cPeople - 0.2} size={50} color={SK.gold} align="center">Five famous medicinal plants</Big>
        {cards.map((c, i) => <PlantCard key={c[0]} x={48 + i * 272} y={lerp(180, 54, drive(lt, cPeople - 0.2, cPeople + 0.7))} slot={c[0]} name={c[1]} part={c[2]} use={c[3]} lt={lt} at={c[4]} labelAt={c[5]} hide={hide} />)}
        <IndiaMap x={mx - 110} y={545} s={0.3} id="b3" op={map} />
        <SVG op={map}>{ends.map(([dx, dy], i) => <Arrow key={i} x1={mx + Math.sign(dx) * 110} y1={my + dy * 0.3} x2={mx + dx * lerp(0.4, 1, out3(lt, i < 3 ? cPeople + 0.7 : cWorld, 0.8))} y2={my + dy} color={SK.gold} sw={5} head={16} op={out3(lt, i < 3 ? cPeople + 0.7 : cWorld, 0.5)} />)}</SVG>
        <Chip text="IN INDIA" x={270} y={666} lt={lt} at={cPeople + 0.8} out={at - 0.2} tone="gold" size={30} />
        <Chip text="ALL OVER THE WORLD" x={1170} y={666} lt={lt} at={cWorld + 0.1} out={at - 0.2} tone="gold" size={30} />
        <StopBox lt={lt} b="b3" n={2} head="HAVE YOU UNDERSTOOD?" y={540} h={260}>
          <StopQ size={38}>Which part of each plant is used: leaf, root, gel, seed or oil?</StopQ>
        </StopBox>
      </Scene>
    );
  };
}
// b4 — what they need; turmeric: 20–30 °C and plenty of rain.
function B4(ctx) {
  return ({ localTime: lt, duration }) => {
    const cW = W("b4", "weather"), cT = W("b4", "temperature"), cR = W("b4", "rain"), cS = W("b4", "soil"), cTur = W("b4", "turmeric"), cWarm = W("b4", "warm"), cB = W("b4", "between"), cP = W("b4", "plenty");
    const yOf = (T) => 700 - (T - 10) / 30 * 470, fill = lerp(14, 25, Easing.easeInOutCubic(clamp((lt - cB) / 1.2, 0, 1)));
    const therm = out3(lt, cT, 0.6);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[4]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(4, ctx, [L("They need the right:", cW - 0.2, "head"), L("WEATHER", cW), L("TEMPERATURE", cT), L("RAINFALL", cR), L("SOIL", cS),
          L("Example: TURMERIC likes 20–30 °C and lots of rain", cTur, "think")], { max: 7 })}>
        <Pic slot="field_turmeric" label="A turmeric field under warm sun and rain clouds" x={40} y={60} w={1360} h={740} lt={lt} at={0.1} fx="zoom" kenDur={20} />
        {[["WEATHER", 190, cW], ["TEMPERATURE", 480, cT], ["RAIN", 730, cR], ["SOIL", 890, cS]].map(([t, x, a]) => <Chip key={t} text={t} x={x} y={84} lt={lt} at={a} tone="gold" size={32} />)}
        <SVG op={1}>
          <Sky kind="sun" x={200} y={240} lt={lt} op={pop(lt, cW, 0.6)} s={1.1} />
          <Sky kind="rain" x={520} y={240} lt={lt} op={pop(lt, cR, 0.6)} s={1.4} />
          <Sky kind="rain" x={800} y={210} lt={lt} op={pop(lt, cP, 0.6)} s={1.2} />
          <Sky kind="rain" x={350} y={330} lt={lt} op={pop(lt, cP + 0.25, 0.6)} s={1} />
          <g opacity={therm} transform={`translate(${(1 - therm) * 40} 0)`}>
            <rect x={1110} y={150} width={270} height={630} rx={24} fill="rgba(5,30,22,0.82)" stroke="rgba(255,255,255,0.3)" strokeWidth={2} />
            <rect x={1176} y={yOf(30)} width={68} height={yOf(20) - yOf(30)} fill={SK.gold} opacity={out3(lt, cB, 0.5) * 0.45} />
            <rect x={1192} y={190} width={36} height={530} rx={18} fill={SK.cream} />
            <rect x={1200} y={yOf(fill)} width={20} height={720 - yOf(fill)} fill={HEAT} />
            <circle cx={1210} cy={724} r={36} fill={HEAT} stroke={SK.cream} strokeWidth={6} />
            {[20, 30].map((T) => <g key={T}><line x1={1232} y1={yOf(T)} x2={1256} y2={yOf(T)} stroke={SK.cream} strokeWidth={4} /><text x={1264} y={yOf(T) + 12} fontFamily={SANS} fontWeight="700" fontSize={34} fill={SK.white}>{T} °C</text></g>)}
          </g>
        </SVG>
        <Node slot="soil_moist" label="Rich soil" x={190} y={640} r={120} lt={lt} at={cS} size={26} chipY={724} />
        <Chip text="TURMERIC" x={640} y={560} lt={lt} at={cTur} tone="gold" size={44} />
        <Chip text="Warm" x={640} y={640} lt={lt} at={cWarm} size={30} />
        <Chip text="Plenty of rain" x={640} y={700} lt={lt} at={cP} size={30} />
      </Scene>
    );
  };
}
// b5 — neem: leaves, seeds, oil → crush, mix, spray → caterpillars turn away.
function B5(ctx) {
  return ({ localTime: lt, duration }) => {
    const cProt = W("b5", "protect"), cNeem = W("b5", "neem"), cL = W("b5", "leaves"), cSd = W("b5", "seeds"), cO = W("b5", "oil"), cMade = W("b5", "made"), cWhen = W("b5", "when"),
      cTaste = W("b5", "taste"), cStop = W("b5", "stop");
    const arrive = Easing.easeOutCubic(clamp((lt - cWhen) / Math.max(0.5, cTaste - cWhen + 0.5), 0, 1)), leave = Easing.easeInCubic(clamp((lt - cStop - 0.3) / 2.2, 0, 1));
    const cat = (from, to) => (leave > 0 ? lerp(to, from, leave) : lerp(from, to, arrive));
    const dirA = leave > 0 ? -1 : 1, sniff = windowOp(lt, cTaste, cStop + 0.3, 0.2);
    const stink = windowOp(lt, cTaste + 0.3, cStop + 0.5, 0.2);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[5]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(5, ctx, [L("Leaves · seeds · oil", cNeem), L("→ natural pest repellent", cMade, "big"), L("Insects stop eating the sprayed leaves", cStop, "think")])}>
        <Pic slot="field_neem" label="A neem tree at the edge of a vegetable field" x={40} y={60} w={1360} h={740} lt={lt} at={0.1} out={cNeem} fx="zoom" />
        <Chip text="Farmers grow medicinal plants…" x={720} y={84} lt={lt} at={0.5} out={cProt} size={32} />
        <Chip text="…to PROTECT their crops" x={720} y={84} lt={lt} at={cProt + 0.2} out={cNeem} tone="gold" size={36} />
        {[["neem_leaves", "LEAVES", 300, cL], ["neem_seeds", "SEEDS", 720, cSd], ["neem_oil", "OIL", 1140, cO]].map(([s, l, x, a]) => <Node key={s} slot={s} label={l} x={x} y={190} r={120} lt={lt} at={a} out={cWhen} size={26} tone="gold" chipY={272} />)}
        {[["neem_crush", "CRUSH", 40, cMade], ["neem_mix", "MIX WITH WATER", 500, cMade + 0.7], ["neem_spray", "SPRAY", 960, cMade + 1.4]].map(([s, l, x, a]) => <React.Fragment key={s}>
          <Pic slot={s} label={l} x={x} y={330} w={440} h={470} lt={lt} at={a} out={cWhen} fx="zoom" />
          <Chip text={l} x={x + 220} y={346} lt={lt} at={a + 0.1} out={cWhen} size={28} /></React.Fragment>)}
        <Pic slot="leaf_big" label="A sprayed leaf, close up" x={40} y={60} w={1360} h={740} lt={lt} at={cWhen} fx="zoom" />
        {lt >= cWhen && <SVG op={windowOp(lt, cWhen, duration, 0.4)}>
          <Caterpillar x={cat(-60, 520)} y={500} s={1.25} dir={dirA} lt={lt} sniff={sniff} />
          <Caterpillar x={cat(1500, 960)} y={640} s={1.1} dir={-dirA} lt={lt + 0.4} sniff={sniff} />
          {stink > 0 && <g opacity={stink} stroke={SK.cream} strokeWidth={5} fill="none" strokeLinecap="round">
            {[0, 1, 2].map((i) => <path key={i} d={`M${620 + i * 24} ${420 - i * 10} q 12 -16 0 -32 q -12 -16 0 -32`} />)}
            {[0, 1, 2].map((i) => <path key={i} d={`M${820 + i * 24} ${560 - i * 10} q 12 -16 0 -32 q -12 -16 0 -32`} />)}</g>}
        </SVG>}
        <Chip text="Insects STOP EATING!" x={720} y={84} lt={lt} at={cStop} tone="gold" size={40} />
      </Scene>
    );
  };
}
// Money jar: coins rise with `level` 0→1.
function Jar({ cx, cy, level }) {
  const n = Math.round(level * 14);
  return (
    <g transform={`translate(${cx} ${cy})`}>
      {Array.from({ length: n }, (_, i) => <g key={i} transform={`translate(${(i % 3 - 1) * 34} ${170 - Math.floor(i / 3) * 40 - (i % 2) * 8})`}>
        <ellipse rx={42} ry={18} fill={SK.gold} stroke={SK.goldDeep} strokeWidth={3} /><text y={8} textAnchor="middle" fontFamily={SANS} fontWeight="700" fontSize={22} fill={SK.ink}>₹</text></g>)}
      <path d="M-100 -170 L 100 -170 L 100 -140 Q 130 -120 130 -80 L 130 170 Q 130 200 100 200 L -100 200 Q -130 200 -130 170 L -130 -80 Q -130 -120 -100 -140 Z" fill="rgba(255,255,255,0.14)" stroke={SK.cream} strokeWidth={6} strokeLinejoin="round" />
      <rect x={-112} y={-196} width={224} height={30} rx={10} fill={SK.goldDeep} />
    </g>
  );
}
// b6 — sold at market, the jar fills; green field, birds and bees return; SUSTAINABLE; the leaf break (script scene 7).
function B6(ctx) {
  return ({ localTime: lt, duration }) => {
    const cExtra = W("b6", "extra"), cSpr = W("b6", "and"), cSoil = W("b6", "soil"), cWater = W("b6", "water"), cBees = W("b6", "bees"), cSus = W("b6", "sustainable"), brk = SE("b6", 4) + 0.1;
    const level = clamp((lt - 0.6) / Math.max(1, cSpr - 0.8), 0, 1), f2 = out3(lt, cSpr, 0.6);
    const bee = [0, 1, 2, 3, 4].map((i) => [lerp(1460, 300 + i * 200, Easing.easeOutCubic(clamp((lt - cBees) / 1.6, 0, 1))) + 40 * Math.sin(lt * 1.7 + i * 2), 260 + i * 60 + 34 * Math.cos(lt * 2.3 + i)]);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[6]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(6, ctx, [L("EXTRA INCOME for farmers", cExtra, "big"), L("Natural sprays keep soil, water and bees healthy", cSpr), L("supports SUSTAINABLE farming", cSus, "big")])}>
        <Pic slot="market_herbs" label="She sells neem and tulsi at the market" x={40} y={60} w={930} h={740} lt={lt} at={0.1} out={cSpr + 0.5} fx="zoom" />
        <Card x={990} y={60} w={410} h={740} lt={lt} at={0.3} out={cSpr + 0.5}><div /></Card>
        <SVG op={out3(lt, 0.3, 0.6) * (1 - reveal(lt, cSpr + 0.5, 0.5))}><Jar cx={1195} cy={400} level={level} /></SVG>
        <Chip text="EXTRA income!" x={1195} y={716} lt={lt} at={cExtra} out={cSpr + 0.5} tone="gold" size={32} />
        <Chip text="Neem and tulsi for sale" x={505} y={84} lt={lt} at={0.6} out={cSpr + 0.5} size={30} />
        <Pic slot="field_green" label="Her field stays green; birds and bees return" x={40} y={60} w={1360} h={740} lt={lt} at={cSpr} fx="zoom" op={f2} />
        {[["SOIL", 250, cSoil], ["WATER", 480, cWater], ["BEES", 700, cBees]].map(([t, x, a]) => <Chip key={t} text={t} x={x} y={84} lt={lt} at={a} tone="gold" size={34} />)}
        {lt >= cBees && <SVG op={1}>{bee.map(([x, y], i) => <Bee key={i} x={x} y={y} lt={lt + i} />)}</SVG>}
        <Card x={240} y={620} w={960} h={140} lt={lt} at={cSus} pad={20}>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 60, color: SK.gold, textAlign: "center", marginTop: 6 }}>SUSTAINABLE farming</div>
        </Card>
        <Break lt={lt} at={brk} dur={2.4} />
      </Scene>
    );
  };
}
const Stat = ({ children, size = 34, c = SK.white, top = 0 }) => <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: size, lineHeight: 1.15, color: c, marginTop: top }}>{children}</div>;
// b7 — DO YOU KNOW: China; India's 6,000 plants; neem sprays beside the chemical can.
function B7(ctx) {
  return ({ localTime: lt, duration }) => {
    const cD = S("b7", 0), cC = W("b7", "china"), cLead = W("b7", "leading"), cI = W("b7", "and"), cSix = W("b7", "six"), cTrad = W("b7", "traditional"), cN = W("b7", "and", 1), cW = W("b7", "without");
    const s1 = windowOp(lt, cC, cI, 0.4), s2 = windowOp(lt, cI, cN, 0.4);
    const count = Math.round(6000 * Easing.easeOutCubic(clamp((lt - cSix) / 1.4, 0, 1)));
    const push = Easing.easeInOutCubic(clamp((lt - cW) / 1, 0, 1));
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[7]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(7, ctx, [L("CHINA: one of the world's leading producers of medicinal plants", cC), L("INDIA: more than 6,000 plant species in traditional health care", cI),
          L("Neem-based products are natural pesticides that reduce the need for chemical sprays", cN, "think")])}>
        <Badge text="DO YOU KNOW?" x={50} y={56} lt={lt} at={cD} size={40} />
        <SVG op={s1}>
          <g><Globe cx={310} cy={470} r={250} lon={100} lat={28} lt={lt} glow={{ at: [104, 34], r: 76, op: out3(lt, cC, 0.5) }} /></g>
        </SVG>
        <Chip text="CHINA" x={340} y={290} lt={lt} at={cC + 0.1} out={cI} tone="gold" size={32} />
        <Pic slot="china_terraces" label="China: terraced herb fields" x={600} y={150} w={800} h={320} lt={lt} at={cC + 0.2} out={cI} fx="zoom" />
        <Pic slot="china_market" label="China: a market of dried roots and herbs" x={600} y={490} w={800} h={310} lt={lt} at={cLead} out={cI} fx="zoom" />
        <Chip text="One of the world's LEADING producers" x={1000} y={166} lt={lt} at={cLead + 0.1} out={cI} size={28} tone="gold" />
        <IndiaMap x={70} y={140} s={0.81} id="b7" op={s2}>
          {LEAVES.map((l, i) => { const a = lerp(cI + 0.3, cTrad, l.t), o = pop(lt, a, 0.4); return o > 0 ? <Leaf key={i} x={l.x} y={l.y} s={o * 1.05} rot={l.r} c={l.c} /> : null; })}
        </IndiaMap>
        <Card x={700} y={240} w={680} h={420} lt={lt} at={cI + 0.2} out={cN} pad={40} >
          <Stat size={40} c={SK.gold}>INDIA</Stat>
          <Stat size={110} top={10}>{lt >= cSix ? count.toLocaleString("en-IN") + "+" : ""}</Stat>
          <div style={{ opacity: out3(lt, cSix + 0.5, 0.5) }}><Stat size={40} top={10}>kinds of plants</Stat></div>
          <div style={{ opacity: out3(lt, cTrad, 0.5) }}><Stat size={34} c={SK.leaf} top={12}>used in traditional health care</Stat></div>
        </Card>
        <Pic slot="neem_shelf" label="Neem spray bottles on a farm shelf" x={40} y={150} w={860} h={650} lt={lt} at={cN} fx="zoom" />
        <Chip text="NEEM SPRAYS" x={470} y={170} lt={lt} at={cN + 0.2} tone="gold" size={32} />
        <Pic slot="chem_can" label="A chemical spray can" x={930} y={270} w={380} h={380} lt={lt} at={cN + 0.3} fx="none" op={lerp(1, 0.4, push)}
          style={{ transform: `translate(${push * 70}px, ${push * 90}px) rotate(${push * 9}deg) scale(${lerp(1, 0.8, push)})` }} />
        <Chip text="Less chemical spray" x={1120} y={200} lt={lt} at={cW + 0.3} size={30} />
      </Scene>
    );
  };
}
// b8 — DO YOU KNOW, WORLD: the globe spins to Madagascar; the periwinkle; scientists in the lab.
function B8(ctx) {
  return ({ localTime: lt, duration }) => {
    const cM = W("b8", "madagascar"), cF = W("b8", "small"), cP = W("b8", "periwinkle"), cSc = W("b8", "scientists"), cDev = W("b8", "develop"), cCan = W("b8", "cancers");
    const k = drive(lt, 0.2, cM + 0.5), lon = lerp(130, 46.8, k), lat = lerp(22, -19, k), g = out3(lt, 0.2, 0.7);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[8]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(8, ctx, [L("The MADAGASCAR PERIWINKLE", cM, "big"), L("A small flowering plant", cF), L("Helped scientists develop important medicines", cSc),
          L("…used to treat certain CANCERS", cCan, "think")])}>
        <Badge text="DO YOU KNOW? · WORLD" x={50} y={56} lt={lt} at={0.2} size={40} />
        <SVG op={g}><Globe cx={320} cy={470} r={260} lon={lon} lat={lat} lt={lt} mada={out3(lt, cM, 0.5)} /></SVG>
        <Chip text="MADAGASCAR" x={320} y={760} lt={lt} at={cM + 0.1} tone="gold" size={32} />
        <Pic slot="madagascar" label="The island of Madagascar" x={620} y={150} w={780} h={650} lt={lt} at={cM} out={cF} fx="zoom" />
        <Pic slot="periwinkle" label="The Madagascar periwinkle" x={620} y={150} w={780} h={650} lt={lt} at={cF} fx="zoom" out={cSc} />
        <Chip text="The PERIWINKLE" x={1010} y={170} lt={lt} at={cP} out={cSc} tone="gold" size={34} />
        <Pic slot="lab_periwinkle" label="Scientists study the plant in a lab" x={620} y={150} w={780} h={650} lt={lt} at={cSc} fx="zoom" />
        <Chip text="Scientists studied this plant" x={1010} y={170} lt={lt} at={cSc + 0.2} out={cDev} size={30} />
        <Chip text="Important medicines" x={1010} y={170} lt={lt} at={cDev + 0.2} size={32} tone="gold" />
        <Chip text="for certain CANCERS" x={1010} y={720} lt={lt} at={cCan} size={36} tone="gold" />
      </Scene>
    );
  };
}
// b9 — the red SAFETY FIRST card (the only red in the video); Stop 3.
function B9(ctx) {
  return ({ localTime: lt, duration }) => {
    const cB = S("b9", 0), cP = W("b9", "poisonous"), cE = W("b9", "even"), cO = W("b9", "only"), cN = W("b9", "never"), cA = W("b9", "adult"), at = stopStart("b9");
    const main = 1 - reveal(lt, at - 0.3, 0.3), sign = pop(lt, cE, 0.6) * main, o = pop(lt, cB, 0.7);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[9]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(9, ctx, [L("Some medicinal plants are POISONOUS if eaten", cP, "big"), L("Only experts and doctors make medicines", cO),
          L("NEVER taste a plant without asking an adult", cN, "think")])}>
        <div style={{ position: "absolute", left: 40, top: 60, width: 1360, height: 200, borderRadius: 22, background: SK.cream, opacity: o, transform: `scale(${0.94 + 0.06 * o})`, boxSizing: "border-box",
          border: `10px solid ${RED}`, boxShadow: "0 10px 28px rgba(0,0,0,0.35)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 68, letterSpacing: "0.04em", color: RED }}>SAFETY FIRST!</div>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 36, color: SK.ink, marginTop: 4, opacity: out3(lt, cP, 0.4) }}>Some medicinal plants are POISONOUS if eaten</div>
        </div>
        <Pic slot="periwinkle" label="The periwinkle" x={40} y={285} w={440} h={515} lt={lt} at={cP} fx="zoom" />
        <SVG op={sign}>
          <g transform={`translate(396 368) scale(${0.8 + 0.2 * sign})`}><circle r={62} fill="rgba(255,255,255,0.85)" stroke={RED} strokeWidth={14} /><line x1={-44} y1={-44} x2={44} y2={44} stroke={RED} strokeWidth={14} /></g>
        </SVG>
        <Chip text="DO NOT EAT" x={260} y={716} lt={lt} at={cE + 0.1} out={at - 0.3} tone="gold" size={32} />
        <Pic slot="doctor" label="A doctor smiles and nods" x={500} y={285} w={440} h={515} lt={lt} at={cO} fx="zoom" />
        <Chip text="Experts and doctors" x={720} y={716} lt={lt} at={cO + 0.2} out={at - 0.3} tone="gold" size={30} />
        <Pic slot="child_asks" label="A child stops and asks a parent" x={960} y={285} w={440} h={515} lt={lt} at={cN} fx="zoom" />
        <Chip text="Ask a trusted adult" x={1180} y={716} lt={lt} at={cA} out={at - 0.3} tone="gold" size={30} />
        <StopBox lt={lt} b="b9" n={3} y={290} h={510}>
          <StopQ size={60}>Why should we never taste a plant we don't know?</StopQ>
        </StopBox>
      </Scene>
    );
  };
}
// b10 — neem glows between the shelf and the field; the answer; Quick check (Stop 4).
const QUICK = ["What are medicinal plants?", "Name three medicinal plants.", "Which parts of neem are used to protect crops?", "How do medicinal plants help farmers earn more?", "Which flower from Madagascar helped scientists make cancer medicines?"];
function B10(ctx) {
  return ({ localTime: lt, duration }) => {
    const cL = W("b10", "look"), cH = W("b10", "herbal"), cP = W("b10", "protects"), cM = W("b10", "medicinal"), cE = W("b10", "earn"), cF = W("b10", "farms"), at = stopStart("b10"), hold = holdOf("b10");
    const main = 1 - reveal(lt, at - 0.3, 0.35), o = windowOp(lt, at - 0.2, at + hold + 0.3, 0.35), glow = out3(lt, cL, 0.7);
    const P3 = [["HEALING", SK.leaf, cM], ["INCOME", SK.gold, cE], ["SUSTAINABLE FARMING", WATER, cF]];
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[10]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(10, ctx, [L("ANSWER:", cL, "head"), L("NEEM is used for herbal products…", cH), L("…AND to protect crops naturally", cP),
          L("MEDICINAL PLANTS = healing + income + sustainable farming", cM, "big")])}>
        <div style={{ position: "absolute", inset: 0, opacity: main }}>
          <Pic slot="courtyard" label="The courtyard from the start" x={40} y={60} w={460} h={470} lt={lt} at={0.1} out={cH + 0.2} fx="zoom" />
          <Pic slot="shop_shelf" label="A herbal product on a shelf" x={40} y={60} w={460} h={470} lt={lt} at={cH} fx="zoom" />
          <Pic slot="field_neem" label="The farm from the start" x={940} y={60} w={460} h={470} lt={lt} at={0.1} out={cP + 0.2} fx="zoom" />
          <Pic slot="field_green" label="The healthy field" x={940} y={60} w={460} h={470} lt={lt} at={cP} fx="zoom" />
          <SVG op={1}>
            <circle cx={720} cy={295} r={205 + 10 * Math.sin(lt * 2.4)} fill={SK.gold} opacity={0.3 * glow} />
            <Arr x1={548} y1={295} x2={506} y2={295} lt={lt} at={cH} /><Arr x1={892} y1={295} x2={934} y2={295} lt={lt} at={cP} />
          </SVG>
          <Node slot="neem_tree" label="NEEM" x={720} y={295} r={175} lt={lt} at={cL} size={36} tone="gold" chipY={410} />
          <Chip text="HERBAL PRODUCTS" x={270} y={78} lt={lt} at={cH + 0.2} tone="gold" size={28} />
          <Chip text="PROTECTS CROPS" x={1170} y={78} lt={lt} at={cP + 0.2} tone="gold" size={28} />
          <Card x={40} y={560} w={1360} h={240} lt={lt} at={cM - 0.1} pad={26}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24, height: "100%" }}>
              {P3.map(([t, c, a], i) => <React.Fragment key={t}>
                {i > 0 && <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 56, color: SK.white, opacity: pop(lt, a, 0.5) }}>+</span>}
                <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 50, color: SK.ink, background: c, padding: "8px 28px", borderRadius: 16, whiteSpace: "nowrap", opacity: pop(lt, a, 0.5) }}>{t}</span></React.Fragment>)}
            </div>
          </Card>
        </div>
        {o > 0 && <div style={{ position: "absolute", left: 40, top: 60, width: 1360, height: 740, borderRadius: 26, background: "rgba(5,30,22,0.93)", opacity: o, boxShadow: "0 0 0 3px rgba(226,176,76,0.9)", padding: "32px 60px", boxSizing: "border-box" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
            <svg width="66" height="66" viewBox="0 0 90 90"><circle cx="45" cy="45" r="43" fill={SK.gold} /><rect x="28" y="24" width="12" height="42" rx="4" fill={SK.ink} /><rect x="50" y="24" width="12" height="42" rx="4" fill={SK.ink} /></svg>
            <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 46, color: SK.white }}>QUICK CHECK</div>
          </div>
          {QUICK.map((q, i) => <div key={i} style={{ display: "flex", gap: 20, alignItems: "baseline", marginTop: i === 0 ? 26 : 13, opacity: out3(lt, at + 0.2 + i * 0.25, 0.5) }}>
            <span style={{ flex: "none", width: 40, fontFamily: SERIF, fontWeight: 700, fontSize: 38, color: SK.gold }}>{i + 1}</span>
            <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 36, lineHeight: 1.16, color: SK.white, background: "rgba(255,255,255,0.08)", padding: "7px 22px", borderRadius: 14 }}>{q}</span></div>)}
          <div style={{ position: "absolute", left: 60, bottom: 26, fontFamily: SANS, fontSize: 25, color: SK.dim }}>Stop 4 of 4 · press play to continue</div>
          <Count lt={lt} at={at} hold={hold} x={1230} y={24} />
        </div>}
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
const COLLAGE = [{ slot: "courtyard", x: -60, y: -40, w: 760, h: 520, ph: 0 }, { slot: "field_neem", x: 640, y: -80, w: 760, h: 520, ph: 2 },
  { slot: "field_turmeric", x: -80, y: 520, w: 700, h: 560, ph: 4 }, { slot: "periwinkle", x: 560, y: 560, w: 820, h: 560, ph: 1 }];
function MedScenes(props = {}) {
  const caps = props.showCaptions === "false" ? false : props.showCaptions !== false;
  const titles = {};
  for (let n = 1; n <= NB; n++) titles[n] = str(props["title" + n + "Text"], TITLES[n]);
  const ctx = { caps, titles, capSize: num(props.captionSize, 34) };
  const B = [B1, B2, B3, B4, B5, B6, B7, B8, B9, B10];
  const beats = B.map((Bn, i) => { const t = BEAT("b" + (i + 1)); return [t.start, t.start + t.dur, Bn]; });
  return (
    <StoryFrame props={props} dur={DUR} persistKey="thinkpro-lp12-medicinal-plants" collage={COLLAGE}>
      {beats.map(([s, e, Bn], i) => (
        <Sprite key={i} start={s} end={e}>{Bn(ctx)}</Sprite>
      ))}
      {STOPS.map(([b, i, hold]) => <StopAt key={b} t={BEAT(b).start + stopAt(b, i)} hold={hold - 0.2} />)}
      <ChimeAt t={BEAT("b7").start + LEAD - 0.35} />
      <ChimeAt t={BEAT("b8").start + LEAD - 0.35} />
      <AudioSync />
    </StoryFrame>
  );
}
window.MedScenes = MedScenes;
