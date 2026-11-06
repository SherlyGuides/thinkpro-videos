/* global React, window */
// ThinkPro Academy — "Types of Food Grains" (Grade 6 Agriculture, Session 9, V1).
// After AG_G6_S9_Video_Script_Types_of_Food_Grains (Draft 1, 3 Nov 2026): 11 script scenes as 10 beats
// (scene 8's leaf break closes b7), four presenter stops (silent holds — the web player freezes there,
// TPStory.StopAt), a WOW card and a "Did you know?" world tour. Central models: the two LUNCH PLATES
// (b1 → b10, plate turns into its field) and a drawn INDIA MAP that colours in by grain (b3, b6, stop 3).
// Grain colours are fixed: rice white, wheat gold, millets brown-orange, pulses green, maize yellow.
// STORY STYLE (engine/story-kit.jsx). Pure function of time.
const { Sprite, Easing } = window;
const { reveal, windowOp } = window.TPMotion;
const { num, str } = window.TPStage;
const { SK, SERIF, SANS, LEFT_W, pop, out3, lerp, drive,
  Pic, Chip, Badge, Big, Card, SVG, Arrow, T, ChimeAt, Scene, StoryFrame, StopAt, Break } = window.TPStory;

// ---- Timing: EVERYTHING is keyed to the narration (tools/fit_timing.py → timing.js).
const TM = window.TP_TIMING;
if (!TM) console.error("timing.js missing — run: python3 tools/fit_timing.py videos/lp9-types-of-food-grains");
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
const NB = 10;
const CAPS = {};
if (TM) for (let n = 1; n <= NB; n++) CAPS[n] = capsFor("b" + n);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// ---- Panel copy. Title defaults mirror the DC data-props (titleNText) — keep in sync. ----
const TITLES = { 1: "LP9 – Types of food grains", 2: "What are food grains?", 3: "Food follows farms", 4: "Punjab: wheat", 5: "Tamil Nadu: rice",
  6: "Rice, wheat and millets", 7: "WOW!", 8: "Did you know?", 9: "One grain, one culture", 10: "The answer" };
const KICK = "Grade 6 · Agriculture · Session 9";
const KICKS = { 7: "Wow fact", 8: "Did you know?", 10: "Big question answered" };
const panel = (n, ctx, lines, extra = {}) => ({ kicker: KICKS[n] || KICK, title: ctx.titles[n], lines, ...extra });
const L = (text, at, kind = "item", extra = {}) => ({ text, at, kind, ...extra });

// ---- Grain colours (the same every time a grain appears) ----
const GC = { rice: "#F4F1E6", wheat: "#E2B04C", millet: "#C8743A", pulse: "#6FBF6E", maize: "#F2D13B" };
const GINK = { rice: "#9C9682", wheat: "#9E7320", millet: "#7E4220", pulse: "#3E7E3D", maize: "#A88A12" };

// ---- Presenter stops: [beat, sentence index whose pauseAfter is the hold, hold s]
const STOPS = [["b1", 3, 5.0], ["b2", 4, 6.0], ["b7", 2, 5.0], ["b10", 3, 7.5]];
const stopAt = (b, i) => SE(b, i) + 0.1;                       // beat-local start of the hold
const stopFor = (b) => STOPS.find((s) => s[0] === b);
const stopStart = (b) => stopAt(b, stopFor(b)[1]);
const stopHold = (b) => stopFor(b)[2] - 0.2;

// ---- Shared pieces ---------------------------------------------------------------
// "Pause and discuss" box: a compact card so the frozen scene stays visible behind/next to it.
function StopBox({ lt, b, n, head = "PAUSE AND DISCUSS", x = 40, y = 560, w = 1360, h = 360, children }) {
  const at = stopStart(b), hold = stopHold(b);
  const o = windowOp(lt, at, at + hold, 0.35); if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 26, background: "rgba(5,30,22,0.92)", opacity: o, boxSizing: "border-box",
      boxShadow: "0 0 0 3px rgba(226,176,76,0.9), 0 10px 30px rgba(0,0,0,0.4)", padding: "30px 44px", transform: `translateY(${(1 - o) * 16}px)` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <svg width="62" height="62" viewBox="0 0 90 90"><circle cx="45" cy="45" r="43" fill={SK.gold} /><rect x="28" y="24" width="12" height="42" rx="4" fill={SK.ink} /><rect x="50" y="24" width="12" height="42" rx="4" fill={SK.ink} /></svg>
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 28, letterSpacing: "0.08em", color: SK.ink, background: SK.gold, padding: "8px 26px", borderRadius: 14 }}>{head}</div>
      </div>
      {children}
      <div style={{ position: "absolute", left: 44, bottom: 22, fontFamily: SANS, fontSize: 23, color: SK.dim }}>Stop {n} of 4</div>
    </div>
  );
}
const StopQ = ({ children, size = 46 }) => <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: size, lineHeight: 1.2, color: SK.white, marginTop: 24 }}>{children}</div>;

// Round photo with a label chip under it.
function Node({ slot, label, x, y, r = 60, lt, at, size = 22, out = null, ring = SK.cream }) {
  const o = pop(lt, at, 0.6) * (out != null ? 1 - reveal(lt, out, 0.4) : 1); if (o <= 0) return null;
  return (
    <React.Fragment>
      <Pic slot={slot} label={label} x={x - r} y={y - r} w={2 * r} h={2 * r} r={r} lt={lt} at={at} out={out} fx="pop" style={{ boxShadow: "0 0 0 4px " + ring }} />
      <Chip text={label} x={x} y={y + r + 10} lt={lt} at={at + 0.15} out={out} size={size} />
    </React.Fragment>
  );
}
function Arr({ x1, y1, x2, y2, lt, at, color = SK.gold, sw = 6, out = null }) {
  return <Arrow x1={x1} y1={y1} x2={x2} y2={y2} color={color} sw={sw} op={out3(lt, at, 0.5) * (out != null ? 1 - reveal(lt, out, 0.4) : 1)} />;
}
// Grain-coloured pill (a grain name in its own colour).
function GPill({ text, g, x, y, lt, at, out = null, size = 26, bob = 0 }) {
  const o = pop(lt, at) * (out != null ? 1 - reveal(lt, out, 0.4) : 1); if (o <= 0) return null;
  const dy = bob ? bob * Math.sin(lt * 2.2 + x * 0.01) : 0;
  return (
    <div style={{ position: "absolute", left: x, top: y + dy, transform: `translateX(-50%) scale(${0.9 + 0.1 * o})`, opacity: o, display: "flex", alignItems: "center", gap: 10,
      fontFamily: SANS, fontWeight: 700, fontSize: size, color: SK.ink, background: SK.cream, padding: "6px 18px 6px 10px", borderRadius: 999, whiteSpace: "nowrap",
      boxShadow: `0 0 0 3px ${GC[g]}, 0 2px 10px rgba(0,0,0,0.25)` }}>
      <svg width="30" height="22" viewBox="-15 -11 30 22"><ellipse rx="12" ry="8" fill={GC[g]} stroke={GINK[g]} strokeWidth="2" transform="rotate(-20)" /></svg>{text}
    </div>
  );
}
// Rising steam over a hot dish.
function Steam({ x, y, lt, op = 1, n = 3, gap = 46 }) {
  if (op <= 0) return null;
  return (
    <SVG op={op}>
      {Array.from({ length: n }, (_, i) => { const p = ((lt * 0.35) + i / n) % 1, sx = x + (i - (n - 1) / 2) * gap;
        return <path key={i} d={`M${sx} ${y - p * 120} q 14 -20 0 -40 q -14 -20 0 -40`} stroke="rgba(255,255,255,0.85)" strokeWidth={5} fill="none" strokeLinecap="round" opacity={Math.sin(p * Math.PI) * 0.8} />; })}
    </SVG>
  );
}
// Slide-in wrapper (from left/right) for the plates.
const Slide = ({ lt, at, from = -1, children, out = null }) => {
  const p = Easing.easeOutCubic(reveal(lt, at, 0.9));
  const o = out != null ? 1 - reveal(lt, out, 0.5) : 1;
  if (p <= 0 || o <= 0) return null;
  return <div style={{ position: "absolute", inset: 0, transform: `translateX(${from * (1 - p) * 500}px)`, opacity: o }}>{children}</div>;
};

