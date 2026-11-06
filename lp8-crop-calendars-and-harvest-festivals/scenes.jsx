/* global React, window */
// ThinkPro Academy — "Crop Calendars and Harvest Festivals" (Grade 6 Agriculture, Session 8, V2).
// After AG_G6_S8_Video_Script_Crop_Calendars_and_Harvest_Festivals (Draft 1, 3 Nov 2026, @Subrata):
// 11 script scenes → 10 voiced beats (scene 7, the leaf break, is the tail of b6's hold), four
// presenter stops (silent pauseAfter holds — the web player freezes there, TPStory.StopAt), two
// "Did you know?" cards. Central models: the CROP CALENDAR chart (b2 strip → b3 chart → b9 card)
// and the INDIA MAP whose festival pins stay (b5 → b6 → Stop 3). STORY STYLE (engine/story-kit.jsx).
// Pure function of time.
const { Sprite, Easing } = window;
const { reveal, windowOp, fade } = window.TPMotion;
const { num, str } = window.TPStage;
const { SK, SERIF, SANS, LEFT_W, pop, out3, lerp, drive, photoSrc,
  Pic, Chip, Badge, Big, Card, SVG, Arrow, T, ChimeAt, Scene, StoryFrame, StopAt, Break, Flip } = window.TPStory;

// ---- Timing: EVERYTHING is keyed to the narration (tools/fit_timing.py → timing.js).
const TM = window.TP_TIMING;
if (!TM) console.error("timing.js missing — run: python3 tools/fit_timing.py videos/lp8-crop-calendars-and-harvest-festivals");
const LEAD = TM ? TM.lead : 1.0;
const DUR = TM ? TM.total : 270;
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
// Bounce ease (the engine's Easing has none): 0→1 with two small rebounds.
const bounce = (x) => { const n = 7.5625, d = 2.75; if (x < 1 / d) return n * x * x; if (x < 2 / d) return n * (x -= 1.5 / d) * x + 0.75; if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + 0.9375; return n * (x -= 2.625 / d) * x + 0.984375; };

// ---- Panel copy. Title defaults mirror the DC data-props (titleNText) — keep in sync. ----
const TITLES = { 1: "LP8 – Crop Calendars and Harvest Festivals", 2: "Farming and festivals are connected", 3: "The crop calendar", 4: "Why celebrate at harvest?",
  5: "Winter harvest: mid-January", 6: "More harvest festivals", 7: "One season, many festivals", 8: "Harvest festivals are global!", 9: "Remember", 10: "The answer" };
const KICK = "Grade 6 · Agriculture · Session 8";
const KICKS = { 1: "Farming and festivals", 5: "Festival map of India", 6: "Festival map of India", 7: "Did you know?", 8: "Did you know?", 9: "Key points", 10: "Big question" };
const panel = (n, ctx, lines, extra = {}) => ({ kicker: KICKS[n] || KICK, title: ctx.titles[n], lines, ...extra });
const L = (text, at, kind = "item", extra = {}) => ({ text, at, kind, ...extra });

// ---- Presenter stops: [beat, sentence index whose pauseAfter holds the stop, hold s, heading, question]
const STOPS = [
  ["b1", 4, 5.0, "PAUSE AND DISCUSS", "Name a festival your family celebrates. Is it linked to a harvest?"],
  ["b3", 2, 5.0, "HAVE YOU UNDERSTOOD?", "What three things does a crop calendar show?"],
  ["b6", 2, 5.0, "MATCH IT!", "Pongal · Baisakhi · Onam · Bihu · Nuakhai – which state?"],
  ["b10", 2, 8.0, "QUICK CHECK", null],
];
const stopAt = (b, i) => SE(b, i) + 0.1;                       // beat-local start of the hold
const stopFor = (b) => STOPS.find((s) => s[0] === b);
const QUICK = ["What does a crop calendar show?", "Name two harvest festivals and their states.", "Which crop is harvested at Baisakhi?",
  "What does \"Nuakhai\" mean?", "Name one harvest festival from another country."];

// Compact stop card along the foot of the photo area, so the frozen picture (field, chart, map)
// stays visible above it, as the script asks.
function MiniStop({ lt, b, side = false }) {
  const s = stopFor(b); if (!s) return null;
  const at = stopAt(b, s[1]), hold = s[2] - 0.2, n = STOPS.indexOf(s) + 1;
  const o = windowOp(lt, at, at + hold, 0.35); if (o <= 0) return null;
  const p = clamp((lt - at) / hold, 0, 1), C = 2 * Math.PI * 40;
  return (
    <div style={{ position: "absolute", left: 40, top: side ? 150 : 712, width: side ? 600 : LEFT_W - 80, height: side ? 560 : 250, borderRadius: 24, background: "rgba(5,30,22,0.92)", opacity: o,
      boxShadow: "0 0 0 3px rgba(226,176,76,0.9)", padding: "26px 40px", boxSizing: "border-box", transform: `translateY(${(1 - out3(lt, at, 0.5)) * 30}px)` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: side ? "wrap" : "nowrap", maxWidth: side ? 420 : "none" }}>
        <svg width="60" height="60" viewBox="0 0 90 90"><circle cx="45" cy="45" r="43" fill={SK.gold} /><rect x="28" y="24" width="12" height="42" rx="4" fill={SK.ink} /><rect x="50" y="24" width="12" height="42" rx="4" fill={SK.ink} /></svg>
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 28, letterSpacing: "0.08em", color: SK.ink, background: SK.gold, padding: "8px 24px", borderRadius: 12 }}>{s[3]}</div>
        <div style={{ fontFamily: SANS, fontSize: 24, color: SK.dim }}>Stop {n} of {STOPS.length}</div>
      </div>
      <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: side ? 46 : 44, lineHeight: 1.2, color: SK.white, marginTop: side ? 40 : 22, maxWidth: 1130 }}>{side ? s[4].split(" – ").map((x, i) => <div key={i} style={i ? { color: SK.gold, marginTop: 24 } : null}>{x}</div>) : s[4]}</div>
    </div>
  );
}

