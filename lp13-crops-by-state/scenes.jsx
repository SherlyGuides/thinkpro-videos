/* global React, window */
// ThinkPro Academy — "Crops by State" (Grade 6 Agriculture, Session 13, V1).
// After AG_G6_S13 Video Script Draft 1 (Subrata, 4 Nov 2026). The central model is the drawn INDIA MAP
// (india-map.js, copied from LP5) that fills with CROP STICKERS; the map zooms into Karnataka (gold border,
// "Namma Karnataka"), then the seven coffee beans story, then the full map again.
// b1–b6 = scenes 1–6, the leaf break (scene 7) is the tail of b6, b7–b9 = scenes 8–10.
// Four presenter stops (TPStory.StopAt). Not in the engine, so local here: rough state shapes, Sticker,
// Discuss (positioned stop card), the layer stack, the pie and the drawn world map. STORY STYLE.
const { Sprite, Easing } = window;
const { reveal, windowOp, fade } = window.TPMotion;
const { num, str } = window.TPStage;
const { SK, SERIF, SANS, LEFT_W, pop, out3, lerp, drive, photoSrc,
  Pic, Chip, Badge, Big, Card, SVG, Arrow, T, ChimeAt, Scene, StoryFrame, StopAt, Break } = window.TPStory;

// ---- Timing: EVERYTHING is keyed to the narration (tools/fit_timing.py → timing.js).
const TM = window.TP_TIMING;
if (!TM) console.error("timing.js missing — run: python3 tools/fit_timing.py videos/lp13-crops-by-state");
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
const NB = 9;
const CAPS = {};
if (TM) for (let n = 1; n <= NB; n++) CAPS[n] = capsFor("b" + n);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// ---- Panel copy. Title defaults mirror the DC data-props (titleNText) — keep in sync. ----
const TITLES = { 1: "LP13 – Crops by State", 2: "Why so different?", 3: "Famous crop states", 4: "New crops", 5: "Karnataka, our state!",
  6: "Karnataka also grows", 7: "Do you know?", 8: "WOW! Seven coffee beans", 9: "The answer" };
const KICK = "Grade 6 · Agriculture · Session 13";
const KICKS = { 5: "Namma Karnataka", 6: "Namma Karnataka", 7: "Do you know?", 8: "WOW story", 9: "Big question – answered" };
const panel = (n, ctx, lines, extra = {}) => ({ kicker: KICKS[n] || KICK, title: ctx.titles[n], lines, ...extra });
const L = (text, at, kind = "item", extra = {}) => ({ text, at, kind, ...extra });

// ---- Presenter stops: [beat, sentence index whose pauseAfter is the hold, hold s]
const STOPS = [["b1", 3, 5.0], ["b3", 4, 6.0], ["b6", 2, 4.4], ["b9", 2, 8.0]];
const stopAt = (b, i) => SE(b, i) + 0.1;
const stopFor = (b) => STOPS.find((s) => s[0] === b);
function Discuss({ lt, at, hold, n, x = 40, y = 60, w = LEFT_W - 80, h = 400, head = "PAUSE AND DISCUSS", q, q2, items, size = 46, bg = 0.92 }) {
  const o = windowOp(lt, at - 0.1, at + hold + 0.4, 0.35); if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 26, background: `rgba(5,30,22,${bg})`, opacity: o, boxSizing: "border-box",
      boxShadow: "0 0 0 3px rgba(226,176,76,0.9)", padding: "32px 46px", transform: `scale(${0.96 + 0.04 * o})` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <svg width="58" height="58" viewBox="0 0 90 90"><circle cx="45" cy="45" r="43" fill={SK.gold} /><rect x="28" y="24" width="12" height="42" rx="4" fill={SK.ink} /><rect x="50" y="24" width="12" height="42" rx="4" fill={SK.ink} /></svg>
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 28, letterSpacing: "0.08em", color: SK.ink, background: SK.gold, padding: "8px 24px", borderRadius: 14, whiteSpace: "nowrap" }}>{head}</div>
      </div>
      {q && <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: size, lineHeight: 1.2, color: SK.white, marginTop: 26 }}>{q}</div>}
      {q2 && <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: size * 0.8, lineHeight: 1.2, color: SK.gold, marginTop: 20 }}>{q2}</div>}
      {items && items.map((it, i) => <div key={i} style={{ display: "flex", gap: 20, marginTop: i ? 30 : 44, fontFamily: SERIF, fontWeight: 700, fontSize: 46, lineHeight: 1.2, color: SK.white }}>
        <span style={{ color: SK.gold, width: 34, flex: "none" }}>{i + 1}</span><span>{it}</span></div>)}
      <div style={{ position: "absolute", left: 46, bottom: 20, fontFamily: SANS, fontSize: 24, color: SK.dim }}>Stop {n} of 4 · press play to continue</div>
    </div>
  );
}