// ---- The INDIA MAP (official outline + islands: india-map.js, copied from LP5) ---------------
const MAP = window.LP5_MAP;
if (!MAP) console.error("india-map.js missing");
const PLACES = { punjab: [75.4, 30.9], rajasthan: [72.8, 26.6], tamilnadu: [78.4, 11.0], bengal: [87.8, 23.2], deccan: [76.6, 17.0], north: [79, 27.5], east: [85.5, 21.5] };
// x,y = the map's top-left on stage, k = stage px per degree of latitude (india-map.js is drawn at MAP.k).
const proj = (x, y, k) => ([lon, lat]) => [x + (lon - MAP.lon0) * k * MAP.cos, y + (MAP.lat0 - lat) * k];
// colour = { wheat, rice, millet } fill amounts 0..1 (the grain zones colour in).
function IndiaMap({ x, y, k = 26, lt, at, colour = {}, op = 1, id = "m", children }) {
  const o = out3(lt, at, 0.8) * op; if (o <= 0) return null;
  const P = proj(x, y, k), s = k / MAP.k, tf = `translate(${x} ${y}) scale(${s})`;
  const land = [MAP.outline, ...MAP.islands];
  const E = (lon, lat, rx, ry, fill, a) => { const [cx, cy] = P([lon, lat]); return a > 0 ? <ellipse cx={cx} cy={cy} rx={rx * k * MAP.cos * (0.6 + 0.4 * a)} ry={ry * k * (0.6 + 0.4 * a)} fill={fill} opacity={0.92 * a} /> : null; };
  const w = colour.wheat || 0, r = colour.rice || 0, m = colour.millet || 0;
  return (
    <SVG op={o}>
      <defs><clipPath id={"india-" + id}>{land.map((d, i) => <path key={i} d={d} transform={tf} />)}</clipPath></defs>
      <g transform={tf}>{land.map((d, i) => <path key={i} d={d} fill="#2E7A4F" />)}</g>
      <g clipPath={`url(#india-${id})`}>
        {E(76.5, 30, 7, 4.5, GC.wheat, w)}{E(73, 23, 3.2, 3, GC.wheat, w)}
        {E(87.5, 23.5, 6, 4.5, GC.rice, r)}{E(93.5, 26, 4, 3, GC.rice, r)}{E(78.5, 11.5, 4.2, 4, GC.rice, r)}{E(83.5, 19.5, 3, 2.5, GC.rice, r)}
        {E(72.5, 26.3, 3.6, 3.2, GC.millet, m)}{E(76.4, 17, 3, 2.4, GC.millet, m)}
      </g>
      <g transform={tf}>{land.map((d, i) => <path key={i} d={d} fill="none" stroke={SK.cream} strokeWidth={(i ? 2.2 : 4) / s} strokeLinejoin="round" />)}</g>
      {children && children(P)}
    </SVG>
  );
}
// Small map icons.
function Thermo({ x, y, s = 1 }) {
  return <g transform={`translate(${x} ${y}) scale(${s})`}><rect x={-12} y={-70} width={24} height={80} rx={12} fill={SK.cream} stroke={SK.ink} strokeWidth={4} />
    <rect x={-5} y={-50} width={10} height={60} rx={5} fill="#D9452B" /><circle cx={0} cy={20} r={20} fill="#D9452B" stroke={SK.ink} strokeWidth={4} /></g>;
}
function SoilIcon({ x, y, s = 1 }) {
  return <g transform={`translate(${x} ${y}) scale(${s})`}><path d="M-46 20 Q -40 -30 0 -36 Q 40 -30 46 20 Z" fill="#7A5236" stroke={SK.ink} strokeWidth={4} />
    {[[-20, -8], [8, -18], [22, 4], [-4, 6], [-28, 10]].map(([a, b], i) => <circle key={i} cx={a} cy={b} r={4} fill="#4E3422" />)}
    <path d="M-56 22 Q 0 40 56 22" stroke={SK.cream} strokeWidth={6} fill="none" strokeLinecap="round" /></g>;
}
function DropIcon({ x, y, s = 1 }) {
  return <g transform={`translate(${x} ${y}) scale(${s})`}><path d="M0 -50 C 20 -20, 34 0, 34 16 A 34 34 0 0 1 -34 16 C -34 0, -20 -20, 0 -50 Z" fill="#5BB6E8" stroke={SK.ink} strokeWidth={4} />
    <path d="M-14 10 A 16 16 0 0 0 -2 30" stroke="#fff" strokeWidth={5} fill="none" strokeLinecap="round" /></g>;
}
// Glass jar that fills with grains (f 0→1); colours = grain colour keys.
function Jar({ cx, bottom, w = 260, h = 320, f, colours, lt, at, pour = 0, label, labelAt, g }) {
  const o = out3(lt, at, 0.6); if (o <= 0) return null;
  const x0 = cx - w / 2, top = bottom - h, neck = 40;
  const rows = Math.floor((h - neck - 20) / 13), lvl = Math.round(f * rows), cols = Math.floor((w - 30) / 18);
  const grains = [];
  for (let r = 0; r < lvl; r++) for (let c = 0; c < cols; c++) {
    const k = (r * 7 + c * 13 + r * c) % colours.length, gx = x0 + 22 + c * 18 + (r % 2 ? 9 : 0), gy = bottom - 16 - r * 13;
    if (gx > x0 + w - 16) continue;
    grains.push(<ellipse key={r + "-" + c} cx={gx} cy={gy} rx={8} ry={5.5} fill={GC[colours[k]]} stroke={GINK[colours[k]]} strokeWidth={1.2} transform={`rotate(${((r * 31 + c * 17) % 50) - 25} ${gx} ${gy})`} />);
  }
  const lvlY = bottom - 16 - lvl * 13;
  return (
    <SVG op={o}>
      <defs><clipPath id={"jar-" + g}><rect x={x0 + 8} y={top + neck} width={w - 16} height={h - neck - 6} rx={26} /></clipPath></defs>
      <rect x={x0} y={top + neck - 8} width={w} height={h - neck + 8} rx={34} fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.75)" strokeWidth={5} />
      <rect x={x0 + 40} y={top} width={w - 80} height={neck} rx={10} fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.75)" strokeWidth={5} />
      <g clipPath={`url(#jar-${g})`}>{grains}</g>
      {pour > 0 && Array.from({ length: 14 }, (_, i) => { const p = ((lt * 1.6) + i / 14) % 1, py = lerp(top - 120, Math.max(top + 20, lvlY), p);
        const ck = colours[i % colours.length]; return <ellipse key={i} cx={cx + Math.sin(i * 2.3) * 10} cy={py} rx={7} ry={5} fill={GC[ck]} stroke={GINK[ck]} strokeWidth={1} opacity={pour} />; })}
      <path d={`M${x0 + 20} ${top + neck + 20} L ${x0 + 20} ${bottom - 30}`} stroke="rgba(255,255,255,0.35)" strokeWidth={8} strokeLinecap="round" />
      {label && <g opacity={pop(lt, labelAt, 0.5)}>
        <rect x={cx - 110} y={top + neck + 40} width={220} height={56} rx={12} fill={SK.cream} stroke={GC[g]} strokeWidth={5} />
        <text x={cx} y={top + neck + 80} textAnchor="middle" fontFamily={SERIF} fontWeight="700" fontSize="32" fill={SK.ink}>{label}</text></g>}
    </SVG>
  );
}

