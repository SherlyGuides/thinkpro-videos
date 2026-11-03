/* global React, window */
// ThinkPro Academy — "Ancient and Modern Farming Methods" (Grade 6 Agriculture, Session 4, V1).
// After AG_G6_S4 Video Script Draft 1 (Subrata, 3 Nov 2026): 10 script scenes as 9 voiced beats
// (script scene 7, the silent leaf break, is the hold at the end of b6), four presenter stops
// (TPStory.StopAt: the web player freezes, the export holds the card), brown OLD / blue NEW badges,
// one "Do you know?" card (buried clay pots → drip irrigation). Central model: the TWO FIELDS —
// scattered vs neat lines — drawn from above (Field) and in cross-section (SoilCut), opened in b1,
// explained in b5, answered in b9. STORY STYLE (engine/story-kit.jsx). Pure function of time.
const { Sprite } = window;
const { reveal, windowOp } = window.TPMotion;
const { num, str } = window.TPStage;
const { SK, SERIF, SANS, LEFT_W, pop, out3, lerp, drive,
  Pic, Chip, Badge, Big, Card, SVG, Arrow, T, ChimeAt, Scene, StoryFrame, StopAt, Break } = window.TPStory;

// ---- Timing: EVERYTHING is keyed to the narration (tools/fit_timing.py → timing.js).
const TM = window.TP_TIMING;
if (!TM) console.error("timing.js missing — run: python3 tools/fit_timing.py videos/lp4-ancient-and-modern-farming-methods");
const LEAD = TM ? TM.lead : 1.0;
const DUR = TM ? TM.total : 220;
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
const rnd = (i) => { const x = Math.sin(i * 12.9898 + 4.1) * 43758.5453; return x - Math.floor(x); };

// ---- Panel copy. Title defaults mirror the DC data-props (titleNText) — keep in sync. ----
const TITLES = { 1: "LP4 – Ancient and Modern Farming Methods", 2: "From survival to saving", 3: "Food security", 4: "Old methods",
  5: "New methods: line sowing and dibbling", 6: "Improved seeds and drip irrigation", 7: "Do you know? Clay-pot watering", 8: "Some old ideas are still the best", 9: "The answer" };
const KICK = "Grade 6 · Agriculture · Session 4";
const KICKS = { 7: "Do you know?" };
const panel = (n, ctx, lines, extra = {}) => ({ kicker: KICKS[n] || KICK, title: ctx.titles[n], lines, ...extra });
const L = (text, at, kind = "item", extra = {}) => ({ text, at, kind, ...extra });

// ---- Presenter stops: [beat, sentence index whose pauseAfter is the hold, hold s, question]
const STOPS = [
  ["b1", 3, 4.0, "Which field will give more crop? Make a guess."],
  ["b4", 4, 4.0, "Name the four old methods. Which one have you seen?"],
  ["b7", 3, 4.0, "Why does giving water at the roots save water?"],
  ["b9", 3, 6.0, null],   // quick check card
];
const QUICK = ["What is broadcasting?", "What is mixed cropping?", "Why is line sowing better than scattering?", "How does drip irrigation save water?", "Name one old idea that is still the best."];
const stopAt = (b, i) => SE(b, i) + 0.1;                       // beat-local start of the hold
const stopFor = (b) => STOPS.find((s) => s[0] === b);
// The kit's StopCard has a fixed "PAUSE AND DISCUSS" heading and one question; the script's stop 2 is
// "HAVE YOU UNDERSTOOD?" and stop 4 is a five-question quick check, so this card takes a heading + children.
function StopBox({ lt, b, heading = "PAUSE AND DISCUSS", children }) {
  const s = stopFor(b), at = stopAt(b, s[1]), hold = s[2] - 0.2, n = STOPS.indexOf(s) + 1;
  const o = windowOp(lt, at, at + hold + 0.4, 0.35); if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 40, top: 60, width: LEFT_W - 80, height: 880, borderRadius: 26, background: "rgba(5,30,22,0.86)", opacity: o, zIndex: 3,
      boxShadow: "0 0 0 3px rgba(226,176,76,0.9)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 70, boxSizing: "border-box", textAlign: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
        <svg width="70" height="70" viewBox="0 0 90 90"><circle cx="45" cy="45" r="43" fill={SK.gold} /><rect x="28" y="24" width="12" height="42" rx="4" fill={SK.ink} /><rect x="50" y="24" width="12" height="42" rx="4" fill={SK.ink} /></svg>
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 32, letterSpacing: "0.08em", color: SK.ink, background: SK.gold, padding: "10px 30px", borderRadius: 14 }}>{heading}</div>
      </div>
      {s[3] && <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 58, lineHeight: 1.2, color: SK.white, marginTop: 50, maxWidth: 1100 }}>{s[3]}</div>}
      {children}
      <div style={{ fontFamily: SANS, fontSize: 26, color: SK.dim, marginTop: 46 }}>Stop {n} of {STOPS.length} · press play to continue</div>
    </div>
  );
}

