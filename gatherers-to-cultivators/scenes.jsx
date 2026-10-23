/* global React, window */
// ThinkPro Academy — "Gatherers to Cultivators" (Grade 6 Agriculture, Session 1 only).
// After AG_LP1_Video_Script_Draft1 (23 Oct 2026): 9 narrated beats (the 2 s visual break
// lives in the tail of beat 6) and FIVE presenter stops — silent holds where a
// "Pause and discuss" card shows and the web player freezes (TPStory.StopAt).
// STORY STYLE (engine/story-kit.jsx). Everything is a pure function of beat-local time.
const { Sprite, Easing } = window;
const { reveal, windowOp, fade } = window.TPMotion;
const { num, str } = window.TPStage;
const { SK, SERIF, SANS, LEFT_W, pop, out3, lerp, drive, photoSrc,
  Pic, Chip, Badge, Big, Card, SVG, Arrow, Ring, T, ChimeAt, Scene, StoryFrame, StopCard, StopAt, Break, Flip } = window.TPStory;

// ---- Timing: EVERYTHING is keyed to the narration (tools/fit_timing.py → timing.js).
const TM = window.TP_TIMING;
if (!TM) console.error("timing.js missing — run: python3 tools/fit_timing.py videos/gatherers-to-cultivators");
const LEAD = TM ? TM.lead : 1.0;
const DUR = TM ? TM.total : 180;
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
const TITLES = { 1: "Gatherers to Cultivators", 2: "Gatherers", 3: "Hunters and fire", 4: "The big idea", 5: "First crops, first animals",
  6: "Watering, step by step", 7: "Ancient drip irrigation", 8: "Drip irrigation", 9: "The whole story" };
const KICK = "Grade 6 · Agriculture · Session 1";
const panel = (n, ctx, lines, extra = {}) => ({ kicker: n === 7 ? "Do you know?" : KICK, title: ctx.titles[n], lines, ...extra });
const L = (text, at, kind = "item", extra = {}) => ({ text, at, kind, ...extra });

