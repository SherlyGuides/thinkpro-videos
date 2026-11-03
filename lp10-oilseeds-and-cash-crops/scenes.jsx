/* global React, window */
// ThinkPro Academy — "Oilseeds and Cash Crops" (Grade 6 Agriculture, Session 10, V1).
// After AG_G6_S10_Video_Script_Oilseeds_and_Cash_Crops (Draft 1, 3 Nov 2026): 11 scenes as 10
// narrated beats (scene 8, the silent leaf break, sits in the tail of b7 after Stop 3), four
// presenter stops (silent holds — the web player freezes there, TPStory.StopAt), one WOW card
// (b6) and one Did-you-know scene (b8). The TWO BASKETS are the central visual model: oilseeds
// drop into the OIL basket (oil-drop label), cash crops into the CASH basket (rupee label); a
// small basket badge returns whenever a crop is named. STORY STYLE (engine/story-kit.jsx).
const { Sprite, Easing } = window;
const { reveal, windowOp } = window.TPMotion;
const { num, str } = window.TPStage;
const { SK, SERIF, SANS, LEFT_W, pop, out3, lerp, Pic, Chip, Badge, Big, Card, SVG, Arrow, T, ChimeAt, Scene, StoryFrame, StopCard, StopAt, Break } = window.TPStory;

// ---- Timing: EVERYTHING is keyed to the narration (tools/fit_timing.py → timing.js).
const TM = window.TP_TIMING;
if (!TM) console.error("timing.js missing — run: python3 tools/fit_timing.py videos/lp10-oilseeds-and-cash-crops");
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
const TITLES = { 1: "LP10 – Oilseeds and Cash Crops", 2: "Oilseeds", 3: "Cash crops", 4: "Every crop is fussy", 5: "Cotton and black soil",
  6: "WOW! Soil that ploughs itself", 7: "Sugarcane", 8: "Did you know?", 9: "From soil to market", 10: "The answer" };
const KICK = "Grade 6 · Agriculture · Session 10";
const KICKS = { 6: "WOW fact", 8: "Did you know?" };
const panel = (n, ctx, lines, extra = {}) => ({ kicker: KICKS[n] || KICK, title: ctx.titles[n], lines, ...extra });
const L = (text, at, kind = "item", extra = {}) => ({ text, at, kind, ...extra });

// ---- Presenter stops: [beat, sentence index whose pauseAfter is the hold, hold s]
// b7's pauseAfter is 7.6 s = the 5 s stop + the 2.6 s leaf break (script scene 8).
const STOPS = [["b1", 6, 5.0], ["b3", 6, 6.0], ["b7", 8, 5.0], ["b10", 5, 8.0]];
const stopAt = (b, i) => SE(b, i) + 0.1;                       // beat-local start of the hold
const stopFor = (b) => STOPS.find((s) => s[0] === b);
const holdOf = (b) => stopFor(b)[2] - 0.2;
const stopStart = (b) => stopAt(b, stopFor(b)[1]);

