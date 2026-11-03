/* global React, window */
// ThinkPro Academy — "Ancient and Modern Tools" (Grade 6 Agriculture, Session 3, V1).
// After AG_G6_S3 Video Script Draft 1 (Subrata, 3 Nov 2026): 10 script scenes as 9 voiced beats
// (script scene 6, the silent leaf break, is the hold at the end of b5), five presenter stops
// (TPStory.StopAt: the web player freezes, the export holds the card), one "Do you know?" card
// (the Kalibangan ploughed field). Central model: the TIMELINE STRIP along the bottom of the photo
// area — digging stick → stone → wooden plough → iron → machines — each step lights as its tool
// arrives and the strip stays on screen to the end. STORY STYLE (engine/story-kit.jsx). Pure function of time.
const { Sprite } = window;
const { reveal, windowOp } = window.TPMotion;
const { num, str } = window.TPStage;
const { SK, SERIF, SANS, LEFT_W, pop, out3, lerp, drive,
  Pic, Chip, Badge, Big, Card, SVG, Arrow, T, ChimeAt, Scene, StoryFrame, StopAt, Break } = window.TPStory;

// ---- Timing: EVERYTHING is keyed to the narration (tools/fit_timing.py → timing.js).
const TM = window.TP_TIMING;
if (!TM) console.error("timing.js missing — run: python3 tools/fit_timing.py videos/lp3-ancient-and-modern-tools");
const LEAD = TM ? TM.lead : 1.0;
const DUR = TM ? TM.total : 210;
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
const TITLES = { 1: "LP3 – Ancient and Modern Tools", 2: "Tools follow the crops", 3: "1. The digging stick", 4: "2. Stone hoe and stone sickle",
  5: "3. The wooden plough", 6: "Do you know? Kalibangan", 7: "4. Iron tools and the iron plough", 8: "5. Machines", 9: "Still in use – and the answer" };
const KICK = "Grade 6 · Agriculture · Session 3";
const KICKS = { 6: "Do you know?" };
const panel = (n, ctx, lines, extra = {}) => ({ kicker: KICKS[n] || KICK, title: ctx.titles[n], lines, ...extra });
const L = (text, at, kind = "item", extra = {}) => ({ text, at, kind, ...extra });

// ---- Presenter stops: [beat, sentence index whose pauseAfter is the hold, hold s, question]
const STOPS = [
  ["b1", 3, 4.0, "Make a guess. Write it down."],
  ["b4", 2, 4.0, "Which tool loosened the soil, and which one cut the crops?"],
  ["b6", 3, 4.0, "Why was letting oxen pull the plough such a big change?"],
  ["b8", 4, 4.0, "Put the five steps in order, from oldest to newest."],
  ["b9", 7, 6.0, null],   // quick check card
];
const QUICK = ["What was the first farming tool?", "What did a hoe do, and what did a sickle do?", "Why was the wooden plough a big change?",
  "Why were iron tools better?", "Name one tool still used today."];
const stopAt = (b, i) => SE(b, i) + 0.1;                       // beat-local start of the hold
const stopFor = (b) => STOPS.find((s) => s[0] === b);
// Stop card with its own heading (the script mixes "Pause and discuss", "Have you understood?" and a quick check).
// h < 880 keeps the timeline strip visible under the card (stop 4 freezes on the full strip).
function StopBox({ lt, b, heading = "PAUSE AND DISCUSS", h = 880, children }) {
  const s = stopFor(b), at = stopAt(b, s[1]), hold = s[2] - 0.2, n = STOPS.indexOf(s) + 1;
  const o = windowOp(lt, at, at + hold + 0.4, 0.35); if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 40, top: 60, width: LEFT_W - 80, height: h, borderRadius: 26, background: "rgba(5,30,22,0.88)", opacity: o, zIndex: 3,
      boxShadow: "0 0 0 3px rgba(226,176,76,0.9)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 60, boxSizing: "border-box", textAlign: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
        <svg width="70" height="70" viewBox="0 0 90 90"><circle cx="45" cy="45" r="43" fill={SK.gold} /><rect x="28" y="24" width="12" height="42" rx="4" fill={SK.ink} /><rect x="50" y="24" width="12" height="42" rx="4" fill={SK.ink} /></svg>
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 32, letterSpacing: "0.08em", color: SK.ink, background: SK.gold, padding: "10px 30px", borderRadius: 14 }}>{heading}</div>
      </div>
      {s[3] && <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 56, lineHeight: 1.2, color: SK.white, marginTop: 46, maxWidth: 1120 }}>{s[3]}</div>}
      {children}
      <div style={{ fontFamily: SANS, fontSize: 26, color: SK.dim, marginTop: 40 }}>Stop {n} of {STOPS.length} · press play to continue</div>
    </div>
  );
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
function Sprout({ x, y, g, s = 1, color = "#6FBF6E" }) {
  if (g <= 0) return null;
  const h = 70 * g * s;
  return (
    <g transform={`translate(${x} ${y})`}>
      <line x1={0} y1={0} x2={0} y2={-h} stroke={color} strokeWidth={5 * s} strokeLinecap="round" />
      <ellipse cx={-12 * s * g} cy={-h * 0.6} rx={16 * s * g} ry={6 * s * g} fill={color} transform={`rotate(-30 ${-12 * s * g} ${-h * 0.6})`} />
      <ellipse cx={12 * s * g} cy={-h * 0.85} rx={16 * s * g} ry={6 * s * g} fill={color} transform={`rotate(30 ${12 * s * g} ${-h * 0.85})`} />
    </g>
  );
}
const WOOD = "#9C6B3E", WOOD_D = "#6E4626", STONE = "#B9B2A6", STONE_D = "#7E776C", IRON = "#5D6670", STEEL = "#C9D2DA";

