/* global React, window */
// ThinkPro Academy — "When the Monsoon Is Late" (Grade 6 Agriculture, Session 6, V1).
// After AG_G6_S6 Video Script Draft 1 (Subrata, 3 Nov 2026): the student plays the farmer and
// follows one late monsoon problem by problem. Every (think) is a 2 s silent beat with a ticking
// clock + "Think!" bubble; five presenter stops freeze the web player (TPStory.StopAt; the export
// holds the card). The FARMER'S CHAIN along the foot of the photo area is the central visual model:
// late rain → late sowing → extra water costs → weak plants → smaller harvest → less income.
// STORY STYLE (engine/story-kit.jsx). Pure function of time.
const { Sprite, Easing } = window;
const { reveal, windowOp } = window.TPMotion;
const { num, str } = window.TPStage;
const { SK, SERIF, SANS, LEFT_W, pop, out3, lerp, drive,
  Pic, Chip, Badge, Big, Card, SVG, Arrow, T, ChimeAt, Scene, StoryFrame, StopAt, Break } = window.TPStory;

// ---- Timing: EVERYTHING is keyed to the narration (tools/fit_timing.py → timing.js).
const TM = window.TP_TIMING;
if (!TM) console.error("timing.js missing — run: python3 tools/fit_timing.py videos/lp6-when-the-monsoon-is-late");
const LEAD = TM ? TM.lead : 1.0;
const DUR = TM ? TM.total : 280;
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
const TITLES = { 1: "LP6 – When the Monsoon Is Late", 2: "The monsoon and the farming calendar", 3: "Problem 1: delayed sowing", 4: "Problem 2: higher costs",
  5: "Problem 3: young plants suffer", 6: "The monsoon's journey", 7: "Another choice: switch crops!", 8: "Problem 4: less income",
  9: "WOW! The wettest year", 10: "Timing matters", 11: "A good farmer" };
const KICK = "Grade 6 · Agriculture · Session 6";
const KICKS = { 6: "Do you know?", 9: "WOW fact" };
const panel = (n, ctx, lines, extra = {}) => ({ kicker: KICKS[n] || KICK, title: ctx.titles[n], lines, ...extra });
const L = (text, at, kind = "item", extra = {}) => ({ text, at, kind, ...extra });

// ---- Think beats: [beat, sentence index] — a 2 s silent pauseAfter after the question.
const THINK = [["b1", 5], ["b3", 0], ["b4", 1], ["b4", 4], ["b5", 1], ["b7", 0], ["b8", 1]];
const TH = 2.0;
// ---- Presenter stops: [beat, sentence index, offset after the sentence, hold s, heading, question(s), card box]
const FULL = { x: 40, y: 60, w: LEFT_W - 80, h: 900 };
const STOPS = [
  ["b1", 5, TH + 0.1, 15.0, "Pause and discuss", ["What happens to your farming plans? Share one idea."], { x: 640, y: 60, w: 760, h: 640 }],
  ["b3", 4, 0.1, 15.0, "Have you understood?", ["Why can't a farmer sow seeds in very dry soil?"], { x: 40, y: 40, w: LEFT_W - 80, h: 250 }],
  ["b6", 3, 0.4, 15.0, "Pause and discuss", ["A farmer in Kerala and a farmer in Rajasthan both wait for the monsoon.", "Who waits longer, and why?"], { x: 780, y: 60, w: 620, h: 760 }],
  ["b8", 3, 0.4, 15.0, "Have you understood?", ["Read the chain from late rain to less income.", "Where could the farmer break the chain?"], { x: 40, y: 60, w: LEFT_W - 80, h: 760 }],
  ["b11", 1, 0.4, 15.0, "Quick check", ["Why can't seeds be sown in dry soil?", "Name two ways to get extra water. Are they free?", "What happens to young plants when rain is too little?",
    "Name two crops that need less water.", "Why does the timing of the monsoon matter?"], FULL],
];
const stopFor = (b) => STOPS.find((s) => s[0] === b);
const stopAt = (b) => { const s = stopFor(b); return SE(b, s[1]) + s[2]; };   // beat-local start of the hold

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
// Red pill (the kit's Chip has no red tone).
function Tag({ text, x, y, lt, at, out = null, size = 26, bg = "#B3261E", fg = SK.white }) {
  const o = pop(lt, at) * (out != null ? 1 - reveal(lt, out, 0.4) : 1); if (o <= 0) return null;
  return <div style={{ position: "absolute", left: x, top: y, transform: `translateX(-50%) scale(${0.9 + 0.1 * o})`, transformOrigin: "center top", opacity: o, fontFamily: SANS, fontWeight: 700,
    fontSize: size, color: fg, background: bg, padding: "6px 18px", borderRadius: 999, whiteSpace: "nowrap", boxShadow: "0 2px 10px rgba(0,0,0,0.25)" }}>{text}</div>;
}
// Round photo in a cream ring (thought bubbles, targets).
function Disc({ slot, label, cx, cy, r, lt, at, out = null }) {
  return <Pic slot={slot} label={label} x={cx - r} y={cy - r} w={2 * r} h={2 * r} r={r} lt={lt} at={at} out={out} fx="pop" style={{ boxShadow: "0 0 0 5px " + SK.cream }} />;
}
// Stamped tick / cross.
function Stamp({ cx, cy, lt, at, ok = true, s = 1 }) {
  const o = pop(lt, at, 0.45); if (o <= 0) return null;
  return (
    <SVG op={Math.min(1, o)}>
      <g transform={`translate(${cx} ${cy}) scale(${s * (1.6 - 0.6 * Math.min(1, o))})`}>
        <circle r={40} fill={ok ? "#2E9E4F" : "#B3261E"} stroke={SK.white} strokeWidth={5} />
        {ok ? <path d="M-18 2 L-5 16 L20 -14" stroke={SK.white} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          : <path d="M-15 -15 L15 15 M15 -15 L-15 15" stroke={SK.white} strokeWidth={9} strokeLinecap="round" />}
      </g>
    </SVG>
  );
}

// "Think!" beat: a speech bubble and a ticking clock for the 2 s after a question.
function Think({ lt, at, x = 1150, y = 90, dur = TH }) {
  const o = windowOp(lt, at - 0.1, at + dur + 0.1, 0.25); if (o <= 0) return null;
  const tick = Math.floor(clamp((lt - at) / dur, 0, 0.999) * 8), ang = tick * 45;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 230, height: 230, opacity: o, transform: `scale(${0.85 + 0.15 * o})`, transformOrigin: "center", zIndex: 4 }}>
      <svg width="230" height="230" viewBox="0 0 230 230">
        <path d="M20 20 H210 A14 14 0 0 1 224 34 V112 A14 14 0 0 1 210 126 H90 L60 156 L64 126 H20 A14 14 0 0 1 6 112 V34 A14 14 0 0 1 20 20 Z" fill={SK.gold} stroke={SK.ink} strokeWidth="4" />
        <text x="115" y="92" textAnchor="middle" fontFamily={SERIF} fontWeight="700" fontSize="56" fill={SK.ink}>Think!</text>
        <g transform="translate(165 180)">
          <circle r="42" fill={SK.cream} stroke={SK.ink} strokeWidth="5" />
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <line key={i} x1="0" y1="-33" x2="0" y2="-26" stroke={SK.ink} strokeWidth="4" transform={`rotate(${i * 45})`} />)}
          <line x1="0" y1="0" x2="0" y2="-28" stroke="#B3261E" strokeWidth="5" strokeLinecap="round" transform={`rotate(${ang})`} />
          <circle r="5" fill={SK.ink} />
          <rect x="-9" y="-54" width="18" height="10" rx="3" fill={SK.ink} />
        </g>
      </svg>
    </div>
  );
}
function Thinks({ lt, b, x, y }) {
  return <React.Fragment>{THINK.filter((t) => t[0] === b).map(([, i]) => <Think key={i} lt={lt} at={SE(b, i) + 0.05} x={x} y={y} />)}</React.Fragment>;
}

// Presenter stop card (box = where it sits, so the frozen picture stays visible) + countdown ring.
function StopCard({ lt, b }) {
  const s = stopFor(b); if (!s) return null;
  const [, , , hold, heading, qs, box] = s, at = stopAt(b), n = STOPS.indexOf(s) + 1;
  const o = windowOp(lt, at - 0.05, at + hold + 0.3, 0.35); if (o <= 0) return null;
  const p = clamp((lt - at) / (hold - 0.2), 0, 1), tick = Math.max(1, Math.ceil(5 * (1 - p)));
  const compact = box.h < 400, many = qs.length > 2;
  return (
    <div style={{ position: "absolute", left: box.x, top: box.y, width: box.w, height: box.h, borderRadius: 26, background: "rgba(5,30,22,0.97)", opacity: o, zIndex: 6,
      boxShadow: "0 0 0 3px rgba(226,176,76,0.9)", padding: compact ? "30px 200px 30px 50px" : "50px 60px", boxSizing: "border-box" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <svg width="70" height="70" viewBox="0 0 90 90"><circle cx="45" cy="45" r="43" fill={SK.gold} /><rect x="28" y="24" width="12" height="42" rx="4" fill={SK.ink} /><rect x="50" y="24" width="12" height="42" rx="4" fill={SK.ink} /></svg>
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 28, letterSpacing: "0.08em", color: SK.ink, background: SK.gold, padding: "8px 24px", borderRadius: 14, whiteSpace: "nowrap" }}>{heading.toUpperCase()}</div>
      </div>
      {qs.map((q, i) => <div key={i} style={{ display: "flex", gap: 18, marginTop: compact ? 20 : (i === 0 ? 40 : many ? 18 : 24) }}>
        {many && <span style={{ flex: "none", fontFamily: SERIF, fontWeight: 700, fontSize: 38, color: SK.gold, width: 40 }}>{i + 1}</span>}
        <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: compact ? 46 : many ? 38 : 48, color: SK.white, lineHeight: 1.2 }}>{q}</span></div>)}
      <div style={{ position: "absolute", left: compact ? 50 : 60, bottom: compact ? 16 : 34, fontFamily: SANS, fontSize: 24, color: SK.dim }}>Stop {n} of {STOPS.length}</div>
    </div>
  );
}