// ---- Shared pieces ---------------------------------------------------------------
// OLD (brown) / NEW (blue) method badge. gold 0→1 turns an OLD badge gold ("still the best").
function Era({ kind = "old", x, y, lt, at, size = 24, gold = 0, op = 1, anchor = "left" }) {
  const o = pop(lt, at, 0.5) * op; if (o <= 0) return null;
  const g = gold > 0.5;
  const bg = g ? SK.gold : kind === "old" ? "#8B5A2B" : "#2F6FB3", fg = g ? SK.ink : SK.white;
  const sc = 0.8 + 0.2 * o + 0.12 * Math.sin(Math.PI * clamp(gold, 0, 1));
  return <div style={{ position: "absolute", left: x, top: y, transform: `translateX(${anchor === "center" ? "-50%" : "0"}) scale(${sc})`, transformOrigin: "left top", opacity: o,
    fontFamily: SANS, fontWeight: 700, fontSize: size, letterSpacing: "0.12em", color: fg, background: bg, padding: "5px 16px", borderRadius: 8,
    boxShadow: g ? `0 0 0 3px ${SK.cream}, 0 0 24px rgba(226,176,76,0.8)` : "0 2px 10px rgba(0,0,0,0.35)", whiteSpace: "nowrap" }}>{kind === "old" ? "OLD" : "NEW"}</div>;
}
// Red warning tag (the kit's Chip has no red tone).
function Tag({ text, x, y, lt, at, out = null, size = 26 }) {
  const o = pop(lt, at) * (out != null ? 1 - reveal(lt, out, 0.4) : 1); if (o <= 0) return null;
  return <div style={{ position: "absolute", left: x, top: y, transform: `translateX(-50%) scale(${0.9 + 0.1 * o})`, transformOrigin: "center top", opacity: o, fontFamily: SANS, fontWeight: 700,
    fontSize: size, color: SK.white, background: "#B3261E", padding: "6px 18px", borderRadius: 999, whiteSpace: "nowrap", boxShadow: "0 2px 10px rgba(0,0,0,0.25)" }}>{text}</div>;
}
function Lines({ x, y, w, lt, lines, size = 30, color = SK.white, gap = 14 }) {
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w }}>
      {lines.map((l, i) => { const o = out3(lt, l.at, 0.6) * (l.out != null ? 1 - reveal(lt, l.out, 0.4) : 1); if (o <= 0) return null;
        return <div key={i} style={{ opacity: o, transform: `translateY(${(1 - o) * 10}px)`, marginBottom: gap, fontFamily: l.serif ? SERIF : SANS, fontWeight: l.bold ? 700 : 400,
          fontSize: l.size || size, lineHeight: 1.25, color: l.color || color }}>{l.text}</div>; })}
    </div>
  );
}
// Small flat seedling (top view in Field, side view in SoilCut). g = growth 0..1.
function Sprout({ x, y, g, s = 1, droop = 0, color = "#6FBF6E" }) {
  if (g <= 0) return null;
  const h = 70 * g * s;
  return (
    <g transform={`translate(${x} ${y}) rotate(${droop * 50})`}>
      <line x1={0} y1={0} x2={0} y2={-h} stroke={color} strokeWidth={5 * s} strokeLinecap="round" />
      <ellipse cx={-12 * s * g} cy={-h * 0.6} rx={16 * s * g} ry={6 * s * g} fill={color} transform={`rotate(-30 ${-12 * s * g} ${-h * 0.6})`} />
      <ellipse cx={12 * s * g} cy={-h * 0.85} rx={16 * s * g} ry={6 * s * g} fill={color} transform={`rotate(30 ${12 * s * g} ${-h * 0.85})`} />
    </g>
  );
}

// ---- The central model: two fields from above -------------------------------------------
// mode "scatter": clumps + bare patches; "rows": 5 even rows. grow 0 = seeds, 1 = grown plants.
// For "scatter" the crowded plants stay small and a few seeds never come up (patchy crop).
const SCATTER = (() => {
  const pts = [], centres = [[0.18, 0.3], [0.42, 0.72], [0.7, 0.28], [0.86, 0.75]];
  centres.forEach(([cx, cy], c) => { for (let i = 0; i < 9; i++) { const k = c * 20 + i; pts.push([cx + (rnd(k) - 0.5) * 0.14, cy + (rnd(k + 7) - 0.5) * 0.22, 0.45 + 0.25 * rnd(k + 3)]); } });
  for (let i = 0; i < 8; i++) pts.push([0.05 + 0.9 * rnd(200 + i), 0.08 + 0.84 * rnd(300 + i), rnd(400 + i) < 0.4 ? 0 : 0.85]);
  return pts;
})();
function Field({ x, y, w, h, mode, lt, at, grow = 0, label, op = 1 }) {
  const o = out3(lt, at, 0.7) * op; if (o <= 0) return null;
  const pts = mode === "rows"
    ? Array.from({ length: 50 }, (_, i) => [0.07 + (i % 10) * 0.096, 0.14 + Math.floor(i / 10) * 0.18, 1])
    : SCATTER;
  return (
    <SVG op={o}>
      <rect x={x} y={y} width={w} height={h} rx={16} fill={SK.soil} stroke="rgba(255,255,255,0.5)" strokeWidth={3} />
      {Array.from({ length: 7 }, (_, i) => <line key={i} x1={x + 10} y1={y + 16 + i * (h - 32) / 6} x2={x + w - 10} y2={y + 16 + i * (h - 32) / 6} stroke="rgba(0,0,0,0.12)" strokeWidth={2} />)}
      {pts.map(([px, py, vig], i) => {
        const cx = x + px * w, cy = y + py * h, g = grow * vig;
        return g > 0.05
          ? <g key={i}><circle cx={cx} cy={cy} r={4 + 13 * g} fill={mode === "rows" ? "#6FBF6E" : vig < 0.6 ? "#9DB86A" : "#6FBF6E"} /><circle cx={cx} cy={cy} r={2 + 5 * g} fill="#4E9A5E" /></g>
          : <ellipse key={i} cx={cx} cy={cy} rx={5} ry={3.5} fill="#E3B55C" opacity={grow > 0.3 && vig === 0 ? 0.35 : 1} />;
      })}
      {label && <T x={x + w / 2} y={y + h + 38} size={26} bold color={SK.cream}>{label}</T>}
    </SVG>
  );
}
// ---- Cross-section of a furrow: where the seeds sit in the soil ------------------------
// scatter: random depths, clumps, some on top (birds take those at birdAt); lines: same depth, same gap,
// with measuring marks (depthAt / gapAt) and sprouts (growAt).
const CUT_SCATTER = [[0.06, -0.02], [0.11, 0.15], [0.14, 0.05], [0.17, 0.2], [0.33, -0.02], [0.37, -0.02], [0.52, 0.3], [0.56, 0.08], [0.6, 0.12], [0.63, 0.04], [0.8, -0.02], [0.9, 0.22]];
function SoilCut({ x, y, w, h, mode, lt, at, closeAt = 1e9, topAt = 1e9, birdAt = 1e9, depthAt = 1e9, gapAt = 1e9, growAt = 1e9, until = 1e9, op = 1 }) {
  const o = out3(lt, at, 0.6) * op; if (o <= 0) return null;
  const sy = y + h * 0.32, depth = h * 0.22;
  const grow = out3(lt, growAt, 1.6);
  const seeds = mode === "lines" ? Array.from({ length: 8 }, (_, i) => [0.08 + i * 0.12, depth / h]) : CUT_SCATTER.map(([px, d]) => [px, d < 0 ? -0.02 : d * 0.9]);
  const bird = drive(lt, birdAt, birdAt + 2.2);
  return (
    <SVG op={o}>
      <rect x={x} y={y} width={w} height={h} rx={16} fill="#0B2E22" />
      <path d={`M${x} ${sy} L${x + w} ${sy} L${x + w} ${y + h - 16} Q ${x + w} ${y + h} ${x + w - 16} ${y + h} L${x + 16} ${y + h} Q ${x} ${y + h} ${x} ${y + h - 16} Z`} fill={SK.soil} />
      <line x1={x} y1={sy} x2={x + w} y2={sy} stroke="#8A6A48" strokeWidth={6} />
      {seeds.map(([px, d], i) => {
        const cx = x + px * w, cy = sy + d * h, onTop = d < 0;
        const eaten = onTop && lt > birdAt + 0.4 + (px - 0.3) * 2.0;
        if (eaten) return null;
        const hi = (onTop && lt > topAt) || (mode !== "lines" && [1, 2, 3, 7, 8, 9].includes(i) && lt > closeAt && lt < topAt);
        return <g key={i}>
          {mode === "lines" && <Sprout x={cx} y={cy - 8} g={grow} s={1.7} />}
          <ellipse cx={cx} cy={cy} rx={14} ry={9} fill="#E3B55C" stroke={hi ? "#FF6B5A" : "#9E7320"} strokeWidth={hi ? 4 : 2} />
        </g>;
      })}
      {mode !== "lines" && bird > 0 && bird < 1 && (() => {
        const bx = x + lerp(-40, w + 40, bird), by = sy - 60 + 46 * Math.sin(bird * Math.PI * 3) ** 2;
        return <g transform={`translate(${bx} ${by})`}><ellipse rx={26} ry={16} fill="#3B2316" /><circle cx={22} cy={-12} r={11} fill="#3B2316" /><path d="M32 -12 L46 -8 L32 -6 Z" fill={SK.gold} />
          <path d={`M-6 -6 Q -20 ${-30 - 14 * Math.sin(lt * 18)} -36 -10`} stroke="#3B2316" strokeWidth={7} fill="none" strokeLinecap="round" /></g>;
      })()}
      {mode === "lines" && <g opacity={out3(lt, depthAt, 0.5) * (1 - reveal(lt, until, 0.4))}>
        {[0, 3, 6].map((k) => { const cx = x + (0.08 + k * 0.12) * w - 30; return <g key={k}>
          <line x1={cx} y1={sy + 4} x2={cx} y2={sy + depth - 4} stroke={SK.gold} strokeWidth={4} /><line x1={cx - 10} y1={sy + 4} x2={cx + 10} y2={sy + 4} stroke={SK.gold} strokeWidth={4} />
          <line x1={cx - 10} y1={sy + depth - 4} x2={cx + 10} y2={sy + depth - 4} stroke={SK.gold} strokeWidth={4} /></g>; })}
        <T x={x + w - 20} y={sy + depth + 70} size={26} bold color={SK.gold} anchor="end">same depth</T>
      </g>}
      {mode === "lines" && <g opacity={out3(lt, gapAt, 0.5) * (1 - reveal(lt, until, 0.4))}>
        {[0, 2, 4, 6].map((k) => { const x1 = x + (0.08 + k * 0.12) * w + 16, x2 = x + (0.08 + (k + 1) * 0.12) * w - 16, yy = sy + depth + 34; return <g key={k}>
          <line x1={x1} y1={yy} x2={x2} y2={yy} stroke={SK.cream} strokeWidth={4} /><line x1={x1} y1={yy - 10} x2={x1} y2={yy + 10} stroke={SK.cream} strokeWidth={4} /><line x1={x2} y1={yy - 10} x2={x2} y2={yy + 10} stroke={SK.cream} strokeWidth={4} /></g>; })}
        <T x={x + 20} y={sy + depth + 70} size={26} bold color={SK.cream} anchor="start">same space</T>
      </g>}
    </SVG>
  );
}

