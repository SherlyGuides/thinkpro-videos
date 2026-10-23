/* global React, window */
// ThinkPro Academy — "From Gatherers to Farmers" (Grade 6 Agriculture, Sessions 1–4).
// 25 scenes in 5 parts, after the script "Grade6_Agriculture_Video_Script_Draft1".
// STORY STYLE (engine/story-kit.jsx, window.TPStory): dark-green stage, photos in
// motion on the left 75%, a cream information panel on the right 25% that builds
// line by line, gold "Do you know?" cards. This file carries ONLY topic content.
// Everything is a pure function of beat-local time `lt` (scrub/export exact).
const { Sprite, Easing } = window;
const { reveal, windowOp, fade } = window.TPMotion;
const { num, str } = window.TPStage;
const { SK, SERIF, SANS, LEFT_W, pop, out3, lerp, drive, photoSrc,
  Pic, Chip, Badge, Big, Card, SVG, Arrow, Ring, T, ChimeAt, Scene, StoryFrame } = window.TPStory;

// ---- Timing: EVERYTHING is keyed to the narration (tools/fit_timing.py → timing.js).
const TM = window.TP_TIMING;
if (!TM) console.error("timing.js missing — run: python3 tools/fit_timing.py videos/gatherers-to-farmers");
const LEAD = TM ? TM.lead : 1.0;
const DUR = TM ? TM.total : 340;
const BEAT = (id) => TM.beats[id];
function W(id, pat, n = 0, lead = 0.25) {
  let c = 0;
  for (const [w, st] of BEAT(id).words) if (w === pat || w.startsWith(pat)) { if (c++ === n) return LEAD + st - lead; }
  console.warn("cue word not found:", id, pat); return LEAD;
}
const S = (id, i, lead = 0.25) => LEAD + BEAT(id).sentences[i].start - lead;   // sentence onset
const SE = (id, i) => LEAD + BEAT(id).sentences[i].end;                         // sentence end
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
const NB = 25;
const CAPS = {};
if (TM) for (let n = 1; n <= NB; n++) CAPS[n] = capsFor("b" + n);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// ---- Panel copy. Title defaults mirror the DC data-props (titleNText) — keep in sync. ----
const TITLES = {
  1: "LP1–4 – From Gatherers to Farmers", 2: "Big question", 3: "Gatherers", 4: "A gatherer's life", 5: "Hunters and fire",
  6: "Hunter-gatherers", 7: "The big idea", 8: "First crops and tamed animals", 9: "Ash mounds of Karnataka",
  10: "Life before and after farming", 11: "Watering crops, step by step", 12: "A 2,000-year-old dam still at work",
  13: "Drip irrigation", 14: "Saving the best seeds", 15: "Native and hybrid seeds", 16: "Millets",
  17: "Ancient farms of South India", 18: "Seed banks", 19: "Farm tools through time", 20: "Then and now",
  21: "Old and new farming methods", 22: "Sowing in our lab", 23: "Our class crop", 24: "Quick check", 25: "The whole story",
};
const PART = (n) => n <= 10 ? "Part 1 · Session 1 · Gatherers to cultivators" : n <= 13 ? "Part 2 · Session 1 · Watering crops"
  : n <= 18 ? "Part 3 · Session 2 · Ancient and modern seed" : n <= 20 ? "Part 4 · Session 3 · Ancient and modern tools"
  : "Part 5 · Session 4 · Scatter or sow in lines?";
const DYK_BEATS = [9, 12, 17];
const panel = (n, ctx, lines, extra = {}) => ({ kicker: DYK_BEATS.includes(n) ? "Do you know?" : PART(n), title: ctx.titles[n], lines, ...extra });
const L = (text, at, kind = "item", extra = {}) => ({ text, at, kind, ...extra });

// ---- Small shared pieces --------------------------------------------------------
const PH = { wheat: "crop_wheat", barley: "crop_barley", rice: "crop_rice", millets: "crop_millets", pulses: "crop_pulses" };
function ArcA({ cx, cy, r, a1, a2, op = 1, color = SK.gold, sw = 6 }) {
  if (op <= 0) return null;
  const rad = (d) => (d * Math.PI) / 180;
  const p = (d) => [cx + r * Math.cos(rad(d)), cy + r * Math.sin(rad(d))];
  const [x1, y1] = p(a1), [x2, y2] = p(a2 - 4);
  const tx = -Math.sin(rad(a2 - 4)), ty = Math.cos(rad(a2 - 4));
  return (
    <g opacity={op} stroke={color} fill={color} strokeLinecap="round" strokeLinejoin="round">
      <path d={`M${x1} ${y1} A${r} ${r} 0 0 1 ${x2} ${y2}`} strokeWidth={sw} fill="none" />
      <path d={`M${x2 + tx * 24} ${y2 + ty * 24} L${x2 - ty * 14 - tx * 4} ${y2 + tx * 14 - ty * 4} L${x2 + ty * 14 - tx * 4} ${y2 - tx * 14 - ty * 4} Z`} />
    </g>
  );
}
// Text block on the photo area (cream, Calibri), lines reveal at their own times.
function Lines({ x, y, w, lt, lines, size = 30, color = SK.white, gap = 14, serif = false }) {
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w }}>
      {lines.map((l, i) => {
        const o = out3(lt, l.at, 0.6) * (l.out != null ? 1 - reveal(lt, l.out, 0.4) : 1);
        if (o <= 0) return null;
        return <div key={i} style={{ opacity: o, transform: `translateY(${(1 - o) * 10}px)`, marginBottom: gap, fontFamily: l.serif || serif ? SERIF : SANS,
          fontWeight: l.bold ? 700 : 400, fontSize: l.size || size, lineHeight: 1.25, color: l.color || color, fontStyle: l.italic ? "italic" : "normal" }}>{l.text}</div>;
      })}
    </div>
  );
}
// Do-you-know card: badge, big photo (+ optional inset), title, facts, source.
function DYK({ lt, badgeAt, pic, picLabel, picAt, fx = "zoom", inset, insetLabel, insetAt, title, titleAt, facts, source, sourceAt }) {
  return (
    <React.Fragment>
      <Card x={50} y={50} w={1340} h={905} lt={lt} at={0} pad={0} />
      <Badge x={92} y={82} lt={lt} at={badgeAt} />
      <Pic slot={pic} label={picLabel} x={92} y={172} w={720} h={560} lt={lt} at={picAt} fx={fx} />
      {inset && <Pic slot={inset} label={insetLabel} x={560} y={560} w={300} h={210} lt={lt} at={insetAt} fx="pop" style={{ boxShadow: "0 0 0 4px " + SK.cream }} />}
      {inset && <Chip text={insetLabel} x={710} y={776} lt={lt} at={insetAt + 0.2} size={20} />}
      <Lines x={860} y={180} w={490} lt={lt} lines={[{ text: title, at: titleAt, serif: true, bold: true, size: 40, color: SK.gold }, ...facts]} size={29} />
      <div style={{ position: "absolute", left: 92, top: 880, width: 1260, opacity: out3(lt, sourceAt, 0.6), fontFamily: SANS, fontSize: 21, color: SK.dim }}>{source}</div>
    </React.Fragment>
  );
}
// Flip card (quick check): gold "?" back → cream question front.
function Flip({ x, y, w, h, lt, at, q, n }) {
  const p = reveal(lt, at, 0.7);
  if (p <= 0) return null;
  const front = p > 0.5, sx = Math.abs(1 - 2 * Easing.easeInOutCubic(p));
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, transform: `scaleX(${Math.max(0.02, sx)})`, borderRadius: 22, boxSizing: "border-box",
      background: front ? SK.cream : SK.gold, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 34px", textAlign: "center",
      boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }}>
      {front
        ? <div><div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 20, letterSpacing: "0.12em", color: SK.goldDeep, marginBottom: 10 }}>QUESTION {n}</div>
            <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 38, lineHeight: 1.2, color: SK.ink }}>{q}</div></div>
        : <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 120, color: SK.ink }}>?</div>}
    </div>
  );
}
// Rounded thumbnail node for chains/timelines.
function Node({ slot, label, x, y, r = 70, lt, at, labelBelow = true, size = 24 }) {
  const o = pop(lt, at, 0.6); if (o <= 0) return null;
  return (
    <React.Fragment>
      <Pic slot={slot} label={label} x={x - r} y={y - r} w={2 * r} h={2 * r} r={r} lt={lt} at={at} fx="pop" style={{ boxShadow: "0 0 0 4px " + SK.cream }} />
      <Chip text={label} x={x} y={labelBelow ? y + r + 14 : y - r - 50} lt={lt} at={at + 0.15} size={size} />
    </React.Fragment>
  );
}
function Arr({ x1, y1, x2, y2, lt, at, color = SK.gold, sw = 6 }) { return <Arrow x1={x1} y1={y1} x2={x2} y2={y2} color={color} sw={sw} op={out3(lt, at, 0.5)} />; }