// ---- The India map ------------------------------------------------------------------
const MAP = window.LP5_MAP;
if (!MAP) console.error("india-map.js missing");
const BASE = "#2C5E49";
const proj = (lon, lat) => [(lon - MAP.lon0) * MAP.k * MAP.cos, (MAP.lat0 - lat) * MAP.k];
const at2 = (m, lon, lat) => { const [px, py] = proj(lon, lat); return [m.x + px * m.s, m.y + py * m.s]; };   // stage px
const hex = (h) => h[0] === "#" ? [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)] : h.slice(4, -1).split(",").map(Number);
function mix(a, b, t) { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * clamp(t, 0, 1))).join(",")})`; }
const poly = (pts) => "M" + pts.map(([a, b]) => proj(a, b).map((v) => v.toFixed(1)).join(" ")).join(" L") + " Z";
// Rough state shapes (lon, lat), simplified by hand for a Grade 6 picture; drawn clipped to the outline.
// Coastal states run out to sea so the map's own coast is their coast.
const SHAPE = {
  punjab: poly([[75.4, 32.5], [76.3, 31.7], [76.9, 31.0], [76.6, 30.5], [76.2, 30.2], [75.6, 29.6], [74.6, 29.6], [73.9, 30.1], [74.0, 30.4], [74.6, 31.6]]),
  haryana: poly([[76.9, 31.0], [76.6, 30.5], [76.2, 30.2], [75.6, 29.6], [74.6, 29.6], [74.6, 29.2], [75.9, 28.3], [76.4, 27.8], [76.9, 27.7], [77.4, 27.9], [77.4, 28.7], [77.2, 29.4], [77.5, 30.3], [77.3, 30.7]]),
  wb: poly([[88.1, 27.2], [88.9, 27.2], [89.8, 26.7], [89.85, 26.0], [88.4, 26.3], [88.1, 25.8], [88.8, 25.2], [88.1, 24.9], [88.7, 24.3], [88.9, 23.0], [89.1, 21.2], [87.5, 21.2], [86.9, 22.2], [86.7, 22.9], [87.3, 23.7], [87.3, 24.6], [87.9, 25.4], [87.8, 26.4]]),
  maha: poly([[72.2, 20.1], [72.7, 20.2], [73.5, 20.6], [74.3, 21.3], [76.0, 21.5], [77.2, 21.7], [78.4, 21.6], [79.3, 21.7], [80.4, 21.4], [80.6, 20.4], [80.4, 19.3], [79.9, 18.9], [79.3, 19.6], [78.3, 19.9], [77.9, 19.4], [77.7, 18.6], [77.4, 18.45], [76.6, 18.0], [76.3, 17.6], [75.7, 17.4], [75.0, 16.9], [74.4, 16.3], [74.1, 15.8], [73.2, 15.8], [72.2, 18.0]]),
  assam: poly([[89.85, 26.0], [90.5, 26.6], [92.0, 26.85], [93.5, 26.9], [95.2, 27.6], [96.0, 27.9], [95.6, 27.2], [95.0, 26.8], [94.2, 26.0], [93.8, 25.7], [93.4, 25.2], [92.7, 24.9], [92.2, 25.9], [90.2, 25.9]]),
  karn: poly([[74.4, 16.3], [75.0, 16.9], [75.7, 17.4], [76.3, 17.6], [76.6, 18.0], [77.4, 18.45], [77.65, 18.3], [77.9, 18.0], [77.6, 17.4], [77.4, 17.0], [77.45, 16.4], [77.5, 16.0], [77.1, 15.5], [77.0, 14.9], [76.85, 14.5], [77.0, 14.2], [77.3, 14.1], [77.5, 13.9], [78.0, 13.8], [78.4, 13.3], [78.55, 12.9], [77.75, 12.75], [77.5, 12.3], [77.4, 12.1], [77.1, 12.0], [76.8, 11.6], [76.4, 11.65], [76.1, 11.95], [75.8, 12.0], [75.4, 12.4], [75.0, 12.6], [73.8, 12.6], [73.4, 14.9], [74.1, 14.9], [74.25, 15.3], [74.1, 15.7], [74.35, 16.0]]),
};
const NAMES = { punjab: "PUNJAB", haryana: "HARYANA", wb: "WEST BENGAL", maha: "MAHARASHTRA", assam: "ASSAM" };
const VIEW = { full: { cx: 367, cy: 411, sx: 720, sy: 486, s: 1 }, karn: { cx: 210, cy: 588, sx: 350, sy: 470, s: 3.3 } };
const K_VIEW = { x: 350 - 210 * 3.3, y: 470 - 588 * 3.3, s: 3.3 };
const viewAt = (k) => {   // k 0 = full India, 1 = Karnataka
  const a = VIEW.full, b = VIEW.karn, s = Math.exp(lerp(Math.log(a.s), Math.log(b.s), k));
  const q = (s - a.s) / (b.s - a.s), cx = lerp(a.cx, b.cx, q), cy = lerp(a.cy, b.cy, q);
  return { x: lerp(a.sx, b.sx, k) - cx * s, y: lerp(a.sy, b.sy, k) - cy * s, s };
};
// The whole map: base land, optional cell fill, state tints, Karnataka's gold border, then children (map coords).
function IndiaMap({ m, op = 1, fill, tint = {}, karn = 0, glow = 0, children }) {
  if (op <= 0 || !MAP) return null;
  const s = m.s;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: LEFT_W, height: 1080, overflow: "hidden", pointerEvents: "none" }}>
      <SVG op={op}>
        <defs>
          <clipPath id="lp13land"><path d={MAP.outline} />{MAP.islands.map((d, i) => <path key={i} d={d} />)}</clipPath>
          <clipPath id="lp13karn"><path d={SHAPE.karn} /></clipPath>
        </defs>
        <g transform={`translate(${m.x} ${m.y}) scale(${s})`}>
          <path d={MAP.outline} fill={BASE} />
          {MAP.islands.map((d, i) => <path key={i} d={d} fill={BASE} />)}
          {fill && <g clipPath="url(#lp13land)">{MAP.cells.map((c, i) => { const f = fill(c); return f ? <path key={i} d={c.d} fill={f} stroke={f} strokeWidth={1.4} /> : null; })}</g>}
          <g clipPath="url(#lp13land)">
            {Object.keys(tint).map((k) => tint[k] > 0 && <path key={k} d={SHAPE[k]} fill="#CFE6A8" fillOpacity={0.5 * tint[k]} stroke={SK.cream} strokeOpacity={0.7 * tint[k]} strokeWidth={1.8 / s} />)}
            {karn > 0 && <path d={SHAPE.karn} fill={SK.gold} fillOpacity={(0.36 + 0.12 * glow) * karn} />}
          </g>
          <path d={MAP.outline} fill="none" stroke={SK.cream} strokeWidth={3.5 / Math.max(0.5, s)} strokeLinejoin="round" />
          {MAP.islands.map((d, i) => <path key={i} d={d} fill="none" stroke={SK.cream} strokeWidth={2.2 / Math.max(0.5, s)} />)}
          {karn > 0 && <g opacity={karn}>
            <g clipPath="url(#lp13land)"><path d={SHAPE.karn} fill="none" stroke={SK.gold} strokeWidth={(4 + 1.5 * glow) * Math.sqrt(s) / s} strokeLinejoin="round" /></g>
            <g clipPath="url(#lp13karn)"><path d={MAP.outline} fill="none" stroke={SK.gold} strokeWidth={(4 + 1.5 * glow) * Math.sqrt(s) / s} strokeLinejoin="round" /></g>
          </g>}
          {children}
        </g>
      </SVG>
    </div>
  );
}
// A round crop sticker (map coordinates; r is in stage px, so it keeps its size when the map zooms).
// `from` [dx,dy] stage px: where it flies in from. `hover`: bobs instead of settling.
function Sticker({ lon, lat, slot, name, lt, at, s = 1, r = 34, from = [0, -110], out = null, hover = false, ph = 0 }) {
  const a = reveal(lt, at, 0.6); if (a <= 0) return null;
  const o = clamp(a * 2.5, 0, 1) * (out != null ? 1 - reveal(lt, out, 0.4) : 1); if (o <= 0) return null;
  const k = pop(lt, at, 0.6), e = Easing.easeOutCubic(a), [x0, y0] = proj(lon, lat), rr = r / s, img = photoSrc(slot);
  const x = x0 + (1 - e) * from[0] / s, y = y0 + (1 - e) * from[1] / s + (hover ? 5 * Math.sin(lt * 2.2 + ph) / s : 0);
  const id = "stk-" + slot + "-" + Math.round(lon * 10) + "-" + Math.round(lat * 10);
  return (
    <g transform={`translate(${x} ${y}) scale(${Math.max(0.01, k)})`} opacity={o}>
      <defs><clipPath id={id}><circle r={rr} /></clipPath></defs>
      <circle r={rr} cy={3 / s} fill="rgba(0,0,0,0.35)" />
      {img ? <image href={img} x={-rr} y={-rr} width={2 * rr} height={2 * rr} preserveAspectRatio="xMidYMid slice" clipPath={`url(#${id})`} />
        : <g><circle r={rr} fill="#3F7A5B" /><text textAnchor="middle" y={rr * 0.16} fontFamily={SANS} fontWeight="700" fontSize={rr * 0.42} fill={SK.gold}>{name}</text></g>}
      <circle r={rr} fill="none" stroke={SK.cream} strokeWidth={4 / s} />
    </g>
  );
}
function MapLabel({ lon, lat, text, op = 1, size = 24, s = 1, color = SK.white, bg = "rgba(5,30,22,0.82)" }) {
  if (op <= 0) return null; const [x, y] = proj(lon, lat), z = size / s, w = text.length * z * 0.58 + 22 / s;
  return <g opacity={op}><rect x={x - w / 2} y={y - z * 0.9} width={w} height={z * 1.4} rx={z * 0.6} fill={bg} />
    <text x={x} y={y + z * 0.14} textAnchor="middle" fontFamily={SANS} fontWeight="700" fontSize={z} fill={color}>{text}</text></g>;
}
function Sparkle({ lon, lat, lt, at, s = 1 }) {
  const p = clamp((lt - at) / 0.9, 0, 1); if (p <= 0 || p >= 1) return null; const [x, y] = proj(lon, lat);
  return <g transform={`translate(${x} ${y})`} opacity={1 - p}>{Array.from({ length: 10 }, (_, i) => { const a = i * Math.PI / 5, d = (40 + 70 * Easing.easeOutCubic(p)) / s, z = (i % 2 ? 7 : 11) / s;
    return <path key={i} transform={`translate(${Math.cos(a) * d} ${Math.sin(a) * d})`} d={`M0 ${-z} L${z * 0.3} 0 L0 ${z} L${-z * 0.3} 0 Z`} fill="#FFE08A" />; })}</g>;
}
// The six tour stickers (b3, then always back on the map).
const TOUR = [
  { key: "w1", lon: 75.3, lat: 31.1, slot: "crop_wheat", name: "Wheat", r: 29 }, { key: "w2", lon: 76.3, lat: 29.0, slot: "crop_wheat", name: "Wheat", r: 29 },
  { key: "ri", lon: 87.9, lat: 23.3, slot: "paddy_green", name: "Rice" }, { key: "su", lon: 74.7, lat: 19.2, slot: "cane_stalk", name: "Cane" },
  { key: "co", lon: 77.8, lat: 20.3, slot: "cotton_boll", name: "Cotton" }, { key: "te", lon: 92.9, lat: 26.3, slot: "tea_picker", name: "Tea" }];
