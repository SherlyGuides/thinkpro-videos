/* global React, window */
// ThinkPro Academy — "Native and Hybrid Seeds: Tradition vs Technology!" (Grade 6 Agriculture, Session 29, V1).
// After AG_G6_S29 Video Script (Subrata, 5 Nov 2026): 12 script scenes as 12 voiced beats, three presenter stops
// (TPStory.StopAt: a countdown dial runs through each hold, web and export alike), one Did-you-know card (b10, chime).
// Running idea: two seed characters, DESI (native, cloth pouch) and HYBRI (hybrid, shiny packet), neither a villain.
// They are DRAWN here; photos carry the scenes behind them. Hybri's packet is deliberately unbranded: no name, no logo.
// STORY STYLE (engine/story-kit.jsx). Pure function of time.
const { Sprite } = window;
const { reveal, windowOp } = window.TPMotion;
const { num, str } = window.TPStage;
const { SK, SERIF, SANS, LEFT_W, pop, out3, lerp, drive,
  Pic, Chip, Badge, Big, Card, SVG, Arrow, T, ChimeAt, Scene, StoryFrame, StopAt } = window.TPStory;

// ---- SESSION NUMBER. The script assumes 29 and it may be renumbered. To change it: edit SESSION here, and
// title1Text in Video.dc.html (the defs block AND data-props, which override TITLES below).
const SESSION = 29;

// ---- Timing: EVERYTHING is keyed to the narration (tools/fit_timing.py → timing.js).
const TM = window.TP_TIMING;
if (!TM) console.error("timing.js missing — run: python3 tools/fit_timing.py videos/lp29-native-and-hybrid-seeds");
const LEAD = TM ? TM.lead : 1.0;
const DUR = TM ? TM.total : 260;
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
const NB = 12;
const CAPS = {};
if (TM) for (let n = 1; n <= NB; n++) CAPS[n] = capsFor("b" + n);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rnd = (i) => { const x = Math.sin(i * 12.9898 + 4.1) * 43758.5453; return x - Math.floor(x); };

// ---- Panel copy. Title defaults mirror the DC data-props (titleNText) — keep in sync. ----
const TITLES = { 1: `LP${SESSION} – Native and Hybrid Seeds`, 2: "Not all seeds are the same!", 3: "Native seeds", 4: "Native seeds", 5: "Think", 6: "Hybrid seeds",
  7: "Hybrid seeds", 8: "Hybrid seeds", 9: "The big question", 10: "Did you know?", 11: "The big idea", 12: "Quick check" };
const KICK = `Grade 6 · Agriculture · Session ${SESSION}`;
const KICK2 = "Desi and Hybri";
const panel = (n, ctx, lines, extra = {}) => ({ kicker: n === 1 ? KICK : KICK2, title: ctx.titles[n], lines, ...extra });
const L = (text, at, kind = "item", extra = {}) => ({ text, at, kind, ...extra });
const GOOD = "#2E7D32", RED = "#B3261E";
const Yes = (t) => <span><b style={{ color: GOOD }}>✓</b> {t}</span>;
const No = (t) => <span><b style={{ color: RED }}>✗</b> {t}</span>;

// ---- Presenter stops: [beat, sentence index whose pauseAfter is the hold, hold s]
const STOPS = [["b5", 1, 15.0], ["b9", 3, 15.0], ["b12", 3, 15.0]];
const stopAt = (b, i) => SE(b, i) + 0.1;                       // beat-local start of the hold
const stopFor = (b) => STOPS.find((s) => s[0] === b);
// The kit's StopCard fills the photo area. These stops freeze ON the characters, so this is a low band.
function StopBand({ lt, b, heading, children, y = 650, h = 270, from = null, size = 44 }) {
  const s = stopFor(b), at = stopAt(b, s[1]), hold = s[2] - 0.2, n = STOPS.indexOf(s) + 1;
  const o = windowOp(lt, from != null ? from : at, at + hold + 0.4, 0.35); if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 40, top: y, width: LEFT_W - 80, height: h, borderRadius: 24, background: "rgba(5,30,22,0.92)", opacity: o, zIndex: 3,
      boxShadow: "0 0 0 3px rgba(226,176,76,0.9)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "16px 50px", boxSizing: "border-box", textAlign: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <svg width="50" height="50" viewBox="0 0 90 90"><circle cx="45" cy="45" r="43" fill={SK.gold} /><rect x="28" y="24" width="12" height="42" rx="4" fill={SK.ink} /><rect x="50" y="24" width="12" height="42" rx="4" fill={SK.ink} /></svg>
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 28, letterSpacing: "0.08em", color: SK.ink, background: SK.gold, padding: "6px 24px", borderRadius: 12 }}>{heading}</div>
      </div>
      <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: size, lineHeight: 1.16, color: SK.white, marginTop: 14 }}>{children}</div>
      <div style={{ fontFamily: SANS, fontSize: 24, color: SK.dim, marginTop: 10 }}>Stop {n} of {STOPS.length}</div>
    </div>
  );
}