// ============================================================================
// PART 1 — From gatherers to farmers (Session 1)
// ============================================================================
function B1(ctx) {
  return ({ localTime: lt, duration }) => {
    const cQ = S("b1", 1);
    const heroes = [["hero_gather", "Early humans gathering"], ["hero_seeds", "Farmer holding saved seeds"], ["hero_plough", "Farmer with ox-drawn plough"], ["hero_scatter", "Farmer scattering seeds"]];
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[1]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(1, ctx, [L("Grade 6 · Agriculture · Sessions 1–4", 0.4, "sub"), L("Ten thousand years ago, nobody was a farmer.", S("b1", 0), "plain"),
          L("From picking wild fruit to sowing seeds in neat rows.", cQ, "plain")], { kicker: "ThinkPro Academy" })}>
        {heroes.map(([s, lab], i) => <Pic key={s} slot={s} label={lab} x={40 + (i % 2) * 700} y={60 + Math.floor(i / 2) * 460} w={660} h={440} lt={lt} at={0.2 + i * 0.35} dur={1.0} fx="zoom" dim={0.32} />)}
        <div style={{ position: "absolute", left: 40, top: 60, width: 1360, height: 900, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          opacity: out3(lt, 0.9, 0.9) }}>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 92, color: SK.white, textShadow: "0 4px 24px rgba(0,0,0,0.6)", textAlign: "center", lineHeight: 1.1 }}>From Gatherers to Farmers</div>
          <div style={{ marginTop: 22, fontFamily: SANS, fontSize: 36, color: SK.gold, letterSpacing: "0.08em", textShadow: "0 2px 12px rgba(0,0,0,0.6)", opacity: out3(lt, 1.6, 0.8) }}>Grade 6 · Agriculture · Sessions 1–4</div>
        </div>
      </Scene>
    );
  };
}
function B2(ctx) {
  return ({ localTime: lt, duration }) => (
    <Scene lt={lt} dur={duration} captions={CAPS[2]} showCaps={ctx.caps} capSize={ctx.capSize}
      panel={panel(2, ctx, [L("BIG QUESTION", 0.3, "head"), L("If there were no shops and no farms, how would you get your food every day?", S("b2", 0)),
        L("Think: where does every meal you eat come from?", S("b2", 1) + 1.2, "think")])}>
      <Pic slot="forest" label="Thick forest with wild fruit trees" x={40} y={60} w={1360} h={900} lt={lt} at={0} dur={1.0} fx="zoom" zoom={1.16} kenDur={9} dim={0.12} />
      <Card x={90} y={620} w={900} h={280} lt={lt} at={S("b2", 0)}>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 22, letterSpacing: "0.14em", color: SK.gold, marginBottom: 12 }}>BIG QUESTION</div>
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 44, lineHeight: 1.22, color: SK.white }}>If there were no shops and no farms, how would you get your food every day?</div>
      </Card>
    </Scene>
  );
}
function B3(ctx) {
  const foods = ["fruits", "nuts", "berries", "roots", "leaves", "honey", "eggs", "mushrooms"];
  return ({ localTime: lt, duration }) => {
    const ats = foods.map((f) => W("b3", f.slice(0, 5)));
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[3]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(3, ctx, [L("GATHERERS – picked food from nature", W("b3", "gatherers"), "head"),
          ...foods.map((f, i) => L(f[0].toUpperCase() + f.slice(1), ats[i], "item"))], { max: 9 })}>
        <Pic slot="gatherers" label="Gatherers collecting food" x={40} y={60} w={640} h={700} lt={lt} at={0} fx="pan" />
        {foods.map((f, i) => {
          const x = 720 + (i % 3) * 240, y = 60 + Math.floor(i / 3) * 240;
          return <React.Fragment key={f}>
            <Pic slot={"food_" + f} label={f} x={x} y={y} w={220} h={220} lt={lt} at={ats[i]} fx="pop" />
            <Chip text={f[0].toUpperCase() + f.slice(1)} x={x + 110} y={y + 168} lt={lt} at={ats[i] + 0.1} size={22} />
          </React.Fragment>;
        })}
        <Chip text="GATHERERS – picked food from nature" x={360} y={790} lt={lt} at={W("b3", "gatherers")} tone="gold" size={30} />
      </Scene>
    );
  };
}
function B4(ctx) {
  const steps = [["life_search", "Search for food", "search", 530, 60], ["life_eat", "Eat what you find", "eat", 1000, 355], ["life_runsout", "Food runs out", "ran", 530, 650], ["life_move", "Move to a new place", "move", 60, 355]];
  return ({ localTime: lt, duration }) => {
    const ats = steps.map((s) => W("b4", s[2]));
    const spin = lt * 18;
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[4]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(4, ctx, [L("Search → Eat → Food runs out → Move", S("b4", 1), "big"), L("Some days they stayed hungry.", S("b4", 2)),
          L("Think: what problem would you face if you ate only wild fruit?", SE("b4", 2) - 0.6, "think")])}>
        <SVG op={out3(lt, S("b4", 0), 0.8)}>
          <circle cx={720} cy={480} r={330} stroke="rgba(255,255,255,0.28)" strokeWidth="6" strokeDasharray="22 18" transform={`rotate(${spin} 720 480)`} />
          {[[-70, 20], [20, 110], [110, 200], [200, 290]].map(([a, b], i) => <ArcA key={i} cx={720} cy={480} r={330} a1={a} a2={b} op={out3(lt, ats[i] + 0.3, 0.6)} />)}
          <T x={720} y={468} size={34} bold serif op={out3(lt, S("b4", 0), 0.8)}>round and</T>
          <T x={720} y={512} size={34} bold serif op={out3(lt, S("b4", 0), 0.8)}>round</T>
        </SVG>
        {steps.map(([slot, lab, w, x, y], i) => <React.Fragment key={slot}>
          <Pic slot={slot} label={lab} x={x} y={y} w={380} h={250} lt={lt} at={ats[i]} fx="pop" />
          <Chip text={lab} x={x + 190} y={y + 198} lt={lt} at={ats[i] + 0.15} size={24} />
        </React.Fragment>)}
        <Chip text="Some days they stayed hungry." x={720} y={930} lt={lt} at={S("b4", 2)} tone="gold" size={30} />
      </Scene>
    );
  };
}
function B5(ctx) {
  return ({ localTime: lt, duration }) => {
    const cG = W("b5", "hunted"), cF = W("b5", "fire"), cM = W("b5", "kept");
    const glow = out3(lt, cF, 1.2);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[5]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(5, ctx, [L("HUNTERS", S("b5", 0), "head"), L("Hunted in groups – animals were fast and strong", cG),
          L("Learnt to use fire – cook meat (softer, safer), keep warm, scare away animals", cF), L("Kept moving – followed the animals", cM)])}>
        <Pic slot="hunters" label="Early hunters (cave painting)" x={40} y={60} w={700} h={900} lt={lt} at={0} fx="zoom" />
        <div style={{ position: "absolute", left: 40, top: 60, width: 700, height: 900, borderRadius: 18, opacity: glow * 0.85, pointerEvents: "none",
          background: "radial-gradient(60% 50% at 50% 100%, rgba(255,150,40,0.75) 0%, rgba(255,120,20,0.25) 45%, rgba(0,0,0,0) 75%)" }} />
        {[["hunt_group", "Hunted in groups", cG], ["hunt_fire", "Learnt to use fire", cF], ["hunt_moving", "Kept moving", cM]].map(([s, lab, at], i) => <React.Fragment key={s}>
          <Pic slot={s} label={lab} x={780} y={60 + i * 310} w={620} h={280} lt={lt} at={at} fx="pop" />
          <Chip text={lab} x={1090} y={60 + i * 310 + 226} lt={lt} at={at + 0.15} size={26} />
        </React.Fragment>)}
      </Scene>
    );
  };
}
function B6(ctx) {
  return ({ localTime: lt, duration }) => {
    const cBoth = W("b6", "both"), cHG = W("b6", "call");   // merge as "We call them…" starts, so the merged photo has time on screen
    const d = drive(lt, 0.2, cBoth + 0.6);
    const merge = out3(lt, cHG, 0.9);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[6]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(6, ctx, [L("GATHERER + HUNTER = HUNTER-GATHERER", cHG, "big"), L("Both kept moving to find food.", cBoth)])}>
        <Pic slot="gatherers" label="Gatherer" x={lerp(-640, 70, d)} y={200} w={620} h={420} lt={lt} at={0} fx="none" op={1 - merge} />
        <Pic slot="hunt_group" label="Hunter" x={lerp(1440, 750, d)} y={200} w={620} h={420} lt={lt} at={0} fx="none" op={1 - merge} />
        <Chip text="GATHERER" x={380} y={640} lt={lt} at={cBoth - 0.3} out={cHG} size={28} />
        <Chip text="HUNTER" x={1060} y={640} lt={lt} at={cBoth - 0.3} out={cHG} size={28} />
        <Chip text="+" x={720} y={385} lt={lt} at={cBoth} out={cHG} tone="gold" size={40} />
        <Pic slot="hunter_gatherer" label="Hunter-gatherers" x={240} y={110} w={960} h={620} lt={lt} at={cHG} dur={0.9} fx="zoom" />
        <Chip text="GATHERER + HUNTER = HUNTER-GATHERER" x={720} y={770} lt={lt} at={cHG + 0.2} tone="gold" size={32} />
        <Chip text="Both kept moving to find food." x={720} y={850} lt={lt} at={cHG + 0.8} size={26} />
      </Scene>
    );
  };
}
// Seed loop: seed → sprout → plant → seeds, on a soil strip, active step cycling.
function SeedLoop({ lt, at }) {
  const o = out3(lt, at, 0.8); if (o <= 0) return null;
  const act = Math.floor(((lt - at) / 1.5) % 4);
  const xs = [150, 330, 510, 690], gy = 560;
  const seedFall = ((lt - at) * 0.5) % 1;
  return (
    <SVG op={o}>
      <rect x={60} y={gy} width={640} height={60} rx={10} fill={SK.soil} />
      {xs.map((x, i) => <circle key={i} cx={x - 70} cy={gy - 110} r={78} fill={act === i ? "rgba(226,176,76,0.22)" : "rgba(255,255,255,0.06)"} stroke={act === i ? SK.gold : "rgba(255,255,255,0.25)"} strokeWidth={act === i ? 5 : 3} />)}
      {/* 1 seed falls */}
      <ellipse cx={xs[0] - 70} cy={gy - 150 + 60 * seedFall} rx={16} ry={22} fill="#D9B24F" />
      {/* 2 sprout */}
      <g stroke="#8BD48A" strokeWidth={8} strokeLinecap="round" fill="#8BD48A">
        <line x1={xs[1] - 70} y1={gy} x2={xs[1] - 70} y2={gy - 90} />
        <ellipse cx={xs[1] - 98} cy={gy - 86} rx={30} ry={13} transform={`rotate(-30 ${xs[1] - 98} ${gy - 86})`} />
        <ellipse cx={xs[1] - 42} cy={gy - 110} rx={30} ry={13} transform={`rotate(30 ${xs[1] - 42} ${gy - 110})`} />
      </g>
      {/* 3 plant with grain head */}
      <g stroke="#6FBF6E" strokeWidth={9} strokeLinecap="round" fill="#6FBF6E">
        <line x1={xs[2] - 70} y1={gy} x2={xs[2] - 70} y2={gy - 170} />
        <ellipse cx={xs[2] - 104} cy={gy - 70} rx={36} ry={14} transform={`rotate(-35 ${xs[2] - 104} ${gy - 70})`} />
        <ellipse cx={xs[2] - 36} cy={gy - 110} rx={36} ry={14} transform={`rotate(35 ${xs[2] - 36} ${gy - 110})`} />
        <ellipse cx={xs[2] - 70} cy={gy - 190} rx={18} ry={34} fill="#D9B24F" stroke="#D9B24F" />
      </g>
      {/* 4 more seeds and grains */}
      {[0, 1, 2, 3, 4, 5].map((k) => <ellipse key={k} cx={xs[3] - 110 + k * 16} cy={gy - 90 + (k % 2) * 22} rx={13} ry={18} fill="#D9B24F" transform={`rotate(${k * 25} ${xs[3] - 110 + k * 16} ${gy - 90 + (k % 2) * 22})`} />)}
      {["Seeds fall", "Sprout", "Plant grows", "More seeds"].map((s, i) => <T key={s} x={xs[i] - 70} y={gy - 230} size={24} bold>{s}</T>)}
      {[0, 1, 2].map((i) => <Arrow key={i} x1={xs[i] - 70 + 86} y1={gy - 110} x2={xs[i + 1] - 70 - 86} y2={gy - 110} color={SK.gold} sw={5} head={18} />)}
      <path d={`M${xs[3] - 70} ${gy - 20} C ${xs[3] - 70} ${gy + 110}, ${xs[0] - 70} ${gy + 110}, ${xs[0] - 70} ${gy - 20}`} stroke={SK.gold} strokeWidth={5} strokeDasharray="14 12" fill="none" />
      <T x={420} y={gy + 110} size={24} color={SK.gold} italic>…and round again</T>
    </SVG>
  );
}
function B7(ctx) {
  return ({ localTime: lt, duration }) => {
    const cNot = W("b7", "noticed"), cIdea = S("b7", 1), cCult = W("b7", "cultivation"), cCultr = W("b7", "cultivators");
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[7]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(7, ctx, [L("About 10,000–12,000 years ago", S("b7", 0), "head"), L("Fallen seeds sprouted and grew", cNot),
          L("The big idea: sow seeds ourselves!", cIdea), L("CULTIVATION = growing plants on purpose", cCult, "big"), L("CULTIVATORS = people who grow crops – farmers", cCultr)])}>
        <SeedLoop lt={lt} at={cNot} />
        <Pic slot="idea" label="The idea: fallen seeds sprout" x={760} y={60} w={640} h={440} lt={lt} at={0} fx="zoom" />
        <Chip text="About 10,000–12,000 years ago" x={1080} y={448} lt={lt} at={S("b7", 0)} size={24} />
        <Card x={760} y={560} w={640} h={200} lt={lt} at={cIdea} pad={24}>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 20, letterSpacing: "0.14em", color: SK.gold, marginBottom: 8 }}>THE BIG IDEA</div>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 38, lineHeight: 1.2, color: SK.white }}>Sow seeds ourselves and grow our own food!</div>
        </Card>
        <Chip text="CULTIVATION = growing plants on purpose" x={720} y={800} lt={lt} at={cCult} tone="gold" size={30} />
        <Chip text="CULTIVATORS = the first farmers" x={720} y={870} lt={lt} at={cCultr} size={28} />
      </Scene>
    );
  };
}
function B8(ctx) {
  const crops = ["wheat", "barley", "rice", "millets", "pulses"], animals = ["dog", "goat", "sheep", "cattle"];
  return ({ localTime: lt, duration }) => {
    const ca = crops.map((c) => W("b8", c.slice(0, 4))), aa = animals.map((a) => W("b8", a.slice(0, 4)));
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[8]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(8, ctx, [L("FIRST CROPS", S("b8", 0), "head"), L("wheat, barley → later rice, millets, pulses", ca[0]),
          L("FIRST TAMED ANIMALS", S("b8", 1), "head"), L("dog → goat, sheep, cattle (milk, meat, wool)", aa[0])])}>
        {crops.map((c, i) => <React.Fragment key={c}>
          <Pic slot={PH[c]} label={c} x={60 + i * 276} y={70} w={256} h={256} lt={lt} at={ca[i]} fx="pop" />
          <Chip text={c[0].toUpperCase() + c.slice(1)} x={60 + i * 276 + 128} y={338} lt={lt} at={ca[i] + 0.15} size={24} />
        </React.Fragment>)}
        <Chip text="FIRST CROPS" x={720} y={16} lt={lt} at={S("b8", 0)} tone="gold" size={24} />
        {animals.map((a, i) => <React.Fragment key={a}>
          <Pic slot={"anim_" + a} label={a} x={178 + i * 276} y={500} w={256} h={256} lt={lt} at={aa[i]} fx="pop" />
          <Chip text={a[0].toUpperCase() + a.slice(1)} x={178 + i * 276 + 128} y={768} lt={lt} at={aa[i] + 0.15} size={24} />
        </React.Fragment>)}
        <Chip text="FIRST TAMED ANIMALS" x={720} y={446} lt={lt} at={S("b8", 1)} tone="gold" size={24} />
        <Chip text="for milk, meat and wool" x={720} y={870} lt={lt} at={W("b8", "milk")} size={28} />
      </Scene>
    );
  };
}
function B9(ctx) {
  return ({ localTime: lt, duration }) => (
    <Scene lt={lt} dur={duration} captions={CAPS[9]} showCaps={ctx.caps} capSize={ctx.capSize}
      panel={panel(9, ctx, [L("Ash mounds of the Neolithic (New Stone Age) in Karnataka", S("b9", 1), "head"), L("Huge heaps of burnt cattle dung", W("b9", "burnt")),
        L("3,000–5,000 years old", W("b9", "three")), L("Kupgal · Sanganakallu · Budihal", W("b9", "kupgal")),
        L("Source: Wikipedia – Neolithic ashmounds", SE("b9", 2) - 0.3, "source")])}>
      <DYK lt={lt} badgeAt={S("b9", 0)} pic="ashmound" picLabel="Ash mound at Kupgal / Sanganakallu" picAt={S("b9", 1)} inset="anim_cattle" insetLabel="Cattle" insetAt={W("b9", "cattle")}
        title="Ash mounds of the New Stone Age in Karnataka" titleAt={S("b9", 1)}
        facts={[{ text: "Herders burnt huge heaps of cattle dung.", at: W("b9", "burnt") }, { text: "The mounds are 3,000–5,000 years old.", at: W("b9", "three") },
          { text: "They still stand at Kupgal, Sanganakallu and Budihal.", at: W("b9", "kupgal") }]}
        source="Source: Wikipedia – Neolithic ashmounds (man-made accumulations of fossilised ash from burnt cattle dung, about 3200–1200 BC; Kupgal, Sanganakallu, Budihal)" sourceAt={SE("b9", 2) - 0.3} />
    </Scene>
  );
}
function B10(ctx) {
  const chain = [["gatherers", "Gatherer"], ["hunt_group", "Hunter"], ["hunter_gatherer", "Hunter-gatherer"], ["after", "Cultivator"]];
  return ({ localTime: lt, duration }) => {
    const cPlan = W("b10", "plan"), cLearn = S("b10", 3);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[10]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(10, ctx, [L("BEFORE: food by luck · always moving · some days hungry", S("b10", 1)), L("AFTER: plan food · sow seeds · harvest crops", cPlan),
          L("To farm, people had to learn: when to sow · how to water · how to protect plants", cLearn),
          L("Think: which life would you choose – gatherer, hunter or farmer?", SE("b10", 3) - 0.4, "think")])}>
        <Pic slot="before" label="Before: hunter-gatherers" x={40} y={60} w={660} h={400} lt={lt} at={0} fx="pan" />
        <Pic slot="after" label="After: farmers" x={740} y={60} w={660} h={400} lt={lt} at={cPlan - 0.6} fx="pan" />
        <Chip text="BEFORE: food by luck · always moving" x={370} y={410} lt={lt} at={S("b10", 1)} size={24} />
        <Chip text="AFTER: plan · sow · harvest" x={1070} y={410} lt={lt} at={cPlan} tone="gold" size={24} />
        <SVG op={1}>{[0, 1, 2].map((i) => <Arr key={i} x1={250 + i * 320 + 90} y1={640} x2={250 + (i + 1) * 320 - 90} y2={640} lt={lt} at={S("b10", 1) + 0.5 + i * 0.35} />)}</SVG>
        {chain.map(([s, lab], i) => <Node key={s} slot={s} label={lab} x={250 + i * 320} y={640} r={72} lt={lt} at={S("b10", 1) + 0.3 + i * 0.35} />)}
        {[["when to sow", "sow"], ["how to water", "water"], ["how to protect plants", "protect"]].map(([t, w], i) =>
          <Chip key={t} text={t} x={300 + i * 420} y={890} lt={lt} at={W("b10", w)} tone="gold" size={26} />)}
        <Chip text="To farm, people had to learn:" x={720} y={830} lt={lt} at={cLearn} size={24} />
      </Scene>
    );
  };
}

