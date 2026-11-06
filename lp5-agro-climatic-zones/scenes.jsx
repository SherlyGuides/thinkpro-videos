/* global React, window */
// ThinkPro Academy — "Agro-climate and India's Agro-climatic Zones" (Grade 6 Agriculture, Session 5, V1).
// After AG_G6_S5 Video Script Draft 1 (Subrata, 3 Nov 2026): a train ride and a big question (why tea
// in Assam, bajra in Rajasthan?), agro-climate, three soil questions, soil → crops → food, standing
// water vs percolation, a leaf break + Do-you-know (irrigation), 15 regions → 5 zones, the answer.
// Four presenter stops (TPStory.StopAt: the web player freezes; the export holds the card).
// The drawn INDIA MAP (india-map.js: simplified official outline + 15 regions as clipped cells) is
// the central model; the five zone colours never change. STORY STYLE (engine/story-kit.jsx).
const { Sprite, Easing } = window;
const { reveal, windowOp, fade } = window.TPMotion;
const { num, str } = window.TPStage;
const { SK, SERIF, SANS, LEFT_W, pop, out3, lerp, drive, photoSrc,
  Pic, Chip, Badge, Big, Card, SVG, Arrow, T, ChimeAt, Scene, StoryFrame, StopCard, StopAt, Break, Flip } = window.TPStory;

// ---- Timing: EVERYTHING is keyed to the narration (tools/fit_timing.py → timing.js).
const TM = window.TP_TIMING;
if (!TM) console.error("timing.js missing — run: python3 tools/fit_timing.py videos/lp5-agro-climatic-zones");
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
const NB = 11;
const CAPS = {};
if (TM) for (let n = 1; n <= NB; n++) CAPS[n] = capsFor("b" + n);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// ---- Panel copy. Title defaults mirror the DC data-props (titleNText) — keep in sync. ----
const TITLES = { 1: "LP5 – Agro-climatic Zones", 2: "What is agro-climate?", 3: "Three soil questions", 4: "From soil to plate",
  5: "Standing water and percolation", 6: "Do you know?", 7: "India's agro-climatic regions", 8: "Very wet · River plains",
  9: "Dry · Plateau", 10: "Cool hills", 11: "The answer" };
const KICK = "Grade 6 · Agriculture · Session 5";
const KICKS = { 6: "Do you know?", 8: "Five simple zones", 9: "Five simple zones", 10: "Five simple zones", 11: "Big question – answered" };
const panel = (n, ctx, lines, extra = {}) => ({ kicker: KICKS[n] || KICK, title: ctx.titles[n], lines, ...extra });
const L = (text, at, kind = "item", extra = {}) => ({ text, at, kind, ...extra });

// ---- Presenter stops: [beat, sentence index whose pauseAfter is the hold, hold s]
const STOPS = [["b1", 3, 4.0], ["b3", 4, 4.0], ["b10", 0, 4.0], ["b11", 3, 6.0]];
const stopAt = (b, i) => SE(b, i) + 0.1;                       // beat-local start of the hold
const stopFor = (b) => STOPS.find((s) => s[0] === b);
const stopN = (b) => STOPS.indexOf(stopFor(b)) + 1;

// ---- The India map (india-map.js) --------------------------------------------------
const MAP = window.LP5_MAP;
if (!MAP) console.error("india-map.js missing");
const ZC = { wet: "#2FA057", plains: "#AEDC72", dry: "#EBC867", plateau: "#C8743A", hills: "#E4EFF8" };
const ZN = { wet: "VERY WET", plains: "RIVER PLAINS", dry: "DRY", plateau: "PLATEAU", hills: "COOL HILLS" };
const ZORDER = ["wet", "plains", "dry", "plateau", "hills"];
const ZPLACE = { wet: "north-east · west coast", plains: "Indo-Gangetic plains", dry: "Rajasthan · Gujarat", plateau: "the Deccan", hills: "the Himalayas" };
const BASE = "#2C5E49";
// 15 distinct colours for the Planning Commission regions (before they merge into 5 zones).
const RC = { 1: "#CFE3F3", 2: "#2F9E6A", 3: "#9AD18B", 4: "#C9E07A", 5: "#7CC47F", 6: "#E3E38A", 7: "#C0703A", 8: "#E0974C",
  9: "#D9B26A", 10: "#A85E36", 11: "#6CC3B0", 12: "#4FAE5A", 13: "#F2D884", 14: "#E7C25E", 15: "#58B9C9" };
