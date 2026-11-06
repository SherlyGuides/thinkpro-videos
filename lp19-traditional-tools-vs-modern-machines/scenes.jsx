/* global React, window */
// ThinkPro Academy — "Traditional Tools vs Modern Machines" (Grade 6 Agriculture, Session 19, V1).
// After AG_G6_S19 Video Script Draft 1 (Subrata, 4 Nov 2026): 12 script scenes as 11 voiced beats
// (script scene 9, the silent leaf break, is the hold at the end of b8), five presenter stops
// (TPStory.StopAt: the web player freezes, the export holds the card), one WOW card. Central model:
// a friendly match, brown TEAM TOOLS vs blue TEAM MACHINES, with a running SCOREBOARD (pluses and
// minuses) that merges into TEAM FARM. STORY STYLE (engine/story-kit.jsx). Pure function of time.
const { Sprite } = window;
const { reveal, windowOp } = window.TPMotion;
const { num, str } = window.TPStage;
const { SK, SERIF, SANS, LEFT_W, pop, out3, lerp, drive,
  Pic, Chip, Badge, Big, Card, SVG, Arrow, T, ChimeAt, Scene, StoryFrame, StopAt, Break } = window.TPStory;

// ---- Timing: EVERYTHING is keyed to the narration (tools/fit_timing.py → timing.js).
const TM = window.TP_TIMING;
if (!TM) console.error("timing.js missing — run: python3 tools/fit_timing.py videos/lp19-traditional-tools-vs-modern-machines");
const LEAD = TM ? TM.lead : 1.0;
const DUR = TM ? TM.total : 250;
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
const TITLES = { 1: "LP19 – Traditional Tools vs Modern Machines", 2: "Team Tools: the strengths", 3: "Team Tools: the weakness", 4: "Team Machines: the strengths",
  5: "Team Machines: the weaknesses", 6: "Maths challenge!", 7: "Let's check", 8: "Smart idea: hire a machine", 9: "WOW! India's tractors", 10: "The best team", 11: "The answer" };
const KICK = "Grade 6 · Agriculture · Session 19";
const KICKS = { 9: "WOW!" };
const panel = (n, ctx, lines, extra = {}) => ({ kicker: KICKS[n] || KICK, title: ctx.titles[n], lines, ...extra });
const L = (text, at, kind = "item", extra = {}) => ({ text, at, kind, ...extra });

// ---- Presenter stops: [beat, sentence index whose pauseAfter is the hold, hold s]
const STOPS = [["b1", 3, 5.0], ["b5", 3, 6.0], ["b6", 2, 8.0], ["b10", 4, 7.0], ["b11", 5, 9.0]];
const QUICK = ["Give two advantages of traditional tools.", "Give two disadvantages of modern machines.", "How do small farmers use machines without buying them?",
  "How long would one person take to loosen a 10 m × 10 m field at 5 minutes per square metre?", "When is a hand tool better than a machine?"];
const stopAt = (b, i) => SE(b, i) + 0.1;                       // beat-local start of the hold
const stopFor = (b) => STOPS.find((s) => s[0] === b);
const stopStart = (b) => stopAt(b, stopFor(b)[1]);
// The kit's StopCard has one fixed heading and one question; this script's stops have different
// headings and custom bodies (vote, scoreboard, grid, job cards, quick check), so this takes children.
function StopBox({ lt, b, heading = "PAUSE AND DISCUSS", question, qSize = 52, children }) {
  const s = stopFor(b), at = stopAt(b, s[1]), hold = s[2] - 0.2, n = STOPS.indexOf(s) + 1;
  const o = windowOp(lt, at, at + hold + 0.4, 0.35); if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 40, top: 50, width: LEFT_W - 80, height: 900, borderRadius: 26, background: "rgba(5,30,22,0.98)", opacity: o, zIndex: 3,
      boxShadow: "0 0 0 3px rgba(226,176,76,0.9)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "26px 50px", boxSizing: "border-box", textAlign: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
        <svg width="62" height="62" viewBox="0 0 90 90"><circle cx="45" cy="45" r="43" fill={SK.gold} /><rect x="28" y="24" width="12" height="42" rx="4" fill={SK.ink} /><rect x="50" y="24" width="12" height="42" rx="4" fill={SK.ink} /></svg>
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 32, letterSpacing: "0.08em", color: SK.ink, background: SK.gold, padding: "8px 30px", borderRadius: 14 }}>{heading}</div>
      </div>
      {question && <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: qSize, lineHeight: 1.2, color: SK.white, marginTop: 26, maxWidth: 1220 }}>{question}</div>}
      {children}
      <div style={{ fontFamily: SANS, fontSize: 24, color: SK.dim, marginTop: 24 }}>Stop {n} of {STOPS.length}</div>
    </div>
  );
}

// ---- The two teams ----------------------------------------------------------------
const BROWN = "#8B5A2B", BLUE = "#2F6FB3", GOOD = "#2E9E4F", BAD = "#C8372D", ORANGE = "#F07F13";
const TEAM = { tools: { name: "TEAM TOOLS", c: BROWN }, machines: { name: "TEAM MACHINES", c: BLUE } };
const abs = (b, w, n = 0) => BEAT(b).start + W(b, w, n);
const ROWS = {
  tools: [["+", "cheap", "b2", "cheap"], ["+", "easy care", "b2", "easy"], ["+", "no fuel", "b2", "no"], ["+", "small farms", "b2", "small"], ["−", "slow", "b3", "slow"], ["−", "tiring", "b3", "tiring"]],
  machines: [["+", "prepares fast", "b4", "prepare"], ["+", "sows fast", "b4", "sow"], ["+", "harvests fast", "b4", "crops"], ["−", "expensive", "b5", "expensive"], ["−", "needs fuel", "b5", "fuel"], ["−", "needs skill", "b5", "skilled"]],
};
function Token({ sign, d = 28 }) {
  return <div style={{ flex: "none", width: d, height: d, borderRadius: d, background: sign === "+" ? GOOD : BAD, color: SK.white, display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: SANS, fontWeight: 700, fontSize: d * 0.86, lineHeight: 1 }}>{sign}</div>;
}
// The running scoreboard. `now` = absolute time, so one board keeps its marks from beat to beat.
function Scoreboard({ now, x, y, w = 360, scale = 1, op = 1, inO = 1, rows = 6 }) {
  const o = op * inO; if (o <= 0) return null;
  const col = (key) => (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ background: TEAM[key].c, color: SK.white, fontFamily: SANS, fontWeight: 700, fontSize: 19, letterSpacing: "0.03em", textAlign: "center", padding: "9px 2px", borderRadius: 10, whiteSpace: "nowrap" }}>{TEAM[key].name}</div>
      {ROWS[key].slice(0, rows).map(([sign, label, b, wd], i) => {
        const p = rows < 6 ? 0 : pop(now, abs(b, wd), 0.5);
        return <div key={i} style={{ height: 50, display: "flex", alignItems: "center", gap: 7, paddingLeft: 3, borderBottom: "1px solid rgba(255,255,255,0.14)" }}>
          {p > 0 && <div style={{ display: "flex", alignItems: "center", gap: 7, opacity: clamp(p * 1.4, 0, 1), transform: `scale(${0.6 + 0.4 * p})`, transformOrigin: "left center" }}>
            <Token sign={sign} /><span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 21, color: SK.white, whiteSpace: "nowrap" }}>{label}</span></div>}
        </div>; })}
    </div>);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, boxSizing: "border-box", padding: "12px 12px 14px", borderRadius: 18, background: "rgba(5,30,22,0.82)", boxShadow: `0 0 0 2px ${SK.gold}`,
      opacity: o, transform: `scale(${scale * (0.94 + 0.06 * inO)})`, transformOrigin: "left top" }}>
      <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 19, letterSpacing: "0.2em", color: SK.gold, textAlign: "center", marginBottom: 8 }}>SCOREBOARD</div>
      <div style={{ display: "flex", gap: 8 }}>{col("tools")}{col("machines")}</div>
    </div>
  );
}
function Flag({ team, x, y, lt, at, size = 42, op = 1 }) {
  const o = pop(lt, at, 0.55) * op; if (o <= 0) return null;
  return <div style={{ position: "absolute", left: x, top: y, transform: `translateX(-50%) scale(${0.8 + 0.2 * o})`, opacity: clamp(o, 0, 1), fontFamily: SERIF, fontWeight: 700, fontSize: size, letterSpacing: "0.04em",
    color: SK.white, background: TEAM[team].c, padding: "10px 32px", borderRadius: 14, boxShadow: `0 0 0 3px rgba(255,255,255,0.75), 0 6px 18px rgba(0,0,0,0.35)`, whiteSpace: "nowrap" }}>{TEAM[team].name}</div>;
}
// Big + / − fact card.
function Fact({ sign, text, x, y, w, h = 130, lt, at, size = 38 }) {
  const o = pop(lt, at, 0.55); if (o <= 0) return null;
  return <div style={{ position: "absolute", left: x, top: y, width: w, height: h, boxSizing: "border-box", display: "flex", alignItems: "center", gap: 16, padding: "0 20px", borderRadius: 18,
    opacity: clamp(o, 0, 1), transform: `scale(${0.86 + 0.14 * o})`, background: SK.cream, boxShadow: `inset 8px 0 0 ${sign === "+" ? GOOD : BAD}, 0 8px 22px rgba(0,0,0,0.3)` }}>
    <Token sign={sign} d={46} /><span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: size, lineHeight: 1.1, color: SK.ink }}>{text}</span></div>;
}
const comma = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