// ---- The FARMER'S CHAIN (central model): six linked boxes at the foot of the photo area.
// lit: array of cue times, one per box (null = not yet); dim = fade the whole chain.
const CHAIN = [["Late rain"], ["Late sowing"], ["Extra water", "costs"], ["Weak plants"], ["Smaller", "harvest"], ["Less income"]];
const CH = { x: 42, y: 858, w: 196, h: 92, gap: 36 };
function Chain({ lt, at = 0, lit = [], op = 1, glow = null }) {
  const o = out3(lt, at, 0.6) * op; if (o <= 0) return null;
  const g = glow != null ? out3(lt, glow, 0.6) * (0.5 + 0.5 * Math.sin(lt * 4)) : 0;
  return (
    <SVG op={o}>
      {CHAIN.map((lab, i) => {
        const x = CH.x + i * (CH.w + CH.gap), on = lit[i] != null ? pop(lt, lit[i], 0.6) : 0, onC = Math.min(1, on);
        return <g key={i}>
          {i > 0 && <Arrow x1={x - CH.gap + 4} y1={CH.y + CH.h / 2} x2={x - 4} y2={CH.y + CH.h / 2} color={onC > 0.5 ? SK.gold : "rgba(255,255,255,0.35)"} sw={5} head={14} />}
          <rect x={x} y={CH.y} width={CH.w} height={CH.h} rx={14} fill="rgba(5,30,22,0.75)" stroke="rgba(255,255,255,0.35)" strokeWidth={3} strokeDasharray="10 8" />
          {g > 0 && <rect x={x - 6} y={CH.y - 6} width={CH.w + 12} height={CH.h + 12} rx={18} fill="none" stroke={SK.gold} strokeWidth={4} opacity={g} />}
          <g opacity={onC} transform={`translate(${x + CH.w / 2} ${CH.y + CH.h / 2}) scale(${0.85 + 0.15 * on}) translate(${-(x + CH.w / 2)} ${-(CH.y + CH.h / 2)})`}>
            <rect x={x} y={CH.y} width={CH.w} height={CH.h} rx={14} fill={i === 0 ? SK.cream : SK.gold} stroke={SK.ink} strokeWidth={3} />
            {lab.map((t, k) => <text key={k} x={x + CH.w / 2} y={CH.y + CH.h / 2 + 9 + (k - (lab.length - 1) / 2) * 30} textAnchor="middle" fontFamily={SANS} fontWeight="700" fontSize="25" fill={SK.ink}>{t}</text>)}
          </g>
          {onC < 1 && <text x={x + CH.w / 2} y={CH.y + CH.h / 2 + 12} textAnchor="middle" fontFamily={SERIF} fontWeight="700" fontSize="36" fill="rgba(255,255,255,0.35)" opacity={1 - onC}>?</text>}
        </g>;
      })}
    </SVG>
  );
}

// ---- Drawn pieces ----------------------------------------------------------------
function Sun({ cx, cy, r = 60, lt, op = 1 }) {
  if (op <= 0) return null;
  return (
    <SVG op={op}>
      <g transform={`translate(${cx} ${cy})`}>
        <circle r={r * 1.7} fill="#FFD36B" opacity={0.18 + 0.06 * Math.sin(lt * 3)} />
        <g transform={`rotate(${lt * 12})`}>{Array.from({ length: 12 }, (_, i) => <line key={i} x1={0} y1={-r - 14} x2={0} y2={-r - 36} stroke="#FFD36B" strokeWidth={8} strokeLinecap="round" transform={`rotate(${i * 30})`} />)}</g>
        <circle r={r} fill="#FFC93C" stroke="#E89B1A" strokeWidth={5} />
      </g>
    </SVG>
  );
}
function Cloud({ x, y, s = 1, op = 1, dark = false, rain = 0, lt = 0 }) {
  if (op <= 0) return null;
  const c = dark ? "#7C8A99" : "#F4F7FA";
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
      {rain > 0 && Array.from({ length: 7 }, (_, i) => { const ph = ((lt * 1.8 + i * 0.37) % 1); return <line key={i} x1={-54 + i * 18} y1={30 + ph * 70} x2={-60 + i * 18} y2={48 + ph * 70} stroke="#7FD3F7" strokeWidth={5} strokeLinecap="round" opacity={rain * (1 - ph)} />; })}
      <ellipse cx={-40} cy={10} rx={46} ry={32} fill={c} /><ellipse cx={10} cy={-8} rx={56} ry={44} fill={c} /><ellipse cx={56} cy={12} rx={42} ry={30} fill={c} />
      <rect x={-80} y={10} width={176} height={34} rx={17} fill={c} />
    </g>
  );
}
// Wall calendar: month name, a grid of days crossed off up to `upto` (0..1), page tears at `tear`.
function Calendar({ x, y, w = 380, h = 420, lt, at, month = "JUNE", next = "JULY", upto = 0, tear = null, days = 30 }) {
  const o = pop(lt, at, 0.7); if (o <= 0) return null;
  const tp = tear != null ? clamp((lt - tear) / 1.1, 0, 1) : 0;
  const crossed = Math.floor(upto * days);
  const page = (m, cross, rot, dy, op) => (
    <div style={{ position: "absolute", inset: 0, borderRadius: 16, background: SK.cream, overflow: "hidden", boxShadow: "0 10px 26px rgba(0,0,0,0.35)", opacity: op,
      transform: `translateY(${dy}px) rotate(${rot}deg)`, transformOrigin: "top left" }}>
      <div style={{ background: "#B3261E", height: 78, fontFamily: SERIF, fontWeight: 700, fontSize: 50, color: SK.white, textAlign: "center", lineHeight: "78px", letterSpacing: "0.12em" }}>{m}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, padding: "14px 16px" }}>
        {Array.from({ length: days }, (_, i) => <div key={i} style={{ position: "relative", height: (h - 130) / 5 - 6, fontFamily: SANS, fontWeight: 700, fontSize: 24, color: SK.ink, textAlign: "center",
          lineHeight: `${(h - 130) / 5 - 6}px`, background: i < cross ? "rgba(226,176,76,0.35)" : "rgba(22,58,44,0.06)", borderRadius: 6 }}>{i + 1}
          {i < cross && <svg width="100%" height="100%" viewBox="0 0 40 40" preserveAspectRatio="none" style={{ position: "absolute", left: 0, top: 0 }}><path d="M8 8 L32 32 M32 8 L8 32" stroke="#B3261E" strokeWidth="4" strokeLinecap="round" /></svg>}</div>)}
      </div>
    </div>
  );
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, opacity: o, transform: `scale(${0.85 + 0.15 * o})`, transformOrigin: "center top" }}>
      {tp > 0 && page(next, 0, 0, 0, 1)}
      {tp < 1 && page(month, crossed, 28 * tp * tp, 600 * tp * tp, 1 - tp * 0.8)}
    </div>
  );
}

// Official India outline (india-map.js, copied from LP5) → map px; proj(lon, lat).
const MAP = window.LP5_MAP;
if (!MAP) console.error("india-map.js missing");
const proj = (lon, lat) => [(lon - MAP.lon0) * MAP.k * MAP.cos, (MAP.lat0 - lat) * MAP.k];
const KERALA = proj(76.3, 10.0), NWEST = proj(72.3, 27.6), SOHRA = proj(91.7, 25.3);
const LAND = (props) => <React.Fragment><path d={MAP.outline} {...props} />{MAP.islands.map((d, i) => <path key={i} d={d} {...props} />)}</React.Fragment>;
// The monsoon front: latitude reached at each longitude, by days after 1 June (approx. IMD normal onset).
const FRONT_LON = [68, 72, 76, 80, 84, 88, 92, 97];
const FRONT = [[0, [5, 6, 10.5, 7, 7, 7, 7, 7]], [4, [8, 10, 14, 13, 13, 17, 25, 29]], [14, [17, 19.5, 21, 23, 26, 29, 31, 31]],
  [30, [23, 25.5, 33, 35, 38, 38, 38, 38]], [35, [25, 27, 36, 38, 38, 38, 38, 38]], [37, [40, 40, 40, 40, 40, 40, 40, 40]]];