// ============================================================================
// PART 2 — Watering crops (Session 1)
// ============================================================================
function B11(ctx) {
  const steps = [["water_rain", "1 Rain only", "rain"], ["water_carry", "2 Carrying by hand", "carrying"], ["water_channel", "3 Small channels", "channels"],
    ["water_rope", "4 Rope and bucket", "rope"], ["water_persian", "5 Persian wheel", "persian"], ["water_pump", "6 Motor pumps", "motor"], ["water_sprinkler", "7 Sprinkler", "sprinklers"]];
  return ({ localTime: lt, duration }) => {
    const ats = steps.map((s) => W("b11", s[2]));
    const dripAt = SE("b11", 1) + 0.2;
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[11]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(11, ctx, [L("1 Rain only – no rain, no crop", ats[0]), L("2 Carrying by hand – pots and buckets", ats[1]), L("3 Small channels – river water flows to fields", ats[2]),
          L("4 Lifting water – rope and bucket, Persian wheel", ats[3]), L("5 Motor pumps – electric or diesel", ats[5]), L("6 Sprinkler – sprays like rain", ats[6]), L("7 Drip irrigation →", dripAt)], { max: 8 })}>
        <SVG op={out3(lt, 0.2, 0.8)}>
          {steps.map((s, i) => { const x = 60 + i * 172, top = 930 - i * 95; const on = out3(lt, ats[i], 0.5);
            return <rect key={i} x={x} y={top} width={164} height={960 - top} rx={8} fill={on > 0.5 ? "rgba(226,176,76,0.35)" : "rgba(255,255,255,0.10)"} stroke={on > 0.5 ? SK.gold : "rgba(255,255,255,0.35)"} strokeWidth={3} />; })}
          <rect x={60 + 7 * 172} y={930 - 7 * 95} width={164} height={960 - (930 - 7 * 95)} rx={8} fill={SK.gold} opacity={out3(lt, dripAt, 0.6)} />
          <T x={60 + 7 * 172 + 82} y={930 - 7 * 95 + 50} size={24} bold color={SK.ink} op={out3(lt, dripAt, 0.6)}>8 Drip</T>
          <T x={60 + 7 * 172 + 82} y={930 - 7 * 95 + 82} size={22} color={SK.ink} op={out3(lt, dripAt, 0.6)}>next →</T>
        </SVG>
        {steps.map((s, i) => { const x = 60 + i * 172, top = 930 - i * 95;
          return <React.Fragment key={s[0]}>
            <Pic slot={s[0]} label={s[1]} x={x + 4} y={top - 118} w={156} h={108} lt={lt} at={ats[i]} fx="pop" r={12} />
            <Chip text={s[1]} x={x + 82} y={top + 8} lt={lt} at={ats[i] + 0.15} size={18} />
          </React.Fragment>; })}
        <Big x={60} y={70} w={700} lt={lt} at={S("b11", 0)} size={46}>Watering climbed step by step</Big>
      </Scene>
    );
  };
}
function B12(ctx) {
  return ({ localTime: lt, duration }) => (
    <Scene lt={lt} dur={duration} captions={CAPS[12]} showCaps={ctx.caps} capSize={ctx.capSize}
      panel={panel(12, ctx, [L("Kallanai (Grand Anicut)", W("b12", "kallanai"), "head"), L("Built by Karikala Chola on the river Kaveri about 2,000 years ago", W("b12", "chola")),
        L("Still carries water to farms in Tamil Nadu", W("b12", "still")), L("Also still in use: Veeranam Lake, built by the Cholas over 1,000 years ago – it supplies water to Chennai.", SE("b12", 1) - 0.6, "sub"),
        L("Sources: Wikipedia – Kallanai; Veeranam Lake", SE("b12", 1) + 0.4, "source")])}>
      <DYK lt={lt} badgeAt={S("b12", 0)} pic="kallanai" picLabel="Kallanai (Grand Anicut) on the Kaveri" picAt={S("b12", 1)} fx="pan" inset="veeranam" insetLabel="Veeranam Lake" insetAt={SE("b12", 1) - 0.6}
        title="A 2,000-year-old dam still at work" titleAt={S("b12", 1)}
        facts={[{ text: "Kallanai (Grand Anicut), a stone dam across the Kaveri.", at: W("b12", "kallanai") }, { text: "Built by Karikala Chola about 2,000 years ago.", at: W("b12", "chola") },
          { text: "It still carries water to farms in Tamil Nadu.", at: W("b12", "still") }, { text: "Also still in use: Veeranam Lake, built by the Cholas over 1,000 years ago – it supplies water to Chennai.", at: SE("b12", 1) - 0.6, size: 24, color: SK.dim }]}
        source="Sources: Wikipedia – Kallanai (built by King Karikalan, c. 100–150 CE, the oldest dam in India still in use); Wikipedia – Veeranam Lake (10th century, supplies Chennai)" sourceAt={SE("b12", 1) + 0.4} />
    </Scene>
  );
}
function DripRig({ lt, at }) {
  const o = out3(lt, at, 0.8); if (o <= 0) return null;
  const xs = [160, 320, 480, 640], soilTop = 700;
  const wet = clamp((lt - at) / 8, 0, 1);
  return (
    <SVG op={o}>
      <rect x={60} y={soilTop} width={640} height={200} rx={10} fill="#8A6A48" />
      {xs.map((x, i) => <ellipse key={i} cx={x} cy={soilTop + 60} rx={70 * wet} ry={55 * wet} fill="#4A3524" opacity={0.9} />)}
      <rect x={70} y={330} width={620} height={16} rx={8} fill="#2B2B2B" />
      <rect x={60} y={300} width={22} height={60} rx={6} fill="#2B2B2B" />
      {xs.map((x, i) => <rect key={i} x={x - 8} y={344} width={16} height={14} rx={3} fill="#444" />)}
      {xs.map((x, i) => {
        const ph = ((lt - at) * 0.9 + i * 0.27) % 1;
        return ph > 0.05 && ph < 0.95 ? <ellipse key={"d" + i} cx={x} cy={358 + ph * (soilTop - 358)} rx={7} ry={12} fill="#7FD3F7" /> : null;
      })}
      {xs.map((x, i) => <g key={"p" + i} stroke="#6FBF6E" strokeWidth={8} strokeLinecap="round" fill="#6FBF6E">
        <line x1={x} y1={soilTop} x2={x} y2={soilTop - 120} />
        <ellipse cx={x - 30} cy={soilTop - 70} rx={30} ry={12} transform={`rotate(-30 ${x - 30} ${soilTop - 70})`} />
        <ellipse cx={x + 30} cy={soilTop - 100} rx={30} ry={12} transform={`rotate(30 ${x + 30} ${soilTop - 100})`} />
        <path d={`M${x} ${soilTop} l-18 40 M${x} ${soilTop} l18 44 M${x} ${soilTop} l0 50`} stroke="#E8D7B5" strokeWidth={4} fill="none" />
      </g>)}
      <T x={380} y={290} size={24} color={SK.dim}>thin pipe · water drop by drop · right at the roots</T>
      <T x={240} y={880} size={22} color={SK.dim} italic>dry soil between the plants</T>
    </SVG>
  );
}
function B13(ctx) {
  return ({ localTime: lt, duration }) => {
    const cDry = W("b13", "dry"), cLab = W("b13", "lab");
    const ben = [["Saves water", "saves"], ["Right amount", "right"], ["Fewer weeds", "fewer"], ["Helps dry places", "dry"]];
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[13]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(13, ctx, [L("DRIP IRRIGATION – water drop by drop to the roots", S("b13", 0), "head"), ...ben.map(([t, w]) => L(t, W("b13", w))), L("We have a drip unit in our lab!", cLab, "big")])}>
        <DripRig lt={lt} at={S("b13", 1) - 0.4} />
        <Big x={60} y={70} w={680} lt={lt} at={S("b13", 0)} size={44}>Drip irrigation</Big>
        <Pic slot="drip_close" label="Drip pipe at the roots" x={800} y={60} w={600} h={400} lt={lt} at={S("b13", 1)} fx="zoom" />
        <Pic slot="drip_field" label="Drip in a dry place" x={800} y={500} w={600} h={400} lt={lt} at={cDry} fx="pan" />
        {ben.map(([t, w], i) => <Chip key={t} text={t} x={150 + i * 160} y={930} lt={lt} at={W("b13", w)} tone={i % 2 ? "cream" : "gold"} size={22} />)}
        <Chip text="We have a drip unit in our lab!" x={1100} y={850} lt={lt} at={cLab} tone="gold" size={28} />
      </Scene>
    );
  };
}