// ---- Shared pieces ---------------------------------------------------------------
// Round photo bubble with a cream ring and a name chip under it.
function Bubble({ slot, label, x, y, r = 70, lt, at, size = 22, out = null, tone = "cream" }) {
  const o = pop(lt, at, 0.6) * (out != null ? 1 - reveal(lt, out, 0.4) : 1); if (o <= 0) return null;
  return (
    <React.Fragment>
      <Pic slot={slot} label={label} x={x - r} y={y - r} w={2 * r} h={2 * r} r={r} lt={lt} at={at} out={out} fx="pop" style={{ boxShadow: "0 0 0 4px " + SK.cream }} />
      <Chip text={label} x={x} y={y + r + 10} lt={lt} at={at + 0.15} out={out} size={size} tone={tone} />
    </React.Fragment>
  );
}
// Small festival lamp (diya) glyph, flame flickers with time.
function Lamp({ x, y, s = 1, lt, op = 1 }) {
  if (op <= 0) return null;
  const f = 1 + 0.08 * Math.sin(lt * 9 + x);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
      <circle cx={0} cy={-26} r={26} fill={SK.gold} opacity={0.25} />
      <path d={`M0 ${-44 * f} C 10 -30, 9 -18, 0 -14 C -9 -18, -10 -30, 0 ${-44 * f} Z`} fill="#F7C948" stroke="#E07B24" strokeWidth={2} />
      <path d="M-30 -12 C -26 8, 26 8, 30 -12 Z" fill="#C8642E" stroke="#7E3B18" strokeWidth={3} />
    </g>
  );
}
const lamp = (lt) => <svg width="70" height="70" viewBox="-40 -56 80 70"><Lamp x={0} y={0} lt={lt} /></svg>;

// ============================================================================
// Scene 1 — festival burst → the golden field → the big question (Stop 1).
function B1(ctx) {
  const tiles = [["pongal_pot", "Boiling pots", "boiling", 60, 60], ["lohri_bonfire", "Bonfires", "bonfires", 730, 60],
    ["bihu_dancers", "Dancing", "dancing", 60, 420], ["pookalam", "Flower carpets", "flower", 730, 420]];
  return ({ localTime: lt, duration }) => {
    const ats = tiles.map((t) => W("b1", t[2])), cLoves = S("b1", 1), cNoticed = S("b1", 2), cHarvest = W("b1", "harvest"), cWhy = S("b1", 4);
    const tilesOut = cNoticed;
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[1]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(1, ctx, [L("Boiling pots · bonfires · dancing · flower carpets", ats[0], "sub"), L("India loves to celebrate!", cLoves),
          L("So many festivals come at HARVEST time", cHarvest), L("BIG QUESTION", cWhy, "head"), L("Why do so many Indian festivals happen at harvest time?", cWhy + 0.3, "big")])}>
        <Pic slot="golden_field" label="A golden field ready for harvest" x={40} y={60} w={1360} h={900} lt={lt} at={cNoticed - 0.2} fx="zoom" kenDur={18} dur={1.0} />
        {tiles.map(([slot, label, , x, y], i) => {
          const tilt = (i % 2 ? 1.5 : -1.5) * (1 - out3(lt, ats[i], 0.6));
          return <div key={slot} style={{ position: "absolute", inset: 0, transform: `rotate(${tilt}deg)`, transformOrigin: `${x + 320}px ${y + 170}px` }}>
            <Pic slot={slot} label={label} x={x} y={y} w={650} h={340} lt={lt} at={ats[i]} out={tilesOut} fx="pop" dur={0.45} />
            <Chip text={label} x={x + 325} y={y + 280} lt={lt} at={ats[i] + 0.1} out={tilesOut} tone="gold" size={28} />
          </div>;
        })}
        <Big x={80} y={790} w={1000} lt={lt} at={cLoves} out={tilesOut} size={52}>India loves to celebrate!</Big>
        <Chip text="HARVEST time" x={720} y={110} lt={lt} at={cHarvest} tone="gold" size={40} />
        <Card x={170} y={300} w={1100} h={250} lt={lt} at={cWhy} out={stopAt("b1", 4)} pad={34}>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 24, letterSpacing: "0.14em", color: SK.gold }}>BIG QUESTION</div>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 52, lineHeight: 1.18, color: SK.white, marginTop: 10 }}>Why do so many Indian festivals happen at harvest time?</div>
        </Card>
        <MiniStop lt={lt} b="b1" />
      </Scene>
    );
  };
}

// The four farm steps, shared by the b2 strip and the b3 chart legend.
const STEPS = [["hero_plough", "Prepare the soil", "#8A6A48"], ["seed_sow", "Sow", "#C9A15A"], ["farmer_care", "Care", "#6FBF6E"], ["sickle", "Harvest", SK.gold]];
// Scene 2 — a farmer's year: each step drops onto a calendar strip.
function B2(ctx) {
  return ({ localTime: lt, duration }) => {
    const cConn = W("b2", "connected"), cCal = S("b2", 1), cPrep = W("b2", "prepare"), cSow = W("b2", "sow"), cHarv = W("b2", "harvest");
    const ats = [cPrep, cSow, (cSow + cHarv) / 2 + 0.2, cHarv];
    const cur = ats.reduce((k, a, i) => (lt >= a ? i : k), -1);
    const stripY = 700, cellW = 320, gap = 28, x0 = 40 + (1360 - (4 * cellW + 3 * gap)) / 2;
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[2]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(2, ctx, [L("Farming and festivals are closely connected", S("b2", 0)), L("Farmers follow a seasonal calendar", cCal, "big"),
          L("Prepare the soil", ats[0]), L("Sow", ats[1]), L("Care", ats[2]), L("Harvest", ats[3])], { max: 7 })}>
        {/* farming ⟷ festivals */}
        <div style={{ position: "absolute", inset: 0, opacity: 1 - reveal(lt, cCal, 0.5) }}>
          <Bubble slot="sickle" label="FARMING" x={440} y={360} r={170} lt={lt} at={0.3} size={34} tone="gold" />
          <Bubble slot="pongal_pot" label="FESTIVALS" x={1000} y={360} r={170} lt={lt} at={cConn - 0.6} size={34} tone="gold" />
          <SVG op={out3(lt, cConn, 0.5)}><Arrow x1={640} y1={360} x2={800} y2={360} color={SK.gold} sw={8} /><Arrow x1={800} y1={360} x2={640} y2={360} color={SK.gold} sw={8} /></SVG>
          <Chip text="closely connected" x={720} y={420} lt={lt} at={cConn} size={26} />
        </div>
        {/* the big step photo, one at a time */}
        {STEPS.map(([slot, label], i) => <Pic key={slot} slot={slot} label={label} x={200} y={70} w={1040} h={560} lt={lt} at={ats[i]} out={i < 3 ? ats[i + 1] : null} fx="zoom" kenDur={8} />)}
        {cur >= 0 && <Chip text={`${cur + 1} · ${STEPS[cur][1]}`} x={720} y={84} lt={lt} at={ats[cur]} tone="gold" size={32} />}
        {/* the calendar strip */}
        <div style={{ position: "absolute", left: x0 - 20, top: stripY - 54, width: 4 * cellW + 3 * gap + 40, height: 236, borderRadius: 20, background: "rgba(246,241,227,0.12)",
          boxShadow: "0 0 0 2px rgba(255,255,255,0.3)", opacity: out3(lt, cCal, 0.6) }}>
          <div style={{ position: "absolute", left: 20, top: 10, fontFamily: SANS, fontWeight: 700, fontSize: 22, letterSpacing: "0.14em", color: SK.gold }}>THE FARMER'S SEASONAL CALENDAR</div>
        </div>
        {STEPS.map(([slot, label, col], i) => { const x = x0 + i * (cellW + gap), at = ats[i] + 0.5, o = out3(lt, at, 0.5), dy = (1 - Easing.easeOutBack(reveal(lt, at, 0.6))) * -160;
          return <React.Fragment key={slot}>
            <div style={{ position: "absolute", left: x, top: stripY + dy, width: cellW, height: 160, borderRadius: 14, background: SK.cream, opacity: o, overflow: "hidden", display: "flex",
              boxShadow: `inset 0 -10px 0 ${col}` }}>
              <img src={photoSrc(slot) || ""} alt="" style={{ width: 130, height: 150, objectFit: "cover", display: photoSrc(slot) ? "block" : "none" }} />
              <div style={{ flex: 1, padding: "14px 14px", fontFamily: SERIF, fontWeight: 700, fontSize: 30, lineHeight: 1.1, color: SK.ink }}>
                <div style={{ fontFamily: SANS, fontSize: 20, color: SK.goldDeep }}>STEP {i + 1}</div>{label}</div>
            </div>
            {i < 3 && <SVG op={out3(lt, ats[i + 1] + 0.5, 0.4)}><Arrow x1={x + cellW + 2} y1={stripY + 80} x2={x + cellW + gap - 2} y2={stripY + 80} color={SK.gold} sw={5} head={14} /></SVG>}
          </React.Fragment>; })}
      </Scene>
    );
  };
}