const proj = (lon, lat) => [(lon - MAP.lon0) * MAP.k * MAP.cos, (MAP.lat0 - lat) * MAP.k];
const at2 = (m, lon, lat) => { const [px, py] = proj(lon, lat); return [m.x + px * m.s, m.y + py * m.s]; };   // stage px
const LABEL = { 1: [77.0, 34.0], 2: [93.0, 26.5], 3: [88.1, 23.6], 11: [80.5, 16.6], 12: [76.3, 10.2], 13: [71.4, 22.6], 15: [93.95, 11.8] };
const ZLABEL = { wet: [93.6, 27.2], plains: [81.5, 26.6], dry: [71.6, 26.2], plateau: [78.3, 20.3], hills: [77.2, 34.0] };
const hex = (h) => h[0] === "#" ? [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)] : h.slice(4, -1).split(",").map(Number);
function mix(a, b, t) { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * clamp(t, 0, 1))).join(",")})`; }
// fill(cell) → colour string (or null = base). Children are drawn in map coordinates.
function IndiaMap({ x, y, s = 1, op = 1, fill, regionEdge = 0, zoneEdge = 0, outline = SK.cream, children }) {
  if (op <= 0 || !MAP) return null;
  return (
    <SVG op={op}>
      <defs><clipPath id="lp5clip"><path d={MAP.outline} />{MAP.islands.map((d, i) => <path key={i} d={d} />)}</clipPath></defs>
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <path d={MAP.outline} fill={BASE} />
        {MAP.islands.map((d, i) => <path key={i} d={d} fill={BASE} />)}
        {fill && <g clipPath="url(#lp5clip)">
          {MAP.cells.map((c, i) => { const f = fill(c); return f ? <path key={i} d={c.d} fill={f} stroke={f} strokeWidth={1.4} /> : null; })}
          {regionEdge > 0 && <path d={MAP.regionEdges} stroke="#0A2B20" strokeWidth={1.6} fill="none" opacity={0.6 * regionEdge} />}
          {zoneEdge > 0 && <path d={MAP.zoneEdges} stroke="#0A2B20" strokeWidth={2.6} fill="none" opacity={0.8 * zoneEdge} />}
        </g>}
        <path d={MAP.outline} fill="none" stroke={outline} strokeWidth={3.5 / Math.max(0.5, s)} strokeLinejoin="round" />
        {MAP.islands.map((d, i) => <path key={i} d={d} fill="none" stroke={outline} strokeWidth={2.2 / Math.max(0.5, s)} />)}
        {children}
      </g>
    </SVG>
  );
}
// Map glyphs (map coordinates): rain cloud with falling drops, sun, the Ganga, snowy peaks.
function Cloud({ lon, lat, lt, op = 1, sc = 1 }) {
  if (op <= 0) return null; const [x, y] = proj(lon, lat);
  return (
    <g transform={`translate(${x} ${y}) scale(${sc})`} opacity={op}>
      {[0, 1, 2, 3, 4].map((i) => { const p = ((lt * 0.9 + i * 0.21) % 1); return <line key={i} x1={-26 + i * 13} y1={14 + p * 46} x2={-30 + i * 13} y2={26 + p * 46} stroke="#9FD3F5" strokeWidth={3.5} strokeLinecap="round" opacity={1 - p} />; })}
      <ellipse cx={-14} cy={0} rx={24} ry={17} fill="#C9D6DF" /><ellipse cx={12} cy={-6} rx={26} ry={21} fill="#DDE6EC" /><ellipse cx={30} cy={4} rx={17} ry={13} fill="#C9D6DF" />
      <rect x={-34} y={2} width={78} height={14} rx={7} fill="#C9D6DF" />
    </g>
  );
}
function Sun({ lon, lat, lt, op = 1, sc = 1 }) {
  if (op <= 0) return null; const [x, y] = proj(lon, lat);
  return (
    <g transform={`translate(${x} ${y}) scale(${sc}) rotate(${lt * 12})`} opacity={op}>
      {Array.from({ length: 10 }, (_, i) => <line key={i} x1={0} y1={-30} x2={0} y2={-44} stroke="#FFD25A" strokeWidth={5} strokeLinecap="round" transform={`rotate(${i * 36})`} />)}
      <circle r={22} fill="#FFC83D" stroke="#E39B1B" strokeWidth={3} />
    </g>
  );
}
const GANGA = [[78.2, 29.9], [79.0, 28.6], [80.3, 26.5], [81.9, 25.4], [83.0, 25.3], [84.2, 25.5], [85.1, 25.6], [87.0, 25.25], [87.9, 24.8], [88.3, 23.5], [88.3, 22.6], [88.1, 21.8]];
function Ganga({ op = 1, draw = 1 }) {
  if (op <= 0) return null;
  const pts = GANGA.map(([a, b]) => proj(a, b)), n = Math.max(2, Math.ceil(draw * pts.length));
  return <polyline points={pts.slice(0, n).map((p) => p.join(",")).join(" ")} stroke="#4FB6F0" strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={op} />;
}
function Peaks({ op = 1 }) {
  if (op <= 0) return null;
  return <g opacity={op}>{[[75.3, 34.6], [77.2, 33.2], [78.9, 31.0], [76.6, 35.4]].map(([a, b], i) => { const [x, y] = proj(a, b);
    return <g key={i} transform={`translate(${x} ${y})`}><path d="M-26 14 L0 -22 L26 14 Z" fill="#8FA9BC" /><path d="M-9 -9 L0 -22 L9 -9 L3 -5 L-3 -8 Z" fill="#FFFFFF" /></g>; })}</g>;
}
function Pin({ lon, lat, lt, op = 1, color = SK.gold }) {
  if (op <= 0) return null; const [x, y] = proj(lon, lat), pulse = 1 + 0.25 * Math.sin(lt * 5);
  return <g opacity={op}><circle cx={x} cy={y} r={24 * pulse} fill={color} opacity={0.3} /><circle cx={x} cy={y} r={10} fill={color} stroke={SK.ink} strokeWidth={3} /></g>;
}
function MapLabel({ lon, lat, text, op = 1, size = 22, color = SK.white, bg = "rgba(5,30,22,0.75)" }) {
  if (op <= 0) return null; const [x, y] = proj(lon, lat), w = text.length * size * 0.56 + 20;
  return <g opacity={op}><rect x={x - w / 2} y={y - size * 0.85} width={w} height={size * 1.35} rx={size * 0.6} fill={bg} />
    <text x={x} y={y + size * 0.15} textAnchor="middle" fontFamily={SANS} fontWeight="700" fontSize={size} fill={color}>{text}</text></g>;
}

// ---- Shared pieces ---------------------------------------------------------------
function Lines({ x, y, w, lt, lines, size = 30, color = SK.white, gap = 14 }) {
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w }}>
      {lines.map((l, i) => { const o = out3(lt, l.at, 0.6) * (l.out != null ? 1 - reveal(lt, l.out, 0.4) : 1); if (o <= 0) return null;
        return <div key={i} style={{ opacity: o, transform: `translateY(${(1 - o) * 10}px)`, marginBottom: gap, fontFamily: l.serif ? SERIF : SANS, fontWeight: l.bold ? 700 : 400,
          fontSize: l.size || size, lineHeight: 1.25, color: l.color || color }}>{l.text}</div>; })}
    </div>
  );
}
function Node({ slot, label, x, y, r = 70, lt, at, size = 24, out = null, ring = SK.cream }) {
  const o = pop(lt, at, 0.6) * (out != null ? 1 - reveal(lt, out, 0.4) : 1); if (o <= 0) return null;
  return (
    <React.Fragment>
      <Pic slot={slot} label={label} x={x - r} y={y - r} w={2 * r} h={2 * r} r={r} lt={lt} at={at} out={out} fx="pop" style={{ boxShadow: "0 0 0 4px " + ring }} />
      {label && <Chip text={label} x={x} y={y + r + 12} lt={lt} at={at + 0.15} out={out} size={size} />}
    </React.Fragment>
  );
}
function Arr({ x1, y1, x2, y2, lt, at, color = SK.gold, sw = 6, out = null }) {
  return <Arrow x1={x1} y1={y1} x2={x2} y2={y2} color={color} sw={sw} op={out3(lt, at, 0.5) * (out != null ? 1 - reveal(lt, out, 0.4) : 1)} />;
}
// Zone name pill in the zone's own colour.
function ZoneTag({ z, n, x, y, lt, at, out = null, size = 34 }) {
  const o = pop(lt, at, 0.6) * (out != null ? 1 - reveal(lt, out, 0.4) : 1); if (o <= 0) return null;
  return <div style={{ position: "absolute", left: x, top: y, opacity: o, transform: `scale(${0.85 + 0.15 * o})`, transformOrigin: "left center", display: "flex", alignItems: "center", gap: 14,
    background: ZC[z], color: SK.ink, borderRadius: 16, padding: "8px 24px 8px 10px", boxShadow: "0 6px 18px rgba(0,0,0,0.3)", whiteSpace: "nowrap" }}>
    <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: size, width: size * 1.4, height: size * 1.4, borderRadius: "50%", background: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center" }}>{n}</span>
    <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: size, letterSpacing: "0.04em" }}>{ZN[z]}</span></div>;
}
function Legend({ x, y, lt, at, ats, size = 26, out = null }) {
  const o = out3(lt, at, 0.6) * (out != null ? 1 - reveal(lt, out, 0.4) : 1); if (o <= 0) return null;
  return <div style={{ position: "absolute", left: x, top: y, opacity: o }}>
    {ZORDER.map((z, i) => <div key={z} style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14, opacity: ats ? out3(lt, ats[i], 0.5) : 1 }}>
      <span style={{ width: 46, height: 34, borderRadius: 8, background: ZC[z], boxShadow: "0 0 0 2px rgba(255,255,255,0.5)" }} />
      <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: size, color: SK.white }}>{i + 1} {ZN[z]}</span></div>)}
  </div>;
}

// ============================================================================
// B1 — a train ride across India, then the big question; Stop 1.
function TrainWindow({ lt, op }) {
  if (op <= 0) return null;
  return (
    <SVG op={op}>
      <rect x={70} y={70} width={1300} height={640} rx={44} stroke="#44574E" strokeWidth={34} fill="none" />
      <rect x={70} y={70} width={1300} height={640} rx={44} stroke="#6E8378" strokeWidth={6} fill="none" />
      {[0, 1, 2].map((i) => <line key={i} x1={90} y1={330 + i * 110} x2={1350} y2={330 + i * 110} stroke="rgba(60,75,68,0.75)" strokeWidth={10} />)}
      {[0, 1, 2, 3, 4, 5].map((i) => { const p = ((lt * 1.6 + i * 0.37) % 1); return <line key={"s" + i} x1={1340 - p * 1300} y1={140 + i * 95} x2={1340 - p * 1300 - 140} y2={140 + i * 95} stroke="rgba(255,255,255,0.22)" strokeWidth={3} />; })}
    </SVG>
  );
}
function B1(ctx) {
  return ({ localTime: lt, duration }) => {
    const cRide = W("b1", "train"), cGreen = W("b1", "green"), cDry = W("b1", "dry"), cMisty = W("b1", "misty"), cQ = S("b1", 2), cAssam = W("b1", "assam"),
      cTea = W("b1", "tea"), cRaj = W("b1", "rajasthan"), cBajra = W("b1", "bajra"), st = stopAt("b1", 3);
    const winOp = 1 - reveal(lt, cQ, 0.6);
    const scene = (slot, label, a, b) => <Pic slot={slot} label={label} x={88} y={88} w={1264} h={604} r={34} lt={lt} at={a} out={b} fx="pan" border={false} />;
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[1]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(1, ctx, [L("Agro-climate and India's agro-climatic zones", 0.4, "sub"), L("A train ride across India", cRide), L("Green paddy · sandy desert · misty tea hills", cGreen),
          L("BIG QUESTION", cQ, "head"), L("Why does a farmer in Assam grow TEA, while a farmer in Rajasthan grows BAJRA?", cAssam, "big"), L("Make a guess!", st, "think")])}>
        {winOp > 0 && <React.Fragment>
          {scene("train_paddy", "From the train: green paddy fields", 0, cDry)}
          {scene("train_desert", "From the train: sandy desert with camels", cDry, cMisty)}
          {scene("train_tea", "From the train: misty hills full of tea", cMisty, null)}
        </React.Fragment>}
        <div style={{ position: "absolute", inset: 0, opacity: winOp }}><TrainWindow lt={lt} op={1} /></div>
        <Chip text="Green paddy fields" x={720} y={740} lt={lt} at={cGreen} out={cDry} tone="gold" size={32} />
        <Chip text="Dry sandy desert" x={720} y={740} lt={lt} at={cDry} out={cMisty} tone="gold" size={32} />
        <Chip text="Misty hills full of tea" x={720} y={740} lt={lt} at={cMisty} out={cQ} tone="gold" size={32} />
        <Big x={70} y={70} w={1300} lt={lt} at={cQ} size={46} align="center">Here is our <span style={{ color: SK.gold }}>BIG QUESTION</span></Big>
        <Pic slot="farmer_tea" label="A tea picker in Assam" x={70} y={170} w={630} h={600} lt={lt} at={cAssam} fx="zoom" />
        <Pic slot="farmer_bajra" label="A bajra farmer in Rajasthan" x={740} y={170} w={630} h={600} lt={lt} at={cRaj} fx="zoom" />
        <Chip text="Assam · TEA" x={385} y={790} lt={lt} at={cTea} tone="gold" size={36} />
        <Chip text="Rajasthan · BAJRA" x={1055} y={790} lt={lt} at={cBajra} tone="gold" size={36} />
        <div style={{ position: "absolute", left: 660, top: 400, width: 120, textAlign: "center", opacity: pop(lt, cBajra + 0.4, 0.6), fontFamily: SERIF, fontWeight: 700, fontSize: 150, color: SK.gold, textShadow: "0 4px 24px rgba(0,0,0,0.6)" }}>?</div>
        <StopCard lt={lt} at={st} hold={stopFor("b1")[2] - 0.2} question="Make a guess. What is different about these two places?" n={1} total={STOPS.length} />
      </Scene>
    );
  };
}

// B2 — agro-climate: a pointer moves from state to state, icons change.
function B2(ctx) {
  const m = { x: 70, y: 70, s: 1.0 };
  return ({ localTime: lt, duration }) => {
    const cWeather = W("b2", "weather"), cRain = W("b2", "rain"), cMoist = W("b2", "moisture"), cSoil = W("b2", "soil"), cWater = W("b2", "water"), cChange = W("b2", "change"),
      cAgro = W("b2", "agroclimate"), cMoist2 = W("b2", "moisture", 1);
    const stops = [[cWeather, 72.6, 26.8, "icon_sun", "Weather"], [cRain, 92.9, 26.2, "icon_rain", "Rain"], [cMoist, 76.4, 10.2, "icon_moisture", "Moisture in the air"],
      [cSoil, 76.2, 19.6, "icon_soil", "Soil"], [cWater, 75.5, 30.8, "icon_canal", "Irrigation"]];
    // pointer glides between the states on the cue words
    let pl = stops[0][1], pa = stops[0][2];
    for (let i = 1; i < stops.length; i++) { const k = drive(lt, stops[i][0] - 0.7, stops[i][0]); if (k > 0) { pl = lerp(stops[i - 1][1], stops[i][1], k); pa = lerp(stops[i - 1][2], stops[i][2], k); } }
    const big = out3(lt, cMoist2, 0.6);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[2]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(2, ctx, [L("Every region has its own weather", S("b2", 0)), L("From state to state these change:", S("b2", 1), "head"), L("rain · moisture in the air", cRain),
          L("soil · how fields are watered (irrigation)", cSoil), L("Together: AGRO-CLIMATE", cAgro, "big"), L("MOISTURE is one of the most important things for farming", cMoist2, "think")], { max: 7 })}>
        <IndiaMap x={m.x} y={m.y} s={m.s} op={out3(lt, 0.1, 0.8)}>
          <Pin lon={pl} lat={pa} lt={lt} op={out3(lt, cWeather - 0.2, 0.4) * (1 - reveal(lt, cAgro, 0.5))} />
        </IndiaMap>
        {stops.map(([at, lon, lat, slot, lab], i) => { const [x, y] = at2(m, lon, lat), nx = i === 1 ? x - 40 : x + 110, ny = y - 40;
          return <Node key={slot} slot={slot} label={lab} x={Math.min(nx, 800)} y={ny} r={52} lt={lt} at={at} size={20} out={cAgro} />; })}
        <Card x={860} y={70} w={540} h={800} lt={lt} at={cAgro - 0.3} pad={30}>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 22, letterSpacing: "0.14em", color: SK.gold }}>TOGETHER WE CALL THIS</div>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 60, color: SK.white, marginTop: 6 }}>AGRO-CLIMATE</div>
          {stops.slice(1).map(([, , , slot, lab], i) => { const o = out3(lt, cAgro + 0.3 + i * 0.25, 0.5), hi = i === 1 ? big : 0;
            return <div key={slot} style={{ display: "flex", alignItems: "center", gap: 22, marginTop: 26, opacity: o, transform: `translateX(${(1 - o) * 20}px) scale(${1 + 0.08 * hi})`, transformOrigin: "left center" }}>
              <div style={{ width: 104, height: 104, borderRadius: "50%", overflow: "hidden", flex: "none", boxShadow: `0 0 0 ${3 + 4 * hi}px ${hi > 0.5 ? SK.gold : SK.cream}`, background: SK.bgDeep }}>
                {photoSrc(slot) ? <img src={photoSrc(slot)} alt={lab} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", border: `3px dashed ${SK.gold}`, borderRadius: "50%", boxSizing: "border-box" }} />}</div>
              <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 32, color: hi > 0.5 ? SK.gold : SK.white }}>{i === 0 ? "Rain (weather)" : lab}</div></div>; })}
        </Card>
        <Chip text="MOISTURE matters most!" x={1130} y={800} lt={lt} at={cMoist2 + 0.3} tone="gold" size={30} />
      </Scene>
    );
  };
}

// B3 — three soil questions (flip cards over photos); Stop 2.
function B3(ctx) {
  return ({ localTime: lt, duration }) => {
    const q = [S("b3", 1), S("b3", 3), S("b3", 4)], cErosion = W("b3", "erosion"), cHumus = W("b3", "humus"), cRotted = W("b3", "rotted"), st = stopAt("b3", 4);
    const cards = [["soil_erosion", "Can it resist EROSION?", "Rain washes soil off a bare slope"], ["soil_water", "Can it hold the right amount of water?", "Soil holding water"],
      ["soil_humus", "Does it have a good texture to build HUMUS?", "Humus: rotted leaves on top of the soil"]];
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[3]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(3, ctx, [L("Farmers ask THREE questions about their soil", S("b3", 0), "head"), L("1 Can it resist erosion? (stay in place in rain and wind)", q[0]),
          L("2 Can it hold the right amount of water?", q[1]), L("3 Does it have a good texture to build HUMUS?", q[2]), L("Humus: the dark, rich layer from rotted leaves and plants", cRotted, "sub")])}>
        <Pic slot="soil_magnify" label="A handful of soil under a magnifying glass" x={70} y={60} w={560} h={290} lt={lt} at={0} fx="zoom" />
        <Big x={670} y={110} w={720} lt={lt} at={S("b3", 0)} size={52}>Three questions about the <span style={{ color: SK.gold }}>soil</span></Big>
        {cards.map(([slot, qq, lab], i) => (
          <React.Fragment key={slot}>
            <Flip x={70 + i * 445} y={380} w={420} h={190} lt={lt} at={q[i]} q={qq} n={i + 1} size={30} />
            <Pic slot={slot} label={lab} x={70 + i * 445} y={590} w={420} h={330} lt={lt} at={q[i] + 0.4} fx="zoom" />
          </React.Fragment>))}
        <Chip text="EROSION = soil washed away" x={280} y={880} lt={lt} at={cErosion} tone="gold" size={24} />
        <Chip text="HUMUS = dark, rich, rotted leaves" x={1170} y={880} lt={lt} at={cHumus + 0.2} tone="gold" size={24} />
        <StopCard lt={lt} at={st} hold={stopFor("b3")[2] - 0.2} question="Have you understood? What are the three questions a farmer asks about the soil?" n={2} total={STOPS.length} />
      </Scene>
    );
  };
}

// B4 — climate + soil → crops on the map → food on plates.
function B4(ctx) {
  const m = { x: 70, y: 90, s: 0.98 };
  const rows = [["crop_rice", "Rice", 87.6, 23.4, "food_east", "East: rice and fish", "rice"], ["crop_wheat", "Wheat", 76.6, 29.8, "food_north", "North: wheat roti", "wheat"],
    ["millet_bajra", "Bajra", 72.4, 26.6, "food_bajra", "Rajasthan: bajra roti", "bajra"]];
  return ({ localTime: lt, duration }) => {
    const cDecide = W("b4", "decide"), cEat = W("b4", "eat"), plates = [W("b4", "rice"), W("b4", "wheat"), W("b4", "bajra")];
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[4]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(4, ctx, [L("Climate + soil → which crops grow", S("b4", 0), "big"), L("…and even what people EAT!", cEat, "big"), L("East: rice → lots of rice (with fish)", plates[0]),
          L("North: wheat → roti", plates[1]), L("Dry Rajasthan: bajra → bajra roti", plates[2])])}>
        <IndiaMap x={m.x} y={m.y} s={m.s} op={out3(lt, 0.1, 0.8)} />
        {rows.map(([slot, lab, lon, lat], i) => { const [x, y] = at2(m, lon, lat); return <Node key={slot} slot={slot} label={lab} x={x} y={y} r={58} lt={lt} at={cDecide + 0.3 + i * 0.35} size={22} ring={SK.gold} />; })}
        <Big x={860} y={70} w={540} lt={lt} at={cEat} size={46}>…and what people <span style={{ color: SK.gold }}>EAT!</span></Big>
        {rows.map(([slot, , lon, lat, food, flab], i) => { const [x, y] = at2(m, lon, lat), py = 250 + i * 245;
          return <React.Fragment key={food}>
            <SVG op={1}><Arr x1={x + 64} y1={y} x2={940} y2={py + 95} lt={lt} at={plates[i] - 0.1} color="rgba(226,176,76,0.85)" sw={5} /></SVG>
            <Pic slot={food} label={flab} x={950} y={py} w={200} h={200} r={100} lt={lt} at={plates[i]} fx="pop" style={{ boxShadow: "0 0 0 5px " + SK.cream }} />
            <div style={{ position: "absolute", left: 1170, top: py + 64, width: 230, opacity: out3(lt, plates[i] + 0.2, 0.5), fontFamily: SERIF, fontWeight: 700, fontSize: 32, lineHeight: 1.15, color: SK.white }}>{flab}</div>
          </React.Fragment>; })}
      </Scene>
    );
  };
}

// B5 — cut-away soils: standing water (clay, paddy) vs percolation (sand, cotton/groundnut);
// then tea and coffee on rainy slopes; the leaf break closes the beat.
function SoilCut({ x, y, w, h, lt, at, sandy }) {
  const o = out3(lt, at, 0.6); if (o <= 0) return null;
  const water = !sandy;
  return (
    <SVG op={o}>
      <g transform={`translate(${x} ${y})`}>
        <rect x={0} y={90} width={w} height={h - 90} rx={14} fill={sandy ? "#D9B77A" : "#7A4A2E"} />
        {sandy && Array.from({ length: 70 }, (_, i) => <circle key={i} cx={(i * 97) % (w - 20) + 10} cy={110 + ((i * 53) % (h - 120))} r={3 + (i % 3)} fill="#B8935A" />)}
        {!sandy && Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${20 + i * (w / 8)} ${140 + (i % 3) * 50} q 30 -8 60 0`} stroke="#5E3720" strokeWidth={4} fill="none" />)}
        {water && <g><rect x={0} y={62} width={w} height={34} rx={8} fill="#5DB3E6" opacity={0.85} />
          {[0, 1, 2, 3].map((i) => <path key={i} d={`M${40 + i * 150 + 20 * Math.sin(lt * 2 + i)} 76 q 20 -6 40 0`} stroke="#E8F6FF" strokeWidth={3} fill="none" />)}</g>}
        {/* plants: paddy tufts (clay) or cotton / groundnut bushes (sand) */}
        {Array.from({ length: 6 }, (_, i) => { const px = 50 + i * ((w - 100) / 5);
          return water
            ? <g key={i} transform={`translate(${px} 70)`}>{[-14, -5, 5, 14].map((d) => <line key={d} x1={0} y1={0} x2={d * 2.2} y2={-80 - Math.abs(d)} stroke="#6FCB6E" strokeWidth={5} strokeLinecap="round" />)}</g>
            : <g key={i} transform={`translate(${px} 90)`}><line x1={0} y1={0} x2={0} y2={-60} stroke="#5E8F3E" strokeWidth={6} /><circle cx={-16} cy={-48} r={16} fill="#6FAE55" /><circle cx={16} cy={-58} r={16} fill="#6FAE55" />
              {i % 2 === 0 ? <circle cx={0} cy={-74} r={11} fill="#FFFFFF" /> : <circle cx={0} cy={-74} r={9} fill="#E6C36A" />}</g>; })}
        {/* water drops sinking through the sandy soil */}
        {sandy && Array.from({ length: 7 }, (_, i) => { const p = ((lt * 0.55 + i * 0.143) % 1); return <ellipse key={"d" + i} cx={60 + i * ((w - 120) / 6)} cy={110 + p * (h - 140)} rx={7} ry={10} fill="#5DB3E6" opacity={0.9 * (1 - p * 0.6)} />; })}
        {sandy && <path d={`M${w - 46} 120 L ${w - 46} ${h - 40}`} stroke="#5DB3E6" strokeWidth={5} strokeDasharray="10 10" />}
        {sandy && <path d={`M${w - 60} ${h - 58} L ${w - 46} ${h - 34} L ${w - 32} ${h - 58}`} stroke="#5DB3E6" strokeWidth={5} fill="none" />}
      </g>
    </SVG>
  );
}
function B5(ctx) {
  return ({ localTime: lt, duration }) => {
    const cStand = W("b5", "standing"), cPaddy = W("b5", "paddy"), cOther = S("b5", 1), cPerc = W("b5", "percolation"), cSell = W("b5", "sell"), cCotton = W("b5", "cotton"),
      cGround = W("b5", "groundnut"), cRain = S("b5", 4), cTea = W("b5", "tea"), cCoffee = W("b5", "coffee"), breakAt = SE("b5", 4) + 0.2;
    const outA = cRain;
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[5]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(5, ctx, [L("STANDING WATER: some soils hold water – good for paddy", cStand), L("PERCOLATION: water sinks quickly through the soil", cPerc),
          L("Good for crops farmers sell: cotton, groundnut", cSell), L("Lots of rain and moisture all year → TEA and COFFEE", cRain, "big")])}>
        <div style={{ position: "absolute", inset: 0, opacity: 1 - reveal(lt, outA, 0.6) }}>
          <Pic slot="paddy_water" label="Standing water in a paddy field" x={70} y={60} w={630} h={250} lt={lt} at={cStand} fx="zoom" />
          <Pic slot="cotton" label="Cotton" x={740} y={60} w={305} h={250} lt={lt} at={cCotton} fx="pop" />
          <Pic slot="groundnut" label="Groundnut" x={1065} y={60} w={305} h={250} lt={lt} at={cGround} fx="pop" />
          <SoilCut x={70} y={330} w={630} h={480} lt={lt} at={cStand} />
          <SoilCut x={740} y={330} w={630} h={480} lt={lt} at={cOther} sandy />
          <Chip text="Clayey river field · STANDING WATER" x={385} y={830} lt={lt} at={cStand + 0.3} tone="gold" size={26} />
          <Chip text="Perfect for paddy" x={385} y={300} lt={lt} at={cPaddy} size={24} />
          <Chip text="Sandy plateau field · PERCOLATION" x={1055} y={830} lt={lt} at={cPerc} tone="gold" size={26} />
          <Chip text="water sinks quickly" x={1055} y={300} lt={lt} at={cOther + 0.6} size={24} />
          <Chip text="crops to sell: cotton · groundnut" x={1055} y={884} lt={lt} at={cSell} size={24} />
        </div>
        <Pic slot="tea_garden" label="Tea gardens on a misty, rainy slope" x={70} y={60} w={800} h={760} lt={lt} at={cRain} fx="zoom" kenDur={10} />
        <Pic slot="coffee_shade" label="Coffee under shade trees" x={900} y={60} w={470} h={760} lt={lt} at={cCoffee - 0.6} fx="zoom" kenDur={10} />
        <SVG op={windowOp(lt, cRain, breakAt, 0.5) * 0.85}>{Array.from({ length: 26 }, (_, i) => { const p = ((lt * 1.2 + i * 0.077) % 1), x = 90 + ((i * 211) % 1260);
          return <line key={i} x1={x} y1={70 + p * 700} x2={x - 8} y2={96 + p * 700} stroke="#CFEAFF" strokeWidth={3} strokeLinecap="round" opacity={0.7} />; })}</SVG>
        <Chip text="TEA" x={470} y={840} lt={lt} at={cTea} tone="gold" size={34} />
        <Chip text="COFFEE" x={1135} y={840} lt={lt} at={cCoffee} tone="gold" size={34} />
        <Break lt={lt} at={breakAt} dur={2.3} />
      </Scene>
    );
  };
}