// ============================================================================
// PART 3 — Saving seeds (Session 2)
// ============================================================================
function B14(ctx) {
  const cyc = [["seed_choose", "Choose the best plants", "choose"], ["seed_collect", "Collect seeds", "collect"], ["seed_store", "Store safely", "store"], ["seed_sow", "Sow next season", "sow"]];
  return ({ localTime: lt, duration }) => {
    const ats = cyc.map((c) => W("b14", c[2])), cPot = S("b14", 3);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[14]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(14, ctx, [L("Why save the best seeds?", S("b14", 0), "head"), L("Choose best plants → collect seeds → dry well → store in a dry, closed, labelled pot → sow next season", ats[0]),
          L("A farmer's seed pot = the first seed bank", cPot, "big"), L("Think: would you save, eat or share your best seeds?", SE("b14", 3) - 0.3, "think")])}>
        <Pic slot="palm_seeds" label="Maize and spinach seeds in a palm" x={40} y={60} w={620} h={420} lt={lt} at={0} fx="zoom" />
        <Card x={40} y={60} w={620} h={420} lt={lt} at={S("b14", 0)} out={S("b14", 2)} pad={30}>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 42, lineHeight: 1.2, color: SK.white, marginTop: 110, textAlign: "center" }}>Why save the best seeds instead of eating them?</div>
        </Card>
        <SVG op={1}>
          <Arr x1={1050} y1={170} x2={1070} y2={170} lt={lt} at={ats[1]} /><Arr x1={1235} y1={290} x2={1235} y2={300} lt={lt} at={ats[2]} />
          <Arr x1={1070} y1={410} x2={1050} y2={410} lt={lt} at={ats[3]} /><Arr x1={885} y1={300} x2={885} y2={290} lt={lt} at={ats[3] + 0.4} color="rgba(255,255,255,0.5)" />
        </SVG>
        {cyc.map(([s, lab], i) => { const x = 720 + (i % 2) * 350, y = 60 + Math.floor(i / 2) * 240; const k = i === 3 ? 2 : i === 2 ? 3 : i;  // clockwise: choose, collect, (down) store, (left) sow
          const px = 720 + (k % 2) * 350, py = 60 + Math.floor(k / 2) * 240;
          return <React.Fragment key={s}>
            <Pic slot={s} label={lab} x={px} y={py} w={330} h={220} lt={lt} at={ats[i]} fx="pop" />
            <Chip text={lab} x={px + 165} y={py + 170} lt={lt} at={ats[i] + 0.15} size={22} />
          </React.Fragment>; })}
        <Card x={40} y={560} w={1360} h={300} lt={lt} at={cPot} pad={34}>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 22, letterSpacing: "0.14em", color: SK.gold, marginBottom: 12 }}>THE FIRST SEED BANK</div>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 48, lineHeight: 1.2, color: SK.white }}>A farmer's seed pot = the first seed bank</div>
          <div style={{ fontFamily: SANS, fontStyle: "italic", fontSize: 30, color: SK.gold, marginTop: 24, opacity: out3(lt, SE("b14", 3) - 0.3, 0.6) }}>Think: would you save, eat or share your best seeds?</div>
        </Card>
      </Scene>
    );
  };
}
function B15(ctx) {
  const nat = [["Saved for generations", "generations"], ["Suit local weather", "local"], ["Re-sown every year", "resown"], ["Many shapes and colours", null]];
  const hyb = [["Two parent plants crossed", "crossing"], ["High, even yield", "high"], ["New seed every season", "new"], ["All plants look alike", null]];
  return ({ localTime: lt, duration }) => {
    const nA = nat.map(([t, w], i) => (w ? W("b15", w) : SE("b15", 0) + 0.2)), hA = hyb.map(([t, w], i) => (w ? W("b15", w) : SE("b15", 2) + 0.2));
    const card = (t, i, col, at) => { const d = Easing.easeOutCubic(reveal(lt, at, 0.8)); if (d <= 0) return null;
      const x0 = 560, y0 = 470, x1 = col === 0 ? 40 : 740, y1 = 480 + i * 100;
      return <div key={t} style={{ position: "absolute", left: lerp(x0, x1, d), top: lerp(y0, y1, d), width: 660, height: 84, borderRadius: 16, opacity: Math.min(1, d * 2), boxSizing: "border-box",
        background: col === 0 ? SK.cream : SK.gold, color: SK.ink, fontFamily: SANS, fontWeight: 700, fontSize: 28, display: "flex", alignItems: "center", padding: "0 28px",
        transform: `scale(${0.8 + 0.2 * d})`, boxShadow: "0 6px 18px rgba(0,0,0,0.25)" }}>{t}</div>; };
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[15]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(15, ctx, [L("NATIVE (desi): saved for generations · suit local weather · re-sown every year", S("b15", 0)),
          L("HYBRID: two parent plants crossed · high, even yield · new seed every season", S("b15", 1))])}>
        <Pic slot="native_seeds" label="Native (desi) seeds" x={40} y={60} w={660} h={360} lt={lt} at={0} fx="zoom" />
        <Pic slot="hybrid_seeds" label="Hybrid seeds" x={740} y={60} w={660} h={360} lt={lt} at={S("b15", 1) - 0.5} fx="zoom" />
        <Chip text="NATIVE (desi)" x={370} y={376} lt={lt} at={S("b15", 0)} size={28} />
        <Chip text="HYBRID" x={1070} y={376} lt={lt} at={S("b15", 1)} tone="gold" size={28} />
        {nat.map(([t], i) => card(t, i, 0, nA[i]))}
        {hyb.map(([t], i) => card(t, i, 1, hA[i]))}
      </Scene>
    );
  };
}
function B16(ctx) {
  const ms = ["ragi", "jowar", "bajra"], crops = ["wheat", "barley", "rice", "millets", "pulses"];
  return ({ localTime: lt, duration }) => {
    const ats = ms.map((m) => W("b16", m)), cOld = W("b16", "oldest"), c2023 = W("b16", "2023");
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[16]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(16, ctx, [L("Among our oldest crops", cOld), L("Need little water", W("b16", "water")), L("Very nutritious", W("b16", "nutritious")),
          L("ragi · jowar · bajra", ats[0]), L("2023 – International Year of Millets", c2023, "big")])}>
        {ms.map((m, i) => <React.Fragment key={m}>
          <Pic slot={"millet_" + m} label={m} x={60 + i * 340} y={70} w={300} h={300} lt={lt} at={ats[i]} fx="pop" />
          <Chip text={m[0].toUpperCase() + m.slice(1)} x={60 + i * 340 + 150} y={318} lt={lt} at={ats[i] + 0.15} size={26} />
        </React.Fragment>)}
        <Card x={1080} y={70} w={320} h={300} lt={lt} at={c2023} pad={24}>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 86, color: SK.gold, lineHeight: 1, textAlign: "center", marginTop: 20 }}>2023</div>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 26, color: SK.white, textAlign: "center", marginTop: 16, lineHeight: 1.2 }}>International Year of Millets</div>
        </Card>
        <Chip text="Among our oldest crops" x={720} y={430} lt={lt} at={cOld} tone="gold" size={28} />
        {crops.map((c, i) => <Pic key={c} slot={PH[c]} label={c} x={60 + i * 280} y={500} w={200} h={200} lt={lt} at={cOld + 0.2 + i * 0.12} fx="pop" />)}
        <Chip text="need little water" x={460} y={760} lt={lt} at={W("b16", "water")} size={26} />
        <Chip text="very nutritious" x={980} y={760} lt={lt} at={W("b16", "nutritious")} size={26} />
      </Scene>
    );
  };
}
// Simplified outline of peninsular India (lon/lat → stage px) with the four ancient farming sites.
const COAST = [[72.6, 21], [72.8, 19], [73.3, 17], [73.8, 15.4], [74.5, 13.9], [74.8, 12.9], [75.8, 11.3], [76.3, 9.9], [76.9, 8.5], [77.5, 8.1], [78.1, 8.5], [78.2, 9.3],
  [79.1, 10.3], [79.8, 11.5], [80.3, 13.1], [80.2, 14.5], [80.0, 15.5], [81.0, 16.3], [82.3, 17.0], [83.3, 17.7], [84.7, 19.0], [85.8, 20.3], [86.5, 21]];