// Scene 3 — the full crop calendar chart. Months Jan–Dec; blocks [startMonth, endMonth, kind].
const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
const MNAME = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const CROPS = [
  ["crop_rice", "Rice", [[5, 6, 0], [7, 8, 1], [9, 10, 2]]],
  ["crop_wheat", "Wheat", [[10, 10, 0], [11, 11, 1], [0, 2, 1], [3, 3, 2]]],
  ["crop_mustard", "Mustard", [[9, 9, 0], [10, 11, 1], [0, 0, 1], [1, 2, 2]]],
];
const KCOL = ["#C9A15A", "#6FBF6E", SK.gold];
const KNAME = ["SOW", "CARE", "HARVEST"];
function CropChart({ lt, at, cues, glowAt, x = 60, y = 90, w = 1320, rowH = 120, lampAt }) {
  const o = out3(lt, at, 0.7); if (o <= 0) return null;
  const labW = 250, colW = (w - labW) / 12, top = y + 60;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <div style={{ position: "absolute", left: x, top: y, width: w, height: 60 + CROPS.length * rowH + 20, borderRadius: 20, background: SK.cream, boxShadow: "0 10px 30px rgba(0,0,0,0.35)" }} />
      <SVG>
        {MONTHS.map((m, i) => <T key={i} x={x + labW + colW * (i + 0.5)} y={y + 42} size={24} bold color={SK.ink}>{MNAME[i]}</T>)}
        {MONTHS.map((m, i) => <line key={i} x1={x + labW + colW * i} y1={top} x2={x + labW + colW * i} y2={top + CROPS.length * rowH} stroke={SK.inkLine} strokeWidth={2} />)}
        {CROPS.map((c, r) => <line key={r} x1={x + 20} y1={top + rowH * r} x2={x + w - 20} y2={top + rowH * r} stroke={SK.inkLine} strokeWidth={2} />)}
        {CROPS.map(([slot, name, blocks], r) => blocks.map(([a, b, k], j) => {
          const p = Easing.easeOutCubic(reveal(lt, cues[k] + r * 0.15, 0.7)); if (p <= 0) return null;
          const bx = x + labW + colW * a + 4, bw = (colW * (b - a + 1) - 8) * p, by = top + rowH * r + 22, bh = rowH - 44;
          const g = k === 2 ? out3(lt, glowAt, 0.6) * (0.6 + 0.4 * Math.sin(lt * 4)) : 0;
          return <g key={r + "-" + j}>
            {g > 0 && <rect x={bx - 6} y={by - 6} width={bw + 12} height={bh + 12} rx={16} fill={SK.gold} opacity={0.45 * g} />}
            <rect x={bx} y={by} width={bw} height={bh} rx={12} fill={KCOL[k]} stroke="rgba(0,0,0,0.18)" strokeWidth={2} />
            {p > 0.9 && bw > 70 && <T x={bx + bw / 2} y={by + bh / 2 + 9} size={k === 2 && bw < 120 ? 18 : 22} bold color={SK.ink}>{KNAME[k]}</T>}
          </g>;
        }))}
        {CROPS.map(([slot, name, blocks], r) => { const hb = blocks.find((bl) => bl[2] === 2), lx = x + labW + colW * (hb[0] + hb[1] + 1) / 2;
          return <Lamp key={r} x={lx} y={top + rowH * r + 26} s={0.8} lt={lt} op={pop(lt, lampAt + r * 0.25, 0.5)} />; })}
      </SVG>
      {CROPS.map(([slot, name], r) => (
        <React.Fragment key={slot}>
          <Pic slot={slot} label={name} x={x + 20} y={top + rowH * r + 14} w={92} h={92} r={46} lt={lt} at={at + 0.2 + r * 0.15} fx="pop" border={false} />
          <div style={{ position: "absolute", left: x + 124, top: top + rowH * r + 40, fontFamily: SERIF, fontWeight: 700, fontSize: 32, color: SK.ink, opacity: out3(lt, at + 0.3 + r * 0.15, 0.5) }}>{name}</div>
        </React.Fragment>
      ))}
    </div>
  );
}
function B3(ctx) {
  return ({ localTime: lt, duration }) => {
    const cChart = W("b3", "crop"), cSow = W("b3", "sow"), cCare = W("b3", "care"), cHarv = W("b3", "harvest"), cLook = S("b3", 2), cHarv2 = W("b3", "harvest", 1);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[3]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(3, ctx, [L("A CROP CALENDAR shows when to:", cChart, "big"), L("SOW each crop", cSow), L("CARE for it", cCare), L("HARVEST it", cHarv),
          L("Harvest time = celebration time!", cHarv2, "think")])}>
        <CropChart lt={lt} at={0.2} cues={[cSow, cCare, cHarv]} glowAt={cLook} lampAt={cHarv2} />
        <Badge text="CROP CALENDAR" x={60} y={30} lt={lt} at={cChart} size={30} />
        {[0, 1, 2].map((k) => <Chip key={k} text={["Sow", "Care", "Harvest"][k]} x={330 + k * 220} y={560} lt={lt} at={[cSow, cCare, cHarv][k]} size={28} tone={k === 2 ? "gold" : "cream"} />)}
        <Big x={1000} y={548} w={400} lt={lt} at={cHarv2} size={40} color={SK.gold} align="right">Harvest time = celebration time!</Big>
        <MiniStop lt={lt} b="b3" />
      </Scene>
    );
  };
}

