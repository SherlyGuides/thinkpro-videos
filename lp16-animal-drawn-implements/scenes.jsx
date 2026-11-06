/* global React, window */
// ThinkPro Academy — "Animal Drawn Implements" (Grade 6 Agriculture, Session 16, V1).
// After AG_G6_S16 Video Script (Subrata, 4 Nov 2026). Beat ids match the script's scene numbers:
// b1–b7, b9, b10; scene 8, the silent leaf break, is the tail of b7's hold after Stop 3. Four presenter
// stops (TPStory.StopAt). Central model: the FARM YEAR WHEEL (plough → level → water → thresh → transport),
// lit as the bullocks do each job. Drawn here (no engine changes): bullocks, farmer, tractor, yaks, the
// Persian wheel, soil that really turns and levels, threshing floor, bullock cart. STORY STYLE. Pure function of time.
const { Sprite } = window;
const { reveal, windowOp } = window.TPMotion;
const { num, str } = window.TPStage;
const { SK, SERIF, SANS, LEFT_W, pop, out3, lerp, drive,
  Pic, Chip, Big, SVG, ChimeAt, Scene, StoryFrame, StopAt, Break } = window.TPStory;

// ---- Timing: EVERYTHING is keyed to the narration (tools/fit_timing.py → timing.js).
const TM = window.TP_TIMING;
if (!TM) console.error("timing.js missing — run: python3 tools/fit_timing.py videos/lp16-animal-drawn-implements");
const LEAD = TM ? TM.lead : 1.0;
const DUR = TM ? TM.total : 200;
const BEAT = (id) => TM.beats[id];
function W(id, pat, n = 0, lead = 0.25) {
  let c = 0; const q = pat.toLowerCase();
  for (const [w, st] of BEAT(id).words) if (w.toLowerCase().startsWith(q)) { if (c++ === n) return LEAD + st - lead; }
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
const IDS = [1, 2, 3, 4, 5, 6, 7, 9, 10];
const CAPS = {};
if (TM) IDS.forEach((n) => { CAPS[n] = capsFor("b" + n); });
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rnd = (i) => { const x = Math.sin(i * 12.9898 + 4.1) * 43758.5453; return x - Math.floor(x); };
const TAU = Math.PI * 2;
const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mix = (a, b, t) => { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * clamp(t, 0, 1))).join(",")})`; };

// ---- Panel copy. Title defaults mirror the DC data-props (titleNText) — keep in sync. ----
const TITLES = { 1: "LP16 – Animal Drawn Implements", 2: "Still helping many farmers", 3: "Plough and leveller", 4: "Traditional water-lifting",
  5: "After the harvest", 6: "Why animal power?", 7: "Where machines can't go", 9: "WOW! Yaks in the Himalayas", 10: "The answer" };
const KICK = "Grade 6 · Agriculture · Session 16";
const KICKS = { 9: "Wow!" };
const panel = (n, ctx, lines, extra = {}) => ({ kicker: KICKS[n] || KICK, title: ctx.titles[n], lines, ...extra });
const L = (text, at, kind = "item", extra = {}) => ({ text, at, kind, ...extra });

// ---- Presenter stops: [beat, sentence index whose pauseAfter is the hold, hold s, question]
const STOPS = [
  ["b1", 4, 5.0, "Have you ever seen animals working on a farm? What were they doing?"],
  ["b4", 3, 6.0, "What do the plough, the leveller and the Persian wheel each do?"],
  ["b7", 1, 5.0, "Give two reasons a farmer might choose bullocks instead of a tractor."],   // + 2.6 s leaf break
  ["b10", 4, 8.0, null],   // quick check card
];
const QUICK = ["Name three animals that help Indian farmers.", "What does a bullock-drawn plough do?", "How does the Persian wheel lift water?",
  "Give two reasons animal power is still useful.", "Which animal ploughs fields in the Himalayas?"];
const stopAt = (b, i) => SE(b, i) + 0.1;                       // beat-local start of the hold
const stopFor = (b) => STOPS.find((s) => s[0] === b);
// The kit's StopCard is a fixed full-area card; the script freezes ON a picture, so this one takes a box and a heading.
function StopBox({ lt, b, heading = "PAUSE AND DISCUSS", x = 40, y = 60, w = LEFT_W - 80, h = 880, qSize = 58, compact = false, children }) {
  const s = stopFor(b), at = stopAt(b, s[1]), hold = s[2] - 0.2, n = STOPS.indexOf(s) + 1;
  const o = windowOp(lt, at, at + hold + 0.4, 0.35); if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 26, background: "rgba(5,30,22,0.92)", opacity: o, zIndex: 4,
      boxShadow: "0 0 0 3px rgba(226,176,76,0.9)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: compact ? "18px 40px" : 44, boxSizing: "border-box", textAlign: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <svg width={compact ? 46 : 64} height={compact ? 46 : 64} viewBox="0 0 90 90"><circle cx="45" cy="45" r="43" fill={SK.gold} /><rect x="28" y="24" width="12" height="42" rx="4" fill={SK.ink} /><rect x="50" y="24" width="12" height="42" rx="4" fill={SK.ink} /></svg>
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: compact ? 26 : 32, letterSpacing: "0.08em", color: SK.ink, background: SK.gold, padding: compact ? "6px 22px" : "10px 30px", borderRadius: 14, whiteSpace: "nowrap" }}>{heading}</div>
      </div>
      {s[3] && <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: qSize, lineHeight: 1.18, color: SK.white, marginTop: compact ? 16 : 36, maxWidth: w - 60 }}>{s[3]}</div>}
      {children}
      <div style={{ fontFamily: SANS, fontSize: compact ? 22 : 26, color: SK.dim, marginTop: compact ? 10 : 30 }}>Stop {n} of {STOPS.length}</div>
    </div>
  );
}

// ---- The illustrated stage -------------------------------------------------------
const SX = 40, SY = 40, SW = 1360, SH = 910;
function Tree({ x, y, s = 1, c = "#4F8A58" }) {
  return <g transform={`translate(${x} ${y}) scale(${s})`}><rect x={-9} y={-90} width={18} height={92} fill="#6B4A32" />
    <circle cx={0} cy={-130} r={62} fill={c} /><circle cx={-46} cy={-100} r={42} fill={c} /><circle cx={46} cy={-102} r={44} fill={c} /></g>;
}
// Sky, far hills, land; `gy` = the front edge of the land, below it a cut through the soil.
function Yard({ id, op = 1, horizon = 560, gy = null, sky = "#CDE6E2", land = "#AEBF74", soil = "#7A5B3E", hills = ["#9CC0AC", "#7FA890"], sun = true, trees = true, children }) {
  if (op <= 0) return null;
  const h = horizon;
  return (
    <SVG op={op}>
      <defs><clipPath id={id}><rect x={SX} y={SY} width={SW} height={SH} rx={18} /></clipPath></defs>
      <g clipPath={`url(#${id})`}>
        <rect x={SX} y={SY} width={SW} height={SH} fill={sky} />
        {sun && <circle cx={210} cy={150} r={58} fill="#F6E3A1" />}
        <path d={`M40 ${h} L40 ${h - 90} C 200 ${h - 170}, 340 ${h - 60}, 520 ${h - 110} C 700 ${h - 170}, 860 ${h - 70}, 1040 ${h - 120} C 1200 ${h - 160}, 1300 ${h - 90}, 1400 ${h - 110} L1400 ${h} Z`} fill={hills[0]} />
        <path d={`M40 ${h} L40 ${h - 40} C 260 ${h - 90}, 480 ${h - 30}, 700 ${h - 56} C 940 ${h - 90}, 1160 ${h - 30}, 1400 ${h - 60} L1400 ${h} Z`} fill={hills[1]} />
        {trees && <><Tree x={120} y={h + 6} s={0.8} /><Tree x={640} y={h + 4} s={0.6} c="#5C9A66" /><Tree x={1330} y={h + 6} s={0.75} /></>}
        <rect x={SX} y={h} width={SW} height={SH} fill={land} />
        {gy != null && <rect x={SX} y={gy} width={SW} height={SH} fill={soil} />}
        {children}
      </g>
      <rect x={SX} y={SY} width={SW} height={SH} rx={18} stroke="rgba(255,255,255,0.55)" strokeWidth={3} />
    </SVG>
  );
}