const MK = 42, MX = (lon) => 110 + (lon - 72) * MK, MY = (lat) => 190 + (21 - lat) * MK;
function SouthMap({ lt, at }) {
  const o = out3(lt, at, 0.8); if (o <= 0) return null;
  const pins = [["Sanganakallu", 76.9, 15.15, "san"], ["Budihal", 76.65, 16.6, "budi"], ["Hallur", 75.62, 14.33, "hallur"], ["Paiyampalli", 78.68, 12.33, "pai"]];
  return (
    <SVG op={o}>
      <path d={"M" + COAST.map(([lo, la]) => `${MX(lo).toFixed(1)} ${MY(la).toFixed(1)}`).join(" L") + " Z"} fill="rgba(255,255,255,0.12)" stroke={SK.cream} strokeWidth={4} strokeLinejoin="round" />
      <T x={MX(75.8)} y={MY(16.2)} size={22} bold color={SK.dim}>KARNATAKA</T>
      <T x={MX(78.6)} y={MY(10.6)} size={22} bold color={SK.dim}>TAMIL NADU</T>
      <T x={MX(80.7)} y={MY(19.2)} size={20} color={SK.dim} italic>South India</T>
      {pins.map(([n, lo, la], i) => { const x = MX(lo), y = MY(la), p = pop(lt, at + 0.6 + i * 0.3, 0.6);
        return <g key={n} opacity={p}>
          <circle cx={x} cy={y} r={11 * p} fill={SK.gold} stroke={SK.ink} strokeWidth={3} />
          <circle cx={x} cy={y} r={22} fill="none" stroke={SK.gold} strokeWidth={2} opacity={0.6} />
          <T x={x + 20} y={y + 8} size={24} bold anchor="start">{n}</T>
        </g>; })}
    </SVG>
  );
}
function B17(ctx) {
  return ({ localTime: lt, duration }) => (
    <Scene lt={lt} dur={duration} captions={CAPS[17]} showCaps={ctx.caps} capSize={ctx.capSize}
      panel={panel(17, ctx, [L("Historical sites of agriculture in South India", S("b17", 1), "head"), L("Sanganakallu, Budihal, Hallur (Karnataka) · Paiyampalli (Tamil Nadu)", S("b17", 1) + 0.6),
        L("At Sanganakallu, farmers grew foxtail millet, horse gram and moong about 4,000 years ago.", W("b17", "foxtail")),
        L("Source: e-PG Pathshala – Southern Neolithic of India", SE("b17", 1) - 0.3, "source")])}>
      <Card x={50} y={50} w={1340} h={905} lt={lt} at={0} pad={0} />
      <Badge x={92} y={82} lt={lt} at={S("b17", 0)} />
      <SouthMap lt={lt} at={S("b17", 1)} />
      <Pic slot="crop_millets" label="Foxtail millet" x={780} y={190} w={260} h={260} lt={lt} at={W("b17", "foxtail")} fx="pop" />
      <Chip text="foxtail millet" x={910} y={410} lt={lt} at={W("b17", "foxtail") + 0.15} size={22} />
      <Pic slot="crop_pulses" label="Horse gram and moong" x={1070} y={190} w={260} h={260} lt={lt} at={W("b17", "horse")} fx="pop" />
      <Chip text="horse gram · moong" x={1200} y={410} lt={lt} at={W("b17", "moong") + 0.1} size={22} />
      <Lines x={780} y={500} w={560} lt={lt} lines={[{ text: "Ancient farms of South India", at: S("b17", 1), serif: true, bold: true, size: 40, color: SK.gold },
        { text: "Sanganakallu, Budihal and Hallur in Karnataka; Paiyampalli in Tamil Nadu.", at: S("b17", 1) + 0.6 },
        { text: "At Sanganakallu, farmers grew foxtail millet, horse gram and moong about 4,000 years ago.", at: W("b17", "grown") }]} size={28} />
      <div style={{ position: "absolute", left: 92, top: 880, width: 1260, opacity: out3(lt, SE("b17", 1) - 0.3, 0.6), fontFamily: SANS, fontSize: 21, color: SK.dim }}>
        Source: e-PG Pathshala – Southern Neolithic of India (farming based on foxtail millet with horse gram and green gram; horse gram at Sanganakallu dated about 1950–1350 BC)</div>
    </Scene>
  );
}
function B18(ctx) {
  return ({ localTime: lt, duration }) => {
    const cV = W("b18", "village"), cN = W("b18", "national"), cC = W("b18", "class");
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[18]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(18, ctx, [L("SEED BANKS keep many kinds of seed safe", S("b18", 0), "head"), L("Village – farmers share and swap", cV), L("National – thousands of varieties", cN),
          L("Our class seed bank – coming later in the course", cC)])}>
        <Pic slot="seed_jars" label="Shelves of labelled seed jars" x={40} y={60} w={700} h={900} lt={lt} at={0} fx="zoom" />
        <Chip text="SEED BANKS keep many kinds of seed safe" x={390} y={880} lt={lt} at={S("b18", 0)} tone="gold" size={26} />
        <Pic slot="village_bank" label="Village seed bank" x={780} y={60} w={620} h={280} lt={lt} at={cV} fx="pop" />
        <Chip text="Village – farmers share and swap" x={1090} y={286} lt={lt} at={cV + 0.15} size={24} />
        <Pic slot="national_bank" label="National seed bank" x={780} y={370} w={620} h={280} lt={lt} at={cN} fx="pop" />
        <Chip text="National – thousands of varieties" x={1090} y={596} lt={lt} at={cN + 0.15} size={24} />
        <Pic slot="class_bank" label="Our class seed bank" x={780} y={680} w={620} h={220} lt={lt} at={cC} fx="pop" dim={0.25} />
        <Chip text="Our class seed bank – coming later in the course" x={1090} y={846} lt={lt} at={cC + 0.15} tone="gold" size={24} />
      </Scene>
    );
  };
}