const KSTICK = { coffee: { lon: 75.65, lat: 12.75, slot: "coffee_shade", name: "Coffee" }, ragi: { lon: 77.0, lat: 13.45, slot: "ragi_field", name: "Ragi" },
  cane: { lon: 75.8, lat: 16.1, slot: "cane_stalk", name: "Cane" }, areca: { lon: 75.1, lat: 14.2, slot: "areca_bunch", name: "Areca" } };

// ---- B1 — a blank map, crops fly in, the big question; Stop 1.
function B1(ctx) {
  return ({ localTime: lt, duration }) => {
    const c = [W("b1", "wheat"), W("b1", "rice"), W("b1", "cotton"), W("b1", "tea"), W("b1", "coffee")], cEach = S("b1", 1), cQ = S("b1", 2), cDiff = W("b1", "different"), st = stopAt("b1", 3);
    const m = { x: lerp(352, 70, drive(lt, cEach + 1.2, cQ + 0.6)), y: 75, s: 1 };
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[1]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(1, ctx, [L("Each state has its own famous crop", cEach), L("BIG QUESTION", cQ, "head"), L("Why is each state of India famous for a different crop?", cDiff, "big")])}>
        <IndiaMap m={m} op={out3(lt, 0.1, 0.8)}>
          <Sticker lon={75.8} lat={30.2} slot="crop_wheat" name="Wheat" lt={lt} at={c[0]} r={42} from={[-420, -160]} hover ph={0} />
          <Sticker lon={87.9} lat={23.3} slot="paddy_green" name="Rice" lt={lt} at={c[1]} r={42} from={[520, -260]} hover ph={1.2} />
          <Sticker lon={76.6} lat={19.9} slot="cotton_boll" name="Cotton" lt={lt} at={c[2]} r={42} from={[-520, 120]} hover ph={2.4} />
          <Sticker lon={92.9} lat={26.3} slot="tea_picker" name="Tea" lt={lt} at={c[3]} r={42} from={[420, -240]} hover ph={3.6} />
          <Sticker lon={75.9} lat={14.3} slot="filter_coffee" name="Coffee" lt={lt} at={c[4]} r={50} from={[-400, 340]} ph={0} />
          <Sparkle lon={75.9} lat={14.3} lt={lt} at={c[4] + 0.5} />
        </IndiaMap>
        <Big x={830} y={200} w={540} lt={lt} at={cQ + 0.2} out={st} size={46}>Here is our <span style={{ color: SK.gold }}>BIG QUESTION</span></Big>
        <Big x={830} y={340} w={540} lt={lt} at={cDiff - 1.2} out={st} size={56}>Why does each state grow something <span style={{ color: SK.gold }}>DIFFERENT?</span></Big>
        <Discuss lt={lt} at={st} hold={stopFor("b1")[2] - 0.2} n={1} x={830} y={150} w={540} h={640} size={52} q="What crop is YOUR district or village famous for?" q2="Why do you think it grows there?" />
      </Scene>
    );
  };
}

// ---- B2 — temperature, soil and rain layers, stacking.
const PAL = {
  heat: { 1: "#CFE3F3", 2: "#9CCBE0", 6: "#F2D884", 5: "#F2C766", 4: "#F2C766", 3: "#EFA94F", 14: "#E2653A", 13: "#E8833F", 9: "#E8833F", 8: "#E8833F", 7: "#EFA94F", 10: "#E2653A", 11: "#D9542F", 12: "#E8833F", 15: "#E8833F" },
  soil: { 1: "#8B8177", 2: "#8B8177", 3: "#D9C28C", 4: "#D9C28C", 5: "#D9C28C", 6: "#D9C28C", 7: "#B84A2E", 8: "#3A3230", 9: "#3A3230", 10: "#B84A2E", 11: "#B84A2E", 12: "#D07A3F", 13: "#3A3230", 14: "#EFD9A0", 15: "#D07A3F" },
  rain: { 1: "#CFE6F2", 2: "#1F6FC0", 3: "#2F88D0", 4: "#6EB3E3", 5: "#A5D2EF", 6: "#CFE6F2", 7: "#6EB3E3", 8: "#A5D2EF", 9: "#CFE6F2", 10: "#A5D2EF", 11: "#6EB3E3", 12: "#1F6FC0", 13: "#E4EFF5", 14: "#F1F1E6", 15: "#2F88D0" } };