// Flat tool glyphs, drawn around (0,0), about 100 px tall at s = 1.
function Tool({ kind, s = 1, glow = 0 }) {
  const g = glow > 0 ? <circle r={64} fill={SK.gold} opacity={0.28 * glow} /> : null;
  if (kind === "stick") return <g transform={`scale(${s})`}>{g}<path d="M-6 -52 L6 -52 L4 34 L0 52 L-4 34 Z" fill={WOOD} /><path d="M-6 -52 L6 -52 L6 -40 L-6 -40 Z" fill={WOOD_D} /></g>;
  if (kind === "stone") return <g transform={`scale(${s})`}>{g}<line x1={-22} y1={48} x2={10} y2={-46} stroke={WOOD} strokeWidth={9} strokeLinecap="round" />
    <path d="M2 -44 L40 -30 L34 -8 L-2 -24 Z" fill={STONE} stroke={STONE_D} strokeWidth={3} /></g>;
  if (kind === "plough") return <g transform={`scale(${s})`}>{g}<line x1={-50} y1={-40} x2={20} y2={22} stroke={WOOD} strokeWidth={9} strokeLinecap="round" />
    <path d="M10 14 L52 30 L18 44 Z" fill={WOOD_D} /><line x1={-6} y1={2} x2={-34} y2={34} stroke={WOOD} strokeWidth={7} strokeLinecap="round" /></g>;
  if (kind === "iron") return <g transform={`scale(${s})`}>{g}<line x1={-50} y1={-40} x2={14} y2={18} stroke={WOOD} strokeWidth={9} strokeLinecap="round" />
    <path d="M6 10 L56 30 L14 46 Z" fill={IRON} stroke="#2E343A" strokeWidth={3} /><path d="M40 26 L56 30 L46 36 Z" fill={STEEL} /></g>;
  if (kind === "machine") return <g transform={`scale(${s})`}>{g}<rect x={-44} y={-20} width={56} height={30} rx={6} fill="#C8352B" /><rect x={-6} y={-46} width={30} height={30} rx={4} fill="#C8352B" stroke="#7A1E18" strokeWidth={3} />
    <rect x={0} y={-40} width={18} height={16} fill="#BFE3F7" /><line x1={-34} y1={-20} x2={-34} y2={-44} stroke="#333" strokeWidth={5} />
    <circle cx={12} cy={22} r={26} fill="#222" /><circle cx={12} cy={22} r={10} fill="#E2B04C" /><circle cx={-34} cy={28} r={16} fill="#222" /><circle cx={-34} cy={28} r={6} fill="#E2B04C" /></g>;
  return null;
}
// A sickle, side view. kind "stone": wooden crescent with small flint teeth; "steel": thin metal crescent.
function SickleArt({ x, y, s = 1, kind = "steel", glow = 0, op = 1 }) {
  const blade = "M0 0 C 40 -150, 220 -170, 250 -40 C 210 -120, 70 -110, 22 6 Z";
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
      {glow > 0 && <path d={blade} fill="none" stroke={SK.gold} strokeWidth={22} opacity={0.5 * glow} strokeLinejoin="round" />}
      <rect x={-18} y={-4} width={36} height={130} rx={14} fill={WOOD} transform="rotate(-12)" />
      {kind === "stone"
        ? <g><path d={blade} fill={WOOD_D} />
            {Array.from({ length: 7 }, (_, i) => { const t = 0.12 + i * 0.12, bx = lerp(24, 236, t), by = -40 - 92 * Math.sin(Math.PI * t) + 26;
              return <path key={i} d={`M${bx - 13} ${by} L${bx} ${by + 22} L${bx + 13} ${by} Z`} fill={STONE} stroke={STONE_D} strokeWidth={2} />; })}</g>
        : <path d={blade} fill={STEEL} stroke="#7F8C96" strokeWidth={3} />}
    </g>
  );
}

// ---- The central model: the timeline strip ------------------------------------------------
// on[i] = time step i lights (−1 = already lit in an earlier beat, 1e9 = not yet). glowLast pulses the newest step.
const STEPS = [["stick", "Digging stick"], ["stone", "Stone"], ["plough", "Wooden plough"], ["iron", "Iron"], ["machine", "Machines"]];
const SX = 40, SW = 1260, SY = 878, SH = 74;
function Strip({ lt, on, at = 0, op = 1 }) {
  const o = out3(lt, at, 0.6) * op; if (o <= 0) return null;
  const n = STEPS.length, cw = SW / n;
  const lit = on.map((t) => (t < 0 ? 1 : out3(lt, t, 0.6)));
  const fill = lit.reduce((a, v, i) => (v > 0 ? i + v : a), -1);
  return (
    <SVG op={o}>
      <rect x={SX} y={SY} width={SW} height={SH} rx={SH / 2} fill="rgba(5,30,22,0.78)" stroke="rgba(255,255,255,0.25)" strokeWidth={2} />
      {fill >= 0 && <rect x={SX + 4} y={SY + 4} width={clamp((fill + 0.5) * cw, 0, SW - 8)} height={SH - 8} rx={(SH - 8) / 2} fill="rgba(226,176,76,0.22)" />}
      {STEPS.map(([k, lab], i) => {
        const cx = SX + cw * (i + 0.5), cy = SY + SH / 2, v = lit[i], fresh = on[i] >= 0 && lt > on[i] && lt < on[i] + 2.5 ? Math.sin(Math.PI * clamp((lt - on[i]) / 2.5, 0, 1)) : 0;
        return <g key={k}>
          {i > 0 && <path d={`M${cx - cw / 2 - 8} ${cy - 9} L${cx - cw / 2 + 4} ${cy} L${cx - cw / 2 - 8} ${cy + 9}`} fill="none" stroke={lit[i] > 0.5 ? SK.gold : "rgba(255,255,255,0.35)"} strokeWidth={4} strokeLinecap="round" />}
          <circle cx={cx - 92} cy={cy} r={28} fill={v > 0.5 ? SK.cream : "rgba(255,255,255,0.10)"} stroke={v > 0.5 ? SK.gold : "rgba(255,255,255,0.35)"} strokeWidth={3} />
          <g transform={`translate(${cx - 92} ${cy})`} opacity={0.35 + 0.65 * v}><Tool kind={k} s={0.42} glow={fresh} /></g>
          <text x={cx - 56} y={cy + 8} fontFamily={SANS} fontWeight={700} fontSize={k === "plough" ? 21 : 24} fill={v > 0.5 ? SK.gold : "rgba(255,255,255,0.45)"}>{lab}</text>
        </g>;
      })}
    </SVG>
  );
}
const ALL = [-1, -1, -1, -1, -1], NONE = [1e9, 1e9, 1e9, 1e9, 1e9];
const upTo = (k, t) => STEPS.map((_, i) => (i < k ? -1 : i === k ? t : 1e9));