// Scene 4 — why celebrate at harvest?
function B4(ctx) {
  const tiles = [["farmer_rest", "Hard work is over", "hard"], ["harvest_baskets", "Fresh food", "fresh"], ["family_thanks", "Thank you, nature!", "thank"]];
  return ({ localTime: lt, duration }) => {
    const ats = tiles.map((t) => W("b4", t[2])), cSun = W("b4", "sun"), cRain = W("b4", "rain"), cSoil = W("b4", "soil");
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[4]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(4, ctx, [L("Why celebrate at harvest?", S("b4", 0), "head"), L("The farmers' hard work is over", ats[0]), L("Fresh food from the fields", ats[1]),
          L("Thanks to nature for its gifts", ats[2]), L("the sun · the rain · the soil", cSun, "sub")])}>
        <Big x={60} y={70} w={1300} lt={lt} at={S("b4", 0)} size={50}>Why celebrate at harvest time?</Big>
        {tiles.map(([slot, label], i) => <React.Fragment key={slot}>
          <Pic slot={slot} label={label} x={60 + i * 450} y={170} w={420} h={420} lt={lt} at={ats[i]} fx="zoom" />
          <div style={{ position: "absolute", left: 60 + i * 450 + 16, top: 186, width: 54, height: 54, borderRadius: 27, background: SK.gold, opacity: pop(lt, ats[i] + 0.2),
            fontFamily: SERIF, fontWeight: 700, fontSize: 34, color: SK.ink, textAlign: "center", lineHeight: "54px" }}>{i + 1}</div>
          <Chip text={label} x={270 + i * 450} y={612} lt={lt} at={ats[i] + 0.2} tone={i === 2 ? "gold" : "cream"} size={28} />
        </React.Fragment>)}
        {/* nature's gifts */}
        <SVG op={1}>
          <g opacity={pop(lt, cSun)} transform="translate(1030 780)"><circle r={38} fill="#F7C948" />{Array.from({ length: 10 }, (_, i) => { const a = i * Math.PI / 5 + lt * 0.4; return <line key={i} x1={50 * Math.cos(a)} y1={50 * Math.sin(a)} x2={66 * Math.cos(a)} y2={66 * Math.sin(a)} stroke="#F7C948" strokeWidth={6} strokeLinecap="round" />; })}</g>
          <g opacity={pop(lt, cRain)} transform="translate(1170 780)">{[-24, 0, 24].map((dx, i) => <path key={i} d={`M${dx} ${-34 + i * 10} c 12 18, 14 26, 0 32 c -14 -6, -12 -14, 0 -32 Z`} fill="#7FC4EA" />)}</g>
          <g opacity={pop(lt, cSoil)} transform="translate(1310 780)"><path d="M-56 30 Q -40 -10 -10 0 Q 20 -24 56 30 Z" fill="#8A6A48" /><path d="M0 4 L 0 -30 M0 -18 q -18 -14 -26 -2 M0 -26 q 18 -12 24 2" stroke="#6FBF6E" strokeWidth={5} fill="none" strokeLinecap="round" /></g>
        </SVG>
        <Chip text="the sun" x={1030} y={850} lt={lt} at={cSun} size={22} />
        <Chip text="the rain" x={1170} y={850} lt={lt} at={cRain} size={22} />
        <Chip text="the soil" x={1310} y={850} lt={lt} at={cSoil} size={22} />
      </Scene>
    );
  };
}