// B6 — Do you know? India has more irrigated farmland than any other country.
function B6(ctx) {
  return ({ localTime: lt, duration }) => {
    const cCanals = W("b6", "canals"), cWells = W("b6", "wells"), cPipes = W("b6", "pipes"), cAny = W("b6", "any"), cWorld = W("b6", "world"), cHow = S("b6", 2);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[6]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(6, ctx, [L("India has more irrigated farmland than ANY other country in the world!", cAny, "big"), L("Canals · wells and tube wells · pipes and sprinklers", cCanals),
          L("That is how we grow food even where rain is not enough", cHow), L("Source: FAO irrigation data (Knoema, 2021) – India ranks first", cHow + 0.8, "source")])}>
        <Card x={50} y={50} w={1340} h={905} lt={lt} at={0} pad={0} />
        <Badge x={92} y={82} lt={lt} at={S("b6", 0)} />
        <Pic slot="canal_aerial" label="A canal between green fields, from above" x={92} y={172} w={800} h={430} lt={lt} at={S("b6", 0) + 0.4} fx="zoom" kenDur={12} />
        <Chip text="Canals" x={492} y={190} lt={lt} at={cCanals} tone="gold" size={28} />
        {[["water_rope", "Wells", cWells], ["tubewell", "Tube wells", cWells + 0.5], ["water_sprinkler", "Pipes and sprinklers", cPipes]].map(([slot, lab, at], i) => (
          <React.Fragment key={slot}>
            <Pic slot={slot} label={lab} x={92 + i * 275} y={630} w={250} h={190} lt={lt} at={at} fx="pop" />
            <Chip text={lab} x={217 + i * 275} y={792} lt={lt} at={at + 0.15} size={20} />
          </React.Fragment>))}
        <IndiaMap x={960} y={190} s={0.48} op={out3(lt, cAny - 0.4, 0.6)} outline={SK.gold}
          fill={() => mix(BASE, "#E2B04C", 0.35 + 0.25 * Math.sin(lt * 3) * out3(lt, cAny, 0.5))} />
        <div style={{ position: "absolute", left: 1250, top: 190, opacity: pop(lt, cWorld, 0.7), transform: `rotate(-8deg) scale(${0.7 + 0.3 * pop(lt, cWorld, 0.7)})`, width: 120, height: 120, borderRadius: "50%",
          background: SK.gold, boxShadow: "0 0 0 5px " + SK.cream + ", 0 8px 24px rgba(0,0,0,0.4)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: SK.ink }}>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 18, letterSpacing: "0.1em" }}>WORLD</div>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 50, lineHeight: 1 }}>No. 1</div></div>
        <Lines x={940} y={600} w={430} lt={lt} lines={[{ text: "More irrigated farmland than ANY other country!", at: cAny, serif: true, bold: true, size: 34, color: SK.gold },
          { text: "Food grows even where rain is not enough.", at: cHow, size: 28 }]} />
        <div style={{ position: "absolute", left: 92, top: 880, width: 1260, opacity: out3(lt, cHow + 0.8, 0.6), fontFamily: SANS, fontSize: 21, color: SK.dim }}>
          Source: FAO AQUASTAT irrigated-area data (via Knoema, 2021) – India ranks first in the world for irrigated agricultural land</div>
      </Scene>
    );
  };
}