// ---- Presenter stops: [beat, sentence index whose pauseAfter is the hold, hold s, question]
const STOPS = [
  ["b1", 1, 4.0, "No shops, no farms – how would you get your food every day?"],
  ["b3", 3, 4.0, "What problem would you face if you ate only wild fruits? Why did hunters keep moving?"],
  ["b5", 2, 4.0, "What did people need to learn before they could farm?"],
  ["b8", 2, 4.0, "Why is drip irrigation smart?"],
  ["b9", 2, 6.0, null],   // quick check card
];
const stopAt = (b, i) => SE(b, i) + 0.1;                       // beat-local start of the hold
const stopFor = (b) => STOPS.find((s) => s[0] === b);
function Stop({ lt, b, extra }) {
  const s = stopFor(b); if (!s) return null;
  const n = STOPS.indexOf(s) + 1;
  return <StopCard lt={lt} at={stopAt(b, s[1])} hold={s[2] - 0.2} question={s[3]} n={n} total={STOPS.length} />;
}
const QUICK = ["What did a gatherer eat?", "Why did hunters keep moving?", "What gave people the idea to grow food?", "How did early farmers get water?", "How does drip irrigation save water?"];

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
function Node({ slot, label, x, y, r = 70, lt, at, size = 24 }) {
  const o = pop(lt, at, 0.6); if (o <= 0) return null;
  return (
    <React.Fragment>
      <Pic slot={slot} label={label} x={x - r} y={y - r} w={2 * r} h={2 * r} r={r} lt={lt} at={at} fx="pop" style={{ boxShadow: "0 0 0 4px " + SK.cream }} />
      <Chip text={label} x={x} y={y + r + 14} lt={lt} at={at + 0.15} size={size} />
    </React.Fragment>
  );
}
function Arr({ x1, y1, x2, y2, lt, at, color = SK.gold, sw = 6 }) { return <Arrow x1={x1} y1={y1} x2={x2} y2={y2} color={color} sw={sw} op={out3(lt, at, 0.5)} />; }
function ArcA({ cx, cy, r, a1, a2, op = 1, color = SK.gold, sw = 6 }) {
  if (op <= 0) return null;
  const rad = (d) => (d * Math.PI) / 180, p = (d) => [cx + r * Math.cos(rad(d)), cy + r * Math.sin(rad(d))];
  const [x1, y1] = p(a1), [x2, y2] = p(a2 - 4), tx = -Math.sin(rad(a2 - 4)), ty = Math.cos(rad(a2 - 4));
  return (
    <g opacity={op} stroke={color} fill={color} strokeLinecap="round" strokeLinejoin="round">
      <path d={`M${x1} ${y1} A${r} ${r} 0 0 1 ${x2} ${y2}`} strokeWidth={sw} fill="none" />
      <path d={`M${x2 + tx * 24} ${y2 + ty * 24} L${x2 - ty * 14 - tx * 4} ${y2 + tx * 14 - ty * 4} L${x2 + ty * 14 - tx * 4} ${y2 - tx * 14 - ty * 4} Z`} />
    </g>
  );
}
// Seed loop: seed → sprout → plant → seeds, on a soil strip, active step cycling.
function SeedLoop({ lt, at }) {
  const o = out3(lt, at, 0.8); if (o <= 0) return null;
  const act = Math.floor(((lt - at) / 1.5) % 4), xs = [150, 330, 510, 690], gy = 560, seedFall = ((lt - at) * 0.5) % 1;
  return (
    <SVG op={o}>
      <rect x={60} y={gy} width={640} height={60} rx={10} fill={SK.soil} />
      {xs.map((x, i) => <circle key={i} cx={x - 70} cy={gy - 110} r={78} fill={act === i ? "rgba(226,176,76,0.22)" : "rgba(255,255,255,0.06)"} stroke={act === i ? SK.gold : "rgba(255,255,255,0.25)"} strokeWidth={act === i ? 5 : 3} />)}
      <ellipse cx={xs[0] - 70} cy={gy - 150 + 60 * seedFall} rx={16} ry={22} fill="#D9B24F" />
      <g stroke="#8BD48A" strokeWidth={8} strokeLinecap="round" fill="#8BD48A">
        <line x1={xs[1] - 70} y1={gy} x2={xs[1] - 70} y2={gy - 90} />
        <ellipse cx={xs[1] - 98} cy={gy - 86} rx={30} ry={13} transform={`rotate(-30 ${xs[1] - 98} ${gy - 86})`} />
        <ellipse cx={xs[1] - 42} cy={gy - 110} rx={30} ry={13} transform={`rotate(30 ${xs[1] - 42} ${gy - 110})`} />
      </g>
      <g stroke="#6FBF6E" strokeWidth={9} strokeLinecap="round" fill="#6FBF6E">
        <line x1={xs[2] - 70} y1={gy} x2={xs[2] - 70} y2={gy - 170} />
        <ellipse cx={xs[2] - 104} cy={gy - 70} rx={36} ry={14} transform={`rotate(-35 ${xs[2] - 104} ${gy - 70})`} />
        <ellipse cx={xs[2] - 36} cy={gy - 110} rx={36} ry={14} transform={`rotate(35 ${xs[2] - 36} ${gy - 110})`} />
        <ellipse cx={xs[2] - 70} cy={gy - 190} rx={18} ry={34} fill="#D9B24F" stroke="#D9B24F" />
      </g>
      {[0, 1, 2, 3, 4, 5].map((k) => <ellipse key={k} cx={xs[3] - 110 + k * 16} cy={gy - 90 + (k % 2) * 22} rx={13} ry={18} fill="#D9B24F" transform={`rotate(${k * 25} ${xs[3] - 110 + k * 16} ${gy - 90 + (k % 2) * 22})`} />)}
      {["Seeds fall", "Sprout", "Plant grows", "More seeds"].map((s, i) => <T key={s} x={xs[i] - 70} y={gy - 230} size={24} bold>{s}</T>)}
      {[0, 1, 2].map((i) => <Arrow key={i} x1={xs[i] - 70 + 86} y1={gy - 110} x2={xs[i + 1] - 70 - 86} y2={gy - 110} color={SK.gold} sw={5} head={18} />)}
      <path d={`M${xs[3] - 70} ${gy - 20} C ${xs[3] - 70} ${gy + 110}, ${xs[0] - 70} ${gy + 110}, ${xs[0] - 70} ${gy - 20}`} stroke={SK.gold} strokeWidth={5} strokeDasharray="14 12" fill="none" />
      <T x={420} y={gy + 110} size={24} color={SK.gold} italic>…and round again</T>
    </SVG>
  );
}
// Drip rig: pipe with emitters, drops falling to four plants, moist patches growing, dry soil between.
function DripRig({ lt, at }) {
  const o = out3(lt, at, 0.8); if (o <= 0) return null;
  const xs = [160, 320, 480, 640], soilTop = 700, wet = clamp((lt - at) / 8, 0, 1);
  return (
    <SVG op={o}>
      <rect x={60} y={soilTop} width={640} height={200} rx={10} fill="#8A6A48" />
      {xs.map((x, i) => <ellipse key={i} cx={x} cy={soilTop + 60} rx={70 * wet} ry={55 * wet} fill="#4A3524" opacity={0.9} />)}
      <rect x={70} y={330} width={620} height={16} rx={8} fill="#2B2B2B" />
      <rect x={60} y={300} width={22} height={60} rx={6} fill="#2B2B2B" />
      {xs.map((x, i) => <rect key={i} x={x - 8} y={344} width={16} height={14} rx={3} fill="#444" />)}
      {xs.map((x, i) => { const ph = ((lt - at) * 0.9 + i * 0.27) % 1; return ph > 0.05 && ph < 0.95 ? <ellipse key={"d" + i} cx={x} cy={358 + ph * (soilTop - 358)} rx={7} ry={12} fill="#7FD3F7" /> : null; })}
      {xs.map((x, i) => <g key={"p" + i} stroke="#6FBF6E" strokeWidth={8} strokeLinecap="round" fill="#6FBF6E">
        <line x1={x} y1={soilTop} x2={x} y2={soilTop - 120} />
        <ellipse cx={x - 30} cy={soilTop - 70} rx={30} ry={12} transform={`rotate(-30 ${x - 30} ${soilTop - 70})`} />
        <ellipse cx={x + 30} cy={soilTop - 100} rx={30} ry={12} transform={`rotate(30 ${x + 30} ${soilTop - 100})`} />
        <path d={`M${x} ${soilTop} l-18 40 M${x} ${soilTop} l18 44 M${x} ${soilTop} l0 50`} stroke="#E8D7B5" strokeWidth={4} fill="none" />
      </g>)}
      <T x={380} y={290} size={24} color={SK.dim}>thin pipe with tiny holes · drop by drop · right at the roots</T>
      <T x={240} y={880} size={22} color={SK.dim} italic>the soil between the plants stays dry</T>
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

// ============================================================================
function B1(ctx) {
  const icons = [["icon_gather", "Gather"], ["icon_hunt", "Hunt"], ["icon_grow", "Grow"], ["icon_water", "Water"]];
  return ({ localTime: lt, duration }) => {
    const cQ = S("b1", 1);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[1]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(1, ctx, [L("Session 1 · Gatherers, hunters, the big idea, watering", 0.4, "sub"), L("BIG QUESTION", cQ, "head"),
          L("No shops, no farms – how would you get your food every day?", cQ), L("Think for a moment. Share one idea.", SE("b1", 1), "think")])}>
        <Pic slot="forest" label="Thick forest with wild fruit trees" x={40} y={60} w={1360} h={900} lt={lt} at={0} dur={1.0} fx="zoom" zoom={1.2} kenDur={10} dim={0.3} />
        {icons.map(([s, lab], i) => <Node key={s} slot={s} label={lab} x={420 + i * 200} y={190} r={64} lt={lt} at={0.3 + i * 0.2} size={22} />)}
        <Big x={40} y={360} w={1360} lt={lt} at={1.1} size={88} align="center">Gatherers to Cultivators</Big>
        <Card x={140} y={640} w={1160} h={240} lt={lt} at={cQ} out={stopAt("b1", 1) - 0.1} pad={30}>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 22, letterSpacing: "0.14em", color: SK.gold, marginBottom: 12 }}>BIG QUESTION</div>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 44, lineHeight: 1.22, color: SK.white }}>No shops, no farms – how would you get your food every day?</div>
        </Card>
        <Stop lt={lt} b="b1" />
      </Scene>
    );
  };
}
function B2(ctx) {
  const foods = ["fruits", "nuts", "berries", "roots", "leaves", "honey", "eggs", "mushrooms"];
  const steps = [["life_search", "Search for food", 1060, 150], ["life_eat", "Eat what you find", 1300, 480], ["life_runsout", "Food runs out", 1060, 810], ["life_move", "Move to a new place", 820, 480]];
  return ({ localTime: lt, duration }) => {
    const ats = foods.map((f) => W("b2", f.slice(0, 5))), cRan = W("b2", "ran"), cHungry = S("b2", 3);
    const spin = lt * 18;
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[2]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(2, ctx, [L("GATHERERS – picked food from nature", S("b2", 0), "head"), L("fruits, nuts, berries, roots, leaves, honey, eggs, mushrooms", ats[0]),
          L("Search → Eat → Food runs out → Move", cRan, "big"), L("Some days they stayed hungry.", cHungry)])}>
        <Pic slot="gatherers" label="Gatherers" x={40} y={60} w={640} h={700} lt={lt} at={0} fx="pan" />
        <Chip text="GATHERERS – picked food from nature" x={360} y={790} lt={lt} at={S("b2", 0)} tone="gold" size={28} />
        {foods.map((f, i) => { const x = 720 + (i % 3) * 240, y = 60 + Math.floor(i / 3) * 240;
          return <React.Fragment key={f}>
            <Pic slot={"food_" + f} label={f} x={x} y={y} w={220} h={220} lt={lt} at={ats[i]} out={cRan} fx="pop" />
            <Chip text={f[0].toUpperCase() + f.slice(1)} x={x + 110} y={y + 168} lt={lt} at={ats[i] + 0.1} out={cRan} size={22} />
          </React.Fragment>; })}
        <SVG op={out3(lt, cRan, 0.8)}>
          <circle cx={1060} cy={480} r={270} stroke="rgba(255,255,255,0.28)" strokeWidth="6" strokeDasharray="22 18" transform={`rotate(${spin} 1060 480)`} />
          {[[-70, 20], [20, 110], [110, 200], [200, 290]].map(([a, b], i) => <ArcA key={i} cx={1060} cy={480} r={270} a1={a} a2={b} op={out3(lt, cRan + 0.4 + i * 0.25, 0.5)} />)}
          <T x={1060} y={470} size={30} bold serif>round and</T><T x={1060} y={510} size={30} bold serif>round</T>
        </SVG>
        {steps.map(([slot, lab, x, y], i) => <React.Fragment key={slot}>
          <Pic slot={slot} label={lab} x={x - 130} y={y - 85} w={260} h={170} lt={lt} at={cRan + 0.2 + i * 0.25} fx="pop" r={14} />
          <Chip text={lab} x={x} y={y + 50} lt={lt} at={cRan + 0.35 + i * 0.25} size={20} />
        </React.Fragment>)}
        <Chip text="Some days they stayed hungry." x={720} y={930} lt={lt} at={cHungry} tone="gold" size={28} />
      </Scene>
    );
  };
}
function B3(ctx) {
  return ({ localTime: lt, duration }) => {
    const cHunt = W("b3", "hunters"), cFire = W("b3", "fire"), cCook = W("b3", "cook"), cWarm = W("b3", "warm"), cScare = W("b3", "scare"), cBoth = W("b3", "both"), cHG = W("b3", "huntergatherers");
    const d = drive(lt, cBoth, cHG + 0.4), glow = out3(lt, cFire, 1.0);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[3]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(3, ctx, [L("HUNTERS: animals and fish · hunted in groups · kept moving", cHunt), L("FIRE: cook · keep warm · scare away animals", cFire),
          L("GATHERER + HUNTER = HUNTER-GATHERER", cBoth, "big"), L("What problem would you face if you ate only wild fruits? Why did hunters keep moving?", stopAt("b3", 3), "think")])}>
        <Pic slot="hunt_group" label="Hunters" x={40} y={60} w={660} h={440} lt={lt} at={0} fx="pan" />
        <Pic slot="hunters" label="Rock painting of a hunt" x={740} y={60} w={660} h={440} lt={lt} at={cHunt} fx="zoom" />
        <Chip text="HUNTERS – animals and fish, in groups" x={370} y={450} lt={lt} at={cHunt} size={24} />
        <Pic slot="hunt_fire" label="Fire" x={40} y={540} w={660} h={400} lt={lt} at={cFire} fx="zoom" />
        <div style={{ position: "absolute", left: 40, top: 540, width: 660, height: 400, borderRadius: 18, opacity: glow * 0.8, pointerEvents: "none",
          background: "radial-gradient(60% 50% at 50% 100%, rgba(255,150,40,0.75) 0%, rgba(255,120,20,0.25) 45%, rgba(0,0,0,0) 75%)" }} />
        <Chip text="FIRE" x={370} y={890} lt={lt} at={cFire} tone="gold" size={28} />
        <div style={{ position: "absolute", inset: 0, opacity: 1 - reveal(lt, cBoth, 0.4) }}><FireIcons lt={lt} atCook={cCook} atWarm={cWarm} atScare={cScare} x={870} y={700} /></div>
        {/* GATHERER + HUNTER cards slide together and become HUNTER-GATHERER */}
        <div style={{ position: "absolute", left: lerp(760, 900, d), top: 600, width: 280, height: 180, borderRadius: 18, background: SK.cream, opacity: out3(lt, cBoth, 0.5) * (1 - reveal(lt, cHG + 0.5, 0.4)),
          display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SERIF, fontWeight: 700, fontSize: 34, color: SK.ink }}>GATHERER</div>
        <div style={{ position: "absolute", left: lerp(1120, 980, d), top: 600, width: 280, height: 180, borderRadius: 18, background: SK.cream, opacity: out3(lt, cBoth, 0.5) * (1 - reveal(lt, cHG + 0.5, 0.4)),
          display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SERIF, fontWeight: 700, fontSize: 34, color: SK.ink }}>HUNTER</div>
        <Chip text="+" x={1070} y={660} lt={lt} at={cBoth} out={cHG + 0.3} tone="gold" size={40} />
        <div style={{ position: "absolute", left: 760, top: 600, width: 640, height: 180, borderRadius: 18, background: SK.gold, opacity: pop(lt, cHG + 0.5, 0.6),
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: SERIF, fontWeight: 700, fontSize: 40, color: SK.ink }}>
          HUNTER-GATHERER<div style={{ fontFamily: SANS, fontWeight: 400, fontSize: 24, marginTop: 6 }}>did both · always moving</div></div>
        <Stop lt={lt} b="b3" />
      </Scene>
    );
  };
}
function B4(ctx) {
  return ({ localTime: lt, duration }) => {
    const cNot = W("b4", "noticed"), cIdea = S("b4", 1), cQuote = S("b4", 2), cCult = W("b4", "cultivation"), cCultr = W("b4", "cultivators");
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[4]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(4, ctx, [L("About 10,000–12,000 years ago", S("b4", 0), "head"), L("Seeds on the ground sprouted into plants that gave more seeds", cNot),
          L("THE BIG IDEA: put seeds in the soil ourselves", cIdea, "big"), L("CULTIVATION = growing plants on purpose", cCult), L("CULTIVATORS = people who grow crops – farmers", cCultr)])}>
        <SeedLoop lt={lt} at={cNot} />
        <Pic slot="idea" label="Hands planting seeds" x={760} y={60} w={640} h={440} lt={lt} at={cQuote - 0.3} fx="zoom" />
        <Chip text="About 10,000–12,000 years ago" x={1080} y={30} lt={lt} at={S("b4", 0)} size={24} />
        <Card x={760} y={560} w={640} h={200} lt={lt} at={cIdea} pad={24}>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 20, letterSpacing: "0.14em", color: SK.gold, marginBottom: 8 }}>THE BIG IDEA</div>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 36, lineHeight: 1.2, color: SK.white, opacity: out3(lt, cQuote, 0.5) }}>"If we put seeds in the soil ourselves, we can grow our own food!"</div>
        </Card>
        <Chip text="CULTIVATION = growing plants on purpose" x={720} y={800} lt={lt} at={cCult} tone="gold" size={30} />
        <Chip text="CULTIVATORS = people who grow crops, farmers" x={720} y={870} lt={lt} at={cCultr} size={28} />
      </Scene>
    );
  };
}
function B5(ctx) {
  const crops = ["wheat", "barley", "rice", "millets", "pulses"], animals = ["dog", "goat", "sheep", "cattle"];
  const chain = [["gatherers", "Gatherer"], ["hunt_group", "Hunter"], ["hunter_gatherer", "Hunter-gatherer"], ["after", "Cultivator"]];
  return ({ localTime: lt, duration }) => {
    const ca = crops.map((c) => W("b5", c.slice(0, 4))), aa = animals.map((a) => W("b5", a.slice(0, 4))), cFarm = S("b5", 2);
    const rowsOp = 1 - reveal(lt, cFarm, 0.5);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[5]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(5, ctx, [L("FIRST CROPS: wheat, barley → rice, millets, pulses", ca[0]), L("FIRST TAMED ANIMALS: dog → goat, sheep, cattle", aa[0]),
          L("BEFORE: luck, moving, hungry days", cFarm), L("AFTER: plan food, sow, harvest", cFarm + 0.6), L("To farm: when to SOW · how to WATER · how to PROTECT plants", W("b5", "sow"), "big"),
          L("What did people need to learn before they could farm?", stopAt("b5", 2), "think")], { max: 7 })}>
        <div style={{ position: "absolute", inset: 0, opacity: rowsOp }}>
          <Chip text="FIRST CROPS" x={720} y={16} lt={lt} at={S("b5", 0)} tone="gold" size={24} />
          {crops.map((c, i) => <React.Fragment key={c}>
            <Pic slot={"crop_" + c} label={c} x={60 + i * 270} y={70} w={230} h={230} lt={lt} at={ca[i]} fx="pop" />
            <Chip text={c[0].toUpperCase() + c.slice(1)} x={60 + i * 270 + 115} y={312} lt={lt} at={ca[i] + 0.15} size={24} />
          </React.Fragment>)}
          <Chip text="FIRST TAMED ANIMALS" x={720} y={420} lt={lt} at={S("b5", 1)} tone="gold" size={24} />
          {animals.map((a, i) => <React.Fragment key={a}>
            <Pic slot={"anim_" + a} label={a} x={210 + i * 270} y={480} w={230} h={230} lt={lt} at={aa[i]} fx="pop" />
            <Chip text={a[0].toUpperCase() + a.slice(1)} x={210 + i * 270 + 115} y={722} lt={lt} at={aa[i] + 0.15} size={24} />
          </React.Fragment>)}
        </div>
        <Pic slot="before" label="Before: hunter-gatherers" x={40} y={60} w={660} h={420} lt={lt} at={cFarm} fx="pan" />
        <Pic slot="after" label="After: farmers" x={740} y={60} w={660} h={420} lt={lt} at={cFarm + 0.3} fx="pan" />
        <Chip text="BEFORE: luck · moving · hungry days" x={370} y={430} lt={lt} at={cFarm + 0.2} size={24} />
        <Chip text="AFTER: plan food · sow · harvest" x={1070} y={430} lt={lt} at={cFarm + 0.5} tone="gold" size={24} />
        <SVG op={1}>{[0, 1, 2].map((i) => <Arr key={i} x1={250 + i * 320 + 80} y1={660} x2={250 + (i + 1) * 320 - 80} y2={660} lt={lt} at={cFarm + 1.0 + i * 0.3} />)}</SVG>
        {chain.map(([s, lab], i) => <Node key={s} slot={s} label={lab} x={250 + i * 320} y={660} r={64} lt={lt} at={cFarm + 0.8 + i * 0.3} size={22} />)}
        {[["when to SOW", "sow"], ["how to WATER", "water"], ["how to PROTECT plants", "protect"]].map(([t, w], i) =>
          <Chip key={t} text={t} x={300 + i * 420} y={900} lt={lt} at={W("b5", w)} tone="gold" size={26} />)}
        <Stop lt={lt} b="b5" />
      </Scene>
    );
  };
}
function B6(ctx) {
  const steps = [["water_rain", "1 Rain only", "rain"], ["water_carry", "2 Carrying by hand", "pots"], ["water_channel", "3 Small channels", "channels"],
    ["water_rope", "4 Rope and bucket", "rope"], ["water_persian", "5 Persian wheel", "persian"], ["water_pump", "6 Motor pumps", "motor"], ["water_sprinkler", "7 Sprinkler", "sprinklers"]];
  return ({ localTime: lt, duration }) => {
    const ats = steps.map((s) => W("b6", s[2])); ats[0] = W("b6", "waited");
    const cNoRain = S("b6", 2), breakAt = SE("b6", 3) + 0.2;
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[6]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(6, ctx, [L("Plants need water.", S("b6", 0)), L("1 Rain only – no rain, no crop", ats[0]), L("2 Carrying by hand", ats[1]), L("3 Small channels", ats[2]),
          L("4 Lifting water – rope and bucket, Persian wheel", ats[3]), L("5 Motor pumps", ats[5]), L("6 Sprinkler", ats[6]), L("7 ?", ats[6] + 1.0, "big")], { max: 9 })}>
        <Big x={60} y={70} w={760} lt={lt} at={S("b6", 0)} size={44}>Plants need water</Big>
        <SVG op={out3(lt, 0.2, 0.8)}>
          {steps.map((s, i) => { const x = 60 + i * 172, top = 930 - i * 95, on = out3(lt, ats[i], 0.5);
            return <rect key={i} x={x} y={top} width={164} height={960 - top} rx={8} fill={on > 0.5 ? "rgba(226,176,76,0.35)" : "rgba(255,255,255,0.10)"} stroke={on > 0.5 ? SK.gold : "rgba(255,255,255,0.35)"} strokeWidth={3} />; })}
          <rect x={60 + 7 * 172} y={930 - 7 * 95} width={164} height={960 - (930 - 7 * 95)} rx={8} fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.35)" strokeWidth={3} strokeDasharray="12 10" />
          <T x={60 + 7 * 172 + 82} y={930 - 7 * 95 + 70} size={60} bold color={SK.gold} op={out3(lt, ats[6] + 1.0, 0.6)}>?</T>
          <T x={60 + 7 * 172 + 82} y={930 - 7 * 95 + 110} size={20} color={SK.dim} op={out3(lt, ats[6] + 1.0, 0.6)}>step 7 – later</T>
        </SVG>
        {steps.map((s, i) => { const x = 60 + i * 172, top = 930 - i * 95;
          return <React.Fragment key={s[0]}>
            <Pic slot={s[0]} label={s[1]} x={x + 4} y={top - 118} w={156} h={108} lt={lt} at={ats[i]} fx="pop" r={12} />
            <Chip text={s[1]} x={x + 82} y={top + 8} lt={lt} at={ats[i] + 0.15} size={18} />
          </React.Fragment>; })}
        <Chip text="No rain meant no crop" x={620} y={160} lt={lt} at={cNoRain} out={ats[1]} tone="gold" size={28} />
        <Break lt={lt} at={breakAt} dur={2.3} />
      </Scene>
    );
  };
}
function B7(ctx) {
  return ({ localTime: lt, duration }) => {
    const cBook = W("b7", "chinese"), cPots = W("b7", "burying"), cSeep = S("b7", 2), cAncient = S("b7", 3);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[7]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(7, ctx, [L("Fan Shengzhi shu – a Chinese farming book of the 1st century BCE", cBook, "head"), L("Unglazed clay pots buried beside plants", cPots),
          L("Water seeps slowly through the clay to the roots", cSeep), L("Ancient drip irrigation!", cAncient, "big"),
          L("Sources: Wikipedia – Fan Shengzhi shu; Sunset – clay-pot (olla) irrigation", cAncient + 0.8, "source")])}>
        <Card x={50} y={50} w={1340} h={905} lt={lt} at={0} pad={0} />
        <Badge x={92} y={82} lt={lt} at={S("b7", 0)} />
        <Pic slot="claypot" label="Buried clay pot watering a plant's roots" x={92} y={172} w={720} h={560} lt={lt} at={S("b7", 1)} fx="zoom" />
        <Lines x={860} y={180} w={490} lt={lt} lines={[{ text: "Ancient drip irrigation", at: S("b7", 1), serif: true, bold: true, size: 40, color: SK.gold },
          { text: "Fan Shengzhi shu – a Chinese farming book, over 2,000 years old.", at: cBook }, { text: "Clay pots were buried beside the plants.", at: cPots },
          { text: "Water seeped slowly through the clay to the roots.", at: cSeep }, { text: "Ancient drip irrigation!", at: cAncient, serif: true, bold: true, size: 36, color: SK.gold }]} size={29} />
        <div style={{ position: "absolute", left: 92, top: 880, width: 1260, opacity: out3(lt, cAncient + 0.8, 0.6), fontFamily: SANS, fontSize: 21, color: SK.dim }}>
          Sources: Wikipedia – Fan Shengzhi shu (Han dynasty, 1st century BCE); Sunset – buried unglazed clay-pot (olla) irrigation, water seeps through the clay to the roots</div>
      </Scene>
    );
  };
}
function B8(ctx) {
  const smart = [["Saves water", "saves"], ["Right amount", "right"], ["Fewer weeds", "fewer"], ["Helps dry places", "dry"]];
  return ({ localTime: lt, duration }) => {
    const cQ = S("b8", 2), cLab = W("b8", "lab"), ats = smart.map(([t, w]) => W("b8", w));
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[8]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(8, ctx, [L("7 DRIP IRRIGATION – water drop by drop to the roots", S("b8", 0), "head"), L("WHY SMART?", cQ, "head"), ...smart.map(([t], i) => L(t, ats[i])),
          L("We have a drip unit in our lab!", cLab, "big")], { max: 8 })}>
        <Chip text="Step 7 – DRIP IRRIGATION" x={380} y={70} lt={lt} at={S("b8", 0)} tone="gold" size={30} />
        <DripRig lt={lt} at={S("b8", 1) - 0.4} />
        <Pic slot="drip_close" label="Drip pipe at the roots" x={800} y={60} w={600} h={400} lt={lt} at={S("b8", 1)} fx="zoom" />
        <Big x={800} y={500} w={600} lt={lt} at={cQ} out={ats[0]} size={40}>Why is drip irrigation smart?</Big>
        {smart.map(([t], i) => <Flip key={t} x={800 + (i % 2) * 310} y={500 + Math.floor(i / 2) * 215} w={290} h={195} lt={lt} at={ats[i]} q={t} label="WHY SMART?" size={30} />)}
        <Chip text="We have a drip unit in our lab!" x={1100} y={935} lt={lt} at={cLab} tone="gold" size={26} />
        <Stop lt={lt} b="b8" />
      </Scene>
    );
  };
}
function B9(ctx) {
  const row1 = [["gatherers", "Gatherer", "gatherer"], ["hunt_group", "Hunter", "hunter"], ["after", "Cultivator", "cultivator"]];
  const row2 = [["water_rain", "Rain"], ["water_carry", "Hand watering"], ["water_channel", "Channels"], ["water_pump", "Pumps"], ["water_sprinkler", "Sprinkler"], ["drip_field", "Drip"]];
  return ({ localTime: lt, duration }) => {
    const cRain = W("b9", "rain"), cTurn = S("b9", 2), rowsOp = 1 - reveal(lt, cTurn, 0.5), qAt = stopAt("b9", 2), hold = stopFor("b9")[2] - 0.2;
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[9]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(9, ctx, [L("Gatherer → Hunter → Cultivator", W("b9", "gatherer")), L("Rain → Hand watering → Channels → Pumps → Sprinkler → Drip", cRain),
          L("Which life would you choose, and why?", cTurn, "big"), L("QUICK CHECK", qAt, "head"), ...QUICK.map((q, i) => L(`${i + 1} ${q}`, qAt + 0.2 + i * 0.15, "sub"))], { max: 10 })}>
        <div style={{ position: "absolute", inset: 0, opacity: rowsOp }}>
          <SVG op={1}>{[0, 1].map((i) => <Arr key={i} x1={420 + i * 300 + 76} y1={230} x2={420 + (i + 1) * 300 - 76} y2={230} lt={lt} at={W("b9", row1[i + 1][2]) + 0.1} />)}
            {[0, 1, 2, 3, 4].map((i) => <Arr key={"w" + i} x1={170 + i * 220 + 66} y1={600} x2={170 + (i + 1) * 220 - 66} y2={600} lt={lt} at={cRain + 0.35 + i * 0.25} />)}</SVG>
          {row1.map(([s, lab, w], i) => <Node key={s} slot={s} label={lab} x={420 + i * 300} y={230} r={68} lt={lt} at={W("b9", w)} />)}
          {row2.map(([s, lab], i) => <Node key={s} slot={s} label={lab} x={170 + i * 220} y={600} r={58} lt={lt} at={cRain + 0.2 + i * 0.25} size={20} />)}
        </div>
        {[["gatherers", "Gatherer"], ["hunt_group", "Hunter"], ["after", "Farmer"]].map(([s, lab], i) => <React.Fragment key={s}>
          <Pic slot={s} label={lab} x={40 + i * 460} y={90} w={440} h={330} lt={lt} at={cTurn + i * 0.2} fx="zoom" />
          <Chip text={lab} x={260 + i * 460} y={372} lt={lt} at={cTurn + 0.2 + i * 0.2} tone={i === 2 ? "gold" : "cream"} size={28} />
        </React.Fragment>)}
        <Big x={40} y={520} w={1360} lt={lt} at={cTurn + 0.6} size={54} align="center">Which life would you choose, and why?</Big>
        {/* Stop 5: quick check card */}
        {windowOp(lt, qAt, qAt + hold, 0.35) > 0 && (
          <div style={{ position: "absolute", left: 40, top: 60, width: LEFT_W - 80, height: 900, borderRadius: 26, background: "rgba(5,30,22,0.88)", opacity: windowOp(lt, qAt, qAt + hold, 0.35),
            boxShadow: "0 0 0 3px rgba(226,176,76,0.9)", padding: "60px 90px", boxSizing: "border-box" }}>
            <div style={{ display: "inline-block", fontFamily: SERIF, fontWeight: 700, fontSize: 30, letterSpacing: "0.08em", color: SK.ink, background: SK.gold, padding: "10px 30px", borderRadius: 14 }}>QUICK CHECK</div>
            <div style={{ fontFamily: SANS, fontSize: 24, color: SK.dim, marginTop: 10 }}>Stop 5 of 5 · pause and answer, then back to the big question</div>
            {QUICK.map((q, i) => <div key={q} style={{ display: "flex", gap: 24, alignItems: "baseline", marginTop: 26, opacity: out3(lt, qAt + 0.3 + i * 0.2, 0.5) }}>
              <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 40, color: SK.gold, width: 44 }}>{i + 1}</span>
              <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 40, color: SK.white, lineHeight: 1.2 }}>{q}</span></div>)}
          </div>)}
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
function CultivatorsScenes(props = {}) {
  const caps = props.showCaptions === "false" ? false : props.showCaptions !== false;
  const titles = {};
  for (let n = 1; n <= NB; n++) titles[n] = str(props["title" + n + "Text"], TITLES[n]);
  const ctx = { caps, titles, capSize: num(props.captionSize, 34) };
  const B = [B1, B2, B3, B4, B5, B6, B7, B8, B9];
  const beats = B.map((Bn, i) => { const t = BEAT("b" + (i + 1)); return [t.start, t.start + t.dur, Bn]; });
  return (
    <StoryFrame props={props} dur={DUR} persistKey="thinkpro-gatherers-to-cultivators" collage={COLLAGE}>
      {beats.map(([s, e, Bn], i) => (
        <Sprite key={i} start={s} end={e}>{Bn(ctx)}</Sprite>
      ))}
      {STOPS.map(([b, i, hold]) => <StopAt key={b} t={BEAT(b).start + stopAt(b, i)} hold={hold - 0.2} />)}
      <ChimeAt t={BEAT("b7").start + S("b7", 0, 0)} />
      <AudioSync />
    </StoryFrame>
  );
}
window.CultivatorsScenes = CultivatorsScenes;
