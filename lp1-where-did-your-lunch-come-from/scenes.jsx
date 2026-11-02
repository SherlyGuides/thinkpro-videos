/* global React, window */
// ThinkPro Academy — "Where Did Your Lunch Come From?" (Grade 6 Agriculture, Session 1).
// After AG_G6_S1_Video_Script_Gatherers_to_Farmers (31 Oct 2026): 16 scenes told as a
// time-travel story, three "Have you understood?" pause screens (5 s silent holds — the web
// player freezes there, TPStory.StopAt), one "Do you know?" card per teaching scene.
// STORY STYLE (engine/story-kit.jsx). Everything is a pure function of beat-local time.
const { Sprite, Easing } = window;
const { reveal, windowOp, fade } = window.TPMotion;
const { num, str } = window.TPStage;
const { SK, SERIF, SANS, LEFT_W, pop, out3, lerp, drive, photoSrc,
  Pic, Chip, Badge, Big, Card, SVG, Arrow, Ring, T, ChimeAt, Scene, StoryFrame, StopAt, Break } = window.TPStory;

// ---- Timing: EVERYTHING is keyed to the narration (tools/fit_timing.py → timing.js).
const TM = window.TP_TIMING;
if (!TM) console.error("timing.js missing — run: python3 tools/fit_timing.py videos/lp1-where-did-your-lunch-come-from");
const LEAD = TM ? TM.lead : 1.0;
const DUR = TM ? TM.total : 340;
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
const NB = 16;
const CAPS = {};
if (TM) for (let n = 1; n <= NB; n++) CAPS[n] = capsFor("b" + n);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// ---- Panel copy. Title defaults mirror the DC data-props (titleNText) — keep in sync. ----
const TITLES = { 1: "LP1 – Where did your lunch come from?", 2: "Thousands of years ago", 3: "The gatherers", 4: "Hunters and fire", 5: "Have you understood?",
  6: "Taming animals", 7: "The big idea", 8: "The first crops", 9: "Seed, soil, water, tools", 10: "Have you understood?", 11: "Rain only", 12: "New ideas for water",
  13: "Fun fact: clay pots", 14: "Drip irrigation", 15: "Have you understood?", 16: "Think and ask" };
const KICK = "Grade 6 · Agriculture · Session 1";
const KICKS = { 5: "Pause point 1 of 3", 10: "Pause point 2 of 3", 13: "Fun fact", 15: "Pause point 3 of 3", 16: "Think and ask" };
const panel = (n, ctx, lines, extra = {}) => ({ kicker: KICKS[n] || KICK, title: ctx.titles[n], lines, ...extra });
const L = (text, at, kind = "item", extra = {}) => ({ text, at, kind, ...extra });

// ---- "Do you know?" facts (one per teaching scene, shown on the last sentence) ----
const DYK = { 3: "Gatherers had no home that stayed in one place.", 4: "Fire was one of the biggest discoveries in human history.", 6: "The dog was the first animal humans tamed.",
  7: "This idea changed how humans lived forever.", 8: "In the Indian subcontinent, at Mehrgarh, farmers grew wheat and barley about 9,000 years ago.",
  9: "Farmers have saved seeds for thousands of years.", 11: "About half of India's farmland still depends on rain.", 12: "The Persian wheel was turned by bullocks walking in a circle.",
  14: "Drip irrigation uses much less water than flooding a field." };
function Dyk({ lt, at, n, y = 822 }) {
  const o = out3(lt, at, 0.6); if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 40, top: y, width: 1360, height: 150, borderRadius: 22, background: "rgba(5,30,22,0.86)", opacity: o, boxSizing: "border-box",
      boxShadow: "0 0 0 3px rgba(226,176,76,0.9)", padding: "22px 34px 22px 340px", display: "flex", alignItems: "center", transform: `translateY(${(1 - o) * 20}px)` }}>
      <Badge x={30} y={44} lt={lt} at={at} size={28} text="DO YOU KNOW?" />
      <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 34, lineHeight: 1.22, color: SK.white }}>{DYK[n]}</div>
    </div>
  );
}