// ---- The INDIA MAP (central model for scenes 5, 6 and Stop 3). Official outline + islands from
// india-map.js (copied from LP5, window.LP5_MAP), its own projection x = (lon − lon0)·k·cos,
// y = (lat0 − lat)·k, fitted into the stage by FIT. Pins stay once dropped.
const MAP = window.LP5_MAP;
if (!MAP) console.error("india-map.js missing");
const FIT = { x0: 700, y0: 50, s: 0.92 };
const pj = (lon, lat) => [FIT.x0 + FIT.s * (lon - MAP.lon0) * MAP.k * MAP.cos, FIT.y0 + FIT.s * (MAP.lat0 - lat) * MAP.k];
// [id, slot, festival, state, lon, lat, bubble dx, dy, beat, cue word, cue n]
const PINS = [
  ["pongal", "pongal_pot", "Pongal", "Tamil Nadu", 78.6, 11.1, 150, 30, "b5", "pongal"],
  ["sankranti", "sankranti_kites", "Makar Sankranti", "Karnataka", 76.0, 14.5, -150, -10, "b5", "makar"],
  ["lohri", "lohri_bonfire", "Lohri", "Punjab", 75.5, 30.9, -150, -20, "b5", "lohri"],
  ["bihu", "bihu_feast", "Bihu", "Assam", 92.9, 26.2, 50, -120, "b5", "bihu"],
  ["baisakhi", "baisakhi_dance", "Baisakhi", "Punjab", 75.5, 30.9, 130, -40, "b6", "baisakhi"],
  ["onam", "onam_sadhya", "Onam", "Kerala", 76.4, 10.0, -150, 40, "b6", "onam"],
  ["nuakhai", "nuakhai_rice", "Nuakhai", "Odisha", 84.0, 21.4, 150, 20, "b6", "nuakhai"],
];
// pinAt: id → beat-local time of the drop (−Infinity = already on the map from an earlier beat).
function IndiaMap({ lt, at = 0, pinAt, hi = null, op = 1 }) {
  const o = out3(lt, at, 0.8) * op; if (o <= 0) return null;
  return (
    <React.Fragment>
      <SVG op={o}>
        <g transform={`translate(${FIT.x0} ${FIT.y0}) scale(${FIT.s})`}>
          <path d={MAP.outline} fill="#2E7A4F" stroke={SK.cream} strokeWidth={4 / FIT.s} strokeLinejoin="round" />
          {MAP.islands.map((d, i) => <path key={i} d={d} fill="#2E7A4F" stroke={SK.cream} strokeWidth={2.2 / FIT.s} />)}
        </g>
        <T x={pj(79.5, 22.5)[0]} y={pj(79.5, 22.5)[1]} size={34} bold color="rgba(246,241,227,0.55)" serif>INDIA</T>
        {PINS.map((p) => { const t = pinAt[p[0]]; if (t == null) return null;
          const [px, py] = pj(p[4], p[5]), bx = px + p[6], by = py + p[7], k = Easing.easeOutBack(reveal(lt, t, 0.6)), drop = (1 - bounce(reveal(lt, t, 0.7))) * -80;
          if (k <= 0) return null;
          const h = hi === p[0] ? 1 + 0.15 * Math.sin(lt * 6) : 1;
          return <g key={p[0]} opacity={clamp(k, 0, 1)}>
            <line x1={px} y1={py} x2={bx} y2={by} stroke={SK.cream} strokeWidth={3} strokeDasharray="6 6" />
            <g transform={`translate(${px} ${py + drop})`}>
              <circle r={22 * h} fill={SK.gold} opacity={0.3} />
              <path d="M0 0 C -14 -18, -14 -38, 0 -40 C 14 -38, 14 -18, 0 0 Z" fill="#D9442B" stroke={SK.cream} strokeWidth={3} transform="translate(0 0)" />
              <circle cy={-27} r={6} fill={SK.cream} />
            </g>
          </g>; })}
      </SVG>
      {PINS.map((p) => { const t = pinAt[p[0]]; if (t == null) return null;
        const [px, py] = pj(p[4], p[5]), bx = px + p[6], by = py + p[7], o2 = pop(lt, t + 0.2, 0.6) * o; if (o2 <= 0) return null;
        const r = hi === p[0] ? 54 : 46;
        return <div key={p[0]} style={{ position: "absolute", inset: 0, opacity: o2 }}>
          <Pic slot={p[1]} label={p[2]} x={bx - r} y={by - r} w={2 * r} h={2 * r} r={r} lt={lt} at={t === -Infinity ? -10 : t + 0.2} fx="pop" style={{ boxShadow: `0 0 0 4px ${hi === p[0] ? SK.gold : SK.cream}` }} />
          <Chip text={p[2]} x={bx} y={by + r + 6} lt={lt} at={t === -Infinity ? -10 : t + 0.3} size={20} tone={hi === p[0] ? "gold" : "cream"} />
        </div>; })}
    </React.Fragment>
  );
}
// Feature card on the left of the map: big photo of the festival being named + name/state/month.
function Feature({ lt, slot, name, state, when, at, out, extra }) {
  const o = out3(lt, at, 0.5) * (out != null ? 1 - reveal(lt, out, 0.4) : 1); if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <Pic slot={slot} label={name} x={40} y={110} w={600} h={420} lt={lt} at={at} out={out} fx="zoom" kenDur={6} />
      <div style={{ position: "absolute", left: 40, top: 550, width: 600, padding: "18px 26px", boxSizing: "border-box", borderRadius: 18, background: "rgba(5,30,22,0.75)", boxShadow: "0 0 0 2px rgba(226,176,76,0.7)" }}>
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 52, color: SK.gold, lineHeight: 1.05 }}>{name}</div>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30, color: SK.white, marginTop: 8 }}>{state} · {when}</div>
        {extra && <div style={{ fontFamily: SANS, fontSize: 26, color: SK.dim, marginTop: 6 }}>{extra}</div>}
      </div>
    </div>
  );
}
function B5(ctx) {
  return ({ localTime: lt, duration }) => {
    const cTravel = S("b5", 0), cJan = W("b5", "january"), cP = W("b5", "pongal"), cBoil = W("b5", "boil"), cS = W("b5", "makar"), cL = W("b5", "lohri"), cB = W("b5", "bihu");
    const cK = W("b5", "karnataka"), cPun = W("b5", "punjab"), cA = W("b5", "assam");
    const pinAt = { pongal: cP, sankranti: cS, lohri: cL, bihu: cB };
    const hi = lt >= cB ? "bihu" : lt >= cL ? "lohri" : lt >= cS ? "sankranti" : lt >= cP ? "pongal" : null;
    const feats = [["pongal_pot", "Pongal", "Tamil Nadu", "January", cJan, cK, "A pot of new rice BOILS OVER for good luck"],
      ["sankranti_kites", "Makar Sankranti", "Karnataka and many states", "January", cK, cPun - 0.1, "Kites and sesame sweets"],
      ["lohri_bonfire", "Lohri", "Punjab", "January", cPun, cA - 0.1, "Bonfires at night"], ["bihu_feast", "Bihu", "Assam", "January", cA, null, "Magh Bihu – a harvest feast"]];
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[5]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(5, ctx, [L("Mid-January: the winter harvest", cJan, "head"), L("PONGAL – Tamil Nadu", cP), L("MAKAR SANKRANTI – Karnataka and many states", cS),
          L("LOHRI – Punjab", cL), L("BIHU – Assam", cB)])}>
        <IndiaMap lt={lt} at={0.1} pinAt={pinAt} hi={hi} />
        <Big x={60} y={50} w={600} lt={lt} at={cTravel} out={cJan} size={50} color={SK.gold}>Let's travel across India!</Big>
        <Chip text="JANUARY · winter harvest" x={340} y={50} lt={lt} at={cJan} size={28} tone="gold" />
        {feats.map((f) => <Feature key={f[0]} lt={lt} slot={f[0]} name={f[1]} state={f[2]} when={f[3]} at={f[4]} out={f[5]} extra={f[6]} />)}
        <SVG op={windowOp(lt, cBoil, cK, 0.3)}>{[0, 1, 2, 3, 4, 5].map((i) => { const p = ((lt - cBoil) * 0.6 + i / 6) % 1;
          return <circle key={i} cx={340 + 140 * Math.sin(i * 2.1) * 0.8} cy={260 - p * 140} r={14 + 10 * p} fill="#FFFFFF" opacity={0.55 * (1 - p)} />; })}</SVG>
      </Scene>
    );
  };
}
function B6(ctx) {
  return ({ localTime: lt, duration }) => {
    const cBa = W("b6", "baisakhi"), cWheat = W("b6", "wheat"), cOn = W("b6", "onam"), cFlower = W("b6", "flower"), cFeast = W("b6", "giant"), cNu = W("b6", "nuakhai"),
      cNew = W("b6", "new"), cFirst = W("b6", "first");
    const pinAt = { pongal: -Infinity, sankranti: -Infinity, lohri: -Infinity, bihu: -Infinity, baisakhi: cBa, onam: cOn, nuakhai: cNu };
    const st = stopAt("b6", 2), hi = lt >= st ? null : lt >= cNu ? "nuakhai" : lt >= cOn ? "onam" : lt >= cBa ? "baisakhi" : null;
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[6]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(6, ctx, [L("BAISAKHI – Punjab, April, wheat harvest", cBa), L("ONAM – Kerala, August–September, rice harvest", cOn),
          L("NUAKHAI – Odisha", cNu), L("\"nua\" = new · \"khai\" = food", cNew, "sub")])}>
        <IndiaMap lt={lt} at={0} pinAt={pinAt} hi={hi} />
        <Feature lt={lt} slot="baisakhi_dance" name="Baisakhi" state="Punjab" when="April" at={cBa - 0.3} out={cOn - 0.1} extra="When the wheat is ready" />
        <Feature lt={lt} slot="onam_sadhya" name="Onam" state="Kerala" when="August–September" at={cOn - 0.3} out={cNu - 0.1} extra="Flower carpets and a feast on a banana leaf" />
        <Pic slot="pookalam" label="Flower carpet" x={430} y={330} w={190} h={190} r={95} lt={lt} at={cFlower} out={cNu - 0.1} fx="pop" style={{ boxShadow: "0 0 0 4px " + SK.cream }} />
        <Feature lt={lt} slot="nuakhai_rice" name="Nuakhai" state="western Odisha" when="August–September" at={cNu - 0.3} out={st} extra={"\"nua\" = new · \"khai\" = food"} />
        <Chip text="the first new rice" x={340} y={480} lt={lt} at={cFirst} out={st} tone="gold" size={26} />
        <Chip text="wheat harvest" x={340} y={480} lt={lt} at={cWheat} out={cOn - 0.1} tone="gold" size={26} />
        <Chip text={"7 festivals on the map!"} x={340} y={80} lt={lt} at={st} size={32} tone="gold" />
        <MiniStop lt={lt} b="b6" side />
        <Break lt={lt} at={st + 5.0} dur={2.4} />
      </Scene>
    );
  };
}