// B7 — 15 agro-climatic regions (Planning Commission, 1988) → 5 simple types.
function B7(ctx) {
  const m = { x: 70, y: 70, s: 1.02 };
  return ({ localTime: lt, duration }) => {
    const cFifteen = W("b7", "fifteen"), cSimple = W("b7", "simple"), cFive = W("b7", "five");
    const ra = (r) => cFifteen - 0.3 + (r - 1) * 0.12, mg = drive(lt, cFive - 0.3, cFive + 1.2);
    const fill = (c) => { const a = reveal(lt, ra(c.r), 0.35); if (a <= 0) return null; return mix(mix(BASE, RC[c.r], a), ZC[c.z], mg); };
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[7]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(7, ctx, [L("15 agro-climatic regions", cFifteen, "big"), L("Planning Commission of India, 1988", cFifteen + 0.6, "sub"), L("To keep it simple…", cSimple),
          L("…5 simple types for us", cFive, "big"), L("very wet · river plains · dry · plateau · cool hills", cFive + 0.8, "sub")])}>
        <IndiaMap x={m.x} y={m.y} s={m.s} op={out3(lt, 0.1, 0.8)} fill={fill} regionEdge={(1 - mg) * out3(lt, cFifteen, 0.6)} zoneEdge={out3(lt, cFifteen, 0.6)}>
          {Object.keys(MAP.labels).map((r) => { const [lx, ly] = LABEL[r] ? proj(...LABEL[r]) : MAP.labels[r], o = pop(lt, ra(+r) + 0.2, 0.4) * (1 - mg); if (o <= 0) return null;
            return <g key={r} opacity={o}><circle cx={lx} cy={ly} r={15} fill="rgba(5,30,22,0.8)" /><text x={lx} y={ly + 7} textAnchor="middle" fontFamily={SANS} fontWeight="700" fontSize="19" fill={SK.white}>{r}</text></g>; })}
          {ZORDER.map((z) => <MapLabel key={z} lon={ZLABEL[z][0]} lat={ZLABEL[z][1]} text={ZN[z]} op={out3(lt, cFive + 0.6, 0.5)} size={20} />)}
        </IndiaMap>
        <Big x={860} y={70} w={540} lt={lt} at={cFifteen} out={cFive} size={60} color={SK.gold}>15 regions</Big>
        <div style={{ position: "absolute", left: 860, top: 160, width: 540, opacity: 1 - reveal(lt, cFive, 0.5) }}>
          {Object.entries(MAP.names).map(([r, nm]) => { const o = out3(lt, ra(+r), 0.4); return <div key={r} style={{ display: "flex", gap: 12, alignItems: "center", opacity: o, marginBottom: 6 }}>
            <span style={{ width: 22, height: 22, borderRadius: 5, background: RC[r], flex: "none" }} /><span style={{ fontFamily: SANS, fontSize: 24, color: SK.white }}>{r} {nm}</span></div>; })}
        </div>
        <Big x={860} y={70} w={540} lt={lt} at={cFive} size={60} color={SK.gold}>5 simple types</Big>
        <Legend x={870} y={190} lt={lt} at={cFive + 0.3} ats={ZORDER.map((_, i) => cFive + 0.4 + i * 0.25)} size={32} />
      </Scene>
    );
  };
}