// ---- Drawn props (flat) --------------------------------------------------------------
function PriceTag({ cx, cy, s = 1, text = "₹", lt, at, color = SK.gold }) {
  const o = pop(lt, at, 0.6); if (o <= 0) return null;
  const swing = 7 * Math.sin((lt - at) * 2.4) * Math.exp(-(lt - at) * 0.25);
  return (
    <SVG op={clamp(o, 0, 1)}>
      <g transform={`translate(${cx} ${cy}) rotate(${swing}) scale(${s * (0.8 + 0.2 * o)})`}>
        <line x1={0} y1={-130} x2={0} y2={-70} stroke={SK.cream} strokeWidth={4} />
        <path d="M0 -84 L74 -36 L74 76 L-74 76 L-74 -36 Z" fill={color} stroke={SK.ink} strokeWidth={4} strokeLinejoin="round" />
        <circle cx={0} cy={-46} r={11} fill={SK.bgDeep} />
        <text x={0} y={46} textAnchor="middle" fontFamily={SANS} fontWeight="700" fontSize={text.length > 2 ? 40 : 76} fill={SK.ink}>{text}</text>
      </g>
    </SVG>
  );
}
function NoFuel({ cx, cy, s = 1, lt, at }) {
  const o = pop(lt, at, 0.6); if (o <= 0) return null;
  const cross = reveal(lt, at + 0.45, 0.4);
  return (
    <SVG op={clamp(o, 0, 1)}>
      <g transform={`translate(${cx} ${cy}) scale(${s})`}>
        <rect x={-55} y={-85} width={84} height={170} rx={10} fill={SK.cream} />
        <rect x={-40} y={-68} width={54} height={48} rx={5} fill="#7FB8D6" />
        <path d="M29 -50 L58 -30 L58 40 Q58 56 44 52 L44 12" stroke={SK.cream} strokeWidth={8} fill="none" strokeLinecap="round" />
        <circle r={112} stroke={BAD} strokeWidth={16} fill="none" opacity={cross} />
        <line x1={-79} y1={-79} x2={-79 + 158 * cross} y2={-79 + 158 * cross} stroke={BAD} strokeWidth={16} strokeLinecap="round" opacity={cross > 0 ? 1 : 0} />
      </g>
    </SVG>
  );
}
function Clock({ cx, cy, r = 90, turns = 0, op = 1 }) {
  if (op <= 0) return null;
  return (
    <SVG op={op}>
      <circle cx={cx} cy={cy} r={r + 10} fill="rgba(5,30,22,0.8)" />
      <circle cx={cx} cy={cy} r={r} fill={SK.cream} stroke={SK.gold} strokeWidth={6} />
      {Array.from({ length: 12 }, (_, i) => <line key={i} x1={cx} y1={cy - r + 6} x2={cx} y2={cy - r + 18} stroke={SK.ink} strokeWidth={4} transform={`rotate(${i * 30} ${cx} ${cy})`} />)}
      <line x1={cx} y1={cy} x2={cx} y2={cy - r * 0.8} stroke={SK.ink} strokeWidth={5} strokeLinecap="round" transform={`rotate(${turns * 360} ${cx} ${cy})`} />
      <line x1={cx} y1={cy} x2={cx} y2={cy - r * 0.5} stroke={BAD} strokeWidth={8} strokeLinecap="round" transform={`rotate(${turns * 30} ${cx} ${cy})`} />
      <circle cx={cx} cy={cy} r={7} fill={SK.ink} />
    </SVG>
  );
}
function Stopwatch({ cx, cy, r = 130, p = 0, label, op = 1 }) {
  if (op <= 0) return null;
  const C = 2 * Math.PI * (r - 16);
  return (
    <SVG op={op}>
      <rect x={cx - 20} y={cy - r - 40} width={40} height={30} rx={6} fill={SK.gold} />
      <circle cx={cx} cy={cy} r={r} fill={SK.cream} stroke={SK.gold} strokeWidth={8} />
      <circle cx={cx} cy={cy} r={r - 16} stroke={SK.gold} strokeWidth={22} strokeDasharray={`${C * p} ${C}`} transform={`rotate(-90 ${cx} ${cy})`} opacity={0.55} />
      <line x1={cx} y1={cy} x2={cx} y2={cy - r + 26} stroke={SK.ink} strokeWidth={6} strokeLinecap="round" transform={`rotate(${p * 360} ${cx} ${cy})`} />
      <text x={cx} y={cy + r * 0.52} textAnchor="middle" fontFamily={SANS} fontWeight="700" fontSize={r * 0.34} fill={SK.ink}>{label}</text>
    </SVG>
  );
}
function Gauge({ cx, cy, r = 120, p, label }) {
  const a = lerp(-120, 120, p);
  return (
    <SVG op={1}>
      <path d={`M${cx - r * 0.866} ${cy + r * 0.5} A ${r} ${r} 0 1 1 ${cx + r * 0.866} ${cy + r * 0.5}`} stroke="rgba(255,255,255,0.3)" strokeWidth={18} fill="none" strokeLinecap="round" />
      <path d={`M${cx - r * 0.866} ${cy + r * 0.5} A ${r} ${r} 0 1 1 ${cx + r * 0.866} ${cy + r * 0.5}`} stroke={p < 0.35 ? BAD : SK.gold} strokeWidth={18} fill="none" strokeLinecap="round" pathLength="1" strokeDasharray={`${p} 1`} />
      <line x1={cx} y1={cy} x2={cx} y2={cy - r * 0.8} stroke={SK.cream} strokeWidth={7} strokeLinecap="round" transform={`rotate(${a} ${cx} ${cy})`} />
      <circle cx={cx} cy={cy} r={12} fill={SK.cream} />
      <T x={cx} y={cy + r * 0.86} size={28} bold color={SK.cream}>{label}</T>
    </SVG>
  );
}
function Wheel({ cx, cy, r = 110, a = 0 }) {
  return (
    <SVG op={1}>
      <g transform={`rotate(${a} ${cx} ${cy})`} stroke={SK.cream} fill="none">
        <circle cx={cx} cy={cy} r={r} strokeWidth={20} /><circle cx={cx} cy={cy} r={20} strokeWidth={14} />
        <line x1={cx - r} y1={cy} x2={cx - 20} y2={cy} strokeWidth={16} /><line x1={cx + 20} y1={cy} x2={cx + r} y2={cy} strokeWidth={16} /><line x1={cx} y1={cy + 20} x2={cx} y2={cy + r} strokeWidth={16} />
      </g>
    </SVG>
  );
}
function Grid({ x, y, size, n = 10, filled = 0, color = SK.gold, lines = 1 }) {
  const c = size / n;
  return (
    <g>
      <rect x={x} y={y} width={size} height={size} fill={SK.soil} stroke={SK.cream} strokeWidth={3} />
      {Array.from({ length: Math.min(filled, n * n) }, (_, i) => <rect key={i} x={x + (i % n) * c + 1} y={y + Math.floor(i / n) * c + 1} width={c - 2} height={c - 2} fill={color} />)}
      <g opacity={lines}>{Array.from({ length: n - 1 }, (_, i) => <g key={i}><line x1={x + (i + 1) * c} y1={y} x2={x + (i + 1) * c} y2={y + size} stroke="rgba(255,255,255,0.55)" strokeWidth={2} />
        <line x1={x} y1={y + (i + 1) * c} x2={x + size} y2={y + (i + 1) * c} stroke="rgba(255,255,255,0.55)" strokeWidth={2} /></g>)}</g>
    </g>
  );
}
function Tractor({ x, y, s = 1, color = BLUE, op = 1, flip = false }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} opacity={op}>
      <rect x={-18} y={-40} width={70} height={26} rx={6} fill={color} />
      <path d="M-34 -14 L-34 -70 L6 -70 L6 -40 L-18 -40 L-18 -14 Z" fill={color} opacity={0.85} />
      <rect x={-29} y={-64} width={26} height={22} rx={3} fill="#CFE6F2" />
      <line x1={38} y1={-40} x2={38} y2={-62} stroke="#333" strokeWidth={5} strokeLinecap="round" />
      <circle cx={-24} cy={-4} r={25} fill="#1E1E1E" /><circle cx={-24} cy={-4} r={11} fill={SK.gold} />
      <circle cx={38} cy={6} r={15} fill="#1E1E1E" /><circle cx={38} cy={6} r={6} fill={SK.gold} />
    </g>
  );
}
function Whistle({ cx, cy, lt, at }) {
  const o = pop(lt, at, 0.45) * (1 - reveal(lt, at + 1.5, 0.4)); if (o <= 0) return null;
  const b = Math.sin(clamp((lt - at) / 1.2, 0, 1) * Math.PI);
  return (
    <SVG op={clamp(o, 0, 1)}>
      <g transform={`translate(${cx} ${cy}) rotate(-12) scale(${0.9 + 0.1 * o})`}>
        <circle r={62} cx={-20} cy={0} fill={SK.gold} stroke={SK.ink} strokeWidth={5} />
        <path d="M-10 -62 L100 -62 L100 -22 L34 -22 Z" fill={SK.gold} stroke={SK.ink} strokeWidth={5} strokeLinejoin="round" />
        <circle cx={-20} cy={0} r={18} fill={SK.ink} />
        {[0, 1, 2].map((i) => <path key={i} d={`M${118 + i * 22} ${-70 - i * 8} q 14 26 0 52`} stroke={SK.white} strokeWidth={6} fill="none" strokeLinecap="round" opacity={b} />)}
      </g>
    </SVG>
  );
}
const MAP = window.LP5_MAP;
function IndiaMap({ x, y, s = 1, op = 1, fill = "rgba(226,176,76,0.28)", outline = SK.cream }) {
  if (op <= 0 || !MAP) return null;
  return (
    <SVG op={op}>
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <path d={MAP.outline} fill={fill} stroke={outline} strokeWidth={3.5 / s} strokeLinejoin="round" />
        {MAP.islands.map((d, i) => <path key={i} d={d} fill={fill} stroke={outline} strokeWidth={2.2 / s} />)}
      </g>
    </SVG>
  );
}