// ---- Characters (flat, side view, facing right; origin between the feet) -------------
function Leg({ hx, hy, ph, walk, l1, l2, w, color, hoof = "#2A211B" }) {
  const sw = Math.sin(TAU * ph), lift = Math.max(0, Math.cos(TAU * ph));
  const a = 0.42 * walk * sw, k = 0.95 * walk * lift;
  const kx = hx + l1 * Math.sin(a), ky = hy + l1 * Math.cos(a);
  const fx = kx + l2 * Math.sin(a - k), fy = ky + l2 * Math.cos(a - k);
  return <g><path d={`M${hx} ${hy} L${kx} ${ky} L${fx} ${fy}`} stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <rect x={fx - w * 0.62} y={fy - 3} width={w * 1.3} height={9} rx={2} fill={hoof} transform={`rotate(${(-(a - k) * 180) / Math.PI} ${fx} ${fy})`} /></g>;
}
function Bullock({ x, y, s = 1, sx = null, ph = 0, walk = 1, coat = "#EEE6D6", shade = "#CFC4AE", dark = "#6B5A4A", op = 1, bell = true, chew = 0 }) {
  const K = sx != null ? sx : s, nod = 2.2 * Math.sin(TAU * ph * 2) * walk, swing = 9 * Math.sin(TAU * ph) * Math.min(1, walk + 0.3);
  return (
    <g transform={`translate(${x} ${y}) scale(${K} ${s})`} opacity={op}>
      <Leg hx={-78} hy={-96} ph={ph + 0.5} walk={walk} l1={48} l2={50} w={15} color={shade} />
      <Leg hx={92} hy={-92} ph={ph + 0.75} walk={walk} l1={46} l2={48} w={14} color={shade} />
      <path d="M-104 -146 C -124 -120, -122 -96, -118 -62" stroke={coat} strokeWidth={5} fill="none" strokeLinecap="round" />
      <path d="M-118 -66 q -7 16 0 28 q 8 -12 0 -28 Z" fill={dark} />
      <path d="M-106 -118 C -110 -150 -86 -162 -52 -160 L 30 -158 C 38 -192 76 -196 84 -160 C 100 -154 124 -138 128 -116 C 132 -92 116 -78 96 -76 C 50 -70 -10 -72 -50 -80 C -86 -84 -104 -94 -106 -118 Z" fill={coat} />
      <path d="M36 -158 C 44 -190 74 -192 82 -160 C 66 -168 50 -168 36 -158 Z" fill={shade} />
      <path d="M100 -118 C 112 -92 112 -70 100 -58 C 92 -66 90 -80 94 -96 Z" fill={shade} />
      <Leg hx={-78} hy={-96} ph={ph} walk={walk} l1={48} l2={50} w={16} color={coat} />
      <Leg hx={92} hy={-92} ph={ph + 0.25} walk={walk} l1={46} l2={48} w={15} color={coat} />
      <g transform={`rotate(${nod + 4 * Math.sin(chew * 12)} 118 -142)`}>
        <path d="M96 -156 C 120 -176 146 -186 170 -182 C 196 -176 216 -154 222 -136 C 226 -124 214 -116 202 -120 C 186 -126 170 -130 150 -126 C 132 -118 112 -112 100 -120 Z" fill={coat} />
        <path d="M204 -146 C 216 -146 224 -138 222 -130 C 220 -120 208 -118 200 -122 C 198 -130 198 -140 204 -146 Z" fill={dark} />
        <path d="M152 -180 C 142 -200 146 -222 164 -236" stroke={dark} strokeWidth={8} strokeLinecap="round" fill="none" />
        <path d="M168 -182 C 170 -202 178 -216 194 -226" stroke={dark} strokeWidth={8} strokeLinecap="round" fill="none" />
        <path d="M146 -172 C 130 -184 118 -184 112 -176 C 122 -166 136 -164 146 -166 Z" fill={shade} />
        <circle cx={176} cy={-162} r={4.6} fill="#231A14" />
      </g>
      {bell && <g transform={`rotate(${swing} 118 -112)`}><path d="M118 -112 L118 -92" stroke="#7A4A22" strokeWidth={3} /><path d="M108 -74 C 108 -92 128 -92 128 -74 Z" fill={SK.gold} /><circle cx={118} cy={-72} r={3.4} fill={SK.goldDeep} /></g>}
    </g>
  );
}
// Two yoked bullocks. hitch = where the pole or rope ties on (returned by hitchOf).
function Team({ x, y, s = 1, ph = 0, walk = 1, flip = false }) {
  const d = flip ? -1 : 1;
  return (
    <g>
      <Bullock x={x + 34 * s * d} y={y - 16 * s} s={s * 0.96} sx={s * 0.96 * d} ph={ph + 0.37} walk={walk} coat="#C89B6C" shade="#A97E52" bell={false} />
      <path d={`M${x + 96 * s * d} ${y - 178 * s} L${x + 176 * s * d} ${y - 190 * s}`} stroke="#6E4A2A" strokeWidth={13 * s} strokeLinecap="round" />
      <Bullock x={x} y={y} s={s} sx={s * d} ph={ph} walk={walk} />
    </g>
  );
}
const hitchOf = (x, y, s) => [x + 110 * s, y - 176 * s];
function Farmer({ x, y, s = 1, flip = false, ph = 0, walk = 0, arm = 0.7, arm2 = null, shake = 0, lean = 0, shirt = "#F5F0E2", cloth = "#E9E1CE", turban = "#E8922E", skin = "#8A5A3C", op = 1 }) {
  const a2 = arm2 != null ? arm2 : arm;
  const armEnd = (A, L = 70) => `M4 -176 L${4 + L * 0.52 * Math.sin(A)} ${-176 + L * 0.52 * Math.cos(A)} L${4 + L * Math.sin(A + 0.25)} ${-176 + L * Math.cos(A + 0.25)}`;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} opacity={op}>
      <Leg hx={0} hy={-104} ph={ph + 0.5} walk={walk} l1={54} l2={52} w={13} color={skin} hoof="#3B2B20" />
      <Leg hx={0} hy={-104} ph={ph} walk={walk} l1={54} l2={52} w={14} color={skin} hoof="#3B2B20" />
      <g transform={`rotate(${lean} 0 -104)`}>
        <path d={`M-24 -128 L24 -128 L${26 + 10 * Math.sin(TAU * ph) * walk} -52 L${-26 + 10 * Math.sin(TAU * ph) * walk} -52 Z`} fill={cloth} />
        <path d={armEnd(a2)} stroke={skin} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.85} />
        <path d="M-26 -192 Q 0 -202 26 -192 L 30 -112 L -30 -112 Z" fill={shirt} />
        <g transform={`translate(${shake} 0)`}>
          <rect x={-7} y={-206} width={14} height={16} fill={skin} />
          <circle cx={3} cy={-220} r={21} fill={skin} />
          <path d="M6 -212 q 8 3 14 -1" stroke="#2A1D14" strokeWidth={4} strokeLinecap="round" fill="none" />
          <circle cx={13} cy={-223} r={2.8} fill="#1A120C" />
          <path d="M-20 -228 C -18 -252 22 -254 26 -230 C 12 -238 -6 -238 -20 -228 Z" fill={turban} />
          <path d="M-20 -228 q -10 8 -8 18" stroke={turban} strokeWidth={8} strokeLinecap="round" fill="none" />
        </g>
        <path d={armEnd(arm)} stroke={skin} strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
    </g>
  );
}
function Wheel({ cx, cy, r, spin, c = "#23211F", hub = "#E5B53A" }) {
  return <g transform={`translate(${cx} ${cy})`}><circle r={r} fill={c} /><circle r={r * 0.56} fill={hub} /><circle r={r * 0.2} fill="#8E2B20" />
    <g transform={`rotate(${spin * 57.3})`}>{Array.from({ length: 12 }, (_, i) => <rect key={i} x={-r * 0.07} y={-r - 4} width={r * 0.14} height={r * 0.18} fill="#3B3734" transform={`rotate(${i * 30})`} />)}
      {[0, 60, 120].map((d) => <rect key={d} x={-r * 0.54} y={-3} width={r * 1.08} height={6} fill="#B98E22" transform={`rotate(${d})`} />)}</g></g>;
}
function Tractor({ x, y, s = 1, spin = 0, tilt = 0, flip = false, op = 1, driver = false }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${flip ? -s : s} ${s})`} opacity={op}>
      <path d="M-40 -170 L-120 -170 L-136 -262 L-20 -262 L-20 -240" stroke="#2C2A28" strokeWidth={9} fill="none" strokeLinejoin="round" />
      <rect x={-146} y={-272} width={140} height={14} rx={6} fill="#2C2A28" />
      <path d="M-36 -176 L196 -176 Q 226 -176 226 -146 L226 -96 L-36 -96 Z" fill="#C6352B" />
      <rect x={-36} y={-132} width={262} height={10} fill="#E5B53A" />
      <rect x={150} y={-168} width={66} height={28} rx={5} fill="#231F1E" />
      <rect x={110} y={-232} width={14} height={60} rx={5} fill="#3B3734" />
      <rect x={-50} y={-100} width={210} height={34} fill="#3B3734" />
      <Wheel cx={-70} cy={-92} r={92} spin={spin} />
      <Wheel cx={160} cy={-50} r={50} spin={spin * 1.8} />
    </g>
  );
}
function Tag({ x, y, w = 200, h = 110, text = "₹₹₹₹₹", swing = 0, lt = 0, at = 0, out = null, size = 54 }) {
  const o = pop(lt, at) * (out != null ? 1 - reveal(lt, out, 0.4) : 1); if (o <= 0) return null;
  return <g transform={`translate(${x} ${y}) rotate(${swing}) scale(${o})`}>
    <path d={`M0 0 L0 34`} stroke={SK.ink} strokeWidth={3} />
    <path d={`M${-w / 2 + 34} 34 L${w / 2 - 34} 34 L${w / 2} 70 L${w / 2} ${34 + h} L${-w / 2} ${34 + h} L${-w / 2} 70 Z`} fill={SK.gold} stroke={SK.goldDeep} strokeWidth={4} />
    <circle cx={0} cy={52} r={8} fill={SK.cream} stroke={SK.goldDeep} strokeWidth={3} />
    <text x={0} y={34 + h - 20} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={size} fill={SK.ink}>{text}</text>
  </g>;
}
function Flag({ text, x, y, lt, at, out = null, size = 26, tone = "#B3261E", fg = SK.white }) {
  const o = pop(lt, at) * (out != null ? 1 - reveal(lt, out, 0.4) : 1); if (o <= 0) return null;
  return <div style={{ position: "absolute", left: x, top: y, transform: `translateX(-50%) scale(${0.9 + 0.1 * o})`, transformOrigin: "center top", opacity: o, fontFamily: SANS, fontWeight: 700,
    fontSize: size, color: fg, background: tone, padding: "6px 18px", borderRadius: 999, whiteSpace: "nowrap", boxShadow: "0 2px 10px rgba(0,0,0,0.25)" }}>{text}</div>;
}

// ---- The farm year wheel --------------------------------------------------------------
const STEPS = ["Plough", "Level", "Water", "Thresh", "Transport"];
const WC = { cx: 1235, cy: 178, r: 142 };   // its corner home on the stage
function FarmWheel({ cx = WC.cx, cy = WC.cy, r = WC.r, lit = [], cur = -1, lt = 0, op = 1, style, spinIn = 1 }) {
  if (op <= 0) return null;
  const arc = (i, r0, r1) => { const a = ((i * 72 - 90 - 36 + 1.6) * Math.PI) / 180, b = ((i * 72 - 90 + 36 - 1.6) * Math.PI) / 180;
    const P = (R, A) => `${cx + R * Math.cos(A)} ${cy + R * Math.sin(A)}`;
    return `M${P(r0, a)} L${P(r1, a)} A${r1} ${r1} 0 0 1 ${P(r1, b)} L${P(r0, b)} A${r0} ${r0} 0 0 0 ${P(r0, a)} Z`; };
  const pulse = 0.5 + 0.5 * Math.sin(lt * 5);
  return (
    <SVG op={op} style={style}>
      <g transform={`translate(${cx} ${cy}) scale(${spinIn}) translate(${-cx} ${-cy})`}>
        <circle cx={cx} cy={cy} r={r + 8} fill="rgba(5,30,22,0.9)" />
        {STEPS.map((t, i) => { const v = clamp(lit[i] || 0, 0, 1), a = ((i * 72 - 90) * Math.PI) / 180, R = r * 0.66, on = v > 0.5;
          return <g key={t}>
            <path d={arc(i, r * 0.36, r)} fill={mix("#2C5E49", "#E2B04C", v)} stroke={i === cur ? SK.white : "none"} strokeWidth={i === cur ? 3 + 3 * pulse : 0} />
            <text x={cx + R * Math.cos(a)} y={cy + R * Math.sin(a) + r * 0.055} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={r * 0.158} fill={on ? SK.ink : "rgba(255,255,255,0.78)"}>{t}</text>
          </g>; })}
        <circle cx={cx} cy={cy} r={r * 0.32} fill={SK.cream} />
        <text x={cx} y={cy - r * 0.02} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={r * 0.14} fill={SK.ink}>Farm</text>
        <text x={cx} y={cy + r * 0.14} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={r * 0.14} fill={SK.ink}>year</text>
      </g>
    </SVG>
  );
}

// ---- Soil that really turns and levels (b3, b7) --------------------------------------------
function Soil({ lt, gy, px, lx, depth = 56, floor = 950, wet = 0 }) {
  const X = []; for (let x = 40; x <= 1400; x += 8) X.push(x);
  const top = (x) => { if (x < lx) return gy; if (x < px) return gy - 4 + 11 * Math.sin(x / 23) + 4 * Math.sin(x / 9); return gy + 2 * Math.sin(x / 41) + 1.5 * Math.sin(x / 13); };
  const line = X.map((x) => `${x} ${top(x).toFixed(1)}`).join(" L");
  const loosen = Math.min(px, 1400);
  const dark = X.filter((x) => x <= loosen);
  return (
    <g>
      <path d={`M40 ${floor} L${line} L1400 ${floor} Z`} fill="#A98A63" />
      {Array.from({ length: 26 }, (_, i) => <circle key={i} cx={60 + rnd(i) * 1320} cy={gy + 90 + rnd(i + 40) * 110} r={3 + rnd(i + 9) * 7} fill="#8F7250" />)}
      {dark.length > 1 && <path d={`M40 ${gy + depth + 10} L40 ${gy} L${dark.map((x) => `${x} ${top(x).toFixed(1)}`).join(" L")} L${dark[dark.length - 1]} ${gy + depth + 10} Z`} fill="#4E3828" />}
      {wet > 0 && <path d={`M40 ${gy - 7} L${40 + 1360 * wet} ${gy - 7} L${40 + 1360 * wet + 26} ${gy} L40 ${gy} Z`} fill="#6FB8E0" />}
    </g>
  );
}
function Clods({ lt, x, y, on }) {
  if (on <= 0) return null;
  return <g opacity={on}>{Array.from({ length: 7 }, (_, i) => { const p = (lt * 2.6 + i / 7) % 1; const dx = -12 - 70 * p, dy = -44 * Math.sin(Math.PI * p);
    return <circle key={i} cx={x + dx} cy={y + dy} r={4 + (i % 3) * 2} fill="#4E3828" />; })}</g>;
}
function PloughTool({ x, y, s = 1, hx, hy }) {
  return <g>
    <path d={`M${x} ${y - 24 * s} L${hx} ${hy}`} stroke="#6E4A2A" strokeWidth={11 * s} strokeLinecap="round" />
    <path d={`M${x + 6 * s} ${y - 40 * s} L${x - 2 * s} ${y + 26 * s}`} stroke="#6E4A2A" strokeWidth={15 * s} strokeLinecap="round" />
    <path d={`M${x - 8 * s} ${y + 18 * s} L${x + 44 * s} ${y + 40 * s} L${x - 2 * s} ${y + 40 * s} Z`} fill="#4A4F55" />
    <path d={`M${x + 4 * s} ${y - 30 * s} L${x - 72 * s} ${y - 118 * s}`} stroke="#6E4A2A" strokeWidth={10 * s} strokeLinecap="round" />
  </g>;
}
function Spray({ lt, x, y, on, n = 8, c = "#6E5236" }) {
  if (on <= 0) return null;
  return <g opacity={on}>{Array.from({ length: n }, (_, i) => { const p = (lt * 2.4 + i / n) % 1, a = -2.4 + rnd(i) * 1.6, d = 30 + 110 * p;
    return <circle key={i} cx={x + Math.cos(a) * d} cy={y + Math.sin(a) * d + 90 * p * p} r={4 + (i % 3) * 2.2} fill={c} />; })}</g>;
}

// ---- A walker on a circular path, seen from the side (Persian wheel, threshing floor) ----
function roundPos(th, cx, cy, rx, ry, s) {
  const sn = Math.sin(th), dir = -sn < 0 ? -1 : 1;           // moving left along the front, right along the back
  const depth = 0.84 + 0.16 * ((sn + 1) / 2), K = s * depth;
  return { x: cx + rx * Math.cos(th), y: cy + ry * sn, K, sx: dir * K * (0.5 + 0.5 * Math.abs(sn)), front: sn > 0 };
}

// ---- The Persian wheel -----------------------------------------------------------------
const PW = { hx: 300, wy: 606, rx: 268, ry: 42, axY: 516, gx: 466, gr: 66, cx: 930, R: 100, by: 836, water: 836, N: 15 };
function chainAt(u) {
  const { cx, axY: cy, R, by } = PW, H = by - cy, A = Math.PI * R, L = 2 * H + 2 * A;
  let d = ((u % 1) + 1) % 1 * L;
  if (d < H) return { x: cx - R, y: by - d, rot: 0, part: "up" };
  d -= H;
  if (d < A) { const a = Math.PI - d / R; return { x: cx + R * Math.cos(a), y: cy - R * Math.sin(a), rot: ((Math.PI - a) * 180) / Math.PI, part: "top" }; }
  d -= A;
  if (d < H) return { x: cx + R, y: cy + d, rot: 180, part: "down" };
  d -= H;
  const a = -d / R; return { x: cx + R * Math.cos(a), y: by - R * Math.sin(a), rot: 180 - (a * 180) / Math.PI, part: "low" };
}
function Pot({ x, y, rot, full }) {
  return <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <path d="M-15 -12 L15 -12 C 19 2 14 18 0 20 C -14 18 -19 2 -15 -12 Z" fill="#B5623A" stroke="#7E3F22" strokeWidth={2.5} />
    <rect x={-17} y={-16} width={34} height={7} rx={3} fill="#8E4A2A" />
    {full > 0 && <ellipse cx={0} cy={-17} rx={15} ry={6} fill="#7FD3F7" opacity={full} />}
  </g>;
}
function PersianWheel({ lt, walkAt, chainOn, fullAt, pourAt, chanAt, cropAt }) {
  const { hx, wy, rx, ry, axY, gx, gr, cx, R, by, water, N } = PW;
  const t = Math.max(0, lt - walkAt), v = Math.min(1, t / 1.2), th = 0.5 + 0.55 * (t - 0.6 * (1 - v));
  const ang = 1.15 * Math.max(0, t - 0.5), u = (ang * R) / (2 * (by - axY) + TAU * R) * 1;
  const b = roundPos(th, hx, wy, rx, ry, 0.72), ph = t * 1.05;
  const beam = <path d={`M${hx} ${axY - 30} L${b.x} ${b.y - 118 * b.K}`} stroke="#6E4A2A" strokeWidth={12} strokeLinecap="round" />;
  const ox = <Bullock x={b.x} y={b.y} s={b.K} sx={b.sx} ph={ph} walk={v} />;
  const pegs = Array.from({ length: 12 }, (_, i) => { const a = th + (i * TAU) / 12; return { x: hx + 96 * Math.cos(a), y: axY + 24 + 20 * Math.sin(a), f: Math.sin(a) > 0 }; });
  const chan = drive(lt, chanAt, chanAt + 2.4), crop = out3(lt, cropAt, 1.0), pour = out3(lt, pourAt, 0.4);
  const pts = Array.from({ length: 60 }, (_, i) => { const p = chainAt(i / 60 + u); return `${p.x.toFixed(1)} ${p.y.toFixed(1)}`; });
  const pots = Array.from({ length: N }, (_, i) => ({ ...chainAt(i / N + u), i }));
  return (
    <g>
      {/* crops + the channel */}
      {Array.from({ length: 11 }, (_, i) => { const x = 1160 + i * 23, g = out3(lt, cropAt + i * 0.08, 0.7); return <g key={i} transform={`translate(${x} 588)`}>
        <path d="M0 0 C -2 -14 -8 -24 -16 -30 M0 0 C 2 -18 10 -30 18 -36 M0 0 L1 -44" stroke={mix("#A5A35E", "#3E9B4F", g)} strokeWidth={6} strokeLinecap="round" fill="none" /></g>; })}
      <ellipse cx={hx} cy={wy} rx={rx + 44} ry={ry + 18} fill="#B99F6C" />
      <ellipse cx={hx} cy={wy} rx={rx - 40} ry={ry - 14} fill="#AEBF74" />
      {/* the well: mouth, shaft, water */}
      <rect x={796} y={650} width={268} height={300} fill="#3A2C22" />
      <rect x={796} y={water} width={268} height={120} fill="#3E86B4" />
      <path d={`M796 ${water} q 34 ${5 * Math.sin(lt * 3)} 67 0 t 67 0 t 67 0 t 67 0`} stroke="#9AD9F5" strokeWidth={3} fill="none" />
      <rect x={784} y={650} width={12} height={300} fill="#94908A" /><rect x={1064} y={650} width={12} height={300} fill="#94908A" />
      <ellipse cx={930} cy={622} rx={150} ry={32} fill="#94908A" /><ellipse cx={930} cy={622} rx={134} ry={25} fill="#3A2C22" />
      {!b.front && <g>{beam}{ox}</g>}
      {/* hub, gears, axle */}
      {pegs.filter((p) => !p.f).map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={7} fill="#4F341F" />)}
      <rect x={hx - 13} y={axY - 40} width={26} height={wy - axY + 44} fill="#7B5532" />
      <ellipse cx={hx} cy={axY + 24} rx={100} ry={24} fill="#8E6238" stroke="#5E3F22" strokeWidth={4} />
      {pegs.filter((p) => p.f).map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={7} fill="#4F341F" />)}
      <rect x={gx} y={axY - 8} width={cx - gx} height={16} fill="#6E4A2A" />
      <g transform={`translate(${gx} ${axY}) rotate(${(ang * 180) / Math.PI})`}>
        {Array.from({ length: 14 }, (_, i) => <rect key={i} x={-7} y={-gr - 10} width={14} height={16} fill="#5E3F22" transform={`rotate(${(i * 360) / 14})`} />)}
        <circle r={gr} fill="#A97C4A" stroke="#5E3F22" strokeWidth={5} /><circle r={gr * 0.32} fill="#5E3F22" />
        {[0, 45, 90, 135].map((d) => <rect key={d} x={-gr} y={-4} width={gr * 2} height={8} fill="#6E4A2A" transform={`rotate(${d})`} />)}
      </g>
      <path d={`M${cx - 142} 660 L${cx - 40} ${axY} M${cx + 142} 660 L${cx + 40} ${axY}`} stroke="#6E4A2A" strokeWidth={15} strokeLinecap="round" opacity={0.85} />
      <g transform={`translate(${cx} ${axY}) rotate(${(ang * 180) / Math.PI})`}>
        <circle r={R} stroke="#7B5532" strokeWidth={15} fill="none" />
        {[0, 36, 72, 108, 144].map((d) => <rect key={d} x={-R} y={-5} width={R * 2} height={10} fill="#8E6238" transform={`rotate(${d})`} />)}
        <circle r={22} fill="#5E3F22" />
      </g>
      {/* chain + pots */}
      <path d={`M${pts.join(" L")} Z`} stroke="#3B3734" strokeWidth={3.5} fill="none" strokeDasharray="9 6" />
      {pots.map((p) => { const carry = p.part === "up" || (p.part === "top" && p.rot < 118); return <Pot key={p.i} x={p.x} y={p.y} rot={p.rot} full={carry && lt > fullAt ? clamp((lt - fullAt) * 2, 0, 1) : 0} />; })}
      {/* streams into the trough */}
      {pots.filter((p) => p.part === "top" && p.rot > 82 && p.rot < 128).map((p) => { const f = Math.sin(((p.rot - 82) / 46) * Math.PI);
        return <path key={p.i} d={`M${p.x + 14} ${p.y + 6} q 10 18 8 ${566 - p.y}`} stroke="#7FD3F7" strokeWidth={7 * f} strokeLinecap="round" fill="none" opacity={pour} />; })}
      {/* trough + channel */}
      <path d="M906 570 L1130 586 L1130 610 L906 594 Z" fill="#8F8A80" />
      <path d={`M914 574 L${914 + 216 * pour} ${574 + 15 * pour} L${914 + 216 * pour} ${586 + 15 * pour} L914 586 Z`} fill="#6FC4EE" opacity={pour} />
      <rect x={1130} y={598} width={270} height={20} fill="#6B5236" />
      <rect x={1130} y={601} width={270 * chan} height={14} fill="#6FC4EE" />
      {b.front && <g>{beam}{ox}</g>}
    </g>
  );
}

// ---- Bullock cart ------------------------------------------------------------------------
function Sack({ x, y, w = 74, h = 50, rot = 0 }) {
  return <g transform={`translate(${x} ${y}) rotate(${rot})`}><rect x={-w / 2} y={-h / 2} width={w} height={h} rx={16} fill="#D9BE8C" stroke="#A98A55" strokeWidth={3} />
    <path d={`M${-w / 2 + 6} ${-h / 2 + 10} q ${w / 2 - 6} 10 ${w - 12} 0`} stroke="#A98A55" strokeWidth={3} fill="none" /></g>;
}
function Cart({ x, y, s = 1, spin = 0, sway = 0, load = 1, team = true, ph = 0, walk = 1 }) {
  const wr = 84;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {team && <Team x={300} y={0} s={0.86} ph={ph} walk={walk} />}
      {team && <path d={`M60 -128 L${300 + 96} -150`} stroke="#6E4A2A" strokeWidth={12} strokeLinecap="round" />}
      <g transform={`translate(0 ${sway}) rotate(${sway * 0.25})`}>
        <path d="M-170 -118 L120 -118 L104 -92 L-154 -92 Z" fill="#8E6238" />
        {[-150, -60, 40, 110].map((vx) => <rect key={vx} x={vx} y={-178} width={9} height={60} fill="#6E4A2A" />)}
        <rect x={-170} y={-182} width={292} height={9} fill="#6E4A2A" />
        {load > 0 && [[-112, -146], [-34, -146], [46, -146], [-74, -194], [4, -194], [-36, -240]].map(([sxx, syy], i) => i < load * 6 ? <Sack key={i} x={sxx} y={syy} rot={(i % 2 ? 1 : -1) * 2} /> : null)}
      </g>
      <g transform={`translate(0 ${-wr}) rotate(${spin * 57.3})`}>
        <circle r={wr} stroke="#5E3F22" strokeWidth={12} fill="none" />
        {[0, 30, 60, 90, 120, 150].map((d) => <rect key={d} x={-wr} y={-4} width={wr * 2} height={8} fill="#7B5532" transform={`rotate(${d})`} />)}
        <circle r={16} fill="#3B2B20" />
      </g>
    </g>
  );
}
function Store({ x, y, s = 1, open = 1 }) {
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-120} y={-160} width={240} height={160} fill="#C99D6B" />
    <path d="M-158 -150 L0 -262 L158 -150 Z" fill="#B58B3E" stroke="#8F6A28" strokeWidth={5} />
    <rect x={-46} y={-118} width={92} height={118} fill="#3B2B20" />
    <rect x={-46 - 88 * open} y={-118} width={88 * open + 1} height={118} fill="#7B5532" />
    <text x={0} y={-168} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={32} fill={SK.ink}>STORE</text>
  </g>;
}

// ---- Yak ---------------------------------------------------------------------------------
function Yak({ x, y, s = 1, sx = null, ph = 0, walk = 1, load = false }) {
  const K = sx != null ? sx : s, coat = "#2B2522", hair = "#3C3430";
  const fringe = Array.from({ length: 13 }, (_, i) => { const px = -112 + i * 19, sway = 5 * Math.sin(TAU * ph + i); return `L${px + 8 + sway} ${-44 - (i % 2) * 8} L${px + 18} -82`; }).join(" ");
  return (
    <g transform={`translate(${x} ${y}) scale(${K} ${s})`}>
      <Leg hx={-74} hy={-84} ph={ph + 0.5} walk={walk} l1={40} l2={42} w={18} color="#1F1A18" />
      <Leg hx={84} hy={-84} ph={ph + 0.75} walk={walk} l1={40} l2={42} w={18} color="#1F1A18" />
      <path d="M-112 -142 C -128 -110 -128 -84 -120 -56 C -112 -74 -108 -100 -108 -124 Z" fill={hair} />
      <Leg hx={-74} hy={-84} ph={ph} walk={walk} l1={40} l2={42} w={20} color={coat} />
      <Leg hx={84} hy={-84} ph={ph + 0.25} walk={walk} l1={40} l2={42} w={20} color={coat} />
      <path d={`M-114 -120 C -116 -156 -86 -170 -40 -168 C 0 -172 28 -206 66 -198 C 100 -190 118 -160 130 -126 C 132 -104 124 -90 112 -82 ${fringe} Z`} fill={coat} />
      <path d="M-80 -150 q 12 40 2 74 M-40 -156 q 10 44 2 78 M0 -164 q 8 46 2 84 M44 -180 q 10 50 2 96 M84 -170 q 8 40 0 84" stroke="#4A413B" strokeWidth={4} fill="none" strokeLinecap="round" />
      {load && <g><Sack x={-30} y={-186} w={110} h={58} rot={-3} /><path d="M-30 -160 L-30 -100" stroke="#A9352B" strokeWidth={9} /></g>}
      <path d="M110 -160 C 138 -170 170 -166 186 -144 C 198 -128 196 -112 182 -106 C 164 -102 146 -106 126 -100 C 108 -104 100 -130 110 -160 Z" fill={coat} />
      <path d="M176 -128 C 192 -130 200 -118 192 -108 C 184 -102 172 -104 168 -108 C 168 -118 170 -126 176 -128 Z" fill="#6E6158" />
      <path d="M124 -160 C 112 -186 124 -206 148 -208" stroke="#D9D0BF" strokeWidth={8} strokeLinecap="round" fill="none" />
      <path d="M142 -160 C 136 -182 148 -196 168 -194" stroke="#D9D0BF" strokeWidth={8} strokeLinecap="round" fill="none" />
      <path d="M124 -100 l 8 26 l 10 -18 l 10 20 l 8 -24 Z" fill={hair} />
      <circle cx={160} cy={-144} r={4.4} fill="#E8E0D0" />
    </g>
  );
}
const MAP = window.LP5_MAP;
if (!MAP) console.error("india-map.js missing");
const proj = (lon, lat) => [(lon - MAP.lon0) * MAP.k * MAP.cos, (MAP.lat0 - lat) * MAP.k];

// ============================================================================
// Beats
function B1(ctx) {
  return ({ localTime: lt, duration }) => {
    const cListen = S("b1", 0, 0.1), cBells = W("b1", "bells"), cLong = S("b1", 2), cBull = W("b1", "BULLOCKS"), cBuff = W("b1", "BUFFALOES"), cCam = W("b1", "CAMELS"),
      cToday = S("b1", 3), cWhy = S("b1", 4), cStill = W("b1", "STILL");
    const ring = out3(lt, cListen, 0.4) * (1 - reveal(lt, cLong, 0.5));
    const trio = [["hero_plough", "Bullocks", cBull], ["buffalo_work", "Buffaloes", cBuff], ["camel_work", "Camels", cCam]];
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[1]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(1, ctx, [L("BIG QUESTION", cWhy, "head"), L("In the age of tractors, why do many farmers still work with animals?", cWhy + 0.1, "big")])}>
        <Pic slot="dawn_bullocks" label="Early morning: a farmer leads two bullocks out of the shed" x={40} y={40} w={1360} h={910} lt={lt} at={0.1} out={cLong} fx="zoom" zoom={1.1} kenDur={10} />
        <SVG op={ring}>
          <g transform="translate(720 560)">
            {[0, 1, 2].map((i) => { const p = (lt * 0.7 + i / 3) % 1; return <circle key={i} r={70 + p * 210} stroke={SK.gold} strokeWidth={6} opacity={(1 - p) * 0.8} />; })}
            <g transform={`rotate(${16 * Math.sin(lt * 7)})`}><path d="M0 -70 L0 -44" stroke="#7A4A22" strokeWidth={8} />
              <path d="M-58 40 C -58 -66 58 -66 58 40 Z" fill={SK.gold} stroke={SK.goldDeep} strokeWidth={5} /><rect x={-66} y={34} width={132} height={14} rx={6} fill={SK.goldDeep} /></g>
            <g transform={`rotate(${-22 * Math.sin(lt * 7)} 0 -30)`}><circle cx={0} cy={60} r={14} fill={SK.goldDeep} /></g>
          </g>
        </SVG>
        {trio.map(([slot, lab, at], i) => <React.Fragment key={slot}>
          <Pic slot={slot} label={lab} x={40 + i * 460} y={160} w={440} h={780} lt={lt} at={at} out={cToday} fx="pop" />
          <Chip text={lab} x={260 + i * 460} y={870} lt={lt} at={at + 0.2} out={cToday} size={32} />
        </React.Fragment>)}
        <Big x={40} w={1360} y={70} size={54} align="center" lt={lt} at={cLong} out={cToday}>Long before tractors…</Big>
        <Pic slot="hero_plough" label="Bullocks at work" x={40} y={60} w={670} h={420} lt={lt} at={cToday} fx="zoom" />
        <Pic slot="tractor_waits" label="A tractor waits in a big field" x={730} y={60} w={670} h={420} lt={lt} at={cToday + 0.2} fx="zoom" />
        <Chip text="still at work" x={375} y={500 - 80} lt={lt} at={cStill} size={28} tone="gold" />
        <Chip text="today" x={1065} y={420} lt={lt} at={cToday + 0.4} size={28} />
        <Big x={40} w={1360} y={620} size={60} align="center" lt={lt} at={cToday + 0.2} out={cWhy}>Today we have tractors.</Big>
        <Big x={40} w={1360} y={590} size={60} align="center" lt={lt} at={cWhy} out={stopAt("b1", 4)}>So why do many farmers STILL work with animals?</Big>
        <StopBox lt={lt} b="b1" x={40} y={500} h={450} qSize={48} />
      </Scene>
    );
  };
}
function B2(ctx) {
  return ({ localTime: lt, duration }) => {
    const cEven = S("b2", 0), cMany = W("b2", "MANY"), cSmall = W("b2", "small"), cCannot = W("b2", "cannot"), cMach = W("b2", "machines"), cLet = S("b2", 1), cTwo = W("b2", "two");
    const walkK = drive(lt, cLet - 0.1, cLet + 1.1), fx = lerp(800, 620, walkK), walking = lt > cLet - 0.1 && lt < cLet + 1.1;
    const shake = lt > cMach - 0.2 && lt < cLet ? 7 * Math.sin((lt - cMach) * 11) : 0;
    const pat = out3(lt, cLet + 1.0, 0.4), patA = 1.65 + 0.14 * Math.sin(lt * 7);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[2]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(2, ctx, [L("Animal-drawn implements still help MANY farmers today", cMany, "big"), L("especially those with SMALL farms", cSmall), L("or little access to MACHINES", cCannot)])}>
        <Yard id="y2" horizon={530} op={out3(lt, 0.1, 0.5)}>
          <path d="M40 950 L1400 950 L1400 640 L40 640 Z" fill="#94AD5E" />
          <path d="M40 640 L1400 640 M40 720 L1400 720" stroke="#6B8A44" strokeWidth={4} strokeDasharray="4 16" />
          <Tractor x={1110} y={860} s={1.05} />
          <g transform={`translate(1120 ${560})`} />
          <Team x={250} y={860} s={0.95} walk={0} ph={0.2} />
          <Farmer x={fx} y={870} s={1.05} flip={lt >= cLet - 0.1} ph={lt * 1.3} walk={walking ? 1 : 0} arm={lerp(0.25, patA, pat)} arm2={0.2} shake={shake} />
        </Yard>
        <SVG><Tag x={1240} y={470} lt={lt} at={cCannot} swing={6 * Math.sin(lt * 2.4)} w={240} h={116} size={60} /></SVG>
        <Pic slot="small_farm" label="A small family farm on a narrow strip of land" x={70} y={70} w={520} h={340} lt={lt} at={cEven} fx="zoom" />
        <Pic slot="farmer_pats" label="The farmer pats his bullocks" x={610} y={70} w={520} h={340} lt={lt} at={cLet} fx="pop" />
        <Chip text="a small farm" x={330} y={380} lt={lt} at={cSmall} size={26} />
        <Chip text="Let's follow these two!" x={420} y={520} lt={lt} at={cTwo} size={30} tone="gold" />
      </Scene>
    );
  };
}
function B3(ctx) {
  return ({ localTime: lt, duration }) => {
    const cFirst = S("b3", 0), cP = W("b3", "bullock"), cLoose = W("b3", "loosens"), cTurn = W("b3", "turns"), cSeeds = W("b3", "seeds"), cNext = S("b3", 2), cWood = W("b3", "WOODEN"),
      cFlat = W("b3", "flat"), cSmooth = W("b3", "smooth"), cNow = S("b3", 3);
    const gy = 760, s = 0.86;
    const pk = drive(lt, cFirst, cNext + 0.2), px = lerp(-120, 1500, pk);
    const lk = drive(lt, cNext - 0.1, cNow + 0.2), lx = lerp(-520, 1480, lk);
    const tx = px + 250, [hx, hy] = hitchOf(tx, gy, s);
    const wet = drive(lt, cNow + 0.3, cNow + 2.1);
    const lit = [out3(lt, cFirst, 0.5), out3(lt, cNext, 0.5)];
    const tl = lx + 170, rx1 = lx + 100, ropeY = gy - 8, hl = hitchOf(tl + 80, gy, s);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[3]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(3, ctx, [L("PLOUGH", cP, "head"), L("Loosens and turns the soil", cLoose), L("WOODEN LEVELLER", cWood, "head"), L("Smooths the field", cSmooth)])}>
        <Yard id="y3" horizon={640} gy={gy}>
          <Soil lt={lt} gy={gy} px={px} lx={lx} wet={wet} />
          {lt < cNext + 1.2 && <g>
            <Team x={tx} y={gy - 4} s={s} ph={px / 130} walk={pk > 0 && pk < 1 ? 1 : 0} />
            <PloughTool x={px} y={gy} s={s * 1.05} hx={hx} hy={hy} />
            <Clods lt={lt} x={px} y={gy + 6} on={pk > 0.01 && pk < 0.99 ? 1 : 0} />
            <Farmer x={px - 110} y={gy - 2} s={s} ph={px / 120} walk={1} arm={1.15} arm2={1.05} />
          </g>}
          {lt > cNext - 0.2 && <g>
            <rect x={lx - 60} y={gy - 13} width={170} height={15} rx={4} fill="#A97C4A" stroke="#6E4A2A" strokeWidth={3} />
            <path d={`M${rx1} ${ropeY - 4} L${hl[0]} ${hl[1]}`} stroke="#5E3F22" strokeWidth={6} />
            <Farmer x={lx + 18} y={gy - 13} s={s * 0.94} walk={0} arm={1.2} arm2={1.0} lean={-3} />
            <Team x={tl + 80} y={gy - 2} s={s} ph={lx / 130} walk={lk > 0 && lk < 1 ? 1 : 0} />
          </g>}
        </Yard>
        <Pic slot="hero_plough" label="The bullock-drawn plough" x={70} y={70} w={480} h={320} lt={lt} at={cP} fx="zoom" />
        <Pic slot="leveller" label="A wooden leveller: a flat plank pulled across the field" x={570} y={70} w={480} h={320} lt={lt} at={cWood} fx="pop" />
        <FarmWheel lit={lit} cur={lt < cNext ? 0 : 1} lt={lt} op={out3(lt, 0.1, 0.5)} />
        <Chip text="loosens" x={350} y={840} lt={lt} at={cLoose} out={cNext} size={28} />
        <Chip text="turns it over" x={640} y={840} lt={lt} at={cTurn} out={cNext} size={28} />
        <Chip text="so seeds can grow" x={980} y={840} lt={lt} at={cSeeds} out={cNext} size={28} tone="gold" />
        <Chip text="a flat plank" x={480} y={840} lt={lt} at={cFlat} out={cNow} size={28} />
        <Chip text="smooth and even" x={900} y={840} lt={lt} at={cSmooth} size={28} tone="gold" />
        <Chip text="water spreads evenly" x={460} y={640} lt={lt} at={cNow + 0.6} size={28} />
      </Scene>
    );
  };
}
function B4(ctx) {
  return ({ localTime: lt, duration }) => {
    const cWater = W("b4", "WATER"), cPW = W("b4", "PERSIAN"), cBull = W("b4", "bullock"), cTurning = W("b4", "turning"), cChain = W("b4", "chain"), cDips = W("b4", "dips"),
      cFull = W("b4", "FULL"), cPours = W("b4", "pours"), cChan = W("b4", "channel"), cCrops = W("b4", "crops");
    const stop = stopAt("b4", 3), k = out3(lt, stop - 0.1, 0.8);
    const lit = [1, 1, out3(lt, cWater, 0.5)];
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[4]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(4, ctx, [L("The PERSIAN WHEEL", cPW, "big"), L("Animals turn the wheel", cBull), L("Pots lift water from the well", cChain), L("Water flows to the fields", cChan)], { max: 6 })}>
        <Yard id="y4" horizon={558} gy={650} land="#B7C482" soil="#8A6A49" sun={false}>
          <PersianWheel lt={lt} walkAt={cBull} fullAt={cFull} pourAt={cPours} chanAt={cPours + 0.5} cropAt={cCrops - 0.4} />
        </Yard>
        <Pic slot="persian_real" label="A Persian wheel: a bullock turns the wheels over a well" x={70} y={70} w={470} h={310} lt={lt} at={cPW} fx="zoom" />
        <Flag text="1 the bullock walks" x={300} y={880} lt={lt} at={cBull} tone={SK.cream} fg={SK.ink} />
        <Flag text="2 the wheels turn" x={640} y={420} lt={lt} at={cTurning} tone={SK.cream} fg={SK.ink} />
        <Flag text="3 pots dip" x={680} y={880} lt={lt} at={cDips} tone={SK.cream} fg={SK.ink} />
        <Flag text="4 up FULL" x={700} y={740} lt={lt} at={cFull} tone={SK.gold} fg={SK.ink} />
        <Flag text="5 pour into a channel" x={1190} y={500 - 10} lt={lt} at={cPours} tone={SK.cream} fg={SK.ink} />
        <Flag text="6 to the crops!" x={1250} y={660} lt={lt} at={cCrops} tone={SK.gold} fg={SK.ink} />
        {/* Stop 2: freeze on the wheel, three steps lit */}
        <div style={{ position: "absolute", left: 40, top: 40, width: 1360, height: 910, borderRadius: 18, background: "rgba(5,30,22,0.9)", opacity: k * (1 - reveal(lt, stop + 5.8, 0.3)), zIndex: 3 }} />
        <FarmWheel cx={lerp(WC.cx, 380, k)} cy={lerp(WC.cy, 480, k)} r={lerp(WC.r, 300, k)} lit={lit} cur={lt < stop ? 2 : -1} lt={lt} op={out3(lt, 0.1, 0.5)} style={{ zIndex: 4 }} />
        <StopBox lt={lt} b="b4" heading="HAVE YOU UNDERSTOOD?" x={720} y={60} w={670} h={870} qSize={50}>
          <div style={{ display: "flex", gap: 14, marginTop: 30 }}>
            {[["hero_plough", "plough"], ["leveller", "leveller"], ["persian_real", "Persian wheel"]].map(([slot, lab]) =>
              <div key={slot} style={{ position: "relative", width: 186, height: 190 }}>
                <Pic slot={slot} label={lab} x={0} y={0} w={186} h={146} lt={9} at={0} fx="none" r={12} />
                <div style={{ position: "absolute", top: 152, left: 0, right: 0, fontFamily: SANS, fontWeight: 700, fontSize: 24, color: SK.gold }}>{lab}</div>
              </div>)}
          </div>
        </StopBox>
      </Scene>
    );
  };
}
function B5(ctx) {
  const stalks = Array.from({ length: 70 }, (_, i) => ({ a: rnd(i) * TAU, r: 0.35 + 0.65 * Math.sqrt(rnd(i + 80)), rot: rnd(i + 160) * 180 }));
  return ({ localTime: lt, duration }) => {
    const cAfter = S("b5", 0), cSep = W("b5", "separate"), cGrain = W("b5", "grain"), cStalks = W("b5", "stalks"), cThr = W("b5", "THRESHERS"), cThen = S("b5", 2), cCart = W("b5", "cart"),
      cSacks = W("b5", "sacks"), cField = W("b5", "field"), cStore = W("b5", "store");
    const pB = reveal(lt, cThen, 0.6), lit = [1, 1, 1, out3(lt, cAfter, 0.5), out3(lt, cThen, 0.5)];
    const t = Math.max(0, lt - cAfter), th = 0.9 + 0.75 * t, cx = 660, cy = 744, rx = 460, ry = 104;
    const a = roundPos(th, cx, cy, rx * 0.62, ry * 0.62, 0.72), b = roundPos(th, cx, cy, rx * 0.92, ry * 0.92, 0.76);
    const heap = out3(lt, cGrain, 2.4);
    const rope = (p) => <path d={`M${cx} ${cy - 110} L${p.x} ${p.y - 110 * p.K}`} stroke="#5E3F22" strokeWidth={5} />;
    const cx2 = lerp(-40, 720, drive(lt, cThen - 0.1, cStore + 0.5)), moving = lt > cThen - 0.1 && lt < cStore + 0.5;
    const cartY = 840, bump = moving ? 2.4 * Math.sin(cx2 / 13) : 0;
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[5]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(5, ctx, [L("Animals help work THRESHERS", cThr), L("TRANSPORT crops from the field to storage", cCart)])}>
        <Yard id="y5a" horizon={500} land="#C9BE7E" sun={false} op={1 - pB}>
          <ellipse cx={cx} cy={cy} rx={rx + 60} ry={ry + 36} fill="#B79C63" />
          <ellipse cx={cx} cy={cy} rx={rx + 26} ry={ry + 18} fill="#D8B859" />
          {stalks.map((q, i) => { const x = cx + Math.cos(q.a) * q.r * (rx + 10), y = cy + Math.sin(q.a) * q.r * (ry + 6), g = rnd(i + 300) < heap;
            return <g key={i}><rect x={x - 16} y={y - 1.5} width={32} height={3.2} fill="#A98A37" transform={`rotate(${q.rot} ${x} ${y})`} />{g && <circle cx={x + 5} cy={y + 4} r={4} fill="#7E5A1E" />}</g>; })}
          {!a.front && <g>{rope(a)}<Bullock x={a.x} y={a.y} s={a.K} sx={a.sx} ph={t * 1.1} /></g>}
          {!b.front && <g>{rope(b)}<Bullock x={b.x} y={b.y} s={b.K} sx={b.sx} ph={t * 1.1 + 0.3} coat="#C89B6C" shade="#A97E52" bell={false} /></g>}
          <rect x={cx - 9} y={cy - 150} width={18} height={160} fill="#6E4A2A" />
          {a.front && <g>{rope(a)}<Bullock x={a.x} y={a.y} s={a.K} sx={a.sx} ph={t * 1.1} /></g>}
          {b.front && <g>{rope(b)}<Bullock x={b.x} y={b.y} s={b.K} sx={b.sx} ph={t * 1.1 + 0.3} coat="#C89B6C" shade="#A97E52" bell={false} /></g>}
        </Yard>
        <Yard id="y5b" horizon={560} land="#B7C482" op={pB}>
          <path d="M40 760 L1400 730 L1400 880 L40 900 Z" fill="#C9AE85" />
          {Array.from({ length: 24 }, (_, i) => <path key={i} d={`M${60 + i * 24} 700 l 0 -30 m 0 30 l -8 -22 m 8 22 l 8 -22`} stroke="#B79C47" strokeWidth={4} />)}
          <Store x={1225} y={750} s={0.95} open={out3(lt, cStore - 1, 0.6)} />
          <Cart x={cx2} y={cartY} s={0.8} spin={cx2 / 67} sway={bump} ph={cx2 / 120} walk={moving ? 1 : 0} />
        </Yard>
        <Pic slot="threshing_round" label="Bullocks walk in a circle over the spread-out crop" x={70} y={70} w={420} h={290} lt={lt} at={cAfter} out={cThen} fx="zoom" />
        <Pic slot="thresher_pull" label="Bullocks work a simple thresher" x={510} y={70} w={420} h={290} lt={lt} at={cThr} out={cThen} fx="pop" />
        <Pic slot="cart_sacks" label="A bullock cart piled high with sacks of grain" x={70} y={70} w={520} h={340} lt={lt} at={cCart} fx="zoom" />
        <Chip text="grain" x={560} y={885} lt={lt} at={cGrain} out={cThen} size={28} tone="gold" />
        <Chip text="stalks" x={760} y={885} lt={lt} at={cStalks} out={cThen} size={28} />
        <Chip text="heavy sacks" x={560} y={910 - 40} lt={lt} at={cSacks} size={28} tone="gold" />
        <Chip text="field → store" x={820} y={910 - 40} lt={lt} at={cField} size={28} />
        <FarmWheel lit={lit} cur={lt < cThen ? 3 : 4} lt={lt} op={out3(lt, 0.1, 0.5)} />
      </Scene>
    );
  };
}
function Clock({ cx, cy, r, lt, at }) {
  const a = Math.max(0, lt - at) * 7.5;
  return <g>
    {[0.55, 0.3, 0.12].map((f, i) => <path key={i} d={`M${cx} ${cy} L${cx + r * 0.72 * Math.sin(a - (i + 1) * 0.3)} ${cy - r * 0.72 * Math.cos(a - (i + 1) * 0.3)}`} stroke={SK.gold} strokeWidth={8} opacity={f * (lt > at ? 1 : 0)} strokeLinecap="round" />)}
    <circle cx={cx} cy={cy} r={r} fill={SK.cream} stroke={SK.gold} strokeWidth={12} opacity={1} style={{ mixBlendMode: "normal" }} />
    {Array.from({ length: 12 }, (_, i) => <rect key={i} x={cx - 3.5} y={cy - r + 10} width={7} height={i % 3 ? 14 : 26} fill={SK.ink} transform={`rotate(${i * 30} ${cx} ${cy})`} />)}
    {[3, 2, 1].map((i) => <line key={i} x1={cx} y1={cy} x2={cx + r * 0.72 * Math.sin(a - i * 0.22)} y2={cy - r * 0.72 * Math.cos(a - i * 0.22)} stroke={SK.gold} strokeWidth={8} opacity={(lt > at ? 0.25 * (4 - i) : 0)} strokeLinecap="round" />)}
    <line x1={cx} y1={cy} x2={cx + r * 0.48 * Math.sin(a / 12)} y2={cy - r * 0.48 * Math.cos(a / 12)} stroke={SK.ink} strokeWidth={13} strokeLinecap="round" />
    <line x1={cx} y1={cy} x2={cx + r * 0.72 * Math.sin(a)} y2={cy - r * 0.72 * Math.cos(a)} stroke={SK.ink} strokeWidth={8} strokeLinecap="round" />
    <circle cx={cx} cy={cy} r={12} fill={SK.ink} />
  </g>;
}
function B6(ctx) {
  const CW = 432, CX = [46, 504, 962], CY = 70, CH = 850;
  return ({ localTime: lt, duration }) => {
    const cWhy = S("b6", 0), c1 = S("b6", 1), cHeavy = W("b6", "HEAVY"), cBack = W("b6", "back"), c2 = S("b6", 2), c3 = S("b6", 3), cLess = W("b6", "LESS"), cMach = W("b6", "expensive");
    const load = drive(lt, cHeavy, cBack + 0.8), wipe = out3(lt, cBack + 0.6, 0.5);
    const sack = [lerp(0, 262, load), -212 - 140 * Math.sin(Math.PI * load) + 74 * load];
    const heads = [["Less physical burden", c1], ["Saves time", c2], ["Affordable", c3]];
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[6]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(6, ctx, [L("Less PHYSICAL burden on farmers", c1), L("SAVES time", c2), L("AFFORDABLE compared with expensive machines", c3)])}>
        <Pic slot="farmer_rest" label="A farmer wipes sweat from his face" x={40} y={40} w={1360} h={910} lt={lt} at={0.1} fx="zoom" dim={0.72} />
        <Big x={40} w={1360} y={300} size={60} align="center" lt={lt} at={cWhy} out={c1}>So why do farmers still use animals?</Big>
        {heads.map(([h, at], i) => { const o = pop(lt, at, 0.55); if (o <= 0) return null;
          return <div key={i} style={{ position: "absolute", left: CX[i], top: CY, width: CW, height: CH, borderRadius: 24, background: SK.cream, opacity: clamp(o, 0, 1), transform: `scale(${0.86 + 0.14 * o})`, boxShadow: `0 0 0 4px ${SK.gold}, 0 12px 30px rgba(0,0,0,0.35)` }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 26, textAlign: "center", fontFamily: SERIF, fontWeight: 700, fontSize: 40, color: SK.ink }}>{h}</div>
          </div>; })}
        {/* 1: the load moves from his back to the cart */}
        <SVG op={clamp(pop(lt, c1, 0.55), 0, 1)}>
          <g transform={`translate(${CX[0]} ${CY})`}>
            <rect x={24} y={640} width={384} height={10} rx={5} fill="#C9AE85" />
            <g transform="translate(320 640)"><Cart x={0} y={0} s={0.72} team={false} load={0} /></g>
            <Farmer x={112} y={640} s={1.15} shirt="#3E7CB1" cloth="#CDBF9F" lean={lerp(26, 0, load)} arm={lerp(1.9, 0.3, load) + 0.0} arm2={lerp(1.7, 0.2, load)} />
            {wipe > 0 && <g transform="translate(112 640) scale(1.15)"><path d="M4 -176 L40 -190 L26 -232" stroke="#8A5A3C" strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={wipe} />
              {[0, 1, 2].map((i) => { const p = (lt * 1.2 + i / 3) % 1; return <path key={i} d={`M${34 + i * 10} ${-226 + p * 60} c -5 8, -5 12, 0 12 c 5 0, 5 -4, 0 -12 Z`} fill="#7FD3F7" opacity={wipe * (1 - p)} />; })}</g>}
            <g transform={`translate(112 640) translate(${sack[0] * 1.15 - 34 * (1 - load)} ${sack[1] * 1.15})`}><Sack x={0} y={0} w={110} h={76} rot={lerp(-24, 0, load)} /></g>
          </g>
        </SVG>
        {/* 2: the clock runs faster */}
        <SVG op={clamp(pop(lt, c2, 0.55), 0, 1)}><g transform={`translate(${CX[1]} ${CY})`}><Clock cx={216} cy={400} r={170} lt={lt} at={c2 + 0.2} />
          {[0, 1, 2].map((i) => <path key={i} d={`M${130 + i * 58} 630 l 44 34 l -44 34 Z`} fill={SK.gold} opacity={0.4 + 0.6 * ((Math.sin(lt * 7 - i) + 1) / 2)} />)}</g></SVG>
        {/* 3: a coin beside a much bigger price tag */}
        <SVG op={clamp(pop(lt, c3, 0.55), 0, 1)}><g transform={`translate(${CX[2]} ${CY})`}>
          <Tractor x={232} y={744} s={0.82} />
          <Tag x={278} y={250} lt={lt} at={cMach} w={250} h={122} size={56} swing={4 * Math.sin(lt * 2.4)} />
          <g transform={`translate(80 410) scale(${pop(lt, cLess, 0.5)})`}><circle r={58} fill={SK.gold} stroke={SK.goldDeep} strokeWidth={7} /><text y={24} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={66} fill={SK.ink}>₹</text></g>
        </g></SVG>
      </Scene>
    );
  };
}
function B7(ctx) {
  return ({ localTime: lt, duration }) => {
    const cBig = W("b7", "big"), cNarrow = W("b7", "narrow"), cSteep = W("b7", "steep"), cMuddy = W("b7", "muddy"), cBut = S("b7", 1), cAnimals = W("b7", "animals");
    const stop = stopAt("b7", 1), breakAt = stop + 5.05;
    const tk = drive(lt, cBig - 0.4, cMuddy), tX = lerp(-280, 400, tk), sink = out3(lt, cMuddy + 0.1, 1.4), spin = lt * 9;
    const gy = 790, s = 0.82, px = lerp(-100, 900, drive(lt, cBut - 0.6, stop + 5)), bx = px + 240, walking = lt > cBut - 0.6;
    const [hx, hy] = hitchOf(bx, gy + 12, s);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[7]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(7, ctx, [L("Animal power makes farming possible", cBig, "big"), L("where MODERN EQUIPMENT is HARD to use", cBig + 0.4), L("Narrow · steep · muddy", cNarrow, "plain"), L("But animals can!", cBut, "head")])}>
        <Yard id="y7" horizon={640} gy={780} land="#9FB46C" soil="#5E4632">
          <rect x={40} y={740} width={1360} height={44} fill="#7D6346" />
          <Tractor x={tX} y={gy + 8 + sink * 66} s={0.9} tilt={sink * 6} spin={sink > 0.05 ? spin : tX / 60} />
          <Spray lt={lt} x={tX - 60} y={gy + 8} on={sink} />
          <Spray lt={lt} x={tX + 140} y={gy + 8} on={sink} n={5} />
          {walking && <g>
            <Team x={bx} y={gy + 14} s={s} ph={px / 130} walk={1} />
            <PloughTool x={px} y={gy + 12} s={s} hx={hx} hy={hy} />
            <Farmer x={px - 104} y={gy + 14} s={s} ph={px / 120} walk={1} arm={1.15} arm2={1.05} />
            {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M${px - 170 - i * 110} ${gy + 26 + (i % 2) * 8} q 40 -9 80 0`} stroke="#3F2E20" strokeWidth={5} fill="none" opacity={px - 170 - i * 110 > -30 ? 1 : 0} />)}
          </g>}
          <rect x={40} y={gy + 16} width={1360} height={160} fill="#5E4632" />
          <path d={`M40 ${gy + 18} q 60 ${6 * Math.sin(lt * 2)} 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0`} stroke="#8DA8AE" strokeWidth={4} fill="none" opacity={0.75} />
        </Yard>
        <Big x={40} w={1360} y={120} size={56} align="center" color={SK.ink} serif lt={lt} at={cBig - 0.2} out={cNarrow}>Places where big machines just cannot go</Big>
        <Pic slot="narrow_field" label="A narrow field" x={60} y={60} w={430} h={290} lt={lt} at={cNarrow} fx="pop" />
        <Pic slot="village_hill" label="A steep slope" x={505} y={60} w={430} h={290} lt={lt} at={cSteep} fx="pop" />
        <Pic slot="mud_paddy" label="Very muddy land" x={950} y={60} w={430} h={290} lt={lt} at={cMuddy} fx="pop" />
        <Chip text="narrow" x={275} y={310} lt={lt} at={cNarrow + 0.2} size={26} />
        <Chip text="steep" x={720} y={310} lt={lt} at={cSteep + 0.2} size={26} />
        <Chip text="muddy" x={1165} y={310} lt={lt} at={cMuddy + 0.2} size={26} />
        <Flag text="stuck!" x={470} y={400} lt={lt} at={cMuddy + 0.5} size={34} />
        <Flag text="animals can!" x={1020} y={400} lt={lt} at={cAnimals} size={34} tone={SK.gold} fg={SK.ink} />
        <StopBox lt={lt} b="b7" x={40} y={46} h={316} qSize={42} compact />
        <Break lt={lt} at={breakAt} dur={2.4} />
      </Scene>
    );
  };
}
function Peaks({ x, y, s = 1, op = 1 }) {
  if (op <= 0) return null;
  return <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}><path d="M-34 14 L0 -34 L34 14 Z" fill="#E8EEF4" /><path d="M-14 -13 L0 -34 L14 -13 L6 -8 L0 -14 L-6 -8 Z" fill="#FFFFFF" /><path d="M0 -34 L34 14 L8 14 Z" fill="#B9C8D6" opacity={0.7} /></g>;
}
function B9(ctx) {
  const PEAKS = [[75.2, 33.8], [77.2, 32.6], [79.0, 31.2], [80.9, 30.3], [82.6, 29.3], [84.4, 28.8], [86.2, 28.3], [87.8, 27.9], [89.6, 28.0], [91.8, 28.0], [93.8, 28.6]];
  return ({ localTime: lt, duration }) => {
    const cWow = S("b9", 0, 0.1), cTravel = S("b9", 1), cNepal = W("b9", "Nepal"), cYaks = W("b9", "YAKS"), cShag = W("b9", "shaggy"), cCold = W("b9", "cold"), cPull = S("b9", 3),
      cCarry = W("b9", "carry"), cSteep = W("b9", "steep"), cJust = S("b9", 4), cTract = W("b9", "tractors");
    const wowO = pop(lt, cWow, 0.6) * (1 - reveal(lt, cTravel + 0.1, 0.4));
    const z = Math.pow(drive(lt, cTravel + 0.3, cNepal), 1), mS = lerp(1.04, 3.4, z), [fx, fy] = proj(lerp(82, 84.3, z), lerp(23, 29.4, z));
    const mx = lerp(340 + 720 - 720 - 0, 720, 1) - fx * mS, my = lerp(500, 450, z) - fy * mS;
    const mapO = out3(lt, cTravel, 0.5) * (1 - reveal(lt, cYaks, 0.5));
    const lab = (lon, lat) => { const [a, b] = proj(lon, lat); return [mx + a * mS - 40, my + b * mS - 40]; };
    const [hx, hy] = lab(80, 31.9), [nx, ny] = lab(84.2, 27.6);
    const yakBig = out3(lt, cYaks, 0.6) * (1 - reveal(lt, cPull, 0.5));
    const walk = Math.max(0, lt - cCarry), lane = out3(lt, cCarry, 0.6);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[9]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(9, ctx, [L("In parts of NEPAL and the HIMALAYAN region,", cNepal), L("farmers use YAKS", cYaks, "big"), L("to plough fields and carry farm loads,", cPull), L("on steep mountain slopes where tractors can't easily reach!", cSteep)])}>
        {/* the map zooms up into the mountains */}
        <div style={{ position: "absolute", left: 40, top: 40, width: 1360, height: 910, borderRadius: 18, overflow: "hidden", background: "#0B3528", opacity: mapO }}>
          <div style={{ position: "absolute", left: -40, top: -40, width: 1920, height: 1080 }}>
            <SVG>
              <g transform={`translate(${mx} ${my}) scale(${mS})`}>
                <path d={MAP.outline} fill="#2C5E49" stroke={SK.cream} strokeWidth={3.5 / mS} strokeLinejoin="round" />
                {MAP.islands.map((d, i) => <path key={i} d={d} fill="#2C5E49" stroke={SK.cream} strokeWidth={2 / mS} />)}
                {PEAKS.map(([a, b], i) => { const [px, py] = proj(a, b); return <Peaks key={i} x={px} y={py} s={lerp(0.95, 0.72, z)} op={out3(lt, cTravel + 0.4 + i * 0.1, 0.5)} />; })}
              </g>
            </SVG>
          </div>
          <Chip text="India" x={lab(79, 22)[0]} y={lab(79, 22)[1]} lt={lt} at={cTravel} out={cTravel + 1.8} size={34} />
          <Chip text="The Himalayas" x={hx} y={hy} lt={lt} at={cTravel + 1.5} size={34} tone="gold" />
          <Chip text="Nepal" x={nx} y={ny} lt={lt} at={cNepal} size={34} />
        </div>
        {/* yak, close up, in the cold */}
        <div style={{ position: "absolute", inset: 0, opacity: yakBig }}>
          <Pic slot="yak_close" label="A big, shaggy yak in the snow" x={40} y={40} w={1360} h={910} lt={lt} at={cYaks} fx="zoom" />
          <SVG>{Array.from({ length: 46 }, (_, i) => { const p = (lt * (0.1 + rnd(i) * 0.08) + rnd(i + 50)) % 1; return <circle key={i} cx={60 + rnd(i + 9) * 1320 + 24 * Math.sin(lt + i)} cy={50 + p * 890} r={3 + rnd(i + 20) * 4} fill="#fff" opacity={0.85} />; })}</SVG>
          <Chip text="YAK" x={720} y={80} lt={lt} at={cYaks + 0.1} size={44} tone="gold" />
          <Chip text="big and shaggy" x={380} y={820} lt={lt} at={cShag} size={32} />
          <Chip text="loves the cold" x={1060} y={820} lt={lt} at={cCold} size={32} />
        </div>
        <Pic slot="yak_plough" label="Yaks pull a wooden plough on a mountain terrace" x={40} y={40} w={670} h={450} lt={lt} at={cPull} fx="zoom" />
        <Pic slot="yak_caravan" label="A line of yaks carries loads along a mountain path" x={730} y={40} w={670} h={450} lt={lt} at={cCarry} fx="zoom" />
        <Chip text="pull ploughs" x={375} y={440} lt={lt} at={cPull + 0.2} size={28} tone="gold" />
        <Chip text="carry heavy loads" x={1065} y={440} lt={lt} at={cCarry + 0.2} size={28} tone="gold" />
        <SVG op={lane}>
          <defs><clipPath id="y9c"><rect x={40} y={506} width={1360} height={444} rx={18} /></clipPath></defs>
          <g clipPath="url(#y9c)">
            <rect x={40} y={506} width={1360} height={444} fill="#BFDCEE" />
            <path d="M40 760 L300 560 L470 690 L700 520 L940 720 L1140 570 L1400 740 L1400 950 L40 950 Z" fill="#8FA6B8" />
            <path d="M300 560 L262 590 L290 586 L310 606 L338 588 Z M700 520 L656 554 L690 548 L712 572 L748 556 Z M1140 570 L1104 598 L1136 594 L1156 612 L1178 600 Z" fill="#fff" />
            <path d="M40 830 C 300 810, 600 790, 860 730 C 1040 690, 1240 660, 1400 640 L1400 950 L40 950 Z" fill="#6E6A62" />
            <path d="M40 830 C 300 810, 600 790, 860 730 C 1040 690, 1240 660, 1400 640" stroke="#D9D3C2" strokeWidth={9} fill="none" />
            {[0, 1, 2, 3].map((i) => { const x = ((walk * 62 + 840 - i * 250 + 1700) % 1700) - 120, yy = pathY(x), tilt = (Math.atan2(pathY(x + 30) - pathY(x - 30), 60) * 180) / Math.PI; return <g key={i} transform={`rotate(${tilt} ${x} ${yy})`}><Yak x={x} y={yy + 2} s={0.62} ph={walk * 1.05 + i * 0.23} load /></g>; })}
            {[[200, 935, 1.0], [620, 930, 1.15], [1280, 925, 1.0]].map(([cx, cy, k], i) => { const dx = 18 * Math.sin(lt * 0.5 + i); return <g key={i} transform={`translate(${cx + dx} ${cy}) scale(${k})`} fill="#FFFFFF" opacity={0.92}><ellipse rx={120} ry={32} /><ellipse cx={-54} cy={-18} rx={60} ry={28} /><ellipse cx={46} cy={-22} rx={72} ry={34} /></g>; })}
          </g>
          <rect x={40} y={506} width={1360} height={444} rx={18} stroke="rgba(255,255,255,0.55)" strokeWidth={3} />
        </SVG>
        <Flag text="just like our bullocks" x={330} y={530} lt={lt} at={cJust} size={30} tone={SK.cream} fg={SK.ink} />
        <Flag text="where tractors can't easily reach" x={1040} y={830} lt={lt} at={cTract} size={30} />
        {/* WOW card */}
        {wowO > 0 && <div style={{ position: "absolute", left: 40, top: 40, width: 1360, height: 910, borderRadius: 18, background: "#F0781E", opacity: clamp(wowO, 0, 1), display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3 }}>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 260, color: SK.white, transform: `scale(${0.7 + 0.3 * wowO + 0.02 * Math.sin(lt * 6)})`, textShadow: "0 8px 0 rgba(120,50,0,0.45)" }}>WOW!</div>
        </div>}
      </Scene>
    );
  };
}
// The mountain path on b9's strip (the same curve as its stroke, sampled).
function pathY(x) {
  const P = [[-300, 850], [40, 830], [300, 815], [600, 790], [860, 730], [1040, 692], [1240, 660], [1400, 640], [1800, 600]];
  for (let i = 1; i < P.length; i++) if (x <= P[i][0]) { const [a, b] = P[i - 1], [c, d] = P[i]; return b + ((d - b) * (x - a)) / (c - a); }
  return 930;
}
function CareIcon({ kind, lt }) {
  if (kind === "food") return <g><path d="M-52 34 C -46 -10 46 -10 52 34 Z" fill="#6FA84A" /><path d="M-30 30 L-18 -30 M0 30 L0 -38 M30 30 L18 -30 M-14 30 L-34 -18 M14 30 L34 -18" stroke="#3E8040" strokeWidth={7} strokeLinecap="round" /></g>;
  if (kind === "water") return <g><path d="M-44 -18 L44 -18 L34 40 L-34 40 Z" fill="#8E9AA5" /><ellipse cy={-18} rx={44} ry={11} fill="#6FC4EE" /><path d="M-44 -18 C -40 -66 40 -66 44 -18" stroke="#5F6A72" strokeWidth={5} fill="none" /></g>;
  if (kind === "rest") return <g><path d="M24 -42 A 44 44 0 1 0 24 42 A 34 34 0 1 1 24 -42 Z" fill={SK.gold} /><text x={34} y={-12} fontFamily={SANS} fontWeight={700} fontSize={34} fill={SK.ink}>z</text><text x={52} y={-34} fontFamily={SANS} fontWeight={700} fontSize={26} fill={SK.ink}>z</text></g>;
  return <g transform="translate(0 44)"><Tree x={0} y={0} s={0.56} c="#4F8A58" /><ellipse cx={0} cy={2} rx={60} ry={8} fill="rgba(0,0,0,0.2)" /></g>;
}
function B10(ctx) {
  return ({ localTime: lt, duration }) => {
    const cSo = S("b10", 0), cPl = W("b10", "plough"), cLv = W("b10", "level"), cLift = W("b10", "lift"), cTh = W("b10", "thresh"), cCarry = W("b10", "carry"), cCost = W("b10", "cost"), cSave = W("b10", "save"),
      cWork = W("b10", "work", 1), cRem = S("b10", 3), cPart = W("b10", "partners"), cFood = W("b10", "food"), cWat = W("b10", "water", 1), cRest = W("b10", "rest"), cShade = W("b10", "shade");
    const lit = [cPl, cLv, cLift, cTh, cCarry].map((a) => out3(lt, a, 0.5));
    const cur = [cPl, cLv, cLift, cTh, cCarry].reduce((c, a, i) => (lt >= a ? i : c), -1);
    const glow = reveal(lt, cCost, 0.5);
    const care = [["food", "good food", cFood], ["water", "water", cWat], ["rest", "rest", cRest], ["shade", "shade", cShade]];
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[10]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(10, ctx, [L("Animals plough, level, lift water, thresh and transport", cPl, "plain"), L("AFFORDABLE · SAVE TIME · work where machines can't", cCost, "big"),
          L("Care for them well:", cRem, "head"), L("food, water, rest and shade", cFood)], { max: 5 })}>
        <Pic slot="bullocks_rest" label="The bullocks rest under a tree after a day's work" x={40} y={40} w={800} h={910} lt={lt} at={0.1} out={cCost} fx="zoom" />
        <Pic slot="bullocks_rest" label="The bullocks rest under a tree after a day's work" x={40} y={40} w={800} h={520} lt={lt} at={cCost - 0.2} fx="none" />
        <Pic slot="feed_bullocks" label="The farmer feeds his bullocks" x={40} y={40} w={800} h={520} lt={lt} at={cPart - 0.2} fx="pop" />
        <FarmWheel cx={1120} cy={lerp(490, 300, out3(lt, cCost - 0.2, 0.7))} r={lerp(268, 250, out3(lt, cCost - 0.2, 0.7))} lit={lit} cur={glow > 0 ? -1 : cur} lt={lt} />
        <Chip text="cost less" x={210} y={585} lt={lt} at={cCost} size={32} tone="gold" />
        <Chip text="save time" x={510} y={585} lt={lt} at={cSave} size={32} tone="gold" />
        <Chip text="work where machines cannot" x={980} y={585} lt={lt} at={cWork} size={32} tone="gold" />
        <Chip text="the farmer's partners" x={440} y={500} lt={lt} at={cPart} size={34} />
        {care.map(([k, lab, at], i) => { const o = pop(lt, at, 0.5); if (o <= 0) return null; return <div key={k} style={{ position: "absolute", left: 40 + i * 345, top: 665, width: 325, height: 280, borderRadius: 22, background: SK.cream, opacity: clamp(o, 0, 1), transform: `scale(${0.85 + 0.15 * o})`, boxShadow: `0 0 0 3px ${SK.gold}` }}>
          <svg width="325" height="200" viewBox="-162 -100 325 200" style={{ position: "absolute", left: 0, top: 10, overflow: "visible" }}><g transform="scale(1.2)"><CareIcon kind={k} lt={lt} /></g></svg>
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 18, textAlign: "center", fontFamily: SERIF, fontWeight: 700, fontSize: 38, color: SK.ink }}>{lab}</div>
        </div>; })}
        <StopBox lt={lt} b="b10" heading="QUICK CHECK">
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 28, textAlign: "left" }}>
            {QUICK.map((q, i) => <div key={i} style={{ display: "flex", gap: 16 }}>
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
const COLLAGE = [{ slot: "hero_plough", x: -60, y: -40, w: 760, h: 520, ph: 0 }, { slot: "cart_sacks", x: 640, y: -80, w: 760, h: 520, ph: 2 },
  { slot: "dawn_bullocks", x: -80, y: 520, w: 700, h: 560, ph: 4 }, { slot: "yak_caravan", x: 560, y: 560, w: 820, h: 560, ph: 1 }];
const BN = { 1: B1, 2: B2, 3: B3, 4: B4, 5: B5, 6: B6, 7: B7, 9: B9, 10: B10 };
function Lp16Scenes(props = {}) {
  const caps = props.showCaptions === "false" ? false : props.showCaptions !== false;
  const titles = {};
  IDS.forEach((n) => { titles[n] = str(props["title" + n + "Text"], TITLES[n]); });
  const ctx = { caps, titles, capSize: num(props.captionSize, 34) };
  return (
    <StoryFrame props={props} dur={DUR} persistKey="thinkpro-lp16-animal-drawn-implements" collage={COLLAGE}>
      {IDS.map((n) => { const t = BEAT("b" + n); return <Sprite key={n} start={t.start} end={t.start + t.dur}>{BN[n](ctx)}</Sprite>; })}
      {STOPS.map(([b, i, hold]) => <StopAt key={b} t={BEAT(b).start + stopAt(b, i)} hold={hold - 0.2} />)}
      <ChimeAt t={BEAT("b9").start + S("b9", 0, 0.35)} />
      <AudioSync />
    </StoryFrame>
  );
}
window.Lp16Scenes = Lp16Scenes;
