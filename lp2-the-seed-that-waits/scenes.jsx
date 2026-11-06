/* global React, window */
// ThinkPro Academy — "The Seed That Waits" (Grade 6 Agriculture, Session 2, V2).
// After AG_G6_S2_Video_Script_Seeds_Ancient_and_Modern (2 Nov 2026): 16 scenes told as the
// first farmers' next puzzle, three "Have you understood?" pause screens (5 s silent holds —
// the web player freezes there, TPStory.StopAt), two fun-fact cards, one "Do you know?" card
// per teaching scene. The clay SEED POT is the central visual model (full → empty → saved →
// handed down → the Svalbard vault). STORY STYLE (engine/story-kit.jsx). Pure function of time.
const { Sprite, Easing } = window;
const { reveal, windowOp, fade } = window.TPMotion;
const { num, str } = window.TPStage;
const { SK, SERIF, SANS, LEFT_W, pop, out3, lerp, drive, photoSrc,
  Pic, Chip, Badge, Big, Card, SVG, Arrow, Ring, T, ChimeAt, Scene, StoryFrame, StopAt, Break } = window.TPStory;

// ---- Timing: EVERYTHING is keyed to the narration (tools/fit_timing.py → timing.js).
const TM = window.TP_TIMING;
if (!TM) console.error("timing.js missing — run: python3 tools/fit_timing.py videos/lp2-the-seed-that-waits");
const LEAD = TM ? TM.lead : 1.0;
const DUR = TM ? TM.total : 450;
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
const TITLES = { 1: "LP2 – The seed that waits", 2: "The first crops", 3: "The pot is empty!", 4: "Not every seed grows", 5: "Have you understood?",
  6: "The seed-saving circle", 7: "Enemies and protectors", 8: "Native (desi) seeds", 9: "Have you understood?", 10: "Hybrid seeds", 11: "Native versus hybrid",
  12: "Millets are back!", 13: "Fun fact: the seed that waited", 14: "Fun fact: the Svalbard vault", 15: "Have you understood?", 16: "Think and ask" };
const KICK = "Grade 6 · Agriculture · Session 2";
const KICKS = { 5: "Pause point 1 of 3", 9: "Pause point 2 of 3", 13: "Fun fact", 14: "Fun fact", 15: "Pause point 3 of 3", 16: "Think and ask" };
const panel = (n, ctx, lines, extra = {}) => ({ kicker: KICKS[n] || KICK, title: ctx.titles[n], lines, ...extra });
const L = (text, at, kind = "item", extra = {}) => ({ text, at, kind, ...extra });

// ---- "Do you know?" facts (from the script, one per teaching scene, shown on the last sentence) ----
const DYK = { 2: "Wheat and barley were among the world's very first crops.", 4: "Choosing the best plants for seed is called selection.",
  6: "A seed bank is a safe store of seeds for the future.", 7: "Neem leaves are still used to protect stored grain.",
  8: "India once grew tens of thousands of different rice varieties.", 10: "The Green Revolution helped India grow enough food for its people.",
  12: "In India millets are also called 'Shree Anna'." };
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
const STOPS = [["b5", 1, 15.0], ["b9", 1, 15.0], ["b15", 2, 15.0]];
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
// Red "villain" tag (the kit's Chip has no red tone).
function Tag({ text, x, y, lt, at, out = null, size = 26, bg = "#B3261E", fg = SK.white }) {
  const o = pop(lt, at) * (out != null ? 1 - reveal(lt, out, 0.4) : 1); if (o <= 0) return null;
  return <div style={{ position: "absolute", left: x, top: y, transform: `translateX(-50%) scale(${0.9 + 0.1 * o})`, transformOrigin: "center top", opacity: o, fontFamily: SANS, fontWeight: 700,
    fontSize: size, color: fg, background: bg, padding: "6px 18px", borderRadius: 999, whiteSpace: "nowrap", boxShadow: "0 2px 10px rgba(0,0,0,0.25)" }}>{text}</div>;
}
const cap = (s) => s[0].toUpperCase() + s.slice(1);

// The clay SEED POT — the central visual model. fill 0→1 = how many seeds are inside;
// lid: a mud-sealed lid on top; glow: golden halo. Drawn in a ±150 box, scaled by s.
function SeedPot({ cx, cy, s = 1, lt, at = 0, fill = 1, lid = false, glow = 0, op = 1, shake = 0 }) {
  const o = pop(lt, at, 0.8) * op; if (o <= 0) return null;
  const dx = shake * 10 * Math.sin(lt * 80);
  const seeds = [[-60, 0], [-20, -8], [20, -4], [60, 2], [-40, 14], [0, 10], [40, 16], [-70, 24], [-30, 28], [10, 26], [50, 30], [75, 20], [-10, -18], [30, -14]];
  const nShow = Math.round(fill * seeds.length);
  return (
    <SVG op={o}>
      <g transform={`translate(${cx + dx} ${cy}) scale(${s * (0.9 + 0.1 * o)})`}>
        {glow > 0 && <circle r={170} fill={SK.gold} opacity={0.35 * glow} />}
        {glow > 0 && <circle r={130} fill={SK.gold} opacity={0.3 * glow} />}
        <path d="M-100 -70 C -150 -20, -140 110, -80 130 L 80 130 C 140 110, 150 -20, 100 -70 Z" fill="#B9703F" stroke="#7E4A28" strokeWidth={6} />
        <path d="M-95 -60 C -130 -10, -120 95, -75 115 L -60 115 C -105 90, -115 0, -80 -60 Z" fill="#D08A55" opacity={0.6} />
        <ellipse cx={0} cy={-70} rx={104} ry={30} fill="#7E4A28" />
        <ellipse cx={0} cy={-70} rx={88} ry={22} fill="#3B2316" />
        {!lid && seeds.slice(0, nShow).map(([x, y], i) => <ellipse key={i} cx={x * 0.85} cy={-70 + y * 0.55 - 6} rx={11} ry={7} fill="#E3B55C" stroke="#9E7320" strokeWidth={1.5} transform={`rotate(${(i * 37) % 60 - 30} ${x * 0.85} ${-70 + y * 0.55 - 6})`} />)}
        {lid && <g><ellipse cx={0} cy={-78} rx={108} ry={30} fill="#8A6A48" stroke="#5C4A3E" strokeWidth={5} /><ellipse cx={0} cy={-84} rx={30} ry={10} fill="#5C4A3E" /></g>}
        <path d="M-70 140 L 70 140" stroke="rgba(0,0,0,0.35)" strokeWidth={14} strokeLinecap="round" />
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
      {items.map((it, i) => <div key={i} style={{ display: "flex", gap: 24, alignItems: "flex-start", marginTop: i === 0 ? 44 : 22, opacity: out3(lt, it.at, 0.5), transform: `translateX(${(1 - out3(lt, it.at, 0.5)) * 30}px)` }}>
        <span style={{ flex: "none", fontFamily: SERIF, fontWeight: 700, fontSize: 40, color: SK.gold, width: 50 }}>{i + 1}</span>
        <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: items.length > 2 ? 36 : 42, color: SK.white, lineHeight: 1.22, background: "rgba(255,255,255,0.08)", padding: "10px 26px", borderRadius: 18 }}>{it.text}</span></div>)}
      {children}
      <div style={{ position: "absolute", left: 80, bottom: 44, fontFamily: SANS, fontSize: 26, color: SK.dim }}>Pause point {n} of 3</div>
    </div>
  );
}
// Dashed "?" answer boxes under a pause question.
function QBoxes({ lt, at, n, w = 250, left = 74, top = 40 }) {
  return (
    <div style={{ display: "flex", gap: 30, marginTop: top, marginLeft: left }}>
      {Array.from({ length: n }, (_, i) => <div key={i} style={{ width: w, height: 110, borderRadius: 18, border: `4px dashed ${SK.gold}`, opacity: pop(lt, at + 0.3 + i * 0.15, 0.5),
        display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SERIF, fontWeight: 700, fontSize: 60, color: SK.gold }}>?</div>)}
    </div>
  );
}
// Flat plant glyph (stem + leaves + grain head), scale s; weak = thin and pale.
function Plant({ x, y, s = 1, grow = 1, weak = false, heavy = false, color }) {
  const c = color || (weak ? "#A9B77A" : "#6FBF6E");
  return (
    <g transform={`translate(${x} ${y}) scale(${s} ${s * grow})`}>
      <line x1={0} y1={0} x2={0} y2={-150} stroke={c} strokeWidth={weak ? 5 : 9} strokeLinecap="round" />
      <ellipse cx={-30} cy={-70} rx={32} ry={12} fill={c} transform="rotate(-30 -30 -70)" />
      <ellipse cx={30} cy={-100} rx={32} ry={12} fill={c} transform="rotate(30 30 -100)" />
      {!weak && <ellipse cx={0} cy={-160} rx={heavy ? 22 : 14} ry={heavy ? 44 : 30} fill="#E3B55C" stroke="#9E7320" strokeWidth={2} />}
      {weak && <path d="M0 -150 q 10 -10 22 -4" stroke={c} strokeWidth={4} fill="none" />}
    </g>
  );
}