// Scene 8 — Did you know? One sun, four festivals → one golden circle.
function B7(ctx) {
  const four = [["pongal_pot", "Pongal"], ["lohri_bonfire", "Lohri"], ["bihu_feast", "Bihu"], ["sankranti_kites", "Kites"]];
  return ({ localTime: lt, duration }) => {
    const cSame = W("b7", "same"), cMany = W("b7", "many"), cNames = S("b7", 2), cMsg = W("b7", "message"), cThank = W("b7", "thank"), cHope = W("b7", "hope");
    const j = drive(lt, cMsg - 0.2, cMsg + 1.2);                // grid → circle
    const cx = 520, cy = 500, R = 290, sunY = lerp(330, 150, out3(lt, cSame, 1.4));
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[7]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(7, ctx, [L("The same harvest season…", cSame), L("…celebrated in MANY ways across India", cMany), L("Different names · foods · dances", cNames, "sub"),
          L("The message is the same:", cMsg, "head"), L("THANK YOU for a good harvest", cThank, "big"), L("HOPE for a good year ahead", cHope, "big")])}>
        <Badge text="DID YOU KNOW?" x={60} y={50} lt={lt} at={0.1} size={34} />
        {/* the winter sun rising over all four scenes */}
        <SVG op={out3(lt, 0.3, 1.0) * (1 - j)}>
          <circle cx={cx} cy={sunY} r={70} fill="#F7C948" opacity={0.95} /><circle cx={cx} cy={sunY} r={110} fill="#F7C948" opacity={0.2} />
        </SVG>
        {four.map(([slot, label], i) => {
          const gx = 60 + (i % 2) * 470, gy = 260 + Math.floor(i / 2) * 330;
          const qx = cx - R + (i % 2) * R, qy = cy - R + Math.floor(i / 2) * R;
          const x = lerp(gx, qx, j), y = lerp(gy, qy, j), w = lerp(450, R, j), h = lerp(310, R, j);
          const rr = (k) => lerp(18, k ? R : 0, j);
          const br = `${rr(i === 0)}px ${rr(i === 1)}px ${rr(i === 3)}px ${rr(i === 2)}px`;
          return <React.Fragment key={slot}>
            <Pic slot={slot} label={label} x={x} y={y} w={w} h={h} lt={lt} at={0.4 + i * 0.25} fx="pop" border={j < 0.5} style={{ borderRadius: br }} />
            <Chip text={label} x={x + w / 2} y={y + h - 50} lt={lt} at={0.6 + i * 0.25} out={cMsg - 0.2} size={24} />
          </React.Fragment>;
        })}
        <SVG op={out3(lt, cMsg + 1.0, 0.6)}>
          <circle cx={cx} cy={cy} r={R + 8} stroke={SK.gold} strokeWidth={14} fill="none" />
          <circle cx={cx} cy={cy} r={R + 30 + 6 * Math.sin(lt * 3)} stroke={SK.gold} strokeWidth={4} fill="none" opacity={0.5} />
        </SVG>
        <Chip text="different names" x={1180} y={300} lt={lt} at={cNames} out={cMsg} size={28} />
        <Chip text="different foods" x={1180} y={370} lt={lt} at={cNames + 0.8} out={cMsg} size={28} />
        <Chip text="different dances" x={1180} y={440} lt={lt} at={cNames + 1.6} out={cMsg} size={28} />
        <Big x={900} y={300} w={480} lt={lt} at={cThank} size={48}>THANK YOU <span style={{ fontSize: 34, fontWeight: 400 }}>for a good harvest</span></Big>
        <Big x={900} y={520} w={480} lt={lt} at={cHope} size={48} color={SK.gold}>HOPE <span style={{ fontSize: 34, fontWeight: 400, color: SK.white }}>for a good year ahead</span></Big>
      </Scene>
    );
  };
}