// ---- Shared pieces ---------------------------------------------------------------
const DESI_C = "#8A5A2B", HYBRI_C = "#0F7F86";
function Show({ lt, a, b = 1e9, f = 0.4, children }) {
  const o = windowOp(lt, a, b, f); if (o <= 0) return null;
  return <div style={{ position: "absolute", inset: 0, opacity: o }}>{children}</div>;
}
function Stamp({ text, x, y, lt, at, rot = -7, size = 74, out = null }) {
  const p = reveal(lt, at, 0.32); if (p <= 0) return null;
  const o = Math.min(1, p * 2.2) * (out != null ? 1 - reveal(lt, out, 0.4) : 1); if (o <= 0) return null;
  const sc = 1.9 - 0.9 * Math.pow(p, 3), kick = 0.05 * Math.sin(Math.PI * clamp((lt - at - 0.32) / 0.22, 0, 1));
  return <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${sc + kick})`, opacity: o, zIndex: 4, fontFamily: SERIF, fontWeight: 700, fontSize: size,
    letterSpacing: "0.08em", color: RED, background: "rgba(246,241,227,0.94)", border: `8px solid ${RED}`, borderRadius: 14, padding: "6px 34px", whiteSpace: "nowrap", boxShadow: "0 8px 24px rgba(0,0,0,0.35)" }}>{text}</div>;
}
// Name tag: brown for Desi, teal for Hybri, used wherever the two are named.
function Tag({ kind, x, y, lt, at, size = 34, out = null, anchor = "center", text }) {
  const o = pop(lt, at, 0.5) * (out != null ? 1 - reveal(lt, out, 0.4) : 1); if (o <= 0) return null;
  return <div style={{ position: "absolute", left: x, top: y, transform: `translateX(${anchor === "center" ? "-50%" : "0"}) scale(${0.85 + 0.15 * o})`, transformOrigin: "left top", opacity: clamp(o, 0, 1), fontFamily: SANS, fontWeight: 700,
    fontSize: size, letterSpacing: "0.06em", color: SK.white, background: kind === "desi" ? DESI_C : HYBRI_C, padding: "6px 22px", borderRadius: 10, whiteSpace: "nowrap", boxShadow: "0 3px 12px rgba(0,0,0,0.35)" }}>{text || (kind === "desi" ? "DESI" : "HYBRI")}</div>;
}
// Photos that open one by one and share the row. Each item: { slot, label, name, at, first, tone }.
function rowBoxes(lt, items, x0, wid, gap) {
  const sh = items.map((it, i) => (i === 0 ? 1 : out3(lt, it.at, 0.7))), n = sh.reduce((a, b) => a + b, 0), u = (wid - (n - 1) * gap) / n;
  const out = []; let x = x0;
  sh.forEach((k, i) => { if (i) x += gap * k; out.push([x, u * k, k]); x += u * k; });
  return out;
}
function Row({ lt, y = 60, h = 860, items, x0 = 40, wid = 1360, gap = 20, chipY = null, chipSize = 34 }) {
  const box = rowBoxes(lt, items, x0, wid, gap), cy = chipY != null ? chipY : y + h - 74;
  return items.map((it, i) => box[i][1] < 4 ? null : <React.Fragment key={i}>
    <Pic slot={it.slot} label={it.label} x={box[i][0]} y={y} w={box[i][1]} h={h} lt={lt} at={it.first != null ? it.first : it.at} fx="zoom" pos={it.pos || "center"} />
    {it.name && <Chip text={it.name} x={box[i][0] + box[i][1] / 2} y={cy} lt={lt} at={it.at + 0.15} size={chipSize} tone={it.tone || "cream"} />}</React.Fragment>);
}

// ---- The two seeds ---------------------------------------------------------------
// Body drawn around (0,0), about 200 tall. armL / armR: degrees out from hanging straight down.
const SEED_D = "M0 -100 C44 -96 78 -42 78 18 C78 70 42 98 0 98 C-42 98 -78 70 -78 18 C-78 -42 -44 -96 0 -100 Z";
const STICKER = "#FFF8E6";
function SeedGuy({ kind, x, y, s = 1, mood = "smile", armL = 18, armR = 18, tilt = 0, legs = true, t = 0, op = 1 }) {
  if (op <= 0) return null;
  const desi = kind === "desi", fill = desi ? "#A8703A" : "#F0C23E", edge = desi ? "#6E4420" : "#B8861B";
  const blink = ((t * 0.31 + (desi ? 0 : 0.45)) % 1) < 0.03;
  const arm = (sd, a) => { const r = a * Math.PI / 180, x0 = sd * 72, y0 = 18, x1 = x0 + sd * Math.sin(r) * 66, y1 = y0 + Math.cos(r) * 66;
    return <g><line x1={x0} y1={y0} x2={x1} y2={y1} stroke={STICKER} strokeWidth="20" strokeLinecap="round" /><line x1={x0} y1={y0} x2={x1} y2={y1} stroke={edge} strokeWidth="11" strokeLinecap="round" /><circle cx={x1} cy={y1} r="11" fill={fill} stroke={edge} strokeWidth="4" /></g>; };
  const brow = mood === "unsure" ? [[-42, -30, -16, -40], [16, -40, 42, -30]] : mood === "proud" ? [[-44, -36, -16, -42], [16, -42, 44, -36]] : null;
  const mouth = { smile: "M-24 28 Q0 50 24 28", joy: "M-28 24 Q0 66 28 24 Z", proud: "M-28 24 Q0 54 28 24", unsure: "M-20 38 Q-8 28 2 36 Q12 44 22 32", think: "M-8 36 a9 9 0 1 0 18 0 a9 9 0 1 0 -18 0" }[mood] || "M-24 28 Q0 50 24 28";
  return <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${s})`} opacity={op}>
    {legs && [-1, 1].map((sd) => <g key={sd}><line x1={sd * 26} y1={92} x2={sd * 30} y2={130} stroke={STICKER} strokeWidth="20" strokeLinecap="round" /><line x1={sd * 26} y1={92} x2={sd * 30} y2={130} stroke={edge} strokeWidth="11" strokeLinecap="round" /><ellipse cx={sd * 38} cy={134} rx="20" ry="10" fill={edge} stroke={STICKER} strokeWidth="4" /></g>)}
    {arm(-1, armL)}{arm(1, armR)}
    <path d={SEED_D} fill={STICKER} stroke={STICKER} strokeWidth="14" strokeLinejoin="round" />
    <path d={SEED_D} fill={fill} stroke={edge} strokeWidth="5" />
    {desi
      ? <g><path d="M-14 -96 C-34 -130 -8 -142 4 -146 C8 -124 8 -108 -2 -98 Z" fill="#5FA04E" stroke="#3B7A34" strokeWidth="4" /><path d="M-72 62 C-30 84 30 84 72 62 C70 72 64 80 58 84 C24 100 -24 100 -58 84 C-64 80 -70 72 -72 62 Z" fill="#B3261E" /><path d="M-40 78 L-28 92 M-12 84 L-4 98 M16 84 L10 98 M42 76 L32 92" stroke="#F6F1E3" strokeWidth="5" /></g>
      : <g><path d="M0 -98 C-6 -124 -30 -134 -44 -130 C-40 -110 -18 -98 0 -98 Z" fill="#3FB56B" stroke="#22804A" strokeWidth="4" /><path d="M0 -98 C6 -124 30 -134 44 -130 C40 -110 18 -98 0 -98 Z" fill="#3FB56B" stroke="#22804A" strokeWidth="4" /><path d="M-52 -34 C-48 -60 -32 -74 -18 -80" stroke="#FFF3C4" strokeWidth="10" strokeLinecap="round" fill="none" /></g>}
    {[-1, 1].map((sd) => blink ? <path key={sd} d={`M${sd * 28 - 12} -6 Q${sd * 28} 2 ${sd * 28 + 12} -6`} stroke="#22180F" strokeWidth="5" fill="none" strokeLinecap="round" />
      : <g key={sd}><circle cx={sd * 28} cy={-8} r="14" fill="#fff" /><circle cx={sd * 28 + 2} cy={-6} r="7.5" fill="#22180F" /></g>)}
    {brow && brow.map((b, i) => <line key={i} x1={b[0]} y1={b[1]} x2={b[2]} y2={b[3]} stroke="#22180F" strokeWidth="5" strokeLinecap="round" />)}
    <path d={mouth} stroke="#22180F" strokeWidth="5" strokeLinecap="round" fill={mood === "joy" ? "#7A2A20" : "none"} />
  </g>;
}
// Faded cloth pouch, front half. The seed is drawn first and peeks out above the neck.
function PouchFront() {
  const d = "M-104 -6 C-146 62 -132 164 -78 176 C-30 186 30 186 78 176 C132 164 146 62 104 -6 C60 16 -60 16 -104 -6 Z";
  return <g>
    <path d={d} fill={STICKER} stroke={STICKER} strokeWidth="14" strokeLinejoin="round" />
    <path d={d} fill="#5E7396" stroke="#3B4C69" strokeWidth="5" />
    {[...Array(9)].map((_, i) => <path key={i} d={`M${-112 + i * 28} ${28 + 4 * Math.sin(i)} q6 60 ${i < 4 ? -6 : 6} 130`} stroke="#6E84A8" strokeWidth="5" fill="none" />)}
    <rect x="28" y="84" width="62" height="58" rx="6" fill="#C98A3E" stroke="#8A5A2B" strokeWidth="3" strokeDasharray="8 5" transform="rotate(-6 59 113)" />
    <path d="M-100 8 C-50 28 50 28 100 8" stroke="#E7D9B6" strokeWidth="9" fill="none" strokeLinecap="round" />
    <path d="M60 18 C74 46 62 62 84 76 M60 18 C48 44 40 56 52 74" stroke="#E7D9B6" strokeWidth="6" fill="none" strokeLinecap="round" />
  </g>;
}
// Shiny foil packet with a price tag. Unbranded on purpose: no name, no logo, only a seed on a plain round label.
function PacketFront({ tag = true, t = 0 }) {
  const top = "M-112 -2 L-88 -18 L-66 -2 L-44 -18 L-22 -2 L0 -18 L22 -2 L44 -18 L66 -2 L88 -18 L112 -2 L112 182 L-112 182 Z";
  const sh = ((t * 0.18) % 1) * 300 - 150;
  return <g>
    <path d={top} fill={STICKER} stroke={STICKER} strokeWidth="14" strokeLinejoin="round" />
    <path d={top} fill="#17A2A8" stroke="#0B6F75" strokeWidth="5" strokeLinejoin="round" />
    <rect x="-112" y="10" width="224" height="16" fill="#F0C23E" />
    <rect x="-112" y="160" width="224" height="14" fill="#E2487B" />
    <clipPath id="tpPk"><path d={top} /></clipPath>
    <g clipPath="url(#tpPk)"><path d={`M${sh - 40} 200 L${sh + 60} -30 L${sh + 100} -30 L${sh} 200 Z`} fill="#fff" opacity="0.32" /><path d={`M${sh + 30} 200 L${sh + 130} -30 L${sh + 146} -30 L${sh + 46} 200 Z`} fill="#fff" opacity="0.22" /></g>
    <circle cx="0" cy="92" r="52" fill="#FFF8E6" stroke="#F0C23E" strokeWidth="6" />
    <path d="M0 58 C18 62 30 84 30 104 C30 122 16 130 0 130 C-16 130 -30 122 -30 104 C-30 84 -18 62 0 58 Z" fill="#F0C23E" stroke="#B8861B" strokeWidth="4" />
    {tag && <g transform="translate(112 34) rotate(16)">
      <path d="M0 -6 C14 -22 26 -14 34 -4" stroke="#5B4A2C" strokeWidth="3.5" fill="none" />
      <path d="M26 -16 L118 -20 L136 8 L118 36 L26 32 Z" fill="#FFD84A" stroke="#B8861B" strokeWidth="4" />
      <circle cx="40" cy="8" r="6" fill="#FFF8E6" stroke="#B8861B" strokeWidth="3" />
      <text x="88" y="20" textAnchor="middle" fontFamily={SANS} fontWeight="700" fontSize="36" fill="#7A2A20">₹₹₹</text></g>}
  </g>;
}
// Each seed with its home. x,y = centre of the pouch mouth. peek 0..1 = how far out it stands.
function DesiPouch({ x, y, s = 1, lt, at = 0, out = null, mood = "smile", peek = 1, wave = false }) {
  const o = pop(lt, at, 0.55) * (out != null ? 1 - reveal(lt, out, 0.4) : 1); if (o <= 0) return null;
  const by = lerp(40, -56, peek) + 4 * Math.sin(lt * 2.2);
  return <g transform={`translate(${x} ${y}) scale(${s * (0.8 + 0.2 * o)})`} opacity={clamp(o, 0, 1)}>
    <SeedGuy kind="desi" x={0} y={by} s={0.8} mood={mood} legs={false} t={lt} armL={150} armR={wave ? 138 + 22 * Math.sin(lt * 7) : 150} /><PouchFront /></g>;
}
function HybriPacket({ x, y, s = 1, lt, at = 0, out = null, mood = "joy", peek = 1, wave = true, tag = true }) {
  const o = pop(lt, at, 0.55) * (out != null ? 1 - reveal(lt, out, 0.4) : 1); if (o <= 0) return null;
  const by = lerp(40, -56, peek) + 4 * Math.sin(lt * 2.5 + 1);
  return <g transform={`translate(${x} ${y}) scale(${s * (0.8 + 0.2 * o)})`} opacity={clamp(o, 0, 1)}>
    <SeedGuy kind="hybri" x={0} y={by} s={0.8} mood={mood} legs={false} t={lt} armL={150} armR={wave ? 138 + 22 * Math.sin(lt * 8) : 150} /><PacketFront tag={tag} t={lt} /></g>;
}
// Standing freely, with a small pop on arrival.
function Stand({ kind, x, y, s = 1, lt, at = 0, out = null, mood, armL, armR, tilt = 0 }) {
  const o = pop(lt, at, 0.55) * (out != null ? 1 - reveal(lt, out, 0.4) : 1); if (o <= 0) return null;
  return <SeedGuy kind={kind} x={x} y={y + 5 * Math.sin(lt * 2.1 + (kind === "desi" ? 0 : 2))} s={s * (0.8 + 0.2 * o)} op={clamp(o, 0, 1)} mood={mood} armL={armL} armR={armR} tilt={tilt} t={lt} />;
}