// ============================================================================
function B1(ctx) {
  const row = [["gatherers", "Gatherers"], ["hunt_group", "Hunters"], ["after", "Farmers"]];
  return ({ localTime: lt, duration }) => {
    const cHG = W("b1", "huntergatherers"), cHard = W("b1", "hard"), cDanger = W("b1", "dangerous"), cFarm = W("b1", "farming"), cPuzzle = W("b1", "puzzle"), cThis = W("b1", "this"), cSeed = W("b1", "seed");
    const ats = [cHG, cHG + 0.4, cFarm];
    const seedO = pop(lt, cThis, 0.8), sg = 0.6 + 0.4 * Math.sin(lt * 2.2);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[1]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(1, ctx, [L("A story in 16 scenes, with three pause points", 0.4, "sub"), L("Gatherers → Hunters → Farmers", cHG), L("Searching for food was hard and dangerous", cHard),
          L("Farming: an amazing discovery", cFarm), L("But farming brought a NEW puzzle…", cPuzzle, "big"), L("…a tiny seed", cSeed, "think")])}>
        <SVG op={1}>{[0, 1].map((i) => <Arr key={i} x1={260 + i * 400 + 90} y1={190} x2={260 + (i + 1) * 400 - 90} y2={190} lt={lt} at={ats[i + 1] - 0.1} />)}</SVG>
        {row.map(([s, lab], i) => <Node key={s} slot={s} label={lab} x={260 + i * 400} y={190} r={82} lt={lt} at={ats[i]} size={26} />)}
        <Tag text="hard… and DANGEROUS" x={460} y={330} lt={lt} at={cDanger} out={cFarm} size={28} />
        <Pic slot="family_shoots" label="A farming family beside their first green shoots" x={40} y={370} w={820} h={540} lt={lt} at={cFarm} fx="zoom" />
        <Chip text="FARMING!" x={450} y={385} lt={lt} at={cFarm + 0.2} tone="gold" size={34} />
        {/* the new puzzle: a big question mark over the field, then a single glowing seed */}
        <div style={{ position: "absolute", left: 920, top: 380, width: 480, textAlign: "center", opacity: pop(lt, cPuzzle, 0.7), fontFamily: SERIF, fontWeight: 700, fontSize: 260, lineHeight: 1, color: SK.gold, textShadow: "0 4px 24px rgba(0,0,0,0.5)" }}>?</div>
        <SVG op={seedO}>
          <g transform={`translate(1160 760) scale(${0.7 + 0.3 * seedO})`}>
            <circle r={110} fill={SK.gold} opacity={0.18 * sg} /><circle r={80} fill={SK.gold} opacity={0.2 * sg} />
            <ellipse rx={40} ry={62} fill="#E3B55C" stroke="#9E7320" strokeWidth={4} transform="rotate(-18)" />
            <path d="M-6 -40 Q 4 0 -4 40" stroke="#9E7320" strokeWidth={4} fill="none" strokeLinecap="round" transform="rotate(-18)" />
          </g>
        </SVG>
        <Chip text="A tiny seed" x={1160} y={860} lt={lt} at={cSeed} tone="gold" size={30} />
      </Scene>
    );
  };
}
// Simplified Indian-subcontinent outline (flat), with a glowing dot at Mehrgarh.
function IndiaMap({ x, y, s = 1, lt, at, dotAt }) {
  const o = out3(lt, at, 0.8); if (o <= 0) return null;
  const d = pop(lt, dotAt, 0.7), pulse = 1 + 0.25 * Math.sin(lt * 5);
  return (
    <SVG op={o}>
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <path d="M200 0 L 260 30 L 330 60 L 400 80 L 385 150 L 330 170 L 300 215 L 270 290 L 230 380 L 200 440 L 175 400 L 150 320 L 110 260 L 60 215 L 30 200 L 0 170 L 20 100 L 80 60 Z"
          fill="#2E7A4F" stroke={SK.cream} strokeWidth={5} strokeLinejoin="round" />
        <text x={200} y={250} textAnchor="middle" fontFamily={SANS} fontWeight="700" fontSize="26" fill={SK.cream} opacity={0.9}>Indian</text>
        <text x={200} y={282} textAnchor="middle" fontFamily={SANS} fontWeight="700" fontSize="26" fill={SK.cream} opacity={0.9}>subcontinent</text>
        <g opacity={d}>
          <circle cx={42} cy={150} r={34 * pulse} fill={SK.gold} opacity={0.3} /><circle cx={42} cy={150} r={14} fill={SK.gold} stroke={SK.ink} strokeWidth={3} />
          <line x1={56} y1={140} x2={120} y2={96} stroke={SK.gold} strokeWidth={3} />
          <text x={126} y={92} fontFamily={SERIF} fontWeight="700" fontSize="30" fill={SK.gold}>Mehrgarh</text>
        </g>
      </g>
    </SVG>
  );
}
function B2(ctx) {
  return ({ localTime: lt, duration }) => {
    const cEvery = W("b2", "everything"), cWheat = W("b2", "wheat"), cBarley = W("b2", "barley"), cPeas = W("b2", "peas"), cLent = W("b2", "lentils"), cLater = W("b2", "later"),
      cRice = W("b2", "rice"), cMil = W("b2", "millets"), cRagi = W("b2", "ragi"), cJowar = W("b2", "jowar"), cBajra = W("b2", "bajra"), cPulses = W("b2", "pulses"),
      cIndia = W("b2", "india"), cMehr = W("b2", "mehrgarh"), c9000 = W("b2", "9000"), cDyk = c9000 + 1.2;
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[2]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(2, ctx, [L("The first farmers tried growing EVERYTHING", S("b2", 0)), L("First crops: wheat · barley · peas · lentils", cWheat, "big"), L("Later: rice · millets (ragi, jowar, bajra) · pulses", cLater),
          L("Mehrgarh, Indian subcontinent: wheat and barley about 9,000 years ago", cIndia), L(DYK[2], cDyk, "think")])}>
        <Pic slot="idea" label="The first farmers sow on purpose" x={40} y={60} w={660} h={440} lt={lt} at={0} out={cWheat} fx="pan" />
        <Chip text="SO excited! Let's grow EVERYTHING!" x={370} y={450} lt={lt} at={cEvery} out={cWheat} tone="gold" size={28} />
        <Chip text="FIRST CROPS" x={370} y={30} lt={lt} at={cWheat} size={22} />
        {[["wheat", cWheat], ["barley", cBarley]].map(([c, at], i) => { const sway = 1.5 * Math.sin(lt * 1.6 + i); return <div key={c} style={{ position: "absolute", inset: 0, transform: `rotate(${sway}deg)`, transformOrigin: `${220 + i * 340}px 240px` }}>
          <Pic slot={"crop_" + c} label={c} x={60 + i * 340} y={80} w={320} h={320} lt={lt} at={at} fx="pop" />
          <Chip text={cap(c)} x={220 + i * 340} y={330} lt={lt} at={at + 0.15} tone="gold" size={28} /></div>; })}
        <Chip text="Peas" x={160} y={450} lt={lt} at={cPeas} size={26} />
        <Chip text="Lentils" x={420} y={450} lt={lt} at={cLent} size={26} />
        <Chip text="LATER" x={1080} y={30} lt={lt} at={cLater} size={22} />
        {[["rice", cRice], ["millets", cMil], ["pulses", cPulses]].map(([c, at], i) => <React.Fragment key={c}>
          <Pic slot={"crop_" + c} label={c} x={760 + i * 220} y={80} w={200} h={200} lt={lt} at={at} fx="pop" />
          <Chip text={cap(c)} x={860 + i * 220} y={250} lt={lt} at={at + 0.15} size={24} /></React.Fragment>)}
        {[["ragi", cRagi], ["jowar", cJowar], ["bajra", cBajra]].map(([c, at], i) => <Chip key={c} text={c} x={1080} y={330 + i * 46} lt={lt} at={at} size={22} />)}
        <IndiaMap x={720} y={500} s={0.95} lt={lt} at={cIndia} dotAt={cMehr} />
        <Card x={60} y={560} w={600} h={210} lt={lt} at={cIndia} pad={26}>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 22, letterSpacing: "0.14em", color: SK.gold }}>RIGHT HERE</div>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 40, color: SK.white, marginTop: 6, opacity: out3(lt, cMehr, 0.5) }}>Mehrgarh</div>
          <div style={{ fontFamily: SANS, fontSize: 28, color: SK.white, marginTop: 6, opacity: out3(lt, c9000, 0.5) }}>wheat and barley · about <span style={{ color: SK.gold, fontWeight: 700 }}>9,000 years ago</span></div>
        </Card>
        <Dyk lt={lt} at={cDyk} n={2} />
      </Scene>
    );
  };
}
function B3(ctx) {
  return ({ localTime: lt, duration }) => {
    const cAte = [W("b3", "ate", 0), W("b3", "ate", 1), W("b3", "ate", 2)], cLast = W("b3", "last"), cYum = W("b3", "yum"), cRains = W("b3", "rains"), cSow = W("b3", "sow"),
      cEmpty = W("b3", "empty"), cNoSeeds = W("b3", "no", 0), cWithout = S("b3", 4), cNoCrop = W("b3", "no", 1);
    let eaten = 0; cAte.forEach((a) => { if (lt >= a) eaten++; }); if (lt >= cLast) eaten = 4;
    const fill = [1, 0.7, 0.4, 0.15, 0][eaten];
    const months = clamp((lt - cRains) / Math.max(0.5, cSow - cRains), 0, 1), month = Math.min(6, 1 + Math.floor(months * 6));
    const shake = windowOp(lt, cEmpty, cEmpty + 0.7, 0.1);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[3]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(3, ctx, [L("Harvest time: the family ate… and ate… and ate", S("b3", 0)), L("Months pass → the rains come → time to sow", cRains), L("The pot is EMPTY!", cEmpty, "big"),
          L("No seeds = no next crop", cWithout, "think")])}>
        <Pic slot="family_eating" label="The family eats every last grain" x={40} y={60} w={760} h={540} lt={lt} at={0} out={cEmpty} fx="zoom" />
        <Chip text="Harvest time!" x={420} y={75} lt={lt} at={S("b3", 0)} out={cRains} tone="gold" size={30} />
        {cAte.map((a, i) => <Chip key={i} text="ate…" x={200 + i * 200} y={540} lt={lt} at={a} out={cRains} size={28} />)}
        <Chip text="Yum!" x={700} y={540} lt={lt} at={cYum} out={cRains} tone="gold" size={30} />
        {/* the pot: full → emptied as they eat */}
        <SeedPot cx={1120} cy={360} s={1.0} lt={lt} at={0.2} fill={fill} shake={shake} />
        <Chip text="the seed pot" x={1120} y={530} lt={lt} at={0.6} out={cEmpty} size={24} />
        {/* calendar flipping months */}
        <div style={{ position: "absolute", left: 300, top: 620, width: 240, height: 170, borderRadius: 18, background: SK.cream, opacity: windowOp(lt, cRains, cEmpty, 0.4), overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }}>
          <div style={{ background: "#B3261E", height: 44, fontFamily: SANS, fontWeight: 700, fontSize: 22, color: SK.white, textAlign: "center", lineHeight: "44px", letterSpacing: "0.1em" }}>MONTH</div>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 86, color: SK.ink, textAlign: "center", lineHeight: "126px" }}>{month}</div>
        </div>
        <Chip text="The rains came again…" x={760} y={640} lt={lt} at={cRains} out={cEmpty} size={28} />
        <Chip text="…time to sow!" x={760} y={720} lt={lt} at={cSow} out={cEmpty} tone="gold" size={28} />
        <Pic slot="empty_pot" label="The pot is empty" x={40} y={60} w={760} h={540} lt={lt} at={cEmpty} fx="pop" dur={0.4} />
        <div style={{ position: "absolute", left: 40, top: 60, width: 760, height: 540, borderRadius: 18, background: "rgba(180,30,20,0.5)", opacity: windowOp(lt, cEmpty, cEmpty + 0.5, 0.15), pointerEvents: "none" }} />
        <Badge text="EMPTY!" x={290} y={280} lt={lt} at={cEmpty} size={64} />
        <Tag text="No seeds left to sow!" x={420} y={620} lt={lt} at={cNoSeeds} size={30} />
        <Big x={860} y={620} w={540} lt={lt} at={cWithout} size={46} color={SK.gold}>Without seeds…</Big>
        <Big x={860} y={700} w={540} lt={lt} at={cNoCrop} size={60}>there is NO next crop.</Big>
      </Scene>
    );
  };
}
function B4(ctx) {
  return ({ localTime: lt, duration }) => {
    const cNot = W("b4", "not"), cBroken = W("b4", "broken"), cTiny = W("b4", "tiny"), cInsects = W("b4", "insects"), cNever = W("b4", "never"), cTrick = W("b4", "trick"),
      cBest = W("b4", "best"), cTall = W("b4", "tallest"), cHealth = W("b4", "healthiest"), cBig = W("b4", "biggest"), cTheir = W("b4", "their"), cDyk = cTheir + 1.3;
    const grow = out3(lt, 0.3, 1.5), badOp = 1 - reveal(lt, cTrick, 0.5);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[4]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(4, ctx, [L("Another surprise: not every seed grew", cNot), L("broken · tiny and dry · eaten by insects → no healthy plant", cBroken), L("THE CLEVER TRICK", cTrick, "head"),
          L("Choose the BEST plants: tallest, healthiest, biggest grains", cBest), L("Keep THEIR seeds", cTheir, "big"), L(DYK[4], cDyk, "think")], { max: 7 })}>
        <div style={{ position: "absolute", inset: 0, opacity: badOp }}>
          {/* split screen: strong plants grow on the left, weak ones droop on the right */}
          <Pic slot="plants_strong_weak" label="Strong plant beside thin, weak plants" x={40} y={60} w={660} h={460} lt={lt} at={0} fx="zoom" />
          <SVG op={out3(lt, 0.4, 0.6)}>
            <rect x={740} y={60} width={660} height={460} rx={18} fill="#0B2E22" />
            <rect x={740} y={420} width={660} height={100} fill={SK.soil} />
            <line x1={1070} y1={80} x2={1070} y2={500} stroke="rgba(255,255,255,0.25)" strokeWidth={4} strokeDasharray="12 12" />
            {[820, 900, 980].map((x, i) => <Plant key={x} x={x} y={420} s={1.1} grow={grow} heavy={i === 1} />)}
            {[1140, 1220, 1300].map((x, i) => <Plant key={x} x={x} y={420} s={0.7} grow={grow * (0.5 + 0.15 * i)} weak />)}
            <T x={905} y={110} size={26} bold color={SK.leaf}>grew strong</T>
            <T x={1235} y={110} size={26} bold color="#E8A0A0">thin, weak… or nothing</T>
          </SVG>
          <Pic slot="seeds_good_bad" label="Fat shiny seeds beside broken, shrivelled, insect-eaten seeds" x={40} y={550} w={660} h={300} lt={lt} at={cBroken} fx="zoom" />
          {[["broken", cBroken, 830], ["tiny and dry", cTiny, 1040], ["eaten by insects", cInsects, 1260]].map(([t, at, x]) => <Tag key={t} text={"✗ " + t} x={x} y={580} lt={lt} at={at} size={24} />)}
          <Chip text="They never became healthy plants" x={1070} y={680} lt={lt} at={cNever} size={28} />
        </div>
        <Pic slot="seed_choose" label="The best plant, marked for seed" x={40} y={60} w={660} h={560} lt={lt} at={cTrick} fx="zoom" />
        <Badge text="THE CLEVER TRICK" x={740} y={80} lt={lt} at={cTrick} size={32} />
        <Lines x={740} y={170} w={640} lt={lt} lines={[{ text: "Choose the BEST plants…", at: cBest, serif: true, bold: true, size: 44, color: SK.gold },
          { text: "✓ the tallest", at: cTall, size: 34 }, { text: "✓ the healthiest", at: cHealth, size: 34 }, { text: "✓ with the biggest grains", at: cBig, size: 34 }]} />
        <Chip text="…and keep THEIR seeds!" x={1070} y={470} lt={lt} at={cTheir} tone="gold" size={34} />
        <SeedPot cx={1070} cy={700} s={0.55} lt={lt} at={cTheir} fill={1} op={1 - reveal(lt, cDyk, 0.4)} />
        <Dyk lt={lt} at={cDyk} n={4} />
      </Scene>
    );
  };
}
function B5(ctx) {
  return ({ localTime: lt, duration }) => {
    const q = W("b5", "two"), at = stopAt("b5", 1);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[5]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(5, ctx, [L("Tell your partner:", S("b5", 0)), L("TWO reasons why farmers stopped eating ALL their grain", q), L("Think it over now.", at, "think")])}>
        <PauseCard lt={lt} at={at} hold={stopFor("b5")[2] - 0.2} heading="Have you understood?" n={1} items={[{ text: "Why did farmers stop eating ALL their grain? Give TWO reasons.", at: q }]}>
          <QBoxes lt={lt} at={q} n={2} w={420} />
        </PauseCard>
      </Scene>
    );
  };
}
function B6(ctx) {
  const steps = [["after", "Harvest", "harvest"], ["seed_choose", "Select", "keep"], ["sun_drying", "Dry", "dry"], ["seed_store", "Store", "store"], ["seed_sow", "Sow", "sow"]];
  return ({ localTime: lt, duration }) => {
    const ats = steps.map((s) => W("b6", s[2])), cRound = W("b6", "round"), cFam = W("b6", "families"), cHomes = W("b6", "homes"), cBank = W("b6", "bank"), cDyk = cBank + 1.2;
    const cx = 420, cy = 470, R = 290, spin = windowOp(lt, cRound, cFam + 1.0, 0.5);
    const pos = (i) => { const a = -Math.PI / 2 + i * (2 * Math.PI / 5); return [cx + R * Math.cos(a), cy + R * Math.sin(a)]; };
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[6]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(6, ctx, [L("A NEW pattern of life", S("b6", 0), "head"), L("harvest → select → dry → store → sow", ats[0]), L("Round and round, year after year", cRound),
          L("Families stayed near their fields: homes and storerooms", cFam), L("A pot of seeds = the first SEED BANK", cBank, "big"), L(DYK[6], cDyk, "think")], { max: 7 })}>
        <SVG op={1}>
          <circle cx={cx} cy={cy} r={R} stroke="rgba(255,255,255,0.18)" strokeWidth={6} fill="none" />
          <g transform={`rotate(${lt * 40} ${cx} ${cy})`} opacity={spin}>
            <circle cx={cx} cy={cy} r={R - 110} stroke={SK.gold} strokeWidth={8} fill="none" strokeDasharray="60 36" />
          </g>
          {steps.map((s, i) => { const [x1, y1] = pos(i), [x2, y2] = pos((i + 1) % 5), mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len;
            return <Arr key={i} x1={mx - ux * 40} y1={my - uy * 40} x2={mx + ux * 40} y2={my + uy * 40} lt={lt} at={i < 4 ? ats[i + 1] - 0.1 : cRound} sw={5} />; })}
        </SVG>
        {steps.map(([slot, lab], i) => { const [x, y] = pos(i); return <Node key={slot} slot={slot} label={lab} x={x} y={y} r={64} lt={lt} at={ats[i]} size={22} />; })}
        <T x={cx} y={cy - 10} size={34} bold serif color={SK.gold} op={out3(lt, cRound, 0.6)}>year after year</T>
        <Pic slot="village_store" label="Homes and storerooms near the fields" x={800} y={60} w={600} h={400} lt={lt} at={cFam} fx="zoom" />
        <Chip text="homes · storerooms · fields" x={1100} y={420} lt={lt} at={cHomes} size={24} />
        <SeedPot cx={1100} cy={640} s={0.6} lt={lt} at={cBank - 0.3} fill={1} glow={out3(lt, cBank, 1.0)} op={1 - reveal(lt, cDyk, 0.4)} />
        <Badge text="THE FIRST SEED BANK" x={880} y={760} lt={lt} at={cBank} size={34} op={1 - reveal(lt, cDyk, 0.4)} />
        <Dyk lt={lt} at={cDyk} n={6} />
      </Scene>
    );
  };
}
function B7(ctx) {
  const villains = [["seeds_mould", "DAMP – rot, sprout too early", "damp"], ["weevils", "INSECTS – weevils eat from inside", "insects"], ["rat_grain", "RATS", "rats"]];
  const heroes = [["sun_drying", "Sun-drying", "sun"], ["kothi_bin", "Clay pots & mud bins", "clay"], ["neem_ash", "Neem leaves & ash", "neem"], ["maize_smoke", "Smoke from the fire", "maize"]];
  return ({ localTime: lt, duration }) => {
    const cEnemies = W("b7", "enemies"), va = villains.map((v) => W("b7", v[2])), cProt = W("b7", "protectors"), ha = heroes.map((h) => W("b7", h[2])), cAsh = W("b7", "ash"), cSafe = W("b7", "safe"), cDyk = cSafe + 0.6;
    const villainOp = 1 - 0.55 * reveal(lt, cProt, 0.6);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[7]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(7, ctx, [L("ENEMIES of saved seeds", cEnemies, "head"), L("damp · insects · rats", va[0]), L("SEED PROTECTORS", cProt, "head"), L("sun-drying · clay pots & mud bins · neem · ash · smoke", ha[0]),
          L(DYK[7], cDyk, "think")])}>
        <div style={{ position: "absolute", inset: 0, opacity: villainOp }}>
          <Tag text="ENEMIES!" x={720} y={66} lt={lt} at={cEnemies} out={va[0]} size={44} />
          {villains.map(([s, lab], i) => <React.Fragment key={s}>
            <Pic slot={s} label={lab} x={40 + i * 465} y={60} w={430} h={300} lt={lt} at={va[i]} fx="pop" dur={0.4} dim={0.12} />
            <Tag text={lab.split(" – ")[0]} x={255 + i * 465} y={74} lt={lt} at={va[i]} size={26} />
            <Chip text={lab.includes(" – ") ? lab.split(" – ")[1] : "hungry!"} x={255 + i * 465} y={372} lt={lt} at={va[i] + 0.2} size={22} />
          </React.Fragment>)}
        </div>
        <Badge text="SEED PROTECTORS!" x={520} y={430} lt={lt} at={cProt} size={40} op={1 - reveal(lt, ha[0], 0.4)} />
        {heroes.map(([s, lab], i) => <React.Fragment key={s}>
          <Pic slot={s} label={lab} x={40 + i * 345} y={440} w={325} h={300} lt={lt} at={ha[i]} fx="pop" />
          <Chip text={lab} x={202 + i * 345} y={752} lt={lt} at={ha[i] + 0.15} tone="gold" size={22} />
        </React.Fragment>)}
        <Chip text="+ ASH" x={1070} y={455} lt={lt} at={cAsh} size={24} />
        <Dyk lt={lt} at={cDyk} n={7} />
      </Scene>
    );
  };
}
function B8(ctx) {
  const villages = [["village_hill", "Hill village – its own millet"], ["village_coast", "Coast village – its own rice"], ["village_desert", "Desert village – its own bajra"]];
  return ({ localTime: lt, duration }) => {
    const cGrand = W("b8", "grandparents"), cPar = W("b8", "parents"), cChild = W("b8", "children"), cHund = W("b8", "hundreds"), cVill = W("b8", "village"), cOwn = W("b8", "own", 1),
      cNative = W("b8", "native"), cDesi = W("b8", "desi"), cSave = W("b8", "save"), cAgain = W("b8", "again"), cEvery = W("b8", "every"), cDyk = cEvery + 1.2;
    const handOp = 1 - reveal(lt, cVill, 0.5);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[8]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(8, ctx, [L("grandparents → parents → children, for HUNDREDS of years", cGrand), L("Each village: its own seeds, for its own soil, rain and weather", cVill),
          L("NATIVE (DESI) SEEDS", cNative, "head"), L("saved by farmers · suited to local weather · sow again every year", cSave), L(DYK[8], cDyk, "think")])}>
        <div style={{ position: "absolute", inset: 0, opacity: handOp }}>
          <Pic slot="handover" label="Grandmother hands the seed pot to her daughter" x={40} y={60} w={760} h={560} lt={lt} at={0} fx="zoom" />
          <SVG op={1}>{[0, 1].map((i) => <Arr key={i} x1={1040 + 90} y1={200 + i * 180} x2={1040 + 90} y2={200 + (i + 1) * 180 - 90} lt={lt} at={[cPar, cChild][i] - 0.1} />)}</SVG>
          {[["grandparents", cGrand], ["parents", cPar], ["children", cChild]].map(([t, at], i) => <React.Fragment key={t}>
            <SeedPot cx={1130} cy={150 + i * 180} s={0.28} lt={lt} at={at} fill={1} lid />
            <Chip text={cap(t)} x={1130} y={200 + i * 180} lt={lt} at={at + 0.1} size={24} /></React.Fragment>)}
          <Chip text="for HUNDREDS of years" x={1130} y={720} lt={lt} at={cHund} tone="gold" size={30} />
          <Chip text="passed down…" x={420} y={640} lt={lt} at={cGrand} size={26} />
        </div>
        {villages.map(([s, lab], i) => <React.Fragment key={s}>
          <Pic slot={s} label={lab} x={40 + i * 465} y={60} w={430} h={300} lt={lt} at={cVill + i * 0.25} fx="pop" />
          <Chip text={lab} x={255 + i * 465} y={372} lt={lt} at={cVill + 0.2 + i * 0.25} size={21} tone={i === 1 ? "gold" : "cream"} />
        </React.Fragment>)}
        <Chip text="suited to its OWN soil, rain and weather" x={720} y={430} lt={lt} at={cOwn} tone="gold" size={28} />
        <Pic slot="native_seeds" label="Native seeds of many colours and shapes" x={40} y={500} w={620} h={310} lt={lt} at={cNative} fx="zoom" />
        <Card x={700} y={500} w={700} h={310} lt={lt} at={cNative} pad={28}>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 44, color: SK.gold }}>NATIVE <span style={{ color: SK.white, fontSize: 30 }}>or</span> DESI <span style={{ color: SK.white, fontSize: 30 }}>seeds</span></div>
          <div style={{ fontFamily: SANS, fontSize: 28, color: SK.white, marginTop: 14, opacity: out3(lt, cSave, 0.5) }}>✓ saved by farmers</div>
          <div style={{ fontFamily: SANS, fontSize: 28, color: SK.white, marginTop: 8, opacity: out3(lt, cDesi, 0.5) }}>✓ suited to local weather</div>
          <div style={{ fontFamily: SANS, fontSize: 28, color: SK.white, marginTop: 8, opacity: out3(lt, cAgain, 0.5) }}>✓ sow again… and again… <span style={{ color: SK.gold, fontWeight: 700, opacity: out3(lt, cEvery, 0.4) }}>every year</span></div>
        </Card>
        <Dyk lt={lt} at={cDyk} n={8} />
      </Scene>
    );
  };
}
function B9(ctx) {
  return ({ localTime: lt, duration }) => {
    const q = W("b9", "three"), at = stopAt("b9", 1);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[9]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(9, ctx, [L("Pause and name THREE ways farmers kept their saved seeds safe", q), L("Think it over now.", at, "think")])}>
        <PauseCard lt={lt} at={at} hold={stopFor("b9")[2] - 0.2} heading="Do you get it?" n={2} items={[{ text: "Name THREE ways farmers kept their saved seeds safe.", at: q }]}>
          <QBoxes lt={lt} at={q} n={3} w={340} />
        </PauseCard>
      </Scene>
    );
  };
}
// Rows of little people that fill up: the growing population.
function Crowd({ x, y, lt, at, until, cols = 14, rows = 4 }) {
  const p = drive(lt, at, until); const n = Math.round(p * cols * rows); if (n <= 0) return null;
  return (
    <SVG op={1}>
      {Array.from({ length: n }, (_, i) => { const c = i % cols, r = Math.floor(i / cols); return <g key={i} transform={`translate(${x + c * 44} ${y + r * 60})`} fill={r % 2 ? SK.cream : SK.gold}>
        <circle cx={0} cy={0} r={10} /><path d="M-14 46 L-14 22 Q 0 10 14 22 L14 46 Z" /></g>; })}
    </SVG>
  );
}
function B10(ctx) {
  return ({ localTime: lt, duration }) => {
    const cGrew = W("b10", "grew"), cGrew2 = W("b10", "grew", 1), cMuch = W("b10", "much"), cSci = W("b10", "scientists"), cTwo = W("b10", "two"), cCrossed = W("b10", "crossed"),
      cHybrid = W("b10", "hybrid"), cBig = W("b10", "big"), cYield = W("b10", "yield"), cEvenly = W("b10", "evenly"), cPests = W("b10", "pests"), c1960 = W("b10", "1960s"),
      cGreen = W("b10", "green"), cDyk = W("b10", "revolution") + 1.2;
    const peopleOp = 1 - reveal(lt, cSci, 0.5), cross = drive(lt, cCrossed, cHybrid + 0.4);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[10]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(10, ctx, [L("More and more people → MUCH more food from the same land", cGrew), L("Scientists crossed two different parent plants", cSci), L("HYBRID SEED = two parent plants crossed", cHybrid, "big"),
          L("High yield · even crop · some resist certain pests", cBig), L("1960s: the GREEN REVOLUTION in India", c1960), L(DYK[10], cDyk, "think")], { max: 7 })}>
        <div style={{ position: "absolute", inset: 0, opacity: peopleOp }}>
          <Pic slot="city_crowd" label="More and more people to feed" x={40} y={60} w={660} h={440} lt={lt} at={0} fx="zoom" />
          <Crowd x={790} y={110} lt={lt} at={cGrew - 1.0} until={cGrew2 + 0.6} />
          <Chip text="more and more people…" x={1070} y={370} lt={lt} at={cGrew} size={26} />
          <Chip text="MUCH more food from the same land" x={720} y={530} lt={lt} at={cMuch} tone="gold" size={30} />
        </div>
        <Pic slot="scientist_cross" label="A scientist crosses two parent plants" x={740} y={60} w={660} h={440} lt={lt} at={cSci} out={c1960} fx="zoom" />
        <Pic slot="green_rev" label="1960s India: golden wheat fields" x={740} y={60} w={660} h={440} lt={lt} at={c1960} fx="pan" />
        <Badge text="GREEN REVOLUTION · 1960s" x={790} y={420} lt={lt} at={cGreen} size={32} />
        {/* drawn cross: Parent A + Parent B → HYBRID */}
        <Card x={40} y={60} w={660} h={440} lt={lt} at={cSci} pad={0} />
        <SVG op={out3(lt, cSci, 0.6)}>
          <rect x={60} y={400} width={620} height={80} rx={10} fill={SK.soil} />
          <g opacity={out3(lt, cTwo, 0.5)}><Plant x={lerp(200, 300, cross)} y={400} s={0.9} color="#6FBF6E" /><Plant x={lerp(380, 300, cross)} y={400} s={0.9} color="#4E9A5E" /></g>
          <g opacity={out3(lt, cHybrid, 0.6)}><Plant x={560} y={400} s={1.15} heavy /></g>
          <Arrow x1={400} y1={300} x2={470} y2={300} color={SK.gold} sw={6} op={out3(lt, cHybrid - 0.2, 0.5)} />
          <T x={200} y={140} size={24} bold color={SK.white} op={out3(lt, cTwo, 0.5) * (1 - cross)}>Parent A</T>
          <T x={380} y={140} size={24} bold color={SK.white} op={out3(lt, cTwo, 0.5) * (1 - cross)}>Parent B</T>
          <T x={300} y={140} size={28} bold color={SK.gold} op={out3(lt, cCrossed, 0.5) * cross}>crossed ✕</T>
          <T x={560} y={140} size={30} bold serif color={SK.gold} op={out3(lt, cHybrid, 0.5)}>HYBRID</T>
        </SVG>
        <Card x={40} y={530} w={660} h={270} lt={lt} at={cBig - 0.2} pad={26}>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 22, letterSpacing: "0.14em", color: SK.gold }}>HYBRID SEEDS</div>
          <div style={{ fontFamily: SANS, fontSize: 30, color: SK.white, marginTop: 10, opacity: out3(lt, cBig, 0.5) }}>✓ BIG harvest – <span style={{ color: SK.gold, fontWeight: 700, opacity: out3(lt, cYield, 0.4) }}>HIGH YIELD</span></div>
          <div style={{ fontFamily: SANS, fontSize: 30, color: SK.white, marginTop: 8, opacity: out3(lt, cEvenly, 0.5) }}>✓ plants grow evenly</div>
          <div style={{ fontFamily: SANS, fontSize: 30, color: SK.white, marginTop: 8, opacity: out3(lt, cPests, 0.5) }}>✓ some fight certain pests and diseases</div>
        </Card>
        <Chip text="India grew much more wheat and rice" x={1070} y={530} lt={lt} at={c1960 + 0.3} out={cDyk} tone="gold" size={26} />
        <Dyk lt={lt} at={cDyk} n={10} />
      </Scene>
    );
  };
}
function B11(ctx) {
  // rows: [icon glyph, native text, hybrid text, native cue word, hybrid cue word]
  const rows = [
    [<g><path d="M-18 -14 C -26 -4, -24 18, -14 22 L 14 22 C 24 18, 26 -4, 18 -14 Z" fill="#B9703F" /><ellipse cx={0} cy={-14} rx={19} ry={6} fill="#7E4A28" /></g>, "saved by the farmer", "BUY new seed every season", "saved", "buy"],
    [<g><path d="M-22 6 a 12 12 0 0 1 10 -18 a 14 14 0 0 1 26 2 a 10 10 0 0 1 4 18 Z" fill="#CFE6F5" /><line x1={-10} y1={12} x2={-14} y2={24} stroke="#7FD3F7" strokeWidth={3} /><line x1={2} y1={12} x2={-2} y2={24} stroke="#7FD3F7" strokeWidth={3} /><line x1={14} y1={12} x2={10} y2={24} stroke="#7FD3F7" strokeWidth={3} /></g>, "suited to local weather", "needs MORE care", "suited", "care"],
    [<g><rect x={-18} y={-16} width={36} height={40} rx={5} fill="#C8B27A" stroke="#8A6A48" strokeWidth={3} /><rect x={-10} y={-24} width={20} height={10} rx={3} fill="#8A6A48" /><line x1={-8} y1={0} x2={8} y2={0} stroke="#5C4A3E" strokeWidth={3} /><line x1={-8} y1={10} x2={8} y2={10} stroke="#5C4A3E" strokeWidth={3} /></g>, "LESS water and fertiliser", "MORE fertiliser and water", "less", "more"],
    [<g><path d="M-24 -4 L -18 22 L 18 22 L 24 -4 Z" fill="#B98747" /><path d="M-26 -6 L 26 -6" stroke="#8A6A48" strokeWidth={5} strokeLinecap="round" /><circle cx={-8} cy={-14} r={7} fill="#E3B55C" /><circle cx={6} cy={-18} r={7} fill="#E3B55C" /><circle cx={16} cy={-10} r={6} fill="#E3B55C" /></g>, "smaller harvest", "BIGGER harvest", "smaller", "bigger"],
    [<g><path d="M-18 10 a 18 18 0 1 1 30 10" stroke={SK.gold} strokeWidth={5} fill="none" /><path d="M12 24 L 18 10 L 4 10 Z" fill={SK.gold} /><ellipse cx={-2} cy={0} rx={6} ry={9} fill="#E3B55C" /></g>, "sow again, year after year", "does NOT grow the same next year", "difference", "not"],
  ];
  return ({ localTime: lt, duration }) => {
    const cNat = W("b11", "native"), cHyb = W("b11", "hybrid"), cDiff = W("b11", "difference"), cBoth = W("b11", "both"), cSmart = W("b11", "smart");
    const na = rows.map((r) => W("b11", r[3])), hb = rows.map((r) => W("b11", r[4]));
    hb[1] = W("b11", "more") + 0.4;
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[11]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(11, ctx, [L("NATIVE versus HYBRID", cNat, "head"), L("NATIVE: save & re-sow · suits local weather · less input · smaller harvest", na[0]),
          L("HYBRID: buy every season · high yield · more fertiliser, water & care", hb[3]), L("The big difference: hybrid seeds do not grow the same next year", cDiff, "big"),
          L("Both have a place – the smart farmer knows WHEN to use each", cBoth), L("Think! Which would YOU choose – and why?", cSmart + 1.0, "think")], { max: 7 })}>
        <Card x={40} y={60} w={1360} h={770} lt={lt} at={0} pad={0} />
        {/* column heads */}
        <div style={{ position: "absolute", left: 300, top: 80, width: 520, height: 110, borderRadius: 18, background: "#5C4A3E", opacity: out3(lt, cNat, 0.5), display: "flex", alignItems: "center", gap: 20, padding: "0 20px", boxSizing: "border-box" }}>
          <Pic slot="native_seeds" label="Native seeds" x={0} y={0} w={120} h={80} lt={lt} at={cNat} fx="pop" r={12} style={{ position: "relative" }} />
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 44, color: SK.cream }}>NATIVE</div></div>
        <div style={{ position: "absolute", left: 860, top: 80, width: 520, height: 110, borderRadius: 18, background: SK.gold, opacity: out3(lt, cHyb, 0.5), display: "flex", alignItems: "center", gap: 20, padding: "0 20px", boxSizing: "border-box" }}>
          <Pic slot="hybrid_seeds" label="Hybrid seeds" x={0} y={0} w={120} h={80} lt={lt} at={cHyb} fx="pop" r={12} style={{ position: "relative" }} />
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 44, color: SK.ink }}>HYBRID</div></div>
        <Chip text="versus" x={840} y={115} lt={lt} at={cHyb} size={24} />
        {rows.map(([glyph, nt, ht, , ], i) => { const y = 220 + i * 112, isDiff = i === 4;
          return <React.Fragment key={i}>
            <SVG op={out3(lt, Math.min(na[i], hb[i]), 0.5)}><g transform={`translate(190 ${y + 42})`}><circle r={44} fill="rgba(255,255,255,0.1)" stroke={SK.gold} strokeWidth={3} /><g transform="scale(1.3)">{glyph}</g></g></SVG>
            <div style={{ position: "absolute", left: 300, top: y, width: 520, height: 84, borderRadius: 14, background: "rgba(92,74,62,0.55)", opacity: out3(lt, na[i], 0.5), transform: `translateX(${(1 - out3(lt, na[i], 0.5)) * -30}px)`,
              display: "flex", alignItems: "center", padding: "0 24px", boxSizing: "border-box", fontFamily: SANS, fontWeight: 700, fontSize: 28, color: SK.white }}>{nt}</div>
            <div style={{ position: "absolute", left: 860, top: y, width: 520, height: 84, borderRadius: 14, background: isDiff ? "rgba(179,38,30,0.75)" : "rgba(226,176,76,0.28)", opacity: out3(lt, hb[i], 0.5), transform: `translateX(${(1 - out3(lt, hb[i], 0.5)) * 30}px)`,
              display: "flex", alignItems: "center", padding: "0 24px", boxSizing: "border-box", fontFamily: SANS, fontWeight: 700, fontSize: 28, color: SK.white, boxShadow: isDiff ? `0 0 0 3px ${SK.gold}` : "none" }}>{ht}</div>
          </React.Fragment>; })}
        <Badge text="THE BIG DIFFERENCE" x={880} y={740} lt={lt} at={cDiff} size={26} />
        <Chip text="Both have a place. The smart farmer knows WHEN to use each." x={720} y={850} lt={lt} at={cBoth} tone="gold" size={28} />
      </Scene>
    );
  };
}
function B12(ctx) {
  const reasons = [["FOOD VALUE", "fibre · iron · calcium", "ragi: calcium for strong bones", <g><path d="M-26 -10 a 10 10 0 1 1 12 -12 L 14 -2 a 10 10 0 1 1 12 12 a 10 10 0 1 1 -12 12 L -14 2 a 10 10 0 1 1 -12 -12 Z" fill={SK.cream} /></g>],
    ["CLIMATE", "very little water", "grows in heat and poor soil", <g><circle r={16} fill={SK.gold} />{[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <line key={i} x1={Math.cos(i * 0.785) * 22} y1={Math.sin(i * 0.785) * 22} x2={Math.cos(i * 0.785) * 30} y2={Math.sin(i * 0.785) * 30} stroke={SK.gold} strokeWidth={4} strokeLinecap="round" />)}</g>],
    ["HEALTH", "keeps us full longer", "good for people with diabetes", <g><path d="M0 24 C -30 4 -34 -14 -20 -24 C -10 -30 0 -22 0 -14 C 0 -22 10 -30 20 -24 C 34 -14 30 4 0 24 Z" fill="#E8716B" /></g>]];
  return ({ localTime: lt, duration }) => {
    const cBack = W("b12", "comeback"), cMil = W("b12", "millets"), cThree = W("b12", "three"), ra = [W("b12", "one"), W("b12", "two"), W("b12", "three", 1)],
      cRagi = W("b12", "ragi"), cFood = W("b12", "food"), cUN = W("b12", "united"), c2023 = W("b12", "2023"), cDyk = W("b12", "international") + 1.6;
    const topOp = 1 - 0.0 * reveal(lt, ra[0], 0.5);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[12]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(12, ctx, [L("MILLETS ARE BACK!", cMil, "head"), L("1 Food value · 2 Climate-ready · 3 Health", cThree), L("2023 – International Year of Millets", c2023, "big"), L(DYK[12], cDyk, "think")])}>
        <div style={{ position: "absolute", inset: 0, opacity: topOp }}>
          <Pic slot="millet_sun" label="Millets thrive under a hot sun" x={40} y={60} w={660} h={440} lt={lt} at={0} fx="pan" />
          <Pic slot="cracked_field" label="…beside a dry, thirsty crop" x={740} y={60} w={660} h={440} lt={lt} at={0.3} out={cFood} fx="zoom" dim={0.2} />
          <Chip text="a thirsty crop dries out…" x={1070} y={450} lt={lt} at={0.6} out={cFood} size={24} />
          <Chip text="…but millets thrive!" x={370} y={450} lt={lt} at={cBack} tone="gold" size={28} />
          <Badge text="MILLETS ARE BACK!" x={80} y={90} lt={lt} at={cMil} size={40} />
          {[["millet_ragi", "Ragi"], ["millet_jowar", "Jowar"], ["millet_bajra", "Bajra"]].map(([s, lab], i) => <Node key={s} slot={s} label={lab} x={560 + i * 0} y={0} r={0} lt={lt} at={1e9} />)}
          <Pic slot="millet_plate" label="Ragi roti, jowar bhakri, bajra khichdi" x={740} y={60} w={660} h={440} lt={lt} at={cFood} fx="zoom" />
          <Chip text="ragi roti · jowar bhakri · bajra khichdi" x={1070} y={450} lt={lt} at={cFood + 0.3} tone="gold" size={24} />
        </div>
        <Chip text="Why? THREE reasons." x={720} y={520} lt={lt} at={cThree} out={ra[0]} size={30} />
        {reasons.map(([head, l1, l2, glyph], i) => { const o = pop(lt, ra[i], 0.6); if (o <= 0) return null;
          return <div key={head} style={{ position: "absolute", left: 40 + i * 465, top: 540, width: 430, height: 260, borderRadius: 22, background: SK.cream, opacity: o, transform: `scale(${0.85 + 0.15 * o})`, padding: "20px 26px", boxSizing: "border-box", boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <svg width="76" height="76" viewBox="-38 -38 76 76"><circle r={36} fill={SK.bg1} />{glyph}</svg>
              <div><div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 20, letterSpacing: "0.12em", color: SK.goldDeep }}>{i + 1}</div><div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 36, color: SK.ink, lineHeight: 1 }}>{head}</div></div></div>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 26, color: SK.ink, marginTop: 18 }}>{l1}</div>
            <div style={{ fontFamily: SANS, fontSize: 24, color: SK.inkDim, marginTop: 6, opacity: i === 0 ? out3(lt, cRagi, 0.5) : 1 }}>{l2}</div>
          </div>; })}
        <div style={{ position: "absolute", left: 160, top: 170, opacity: pop(lt, c2023, 0.7), transform: `rotate(-6deg) scale(${0.8 + 0.2 * pop(lt, c2023, 0.7)})`, background: SK.gold, color: SK.ink, borderRadius: 999, padding: "16px 34px", boxShadow: "0 8px 24px rgba(0,0,0,0.4)", textAlign: "center" }}>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 56, lineHeight: 1 }}>2023</div>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 20, letterSpacing: "0.08em", marginTop: 4 }}>INTERNATIONAL YEAR OF MILLETS</div>
          <div style={{ fontFamily: SANS, fontSize: 18, marginTop: 2, opacity: out3(lt, cUN, 0.5) }}>United Nations · proposed by India</div>
        </div>
        <Dyk lt={lt} at={cDyk} n={12} />
      </Scene>
    );
  };
}
function B13(ctx) {
  return ({ localTime: lt, duration }) => {
    const cSci = W("b13", "scientists"), cDate = W("b13", "datepalm"), c2000 = W("b13", "2000"), cSprout = W("b13", "sprouted"), cWait = S("b13", 3), cSafe = W("b13", "safe");
    const yrs = Math.round(2000 * drive(lt, c2000 - 0.2, c2000 + 1.4));
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[13]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(13, ctx, [L("A date-palm seed about 2,000 years old…", cDate), L("…planted by scientists – and it SPROUTED!", cSprout, "big"), L("Seeds can wait a very long time, if kept safe", cWait),
          L("Source: Judean date palm 'Methuselah', seed from Masada, germinated 2005", cWait + 0.8, "source")])}>
        <Card x={50} y={50} w={1340} h={905} lt={lt} at={0} pad={0} />
        <Badge x={92} y={82} lt={lt} at={S("b13", 0)} text="FUN FACT" />
        <Pic slot="date_jar" label="An ancient clay jar with date seeds" x={92} y={172} w={620} h={440} lt={lt} at={cSci} out={cSprout} fx="zoom" />
        <Pic slot="date_sprout" label="The ancient seed sprouts" x={92} y={172} w={620} h={440} lt={lt} at={cSprout} fx="zoom" kenDur={20} />
        <div style={{ position: "absolute", left: 92, top: 640, width: 620, textAlign: "center", opacity: windowOp(lt, c2000 - 0.2, cSprout + 0.4, 0.4), fontFamily: SERIF, fontWeight: 700, fontSize: 96, color: SK.gold, lineHeight: 1 }}>{yrs.toLocaleString("en-IN")}<span style={{ fontSize: 40, color: SK.white }}> years old</span></div>
        <Lines x={760} y={180} w={580} lt={lt} lines={[{ text: "The seed that waited", at: S("b13", 0), serif: true, bold: true, size: 44, color: SK.gold },
          { text: "Scientists once planted a date-palm seed that was about 2,000 YEARS old…", at: cSci },
          { text: "…and it SPROUTED!", at: cSprout, serif: true, bold: true, size: 44, color: SK.leaf },
          { text: "Seeds can wait a very, very long time – if they are kept safe.", at: cWait }]} size={30} />
        <SeedPot cx={1050} cy={760} s={0.5} lt={lt} at={cSafe} fill={1} lid glow={out3(lt, cSafe, 1.0)} />
        <div style={{ position: "absolute", left: 92, top: 880, width: 1260, opacity: out3(lt, cWait + 0.8, 0.6), fontFamily: SANS, fontSize: 21, color: SK.dim }}>
          Source: a Judean date-palm seed from Masada (Israel), about 2,000 years old, germinated in 2005 – the palm was named "Methuselah"</div>
      </Scene>
    );
  };
}
// Thermometer whose column drops to −18 °C.
function Thermo({ x, y, lt, at }) {
  const o = out3(lt, at, 0.6); if (o <= 0) return null;
  const p = drive(lt, at, at + 1.6), lvl = lerp(40, 150, p);
  return (
    <SVG op={o}>
      <g transform={`translate(${x} ${y})`}>
        <rect x={-14} y={0} width={28} height={180} rx={14} fill="rgba(255,255,255,0.15)" stroke={SK.cream} strokeWidth={3} />
        <rect x={-7} y={lvl} width={14} height={180 - lvl + 10} rx={7} fill="#7FD3F7" />
        <circle cx={0} cy={196} r={24} fill="#7FD3F7" stroke={SK.cream} strokeWidth={3} />
        {[0, 1, 2, 3].map((i) => <line key={i} x1={16} y1={30 + i * 40} x2={28} y2={30 + i * 40} stroke={SK.cream} strokeWidth={3} />)}
        <text x={-30} y={lvl + 12} textAnchor="end" fontFamily={SERIF} fontWeight="700" fontSize="40" fill="#7FD3F7">{Math.round(lerp(10, -18, p))} °C</text>
      </g>
    </SVG>
  );
}
function B14(ctx) {
  return ({ localTime: lt, duration }) => {
    const cWorld = W("b14", "world"), cNorth = W("b14", "north"), cSval = W("b14", "svalbard"), c1300 = W("b14", "1300"), cInside = W("b14", "inside"), c2008 = W("b14", "2008"),
      cMinus = W("b14", "minus"), cPower = W("b14", "power"), cMillion = W("b14", "million"), cBackup = W("b14", "backup"), cDoom = W("b14", "call"), cHelped = S("b14", 7),
      c2015 = W("b14", "2015"), cOut = W("b14", "out"), cIndia = W("b14", "india"), cDelhi = W("b14", "delhi");
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[14]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(14, ctx, [L("SVALBARD GLOBAL SEED VAULT", cSval, "head"), L("Norway · inside a mountain · 1,300 km from the North Pole", c1300), L("Opened 2008 · kept at −18 °C", c2008),
          L("Frozen ground keeps it cold even if the power fails", cPower), L("Over 1 million seed samples – a back-up copy of the world's crops", cMillion), L("The 'Doomsday Vault'", cDoom, "big"),
          L("2015: seeds taken OUT to replace Syria's lost seed bank", c2015), L("India: National Gene Bank, New Delhi", cIndia)], { max: 9 })}>
        <Badge x={60} y={70} lt={lt} at={S("b14", 0)} text="FUN FACT" />
        <Chip text="the most amazing seed bank in the WORLD" x={700} y={82} lt={lt} at={cWorld} out={cSval} tone="gold" size={28} />
        <Pic slot="svalbard_entrance" label="The vault entrance on a snowy mountainside" x={40} y={150} w={880} h={520} lt={lt} at={cNorth} out={cInside} fx="zoom" zoom={1.2} kenDur={12} />
        <Pic slot="vault_tunnel" label="The long tunnel into the mountain" x={40} y={150} w={880} h={520} lt={lt} at={cInside} out={cMillion} fx="zoom" zoom={1.25} kenDur={16} />
        <Pic slot="svalbard_inside" label="Icy halls with shelves of sealed boxes" x={40} y={150} w={880} h={520} lt={lt} at={cMillion} out={c2015} fx="pan" />
        <Pic slot="vault_truck" label="Boxes leave the vault for Syria's seed bank" x={40} y={150} w={880} h={520} lt={lt} at={c2015} out={cIndia} fx="zoom" />
        <Pic slot="national_bank" label="India's National Gene Bank, New Delhi" x={40} y={150} w={880} h={520} lt={lt} at={cIndia} fx="zoom" />
        <Chip text="SVALBARD · NORWAY" x={480} y={165} lt={lt} at={cSval} out={cInside} tone="gold" size={30} />
        <Chip text="deep INSIDE a mountain" x={480} y={165} lt={lt} at={cInside} out={cMillion} tone="gold" size={30} />
        <Chip text="more than a MILLION seed samples" x={480} y={165} lt={lt} at={cMillion} out={c2015} tone="gold" size={30} />
        <Chip text="2015: seeds OUT – to grow Syria's crops again" x={480} y={165} lt={lt} at={c2015} out={cIndia} tone="gold" size={28} />
        <Chip text="India: National Gene Bank, New Delhi" x={480} y={165} lt={lt} at={cDelhi} tone="gold" size={30} />
        {/* Arctic map: pole + Svalbard */}
        <Card x={960} y={150} w={440} h={300} lt={lt} at={cSval} pad={0}>
          <svg width="440" height="300" viewBox="0 0 440 300" style={{ display: "block" }}>
            <circle cx={220} cy={150} r={120} fill="#CFE6F5" opacity={0.25} stroke={SK.cream} strokeWidth={3} />
            <circle cx={220} cy={150} r={70} fill="#F2F6FB" opacity={0.6} />
            <circle cx={220} cy={150} r={6} fill={SK.ink} /><text x={220} y={132} textAnchor="middle" fontFamily={SANS} fontWeight="700" fontSize="20" fill={SK.white}>North Pole</text>
            <g opacity={pop(lt, cSval, 0.6)}><circle cx={272} cy={212} r={14} fill={SK.gold} stroke={SK.ink} strokeWidth={3} /><text x={296} y={220} fontFamily={SERIF} fontWeight="700" fontSize="26" fill={SK.gold}>Svalbard</text></g>
            <g opacity={out3(lt, c1300, 0.5)}><line x1={220} y1={150} x2={272} y2={212} stroke={SK.gold} strokeWidth={3} strokeDasharray="8 6" /><text x={150} y={200} fontFamily={SANS} fontWeight="700" fontSize="22" fill={SK.white}>≈1,300 km</text></g>
            <text x={220} y={282} textAnchor="middle" fontFamily={SANS} fontSize="20" fill={SK.dim}>Norway · the frozen north</text>
          </svg>
        </Card>
        {/* facts card */}
        <Card x={960} y={480} w={440} h={320} lt={lt} at={c2008 - 0.3} pad={24}>
          <div style={{ width: 250 }}>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 34, color: SK.gold, opacity: out3(lt, c2008, 0.5), whiteSpace: "nowrap" }}>Opened 2008</div>
          <div style={{ fontFamily: SANS, fontSize: 24, color: SK.white, marginTop: 10, opacity: out3(lt, cPower, 0.5) }}>Frozen ground keeps it cold, even if the power fails</div>
          <div style={{ fontFamily: SANS, fontSize: 24, color: SK.white, marginTop: 8, opacity: out3(lt, cBackup, 0.5) }}>A back-up copy of the world's crops</div>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 30, color: SK.gold, marginTop: 10, opacity: out3(lt, cDoom, 0.5) }}>the "Doomsday Vault"</div>
          </div>
        </Card>
        <Thermo x={1350} y={500} lt={lt} at={cMinus} />
        <Chip text="It has already helped…" x={480} y={700} lt={lt} at={cHelped} out={c2015} size={28} />
        <Chip text="seeds taken OUT of Svalbard" x={480} y={700} lt={lt} at={cOut} out={cIndia} tone="gold" size={28} />
        <Chip text="India keeps its own seeds safe too" x={480} y={700} lt={lt} at={cIndia} size={28} />
      </Scene>
    );
  };
}
function B15(ctx) {
  return ({ localTime: lt, duration }) => {
    const q1 = W("b15", "name"), q2 = W("b15", "why"), q3 = W("b15", "one"), q4 = W("b15", "millets"), at = stopAt("b15", 2);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[15]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(15, ctx, [L("1 Three first crops?", q1), L("2 Why save seeds?", q2), L("3 Native vs hybrid – one difference?", q3), L("4 Why millets again?", q4), L("Think it over now.", at, "think")])}>
        <PauseCard lt={lt} at={at} hold={stopFor("b15")[2] - 0.2} heading="Have you understood?" n={3}
          items={[{ text: "Name three first crops.", at: q1 }, { text: "Why do farmers save seeds?", at: q2 }, { text: "Native vs hybrid – one difference?", at: q3 }, { text: "Why are millets important again?", at: q4 }]} />
      </Scene>
    );
  };
}
function B16(ctx) {
  return ({ localTime: lt, duration }) => {
    const cNot = W("b16", "not"), cPromise = W("b16", "promise"), cAsk = S("b16", 2), cSave = W("b16", "save"), cGrains = W("b16", "grains"), cNext = S("b16", 4), cTools = W("b16", "tools");
    const glow = out3(lt, cPromise, 1.0);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[16]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(16, ctx, [L("A seed is not just food", cNot), L("A seed = a PROMISE for next year", cPromise, "big"), L("ASK AT HOME", cAsk, "head"), L("Does anyone in our family save seeds?", cSave),
          L("Which grains do we eat – old ones like millets, or new ones?", cGrains), L("Next time: TOOLS", cNext, "think")], { max: 7 })}>
        <Pic slot="family_pot" label="The family with the seed pot" x={40} y={60} w={760} h={560} lt={lt} at={0} fx="zoom" kenDur={20} />
        <SVG op={glow}>{[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => { const p = ((lt - cPromise) * 0.25 + i * 0.1) % 1, x = 300 + i * 40 + 20 * Math.sin(lt * 1.5 + i), y = 480 - p * 260;
          return <circle key={i} cx={x} cy={y} r={6 - p * 4} fill={SK.gold} opacity={(1 - p) * 0.9} />; })}</SVG>
        <Big x={840} y={90} w={560} lt={lt} at={cNot} size={40}>A seed is not just food.</Big>
        <Big x={840} y={170} w={560} lt={lt} at={cPromise} size={56} color={SK.gold}>It is a PROMISE for next year.</Big>
        <Card x={840} y={400} w={560} h={300} lt={lt} at={cAsk} pad={24}>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 22, letterSpacing: "0.14em", color: SK.gold, marginBottom: 8 }}>ASK AT HOME TONIGHT</div>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 32, lineHeight: 1.25, color: SK.white, opacity: out3(lt, cSave, 0.5) }}>Does anyone in our family save seeds?</div>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 32, lineHeight: 1.25, color: SK.white, marginTop: 14, opacity: out3(lt, cGrains, 0.5) }}>Which grains do we eat – old ones like millets, or new ones?</div>
        </Card>
        <Pic slot="tool_stick" label="Next time: tools" x={40} y={660} w={460} h={250} lt={lt} at={cNext} fx="pop" dim={0.1} />
        <Chip text="Next time… how did the first farmers dig the hard soil?" x={840} y={740} lt={lt} at={cNext} size={24} anchor="left" />
        <Badge text="TOOLS!" x={840} y={810} lt={lt} at={cTools} size={40} />
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
const COLLAGE = [{ slot: "seed_store", x: -60, y: -40, w: 760, h: 520, ph: 0 }, { slot: "svalbard_inside", x: 640, y: -80, w: 760, h: 520, ph: 2 },
  { slot: "native_seeds", x: -80, y: 520, w: 700, h: 560, ph: 4 }, { slot: "millet_ragi", x: 560, y: 560, w: 820, h: 560, ph: 1 }];