// ---- Presenter stops: [beat, sentence index whose pauseAfter is the hold, hold s]
const STOPS = [["b5", 1, 5.0], ["b10", 1, 5.0], ["b15", 0, 5.0]];
const stopAt = (b, i) => SE(b, i) + 0.1;                       // beat-local start of the hold
const stopFor = (b) => STOPS.find((s) => s[0] === b);

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
function Node({ slot, label, x, y, r = 70, lt, at, size = 24, out = null }) {
  const o = pop(lt, at, 0.6) * (out != null ? 1 - reveal(lt, out, 0.4) : 1); if (o <= 0) return null;
  return (
    <React.Fragment>
      <Pic slot={slot} label={label} x={x - r} y={y - r} w={2 * r} h={2 * r} r={r} lt={lt} at={at} out={out} fx="pop" style={{ boxShadow: "0 0 0 4px " + SK.cream }} />
      <Chip text={label} x={x} y={y + r + 14} lt={lt} at={at + 0.15} out={out} size={size} />
    </React.Fragment>
  );
}
function Arr({ x1, y1, x2, y2, lt, at, color = SK.gold, sw = 6 }) { return <Arrow x1={x1} y1={y1} x2={x2} y2={y2} color={color} sw={sw} op={out3(lt, at, 0.5)} />; }
// Flat lunch plate (the central visual model): rim, rice, dal bowl, rotis, banana. foodOp fades the food away.
function Plate({ cx, cy, r = 300, lt, at = 0, foodOp = 1, op = 1 }) {
  const o = pop(lt, at, 0.8) * op; if (o <= 0) return null;
  const k = r / 300;
  return (
    <SVG op={o}>
      <g transform={`translate(${cx} ${cy}) scale(${k * (0.9 + 0.1 * o)})`}>
        <circle r={300} fill={SK.cream} stroke={SK.creamEdge} strokeWidth={10} />
        <circle r={236} fill="#FBF8EE" stroke={SK.creamEdge} strokeWidth={4} />
        <g opacity={foodOp}>
          <ellipse cx={-70} cy={-40} rx={120} ry={78} fill="#FFFFFF" stroke="#DED7C6" strokeWidth={4} />
          {[[-120, -60], [-40, -80], [-20, -20], [-110, -10], [-70, -50]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx={9} ry={5} fill="#EFEAE0" />)}
          <circle cx={120} cy={-90} r={72} fill="#B8861B" />
          <circle cx={120} cy={-96} r={56} fill="#E9A93C" />
          <circle cx={100} cy={120} r={82} fill="#D9A66A" stroke="#B98747" strokeWidth={4} />
          <circle cx={128} cy={100} r={82} fill="#E3B57C" stroke="#B98747" strokeWidth={4} />
          {[[112, 70], [150, 120], [96, 128], [140, 150]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={7} fill="#B98747" opacity={0.7} />)}
          <path d="M-220 80 C -200 20, -120 10, -60 70 C -110 50, -170 70, -200 120 Z" fill="#F2D23B" stroke="#C9A800" strokeWidth={4} strokeLinejoin="round" />
          <path d="M-224 84 l-14 -8" stroke="#6B5A1E" strokeWidth={6} strokeLinecap="round" />
        </g>
      </g>
    </SVG>
  );
}
// Three fire icons: cooking pot, warm hands, animal running away (flat SVG glyphs).
function FireIcons({ lt, atCook, atWarm, atScare, x = 760, y = 560 }) {
  const icon = (k, at, label, glyph) => { const o = pop(lt, at, 0.6); if (o <= 0) return null;
    return <g key={k} transform={`translate(${x + k * 215} ${y})`} opacity={o}>
      <circle cx={0} cy={0} r={74} fill="rgba(255,255,255,0.10)" stroke={SK.gold} strokeWidth={4} />{glyph}
      <text x={0} y={122} textAnchor="middle" fontFamily={SANS} fontWeight="700" fontSize="26" fill={SK.white}>{label}</text></g>; };
  return (
    <SVG op={1}>
      {icon(0, atCook, "Cook", <g fill="none" stroke={SK.cream} strokeWidth={6} strokeLinecap="round"><path d="M-40 -10 L-32 34 L32 34 L40 -10 Z" fill="#8A6A48" /><path d="M-50 -10 L50 -10" /><path d="M-18 -42 C-18 -30 -8 -30 -8 -18 M8 -42 C8 -30 18 -30 18 -18" /></g>)}
      {icon(1, atWarm, "Keep warm", <g fill="none" stroke={SK.cream} strokeWidth={6} strokeLinecap="round"><path d="M-10 30 C-30 10 -40 -10 -20 -30 C-10 -40 0 -20 0 -6 C0 -20 10 -40 20 -30 C40 -10 30 10 10 30 Z" fill="#F0A24A" /></g>)}
      {icon(2, atScare, "Scare away animals", <g fill="none" stroke={SK.cream} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round"><path d="M-44 10 L-20 -12 L14 -12 L34 -30 L36 -12 L30 14 L16 14 L8 32 M-6 14 L-14 32 M-30 14 L-38 32" /><path d="M-54 -36 L-30 -24 M-50 -8 L-32 -4" stroke={SK.gold} /></g>)}
    </SVG>
  );
}
// Flame (flat, flickering) for the spark → fire moment.
function Flame({ x, y, s = 1, lt, at, op = 1 }) {
  const o = pop(lt, at, 0.7) * op; if (o <= 0) return null;
  const f = 1 + 0.06 * Math.sin(lt * 14) + 0.04 * Math.sin(lt * 23);
  return (
    <SVG op={o}>
      <g transform={`translate(${x} ${y}) scale(${s * o}, ${s * o * f})`}>
        <path d="M0 0 C -70 -40 -80 -120 -30 -170 C -20 -120 10 -120 0 -80 C 30 -120 20 -170 60 -200 C 90 -130 80 -60 0 0 Z" fill="#F0A24A" />
        <path d="M0 -6 C -34 -30 -40 -80 -10 -110 C -6 -80 14 -80 8 -56 C 26 -84 20 -110 40 -126 C 56 -84 46 -40 0 -6 Z" fill="#F7D35B" />
        <rect x={-110} y={0} width={220} height={18} rx={9} fill="#5C4A3E" />
      </g>
    </SVG>
  );
}
// Rain: falling streaks over an area (pure function of lt).
function Rain({ x, y, w, h, lt, op = 1, n = 46 }) {
  if (op <= 0) return null;
  return (
    <SVG op={op}>
      <defs><clipPath id="rainclip"><rect x={x} y={y} width={w} height={h} rx={18} /></clipPath></defs>
      <g clipPath="url(#rainclip)" stroke="rgba(200,235,255,0.85)" strokeWidth={4} strokeLinecap="round">
        {Array.from({ length: n }, (_, i) => { const px = x + (i * 37) % w, py = y + ((lt * 620 + i * 71) % (h + 60)) - 30;
          return <line key={i} x1={px} y1={py} x2={px - 6} y2={py + 34} />; })}
      </g>
    </SVG>
  );
}
// Pause screen: pause icon, heading, question bubbles on cues, countdown ring during the hold.
function PauseCard({ lt, at, hold, heading, items, n, children }) {
  const o = windowOp(lt, 0.15, at + hold + 0.6, 0.35); if (o <= 0) return null;
  const tick = Math.max(1, Math.ceil(5 * (1 - clamp((lt - at) / hold, 0, 1))));
  return (
    <div style={{ position: "absolute", left: 40, top: 60, width: LEFT_W - 80, height: 900, borderRadius: 26, background: "rgba(5,30,22,0.9)", opacity: o,
      boxShadow: "0 0 0 3px rgba(226,176,76,0.9)", padding: "56px 80px", boxSizing: "border-box" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
        <svg width="90" height="90" viewBox="0 0 90 90"><circle cx="45" cy="45" r="43" fill={SK.gold} /><rect x="28" y="24" width="12" height="42" rx="4" fill={SK.ink} /><rect x="50" y="24" width="12" height="42" rx="4" fill={SK.ink} /></svg>
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 30, letterSpacing: "0.08em", color: SK.ink, background: SK.gold, padding: "10px 30px", borderRadius: 14 }}>PAUSE</div>
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 54, color: SK.white }}>{heading}</div>
      </div>
      {items.map((it, i) => <div key={i} style={{ display: "flex", gap: 24, alignItems: "flex-start", marginTop: i === 0 ? 50 : 28, opacity: out3(lt, it.at, 0.5), transform: `translateX(${(1 - out3(lt, it.at, 0.5)) * 30}px)` }}>
        <span style={{ flex: "none", fontFamily: SERIF, fontWeight: 700, fontSize: 40, color: SK.gold, width: 50 }}>{i + 1}</span>
        <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 42, color: SK.white, lineHeight: 1.22, background: "rgba(255,255,255,0.08)", padding: "10px 26px", borderRadius: 18 }}>{it.text}</span></div>)}
      {children}
      <div style={{ position: "absolute", left: 80, bottom: 44, fontFamily: SANS, fontSize: 26, color: SK.dim }}>Pause point {n} of 3 · press play to continue</div>
      {lt >= at - 0.2 && lt <= at + hold + 0.3 && (
        <svg width="140" height="140" viewBox="0 0 140 140" style={{ position: "absolute", right: 60, bottom: 30 }}>
          <circle cx="70" cy="70" r="58" stroke="rgba(255,255,255,0.3)" strokeWidth="8" fill="none" />
          <circle cx="70" cy="70" r="58" stroke={SK.gold} strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 58 * (1 - clamp((lt - at) / hold, 0, 1))} ${2 * Math.PI * 58}`} transform="rotate(-90 70 70)" />
          <text x="70" y="90" textAnchor="middle" fontFamily={SERIF} fontWeight="700" fontSize="60" fill={SK.white}>{tick}</text>
        </svg>)}
    </div>
  );
}
const cap = (s) => s[0].toUpperCase() + s.slice(1);

// ============================================================================
function B1(ctx) {
  return ({ localTime: lt, duration }) => {
    const cKnow = S("b1", 1), cImag = S("b1", 2), cShops = W("b1", "shops"), cFarms = W("b1", "farms"), cNothing = W("b1", "nothing"), cEat = S("b1", 3);
    const foodOp = 1 - reveal(lt, cNothing, 0.8);
    const zoom = 1 + 0.12 * drive(lt, 0.2, cKnow);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[1]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(1, ctx, [L("A story in 16 scenes, with three pause points", 0.4, "sub"), L("Your lunch: rice, dal, roti, a banana", W("b1", "rice")),
          L("BIG QUESTION", cKnow, "head"), L("Where did all this food come from?", cKnow), L("No shops. No farms. Nothing.", cImag), L("What would YOU eat?", cEat, "think")])}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, transform: `scale(${zoom})`, transformOrigin: "440px 540px" }}>
          <Plate cx={440} cy={540} r={300} lt={lt} at={0.1} foodOp={foodOp} />
          <Pic slot="lunch_photo" label="Rice, dal, roti and a banana" x={110} y={210} w={660} h={660} r={330} lt={lt} at={0.1} out={cNothing} fx="zoom" />
        </div>
        {[["Rice", 300, 440, "rice"], ["Dal", 560, 400, "dal"], ["Roti", 580, 660, "roti"], ["Banana", 700, 560, "banana"]].map(([t, x, y, w]) =>
          <Chip key={t} text={t} x={x} y={y} lt={lt} at={W("b1", w)} out={cKnow} size={24} />)}
        <Big x={780} y={120} w={600} lt={lt} at={cKnow} out={cImag} size={64}>Where did your lunch come from?</Big>
        <Chip text="NO SHOPS" x={1080} y={300} lt={lt} at={cShops} tone="gold" size={40} />
        <Chip text="NO FARMS" x={1080} y={420} lt={lt} at={cFarms} tone="gold" size={40} />
        <Chip text="NOTHING" x={1080} y={540} lt={lt} at={cNothing} size={40} />
        <Big x={780} y={680} w={600} lt={lt} at={cEat} size={72} color={SK.gold}>What would YOU eat?</Big>
      </Scene>
    );
  };
}
function B2(ctx) {
  const years = [["2026", 0.3], ["1000 years ago", 1.5], ["10,000 years ago", 2.7]];
  return ({ localTime: lt, duration }) => {
    const cBack = W("b2", "back"), cNo = S("b2", 1);
    const swirl = out3(lt, 0.1, 0.8) * (1 - reveal(lt, cNo, 0.8));
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[2]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(2, ctx, [L("Time travel: 2026 → 1000 → 10,000 years ago", 0.5), L("Thick forest, birds, a river", cNo), L("No farms at all", cNo + 0.5, "big")])}>
        <SVG op={swirl}>
          {[380, 300, 220, 140].map((r, i) => <circle key={i} cx={720} cy={500} r={r} stroke={i % 2 ? SK.gold : "rgba(255,255,255,0.6)"} strokeWidth={6} strokeDasharray="40 30" fill="none"
            transform={`rotate(${lt * (60 + i * 40) * (i % 2 ? -1 : 1)} 720 500)`} />)}
        </SVG>
        {years.map(([t, d], i) => { const at = cBack + d, p = clamp((lt - at) / 1.1, 0, 1), o = windowOp(lt, at, at + 1.15, 0.25) * swirl; if (o <= 0) return null;
          return <div key={t} style={{ position: "absolute", left: 120, top: 400, width: 1200, textAlign: "center", opacity: o, transform: `scale(${0.6 + p * 0.9})`, transformOrigin: "center",
            fontFamily: SERIF, fontWeight: 700, fontSize: 110, color: i === 2 ? SK.gold : SK.white, textShadow: "0 2px 14px rgba(0,0,0,0.45)" }}>{t}</div>; })}
        <Pic slot="forest" label="Thick forest, birds, a river" x={40} y={60} w={1360} h={900} lt={lt} at={cNo} dur={1.0} fx="zoom" zoom={1.18} kenDur={10} />
        <SVG op={out3(lt, cNo + 0.4, 0.8)}>
          {[0, 1, 2, 3, 4].map((i) => { const x = 40 + ((lt * 110 + i * 330) % 1500), y = 150 + i * 40 + 30 * Math.sin(lt * 1.3 + i), f = 1 + 0.5 * Math.sin(lt * 9 + i);
            return <path key={i} d={`M${x} ${y} q 14 ${-9 * f} 28 0 q 14 ${-9 * f} 28 0`} stroke={SK.white} strokeWidth={4} fill="none" strokeLinecap="round" />; })}
        </SVG>
        <Big x={40} y={760} w={1360} lt={lt} at={cNo + 0.3} size={60} align="center">No farms at all…</Big>
      </Scene>
    );
  };
}
function B3(ctx) {
  const foods = ["fruits", "nuts", "berries", "roots", "leaves", "honey", "eggs"];
  return ({ localTime: lt, duration }) => {
    const ats = foods.map((f) => W("b3", f.slice(0, 4))), cEmpty = W("b3", "empty"), cLeave = W("b3", "leave", 1), cSearch = W("b3", "search"), cDyk = S("b3", 3);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[3]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(3, ctx, [L("GATHERERS", S("b3", 0), "head"), L("fruits · nuts · berries · roots · leaves · honey · eggs", ats[0]), L("Trees empty → leave, walk, search again", cEmpty),
          L(DYK[3], cDyk, "think")])}>
        <Pic slot="gatherers" label="Gatherers" x={40} y={60} w={640} h={700} lt={lt} at={0} out={cEmpty} fx="pan" />
        <Chip text="GATHERERS" x={360} y={780} lt={lt} at={S("b3", 0)} out={cEmpty} tone="gold" size={30} />
        {foods.map((f, i) => { const x = 720 + (i % 3) * 232, y = 60 + Math.floor(i / 3) * 232;
          return <React.Fragment key={f}>
            <Pic slot={"food_" + f} label={f} x={x} y={y} w={210} h={210} lt={lt} at={ats[i]} out={cEmpty} fx="pop" />
            <Chip text={cap(f)} x={x + 105} y={y + 160} lt={lt} at={ats[i] + 0.1} out={cEmpty} size={22} />
          </React.Fragment>; })}
        <Pic slot="life_runsout" label="The trees are empty" x={40} y={60} w={660} h={560} lt={lt} at={cEmpty} fx="zoom" />
        <Chip text="The trees are empty…" x={370} y={640} lt={lt} at={cEmpty + 0.2} size={26} />
        <Pic slot="life_move" label="Leave and search somewhere new" x={740} y={60} w={660} h={560} lt={lt} at={cLeave} fx="pan" />
        <Chip text="…leave, walk, and search somewhere new" x={1070} y={640} lt={lt} at={cSearch} tone="gold" size={26} />
        <Dyk lt={lt} at={cDyk} n={3} />
      </Scene>
    );
  };
}
function B4(ctx) {
  return ({ localTime: lt, duration }) => {
    const cDanger = W("b4", "danger"), cHurt = W("b4", "hurt"), cSpark = W("b4", "spark"), cFire = W("b4", "fire"), cCook = W("b4", "cooked"), cWarm = W("b4", "warm"), cScare = W("b4", "scared"),
      cTog = S("b4", 5), cHG = W("b4", "huntergatherers"), cDyk = cHG + 1.2;
    const shake = Math.max(0, 1 - (lt - cDanger) / 0.9) * (lt >= cDanger ? 1 : 0), dx = shake * 14 * Math.sin(lt * 90), dy = shake * 10 * Math.cos(lt * 70);
    const dark = windowOp(lt, cSpark - 0.3, cFire + 0.8, 0.5), sparkO = windowOp(lt, cSpark, cFire + 0.2, 0.2);
    const d = drive(lt, cTog, cHG + 0.3);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[4]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(4, ctx, [L("HUNTERS: quiet, in groups", S("b4", 0), "head"), L("Danger! Wild animals were strong and fast", cDanger), L("FIRE: cook · keep warm · scare animals", cFire),
          L("HUNTERS + FIRE = HUNTER-GATHERERS", cTog, "big"), L(DYK[4], cDyk, "think")], { max: 7 })}>
        <div style={{ position: "absolute", inset: 0, transform: `translate(${dx}px, ${dy}px)` }}>
          <Pic slot="hunt_group" label="Hunters moved quietly, in groups" x={40} y={60} w={660} h={440} lt={lt} at={0} out={cSpark} fx="pan" />
          <Pic slot="hunters" label="Rock painting of a hunt" x={740} y={60} w={660} h={440} lt={lt} at={0.3} out={cSpark} fx="zoom" />
          <Chip text="moved quietly · in groups" x={1070} y={450} lt={lt} at={W("b4", "quietly")} out={cDanger} size={24} />
          <Pic slot="buffalo_charge" label="A wild buffalo charges – the hunters scatter" x={40} y={60} w={1360} h={720} lt={lt} at={cDanger} out={cSpark} fx="pop" dur={0.4} />
          <div style={{ position: "absolute", left: 40, top: 60, width: 1360, height: 720, borderRadius: 18, background: "rgba(180,30,20,0.55)", opacity: windowOp(lt, cDanger, cDanger + 0.5, 0.15), pointerEvents: "none" }} />
          <Badge text="DANGER!" x={520} y={120} lt={lt} at={cDanger} size={60} op={1 - reveal(lt, cSpark, 0.4)} />
          <Chip text="chased · hurt · some never came back" x={720} y={700} lt={lt} at={cHurt} out={cSpark} size={28} />
        </div>
        <div style={{ position: "absolute", left: 40, top: 60, width: 1360, height: 900, borderRadius: 18, background: "#04140F", opacity: dark }} />
        <SVG op={sparkO}>{[0, 1, 2, 3, 4, 5].map((i) => { const a = i * 1.05 + lt * 3, r = 20 + 50 * ((lt * 2 + i * 0.3) % 1);
          return <circle key={i} cx={380 + Math.cos(a) * r} cy={560 + Math.sin(a) * r} r={5} fill={SK.gold} />; })}
          <T x={380} y={500} size={44} bold serif color={SK.gold}>a spark…</T></SVG>
        <Flame x={340} y={420} s={1.2} lt={lt} at={cFire} op={1 - reveal(lt, cTog, 0.5)} />
        <Pic slot="hunt_fire" label="Fire: cooking, warming, keeping animals away" x={640} y={60} w={760} h={520} lt={lt} at={cFire} fx="zoom" />
        <div style={{ position: "absolute", left: 640, top: 60, width: 760, height: 520, borderRadius: 18, opacity: out3(lt, cFire, 1.0) * 0.8, pointerEvents: "none",
          background: "radial-gradient(60% 50% at 50% 100%, rgba(255,150,40,0.75) 0%, rgba(255,120,20,0.25) 45%, rgba(0,0,0,0) 75%)" }} />
        <div style={{ position: "absolute", inset: 0, opacity: 1 - reveal(lt, cTog, 0.4) }}><FireIcons lt={lt} atCook={cCook} atWarm={cWarm} atScare={cScare} x={805} y={700} /></div>
        {/* HUNTERS + FIRE cards slide together and become HUNTER-GATHERERS */}
        <div style={{ position: "absolute", left: lerp(160, 300, d), top: 620, width: 400, height: 160, borderRadius: 18, background: SK.cream, opacity: out3(lt, cTog, 0.5) * (1 - reveal(lt, cHG + 0.5, 0.4)),
          display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SERIF, fontWeight: 700, fontSize: 44, color: SK.ink }}>HUNTERS</div>
        <div style={{ position: "absolute", left: lerp(880, 740, d), top: 620, width: 400, height: 160, borderRadius: 18, background: SK.cream, opacity: out3(lt, cTog, 0.5) * (1 - reveal(lt, cHG + 0.5, 0.4)),
          display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SERIF, fontWeight: 700, fontSize: 44, color: SK.ink }}>FIRE</div>
        <Chip text="+" x={720} y={670} lt={lt} at={cTog} out={cHG + 0.3} tone="gold" size={48} />
        <div style={{ position: "absolute", left: 160, top: 620, width: 1120, height: 160, borderRadius: 18, background: SK.gold, opacity: pop(lt, cHG + 0.5, 0.6),
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: SERIF, fontWeight: 700, fontSize: 56, color: SK.ink }}>
          HUNTER-GATHERERS<div style={{ fontFamily: SANS, fontWeight: 400, fontSize: 28, marginTop: 6 }}>hunted and gathered · always moving</div></div>
        <Dyk lt={lt} at={cDyk} n={4} y={810} />
      </Scene>
    );
  };
}
function B5(ctx) {
  return ({ localTime: lt, duration }) => {
    const q1 = W("b5", "collect"), q2 = W("b5", "three"), at = stopAt("b5", 1);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[5]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(5, ctx, [L("Pause the video. Tell your partner:", S("b5", 0)), L("1 What did gatherers collect?", q1), L("2 Three uses of fire?", q2), L("Press play when you are ready.", at, "think")])}>
        <PauseCard lt={lt} at={at} hold={stopFor("b5")[2] - 0.2} heading="Have you understood?" n={1}
          items={[{ text: "What did gatherers collect?", at: q1 }, { text: "What three things did fire do for hunters?", at: q2 }]} />
      </Scene>
    );
  };
}
function B6(ctx) {
  const animals = [["goat", "milk"], ["sheep", "wool"], ["cattle", "work"]];
  return ({ localTime: lt, duration }) => {
    const cRight = W("b6", "right"), cRan = W("b6", "ran"), cSeasons = W("b6", "seasons"), cTired = S("b6", 2), cWonder = S("b6", 3), cNear = W("b6", "near"),
      cTame = W("b6", "tame"), cDog = W("b6", "dog"), aa = animals.map(([a]) => W("b6", a.slice(0, 4))), cDyk = S("b6", 5) + 0.6;
    const hardOp = 1 - reveal(lt, cTame, 0.5);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[6]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(6, ctx, [L("Hunting was hard: animals not there, ran away, seasons changed", S("b6", 0)), L("Tired, hungry, always moving", cTired),
          L("What if food could stay NEAR us?", cWonder, "big"), L("TAMING ANIMALS", cTame, "head"), L("dog → goat · sheep · cattle", cDog), L("milk · wool · work", aa[0]), L(DYK[6], cDyk, "think")], { max: 8 })}>
        <div style={{ position: "absolute", inset: 0, opacity: hardOp }}>
          <Pic slot="hunt_moving" label="Tired hunters, always moving" x={40} y={60} w={1360} h={640} lt={lt} at={0} fx="pan" dim={0.15} />
          {[["The right animal was not always there", cRight, 120], ["Animals ran away", cRan, 450], ["Seasons changed", cSeasons, 760]].map(([t, at, x]) =>
            <Chip key={t} text={t} x={x + 150} y={100} lt={lt} at={at} size={24} anchor="center" />)}
          <Chip text="tired · hungry · always moving" x={720} y={620} lt={lt} at={cTired} tone="gold" size={30} />
          {/* thought bubble */}
          <div style={{ position: "absolute", left: 300, top: 740, width: 800, opacity: pop(lt, cWonder, 0.7) }}>
            <div style={{ background: SK.cream, borderRadius: 40, padding: "22px 40px", fontFamily: SERIF, fontWeight: 700, fontSize: 40, color: SK.ink, textAlign: "center" }}>
              What if food could stay <span style={{ color: SK.goldDeep }}>NEAR</span> us?</div>
            <div style={{ position: "absolute", left: 60, top: -46, width: 36, height: 36, borderRadius: 18, background: SK.cream }} />
            <div style={{ position: "absolute", left: 20, top: -90, width: 22, height: 22, borderRadius: 11, background: SK.cream }} />
          </div>
        </div>
        <Pic slot="dog_follows" label="A wolf-like dog follows a hunter" x={40} y={60} w={660} h={460} lt={lt} at={cTame} fx="zoom" />
        <Pic slot="camp_animals" label="Goats, sheep and cattle stay near the camp" x={740} y={60} w={660} h={460} lt={lt} at={aa[0] - 0.3} fx="pan" />
        <Node slot="anim_dog" label="Dog – helper and guard" x={200} y={660} r={70} lt={lt} at={cDog} size={22} />
        <SVG op={1}>{[0, 1, 2].map((i) => <Arr key={i} x1={(i === 0 ? 200 : 560 + (i - 1) * 300) + 80} y1={660} x2={560 + i * 300 - 80} y2={660} lt={lt} at={aa[i] - 0.1} />)}</SVG>
        {animals.map(([a, use], i) => <Node key={a} slot={"anim_" + a} label={cap(a) + " – " + use} x={560 + i * 300} y={660} r={70} lt={lt} at={aa[i]} size={22} />)}
        <Dyk lt={lt} at={cDyk} n={6} y={822} />
      </Scene>
    );
  };
}
function B7(ctx) {
  return ({ localTime: lt, duration }) => {
    const cSeeds = W("b7", "seeds"), cShoots = W("b7", "shoots"), cSow = W("b7", "sow"), cGrow = W("b7", "grow"), cIdea = S("b7", 3), cCult = W("b7", "cultivation"), cCultr = W("b7", "cultivators"), cFarm = W("b7", "farmers"), cDyk = cFarm + 1.0;
    const days = clamp((lt - cSeeds - 0.8) / Math.max(0.5, cShoots - cSeeds - 0.8), 0, 1), sunA = Math.PI * (1 - ((days * 4) % 1)), dayN = Math.min(5, 1 + Math.floor(days * 4));
    const grow = out3(lt, cShoots, 1.2), fall = clamp((lt - cSeeds) / 0.9, 0, 1), fallE = Easing.easeInQuad ? Easing.easeInQuad(fall) : fall * fall;
    const seeds = [[180, 0], [260, 0.15], [330, 0.05], [420, 0.2], [500, 0.1]];
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[7]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(7, ctx, [L("Seeds dropped near a camp…", cSeeds), L("…days later, tiny green shoots!", cShoots), L("THE BIG IDEA", cSow, "head"), L("Sow seeds on purpose = food grows for us", cSow),
          L("About 10,000–12,000 years ago", cIdea), L("CULTIVATION = growing crops", cCult, "big"), L("CULTIVATORS = FARMERS", cCultr, "big"), L(DYK[7], cDyk, "think")], { max: 9 })}>
        {/* drawn time-lapse: ground strip, falling seeds, sun passing, shoots growing */}
        <SVG op={out3(lt, 0.2, 0.6)}>
          <rect x={60} y={120} width={640} height={520} rx={18} fill="#0B2E22" />
          <circle cx={380 + 260 * Math.cos(sunA)} cy={420 - 230 * Math.sin(sunA)} r={34} fill={SK.gold} opacity={windowOp(lt, cSeeds + 0.8, cShoots + 0.5, 0.4)} />
          <rect x={60} y={500} width={640} height={140} rx={0} fill={SK.soil} />
          <path d="M60 500 Q 200 480 380 500 T 700 500 L700 640 L60 640 Z" fill="#6B5747" />
          {fall > 0 && seeds.map(([x, d], i) => { const p = clamp((fall - d) / 0.8, 0, 1), y = 160 + (p * p) * 330; return <ellipse key={i} cx={x + 20 * Math.sin(p * 6)} cy={y} rx={11} ry={16} fill="#D9B24F" transform={`rotate(${p * 200} ${x} ${y})`} />; })}
          {seeds.map(([x], i) => <g key={"s" + i} transform={`translate(${x} 500) scale(1 ${grow})`}>
            <line x1={0} y1={0} x2={0} y2={-70 - i * 8} stroke="#8BD48A" strokeWidth={7} strokeLinecap="round" />
            <ellipse cx={-22} cy={-50 - i * 6} rx={22} ry={10} fill="#8BD48A" transform={`rotate(-30 -22 ${-50 - i * 6})`} />
            <ellipse cx={22} cy={-66 - i * 6} rx={22} ry={10} fill="#8BD48A" transform={`rotate(30 22 ${-66 - i * 6})`} /></g>)}
          <T x={380} y={170} size={30} bold color={SK.white} op={windowOp(lt, cSeeds + 0.8, cShoots + 0.5, 0.4)}>{"Day " + dayN}</T>
        </SVG>
        <Chip text="Seeds dropped near a camp" x={380} y={660} lt={lt} at={cSeeds} out={cShoots} size={24} />
        <Chip text="Tiny green shoots!" x={380} y={660} lt={lt} at={cShoots} tone="gold" size={28} />
        <Pic slot="seeds_shoots" label="Tiny green shoots from fallen seeds" x={740} y={120} w={660} h={420} lt={lt} at={cShoots} out={cSow} fx="zoom" />
        <Pic slot="idea" label="Sowing seeds on purpose" x={740} y={120} w={660} h={420} lt={lt} at={cSow} fx="zoom" />
        <Card x={740} y={570} w={660} h={200} lt={lt} at={cSow} pad={22}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
            <svg width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="16" r="12" fill={SK.gold} /><rect x="14" y="27" width="12" height="8" rx="2" fill={SK.cream} /></svg>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 22, letterSpacing: "0.14em", color: SK.gold }}>THE BIG IDEA</div></div>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 30, lineHeight: 1.2, color: SK.white }}>Sow seeds on purpose = food grows for us</div>
          <div style={{ fontFamily: SANS, fontSize: 24, color: SK.dim, marginTop: 8, opacity: out3(lt, cIdea, 0.5) }}>about 10,000 to 12,000 years ago</div>
        </Card>
        <Chip text="CULTIVATION = growing crops" x={370} y={720} lt={lt} at={cCult} out={cDyk} tone="gold" size={30} />
        <Chip text="CULTIVATORS = FARMERS" x={1070} y={800} lt={lt} at={cCultr} out={cDyk} tone="gold" size={30} />
        <Dyk lt={lt} at={cDyk} n={7} />
      </Scene>
    );
  };
}
function B8(ctx) {
  const crops = ["wheat", "barley", "rice", "millets", "pulses"];
  return ({ localTime: lt, duration }) => {
    const ca = crops.map((c) => W("b8", c.slice(0, 4))), cDal = W("b8", "dal"), cDyk = cDal + 1.0;
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[8]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(8, ctx, [L("First crops: wheat · barley", ca[0], "big"), L("Later: rice · millets · pulses", ca[2]), L("…like the dal on your plate!", cDal), L(DYK[8], cDyk, "think")])}>
        {crops.slice(0, 2).map((c, i) => { const sway = 1.5 * Math.sin(lt * 1.6 + i); return <div key={c} style={{ position: "absolute", inset: 0, transform: `rotate(${sway}deg)`, transformOrigin: `${370 + i * 340}px 420px` }}>
          <Pic slot={"crop_" + c} label={c} x={60 + i * 340} y={80} w={320} h={320} lt={lt} at={ca[i]} fx="pop" />
          <Chip text={cap(c)} x={220 + i * 340} y={330} lt={lt} at={ca[i] + 0.15} tone="gold" size={28} /></div>; })}
        <Chip text="FIRST CROPS" x={380} y={30} lt={lt} at={ca[0]} size={22} />
        {crops.slice(2).map((c, i) => <React.Fragment key={c}>
          <Pic slot={"crop_" + c} label={c} x={760 + i * 220} y={80} w={200} h={200} lt={lt} at={ca[i + 2]} fx="pop" />
          <Chip text={cap(c)} x={860 + i * 220} y={250} lt={lt} at={ca[i + 2] + 0.15} size={24} />
        </React.Fragment>)}
        <Chip text="LATER" x={1080} y={30} lt={lt} at={ca[2]} size={22} />
        <Plate cx={1080} cy={580} r={150} lt={lt} at={cDal} />
        <Chip text="…like the dal on your plate!" x={1080} y={750} lt={lt} at={cDal + 0.2} tone="gold" size={26} />
        <Dyk lt={lt} at={cDyk} n={8} />
      </Scene>
    );
  };
}
function B9(ctx) {
  const four = [["SEEDS", "seeds", <ellipse cx={0} cy={0} rx={22} ry={32} fill="#D9B24F" transform="rotate(-20)" />],
    ["SOIL", "soil", <path d="M-50 20 Q -20 -24 10 10 Q 30 -20 50 20 Z" fill={SK.soil} />],
    ["WATER", "water", <path d="M0 -36 C 20 -4 32 10 32 24 A 32 32 0 0 1 -32 24 C -32 10 -20 -4 0 -36 Z" fill="#7FD3F7" />],
    ["TOOLS", "tools", <g stroke={SK.cream} strokeWidth={8} strokeLinecap="round"><line x1={-30} y1={34} x2={26} y2={-22} /><path d="M26 -22 L44 -40 L50 -20 Z" fill={SK.cream} /></g>]];
  const tools = [["tool_stick", "Digging stick", "digging"], ["tool_stone", "Stone hoe", "stone"], ["sickle", "Sickle", "sickle"], ["hero_plough", "Plough pulled by oxen", "plough"]];
  return ({ localTime: lt, duration }) => {
    const fa = four.map(([, w]) => W("b9", w)), ta = tools.map(([, , w]) => W("b9", w)), cBest = W("b9", "best"), cPot = W("b9", "clay"), cBank = W("b9", "bank"), cDyk = S("b9", 3) + 1.2;
    const fourOp = 1 - reveal(lt, ta[0] - 0.2, 0.5), toolsOp = 1 - reveal(lt, cBest, 0.5);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[9]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(9, ctx, [L("SEEDS · SOIL · WATER · TOOLS", fa[0], "big"), L("Tools: digging stick → stone hoe → sickle → ox plough", ta[0]), L("Save the best seeds → plant again", cBest),
          L("A clay pot of seeds = the first seed bank", cPot), L(DYK[9], cDyk, "think")])}>
        {four.map(([t, , glyph], i) => { const o = pop(lt, fa[i], 0.6) * fourOp; if (o <= 0) return null;
          return <div key={t} style={{ position: "absolute", left: 80 + i * 330, top: 200, width: 290, height: 360, borderRadius: 26, background: SK.cream, opacity: o, transform: `scale(${0.8 + 0.2 * o})`,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 30, boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }}>
            <svg width="160" height="160" viewBox="-80 -80 160 160"><circle r={74} fill={SK.bg1} />{glyph}</svg>
            <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 44, color: SK.ink }}>{t}</div></div>; })}
        <div style={{ position: "absolute", inset: 0, opacity: toolsOp }}>
          <Chip text="Tools got better…" x={720} y={70} lt={lt} at={ta[0] - 0.2} tone="gold" size={28} />
          {tools.map(([s, lab], i) => <React.Fragment key={s}>
            <Pic slot={s} label={lab} x={60 + i * 340} y={150} w={320} h={300} lt={lt} at={ta[i]} fx="pop" />
            <Chip text={lab} x={220 + i * 340} y={470} lt={lt} at={ta[i] + 0.15} size={24} />
          </React.Fragment>)}
          <SVG op={1}>{[0, 1, 2].map((i) => <Arr key={i} x1={380 + i * 340 + 4} y1={300} x2={400 + i * 340 - 4} y2={300} lt={lt} at={ta[i + 1] - 0.1} sw={5} />)}</SVG>
        </div>
        <Pic slot="seed_store" label="A clay pot of saved seeds" x={60} y={100} w={620} h={620} lt={lt} at={cBest} fx="zoom" />
        <Chip text="Keep the BEST seeds safe for next year" x={1040} y={200} lt={lt} at={cBest} tone="gold" size={28} />
        <Chip text="…and plant again" x={1040} y={290} lt={lt} at={W("b9", "plant")} size={26} />
        <Badge text="THE FIRST SEED BANK" x={780} y={420} lt={lt} at={cBank} size={36} />
        <Dyk lt={lt} at={cDyk} n={9} />
      </Scene>
    );
  };
}
function B10(ctx) {
  return ({ localTime: lt, duration }) => {
    const q1 = W("b10", "four"), q2 = S("b10", 1), at = stopAt("b10", 1);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[10]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(10, ctx, [L("1 The four things a farmer needs", q1), L("2 Why save seeds?", q2), L("Press play when you are ready.", at, "think")])}>
        <PauseCard lt={lt} at={at} hold={stopFor("b10")[2] - 0.2} heading="Do you get it?" n={2}
          items={[{ text: "Name the FOUR things every farmer needs", at: q1 }, { text: "Why save seeds?", at: q2 }]}>
          <div style={{ display: "flex", gap: 30, marginTop: 40, marginLeft: 74 }}>
            {[0, 1, 2, 3].map((i) => <div key={i} style={{ width: 250, height: 110, borderRadius: 18, border: `4px dashed ${SK.gold}`, opacity: pop(lt, q1 + 0.3 + i * 0.15, 0.5),
              display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SERIF, fontWeight: 700, fontSize: 60, color: SK.gold }}>?</div>)}
          </div>
        </PauseCard>
      </Scene>
    );
  };
}
function B11(ctx) {
  return ({ localTime: lt, duration }) => {
    const cRain = W("b11", "rain"), cCame = S("b11", 1), cNot = S("b11", 2), cCrack = W("b11", "cracked"), cToday = W("b11", "today"), cDyk = S("b11", 3) + 1.4;
    const rainOp = windowOp(lt, cCame, cNot, 0.6);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[11]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(11, ctx, [L("One source of water: the RAIN", cRain, "big"), L("Rain → crops grow green and tall", cCame), L("No rain → land cracks, plants dry", cNot),
          L("Even today, many farmers depend only on rain", cToday), L(DYK[11], cDyk, "think")])}>
        <Pic slot="clouds_farmer" label="Farmers look up at the clouds" x={40} y={60} w={1360} h={720} lt={lt} at={0} out={cCame} fx="zoom" />
        <Chip text="Only one source of water: the RAIN" x={720} y={700} lt={lt} at={cRain} out={cCame} tone="gold" size={30} />
        <Pic slot="water_rain" label="Rain – crops grow green" x={40} y={60} w={660} h={620} lt={lt} at={cCame} fx="zoom" />
        <Rain x={40} y={60} w={660} h={620} lt={lt} op={rainOp} />
        <Chip text="Rain → crops grow green and tall" x={370} y={700} lt={lt} at={cCame + 0.3} tone="gold" size={26} />
        <Pic slot="cracked_field" label="No rain – the land cracks" x={740} y={60} w={660} h={620} lt={lt} at={cNot} out={cToday} fx="zoom" dim={0.1} />
        <SVG op={windowOp(lt, cCrack, cToday, 0.5)}><circle cx={1320} cy={130} r={46} fill={SK.gold} />{[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <line key={i} x1={1320 + Math.cos(i * 0.785) * 60} y1={130 + Math.sin(i * 0.785) * 60} x2={1320 + Math.cos(i * 0.785) * 80} y2={130 + Math.sin(i * 0.785) * 80} stroke={SK.gold} strokeWidth={6} strokeLinecap="round" />)}</SVG>
        <Chip text="No rain → the land cracks, plants dry up" x={1070} y={700} lt={lt} at={cCrack} out={cToday} size={26} />
        <Pic slot="rainfed_village" label="A rain-fed field in an Indian village today" x={740} y={60} w={660} h={620} lt={lt} at={cToday} fx="pan" />
        <Chip text="Even today: rain-fed farms" x={1070} y={700} lt={lt} at={cToday + 0.2} tone="gold" size={26} />
        <Dyk lt={lt} at={cDyk} n={11} />
      </Scene>
    );
  };
}
function B12(ctx) {
  const steps = [["water_carry", "Carrying by hand", "carrying"], ["water_channel", "Small channels", "channels"], ["water_rope", "Rope and bucket", "rope"],
    ["water_persian", "Persian wheel", "persian"], ["water_pump", "Motor pump", "motor"], ["water_sprinkler", "Sprinkler", "sprinklers"]];
  // Water-source icons (glyph space ±50, drawn ×1.6 inside the gold ring). Conventional forms: a stone well with
  // pulley and bucket; a pond with reeds and a lily pad; a river winding between banks; a lined canal running to
  // a sluice gate; an irrigation tank = water held behind an earth bund with an outlet.
  const W_BLUE = "#7FD3F7", W_STONE = "#A89683", W_STONE2 = "#7C6A58", W_WOOD = "#8A6A48", W_GRASS = "#6B9A4E";
  const sources = [
    ["Well", <g>
      <path d="M-42 -30 L0 -52 L42 -30 Z" fill="#B98747" /><rect x={-40} y={-31} width={80} height={5} fill="#8A6A48" />
      <line x1={-28} y1={-28} x2={-28} y2={16} stroke={W_WOOD} strokeWidth={5} /><line x1={28} y1={-28} x2={28} y2={16} stroke={W_WOOD} strokeWidth={5} />
      <line x1={-28} y1={-22} x2={28} y2={-22} stroke={W_WOOD} strokeWidth={4} /><circle cx={0} cy={-22} r={7} fill="none" stroke={W_WOOD} strokeWidth={3} />
      <line x1={0} y1={-15} x2={0} y2={-2} stroke="#E3DBC3" strokeWidth={2} /><path d="M-8 -2 L8 -2 L6 10 L-6 10 Z" fill={W_STONE2} /><line x1={-8} y1={-2} x2={8} y2={-2} stroke="#E3DBC3" strokeWidth={2} />
      <rect x={-36} y={16} width={72} height={30} rx={4} fill={W_STONE} />
      <g stroke={W_STONE2} strokeWidth={2}><line x1={-36} y1={26} x2={36} y2={26} /><line x1={-36} y1={36} x2={36} y2={36} /><line x1={-18} y1={16} x2={-18} y2={26} /><line x1={6} y1={16} x2={6} y2={26} /><line x1={24} y1={16} x2={24} y2={26} /><line x1={-30} y1={26} x2={-30} y2={36} /><line x1={-6} y1={26} x2={-6} y2={36} /><line x1={16} y1={26} x2={16} y2={36} /><line x1={-18} y1={36} x2={-18} y2={46} /><line x1={6} y1={36} x2={6} y2={46} /><line x1={28} y1={36} x2={28} y2={46} /></g>
      <ellipse cx={0} cy={16} rx={36} ry={8} fill={W_STONE2} /><ellipse cx={0} cy={16} rx={26} ry={5} fill={W_BLUE} />
    </g>],
    ["Pond", <g>
      <ellipse cx={0} cy={14} rx={52} ry={24} fill={W_GRASS} /><ellipse cx={0} cy={14} rx={42} ry={17} fill={W_BLUE} />
      <g stroke="#FFFFFF" strokeWidth={2.5} fill="none" strokeLinecap="round" opacity={0.85}><path d="M-14 12 q6 -4 12 0" /><path d="M-2 22 q6 -4 12 0" /><path d="M14 10 q5 -3 10 0" /></g>
      <g stroke="#4E8A3A" strokeWidth={3} strokeLinecap="round"><line x1={-34} y1={18} x2={-40} y2={-26} /><line x1={-28} y1={18} x2={-27} y2={-34} /><line x1={-22} y1={18} x2={-16} y2={-20} /></g>
      <rect x={-43} y={-30} width={5} height={12} rx={2.5} fill="#5C4A3E" /><rect x={-30} y={-38} width={5} height={12} rx={2.5} fill="#5C4A3E" /><rect x={-19} y={-24} width={5} height={10} rx={2.5} fill="#5C4A3E" />
      <path d="M26 16 m-9 0 a9 9 0 1 1 9 9 L26 16 Z" fill="#4CAF50" /><circle cx={33} cy={9} r={3} fill="#F48FB1" />
    </g>],
    ["River", <g>
      <path d="M-50 -34 C -24 -42 -24 -4 0 -2 S 24 36 50 30" stroke={W_GRASS} strokeWidth={34} fill="none" strokeLinecap="round" />
      <path d="M-50 -34 C -24 -42 -24 -4 0 -2 S 24 36 50 30" stroke={W_BLUE} strokeWidth={18} fill="none" strokeLinecap="round" />
      <g stroke="#FFFFFF" strokeWidth={2.5} fill="none" strokeLinecap="round" opacity={0.85}><path d="M-34 -30 q5 -3 10 0" /><path d="M-10 -8 q5 -3 10 0" /><path d="M14 16 q5 -3 10 0" /><path d="M34 28 q5 -3 10 0" /></g>
      <g fill="#4E8A3A"><circle cx={-36} cy={-6} r={5} /><circle cx={-28} cy={2} r={4} /><circle cx={34} cy={-6} r={5} /><circle cx={40} cy={4} r={4} /></g>
    </g>],
    ["Canal", <g>
      <path d="M-56 46 L-26 -26 L26 -26 L56 46 Z" fill={W_STONE} />
      <path d="M-44 46 L-18 -26 L18 -26 L44 46 Z" fill={W_BLUE} />
      <g stroke={W_STONE2} strokeWidth={2}><line x1={-50} y1={30} x2={-40} y2={30} /><line x1={-45} y1={10} x2={-36} y2={10} /><line x1={-39} y1={-10} x2={-32} y2={-10} /><line x1={50} y1={30} x2={40} y2={30} /><line x1={45} y1={10} x2={36} y2={10} /><line x1={39} y1={-10} x2={32} y2={-10} /></g>
      <g stroke="#FFFFFF" strokeWidth={2.5} fill="none" strokeLinecap="round" opacity={0.85}><path d="M-10 30 q6 -4 12 0" /><path d="M-5 8 q5 -3 10 0" /><path d="M-3 -12 q4 -2 8 0" /></g>
      <rect x={-30} y={-42} width={60} height={16} rx={2} fill="#5C4A3E" /><rect x={-14} y={-36} width={28} height={10} fill="#8A6A48" />
      <line x1={0} y1={-42} x2={0} y2={-52} stroke="#5C4A3E" strokeWidth={4} /><circle cx={0} cy={-52} r={6} fill="none" stroke={SK.gold} strokeWidth={3} />
    </g>],
    ["Tank", <g>
      <path d="M-52 -26 Q -40 -34 -24 -30 T 8 -30 T 40 -30 L52 -26 L52 8 L-52 8 Z" fill={W_BLUE} />
      <g stroke="#FFFFFF" strokeWidth={2.5} fill="none" strokeLinecap="round" opacity={0.85}><path d="M-30 -12 q6 -4 12 0" /><path d="M-6 -2 q6 -4 12 0" /><path d="M18 -14 q6 -4 12 0" /></g>
      <path d="M-52 8 L52 8 L52 34 L-52 34 Z" fill={W_WOOD} /><path d="M-52 8 L52 8 L52 14 L-52 14 Z" fill="#6E5236" />
      <g stroke="#6E5236" strokeWidth={2}><line x1={-40} y1={14} x2={-40} y2={34} /><line x1={-20} y1={14} x2={-20} y2={34} /><line x1={20} y1={14} x2={20} y2={34} /><line x1={40} y1={14} x2={40} y2={34} /></g>
      <rect x={-9} y={10} width={18} height={24} fill="#3E3028" /><rect x={-5} y={14} width={10} height={16} fill={W_BLUE} />
      <path d="M0 34 L0 50" stroke={W_BLUE} strokeWidth={9} strokeLinecap="round" /><g stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" opacity={0.85}><line x1={-2} y1={40} x2={-2} y2={46} /></g>
    </g>]];
  return ({ localTime: lt, duration }) => {
    const ats = steps.map((s) => W("b12", s[2])), cSrc = S("b12", 4), sa = ["wells", "ponds", "rivers", "canals", "tanks"].map((w) => W("b12", w)), cDyk = sa[4] + 1.2;
    const breakAt = SE("b12", 4) + 0.3;
    let cur = -1; ats.forEach((a, i) => { if (lt >= a) cur = i; });
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[12]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(12, ctx, [L("New ideas to get water", S("b12", 0), "head"), ...steps.map((s, i) => L(`${i + 1} ${s[1]}`, ats[i])), L("Sources: well · pond · river · canal · tank", cSrc, "big"), L(DYK[12], cDyk, "think")], { max: 10 })}>
        <Big x={60} y={80} w={900} lt={lt} at={S("b12", 0)} out={ats[0] - 0.5} size={54}>So people found NEW ideas to get water…</Big>
        <div style={{ position: "absolute", inset: 0, opacity: 1 - reveal(lt, cDyk, 0.4) }}>
        {/* the current step arrives big (whoosh from the right), earlier ones sit in the strip below */}
        {steps.map((s, i) => { const on = clamp((lt - ats[i]) / 0.45, 0, 1), e = Easing.easeOutBack(on), isCur = i === cur, next = ats[i + 1];
          const shrink = next != null ? clamp((lt - next) / 0.4, 0, 1) : 0;
          if (on <= 0) return null;
          const bx = 60 + i * 225, by = 760;
          const x = lerp(lerp(1500, 80, e), bx, shrink), y = lerp(80, by, shrink), w = lerp(900, 205, shrink), h = lerp(560, 140, shrink);
          return <React.Fragment key={s[0]}>
            <Pic slot={s[0]} label={s[1]} x={x} y={y} w={w} h={h} lt={lt} at={ats[i]} dur={0.3} fx="none" r={14} />
            <Chip text={`${i + 1} ${s[1]}`} x={x + w / 2} y={y + h + 8} lt={lt} at={ats[i] + 0.1} size={isCur && shrink < 0.5 ? 30 : 20} tone={isCur ? "gold" : "cream"} />
          </React.Fragment>; })}
        <SVG op={out3(lt, ats[1], 0.5) * (1 - reveal(lt, cSrc, 0.4))}>{[0, 1, 2, 3, 4].map((i) => <Arr key={i} x1={60 + i * 225 + 208} y1={830} x2={60 + (i + 1) * 225 - 4} y2={830} lt={lt} at={ats[i + 1] + 0.4} sw={4} />)}</SVG>
        </div>
        <div style={{ position: "absolute", left: 1000, top: 80, width: 400, opacity: out3(lt, ats[0], 0.5) * (1 - reveal(lt, cSrc, 0.4)), fontFamily: SERIF, fontWeight: 700, fontSize: 40, lineHeight: 1.2, color: SK.white }}>
          slow… faster… <span style={{ color: SK.gold }}>FAST!</span></div>
        <Card x={60} y={80} w={1340} h={560} lt={lt} at={cSrc} pad={30}>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 22, letterSpacing: "0.14em", color: SK.gold }}>NEW WATER SOURCES</div>
          <div style={{ display: "flex", justifyContent: "space-around", marginTop: 60 }}>
            {sources.map(([t, glyph], i) => <div key={t} style={{ textAlign: "center", opacity: pop(lt, sa[i], 0.6), transform: `scale(${0.8 + 0.2 * pop(lt, sa[i], 0.6)})` }}>
              <svg width="200" height="200" viewBox="-100 -100 200 200"><circle r={90} fill="rgba(255,255,255,0.1)" stroke={SK.gold} strokeWidth={4} />
                {!window.TP_NO_ICON_IMAGES && (window.TP_PHOTOS || {})["icon_" + t.toLowerCase()]
                  ? <g><clipPath id={`wsrc-${t}`}><circle r={87} /></clipPath><image href={window.TP_PHOTOS["icon_" + t.toLowerCase()]} x={-87} y={-87} width={174} height={174} preserveAspectRatio="xMidYMid slice" clipPath={`url(#wsrc-${t})`} /></g>
                  : <g transform="scale(1.6)">{glyph}</g>}</svg>
              <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 36, color: SK.white, marginTop: 10 }}>{t}</div></div>)}
          </div>
        </Card>
        <Dyk lt={lt} at={cDyk} n={12} y={700} />
        <Break lt={lt} at={breakAt} dur={2.3} />
      </Scene>
    );
  };
}
function B13(ctx) {
  return ({ localTime: lt, duration }) => {
    const cHan = W("b13", "han"), cPots = W("b13", "burying"), cOllas = W("b13", "ollas"), cSeep = S("b13", 2), cDrop = W("b13", "drop"), cEarly = S("b13", 3);
    const seep = out3(lt, cSeep, 1.0);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[13]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(13, ctx, [L("China, Han dynasty – more than 2,000 years ago", cHan, "head"), L("Unglazed clay pots (ollas) buried in the soil, filled with water", cPots),
          L("Water seeps out slowly, drop by drop, to the roots", cSeep), L("One of the earliest ideas of DRIP irrigation", cEarly, "big"),
          L("Source: Fan Shengzhi shu, a Chinese farming book of the 1st century BCE", cEarly + 0.8, "source")])}>
        <Card x={50} y={50} w={1340} h={905} lt={lt} at={0} pad={0} />
        <Badge x={92} y={82} lt={lt} at={S("b13", 0)} text="FUN FACT" />
        <Pic slot="olla_painting" label="Han-dynasty painting: a farmer buries a clay pot" x={92} y={172} w={620} h={440} lt={lt} at={cHan} out={cOllas} fx="zoom" />
        <Pic slot="claypot" label="Cut-away: water seeps through the pot to the roots" x={92} y={172} w={620} h={440} lt={lt} at={cOllas} fx="zoom" kenDur={20} />
        <SVG op={seep}>{[0, 1, 2, 3, 4, 5, 6, 7].map((i) => { const p = ((lt - cSeep) * 0.45 + i * 0.125) % 1, side = i % 2 ? 1 : -1;
          return <circle key={i} cx={300 + side * (60 + p * 120)} cy={400 + p * 90 + (i % 4) * 14} r={7 - p * 3} fill="#7FD3F7" opacity={1 - p} />; })}</SVG>
        <Lines x={760} y={180} w={580} lt={lt} lines={[{ text: "Ancient drip irrigation", at: S("b13", 0), serif: true, bold: true, size: 44, color: SK.gold },
          { text: "More than 2,000 years ago, in China's Han dynasty, farmers wrote about burying clay pots.", at: cHan },
          { text: "Unglazed, porous pots called OLLAS, filled with water.", at: cOllas },
          { text: "The water seeped out slowly… drop… by drop… right to the roots.", at: cSeep },
          { text: "One of the earliest ideas of DRIP irrigation!", at: cEarly, serif: true, bold: true, size: 38, color: SK.gold }]} size={30} />
        <Chip text="drop… by drop…" x={400} y={640} lt={lt} at={cDrop} tone="gold" size={28} />
        <div style={{ position: "absolute", left: 92, top: 880, width: 1260, opacity: out3(lt, cEarly + 0.8, 0.6), fontFamily: SANS, fontSize: 21, color: SK.dim }}>
          Source: Fan Shengzhi shu – a Chinese farming book of the Han dynasty (1st century BCE) – describes buried clay-pot (olla) watering</div>
      </Scene>
    );
  };
}
// Drip rig: pipe with emitters, drops falling to four plants, moist patches growing, dry soil between.
function DripRig({ lt, at, out = null }) {
  const o = out3(lt, at, 0.8); if (o <= 0) return null;
  const noteOp = out != null ? 1 - reveal(lt, out, 0.4) : 1;
  const xs = [160, 320, 480, 640], soilTop = 640, wet = clamp((lt - at) / 8, 0, 1);
  return (
    <SVG op={o}>
      <rect x={60} y={soilTop} width={640} height={160} rx={10} fill="#8A6A48" />
      {xs.map((x, i) => <ellipse key={i} cx={x} cy={soilTop + 50} rx={70 * wet} ry={45 * wet} fill="#4A3524" opacity={0.9} />)}
      <rect x={70} y={300} width={620} height={16} rx={8} fill="#2B2B2B" />
      <rect x={60} y={270} width={22} height={60} rx={6} fill="#2B2B2B" />
      {xs.map((x, i) => <rect key={i} x={x - 8} y={314} width={16} height={14} rx={3} fill="#444" />)}
      {xs.map((x, i) => { const ph = ((lt - at) * 0.9 + i * 0.27) % 1; return ph > 0.05 && ph < 0.95 ? <ellipse key={"d" + i} cx={x} cy={328 + ph * (soilTop - 328)} rx={7} ry={12} fill="#7FD3F7" /> : null; })}
      {xs.map((x, i) => <g key={"p" + i} stroke="#6FBF6E" strokeWidth={8} strokeLinecap="round" fill="#6FBF6E">
        <line x1={x} y1={soilTop} x2={x} y2={soilTop - 120} />
        <ellipse cx={x - 30} cy={soilTop - 70} rx={30} ry={12} transform={`rotate(-30 ${x - 30} ${soilTop - 70})`} />
        <ellipse cx={x + 30} cy={soilTop - 100} rx={30} ry={12} transform={`rotate(30 ${x + 30} ${soilTop - 100})`} />
        <path d={`M${x} ${soilTop} l-18 40 M${x} ${soilTop} l18 44 M${x} ${soilTop} l0 50`} stroke="#E8D7B5" strokeWidth={4} fill="none" />
      </g>)}
      <T x={380} y={260} size={24} color={SK.dim}>thin pipe · tiny holes · drop by drop · right at the roots</T>
      <T x={380} y={840} size={22} color={SK.dim} italic op={noteOp}>the soil between the plants stays dry</T>
    </SVG>
  );
}
function B14(ctx) {
  return ({ localTime: lt, duration }) => {
    const c1959 = W("b14", "1959"), cIsrael = W("b14", "israel"), cBlass = W("b14", "simcha"), cPipes = S("b14", 1), cRoots = W("b14", "roots"), cLess = S("b14", 2), cMore = W("b14", "more"), cSave = W("b14", "save"), cDyk = cSave + 1.2;
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[14]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(14, ctx, [L("DRIP IRRIGATION", S("b14", 0), "head"), L("1959 · Israel · Simcha and Yeshayahu Blass", c1959), L("Plastic pipes drop water right at the roots", cPipes),
          L("Less water wasted, more crops grown", cLess, "big"), L(DYK[14], cDyk, "think")])}>
        <Chip text="The MODERN drip system" x={380} y={70} lt={lt} at={S("b14", 0)} tone="gold" size={30} />
        <DripRig lt={lt} at={cPipes - 0.4} out={cDyk} />
        <Pic slot="drip_close" label="Drip pipe at a plant's roots" x={760} y={60} w={640} h={400} lt={lt} at={S("b14", 0)} fx="zoom" />
        <Card x={760} y={490} w={640} h={200} lt={lt} at={c1959 - 0.2} pad={24}>
          <div style={{ display: "flex", gap: 18, alignItems: "baseline" }}>
            <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 64, color: SK.gold, opacity: pop(lt, c1959, 0.5) }}>1959</div>
            <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 40, color: SK.white, opacity: out3(lt, cIsrael, 0.5) }}>· Israel</div></div>
          <div style={{ fontFamily: SANS, fontSize: 28, color: SK.white, opacity: out3(lt, cBlass, 0.5) }}>Simcha Blass and his son Yeshayahu</div>
        </Card>
        <Chip text="Less water wasted" x={920} y={730} lt={lt} at={cLess} tone="cream" size={28} />
        <Chip text="More crops grown" x={1240} y={730} lt={lt} at={cMore} tone="gold" size={28} />
        <Chip text="That's how we SAVE water today!" x={1080} y={800} lt={lt} at={cSave} out={cDyk} tone="gold" size={30} />
        <Dyk lt={lt} at={cDyk} n={14} />
      </Scene>
    );
  };
}
function B15(ctx) {
  const tiles = [["water_pump", "Motor pump", 180, 300, -6], ["water_rain", "Rain", 540, 240, 4], ["water_persian", "Persian wheel", 900, 320, -3], ["drip_field", "Drip", 300, 580, 5], ["water_carry", "Carrying by hand", 660, 560, -4], ["water_channel", "Channels", 1020, 600, 3]];
  return ({ localTime: lt, duration }) => {
    const at = stopAt("b15", 0), cOrder = W("b15", "put");
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[15]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(15, ctx, [L("Put these in order, from RAIN to DRIP:", cOrder), L("pump · rain · Persian wheel · drip · carrying by hand · channels", cOrder + 0.3, "sub"), L("Press play when you are ready.", at, "think")])}>
        <PauseCard lt={lt} at={at} hold={stopFor("b15")[2] - 0.2} heading="Have you understood?" n={3} items={[{ text: "Put these in order – from RAIN… to DRIP!", at: cOrder }]}>
          {tiles.map(([s, lab, x, y, rot], i) => <div key={s} style={{ position: "absolute", left: x, top: y, transform: `rotate(${rot}deg)`, opacity: pop(lt, cOrder + 0.4 + i * 0.12, 0.5) }}>
            <Pic slot={s} label={lab} x={0} y={0} w={240} h={160} lt={lt} at={cOrder + 0.4 + i * 0.12} fx="pop" r={14} />
            <Chip text={lab} x={120} y={170} lt={lt} at={cOrder + 0.5 + i * 0.12} size={22} /></div>)}
        </PauseCard>
      </Scene>
    );
  };
}
function B16(ctx) {
  const row1 = [["gatherers", "Gatherers", "gatherers"], ["hunt_group", "Hunters", "hunters"], ["after", "Farmers", "farmers"]];
  const row2 = [["water_rain", "Rain", "waiting"], ["water_carry", "Hand", null], ["water_persian", "Wheel", null], ["water_pump", "Pump", null], ["drip_field", "Drip", "drop"]];
  return ({ localTime: lt, duration }) => {
    const cLunch = W("b16", "lunch"), cAsk = S("b16", 2), cRain = W("b16", "rain", 1), cWater = W("b16", "water");
    const r1 = row1.map(([, , w]) => W("b16", w)), r2a = W("b16", "waiting"), r2 = [r2a, r2a + 0.3, r2a + 0.6, r2a + 0.9, W("b16", "drop")];
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[16]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(16, ctx, [L("Gatherers → Hunters → Farmers", r1[0]), L("Rain → … → Drip", r2a), L("Remember the long journey of your food!", cLunch, "big"), L("ASK AT HOME", cAsk, "head"),
          L("Does our area depend on rain?", cRain), L("Where does our water come from?", cWater)], { max: 7 })}>
        <div style={{ position: "absolute", inset: 0 }}>
          <SVG op={1}>{[0, 1].map((i) => <Arr key={i} x1={300 + i * 420 + 84} y1={200} x2={300 + (i + 1) * 420 - 84} y2={200} lt={lt} at={r1[i + 1] - 0.1} />)}
            {[0, 1, 2, 3].map((i) => <Arr key={"w" + i} x1={220 + i * 250 + 70} y1={470} x2={220 + (i + 1) * 250 - 70} y2={470} lt={lt} at={r2[i + 1] - 0.1} />)}</SVG>
          {row1.map(([s, lab], i) => <Node key={s} slot={s} label={lab} x={300 + i * 420} y={200} r={76} lt={lt} at={r1[i]} size={26} />)}
          {row2.map(([s, lab], i) => <Node key={s} slot={s} label={lab} x={220 + i * 250} y={470} r={62} lt={lt} at={r2[i]} size={22} />)}
        </div>
        <Plate cx={260} cy={790} r={150} lt={lt} at={cLunch} />
        <Chip text="Remember the long journey of your food!" x={700} y={690} lt={lt} at={cLunch + 0.3} tone="gold" size={28} />
        <Card x={520} y={760} w={880} h={190} lt={lt} at={cAsk} pad={24}>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 22, letterSpacing: "0.14em", color: SK.gold, marginBottom: 8 }}>ASK AT HOME TONIGHT</div>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 34, lineHeight: 1.25, color: SK.white, opacity: out3(lt, cRain, 0.5) }}>Does our area depend on rain?</div>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 34, lineHeight: 1.25, color: SK.white, opacity: out3(lt, cWater, 0.5) }}>Where does our water come from?</div>
        </Card>
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
const COLLAGE = [{ slot: "forest", x: -60, y: -40, w: 760, h: 520, ph: 0 }, { slot: "water_channel", x: 640, y: -80, w: 760, h: 520, ph: 2 },
  { slot: "gatherers", x: -80, y: 520, w: 700, h: 560, ph: 4 }, { slot: "drip_field", x: 560, y: 560, w: 820, h: 560, ph: 1 }];