function frontLats(day) {
  const i = Math.max(0, FRONT.findIndex((f) => f[0] >= day) - 1), [d0, a] = FRONT[i], [d1, b] = FRONT[i + 1], t = clamp((day - d0) / (d1 - d0), 0, 1);
  return a.map((v, k) => lerp(v, b[k], t));
}
function Pin({ at, lt, xy, label, sub, dx = 30, anchor = "start", color = SK.gold }) {
  const o = pop(lt, at, 0.6), pulse = 1 + 0.25 * Math.sin(lt * 5); if (o <= 0) return null;
  return (
    <g opacity={Math.min(1, o)}>
      <circle cx={xy[0]} cy={xy[1]} r={26 * pulse} fill={color} opacity={0.3} /><circle cx={xy[0]} cy={xy[1]} r={12} fill={color} stroke={SK.ink} strokeWidth={3} />
      <text x={xy[0] + dx} y={xy[1] - 6} textAnchor={anchor} fontFamily={SERIF} fontWeight="700" fontSize="34" fill={color} stroke={SK.bgDeep} strokeWidth={6} paintOrder="stroke">{label}</text>
      {sub && <text x={xy[0] + dx} y={xy[1] + 28} textAnchor={anchor} fontFamily={SANS} fontWeight="700" fontSize="26" fill={SK.white} stroke={SK.bgDeep} strokeWidth={6} paintOrder="stroke">{sub}</text>}
    </g>
  );
}
// India map with the monsoon front sweeping from the south-east tip to the north-west (p 0→1).
function IndiaMap({ x, y, s = 1, lt, at, p = 0, children, op = 1 }) {
  const o = out3(lt, at, 0.8) * op; if (o <= 0) return null;
  // everything south of the front is wet
  const lats = frontLats(p * 37);
  const pts = [[60, lats[0]], ...FRONT_LON.map((lon, k) => [lon, lats[k]]), [105, lats[lats.length - 1]]].map(([a, b]) => proj(a, b));
  const wet = `M ${pts.map((q) => q.map((v) => v.toFixed(1)).join(" ")).join(" L ")} L ${pts[pts.length - 1][0].toFixed(1)} ${MAP.h + 100} L ${pts[0][0].toFixed(1)} ${MAP.h + 100} Z`;
  const cl = FRONT_LON.filter((lon) => lon > 70 && lon < 96 && lon % 8 === 0).map((lon) => [lon, lats[FRONT_LON.indexOf(lon)]]).filter(([, lat]) => lat > 8 && lat < 35.5).map(([lon, lat]) => proj(lon, lat));
  return (
    <SVG op={o}>
      <defs><clipPath id="lp6-india"><path d={MAP.outline} />{MAP.islands.map((d, i) => <path key={i} d={d} />)}</clipPath></defs>
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <LAND fill="#B98A4E" />
        {p > 0 && <path d={wet} fill="#2E7A4F" clipPath="url(#lp6-india)" />}
        {p > 0 && <path d={wet} fill="#7FD3F7" opacity={0.25} clipPath="url(#lp6-india)" />}
        <LAND fill="none" stroke={SK.cream} strokeWidth={3.5} strokeLinejoin="round" />
        {p > 0 && p < 1 && cl.map(([cx, cy], i) => <Cloud key={i} x={cx} y={cy - 30} s={0.5} dark rain={1} lt={lt} op={windowOp(p, 0, 0.98, 0.05)} />)}
        {children}
      </g>
    </SVG>
  );
}
// Flat plant: droop 0→1 bends the leaves, dry 0→1 turns it yellow-brown.
function Sprout({ x, y, s = 1, droop = 0, dry = 0 }) {
  const c = `rgb(${Math.round(lerp(111, 196, dry))},${Math.round(lerp(191, 160, dry))},${Math.round(lerp(110, 60, dry))})`;
  const lean = droop * 28;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d={`M0 0 Q ${lean * 0.3} -60 ${lean} -${120 - droop * 30}`} stroke={c} strokeWidth={8} fill="none" strokeLinecap="round" />
      <ellipse cx={-26} cy={-55 + droop * 20} rx={30} ry={11} fill={c} transform={`rotate(${-30 + droop * 60} -26 ${-55 + droop * 20})`} />
      <ellipse cx={28 + lean * 0.4} cy={-80 + droop * 22} rx={30} ry={11} fill={c} transform={`rotate(${30 + droop * 50} ${28 + lean * 0.4} ${-80 + droop * 22})`} />
      {dry > 0.5 && <path d={`M${lean - 4} -${118 - droop * 30} l 14 6`} stroke="#8A5A2B" strokeWidth={4} opacity={(dry - 0.5) * 2} />}
    </g>
  );
}
// Woven harvest basket, fill 0→1.
function Basket({ x, y, s = 1, fill = 0, op = 1 }) {
  if (op <= 0) return null;
  const top = lerp(0, -90, fill);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
      <clipPath id={`lp6-bk-${x}`}><path d="M-120 -100 L 120 -100 L 95 40 L -95 40 Z" /></clipPath>
      <g clipPath={`url(#lp6-bk-${x})`}>{Array.from({ length: 22 }, (_, i) => <circle key={i} cx={-110 + (i % 11) * 22} cy={40 + top * ((i < 11) ? 1 : 0.85) - (i < 11 ? 0 : 18) - 20} r={16} fill="#E3B55C" stroke="#9E7320" strokeWidth={2} />)}
        {fill > 0 && <rect x={-120} y={40 + top} width={240} height={-top} fill="#E3B55C" />}</g>
      <path d="M-120 -100 L 120 -100 L 95 40 L -95 40 Z" fill="none" stroke="#8A5A2B" strokeWidth={8} strokeLinejoin="round" />
      {[-60, -20, 20].map((yy) => <line key={yy} x1={-114 + (yy + 100) * 0.18} y1={yy} x2={114 - (yy + 100) * 0.18} y2={yy} stroke="#8A5A2B" strokeWidth={4} opacity={0.6} />)}
      <line x1={-125} y1={-50} x2={125} y2={-50} stroke={SK.white} strokeWidth={3} strokeDasharray="10 8" opacity={0.7} />
      <text x={136} y={-42} fontFamily={SANS} fontWeight="700" fontSize="22" fill={SK.white}>full</text>
    </g>
  );
}
// Rupee note.
function Note({ x, y, rot = 0, op = 1, s = 1 }) {
  if (op <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={op}>
      <rect x={-46} y={-24} width={92} height={48} rx={6} fill="#C9E4B4" stroke="#4E7F3A" strokeWidth={3} />
      <circle cx={0} cy={0} r={14} fill="none" stroke="#4E7F3A" strokeWidth={3} />
      <text x={0} y={8} textAnchor="middle" fontFamily={SANS} fontWeight="700" fontSize="22" fill="#2F5A22">₹</text>
    </g>
  );
}
// Notes flying from (x1,y1) to (x2,y2) on a loop while active.
function Flow({ x1, y1, x2, y2, lt, from, to, n = 3 }) {
  if (lt < from || lt > to + 1.2) return null;
  return <g>{Array.from({ length: n }, (_, i) => {
    const per = 1.2, ph = ((lt - from) / per + i / n) % 1; if (lt - from < (i / n) * per) return null;
    if (lt > to && ph < ((to - from) / per + i / n) % 1) return null;
    const x = lerp(x1, x2, ph), y = lerp(y1, y2, ph) - Math.sin(ph * Math.PI) * 120;
    return <Note key={i} x={x} y={y} rot={ph * 40 - 20} op={Math.min(1, ph * 6, (1 - ph) * 6)} s={0.8} />; })}</g>;
}