// ============================================================================
function B1(ctx) {
  return ({ localTime: lt, duration }) => {
    const cLook = S("b1", 0), cOne = W("b1", "one"), cScat = W("b1", "scattered"), cOther = W("b1", "other"), cNeat = W("b1", "neat"), cQ = W("b1", "question"),
      cAsGood = W("b1", "good"), s = stopFor("b1"), stop = stopAt("b1", s[1]);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[1]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(1, ctx, [L("Look at these two fields", cLook), L("Field 1: seeds SCATTERED by hand", cOne), L("Field 2: seeds sown in NEAT LINES", cOther),
          L("BIG QUESTION", cQ, "head"), L("Is scattering seeds by hand as good as sowing them in neat lines?", cQ + 0.4, "big"), L(s[3], stop, "think")])}>
        <Pic slot="field_patchy" label="A field where seeds were scattered: bare spots and crowded clumps" x={40} y={60} w={660} h={440} lt={lt} at={0.1} fx="zoom" zoom={1.18} />
        <Pic slot="field_rows" label="A field sown in neat lines" x={740} y={60} w={660} h={440} lt={lt} at={0.5} fx="zoom" zoom={1.18} />
        <Chip text="1 · seeds scattered by hand" x={370} y={440} lt={lt} at={cScat} size={26} />
        <Chip text="2 · sown in neat lines" x={1070} y={440} lt={lt} at={cNeat} size={26} />
        <Field x={70} y={540} w={600} h={240} mode="scatter" lt={lt} at={cOne} grow={0} op={1 - reveal(lt, cQ, 0.5)} label="from above: clumps and bare spots" />
        <Field x={770} y={540} w={600} h={240} mode="rows" lt={lt} at={cOther} grow={0} op={1 - reveal(lt, cQ, 0.5)} label="from above: straight, even lines" />
        <Card x={40} y={540} w={1360} h={330} lt={lt} at={cQ} pad={34}>
          <Badge text="BIG QUESTION" x={34} y={30} lt={lt} at={cQ} size={30} />
          <div style={{ position: "absolute", left: 34, top: 120, width: 1290, fontFamily: SERIF, fontWeight: 700, fontSize: 52, lineHeight: 1.2, color: SK.white, opacity: out3(lt, cAsGood - 0.6, 0.6) }}>
            Is <span style={{ color: SK.gold }}>scattering</span> seeds by hand as good as sowing them in <span style={{ color: SK.gold }}>neat lines</span>?</div>
        </Card>
        <StopBox lt={lt} b="b1" />
      </Scene>
    );
  };
}
function B2(ctx) {
  const flow = [["Grow food to SURVIVE", "survive"], ["Grow MORE than needed", "more"], ["SAVE it for the future", "save"]];
  return ({ localTime: lt, duration }) => {
    const cSurv = W("b2", "survive"), cHard = W("b2", "hard"), cWild = W("b2", "wild"), cSlow = W("b2", "slowly"), cMore = W("b2", "more"), cSave = W("b2", "save"),
      ats = flow.map((f) => W("b2", f[1]));
    const rain = out3(lt, cHard, 0.6) * (1 - reveal(lt, cSlow, 0.5));
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[2]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(2, ctx, [L("The first farmers grew food just to SURVIVE", cSurv), L("Hard weather · wild animals all around", cHard), L("Something new:", cSlow, "head"),
          L("grow MORE than they needed…", cMore), L("…and SAVE it for the future", cSave, "big")])}>
        <Pic slot="night_guard" label="Early farmers guard their plot at night as wild animals watch" x={40} y={60} w={880} h={560} lt={lt} at={0.1} out={cSlow} fx="zoom" />
        <Pic slot="fill_pots" label="Early farmers fill clay pots with grain to save it" x={40} y={60} w={880} h={560} lt={lt} at={cSlow} fx="zoom" />
        <Tag text="wild animals all around!" x={480} y={540} lt={lt} at={cWild} out={cSlow} size={28} />
        <Pic slot="clouds_farmer" label="Storm clouds roll in over the field" x={960} y={60} w={440} h={300} lt={lt} at={cHard} fx="pop" />
        <SVG op={rain}>{Array.from({ length: 18 }, (_, i) => { const p = ((lt * 1.4 + rnd(i)) % 1); const x0 = 980 + rnd(i + 30) * 400, y0 = 80 + p * 260;
          return <line key={i} x1={x0} y1={y0} x2={x0 - 8} y2={y0 + 26} stroke="#BFE3F7" strokeWidth={3} opacity={0.8} />; })}</SVG>
        <Chip text="hard weather" x={1180} y={320} lt={lt} at={cHard} size={24} />
        <Pic slot="seed_store" label="Grain saved in a clay pot" x={960} y={400} w={440} h={220} lt={lt} at={cSave} fx="pop" />
        <Chip text="saved for later" x={1180} y={580} lt={lt} at={cSave + 0.2} tone="gold" size={24} />
        <SVG op={1}>{[0, 1].map((i) => <Arrow key={i} x1={40 + (i + 1) * 460 - 40} y1={760} x2={40 + (i + 1) * 460 + 10} y2={760} color={SK.gold} sw={6} op={out3(lt, ats[i + 1] - 0.1, 0.5)} />)}</SVG>
        {flow.map(([t], i) => { const o = pop(lt, ats[i], 0.6); if (o <= 0) return null;
          return <div key={i} style={{ position: "absolute", left: 40 + i * 470, top: 690, width: 400, height: 140, borderRadius: 20, opacity: o, transform: `scale(${0.85 + 0.15 * o})`,
            background: i === 2 ? SK.gold : SK.cream, color: SK.ink, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 18, boxSizing: "border-box",
            fontFamily: SERIF, fontWeight: 700, fontSize: 36, lineHeight: 1.15, boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }}>{t}</div>; })}
      </Scene>
    );
  };
}
// Rows of little people that fill up: the growing population.
function Crowd({ x, y, lt, at, until, cols = 9, rows = 3 }) {
  const p = drive(lt, at, until); const n = Math.round(p * cols * rows); if (n <= 0) return null;
  return (
    <SVG op={1}>
      {Array.from({ length: n }, (_, i) => { const c = i % cols, r = Math.floor(i / cols); return <g key={i} transform={`translate(${x + c * 44} ${y + r * 56})`} fill={r % 2 ? SK.cream : SK.gold}>
        <circle cx={0} cy={0} r={10} /><path d="M-14 44 L-14 22 Q 0 10 14 22 L14 44 Z" /></g>; })}
    </SVG>
  );
}
// Goal icons: more crops (plant ↑), less time (clock ↓), less water (drop ↓).
function Goal({ kind, cx, cy, lt, at }) {
  const o = pop(lt, at, 0.6); if (o <= 0) return null;
  const up = kind === "crops";
  return (
    <SVG op={Math.min(1, o)}>
      <g transform={`translate(${cx} ${cy}) scale(${0.8 + 0.2 * o})`}>
        <circle r={78} fill="rgba(255,255,255,0.08)" stroke={SK.gold} strokeWidth={5} />
        {kind === "crops" && <g transform="translate(-10 40)"><Sprout x={0} y={0} g={1} s={1.1} /><Sprout x={-26} y={0} g={0.8} s={0.9} /></g>}
        {kind === "time" && <g transform="translate(-10 0)"><circle r={38} fill={SK.cream} /><line x1={0} y1={0} x2={0} y2={-26} stroke={SK.ink} strokeWidth={6} strokeLinecap="round" />
          <line x1={0} y1={0} x2={18} y2={8} stroke={SK.ink} strokeWidth={6} strokeLinecap="round" /></g>}
        {kind === "water" && <path d="M-10 -40 C -10 -40, -42 0, -42 16 A 32 32 0 0 0 22 16 C 22 0, -10 -40, -10 -40 Z" fill="#7FD3F7" />}
        <g transform="translate(46 0)"><Arrow x1={0} y1={up ? 28 : -28} x2={0} y2={up ? -30 : 30} color={up ? SK.leaf : "#FF8A7A"} sw={8} head={20} /></g>
      </g>
    </SVG>
  );
}
function B3(ctx) {
  const goals = [["crops", "MORE crops"], ["time", "LESS time"], ["water", "LESS water"]];
  return ({ localTime: lt, duration }) => {
    const cPeople = W("b3", "people"), cEarth = W("b3", "earth"), cEvery = S("b3", 1), cSec = W("b3", "security"), ats = [W("b3", "more", 1), W("b3", "less", 0), W("b3", "less", 1)];
    const cCity = cEarth, cTown = (cPeople + cEarth) / 2 - 0.4;
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[3]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(3, ctx, [L("More people on Earth than ever before", cPeople), L("Everyone needs food, every single day", cEvery), L("FOOD SECURITY", cSec, "big"),
          L("THE GOAL", ats[0], "head"), L("more crops · less time · less water", ats[0])])}>
        <Pic slot="village_store" label="An early village" x={40} y={60} w={880} h={500} lt={lt} at={0.1} out={cTown + 0.3} fx="zoom" />
        <Pic slot="rainfed_village" label="A village today" x={40} y={60} w={880} h={500} lt={lt} at={cTown} out={cCity + 0.3} fx="zoom" />
        <Pic slot="city_crowd" label="A busy city: more and more people" x={40} y={60} w={880} h={500} lt={lt} at={cCity} fx="zoom" />
        <Chip text={lt < cTown ? "village" : lt < cCity ? "town" : "busy city"} x={480} y={80} lt={lt} at={0.4} size={26} tone="gold" />
        <Card x={960} y={60} w={440} h={300} lt={lt} at={cPeople - 0.3} pad={24}>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 22, letterSpacing: "0.14em", color: SK.gold }}>PEOPLE ON EARTH</div>
        </Card>
        <Crowd x={1004} y={120} lt={lt} at={cPeople} until={cEvery + 0.6} />
        <Chip text="more than ever before ↑" x={1180} y={300} lt={lt} at={cEarth} tone="gold" size={24} />
        <Chip text="Everyone needs food, every single day" x={1180} y={400} lt={lt} at={cEvery} size={22} />
        <Badge text="FOOD SECURITY" x={960} y={470} lt={lt} at={cSec} size={40} />
        {goals.map(([k, lab], i) => <React.Fragment key={k}>
          <Goal kind={k} cx={220 + i * 480} cy={700} lt={lt} at={ats[i]} />
          <Chip text={lab} x={220 + i * 480} y={800} lt={lt} at={ats[i] + 0.15} tone={i === 0 ? "gold" : "cream"} size={30} />
        </React.Fragment>)}
      </Scene>
    );
  };
}
function B4(ctx) {
  const old = [["hero_scatter", "Broadcasting", "scattering seeds by hand", "broadcasting"], ["mixed_crop", "Mixed cropping", "two crops in one field", "mixed"],
    ["manure", "Organic manure", "cow dung feeds the soil", "cow"], ["seed_store", "Saving seeds", "for the next season", "saved"]];
  return ({ localTime: lt, duration }) => {
    const cOld = S("b4", 0), ats = old.map((o) => W("b4", o[3])), s = stopFor("b4"), stop = stopAt("b4", s[1]);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[4]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(4, ctx, [L("THE OLD METHODS", cOld, "head"), ...old.map((o, i) => L(`${o[1]} – ${o[2]}`, ats[i])), L(s[3], stop, "think")])}>
        <Era kind="old" x={600} y={420} lt={lt} at={cOld} size={40} op={1 - reveal(lt, ats[0], 0.4)} />
        {old.map(([slot, name, sub], i) => { const x = 40 + (i % 2) * 700, y = 60 + Math.floor(i / 2) * 430;
          return <React.Fragment key={slot}>
            <Pic slot={slot} label={name} x={x} y={y} w={660} h={390} lt={lt} at={ats[i]} fx={i % 2 ? "pan" : "zoom"} />
            <Era kind="old" x={x + 20} y={y + 20} lt={lt} at={ats[i] + 0.2} size={24} />
            <div style={{ position: "absolute", left: x, top: y + 300, width: 660, height: 90, borderRadius: "0 0 18px 18px", background: "linear-gradient(transparent, rgba(5,30,22,0.88))",
              opacity: out3(lt, ats[i] + 0.2, 0.5), display: "flex", alignItems: "flex-end", padding: "0 24px 14px", boxSizing: "border-box", gap: 16 }}>
              <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 36, color: SK.gold }}>{name}</span>
              <span style={{ fontFamily: SANS, fontSize: 26, color: SK.white, paddingBottom: 3 }}>{sub}</span>
            </div>
          </React.Fragment>; })}
        <StopBox lt={lt} b="b4" heading="HAVE YOU UNDERSTOOD?" />
      </Scene>
    );
  };
}
function B5(ctx) {
  const pics = [["seed_drill", "Seed drill: seeds in a straight row"], ["dibbling", "Dibbling: equal gaps, one seed in each"], ["line_sow", "Line sowing along a string"]];
  return ({ localTime: lt, duration }) => {
    const cNew = S("b5", 0), cScat = W("b5", "scattered"), cClose = W("b5", "close"), cTop = W("b5", "top"), cBirds = W("b5", "birds"), cLine = W("b5", "line"),
      cDib = W("b5", "dibbling"), cDepth = W("b5", "depth"), cSpace = W("b5", "space"), cEvery = W("b5", "every", 1), cLight = W("b5", "light"), cWater = W("b5", "water"), cRoom = W("b5", "room");
    const phaseA = 1 - reveal(lt, cLine, 0.5);
    const picAts = [cLine, cDib, cDib + 0.5];
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[5]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(5, ctx, [L("THE NEWER METHODS", cNew, "head"), L("Scattered seeds: too close · on top · eaten by birds", cScat), L("LINE SOWING and DIBBLING", cLine, "big"),
          L("Fixed depth · fixed spacing", cDepth), L("EVERY plant gets light, water and room", cEvery)], { max: 6 })}>
        <Era kind="new" x={600} y={400} lt={lt} at={cNew} size={40} op={1 - reveal(lt, cScat, 0.4)} />
        {/* A: what goes wrong when seeds are scattered */}
        <div style={{ position: "absolute", inset: 0, opacity: phaseA }}>
          <Pic slot="birds_peck" label="Birds peck scattered seeds left on top of the soil" x={40} y={60} w={600} h={520} lt={lt} at={cScat} fx="zoom" />
          <Chip text="scattered…" x={340} y={80} lt={lt} at={cScat} size={26} />
        </div>
        <SoilCut x={680} y={60} w={720} h={520} mode="scatter" lt={lt} at={cScat} closeAt={cClose} topAt={cTop} birdAt={cBirds} op={phaseA} />
        <Tag text="too close" x={860} y={620} lt={lt} at={cClose} out={cLine} />
        <Tag text="on top" x={1060} y={620} lt={lt} at={cTop} out={cLine} />
        <Tag text="birds eat them!" x={1260} y={620} lt={lt} at={cBirds} out={cLine} />
        {/* B: line sowing and dibbling */}
        {pics.map(([slot, lab], i) => <React.Fragment key={slot}>
          <Pic slot={slot} label={lab} x={40 + i * 460} y={60} w={440} h={290} lt={lt} at={picAts[i]} fx="pop" />
          <Era kind="new" x={40 + i * 460 + 16} y={76} lt={lt} at={picAts[i] + 0.2} size={20} />
          <Chip text={lab.split(":")[0]} x={260 + i * 460} y={300} lt={lt} at={picAts[i] + 0.2} size={22} />
        </React.Fragment>)}
        <SoilCut x={40} y={380} w={1360} h={480} mode="lines" lt={lt} at={cLine} depthAt={cDepth} gapAt={cSpace} growAt={cEvery - 0.4} until={cEvery} />
        {/* C: every plant gets light, water and room */}
        <SVG op={out3(lt, cLight, 0.5)}>
          <g transform={`translate(1290 440) rotate(${lt * 20})`}>{Array.from({ length: 8 }, (_, i) => <line key={i} x1={0} y1={38} x2={0} y2={54} stroke={SK.gold} strokeWidth={6} strokeLinecap="round" transform={`rotate(${i * 45})`} />)}</g>
          <circle cx={1290} cy={440} r={30} fill={SK.gold} />
        </SVG>
        <SVG op={out3(lt, cWater, 0.5)}>{Array.from({ length: 8 }, (_, i) => { const p = ((lt - cWater) * 0.8 + i * 0.37) % 1, cx = 40 + (0.08 + i * 0.12) * 1360 + 24;
          return <path key={i} d={`M${cx} ${560 + p * 60} c -7 10, -7 16, 0 16 c 7 0, 7 -6, 0 -16 Z`} fill="#7FD3F7" opacity={1 - p} />; })}</SVG>
        <Chip text="light ✓" x={360} y={790} lt={lt} at={cLight} tone="gold" size={28} />
        <Chip text="water ✓" x={720} y={790} lt={lt} at={cWater} tone="gold" size={28} />
        <Chip text="room to grow ✓" x={1080} y={790} lt={lt} at={cRoom} tone="gold" size={28} />
      </Scene>
    );
  };
}
// Drip line: a pipe along a row, drops falling at each plant's roots, wet patches spreading.
function DripRow({ x, y, w, h, lt, at, dropAt, rootAt }) {
  const o = out3(lt, at, 0.6); if (o <= 0) return null;
  const sy = y + h * 0.55, n = 5, k = out3(lt, rootAt, 0.8);
  return (
    <SVG op={o}>
      <rect x={x} y={y} width={w} height={h} rx={16} fill="#0B2E22" />
      <rect x={x} y={sy} width={w} height={h - (sy - y)} rx={0} fill={SK.soil} />
      {Array.from({ length: n }, (_, i) => { const cx = x + 90 + i * (w - 180) / (n - 1);
        const p = ((lt - dropAt) * 0.9 + i * 0.2) % 1, dropOn = lt > dropAt;
        return <g key={i}>
          <ellipse cx={cx} cy={sy + 40} rx={20 + 40 * k} ry={10 + 22 * k} fill="#3E6E8E" opacity={0.55 * k} />
          <path d={`M${cx} ${sy} l -14 50 M${cx} ${sy} l 0 60 M${cx} ${sy} l 14 50`} stroke="#C9A77A" strokeWidth={3} opacity={0.7} />
          <Sprout x={cx} y={sy} g={1} s={1.3} />
          {dropOn && <path d={`M${cx + 30} ${sy - 32 + p * 34} c -7 10, -7 16, 0 16 c 7 0, 7 -6, 0 -16 Z`} fill="#7FD3F7" opacity={1 - p * 0.6} />}
        </g>; })}
      <rect x={x + 20} y={sy - 44} width={w - 40} height={14} rx={7} fill="#1A1A1A" stroke="#444" strokeWidth={2} />
      {Array.from({ length: n }, (_, i) => <circle key={i} cx={x + 90 + i * (w - 180) / (n - 1) + 30} cy={sy - 30} r={5} fill="#7FD3F7" />)}
      <T x={x + w / 2} y={y + 50} size={26} bold color={SK.cream}>thin pipe · drop by drop · right at the roots</T>
    </SVG>
  );
}
function B6(ctx) {
  return ({ localTime: lt, duration }) => {
    const cImp = W("b6", "improved"), cMeas = W("b6", "measured"), cDrip = W("b6", "drip"), cDrop = W("b6", "drop"), cRoots = W("b6", "roots"), cWaste = W("b6", "wasted"),
      breakAt = SE("b6", 1) + 0.15;
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[6]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(6, ctx, [L("IMPROVED seeds", cImp), L("A MEASURED amount of water for each crop", cMeas), L("DRIP IRRIGATION", cDrip, "head"),
          L("Thin pipes: water drop by drop, right at the roots", cDrop), L("Very little water is wasted", cWaste, "big")])}>
        <Pic slot="hybrid_seeds" label="Improved seeds" x={40} y={60} w={660} h={330} lt={lt} at={cImp} fx="zoom" />
        <Era kind="new" x={60} y={80} lt={lt} at={cImp + 0.2} />
        <Chip text="IMPROVED seeds" x={370} y={340} lt={lt} at={cImp + 0.2} tone="gold" size={28} />
        <Pic slot="watering" label="Giving a measured amount of water" x={740} y={60} w={660} h={330} lt={lt} at={cMeas} fx="zoom" />
        <Era kind="new" x={760} y={80} lt={lt} at={cMeas + 0.2} />
        <Chip text="a MEASURED amount of water" x={1070} y={340} lt={lt} at={cMeas + 0.2} tone="gold" size={28} />
        <DripRow x={40} y={430} w={880} h={440} lt={lt} at={cDrip} dropAt={cDrop} rootAt={cRoots} />
        <Era kind="new" x={60} y={450} lt={lt} at={cDrip + 0.2} />
        <Pic slot="drip_close" label="Drip pipe: water drop by drop at the roots" x={960} y={430} w={440} h={440} lt={lt} at={cDrop} fx="zoom" zoom={1.25} />
        <Chip text="right at the ROOTS" x={1180} y={800} lt={lt} at={cRoots} tone="gold" size={26} />
        <Big x={80} y={740} w={820} lt={lt} at={cWaste} size={40} color={SK.gold}>…so very little is wasted.</Big>
        <Break lt={lt} at={breakAt} dur={2.4} />
      </Scene>
    );
  };
}
function B7(ctx) {
  return ({ localTime: lt, duration }) => {
    const cDyk = S("b7", 0), c2000 = W("b7", "2000"), cChina = W("b7", "china"), cBury = W("b7", "bury"), cSeep = W("b7", "seeped"), cRoots = W("b7", "roots"), cSame = W("b7", "same"),
      s = stopFor("b7"), stop = stopAt("b7", s[1]);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[7]} showCaps={ctx.caps} capSize={ctx.capSize} fi={0.3}
        panel={panel(7, ctx, [L("More than 2,000 years ago", c2000, "head"), L("A farming book in China: bury clay pots full of water among the crops", cChina),
          L("Water seeps slowly through the clay to the roots", cSeep), L("The SAME idea as drip irrigation!", cSame, "big"), L(s[3], stop, "think"),
          L("Source: Fan Shengzhi shu, 1st century BCE (Wikipedia)", cSame + 1.0, "source")], { max: 7 })}>
        <Card x={40} y={50} w={1360} h={890} lt={lt} at={0} pad={0} />
        <Badge x={80} y={80} lt={lt} at={cDyk} size={36} />
        <Pic slot="olla_painting" label="Old painting: a farmer buries a clay pot" x={80} y={170} w={760} h={500} lt={lt} at={c2000} out={cSeep} fx="zoom" />
        <Chip text="a farming book in China · over 2,000 years old" x={460} y={190} lt={lt} at={cChina} out={cSeep} tone="gold" size={24} />
        <Pic slot="claypot" label="Buried clay pot watering a plant's roots" x={80} y={170} w={760} h={500} lt={lt} at={cSeep} fx="zoom" zoom={1.2} />
        <Era kind="old" x={100} y={190} lt={lt} at={cSame} size={24} />
        <Chip text="water seeps through the clay → roots" x={460} y={610} lt={lt} at={cRoots} out={cSame} tone="gold" size={24} />
        <Lines x={890} y={180} w={470} lt={lt} lines={[{ text: "Bury a clay pot full of water among the crops.", at: cBury, size: 30 },
          { text: "Water seeps slowly through the clay…", at: cSeep, size: 30 }, { text: "…straight to the roots.", at: cRoots, size: 30 }]} />
        <div style={{ position: "absolute", left: 870, top: 500, opacity: out3(lt, cSame, 0.5) }}>
          <Pic slot="drip_field" label="Drip pipes in a modern field" x={0} y={0} w={490} h={330} lt={lt} at={cSame} fx="pop" />
          <Era kind="new" x={20} y={20} lt={lt} at={cSame + 0.2} size={24} />
        </div>
        <div style={{ position: "absolute", left: 80, top: 700, width: 760, fontFamily: SERIF, fontWeight: 700, fontSize: 50, lineHeight: 1.15, color: SK.gold, opacity: out3(lt, cSame, 0.6),
          textShadow: "0 2px 14px rgba(0,0,0,0.45)" }}>Clay pot = drip irrigation:<br /><span style={{ color: SK.white, fontSize: 40 }}>the SAME idea!</span></div>
        <div style={{ position: "absolute", left: 80, top: 880, width: 1280, opacity: out3(lt, cSame + 1.0, 0.6), fontFamily: SANS, fontSize: 21, color: SK.dim }}>
          Source: Wikipedia – Fan Shengzhi shu (Han dynasty, 1st century BCE): unglazed clay pots of water buried among the crops</div>
        <StopBox lt={lt} b="b7" />
      </Scene>
    );
  };
}
// Cereal + pulse plants side by side; at failAt the cereal droops grey, the pulses keep standing.
function TwoCrops({ x, y, w, lt, at, failAt, otherAt }) {
  const o = out3(lt, at, 0.6); if (o <= 0) return null;
  const f = out3(lt, failAt, 0.9), glow = out3(lt, otherAt, 0.6);
  return (
    <SVG op={o}>
      <rect x={x} y={y} width={w} height={200} rx={16} fill="#0B2E22" />
      <rect x={x} y={y + 150} width={w} height={50} fill={SK.soil} />
      {Array.from({ length: 6 }, (_, i) => { const cx = x + 60 + i * (w - 120) / 5, cereal = i % 2 === 0;
        return cereal
          ? <g key={i} transform={`translate(${cx} ${y + 150}) rotate(${f * 38})`}><line x1={0} y1={0} x2={0} y2={-120} stroke={f > 0.5 ? "#A99F7A" : "#6FBF6E"} strokeWidth={7} strokeLinecap="round" />
              <ellipse cx={0} cy={-128} rx={10} ry={24} fill={f > 0.5 ? "#8C7F5C" : "#E3B55C"} /></g>
          : <g key={i} transform={`translate(${cx} ${y + 150})`}>{glow > 0 && <circle cy={-50} r={56} fill={SK.gold} opacity={0.25 * glow} />}
              <Sprout x={0} y={0} g={1} s={1.0} color="#4FA75A" /><Sprout x={-14} y={0} g={0.7} s={1.0} color="#4FA75A" /><Sprout x={14} y={0} g={0.75} s={1.0} color="#4FA75A" /></g>; })}
      <T x={x + 20} y={y + 36} size={22} bold color={SK.gold} anchor="start" op={f}>cereal fails…</T>
      <T x={x + w - 20} y={y + 36} size={22} bold color={SK.leaf} anchor="end" op={glow}>pulses still give food</T>
    </SVG>
  );
}
function B8(ctx) {
  return ({ localTime: lt, duration }) => {
    const cStill = W("b8", "still"), cOrg = W("b8", "organic"), cCreat = W("b8", "creatures"), cMixed = W("b8", "mixed"), cHealthy = W("b8", "healthy"), cFails = W("b8", "fails"), cOther = W("b8", "other");
    const gold = reveal(lt, cStill, 0.8);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[8]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(8, ctx, [L("Some OLD ideas are STILL the best", cStill, "big"), L("Organic manure feeds the soil and the tiny creatures in it", cOrg),
          L("Mixed cropping keeps the soil healthy", cMixed), L("If one crop fails, the other still gives food", cFails)])}>
        <Era kind="old" x={80} y={78} lt={lt} at={0.2} size={40} gold={gold} />
        <Big x={290} y={70} w={1100} lt={lt} at={cStill} size={50}>…but some are <span style={{ color: SK.gold }}>STILL the best!</span></Big>
        <Pic slot="healthy_soil" label="Dark, crumbly soil full of earthworms after cow-dung manure" x={40} y={180} w={660} h={460} lt={lt} at={cOrg} fx="zoom" zoom={1.2} />
        <Era kind="old" x={60} y={200} lt={lt} at={cOrg + 0.2} gold={1} />
        <Chip text="ORGANIC MANURE" x={370} y={590} lt={lt} at={cOrg + 0.2} tone="gold" size={28} />
        <Lines x={60} y={680} w={640} lt={lt} lines={[{ text: "✓ feeds the soil", at: cOrg + 0.5, size: 32 }, { text: "✓ and the tiny creatures living in it", at: cCreat, size: 32 }]} />
        <Pic slot="mixed_crop" label="Mixed cropping: two crops in one field" x={740} y={180} w={660} h={420} lt={lt} at={cMixed} fx="pan" />
        <Era kind="old" x={760} y={200} lt={lt} at={cMixed + 0.2} gold={1} />
        <Chip text="MIXED CROPPING" x={1070} y={550} lt={lt} at={cMixed + 0.2} tone="gold" size={28} />
        <Chip text="keeps the soil healthy ✓" x={1070} y={150} lt={lt} at={cHealthy} size={24} />
        <TwoCrops x={740} y={640} w={660} lt={lt} at={cHealthy} failAt={cFails} otherAt={cOther} />
      </Scene>
    );
  };
}
function B9(ctx) {
  return ({ localTime: lt, duration }) => {
    const cAns = W("b9", "answer"), cNeat = W("b9", "neat"), cDepth = W("b9", "depth"), cSpace = W("b9", "space"), cWaste = W("b9", "wasted"), cBest = W("b9", "best"),
      cNew = W("b9", "new"), cOld = W("b9", "old"), stop = stopAt("b9", 3);
    const grow = drive(lt, 0.3, cNeat + 0.6), first = 1 - reveal(lt, cBest, 0.5);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[9]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(9, ctx, [L("Answer to the big question:", cAns, "head"), L("Neat lines are better", cNeat, "big"), L("right depth · right spacing · less seed wasted", cDepth),
          L("BEST FARMING = new methods + good old ideas", cBest, "big"), L("Quick check: five questions", stop, "think")], { max: 6 })}>
        <div style={{ position: "absolute", inset: 0, opacity: first }}>
          <Pic slot="field_patchy" label="The scattered field stays patchy" x={40} y={60} w={660} h={330} lt={lt} at={0.1} fx="zoom" dim={0.15 * reveal(lt, cNeat, 0.5)} />
          <Pic slot="field_rows" label="The neat rows grow tall and even" x={740} y={60} w={660} h={330} lt={lt} at={0.1} fx="zoom" />
          <Chip text="patchy" x={370} y={340} lt={lt} at={cAns} size={26} />
          <Chip text="tall and even ✓" x={1070} y={340} lt={lt} at={cAns + 0.3} tone="gold" size={26} />
        </div>
        <Field x={70} y={420} w={600} h={240} mode="scatter" lt={lt} at={0.2} grow={grow} op={first} />
        <Field x={770} y={420} w={600} h={240} mode="rows" lt={lt} at={0.2} grow={grow} op={first} />
        <Badge text="NEAT LINES ARE BETTER" x={790} y={700} lt={lt} at={cNeat} size={34} op={first} />
        <Lines x={80} y={700} w={1300} lt={lt} lines={[{ text: "✓ right depth", at: cDepth, size: 34, out: cBest }, { text: "✓ right space", at: cSpace, size: 34, out: cBest },
          { text: "✓ less seed wasted", at: cWaste, size: 34, out: cBest }]} gap={4} />
        <Pic slot="best_field" label="The best field: neat lines, manure, two crops, drip pipes" x={40} y={60} w={900} h={580} lt={lt} at={cBest} fx="zoom" />
        <Badge text="THE BEST FARMERS" x={60} y={80} lt={lt} at={cBest + 0.1} size={30} />
        <div style={{ position: "absolute", left: 980, top: 90, width: 420, opacity: out3(lt, cNew, 0.5) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}><Era kind="new" x={0} y={0} lt={lt} at={cNew} size={26} op={1} />
            <div style={{ marginLeft: 100, fontFamily: SERIF, fontWeight: 700, fontSize: 34, color: SK.white }}>new methods</div></div>
          <div style={{ fontSize: 26, fontFamily: SANS, color: SK.dim, marginTop: 12 }}>line sowing · dibbling · improved seeds · drip irrigation</div>
        </div>
        <div style={{ position: "absolute", left: 1160, top: 250, fontFamily: SERIF, fontWeight: 700, fontSize: 70, color: SK.gold, opacity: out3(lt, cOld, 0.5) }}>+</div>
        <div style={{ position: "absolute", left: 980, top: 350, width: 420, opacity: out3(lt, cOld, 0.5) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}><Era kind="old" x={0} y={0} lt={lt} at={cOld} size={26} gold={1} />
            <div style={{ marginLeft: 100, fontFamily: SERIF, fontWeight: 700, fontSize: 34, color: SK.white }}>good old ideas</div></div>
          <div style={{ fontSize: 26, fontFamily: SANS, color: SK.dim, marginTop: 12 }}>organic manure · mixed cropping</div>
        </div>
        <Big x={40} y={680} w={1360} lt={lt} at={cOld + 0.6} size={54} align="center"><span style={{ color: SK.gold }}>BEST FARMING</span> = new methods + good old ideas</Big>
        <StopBox lt={lt} b="b9" heading="QUICK CHECK">
          <div style={{ marginTop: 34, textAlign: "left", width: 1060 }}>
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
const COLLAGE = [{ slot: "hero_scatter", x: -60, y: -40, w: 760, h: 520, ph: 0 }, { slot: "drip_close", x: 640, y: -80, w: 760, h: 520, ph: 2 },
  { slot: "mixed_crop", x: -80, y: 520, w: 700, h: 560, ph: 4 }, { slot: "seed_drill", x: 560, y: 560, w: 820, h: 560, ph: 1 }];
function Lp4Scenes(props = {}) {
  const caps = props.showCaptions === "false" ? false : props.showCaptions !== false;
  const titles = {};
  for (let n = 1; n <= NB; n++) titles[n] = str(props["title" + n + "Text"], TITLES[n]);
  const ctx = { caps, titles, capSize: num(props.captionSize, 34) };
  const B = [B1, B2, B3, B4, B5, B6, B7, B8, B9];
  const beats = B.map((Bn, i) => { const t = BEAT("b" + (i + 1)); return [t.start, t.start + t.dur, Bn]; });
  return (
    <StoryFrame props={props} dur={DUR} persistKey="thinkpro-lp4-ancient-and-modern-farming-methods" collage={COLLAGE}>
      {beats.map(([s, e, Bn], i) => (
        <Sprite key={i} start={s} end={e}>{Bn(ctx)}</Sprite>
      ))}
      {STOPS.map(([b, i, hold]) => <StopAt key={b} t={BEAT(b).start + stopAt(b, i)} hold={hold - 0.2} />)}
      <ChimeAt t={BEAT("b7").start + S("b7", 0, 0)} />
      <AudioSync />
    </StoryFrame>
  );
}
window.Lp4Scenes = Lp4Scenes;