function LunchScenes(props = {}) {
  const caps = props.showCaptions === "false" ? false : props.showCaptions !== false;
  const titles = {};
  for (let n = 1; n <= NB; n++) titles[n] = str(props["title" + n + "Text"], TITLES[n]);
  const ctx = { caps, titles, capSize: num(props.captionSize, 34) };
  const B = [B1, B2, B3, B4, B5, B6, B7, B8, B9, B10, B11, B12, B13, B14, B15, B16];
  const beats = B.map((Bn, i) => { const t = BEAT("b" + (i + 1)); return [t.start, t.start + t.dur, Bn]; });
  return (
    <StoryFrame props={props} dur={DUR} persistKey="thinkpro-lp1-where-did-your-lunch-come-from" collage={COLLAGE}>
      {beats.map(([s, e, Bn], i) => (
        <Sprite key={i} start={s} end={e}>{Bn(ctx)}</Sprite>
      ))}
      {STOPS.map(([b, i, hold]) => <StopAt key={b} t={BEAT(b).start + stopAt(b, i)} hold={hold - 0.2} />)}
      {["b5", "b10", "b13", "b15"].map((b) => <ChimeAt key={b} t={BEAT(b).start + S(b, 0, 0)} />)}
      <AudioSync />
    </StoryFrame>
  );
}
window.LunchScenes = LunchScenes;