// Scene 9 — Did you know? A spinning globe, then Japan · Ghana · USA, then food = gift + effort.
function Globe({ cx, cy, r, lt, op = 1 }) {
  if (op <= 0) return null;
  const rot = lt * 0.5;
  const blobs = [[0.2, 0.25, 0.35], [1.4, -0.1, 0.4], [2.6, 0.3, 0.3], [3.6, -0.35, 0.28], [4.8, 0.15, 0.45], [5.6, -0.2, 0.25]];
  return (
    <SVG op={op}>
      <defs><clipPath id="lp8globe"><circle cx={cx} cy={cy} r={r} /></clipPath></defs>
      <circle cx={cx} cy={cy} r={r} fill="#2F7FB4" />
      <g clipPath="url(#lp8globe)">
        {blobs.map(([lon, lat, s], i) => { const a = lon + rot, x = Math.sin(a), vis = Math.cos(a); if (vis < -0.1) return null;
          return <ellipse key={i} cx={cx + x * r * 0.9} cy={cy + lat * r * 1.4} rx={s * r * Math.max(0.1, vis)} ry={s * r * 0.7} fill="#6FBF6E" opacity={0.9} />; })}
        {[0, 1, 2, 3, 4, 5].map((i) => { const a = (i * Math.PI / 6 + rot) % Math.PI; return <ellipse key={i} cx={cx} cy={cy} rx={Math.abs(Math.cos(a)) * r} ry={r} stroke="rgba(255,255,255,0.35)" strokeWidth={2} fill="none" />; })}
        {[-0.5, 0, 0.5].map((k) => <line key={k} x1={cx - r} y1={cy + k * r} x2={cx + r} y2={cy + k * r} stroke="rgba(255,255,255,0.35)" strokeWidth={2} />)}
      </g>
      <circle cx={cx} cy={cy} r={r} stroke={SK.cream} strokeWidth={4} fill="none" />
    </SVG>
  );
}
function B8(ctx) {
  const C3 = [["japan_niiname", "JAPAN", "The Emperor offers new rice to the gods", "japan"], ["ghana_yam", "GHANA", "A colourful Yam Festival hails the first yams", "ghana"],
    ["usa_thanksgiving", "USA", "Thanksgiving brings families together", "usa"]];
  return ({ localTime: lt, duration }) => {
    const cAll = S("b8", 1), ats = C3.map((c) => W("b8", c[3])), cEvery = S("b8", 5), cMore = W("b8", "more"), cGift = W("b8", "gift"), cHuman = W("b8", "human");
    const gO = out3(lt, 0.2, 0.7) * (1 - reveal(lt, cEvery, 0.5));
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[8]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(8, ctx, [L("Harvest festivals are GLOBAL!", cAll, "big"), L("JAPAN – the Emperor offers newly harvested rice to the gods", ats[0]),
          L("GHANA – the colourful Yam Festival welcomes the first yams", ats[1]), L("USA – Thanksgiving brings families together", ats[2]),
          L("FOOD = a gift of nature + human effort", cGift, "big")], { max: 5 })}>
        <Badge text="DID YOU KNOW?" x={60} y={50} lt={lt} at={0.1} size={34} out={cEvery} op={1 - reveal(lt, cEvery, 0.5)} />
        <Globe cx={250} cy={330} r={150} lt={lt} op={gO} />
        <Big x={470} y={190} w={900} lt={lt} at={cAll} out={cEvery} size={60} color={SK.gold}>Harvest festivals happen ALL over the world!</Big>
        {C3.map(([slot, name, line], i) => { const x = 60 + i * 450, y = 520;
          return <React.Fragment key={slot}>
            <Pic slot={slot} label={name} x={x} y={y} w={420} h={300} lt={lt} at={ats[i]} out={cEvery} fx="zoom" />
            <Chip text={name} x={x + 210} y={y - 22} lt={lt} at={ats[i] + 0.1} out={cEvery} tone="gold" size={30} />
            <div style={{ position: "absolute", left: x, top: y + 310, width: 420, textAlign: "center", fontFamily: SANS, fontSize: 24, lineHeight: 1.2, color: SK.white,
              opacity: out3(lt, ats[i] + 0.3, 0.5) * (1 - reveal(lt, cEvery, 0.4)) }}>{line}</div>
          </React.Fragment>; })}
        {/* food = gift of nature + human effort */}
        <Pic slot="grain_hands" label="A farmer's hands holding grain" x={60} y={70} w={760} h={820} lt={lt} at={cEvery} fx="zoom" kenDur={14} />
        <div style={{ position: "absolute", left: 60, top: 70, width: 760, height: 820, borderRadius: 18, pointerEvents: "none", opacity: out3(lt, cGift, 1.0) * (0.6 + 0.4 * Math.sin(lt * 2.5)),
          boxShadow: `0 0 60px 18px rgba(226,176,76,0.55), inset 0 0 80px rgba(247,201,72,0.45)` }} />
        <Big x={860} y={120} w={520} lt={lt} at={cMore} size={44}>Food is more than a crop.</Big>
        <Card x={860} y={330} w={520} h={380} lt={lt} at={cGift} pad={30}>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 70, color: SK.gold }}>FOOD =</div>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 46, color: SK.white, marginTop: 10 }}>a GIFT of nature</div>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 60, color: SK.gold, opacity: out3(lt, cHuman - 0.4, 0.5) }}>+</div>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 46, color: SK.white, opacity: out3(lt, cHuman, 0.5) }}>HUMAN effort</div>
        </Card>
      </Scene>
    );
  };
}

// Scene 10 — three "Remember" cards flip over, each with an icon.
function IconCal() {
  return <svg width="120" height="110" viewBox="0 0 120 110"><rect x="6" y="14" width="108" height="90" rx="10" fill="#fff" stroke={SK.ink} strokeWidth="4" />
    <rect x="6" y="14" width="108" height="24" rx="8" fill="#B3261E" />{[0, 1, 2, 3].map((i) => <rect key={i} x={16 + i * 25} y={48} width={20} height={16} rx={3} fill={KCOL[Math.min(2, i)]} />)}
    {[0, 1, 2, 3].map((i) => <rect key={i} x={16 + i * 25} y={72} width={20} height={16} rx={3} fill={KCOL[(i + 1) % 3]} />)}
    <rect x="30" y="4" width="8" height="20" rx="3" fill={SK.ink} /><rect x="82" y="4" width="8" height="20" rx="3" fill={SK.ink} /></svg>;
}
function IconHands({ lt }) {
  return <svg width="120" height="110" viewBox="-60 -70 120 110"><circle cx={0} cy={-38} r={20} fill="#F7C948" />
    {Array.from({ length: 8 }, (_, i) => { const a = i * Math.PI / 4 + lt * 0.4; return <line key={i} x1={26 * Math.cos(a)} y1={-38 + 26 * Math.sin(a)} x2={34 * Math.cos(a)} y2={-38 + 34 * Math.sin(a)} stroke="#F7C948" strokeWidth={4} strokeLinecap="round" />; })}
    <path d="M-4 36 L -4 -6 C -4 -14, -18 -12, -20 -2 L -26 26 Z" fill="#C98B5E" stroke={SK.ink} strokeWidth={3} strokeLinejoin="round" />
    <path d="M4 36 L 4 -6 C 4 -14, 18 -12, 20 -2 L 26 26 Z" fill="#C98B5E" stroke={SK.ink} strokeWidth={3} strokeLinejoin="round" /></svg>;
}
function B9(ctx) {
  return ({ localTime: lt, duration }) => {
    const cR = [S("b9", 1), S("b9", 2), S("b9", 3)], fest = ["pongal", "lohri", "baisakhi", "onam", "bihu", "nuakhai"].map((w) => W("b9", w));
    const icons = [<IconCal key="c" />, lamp(lt), <IconHands key="h" lt={lt} />];
    const text = ["A crop calendar shows when to SOW, CARE FOR and HARVEST each crop", "Harvest festivals: Pongal, Makar Sankranti, Lohri, Baisakhi, Onam, Bihu, Nuakhai",
      "Festivals THANK nature and celebrate the harvest"];
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[9]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(9, ctx, [L("1 A crop calendar: when to sow, care for and harvest", cR[0]), L("2 Pongal · Makar Sankranti · Lohri · Baisakhi · Onam · Bihu · Nuakhai", cR[1]),
          L("3 Festivals thank nature and celebrate the harvest", cR[2])])}>
        <Badge text="REMEMBER" x={60} y={50} lt={lt} at={S("b9", 0)} size={36} />
        {cR.map((at, i) => <Flip key={i} x={60 + i * 450} y={160} w={420} h={560} lt={lt} at={at} n={i + 1} label="REMEMBER" size={i === 1 ? 32 : 36}
          q={<div><div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>{icons[i]}</div>{text[i]}</div>} />)}
        {fest.map((at, i) => <Chip key={i} text={["Pongal", "Lohri", "Baisakhi", "Onam", "Bihu", "Nuakhai"][i]} x={130 + i * 216} y={760} lt={lt} at={at} size={26} tone="gold" />)}
      </Scene>
    );
  };
}