// B8–B10 — the five zones, one by one, on the same map; zone photo + crop circles on the right.
const ZCROPS = { wet: [["crop_rice", "Rice", "rice"], ["tea_garden", "Tea", "tea"], ["pepper", "Spices", "spices"]],
  plains: [["crop_wheat", "Wheat", "wheat"], ["crop_rice", "Rice", "rice"], ["sugarcane", "Sugarcane", "sugarcane"]],
  dry: [["millet_bajra", "Bajra", "bajra"], ["millet_jowar", "Jowar", "jowar"]],
  plateau: [["cotton", "Cotton", "cotton"], ["crop_millets", "Millets", "millets"], ["groundnut", "Groundnut", "groundnut"]],
  hills: [["apples", "Apples", "apples"], ["tea_garden", "Tea", "tea"], ["potato", "Potatoes", "potatoes"]] };
const ZPHOTO = { wet: ["zone_wet", "Very wet: rain on paddy and tea"], plains: ["zone_plains", "River plains: wheat, rice and sugarcane"], dry: ["zone_dry", "Dry: bajra and jowar in the hot sun"],
  plateau: ["zone_plateau", "Plateau: cotton on the Deccan"], hills: ["zone_hills", "Cool hills: apple orchards"] };
function ZoneMap({ lt, lit, all = 0, glyphs = {} }) {
  // lit: { zone: cue } — a zone takes its colour at its cue; the newest one pulses.
  const newest = Object.entries(lit).filter(([, a]) => lt >= a).sort((p, q) => q[1] - p[1])[0];
  const fill = (c) => { const a = lit[c.z]; if (a == null) return all > 0 ? mix(BASE, ZC[c.z], all) : null; const k = out3(lt, a, 0.6); if (k <= 0) return all > 0 ? mix(BASE, ZC[c.z], all) : null;
    const isNew = newest && newest[0] === c.z, pulse = isNew ? 0.08 * Math.sin(lt * 4) : 0;
    return mix(BASE, ZC[c.z], Math.max(all, k * (isNew ? 0.92 + pulse : 0.6))); };
  return (
    <IndiaMap x={70} y={70} s={1.02} op={1} fill={fill} zoneEdge={0.8}>
      <Cloud lon={93.3} lat={27.9} lt={lt} op={glyphs.wet || 0} /><Cloud lon={73.6} lat={14.6} lt={lt + 0.4} op={glyphs.wet || 0} sc={0.9} />
      <Ganga op={glyphs.plains || 0} draw={glyphs.plains || 0} />
      <Sun lon={73.6} lat={28.4} lt={lt} op={glyphs.dry || 0} />
      <Peaks op={glyphs.hills || 0} />
      {ZORDER.map((z) => { const a = lit[z]; return <MapLabel key={z} lon={ZLABEL[z][0]} lat={ZLABEL[z][1]} text={ZN[z]} op={Math.max(a != null ? out3(lt, a + 0.4, 0.5) : 0, all)} size={20} />; })}
    </IndiaMap>
  );
}
function ZoneSide({ z, n, lt, at, out, crops }) {
  if (lt < at - 0.1 || (out != null && lt > out + 0.6)) return null;
  const [slot, lab] = ZPHOTO[z];
  return (
    <React.Fragment>
      <ZoneTag z={z} n={n} x={860} y={70} lt={lt} at={at} out={out} />
      <div style={{ position: "absolute", left: 870, top: 150, opacity: out3(lt, at + 0.3, 0.5) * (out != null ? 1 - reveal(lt, out, 0.4) : 1), fontFamily: SANS, fontSize: 28, color: SK.dim }}>{ZPLACE[z]}</div>
      <Pic slot={slot} label={lab} x={860} y={200} w={540} h={340} lt={lt} at={at + 0.2} out={out} fx="zoom" />
      {crops.map(([cs, cl, cat], i) => <Node key={cs + i} slot={cs} label={cl} x={crops.length === 2 ? 990 + i * 280 : 950 + i * 180} y={660} r={72} lt={lt} at={cat} out={out} size={24} ring={ZC[z]} />)}
    </React.Fragment>
  );
}
const cropAts = (b, z, n = 0) => ZCROPS[z].map(([, , w]) => W(b, w, w === "rice" ? n : 0));
function B8(ctx) {
  return ({ localTime: lt, duration }) => {
    const cOne = W("b8", "one"), cTwo = W("b8", "two"), cGanga = W("b8", "ganga");
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[8]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(8, ctx, [L("1 VERY WET – north-east and west coast", cOne, "head"), L("rice · tea · spices", W("b8", "rice")), L("2 RIVER PLAINS – Ganga and its rivers", cTwo, "head"),
          L("wheat · rice · sugarcane", W("b8", "wheat"))])}>
        <ZoneMap lt={lt} lit={{ wet: cOne, plains: cTwo }} glyphs={{ wet: windowOp(lt, cOne, cTwo + 0.3, 0.5), plains: drive(lt, cGanga - 0.4, cGanga + 1.4) }} />
        <ZoneSide z="wet" n={1} lt={lt} at={cOne} out={cTwo - 0.3} crops={ZCROPS.wet.map((c, i) => [...c.slice(0, 2), cropAts("b8", "wet")[i]])} />
        <ZoneSide z="plains" n={2} lt={lt} at={cTwo} out={null} crops={ZCROPS.plains.map((c, i) => [...c.slice(0, 2), cropAts("b8", "plains", 1)[i]])} />
      </Scene>
    );
  };
}
const PREV8 = (lt) => ({ wet: -10, plains: -10 });
function B9(ctx) {
  return ({ localTime: lt, duration }) => {
    const cThree = W("b9", "three"), cFour = W("b9", "four");
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[9]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(9, ctx, [L("3 DRY – Rajasthan and Gujarat", cThree, "head"), L("hardy bajra and jowar, with little water", W("b9", "bajra")), L("4 PLATEAU – the Deccan", cFour, "head"),
          L("cotton · millets · groundnut", W("b9", "cotton"))])}>
        <ZoneMap lt={lt} lit={{ ...PREV8(lt), dry: cThree, plateau: cFour }} glyphs={{ dry: windowOp(lt, cThree, cFour + 0.3, 0.5) }} />
        <ZoneSide z="dry" n={3} lt={lt} at={cThree} out={cFour - 0.3} crops={ZCROPS.dry.map((c, i) => [...c.slice(0, 2), cropAts("b9", "dry")[i]])} />
        <ZoneSide z="plateau" n={4} lt={lt} at={cFour} out={null} crops={ZCROPS.plateau.map((c, i) => [...c.slice(0, 2), cropAts("b9", "plateau")[i]])} />
      </Scene>
    );
  };
}
// Stop 3 (match it): the map stays; loose crop cards wait beside it.
function MatchStop({ lt, at, hold }) {
  const o = windowOp(lt, at, at + hold, 0.35); if (o <= 0) return null;
  const cards = [["tea_garden", "tea", -5], ["crop_wheat", "wheat", 4], ["millet_bajra", "bajra", -3], ["cotton", "cotton", 6], ["apples", "apple", -6]];
  return (
    <div style={{ position: "absolute", left: 840, top: 60, width: 560, height: 880, borderRadius: 26, background: "rgba(5,30,22,0.9)", opacity: o, boxShadow: "0 0 0 3px rgba(226,176,76,0.9)", padding: "34px 34px", boxSizing: "border-box" }}>
      <div style={{ display: "inline-block", fontFamily: SERIF, fontWeight: 700, fontSize: 26, letterSpacing: "0.08em", color: SK.ink, background: SK.gold, padding: "8px 24px", borderRadius: 12 }}>PAUSE AND DISCUSS</div>
      <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 58, color: SK.white, marginTop: 22 }}>MATCH IT!</div>
      <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 32, lineHeight: 1.2, color: SK.white, marginTop: 6 }}>Put each crop on its zone.</div>
      {cards.map(([slot, lab, rot], i) => { const cx = i % 2 === 0 ? 40 : 270, cy = 250 + Math.floor(i / 2) * 175 + (i === 4 ? 0 : 0);
        return <div key={slot} style={{ position: "absolute", left: i === 4 ? 155 : cx, top: cy, width: 210, transform: `rotate(${rot}deg)`, background: SK.cream, borderRadius: 14, padding: 8, boxShadow: "0 8px 20px rgba(0,0,0,0.4)" }}>
          <div style={{ height: 110, borderRadius: 10, overflow: "hidden", background: SK.bgDeep }}>{photoSrc(slot) && <img src={photoSrc(slot)} alt={lab} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}</div>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 26, color: SK.ink, textAlign: "center", marginTop: 4 }}>{lab}</div></div>; })}
      <div style={{ position: "absolute", left: 34, bottom: 26, fontFamily: SANS, fontSize: 22, color: SK.dim }}>Stop 3 of {STOPS.length}</div>
    </div>
  );
}
function B10(ctx) {
  return ({ localTime: lt, duration }) => {
    const cFive = W("b10", "five"), cAll = W("b10", "potatoes") + 0.7, st = stopAt("b10", 0);
    const all = out3(lt, cAll, 0.8);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[10]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(10, ctx, [L("5 COOL HILLS – the Himalayas", cFive, "head"), L("apples · tea · potatoes", W("b10", "apples")), L("All five zones together", cAll, "big"),
          L("Match it: tea · wheat · bajra · cotton · apple", st, "think")])}>
        <ZoneMap lt={lt} lit={{ ...PREV8(lt), dry: -10, plateau: -10, hills: cFive }} all={all} glyphs={{ hills: out3(lt, cFive, 0.6) }} />
        <ZoneSide z="hills" n={5} lt={lt} at={cFive} out={cAll} crops={ZCROPS.hills.map((c, i) => [...c.slice(0, 2), cropAts("b10", "hills")[i]])} />
        <Legend x={880} y={200} lt={lt} at={cAll + 0.3} out={st} size={34} />
        <MatchStop lt={lt} at={st} hold={stopFor("b10")[2] - 0.2} />
      </Scene>
    );
  };
}