function SeedScenes(props = {}) {
  const caps = props.showCaptions === "false" ? false : props.showCaptions !== false;
  const titles = {};
  for (let n = 1; n <= NB; n++) titles[n] = str(props["title" + n + "Text"], TITLES[n]);
  const ctx = { caps, titles, capSize: num(props.captionSize, 34) };
  const B = [B1, B2, B3, B4, B5, B6, B7, B8, B9, B10, B11, B12, B13, B14, B15, B16];
  const beats = B.map((Bn, i) => { const t = BEAT("b" + (i + 1)); return [t.start, t.start + t.dur, Bn]; });
  return (
    <StoryFrame props={props} dur={DUR} persistKey="thinkpro-lp2-the-seed-that-waits" collage={COLLAGE}>
      {beats.map(([s, e, Bn], i) => (
        <Sprite key={i} start={s} end={e}>{Bn(ctx)}</Sprite>
      ))}
      {STOPS.map(([b, i, hold]) => <StopAt key={b} t={BEAT(b).start + stopAt(b, i)} hold={hold - 0.2} />)}
      {["b5", "b9", "b13", "b14", "b15"].map((b) => <ChimeAt key={b} t={BEAT(b).start + S(b, 0, 0)} />)}
      <AudioSync />
    </StoryFrame>
  );
}
window.SeedScenes = SeedScenes;