// ============================================================================
// PART 4 — Farm tools (Session 3)
// ============================================================================
function B19(ctx) {
  const steps = [["tool_stick", "1 Digging stick", "digging"], ["tool_stone", "2 Stone hoe & sickle", "stone"], ["hero_plough", "3 Wooden plough", "wooden"], ["tool_iron", "4 Iron tools", "iron"], ["tool_machines", "5 Machines", "tractors"]];
  const cards = ["Digging stick", "Stone hoe", "Wooden plough", "Iron plough", "Power tiller", "Tractor"];
  const shuffled = [3, 0, 5, 2, 4, 1];   // starting order of the sort cards
  return ({ localTime: lt, duration }) => {
    const ats = steps.map((s) => W("b19", s[2]));
    const sortAt = SE("b19", 1) - 2.6, d = drive(lt, sortAt, sortAt + 2.0);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[19]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(19, ctx, [L("1 Digging stick – holes for seeds", ats[0]), L("2 Stone hoe & sickle – loosen soil, cut the crop", ats[1]), L("3 Wooden plough – pulled by oxen, long furrows", ats[2]),
          L("4 Iron tools – stronger, sharper, bigger fields", ats[3]), L("5 Machines – tractor, power tiller, harvester", ats[4])])}>
        <SVG op={out3(lt, S("b19", 0), 0.8)}>
          <line x1={100} y1={420} x2={1340} y2={420} stroke="rgba(255,255,255,0.35)" strokeWidth={6} strokeLinecap="round" />
          {steps.map((s, i) => <circle key={i} cx={160 + i * 280} cy={420} r={16} fill={out3(lt, ats[i], 0.4) > 0.5 ? SK.gold : "rgba(255,255,255,0.4)"} />)}
          <T x={100} y={470} size={22} color={SK.dim} anchor="start">OLDEST</T>
          <T x={1340} y={470} size={22} color={SK.dim} anchor="end">NEWEST</T>
          <Arrow x1={160} y1={760} x2={1300} y2={760} color={SK.gold} sw={5} head={20} op={out3(lt, sortAt, 0.6)} />
        </SVG>
        {steps.map((s, i) => <React.Fragment key={s[0]}>
          <Pic slot={s[0]} label={s[1]} x={160 + i * 280 - 125} y={120} w={250} h={170} lt={lt} at={ats[i]} fx="pop" r={14} />
          <Chip text={s[1]} x={160 + i * 280} y={318} lt={lt} at={ats[i] + 0.15} size={22} />
        </React.Fragment>)}
        <Big x={60} y={40} w={900} lt={lt} at={S("b19", 0)} size={40}>Tools grew smarter too</Big>
        <Chip text="Sort them: OLDEST → NEWEST" x={720} y={700} lt={lt} at={sortAt - 0.3} tone="gold" size={26} />
        {cards.map((c, k) => { const o = out3(lt, S("b19", 1) + 0.3 + k * 0.1, 0.5); if (o <= 0) return null;
          // Each card sorts in turn (oldest first) and lifts in an arc so it passes over its neighbours.
          const i0 = shuffled.indexOf(k), dk = drive(lt, sortAt + k * 0.22, sortAt + k * 0.22 + 1.1);
          const x = lerp(100 + i0 * 210, 100 + k * 210, dk), lift = i0 === k ? 0 : -52 * Math.sin(Math.PI * dk);
          return <div key={c} style={{ position: "absolute", left: x, top: 790 + lift, width: 196, height: 110, borderRadius: 16, background: SK.cream, color: SK.ink, opacity: o, boxSizing: "border-box",
            fontFamily: SANS, fontWeight: 700, fontSize: 24, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 10, zIndex: lift < 0 ? 2 : 1,
            boxShadow: d > 0.98 ? `0 0 0 4px ${SK.gold}` : "0 6px 18px rgba(0,0,0,0.25)" }}>{c}</div>; })}
      </Scene>
    );
  };
}
function B20(ctx) {
  const pairs = [["sickle", "Sickle", "sickle", "combine", "Combine harvester", "combine"], ["hero_plough", "Wooden plough", "plough", "tool_machines", "Tractor", "tractor"], ["tool_stick", "Digging stick", "digging", "seed_drill", "Seed drill", "drill"]];
  return ({ localTime: lt, duration }) => {
    const cK = W("b20", "khurpi"), cH = W("b20", "hoe"), cS = W("b20", "steel");
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[20]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(20, ctx, [L("SAME JOB, NEW TOOL", S("b20", 0), "head"), L("Sickle → combine harvester", W("b20", "sickle")), L("Wooden plough → tractor", W("b20", "plough")), L("Digging stick → seed drill", W("b20", "digging")),
          L("STILL USED", S("b20", 2), "head"), L("khurpi (weeding, loosening) · sickle (cutting) · hoe (digging) – steel blade, comfortable handle", cK),
          L("Try it: draw one old and one new tool that do the same job.", SE("b20", 2) - 0.4, "think")], { max: 8 })}>
        <Chip text="SAME JOB, NEW TOOL" x={480} y={16} lt={lt} at={S("b20", 0)} tone="gold" size={24} />
        {pairs.map(([s1, l1, w1, s2, l2, w2], i) => { const y = 70 + i * 300, a1 = W("b20", w1), a2 = W("b20", w2);
          return <React.Fragment key={s1}>
            <Pic slot={s1} label={l1} x={40} y={y} w={400} h={220} lt={lt} at={a1} fx="pop" r={14} />
            <Chip text={l1} x={240} y={y + 168} lt={lt} at={a1 + 0.15} size={22} />
            <SVG op={1}><Arr x1={456} y1={y + 110} x2={514} y2={y + 110} lt={lt} at={a2 - 0.2} /></SVG>
            <Pic slot={s2} label={l2} x={530} y={y} w={400} h={220} lt={lt} at={a2} fx="pop" r={14} />
            <Chip text={l2} x={730} y={y + 168} lt={lt} at={a2 + 0.15} tone="gold" size={22} />
          </React.Fragment>; })}
        <Chip text="STILL USED" x={1180} y={16} lt={lt} at={S("b20", 2)} tone="gold" size={24} />
        <Pic slot="khurpi" label="Khurpi" x={980} y={70} w={420} h={260} lt={lt} at={cK} fx="zoom" />
        <Chip text="Khurpi – weeding, loosening" x={1190} y={278} lt={lt} at={cK + 0.15} size={22} />
        <Pic slot="hoe" label="Hoe" x={980} y={370} w={420} h={260} lt={lt} at={cH} fx="zoom" />
        <Chip text="Hoe – digging · Sickle – cutting" x={1190} y={578} lt={lt} at={cH + 0.15} size={22} />
        <Card x={980} y={670} w={420} h={200} lt={lt} at={cS} pad={22}>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 20, letterSpacing: "0.14em", color: SK.gold }}>STILL IN INDIAN FIELDS</div>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 30, color: SK.white, marginTop: 10, lineHeight: 1.2 }}>Now with steel blades and better handles</div>
        </Card>
      </Scene>
    );
  };
}