// ---- Beats -----------------------------------------------------------------------
function B1(ctx) {
  return ({ localTime: lt, duration }) => {
    const cDesi = W("b1", "desi"), cHy = W("b1", "hybri"), cBoth = S("b1", 2), cQ = S("b1", 3), cExp = W("b1", "expensive");
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[1]} showCaps={ctx.caps} capSize={ctx.capSize} fi={0.1}
        panel={panel(1, ctx, [L("Tradition vs Technology!", 0.6, "head"), L("DESI: a native seed from Grandmother's store", cDesi), L("HYBRI: a hybrid seed from the shop", cHy), L("Does the more EXPENSIVE seed always grow better?", cExp, "think")])}>
        <Show lt={lt} a={-1} b={cBoth + 0.3}>
          <Pic slot="kothi_bin" label="Grandmother's clay store" x={40} y={60} w={670} h={860} lt={lt} at={0} fx="zoom" />
          <Pic slot="seed_shop" label="A village seed shop" x={730} y={60} w={670} h={860} lt={lt} at={cHy - 0.1} fx="zoom" />
          <SVG>
            <DesiPouch x={375} y={560} s={1.25} lt={lt} at={cDesi} wave />
            <HybriPacket x={1065} y={560} s={1.25} lt={lt} at={cHy} />
          </SVG>
          <Tag kind="desi" x={375} y={110} lt={lt} at={cDesi + 0.2} size={46} />
          <Tag kind="hybri" x={1065} y={110} lt={lt} at={cHy + 0.2} size={46} />
          <Chip text="native seed" x={375} y={186} lt={lt} at={cDesi + 0.7} size={32} />
          <Chip text="hybrid seed" x={1065} y={186} lt={lt} at={cHy + 0.7} size={32} />
        </Show>
        <Show lt={lt} a={cBoth}>
          <Pic slot="farmer_puzzled" label="A farmer scratches his head" x={40} y={60} w={1360} h={860} lt={lt} at={cBoth} fx="zoom" />
          <SVG op={out3(lt, cBoth, 0.5)}>
            <rect x="40" y="690" width="1360" height="230" rx="10" fill="#8A5A36" /><rect x="40" y="690" width="1360" height="14" fill="#B07A4C" />
            {[...Array(5)].map((_, i) => <path key={i} d={`M40 ${730 + i * 40} q340 ${6 - i * 3} 680 0 t680 0`} stroke="#6E4527" strokeWidth="3" fill="none" />)}
            <DesiPouch x={250} y={520} lt={lt} at={cBoth} wave />
            <HybriPacket x={1190} y={520} lt={lt} at={cBoth + 0.2} />
          </SVG>
          <Card x={190} y={744} w={1060} h={132} lt={lt} at={cQ} />
          <Big x={40} y={756} w={1360} lt={lt} at={cQ} size={46} align="center">Does the more <span style={{ color: SK.gold }}>EXPENSIVE</span> seed<br />always grow better?</Big>
        </Show>
      </Scene>
    );
  };
}
// Flat round icons for the five choices, the care needs and the land-sky-wallet check.
function Ico({ kind, x, y, r = 76, o = 1 }) {
  if (o <= 0) return null;
  const k = r / 76;
  const body = {
    crop: <g><path d="M0 52 C-2 16 2 -14 0 -46" stroke="#3B7A34" strokeWidth="7" fill="none" /><path d="M0 26 C-24 22 -40 8 -44 -8 C-22 -8 -6 6 0 26 Z M0 10 C22 8 40 -6 44 -22 C22 -22 6 -8 0 10 Z" fill="#5FA04E" />{[...Array(7)].map((_, i) => <ellipse key={i} cx={(i % 2 ? 8 : -8)} cy={-30 - i * 6} rx="7" ry="10" fill="#E2B04C" stroke="#B8861B" strokeWidth="2" />)}</g>,
    climate: <g><circle cx="-14" cy="-14" r="24" fill="#F7C24B" />{[...Array(8)].map((_, i) => { const a = i * Math.PI / 4; return <line key={i} x1={-14 + 30 * Math.cos(a)} y1={-14 + 30 * Math.sin(a)} x2={-14 + 42 * Math.cos(a)} y2={-14 + 42 * Math.sin(a)} stroke="#F7C24B" strokeWidth="6" strokeLinecap="round" />; })}<path d="M-20 38 a18 18 0 0 1 4 -35 a24 24 0 0 1 44 -2 a19 19 0 0 1 4 37 Z" fill="#AFC3D4" stroke="#6F8799" strokeWidth="3" /></g>,
    soil: <g><path d="M-52 30 C-30 -10 -14 -18 0 -18 C14 -18 30 -10 52 30 Z" fill="#6B4A32" />{[...Array(9)].map((_, i) => <circle key={i} cx={-30 + rnd(i + 3) * 60} cy={6 + rnd(i + 8) * 20} r="3.4" fill="#8E6B4F" />)}<path d="M-60 26 C-56 56 -24 60 0 60 C24 60 56 56 60 26 Z" fill="#E0A97E" stroke="#B57F58" strokeWidth="3" /><path d="M0 -18 C0 -34 0 -38 0 -44 M0 -36 C-12 -44 -20 -44 -24 -40 M0 -40 C12 -48 20 -48 24 -44" stroke="#3B7A34" strokeWidth="5" fill="none" strokeLinecap="round" /></g>,
    budget: <g><circle r="48" fill="#E2B04C" stroke="#B8861B" strokeWidth="5" /><circle r="37" fill="none" stroke="#B8861B" strokeWidth="3" /><text x="0" y="20" textAnchor="middle" fontFamily={SANS} fontWeight="700" fontSize="58" fill="#7A5310">₹</text></g>,
    goal: <g><circle r="50" fill="#fff" stroke="#B3261E" strokeWidth="8" /><circle r="31" fill="#fff" stroke="#B3261E" strokeWidth="8" /><circle r="12" fill="#B3261E" /><line x1="4" y1="-4" x2="44" y2="-44" stroke="#163A2C" strokeWidth="6" strokeLinecap="round" /><path d="M36 -56 L58 -58 L56 -36 Z" fill="#163A2C" /></g>,
    water: <g><path d="M0 -54 C18 -28 40 -6 40 16 C40 40 22 54 0 54 C-22 54 -40 40 -40 16 C-40 -6 -18 -28 0 -54 Z" fill="#49B4F0" stroke="#1F7FB8" strokeWidth="4" /><path d="M-20 18 C-20 32 -10 40 2 42" stroke="#D4F0FF" strokeWidth="7" fill="none" strokeLinecap="round" /></g>,
    sack: <g><path d="M-40 -32 C-54 0 -56 38 -42 52 L42 52 C56 38 54 0 40 -32 Z" fill="#D9C39A" stroke="#9B7F50" strokeWidth="4" /><path d="M-30 -32 C-26 -48 26 -48 30 -32 Z" fill="#C2A878" stroke="#9B7F50" strokeWidth="4" /><rect x="-34" y="-36" width="68" height="9" rx="4" fill="#8A5A36" />{[[-14, 12], [14, 12], [0, 32]].map(([a, b], i) => <circle key={i} cx={a} cy={b} r="12" fill="#3FB56B" />)}</g>,
    care: <g><circle cx="0" cy="-26" r="19" fill="#C68B5E" /><path d="M-30 -32 C-26 -50 26 -50 30 -32 Z" fill="#fff" stroke="#9B7F50" strokeWidth="3" /><path d="M-34 54 C-34 8 -22 -4 0 -4 C22 -4 34 8 34 54 Z" fill="#F6F1E3" stroke="#9B7F50" strokeWidth="3" /><path d="M0 44 C-20 28 -22 14 -11 12 C-5 11 -1 16 0 21 C1 16 5 11 11 12 C22 14 20 28 0 44 Z" fill="#B3261E" /></g>,
  }[kind];
  return <g transform={`translate(${x} ${y}) scale(${k * clamp(o, 0.2, 1.15)})`} opacity={clamp(o, 0, 1)}><circle r="76" fill={SK.cream} stroke={SK.gold} strokeWidth="6" />{body}</g>;
}
function B2(ctx) {
  // The photo's head fills the frame, so it sits in a round portrait and the five icons orbit that.
  const CX = 500, CY = 470, RX = 400, RY = 322;
  return ({ localTime: lt, duration }) => {
    const cNative = W("b2", "native"), cHyb = W("b2", "hybrid"), cCrop = W("b2", "crop"), cClim = W("b2", "climate"), cSoil = W("b2", "soil"), cBud = W("b2", "budget"), cGoal = W("b2", "achieve");
    const items = [["crop", "CROP", cCrop], ["climate", "CLIMATE", cClim], ["soil", "SOIL", cSoil], ["budget", "BUDGET", cBud], ["goal", "GOALS", cGoal]];
    const pos = (i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / 5 + lt * 0.16; return [CX + RX * Math.cos(a), CY + RY * Math.sin(a)]; };
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[2]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(2, ctx, [L("Farmers choose by:", cCrop, "head"), L("CROP", cCrop), L("CLIMATE", cClim), L("SOIL", cSoil), L("BUDGET", cBud), L("GOALS", cGoal)], { max: 7 })}>
        <Pic slot="ready_field" label="A prepared field" x={40} y={60} w={1360} h={860} lt={lt} at={0} fx="zoom" dim={0.4} />
        <Pic slot="farmer_think" label="A farmer stops to think" x={260} y={230} w={480} h={480} r={240} lt={lt} at={0.1} fx="none" pos="22% 30%" />
        <Card x={1000} y={90} w={380} h={200} lt={lt} at={0.3} />
        <Big x={1018} y={106} w={350} lt={lt} at={0.3} size={48}>Not all seeds are the <span style={{ color: SK.gold }}>same!</span></Big>
        <SVG>
          <Stand kind="desi" x={1120} y={700} s={0.9} lt={lt} at={cNative} mood="smile" />
          <Stand kind="hybri" x={1300} y={700} s={0.9} lt={lt} at={cHyb} mood="joy" />
          {items.map(([k, , at], i) => { const [x, y] = pos(i); return <Ico key={k} kind={k} x={x} y={y} r={70} o={pop(lt, at, 0.5)} />; })}
        </SVG>
        <Tag kind="desi" x={1120} y={510} lt={lt} at={cNative + 0.1} size={32} text="NATIVE" />
        <Tag kind="hybri" x={1300} y={510} lt={lt} at={cHyb + 0.1} size={32} text="HYBRID" />
        {items.map(([k, name, at], i) => { const [x, y] = pos(i); return <Chip key={k} text={name} x={x} y={y + 54} lt={lt} at={at + 0.1} size={24} tone="gold" />; })}
      </Scene>
    );
  };
}
function B3(ctx) {
  return ({ localTime: lt, duration }) => {
    const cTrad = W("b3", "traditional"), cSaved = W("b3", "saved"), cGen = W("b3", "generations"), s2 = S("b3", 2), cWea = W("b3", "weather"), cSoil = W("b3", "soil"), cAd = W("b3", "adapted"), cHome = W("b3", "home");
    const gens = [{ slot: "gen_great", label: "A great-grandmother", name: "Great-grandmother", at: 0.2, first: 0 }, { slot: "gen_grandfather", label: "A grandfather", name: "Grandfather", at: cTrad }, { slot: "handover", label: "A mother", name: "Mother", at: cSaved }, { slot: "gen_child", label: "A child", name: "Child", at: cGen }];
    const box = rowBoxes(lt, gens, 40, 1360, 16), sh = gens.map((g, i) => (i === 0 ? 1 : out3(lt, g.at, 0.7)));
    let px = box[0][0] + box[0][1] / 2; for (let i = 1; i < 4; i++) px = lerp(px, box[i][0] + box[i][1] / 2, sh[i]);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[3]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(3, ctx, [L("Traditional varieties", cTrad), L("Grown and SAVED by farmers for GENERATIONS", cSaved), L("ADAPTED to local weather, soil and farming practices", cAd)])}>
        <Show lt={lt} a={-1} b={s2 + 0.3}>
          <Row lt={lt} items={gens} gap={16} chipY={84} chipSize={26} />
          <SVG><DesiPouch x={px} y={660} s={0.82} lt={lt} at={0.3} wave /></SVG>
        </Show>
        <Show lt={lt} a={s2}>
          <Row lt={lt} items={[{ slot: "desi_rain", label: "The same rice field in heavy rain", name: "RAIN", at: s2, first: s2 }, { slot: "desi_heat", label: "The same field in fierce heat", name: "HEAT", at: cWea }, { slot: "desi_drought", label: "The same field in drought", name: "DROUGHT", at: cSoil }]} chipY={84} chipSize={36} />
          <SVG><Stand kind="desi" x={720} y={600} s={1.35} lt={lt} at={cAd} mood="proud" armL={40} armR={40} /></SVG>
          <Chip text="ADAPTED" x={720} y={345} lt={lt} at={cAd + 0.2} tone="gold" size={46} />
          <Chip text="at HOME here" x={720} y={816} lt={lt} at={cHome} size={38} />
        </Show>
      </Scene>
    );
  };
}
function YieldBar({ x, kind, h, lt, at, y = 880 }) {
  const p = drive(lt, at, at + 1.2); if (p <= 0) return null;
  return <div style={{ position: "absolute", left: x, top: y - h * p, width: 120, height: h * p, background: kind === "desi" ? DESI_C : HYBRI_C, borderRadius: "10px 10px 0 0", boxShadow: "0 0 0 4px rgba(255,248,230,0.9)", zIndex: 2 }} />;
}
function B4(ctx) {
  return ({ localTime: lt, duration }) => {
    const cColl = W("b4", "collect"), cNat = W("b4", "native"), s1 = S("b4", 1), s2 = S("b4", 2), cAl = W("b4", "alive"), cBio = W("b4", "biodiversity"), s3 = S("b4", 3), cSome = W("b4", "some"), cSm = W("b4", "smaller"), cCert = W("b4", "certain");
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[4]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(4, ctx, [L(Yes("Collect and RE-SOW next season"), s1, "plain"), L(Yes("Preserve local BIODIVERSITY"), cBio, "plain"), L(No("Some give LOWER yields than certain hybrids"), cSm, "plain")])}>
        <Show lt={lt} a={-1} b={s2 + 0.3}>
          <Row lt={lt} items={[{ slot: "pick_ears", label: "Picking the best ears", name: "Pick the best ears", at: cColl, first: 0 }, { slot: "seed_pot_fill", label: "Saving the seed in a clay pot", name: "Save in a clay pot", at: cNat }, { slot: "sow_scatter", label: "Sowing them again", name: "Sow again", at: s1, pos: "20% center" }]} chipY={84} chipSize={30} />
          <Chip text="next season" x={1170} y={160} lt={lt} at={W("b4", "next")} tone="gold" size={32} />
        </Show>
        <Show lt={lt} a={s2} b={s3 + 0.3}>
          <Pic slot="rice_wall" label="A wall of many different rice grains" x={40} y={60} w={1360} h={860} lt={lt} at={s2} fx="pan" kenDur={8} />
          <Chip text="hundreds of varieties" x={720} y={96} lt={lt} at={s2 + 0.8} size={40} />
          <Chip text="BIODIVERSITY" x={720} y={186} lt={lt} at={cBio} tone="gold" size={54} />
          <SVG><DesiPouch x={1230} y={660} s={0.9} lt={lt} at={cAl} wave mood="joy" /></SVG>
        </Show>
        <Show lt={lt} a={s3}>
          <Pic slot="tn_paddy" label="A native rice field" x={40} y={60} w={670} h={860} lt={lt} at={s3} fx="zoom" />
          <Pic slot="hybrid_heavy" label="A taller, heavier crop" x={730} y={60} w={670} h={860} lt={lt} at={cSome} fx="zoom" />
          <YieldBar x={520} kind="desi" h={210} lt={lt} at={cSm} /><YieldBar x={1210} kind="hybri" h={430} lt={lt} at={cCert} />
          <Chip text="YIELD" x={580} y={892} lt={lt} at={cSm} size={26} /><Chip text="YIELD" x={1270} y={892} lt={lt} at={cCert} size={26} />
          <SVG><Stand kind="desi" x={210} y={740} s={0.9} lt={lt} at={s3 + 0.2} mood="unsure" /><Stand kind="hybri" x={900} y={740} s={0.9} lt={lt} at={cSome + 0.2} mood="smile" /></SVG>
          <Chip text="in some conditions" x={720} y={84} lt={lt} at={S("b4", 3) + 1.2} tone="gold" size={34} />
        </Show>
      </Scene>
    );
  };
}
function B5(ctx) {
  return ({ localTime: lt, duration }) => {
    const s1 = S("b5", 1), at = stopAt("b5", 1);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[5]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(5, ctx, [L("Why would a seed grown in the SAME village for 100 years do well there?", s1, "think")])}>
        <Pic slot="rainfed_village" label="A village field" x={40} y={60} w={1360} h={860} lt={lt} at={0} fx="none" />
        <SVG><Stand kind="desi" x={720} y={lerp(560, 420, out3(lt, at - 0.4, 0.6))} s={lerp(1.9, 1.5, out3(lt, at - 0.4, 0.6))} lt={lt} at={0.2} mood="proud" armL={38} armR={150 - 12 * Math.sin(lt * 3)} /></SVG>
        <Tag kind="desi" x={720} y={84} lt={lt} at={0.5} size={44} />
        <StopBand lt={lt} b="b5" heading="THINK">Why would a seed grown in the SAME village<br />for 100 years do well there?</StopBand>
      </Scene>
    );
  };
}
// A flat parent plant. Base at (x, base), height h. grain = how heavy the head is.
function Plant({ x, base, h, grain = 1, thick = 12, p = 1 }) {
  if (p <= 0) return null;
  const leaf = (k, sd) => { const y = -h * (0.16 + 0.17 * k), l = 92 + 34 * (3 - k), w = 22; return <path key={k + "" + sd} d={`M0 ${y} C${sd * l * 0.3} ${y - w * 2} ${sd * l * 0.8} ${y - w} ${sd * l} ${y + 26} C${sd * l * 0.7} ${y + 8} ${sd * l * 0.3} ${y + 12} 0 ${y + 14} Z`} fill="#4CA65A" stroke="#2C7A40" strokeWidth="3" />; };
  const n = Math.round(10 + 22 * grain), hd = 90 + 90 * grain;
  return <g transform={`translate(${x} ${base}) scale(${p})`}>
    <line x1="0" y1="0" x2="0" y2={-h} stroke={STICKER} strokeWidth={thick + 10} strokeLinecap="round" /><line x1="0" y1="0" x2="0" y2={-h} stroke="#2C7A40" strokeWidth={thick} strokeLinecap="round" />
    {[0, 1, 2, 3].map((k) => leaf(k, k % 2 ? 1 : -1))}
    {[...Array(n)].map((_, i) => { const t = i / (n - 1), sd = i % 3 === 0 ? 0 : i % 3 === 1 ? -1 : 1; return <ellipse key={i} cx={sd * (18 + 10 * grain) * Math.sin(Math.PI * clamp(t + 0.1, 0, 1))} cy={-h - t * hd} rx="13" ry="18" fill="#E9B23C" stroke="#A9761A" strokeWidth="2.5" />; })}
  </g>;
}
function Bugs({ x, y, lt, op }) {
  if (op <= 0) return null;
  return <g opacity={op}>
    <path d={`M${x - 150} ${y + 70} A160 170 0 0 1 ${x + 150} ${y + 70}`} stroke="#8DE0FF" strokeWidth="7" strokeDasharray="20 14" fill="none" strokeLinecap="round" />
    {[0, 1, 2, 3].map((i) => { const ph = (lt * 0.8 + i * 0.27) % 1, sd = i % 2 ? 1 : -1, a = (-90 + sd * (12 + i * 12)) * Math.PI / 180, R = 172 + 84 * Math.abs(Math.sin(Math.PI * ph));
      const bx = x + R * Math.cos(a), by = y + 70 + R * Math.sin(a);
      return <g key={i} transform={`translate(${bx} ${by}) rotate(${ph * 360})`}><ellipse rx="19" ry="13" fill="#33261C" stroke="#fff" strokeWidth="3" /><line x1="-8" y1="-13" x2="-14" y2="-23" stroke="#33261C" strokeWidth="4" /><line x1="8" y1="-13" x2="14" y2="-23" stroke="#33261C" strokeWidth="4" /></g>; })}
  </g>;
}
function Heart({ x, y, s = 1, op = 1 }) {
  if (op <= 0) return null;
  return <path transform={`translate(${x} ${y}) scale(${s})`} opacity={op} d="M0 62 C-74 12 -80 -36 -44 -46 C-22 -52 -6 -36 0 -22 C6 -36 22 -52 44 -46 C80 -36 74 12 0 62 Z" fill="#E2487B" stroke={STICKER} strokeWidth="7" />;
}
function B6(ctx) {
  return ({ localTime: lt, duration }) => {
    const cHy = W("b6", "hybri"), s1 = S("b6", 1), cTwo = W("b6", "two"), cSpec = W("b6", "something"), cCross = W("b6", "cross"), s3 = S("b6", 3), cHi = W("b6", "higher"), cUni = W("b6", "uniform"), cFast = W("b6", "faster"), cDis = W("b6", "disease");
    const A = out3(lt, cTwo, 0.7), B = out3(lt, W("b6", "parent"), 0.7), pol = clamp((lt - cCross) / 1.6, 0, 1), born = drive(lt, s3 - 0.1, s3 + 0.8);
    const dots = pol > 0 && pol < 1 ? [...Array(14)].map((_, i) => { const u = clamp(pol * 1.5 - i * 0.04, 0, 1), x = lerp(250, 1190, u), y = lerp(170, 500, u) - 170 * Math.sin(Math.PI * u); return u > 0 && u < 1 ? <circle key={i} cx={x} cy={y} r={9} fill="#FFE27A" stroke="#B8861B" strokeWidth="2.5" /> : null; }) : null;
    const hs = pop(lt, cCross + 0.5, 0.5) * (1 - reveal(lt, s3 + 0.2, 0.4));
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[6]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(6, ctx, [L("Made by CROSSING selected parent plants", cCross), L("Combine the BEST features:", s3, "head"), L("higher yield", cHi, "sub"), L("uniform size", cUni, "sub"), L("faster maturity", cFast, "sub"), L("disease resistance", cDis, "sub")], { max: 7 })}>
        <Pic slot="field_rows" label="A field sown in neat lines" x={40} y={60} w={1360} h={860} lt={lt} at={0} fx="zoom" dim={0.5} />
        <SVG>
          <HybriPacket x={720} y={430} s={1.5} lt={lt} at={cHy - 0.5} out={s1 - 0.2} />
          <Plant x={250} base={870} h={560} grain={1} p={A} />
          <Plant x={1190} base={870} h={300} grain={0.3} thick={22} p={B} />
          <Bugs x={1190} y={520} lt={lt} op={reveal(lt, cSpec, 0.5)} />
          {dots}
          <Heart x={720} y={210} s={1.1 * clamp(hs, 0, 1.2)} op={clamp(hs, 0, 1)} />
          <Stand kind="hybri" x={720} y={lerp(240, 640, born)} s={lerp(0.5, 1.22, born)} lt={lt} at={s3} mood="joy" armL={lerp(20, 140, reveal(lt, cHi, 0.5))} armR={lerp(20, 140, reveal(lt, cHi, 0.5))} />
        </SVG>
        <Tag kind="hybri" x={720} y={84} lt={lt} at={cHy} out={s1 - 0.2} size={46} />
        <Chip text="Parent A" x={250} y={872} lt={lt} at={cTwo + 0.2} size={28} />
        <Chip text="Parent B" x={1190} y={872} lt={lt} at={W("b6", "parent") + 0.2} size={28} />
        <Chip text="tall, lots of grain" x={250} y={100} lt={lt} at={cSpec} tone="gold" size={30} out={s3 + 0.2} />
        <Chip text="short but strong" x={1190} y={256} lt={lt} at={cSpec + 0.3} tone="gold" size={30} out={s3 + 0.2} />
        <Chip text="HIGH YIELD" x={720} y={84} lt={lt} at={cHi} tone="gold" size={38} />
        <Chip text="UNIFORM" x={720} y={158} lt={lt} at={cUni} tone="gold" size={38} />
        <Chip text="FAST" x={720} y={232} lt={lt} at={cFast} tone="gold" size={38} />
        <Chip text="DISEASE RESISTANT" x={720} y={306} lt={lt} at={cDis} tone="gold" size={38} />
      </Scene>
    );
  };
}
function B7(ctx) {
  return ({ localTime: lt, duration }) => {
    const cUni = W("b7", "uniform"), cBig = W("b7", "bigger"), cCond = W("b7", "conditions"), cSuit = W("b7", "suitable"), cProp = W("b7", "proper");
    const needs = [["water", 570, "water", cCond], ["sack", 880, "fertiliser", cSuit], ["care", 1190, "careful attention", cProp]];
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[7]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(7, ctx, [L(Yes("More UNIFORM crops"), cUni, "plain"), L(Yes("BETTER yields, when conditions are right and with proper CARE"), cBig, "plain")])}>
        <Pic slot="hybrid_even" label="A perfectly even field of tall maize" x={40} y={60} w={1360} h={860} lt={lt} at={0} fx="zoom" />
        <Chip text="more UNIFORM" x={500} y={96} lt={lt} at={cUni} tone="gold" size={44} />
        <Chip text="BIGGER harvests" x={980} y={96} lt={lt} at={cBig} tone="gold" size={44} />
        <SVG>
          <HybriPacket x={200} y={600} s={0.95} lt={lt} at={0.2} mood={lt > cCond ? "think" : "joy"} wave={lt < cCond} />
          {needs.map(([k, x, , at]) => <Ico key={k} kind={k} x={x} y={640} r={96} o={pop(lt, at, 0.5)} />)}
        </SVG>
        {needs.map(([k, x, name, at]) => <Chip key={k} text={name} x={x} y={752} lt={lt} at={at + 0.15} size={32} />)}
      </Scene>
    );
  };
}
function B8(ctx) {
  return ({ localTime: lt, duration }) => {
    const s1 = S("b8", 1), cSows = W("b8", "sows"), s2 = S("b8", 2), cMix = W("b8", "mixed"), cDiff = W("b8", "different"), cSp = W("b8", "speeds"), s3 = S("b8", 3), cBuy = W("b8", "buy"), cEv = W("b8", "every");
    const shrug = out3(lt, cMix, 0.5), ups = 22 + 100 * shrug + 8 * Math.sin(lt * 4) * shrug;
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[8]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(8, ctx, [L(No("Saved seeds do NOT give the same uniform crop next time"), cMix, "plain"), L(No("Farmers often BUY fresh seeds EVERY season"), cBuy, "plain")])}>
        <Show lt={lt} a={-1} b={s1 + 0.3}>
          <Pic slot="hybrid_even" label="The even hybrid field" x={40} y={60} w={1360} h={860} lt={lt} at={0} fx="none" dim={0.3} />
          <SVG><HybriPacket x={720} y={520} s={1.1} lt={lt} at={0.1} mood="think" wave={false} /></SVG>
          <Stamp text="THE TWIST" x={720} y={220} lt={lt} at={W("b8", "twist")} size={80} />
        </Show>
        <Show lt={lt} a={s1} b={s2 + 0.3}>
          <Row lt={lt} items={[{ slot: "hybrid_save", label: "Saving seed from the hybrid crop", name: "Saves seed", at: s1, first: s1 }, { slot: "seed_sow", label: "Sowing the saved seed", name: "Sows it next season", at: cSows }]} chipY={84} />
        </Show>
        <Show lt={lt} a={s2} b={s3 + 0.3}>
          <Pic slot="hybrid_mixed" label="The next crop comes up mixed" x={40} y={60} w={1360} h={860} lt={lt} at={s2} fx="zoom" />
          <Stamp text="MIXED" x={1150} y={190} lt={lt} at={cMix} size={84} rot={5} />
          <Chip text="some tall" x={230} y={110} lt={lt} at={cDiff} size={34} /><Chip text="some short" x={520} y={110} lt={lt} at={cDiff + 0.3} size={34} />
          <Chip text="some early" x={230} y={190} lt={lt} at={cSp - 0.1} size={34} /><Chip text="some late" x={520} y={190} lt={lt} at={cSp + 0.2} size={34} />
          <SVG><SeedGuy kind="hybri" x={1160} y={690} s={1.0} mood="unsure" armL={ups} armR={ups} tilt={-5 * shrug} t={lt} /></SVG>
        </Show>
        <Show lt={lt} a={s3}>
          <Pic slot="farmer_to_shop" label="The farmer walks back to the shop" x={40} y={60} w={1360} h={860} lt={lt} at={s3} fx="zoom" />
          <SVG>{[0, 1, 2].map((i) => { const o = pop(lt, cEv + i * 0.3, 0.5); return o > 0 ? <g key={i} transform={`translate(${170 + i * 200} 640) scale(${0.75 * clamp(o, 0, 1.1)})`}><PacketFront tag={i === 2} t={lt} /></g> : null; })}</SVG>
          <Chip text="BUY fresh seed" x={360} y={96} lt={lt} at={cBuy} tone="gold" size={44} />
          <Chip text="EVERY season" x={360} y={176} lt={lt} at={cEv} size={40} />
        </Show>
      </Scene>
    );
  };
}
function B9(ctx) {
  return ({ localTime: lt, duration }) => {
    const s1 = S("b9", 1), cCost = W("b9", "costly"), s2 = S("b9", 2), cSuit = W("b9", "suits"), at = stopAt("b9", 3);
    const pulse = 1 + 0.05 * Math.sin(lt * 3);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[9]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(9, ctx, [L("Does a COSTLY seed always grow better?", cCost, "head"), L("Or should farmers choose what SUITS their land and needs?", cSuit, "head")])}>
        <Pic slot="tn_paddy" label="A green paddy field" x={40} y={60} w={1360} h={860} lt={lt} at={0} fx="zoom" dim={0.25} />
        <SVG>
          <DesiPouch x={330} y={370} s={1.05} lt={lt} at={0.2} wave={false} mood="think" />
          <HybriPacket x={1110} y={370} s={1.05} lt={lt} at={0.4} wave={false} mood="think" />
          <g transform={`translate(720 ${380}) scale(${pop(lt, 0.6, 0.6) * pulse})`} opacity={clamp(reveal(lt, 0.6, 0.3), 0, 1)}>
            <circle r="130" fill={SK.gold} stroke={STICKER} strokeWidth="10" />
            <text x="0" y="74" textAnchor="middle" fontFamily={SERIF} fontWeight="700" fontSize="210" fill={SK.ink}>?</text></g>
        </SVG>
        <Tag kind="desi" x={330} y={90} lt={lt} at={0.3} size={40} /><Tag kind="hybri" x={1110} y={90} lt={lt} at={0.5} size={40} />
        <StopBand lt={lt} b="b9" heading="THE BIG QUESTION" from={s1}>Does a COSTLY seed always grow better?<br />Or should farmers choose what SUITS their land and needs?</StopBand>
      </Scene>
    );
  };
}
// Simple gene diagram: a double helix on a cream disc. Drawn so the slot needs no diagram of its own.
function Gene({ x, y, op = 1, lt = 0 }) {
  if (op <= 0) return null;
  const n = 15, a = [...Array(n)].map((_, i) => i / (n - 1));
  const P = (u, ph) => [-105 + 210 * u, 40 * Math.sin(u * 9 + ph + lt * 0.8)];
  const line = (ph) => "M" + [...Array(41)].map((_, i) => P(i / 40, ph).map((v) => v.toFixed(1)).join(" ")).join(" L ");
  return <g transform={`translate(${x} ${y})`} opacity={op}><rect x="-140" y="-84" width="280" height="168" rx="20" fill={SK.cream} stroke={SK.gold} strokeWidth="6" />
    {a.map((u, i) => { const [x1, y1] = P(u, 0), [x2, y2] = P(u, Math.PI); return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={i % 2 ? "#E2487B" : "#17A2A8"} strokeWidth="6" />; })}
    <path d={line(0)} stroke="#163A2C" strokeWidth="7" fill="none" /><path d={line(Math.PI)} stroke="#163A2C" strokeWidth="7" fill="none" /></g>;
}
function B10(ctx) {
  return ({ localTime: lt, duration }) => {
    const c0 = S("b10", 0), s1 = S("b10", 1), s2 = S("b10", 2), cLakh = W("b10", "one", 0), cHill = W("b10", "hills"), cFl = W("b10", "floods"), cDr = W("b10", "droughts"), cSal = W("b10", "salty");
    const s3 = S("b10", 3), cUP = W("b10", "uttar"), cHusk = W("b10", "black"), cAr = W("b10", "aroma"), s4 = S("b10", 4), s5 = S("b10", 5), cBorrow = W("b10", "borrow"), cRet = W("b10", "return"), cAlive = W("b10", "alive"),
      s6 = S("b10", 6), cCot = W("b10", "cotton"), cVeg = W("b10", "vegetables"), cWorld = W("b10", "world"), s7 = S("b10", 7), cNot = W("b10", "not"), s8 = S("b10", 8), cCross = W("b10", "crossing");
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[10]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(10, ctx, [L("India was once home to MORE THAN 100,000 rice varieties", cLakh), L("KALANAMAK rice (Uttar Pradesh): aroma prized; GI tag 2012", s3), L("COMMUNITY SEED BANKS preserve traditional varieties", s5), L("Hybrid maize, cotton and vegetables are grown worldwide", s6), L("HYBRID ≠ GM", cNot, "big")], { max: 5, titleAt: 0.1 })}>
        <Show lt={lt} a={0} b={s2 + 0.3}>
          <Pic slot="rice_wall" label="A wall of rice grains in every colour" x={40} y={60} w={1360} h={860} lt={lt} at={0} fx="zoom" dim={0.45} />
          <window.TPStory.Flip x={330} y={270} w={780} h={300} lt={lt} at={c0} q="DID YOU KNOW?" size={72} />
          <Chip text="a TREASURE!" x={720} y={610} lt={lt} at={W("b10", "treasure")} tone="gold" size={48} />
        </Show>
        <Show lt={lt} a={s2} b={s3 + 0.3}>
          <Pic slot="rice_wall" label="A wall of rice grains in every colour" x={40} y={60} w={1360} h={860} lt={lt} at={s2} fx="pan" kenDur={8} />
          <Card x={230} y={250} w={980} h={230} lt={lt} at={cLakh} />
          <Big x={40} y={272} w={1360} lt={lt} at={cLakh} size={92} align="center"><span style={{ color: SK.gold }}>MORE than ONE LAKH</span></Big>
          <Big x={40} y={392} w={1360} lt={lt} at={cLakh + 0.5} size={52} align="center">rice varieties</Big>
          <Chip text="hills" x={320} y={560} lt={lt} at={cHill} size={40} /><Chip text="floods" x={580} y={560} lt={lt} at={cFl} size={40} />
          <Chip text="droughts" x={860} y={560} lt={lt} at={cDr} size={40} /><Chip text="salty coasts" x={1160} y={560} lt={lt} at={cSal} size={40} />
        </Show>
        <Show lt={lt} a={s3} b={s5 + 0.3}>
          <Row lt={lt} items={[{ slot: "up_fields", label: "Rice fields of eastern Uttar Pradesh", name: "Uttar Pradesh", at: cUP, first: s3 }, { slot: "kalanamak_husk", label: "Kalanamak rice with its black husk", name: "black husk", at: cHusk }, { slot: "kalanamak_bowl", label: "A fragrant bowl of Kalanamak rice", name: "wonderful aroma", at: cAr }]} />
          <Badge text="KALANAMAK RICE" x={70} y={90} lt={lt} at={W("b10", "kalanamak")} size={36} />
          <Chip text="Legend links it to the BUDDHA" x={720} y={400} lt={lt} at={s4} tone="gold" size={44} />
        </Show>
        <Show lt={lt} a={s5} b={s6 + 0.3}>
          <Pic slot="seed_bank_shelves" label="A village community seed bank" x={40} y={60} w={1360} h={860} lt={lt} at={s5} fx="zoom" />
          <Badge text="COMMUNITY SEED BANK" x={70} y={90} lt={lt} at={s5 + 0.4} size={40} />
          <Chip text="borrow" x={300} y={770} lt={lt} at={cBorrow} size={40} /><Chip text="return" x={560} y={770} lt={lt} at={cRet} size={40} />
          <Chip text="old varieties ALIVE" x={1020} y={770} lt={lt} at={cAlive} tone="gold" size={44} />
        </Show>
        <Show lt={lt} a={s6} b={s7 + 0.3}>
          <Row lt={lt} items={[{ slot: "field_maize", label: "Maize", name: "Maize", at: s6 + 0.5, first: s6 }, { slot: "cotton_field", label: "Cotton", name: "Cotton", at: cCot }, { slot: "veg_garden", label: "Vegetables", name: "Vegetables", at: cVeg }]} />
          <Badge text="HYBRID" x={70} y={90} lt={lt} at={W("b10", "hybrid")} size={40} />
          <Chip text="all over the world" x={720} y={96} lt={lt} at={cWorld} tone="gold" size={44} />
        </Show>
        <Show lt={lt} a={s7}>
          <Pic slot="hand_cross" label="A breeder cross-pollinates a flower by hand" x={40} y={60} w={670} h={860} lt={lt} at={s7} fx="zoom" />
          <Pic slot="lab_periwinkle" label="Scientists in a laboratory" x={730} y={60} w={670} h={860} lt={lt} at={s7 + 0.3} fx="zoom" />
          <SVG><Gene x={1180} y={640} op={out3(lt, s7 + 0.6, 0.5)} lt={lt} /></SVG>
          <Card x={420} y={84} w={600} h={150} lt={lt} at={cNot} />
          <Big x={40} y={104} w={1360} lt={lt} at={cNot} size={88} align="center">HYBRID <span style={{ color: SK.gold }}>≠</span> GM</Big>
          <Chip text="hybrid: CROSSING parent plants" x={375} y={790} lt={lt} at={cCross} tone="gold" size={32} />
          <Chip text="GM: made in a lab" x={1065} y={790} lt={lt} at={cCross + 0.4} size={32} />
        </Show>
      </Scene>
    );
  };
}
function B11(ctx) {
  return ({ localTime: lt, duration }) => {
    const s1 = S("b11", 1), cExp = W("b11", "expensive"), s2 = S("b11", 2), s3 = S("b11", 3), cCl = W("b11", "climate"), cSoil = W("b11", "soil"), cWat = W("b11", "water"), cBud = W("b11", "budget"), cPur = W("b11", "purpose");
    const meet = drive(lt, 0.2, 1.3), sh = Math.sin(lt * 7) * 6 * reveal(lt, 1.3, 0.3);
    const words = [["CLIMATE", 210, cCl], ["SOIL", 470, cSoil], ["WATER", 690, cWat], ["BUDGET", 930, cBud], ["PURPOSE", 1200, cPur]];
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[11]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(11, ctx, [L("The best seed is not always the most EXPENSIVE", cExp, "big"), L("Choose the seed that matches CLIMATE, SOIL, WATER, BUDGET and PURPOSE", s3)])}>
        <Show lt={lt} a={-1} b={s3 + 0.3}>
          <Pic slot="tn_paddy" label="A green paddy field" x={40} y={60} w={1360} h={860} lt={lt} at={0} fx="zoom" />
          <Badge text="THE BIG IDEA" x={70} y={90} lt={lt} at={0.3} size={40} />
          <SVG>
            <Stand kind="desi" x={lerp(330, 590, meet)} y={420} s={1.25} lt={lt} at={0} mood="joy" armL={18} armR={72 + sh} />
            <Stand kind="hybri" x={lerp(1110, 850, meet)} y={420} s={1.25} lt={lt} at={0} mood="joy" armL={72 - sh} armR={18} />
          </SVG>
          <Card x={150} y={636} w={1140} h={240} lt={lt} at={s1} />
          <Big x={40} y={656} w={1360} lt={lt} at={s1} size={50} align="center">The best seed is NOT always<br />the most <span style={{ color: SK.gold }}>EXPENSIVE</span></Big>
          <Big x={40} y={790} w={1360} lt={lt} at={s2} size={38} align="center">or the one that PROMISES the biggest harvest</Big>
        </Show>
        <Show lt={lt} a={s3}>
          <Row lt={lt} h={680} items={[{ slot: "ready_field", label: "His land", name: "his land", at: s3, first: s3 }, { slot: "clouds_farmer", label: "The sky", name: "the sky", at: cCl }, { slot: "farmer_wallet", label: "His wallet", name: "his wallet", at: cBud - 0.8 }]} chipY={84} />
          <Pic slot="farmer_packets" label="The farmer picks his seed" x={40} y={60} w={1360} h={680} lt={lt} at={cPur - 0.2} fx="pop" pos="center 22%" />
          {words.map(([t, x, at]) => <Chip key={t} text={t} x={x} y={778} lt={lt} at={at} tone="gold" size={38} />)}
        </Show>
      </Scene>
    );
  };
}
function B12(ctx) {
  return ({ localTime: lt, duration }) => {
    const q1 = S("b12", 1), q2 = S("b12", 2), q3 = S("b12", 3), stop = stopAt("b12", 3), a1 = S("b12", 4), a2 = S("b12", 5), a3 = S("b12", 6), cT = S("b12", 7);
    const rows = [["Which seeds can farmers save and re-sow?", q1, "desi", "NATIVE seeds", a1], ["How are hybrid seeds made?", q2, "hybri", "By CROSSING selected parent plants", a2], ["Is every hybrid a GM seed?", q3, "hybri", "NO!", a3]];
    const hold = windowOp(lt, stop, stop + 14.8, 0.3);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[12]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(12, ctx, [L("1. Which seeds can farmers save and re-sow?", q1), L("2. How are hybrid seeds made?", q2), L("3. Is every hybrid a GM seed?", q3)])}>
        <div style={{ position: "absolute", left: 40, top: 60, width: 1360, height: 860, borderRadius: 26, background: "rgba(5,30,22,0.86)", boxShadow: "0 0 0 3px rgba(226,176,76,0.9)", boxSizing: "border-box", padding: "30px 60px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20 }}>
            <svg width="62" height="62" viewBox="0 0 90 90"><circle cx="45" cy="45" r="43" fill={SK.gold} /><rect x="28" y="24" width="12" height="42" rx="4" fill={SK.ink} /><rect x="50" y="24" width="12" height="42" rx="4" fill={SK.ink} /></svg>
            <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 34, letterSpacing: "0.08em", color: SK.ink, background: SK.gold, padding: "9px 28px", borderRadius: 14 }}>QUICK CHECK</div>
          </div>
          {rows.map(([q, t, kind, ans, at], i) => { const o = out3(lt, t, 0.5);
            return <div key={i} style={{ position: "relative", height: 168, opacity: o, transform: `translateY(${(1 - o) * 12}px)` }}>
              <div style={{ display: "flex", gap: 22, alignItems: "baseline", paddingTop: 14 }}>
                <span style={{ flex: "none", width: 46, fontFamily: SERIF, fontWeight: 700, fontSize: 48, color: SK.gold }}>{i + 1}</span>
                <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 48, lineHeight: 1.15, color: SK.white, whiteSpace: "nowrap" }}>{q}</span></div>
              <Tag kind={kind} x={68} y={88} lt={lt} at={at} size={40} text={ans} anchor="left" />
            </div>; })}
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 24, textAlign: "center", fontFamily: SANS, fontSize: 26, color: SK.dim, opacity: hold }}>Stop 3 of {STOPS.length}</div>
        </div>
        <Big x={110} y={778} w={880} lt={lt} at={cT} size={44}>Tradition and technology, and a <span style={{ color: SK.gold }}>SMART</span> farmer chooses wisely!</Big>
        <SVG>
          <Stand kind="desi" x={1080} y={770} s={0.82} lt={lt} at={cT} mood="joy" armL={22} armR={68} />
          <Stand kind="hybri" x={1262} y={770} s={0.82} lt={lt} at={cT + 0.15} mood="joy" armL={68} armR={22} />
        </SVG>
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
const COLLAGE = [{ slot: "tn_paddy", x: -60, y: -40, w: 760, h: 520, ph: 0 }, { slot: "field_rows", x: 640, y: -80, w: 760, h: 520, ph: 2 },
  { slot: "rainfed_village", x: -80, y: 520, w: 700, h: 560, ph: 4 }, { slot: "cotton_field", x: 560, y: 560, w: 820, h: 560, ph: 1 }];
function Lp29Scenes(props = {}) {
  const caps = props.showCaptions === "false" ? false : props.showCaptions !== false;
  const titles = {};
  for (let n = 1; n <= NB; n++) titles[n] = str(props["title" + n + "Text"], TITLES[n]);
  const ctx = { caps, titles, capSize: num(props.captionSize, 34) };
  const B = [B1, B2, B3, B4, B5, B6, B7, B8, B9, B10, B11, B12];
  const beats = B.map((Bn, i) => { const t = BEAT("b" + (i + 1)); return [t.start, t.start + t.dur, Bn]; });
  return (
    <StoryFrame props={props} dur={DUR} persistKey="thinkpro-lp29-native-and-hybrid-seeds" collage={COLLAGE}>
      {beats.map(([s, e, Bn], i) => (
        <Sprite key={i} start={s} end={e}>{Bn(ctx)}</Sprite>
      ))}
      {STOPS.map(([b, i, hold]) => <StopAt key={b} t={BEAT(b).start + stopAt(b, i)} hold={hold - 0.2} />)}
      <ChimeAt t={BEAT("b10").start + S("b10", 0, 0)} />
      <AudioSync />
    </StoryFrame>
  );
}
window.Lp29Scenes = Lp29Scenes;