const LAYERS = [["heat", "CLIMATE", "hot or cool"], ["soil", "SOIL", "different colours"], ["rain", "RAINFALL", "wet or dry"]];
function Cloud({ lon, lat, lt, op = 1 }) {
  if (op <= 0) return null; const [x, y] = proj(lon, lat);
  return (
    <g transform={`translate(${x} ${y})`} opacity={op}>
      {[0, 1, 2, 3, 4].map((i) => { const p = ((lt * 0.9 + i * 0.21) % 1); return <line key={i} x1={-26 + i * 13} y1={14 + p * 40} x2={-30 + i * 13} y2={26 + p * 40} stroke="#9FD3F5" strokeWidth={3.5} strokeLinecap="round" opacity={1 - p} />; })}
      <ellipse cx={-14} cy={0} rx={24} ry={17} fill="#C9D6DF" /><ellipse cx={12} cy={-6} rx={26} ry={21} fill="#DDE6EC" /><ellipse cx={30} cy={4} rx={17} ry={13} fill="#C9D6DF" />
      <rect x={-34} y={2} width={78} height={14} rx={7} fill="#C9D6DF" />
    </g>
  );
}
function Sun({ lon, lat, lt, op = 1 }) {
  if (op <= 0) return null; const [x, y] = proj(lon, lat);
  return (
    <g transform={`translate(${x} ${y}) rotate(${lt * 12})`} opacity={op}>
      {Array.from({ length: 10 }, (_, i) => <line key={i} x1={0} y1={-30} x2={0} y2={-44} stroke="#FFD25A" strokeWidth={5} strokeLinecap="round" transform={`rotate(${i * 36})`} />)}
      <circle r={22} fill="#FFC83D" stroke="#E39B1B" strokeWidth={3} />
    </g>
  );
}
function LayerSheet({ pal, x, y, op }) {
  if (op <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) matrix(0.46,0.16,-0.34,0.30,0,0)`} opacity={op}>
      <g clipPath="url(#lp13land2)">{MAP.cells.map((c, i) => <path key={i} d={c.d} fill={PAL[pal][c.r]} stroke={PAL[pal][c.r]} strokeWidth={1.4} />)}</g>
      <path d={MAP.outline} fill="none" stroke={SK.cream} strokeWidth={5} strokeLinejoin="round" />
    </g>
  );
}
function B2(ctx) {
  return ({ localTime: lt, duration }) => {
    const c = [W("b2", "climate"), W("b2", "soil"), W("b2", "rainfall")], cBest = S("b2", 2), cB = W("b2", "best");
    const p = c.map((a) => reveal(lt, a, 0.9));
    const fill = (cell) => { let f = BASE; LAYERS.forEach(([k], i) => { if (p[i] > 0) f = mix(f, PAL[k][cell.r], p[i]); }); return f; };
    const m = { x: 70, y: 75, s: 1 }, ys = [340, 225, 110];
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[2]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(2, ctx, [L("Each state has a different:", S("b2", 1), "head"), L("CLIMATE", c[0]), L("SOIL", c[1]), L("RAINFALL", c[2]), L("So each state grows the crops that suit it BEST", cBest, "think")])}>
        <IndiaMap m={m} op={1} fill={fill}>
          <Sun lon={73.5} lat={27.2} lt={lt} op={out3(lt, c[0], 0.5) * (1 - reveal(lt, c[1], 0.4))} />
          <Cloud lon={91.5} lat={27.5} lt={lt} op={out3(lt, c[2], 0.5)} />
          <Cloud lon={74.2} lat={16.0} lt={lt + 0.3} op={out3(lt, c[2] + 0.2, 0.5)} />
          <Cloud lon={86.5} lat={23.5} lt={lt + 0.6} op={out3(lt, c[2] + 0.4, 0.5)} />
        </IndiaMap>
        <SVG>
          <defs><clipPath id="lp13land2"><path d={MAP.outline} /></clipPath></defs>
          {LAYERS.map(([k], i) => { const e = out3(lt, c[i] + 0.25, 0.8); return <LayerSheet key={k} pal={k} x={1040 + (1 - e) * 240} y={ys[i] + 80 * (1 - e)} op={e} />; })}
        </SVG>
        {LAYERS.map(([k, n, sub], i) => <Chip key={k} text={n} x={880} y={ys[i] + 150} lt={lt} at={c[i] + 0.3} tone="gold" size={28} />)}
        <Chip text="→ the crops that suit it BEST" x={1090} y={780} lt={lt} at={cB - 0.3} tone="cream" size={36} />
      </Scene>
    );
  };
}

// ---- B3 — the tour: stickers land, a quick photo for each; Stop 2 hides the names.
function B3(ctx) {
  return ({ localTime: lt, duration }) => {
    const cTour = S("b3", 0), cP = W("b3", "punjab"), cH = W("b3", "haryana"), cW = W("b3", "wheat"), cB = W("b3", "west"), cR = W("b3", "rice"), cM = W("b3", "maharashtra"), cS = W("b3", "sugarcane"),
      cC = W("b3", "cotton"), cA = W("b3", "assam"), cT = W("b3", "tea"), st = stopAt("b3", 4);
    const m = { x: 70, y: 75, s: 1 }, ats = { w1: cP, w2: cH, ri: cR, su: cS, co: cC, te: cT };
    const lab = (at) => out3(lt, at, 0.4) * (1 - reveal(lt, st, 0.3));
    const tint = { punjab: out3(lt, cP, 0.5), haryana: out3(lt, cH, 0.5), wb: out3(lt, cB, 0.5), maha: out3(lt, cM, 0.5), assam: out3(lt, cA, 0.5) };
    const pics = [["wheat_field", "Golden wheat · Punjab and Haryana", cP, cB], ["paddy_green", "Green paddy · West Bengal", cB, cM], ["cane_field", "Sugarcane · Maharashtra", cM, cC - 0.1], ["cotton_field", "White cotton in black soil", cC - 0.1, cA], ["tea_field", "Tea gardens · Assam", cA, st]];
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[3]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(3, ctx, [L("PUNJAB and HARYANA – wheat", cP, "item", { out: st }), L("WEST BENGAL – rice", cB, "item", { out: st }), L("MAHARASHTRA – sugarcane and cotton", cM, "item", { out: st }),
          L("ASSAM – tea", cA, "item", { out: st }), L("Match it! Which state?", st, "think")])}>
        <IndiaMap m={m} tint={tint}>
          {TOUR.map((t) => <Sticker key={t.key} {...t} lt={lt} at={ats[t.key]} />)}
          <MapLabel lon={84.2} lat={31.9} text="PUNJAB · HARYANA" op={lab(cP)} />
          <MapLabel lon={87.4} lat={20.2} text="WEST BENGAL" op={lab(cB)} />
          <MapLabel lon={76.4} lat={23.1} text="MAHARASHTRA" op={lab(cM)} />
          <MapLabel lon={91.6} lat={29.7} text="ASSAM" op={lab(cA)} />
        </IndiaMap>
        <Chip text="Let's take a tour!" x={1100} y={380} lt={lt} at={cTour} out={cP} tone="gold" size={44} />
        {pics.map(([slot, label, a, b]) => <Pic key={slot} slot={slot} label={label} x={830} y={130} w={540} h={560} lt={lt} at={a} out={b} fx="zoom" />)}
        {pics.map(([slot, label, a, b]) => <Chip key={slot} text={label} x={1100} y={715} lt={lt} at={a + 0.15} out={b} tone="gold" size={28} />)}
        <Discuss lt={lt} at={st} hold={stopFor("b3")[2] - 0.2} n={2} x={830} y={150} w={540} h={640} head="MATCH IT!" size={62} q="Wheat · rice · cotton · tea" q2="Which state?" />
      </Scene>
    );
  };
}

// ---- B4 — new crops: field, market board, seedlings, money jar.
function Jar({ x, y, fill, lt }) {
  const n = Math.round(clamp(fill, 0, 1) * 26), coins = [];
  for (let i = 0; i < n; i++) { const r = Math.floor(i / 6), c = i % 6; coins.push(<ellipse key={i} cx={x - 80 + c * 32 + (r % 2 ? 14 : 0)} cy={y + 150 - r * 24} rx={21} ry={11} fill="#F0C24C" stroke="#A9791A" strokeWidth={2.5} />); }
  return (
    <g>
      <rect x={x - 112} y={y - 92} width={224} height={268} rx={32} fill="rgba(220,240,240,0.14)" stroke={SK.cream} strokeWidth={5} />
      {coins}
      <rect x={x - 76} y={y - 118} width={152} height={30} rx={8} fill="#A9791A" stroke={SK.cream} strokeWidth={3} />
      <T x={x} y={y - 22} size={54} bold serif color={SK.gold}>₹</T>
    </g>
  );
}
function B4(ctx) {
  return ({ localTime: lt, duration }) => {
    const cSame = W("b4", "same"), cState = S("b4", 1), cNew = W("b4", "new"), cEarn = W("b4", "earn"), cMoney = W("b4", "money"), cBuy = W("b4", "buy"), cWant = W("b4", "want");
    const board = out3(lt, cState + 0.3, 0.5), hi = reveal(lt, cWant, 0.5), sprout = clamp((lt - cNew) / 2.2, 0, 1);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[4]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(4, ctx, [L("States encourage farmers to grow NEW crops beyond their traditional ones", cState), L("More income", cEarn, "big"), L("Meet changing market demand", cWant, "big")])}>
        <Pic slot="farmer_old" label="A farmer in a field of the same old crop" x={70} y={60} w={640} h={430} lt={lt} at={0.2} fx="zoom" />
        <Chip text="The same old crop" x={390} y={430} lt={lt} at={cSame} tone="gold" size={30} />
        <Pic slot="market" label="The market" x={740} y={60} w={640} h={430} lt={lt} at={cState} fx="pan" />
        <SVG op={board}>
          <g transform={`translate(800 96)`}>
            <rect width={420} height={230} rx={12} fill="#1E3A30" stroke="#8A6236" strokeWidth={12} />
            <T x={210} y={56} size={30} serif bold color={SK.cream}>TODAY'S MARKET</T>
            <line x1={40} y1={72} x2={380} y2={72} stroke={SK.cream} strokeOpacity={0.5} strokeWidth={2} />
            <T x={210} y={132} size={46} serif bold color={hi > 0.5 ? SK.gold : SK.white}>NEW CROPS</T>
            <T x={210} y={192} size={36} serif bold color={SK.leaf}>WANTED ↑</T>
          </g>
        </SVG>
        <Pic slot="new_seedlings" label="New seedlings beside the old crop" x={70} y={520} w={640} h={420} lt={lt} at={cNew} fx="zoom" />
        <SVG>{Array.from({ length: 9 }, (_, i) => { const g = clamp(sprout * 1.6 - i * 0.07, 0, 1), x = 120 + i * 68, y = 920; if (g <= 0) return null;
          return <g key={i} transform={`translate(${x} ${y}) scale(${g})`}><path d="M0 0 C-2 -28 2 -46 0 -66" stroke="#7BD06A" strokeWidth={6} strokeLinecap="round" /><path d="M0 -60 C-26 -86 -46 -70 -48 -60 C-34 -48 -14 -50 0 -60 Z" fill="#7BD06A" /><path d="M0 -44 C26 -70 46 -54 48 -44 C34 -32 14 -34 0 -44 Z" fill="#9BE27F" /></g>; })}</SVG>
        <Chip text="NEW crops" x={390} y={530} lt={lt} at={cNew + 0.2} tone="gold" size={30} />
        <div style={{ position: "absolute", left: 740, top: 520, width: 640, height: 420, borderRadius: 18, background: SK.card, opacity: out3(lt, cEarn - 0.3, 0.5), boxShadow: "0 0 0 3px rgba(255,255,255,0.4)" }} />
        <SVG op={out3(lt, cEarn - 0.1, 0.5)}><Jar x={1060} y={720} fill={drive(lt, cEarn, cBuy + 0.6)} lt={lt} /></SVG>
        <Chip text="More money!" x={1060} y={530} lt={lt} at={cMoney} tone="gold" size={30} />
      </Scene>
    );
  };
}

// ---- B5 — the map zooms home to Karnataka; coffee hills and cherries.
function B5(ctx) {
  return ({ localTime: lt, duration }) => {
    const cHome = W("b5", "home"), cK = W("b5", "karnataka"), cOur = W("b5", "our"), cC = W("b5", "coffee"), cKo = W("b5", "kodagu"), cCh = W("b5", "chikkamagaluru"), cHa = W("b5", "hassan"), cCan = S("b5", 3), cRed = W("b5", "red"), cSh = W("b5", "shade");
    const k = drive(lt, cHome - 0.1, cOur + 0.5), m = viewAt(k), kr = out3(lt, cK, 0.7), glow = 0.5 + 0.5 * Math.sin(lt * 2.4);
    const tint = { punjab: 1 - k, haryana: 1 - k, wb: 1 - k, maha: (1 - k) * 0.6, assam: 1 - k };
    const pins = [[cKo, 75.75, 12.42, "Kodagu (Coorg)", 0], [cCh, 75.8, 13.42, "Chikkamagaluru", -46], [cHa, 76.15, 13.0, "Hassan", -14]];
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[5]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(5, ctx, [L("Famous for COFFEE", cC, "big"), L("from the hills of", cKo - 0.1, "sub"), L("KODAGU (COORG)", cKo), L("CHIKKAMAGALURU", cCh), L("HASSAN", cHa), L("Red coffee cherries, in the shade", cRed, "think")])}>
        <IndiaMap m={m} op={1 - reveal(lt, cCan + 0.5, 0.3)} tint={tint} karn={kr} glow={glow}>
          {k < 0.6 && TOUR.map((t) => <Sticker key={t.key} {...t} s={m.s} lt={lt} at={-2} />)}
          <Sticker {...KSTICK.coffee} lon={75.0} lat={14.1} s={m.s} r={46} lt={lt} at={cC} />
          {pins.map(([at, lon, lat], i) => { const [x, y] = proj(lon, lat), o = out3(lt, at, 0.4), r = (11 + 4 * Math.sin(lt * 5 + i)) / m.s; return <g key={i} opacity={o}><circle cx={x} cy={y} r={r * 2.2} fill={SK.gold} opacity={0.3} /><circle cx={x} cy={y} r={9 / m.s} fill={SK.white} stroke={SK.ink} strokeWidth={3 / m.s} /></g>; })}
        </IndiaMap>
        <Chip text="Namma Karnataka" x={350} y={78} lt={lt} at={cOur} tone="gold" size={38} />
        {pins.map(([at, lon, lat, name, dy]) => { const [x, y] = at2(K_VIEW, lon, lat); return <Chip key={name} text={name} x={x + 26} y={y + dy} lt={lt} at={at} anchor="left" size={24} />; })}
        <Pic slot="kodagu_hills" label="Misty green hills of Kodagu (Coorg)" x={700} y={110} w={680} h={760} lt={lt} at={cKo - 0.3} out={cCh} fx="zoom" />
        <Pic slot="coffee_plants" label="Coffee under tall shade trees, Chikkamagaluru" x={700} y={110} w={680} h={760} lt={lt} at={cCh - 0.2} out={cHa} fx="zoom" />
        <Pic slot="hassan_hills" label="The hills of Hassan" x={700} y={110} w={680} h={760} lt={lt} at={cHa - 0.2} out={cCan + 0.3} fx="zoom" />
        <Pic slot="coffee_shade" label="Red coffee cherries under tall shade trees" x={70} y={60} w={1310} h={880} lt={lt} at={cCan} fx="zoom" zoom={1.08} pos="left center" />
        <Pic slot="cherry_pick" label="Picking red coffee cherries" x={880} y={420} w={480} h={320} lt={lt} at={cSh - 0.4} fx="pop" />
        <Chip text="Red coffee cherries" x={420} y={860} lt={lt} at={cRed} tone="gold" size={34} />
      </Scene>
    );
  };
}

// ---- B6 — three more stickers on Karnataka; Stop 3 on the ragi mudde; the leaf break.
function B6(ctx) {
  return ({ localTime: lt, duration }) => {
    const cR = W("b6", "ragi"), cHalf = W("b6", "half"), cMil = W("b6", "millets"), cS = W("b6", "sugarcane"), cA = W("b6", "arecanut"), cMost = W("b6", "more", 2), st = stopAt("b6", 2), hold = stopFor("b6")[2], m = K_VIEW;
    const glow = 0.5 + 0.5 * Math.sin(lt * 2.4), brk = st + hold + 0.1, slide = drive(lt, 0.3, 1.5);   // coffee slides down to the hills, making room
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[6]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(6, ctx, [L("RAGI – more than half of India's ragi!", cR), L("Other MILLETS", cMil), L("SUGARCANE", cS), L("ARECANUT – the most in India", cA)])}>
        <IndiaMap m={m} op={1 - reveal(lt, st + 0.3, 0.3)} karn={1} glow={glow}>
          <Sticker {...KSTICK.coffee} lon={lerp(75.0, KSTICK.coffee.lon, slide)} lat={lerp(14.1, KSTICK.coffee.lat, slide)} s={m.s} r={46} lt={lt} at={-2} />
          <Sticker {...KSTICK.ragi} s={m.s} r={46} lt={lt} at={cR} />
          <Sticker {...KSTICK.cane} s={m.s} r={46} lt={lt} at={cS} />
          <Sticker {...KSTICK.areca} s={m.s} r={46} lt={lt} at={cA} />
        </IndiaMap>
        <Chip text="Namma Karnataka" x={350} y={78} lt={lt} at={-1} tone="gold" size={38} />
        <Pic slot="ragi_field" label="Ragi growing in the field" x={700} y={110} w={680} h={380} lt={lt} at={cR - 0.2} out={cS} fx="zoom" />
        <Pic slot="ragi_mudde" label="A plate of ragi mudde" x={700} y={510} w={680} h={380} lt={lt} at={cHalf - 0.6} out={cS} fx="zoom" />
        <Chip text="India's biggest ragi producer" x={1040} y={70} lt={lt} at={cR + 0.1} out={cMil} tone="gold" size={28} />
        <Chip text="Other millets too" x={1040} y={70} lt={lt} at={cMil} out={cS} tone="gold" size={28} />
        <Pic slot="cane_field" label="Tall sugarcane" x={700} y={110} w={680} h={760} lt={lt} at={cS - 0.1} out={cA} fx="zoom" />
        <Pic slot="areca_palms" label="Tall areca palms" x={700} y={110} w={680} h={760} lt={lt} at={cA - 0.1} out={st} fx="zoom" />
        <Pic slot="areca_bunch" label="A bunch of arecanut" x={1040} y={500} w={320} h={320} lt={lt} at={cMost} out={st} fx="pop" />
        <Chip text="The most arecanut in India!" x={1040} y={840} lt={lt} at={cMost + 0.2} out={st} tone="gold" size={30} />
        <Pic slot="ragi_mudde" label="A plate of ragi mudde" x={70} y={60} w={1310} h={880} lt={lt} at={st - 0.2} fx="zoom" zoom={1.05} kenDur={8} />
        <Discuss lt={lt} at={st} hold={hold - 0.2} n={3} x={270} y={620} w={910} h={290} size={44} bg={0.9} q="What ragi dishes do you eat at home?" />
        <Break lt={lt} at={brk} dur={2.4} />
      </Scene>
    );
  };
}

// ---- B7 — Do you know: the pie, then coffee on the ship and round the world.
function Pie({ cx, cy, r, frac, lt }) {
  const a = frac * 2 * Math.PI, x = cx + r * Math.sin(a), y = cy - r * Math.cos(a), big = frac > 0.5 ? 1 : 0;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#3F7A5B" stroke={SK.cream} strokeWidth={5} />
      {frac > 0.001 && <path d={`M${cx} ${cy} L${cx} ${cy - r} A${r} ${r} 0 ${big} 1 ${x} ${y} Z`} fill={SK.gold} stroke={SK.cream} strokeWidth={4} />}
    </g>
  );
}
// A drawn, simplified world (lon, lat), Europe to East Asia only: just enough to show where the ships go.
const WORLD = { x0: 70, y0: 350, kx: 10.4, ky: 7.6, lon0: -14, lat0: 72 };
const wp = (lon, lat) => [WORLD.x0 + (lon - WORLD.lon0) * WORLD.kx, WORLD.y0 + (WORLD.lat0 - lat) * WORLD.ky];
const wpoly = (pts) => "M" + pts.map(([a, b]) => wp(a, b).map((v) => v.toFixed(0)).join(" ")).join(" L") + " Z";
const LAND = [
  [[-14, 15], [-14, 22], [-10, 30], [-6, 35.5], [10, 37], [11, 33], [20, 31.5], [25, 31.5], [32, 31], [34, 28], [37, 21], [39, 15], [43, 12], [51, 11.5], [48, 5], [42, -2], [40, -4], [12, -4], [9, 2], [9, 4.5], [-4, 5], [-8, 4.5], [-13, 8.5]],
  [[-9, 37], [-9, 43], [-1.5, 44], [-4.5, 48.5], [2, 51], [8, 54], [9, 57], [11, 54], [20, 55], [23, 59.5], [28, 60], [22, 60.5], [21, 65], [25, 65.5], [20, 63], [17, 60], [16, 56], [12, 56], [11, 59], [5, 59], [5, 62], [14, 68], [25, 71], [40, 67], [45, 68], [70, 71], [110, 71], [110, 21], [107, 17], [109, 12], [105, 9], [103, 2], [100, 13], [98, 16], [94, 17], [92, 21], [89, 22], [80, 15], [78, 8], [73, 18], [72, 21], [67, 25], [61, 25], [57, 26], [54, 26.5], [50, 29.5], [48, 30], [52, 25], [56, 25], [59, 22], [55, 17], [45, 13], [43, 13], [39, 21], [35, 28], [34.5, 31], [36, 36], [30, 36.5], [27, 37], [26, 40], [23, 40], [23, 37], [20, 40], [18, 42], [13, 45.5], [12, 44], [16, 40], [18, 40], [16, 38], [12, 42], [8, 44], [3, 43], [0, 39], [-2, 37], [-6, 36]],
  [[-5, 50], [1, 51], [0, 54], [-3, 58], [-6, 57], [-3, 54]], [[-10, 52], [-6, 52], [-6, 55], [-10, 54]]];
const ROUTES = [["Italy", 12.5, 42.5, 0], ["Germany", 10, 51, 0.55], ["Russia", 37.5, 56, 1.1]];
function WorldMap({ lt, at, cEnd, op }) {
  if (op <= 0) return null;
  const [ix, iy] = wp(74.8, 13), tf = `translate(${wp(MAP.lon0, MAP.lat0).join(" ")}) scale(${WORLD.kx / (MAP.k * MAP.cos)} ${WORLD.ky / MAP.k})`;
  const pts = [[74.8, 13], [62, 13], [50, 12.4], [44, 13.2], [38, 21], [33.5, 28], [32.5, 32], [24, 34.5], [14, 39]].map(([a, b]) => wp(a, b)), p = drive(lt, at, cEnd + 1.0);
  const seg = p * (pts.length - 1), i = Math.min(pts.length - 2, Math.floor(seg)), f = seg - i, sx = lerp(pts[i][0], pts[i + 1][0], f), sy = lerp(pts[i][1], pts[i + 1][1], f);
  return (
    <SVG op={op}>
      <defs><clipPath id="lp13world"><rect x={70} y={350} width={1310} height={590} rx={18} /></clipPath></defs>
      <rect x={70} y={350} width={1310} height={590} rx={18} fill="#1D6A86" stroke="rgba(255,255,255,0.55)" strokeWidth={3} />
      <g clipPath="url(#lp13world)">
        {LAND.map((l, i) => <path key={i} d={wpoly(l)} fill="#5E9A62" stroke="#3E7446" strokeWidth={2} />)}
        <g transform={tf}><path d={MAP.outline} fill={SK.gold} stroke="#3E7446" strokeWidth={2} /></g>
        {ROUTES.map(([n, lon, lat, d]) => { const [x, y] = wp(lon, lat), cx = (ix + x) / 2 + (y < 500 ? 60 : -20), cy = (iy + y) / 2 - 120, g = clamp((lt - at - 0.4 - d) / 1.3, 0, 1); if (g <= 0) return null; const len = Math.hypot(x - ix, y - iy) * 1.25;
          return <g key={n}><path d={`M${ix} ${iy} Q${cx} ${cy} ${x} ${y}`} fill="none" stroke={SK.cream} strokeWidth={5} strokeLinecap="round" strokeDasharray={`${len * g} ${len}`} />{g > 0.9 && <circle cx={x} cy={y} r={11} fill={SK.gold} stroke={SK.ink} strokeWidth={3} />}</g>; })}
        <g transform={`translate(${sx} ${sy})`}><path d="M-34 0 L34 0 L24 18 L-24 18 Z" fill="#E7E2D3" stroke={SK.ink} strokeWidth={3} /><rect x={-20} y={-14} width={18} height={14} fill="#C8743A" /><rect x={1} y={-14} width={18} height={14} fill="#4C8FE0" /></g>
      </g>
    </SVG>
  );
}
function B7(ctx) {
  return ({ localTime: lt, duration }) => {
    const cD = S("b7", 0), cSev = W("b7", "seventy"), cPer = W("b7", "percent"), cLead = S("b7", 2), cShip = S("b7", 3), cTr = W("b7", "travels"), cSh = W("b7", "ship"), cCo = W("b7", "countries"), cEnd = SE("b7", 3);
    const frac = 0.7 * drive(lt, cSev - 0.3, cPer + 0.7), pieOp = out3(lt, cD + 0.5, 0.6) * (1 - reveal(lt, cShip - 0.1, 0.5));
    const worldOp = out3(lt, cTr, 0.5);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[7]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(7, ctx, [L("KARNATAKA grows nearly 70% of INDIA'S COFFEE", cSev, "big"), L("The leading coffee state!", cLead), L("Most Indian coffee is EXPORTED to countries around the world", cTr)])}>
        <Badge x={70} y={56} lt={lt} at={cD} op={1 - reveal(lt, cShip - 0.1, 0.4)} size={40} />
        <SVG op={pieOp}><Pie cx={470} cy={530} r={310} frac={frac} lt={lt} />
          <T x={590} y={590} size={46} serif bold color={SK.ink} op={clamp((frac - 0.3) * 6, 0, 1)}>KARNATAKA</T>
          <T x={330} y={400} size={32} bold color={SK.white} op={clamp((frac - 0.3) * 6, 0, 1)}>Rest of India</T></SVG>
        <div style={{ position: "absolute", left: 840, top: 330, width: 520, opacity: pieOp * out3(lt, cSev, 0.5) }}>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30, letterSpacing: "0.08em", color: SK.dim }}>KARNATAKA GROWS NEARLY</div>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 150, lineHeight: 1.05, color: SK.gold }}>{Math.round(frac * 100)}%</div>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 46, color: SK.white }}>of all India's coffee</div>
        </div>
        <Chip text="India's leading coffee state" x={1100} y={680} lt={lt} at={cLead} out={cShip - 0.1} tone="gold" size={32} />
        <Pic slot="coffee_sacks" label="Sacks of coffee beans" x={70} y={60} w={640} h={270} lt={lt} at={cShip - 0.1} fx="pan" />
        <Pic slot="cargo_ship" label="Coffee leaves by ship" x={740} y={60} w={640} h={270} lt={lt} at={cSh - 0.6} fx="pan" />
        <WorldMap lt={lt} at={cTr} cEnd={cEnd} op={worldOp} />
        {ROUTES.map(([n, lon, lat, d]) => { const [x, y] = wp(lon, lat); return <Chip key={n} text={n} x={x - 12} y={y - 50} lt={lt} at={cTr + d + 1.6} anchor="right" size={24} />; })}
        <Chip text="…and more" x={1180} y={420} lt={lt} at={cCo + 1.0} tone="gold" size={30} />
        <Chip text="INDIA" x={wp(78, 22)[0] + 74} y={wp(78, 22)[1] - 20} lt={lt} at={cTr} size={24} />
      </Scene>
    );
  };
}

// ---- B8 — WOW: the seven beans (old storybook pictures).
function Bean({ x, y, r, s }) {
  return <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}><ellipse rx={24} ry={16} fill="#8FA45F" stroke="#4E5C2C" strokeWidth={3} /><path d="M-20 0 C-8 -7 8 7 20 0" stroke="#4E5C2C" strokeWidth={3} fill="none" /></g>;
}
function Sign({ x, y, lt, at }) {
  const k = pop(lt, at, 0.6); if (k <= 0) return null;
  return <SVG><g transform={`translate(${x} ${y}) scale(${k})`} opacity={clamp(k, 0, 1)}>
    <rect x={-9} y={0} width={18} height={150} fill="#6B4A2B" /><rect x={-210} y={-78} width={420} height={96} rx={10} fill="#E9D8AE" stroke="#6B4A2B" strokeWidth={8} />
    <T x={0} y={-16} size={46} serif bold color={SK.ink}>Baba Budangiri</T></g></SVG>;
}
function B8(ctx) {
  const WOW = "#F0751F";
  return ({ localTime: lt, duration }) => {
    const c0 = S("b8", 0), cAgo = S("b8", 1), cBaba = W("b8", "baba"), cY = W("b8", "yemen"), cSev = W("b8", "seven"), cBeard = W("b8", "beard"), cPl = S("b8", 2), cCh = W("b8", "chikkamagaluru"), cNow = S("b8", 3), cBB = W("b8", "baba", 1), cCof = W("b8", "coffee", 1);
    const wow = pop(lt, c0, 0.6) * (1 - reveal(lt, cAgo + 0.6, 0.4)), wipe = drive(lt, cNow - 0.1, cBB + 0.6);
    const bx = 330;
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[8]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(8, ctx, [L("About 400 years ago", cAgo), L("BABA BUDAN brought SEVEN coffee beans from Yemen", cBaba), L("hidden in his beard", cBeard, "think"), L("Planted in the hills of CHIKKAMAGALURU", cPl), L("The hills are now called BABA BUDANGIRI", cBB, "big")], { max: 7 })}>
        <Pic slot="bb_voyage" label="A traveller sails home from Yemen" x={70} y={60} w={1310} h={880} lt={lt} at={cAgo - 0.5} out={cSev + 0.2} fx="pan" style={{ boxShadow: `0 0 0 6px ${SK.gold}` }} />
        {wow > 0 && <div style={{ position: "absolute", left: 720, top: 400, transform: `translate(-50%,-50%) scale(${wow}) rotate(-3deg)`, opacity: clamp(wow, 0, 1), fontFamily: SERIF, fontWeight: 700, fontSize: 150, color: SK.white, background: WOW, padding: "16px 80px", borderRadius: 26, boxShadow: "0 12px 34px rgba(0,0,0,0.4)" }}>WOW!</div>}
        <Chip text="About 400 years ago" x={420} y={90} lt={lt} at={cAgo} out={cSev} tone="gold" size={32} />
        <Chip text="Baba Budan" x={1050} y={90} lt={lt} at={cBaba} out={cSev} size={32} />
        <Chip text="Yemen, far across the sea" x={1050} y={150} lt={lt} at={cY} out={cSev} size={28} />
        <Pic slot="bb_beard" label="Seven beans hidden in his beard" x={70} y={60} w={760} h={880} lt={lt} at={cSev - 0.2} out={cPl} fx="zoom" style={{ boxShadow: `0 0 0 6px ${SK.gold}` }} />
        <Pic slot="seven_beans" label="Seven coffee beans" x={860} y={60} w={520} h={520} lt={lt} at={cSev} out={cPl} fx="pop" />
        <SVG op={1 - reveal(lt, cPl, 0.4)}>{Array.from({ length: 7 }, (_, i) => { const k = pop(lt, cSev + 0.1 + i * 0.1, 0.4); return k > 0 ? <Bean key={i} x={910 + (i % 4) * 136 + (i > 3 ? 68 : 0)} y={i > 3 ? 760 : 660} r={-20 + i * 13} s={1.6 * k} /> : null; })}</SVG>
        <Chip text="SEVEN coffee beans!" x={1120} y={850} lt={lt} at={cSev + 0.8} out={cPl} tone="gold" size={34} />
        <Pic slot="bb_plant" label="He plants them on a green hill" x={70} y={60} w={1310} h={880} lt={lt} at={cPl - 0.2} out={cNow} fx="zoom" style={{ boxShadow: `0 0 0 6px ${SK.gold}` }} />
        <Chip text="The hills of Chikkamagaluru" x={720} y={90} lt={lt} at={cCh} out={cNow} tone="gold" size={32} />
        <Pic slot="bb_hill_bare" label="The green hill, long ago" x={70} y={60} w={1310} h={880} lt={lt} at={cNow - 0.3} fx="none" style={{ boxShadow: `0 0 0 6px ${SK.gold}` }} />
        <Pic slot="bb_hill_rows" label="The same hill, now rows of coffee" x={70} y={60} w={1310} h={880} lt={lt} at={cNow} fx="none" style={{ clipPath: `inset(${(1 - wipe) * 100}% 0 0 0)` }} />
        <Sign x={720} y={700} lt={lt} at={cBB} />
        <Chip text="Where India's coffee story began" x={720} y={90} lt={lt} at={cCof - 1.2} tone="gold" size={32} />
      </Scene>
    );
  };
}

// ---- B9 — the full map again; the answer; Stop 4.
function B9(ctx) {
  return ({ localTime: lt, duration }) => {
    const cB = S("b9", 1), c = [W("b9", "climate"), W("b9", "soil"), W("b9", "rain")], cK = S("b9", 2), cF = W("b9", "feeds"), st = stopAt("b9", 2), glow = 0.5 + 0.5 * Math.sin(lt * 2.4);
    const m = { x: 70, y: 75, s: 1 }, tint = { punjab: 1, haryana: 1, wb: 1, maha: 1, assam: 1 };
    const rows = [["coffee_shade", "Coffee"], ["ragi_field", "Ragi"], ["cane_stalk", "Sugarcane"], ["areca_bunch", "Arecanut"]];
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[9]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(9, ctx, [L("Each state has its own CLIMATE, SOIL and RAINFALL", c[0]), L("so it grows the crops that suit it best", c[2] + 0.6, "sub"), L("KARNATAKA:", cK, "head"), L("coffee · ragi · millets", cK + 0.3), L("sugarcane · arecanut", cK + 0.6)])}>
        <IndiaMap m={m} tint={tint} karn={out3(lt, 0.1, 0.6)} glow={glow}>
          {TOUR.map((t) => <Sticker key={t.key} {...t} lt={lt} at={-2} />)}
          {Object.keys(KSTICK).map((k) => <Sticker key={k} {...KSTICK[k]} r={23} lt={lt} at={-2} />)}
        </IndiaMap>
        <Big x={830} y={300} w={540} lt={lt} at={0.5} out={cB} size={54}>Why is each state famous for a <span style={{ color: SK.gold }}>different crop?</span></Big>
        <Chip text="Climate" x={950} y={130} lt={lt} at={c[0]} tone="gold" size={36} />
        <Chip text="Soil" x={1120} y={130} lt={lt} at={c[1]} tone="gold" size={36} />
        <Chip text="Rain" x={1270} y={130} lt={lt} at={c[2]} tone="gold" size={36} />
        <Card x={830} y={230} w={550} h={640} lt={lt} at={cK - 0.3} pad={26}>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 44, color: SK.gold, marginBottom: 18 }}>Namma Karnataka</div>
          {rows.map(([slot, n], i) => { const o = out3(lt, cK + 0.3 + i * 0.3, 0.5), src = photoSrc(slot);
            return <div key={slot} style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 20, opacity: o, transform: `translateX(${(1 - o) * 20}px)` }}>
              <div style={{ width: 106, height: 106, borderRadius: "50%", overflow: "hidden", flex: "none", boxShadow: `0 0 0 3px ${SK.cream}`, background: "#3F7A5B" }}>{src && <img src={src} alt={n} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}</div>
              <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 40, color: SK.white }}>{n}</div></div>; })}
        </Card>
        <Discuss lt={lt} at={st} hold={stopFor("b9")[2] - 0.2} n={4} x={40} y={100} w={1360} h={800} head="QUICK CHECK" items={["Which states are famous for wheat?", "Which state is famous for tea?", "Name three coffee districts of Karnataka.", "What share of India's coffee does Karnataka grow?", "Who brought the first coffee beans to Karnataka?"]} bg={0.95} />
      </Scene>
    );
  };
}

// Sound in preview (only once audio exists).
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
const COLLAGE = [{ slot: "wheat_field", x: -60, y: -40, w: 760, h: 520, ph: 0 }, { slot: "tea_field", x: 640, y: -80, w: 760, h: 520, ph: 2 },
  { slot: "cotton_field", x: -80, y: 520, w: 700, h: 560, ph: 4 }, { slot: "cane_field", x: 560, y: 560, w: 820, h: 560, ph: 1 }];
function CropStateScenes(props = {}) {
  const caps = props.showCaptions === "false" ? false : props.showCaptions !== false;
  const titles = {};
  for (let n = 1; n <= NB; n++) titles[n] = str(props["title" + n + "Text"], TITLES[n]);
  const ctx = { caps, titles, capSize: num(props.captionSize, 34) };
  const B = [B1, B2, B3, B4, B5, B6, B7, B8, B9];
  const beats = B.map((Bn, i) => { const t = BEAT("b" + (i + 1)); return [t.start, t.start + t.dur, Bn]; });
  return (
    <StoryFrame props={props} dur={DUR} persistKey="thinkpro-lp13-crops-by-state" collage={COLLAGE}>
      {beats.map(([s, e, Bn], i) => (
        <Sprite key={i} start={s} end={e}>{Bn(ctx)}</Sprite>
      ))}
      {STOPS.map(([b, i, hold]) => <StopAt key={b} t={BEAT(b).start + stopAt(b, i)} hold={hold - 0.2} />)}
      <ChimeAt t={BEAT("b6").start + stopAt("b6", 2) + stopFor("b6")[2] + 1.0} />
      <AudioSync />
    </StoryFrame>
  );
}
window.CropStateScenes = CropStateScenes;