// Scene 11 — back to the golden field: the answer, the celebration, the quick check (Stop 4).
function B10(ctx) {
  return ({ localTime: lt, duration }) => {
    const cQ = S("b10", 0), cBec = S("b10", 1), cWork = W("b10", "work"), cGift = W("b10", "gift"), cTog = W("b10", "together"), cNext = S("b10", 2), cThank = W("b10", "thank");
    const st = stopAt("b10", 2), hold = 8.0 - 0.2, qo = windowOp(lt, st, st + hold + 0.6, 0.35);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[10]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(10, ctx, [L("Festivals come at harvest time to celebrate:", cBec, "head"), L("hard work", cWork), L("fresh food and nature's gifts", cGift),
          L("coming TOGETHER", cTog), L("Our food, culture and festivals all grow from farming!", cNext, "think")])}>
        <Pic slot="golden_field" label="The golden field" x={40} y={60} w={1360} h={900} lt={lt} at={0} out={cTog - 0.2} fx="zoom" kenDur={14} />
        <Big x={100} y={110} w={1240} lt={lt} at={cQ} out={cBec + 1.5} size={56}>So, why do so many festivals come at harvest time?</Big>
        {[["a reward for HARD WORK", cWork], ["a GIFT from nature", cGift], ["a reason to come TOGETHER", cTog]].map(([t, at], i) =>
          <Chip key={i} text={t} x={720} y={300 + i * 90} lt={lt} at={at} out={cNext} tone={i === 2 ? "gold" : "cream"} size={40} />)}
        <Pic slot="celebrate_field" label="Villagers and farmers celebrate at the edge of the field" x={40} y={60} w={1360} h={900} lt={lt} at={cTog - 0.2} out={cNext} fx="zoom" kenDur={8} />
        <Pic slot="festival_plate" label="A festival plate of food beside a smiling farmer" x={40} y={60} w={860} h={640} lt={lt} at={cNext} fx="zoom" kenDur={10} />
        <Big x={940} y={160} w={440} lt={lt} at={cNext} size={44}>Next time you enjoy festival food…</Big>
        <Big x={940} y={380} w={440} lt={lt} at={cThank} size={58} color={SK.gold}>…thank the farmer!</Big>
        {qo > 0 && <div style={{ position: "absolute", left: 40, top: 60, width: LEFT_W - 80, height: 900, borderRadius: 26, background: "rgba(5,30,22,0.92)", opacity: qo,
          boxShadow: "0 0 0 3px rgba(226,176,76,0.9)", padding: "50px 80px", boxSizing: "border-box" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 32, letterSpacing: "0.08em", color: SK.ink, background: SK.gold, padding: "10px 30px", borderRadius: 14 }}>QUICK CHECK</div>
            <div style={{ fontFamily: SANS, fontSize: 26, color: SK.dim }}>Stop 4 of 4</div>
          </div>
          {QUICK.map((q, i) => <div key={i} style={{ display: "flex", gap: 24, alignItems: "baseline", marginTop: i ? 26 : 50, opacity: out3(lt, st + 0.2 + i * 0.25, 0.5) }}>
            <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 44, color: SK.gold, width: 40 }}>{i + 1}</span>
            <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 44, color: SK.white, lineHeight: 1.2 }}>{q}</span></div>)}
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
const COLLAGE = [{ slot: "golden_field", x: -60, y: -40, w: 760, h: 520, ph: 0 }, { slot: "pookalam", x: 640, y: -80, w: 760, h: 520, ph: 2 },
  { slot: "crop_wheat", x: -80, y: 520, w: 700, h: 560, ph: 4 }, { slot: "crop_rice", x: 560, y: 560, w: 820, h: 560, ph: 1 }];
function CalFestScenes(props = {}) {
  const caps = props.showCaptions === "false" ? false : props.showCaptions !== false;
  const titles = {};
  for (let n = 1; n <= NB; n++) titles[n] = str(props["title" + n + "Text"], TITLES[n]);
  const ctx = { caps, titles, capSize: num(props.captionSize, 34) };
  const B = [B1, B2, B3, B4, B5, B6, B7, B8, B9, B10];
  const beats = B.map((Bn, i) => { const t = BEAT("b" + (i + 1)); return [t.start, t.start + t.dur, Bn]; });
  return (
    <StoryFrame props={props} dur={DUR} persistKey="thinkpro-lp8-crop-calendars-and-harvest-festivals" collage={COLLAGE}>
      {beats.map(([s, e, Bn], i) => (
        <Sprite key={i} start={s} end={e}>{Bn(ctx)}</Sprite>
      ))}
      {STOPS.map(([b, i, hold]) => <StopAt key={b} t={BEAT(b).start + stopAt(b, i)} hold={hold - 0.2} />)}
      <ChimeAt t={BEAT("b6").start + stopAt("b6", 2) + 5.3} />
      {["b7", "b8"].map((b) => <ChimeAt key={b} t={BEAT(b).start + S(b, 0, 0)} />)}
      <AudioSync />
    </StoryFrame>
  );
}
window.CalFestScenes = CalFestScenes;