// ============================================================================
// b1 — two lunch plates, the big question, STOP 1
function B1(ctx) {
  return ({ localTime: lt, duration }) => {
    const cLook = S("b1", 0), cPunjab = W("b1", "punjab"), cRotis = W("b1", "rotis"), cTN = W("b1", "tamil"), cRice = W("b1", "rice"), cQ = W("b1", "question"),
      cWhy = W("b1", "why"), cWhile = W("b1", "while"), at = stopStart("b1");
    const qOut = at;
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[1]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(1, ctx, [L("TYPES OF FOOD GRAINS", 0.4, "head"), L("Punjab: hot, soft ROTIS", cPunjab), L("Tamil Nadu: a big heap of RICE", cTN), L("BIG QUESTION", cQ, "head"),
          L("Why do people in Punjab eat roti, while people in Tamil Nadu eat rice?", cWhy, "big"), L("Make a guess!", at, "think")], { max: 7 })}>
        <Slide lt={lt} at={cLook} from={-1}>
          <Pic slot="plate_punjab" label="Punjab: rotis, dal, sarson ka saag" x={40} y={60} w={660} h={460} lt={lt} at={cLook} fx="zoom" />
          <Chip text="PUNJAB" x={370} y={80} lt={lt} at={cPunjab} tone="gold" size={30} />
          <Chip text="hot, soft ROTIS" x={370} y={455} lt={lt} at={cRotis} size={28} />
        </Slide>
        <Steam x={370} y={250} lt={lt} op={out3(lt, cLook + 0.8, 0.8)} />
        <Slide lt={lt} at={cLook + 0.5} from={1}>
          <Pic slot="plate_tn" label="Tamil Nadu: rice, sambar, rasam on a banana leaf" x={740} y={60} w={660} h={460} lt={lt} at={cLook + 0.5} fx="zoom" />
          <Chip text="TAMIL NADU" x={1070} y={80} lt={lt} at={cTN} tone="gold" size={30} />
          <Chip text="a big heap of RICE" x={1070} y={455} lt={lt} at={cRice} size={28} />
        </Slide>
        <Steam x={1070} y={250} lt={lt} op={out3(lt, cLook + 1.3, 0.8)} />
        <Card x={40} y={560} w={1360} h={340} lt={lt} at={cQ} out={qOut} pad={34}>
          <Badge text="BIG QUESTION" x={34} y={30} lt={lt} at={cQ} size={30} />
          <div style={{ position: "absolute", left: 34, top: 120, width: 1290, fontFamily: SERIF, fontWeight: 700, fontSize: 54, lineHeight: 1.22, color: SK.white }}>
            <span style={{ opacity: out3(lt, cWhy, 0.5) }}>Why does Punjab eat <span style={{ color: GC.wheat }}>roti</span>,</span>{" "}
            <span style={{ opacity: out3(lt, cWhile, 0.5) }}>while Tamil Nadu eats <span style={{ color: GC.rice }}>rice</span>?</span></div>
        </Card>
        <StopBox lt={lt} b="b1" n={1}>
          <StopQ size={52}>Why do you think the plates are different? Make a guess.</StopQ>
        </StopBox>
      </Scene>
    );
  };
}
// b2 — food grains = seeds we eat; three jars fill: cereals, millets, pulses; STOP 2 (sorting game)
function B2(ctx) {
  return ({ localTime: lt, duration }) => {
    const cFG = W("b2", "food"), cSeeds = W("b2", "seeds"), cRice = W("b2", "rice"), cWheat = W("b2", "wheat"), cMaize = W("b2", "maize"), cCer = W("b2", "cereals"),
      cJowar = W("b2", "jowar"), cBajra = W("b2", "bajra"), cRagi = W("b2", "ragi"), cMil = W("b2", "millets"), cSmall = W("b2", "small"), cDals = W("b2", "dals"),
      cMoong = W("b2", "moong"), cChana = W("b2", "chana"), cToor = W("b2", "toor"), cPul = W("b2", "pulses"), at = stopStart("b2");
    const fill = (a, b) => drive(lt, a, b), pourOp = (a, b) => windowOp(lt, a, b, 0.3);
    const jars = [
      { cx: 260, g: "wheat", label: "CEREALS", labelAt: cCer, colours: ["rice", "wheat", "maize"], a: cRice, b: cCer + 0.8 },
      { cx: 720, g: "millet", label: "MILLETS", labelAt: cMil, colours: ["millet", "millet", "wheat"], a: cJowar, b: cMil + 0.8 },
      { cx: 1180, g: "pulse", label: "PULSES", labelAt: cPul, colours: ["pulse", "pulse", "maize"], a: cMoong, b: cPul + 0.8 },
    ];
    const nOut = at;
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[2]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(2, ctx, [L("FOOD GRAINS = seeds of plants that we eat", cSeeds, "big"), L("CEREALS: rice, wheat, maize", cCer), L("MILLETS: jowar, bajra, ragi – small, tough grains", cMil),
          L("PULSES (dals): moong, chana, toor", cPul), L("Sort the grains into their jars!", at, "think")], { max: 7 })}>
        <Card x={40} y={50} w={1360} h={110} lt={lt} at={cFG} out={at} pad={0}>
          <div style={{ display: "flex", alignItems: "center", height: "100%", padding: "0 34px", gap: 24, fontFamily: SERIF, fontWeight: 700, fontSize: 44, color: SK.white }}>
            <span style={{ color: SK.gold }}>FOOD GRAINS</span><span style={{ opacity: out3(lt, cSeeds, 0.5) }}>= the seeds of plants that we eat</span></div>
        </Card>
        {jars.map((j) => <Jar key={j.g} cx={j.cx} bottom={560} w={280} h={360} lt={lt} at={j.a - 0.6} f={fill(j.a, j.b)} pour={pourOp(j.a, j.b)}
          colours={j.colours} g={j.g} label={j.label} labelAt={j.labelAt} />)}
        <Chip text="small, tough grains" x={720} y={575} lt={lt} at={cSmall} out={nOut} tone="gold" size={24} />
        {/* the grains of each jar */}
        <Node slot="crop_rice" label="rice" x={135} y={690} r={52} lt={lt} at={cRice} out={nOut} ring={GC.rice} />
        <Node slot="crop_wheat" label="wheat" x={260} y={690} r={52} lt={lt} at={cWheat} out={nOut} ring={GC.wheat} />
        <Node slot="crop_maize" label="maize" x={385} y={690} r={52} lt={lt} at={cMaize} out={nOut} ring={GC.maize} />
        <Node slot="millet_jowar" label="jowar" x={595} y={690} r={52} lt={lt} at={cJowar} out={nOut} ring={GC.millet} />
        <Node slot="millet_bajra" label="bajra" x={720} y={690} r={52} lt={lt} at={cBajra} out={nOut} ring={GC.millet} />
        <Node slot="millet_ragi" label="ragi" x={845} y={690} r={52} lt={lt} at={cRagi} out={nOut} ring={GC.millet} />
        <Pic slot="pulses_bowls" label="moong, chana and toor dal" x={990} y={630} w={380} h={130} lt={lt} at={cDals} out={nOut} fx="pop" style={{ boxShadow: "0 0 0 4px " + GC.pulse }} />
        {[["moong", cMoong], ["chana", cChana], ["toor", cToor]].map(([t, a], i) => <Chip key={t} text={t} x={1055 + i * 125} y={772} lt={lt} at={a} out={nOut} size={22} />)}
        {/* STOP 2: loose grains float beside the jars */}
        <StopBox lt={lt} b="b2" n={2} head="HAVE YOU UNDERSTOOD?" x={40} y={30} w={1360} h={170}>
          <div style={{ position: "absolute", left: 600, top: 38, fontFamily: SERIF, fontWeight: 700, fontSize: 44, color: SK.white }}>Put each grain in its jar!</div>
        </StopBox>
        {[["wheat", "wheat"], ["ragi", "millet"], ["moong", "pulse"], ["rice", "rice"], ["bajra", "millet"], ["chana", "pulse"]].map(([t, g], i) =>
          <GPill key={t} text={t} g={g} x={170 + i * 220} y={680} lt={lt} at={at + 0.2 + i * 0.12} out={at + stopHold("b2")} size={32} bob={8} />)}
      </Scene>
    );
  };
}
// b3 — food follows farms: climate, soil, water on the map → grains
function B3(ctx) {
  return ({ localTime: lt, duration }) => {
    const cWhy = S("b3", 0), cCl = W("b3", "climate"), cSoil = W("b3", "soil"), cWater = W("b3", "water"), cGrow = W("b3", "grow", 1), cEat = W("b3", "eat");
    const k = 26, mx = 60, my = 45, P = proj(mx, my, k);
    const rise = (a) => -50 * Easing.easeOutBack(reveal(lt, a, 0.7));
    const items = [
      { at: cCl, place: "rajasthan", Icon: Thermo, word: "CLIMATE", node: ["millet_bajra", "millets", 420, GC.millet] },
      { at: cSoil, place: "punjab", Icon: SoilIcon, word: "SOIL", chipDx: 112, chipDy: -30, node: ["crop_wheat", "wheat", 200, GC.wheat] },
      { at: cWater, place: "tamilnadu", Icon: DropIcon, word: "WATER", node: ["crop_rice", "rice", 640, GC.rice] },
    ];
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[3]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(3, ctx, [L("Why do food habits change across India?", cWhy, "head"), L("People grow the crops that suit their local:", cCl - 0.6, "plain"),
          L("CLIMATE", cCl), L("SOIL", cSoil), L("WATER", cWater), L("What they GROW, they EAT!", cGrow, "big")], { max: 7 })}>
        <IndiaMap x={mx} y={my} k={k} lt={lt} at={0.2} id="b3">{(Pm) => items.map((it) => { const [x, y] = Pm(PLACES[it.place]); const o = pop(lt, it.at, 0.6);
          return <g key={it.word} opacity={o}><circle cx={x} cy={y} r={10} fill={SK.gold} stroke={SK.ink} strokeWidth={3} />
            <g transform={`translate(0 ${rise(it.at)})`}><circle cx={x} cy={y - 10} r={50} fill="rgba(5,30,22,0.75)" stroke={SK.gold} strokeWidth={3} /><it.Icon x={x} y={y - 6} s={0.62} /></g></g>; })}</IndiaMap>
        {items.map((it) => { const [x, y] = P(PLACES[it.place]); const [slot, lab, ny, col] = it.node;
          return <React.Fragment key={it.word}>
            <SVG op={1}><Arr x1={x + 60} y1={y - 60} x2={1050} y2={ny} lt={lt} at={it.at + 0.4} /></SVG>
            <Chip text={it.word} x={x + (it.chipDx || 0)} y={y + (it.chipDy == null ? 18 : it.chipDy)} lt={lt} at={it.at + 0.1} tone="gold" size={24} />
            <Node slot={slot} label={lab} x={1160} y={ny} r={72} lt={lt} at={it.at + 0.6} size={26} ring={col} />
          </React.Fragment>; })}
        <Card x={720} y={790} w={600} h={110} lt={lt} at={cGrow} pad={0}>
          <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SERIF, fontWeight: 700, fontSize: 44, color: SK.white }}>
            What they GROW,&nbsp;<span style={{ color: SK.gold, opacity: out3(lt, cEat, 0.4) }}>they EAT!</span></div>
        </Card>
      </Scene>
    );
  };
}
// Food chain row: photo tiles with arrows, revealed on cue words.
function Chain({ lt, steps, y = 600, w = 300, h = 210, x0 = 40, gap = 53 }) {
  return (
    <React.Fragment>
      <SVG op={1}>{steps.slice(1).map((s, i) => { const x = x0 + (i + 1) * (w + gap); return <Arr key={i} x1={x - gap + 6} y1={y + h / 2} x2={x - 6} y2={y + h / 2} lt={lt} at={s.at - 0.15} sw={5} />; })}</SVG>
      {steps.map((s, i) => { const puff = s.puff ? 1 + 0.06 * Math.max(0, Math.sin((lt - s.at) * 3)) * reveal(lt, s.at, 0.4) : 1;
        return <React.Fragment key={s.slot}>
          <div style={{ position: "absolute", inset: 0, transform: `scale(${puff})`, transformOrigin: `${x0 + i * (w + gap) + w / 2}px ${y + h / 2}px` }}>
            <Pic slot={s.slot} label={s.label} x={x0 + i * (w + gap)} y={y} w={w} h={h} lt={lt} at={s.at} fx="pop" />
          </div>
          <Chip text={s.label} x={x0 + i * (w + gap) + w / 2} y={y + h + 12} lt={lt} at={s.at + 0.15} tone={i === steps.length - 1 ? "gold" : "cream"} size={26} />
        </React.Fragment>; })}
    </React.Fragment>
  );
}
// b4 — Punjab: wheat → flour → dough → roti
function B4(ctx) {
  return ({ localTime: lt, duration }) => {
    const cVast = W("b4", "vast"), cWheat = W("b4", "wheat", 1), cFlour = W("b4", "flour"), cDough = W("b4", "dough"), cRoti = W("b4", "roti"), cStaple = W("b4", "staple"), cEvery = W("b4", "every");
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[4]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(4, ctx, [L("PUNJAB", 0.3, "head"), L("VAST wheat fields", cVast), L("wheat → flour → dough → roti", cWheat), L("ROTI is the STAPLE food", cStaple, "big"),
          L("Staple = eaten every day", cEvery, "think")])}>
        <Pic slot="punjab_wheat" label="Endless golden wheat fields of Punjab, a harvester at work" x={40} y={50} w={1360} h={500} lt={lt} at={0} fx="pan" kenDur={18} />
        <Chip text="PUNJAB · VAST wheat fields" x={720} y={70} lt={lt} at={cVast} tone="gold" size={32} />
        <Chain lt={lt} y={590} steps={[{ slot: "crop_wheat", label: "wheat", at: cWheat }, { slot: "wheat_flour", label: "flour", at: cFlour },
          { slot: "dough", label: "dough", at: cDough }, { slot: "roti_tawa", label: "roti!", at: cRoti, puff: true }]} />
        <Badge text="STAPLE FOOD" x={60} y={450} lt={lt} at={cStaple} size={36} />
        <Chip text="eaten EVERY DAY" x={420} y={462} lt={lt} at={cEvery} size={28} anchor="left" />
      </Scene>
    );
  };
}
// Sun with soft rays + sparkles on water.
function Sun({ x, y, lt, op }) {
  if (op <= 0) return null;
  return (
    <SVG op={op}>
      <g transform={`translate(${x} ${y}) rotate(${lt * 8})`}>{Array.from({ length: 12 }, (_, i) => <line key={i} x1={0} y1={-70} x2={0} y2={-96} stroke="#FFD66B" strokeWidth={7} strokeLinecap="round" transform={`rotate(${i * 30})`} />)}</g>
      <circle cx={x} cy={y} r={56} fill="#FFD66B" opacity={0.95} /><circle cx={x} cy={y} r={84} fill="#FFD66B" opacity={0.2 + 0.08 * Math.sin(lt * 2)} />
    </SVG>
  );
}
function Sparkles({ lt, op, pts }) {
  if (op <= 0) return null;
  return <SVG op={op}>{pts.map(([x, y], i) => { const s = Math.max(0, Math.sin(lt * 3 + i * 1.7)); return <path key={i} d={`M${x} ${y - 14 * s} L${x + 4 * s} ${y} L${x} ${y + 14 * s} L${x - 4 * s} ${y} Z`} fill="#fff" opacity={s} />; })}</SVG>;
}
// b5 — Tamil Nadu: warm, water-rich → rice
function B5(ctx) {
  return ({ localTime: lt, duration }) => {
    const cWarm = W("b5", "warm"), cPlenty = W("b5", "plenty"), cLoves = W("b5", "loves"), cGrows = W("b5", "grows"), cPart = W("b5", "part"), cMeal = W("b5", "meal");
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[5]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(5, ctx, [L("TAMIL NADU", 0.3, "head"), L("Warm, and many areas have plenty of water", cWarm), L("Rice LOVES warmth + water", cLoves),
          L("Rice grows well there", cGrows), L("RICE is part of almost every meal", cPart, "big")])}>
        <Pic slot="tn_paddy" label="Bright green paddy fields in Tamil Nadu, water shining" x={40} y={50} w={1360} h={500} lt={lt} at={0} fx="zoom" kenDur={16} />
        <Sun x={1250} y={170} lt={lt} op={out3(lt, cWarm, 0.7)} />
        <Sparkles lt={lt} op={out3(lt, cPlenty, 0.6)} pts={[[200, 470], [380, 500], [560, 450], [760, 490], [940, 460], [1120, 500], [300, 400], [860, 410]]} />
        <Chip text="TAMIL NADU · warm" x={420} y={70} lt={lt} at={cWarm} tone="gold" size={32} />
        <Chip text="plenty of water" x={420} y={130} lt={lt} at={cPlenty} size={28} />
        <Chip text="Rice ♥ warmth + water" x={1000} y={300} lt={lt} at={cLoves} tone="gold" size={34} />
        <Chain lt={lt} y={590} steps={[{ slot: "crop_rice", label: "paddy", at: cGrows }, { slot: "paddy_husk", label: "husked", at: cGrows + 0.7 },
          { slot: "rice_pot", label: "cooked rice", at: cPart }, { slot: "plate_tn", label: "every meal!", at: cMeal }]} />
      </Scene>
    );
  };
}
// b6 — the grain map of India
function B6(ctx) {
  return ({ localTime: lt, duration }) => {
    const cWhole = W("b6", "whole"), cRice = W("b6", "rice"), cEast = W("b6", "east"), cSouth = W("b6", "south"), cWheat = W("b6", "wheat"), cNorth = W("b6", "north"),
      cWest = W("b6", "west"), cDry = W("b6", "dry"), cMil = W("b6", "millets"), cLess = W("b6", "less");
    const colour = { rice: out3(lt, cRice, 1.6), wheat: out3(lt, cWheat, 1.6), millet: out3(lt, cMil, 1.6) };
    const mx = 60, my = 40, k = 27, P = proj(mx, my, k);
    const dish = (place, dx, dy) => { const [x, y] = P(PLACES[place]); return [x + dx, y + dy]; };
    const [ex, ey] = dish("bengal", 65, 125), [nx, ny] = dish("north", 60, -70), [rx, ry] = dish("rajasthan", 0, -10);
    const rows = [["rice", "RICE", "east and south", cRice], ["wheat", "WHEAT", "north and west", cWheat], ["millet", "MILLETS", "dry areas – need LESS water", cMil]];
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[6]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(6, ctx, [L("RICE – east and south", cRice), L("WHEAT – north and west", cWheat), L("MILLETS – dry areas", cMil), L("Millets need LESS water", cLess, "big")])}>
        <IndiaMap x={mx} y={my} k={k} lt={lt} at={0.1} colour={colour} id="b6" />
        <Chip text="east" x={P(PLACES.bengal)[0] + 10} y={P(PLACES.bengal)[1] - 70} lt={lt} at={cEast} size={22} />
        <Chip text="south" x={P(PLACES.tamilnadu)[0] + 60} y={P(PLACES.tamilnadu)[1] - 10} lt={lt} at={cSouth} size={22} />
        <Chip text="north" x={P(PLACES.punjab)[0] + 30} y={P(PLACES.punjab)[1] - 70} lt={lt} at={cNorth} size={22} />
        <Chip text="west" x={P([69.6, 21.6])[0]} y={P([69.6, 21.6])[1]} lt={lt} at={cWest} size={22} />
        <Node slot="dish_rice_fish" label="rice and fish" x={ex} y={ey} r={58} lt={lt} at={cEast + 0.3} size={20} ring={GC.rice} />
        <Node slot="roti_tawa" label="roti" x={nx} y={ny} r={58} lt={lt} at={cNorth + 0.3} size={20} ring={GC.wheat} />
        <Node slot="millet_plate" label="bajra roti" x={rx} y={ry} r={58} lt={lt} at={cDry + 0.3} size={20} ring={GC.millet} />
        {rows.map(([g, name, where, a], i) => <div key={g} style={{ position: "absolute", left: 960, top: 70 + i * 150, width: 440, height: 124, borderRadius: 20, background: SK.card,
          boxShadow: `0 0 0 3px ${GC[g]}`, opacity: out3(lt, a, 0.6), transform: `translateX(${(1 - out3(lt, a, 0.6)) * 30}px)`, display: "flex", alignItems: "center", gap: 20, padding: "0 22px", boxSizing: "border-box" }}>
          <div style={{ flex: "none", width: 64, height: 64, borderRadius: 14, background: GC[g] }} />
          <div><div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 38, color: SK.white }}>{name}</div>
            <div style={{ fontFamily: SANS, fontSize: 25, color: SK.dim }}>{where}</div></div></div>)}
        <Pic slot="millet_sun" label="Millets in a hot, dry field" x={960} y={530} w={440} h={250} lt={lt} at={cLess} fx="zoom" />
        <Chip text="grows with LESS water" x={1180} y={745} lt={lt} at={cLess + 0.3} tone="gold" size={24} />
      </Scene>
    );
  };
}
// Millet pile (a mound of brown-orange grains) — h grows 0→H.
function Pile({ x, base, w, h, lt }) {
  if (h <= 2) return null;
  const dots = [];
  for (let r = 0; r < Math.floor(h / 14); r++) { const yy = base - 8 - r * 14, frac = 1 - (r * 14) / h, half = (w / 2) * Math.sqrt(Math.max(0, frac));
    for (let xx = -half + 8; xx < half - 6; xx += 16) dots.push(<ellipse key={r + ":" + xx} cx={x + xx + (r % 2 ? 8 : 0)} cy={yy} rx={7} ry={5} fill={(r + Math.round(xx)) % 3 ? GC.millet : "#D98A4E"} stroke={GINK.millet} strokeWidth={1} />); }
  return <g><path d={`M${x - w / 2} ${base} Q ${x} ${base - 2 * h} ${x + w / 2} ${base} Z`} fill="#A85E2C" opacity={0.6} />{dots}</g>;
}
// b7 — WOW: India grows the most millets; STOP 3 on the coloured map; then the leaf break
function B7(ctx) {
  return ({ localTime: lt, duration }) => {
    const cWow = W("b7", "wow"), cMore = W("b7", "more"), cAny = W("b7", "any"), cThree = W("b7", "three"), cNext = W("b7", "next"), cDry = W("b7", "dry"),
      at = stopStart("b7"), breakAt = at + stopFor("b7")[2] + 0.05;
    const g = drive(lt, cMore, cAny + 1.2), g2 = drive(lt, cMore + 0.3, cMore + 1.2);
    const wowOut = 1 - reveal(lt, at - 0.2, 0.5);
    const base = 780, iH = 400 * g, nH = 135 * g2;
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[7]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(7, ctx, [L("India grows MORE millets than any other country", cMore, "big"), L("about 38% of the world's millets (2022)", cAny), L("nearly 3 times the next country", cThree),
          L("Our dry lands feed millions", cDry), L("Which grain does YOUR region eat most?", at, "think")], { max: 7 })}>
        <div style={{ position: "absolute", inset: 0, opacity: wowOut }}>
          <div style={{ position: "absolute", left: 40, top: 50, width: 1360, height: 170, borderRadius: 26, background: "#F07A1A", opacity: pop(lt, cWow, 0.6),
            transform: `scale(${0.85 + 0.15 * pop(lt, cWow, 0.6)})`, boxShadow: "0 10px 30px rgba(0,0,0,0.35)", display: "flex", alignItems: "center", gap: 40, padding: "0 50px", boxSizing: "border-box" }}>
            <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 110, color: SK.white, textShadow: "0 4px 0 rgba(0,0,0,0.2)" }}>WOW!</div>
            <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 40, lineHeight: 1.2, color: SK.white, opacity: out3(lt, cMore, 0.5) }}>India grows more millets than ANY other country in the world</div>
          </div>
          <SVG op={pop(lt, cWow, 0.6)}>{[[90, 70], [1360, 80], [700, 40], [1320, 200]].map(([x, y], i) => { const s = 0.6 + 0.4 * Math.abs(Math.sin(lt * 3 + i));
            return <path key={i} transform={`translate(${x} ${y}) scale(${s}) rotate(${lt * 40 + i * 20})`} d="M0 -28 L7 -7 L28 0 L7 7 L0 28 L-7 7 L-28 0 L-7 -7 Z" fill="#FFE27A" />; })}</SVG>
          <SVG op={out3(lt, cMore - 0.3, 0.5)}>
            <rect x={60} y={base} width={880} height={14} rx={7} fill={SK.soil} />
            <Pile x={260} base={base} w={300} h={iH} lt={lt} />
            <Pile x={560} base={base} w={200} h={nH} lt={lt} />
            {[[720, 0.6], [800, 0.45], [870, 0.3]].map(([x, f], i) => <Pile key={i} x={x} base={base} w={90} h={nH * f} lt={lt} />)}
            <g opacity={out3(lt, cThree, 0.5)}>
              <line x1={420} y1={base - iH} x2={420} y2={base - nH} stroke={SK.gold} strokeWidth={4} strokeDasharray="10 8" />
              <T x={470} y={base - (iH + nH) / 2 + 20} size={64} bold serif color={SK.gold} anchor="start">×3</T></g>
          </SVG>
          <Chip text="INDIA" x={260} y={base + 24} lt={lt} at={cMore} tone="gold" size={30} />
          <Chip text="next country" x={560} y={base + 24} lt={lt} at={cNext} size={24} />
          <Chip text="others" x={800} y={base + 24} lt={lt} at={cNext + 0.3} size={22} />
          <Chip text="about 38% of the world's millets (2022)" x={260} y={250} lt={lt} at={cAny} size={24} />
          <Pic slot="millet_sun" label="Millets on dry land" x={980} y={270} w={420} h={330} lt={lt} at={cDry} fx="zoom" />
          <Chip text="Our dry lands feed millions" x={1190} y={620} lt={lt} at={cDry + 0.2} tone="gold" size={26} />
        </div>
        {/* STOP 3: freeze on the coloured India map */}
        <IndiaMap x={40} y={50} k={26} lt={lt} at={at - 0.3} op={1 - reveal(lt, breakAt, 0.3)} colour={{ rice: 1, wheat: 1, millet: 1 }} id="b7" />
        <StopBox lt={lt} b="b7" n={3} x={830} y={130} w={570} h={620}>
          <StopQ size={44}>Which grain does YOUR region eat most?</StopQ>
          <StopQ size={36}>Why do you think it grows there?</StopQ>
          <div style={{ display: "flex", gap: 14, marginTop: 30 }}>{[["rice", "rice"], ["wheat", "wheat"], ["millet", "millets"]].map(([g2k, t]) =>
            <div key={g2k} style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: SANS, fontWeight: 700, fontSize: 24, color: SK.white }}>
              <span style={{ width: 26, height: 26, borderRadius: 6, background: GC[g2k] }} />{t}</div>)}</div>
        </StopBox>
        <Break lt={lt} at={breakAt} dur={2.3} />
      </Scene>
    );
  };
}
// Spinning globe glyph.
function Globe({ cx, cy, r, lt }) {
  const ph = lt * 0.9;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#2D7FB8" stroke={SK.cream} strokeWidth={4} />
      {[0, 1, 2].map((i) => { const rx = Math.abs(Math.cos(ph + i * Math.PI / 3)) * r; return <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={r} fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth={2} />; })}
      <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke="rgba(255,255,255,0.55)" strokeWidth={2} />
      <path d={`M${cx - r * 0.5 + 10 * Math.sin(ph)} ${cy - r * 0.3} q 20 -18 40 0 q 10 18 -10 30 q -26 6 -30 -30 Z`} fill="#6FBF6E" />
    </g>
  );
}
// b8 — DID YOU KNOW: staple grains around the world
function B8(ctx) {
  return ({ localTime: lt, duration }) => {
    const cDyk = S("b8", 0), cWorld = W("b8", "world"), cJapan = W("b8", "japan"), cMexico = W("b8", "mexico"), cTort = W("b8", "tortillas"), cEth = W("b8", "ethiopia"),
      cTeff = W("b8", "teff"), cInjera = W("b8", "injera"), cSmall = W("b8", "small"), cThou = W("b8", "thousand"), cHalf = W("b8", "half"), cItaly = W("b8", "italy"), cPasta = W("b8", "pasta");
    const stops = [["JAPAN", "rice", cJapan, cMexico, "rice"], ["MEXICO", "corn → tortillas", cMexico, cEth, "maize"], ["ETHIOPIA", "teff → injera, a spongy flatbread", cEth, cItaly, "millet"], ["ITALY", "wheat → pasta", cItaly, 1e9, "wheat"]];
    const shots = [["japan_rice", "Japan: rice bowl and rice terraces", cJapan, cMexico], ["mexico_tortilla", "Mexico: corn and round tortillas", cMexico, cEth],
      ["teff_grains", "Ethiopia: tiny teff grains", cEth, cInjera], ["injera", "Ethiopia: injera with dishes on top", cInjera, cItaly], ["italy_pasta", "Italy: wheat becomes pasta", cItaly, null]];
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[8]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(8, ctx, [L("Every country has its staple grain!", cWorld, "big"), L("JAPAN – rice", cJapan), L("MEXICO – corn → tortillas", cMexico), L("ETHIOPIA – teff → injera, a spongy flatbread", cEth),
          L("1,000 teff grains weigh less than ½ gram", cThou, "sub"), L("ITALY – wheat → pasta", cItaly)], { max: 7 })}>
        <Badge text="DID YOU KNOW?" x={50} y={70} lt={lt} at={cDyk} size={40} />
        <Big x={480} y={68} w={760} lt={lt} at={cWorld} size={38}>People everywhere eat the grains that grow near them!</Big>
        <SVG op={pop(lt, cDyk, 0.7)}><Globe cx={1320} cy={115} r={62} lt={lt} /></SVG>
        {shots.map(([slot, label, a, o]) => <Pic key={slot} slot={slot} label={label} x={40} y={210} w={880} h={590} lt={lt} at={a} out={o} fx="zoom" dur={0.6} />)}
        {stops.map(([c, f, a, o]) => <Chip key={c} text={c} x={70} y={230} lt={lt} at={a + 0.1} out={o} tone="gold" size={34} anchor="left" />)}
        <Chip text="TORTILLAS" x={480} y={720} lt={lt} at={cTort} out={cEth} size={30} />
        <Chip text="TEFF – a tiny grain" x={480} y={720} lt={lt} at={cTeff} out={cInjera} size={30} />
        <Chip text="INJERA – soft and spongy" x={480} y={720} lt={lt} at={cInjera} out={cSmall} size={30} />
        <Card x={140} y={640} w={680} h={140} lt={lt} at={cSmall} out={cItaly} pad={22}>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 36, color: SK.white }}>Teff grains are SO small!</div>
          <div style={{ fontFamily: SANS, fontSize: 30, color: SK.white, marginTop: 6, opacity: out3(lt, cThou, 0.4) }}>1,000 grains weigh <span style={{ color: SK.gold, fontWeight: 700, opacity: out3(lt, cHalf, 0.4) }}>less than ½ gram</span></div>
        </Card>
        <Chip text="PASTA" x={480} y={720} lt={lt} at={cPasta} size={32} />
        {stops.map(([c, f, a, o, g], i) => { const on = out3(lt, a, 0.5), act = lt >= a && lt < o;
          return <div key={c} style={{ position: "absolute", left: 960, top: 210 + i * 148, width: 440, height: 128, borderRadius: 20, background: act ? "rgba(5,30,22,0.88)" : SK.card,
            boxShadow: `0 0 0 ${act ? 4 : 2}px ${act ? SK.gold : "rgba(255,255,255,0.2)"}`, opacity: on * (act ? 1 : 0.7), transform: `translateX(${(1 - on) * 30}px)`,
            display: "flex", alignItems: "center", gap: 18, padding: "0 22px", boxSizing: "border-box" }}>
            <div style={{ flex: "none", width: 20, height: 84, borderRadius: 8, background: GC[g] }} />
            <div><div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 36, color: act ? SK.gold : SK.white }}>{c}</div>
              <div style={{ fontFamily: SANS, fontSize: 24, color: SK.white, lineHeight: 1.2 }}>{f}</div></div></div>; })}
      </Scene>
    );
  };
}
// b9 — the same grain shapes a whole country's food: grain → field → table, three times
function B9(ctx) {
  return ({ localTime: lt, duration }) => {
    const cSame = W("b9", "same"), cField = W("b9", "field"), cShape = W("b9", "shape"), cCountry = W("b9", "country");
    const rows = [["wheat", "punjab_wheat", "table_food", "wheat"], ["rice", "tn_paddy", "plate_tn", "rice"], ["maize", "field_maize", "mexico_tortilla", "corn"]];
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[9]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(9, ctx, [L("one grain → a field → a family table", cSame), L("The SAME GRAIN that shapes a farmer's field can shape a whole culture's food!", cShape, "big")])}>
        {rows.map(([g, field, table, name], i) => { const y = 60 + i * 235, a = cSame + i * 0.35, s = pop(lt, a, 0.6);
          return <React.Fragment key={g}>
            <SVG op={s}><g transform={`translate(150 ${y + 100}) scale(${s})`}><circle r={78} fill="rgba(255,255,255,0.08)" stroke={GC[g]} strokeWidth={4} />
              <ellipse rx={30} ry={46} fill={GC[g]} stroke={GINK[g]} strokeWidth={4} transform="rotate(-18)" /></g>
              <Arr x1={245} y1={y + 100} x2={320} y2={y + 100} lt={lt} at={cField + i * 0.25 - 0.1} />
              <Arr x1={765} y1={y + 100} x2={840} y2={y + 100} lt={lt} at={cShape + i * 0.25 - 0.1} /></SVG>
            <Chip text={name} x={150} y={y + 180} lt={lt} at={a + 0.1} size={22} />
            <Pic slot={field} label={name + " field"} x={330} y={y} w={425} h={200} lt={lt} at={cField + i * 0.25} fx="pop" />
            <Pic slot={table} label={name + " on the table"} x={850} y={y} w={425} h={200} lt={lt} at={cShape + i * 0.25} fx="pop" />
          </React.Fragment>; })}
        <Big x={80} y={760} w={1240} lt={lt} at={cCountry} size={40} align="center" color={SK.gold}>The same grain can shape the food of a whole country!</Big>
      </Scene>
    );
  };
}
// b10 — the answer: plates turn into their fields; your plate; STOP 4 quick check
function B10(ctx) {
  return ({ localTime: lt, duration }) => {
    const cQ = S("b10", 0), cG0 = W("b10", "grows", 0), cG1 = W("b10", "grows", 1), cConn = W("b10", "connected"), cGeo = W("b10", "geography"), cYour = W("b10", "your"),
      at = stopStart("b10");
    const m0 = Easing.easeInOutCubic(reveal(lt, cG0, 1.2)), m1 = Easing.easeInOutCubic(reveal(lt, cG1, 1.2));
    const qs = ["What are food grains?", "Name one cereal, one millet and one pulse.", "Why does Punjab eat roti?", "Why are millets grown in dry areas?", "What is injera made from?"];
    const qo = windowOp(lt, at, at + stopHold("b10"), 0.35);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[10]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(10, ctx, [L("Punjab GROWS wheat → roti", cG0), L("Tamil Nadu GROWS rice → rice", cG1), L("OUR FOOD FOLLOWS OUR GEOGRAPHY AND OUR FARMS", cConn, "big"),
          L("What's on YOUR plate today?", cYour, "think")])}>
        <Pic slot="plate_punjab" label="Punjab: rotis" x={40} y={60} w={660} h={430} lt={lt} at={0} fx="none" />
        <Pic slot="plate_tn" label="Tamil Nadu: rice" x={740} y={60} w={660} h={430} lt={lt} at={0.2} fx="none" />
        {/* plate → field morph: a circle wipe opens the field over the plate */}
        <div style={{ position: "absolute", inset: 0, clipPath: `circle(${m0 * 420}px at 370px 275px)` }}>
          <Pic slot="punjab_wheat" label="Punjab wheat fields" x={40} y={60} w={660} h={430} lt={lt} at={cG0 - 0.1} dur={0.2} fx="zoom" border={false} /></div>
        <div style={{ position: "absolute", inset: 0, clipPath: `circle(${m1 * 420}px at 1070px 275px)` }}>
          <Pic slot="tn_paddy" label="Tamil Nadu paddy fields" x={740} y={60} w={660} h={430} lt={lt} at={cG1 - 0.1} dur={0.2} fx="zoom" border={false} /></div>
        <Chip text="Why roti?" x={370} y={80} lt={lt} at={cQ} out={cG0} size={28} />
        <Chip text="Why rice?" x={1070} y={80} lt={lt} at={cQ + 0.6} out={cG1} size={28} />
        <Chip text="Punjab GROWS wheat → roti" x={370} y={80} lt={lt} at={cG0 + 0.5} tone="gold" size={30} />
        <Chip text="Tamil Nadu GROWS rice → rice" x={1070} y={80} lt={lt} at={cG1 + 0.5} tone="gold" size={30} />
        <Card x={40} y={520} w={860} h={210} lt={lt} at={cConn} pad={28}>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 22, letterSpacing: "0.14em", color: SK.gold }}>ANSWER</div>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 42, lineHeight: 1.2, color: SK.white, marginTop: 8 }}>
            Our food follows <span style={{ color: SK.gold, opacity: out3(lt, cGeo, 0.4) }}>our geography and our farms.</span></div>
        </Card>
        {/* your plate: an empty plate waiting for YOUR local grain */}
        <SVG op={pop(lt, cYour, 0.6)}>
          <circle cx={1150} cy={640} r={120} fill="#E9EEF0" stroke="#B9C3C7" strokeWidth={8} /><circle cx={1150} cy={640} r={86} fill="none" stroke="#C9D2D6" strokeWidth={4} />
          <text x={1150} y={668} textAnchor="middle" fontFamily={SERIF} fontWeight="700" fontSize="88" fill={SK.goldDeep}>?</text>
        </SVG>
        <Chip text="YOUR plate: which local grain?" x={1150} y={775} lt={lt} at={cYour + 0.2} tone="gold" size={26} />
        {/* STOP 4: quick check */}
        {qo > 0 && <div style={{ position: "absolute", left: 40, top: 50, width: 1360, height: 900, borderRadius: 26, background: "rgba(5,30,22,0.94)", opacity: qo,
          boxShadow: "0 0 0 3px rgba(226,176,76,0.9)", padding: "44px 70px", boxSizing: "border-box" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
            <svg width="70" height="70" viewBox="0 0 90 90"><circle cx="45" cy="45" r="43" fill={SK.gold} /><rect x="28" y="24" width="12" height="42" rx="4" fill={SK.ink} /><rect x="50" y="24" width="12" height="42" rx="4" fill={SK.ink} /></svg>
            <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 30, letterSpacing: "0.08em", color: SK.ink, background: SK.gold, padding: "10px 30px", borderRadius: 14 }}>QUICK CHECK</div>
          </div>
          {qs.map((q, i) => { const o = out3(lt, at + 0.2 + i * 0.2, 0.5);
            return <div key={i} style={{ display: "flex", gap: 22, alignItems: "center", marginTop: i ? 20 : 40, opacity: o, transform: `translateX(${(1 - o) * 30}px)` }}>
              <span style={{ flex: "none", fontFamily: SERIF, fontWeight: 700, fontSize: 40, color: SK.gold, width: 44 }}>{i + 1}</span>
              <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 40, color: SK.white, background: "rgba(255,255,255,0.08)", padding: "10px 26px", borderRadius: 18 }}>{q}</span></div>; })}
          <div style={{ position: "absolute", left: 70, bottom: 36, fontFamily: SANS, fontSize: 24, color: SK.dim }}>Stop 4 of 4 · then compare with your guesses from Stop 1</div>
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
const COLLAGE = [{ slot: "crop_wheat", x: -60, y: -40, w: 760, h: 520, ph: 0 }, { slot: "crop_rice", x: 640, y: -80, w: 760, h: 520, ph: 2 },
  { slot: "millet_bajra", x: -80, y: 520, w: 700, h: 560, ph: 4 }, { slot: "millet_sun", x: 560, y: 560, w: 820, h: 560, ph: 1 }];
function GrainScenes(props = {}) {
  const caps = props.showCaptions === "false" ? false : props.showCaptions !== false;
  const titles = {};
  for (let n = 1; n <= NB; n++) titles[n] = str(props["title" + n + "Text"], TITLES[n]);
  const ctx = { caps, titles, capSize: num(props.captionSize, 34) };
  const B = [B1, B2, B3, B4, B5, B6, B7, B8, B9, B10];
  const beats = B.map((Bn, i) => { const t = BEAT("b" + (i + 1)); return [t.start, t.start + t.dur, Bn]; });
  return (
    <StoryFrame props={props} dur={DUR} persistKey="thinkpro-lp9-types-of-food-grains" collage={COLLAGE}>
      {beats.map(([s, e, Bn], i) => (
        <Sprite key={i} start={s} end={e}>{Bn(ctx)}</Sprite>
      ))}
      {STOPS.map(([b, i, hold]) => <StopAt key={b} t={BEAT(b).start + stopAt(b, i)} hold={hold - 0.2} />)}
      <ChimeAt t={BEAT("b8").start + S("b8", 0, 0)} />
      <AudioSync />
    </StoryFrame>
  );
}
window.GrainScenes = GrainScenes;