// ============================================================================
function B1(ctx) {
  return ({ localTime: lt, duration }) => {
    const cField = W("b1", "field"), cSeeds = W("b1", "seeds"), cWait = W("b1", "wait"), cJune = W("b1", "june"), cPasses = W("b1", "passes"), cRain = W("b1", "rain"),
      cQ = S("b1", 5), cPlans = W("b1", "plans");
    const upto = drive(lt, cJune + 0.3, cRain + 0.4);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[1]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(1, ctx, [L("You are the farmer", S("b1", 0), "sub"), L("Field ready ✓ · Seeds bought ✓", cSeeds), L("Waiting for the monsoon… in June", cWait),
          L("June passes with hardly any rain", cPasses), L("BIG QUESTION", cQ, "head"), L("What happens to your farming plans when the rain does not come on time?", cQ, "big")], { max: 7 })}>
        <Pic slot="farmer_waits" label="The farmer waits at the edge of a ploughed field" x={40} y={60} w={900} h={620} lt={lt} at={0} fx="zoom" kenDur={26} />
        <Sun cx={820} cy={150} r={46} lt={lt} op={out3(lt, cJune, 0.8)} />
        <SVG op={1}><Cloud x={560} y={130} s={0.45} op={out3(lt, cJune, 1) * 0.8} /><Cloud x={300 + 10 * Math.sin(lt * 0.3)} y={190} s={0.3} op={out3(lt, cJune + 0.4, 1) * 0.7} /></SVG>
        <Chip text="YOU are the farmer" x={490} y={80} lt={lt} at={0.4} out={cField} tone="gold" size={30} />
        <Chip text="✓ Field ready" x={220} y={620} lt={lt} at={cField} size={28} />
        <Chip text="✓ Seeds bought" x={480} y={620} lt={lt} at={cSeeds} size={28} />
        <Chip text="Waiting for the monsoon…" x={490} y={80} lt={lt} at={cWait} out={cPasses} size={28} />
        <Calendar x={990} y={80} w={390} h={430} lt={lt} at={cJune - 0.4} upto={upto} tear={cRain + 0.6} />
        <Chip text="hardly any rain…" x={1185} y={540} lt={lt} at={cPasses} out={cQ} tone="gold" size={28} />
        <Chip text="JUNE is gone!" x={1185} y={540} lt={lt} at={cRain + 0.9} tone="gold" size={30} />
        <Big x={60} y={720} w={1320} lt={lt} at={cQ} size={46} color={SK.gold}>What happens to your farming plans?</Big>
        <Thinks lt={lt} b="b1" x={1160} y={600} />
        <StopCard lt={lt} b="b1" />
        <span style={{ display: "none" }}>{cPlans}</span>
      </Scene>
    );
  };
}
function B2(ctx) {
  return ({ localTime: lt, duration }) => {
    const cSow = W("b2", "sow"), cDry = W("b2", "dry"), cWait = W("b2", "wait"), cEx = W("b2", "exactly"), cMany = S("b2", 4), cPrep = W("b2", "prepare"), cSow2 = W("b2", "sow", 1),
      cGrow = W("b2", "grow"), cLate = W("b2", "late"), cCal = W("b2", "calendar"), cDist = W("b2", "disturbed");
    const bub = [[760, cSow, "We cannot sow the seeds"], [1010, cDry, "The soil becomes dry"], [1260, cWait, "We have to wait for rain"]];
    const wob = lt > cLate ? 9 * Math.sin((lt - cLate) * 7) * Math.min(1, (lt - cLate) * 2) : 0;
    const segs = [["Prepare", "#8A6A48", cPrep], ["Sow", "#E2B04C", cSow2], ["Grow", "#6FBF6E", cGrow], ["Harvest", "#D9883A", cGrow + 0.5]];
    const wheel = out3(lt, cMany, 0.8), cx = 1050, cy = 640, R = 170;
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[2]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(2, ctx, [L("YOU MIGHT THINK…", cSow, "head"), L("We cannot sow the seeds", cSow), L("The soil becomes dry", cDry), L("We have to wait for rain", cWait),
          L("THE MONSOON helps farmers prepare fields, sow seeds and grow crops", cMany, "big"), L("A LATE monsoon disturbs the whole farming calendar", cLate, "think")], { max: 6 })}>
        <Pic slot="farmer_waits" label="The farmer waits" x={40} y={60} w={560} h={420} lt={lt} at={0} out={cMany} fx="zoom" />
        <Pic slot="rainfed_village" label="A rain-fed field after the monsoon rain" x={40} y={60} w={560} h={420} lt={lt} at={cMany} fx="zoom" />
        <SVG op={windowOp(lt, cSow - 0.3, cMany + 0.6, 0.4)}>{[0, 1, 2].map((i) => <g key={i} opacity={out3(lt, bub[i][1] - 0.2, 0.4)}>
          <circle cx={560 + i * 30} cy={360 - i * 40} r={12 + i * 4} fill={SK.cream} /></g>)}</SVG>
        {bub.map(([x, at, lab], i) => { const o = pop(lt, at, 0.6); if (o <= 0) return null; const dim = 1 - 0.45 * reveal(lt, cMany, 0.6);
          return <React.Fragment key={i}>
            <div style={{ position: "absolute", left: x - 115, top: 75, width: 230, height: 230, borderRadius: "50%", background: SK.cream, opacity: Math.min(1, o) * dim, transform: `scale(${0.8 + 0.2 * o})`, boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }} />
            {i === 1 && <Disc slot="cracked_field" label="Dry, cracked soil" cx={x} cy={190} r={98} lt={lt} at={at} />}
            <SVG op={Math.min(1, o) * dim}>
              {i === 0 && <g transform={`translate(${x} 190)`}><rect x={-55} y={-75} width={110} height={150} rx={10} fill="#E3B55C" stroke={SK.ink} strokeWidth={4} />
                <rect x={-55} y={-75} width={110} height={34} rx={8} fill="#9E7320" /><circle cx={0} cy={20} r={28} fill="#6FBF6E" />
                <path d="M-70 -70 L70 70 M70 -70 L-70 70" stroke="#B3261E" strokeWidth={14} strokeLinecap="round" opacity={out3(lt, at + 0.4, 0.3)} /></g>}
              {i === 2 && <g transform={`translate(${x} 190)`}><circle r={78} fill={SK.white} stroke={SK.ink} strokeWidth={6} />
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((k) => <line key={k} x1={0} y1={-66} x2={0} y2={-56} stroke={SK.ink} strokeWidth={4} transform={`rotate(${k * 30})`} />)}
                <line x1={0} y1={0} x2={0} y2={-52} stroke={SK.ink} strokeWidth={6} strokeLinecap="round" transform={`rotate(${lt * 90})`} />
                <line x1={0} y1={0} x2={30} y2={0} stroke={SK.ink} strokeWidth={8} strokeLinecap="round" transform={`rotate(${lt * 8})`} /></g>}
            </SVG>
            <Chip text={lab} x={x} y={322} lt={lt} at={at + 0.1} size={22} op={dim} />
            <Stamp cx={x + 80} cy={110} lt={lt} at={cEx + i * 0.15} />
          </React.Fragment>; })}
        <Badge text="EXACTLY!" x={880} y={390} lt={lt} at={cEx} size={44} op={1 - reveal(lt, cMany, 0.4)} />
        {/* the farming calendar wheel */}
        <SVG op={wheel}>
          <g transform={`rotate(${wob} ${cx} ${cy})`}>
            {segs.map(([lab, col, at], i) => { const a0 = -Math.PI / 2 + i * Math.PI / 2, a1 = a0 + Math.PI / 2, on = out3(lt, at, 0.5);
              const p = (a) => [cx + R * Math.cos(a), cy + R * Math.sin(a)], [x0, y0] = p(a0), [x1, y1] = p(a1), am = (a0 + a1) / 2;
              return <g key={lab}><path d={`M${cx} ${cy} L${x0} ${y0} A${R} ${R} 0 0 1 ${x1} ${y1} Z`} fill={col} opacity={0.35 + 0.65 * on} stroke={SK.bg0} strokeWidth={6} />
                <text x={cx + R * 0.6 * Math.cos(am)} y={cy + R * 0.6 * Math.sin(am) + 9} textAnchor="middle" fontFamily={SANS} fontWeight="700" fontSize="27" fill={SK.ink}>{lab}</text></g>; })}
            <circle cx={cx} cy={cy} r={40} fill={SK.cream} stroke={SK.ink} strokeWidth={4} />
            <circle cx={cx} cy={cy - R - 18} r={14} fill={SK.gold} />
          </g>
        </SVG>
        <Chip text="THE FARMING CALENDAR" x={cx} y={cy - R - 70} lt={lt} at={cMany} size={24} />
        {[["prepare fields", cPrep], ["sow seeds", cSow2], ["grow crops", cGrow]].map(([t, at], i) => <Chip key={t} text={t} x={320} y={510 + i * 64} lt={lt} at={at} tone="gold" size={28} />)}
        <Chip text="Monsoon rain helps farmers…" x={320} y={430} lt={lt} at={cMany} out={cPrep} size={26} />
        <Tag text="LATE monsoon → calendar DISTURBED!" x={320} y={710} lt={lt} at={cCal} size={26} />
        <Chain lt={lt} at={cDist} />
      </Scene>
    );
  };
}
// Soil box with a seed: moist → the seed swells, a root goes down and a shoot comes up (g 0→1).
function SeedBox({ x, y, w, h, moist, g = 0, lt, at, label }) {
  const o = out3(lt, at, 0.6); if (o <= 0) return null;
  const sx = x + w / 2, sy = y + h * 0.55;
  return (
    <SVG op={o}>
      <rect x={x} y={y} width={w} height={h} rx={20} fill={moist ? "#3A2A1E" : "#B98A4E"} stroke={SK.cream} strokeWidth={4} />
      <rect x={x} y={y} width={w} height={h * 0.28} rx={20} fill={moist ? "#244A5E" : "#E8D9A8"} opacity={0.55} />
      {!moist && [[0.2, 0.5], [0.45, 0.4], [0.7, 0.62], [0.3, 0.8], [0.82, 0.85], [0.6, 0.9]].map(([a, b], i) =>
        <path key={i} d={`M${x + a * w} ${y + b * h} l 30 -18 l 22 26 l 30 -12`} stroke="#6E4A26" strokeWidth={5} fill="none" strokeLinecap="round" />)}
      {moist && [0.15, 0.35, 0.62, 0.85].map((a, i) => <ellipse key={i} cx={x + a * w} cy={y + h * (0.45 + (i % 2) * 0.3)} rx={10} ry={14} fill="#7FD3F7" opacity={0.6} />)}
      {moist && g > 0 && <path d={`M${sx} ${sy + 18} Q ${sx - 12} ${sy + 18 + 60 * g} ${sx + 6} ${sy + 18 + 140 * g}`} stroke="#F6F1E3" strokeWidth={6} fill="none" strokeLinecap="round" />}
      {moist && g > 0.25 && <g opacity={clamp((g - 0.25) * 3, 0, 1)}>
        <path d={`M${sx} ${sy - 14} L ${sx} ${sy - 14 - 150 * (g - 0.25)}`} stroke="#6FBF6E" strokeWidth={8} strokeLinecap="round" />
        <ellipse cx={sx - 24} cy={sy - 14 - 150 * (g - 0.25)} rx={26} ry={10} fill="#6FBF6E" transform={`rotate(-25 ${sx - 24} ${sy - 14 - 150 * (g - 0.25)})`} />
        <ellipse cx={sx + 24} cy={sy - 14 - 150 * (g - 0.25)} rx={26} ry={10} fill="#6FBF6E" transform={`rotate(25 ${sx + 24} ${sy - 14 - 150 * (g - 0.25)})`} /></g>}
      <ellipse cx={sx} cy={sy} rx={26 + (moist ? 8 * g : 0)} ry={18 + (moist ? 6 * g : 0)} fill="#E3B55C" stroke="#9E7320" strokeWidth={3} />
      <text x={x + 24} y={y + 48} fontFamily={SANS} fontWeight="700" fontSize="30" fill={SK.white} stroke={SK.bgDeep} strokeWidth={5} paintOrder="stroke">{label}</text>
    </SVG>
  );
}
function B3(ctx) {
  return ({ localTime: lt, duration }) => {
    const cQ = S("b3", 0), cNo = W("b3", "no"), cMoist = W("b3", "moisture"), cGerm = W("b3", "germinate"), cWake = W("b3", "wake"), cEarly = W("b3", "early"), cNot = W("b3", "not"),
      cDelay = W("b3", "delayed");
    const g = drive(lt, cMoist, cWake + 1.4);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[3]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(3, ctx, [L("Can farmers sow in very dry soil?", cQ, "head"), L("NO!", cNo, "big"), L("Seeds need enough MOISTURE to germinate", cMoist),
          L("germinate = wake up and start growing", cWake, "sub"), L("Sow too early in dry soil → seeds may not germinate", cEarly), L("So sowing is DELAYED", cDelay, "think")], { max: 6 })}>
        <Big x={60} y={90} w={1320} lt={lt} at={cQ} out={cMoist} size={50}>Can farmers sow seeds when the soil is <span style={{ color: SK.gold }}>too dry</span>?</Big>
        <Thinks lt={lt} b="b3" x={1150} y={60} />
        <Lines x={60} y={70} w={1320} lt={lt} lines={[{ text: "Seeds need MOISTURE to germinate", at: cMoist, serif: true, bold: true, size: 48, color: SK.gold },
          { text: "germinate = wake up and start growing", at: cWake, size: 32 }]} />
        <SeedBox x={60} y={300} w={640} h={500} moist={false} lt={lt} at={0.4} label="DRY SOIL" />
        <SeedBox x={740} y={300} w={640} h={500} moist g={g} lt={lt} at={0.6} label="MOIST SOIL" />
        <Chip text="nothing happens…" x={380} y={720} lt={lt} at={cMoist + 0.6} size={26} />
        <Chip text="it swells, roots, shoots!" x={1060} y={720} lt={lt} at={cWake} tone="gold" size={26} />
        <Stamp cx={620} cy={380} lt={lt} at={cNo} ok={false} s={1.4} />
        <Badge text="NO!" x={110} y={420} lt={lt} at={cNo} size={60} />
        <Tag text="✗ may not germinate at all" x={380} y={640} lt={lt} at={cNot} size={26} />
        <Chain lt={lt} at={0.3} lit={[cDelay - 0.6, cDelay]} />
        <Badge text="SOWING IS DELAYED" x={60} y={210} lt={lt} at={cDelay} size={34} />
        <StopCard lt={lt} b="b3" />
        <span style={{ display: "none" }}>{cGerm + cEarly}</span>
      </Scene>
    );
  };
}
function B4(ctx) {
  const tiles = [["borewell", "Borewell", "borewells"], ["water_pump", "Pump", "pumps"], [null, "Electricity", "electricity"], ["water_tanker", "Water tanker", "tankers"]];
  return ({ localTime: lt, duration }) => {
    const cSup = S("b4", 0), cDo = S("b4", 1), cBore = W("b4", "borewell"), cPump = W("b4", "pump"), cGood = W("b4", "good"), cFree = S("b4", 4), cNo = S("b4", 5),
      cSpend = W("b4", "spend"), ta = tiles.map((t) => W("b4", t[2])), cCosts = W("b4", "costs");
    const bubOut = cFree;
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[4]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(4, ctx, [L("The farmer cannot wait any longer…", cSup, "sub"), L("Get water another way: borewell or pump", cBore), L("But is that water FREE?", cFree, "head"),
          L("Borewell · pump · electricity · water tanker", ta[0]), L("= extra money spent", ta[3] + 0.6, "big"), L("So farming COSTS more", cCosts, "think")], { max: 6 })}>
        <Pic slot="farmer_waits" label="The farmer thinks" x={40} y={60} w={600} h={400} lt={lt} at={0} fx="zoom" kenDur={30} />
        <Chip text="…cannot wait any longer" x={340} y={410} lt={lt} at={cSup + 0.4} out={cBore} size={26} />
        <Chip text="What can the farmer do?" x={340} y={410} lt={lt} at={cDo} out={cFree} tone="gold" size={28} />
        <SVG op={windowOp(lt, cBore - 0.3, bubOut + 0.3, 0.4)}>{[0, 1, 2].map((i) => <circle key={i} cx={600 + i * 34} cy={150 - i * 22} r={10 + i * 5} fill={SK.cream} />)}</SVG>
        <Disc slot="borewell" label="Borewell" cx={830} cy={210} r={140} lt={lt} at={cBore} out={bubOut} />
        <Disc slot="water_pump" label="Pump" cx={1170} cy={210} r={140} lt={lt} at={cPump} out={bubOut} />
        <Chip text="a borewell" x={830} y={365} lt={lt} at={cBore + 0.15} out={bubOut} size={26} />
        <Chip text="a pump for water" x={1170} y={365} lt={lt} at={cPump + 0.15} out={bubOut} size={26} />
        <SVG op={pop(lt, cGood, 0.6) * (1 - reveal(lt, bubOut, 0.4))}>
          <g transform={`translate(1000 70) rotate(${lt * 20})`}><path d={Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 26 : 60; return `${i ? "L" : "M"}${(r * Math.cos(a)).toFixed(1)} ${(r * Math.sin(a)).toFixed(1)}`; }).join(" ") + " Z"} fill={SK.gold} stroke={SK.ink} strokeWidth={4} /></g>
        </SVG>
        <Badge text="Good thinking!" x={760} y={420} lt={lt} at={cGood} size={34} op={1 - reveal(lt, bubOut, 0.4)} />
        <Big x={700} y={110} w={700} lt={lt} at={cFree} size={64}>Is that extra water <span style={{ color: SK.gold }}>FREE</span>?</Big>
        <Thinks lt={lt} b="b4" x={1160} y={250} />
        <Badge text="NO." x={760} y={300} lt={lt} at={cNo} size={56} op={1 - reveal(lt, cSpend, 0.4)} />
        {tiles.map(([slot, lab], i) => { const x = 60 + i * 340, at = ta[i];
          return <React.Fragment key={lab}>
            {slot ? <Pic slot={slot} label={lab} x={x} y={500} w={300} h={220} lt={lt} at={at} fx="pop" />
              : <SVG op={pop(lt, at, 0.6)}><g transform={`translate(${x} 500)`}><rect width={300} height={220} rx={18} fill="#E9E4D4" stroke="rgba(255,255,255,0.55)" strokeWidth={3} />
                <rect x={90} y={30} width={120} height={150} rx={12} fill="#5C6B73" /><rect x={106} y={50} width={88} height={44} rx={6} fill="#CFE6F5" />
                <text x={150} y={82} textAnchor="middle" fontFamily={SANS} fontWeight="700" fontSize="26" fill={SK.ink}>{String(Math.floor(clamp((lt - at) * 37, 0, 9999))).padStart(4, "0")}</text>
                <path d="M150 112 L136 140 L152 140 L142 168" stroke={SK.gold} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" /></g></SVG>}
            <Chip text={lab} x={x + 150} y={730} lt={lt} at={at + 0.15} size={24} />
          </React.Fragment>; })}
        <SVG op={1}>{tiles.map((t, i) => <Flow key={i} x1={300} y1={300} x2={210 + i * 340} y2={560} lt={lt} from={ta[i]} to={cCosts + 1.2} />)}</SVG>
        <Tag text="extra money spent!" x={720} y={440} lt={lt} at={cSpend} out={cCosts} size={28} />
        <Badge text="FARMING COSTS MORE" x={560} y={420} lt={lt} at={cCosts} size={36} />
        <Chain lt={lt} at={0.2} lit={[0, 0, cCosts]} />
      </Scene>
    );
  };
}
function B5(ctx) {
  return ({ localTime: lt, duration }) => {
    const cStill = W("b5", "still"), cQ = S("b5", 1), cDry = W("b5", "dry"), cDie = W("b5", "die"), cWeak = W("b5", "weak"), cSmall = W("b5", "smaller"), brk = SE("b5", 3) + 0.15;
    const wilt = drive(lt, cStill, cDie + 1.2), fill = 0.5 * drive(lt, cSmall - 0.2, cSmall + 1.6);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[5]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(5, ctx, [L("The rain is STILL not enough…", cStill), L("What happens to the young plants?", cQ, "head"), L("Too little rain → plants dry up or die", cDry),
          L("Poor rain → weak plants → smaller harvest", cWeak, "big"), L("= less crop", cSmall + 0.8, "think")])}>
        <SVG op={out3(lt, 0, 0.6)}>
          <rect x={40} y={60} width={1000} height={760} rx={20} fill="#9CC7E0" />
          <rect x={40} y={60} width={1000} height={760} rx={20} fill="#F2C46A" opacity={0.55 * wilt} />
          <rect x={40} y={500} width={1000} height={320} rx={0} fill="#8A6A48" />
          <rect x={40} y={500} width={1000} height={320} fill="#B98A4E" opacity={wilt} />
          {wilt > 0.3 && [[150, 640], [420, 720], [700, 600], [900, 760]].map(([x, y], i) => <path key={i} d={`M${x} ${y} l 40 -16 l 30 24 l 40 -10`} stroke="#6E4A26" strokeWidth={5} fill="none" opacity={(wilt - 0.3) * 1.4} />)}
          {[0, 1, 2].map((r) => Array.from({ length: 7 }, (_, i) => <Sprout key={r + "-" + i} x={120 + i * 130 + r * 30} y={560 + r * 100} s={0.9 + r * 0.15} droop={clamp(wilt * (1 + ((i + r) % 3) * 0.15), 0, 1)} dry={clamp(wilt * 1.1 - ((i * 7 + r) % 4) * 0.08, 0, 1)} />))}
        </SVG>
        <Sun cx={900} cy={170} r={60 + 18 * wilt} lt={lt} op={out3(lt, 0.2, 0.6)} />
        <Card x={60} y={80} w={720} h={150} lt={lt} at={cQ} out={cDry} pad={0} />
        <Big x={90} y={100} w={680} lt={lt} at={cQ} out={cDry} size={46}>What happens to the <span style={{ color: SK.gold }}>young plants</span>?</Big>
        <Thinks lt={lt} b="b5" x={620} y={200} />
        <Tag text="They may dry up…" x={300} y={110} lt={lt} at={cDry} size={32} />
        <Tag text="…or even die" x={640} y={110} lt={lt} at={cDie} size={32} />
        <Pic slot="wilting_rows" label="Rows of young plants drooping and yellowing" x={1080} y={60} w={320} h={300} lt={lt} at={cStill} fx="zoom" />
        <SVG op={out3(lt, cWeak, 0.6)}><Basket x={1240} y={640} s={0.95} fill={fill} /></SVG>
        <Chip text="the harvest basket" x={1240} y={420} lt={lt} at={cWeak} size={24} />
        <Chip text="only HALF full!" x={1240} y={700} lt={lt} at={cSmall + 0.8} tone="gold" size={28} />
        <Chain lt={lt} at={0.2} lit={[0, 0, 0, cWeak, cSmall]} />
        <Break lt={lt} at={brk} dur={2.4} />
      </Scene>
    );
  };
}
function B6(ctx) {
  return ({ localTime: lt, duration }) => {
    const cDyk = S("b6", 0), cKer = W("b6", "kerala"), cFirst = W("b6", "first"), cNorth = W("b6", "north"), cNW = W("b6", "northwest"), cEighth = W("b6", "eighth"), cFive = W("b6", "five");
    const p = drive(lt, cFirst + 0.4, cEighth + 0.3);
    const day = Math.round(p * 37), date = day <= 29 ? `${day + 1} June` : `${day - 29} July`, week = Math.min(6, 1 + Math.floor(day / 7));
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[6]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(6, ctx, [L("The monsoon normally reaches KERALA around 1 JUNE", cKer), L("Then it travels north, across the country", cNorth),
          L("It reaches the far north-west of India around 8 JULY", cNW), L("More than 5 weeks to cross the country!", cFive, "big"),
          L("Normal dates (IMD); in a real year the monsoon can come earlier or later", cFive + 1.2, "source")])}>
        <Badge text="DO YOU KNOW?" x={60} y={70} lt={lt} at={cDyk} size={40} />
        <IndiaMap x={40} y={135} s={0.98} lt={lt} at={0.3} p={p}>
          <Pin lt={lt} at={cKer} xy={KERALA} label="Kerala" sub="≈ 1 June" dx={-30} anchor="end" />
          <Pin lt={lt} at={cNW} xy={NWEST} label="Rajasthan" sub="≈ 8 July" />
        </IndiaMap>
        <div style={{ position: "absolute", left: 470, top: 72, opacity: windowOp(lt, cFirst + 0.2, duration + 1, 0.4), fontFamily: SERIF, fontWeight: 700, fontSize: 40, color: SK.white,
          background: "rgba(5,30,22,0.8)", padding: "8px 24px", borderRadius: 14 }}>{date} <span style={{ color: SK.gold, fontSize: 30 }}>· week {week}</span></div>
        <Calendar x={860} y={150} w={240} h={290} lt={lt} at={cFirst} month="1 JUNE" days={0} />
        <Chip text="KERALA" x={980} y={455} lt={lt} at={cFirst + 0.2} tone="gold" size={28} />
        <Calendar x={1140} y={150} w={240} h={290} lt={lt} at={cEighth} month="8 JULY" days={0} />
        <Chip text="FAR NORTH-WEST" x={1260} y={455} lt={lt} at={cEighth + 0.2} tone="gold" size={26} />
        <SVG op={1}><Cloud x={980} y={300} s={0.8} dark rain={1} lt={lt} op={Math.min(1, pop(lt, cFirst + 0.2, 0.6))} /><Cloud x={1260} y={300} s={0.8} dark rain={1} lt={lt} op={Math.min(1, pop(lt, cEighth + 0.2, 0.6))} /></SVG>
        <SVG op={out3(lt, cFive, 0.5)}><Arrow x1={1000} y1={540} x2={1270} y2={540} color={SK.gold} sw={8} /></SVG>
        <Big x={860} y={580} w={540} lt={lt} at={cFive} size={52} color={SK.gold} align="center">more than 5 weeks!</Big>
        <Chip text="It travels north…" x={1120} y={720} lt={lt} at={cNorth} out={cFive} size={28} />
        <StopCard lt={lt} b="b6" />
      </Scene>
    );
  };
}
// Seed packet: a cream card with a photo window (or a drawn clock for short-duration).
function Packet({ x, y, w = 340, h = 440, lt, at, slot, title, sub, clock = false }) {
  const o = out3(lt, at, 0.7); if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, opacity: o, transform: `translateX(${(1 - o) * 260}px) rotate(${(1 - o) * 8}deg)` }}>
      <div style={{ position: "absolute", inset: 0, background: SK.cream, borderRadius: "20px 20px 14px 14px", boxShadow: "0 10px 26px rgba(0,0,0,0.35)", borderTop: `22px solid ${SK.goldDeep}` }} />
      {slot && <Pic slot={slot} label={title} x={24} y={44} w={w - 48} h={h * 0.5} lt={lt} at={at} fx="none" r={12} border={false} />}
      {clock && <svg width={w - 48} height={h * 0.5} viewBox="-120 -110 240 220" style={{ position: "absolute", left: 24, top: 44 }}>
        <rect x={-120} y={-110} width={240} height={220} rx={14} fill="#E9E4D4" />
        <circle r={82} fill={SK.white} stroke={SK.ink} strokeWidth={8} />
        <path d={`M0 0 L0 -82 A82 82 0 0 1 ${(82 * Math.sin(4.2)).toFixed(1)} ${(-82 * Math.cos(4.2)).toFixed(1)} Z`} fill="#6FBF6E" opacity={0.6} />
        <line x1={0} y1={0} x2={0} y2={-62} stroke={SK.ink} strokeWidth={8} strokeLinecap="round" transform={`rotate(${lt * 120})`} />
        <circle r={8} fill={SK.ink} /></svg>}
      <div style={{ position: "absolute", left: 0, right: 0, top: 44 + h * 0.5 + 16, textAlign: "center", fontFamily: SERIF, fontWeight: 700, fontSize: 38, color: SK.ink, lineHeight: 1.05 }}>{title}</div>
      <div style={{ position: "absolute", left: 16, right: 16, top: 44 + h * 0.5 + 66, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 24, color: SK.goldDeep, lineHeight: 1.15 }}>{sub}</div>
    </div>
  );
}
function B7(ctx) {
  return ({ localTime: lt, duration }) => {
    const cQ = S("b7", 0), cNot = W("b7", "not"), cSwitch = W("b7", "switch"), cLess = W("b7", "less"), cMil = W("b7", "millets"), cPul = W("b7", "pulses"),
      cShort = W("b7", "shortduration"), cReady = W("b7", "ready");
    const away = out3(lt, cNot, 0.8);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[7]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(7, ctx, [L("Must farmers always grow the crop they first planned?", cQ, "head"), L("Not always! Switch crops", cNot, "big"),
          L("Millets · pulses – need LESS water", cLess), L("Short-duration varieties – ready in less time", cShort)])}>
        <Big x={60} y={80} w={1080} lt={lt} at={cQ} out={cNot} size={48}>Must farmers always grow the crop they <span style={{ color: SK.gold }}>first planned</span>?</Big>
        <Thinks lt={lt} b="b7" x={1160} y={60} />
        {/* the original seed bag with a question mark, sliding aside */}
        <SVG op={out3(lt, 0.3, 0.6) * (1 - away * 0.85)}>
          <g transform={`translate(${lerp(720, 140, away)} ${lerp(560, 600, away)}) scale(${lerp(1.3, 0.6, away)})`}>
            <path d="M-110 -120 Q -130 -150 -90 -160 L 90 -160 Q 130 -150 110 -120 L 130 120 Q 130 150 100 150 L -100 150 Q -130 150 -130 120 Z" fill="#D8C49A" stroke="#8A6A48" strokeWidth={6} />
            <path d="M-100 -130 Q 0 -110 100 -130" stroke="#8A6A48" strokeWidth={8} fill="none" />
            <text x={0} y={-30} textAnchor="middle" fontFamily={SANS} fontWeight="700" fontSize="34" fill="#5C4A3E">FIRST PLAN</text>
            <text x={0} y={95} textAnchor="middle" fontFamily={SERIF} fontWeight="700" fontSize="120" fill="#B3261E" opacity={1 - away}>?</text>
          </g>
        </SVG>
        <Packet x={300} y={210} lt={lt} at={cMil} slot="crop_millets" title="Millets" sub="need LESS water" />
        <Packet x={680} y={210} lt={lt} at={cPul} slot="crop_pulses" title="Pulses" sub="need LESS water" />
        <Packet x={1060} y={210} lt={lt} at={cShort} clock title="Short-duration" sub="ready to harvest in less time" />
        <Badge text="Not always! SWITCH CROPS" x={300} y={100} lt={lt} at={cNot} size={40} op={1 - reveal(lt, cMil, 0.3)} />
        <Pic slot="millet_sun" label="Millets thrive with little water" x={300} y={80} w={700} h={110} lt={lt} at={cMil} fx="pan" r={14} />
        <Chip text="crops that need LESS water" x={650} y={110} lt={lt} at={cLess} tone="gold" size={30} />
        <Chip text="fewer days ⏱" x={1230} y={670} lt={lt} at={cReady} tone="gold" size={28} />
        <Chain lt={lt} at={0.2} lit={[0, 0, 0, 0, 0]} op={0.75} />
        <span style={{ display: "none" }}>{cSwitch}</span>
      </Scene>
    );
  };
}
function B8(ctx) {
  return ({ localTime: lt, duration }) => {
    const cAgain = S("b8", 0), cSmall = W("b8", "smaller"), cHigh = W("b8", "higher"), cInc = W("b8", "income"), cEarns = W("b8", "earns"), cSpends = W("b8", "spends"), cMoney = W("b8", "money"), cFam = W("b8", "family");
    const bills = Math.round(6 * drive(lt, cHigh - 0.2, cSpends + 0.8)), tilt = 14 * drive(lt, cHigh, cSpends + 0.6) - 4 * drive(lt, cSmall, cSmall + 0.8);
    const jar = 1 - 0.85 * drive(lt, cEarns, cMoney + 1.0);
    const px = 620, py = 220, arm = 330, a = (tilt * Math.PI) / 180;
    const L1 = [px - arm * Math.cos(a), py - arm * Math.sin(a)], R1 = [px + arm * Math.cos(a), py + arm * Math.sin(a)];
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[8]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(8, ctx, [L("Smaller harvest", cSmall), L("+ higher costs", cHigh), L("= less income", cEarns, "big"), L("The farmer earns less and spends more", cEarns),
          L("Real money problems for the family", cMoney, "think")])}>
        <Chip text="Let's think again…" x={620} y={70} lt={lt} at={cAgain} out={cSmall} size={28} />
        <SVG op={out3(lt, 0.3, 0.6)}>
          <path d={`M${px - 90} 760 L ${px + 90} 760 L ${px + 20} 700 L ${px - 20} 700 Z`} fill="#8A6A48" />
          <rect x={px - 12} y={py} width={24} height={480} fill="#8A6A48" />
          <line x1={L1[0]} y1={L1[1]} x2={R1[0]} y2={R1[1]} stroke="#D9C089" strokeWidth={16} strokeLinecap="round" />
          <circle cx={px} cy={py} r={22} fill={SK.gold} stroke={SK.ink} strokeWidth={4} />
          {[L1, R1].map(([x, y], i) => <g key={i}><line x1={x} y1={y} x2={x - 110} y2={y + 230} stroke="#D9C089" strokeWidth={4} /><line x1={x} y1={y} x2={x + 110} y2={y + 230} stroke="#D9C089" strokeWidth={4} />
            <path d={`M${x - 130} ${y + 230} L ${x + 130} ${y + 230} Q ${x} ${y + 300} ${x - 130} ${y + 230} Z`} fill="#D9C089" /></g>)}
          <g opacity={out3(lt, cSmall, 0.5)}><Basket x={L1[0]} y={L1[1] + 200} s={0.55} fill={0.4} /></g>
          {Array.from({ length: bills }, (_, i) => <g key={i} transform={`translate(${R1[0] + ((i % 2) ? 26 : -26)} ${R1[1] + 205 - i * 26}) rotate(${(i * 17) % 20 - 10})`}>
            <rect x={-60} y={-20} width={120} height={40} rx={4} fill={SK.white} stroke="#B3261E" strokeWidth={3} />
            <line x1={-46} y1={-6} x2={30} y2={-6} stroke="#B3261E" strokeWidth={3} /><line x1={-46} y1={6} x2={10} y2={6} stroke={SK.inkDim} strokeWidth={3} />
            <text x={44} y={10} fontFamily={SANS} fontWeight="700" fontSize="20" fill="#B3261E">₹</text></g>)}
        </SVG>
        <Chip text="SMALLER harvest" x={L1[0]} y={L1[1] + 330} lt={lt} at={cSmall} tone="gold" size={28} />
        <Chip text="HIGHER costs: pump · electricity · tanker" x={R1[0]} y={Math.max(R1[1] + 330, 0)} lt={lt} at={cHigh} size={24} />
        {/* the money jar */}
        <SVG op={out3(lt, cInc - 0.3, 0.6)}>
          <g transform="translate(1210 420)">
            <rect x={-110} y={-150} width={220} height={300} rx={40} fill="rgba(200,230,240,0.25)" stroke={SK.cream} strokeWidth={6} />
            <rect x={-80} y={-185} width={160} height={40} rx={10} fill="#8A6A48" />
            <clipPath id="lp6-jar"><rect x={-104} y={-144} width={208} height={288} rx={36} /></clipPath>
            <g clipPath="url(#lp6-jar)">{Array.from({ length: 12 }, (_, i) => { const yy = 120 - Math.floor(i / 3) * 38, shown = i < Math.round(12 * jar); return shown ? <circle key={i} cx={-60 + (i % 3) * 60} cy={yy} r={26} fill="#E2B04C" stroke="#9E7320" strokeWidth={3} /> : null; })}</g>
            <text x={0} y={-210} textAnchor="middle" fontFamily={SANS} fontWeight="700" fontSize="28" fill={SK.white}>the family's money</text>
          </g>
        </SVG>
        <Big x={1000} y={90} w={400} lt={lt} at={cInc} out={cEarns} size={42} align="center">…and the farmer's <span style={{ color: SK.gold }}>income</span>?</Big>
        <Thinks lt={lt} b="b8" x={1100} y={600} />
        <Tag text="earns LESS" x={1270} y={620} lt={lt} at={cEarns} size={30} />
        <Tag text="spends MORE" x={1270} y={690} lt={lt} at={cSpends} size={30} />
        <Badge text="LESS INCOME" x={1060} y={110} lt={lt} at={cMoney} size={40} />
        <Chain lt={lt} at={0.2} lit={[0, 0, 0, 0, 0, cEarns]} glow={stopAt("b8") - 0.2} />
        <StopCard lt={lt} b="b8" />
        <span style={{ display: "none" }}>{cFam}</span>
      </Scene>
    );
  };
}
// Rising rain tube beside an 8-storey building (26 m vs ~24 m, 24 px per metre).
function Tower({ lt, at, x = 860, base = 790, level = 0 }) {
  const o = out3(lt, at, 0.6); if (o <= 0) return null;
  const m = 24, hB = 24 * m, hT = 26 * m, hw = level * hT;
  return (
    <SVG op={o}>
      <g>
        {/* building */}
        <rect x={x + 250} y={base - hB} width={190} height={hB} fill="#C9B79A" stroke={SK.ink} strokeWidth={4} />
        {Array.from({ length: 8 }, (_, f) => <g key={f}>{[0, 1, 2].map((k) => <rect key={k} x={x + 268 + k * 58} y={base - (f + 1) * 3 * m + 20} width={40} height={36} fill="#5C7A8A" />)}
          <line x1={x + 250} y1={base - (f + 1) * 3 * m} x2={x + 440} y2={base - (f + 1) * 3 * m} stroke={SK.ink} strokeWidth={2} opacity={0.4} /></g>)}
        <text x={x + 345} y={base + 40} textAnchor="middle" fontFamily={SANS} fontWeight="700" fontSize="24" fill={SK.white}>8 storeys</text>
        {/* tube */}
        <rect x={x + 60} y={base - hT} width={130} height={hT} rx={14} fill="rgba(255,255,255,0.12)" stroke={SK.cream} strokeWidth={5} />
        <rect x={x + 66} y={base - hw} width={118} height={Math.max(0, hw - 6)} rx={10} fill="#4FA8DE" />
        {Array.from({ length: 27 }, (_, k) => <line key={k} x1={x + 190} y1={base - k * m} x2={x + (k % 5 === 0 ? 220 : 206)} y2={base - k * m} stroke={SK.cream} strokeWidth={3} />)}
        <text x={x + 125} y={base - hw - 16} textAnchor="middle" fontFamily={SERIF} fontWeight="700" fontSize="44" fill={SK.white} stroke={SK.bgDeep} strokeWidth={6} paintOrder="stroke">{Math.round(level * 26)} m</text>
        <line x1={x + 20} y1={base} x2={x + 470} y2={base} stroke={SK.cream} strokeWidth={4} />
      </g>
    </SVG>
  );
}
function B9(ctx) {
  return ({ localTime: lt, duration }) => {
    const cWow = S("b9", 0), c1860 = W("b9", "1860"), cCherra = W("b9", "cherrapunji"), cMeg = W("b9", "meghalaya"), c26 = W("b9", "26"), cOne = W("b9", "one"), cTaller = W("b9", "taller"),
      cRec = W("b9", "world"), cMuch = W("b9", "much"), cLittle = W("b9", "little");
    const zoom = drive(lt, cCherra, cMeg + 0.8), level = drive(lt, c26 - 0.3, cTaller + 0.8);
    const zs = lerp(0.68, 2.7, zoom), tx = lerp(100, 340 - SOHRA[0] * 2.7, zoom), ty = lerp(30, 330 - SOHRA[1] * 2.7, zoom);
    const sp = (i) => { const ph = (lt * 0.8 + i * 0.23) % 1; return [120 + i * 140 + 30 * Math.sin(i * 3 + lt), 120 + ((i * 97) % 300), Math.sin(ph * Math.PI)]; };
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[9]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(9, ctx, [L("Cherrapunji (Sohra), Meghalaya", cCherra, "head"), L("26,461 mm of rain in ONE year (1860–61)", c26), L("about 26 METRES of water", c26 + 0.6, "big"),
          L("Taller than an 8-storey building!", cTaller), L("Still a WORLD RECORD", cRec), L("Today, nearby Mawsynram is the wettest place on Earth", cRec + 1.2, "sub"),
          L("Too much rain in some places, too little in others", cMuch, "think")], { max: 7 })}>
        {/* WOW card */}
        <div style={{ position: "absolute", left: 60, top: 60, opacity: pop(lt, cWow, 0.6), transform: `rotate(-4deg) scale(${0.7 + 0.3 * Math.min(1, pop(lt, cWow, 0.6))})`, transformOrigin: "left center",
          background: "#F07A1A", color: SK.white, fontFamily: SERIF, fontWeight: 700, fontSize: 64, padding: "6px 34px", borderRadius: 18, boxShadow: "0 8px 24px rgba(0,0,0,0.4)", zIndex: 2 }}>WOW!</div>
        <SVG op={windowOp(lt, cWow, cWow + 3, 0.3)}>{Array.from({ length: 8 }, (_, i) => { const [x, y, s] = sp(i); return <path key={i} d="M0 -22 L5 -5 L22 0 L5 5 L0 22 L-5 5 L-22 0 L-5 -5 Z" transform={`translate(${x + 200} ${y}) scale(${s})`} fill={SK.gold} />; })}</SVG>
        <div style={{ position: "absolute", left: 40, top: 160, width: 700, height: 600, overflow: "hidden", borderRadius: 18, opacity: out3(lt, cWow, 0.6) * (1 - reveal(lt, cOne, 0.5)) }}>
          <svg width="700" height="600" viewBox="0 0 700 600">
            <g transform={`translate(${tx} ${ty}) scale(${zs})`}>
              <LAND fill="#2E7A4F" stroke={SK.cream} strokeWidth={4 / zs} strokeLinejoin="round" />
              <g opacity={out3(lt, cCherra, 0.5)}><circle cx={SOHRA[0]} cy={SOHRA[1]} r={14 / zs * 1.6} fill={SK.gold} stroke={SK.ink} strokeWidth={3 / zs} /></g>
            </g>
            <text x={340} y={410} textAnchor="middle" fontFamily={SERIF} fontWeight="700" fontSize="40" fill={SK.gold} opacity={out3(lt, cMeg, 0.5)} stroke={SK.bgDeep} strokeWidth={6} paintOrder="stroke">Cherrapunji (Sohra)</text>
            <text x={340} y={450} textAnchor="middle" fontFamily={SANS} fontWeight="700" fontSize="28" fill={SK.white} opacity={out3(lt, cMeg, 0.5)} stroke={SK.bgDeep} strokeWidth={6} paintOrder="stroke">Meghalaya</text>
          </svg>
        </div>
        <Pic slot="sohra_rain" label="Heavy rain over the green hills of Cherrapunji (Sohra)" x={40} y={160} w={700} h={460} lt={lt} at={cOne} fx="zoom" kenDur={16} />
        <SVG op={out3(lt, cOne, 0.6) * (1 - reveal(lt, cMuch, 0.4))}>{Array.from({ length: 26 }, (_, i) => { const ph = (lt * 1.6 + i * 0.137) % 1, x = 60 + (i * 53) % 680;
          return <line key={i} x1={x} y1={170 + ph * 430} x2={x - 8} y2={200 + ph * 430} stroke="#CFE6F5" strokeWidth={4} opacity={0.7} />; })}</SVG>
        <Chip text="1860–61 · ONE year" x={390} y={175} lt={lt} at={c1860 + 0.2} tone="gold" size={28} />
        <Tower lt={lt} at={c26 - 0.4} level={level} />
        <Badge text="26 METRES of rain!" x={60} y={650} lt={lt} at={c26} size={38} op={1 - reveal(lt, cMuch, 0.4)} />
        <Badge text="★ WORLD RECORD" x={60} y={740} lt={lt} at={cRec} size={34} op={1 - reveal(lt, cMuch, 0.4)} />
        <Chip text="far too MUCH rain…" x={220} y={660} lt={lt} at={cMuch} size={28} />
        <Pic slot="cracked_field" label="Far too little rain" x={420} y={640} w={320} h={190} lt={lt} at={cLittle} fx="pop" />
        <Chip text="…far too LITTLE" x={580} y={790} lt={lt} at={cLittle + 0.1} tone="gold" size={26} />
      </Scene>
    );
  };
}
// Rain gauge (graduated cylinder) filling to `level` 0→1.
function Gauge({ x, y, h = 440, level = 0, label, sub, lt, at, good = true }) {
  const o = out3(lt, at, 0.6); if (o <= 0) return null;
  return (
    <SVG op={o}>
      <g transform={`translate(${x} ${y})`}>
        <path d={`M-90 0 L 90 0 L 40 60 L -40 60 Z`} fill="rgba(255,255,255,0.15)" stroke={SK.cream} strokeWidth={4} />
        <rect x={-50} y={60} width={100} height={h} rx={10} fill="rgba(255,255,255,0.12)" stroke={SK.cream} strokeWidth={4} />
        <rect x={-44} y={60 + h - level * (h - 20)} width={88} height={level * (h - 20)} rx={6} fill="#4FA8DE" />
        {Array.from({ length: 9 }, (_, k) => <line key={k} x1={50} y1={80 + k * (h - 20) / 8} x2={68} y2={80 + k * (h - 20) / 8} stroke={SK.cream} strokeWidth={3} />)}
        <text x={0} y={h + 110} textAnchor="middle" fontFamily={SERIF} fontWeight="700" fontSize="40" fill={good ? SK.gold : "#F2A3A3"}>{label}</text>
        <text x={0} y={h + 150} textAnchor="middle" fontFamily={SANS} fontWeight="700" fontSize="26" fill={SK.white}>{sub}</text>
      </g>
    </SVG>
  );
}
function B10(ctx) {
  return ({ localTime: lt, duration }) => {
    const cRem = S("b10", 0), cWhen = W("b10", "when"), cHow = W("b10", "how"), cSame = W("b10", "same"), cWrong = W("b10", "wrong"), cUpset = W("b10", "upset"), end = SE("b10", 1);
    const a = drive(lt, cWhen, cHow), b = drive(lt, cWrong, cUpset + 0.4), join = drive(lt, cUpset, end + 0.4);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[10]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(10, ctx, [L("Remember…", cRem, "sub"), L("WHEN the rain comes", cWhen, "big"), L("is as important as", cHow - 0.6, "plain"), L("HOW MUCH rain falls", cHow, "big"),
          L("The same rain at the wrong time can upset the whole farming year", cSame, "think")])}>
        <Badge text="REMEMBER!" x={60} y={70} lt={lt} at={cRem} size={36} />
        <Gauge x={260} y={170} level={a} label="JUNE" sub="on time ✓" lt={lt} at={cRem} />
        <Gauge x={620} y={170} level={b * a} label="JULY" sub="same rain, but LATE ✗" lt={lt} at={cSame - 0.3} good={false} />
        <SVG op={out3(lt, cWrong, 0.5)}><Sprout x={760} y={670} s={0.7} droop={b} dry={b} /></SVG>
        <SVG op={out3(lt, cWhen, 0.5)}><Sprout x={400} y={670} s={0.7} /></SVG>
        {/* the clock and the cloud join together */}
        <SVG op={out3(lt, cWhen, 0.6)}>
          <g transform={`translate(${lerp(960, 1120, join)} ${lerp(330, 420, join)})`}>
            <circle r={90} fill={SK.cream} stroke={SK.ink} strokeWidth={8} />
            {Array.from({ length: 12 }, (_, k) => <line key={k} x1={0} y1={-76} x2={0} y2={-64} stroke={SK.ink} strokeWidth={5} transform={`rotate(${k * 30})`} />)}
            <line x1={0} y1={0} x2={0} y2={-58} stroke={SK.ink} strokeWidth={7} strokeLinecap="round" transform={`rotate(${lt * 60})`} />
            <line x1={0} y1={0} x2={38} y2={0} stroke={SK.ink} strokeWidth={9} strokeLinecap="round" />
          </g>
          <g opacity={out3(lt, cHow, 0.6)}><Cloud x={lerp(1290, 1160, join)} y={lerp(330, 380, join)} s={1.1} dark rain={1} lt={lt} /></g>
        </SVG>
        <Chip text="WHEN" x={960} y={450} lt={lt} at={cWhen} out={cUpset} tone="gold" size={32} />
        <Chip text="HOW MUCH" x={1290} y={450} lt={lt} at={cHow} out={cUpset} tone="gold" size={32} />
        <Big x={800} y={600} w={600} lt={lt} at={cUpset + 0.4} size={46} align="center"><span style={{ color: SK.gold }}>WHEN</span> matters as much as <span style={{ color: SK.gold }}>HOW MUCH</span></Big>
      </Scene>
    );
  };
}
function B11(ctx) {
  return ({ localTime: lt, duration }) => {
    const cUnd = W("b11", "understands"), cPlan = W("b11", "plans"), cAdapt = W("b11", "adapts"), cYou = S("b11", 1), cYOU = W("b11", "you");
    const words = [["Understand", cUnd], ["Plan", cPlan], ["Adapt", cAdapt]];
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[11]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(11, ctx, [L("A GOOD FARMER…", cUnd - 0.5, "head"), L("understands nature", cUnd), L("plans carefully", cPlan), L("adapts to change", cAdapt), L("…and so do YOU!", cYOU, "big")])}>
        <Pic slot="farmer_phone" label="The farmer checks the weather report on a phone" x={40} y={60} w={820} h={560} lt={lt} at={0} out={cAdapt} fx="zoom" />
        <Pic slot="farmer_sows_millet" label="The farmer sows millet as the first clouds arrive" x={40} y={60} w={820} h={560} lt={lt} at={cAdapt} fx="zoom" kenDur={18} />
        <Chip text="checks the sky and the weather report" x={450} y={640} lt={lt} at={0.6} out={cAdapt} size={26} />
        <Chip text="sows millet as the first clouds arrive" x={450} y={640} lt={lt} at={cAdapt + 0.2} tone="gold" size={26} />
        {words.map(([t, at], i) => <div key={t} style={{ position: "absolute", left: 900, top: 100 + i * 160, opacity: pop(lt, at, 0.6) > 0 ? Math.min(1, pop(lt, at, 0.6)) : 0,
          transform: `scale(${0.7 + 0.3 * Math.min(1.1, pop(lt, at, 0.6))})`, transformOrigin: "left center", display: "flex", alignItems: "center", gap: 22 }}>
          <span style={{ width: 70, height: 70, borderRadius: "50%", background: SK.gold, color: SK.ink, fontFamily: SERIF, fontWeight: 700, fontSize: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
          <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 66, color: SK.white, textShadow: "0 3px 14px rgba(0,0,0,0.4)" }}>{t}</span></div>)}
        <Big x={60} y={690} w={1320} lt={lt} at={cYou} size={66} color={SK.gold} align="center">…and now, so do YOU!</Big>
        <StopCard lt={lt} b="b11" />
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
const COLLAGE = [{ slot: "farmer_waits", x: -60, y: -40, w: 760, h: 520, ph: 0 }, { slot: "rainfed_village", x: 640, y: -80, w: 760, h: 520, ph: 2 },
  { slot: "cracked_field", x: -80, y: 520, w: 700, h: 560, ph: 4 }, { slot: "millet_sun", x: 560, y: 560, w: 820, h: 560, ph: 1 }];
function MonsoonScenes(props = {}) {
  const caps = props.showCaptions === "false" ? false : props.showCaptions !== false;
  const titles = {};
  for (let n = 1; n <= NB; n++) titles[n] = str(props["title" + n + "Text"], TITLES[n]);
  const ctx = { caps, titles, capSize: num(props.captionSize, 34) };
  const B = [B1, B2, B3, B4, B5, B6, B7, B8, B9, B10, B11];
  const beats = B.map((Bn, i) => { const t = BEAT("b" + (i + 1)); return [t.start, t.start + t.dur, Bn]; });
  return (
    <StoryFrame props={props} dur={DUR} persistKey="thinkpro-lp6-when-the-monsoon-is-late" collage={COLLAGE}>
      {beats.map(([s, e, Bn], i) => (
        <Sprite key={i} start={s} end={e}>{Bn(ctx)}</Sprite>
      ))}
      {STOPS.map(([b, , , hold]) => <StopAt key={b} t={BEAT(b).start + stopAt(b)} hold={hold - 0.2} />)}
      {["b6", "b9"].map((b) => <ChimeAt key={b} t={BEAT(b).start + S(b, 0, 0)} />)}
      <AudioSync />
    </StoryFrame>
  );
}
window.MonsoonScenes = MonsoonScenes;