// ============================================================================
function B1(ctx) {
  return ({ localTime: lt, duration }) => {
    const cLook = S("b1", 0), cHuge = W("b1", "huge"), cNow = S("b1", 1), cSmall = W("b1", "small"), cOld = W("b1", "older"), cQ = W("b1", "question"),
      cStill = W("b1", "still"), s = stopFor("b1"), stop = stopAt("b1", s[1]);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[1]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(1, ctx, [L("A huge tractor…", cHuge), L("…and a small khurpi", cSmall), L("Which one is older?", cOld),
          L("BIG QUESTION", cQ, "head"), L("Which farm tool from thousands of years ago is still used in Indian fields today?", cQ + 0.4, "big"), L(s[3], stop, "think")])}>
        <Pic slot="tool_machines" label="A big red tractor ploughs a field" x={40} y={60} w={lerp(1360, 660, out3(lt, cNow, 0.8))} h={520} lt={lt} at={0.1} fx="zoom" zoom={1.15} />
        <Chip text="huge tractor" x={lerp(720, 370, out3(lt, cNow, 0.8))} y={520} lt={lt} at={cHuge} size={28} />
        <Pic slot="khurpi" label="A small khurpi beside young plants" x={740} y={60} w={660} h={520} lt={lt} at={cNow} fx="pop" />
        <Chip text="small khurpi" x={1070} y={520} lt={lt} at={cSmall} size={28} />
        <Big x={40} y={620} w={1360} lt={lt} at={cOld} out={cQ - 0.2} size={60} align="center">Which one is <span style={{ color: SK.gold }}>older</span>?</Big>
        <Card x={40} y={610} w={1360} h={250} lt={lt} at={cQ} pad={30}>
          <Badge text="BIG QUESTION" x={30} y={24} lt={lt} at={cQ} size={28} />
          <div style={{ position: "absolute", left: 30, top: 100, width: 1300, fontFamily: SERIF, fontWeight: 700, fontSize: 44, lineHeight: 1.2, color: SK.white, opacity: out3(lt, cStill - 0.8, 0.6) }}>
            Which farm tool from <span style={{ color: SK.gold }}>thousands of years ago</span> is <span style={{ color: SK.gold }}>still used</span> in Indian fields today?</div>
        </Card>
        <Strip lt={lt} on={NONE} at={cQ} />
        <StopBox lt={lt} b="b1" heading="PAUSE AND DISCUSS" />
      </Scene>
    );
  };
}
function B2(ctx) {
  const tools = ["stick", "stone", "plough", "iron"];
  return ({ localTime: lt, duration }) => {
    const cFirst = S("b2", 0), cFew = W("b2", "few"), cTools = W("b2", "tools"), cNew = W("b2", "new"), cInv = W("b2", "invented"), cEasy = W("b2", "easier"),
      cGreat = W("b2", "great");
    const grow = out3(lt, cNew, 1.2);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[2]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(2, ctx, [L("TOOLS FOLLOW THE CROPS", cFirst, "head"), L("Few crops → few jobs → few tools", cFew), L("New crops and new fields…", cNew),
          L("…new tools: easier, and better", cEasy), L("Each simple tool was a GREAT invention in its time", cGreat, "big")])}>
        <Pic slot="early_field" label="Early farmers in a small field" x={40} y={60} w={lerp(660, 440, grow)} h={lerp(520, 360, grow)} lt={lt} at={0.1} fx="zoom" />
        <Chip text="a few jobs · a few tools" x={lerp(370, 260, grow)} y={lerp(520, 360, grow)} lt={lt} at={cFew} out={cNew + 0.4} size={26} />
        <Pic slot="mixed_crop" label="New crops in a wider field" x={520} y={60} w={420} h={360} lt={lt} at={cNew} fx="pop" />
        <Pic slot="rows" label="Long rows of crops in a big field" x={980} y={60} w={420} h={360} lt={lt} at={cNew + 0.6} fx="pop" />
        <Chip text="new crops" x={730} y={370} lt={lt} at={cNew + 0.2} tone="gold" size={24} />
        <Chip text="new kinds of fields" x={1190} y={370} lt={lt} at={cNew + 0.8} tone="gold" size={24} />
        <SVG op={1}>
          {tools.map((k, i) => { const o = pop(lt, cInv + i * 0.35, 0.5); if (o <= 0) return null;
            return <g key={k} transform={`translate(${200 + i * 340} ${640}) scale(${o})`}><circle r={78} fill="rgba(255,255,255,0.08)" stroke={SK.gold} strokeWidth={4} /><Tool kind={k} s={1.05} /></g>; })}
          {[0, 1, 2].map((i) => <Arrow key={i} x1={290 + i * 340} y1={640} x2={450 + i * 340} y2={640} color={SK.gold} sw={5} op={out3(lt, cInv + (i + 1) * 0.35, 0.4)} />)}
        </SVG>
        <Chip text="easier to use ✓" x={480} y={760} lt={lt} at={cEasy} tone="gold" size={26} />
        <Chip text="worked better ✓" x={900} y={760} lt={lt} at={cEasy + 0.8} tone="gold" size={26} />
        {(() => { const o = out3(lt, cGreat, 0.5); if (o <= 0) return null;
          return <div style={{ position: "absolute", left: 140, top: 540, width: 1160, padding: "26px 30px", borderRadius: 22, background: "rgba(5,30,22,0.9)", boxShadow: `0 0 0 3px ${SK.gold}`,
            opacity: o, textAlign: "center", fontFamily: SERIF, fontWeight: 700, fontSize: 50, color: SK.white, zIndex: 2 }}>
            Each simple tool was a <span style={{ color: SK.gold }}>GREAT</span> invention in its time.</div>; })()}
        <Strip lt={lt} on={NONE} />
      </Scene>
    );
  };
}
// Cross-section: a stick makes a hole, a seed drops in, soil covers it, a sprout comes up.
function StickSow({ x, y, w, h, lt, at, holeAt, dropAt, coverAt, growAt }) {
  const o = out3(lt, at, 0.6); if (o <= 0) return null;
  const sy = y + h * 0.5, cx = x + w * 0.5;
  const push = drive(lt, holeAt - 0.4, holeAt + 0.6), lift = drive(lt, holeAt + 0.7, holeAt + 1.4);
  const depth = 90 * push * (1 - 0) - 0;
  const stickY = sy - 230 + depth - 260 * lift;
  const drop = drive(lt, dropAt, dropAt + 0.7), cover = out3(lt, coverAt, 0.7), grow = out3(lt, growAt, 1.8);
  const hole = push > 0 ? 1 - cover : 0;
  return (
    <SVG op={o}>
      <rect x={x} y={y} width={w} height={h} rx={18} fill="#0B2E22" />
      <rect x={x} y={sy} width={w} height={h - (sy - y)} fill={SK.soil} />
      <line x1={x} y1={sy} x2={x + w} y2={sy} stroke="#8A6A48" strokeWidth={6} />
      {hole > 0 && <path d={`M${cx - 18} ${sy} L${cx} ${sy + 90 * Math.min(push * 1.2, 1)} L${cx + 18} ${sy} Z`} fill="#3A2716" opacity={hole} />}
      {cover > 0 && <path d={`M${cx - 30} ${sy} Q ${cx} ${sy - 18 * cover} ${cx + 30} ${sy} Z`} fill="#7A5A3A" opacity={cover} />}
      {lt > dropAt && <ellipse cx={cx} cy={lerp(sy - 150, sy + 70, drop)} rx={13} ry={9} fill="#E3B55C" stroke="#9E7320" strokeWidth={2} />}
      {lift < 1 && <g transform={`translate(${cx} ${stickY}) rotate(${-4 + 4 * push})`}><Tool kind="stick" s={2.6} /></g>}
      <Sprout x={cx} y={sy} g={grow} s={2.0} />
      <T x={x + 30} y={y + 50} size={26} bold color={SK.cream} anchor="start" op={out3(lt, holeAt, 0.5)}>1 · make a hole</T>
      <T x={x + 30} y={y + 90} size={26} bold color={SK.cream} anchor="start" op={out3(lt, dropAt, 0.5)}>2 · drop in a seed</T>
      <T x={x + 30} y={y + 130} size={26} bold color={SK.cream} anchor="start" op={out3(lt, coverAt, 0.5)}>3 · cover it</T>
      <T x={x + 30} y={y + 170} size={26} bold color={SK.gold} anchor="start" op={out3(lt, growAt, 0.5)}>4 · wait for it to grow</T>
    </SVG>
  );
}
function B3(ctx) {
  return ({ localTime: lt, duration }) => {
    const cFirst = S("b3", 0), cStick = W("b3", "digging"), cHoles = W("b3", "holes"), cDrop = W("b3", "drop"), cCover = W("b3", "cover"), cGrow = W("b3", "grow");
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[3]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(3, ctx, [L("The very first tool", cFirst, "head"), L("THE DIGGING STICK", cStick, "big"), L("A pointed stick to make holes in the soil", cHoles),
          L("Drop in a seed · cover it · wait for it to grow", cDrop)])}>
        <Pic slot="tool_stick" label="A digging stick" x={40} y={60} w={600} h={780} lt={lt} at={0.1} fx="zoom" zoom={1.2} />
        <Chip text="DIGGING STICK" x={340} y={780} lt={lt} at={cStick} tone="gold" size={30} />
        <StickSow x={680} y={60} w={720} h={780} lt={lt} at={cFirst + 0.3} holeAt={cHoles} dropAt={cDrop} coverAt={cCover} growAt={cGrow} />
        <Strip lt={lt} on={upTo(0, cStick)} />
      </Scene>
    );
  };
}
function B4(ctx) {
  return ({ localTime: lt, duration }) => {
    const cStone = W("b4", "stone"), cHoe = W("b4", "hoe"), cLoose = W("b4", "loosened"), cSick = W("b4", "sickle"), cCut = W("b4", "cut"), cHarv = W("b4", "harvest"),
      s = stopFor("b4"), stop = stopAt("b4", s[1]);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[4]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(4, ctx, [L("Tools made with STONE", cStone, "head"), L("STONE HOE: loosens the hard soil", cHoe), L("STONE SICKLE: cuts the ripe crops at harvest", cSick),
          L(s[3], stop, "think")])}>
        <Pic slot="tool_stone" label="Stone hoe and stone sickle" x={40} y={60} w={1360} h={300} lt={lt} at={0.1} fx="pan" />
        <Chip text="tools made with STONE" x={720} y={310} lt={lt} at={cStone} tone="gold" size={28} />
        <Pic slot="hoe" label="Loosening hard soil with a hoe" x={40} y={400} w={660} h={440} lt={lt} at={cHoe} fx="zoom" />
        <Chip text="HOE · loosens the soil" x={370} y={780} lt={lt} at={cLoose} tone="gold" size={28} />
        <Pic slot="stone_sickle_cut" label="A sickle with sharp stone blades cuts ripe grain" x={740} y={400} w={660} h={440} lt={lt} at={cSick} fx="zoom" />
        <Chip text="SICKLE · cuts the crops" x={1070} y={780} lt={lt} at={cCut} tone="gold" size={28} />
        <SVG op={out3(lt, cHarv, 0.5) * (1 - reveal(lt, stop - 0.3, 0.3))}><SickleArt x={1180} y={560} s={0.55} kind="stone" /></SVG>
        <Strip lt={lt} on={upTo(1, cStone)} />
        <StopBox lt={lt} b="b4" heading="HAVE YOU UNDERSTOOD?" />
      </Scene>
    );
  };
}
// From above: oxen and plough sweep long furrows across a field; a person digging by hand barely starts.
function FurrowRace({ x, y, w, h, lt, at, until }) {
  const o = out3(lt, at, 0.6); if (o <= 0) return null;
  const p = drive(lt, at + 0.3, until), rows = 5, done = p * rows;
  const hand = 0.08 * p;
  return (
    <SVG op={o}>
      <rect x={x} y={y} width={w} height={h} rx={16} fill="#A57B52" stroke="rgba(255,255,255,0.5)" strokeWidth={3} />
      <line x1={x + w * 0.64} y1={y + 10} x2={x + w * 0.64} y2={y + h - 10} stroke="rgba(255,255,255,0.4)" strokeWidth={3} strokeDasharray="10 10" />
      {Array.from({ length: rows }, (_, r) => { const f = clamp(done - r, 0, 1); if (f <= 0) return null;
        const yy = y + 34 + r * (h - 68) / (rows - 1), left2right = r % 2 === 0, x0 = x + 20, x1 = x + w * 0.62;
        const xa = left2right ? x0 : x1, xb = lerp(xa, left2right ? x1 : x0, f);
        return <g key={r}><line x1={xa} y1={yy} x2={xb} y2={yy} stroke="#5A3D24" strokeWidth={12} strokeLinecap="round" />
          {f < 1 && <g transform={`translate(${xb} ${yy}) scale(${left2right ? 1 : -1} 1)`}>
            <rect x={6} y={-22} width={34} height={16} rx={8} fill="#F2EBDD" /><rect x={6} y={6} width={34} height={16} rx={8} fill="#D9C7A8" />
            <circle cx={44} cy={-14} r={8} fill="#F2EBDD" /><circle cx={44} cy={14} r={8} fill="#D9C7A8" /><line x1={-10} y1={0} x2={8} y2={0} stroke={WOOD_D} strokeWidth={5} /></g>}</g>; })}
      <rect x={x + w * 0.68} y={y + h / 2 - 20} width={(w * 0.28) * hand / 0.08 * 0.3} height={40} rx={8} fill="#5A3D24" />
      <circle cx={x + w * 0.68 + (w * 0.28) * hand / 0.08 * 0.3 + 18} cy={y + h / 2} r={14} fill={SK.cream} />
      <T x={x + w * 0.32} y={y + h + 40} size={26} bold color={SK.gold}>oxen + plough: long, straight furrows</T>
      <T x={x + w * 0.82} y={y + h + 40} size={26} bold color={SK.cream}>by hand…</T>
    </SVG>
  );
}
function B5(ctx) {
  return ({ localTime: lt, duration }) => {
    const cIdea = W("b5", "idea"), cAnim = W("b5", "animals"), cWood = W("b5", "wooden"), cOxen = W("b5", "oxen"), cLines = W("b5", "straight"), cFur = W("b5", "furrows"),
      cHand = W("b5", "hand"), breakAt = SE("b5", 2) + 0.15;
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[5]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(5, ctx, [L("A big idea…", cIdea, "head"), L("Let ANIMALS do the heavy work", cAnim), L("WOODEN PLOUGH pulled by a pair of oxen", cWood, "big"),
          L("Long, straight lines called FURROWS", cFur), L("Much faster than by hand", cHand)])}>
        <Pic slot="hero_plough" label="A pair of oxen pull a wooden plough" x={40} y={60} w={1360} h={lerp(800, 400, out3(lt, cLines, 0.8))} lt={lt} at={0.1} fx="zoom" zoom={1.12} />
        <Chip text="let ANIMALS do the heavy work" x={720} y={lerp(740, 340, out3(lt, cLines, 0.8))} lt={lt} at={cAnim} tone="gold" size={30} />
        <SVG op={out3(lt, cWood, 0.5) * (1 - reveal(lt, cLines, 0.4))}><g transform="translate(1250 640)"><circle r={90} fill="rgba(5,30,22,0.85)" stroke={SK.gold} strokeWidth={4} /><Tool kind="plough" s={1.3} /></g></SVG>
        <FurrowRace x={40} y={500} w={1360} h={290} lt={lt} at={cLines} until={cHand + 1.0} />
        <Chip text="FURROWS" x={500} y={470} lt={lt} at={cFur} tone="gold" size={26} />
        <Strip lt={lt} on={upTo(2, cWood)} />
        <Break lt={lt} at={breakAt} dur={2.4} />
      </Scene>
    );
  };
}
// The Kalibangan field from above: close furrows one way (≈30 cm apart), wide ones the other (≈190 cm).
function GridField({ x, y, w, h, lt, at, crossAt }) {
  const o = out3(lt, at, 0.6); if (o <= 0) return null;
  const a = drive(lt, at, at + 1.6), b = drive(lt, crossAt, crossAt + 1.6);
  return (
    <SVG op={o}>
      <rect x={x} y={y} width={w} height={h} rx={14} fill="#C9A27A" stroke="rgba(255,255,255,0.5)" strokeWidth={3} />
      {Array.from({ length: 14 }, (_, i) => { const yy = y + 20 + i * (h - 40) / 13; return <line key={"a" + i} x1={x + 14} y1={yy} x2={x + 14 + (w - 28) * a} y2={yy} stroke="#6E4E30" strokeWidth={5} strokeLinecap="round" />; })}
      {Array.from({ length: 4 }, (_, i) => { const xx = x + w * (0.14 + i * 0.24); return <line key={"b" + i} x1={xx} y1={y + 14} x2={xx} y2={y + 14 + (h - 28) * b} stroke="#4A321D" strokeWidth={9} strokeLinecap="round" />; })}
      <T x={x + w / 2} y={y + h + 34} size={22} color={SK.cream} op={out3(lt, crossAt + 1.2, 0.5)}>close furrows one way · wide furrows across them</T>
    </SVG>
  );
}
function B6(ctx) {
  return ({ localTime: lt, duration }) => {
    const cDyk = S("b6", 0), cKal = W("b6", "kalibangan"), cArch = W("b6", "archaeologists"), cYears = W("b6", "4800"), cGrid = W("b6", "grid"), cCross = W("b6", "cross"),
      cOld = W("b6", "oldest"), cStill = W("b6", "still"), cTwo = W("b6", "two"), cMust = W("b6", "mustard"), s = stopFor("b6"), stop = stopAt("b6", s[1]);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[6]} showCaps={ctx.caps} capSize={ctx.capSize} fi={0.3}
        panel={panel(6, ctx, [L("Kalibangan, Rajasthan", cKal, "head"), L("A field ploughed about 4,800 years ago", cYears), L("Furrows cross like a grid", cGrid),
          L("The world's OLDEST known ploughed field", cOld, "big"), L("Still ploughed this way for two crops together", cStill), L(s[3], stop, "think"),
          L("Source: Kalibangan, dated c. 2800 BCE by B. B. Lal, ASI (Wikipedia)", cMust + 1.0, "source")], { max: 7 })}>
        <Card x={40} y={50} w={1360} h={800} lt={lt} at={0} pad={0} />
        <Badge x={80} y={80} lt={lt} at={cDyk} size={36} />
        <Pic slot="kalibangan_dig" label="The 4,800-year-old ploughed field found at Kalibangan" x={80} y={170} w={720} h={500} lt={lt} at={cArch} out={cMust} fx="zoom" />
        <Pic slot="mustard_gram" label="Mustard and gram growing together in one field" x={80} y={170} w={720} h={500} lt={lt} at={cMust} fx="zoom" />
        <Chip text="📍 Kalibangan · Rajasthan, India" x={440} y={190} lt={lt} at={cKal} tone="gold" size={26} />
        <Chip text="mustard + gram, together" x={440} y={620} lt={lt} at={cMust + 0.2} tone="gold" size={26} />
        <div style={{ position: "absolute", left: 850, top: 160, width: 520, opacity: out3(lt, cYears, 0.5) }}>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 96, color: SK.gold, lineHeight: 1 }}>4,800</div>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 32, color: SK.white, marginTop: 8 }}>years ago: ploughed!</div>
        </div>
        <GridField x={860} y={330} w={500} h={300} lt={lt} at={cGrid - 0.6} crossAt={cCross} />
        <div style={{ position: "absolute", left: 80, top: 700, width: 1280, fontFamily: SERIF, fontWeight: 700, fontSize: 46, lineHeight: 1.15, color: SK.white, opacity: out3(lt, cOld, 0.6) }}>
          The world's <span style={{ color: SK.gold }}>OLDEST</span> known ploughed field</div>
        <div style={{ position: "absolute", left: 80, top: 770, width: 1280, fontFamily: SANS, fontSize: 30, color: SK.cream, opacity: out3(lt, cTwo, 0.6) }}>…still ploughed this way to grow two crops together</div>
        <Strip lt={lt} on={ALL.map((v, i) => (i <= 2 ? -1 : 1e9))} />
        <StopBox lt={lt} b="b6" />
      </Scene>
    );
  };
}
// The farmed field grows: a small plot widens into a big one (at = start, until = end).
function BigField({ x, y, w, h, lt, at, until }) {
  const o = out3(lt, at, 0.5); if (o <= 0) return null;
  const p = drive(lt, at, until), fw = lerp(w * 0.25, w, p), fh = lerp(h * 0.35, h, p);
  return (
    <SVG op={o}>
      <rect x={x} y={y + h - fh} width={fw} height={fh} rx={10} fill="#7A5A3A" stroke={SK.gold} strokeWidth={3} />
      {Array.from({ length: Math.max(2, Math.round(fh / 26)) }, (_, i) => <line key={i} x1={x + 8} y1={y + h - fh + 14 + i * 26} x2={x + fw - 8} y2={y + h - fh + 14 + i * 26} stroke="#4A321D" strokeWidth={4} />)}
      <rect x={x} y={y + h - h * 0.35} width={w * 0.25} height={h * 0.35} rx={8} fill="none" stroke={SK.cream} strokeWidth={3} strokeDasharray="8 8" opacity={p} />
    </SVG>
  );
}
function Sparks({ cx, cy, lt, at, until }) {
  const o = windowOp(lt, at, until, 0.3); if (o <= 0) return null;
  return <SVG op={o}>{Array.from({ length: 22 }, (_, i) => { const p = (lt * 1.3 + rnd(i)) % 1, a = -Math.PI * (0.15 + 0.7 * rnd(i + 9)), r = 40 + 220 * p;
    return <circle key={i} cx={cx + Math.cos(a) * r} cy={cy + Math.sin(a) * r + 120 * p * p} r={5 * (1 - p) + 1} fill={i % 3 ? "#FFC24A" : "#FF7A2A"} opacity={1 - p} />; })}</SVG>;
}
function B7(ctx) {
  const ticks = [["stronger", "stronger"], ["sharper", "sharper"], ["lasted", "lasted much longer"]];
  return ({ localTime: lt, duration }) => {
    const c3000 = W("b7", "3000"), cIron = W("b7", "iron"), ats = ticks.map((t) => W("b7", t[0])), cPl = W("b7", "plough"), cHard = W("b7", "hard"), cBig = W("b7", "bigger"),
      cFarm = W("b7", "farmed");
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[7]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(7, ctx, [L("About 3,000 years ago", c3000, "head"), L("Tools made of IRON", cIron, "big"), L("Stronger · sharper · lasted much longer", ats[0]),
          L("IRON PLOUGH: breaks hard ground", cPl), L("Much BIGGER fields could be farmed", cBig)])}>
        <Pic slot="blacksmith" label="A blacksmith hammers a red-hot iron blade" x={40} y={60} w={760} h={500} lt={lt} at={0.1} fx="zoom" />
        <Sparks cx={420} cy={360} lt={lt} at={0.4} until={cPl} />
        <Chip text="about 3,000 years ago" x={420} y={80} lt={lt} at={c3000} tone="gold" size={26} />
        <Pic slot="tool_iron" label="Iron tools" x={840} y={60} w={560} h={300} lt={lt} at={cIron} fx="pop" />
        <Lines x={860} y={390} w={540} lt={lt} lines={ticks.map(([, t], i) => ({ text: "✓ " + t, at: ats[i], size: 40, bold: true, serif: true, color: i === 2 ? SK.gold : SK.white }))} gap={6} />
        <Pic slot="iron_plough" label="An iron-tipped plough breaks hard ground" x={40} y={600} w={760} h={250} lt={lt} at={cPl} fx="pan" />
        <Chip text="IRON PLOUGH · breaks hard ground" x={420} y={800} lt={lt} at={cHard} tone="gold" size={24} />
        <BigField x={860} y={600} w={540} h={250} lt={lt} at={cBig - 0.3} until={cFarm + 0.8} />
        <Chip text="much BIGGER fields" x={1130} y={580} lt={lt} at={cBig} tone="gold" size={26} />
        <Strip lt={lt} on={upTo(3, cIron)} />
      </Scene>
    );
  };
}
// Many workers fade out as one machine fades in.
function ManyToOne({ x, y, lt, at, oneAt }) {
  const o = out3(lt, at, 0.6); if (o <= 0) return null;
  const k = out3(lt, oneAt, 1.2);
  return (
    <SVG op={o}>
      {Array.from({ length: 12 }, (_, i) => { const c = i % 6, r = Math.floor(i / 6), px = x + c * 62, py = y + r * 84;
        return <g key={i} transform={`translate(${lerp(px, x + 470, k * 0.6)} ${lerp(py, y + 40, k * 0.6)})`} opacity={1 - k} fill={r ? SK.cream : SK.gold}>
          <circle r={14} /><path d="M-18 60 L-18 30 Q 0 14 18 30 L18 60 Z" /></g>; })}
      <g transform={`translate(${x + 560} ${y + 80}) scale(${0.6 + 0.6 * k})`} opacity={k}><Tool kind="machine" s={1.4} /></g>
      <T x={x + 180} y={y + 200} size={30} bold color={SK.cream} op={1 - k}>MANY people…</T>
      <T x={x + 560} y={y + 200} size={30} bold color={SK.gold} op={k}>…ONE machine</T>
    </SVG>
  );
}
function B8(ctx) {
  const m = [["tool_machines", "A tractor pulls the plough", "tractor"], ["power_tiller", "A power tiller churns up the soil", "tiller"], ["combine", "A combine harvester cuts, threshes and cleans", "combine"]];
  return ({ localTime: lt, duration }) => {
    const cMach = W("b8", "machines"), ats = m.map((x) => W("b8", x[2])), cThresh = W("b8", "threshes"), cOne = W("b8", "one"), cMany = W("b8", "many", 1),
      s = stopFor("b8"), stop = stopAt("b8", s[1]);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[8]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(8, ctx, [L("Today: MACHINES", cMach, "head"), L("Tractor: pulls the plough", ats[0]), L("Power tiller: churns up the soil", ats[1]),
          L("Combine harvester: cuts, threshes and cleans the grain, all at once", ats[2]), L("ONE machine = the work of MANY people", cOne, "big"), L(s[3], stop, "think")], { max: 6 })}>
        {m.map(([slot, lab, k], i) => <React.Fragment key={slot}>
          <Pic slot={slot} label={lab} x={40 + i * 460} y={60} w={440} h={420} lt={lt} at={ats[i]} fx="zoom" />
          <Chip text={["tractor", "power tiller", "combine harvester"][i]} x={260 + i * 460} y={430} lt={lt} at={ats[i] + 0.2} tone="gold" size={26} />
        </React.Fragment>)}
        <Lines x={980} y={500} w={420} lt={lt} lines={[{ text: "cuts ✓", at: W("b8", "cuts"), size: 32 }, { text: "threshes ✓", at: cThresh, size: 32 }, { text: "cleans ✓ — all at once!", at: W("b8", "cleans"), size: 32, color: SK.gold }]} gap={4} />
        <ManyToOne x={80} y={540} lt={lt} at={cThresh + 0.4} oneAt={cOne + 0.4} />
        <Chip text="ONE machine = the work of MANY people" x={720} y={800} lt={lt} at={cMany} tone="gold" size={30} />
        <Strip lt={lt} on={upTo(4, cMach)} />
        <StopBox lt={lt} b="b8" heading="HAVE YOU UNDERSTOOD?" h={790} />
      </Scene>
    );
  };
}
function B9(ctx) {
  const still = [["khurpi", "KHURPI", "khurpi"], ["sickle", "SICKLE", "sickle"], ["hoe", "HOE", "hoe"]];
  return ({ localTime: lt, duration }) => {
    const cNever = S("b9", 0), ats = still.map((x) => W("b9", x[2])), cEvery = W("b9", "every"), cSame = W("b9", "same"), cMetal = W("b9", "metal"), cShape = W("b9", "shape"),
      cAns = W("b9", "answer"), cSick = W("b9", "sickle", 1), cThou = W("b9", "thousands"), cToday = W("b9", "today"), stop = stopAt("b9", 7);
    const phA = 1 - reveal(lt, cSame - 0.2, 0.5), phB = out3(lt, cSame - 0.2, 0.5) * (1 - reveal(lt, cAns, 0.5)), glow = out3(lt, cShape, 0.6);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[9]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(9, ctx, [L("STILL IN USE", cNever, "head"), L("Khurpi · sickle · hoe", ats[0]), L("Same idea: better metal, better shape", cSame),
          L("ANSWER: THE SICKLE", cSick, "big"), L("Quick check: five questions", stop, "think")], { max: 6 })}>
        <div style={{ position: "absolute", inset: 0, opacity: phA }}>
          {still.map(([slot, lab], i) => <React.Fragment key={slot}>
            <Pic slot={slot} label={lab} x={40 + i * 460} y={60} w={440} h={560} lt={lt} at={ats[i]} fx="zoom" />
            <Chip text={lab} x={260 + i * 460} y={570} lt={lt} at={ats[i] + 0.2} tone="gold" size={30} />
          </React.Fragment>)}
          <Big x={40} y={670} w={1360} lt={lt} at={cEvery} size={44} align="center">…still used <span style={{ color: SK.gold }}>every day</span>, by farmers and gardeners</Big>
        </div>
        <div style={{ position: "absolute", inset: 0, opacity: phB }}>
          <SVG op={1}>
            <SickleArt x={200} y={520} s={1.6} kind="stone" glow={glow} />
            <SickleArt x={840} y={520} s={1.6} kind="steel" glow={glow} />
          </SVG>
          <Chip text="OLD · stone blades" x={420} y={640} lt={lt} at={cSame} size={28} />
          <Chip text="TODAY · steel" x={1060} y={640} lt={lt} at={cSame + 0.3} size={28} />
          <Big x={40} y={710} w={1360} lt={lt} at={cMetal} size={44} align="center">Same idea – <span style={{ color: SK.gold }}>better metal, better shape</span></Big>
        </div>
        <Pic slot="sickle" label="A farmer cuts the crop with a sickle" x={40} y={60} w={900} h={790} lt={lt} at={cAns} fx="zoom" zoom={1.15} />
        <div style={{ position: "absolute", left: 980, top: 100, width: 420, opacity: out3(lt, cAns, 0.5) }}>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 26, letterSpacing: "0.14em", color: SK.gold }}>THE ANSWER</div>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 68, color: SK.white, whiteSpace: "nowrap", opacity: out3(lt, cSick, 0.4), transform: `scale(${0.8 + 0.2 * pop(lt, cSick, 0.6)})`, transformOrigin: "left center" }}>THE SICKLE!</div>
        </div>
        <Lines x={980} y={330} w={420} lt={lt} lines={[{ text: "thousands of years ago…", at: cThou, size: 34, bold: true, serif: true }, { text: "…and still today ✓", at: cToday, size: 34, bold: true, serif: true, color: SK.gold }]} />
        <Strip lt={lt} on={ALL} />
        <StopBox lt={lt} b="b9" heading="QUICK CHECK">
          <div style={{ marginTop: 30, textAlign: "left", width: 1080 }}>
            {QUICK.map((q, i) => <div key={i} style={{ display: "flex", gap: 22, alignItems: "baseline", marginTop: 12 }}>
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
const COLLAGE = [{ slot: "hero_plough", x: -60, y: -40, w: 760, h: 520, ph: 0 }, { slot: "combine", x: 640, y: -80, w: 760, h: 520, ph: 2 },
  { slot: "tool_stone", x: -80, y: 520, w: 700, h: 560, ph: 4 }, { slot: "sickle", x: 560, y: 560, w: 820, h: 560, ph: 1 }];
function Lp3Scenes(props = {}) {
  const caps = props.showCaptions === "false" ? false : props.showCaptions !== false;
  const titles = {};
  for (let n = 1; n <= NB; n++) titles[n] = str(props["title" + n + "Text"], TITLES[n]);
  const ctx = { caps, titles, capSize: num(props.captionSize, 34) };
  const B = [B1, B2, B3, B4, B5, B6, B7, B8, B9];
  const beats = B.map((Bn, i) => { const t = BEAT("b" + (i + 1)); return [t.start, t.start + t.dur, Bn]; });
  return (
    <StoryFrame props={props} dur={DUR} persistKey="thinkpro-lp3-ancient-and-modern-tools" collage={COLLAGE}>
      {beats.map(([s, e, Bn], i) => (
        <Sprite key={i} start={s} end={e}>{Bn(ctx)}</Sprite>
      ))}
      {STOPS.map(([b, i, hold]) => <StopAt key={b} t={BEAT(b).start + stopAt(b, i)} hold={hold - 0.2} />)}
      <ChimeAt t={BEAT("b6").start + S("b6", 0, 0)} />
      <AudioSync />
    </StoryFrame>
  );
}
window.Lp3Scenes = Lp3Scenes;