// ============================================================================
function B1(ctx) {
  return ({ localTime: lt, duration }) => {
    const now = BEAT("b1").start + lt, cTools = W("b1", "team"), cMach = W("b1", "team", 1), cHere = S("b1", 3), cQ = W("b1", "which"),
      whistle = cMach + 0.75, stop = stopStart("b1");
    const dim = (at) => 0.5 * (1 - reveal(lt, at, 0.5));
    const k = lt - cMach, roar = k > 0 && k < 1.6 ? 4 * Math.sin(k * 42) * (1 - k / 1.6) : 0;
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[1]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(1, ctx, [L("BIG QUESTION", cQ - 0.3, "head"), L("Which is better for farming: traditional tools or modern machines?", cQ, "big"), L("Vote! Why?", stop, "think")])}>
        <Pic slot="duel_khurpi" label="A farmer kneels with a khurpi beside a small patch of soil" x={40} y={60} w={670} h={470} lt={lt} at={0.1} fx="zoom" dim={dim(cTools)} />
        <div style={{ position: "absolute", left: roar, top: -Math.abs(roar) * 0.5, width: 1920, height: 1080 }}>
          <Pic slot="duel_tractor" label="A tractor starts up at the edge of a big field" x={730} y={60} w={670} h={470} lt={lt} at={0.3} fx="zoom" dim={dim(cMach)} />
        </div>
        <Flag team="tools" x={375} y={448} lt={lt} at={cTools + 0.1} />
        <Flag team="machines" x={1065} y={448} lt={lt} at={cMach + 0.1} />
        {(() => { const o = pop(lt, cMach + 0.45, 0.5); return o > 0 && <div style={{ position: "absolute", left: 720 - 58, top: 236, width: 116, height: 116, borderRadius: 116, background: SK.gold, color: SK.ink, opacity: clamp(o, 0, 1), transform: `scale(${o})`,
          display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SERIF, fontWeight: 700, fontSize: 54, boxShadow: "0 0 0 5px #fff, 0 6px 20px rgba(0,0,0,0.4)" }}>VS</div>; })()}
        <Whistle cx={300} cy={850} lt={lt} at={whistle} />
        <Scoreboard now={now} x={40} y={556} w={560} rows={2} inO={out3(lt, whistle + 0.2, 0.5)} />
        <Card x={620} y={556} w={780} h={354} lt={lt} at={cHere} pad={28}>
          <Badge text="BIG QUESTION" x={28} y={24} lt={lt} at={cHere} size={30} />
          <div style={{ position: "absolute", left: 28, top: 106, width: 724, fontFamily: SERIF, fontWeight: 700, fontSize: 48, lineHeight: 1.18, color: SK.white, opacity: out3(lt, cQ, 0.6) }}>
            Which is better for farming: <span style={{ color: "#E8B98A" }}>traditional tools</span> or <span style={{ color: "#9CCBF5" }}>modern machines</span>?</div>
        </Card>
        <StopBox lt={lt} b="b1" question="Vote!">
          <div style={{ display: "flex", gap: 40, marginTop: 34 }}>
            {["tools", "machines"].map((k2) => <div key={k2} style={{ width: 540, padding: "30px 20px", borderRadius: 20, background: TEAM[k2].c, boxShadow: "0 0 0 3px rgba(255,255,255,0.7)" }}>
              <div style={{ fontFamily: SANS, fontSize: 34, color: SK.white }}>Hands up for</div>
              <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 54, color: SK.white, marginTop: 6 }}>{TEAM[k2].name}</div></div>)}
          </div>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 72, color: SK.gold, marginTop: 40 }}>Why?</div>
        </StopBox>
      </Scene>
    );
  };
}
function B2(ctx) {
  const tools = [["hero_plough", "plough", "plough"], ["sickle", "sickle", "sickle"], ["hoe", "hoe", "hoe"], ["khurpi", "khurpi", "khurpi"]];
  return ({ localTime: lt, duration }) => {
    const now = BEAT("b2").start + lt, cMeet = S("b2", 0), ats = tools.map((t) => W("b2", t[2])), cCheap = W("b2", "cheap"), cEasy = W("b2", "easy"), cNo = W("b2", "no"),
      cSmall = W("b2", "small"), cCare = W("b2", "careful"), cWeed = W("b2", "weeding");
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[2]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(2, ctx, [L("TEAM TOOLS", cMeet, "head"), L("plough · sickle · hoe · khurpi", ats[0]), L("+ CHEAP to buy", cCheap), L("+ EASY to look after", cEasy), L("+ NO FUEL needed", cNo),
          L("+ great for SMALL farms and CAREFUL work", cSmall, "big")], { max: 7 })}>
        {tools.map(([slot, name], i) => { const x = 40 + i * 245; return <React.Fragment key={slot}>
          <Pic slot={slot} label={name} x={x} y={60} w={225} h={300} lt={lt} at={ats[i]} fx="pop" pos={slot === "hero_plough" ? "80% center" : "center"} />
          <Chip text={name} x={x + 112} y={306} lt={lt} at={ats[i] + 0.15} size={28} tone="green" />
        </React.Fragment>; })}
        <Flag team="tools" x={520} y={190} lt={lt} at={cMeet} op={1 - reveal(lt, ats[0], 0.35)} size={54} />
        <Card x={40} y={384} w={306} h={376} lt={lt} at={cCheap} />
        <PriceTag cx={193} cy={560} s={1.25} text="₹" lt={lt} at={cCheap} />
        <Chip text="CHEAP to buy" x={193} y={698} lt={lt} at={cCheap + 0.2} tone="gold" size={28} />
        <Pic slot="sharpen_tool" label="A farmer sharpens and oils a tool" x={367} y={384} w={306} h={376} lt={lt} at={cEasy} fx="zoom" />
        <Chip text="EASY to look after" x={520} y={698} lt={lt} at={cEasy + 0.2} tone="gold" size={28} />
        <Card x={694} y={384} w={306} h={376} lt={lt} at={cNo} />
        <NoFuel cx={847} cy={550} s={1} lt={lt} at={cNo} />
        <Chip text="NO fuel at all" x={847} y={698} lt={lt} at={cNo + 0.2} tone="gold" size={28} />
        <Big x={40} y={786} w={960} lt={lt} at={cSmall} size={46} align="center"><span style={{ color: SK.gold }}>Perfect for SMALL farms</span></Big>
        <Big x={40} y={846} w={960} lt={lt} at={cCare} size={38} align="center">and for careful jobs</Big>
        <Scoreboard now={now} x={1040} y={60} />
        <Pic slot="weed_seedlings" label="Gently weeding between tiny seedlings" x={1040} y={500} w={360} h={420} lt={lt} at={cWeed} fx="zoom" zoom={1.2} />
      </Scene>
    );
  };
}
function B3(ctx) {
  return ({ localTime: lt, duration }) => {
    const now = BEAT("b3").start + lt, cWeak = W("b3", "weakness"), cSlow = W("b3", "slow"), cTir = W("b3", "tiring"), cBack = S("b3", 2);
    const heat = 0.14 + 0.08 * Math.sin(lt * 2.2);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[3]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(3, ctx, [L("TEAM TOOLS", 0.2, "head"), L("− SLOW", cSlow, "big"), L("− physically TIRING", cTir, "big")])}>
        <Pic slot="sore_back" label="A tired farmer stretches his sore back in the hot sun" x={40} y={60} w={960} h={620} lt={lt} at={0.1} fx="zoom" />
        <div style={{ position: "absolute", left: 40, top: 60, width: 960, height: 620, borderRadius: 18, background: `radial-gradient(70% 70% at 85% 5%, rgba(255,190,70,${heat * 2}), rgba(255,120,30,0) 70%)`, opacity: out3(lt, cTir, 0.8) }} />
        <Clock cx={170} cy={190} r={92} turns={Math.max(0, lt - cSlow) * 1.4} op={out3(lt, cSlow, 0.4)} />
        <Tag text="Look at that sore back!" x={560} y={84} lt={lt} at={cBack} size={36} />
        <Fact sign="−" text="SLOW" x={40} y={704} w={470} h={190} size={64} lt={lt} at={cSlow} />
        <Fact sign="−" text="TIRING" x={530} y={704} w={470} h={190} size={64} lt={lt} at={cTir} />
        <Scoreboard now={now} x={1040} y={60} />
        <Pic slot="hoe" label="Working by hand with a hoe" x={1040} y={500} w={360} h={420} lt={lt} at={cWeak} fx="zoom" zoom={1.2} />
        <Chip text="on and on…" x={1220} y={860} lt={lt} at={cSlow + 0.3} size={28} />
      </Scene>
    );
  };
}
function Tag({ text, x, y, lt, at, out = null, size = 26 }) {
  const o = pop(lt, at) * (out != null ? 1 - reveal(lt, out, 0.4) : 1); if (o <= 0) return null;
  return <div style={{ position: "absolute", left: x, top: y, transform: `translateX(-50%) scale(${0.9 + 0.1 * o})`, transformOrigin: "center top", opacity: clamp(o, 0, 1), fontFamily: SANS, fontWeight: 700,
    fontSize: size, color: SK.white, background: BAD, padding: "6px 20px", borderRadius: 999, whiteSpace: "nowrap", boxShadow: "0 2px 10px rgba(0,0,0,0.3)" }}>{text}</div>;
}
function B4(ctx) {
  const mach = [["tractor_wide", "tractor", "A tractor ploughs wide strips of a big field", "tractor", 0], ["power_tiller", "power tiller", "A power tiller churns the soil on a smaller plot", "power", 0], ["seed_drill", "seed drill", "A seed drill behind a tractor sows neat rows", "sow", 0], ["combine_wide", "harvester", "A combine harvester cuts a golden wheat field", "harvester", 0]];
  return ({ localTime: lt, duration }) => {
    const now = BEAT("b4").start + lt, cMeet = S("b4", 0), ats = mach.map((m) => W("b4", m[3], m[4])), cPrep = W("b4", "prepare"), cSow = W("b4", "sow"), cHarv = W("b4", "harvest", 1), cMuch = W("b4", "much");
    const g = 0.12 + 0.82 * drive(lt, cPrep, cMuch + 0.7) + 0.02 * Math.sin(lt * 20);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[4]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(4, ctx, [L("TEAM MACHINES", cMeet, "head"), L("tractor · power tiller · harvester", ats[0]), L("+ PREPARE fields", cPrep), L("+ SOW seeds", cSow), L("+ HARVEST crops", cHarv), L("MUCH FASTER", cMuch, "big")], { max: 7 })}>
        {mach.map(([slot, name, label], i) => { const x = 40 + (i % 2) * 490, y = 60 + Math.floor(i / 2) * 340; return <React.Fragment key={slot}>
          <Pic slot={slot} label={label} x={x} y={y} w={470} h={320} lt={lt} at={i === 3 ? ats[3] : ats[i]} fx={i % 2 ? "pan" : "zoom"} />
          <Chip text={name} x={x + 235} y={y + 266} lt={lt} at={ats[i] + 0.15} size={28} tone="green" />
        </React.Fragment>; })}
        <Flag team="machines" x={520} y={330} lt={lt} at={cMeet} op={1 - reveal(lt, ats[0], 0.35)} size={54} />
        <Big x={40} y={770} w={960} lt={lt} at={cMuch} size={70} align="center"><span style={{ color: SK.gold }}>MUCH, much faster!</span></Big>
        <Scoreboard now={now} x={1040} y={60} />
        {lt > cPrep - 0.3 && <div style={{ opacity: out3(lt, cPrep - 0.3, 0.5) }}><Card x={1040} y={500} w={360} h={420} lt={lt} at={cPrep - 0.3} /><Gauge cx={1220} cy={700} r={130} p={clamp(g, 0, 1)} label="speed" /></div>}
      </Scene>
    );
  };
}
function B5(ctx) {
  return ({ localTime: lt, duration }) => {
    const now = BEAT("b5").start + lt, cExp = W("b5", "expensive"), cFuel = W("b5", "fuel"), cSkill = W("b5", "skilled"), cDrive = W("b5", "drive"), cIntro = S("b5", 0);
    const fuelP = 0.9 - 0.75 * drive(lt, cFuel, cFuel + 2.2);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[5]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(5, ctx, [L("TEAM MACHINES", cIntro, "head"), L("− EXPENSIVE to buy", cExp, "big"), L("− need FUEL", cFuel, "big"), L("− need SKILLED operators", cSkill, "big"), L("Pluses and minuses?", stopStart("b5"), "think")])}>
        <Pic slot="tractor_new" label="A shiny new tractor" x={40} y={60} w={960} h={610} lt={lt} at={0.1} out={cFuel} fx="zoom" />
        <Pic slot="fuel_fill" label="Fuel being poured into a tractor's tank" x={40} y={60} w={960} h={610} lt={lt} at={cFuel} out={cSkill} fx="zoom" />
        <Pic slot="driver_trained" label="A trained driver at the controls while a beginner looks confused" x={40} y={60} w={960} h={610} lt={lt} at={cSkill} fx="zoom" />
        <Chip text="trained driver ✓" x={270} y={84} lt={lt} at={cSkill + 0.3} tone="gold" size={30} />
        <Chip text="beginner ?" x={770} y={84} lt={lt} at={cDrive} size={30} />
        <Fact sign="−" text="EXPENSIVE to buy" x={40} y={694} w={306} h={200} size={40} lt={lt} at={cExp} />
        <Fact sign="−" text="need FUEL" x={367} y={694} w={306} h={200} size={40} lt={lt} at={cFuel} />
        <Fact sign="−" text="need SKILLED people" x={694} y={694} w={306} h={200} size={40} lt={lt} at={cSkill} />
        <Scoreboard now={now} x={1040} y={60} />
        <Card x={1040} y={500} w={360} h={420} lt={lt} at={cExp - 0.2} />
        {lt < cFuel + 0.1 && <PriceTag cx={1220} cy={720} s={1.5} text="₹₹₹₹" color="#FF8A7A" lt={lt} at={cExp} />}
        {lt >= cFuel + 0.1 && lt < cSkill + 0.1 && <Gauge cx={1220} cy={700} r={130} p={fuelP} label="fuel" />}
        {lt >= cSkill + 0.1 && <Wheel cx={1220} cy={710} r={120} a={40 * Math.sin((lt - cSkill) * 1.6)} />}
        <StopBox lt={lt} b="b5" heading="HAVE YOU UNDERSTOOD?" question="Name two pluses and two minuses for each team" qSize={46}>
          <div style={{ position: "relative", width: 900, height: 600, marginTop: 18 }}><Scoreboard now={now + 1000} x={0} y={0} w={560} scale={1.6} /></div>
        </StopBox>
      </Scene>
    );
  };
}
function B6(ctx) {
  return ({ localTime: lt, duration }) => {
    const cTime = S("b6", 0), cOne = S("b6", 1), cFive = W("b6", "five"), cLoos = W("b6", "loosen"), cMetre = W("b6", "one", 1), cSo = S("b6", 2), cWhole = W("b6", "whole"), stop = stopStart("b6");
    const z = drive(lt, cSo + 0.2, cWhole + 0.8);
    const bx = lerp(40, 620, z), by = lerp(60, 470, z), bw = lerp(960, 34, z), bh = lerp(640, 34, z);
    const sw = clamp((lt - cLoos) / Math.max(1, cSo - cLoos), 0, 1);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[6]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(6, ctx, [L("One person takes 5 MINUTES to loosen 1 square metre of soil.", cFive, "big"), L("How long for a WHOLE field?", cSo, "head")])}>
        <Badge text="MATHS CHALLENGE!" x={1040} y={70} lt={lt} at={cTime} size={32} />
        <Pic slot="wide_field" label="A whole field around the tiny square" x={40} y={60} w={960} h={640} lt={lt} at={cSo} fx="none" />
        <Pic slot="soil_square" label="A 1 metre by 1 metre square of soil marked with string" x={bx} y={by} w={bw} h={bh} lt={lt} at={cOne} fx="none" r={lerp(18, 3, z)} style={{ boxShadow: `0 0 0 ${lerp(3, 5, z)}px ${SK.gold}` }} />
        <Chip text="1 m" x={520} y={78} lt={lt} at={cMetre} out={cSo} tone="gold" size={30} />
        <Chip text="1 m" x={70} y={360} lt={lt} at={cMetre + 0.3} out={cSo} tone="gold" size={30} anchor="left" />
        <Chip text="that tiny square is 1 m × 1 m" x={520} y={520} lt={lt} at={cWhole - 0.2} tone="gold" size={28} />
        <Stopwatch cx={1220} cy={340} r={150} p={sw} label={sw >= 1 ? "5 min" : `${Math.floor(sw * 5)}:${String(Math.floor((sw * 300) % 60)).padStart(2, "0")}`} op={out3(lt, cFive, 0.5)} />
        <Big x={1040} y={540} w={360} lt={lt} at={cFive + 0.2} size={44} align="center"><span style={{ color: SK.gold }}>5 minutes</span><br /><span style={{ fontSize: 32 }}>for 1 square metre</span></Big>
        <Big x={40} y={740} w={1360} lt={lt} at={cSo} size={60} align="center">How long for a <span style={{ color: SK.gold }}>WHOLE</span> field?</Big>
        <StopBox lt={lt} b="b6" heading="WORK IT OUT!" question="The field is 10 m × 10 m.">
          <div style={{ display: "flex", gap: 70, alignItems: "center", marginTop: 26 }}>
            <svg width="520" height="520" viewBox="0 0 520 520"><Grid x={6} y={6} size={508} /></svg>
            <div style={{ textAlign: "left" }}>{["How many squares?", "How many minutes?", "How many hours?"].map((q) => <div key={q} style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 52, color: SK.white, marginBottom: 34 }}>{q}</div>)}
              <div style={{ fontFamily: SANS, fontSize: 34, color: SK.gold }}>1 square = 5 minutes</div></div>
          </div>
        </StopBox>
      </Scene>
    );
  };
}
function B7(ctx) {
  return ({ localTime: lt, duration }) => {
    const cHund = W("b7", "one"), cTimes = S("b7", 2), cFive = W("b7", "five", 1), cEight = W("b7", "eight"), cAcre = S("b7", 3), cThat = S("b7", 4), cTwenty = W("b7", "twenty"), cForty = W("b7", "forty"),
      cMach = S("b7", 5), cHours = W("b7", "hours", 1);
    const FX = 60, FY = 80, FS = 640, gs = lerp(FS, 101, drive(lt, cAcre, cAcre + 1.7));
    const filled = Math.round(100 * drive(lt, cHund, cEight + 0.3));
    const phaseA = 1 - reveal(lt, cAcre, 0.4), mins = lt < cAcre ? 500 * drive(lt, cTimes, cFive + 0.6) : 500 + 19500 * drive(lt, cTwenty - 0.2, cForty + 0.2);
    const days = Math.round(42 * drive(lt, cTwenty, cForty + 0.8)), phaseB = out3(lt, cAcre + 0.5, 0.5) * (1 - reveal(lt, cMach, 0.4));
    const p = drive(lt, cMach, duration - 0.4) * 8, pass = Math.min(7, Math.floor(p)), f = p - pass, stripH = FS / 8, tx = pass % 2 ? FX + FS * (1 - f) : FX + FS * f, ty = FY + pass * stripH + stripH * 0.72;
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[7]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(7, ctx, [L("10 m × 10 m = 100 squares", cHund), L("100 × 5 min = 500 MINUTES", cFive), L("(about 8 HOURS)", cEight, "sub"), L("1 ACRE ≈ 4,000 squares", cThat), L("4,000 × 5 min = 20,000 MINUTES", cTwenty), L("(over 40 working DAYS!)", cForty, "sub"),
          L("A machine: just a few HOURS!", cMach, "big")], { max: 8 })}>
        <SVG op={out3(lt, 0.1, 0.5)}>
          <rect x={FX} y={FY} width={FS} height={FS} fill={SK.soil} opacity={0.9 * reveal(lt, cAcre, 0.8)} />
          <g opacity={reveal(lt, cAcre + 0.6, 0.8) * 0.4}>{Array.from({ length: 62 }, (_, i) => <g key={i}><line x1={FX + (i + 1) * 10.1} y1={FY} x2={FX + (i + 1) * 10.1} y2={FY + FS} stroke="#fff" strokeWidth={0.7} /><line x1={FX} y1={FY + (i + 1) * 10.1} x2={FX + FS} y2={FY + (i + 1) * 10.1} stroke="#fff" strokeWidth={0.7} /></g>)}</g>
          {Array.from({ length: 8 }, (_, i) => { const w = i < pass ? FS : i === pass && lt > cMach ? FS * f : 0; return w > 0 && <rect key={i} x={i % 2 && i >= pass ? FX + FS - w : FX} y={FY + i * stripH} width={w} height={stripH} fill="#3A2A20" />; })}
          <Grid x={FX} y={FY} size={gs} filled={filled} lines={clamp((gs - 200) / 200, 0.2, 1)} />
          <rect x={FX} y={FY} width={FS} height={FS} fill="none" stroke={SK.cream} strokeWidth={3} opacity={reveal(lt, cAcre, 0.8)} />
          {lt > cMach && <Tractor x={tx} y={ty} s={0.85} flip={pass % 2 === 1} />}
        </SVG>
        <Chip text="10 m" x={FX + 320} y={FY - 26} lt={lt} at={0.3} out={cAcre} tone="gold" size={26} />
        <Chip text="1 acre: about 4,000 squares" x={FX + 320} y={FY + FS + 18} lt={lt} at={cThat} tone="gold" size={30} />
        <div style={{ position: "absolute", inset: 0, opacity: phaseA }}>
          <Lines x={760} y={84} w={640} lt={lt} lines={[{ text: "10 × 10 = 100 squares", at: cHund, size: 54, bold: true, serif: true }, { text: "100 × 5 minutes =", at: cTimes, size: 46 }]} />
          <div style={{ position: "absolute", left: 760, top: 300, fontFamily: SERIF, fontWeight: 700, fontSize: 104, color: SK.gold, opacity: out3(lt, cTimes, 0.4) }}>{comma(mins)} <span style={{ fontSize: 50 }}>minutes</span></div>
          <div style={{ position: "absolute", left: 760, top: 470, opacity: out3(lt, cEight, 0.5), fontFamily: SERIF, fontWeight: 700, fontSize: 58, color: SK.white, lineHeight: 1.15 }}>about 8 HOURS<div style={{ fontFamily: SANS, fontWeight: 400, fontSize: 36, color: SK.dim, marginTop: 8 }}>of hard work</div></div>
        </div>
        <Clock cx={1300} cy={560} r={84} turns={drive(lt, cTimes, cEight + 0.4) * 8} op={out3(lt, cTimes, 0.4) * phaseA} />
        <div style={{ position: "absolute", inset: 0, opacity: out3(lt, cAcre + 0.5, 0.5) }}>
          <Lines x={760} y={84} w={640} lt={lt} lines={[{ text: "1 acre ≈ 4,000 squares", at: cThat, size: 46, bold: true, serif: true }, { text: "4,000 × 5 minutes =", at: cTwenty - 0.4, size: 40 }]} />
          <div style={{ position: "absolute", left: 760, top: 212, fontFamily: SERIF, fontWeight: 700, fontSize: 88, color: SK.gold, opacity: out3(lt, cTwenty - 0.4, 0.4) }}>{comma(mins)} <span style={{ fontSize: 42 }}>minutes</span></div>
        </div>
        {phaseB > 0 && <div style={{ position: "absolute", left: 760, top: 350, width: 640, opacity: phaseB }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 54px)", gap: 8 }}>{Array.from({ length: 42 }, (_, i) => <div key={i} style={{ height: 54, borderRadius: 7, background: i < days ? SK.gold : "rgba(255,255,255,0.14)" }} />)}</div>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 52, color: SK.white, marginTop: 20, opacity: out3(lt, cForty, 0.4) }}>more than 40 working days!</div>
        </div>}
        <Pic slot="tractor_wide" label="A tractor ploughs wide strips of a big field" x={760} y={350} w={640} h={330} lt={lt} at={cMach} fx="zoom" />
        <Big x={60} y={820} w={1340} lt={lt} at={cHours - 0.4} size={60} align="center">A machine: just a few <span style={{ color: SK.gold }}>HOURS!</span></Big>
      </Scene>
    );
  };
}
function Lines({ x, y, w, lt, lines, size = 30, color = SK.white, gap = 14 }) {
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w }}>
      {lines.map((l, i) => { const o = out3(lt, l.at, 0.6) * (l.out != null ? 1 - reveal(lt, l.out, 0.4) : 1); if (o <= 0) return null;
        return <div key={i} style={{ opacity: o, transform: `translateY(${(1 - o) * 10}px)`, marginBottom: gap, fontFamily: l.serif ? SERIF : SANS, fontWeight: l.bold ? 700 : 400,
          fontSize: l.size || size, lineHeight: 1.2, color: l.color || color }}>{l.text}</div>; })}
    </div>
  );
}
function B8(ctx) {
  const rent = [["tractors", "tractors"], ["seed drills", "seed"], ["threshers", "threshers"]];
  return ({ localTime: lt, duration }) => {
    const cQ = S("b8", 0), cBuy = W("b8", "buying"), cHire = W("b8", "hire"), cOnly = W("b8", "only"), cCentre = S("b8", 2), cRent = W("b8", "rent"), cFee = W("b8", "small", 1), ats = rent.map((r) => W("b8", r[1])),
      cBreak = SE("b8", 2) + 0.15;
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[8]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(8, ctx, [L("SMART IDEA", cQ, "head"), L("Small farmers HIRE machines when they need them", cHire, "big"), L("CUSTOM HIRING CENTRES", cCentre, "head"), L("rent out tractors, seed drills, threshers and sprayers", cRent)])}>
        <Pic slot="farmer_price" label="A small farmer looks at the price of a tractor and shakes his head" x={40} y={60} w={880} h={620} lt={lt} at={0.1} out={cHire} fx="zoom" />
        <Pic slot="chc_pay" label="The farmer pays a small fee" x={40} y={60} w={880} h={620} lt={lt} at={cHire} out={cOnly} fx="zoom" />
        <Pic slot="hired_tractor" label="The hired tractor ploughs his small field for a day" x={40} y={60} w={880} h={620} lt={lt} at={cOnly} out={cCentre} fx="zoom" />
        <Pic slot="chc_yard" label="A village Custom Hiring Centre" x={40} y={60} w={880} h={620} lt={lt} at={cCentre} fx="zoom" />
        <Card x={950} y={60} w={450} h={620} lt={lt} at={cQ} out={cCentre} />
        {lt < cCentre + 0.5 && <div style={{ position: "absolute", inset: 0, opacity: 1 - reveal(lt, cCentre, 0.4) }}>
          <Big x={970} y={90} w={410} lt={lt} at={cBuy} size={46} align="center">BUY it?</Big>
          <PriceTag cx={1175} cy={320} s={1.2} text="₹₹₹₹" color="#FF8A7A" lt={lt} at={cBuy} />
          <Big x={970} y={430} w={410} lt={lt} at={cHire} size={46} align="center"><span style={{ color: SK.gold }}>HIRE it!</span></Big>
          <Big x={970} y={510} w={410} lt={lt} at={cOnly} size={36} align="center">only when you need it</Big>
        </div>}
        {(() => { const o = out3(lt, cCentre, 0.6); return o > 0 && <div style={{ position: "absolute", left: 950, top: 60, width: 450, height: 620, boxSizing: "border-box", padding: "26px 28px", borderRadius: 18, background: "#6B4423", boxShadow: "0 0 0 8px #3F2813, 0 10px 26px rgba(0,0,0,0.4)", opacity: o, transform: `translateY(${(1 - o) * 16}px)` }}>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 44, lineHeight: 1.1, color: SK.gold, textAlign: "center" }}>CUSTOM HIRING CENTRE</div>
          <div style={{ fontFamily: SANS, fontSize: 30, color: SK.cream, textAlign: "center", margin: "10px 0 20px", opacity: out3(lt, cRent, 0.4) }}>for rent</div>
          {[...rent.map((r, i) => [r[0], ats[i]]), ["sprayers", ats[2] + 0.5]].map(([name, at]) => <div key={name} style={{ fontFamily: SANS, fontWeight: 700, fontSize: 40, color: SK.white, padding: "9px 0", borderTop: "2px solid rgba(255,255,255,0.25)", opacity: out3(lt, at, 0.4) }}>✓ {name}</div>)}
        </div>; })()}
        <Fact sign="+" text="HIRE it: no need to buy one" x={40} y={706} w={880} h={100} size={40} lt={lt} at={cHire} />
        <Chip text="₹ for a small fee" x={1175} y={720} lt={lt} at={cFee} tone="gold" size={36} />
        <Big x={40} y={826} w={1360} lt={lt} at={cOnly} size={46} align="center">only when they need it</Big>
        <Break lt={lt} at={cBreak} dur={2.2} />
      </Scene>
    );
  };
}
function B9(ctx) {
  return ({ localTime: lt, duration }) => {
    const cWow = S("b9", 0), cInd = S("b9", 1), cBig = W("b9", "biggest"), c13 = W("b9", "2013"), cThree = W("b9", "three"), cMade = W("b9", "india", 1), cHelp = S("b9", 3), cAnim = W("b9", "much"), cYet = S("b9", 4), cStill = W("b9", "still"),
      cFact = (cThree + cMade) / 2;
    const phA = 1 - reveal(lt, cHelp, 0.4), phB = out3(lt, cHelp, 0.4) * (1 - reveal(lt, cYet, 0.4)), wowS = reveal(lt, cInd - 0.1, 0.5);
    const lit = Math.round(10 * drive(lt, cThree, cThree + 1.2));
    const pile = Math.round(8 * drive(lt, cBig, cThree + 0.4));
    const PILE = [[-70, 0], [0, 0], [70, 0], [-35, -56], [35, -56], [0, -112], [-105, -28], [105, -28]];
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[9]} showCaps={ctx.caps} capSize={ctx.capSize} fi={0.3}
        panel={panel(9, ctx, [L("INDIA is one of the world's BIGGEST tractor makers", cBig, "big"), L("Tractors prepare large fields much faster than animal-drawn ploughs", cHelp), L("Yet the humble SICKLE and KHURPI are still essential on many Indian farms!", cYet, "big")])}>
        <div style={{ position: "absolute", inset: 0, opacity: phA }}>
          <IndiaMap x={70} y={160} s={0.84} op={out3(lt, cInd, 0.6)} />
          <SVG op={1}>{PILE.slice(0, pile).map(([dx, dy], i) => <Tractor key={i} x={350 + dx} y={520 + dy} s={0.82} color={ORANGE} />)}</SVG>
          <Chip text="INDIA" x={380} y={600} lt={lt} at={cInd + 0.3} tone="gold" size={32} />
          <SVG op={out3(lt, c13, 0.5)}>{Array.from({ length: 10 }, (_, i) => <Tractor key={i} x={740 + (i % 5) * 134} y={190 + Math.floor(i / 5) * 118} s={1.2} color={i < 3 && i < lit ? ORANGE : "#7E9A8E"} />)}</SVG>
          <Big x={670} y={340} w={730} lt={lt} at={cFact} size={40} align="center"><span style={{ color: SK.gold }}>about 3 in every 10</span> tractors made in the world (2013)</Big>
          <Pic slot="tractor_factory" label="Tractors roll out of an Indian factory" x={720} y={470} w={640} h={400} lt={lt} at={cMade} fx="pan" />
          <div style={{ position: "absolute", left: 80, top: 880, width: 620, fontFamily: SANS, fontSize: 21, lineHeight: 1.2, color: SK.dim, opacity: out3(lt, cFact + 0.6, 0.6) }}>Source: Wikipedia – Tractors in India (619,000 tractors in 2013, 29% of world output)</div>
        </div>
        {phB > 0 && <div style={{ position: "absolute", inset: 0, opacity: phB }}>
          <Pic slot="hero_plough" label="An animal-drawn plough" x={40} y={170} w={560} h={480} lt={lt} at={cAnim} fx="zoom" />
          <Chip text="animal-drawn plough" x={320} y={590} lt={lt} at={cAnim + 0.2} size={30} />
          <Pic slot="tractor_wide" label="A tractor ploughs a big field" x={640} y={170} w={760} h={480} lt={lt} at={cHelp} fx="zoom" />
          <Chip text="tractor: much faster" x={1020} y={590} lt={lt} at={cHelp + 0.3} tone="gold" size={30} />
          <Big x={40} y={700} w={1360} lt={lt} at={cHelp + 0.4} size={48} align="center">Big fields, prepared <span style={{ color: SK.gold }}>much faster</span></Big>
        </div>}
        <Pic slot="farmer_sickle" label="A farmer in the same village still uses a sickle" x={40} y={170} w={960} h={700} lt={lt} at={cYet} fx="zoom" />
        <Pic slot="khurpi" label="The humble khurpi" x={1030} y={170} w={370} h={340} lt={lt} at={cYet + 0.5} fx="pop" />
        <Chip text="the humble khurpi" x={1215} y={452} lt={lt} at={cYet + 0.7} tone="green" size={28} />
        <Big x={1030} y={550} w={370} lt={lt} at={cStill} size={50} align="center"><span style={{ color: SK.gold }}>STILL</span> used on many Indian farms!</Big>
        {/* the orange WOW card opens the beat, then shrinks to a badge */}
        {(() => { const x = lerp(40, 40, wowS), y = lerp(60, 56, wowS), w = lerp(1360, 300, wowS), h = lerp(880, 96, wowS), o = out3(lt, cWow - 0.2, 0.35);
          return <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: lerp(26, 16, wowS), background: ORANGE, display: "flex", alignItems: "center", justifyContent: "center", opacity: o,
            boxShadow: "0 0 0 4px #fff, 0 10px 30px rgba(0,0,0,0.35)", fontFamily: SERIF, fontWeight: 700, fontSize: lerp(280, 60, wowS), color: SK.white, letterSpacing: "0.03em" }}>WOW!</div>; })()}
      </Scene>
    );
  };
}
function B10(ctx) {
  const jobs = [["tractor_wide", "ploughing 5 acres"], ["weed_seedlings", "weeding around seedlings"], ["combine_wide", "harvesting a huge wheat field"], ["prune_rose", "pruning a rose bush"], ["dig_kitchen", "digging a small kitchen garden"]];
  return ({ localTime: lt, duration }) => {
    const now = BEAT("b10").start + lt + 1000, cSur = S("b10", 0), cBest = S("b10", 1), cBoth = W("b10", "both"), cTog = W("b10", "together"), cBig = S("b10", 2), cMach = W("b10", "machine"), cSmall = S("b10", 3), cTool = W("b10", "tool"), cDep = S("b10", 4), cSize = W("b10", "size"), cTask = W("b10", "task");
    const walk = drive(lt, cSur, cTog + 0.2), ph1 = 1 - reveal(lt, cBig, 0.5), merge = out3(lt, cTog, 0.6);
    const fx = 200 + 150 * walk, mx = 840 - 170 * walk;
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[10]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(10, ctx, [L("THE BEST TEAM = TOOLS + MACHINES TOGETHER!", cTog, "big"), L("Big field, heavy work → machine", cBig), L("Small plot, careful work → hand tool", cSmall), L("It depends on the FARM SIZE and the TASK", cDep, "head")], { max: 6 })}>
        <div style={{ position: "absolute", inset: 0, opacity: ph1 }}>
          <Pic slot="team_handshake" label="The two teams shake hands" x={40} y={60} w={960} h={600} lt={lt} at={0.1} fx="zoom" />
          <Flag team="tools" x={fx} y={720} lt={lt} at={0.3} size={38} op={1 - merge} />
          <Flag team="machines" x={mx} y={720} lt={lt} at={0.3} size={38} op={1 - merge} />
          {merge > 0 && <div style={{ position: "absolute", left: 520, top: 700, transform: `translateX(-50%) scale(${0.8 + 0.2 * merge})`, opacity: merge, fontFamily: SERIF, fontWeight: 700, fontSize: 62, color: SK.ink, background: SK.gold, padding: "12px 46px", borderRadius: 16, boxShadow: "0 0 0 4px #fff", whiteSpace: "nowrap" }}>TEAM FARM</div>}
          <Scoreboard now={now} x={1040} y={60} op={1 - merge} />
          {merge > 0 && <div style={{ position: "absolute", left: 1040, top: 60, width: 360, height: 430, boxSizing: "border-box", padding: 16, borderRadius: 18, background: "rgba(5,30,22,0.82)", boxShadow: `0 0 0 2px ${SK.gold}`, opacity: merge }}>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 19, letterSpacing: "0.2em", color: SK.gold, textAlign: "center", marginBottom: 8 }}>SCOREBOARD</div>
            <div style={{ background: SK.gold, color: SK.ink, fontFamily: SERIF, fontWeight: 700, fontSize: 36, textAlign: "center", padding: "8px 4px", borderRadius: 10 }}>TEAM FARM</div>
            {[["+", "tools"], ["+", "machines"], ["+", "working together"]].map(([sg, label]) => <div key={label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "20px 8px 16px", borderBottom: "1px solid rgba(255,255,255,0.14)" }}><Token sign={sg} d={40} /><span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 34, color: SK.white }}>{label}</span></div>)}
          </div>}
          <Big x={40} y={810} w={960} lt={lt} at={cBoth} size={52} align="center"><span style={{ color: SK.gold }}>BOTH</span> teams, working <span style={{ color: SK.gold }}>TOGETHER!</span></Big>
        </div>
        <Pic slot="same_farm" label="One farm: a tractor in the big field, a khurpi in the kitchen garden" x={40} y={60} w={1360} h={500} lt={lt} at={cBig} fx="zoom" zoom={1.08} />
        <Fact sign="+" text="BIG field, heavy work → machine" x={40} y={580} w={670} h={130} size={36} lt={lt} at={cBig} />
        <Fact sign="+" text="SMALL plot, careful work → hand tool" x={730} y={580} w={670} h={130} size={36} lt={lt} at={cSmall} />
        <Big x={40} y={744} w={1360} lt={lt} at={cDep} size={58} align="center">It all depends on the <span style={{ color: SK.gold, opacity: out3(lt, cSize, 0.3) + 0.35 }}>FARM SIZE</span> and the <span style={{ color: SK.gold, opacity: out3(lt, cTask, 0.3) + 0.35 }}>TASK!</span></Big>
        <StopBox lt={lt} b="b10" heading="YOU DECIDE!" question="Tool or machine for each job? Why?" qSize={50}>
          <div style={{ display: "flex", gap: 16, marginTop: 34 }}>
            {jobs.map(([slot, text]) => <div key={slot} style={{ position: "relative", width: 242, height: 400, borderRadius: 18, background: SK.cream, overflow: "hidden", boxShadow: "0 8px 22px rgba(0,0,0,0.3)" }}>
              <Pic slot={slot} label={text} x={0} y={0} w={242} h={190} r={0} lt={1e3} at={0} fx="none" border={false} />
              <div style={{ position: "absolute", left: 14, right: 14, top: 206, fontFamily: SERIF, fontWeight: 700, fontSize: 34, lineHeight: 1.15, color: SK.ink }}>{text}</div>
            </div>)}
          </div>
        </StopBox>
      </Scene>
    );
  };
}
function B11(ctx) {
  return ({ localTime: lt, duration }) => {
    const now = BEAT("b11").start + lt + 1000, cQ = S("b11", 0), cNei = S("b11", 1), cTools = S("b11", 2), cMach = S("b11", 3), cHire = S("b11", 4), cBest = S("b11", 5), cRight = W("b11", "right"), stop = stopStart("b11");
    const ph1 = 1 - reveal(lt, cBest, 0.5);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[11]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(11, ctx, [L("Neither team wins alone.", cNei, "big"), L("TOOLS: cheap, no fuel, careful work", cTools), L("MACHINES: fast, big fields", cMach), L("Small farmers can HIRE machines", cHire), L("Use the RIGHT ONE for the JOB!", cBest, "big"),
          L("Quick check: compare with your vote", stop, "think")], { max: 7 })}>
        <div style={{ position: "absolute", inset: 0, opacity: ph1 }}>
          <Scoreboard now={now} x={40} y={60} w={560} scale={1.2} inO={out3(lt, 0.1, 0.5)} />
          <Card x={740} y={60} w={660} h={270} lt={lt} at={0.4} pad={20}>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 24, letterSpacing: "0.14em", color: SK.gold, textAlign: "center" }}>OUR VOTE AT STOP 1</div>
            <div style={{ display: "flex", gap: 24, marginTop: 18 }}>{["tools", "machines"].map((k2) => <div key={k2} style={{ flex: 1, textAlign: "center" }}>
              <div style={{ background: TEAM[k2].c, color: SK.white, fontFamily: SANS, fontWeight: 700, fontSize: 28, padding: "8px 4px", borderRadius: 10 }}>{TEAM[k2].name}</div>
              <div style={{ height: 96, marginTop: 12, borderRadius: 10, border: `3px dashed ${SK.cream}` }} /></div>)}</div>
          </Card>
          <Big x={740} y={350} w={660} lt={lt} at={cNei} size={58} align="center"><span style={{ color: SK.gold }}>Neither one wins on its own!</span></Big>
          <Fact sign="+" text="TOOLS: cheap, no fuel, careful work" x={40} y={640} w={670} h={120} size={34} lt={lt} at={cTools} />
          <Fact sign="+" text="MACHINES: fast, big fields" x={730} y={640} w={670} h={120} size={34} lt={lt} at={cMach} />
          <Big x={40} y={800} w={1360} lt={lt} at={cHire} size={54} align="center">Small farmers can <span style={{ color: SK.gold }}>HIRE</span> machines</Big>
        </div>
        <Pic slot="same_farm" label="The tractor and the farmer with the khurpi on the same farm" x={40} y={60} w={1360} h={660} lt={lt} at={cBest} fx="zoom" zoom={1.1} />
        <Big x={40} y={760} w={1360} lt={lt} at={cRight} size={68} align="center">The <span style={{ color: SK.gold }}>RIGHT</span> one for the <span style={{ color: SK.gold }}>RIGHT</span> job!</Big>
        <StopBox lt={lt} b="b11" heading="QUICK CHECK">
          <div style={{ marginTop: 30, textAlign: "left", width: 1180 }}>
            {QUICK.map((q, i) => <div key={i} style={{ display: "flex", gap: 22, alignItems: "baseline", marginTop: 16 }}>
              <span style={{ flex: "none", width: 44, fontFamily: SERIF, fontWeight: 700, fontSize: 42, color: SK.gold }}>{i + 1}</span>
              <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 40, lineHeight: 1.18, color: SK.white }}>{q}</span></div>)}
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
const COLLAGE = [{ slot: "hero_plough", x: -60, y: -40, w: 760, h: 520, ph: 0 }, { slot: "power_tiller", x: 640, y: -80, w: 760, h: 520, ph: 2 },
  { slot: "seed_drill", x: -80, y: 520, w: 700, h: 560, ph: 4 }, { slot: "khurpi", x: 560, y: 560, w: 820, h: 560, ph: 1 }];
function Lp19Scenes(props = {}) {
  const caps = props.showCaptions === "false" ? false : props.showCaptions !== false;
  const titles = {};
  for (let n = 1; n <= NB; n++) titles[n] = str(props["title" + n + "Text"], TITLES[n]);
  const ctx = { caps, titles, capSize: num(props.captionSize, 34) };
  const B = [B1, B2, B3, B4, B5, B6, B7, B8, B9, B10, B11];
  const beats = B.map((Bn, i) => { const t = BEAT("b" + (i + 1)); return [t.start, t.start + t.dur, Bn]; });
  return (
    <StoryFrame props={props} dur={DUR} persistKey="thinkpro-lp19-traditional-tools-vs-modern-machines" collage={COLLAGE}>
      {beats.map(([s, e, Bn], i) => (
        <Sprite key={i} start={s} end={e}>{Bn(ctx)}</Sprite>
      ))}
      {STOPS.map(([b, i, hold]) => <StopAt key={b} t={BEAT(b).start + stopAt(b, i)} hold={hold - 0.2} />)}
      <ChimeAt t={BEAT("b9").start + S("b9", 0, 0)} />
      <AudioSync />
    </StoryFrame>
  );
}
window.Lp19Scenes = Lp19Scenes;