// B11 — the answer: back to the two farmers; Stop 4 (quick check).
const QUICK = ["What is agro-climate?", "Name the three soil questions.", "Which soil is good for paddy?", "Name the five zones.", "Which zone grows apples?"];
function QuickStop({ lt, at, hold }) {
  const o = windowOp(lt, at, at + hold, 0.35); if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 40, top: 60, width: LEFT_W - 80, height: 900, borderRadius: 26, background: "rgba(5,30,22,0.9)", opacity: o, boxShadow: "0 0 0 3px rgba(226,176,76,0.9)", padding: "52px 80px", boxSizing: "border-box" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 30, letterSpacing: "0.08em", color: SK.ink, background: SK.gold, padding: "10px 30px", borderRadius: 14 }}>PAUSE AND DISCUSS</div>
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 56, color: SK.white }}>Quick check</div>
      </div>
      {QUICK.map((q, i) => <div key={i} style={{ display: "flex", gap: 24, alignItems: "center", marginTop: i === 0 ? 46 : 20, opacity: out3(lt, at + 0.2 + i * 0.25, 0.5) }}>
        <span style={{ flex: "none", fontFamily: SERIF, fontWeight: 700, fontSize: 44, color: SK.gold, width: 50 }}>{i + 1}</span>
        <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 42, color: SK.white, background: "rgba(255,255,255,0.08)", padding: "10px 26px", borderRadius: 18 }}>{q}</span></div>)}
      <div style={{ position: "absolute", left: 80, bottom: 40, fontFamily: SANS, fontSize: 26, color: SK.dim }}>Stop {STOPS.length} of {STOPS.length} · compare with your guesses from the start</div>
    </div>
  );
}
function B11(ctx) {
  return ({ localTime: lt, duration }) => {
    const cAssam = W("b11", "assam"), cTea = W("b11", "tea"), cRaj = W("b11", "rajasthan"), cBajra = W("b11", "bajra"), cClimate = S("b11", 3), st = stopAt("b11", 3);
    const mm = { x: 560, y: 470, s: 0.42 };
    const fill = (c) => c.z === "wet" ? mix(BASE, ZC.wet, out3(lt, cAssam, 0.6)) : c.z === "dry" ? mix(BASE, ZC.dry, out3(lt, cRaj, 0.6)) : null;
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[11]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(11, ctx, [L("Our big question: tea in Assam, bajra in Rajasthan – why?", S("b11", 0), "sub"), L("Assam is VERY WET: lots of rain and moisture → TEA", cAssam),
          L("Rajasthan is DRY → BAJRA (needs little water)", cRaj), L("The CLIMATE and the SOIL decide the crop!", cClimate, "big")])}>
        <Big x={70} y={70} w={1300} lt={lt} at={S("b11", 0)} out={cAssam} size={50} align="center">So, what is the <span style={{ color: SK.gold }}>answer</span>?</Big>
        <Pic slot="assam_rain" label="Assam: rain and mist over tea" x={70} y={60} w={600} h={420} lt={lt} at={cAssam} fx="zoom" style={{ boxShadow: `0 0 0 5px ${ZC.wet}` }} />
        <Pic slot="raj_sun" label="Rajasthan: bajra under the hot sun" x={770} y={60} w={600} h={420} lt={lt} at={cRaj} fx="zoom" style={{ boxShadow: `0 0 0 5px ${ZC.dry}` }} />
        <SVG op={windowOp(lt, cAssam, st + 0.5, 0.5) * 0.85}>{Array.from({ length: 16 }, (_, i) => { const p = ((lt * 1.1 + i * 0.0625) % 1), x = 90 + ((i * 137) % 560);
          return <line key={i} x1={x} y1={80 + p * 380} x2={x - 6} y2={100 + p * 380} stroke="#CFEAFF" strokeWidth={3} strokeLinecap="round" />; })}</SVG>
        <SVG op={out3(lt, cRaj, 0.6)}><g transform="translate(1290 140)"><Sun lon={MAP.lon0} lat={MAP.lat0} lt={lt} sc={1.4} /></g></SVG>
        <Node slot="farmer_tea" label="Assam · VERY WET → TEA" x={250} y={600} r={95} lt={lt} at={cTea} size={26} ring={ZC.wet} />
        <Node slot="farmer_bajra" label="Rajasthan · DRY → BAJRA" x={1190} y={600} r={95} lt={lt} at={cBajra} size={26} ring={ZC.dry} />
        <IndiaMap x={mm.x} y={mm.y} s={mm.s} op={out3(lt, cAssam - 0.2, 0.6)} fill={fill}>
          <Pin lon={92.9} lat={26.2} lt={lt} op={out3(lt, cAssam, 0.5)} color={ZC.wet} /><Pin lon={72.6} lat={26.8} lt={lt} op={out3(lt, cRaj, 0.5)} color={ZC.dry} />
        </IndiaMap>
        <Big x={70} y={850} w={1300} lt={lt} at={cClimate} size={52} align="center">The <span style={{ color: SK.gold }}>CLIMATE</span> and the <span style={{ color: SK.gold }}>SOIL</span> decide the crop!</Big>
        <QuickStop lt={lt} at={st} hold={stopFor("b11")[2] - 0.2} />
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
const COLLAGE = [{ slot: "crop_rice", x: -60, y: -40, w: 760, h: 520, ph: 0 }, { slot: "village_desert", x: 640, y: -80, w: 760, h: 520, ph: 2 },
  { slot: "water_sprinkler", x: -80, y: 520, w: 700, h: 560, ph: 4 }, { slot: "crop_wheat", x: 560, y: 560, w: 820, h: 560, ph: 1 }];
function AgroScenes(props = {}) {
  const caps = props.showCaptions === "false" ? false : props.showCaptions !== false;
  const titles = {};
  for (let n = 1; n <= NB; n++) titles[n] = str(props["title" + n + "Text"], TITLES[n]);
  const ctx = { caps, titles, capSize: num(props.captionSize, 34) };
  const B = [B1, B2, B3, B4, B5, B6, B7, B8, B9, B10, B11];
  const beats = B.map((Bn, i) => { const t = BEAT("b" + (i + 1)); return [t.start, t.start + t.dur, Bn]; });
  return (
    <StoryFrame props={props} dur={DUR} persistKey="thinkpro-lp5-agro-climatic-zones" collage={COLLAGE}>
      {beats.map(([s, e, Bn], i) => (
        <Sprite key={i} start={s} end={e}>{Bn(ctx)}</Sprite>
      ))}
      {STOPS.map(([b, i, hold]) => <StopAt key={b} t={BEAT(b).start + stopAt(b, i)} hold={hold - 0.2} />)}
      <ChimeAt t={BEAT("b6").start + S("b6", 0, 0)} />
      <AudioSync />
    </StoryFrame>
  );
}
window.AgroScenes = AgroScenes;
