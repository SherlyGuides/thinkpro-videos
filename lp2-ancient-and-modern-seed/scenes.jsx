/* global React, window */
// ThinkPro Academy — "LP2 – Ancient and Modern Seed" (Grade 6 Agriculture, Session 2).
// After AG_LP2_Video_Script_Draft1 (23 Oct 2026): 8 narrated beats (the 2 s visual break
// lives in the tail of beat 6) and FIVE presenter stops (TPStory.StopCard / StopAt).
// STORY STYLE (engine/story-kit.jsx). Everything is a pure function of beat-local time.
const { Sprite, Easing } = window;
const { reveal, windowOp, fade } = window.TPMotion;
const { num, str } = window.TPStage;
const { SK, SERIF, SANS, LEFT_W, pop, out3, lerp, drive, photoSrc,
  Pic, Chip, Badge, Big, Card, SVG, Arrow, Ring, T, ChimeAt, Scene, StoryFrame, StopCard, StopAt, Break, Flip } = window.TPStory;

// ---- Timing: EVERYTHING is keyed to the narration (tools/fit_timing.py → timing.js).
const TM = window.TP_TIMING;
if (!TM) console.error("timing.js missing — run: python3 tools/fit_timing.py videos/lp2-ancient-and-modern-seed");
const LEAD = TM ? TM.lead : 1.0;
const DUR = TM ? TM.total : 170;
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
const NB = 8;
const CAPS = {};
if (TM) for (let n = 1; n <= NB; n++) CAPS[n] = capsFor("b" + n);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// ---- Panel copy. Title defaults mirror the DC data-props (titleNText) — keep in sync. ----
const TITLES = { 1: "LP2 – Ancient and Modern Seed", 2: "The first crops", 3: "Saving the best seeds", 4: "Native and hybrid seeds",
  5: "Millets", 6: "Seed banks", 7: "The Svalbard Global Seed Vault", 8: "Seed-saving steps" };
const KICK = "Grade 6 · Agriculture · Session 2";
const panel = (n, ctx, lines, extra = {}) => ({ kicker: n === 7 ? "Do you know?" : KICK, title: ctx.titles[n], lines, ...extra });
const L = (text, at, kind = "item", extra = {}) => ({ text, at, kind, ...extra });

// ---- Presenter stops: [beat, sentence index whose pauseAfter is the hold, hold s, question]
const STOPS = [
  ["b1", 1, 4.0, "Why keep some of this year's best seeds instead of eating them all?"],
  ["b3", 1, 4.0, "Why would a farmer keep the best seeds instead of eating them?"],
  ["b5", 2, 4.0, "Why are millets important again today?"],
  ["b7", 3, 4.0, "Team sort: 8 cards – native or hybrid? Then write three seed-saving steps."],
  ["b8", 2, 6.0, null],   // quick check card
];
const stopAt = (b, i) => SE(b, i) + 0.1;
const stopFor = (b) => STOPS.find((s) => s[0] === b);
function Stop({ lt, b }) {
  const s = stopFor(b); if (!s) return null;
  return <StopCard lt={lt} at={stopAt(b, s[1])} hold={s[2] - 0.2} question={s[3]} n={STOPS.indexOf(s) + 1} total={STOPS.length} />;
}
const QUICK = ["Name three first crops.", "Why save seeds from the best plants?", "One difference between native and hybrid seeds.", "Why are millets important today?", "What does a seed bank do?"];
const SORT = [["Re-sow every year", "N"], ["Buy new seed every season", "H"], ["Suits local weather", "N"], ["Very high yield", "H"], ["Saved by grandparents", "N"], ["Made by crossing two plants", "H"], ["All plants look alike", "H"], ["Many shapes and colours", "N"]];

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
// Tick list: rows tick in one by one under a photo (native / hybrid points).
function Ticks({ x, y, w, lt, rows, tone = "cream" }) {
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w }}>
      {rows.map(([text, at], i) => { const o = pop(lt, at, 0.5); if (o <= 0) return null;
        return <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14, opacity: o, transform: `translateX(${(1 - o) * 20}px)` }}>
          <span style={{ flex: "none", width: 44, height: 44, borderRadius: 12, background: tone === "gold" ? SK.gold : SK.cream, color: SK.ink, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 700, fontSize: 28 }}>✓</span>
          <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 28, color: SK.white }}>{text}</span></div>; })}
    </div>
  );
}
// Two parent plants join with a cross to make the hybrid (flat SVG glyphs).
function CrossGlyph({ x, y, lt, at }) {
  const o = pop(lt, at, 0.7); if (o <= 0) return null;
  const plant = (px, col) => <g stroke={col} strokeWidth={7} strokeLinecap="round" fill={col}>
    <line x1={px} y1={60} x2={px} y2={-40} /><ellipse cx={px - 26} cy={0} rx={26} ry={11} transform={`rotate(-30 ${px - 26} 0)`} /><ellipse cx={px + 26} cy={-24} rx={26} ry={11} transform={`rotate(30 ${px + 26} -24)`} /></g>;
  return (
    <SVG op={o}>
      <g transform={`translate(${x} ${y})`}>
        {plant(-120, "#8BD48A")}{plant(0, "#6FBF6E")}
        <text x={-60} y={20} textAnchor="middle" fontFamily={SERIF} fontWeight="700" fontSize="56" fill={SK.gold}>×</text>
        <text x={80} y={20} textAnchor="middle" fontFamily={SERIF} fontWeight="700" fontSize="56" fill={SK.gold}>=</text>
        {plant(170, "#D9B24F")}
        <text x={25} y={110} textAnchor="middle" fontFamily={SANS} fontWeight="700" fontSize="24" fill={SK.white}>two parent plants crossed → hybrid</text>
      </g>
    </SVG>
  );
}