// ============================================================================
// PART 5 — Farming methods, our class crop and close (Session 4)
// ============================================================================
function B21(ctx) {
  const old = [["hero_scatter", "Broadcasting", "broadcasting"], ["mixed_crop", "Mixed cropping", "mixed"], ["manure", "Cow-dung manure", "cowdung"], ["seed_store", "Saving your own seeds", "saving"]];
  const nw = [["line_sow", "Line sowing and dibbling", "line"], ["hybrid_seeds", "Improved seeds", "improved"], ["watering", "Measured watering", "measured"], ["drip_field", "Drip irrigation", "drip"]];
  return ({ localTime: lt, duration }) => {
    const cOld = S("b21", 1), cNew = S("b21", 2), cBest = S("b21", 3);
    const grid = (list, x0, at0, tone) => list.map(([s, lab, w], i) => { const x = x0 + (i % 2) * 340, y = 500 + Math.floor(i / 2) * 230, a = W("b21", w);
      return <React.Fragment key={s}>
        <Pic slot={s} label={lab} x={x} y={y} w={320} h={210} lt={lt} at={a} fx="pop" r={14} />
        <Chip text={lab} x={x + 160} y={y + 160} lt={lt} at={a + 0.15} tone={tone} size={20} />
      </React.Fragment>; });
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[21]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(21, ctx, [L("OLD: broadcasting · mixed cropping · cow-dung manure · saving your own seeds", cOld), L("NEW: line sowing and dibbling · improved seeds · measured watering · drip irrigation", cNew),
          L("Some old ideas are still the best.", cBest, "big")])}>
        <Pic slot="hero_scatter" label="Farmer scattering seeds by hand" x={40} y={60} w={660} h={400} lt={lt} at={0} fx="pan" />
        <Pic slot="rows" label="Neat rows of young seedlings" x={740} y={60} w={660} h={400} lt={lt} at={cNew - 0.6} fx="pan" />
        <Chip text="OLD WAYS" x={370} y={410} lt={lt} at={cOld} size={28} />
        <Chip text="NEW WAYS" x={1070} y={410} lt={lt} at={cNew} tone="gold" size={28} />
        {grid(old, 40, cOld, "cream")}
        {grid(nw, 740, cNew, "gold")}
        <Chip text="Some old ideas are still the best." x={720} y={946} lt={lt} at={cBest} tone="gold" size={28} />
      </Scene>
    );
  };
}
function DepthRig({ lt, at, maizeAt, spinAt }) {
  const o = out3(lt, at, 0.8); if (o <= 0) return null;
  const top = 330, cm = 40;
  return (
    <SVG op={o}>
      <rect x={60} y={top} width={620} height={5 * cm + 40} rx={10} fill="#8A6A48" />
      <rect x={60} y={top - 12} width={620} height={14} rx={6} fill="#6FBF6E" />
      <line x1={110} y1={top} x2={110} y2={top + 5 * cm} stroke={SK.cream} strokeWidth={4} />
      {[0, 1, 2, 3, 4, 5].map((k) => <g key={k}><line x1={96} y1={top + k * cm} x2={124} y2={top + k * cm} stroke={SK.cream} strokeWidth={3} />
        <T x={86} y={top + k * cm + 8} size={20} anchor="end" color={SK.cream}>{k} cm</T></g>)}
      <g opacity={pop(lt, spinAt, 0.5)}>
        <circle cx={300} cy={top + 1 * cm} r={9} fill="#2F4F2F" stroke={SK.cream} strokeWidth={2} />
        <T x={300} y={top + 1 * cm + 44} size={24} bold>Spinach · 1 cm</T>
      </g>
      <g opacity={pop(lt, maizeAt, 0.5)}>
        <ellipse cx={520} cy={top + 3.5 * cm} rx={14} ry={20} fill="#D9B24F" stroke={SK.cream} strokeWidth={2} />
        <T x={520} y={top + 3.5 * cm + 52} size={24} bold>Maize · 3–4 cm</T>
      </g>
      <T x={370} y={top - 30} size={24} color={SK.dim}>How deep do we sow?</T>
    </SVG>
  );
}
function B22(ctx) {
  const roles = ["leader", "recorder", "tool keeper", "water monitor", "clean-up monitor"];
  return ({ localTime: lt, duration }) => {
    const cRoles = W("b22", "five"), cMaize = W("b22", "three"), cSpin = W("b22", "spinach"), cLines = W("b22", "lines"), cScat = W("b22", "scattered"),
      cWater = W("b22", "water"), cLabel = W("b22", "label"), cSun = W("b22", "sun");
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[22]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(22, ctx, [L("TEAM ROLES: leader · recorder · tool keeper · water monitor · clean-up monitor", cRoles), L("DEPTH: maize 3–4 cm · spinach 1 cm", cMaize),
          L("Line sowing in 5 nursery bags · broadcasting in pots A and B", cLines), L("Water gently · label (team, crop, method, date) · 4–6 hours of sun", cWater),
          L("Safety: gloves for soil, masks near compost", cSun + 0.6, "sub")])}>
        {roles.map((r, i) => <Chip key={r} text={r} x={150 + i * 285} y={60} lt={lt} at={cRoles + i * 0.18} tone={i % 2 ? "cream" : "gold"} size={24} />)}
        <Chip text="TEAM ROLES" x={720} y={14} lt={lt} at={cRoles - 0.2} size={20} tone="green" />
        <DepthRig lt={lt} at={cMaize - 0.6} maizeAt={cMaize} spinAt={cSpin} />
        <Pic slot="bags" label="Line sowing in 5 nursery bags" x={740} y={150} w={660} h={270} lt={lt} at={cLines} fx="pop" r={14} />
        <Chip text="Line sowing in 5 nursery bags" x={1070} y={368} lt={lt} at={cLines + 0.15} size={22} />
        <Pic slot="pots" label="Broadcasting in pots A and B" x={740} y={440} w={660} h={270} lt={lt} at={cScat} fx="pop" r={14} />
        <Chip text="Broadcasting in pots A and B" x={1070} y={658} lt={lt} at={cScat + 0.15} size={22} />
        <Pic slot="watering" label="Water gently" x={40} y={640} w={660} h={300} lt={lt} at={cWater} fx="zoom" r={14} />
        <Chip text="Water gently" x={370} y={888} lt={lt} at={cWater + 0.15} size={22} />
        <Chip text="Label: team · crop · method · date" x={1070} y={760} lt={lt} at={cLabel} tone="gold" size={24} />
        <Chip text="4–6 hours of sun" x={1070} y={830} lt={lt} at={cSun} tone="gold" size={24} />
        <Chip text="Safety: gloves for soil · masks near compost" x={1070} y={900} lt={lt} at={cSun + 0.6} size={20} />
      </Scene>
    );
  };
}
function B23(ctx) {
  const nodes = [["bags", "Sow today", null], ["seedlings", "First check: count seedlings", "count"], ["watering", "Care: water, observe, protect", "water"], ["spinach", "Harvest Day: spinach in 30–40 days", "harvest"]];
  return ({ localTime: lt, duration }) => {
    const ats = nodes.map((n) => (n[2] ? W("b23", n[2]) : S("b23", 0)));
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[23]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(23, ctx, [L("Sow today", ats[0]), L("First check – count seedlings", ats[1]), L("Care – water, observe, protect", ats[2]), L("Harvest Day – spinach in 30–40 days", ats[3])])}>
        <Big x={60} y={50} w={1300} lt={lt} at={S("b23", 0)} size={44}>Our class crop</Big>
        <SVG op={1}>
          <line x1={120} y1={560} x2={1320} y2={560} stroke="rgba(255,255,255,0.35)" strokeWidth={6} strokeLinecap="round" />
          {[0, 1, 2].map((i) => <Arr key={i} x1={200 + i * 340 + 40} y1={560} x2={200 + (i + 1) * 340 - 40} y2={560} lt={lt} at={ats[i + 1] - 0.2} />)}
        </SVG>
        {nodes.map(([s, lab], i) => <React.Fragment key={s}>
          <Pic slot={s} label={lab} x={200 + i * 340 - 150} y={160} w={300} h={200} lt={lt} at={ats[i]} fx="pop" r={14} />
          <SVG op={pop(lt, ats[i], 0.5)}><circle cx={200 + i * 340} cy={560} r={18} fill={SK.gold} stroke={SK.ink} strokeWidth={4} /></SVG>
          <div style={{ position: "absolute", left: 200 + i * 340 - 150, top: 600, width: 300, textAlign: "center", opacity: pop(lt, ats[i] + 0.15, 0.5), fontFamily: SANS, fontWeight: 700, fontSize: 24, color: SK.white, lineHeight: 1.2 }}>{lab}</div>
        </React.Fragment>)}
        <Chip text="Harvest spinach in 30–40 days" x={720} y={880} lt={lt} at={W("b23", "thirty")} tone="gold" size={28} />
      </Scene>
    );
  };
}
function B24(ctx) {
  const qs = ["What did a gatherer eat?", "Why did farmers save their best seeds?", "Which old tool is still used today?", "Which way of sowing wastes fewer seeds?"];
  return ({ localTime: lt, duration }) => {
    const c0 = S("b24", 1), ringFrom = SE("b24", 1) + 0.3;
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[24]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(24, ctx, [L("QUICK CHECK – pause and answer", S("b24", 0), "head"), ...qs.map((q, i) => L(q, c0 + i * 0.6))])}>
        <Big x={60} y={40} w={1300} lt={lt} at={S("b24", 0)} size={46} align="center">Quick check – pause and answer</Big>
        {qs.map((q, i) => <Flip key={q} x={60 + (i % 2) * 680} y={140 + Math.floor(i / 2) * 330} w={640} h={300} lt={lt} at={c0 + i * 0.6} q={q} n={i + 1} />)}
        <SVG op={1}><Ring cx={720} cy={870} r={58} from={ringFrom} to={ringFrom + 5} lt={lt} n={5} /></SVG>
      </Scene>
    );
  };
}
function B25(ctx) {
  const rows = [
    [[["gatherers", "Gatherer", "gatherer"], ["hunt_group", "Hunter", "farmer"], ["after", "Cultivator", "farmer"]], 130],
    [[["water_rain", "Rain", "rain"], ["water_channel", "Channels", "rain"], ["water_pump", "Pumps", "rain"], ["water_sprinkler", "Sprinkler", "drip"], ["drip_field", "Drip", "drip"]], 400],
    [[["tool_stick", "Digging stick", "digging"], ["tool_machines", "Tractor", "tractor"]], 670],
  ];
  return ({ localTime: lt, duration }) => {
    const cTurn = S("b25", 1), cPred = S("b25", 2);
    const chainsOp = 1 - reveal(lt, cTurn, 0.5);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[25]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(25, ctx, [L("Gatherer → Hunter → Cultivator", W("b25", "gatherer")), L("Rain → Channels → Pumps → Sprinkler → Drip", W("b25", "rain")), L("Digging stick → Tractor", W("b25", "digging")),
          L("YOUR TURN: scatter or sow in lines? Write your prediction – we check it in Session 8.", cTurn, "big")])}>
        <div style={{ position: "absolute", inset: 0, opacity: chainsOp }}>
          {rows.map(([nodes, y], r) => { const n = nodes.length, gap = Math.min(300, 1200 / n), x0 = 720 - (n - 1) * gap / 2;
            return <React.Fragment key={r}>
              <SVG op={1}>{nodes.slice(1).map((nd, i) => <Arr key={i} x1={x0 + i * gap + 66} y1={y} x2={x0 + (i + 1) * gap - 66} y2={y} lt={lt} at={W("b25", nd[2]) + i * 0.25 + 0.15} />)}</SVG>
              {nodes.map(([s, lab, w], i) => <Node key={s} slot={s} label={lab} x={x0 + i * gap} y={y} r={58} lt={lt} at={W("b25", w) + i * 0.25} size={20} />)}
            </React.Fragment>; })}
        </div>
        <Pic slot="hero_scatter" label="Scatter (broadcasting)" x={40} y={100} w={660} h={440} lt={lt} at={cTurn} fx="zoom" />
        <Pic slot="line_sow" label="Sow in lines" x={740} y={100} w={660} h={440} lt={lt} at={cTurn + 0.3} fx="zoom" />
        <Chip text="Scatter?" x={370} y={486} lt={lt} at={cTurn + 0.4} size={30} />
        <Chip text="Sow in lines?" x={1070} y={486} lt={lt} at={cTurn + 0.6} tone="gold" size={30} />
        <Card x={140} y={620} w={1160} h={260} lt={lt} at={cPred} pad={34}>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 22, letterSpacing: "0.14em", color: SK.gold, marginBottom: 12 }}>YOUR TURN</div>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 42, lineHeight: 1.2, color: SK.white }}>Scatter or sow in lines? Write your prediction.</div>
          <div style={{ fontFamily: SANS, fontSize: 28, color: SK.dim, marginTop: 14 }}>We check it in Session 8.</div>
        </Card>
      </Scene>
    );
  };
}