// ---- Shared pieces ---------------------------------------------------------------
const GOLD_OIL = "#F2B632", WATER = "#5DB7E8", BLACK_SOIL = "#2B2420";
function Arr({ x1, y1, x2, y2, lt, at, color = SK.gold, sw = 6 }) { return <Arrow x1={x1} y1={y1} x2={x2} y2={y2} color={color} sw={sw} op={out3(lt, at, 0.5)} />; }
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
// Basket label glyph: an oil drop or a rupee sign, in a cream disc.
function Tag({ kind, x, y, r = 34 }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r} fill={SK.cream} stroke={SK.goldDeep} strokeWidth={4} />
      {kind === "oil"
        ? <path d={`M0 ${-r * 0.62} C ${r * 0.5} ${-r * 0.05}, ${r * 0.48} ${r * 0.55}, 0 ${r * 0.58} C ${-r * 0.48} ${r * 0.55}, ${-r * 0.5} ${-r * 0.05}, 0 ${-r * 0.62} Z`} fill={GOLD_OIL} stroke={SK.goldDeep} strokeWidth={2.5} />
        : <text y={r * 0.36} textAnchor="middle" fontFamily={SANS} fontWeight="700" fontSize={r * 1.15} fill={SK.ink}>₹</text>}
    </g>
  );
}
// The woven BASKET — the central model. kind "oil" | "cash"; items = colours of what is inside
// (each shows from its own time); glow 0→1 = a gold halo when something lands.
function Basket({ cx, cy, s = 1, kind, lt, at = 0, items = [], label = true, glow = 0, op = 1 }) {
  const o = pop(lt, at, 0.7) * op; if (o <= 0) return null;
  const spots = [[-70, -4], [-25, -12], [22, -8], [68, -2], [-48, 8], [0, 4], [46, 10]];
  return (
    <SVG op={o}>
      <g transform={`translate(${cx} ${cy}) scale(${s * (0.9 + 0.1 * o)})`}>
        {glow > 0 && <ellipse cx={0} cy={10} rx={190} ry={120} fill={SK.gold} opacity={0.28 * glow} />}
        <ellipse cx={0} cy={-58} rx={128} ry={30} fill="#5E3B1E" />
        {items.map((it, i) => { const k = pop(lt, it.at, 0.5); if (k <= 0) return null; const [x, y] = spots[i % spots.length];
          return <ellipse key={i} cx={x} cy={-58 + y - 10 * k} rx={30} ry={20} fill={it.color} stroke="rgba(0,0,0,0.25)" strokeWidth={2} opacity={k} />; })}
        <path d="M-130 -58 L -95 92 Q 0 112 95 92 L 130 -58 Q 0 -30 -130 -58 Z" fill="#B57A3E" stroke="#6E4520" strokeWidth={5} strokeLinejoin="round" />
        {[-20, 15, 50].map((y) => <path key={y} d={`M${-124 + (y + 58) * 0.23} ${y} Q 0 ${y + 24} ${124 - (y + 58) * 0.23} ${y}`} stroke="#8A5A2B" strokeWidth={5} fill="none" />)}
        {[-80, -40, 0, 40, 80].map((x) => <line key={x} x1={x * 1.08} y1={-44} x2={x * 0.8} y2={98} stroke="#8A5A2B" strokeWidth={4} />)}
        <path d="M-130 -58 Q 0 -30 130 -58" stroke="#E0A867" strokeWidth={9} fill="none" strokeLinecap="round" />
        {label && <Tag kind={kind} x={0} y={30} r={36} />}
      </g>
      {label && <text x={cx} y={cy + 150 * s} textAnchor="middle" fontFamily={SERIF} fontWeight="700" fontSize={34 * Math.max(0.7, s)} fill={kind === "oil" ? SK.gold : SK.cream}>{kind === "oil" ? "OILSEEDS" : "CASH CROPS"}</text>}
    </SVG>
  );
}
// Small basket badge that pops beside a crop name ("the baskets return whenever a crop is named").
function MiniBasket({ kind, x, y, lt, at, out = null, s = 0.36 }) {
  const o = pop(lt, at, 0.5) * (out != null ? 1 - reveal(lt, out, 0.4) : 1); if (o <= 0) return null;
  return <Basket cx={x} cy={y} s={s} kind={kind} lt={lt} at={at - 1} label={false} op={o} items={[{ color: kind === "oil" ? GOLD_OIL : "#F4F1E8", at: at - 1 }]} />;
}
function BasketTag({ kind, x, y, lt, at, out = null }) {
  const o = pop(lt, at, 0.5) * (out != null ? 1 - reveal(lt, out, 0.4) : 1); if (o <= 0) return null;
  return <SVG op={o}><Tag kind={kind} x={x} y={y} r={26} /></SVG>;
}
// A round photo that pops at (x0,y0), then at `t0` falls into a basket mouth at (x1,y1) and is gone.
function Fall({ slot, label, x0, y0, x1, y1, r0 = 80, r1 = 30, lt, at, t0, chip = true }) {
  if (lt < at) return null;
  const k = Easing.easeInCubic(clamp((lt - t0) / 0.8, 0, 1)), gone = reveal(lt, t0 + 0.75, 0.15);
  if (gone >= 1) return null;
  const x = lerp(x0, x1, k), y = lerp(y0, y1, k) - Math.sin(k * Math.PI) * 60, r = lerp(r0, r1, k);
  return (
    <React.Fragment>
      <Pic slot={slot} label={label} x={x - r} y={y - r} w={2 * r} h={2 * r} r={r} lt={lt} at={at} fx="pop" op={1 - gone} style={{ boxShadow: "0 0 0 4px " + SK.cream }} />
      {chip && <Chip text={label} x={x0} y={y0 + r0 + 12} lt={lt} at={at + 0.15} out={t0} size={24} />}
    </React.Fragment>
  );
}
// Big orange WOW badge with a sparkle.
function Wow({ x, y, lt, at, text }) {
  const o = pop(lt, at, 0.7); if (o <= 0) return null;
  const tw = 1 + 0.08 * Math.sin(lt * 6);
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: o, transform: `scale(${0.7 + 0.3 * o}) rotate(${-3 * (1 - o)}deg)`, transformOrigin: "left center", display: "flex", alignItems: "center", gap: 22 }}>
      <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 64, color: SK.white, background: "#E8701E", padding: "6px 34px", borderRadius: 18, boxShadow: "0 6px 20px rgba(0,0,0,0.35)" }}>WOW!</div>
      <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 48, color: SK.white, textShadow: "0 2px 14px rgba(0,0,0,0.45)" }}>{text}</div>
      <svg width="70" height="70" viewBox="-35 -35 70 70" style={{ transform: `scale(${tw}) rotate(${lt * 30}deg)` }}>
        <path d="M0 -32 L 7 -7 L 32 0 L 7 7 L 0 32 L -7 7 L -32 0 L -7 -7 Z" fill={SK.gold} /></svg>
    </div>
  );
}
// Countdown ring shown during a presenter hold (the export holds; the web player freezes).
function Count({ lt, at, hold, x = 1210, y = 790 }) {
  if (lt < at - 0.2 || lt > at + hold + 0.3) return null;
  const p = clamp((lt - at) / hold, 0, 1), n = Math.max(1, Math.ceil(hold * (1 - p)));
  return (
    <svg width="130" height="130" viewBox="0 0 130 130" style={{ position: "absolute", left: x, top: y }}>
      <circle cx="65" cy="65" r="54" stroke="rgba(255,255,255,0.3)" strokeWidth="8" fill="none" />
      <circle cx="65" cy="65" r="54" stroke={SK.gold} strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 54 * (1 - p)} ${2 * Math.PI * 54}`} transform="rotate(-90 65 65)" />
      <text x="65" y="85" textAnchor="middle" fontFamily={SERIF} fontWeight="700" fontSize="56" fill={SK.white}>{n}</text>
    </svg>
  );
}
// Pause card shell over the photo area (gold pause icon + heading), for the custom stops.
function StopShell({ lt, at, hold, heading, n, children, top = 60, h = 900, bg = "rgba(5,30,22,0.9)" }) {
  const o = windowOp(lt, at - 0.3, at + hold + 0.4, 0.35); if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 40, top, width: LEFT_W - 80, height: h, borderRadius: 26, background: bg, opacity: o,
      boxShadow: "0 0 0 3px rgba(226,176,76,0.9)", padding: "44px 70px", boxSizing: "border-box" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <svg width="76" height="76" viewBox="0 0 90 90"><circle cx="45" cy="45" r="43" fill={SK.gold} /><rect x="28" y="24" width="12" height="42" rx="4" fill={SK.ink} /><rect x="50" y="24" width="12" height="42" rx="4" fill={SK.ink} /></svg>
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 48, color: SK.white }}>{heading}</div>
      </div>
      {children}
      <div style={{ position: "absolute", left: 70, bottom: 34, fontFamily: SANS, fontSize: 26, color: SK.dim }}>Stop {n} of 4 · press play to continue</div>
      <Count lt={lt} at={at} hold={hold} x={LEFT_W - 80 - 170} y={h - 160} />
    </div>
  );
}
// Flat sun / rain cloud / mist glyphs (b4 sky over each patch).
function Sky({ kind, x, y, lt, op }) {
  if (op <= 0) return null;
  return (
    <g transform={`translate(${x} ${y})`} opacity={op}>
      {kind === "sun" && <g><circle r={34} fill={SK.gold} />{[0, 1, 2, 3, 4, 5, 6, 7].map((i) => { const a = i * Math.PI / 4 + lt * 0.4; return <line key={i} x1={44 * Math.cos(a)} y1={44 * Math.sin(a)} x2={60 * Math.cos(a)} y2={60 * Math.sin(a)} stroke={SK.gold} strokeWidth={6} strokeLinecap="round" />; })}</g>}
      {kind === "rain" && <g><path d="M-60 0 a 28 28 0 0 1 22 -40 a 36 36 0 0 1 66 4 a 24 24 0 0 1 32 36 Z" fill="#DDE6EE" />
        {[-36, -6, 24].map((dx, i) => { const p = ((lt * 1.2 + i * 0.33) % 1); return <line key={i} x1={dx} y1={14 + p * 40} x2={dx - 6} y2={30 + p * 40} stroke={WATER} strokeWidth={5} strokeLinecap="round" opacity={1 - p} />; })}</g>}
      {kind === "mist" && <g>{[0, 1, 2].map((i) => <path key={i} d={`M${-70 + 10 * Math.sin(lt + i)} ${-24 + i * 22} q 35 -14 70 0 t 70 0`} stroke="#E8EEF0" strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.85} />)}</g>}
    </g>
  );
}

// ============================================================================
// Scene 1 — two fields, the big question, Stop 1.
function B1(ctx) {
  return ({ localTime: lt, duration }) => {
    const cFields = W("b1", "fields"), cCot = W("b1", "cotton"), cBlack = W("b1", "black"), cCane = W("b1", "sugarcane"), cWater = W("b1", "water"),
      cQ = W("b1", "question"), cWhy = W("b1", "why"), at = stopStart("b1"), hold = holdOf("b1");
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[1]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(1, ctx, [L("OILSEEDS AND CASH CROPS", 0.4, "big"), L("Cotton in dark BLACK soil", cCot), L("Sugarcane right beside the WATER", cCane),
          L("BIG QUESTION", cQ, "head"), L("Why does cotton grow in black soil, and sugarcane only where there is plenty of water?", cWhy, "think")])}>
        <Pic slot="field_cotton" label="Cotton growing in dark black soil" x={40} y={60} w={670} h={600} lt={lt} at={0.1} fx="zoom" />
        <Pic slot="field_cane" label="Tall sugarcane beside a canal" x={730} y={60} w={670} h={600} lt={lt} at={cFields} fx="zoom" />
        <Chip text="COTTON" x={375} y={90} lt={lt} at={cCot} tone="gold" size={34} />
        <Chip text="BLACK soil" x={375} y={590} lt={lt} at={cBlack} size={30} />
        <Chip text="SUGARCANE" x={1065} y={90} lt={lt} at={cCane} tone="gold" size={34} />
        <Chip text="beside the WATER" x={1065} y={590} lt={lt} at={cWater} size={30} />
        <Card x={40} y={690} w={1360} h={180} lt={lt} at={cQ} pad={26}>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 24, letterSpacing: "0.14em", color: SK.gold }}>OUR BIG QUESTION</div>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 46, color: SK.white, marginTop: 10, opacity: out3(lt, cWhy, 0.5) }}>Why does each crop choose its own home?</div>
        </Card>
        <StopCard lt={lt} at={at} hold={hold} n={1} total={4}
          question={<span>Why does cotton like <span style={{ color: SK.gold }}>black soil</span>? Why does sugarcane need <span style={{ color: WATER }}>so much water</span>? Make a guess.</span>} />
        <Count lt={lt} at={at} hold={hold} x={1220} y={790} />
      </Scene>
    );
  };
}
// Scene 2 — four oilseeds, pressed, oil drops into the OIL basket.
const OILSEEDS = [["mustard", "Mustard"], ["groundnut", "Groundnut"], ["sunflower", "Sunflower"], ["sesame", "Sesame"]];
function B2(ctx) {
  return ({ localTime: lt, duration }) => {
    const cOil = W("b2", "oilseeds"), cGrown = W("b2", "oil", 1), ats = OILSEEDS.map(([w]) => W("b2", w)), cPress = W("b2", "pressed"), cCook = W("b2", "cooking"), cKitchen = W("b2", "kitchen");
    const PX = 700, PY = 560, BX = 1130, BY = 690;
    const xs = [190, 520, 850, 1180];
    const feed = OILSEEDS.map((_, i) => cPress + 0.2 + i * 0.45);          // seed i travels to the press
    const dropsOn = windowOp(lt, cPress + 0.6, duration, 0.3);
    const level = clamp((lt - cPress - 0.8) / 3, 0, 1);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[2]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(2, ctx, [L("OILSEEDS → cooking oil", cOil, "big"), L("Crops grown for their OIL", cGrown), L("mustard · groundnut · sunflower · sesame", ats[0]),
          L("The seeds are pressed…", cPress), L("…to make the COOKING OIL in your kitchen", cCook, "think")])}>
        <Big x={60} y={30} w={900} lt={lt} at={cOil} size={44} color={SK.gold}>First, OILSEEDS</Big>
        {OILSEEDS.map(([s, lab], i) => <Node key={s} slot={s} label={lab} x={xs[i]} y={230} r={105} lt={lt} at={ats[i]} size={26} />)}
        {/* seeds travel from each tile into the press */}
        <SVG op={1}>
          {OILSEEDS.map((_, i) => { const k = clamp((lt - feed[i]) / 0.7, 0, 1); if (k <= 0 || k >= 1) return null; const x = lerp(xs[i], PX, Easing.easeInOutCubic(k)), y = lerp(370, PY - 70, k) - Math.sin(k * Math.PI) * 40;
            return <ellipse key={i} cx={x} cy={y} rx={14} ry={9} fill="#E3B55C" stroke="#9E7320" strokeWidth={2} />; })}
          {/* the press: a screw press on a frame */}
          <g opacity={out3(lt, cPress, 0.5)} transform={`translate(${PX} ${PY})`}>
            <rect x={-110} y={-80} width={220} height={22} rx={6} fill="#8A6A48" />
            <rect x={-100} y={-60} width={16} height={150} fill="#8A6A48" /><rect x={84} y={-60} width={16} height={150} fill="#8A6A48" />
            <rect x={-12} y={-130 + 10 * Math.sin(lt * 4) * dropsOn} width={24} height={110} fill="#C9C2B5" />
            <rect x={-70} y={-24 + 6 * Math.sin(lt * 4) * dropsOn} width={140} height={24} rx={6} fill="#C9C2B5" />
            <path d="M-80 10 L 80 10 L 60 70 L -60 70 Z" fill="#5C4A3E" stroke="#3B2316" strokeWidth={4} />
            <path d="M60 60 L 110 80" stroke="#5C4A3E" strokeWidth={14} strokeLinecap="round" />
          </g>
          {/* golden drops fall from the spout into the basket */}
          {dropsOn > 0 && [0, 1, 2].map((i) => { const p = ((lt - cPress) * 0.7 + i / 3) % 1; const x = lerp(PX + 115, BX - 10, p), y = lerp(PY + 85, BY - 80, p) - Math.sin(p * Math.PI) * 70;
            return <path key={i} opacity={dropsOn * (p < 0.92 ? 1 : 0)} transform={`translate(${x} ${y})`} d="M0 -16 C 11 -2, 11 12, 0 13 C -11 12, -11 -2, 0 -16 Z" fill={GOLD_OIL} stroke={SK.goldDeep} strokeWidth={2} />; })}
        </SVG>
        <Chip text="PRESS" x={PX} y={PY + 100} lt={lt} at={cPress + 0.1} size={24} />
        <Basket cx={BX} cy={BY} s={0.95} kind="oil" lt={lt} at={cOil + 0.3} glow={level * (0.6 + 0.4 * Math.sin(lt * 3))}
          items={OILSEEDS.map((_, i) => ({ color: GOLD_OIL, at: cPress + 1.0 + i * 0.7 }))} />
        <Pic slot="cooking_oil" label="Cooking oil in your kitchen" x={60} y={480} w={420} h={330} lt={lt} at={cCook} fx="pop" />
        <Chip text="COOKING OIL!" x={270} y={790} lt={lt} at={cKitchen} tone="gold" size={30} />
      </Scene>
    );
  };
}
// Scene 3 — four cash crops drop into the CASH basket, off to market, Stop 2 (sorting game).
const CASH = [["cotton_boll", "Cotton", "cotton"], ["cane_stalks", "Sugarcane", "sugarcane"], ["tea_leaves", "Tea", "tea"], ["coffee_beans", "Coffee", "coffee"]];
const SORT = [["mustard", "Mustard", "oil"], ["tea_leaves", "Tea", "cash"], ["groundnut", "Groundnut", "oil"], ["cotton_boll", "Cotton", "cash"], ["sesame", "Sesame", "oil"], ["coffee_beans", "Coffee", "cash"]];
function B3(ctx) {
  return ({ localTime: lt, duration }) => {
    const cCash = W("b3", "cash"), ats = CASH.map((c) => W("b3", c[2])), cSell = W("b3", "sell"), cMoney = W("b3", "money"), cFam = W("b3", "families"), at = stopStart("b3"), hold = holdOf("b3");
    const xs = [190, 470, 750, 1030], BX = 640, BY = 640;
    const trip = Easing.easeInOutCubic(clamp((lt - cSell) / 1.6, 0, 1));
    const bx = lerp(BX, 1060, trip), by = lerp(BY, 600, trip) - Math.abs(Math.sin(trip * Math.PI * 4)) * 14 * (trip < 1 ? 1 : 0);
    const main = 1 - reveal(lt, at - 0.4, 0.4);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[3]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(3, ctx, [L("CASH CROPS → grown mainly to SELL", cCash, "big"), L("cotton · sugarcane · tea · coffee", ats[0]), L("Farmers sell them at the market…", cSell),
          L("…and earn money for their families", cMoney, "think"), L("HAVE YOU UNDERSTOOD?", at, "head"), L("Oilseed or cash crop? Sort them!", at + 0.3)], { max: 6 })}>
        <div style={{ position: "absolute", inset: 0, opacity: main }}>
          <Big x={60} y={30} w={900} lt={lt} at={cCash} size={44} color={SK.gold}>Next, CASH CROPS</Big>
          {CASH.map(([s, lab], i) => <Fall key={s} slot={s} label={lab} x0={xs[i]} y0={220} x1={BX} y1={BY - 70} r0={100} r1={28} lt={lt} at={ats[i]} t0={ats[i] + 0.9} />)}
          <Basket cx={260} cy={680} s={0.6} kind="oil" lt={lt} at={cCash} items={OILSEEDS.map(() => ({ color: GOLD_OIL, at: cCash }))} />
          <Basket cx={bx} cy={by} s={0.95} kind="cash" lt={lt} at={cCash + 0.2} glow={0.5 * reveal(lt, cMoney, 0.4)}
            items={CASH.map((_, i) => ({ color: ["#F4F1E8", "#7FB24E", "#2F8F4E", "#7A4A2A"][i], at: ats[i] + 1.6 }))} />
          <Pic slot="market" label="A busy crop market" x={900} y={60} w={500} h={360} lt={lt} at={cSell} fx="zoom" />
          <Chip text="to the MARKET" x={1150} y={40} lt={lt} at={cSell + 0.2} tone="gold" size={28} />
          {[0, 1, 2].map((i) => { const k = pop(lt, cMoney + i * 0.25, 0.5); if (k <= 0) return null;
            return <div key={i} style={{ position: "absolute", left: 1180 + i * 70, top: 470 - 40 * k - i * 10, opacity: k, width: 70, height: 70, borderRadius: 35, background: SK.gold, boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 700, fontSize: 40, color: SK.ink }}>₹</div>; })}
          <Chip text="money for the family" x={1250} y={560} lt={lt} at={cFam} size={26} />
        </div>
        <StopShell lt={lt} at={at} hold={hold} heading="HAVE YOU UNDERSTOOD?" n={2}>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 40, color: SK.gold, marginTop: 18 }}>Oilseed or cash crop? Which basket?</div>
          {SORT.map(([s, lab], i) => { const x = 110 + (i % 3) * 400, y = 230 + Math.floor(i / 3) * 190, bob = 8 * Math.sin(lt * 2 + i);
            return <div key={s} style={{ position: "absolute", left: x, top: y + bob, display: "flex", alignItems: "center", gap: 16, opacity: pop(lt, at + 0.2 + i * 0.12, 0.5) }}>
              <Pic slot={s} label={lab} x={0} y={0} w={120} h={120} r={60} lt={lt} at={at} fx="none" style={{ position: "relative", boxShadow: "0 0 0 4px " + SK.cream }} />
              <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 38, color: SK.white }}>{lab}</div></div>; })}
        </StopShell>
        <Basket cx={400} cy={700} s={0.55} kind="oil" lt={lt} at={at} op={windowOp(lt, at - 0.3, at + hold + 0.4, 0.35)} />
        <Basket cx={880} cy={700} s={0.55} kind="cash" lt={lt} at={at} op={windowOp(lt, at - 0.3, at + hold + 0.4, 0.35)} />
      </Scene>
    );
  };
}
// Scene 4 — each crop on its own patch of soil, under its own sky.
function B4(ctx) {
  const P = [["deccan_black", "black soil", "Cotton", "sun", "cash"], ["crop_rice", "wet fields", "Rice", "rain", null], ["lanka_tea", "misty hills", "Tea", "mist", "cash"]];
  return ({ localTime: lt, duration }) => {
    const cFussy = W("b4", "fussy"), cSoil = W("b4", "soil"), cClim = W("b4", "climate");
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[4]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(4, ctx, [L("Every crop is fussy!", cFussy, "big"), L("Different crops need different SOIL…", cSoil), L("…and a different CLIMATE", cClim)])}>
        <Big x={60} y={40} w={1300} lt={lt} at={cFussy} size={52} color={SK.gold}>Every crop is fussy!</Big>
        <SVG op={1}>{P.map((p, i) => <Sky key={i} kind={p[3]} x={260 + i * 450} y={200} lt={lt} op={out3(lt, cClim + i * 0.25, 0.6)} />)}</SVG>
        {P.map(([slot, soil, crop, , bk], i) => <React.Fragment key={slot}>
          <Pic slot={slot} label={soil} x={60 + i * 450} y={300} w={400} h={460} lt={lt} at={cFussy + 0.2 + i * 0.25} fx="pop" />
          <Chip text={crop} x={260 + i * 450} y={320} lt={lt} at={cFussy + 0.5 + i * 0.25} tone="gold" size={32} />
          <Chip text={soil} x={260 + i * 450} y={780} lt={lt} at={cSoil + i * 0.25} size={30} />
          {bk && <BasketTag kind={bk} x={420 + i * 450} y={340} lt={lt} at={cFussy + 0.7 + i * 0.25} />}
        </React.Fragment>)}
        <Chip text="SOIL" x={140} y={250} lt={lt} at={cSoil} size={26} tone="green" />
        <Chip text="CLIMATE" x={1290} y={250} lt={lt} at={cClim} size={26} tone="green" />
      </Scene>
    );
  };
}
// Scene 5 — the black-soil sponge: a cut-away where water is held and cotton roots drink slowly.
function B5(ctx) {
  return ({ localTime: lt, duration }) => {
    const cCot = W("b5", "cotton"), cHolds = W("b5", "holds"), cMoist = W("b5", "moisture"), cSponge = W("b5", "sponge"), cRoots = W("b5", "roots"), cDay = W("b5", "day"),
      cStrong = W("b5", "strong"), cCalled = W("b5", "called");
    const X0 = 700, X1 = 1380, GY = 400;                        // cut-away box: ground line at GY
    const wet = out3(lt, cHolds, 1.0), drink = clamp((lt - cRoots) / 6, 0, 1), grow = 0.55 + 0.45 * out3(lt, cRoots, 4.5), bolls = pop(lt, cStrong, 0.7);
    const dayN = lt < cDay ? 0 : Math.min(9, 1 + Math.floor((lt - cDay) / 0.55));
    const drops = []; for (let i = 0; i < 26; i++) drops.push([X0 + 40 + ((i * 97) % 600), GY + 50 + ((i * 53) % 260)]);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[5]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(5, ctx, [L("COTTON + BLACK SOIL", cCot, "big"), L("Holds moisture for a long time", cMoist), L("Like a SPONGE", cSponge), L("Good for cotton roots: water day after day", cRoots),
          L("Found on the Deccan Plateau", cStrong), L("“BLACK COTTON SOIL”", cCalled, "think")], { max: 6 })}>
        <Pic slot="deccan_black" label="Black soil on the Deccan Plateau after rain" x={40} y={60} w={620} h={440} lt={lt} at={0.1} fx="zoom" />
        <Chip text="Deccan Plateau" x={350} y={450} lt={lt} at={cCot + 0.5} tone="gold" size={28} />
        <Pic slot="cotton_boll" label="Fluffy cotton bolls burst open" x={40} y={530} w={420} h={330} lt={lt} at={cStrong} fx="pop" />
        <MiniBasket kind="cash" x={540} y={690} lt={lt} at={cCot + 0.3} />
        <Chip text="cotton = cash crop" x={560} y={760} lt={lt} at={cCot + 0.5} size={22} />
        <SVG op={out3(lt, cCot, 0.7)}>
          <rect x={X0} y={60} width={X1 - X0} height={GY - 60} rx={20} fill="rgba(160,205,235,0.18)" />
          <rect x={X0} y={GY} width={X1 - X0} height={420} rx={20} fill={BLACK_SOIL} stroke="rgba(255,255,255,0.35)" strokeWidth={3} />
          <T x={X0 + 30} y={GY + 46} anchor="start" size={26} bold color={SK.cream}>BLACK SOIL</T>
          {/* water held in the soil, like a sponge; the roots drink it slowly */}
          {drops.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={9} fill={WATER} opacity={wet * (1 - drink * (i % 3 === 0 ? 0.9 : 0.5)) * (0.7 + 0.3 * Math.sin(lt * 2 + i))} />)}
          <g transform={`translate(${(X0 + X1) / 2} ${GY})`}>
            {/* roots */}
            {[[-80, 180], [-30, 260], [20, 300], [70, 210], [110, 150]].map(([dx, d], i) => <path key={i} d={`M0 0 Q ${dx * 0.4} ${d * 0.5} ${dx} ${d * grow}`} stroke={drink > 0 ? "#D9C59A" : "#C9B48A"} strokeWidth={6 - i * 0.6} fill="none" strokeLinecap="round" />)}
            {drink > 0 && [0, 1, 2, 3].map((i) => { const p = ((lt - cRoots) * 0.5 + i / 4) % 1; return <circle key={i} cx={0} cy={260 * (1 - p)} r={7} fill={WATER} opacity={0.9 * (1 - p)} />; })}
            {/* cotton plant grows, bolls burst */}
            <g transform={`scale(${grow})`}>
              <line x1={0} y1={0} x2={0} y2={-300} stroke="#5E8C3A" strokeWidth={10} strokeLinecap="round" />
              {[[-1, -110], [1, -170], [-1, -230]].map(([sd, y], i) => <g key={i}><line x1={0} y1={y} x2={sd * 90} y2={y - 40} stroke="#5E8C3A" strokeWidth={7} strokeLinecap="round" />
                <ellipse cx={sd * 60} cy={y - 10} rx={34} ry={16} fill="#6FA845" transform={`rotate(${sd * -25} ${sd * 60} ${y - 10})`} />
                <g transform={`translate(${sd * 95} ${y - 48})`}><circle r={16} fill="#7A5A30" />{bolls > 0 && [[-12, -8], [10, -10], [0, 8], [-14, 8], [14, 6]].map(([bx, by], k) => <circle key={k} cx={bx * bolls} cy={by * bolls} r={15 * bolls} fill="#FAFAF5" />)}</g></g>)}
              <g transform="translate(0 -318)"><circle r={18} fill="#7A5A30" />{bolls > 0 && [[-14, -8], [12, -10], [0, 10], [-16, 8], [16, 6]].map(([bx, by], k) => <circle key={k} cx={bx * bolls} cy={by * bolls} r={17 * bolls} fill="#FAFAF5" />)}</g>
            </g>
          </g>
        </SVG>
        <Chip text="holds moisture like a SPONGE" x={(X0 + X1) / 2} y={GY + 340} lt={lt} at={cSponge} out={cCalled - 0.2} tone="gold" size={28} />
        {dayN > 0 && <div style={{ position: "absolute", left: X0 + 24, top: 84, fontFamily: SERIF, fontWeight: 700, fontSize: 34, color: SK.white, opacity: out3(lt, cDay, 0.4) * (1 - reveal(lt, cCalled, 0.4)) }}>day {dayN}…</div>}
        <Badge text="BLACK COTTON SOIL" x={830} y={725} lt={lt} at={cCalled} size={38} />
      </Scene>
    );
  };
}
// Scene 6 — WOW: the soil ploughs itself. Dry → cracks open; rain → swells, cracks close, soil mixes.
function B6(ctx) {
  return ({ localTime: lt, duration }) => {
    const cWow = W("b6", "wow"), cPlough = W("b6", "plough"), cDry = W("b6", "dry"), cCracks = W("b6", "cracks"), cRain = W("b6", "rain"), cSwell = W("b6", "swells"), cMix = W("b6", "mixes"), cJust = W("b6", "just");
    const open = out3(lt, cCracks - 0.6, 1.4) * (1 - Easing.easeInOutCubic(clamp((lt - cSwell) / 2.2, 0, 1)));
    const raining = windowOp(lt, cRain, cMix + 1.5, 0.4);
    const mix = clamp((lt - cSwell - 0.4) / Math.max(1, cMix + 1.4 - cSwell - 0.4), 0, 1);
    const Y0 = 700, H = 230, xs = [180, 420, 660, 900, 1140];
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[6]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(6, ctx, [L("Black soil PLOUGHS ITSELF!", cPlough, "big"), L("DRY SEASON: it shrinks, deep cracks open", cDry, "head"), L("RAIN: it swells, the cracks close", cRain, "head"),
          L("The top soil mixes down – like a plough", cMix)])}>
        <Wow x={60} y={50} lt={lt} at={cWow} text="Black soil PLOUGHS ITSELF!" />
        <Pic slot="soil_cracks" label="Dry season: deep cracks in black soil" x={40} y={190} w={660} h={470} lt={lt} at={cDry} fx="zoom" />
        <Pic slot="soil_rain" label="Rain: the soil swells and the cracks close" x={740} y={190} w={660} h={470} lt={lt} at={cRain} fx="zoom" />
        <Chip text="DRY SEASON: cracks open" x={370} y={210} lt={lt} at={cDry + 0.2} tone="gold" size={28} />
        <Chip text="RAIN: the soil swells" x={1070} y={210} lt={lt} at={cRain + 0.2} tone="gold" size={28} />
        {/* time-lapse strip: the soil shrinks (cracks), swells (cracks close), topsoil falls in */}
        <SVG op={out3(lt, cDry, 0.6)}>
          <rect x={60} y={Y0} width={1260} height={H} rx={18} fill={BLACK_SOIL} stroke="rgba(255,255,255,0.35)" strokeWidth={3} />
          <rect x={60} y={Y0} width={1260} height={26} rx={10} fill="#6B5444" />
          {xs.map((x, i) => { const w = 46 * open, d = 170 * open; if (w < 1) return null;
            return <path key={i} d={`M${x - w} ${Y0} L ${x + 8} ${Y0 + d} L ${x + w} ${Y0} Z`} fill="#0F3D2E" stroke="#16100C" strokeWidth={3} />; })}
          {/* topsoil crumbs tumble into the cracks while they close */}
          {mix > 0 && mix < 1 && xs.map((x, i) => [0, 1, 2].map((k) => { const p = clamp(mix * 1.4 - k * 0.15, 0, 1); return <circle key={i + "-" + k} cx={x + (k - 1) * 10} cy={Y0 + 10 + p * 150} r={8} fill="#8A6A48" opacity={p > 0 && p < 1 ? 1 : 0} />; }))}
          {mix >= 1 && xs.map((x, i) => <path key={i} d={`M${x - 20} ${Y0 + 20} q 20 60 0 140`} stroke="#6B5444" strokeWidth={8} fill="none" opacity={0.7} />)}
          {raining > 0 && Array.from({ length: 30 }, (_, i) => { const p = ((lt * 1.4 + i * 0.137) % 1); const x = 80 + (i * 41) % 1220; return <line key={i} x1={x} y1={Y0 - 90 + p * 90} x2={x - 6} y2={Y0 - 70 + p * 90} stroke={WATER} strokeWidth={4} strokeLinecap="round" opacity={raining * (1 - p * 0.6)} />; })}
          <T x={90} y={Y0 + H - 22} anchor="start" size={24} bold color={SK.cream} op={1}>{lt < cSwell ? "shrinks… cracks open" : mix < 1 ? "swells… cracks close" : "the soil has mixed itself"}</T>
        </SVG>
        <Chip text="just like a farmer's plough!" x={1000} y={Y0 + H - 60} lt={lt} at={cJust} tone="gold" size={28} />
      </Scene>
    );
  };
}
// Scene 7 — sugarcane: warmth, fertile soil, LOTS of water, many months; Stop 3 (desert), then the leaf break.
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function B7(ctx) {
  return ({ localTime: lt, duration }) => {
    const cCane = W("b7", "sugarcane"), cWarm = W("b7", "warmth"), cFert = W("b7", "fertile"), cLots = W("b7", "lots"), cWhy = W("b7", "why"), cVery = W("b7", "very"),
      cMonths = W("b7", "months"), cThirsty = W("b7", "thirsty"), cPlenty = W("b7", "plenty"), cCanals = W("b7", "canals"), at = stopStart("b7"), hold = holdOf("b7"), brk = at + 5.0;
    const months = clamp((lt - cVery) / 0.45, 0, 11.99), mi = Math.floor(months), tall = 0.25 + 0.75 * clamp((lt - cVery) / 5.4, 0, 1);
    const flow = windowOp(lt, cThirsty, at, 0.4);
    const main = 1 - reveal(lt, at - 0.4, 0.4);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[7]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(7, ctx, [L("SUGARCANE needs:", cCane, "head"), L("WARMTH", cWarm), L("FERTILE soil", cFert), L("plenty of WATER", cLots), L("A long growing period – water for many months", cMonths, "big"),
          L("So: plenty of rain, or water from canals", cPlenty), L("PAUSE AND DISCUSS", at, "head"), L("Sugarcane in a dry desert?", at + 0.3, "think")], { max: 6 })}>
        <div style={{ position: "absolute", inset: 0, opacity: main }}>
          <Pic slot="field_cane" label="Sugarcane beside a canal in the warm sun" x={40} y={60} w={620} h={420} lt={lt} at={0.1} fx="zoom" />
          <MiniBasket kind="cash" x={590} y={150} lt={lt} at={cCane + 0.2} />
          {[["☀ WARMTH", cWarm], ["FERTILE soil", cFert], ["LOTS of water", cLots]].map(([t, a], i) => <Chip key={t} text={t} x={150 + i * 205} y={510 + (i % 2) * 0} lt={lt} at={a} tone={i === 2 ? "gold" : "cream"} size={26} />)}
          <Big x={60} y={600} w={600} lt={lt} at={cWhy} out={cVery} size={80} color={SK.gold}>Why?</Big>
          <Pic slot="cane_tall" label="Sugarcane taller than a farmer" x={40} y={590} w={620} h={320} lt={lt} at={cPlenty} fx="pop" />
          {/* calendar flipping through the months while the cane grows taller than a farmer */}
          <SVG op={out3(lt, cVery - 0.3, 0.6)}>
            <rect x={720} y={60} width={680} height={850} rx={22} fill="rgba(5,30,22,0.58)" stroke="rgba(255,255,255,0.18)" strokeWidth={2} />
            <g transform="translate(790 110)">
              <rect width={170} height={170} rx={16} fill={SK.cream} />
              <rect width={170} height={46} rx={16} fill="#B3261E" /><rect y={30} width={170} height={16} fill="#B3261E" />
              <text x={85} y={124} textAnchor="middle" fontFamily={SERIF} fontWeight="700" fontSize="58" fill={SK.ink}>{MONTHS[mi]}</text>
              <text x={210} y={70} fontFamily={SANS} fontWeight="700" fontSize="34" fill={SK.white}>month {mi + 1}</text>
              <text x={210} y={115} fontFamily={SANS} fontSize="26" fill={SK.dim}>still growing…</text>
            </g>
            {/* ground + canal */}
            <rect x={740} y={830} width={640} height={60} rx={10} fill="#5C4A3E" />
            <rect x={740} y={812} width={640} height={22} rx={8} fill={WATER} opacity={0.35 + 0.6 * flow} />
            {flow > 0 && Array.from({ length: 8 }, (_, i) => { const p = ((lt * 0.5 + i / 8) % 1); return <rect key={i} x={750 + p * 600} y={818} width={36} height={8} rx={4} fill="#E8F6FF" opacity={flow} />; })}
            {/* farmer silhouette (flat, generic) */}
            <g transform="translate(1290 812)" fill="#1E2A24">
              <circle cx={0} cy={-232} r={24} /><path d="M-30 -204 L 30 -204 L 24 -100 L -24 -100 Z" /><rect x={-22} y={-100} width={18} height={100} rx={6} /><rect x={4} y={-100} width={18} height={100} rx={6} />
              <path d="M-36 -248 L 36 -248 L 20 -262 L -20 -262 Z" />
            </g>
            <T x={1290} y={566} size={22} color={SK.dim}>farmer</T>
            {/* the cane: segmented stalks, height = tall */}
            {[870, 960, 1050, 1140].map((x, i) => { const h = (390 + i * 28) * tall; const segs = Math.max(1, Math.floor(h / 60));
              return <g key={x}>{Array.from({ length: segs }, (_, k) => <rect key={k} x={x - 10} y={812 - (k + 1) * (h / segs)} width={20} height={h / segs - 4} rx={5} fill={k % 2 ? "#8DBA4E" : "#7FB24E"} />)}
                <path d={`M${x} ${812 - h} q -60 30 -90 90`} stroke="#5E9C3A" strokeWidth={8} fill="none" /><path d={`M${x} ${812 - h} q 60 20 80 100`} stroke="#5E9C3A" strokeWidth={8} fill="none" /></g>; })}
          </SVG>
          <Chip text="thirsty the WHOLE time!" x={1060} y={320} lt={lt} at={cThirsty} tone="gold" size={28} />
          <Chip text="rain or CANALS" x={1060} y={380} lt={lt} at={cCanals} size={28} />
        </div>
        {/* Stop 3: a dry sandy desert with one wilting sugarcane plant */}
        <Pic slot="desert_cane" label="A dry desert with one wilting sugarcane plant" x={40} y={60} w={1360} h={900} lt={lt} at={at - 0.4} fx="zoom" kenDur={8} op={1 - reveal(lt, brk, 0.4)} />
        <StopShell lt={lt} at={at} hold={hold} heading="PAUSE AND DISCUSS" n={3} top={470} h={490} bg="rgba(5,30,22,0.86)">
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 50, lineHeight: 1.2, color: SK.white, marginTop: 30, maxWidth: 1000 }}>Could a farmer grow sugarcane in a dry desert? What would they need?</div>
        </StopShell>
        <Break lt={lt} at={brk} dur={2.4} />
      </Scene>
    );
  };
}
// Scene 9 — Did you know? Brazil (1st) and India (2nd) in sugarcane · Ukraine sunflowers · Sri Lanka coffee → tea.
function Globe({ cx, cy, r, lt, op }) {
  if (op <= 0) return null;
  const sp = lt * 0.9;
  return (
    <g opacity={op}>
      <circle cx={cx} cy={cy} r={r} fill="#2E7AA8" stroke={SK.cream} strokeWidth={4} />
      {[0, 1, 2, 3, 4, 5].map((i) => { const ph = ((sp + i * Math.PI / 3) % Math.PI); const rx = Math.abs(r * Math.cos(ph)); return <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={r} stroke="rgba(255,255,255,0.45)" strokeWidth={2} fill="none" />; })}
      {[-0.5, 0, 0.5].map((k) => <ellipse key={k} cx={cx} cy={cy + k * r} rx={r * Math.sqrt(1 - k * k)} ry={r * 0.12} stroke="rgba(255,255,255,0.45)" strokeWidth={2} fill="none" />)}
      {[0, 1, 2].map((i) => { const a = sp + i * 2.1, x = Math.sin(a); if (Math.cos(a) < 0) return null; return <ellipse key={i} cx={cx + x * r * 0.65} cy={cy + (i - 1) * r * 0.4} rx={r * 0.28 * Math.cos(a)} ry={r * 0.2} fill="#6FBF6E" />; })}
    </g>
  );
}
function B8(ctx) {
  return ({ localTime: lt, duration }) => {
    const cDid = W("b8", "did"), cBr = W("b8", "brazil"), cIn = W("b8", "india"), cUk = W("b8", "ukraine"), cGold = W("b8", "golden"), cStr = W("b8", "stretching"), cSri = W("b8", "sri"),
      cLong = W("b8", "long"), cCof = W("b8", "coffee"), cDis = W("b8", "disease"), cSw = W("b8", "switched");
    const bars = out3(lt, cBr + 0.5, 1.2);
    const old = out3(lt, cLong, 0.4);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[8]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(8, ctx, [L("BRAZIL grows the most sugarcane in the world", cBr), L("INDIA is second!", cIn, "big"), L("UKRAINE: vast golden sunflower fields", cUk),
          L("SRI LANKA: famous for its tea", cSri), L("Its farms once grew coffee – until a disease destroyed it", cDis), L("So they switched to TEA!", cSw, "think")], { max: 6 })}>
        <SVG op={1}><Globe cx={110} cy={110} r={62} lt={lt} op={out3(lt, cDid - 0.2, 0.6)} /></SVG>
        <Badge text="DID YOU KNOW?" x={200} y={76} lt={lt} at={cDid} size={40} />
        {/* Brazil */}
        <Pic slot="brazil_cane" label="Endless sugarcane fields in Brazil" x={40} y={200} w={820} h={560} lt={lt} at={cBr} out={cUk} fx="zoom" />
        <Chip text="BRAZIL" x={450} y={220} lt={lt} at={cBr + 0.1} out={cUk} tone="gold" size={34} />
        <MiniBasket kind="cash" x={790} y={290} lt={lt} at={cBr + 0.3} out={cUk} />
        <Card x={900} y={200} w={500} h={560} lt={lt} at={cBr + 0.3} out={cUk} pad={30}>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 22, letterSpacing: "0.14em", color: SK.gold }}>MOST SUGARCANE IN THE WORLD</div>
          {[["1st", "Brazil", 1.0, "#E2B04C", cBr + 0.5], ["2nd", "India", 0.61, "#8BD48A", cIn]].map(([pl, c, v, col, a]) => <div key={c} style={{ marginTop: 44, opacity: out3(lt, a, 0.5) }}>
            <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 40, color: SK.white }}><span style={{ color: col }}>{pl}</span> {c}</div>
            <div style={{ marginTop: 12, height: 56, width: 420 * v * (c === "Brazil" ? bars : out3(lt, cIn, 1.0)), background: col, borderRadius: 10 }} /></div>)}
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 36, color: SK.gold, marginTop: 50, opacity: pop(lt, cIn + 0.4, 0.6) }}>INDIA comes second!</div>
        </Card>
        {/* Ukraine */}
        <Pic slot="ukraine_sun" label="Golden sunflower fields in Ukraine" x={40} y={200} w={1360} h={560} lt={lt} at={cUk} out={cSri} fx="pan" />
        <Chip text="UKRAINE" x={720} y={220} lt={lt} at={cUk + 0.1} out={cSri} tone="gold" size={34} />
        <Chip text="golden sunflower fields" x={720} y={680} lt={lt} at={cGold} out={cSri} size={30} />
        <Chip text="…as far as you can see" x={720} y={620} lt={lt} at={cStr} out={cSri} size={28} />
        <MiniBasket kind="oil" x={1300} y={290} lt={lt} at={cUk + 0.3} out={cSri} />
        {/* Sri Lanka: tea now; flashback to coffee ruined by disease */}
        <Pic slot="lanka_tea" label="Green tea gardens on misty hills, Sri Lanka" x={40} y={200} w={1360} h={560} lt={lt} at={cSri} fx="zoom" />
        <Chip text="SRI LANKA – famous for its TEA" x={720} y={220} lt={lt} at={cSri + 0.1} tone="gold" size={34} />
        <div style={{ position: "absolute", left: 60, top: 290, opacity: old, filter: "sepia(0.7)" }}>
          <Pic slot="coffee_rust" label="Coffee leaves ruined by a disease" x={0} y={0} w={420} h={420} lt={lt} at={cLong} fx="pop" style={{ position: "relative" }} />
        </div>
        <Chip text="LONG AGO: COFFEE" x={270} y={720} lt={lt} at={cCof} out={cSw + 0.2} size={26} />
        <Chip text="a plant disease!" x={270} y={250} lt={lt} at={cDis} out={cSw + 0.2} tone="gold" size={26} />
        <SVG op={windowOp(lt, cSw, duration, 0.4)}><Arrow x1={500} y1={500} x2={720} y2={500} color={SK.gold} sw={10} head={32} /></SVG>
        <Chip text="switched to TEA!" x={920} y={468} lt={lt} at={cSw} tone="gold" size={38} />
        <MiniBasket kind="cash" x={1300} y={290} lt={lt} at={cSri + 0.3} />
      </Scene>
    );
  };
}
// Scene 10 — from soil to market: three journeys, then the farmer linked to the world.
const JOURNEYS = [["cotton_boll", "Cotton", "cotton_mill", "mill", "tshirt_shop", "T-shirt", "cotton", "tshirt", "cash"],
  ["cane_stalks", "Sugarcane", "sugar_factory", "factory", "sugar_bowl", "sugar", "sugarcane", "sugar", "cash"],
  ["groundnut", "Groundnut", "oil_press", "press", "oil_bottle", "cooking oil", "groundnut", "oil", "oil"]];
function B9(ctx) {
  return ({ localTime: lt, duration }) => {
    const cJ = W("b9", "journey"), cFarmer = W("b9", "farmer"), cConn = W("b9", "connected"), cFact = W("b9", "factories"), cShops = W("b9", "shops"), cTrade = W("b9", "trade"), cWorld = W("b9", "world");
    const rowAt = JOURNEYS.map((j, i) => [W("b9", j[6]), W("b9", j[7], j[7] === "sugar" ? 1 : 0)]);
    const rows = 1 - reveal(lt, cFarmer - 0.2, 0.5);
    const nodes = [["Village farm", 0, 0, cFarmer], ["Factories", -1, -1, cFact], ["Shops", 1, -1, cShops], ["Ships & trucks", -1, 1, cTrade], ["The world", 1, 1, cWorld]];
    const CX = 1080, CY = 480;
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[9]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(9, ctx, [L("FROM SOIL TO MARKET", cJ, "big"), L("cotton → clothes", rowAt[0][0]), L("sugarcane → sugar", rowAt[1][0]), L("groundnut → cooking oil", rowAt[2][0]),
          L("Local farmers ↔ global trade", cConn, "think")])}>
        <div style={{ position: "absolute", inset: 0, opacity: rows }}>
          {JOURNEYS.map(([s1, l1, s2, l2, s3, l3, , , bk], i) => { const [a, b] = rowAt[i], mid = (a + b) / 2, y = 170 + i * 260;
            return <React.Fragment key={s1}>
              <SVG op={1}>
                <Arr x1={290} y1={y} x2={480} y2={y} lt={lt} at={mid - 0.2} sw={7} />
                <Arr x1={760} y1={y} x2={950} y2={y} lt={lt} at={b - 0.2} sw={7} />
                {[0, 1].map((k) => { const s = k ? b : mid; if (lt < s) return null; const p = ((lt - s) * 0.6) % 1; return <circle key={k} cx={(k ? 760 : 290) + p * 180} cy={y} r={9} fill={SK.cream} opacity={1 - p} />; })}
              </SVG>
              <Node slot={s1} label={l1} x={180} y={y} r={92} lt={lt} at={a} size={24} />
              <Node slot={s2} label={l2} x={620} y={y} r={92} lt={lt} at={mid} size={24} />
              <Node slot={s3} label={l3} x={1090} y={y} r={92} lt={lt} at={b} size={26} tone="gold" />
              <BasketTag kind={bk} x={110} y={y - 80} lt={lt} at={a + 0.3} />
            </React.Fragment>; })}
          <Chip text="A crop goes on a long journey…" x={640} y={30} lt={lt} at={cJ} tone="gold" size={30} />
        </div>
        <Pic slot="cargo_ship" label="Trade around the world" x={40} y={60} w={640} h={820} lt={lt} at={cFarmer} fx="zoom" />
        <SVG op={out3(lt, cFarmer, 0.6)}>
          <circle cx={CX} cy={CY} r={330} fill="rgba(46,122,168,0.25)" stroke="rgba(255,255,255,0.3)" strokeWidth={3} />
          {[-0.5, 0, 0.5].map((k) => <ellipse key={k} cx={CX} cy={CY + k * 330} rx={330 * Math.sqrt(1 - k * k)} ry={40} stroke="rgba(255,255,255,0.18)" strokeWidth={2} fill="none" />)}
          {nodes.slice(1).map(([t, dx, dy, a], i) => { const x2 = CX + dx * 220, y2 = CY + dy * 210, o = out3(lt, a, 0.5); if (o <= 0) return null; const p = ((lt - a) * 0.5) % 1;
            return <g key={t} opacity={o}><line x1={CX} y1={CY} x2={x2} y2={y2} stroke={SK.gold} strokeWidth={5} strokeDasharray="14 10" />
              <circle cx={lerp(CX, x2, p)} cy={lerp(CY, y2, p)} r={10} fill={SK.cream} /></g>; })}
        </SVG>
        {nodes.map(([t, dx, dy, a]) => <Chip key={t} text={t} x={CX + dx * 220} y={CY + dy * 210 - 22} lt={lt} at={a} tone={dx === 0 ? "gold" : "cream"} size={dx === 0 ? 32 : 28} />)}
        <Big x={720} y={840} w={680} lt={lt} at={cWorld} size={40} align="center" color={SK.gold}>…all around the world!</Big>
      </Scene>
    );
  };
}
// Scene 11 — the answer (back to the two fields), then Stop 4: the quick check.
const QUICK = ["Name two oilseeds.", "Name two cash crops.", "Why does cotton grow well in black soil?", "Why does sugarcane need so much water?", "Which country grows the most sugarcane?"];
function B10(ctx) {
  return ({ localTime: lt, duration }) => {
    const cAns = W("b10", "answer"), cCot = W("b10", "cotton"), cMoist = W("b10", "moisture"), cCane = W("b10", "sugarcane"), cPlenty = W("b10", "plenty"), cThirsty = W("b10", "thirsty"),
      cRule = S("b10", 5), at = stopStart("b10"), hold = holdOf("b10");
    const main = 1 - reveal(lt, at - 0.4, 0.4);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[10]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(10, ctx, [L("ANSWER", cAns, "head"), L("Black soil HOLDS MOISTURE → cotton", cCot), L("Lots of WATER + a long growing time → sugarcane", cCane),
          L("SOIL + RAIN + CLIMATE decide the crop!", cRule, "big"), L("QUICK CHECK", at, "head"), L("Compare with your guesses from Stop 1", at + 0.3, "think")], { max: 6 })}>
        <div style={{ position: "absolute", inset: 0, opacity: main }}>
          <Big x={60} y={30} w={1300} lt={lt} at={cAns} size={44} color={SK.gold}>The answer to our big question</Big>
          <Pic slot="field_cotton" label="Cotton in black soil" x={40} y={120} w={670} h={480} lt={lt} at={0.1} fx="zoom" />
          <Pic slot="field_cane" label="Sugarcane beside the water" x={730} y={120} w={670} h={480} lt={lt} at={0.3} fx="zoom" />
          <SVG op={1}>
            <Arr x1={200} y1={560} x2={330} y2={300} lt={lt} at={cMoist} color={SK.gold} sw={9} />
            <Arr x1={900} y1={560} x2={1030} y2={300} lt={lt} at={cPlenty} color={WATER} sw={9} />
          </SVG>
          <Chip text="BLACK SOIL holds moisture" x={200} y={565} lt={lt} at={cMoist} tone="gold" size={26} />
          <Chip text="COTTON" x={375} y={250} lt={lt} at={cCot} size={30} />
          <Chip text="plenty of WATER" x={900} y={565} lt={lt} at={cPlenty} tone="gold" size={26} />
          <Chip text="SUGARCANE · thirsty for months" x={1065} y={250} lt={lt} at={cThirsty} size={28} />
          <Card x={40} y={640} w={1360} h={240} lt={lt} at={cRule - 0.1} pad={26}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 30, height: "100%" }}>
              {[["SOIL", "#8A6A48"], ["RAIN", WATER], ["CLIMATE", SK.gold]].map(([t, c], i) => <React.Fragment key={t}>
                {i > 0 && <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 56, color: SK.white, opacity: pop(lt, cRule + i * 0.35, 0.5) }}>+</span>}
                <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 60, color: SK.ink, background: c, padding: "8px 30px", borderRadius: 16, opacity: pop(lt, cRule + i * 0.35, 0.5) }}>{t}</span></React.Fragment>)}
              <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 50, color: SK.white, opacity: out3(lt, cRule + 1.4, 0.6) }}>= the crop!</span>
            </div>
          </Card>
        </div>
        <StopShell lt={lt} at={at} hold={hold} heading="QUICK CHECK" n={4}>
          {QUICK.map((q, i) => <div key={i} style={{ display: "flex", gap: 22, alignItems: "baseline", marginTop: i === 0 ? 36 : 18, opacity: out3(lt, at + 0.2 + i * 0.25, 0.5) }}>
            <span style={{ flex: "none", width: 44, fontFamily: SERIF, fontWeight: 700, fontSize: 40, color: SK.gold }}>{i + 1}</span>
            <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 40, color: SK.white, background: "rgba(255,255,255,0.08)", padding: "8px 24px", borderRadius: 16 }}>{q}</span></div>)}
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
const COLLAGE = [{ slot: "field_cotton", x: -60, y: -40, w: 760, h: 520, ph: 0 }, { slot: "field_cane", x: 640, y: -80, w: 760, h: 520, ph: 2 },
  { slot: "ukraine_sun", x: -80, y: 520, w: 700, h: 560, ph: 4 }, { slot: "lanka_tea", x: 560, y: 560, w: 820, h: 560, ph: 1 }];
function OilScenes(props = {}) {
  const caps = props.showCaptions === "false" ? false : props.showCaptions !== false;
  const titles = {};
  for (let n = 1; n <= NB; n++) titles[n] = str(props["title" + n + "Text"], TITLES[n]);
  const ctx = { caps, titles, capSize: num(props.captionSize, 34) };
  const B = [B1, B2, B3, B4, B5, B6, B7, B8, B9, B10];
  const beats = B.map((Bn, i) => { const t = BEAT("b" + (i + 1)); return [t.start, t.start + t.dur, Bn]; });
  return (
    <StoryFrame props={props} dur={DUR} persistKey="thinkpro-lp10-oilseeds-and-cash-crops" collage={COLLAGE}>
      {beats.map(([s, e, Bn], i) => (
        <Sprite key={i} start={s} end={e}>{Bn(ctx)}</Sprite>
      ))}
      {STOPS.map(([b, i, hold]) => <StopAt key={b} t={BEAT(b).start + stopAt(b, i)} hold={hold - 0.2} />)}
      <ChimeAt t={BEAT("b7").start + stopStart("b7") + 6.6} />
      <AudioSync />
    </StoryFrame>
  );
}
window.OilScenes = OilScenes;