// Flat illustrations used when no vault photo exists: the concrete wedge portal in a snowy
// Arctic mountainside under a polar-night sky, and the shelves of seed boxes inside.
function VaultArt({ x, y, w, h, lt, at }) {
  const o = out3(lt, at, 0.8); if (o <= 0) return null;
  const k = clamp((lt - at) / 14, 0, 1), glow = 0.6 + 0.4 * Math.sin(lt * 1.2);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 18, overflow: "hidden", opacity: o, boxShadow: "0 0 0 3px rgba(255,255,255,0.55)" }}>
      <svg width={w} height={h} viewBox="0 0 720 560" style={{ display: "block", transform: `scale(${1 + 0.08 * k})`, transformOrigin: "center" }}>
        <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0B1B3A" /><stop offset="1" stopColor="#2A4A7A" /></linearGradient>
          <linearGradient id="aur" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#5FE3B0" stopOpacity="0" /><stop offset="0.5" stopColor="#5FE3B0" stopOpacity="0.55" /><stop offset="1" stopColor="#8BB8FF" stopOpacity="0" /></linearGradient></defs>
        <rect width="720" height="560" fill="url(#sky)" />
        <path d="M0 200 C 160 120, 300 230, 460 150 S 680 120, 720 180 L720 260 C 600 220, 420 300, 240 240 S 60 260, 0 250 Z" fill="url(#aur)" />
        {[60, 140, 230, 330, 420, 520, 610, 680].map((sx, i) => <circle key={i} cx={sx} cy={40 + (i * 37) % 120} r={i % 3 === 0 ? 2.5 : 1.6} fill="#fff" opacity="0.8" />)}
        <path d="M0 330 L 180 210 L 330 290 L 470 190 L 620 280 L 720 230 L 720 560 L 0 560 Z" fill="#DCE7F2" />
        <path d="M0 360 L 180 250 L 330 320 L 470 230 L 620 310 L 720 270 L 720 560 L 0 560 Z" fill="#F2F6FB" />
        <path d="M300 560 L 330 300 L 400 300 L 440 560 Z" fill="#8E97A3" />
        <path d="M330 300 L 400 300 L 395 330 L 335 330 Z" fill="#B9C3D0" />
        <rect x="333" y="302" width="64" height="16" fill="#7FE0D0" opacity={glow} />
        <rect x="350" y="490" width="40" height="70" fill="#2B2F36" />
        <rect x="355" y="500" width="30" height="55" fill="#F5D27A" opacity="0.9" />
        <path d="M200 560 L 300 560 L 300 540 C 260 520, 230 525, 200 545 Z M440 560 L 560 560 L 560 540 C 520 520, 480 525, 440 545 Z" fill="#FFFFFF" />
        <text x="360" y="548" textAnchor="middle" fontFamily={SANS} fontSize="18" fill="#2B2F36" opacity="0.7">illustration</text>
      </svg>
    </div>
  );
}
function ShelvesArt({ x, y, w, h, lt, at }) {
  const o = pop(lt, at, 0.6); if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 18, overflow: "hidden", opacity: o, transform: `scale(${0.85 + 0.15 * o})`, boxShadow: "0 0 0 4px " + SK.cream }}>
      <svg width={w} height={h} viewBox="0 0 300 210" style={{ display: "block" }}>
        <rect width="300" height="210" fill="#1E2A3A" />
        <path d="M0 0 L 300 0 L 190 60 L 110 60 Z" fill="#2A3A4F" /><path d="M0 210 L 300 210 L 190 150 L 110 150 Z" fill="#24324A" />
        {[0, 1, 2].map((r) => <g key={r}>{[0, 1, 2, 3].map((c) => <rect key={c} x={14 + c * 22} y={30 + r * 44} width="18" height="30" rx="2" fill={c % 2 ? "#C9CED6" : "#2C2F35"} stroke="#9AA3B0" strokeWidth="1" />)}
          {[0, 1, 2, 3].map((c) => <rect key={"r" + c} x={200 + c * 22} y={30 + r * 44} width="18" height="30" rx="2" fill={c % 2 ? "#2C2F35" : "#C9CED6"} stroke="#9AA3B0" strokeWidth="1" />)}
          <rect x="10" y={62 + r * 44} width="96" height="3" fill="#8FA0B5" /><rect x="196" y={62 + r * 44} width="96" height="3" fill="#8FA0B5" /></g>)}
        <rect x="110" y="60" width="80" height="90" fill="#9FD5FF" opacity="0.25" />
      </svg>
    </div>
  );
}