// Plays audio/master.mp3 in step with the timeline (preview only).
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
  { slot: "seed_jars", x: -80, y: 520, w: 700, h: 560, ph: 4 }, { slot: "hero_plough", x: 560, y: 560, w: 820, h: 560, ph: 1 }];
function AgricultureScenes(props = {}) {
  const caps = props.showCaptions === "false" ? false : props.showCaptions !== false;
  const titles = {};
  for (let n = 1; n <= NB; n++) titles[n] = str(props["title" + n + "Text"], TITLES[n]);
  const ctx = { caps, titles, capSize: num(props.captionSize, 34) };
  const B = [B1, B2, B3, B4, B5, B6, B7, B8, B9, B10, B11, B12, B13, B14, B15, B16, B17, B18, B19, B20, B21, B22, B23, B24, B25];
  const beats = B.map((Bn, i) => { const t = BEAT("b" + (i + 1)); return [t.start, t.start + t.dur, Bn]; });
  return (
    <StoryFrame props={props} dur={DUR} persistKey="thinkpro-gatherers-to-farmers" collage={COLLAGE}>
      {beats.map(([s, e, Bn], i) => (
        <Sprite key={i} start={s} end={e}>{Bn(ctx)}</Sprite>
      ))}
      {DYK_BEATS.map((n) => <ChimeAt key={n} t={BEAT("b" + n).start + S("b" + n, 0, 0)} />)}
      <AudioSync />
    </StoryFrame>
  );
}
window.AgricultureScenes = AgricultureScenes;