// ============================================================================
function B1(ctx) {
  const icons = [["crop_wheat", "First crops"], ["seed_store", "Save seeds"], ["native_seeds", "Native"], ["hybrid_seeds", "Hybrid"]];
  return ({ localTime: lt, duration }) => {
    const cQ = S("b1", 1);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[1]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(1, ctx, [L("Session 2 · First crops, saving seeds, native and hybrid, millets, seed banks", 0.4, "sub"), L("BIG QUESTION", cQ, "head"),
          L("Why keep some of this year's best seeds instead of eating them all?", cQ), L("Think for a moment. Share one idea.", SE("b1", 1), "think")])}>
        <Pic slot="palm_seeds" label="Maize and spinach seeds in a farmer's palm" x={40} y={60} w={1360} h={900} lt={lt} at={0} dur={1.0} fx="zoom" zoom={1.2} kenDur={10} dim={0.3} />
        {icons.map(([s, lab], i) => <Node key={s} slot={s} label={lab} x={420 + i * 200} y={190} r={64} lt={lt} at={0.3 + i * 0.2} size={22} />)}
        <Big x={40} y={360} w={1360} lt={lt} at={1.1} out={stopAt("b1", 1) - 0.1} size={84} align="center">Ancient and Modern Seed</Big>
        <Card x={140} y={640} w={1160} h={240} lt={lt} at={cQ} out={stopAt("b1", 1) - 0.1} pad={30}>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 22, letterSpacing: "0.14em", color: SK.gold, marginBottom: 12 }}>BIG QUESTION</div>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 44, lineHeight: 1.22, color: SK.white }}>Why keep some of this year's best seeds instead of eating them all?</div>
        </Card>
        <Stop lt={lt} b="b1" />
      </Scene>
    );
  };
}
function B2(ctx) {
  const journey = [["crop_wheat", "1 First crops"], ["journey_cobs", "2 Best seeds"], ["journey_nvh", "3 Native vs hybrid"], ["crop_millets", "4 Millets"], ["journey_jars", "5 Seed banks"]];
  const crops = [["crop_wheat", "Wheat", "wheat"], ["crop_barley", "Barley", "barley"], ["crop_rice", "Rice", "rice"], ["crop_millets", "Millets", "millets"], ["crop_pulses", "Pulses", "pulses"]];
  return ({ localTime: lt, duration }) => {
    const ats = crops.map((c) => W("b2", c[2]));
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[2]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(2, ctx, [L("FIRST CROPS", S("b2", 0), "head"), L("Wheat – wild grass, one of the first", ats[0]), L("Barley – grown alongside wheat", ats[1]),
          L("Rice – came later", ats[2]), L("Millets – ragi, jowar, bajra", ats[3]), L("Pulses – moong, gram", ats[4])], { max: 7 })}>
        <Chip text="OUR JOURNEY TODAY" x={720} y={16} lt={lt} at={0.2} tone="gold" size={22} />
        {journey.map(([s, lab], i) => { const d = Easing.easeOutCubic(reveal(lt, 0.3 + i * 0.15, 0.7));
          return <React.Fragment key={lab}>
            <Pic slot={s} label={lab} x={60 + i * 270 + (1 - d) * 300} y={70} w={230} h={150} lt={lt} at={0.3 + i * 0.15} fx="none" r={14} op={d} />
            <Chip text={lab} x={60 + i * 270 + 115} y={230} lt={lt} at={0.5 + i * 0.15} size={20} />
          </React.Fragment>; })}
        <Chip text="FIRST CROPS" x={720} y={330} lt={lt} at={S("b2", 0)} tone="gold" size={24} />
        {crops.map(([s, lab, w], i) => <React.Fragment key={s}>
          <Pic slot={s} label={lab} x={60 + i * 270} y={390} w={230} h={230} lt={lt} at={ats[i]} fx="pop" />
          <Chip text={lab} x={60 + i * 270 + 115} y={632} lt={lt} at={ats[i] + 0.15} size={24} />
        </React.Fragment>)}
        <Chip text="wild grasses: wheat and barley came first" x={330} y={720} lt={lt} at={ats[1] + 0.3} size={24} />
        <Chip text="ragi · jowar · bajra" x={870} y={720} lt={lt} at={W("b2", "ragi")} size={24} />
        <Chip text="moong · gram" x={1140} y={780} lt={lt} at={W("b2", "moong")} size={24} />
      </Scene>
    );
  };
}
function B3(ctx) {
  const steps = [["seed_choose", "Choose the best plants", "chose", 440, 130], ["seed_collect", "Collect their seeds", "collected", 720, 460], ["seed_store", "Store them safely", "stored", 440, 790], ["seed_sow", "Sow them again", "sowed", 160, 460]];
  return ({ localTime: lt, duration }) => {
    const ats = steps.map((s) => W("b3", s[2])), cPot = W("b3", "pot"), spin = lt * 18;
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[3]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(3, ctx, [L("SAVING THE BEST SEEDS", S("b3", 0), "head"), L("choose → collect → store → sow next season", ats[0]), L("A FARMER'S SEED POT = THE FIRST SEED BANK", cPot, "big"),
          L("Why would a farmer keep the best seeds instead of eating them?", stopAt("b3", 1), "think")])}>
        <SVG op={out3(lt, S("b3", 0), 0.8)}>
          <circle cx={440} cy={460} r={250} stroke="rgba(255,255,255,0.28)" strokeWidth="6" strokeDasharray="22 18" transform={`rotate(${spin} 440 460)`} />
          {[[-70, 20], [20, 110], [110, 200], [200, 290]].map(([a, b], i) => <ArcA key={i} cx={440} cy={460} r={250} a1={a} a2={b} op={out3(lt, ats[i] + 0.3, 0.5)} />)}
          <T x={440} y={450} size={30} bold serif>every</T><T x={440} y={490} size={30} bold serif>season</T>
        </SVG>
        {steps.map(([slot, lab, w, x, y], i) => <React.Fragment key={slot}>
          <Pic slot={slot} label={lab} x={x - 130} y={y - 85} w={260} h={170} lt={lt} at={ats[i]} fx="pop" r={14} />
          <Chip text={lab} x={x} y={y + 50} lt={lt} at={ats[i] + 0.15} size={20} />
        </React.Fragment>)}
        <Pic slot="seed_store" label="A farmer's seed pot" x={900} y={120} w={480} h={480} lt={lt} at={cPot} fx="zoom" />
        <Chip text="A farmer's seed pot = the first SEED BANK" x={1140} y={630} lt={lt} at={cPot + 0.3} tone="gold" size={26} />
        <Stop lt={lt} b="b3" />
      </Scene>
    );
  };
}
function B4(ctx) {
  return ({ localTime: lt, duration }) => {
    const cNat = W("b4", "native"), cGen = W("b4", "generations"), cLocal = W("b4", "local"), cSown = W("b4", "sown"), cHyb = W("b4", "hybrid"), cCross = W("b4", "crossing"),
      cYield = W("b4", "yield"), cEven = W("b4", "even"), cBuy = W("b4", "buy");
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[4]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(4, ctx, [L("NATIVE (desi): saved for generations · suit local weather · sow again every year", cNat), L("HYBRID: cross of two parent plants · high yield, even crop · buy new seed every season", cHyb)])}>
        <Pic slot="native_seeds" label="Native (desi) seeds" x={40} y={60} w={660} h={360} lt={lt} at={cNat} fx="zoom" />
        <Chip text="NATIVE (desi)" x={370} y={376} lt={lt} at={cNat} size={28} />
        <Ticks x={60} y={470} w={620} lt={lt} rows={[["Saved for generations", cGen], ["Suit the local weather", cLocal], ["Sow again every year", cSown]]} />
        <Pic slot="hybrid_seeds" label="Hybrid seeds" x={740} y={60} w={660} h={360} lt={lt} at={cHyb} fx="zoom" />
        <Chip text="HYBRID" x={1070} y={376} lt={lt} at={cHyb} tone="gold" size={28} />
        <Ticks x={760} y={470} w={620} lt={lt} rows={[["Cross of two parent plants", cCross], ["High yield, even crop", cYield], ["Buy new seed every season", cBuy]]} tone="gold" />
        <CrossGlyph x={1040} y={760} lt={lt} at={cCross} />
      </Scene>
    );
  };
}
function B5(ctx) {
  const ms = [["millet_ragi", "Ragi"], ["millet_jowar", "Jowar"], ["millet_bajra", "Bajra"]];
  return ({ localTime: lt, duration }) => {
    const c2023 = W("b5", "2023"), stamp = pop(lt, c2023, 0.5);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[5]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(5, ctx, [L("MILLETS: among our oldest crops", S("b5", 0), "head"), L("Need little water", W("b5", "water")), L("Very nutritious", W("b5", "nutritious")),
          L("ragi · jowar · bajra", S("b5", 0) + 0.6), L("2023 = INTERNATIONAL YEAR OF MILLETS", c2023, "big"), L("Why are millets important again today?", stopAt("b5", 2), "think")], { max: 7 })}>
        {ms.map(([s, lab], i) => <React.Fragment key={s}>
          <Pic slot={s} label={lab} x={60 + i * 340} y={70} w={300} h={300} lt={lt} at={S("b5", 0) + 0.3 + i * 0.25} fx="pop" />
          <Chip text={lab} x={60 + i * 340 + 150} y={318} lt={lt} at={S("b5", 0) + 0.45 + i * 0.25} size={26} />
        </React.Fragment>)}
        <Chip text="among our OLDEST crops" x={540} y={430} lt={lt} at={W("b5", "oldest")} tone="gold" size={28} />
        <Chip text="need little water" x={330} y={520} lt={lt} at={W("b5", "water")} size={26} />
        <Chip text="very nutritious" x={750} y={520} lt={lt} at={W("b5", "nutritious")} size={26} />
        {stamp > 0 && <div style={{ position: "absolute", left: 1080, top: 70, width: 320, height: 300, borderRadius: 24, background: SK.gold, boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
          transform: `scale(${1.6 - 0.6 * stamp}) rotate(${-8 + 8 * stamp}deg)`, opacity: Math.min(1, stamp * 1.5), display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20, boxSizing: "border-box" }}>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 92, color: SK.ink, lineHeight: 1 }}>2023</div>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 26, color: SK.ink, textAlign: "center", marginTop: 12, lineHeight: 1.2 }}>International Year of Millets</div></div>}
        <Stop lt={lt} b="b5" />
      </Scene>
    );
  };
}
function B6(ctx) {
  return ({ localTime: lt, duration }) => {
    const cV = W("b6", "village"), cN = W("b6", "national"), cC = W("b6", "class"), breakAt = SE("b6", 3) + 0.2;
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[6]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(6, ctx, [L("SEED BANKS keep seeds safe so we never lose them", S("b6", 0), "head"), L("Village – share and swap", cV), L("National – thousands of varieties", cN), L("Our class seed bank – coming later in this course", cC)])}>
        <Pic slot="seed_jars" label="Shelves of labelled seed jars" x={40} y={60} w={700} h={900} lt={lt} at={0} fx="zoom" />
        <Chip text="A seed bank keeps many kinds of seed safe" x={390} y={880} lt={lt} at={S("b6", 0)} tone="gold" size={26} />
        <Pic slot="village_bank" label="Village seed bank" x={780} y={60} w={620} h={280} lt={lt} at={cV} fx="pop" />
        <Chip text="Village – farmers share and swap" x={1090} y={286} lt={lt} at={cV + 0.15} size={24} />
        <Pic slot="national_bank" label="National seed bank" x={780} y={370} w={620} h={280} lt={lt} at={cN} fx="pop" />
        <Chip text="National – thousands of varieties" x={1090} y={596} lt={lt} at={cN + 0.15} size={24} />
        <Pic slot="class_bank" label="Our class seed bank" x={780} y={680} w={620} h={220} lt={lt} at={cC} fx="pop" dim={0.25} />
        <Chip text="Our class seed bank – later in this course" x={1090} y={846} lt={lt} at={cC + 0.15} tone="gold" size={24} />
        <Break lt={lt} at={breakAt} dur={2.3} />
      </Scene>
    );
  };
}
function B7(ctx) {
  return ({ localTime: lt, duration }) => {
    const cDeep = S("b7", 1), cVault = W("b7", "svalbard"), cMillion = W("b7", "million"), cMinus = W("b7", "minus"), cNoah = S("b7", 3), sAt = stopAt("b7", 3);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[7]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(7, ctx, [L("Svalbard Global Seed Vault, Norway", cVault, "head"), L("Inside a mountain in the Arctic · opened 2008", cDeep), L("Over 1 million seed samples · kept at −18 °C", cMillion),
          L("\"Noah's Ark\" for plants", cNoah, "big"), L("Sources: Wikipedia – Svalbard Global Seed Vault; NBC News, CBS News (opening, 2008)", cNoah + 0.8, "source"),
          L("TEAM SORT: 8 cards – native or hybrid? Then write 3 seed-saving steps", sAt, "think")], { max: 8 })}>
        <Card x={50} y={50} w={1340} h={905} lt={lt} at={0} pad={0} />
        <Badge x={92} y={82} lt={lt} at={S("b7", 0)} />
        {photoSrc("svalbard_entrance")
          ? <Pic slot="svalbard_entrance" label="Svalbard Global Seed Vault entrance" x={92} y={172} w={720} h={560} lt={lt} at={cDeep} fx="zoom" />
          : <VaultArt x={92} y={172} w={720} h={560} lt={lt} at={cDeep} />}
        {photoSrc("svalbard_inside")
          ? <Pic slot="svalbard_inside" label="Inside: shelves of seed boxes" x={560} y={560} w={300} h={210} lt={lt} at={cMillion} fx="pop" style={{ boxShadow: "0 0 0 4px " + SK.cream }} />
          : <ShelvesArt x={560} y={560} w={300} h={210} lt={lt} at={cMillion} />}
        <Chip text="inside the vault" x={710} y={776} lt={lt} at={cMillion + 0.2} size={20} />
        <Lines x={860} y={180} w={490} lt={lt} lines={[{ text: "The Svalbard Global Seed Vault", at: cVault, serif: true, bold: true, size: 40, color: SK.gold },
          { text: "Deep inside a frozen mountain in the Arctic, in Norway. Opened in 2008.", at: cDeep }, { text: "More than a million seed samples from around the world.", at: cMillion },
          { text: "Kept at minus 18 degrees.", at: cMinus }, { text: "A \"Noah's Ark\" for plants!", at: cNoah, serif: true, bold: true, size: 36, color: SK.gold }]} size={29} />
        <div style={{ position: "absolute", left: 92, top: 880, width: 1260, opacity: out3(lt, cNoah + 0.8, 0.6), fontFamily: SANS, fontSize: 21, color: SK.dim }}>
          Sources: Wikipedia – Svalbard Global Seed Vault (Spitsbergen, Norway; opened 26 Feb 2008; −18 °C; 1,355,591 samples in June 2025); NBC News and CBS News called it a "Noah's Ark" for seeds at its opening</div>
        {/* Stop 4: the native / hybrid sort board */}
        {windowOp(lt, sAt, sAt + 3.8, 0.35) > 0 && (
          <div style={{ position: "absolute", left: 40, top: 60, width: LEFT_W - 80, height: 900, borderRadius: 26, background: "rgba(5,30,22,0.9)", opacity: windowOp(lt, sAt, sAt + 3.8, 0.35),
            boxShadow: "0 0 0 3px rgba(226,176,76,0.9)", padding: "50px 70px", boxSizing: "border-box" }}>
            <div style={{ display: "inline-block", fontFamily: SERIF, fontWeight: 700, fontSize: 30, letterSpacing: "0.08em", color: SK.ink, background: SK.gold, padding: "10px 30px", borderRadius: 14 }}>PAUSE AND DISCUSS</div>
            <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 46, color: SK.white, marginTop: 24 }}>Team sort: native or hybrid?</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 18, marginTop: 28 }}>
              {SORT.map(([t], i) => <div key={t} style={{ background: SK.cream, color: SK.ink, borderRadius: 16, padding: "22px 18px", fontFamily: SANS, fontWeight: 700, fontSize: 26, textAlign: "center", minHeight: 110, display: "flex", alignItems: "center", justifyContent: "center", opacity: out3(lt, sAt + 0.3 + i * 0.1, 0.4) }}>{t}</div>)}
            </div>
            <div style={{ fontFamily: SANS, fontSize: 28, color: SK.gold, marginTop: 34 }}>Then write three seed-saving steps.</div>
            <div style={{ fontFamily: SANS, fontSize: 24, color: SK.dim, marginTop: 10 }}>Stop 4 of 5 · press play to continue</div>
          </div>)}
      </Scene>
    );
  };
}
function B8(ctx) {
  const steps = [["seed_choose", "Choose the best plants", "choose"], ["seed_collect", "Dry the seeds well", "dry"], ["seed_store", "Store in a dry, closed, labelled pot", "store"]];
  const answers = [["seed_store", "SAVE – a good crop next season", "saved"], ["eat_grain", "EAT – food for today", "eat"], ["share_seeds", "SHARE – help other farmers", "shared"]];
  return ({ localTime: lt, duration }) => {
    const ats = steps.map((s) => W("b8", s[2])), cSaved = W("b8", "saved"), cShared = W("b8", "shared"), cTell = S("b8", 2), cEat = W("b8", "eat");
    const qAt = stopAt("b8", 2), hold = stopFor("b8")[2] - 0.2, stepsOp = 1 - reveal(lt, cSaved, 0.5);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[8]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(8, ctx, [L("SEED-SAVING STEPS", S("b8", 0), "head"), L("choose the best plants → dry the seeds well → store in a dry, closed, labelled pot", ats[0]),
          L("SAVE: a good crop next season · EAT: food for today · SHARE: help other farmers", cSaved), L("Would you save your best seeds, or eat them?", cTell, "big"),
          L("QUICK CHECK", qAt, "head"), ...QUICK.map((q, i) => L(`${i + 1} ${q}`, qAt + 0.2 + i * 0.15, "sub"))], { max: 10 })}>
        <div style={{ position: "absolute", inset: 0, opacity: stepsOp }}>
          <Big x={60} y={50} w={1300} lt={lt} at={S("b8", 0)} size={44}>Seed-saving steps</Big>
          <SVG op={1}>{[0, 1].map((i) => <Arr key={i} x1={300 + i * 420 + 200} y1={360} x2={300 + (i + 1) * 420 - 200} y2={360} lt={lt} at={ats[i + 1] - 0.2} />)}</SVG>
          {steps.map(([s, lab], i) => <React.Fragment key={s}>
            <Pic slot={s} label={lab} x={300 + i * 420 - 190} y={160} w={380} h={260} lt={lt} at={ats[i]} fx="pop" r={16} />
            <div style={{ position: "absolute", left: 300 + i * 420 - 190, top: 440, width: 380, textAlign: "center", opacity: pop(lt, ats[i] + 0.15, 0.5), fontFamily: SANS, fontWeight: 700, fontSize: 26, color: SK.white, lineHeight: 1.2 }}>{i + 1}. {lab}</div>
          </React.Fragment>)}
        </div>
        {answers.map(([s, lab], i) => { const at = i === 0 ? cSaved : i === 1 ? cShared + 0.5 : cShared;   // save → share → eat, all three up before the question
          return <React.Fragment key={lab}>
            <Pic slot={s} label={lab} x={40 + i * 460} y={90} w={440} h={330} lt={lt} at={at} fx="zoom" />
            <Chip text={lab} x={260 + i * 460} y={372} lt={lt} at={at + 0.2} tone={i === 0 ? "gold" : "cream"} size={24} />
          </React.Fragment>; })}
        <Big x={40} y={520} w={1360} lt={lt} at={cTell} size={54} align="center">Would you save your best seeds, or eat them?</Big>
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
const COLLAGE = [{ slot: "seed_jars", x: -60, y: -40, w: 760, h: 520, ph: 0 }, { slot: "native_seeds", x: 640, y: -80, w: 760, h: 520, ph: 2 },
  { slot: "crop_wheat", x: -80, y: 520, w: 700, h: 560, ph: 4 }, { slot: "millet_bajra", x: 560, y: 560, w: 820, h: 560, ph: 1 }];
function SeedScenes(props = {}) {
  const caps = props.showCaptions === "false" ? false : props.showCaptions !== false;
  const titles = {};
  for (let n = 1; n <= NB; n++) titles[n] = str(props["title" + n + "Text"], TITLES[n]);
  const ctx = { caps, titles, capSize: num(props.captionSize, 34) };
  const B = [B1, B2, B3, B4, B5, B6, B7, B8];
  const beats = B.map((Bn, i) => { const t = BEAT("b" + (i + 1)); return [t.start, t.start + t.dur, Bn]; });
  return (
    <StoryFrame props={props} dur={DUR} persistKey="thinkpro-lp2-ancient-and-modern-seed" collage={COLLAGE}>
      {beats.map(([s, e, Bn], i) => (
        <Sprite key={i} start={s} end={e}>{Bn(ctx)}</Sprite>
      ))}
      {STOPS.map(([b, i, hold]) => <StopAt key={b} t={BEAT(b).start + stopAt(b, i)} hold={hold - 0.2} />)}
      <ChimeAt t={BEAT("b7").start + S("b7", 0, 0)} />
      <AudioSync />
    </StoryFrame>
  );
}
window.SeedScenes = SeedScenes;
