/* global React, window */
// ThinkPro Academy — "Farming Tool Safety" (Grade 6 Agriculture, Session 18, V1).
// After AG_G6_S18 Video Script (Subrata, 4 Nov 2026): 11 script scenes as 10 voiced beats. Script scene 8
// (silent break on plain dark green + a soft bell) is the end of b7's hold and the first moment of b8.
// Seven numbered INSTRUCTIONS, each on a yellow card (#F2C200), shown right way (green tick) then wrong way
// (red cross). Running idea: the SAFETY SHIELD in the corner gains one star per instruction, and the stars turn
// gold in the recap. Central drawn object: the PEGBOARD with an outlined place for every tool (b7, Stop 3).
// Five presenter stops (TPStory.StopAt: the web player freezes, the export holds the card).
// STORY STYLE (engine/story-kit.jsx). Pure function of time.
const { Sprite } = window;
const { reveal, windowOp } = window.TPMotion;
const { num, str } = window.TPStage;
const { SK, SERIF, SANS, LEFT_W, PANEL_X, PANEL_W, PAD, pop, out3, lerp, drive,
  Pic, Chip, Panel, SVG, Arrow, T, ChimeAt, Scene, StoryFrame, StopAt } = window.TPStory;

// ---- Timing: EVERYTHING is keyed to the narration (tools/fit_timing.py → timing.js).
const TM = window.TP_TIMING;
if (!TM) console.error("timing.js missing — run: python3 tools/fit_timing.py videos/lp18-farming-tool-safety");
const LEAD = TM ? TM.lead : 1.0;
const DUR = TM ? TM.total : 250;
const BEAT = (id) => TM.beats[id];
function W(id, pat, n = 0, lead = 0.25) {
  const p = pat.toLowerCase(); let c = 0;
  for (const [w, st] of BEAT(id).words) if (w === p || w.startsWith(p)) { if (c++ === n) return LEAD + st - lead; }
  console.warn("cue word not found:", id, pat); return LEAD;
}
const S = (id, i, lead = 0.25) => LEAD + BEAT(id).sentences[i].start - lead;
const SE = (id, i) => LEAD + BEAT(id).sentences[i].end;
const LAST = (id) => BEAT(id).sentences.length - 1;
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
const NB = 10;
const CAPS = {};
if (TM) for (let n = 1; n <= NB; n++) CAPS[n] = capsFor("b" + n);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// ---- Colours the script names (the kit has no yellow card, green tick or red) -------
const YEL = "#F2C200", OK = "#2E9E4F", NO = "#D32F2F";

// ---- Panel copy. Title defaults mirror the DC data-props (titleNText) — keep in sync. ----
const TITLES = { 1: "LP18 – Farming Tool Safety", 2: "GEAR UP", 3: "SPACE", 4: "WALK", 5: "PASS", 6: "NEVER", 7: "CLEAN UP", 8: "FIRST AID", 9: "THE 7 INSTRUCTIONS", 10: "REMEMBER" };
const KICK = "Grade 6 · Agriculture · Session 18";
const L = (text, at, kind = "big", extra = {}) => ({ text, at, kind, ...extra });

// ---- Presenter stops. pre = silent seconds before the stop inside the same pauseAfter; hold = the stop itself.
// (b7's pauseAfter of 12 s is the wrong way 3 s + stop 6 s + break 3 s.)
const STOPS = [
  { b: "b1", pre: 0, hold: 15 },
  { b: "b6", pre: 0, hold: 15 },
  { b: "b7", pre: 3, hold: 15 },
  { b: "b8", pre: 0, hold: 15 },
  { b: "b10", pre: 0, hold: 15 },
];
const stopFor = (b) => STOPS.find((s) => s.b === b);
const stopAt = (b) => SE(b, LAST(b)) + 0.1 + stopFor(b).pre;       // beat-local start of the stop
const QUICK = ["When must you wear a mask?", "How far should others be from you?", "How do you carry a sharp tool?", "How do you pass a sharp tool to a friend?", "What are the four steps for a minor cut?"];

function PauseIcon({ size = 58 }) {
  return <svg width={size} height={size} viewBox="0 0 90 90" style={{ flex: "none" }}><circle cx="45" cy="45" r="43" fill={SK.gold} /><rect x="28" y="24" width="12" height="42" rx="4" fill={SK.ink} /><rect x="50" y="24" width="12" height="42" rx="4" fill={SK.ink} /></svg>;
}
// The kit's StopCard is full-size with a fixed heading; these stops freeze ON a picture, so this card is placed and titled per stop.
function Stop({ lt, b, heading, x = 40, y = 36, w = LEFT_W - 80, h = 910, q, qSize = 54, children, foot = true }) {
  const s = stopFor(b), at = stopAt(b), n = STOPS.indexOf(s) + 1;
  const o = windowOp(lt, at, at + s.hold, 0.35); if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 26, background: "rgba(5,30,22,0.9)", opacity: o, zIndex: 3,
      boxShadow: "0 0 0 3px rgba(226,176,76,0.9)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 50px", boxSizing: "border-box", textAlign: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <PauseIcon />
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 30, letterSpacing: "0.08em", color: SK.ink, background: SK.gold, padding: "8px 26px", borderRadius: 14, whiteSpace: "nowrap" }}>{heading}</div>
      </div>
      {q && <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: qSize, lineHeight: 1.2, color: SK.white, marginTop: 24 }}>{q}</div>}
      {children}
      {foot && <div style={{ fontFamily: SANS, fontSize: 24, color: SK.dim, marginTop: 18 }}>Stop {n} of {STOPS.length}</div>}
    </div>
  );
}

// ---- Right way / wrong way ---------------------------------------------------------
function Mark({ ok = true, x, y, s = 150, lt, at, out = null }) {
  const o = pop(lt, at, 0.45) * (out != null ? 1 - reveal(lt, out, 0.3) : 1); if (o <= 0) return null;
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" style={{ position: "absolute", left: x, top: y, opacity: clamp(o, 0, 1), transform: `scale(${0.6 + 0.4 * o})`, filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.45))", zIndex: 2 }}>
      <circle cx="50" cy="50" r="47" fill={ok ? OK : NO} stroke={SK.white} strokeWidth="5" />
      {ok ? <path d="M26 53 L43 70 L75 33" fill="none" stroke={SK.white} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
        : <path d="M31 31 L69 69 M69 31 L31 69" fill="none" stroke={SK.white} strokeWidth="12" strokeLinecap="round" />}
    </svg>
  );
}
function Way({ ok = true, text, x, y, lt, at, out = null, size = 28 }) {
  const o = pop(lt, at) * (out != null ? 1 - reveal(lt, out, 0.3) : 1); if (o <= 0) return null;
  return <div style={{ position: "absolute", left: x, top: y, transform: `translateX(-50%) scale(${0.9 + 0.1 * o})`, transformOrigin: "center top", opacity: clamp(o, 0, 1), fontFamily: SANS, fontWeight: 700, zIndex: 2,
    fontSize: size, color: SK.white, background: ok ? OK : NO, padding: "6px 22px", borderRadius: 999, whiteSpace: "nowrap", boxShadow: "0 2px 10px rgba(0,0,0,0.3)" }}>{text}</div>;
}
// A photo with its verdict: ok true/false puts a tick/cross on it and tints the edge. Mark sits top-right, clear of the shield.
const FULL = { x: 40, y: 36, w: 1360, h: 910 };
function Shot({ slot, label, lt, at, out = null, ok = null, x = FULL.x, y = FULL.y, w = FULL.w, h = FULL.h, fx = "zoom", markAt, way, s = 150, zoom = 1.1 }) {
  const edge = ok === true ? OK : ok === false ? NO : null;
  return (
    <>
      <Pic slot={slot} label={label} lt={lt} at={at} out={out} x={x} y={y} w={w} h={h} fx={fx} zoom={zoom} style={edge ? { boxShadow: `0 0 0 6px ${edge}` } : undefined} />
      {ok != null && <Mark ok={ok} x={x + w - s - 24} y={y + 24} s={s} lt={lt} at={markAt != null ? markAt : at + 0.3} out={out} />}
      {way && ok != null && <Way ok={ok} text={way} x={x + w / 2} y={y + h - 62} lt={lt} at={(markAt != null ? markAt : at + 0.3) + 0.1} out={out} />}
    </>
  );
}
// Speech bubble (the two calls in the pass). tail: "l" or "r".
function Say({ text, x, y, lt, at, out = null, tail = "l" }) {
  const o = pop(lt, at, 0.45) * (out != null ? 1 - reveal(lt, out, 0.3) : 1); if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: clamp(o, 0, 1), transform: `scale(${0.8 + 0.2 * o})`, transformOrigin: tail === "l" ? "left bottom" : "right bottom", zIndex: 2,
      fontFamily: SERIF, fontWeight: 700, fontSize: 46, color: SK.ink, background: SK.cream, padding: "16px 34px", borderRadius: 26, whiteSpace: "nowrap", boxShadow: "0 6px 18px rgba(0,0,0,0.35)" }}>
      “{text}”
      <div style={{ position: "absolute", bottom: -22, [tail === "l" ? "left" : "right"]: 44, width: 0, height: 0, borderLeft: "16px solid transparent", borderRight: "16px solid transparent", borderTop: `26px solid ${SK.cream}` }} />
    </div>
  );
}

// ---- The instruction card on the right panel ----------------------------------------
function FirstAidIcon({ s = 66 }) {
  return <svg width={s} height={s} viewBox="0 0 100 100" style={{ flex: "none" }}><rect x="3" y="3" width="94" height="94" rx="20" fill={NO} /><path d="M38 18 h24 v20 h20 v24 h-20 v20 h-24 v-20 h-20 v-24 h20 Z" fill={SK.white} /></svg>;
}
function Instr({ lt, at, n, word, aid = false, lines = [], max = 7, bottom }) {
  const o = pop(lt, at, 0.5);
  return (
    <>
      {o > 0 && <div style={{ position: "absolute", left: PANEL_X + PAD - 12, top: 40, width: PANEL_W - PAD * 2 + 24, height: 160, borderRadius: 18, background: YEL, opacity: clamp(o, 0, 1), transform: `scale(${0.86 + 0.14 * o})`, boxSizing: "border-box",
        padding: "16px 22px", display: "flex", alignItems: "center", gap: 16, boxShadow: "0 6px 16px rgba(0,0,0,0.22)" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 25, letterSpacing: "0.1em", color: SK.ink }}>INSTRUCTION {n}</div>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: word.length > 8 ? 52 : 60, lineHeight: 1.08, color: SK.ink, whiteSpace: "nowrap" }}>{word}</div>
        </div>
        {aid && <FirstAidIcon />}
      </div>}
      <div style={{ position: "absolute", left: 0, top: 170, width: 1920, height: 910 }}>
        <Panel lt={lt} lines={lines} max={max} bottom={bottom} />
      </div>
    </>
  );
}

// ---- Drawn tools (flat). Origin = the hook; head up, handle down. --------------------
const WOOD = "#B5824A", IRON = "#AEB7BC", IRON2 = "#7F8A90", GRIP = "#C8473A", MUD = "#4A3628";
const TOOLS = {
  hoe: [["rect", { x: -7, y: 0, width: 14, height: 300, rx: 6 }, WOOD], ["path", { d: "M-8 -8 L-74 -8 L-88 56 L-40 56 L-8 16 Z" }, IRON]],
  spade: [["rect", { x: -7, y: 0, width: 14, height: 240, rx: 6 }, WOOD], ["rect", { x: -34, y: 232, width: 68, height: 16, rx: 7 }, WOOD], ["path", { d: "M-44 0 L44 0 L44 -70 Q 34 -118 0 -130 Q -34 -118 -44 -70 Z" }, IRON]],
  rake: [["rect", { x: -7, y: 0, width: 14, height: 300, rx: 6 }, WOOD], ["rect", { x: -74, y: -14, width: 148, height: 18, rx: 5 }, IRON2],
    ...[-66, -42, -18, 6, 30, 54].map((tx) => ["rect", { x: tx, y: -48, width: 11, height: 40, rx: 3 }, IRON])],
  sickle: [["rect", { x: -8, y: 30, width: 16, height: 120, rx: 7 }, WOOD], ["path", { d: "M-6 36 C -22 -56 40 -130 124 -112 C 66 -104 22 -52 8 36 Z" }, IRON]],
  khurpi: [["rect", { x: -9, y: 60, width: 18, height: 96, rx: 8 }, WOOD], ["rect", { x: -4, y: 30, width: 8, height: 36, rx: 3 }, IRON2], ["path", { d: "M0 34 L-46 -6 L-8 -74 L44 -12 Z" }, IRON]],
  trowel: [["rect", { x: -9, y: 70, width: 18, height: 92, rx: 8 }, WOOD], ["rect", { x: -4, y: 24, width: 8, height: 52, rx: 3 }, IRON2], ["path", { d: "M-36 28 L36 28 Q 34 -44 0 -86 Q -34 -44 -36 28 Z" }, IRON]],
  secateurs: [["path", { d: "M-5 14 C -12 60 -30 96 -24 150 L -8 150 C -10 100 8 60 6 14 Z" }, GRIP], ["path", { d: "M5 14 C 12 60 30 96 24 150 L 8 150 C 10 100 -8 60 -6 14 Z" }, GRIP],
    ["path", { d: "M-10 16 C -22 -30 -10 -66 10 -86 C 14 -50 12 -14 10 16 Z" }, IRON], ["circle", { cx: 0, cy: 14, r: 7 }, IRON2]],
};
function Tool({ kind, x, y, s = 1, rot = 0, ghost = false, mud = false, op = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={op}>
      {TOOLS[kind].map(([tag, p, fill], i) => React.createElement(tag, { key: i, ...p,
        fill: ghost ? "rgba(15,61,46,0.20)" : fill, stroke: ghost ? "rgba(15,61,46,0.75)" : "none", strokeWidth: ghost ? 2.5 / s : 0, strokeDasharray: ghost ? `${7 / s} ${5 / s}` : undefined }))}
      {mud && !ghost && <g fill={MUD}>
        <path d="M-44 -10 L44 -14 L44 -70 Q 20 -40 8 -74 Q -8 -30 -30 -58 Z" />
        <circle cx="-30" cy="24" r="9" /><circle cx="12" cy="52" r="7" /><circle cx="-2" cy="112" r="6" /><path d="M-8 0 h16 v30 h-16 Z" />
      </g>}
    </g>
  );
}
const PEG_ORDER = ["hoe", "spade", "rake", "sickle", "khurpi", "trowel", "secateurs"];
// mess: { tool: slotIndex } moves tools onto someone else's outline; muddy: a muddy tool; hide: tools not yet on the board.
function Pegboard({ x, y, w, h, s = 1, mess = {}, muddy = null, hide = [], fly = null, op = 1 }) {
  if (op <= 0) return null;
  const gap = (w - 90) / PEG_ORDER.length, slotX = (i) => x + 65 + gap * (i + 0.5) - (i === 3 ? 30 : 0), hookY = y + 150 * s;
  return (
    <SVG op={op}>
      <defs><pattern id="pegholes18" width="34" height="34" patternUnits="userSpaceOnUse"><circle cx="17" cy="17" r="3.2" fill="rgba(70,45,20,0.28)" /></pattern></defs>
      <rect x={x} y={y} width={w} height={h} rx={16} fill="#E2CCA0" stroke={WOOD} strokeWidth={10} />
      <rect x={x} y={y} width={w} height={h} rx={16} fill="url(#pegholes18)" />
      {PEG_ORDER.map((k, i) => <g key={k}><Tool kind={k} x={slotX(i)} y={hookY} s={s} ghost /><circle cx={slotX(i)} cy={hookY - 2} r={6} fill="#6C4A24" /></g>)}
      {PEG_ORDER.map((k, i) => {
        if (hide.includes(k)) return null;
        const at = mess[k] != null ? mess[k] : i;
        return <Tool key={k} kind={k} x={slotX(at)} y={hookY} s={s} mud={muddy === k} />;
      })}
      {fly && <Tool kind={fly.kind} x={lerp(fly.fx, slotX(PEG_ORDER.indexOf(fly.kind)), fly.p)} y={lerp(fly.fy, hookY, fly.p)} s={s} />}
    </SVG>
  );
}

// ---- The safety shield: seven stars. earned = n of 7 cream; gold = n of 7 gold -----------
function Star({ cx, cy, r, fill, stroke }) {
  const p = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r * 0.45 : r; p.push(`${cx + q * Math.cos(a)},${cy + q * Math.sin(a)}`); }
  return <polygon points={p.join(" ")} fill={fill} stroke={stroke} strokeWidth={r * 0.1} strokeLinejoin="round" />;
}
const STAR_XY = [[64, 58], [136, 58], [38, 106], [100, 100], [162, 106], [70, 154], [130, 154]];
function Shield({ x, y, s = 1, earned = 0, gold = 0, glow = 0, op = 1, pulse = null }) {
  if (op <= 0) return null;
  return (
    <svg width={200 * s} height={240 * s} viewBox="0 0 200 240" style={{ position: "absolute", left: x, top: y, opacity: op, overflow: "visible", zIndex: 2, filter: `drop-shadow(0 0 ${6 + 34 * glow}px rgba(242,194,0,${0.25 + 0.7 * glow}))` }}>
      <path d="M100 8 C 132 26 164 32 192 32 L192 118 C 192 176 148 214 100 234 C 52 214 8 176 8 118 L8 32 C 36 32 68 26 100 8 Z" fill={SK.bg0} stroke={glow > 0.5 ? YEL : SK.white} strokeWidth="7" />
      {STAR_XY.map(([cx, cy], i) => {
        const on = i < gold ? "#F2C200" : i < earned ? SK.cream : "rgba(255,255,255,0.08)";
        const k = pulse && pulse[0] === i ? 1 + 0.5 * Math.sin(Math.PI * pulse[1]) : 1;
        return <Star key={i} cx={cx} cy={cy} r={25 * k} fill={on} stroke={i < earned ? "none" : "rgba(255,255,255,0.65)"} />;
      })}
    </svg>
  );
}

// ---- Top-view arm's-length check ----------------------------------------------------
function ArmCheck({ x, y, w, h, lt, at, turnA, turnB, doneAt }) {
  const o = out3(lt, at, 0.6); if (o <= 0) return null;
  const cx = x + w / 2, cy = y + h / 2 - 8, R = 190, ang = -90 - 360 * drive(lt, turnA, turnB) + 180;
  const ok = lt >= doneAt, ring = ok ? "#8BD48A" : SK.white;
  const others = [[-1, -1, 300], [1, -0.5, 300], [0.7, 1, 305], [-1, 0.8, 300]].map(([dx, dy, d]) => { const n = Math.hypot(dx, dy); return [cx + dx / n * d, cy + dy / n * Math.min(d, 270)]; });
  const Head = ({ px, py, r = 36, c = SK.gold }) => <g><ellipse cx={px} cy={py} rx={r * 1.25} ry={r * 0.7} fill={c} /><circle cx={px} cy={py} r={r * 0.62} fill="#2B2B2B" /></g>;
  const a = ang * Math.PI / 180;
  return (
    <SVG op={o}>
      <rect x={x} y={y} width={w} height={h} rx={18} fill="rgba(5,30,22,0.72)" stroke="rgba(255,255,255,0.45)" strokeWidth={3} />
      <T x={x + w / 2} y={y + 52} size={32} bold serif>Seen from above</T>
      <circle cx={cx} cy={cy} r={R} stroke={ring} strokeWidth={4} strokeDasharray="14 12" fill={ok ? "rgba(46,158,79,0.20)" : "rgba(255,255,255,0.05)"} />
      {others.map(([px, py], i) => <Head key={i} px={px} py={py} r={30} c="#9FB8AC" />)}
      <line x1={cx} y1={cy} x2={cx + R * Math.cos(a)} y2={cy + R * Math.sin(a)} stroke={SK.gold} strokeWidth={13} strokeLinecap="round" />
      <circle cx={cx + R * Math.cos(a)} cy={cy + R * Math.sin(a)} r={11} fill={SK.gold} />
      <Head px={cx} py={cy} />
    </SVG>
  );
}

// ---- Khurpi turns to blade-down (inset) ----------------------------------------------
function BladeDown({ x, y, w, h, lt, at, turnA, turnB, groundAt, out }) {
  const o = out3(lt, at, 0.5) * (out != null ? 1 - reveal(lt, out, 0.35) : 1); if (o <= 0) return null;
  const rot = lerp(70, 180, drive(lt, turnA, turnB));
  const ga = reveal(lt, groundAt, 0.5);
  return (
    <SVG op={o}>
      <rect x={x} y={y} width={w} height={h} rx={18} fill="rgba(5,30,22,0.82)" stroke="rgba(255,255,255,0.45)" strokeWidth={3} />
      <Tool kind="khurpi" x={x + w / 2} y={y + h * 0.5} s={1.35} rot={rot} />
      <line x1={x + 34} y1={y + h - 56} x2={x + w - 34} y2={y + h - 56} stroke={SK.soil} strokeWidth={14} strokeLinecap="round" opacity={0.2 + 0.8 * ga} />
      <Arrow x1={x + w - 62} y1={y + 120} x2={x + w - 62} y2={y + h - 84} color="#8BD48A" sw={8} head={26} op={ga} />
      <T x={x + w / 2} y={y + h - 16} size={28} bold op={ga}>GROUND</T>
    </SVG>
  );
}

// ---- 2×2 step tiles (clean up, first aid). steps: [{ slot, label, word, at, node }] ----
function Steps({ steps, lt, out = null }) {
  const W2 = 666, H2 = 442;
  return steps.map((st, i) => {
    const x = 40 + (i % 2) * (W2 + 28), y = 36 + (i > 1 ? 1 : 0) * (H2 + 26);
    const next = steps[i + 1] ? steps[i + 1].at : Infinity, live = lt >= st.at && lt < next;
    return (
      <React.Fragment key={i}>
        {st.slot ? <Pic slot={st.slot} label={st.label} lt={lt} at={st.at} out={out} x={x} y={y} w={W2} h={H2} fx="pop" style={{ boxShadow: `0 0 0 ${live ? 6 : 3}px ${live ? YEL : "rgba(255,255,255,0.55)"}` }} /> : st.node}
        <Chip text={`${i + 1}  ${st.word}`} x={x + W2 / 2} y={y + H2 - 58} lt={lt} at={st.at + 0.2} out={out} tone="cream" size={30} />
      </React.Fragment>
    );
  });
}

// ---- The bell (scene 8): the stage holds plain dark green, into b8's first moment. --------
function Green({ lt, at, to, op: base = 1 }) {
  const o = windowOp(lt, at, to, 0.5) * base; if (o <= 0) return null;
  return <div style={{ position: "absolute", inset: 0, background: SK.bg0, opacity: o, zIndex: 5 }} />;
}

// ==== BEATS ===========================================================================
function B1(ctx) {
  const b = "b1", c = CAPS[1];
  return ({ localTime: lt, duration: d }) => {
    const sharp = W(b, "because"), peg = W(b, "listen");
    return (
      <Scene lt={lt} dur={d} captions={c} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={{ kicker: KICK, title: ctx.titles[1], lines: [L("BIG QUESTION", 0.9, "head"), L("What do YOU need to do to stay safe with farming tools?", 1.1, "big")] }}>
        <Shot slot="lab_pegboard" label="Students line up at the tool pegboard in the school lab" lt={lt} at={0} out={sharp} />
        <Shot slot="sharp_tools" label="A sharp sickle and a pair of secateurs on the bench" lt={lt} at={sharp} out={peg} />
        <Shot slot="lab_pegboard" label="Students line up at the tool pegboard in the school lab" lt={lt} at={peg} fx="none" />
        <Stop lt={lt} b={b} heading="PAUSE AND DISCUSS" x={120} y={300} w={1200} h={420} q="What could go wrong in a farm lab? Name two dangers." />
      </Scene>
    );
  };
}
function B2(ctx) {
  const b = "b2", c = CAPS[2];
  return ({ localTime: lt, duration: d }) => {
    const t1 = W(b, "put"), t2 = W(b, "wear"), t3 = W(b, "or"), t4 = W(b, "gloves", 1), t5 = W(b, "a", 2);
    return (
      <Scene lt={lt} dur={d} captions={c} showCaps={ctx.caps} capSize={ctx.capSize}>
        <Shot slot="sharp_tools" label="Tools on the bench" lt={lt} at={0} out={t1} />
        <Shot slot="gloves_on" label="Pulling on gloves before picking up a khurpi" lt={lt} at={t1} out={t2} ok={true} way="RIGHT WAY" />
        <Shot slot="mask_sieve" label="Wearing a mask to sieve dry compost" lt={lt} at={t2} out={t3} ok={true} way="RIGHT WAY" />
        <Shot slot="mask_spray" label="A student in a mask stands well back while the teacher sprays plants" lt={lt} at={t3} out={t4} ok={true} way="RIGHT WAY" />
        <Shot slot="bare_handle" label="WRONG: a bare hand grabbing a rough handle" lt={lt} at={t4} out={t5} ok={false} way="WRONG WAY" />
        <Shot slot="dust_face" label="WRONG: dry dust blowing towards a student with no mask" lt={lt} at={t5} ok={false} way="WRONG WAY" />
        <Instr lt={lt} at={S(b, 0)} n={1} word={ctx.titles[2]} lines={[L("Wear GLOVES when you handle tools", W(b, "gloves")), L("Wear a MASK with dry soil, compost and spraying", W(b, "mask"))]} />
      </Scene>
    );
  };
}
function B3(ctx) {
  const b = "b3", c = CAPS[3];
  return ({ localTime: lt, duration: d }) => {
    const chk = W(b, "here's"), arm = W(b, "stretch"), touch = W(b, "if"), wrong = SE(b, LAST(b)) + 0.3;
    const pX = 40, pW = 690, dX = 750, dW = 650;
    return (
      <Scene lt={lt} dur={d} captions={c} showCaps={ctx.caps} capSize={ctx.capSize}>
        <Shot slot="arm_check" label="The arm's-length check: arm stretched out, touching no one" lt={lt} at={0} out={chk} />
        <Pic slot="arm_check" label="The arm's-length check: arm stretched out, touching no one" lt={lt} at={chk} out={wrong} x={pX} y={36} w={pW} h={910} fx="none" />
        {lt < wrong + 0.4 && <ArmCheck x={dX} y={36} w={dW} h={910} lt={lt} at={chk} turnA={W(b, "turn")} turnB={touch + 0.3} doneAt={W(b, "touch") } />}
        <Mark ok x={dX + dW - 170} y={60} s={140} lt={lt} at={W(b, "start")} out={wrong} />
        <Way ok text="Touch no one? Start" x={dX + dW / 2} y={820} lt={lt} at={W(b, "start")} out={wrong} />
        <Shot slot="shoulder_dig" label="WRONG: two students digging shoulder to shoulder" lt={lt} at={wrong} ok={false} way="WRONG WAY" />
        <Instr lt={lt} at={S(b, 0)} n={2} word={ctx.titles[3]} lines={[L("Keep others at least an ARM'S LENGTH away", W(b, "keep")), L("Check: stretch your arm", W(b, "stretch")), L("Touch no one? Start", W(b, "if"))]} />
      </Scene>
    );
  };
}
function B4(ctx) {
  const b = "b4", c = CAPS[4];
  return ({ localTime: lt, duration: d }) => {
    const t1 = W(b, "keep"), t3 = W(b, "hold"), wrong = W(b, "never");
    return (
      <Scene lt={lt} dur={d} captions={c} showCaps={ctx.caps} capSize={ctx.capSize}>
        <Shot slot="walk_khurpi" label="Walking slowly with a khurpi held at the side, blade down" lt={lt} at={0} out={t1} fx="pan" />
        <Pic slot="carry_close" label="Close-up: blade down, point towards the ground" lt={lt} at={t1} out={t3} x={40} y={36} w={940} h={910} />
        <BladeDown x={1000} y={36} w={400} h={910} lt={lt} at={t1} turnA={t1 + 0.2} turnB={t1 + 1.6} groundAt={W(b, "point")} out={t3} />
        <Shot slot="walk_khurpi" label="Walking slowly with a khurpi held at the side, blade down" lt={lt} at={t3} out={wrong} ok={true} way="RIGHT WAY" fx="pan" />
        <Shot slot="run_sickle" label="WRONG: running with a sickle held up" lt={lt} at={wrong} ok={false} way="WRONG WAY" />
        <Instr lt={lt} at={S(b, 0)} n={3} word={ctx.titles[4]} lines={[L("Blade facing DOWN", W(b, "keep")), L("Point towards the GROUND", W(b, "point")), L("Hold it at your side", W(b, "hold")), L("WALK, never run", W(b, "walk", 1))]} />
      </Scene>
    );
  };
}
function B5(ctx) {
  const b = "b5", c = CAPS[5];
  return ({ localTime: lt, duration: d }) => {
    const offer = W(b, "offer"), say = W(b, "say"), wait = W(b, "wait"), then = W(b, "then");
    return (
      <Scene lt={lt} dur={d} captions={c} showCaps={ctx.caps} capSize={ctx.capSize}>
        <Shot slot="sharp_tools" label="A sharp sickle and a pair of secateurs on the bench" lt={lt} at={0} out={offer} />
        <Shot slot="pass_offer" label="Offering the secateurs handle first, blade away from both" lt={lt} at={offer} out={wait + 0.2} ok={true} markAt={W(b, "away")} />
        <Chip text="HANDLE first" x={720} y={70} lt={lt} at={W(b, "handle")} out={say} tone="gold" size={34} />
        <Chip text="Blade AWAY from both of you" x={720} y={136} lt={lt} at={W(b, "away")} out={say} tone="gold" size={34} />
        <Say text="Handle to you" x={230} y={120} lt={lt} at={W(b, "handle", 1)} out={then + 0.6} />
        <Shot slot="pass_grip" label="The friend grips the handle" lt={lt} at={wait} out={then} ok={true} />
        <Say text="Got it" x={940} y={250} lt={lt} at={W(b, "got")} tail="r" out={then + 0.6} />
        <Shot slot="pass_release" label="Only then let go" lt={lt} at={then} ok={true} way="RIGHT WAY" />
        <Instr lt={lt} at={S(b, 0)} n={4} word={ctx.titles[5]} lines={[L("Offer the HANDLE first", offer), L("Blade AWAY from both of you", W(b, "away")), L("Say “Handle to you”", W(b, "handle", 1)), L("Wait for “Got it”", wait), L("Let go", then)]} />
      </Scene>
    );
  };
}
function B6(ctx) {
  const b = "b6", c = CAPS[6];
  return ({ localTime: lt, duration: d }) => {
    const th = W(b, "throw"), sn = W(b, "snatch"), rw = W(b, "always"), stop = stopAt(b), tw = 666, tx2 = 734;
    const flick = lt >= rw - 0.1 && lt < rw + 0.8 ? 1 : 0;
    return (
      <Scene lt={lt} dur={d} captions={c} showCaps={ctx.caps} capSize={ctx.capSize}>
        <Shot slot="throw_trowel" label="WRONG: tossing a trowel to a friend across the bed" lt={lt} at={th} out={rw} ok={false} x={40} w={tw} s={130} way="NEVER throw" />
        <Shot slot="snatch_hoe" label="WRONG: snatching a hoe out of a friend's hands" lt={lt} at={sn} out={rw} ok={false} x={tx2} w={tw} s={130} way="NEVER snatch" />
        <Shot slot="pass_trowel" label="RIGHT: the trowel passed handle first across the bed" lt={lt} at={rw + 0.3} out={stop} ok={true} x={40} w={tw} s={130} way="Pass it" />
        <Shot slot="pass_hoe" label="RIGHT: the hoe handed over, handle first" lt={lt} at={rw + 0.3} out={stop} ok={true} x={tx2} w={tw} s={130} way="Handle first" />
        {flick > 0 && <div style={{ position: "absolute", left: 500, top: 400, width: 440, textAlign: "center", zIndex: 3, opacity: windowOp(lt, rw - 0.1, rw + 0.8, 0.2), fontFamily: SERIF, fontWeight: 700, fontSize: 60, color: SK.ink, background: SK.gold, padding: "12px 0", borderRadius: 18 }}>◀◀ Rewind</div>}
        <Shot slot="pass_offer" label="Offering the secateurs handle first, blade away from both" lt={lt} at={stop - 0.1} fx="none" />
        <Say text="Handle to you" x={230} y={110} lt={lt} at={stop} />
        <Stop lt={lt} b={b} heading="TRY IT!" x={120} y={420} w={1200} h={500} qSize={44}
          q="In pairs, pass a trowel safely: handle first, blade away, “Handle to you”, “Got it”" />
        <Instr lt={lt} at={S(b, 0)} n={5} word={ctx.titles[6]} lines={[L("NEVER throw a tool", th), L("NEVER snatch a tool", sn)]} />
      </Scene>
    );
  };
}
function B7(ctx) {
  const b = "b7", c = CAPS[7];
  return ({ localTime: lt, duration: d }) => {
    const t1 = W(b, "remove"), t2 = W(b, "wipe"), t3 = W(b, "dry"), t4 = W(b, "hang"), wrong = SE(b, LAST(b)) + 0.2, stop = stopAt(b), brk = stop + stopFor(b).hold - 0.1;
    const W2 = 666, H2 = 442, bx = 40 + W2 + 28, by = 36 + H2 + 26;
    const hang = lt >= t4 && lt < wrong + 0.3;
    const p = drive(lt, t4 + 0.5, t4 + 2.2);
    return (
      <Scene lt={lt} dur={d} captions={c} showCaps={ctx.caps} capSize={ctx.capSize} fo={0.01}>
        <Shot slot="hoe_knock" label="Knocking the soil off a hoe with a stick over the bed" lt={lt} at={0} out={t1} />
        <Steps lt={lt} out={wrong} steps={[
          { slot: "hoe_knock", label: "Knocking the soil off a hoe with a stick over the bed", word: "REMOVE", at: t1 },
          { slot: "hoe_wipe", label: "Wiping the hoe blade with a cloth", word: "WIPE", at: t2 },
          { slot: "hoe_dry", label: "Drying the hoe with a second, dry cloth", word: "DRY", at: t3 },
          { word: "HANG", at: t4, node: hang ? <Pegboard x={bx} y={by} w={W2} h={H2} s={0.62} hide={["hoe"]} fly={{ kind: "hoe", p, fx: bx + 560, fy: by + 180 }} op={reveal(lt, t4, 0.4) * (1 - reveal(lt, wrong, 0.3))} /> : null },
        ]} />
        <Way ok text="so it does not rust" x={373} y={790} lt={lt} at={W(b, "so")} out={t4 + 0.2} />
        <Shot slot="spade_corner" label="WRONG: a muddy, wet spade thrown in a corner" lt={lt} at={wrong} out={stop + 0.4} ok={false} way="WRONG WAY" />
        <Pegboard x={80} y={56} w={1280} h={580} s={1.05} mess={{ sickle: 4, khurpi: 5, trowel: 3 }} muddy="spade" op={windowOp(lt, stop - 0.2, stop + stopFor(b).hold + 0.2, 0.4)} />
        <Stop lt={lt} b={b} heading="SPOT THE MISTAKE!" x={80} y={650} w={1280} h={290} qSize={44} q="What is wrong with this pegboard?" />
        <Instr lt={lt} at={S(b, 0)} n={6} word={ctx.titles[7]} lines={[L("REMOVE the soil", t1), L("WIPE it clean", t2), L("DRY it properly", t3), L("HANG it on its place on the pegboard", t4)]} />
        <Green lt={lt} at={brk} to={d + 2} />
      </Scene>
    );
  };
}
function B8(ctx) {
  const b = "b8", c = CAPS[8];
  const SHUF = [[2, "PRESS", -3], [0, "TELL", 2.5], [3, "COVER", -1.5], [1, "WASH", 3]];
  const FA = [["cut_hand", "A calm raised hand: tell the teacher at once"], ["cut_wash", "The small cut washed under clean running water"], ["cut_press", "Gentle pressure with clean cotton"], ["cut_cover", "A clean bandage on the finger"]];
  return ({ localTime: lt, duration: d }) => {
    const t1 = W(b, "tell"), t2 = W(b, "wash"), t3 = W(b, "press"), t4 = W(b, "cover"), hide = W(b, "never"), stop = stopAt(b);
    const one = W(b, "one"), two = W(b, "two"), three = W(b, "three"), four = W(b, "four");
    return (
      <Scene lt={lt} dur={d} captions={c} showCaps={ctx.caps} capSize={ctx.capSize} fi={0.01}>
        <Shot slot="cut_hand" label="A calm raised hand: tell the teacher at once" lt={lt} at={0.7} out={one} />
        <Steps lt={lt} out={stop} steps={[
          { slot: FA[0][0], label: FA[0][1], word: "TELL", at: one },
          { slot: FA[1][0], label: FA[1][1], word: "WASH", at: two },
          { slot: FA[2][0], label: FA[2][1], word: "PRESS", at: three },
          { slot: FA[3][0], label: FA[3][1], word: "COVER", at: four },
        ]} />
        <Way ok={false} text="NEVER hide a cut" x={720} y={452} lt={lt} at={hide} out={stop} size={44} />
        <Stop lt={lt} b={b} heading="PUT THEM IN ORDER!" x={40} y={36} w={1360} h={910} foot={false}>
          <div style={{ display: "flex", gap: 24, marginTop: 30 }}>
            {SHUF.map(([i, word, rot]) => (
              <div key={word} style={{ width: 300, background: SK.cream, borderRadius: 16, padding: 10, boxSizing: "border-box", transform: `rotate(${rot}deg)`, boxShadow: "0 8px 20px rgba(0,0,0,0.4)" }}>
                <div style={{ position: "relative", height: 340 }}><Pic slot={FA[i][0]} label={FA[i][1]} x={0} y={0} w={280} h={340} lt={1} at={0} dur={0.01} fx="none" r={10} border={false} /></div>
                <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 36, color: SK.ink, marginTop: 8 }}>{word}</div>
              </div>
            ))}
          </div>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 44, color: SK.white, marginTop: 36 }}>Tell · Wash · Press · Cover</div>
          <div style={{ fontFamily: SANS, fontSize: 24, color: SK.dim, marginTop: 14 }}>Stop 4 of {STOPS.length}</div>
        </Stop>
        <Instr lt={lt} at={S(b, 0)} n={7} word={ctx.titles[8]} aid max={6} lines={[L("For a minor cut", W(b, "if"), "head", { out: stop }),
          L("1 TELL the teacher at once", t1 - 0.5, "plain", { out: stop }), L("2 WASH the wound with clean water", t2 - 0.5, "plain", { out: stop }),
          L("3 PRESS gently with clean cotton to stop the bleeding", t3 - 0.5, "plain", { out: stop }), L("4 COVER it with a clean bandage", t4 - 0.5, "plain", { out: stop })]} />
        <Green lt={lt} at={-2} to={1.1} />
      </Scene>
    );
  };
}
function B9(ctx) {
  const b = "b9", c = CAPS[9];
  const TILES = [["gloves_on", "Gloves and mask", "GEAR UP"], ["arm_check", "Arm's length", "SPACE"], ["walk_khurpi", "Walking, blade down", "WALK"], ["pass_offer", "Handle first", "PASS"],
    ["throw_trowel", "No throwing", "NEVER"], ["hoe_wipe", "Clean, wipe, dry, hang", "CLEAN UP"], ["cut_cover", "Tell, wash, press, cover", "FIRST AID"]];
  const TW = 327, TH = 300;
  return ({ localTime: lt, duration: d }) => {
    const at = [1, 2, 3, 4, 5, 6, 7].map((i) => S(b, i));
    const gold = at.filter((t) => lt >= t).length;
    return (
      <Scene lt={lt} dur={d} captions={c} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={{ kicker: KICK, title: ctx.titles[9], max: 8, lines: ["1 GEAR UP", "2 SPACE", "3 WALK", "4 PASS", "5 NEVER throw or snatch", "6 CLEAN UP", "7 FIRST AID"].map((t, i) => L(t, at[i], "plain")) }}>
        {TILES.map(([slot, label, word], i) => {
          const x = 40 + (i % 4) * (TW + 17), y = 56 + (i > 3 ? 1 : 0) * (TH + 150), o = pop(lt, at[i], 0.45);
          return (
            <React.Fragment key={slot}>
              <Pic slot={slot} label={label} x={x} y={y} w={TW} h={TH} lt={lt} at={at[i]} fx="pop" />
              {o > 0 && <div style={{ position: "absolute", left: x, top: y + TH + 12, width: TW, textAlign: "center", opacity: clamp(o, 0, 1), fontFamily: SERIF, fontWeight: 700, fontSize: 34, color: YEL }}>{i + 1} {word}</div>}
            </React.Fragment>
          );
        })}
        <Shield x={1078} y={490} s={1.35} earned={7} gold={gold} glow={reveal(lt, at[6], 0.8)} pulse={gold > 0 ? [gold - 1, reveal(lt, at[gold - 1], 0.6)] : null} />
      </Scene>
    );
  };
}
function B10(ctx) {
  const b = "b10", c = CAPS[10];
  const Plus = ({ x, y, ch, lt, at }) => { const o = pop(lt, at) * (1 - reveal(lt, stopAt("b10") - 0.2, 0.3)); return o > 0 ? <div style={{ position: "absolute", left: x, top: y, width: 60, textAlign: "center", fontFamily: SERIF, fontWeight: 700, fontSize: 60, color: YEL, opacity: clamp(o, 0, 1), zIndex: 2 }}>{ch}</div> : null; };
  return ({ localTime: lt, duration: d }) => {
    const h = W(b, "careful"), s = W(b, "proper"), e = W(b, "right"), n = W(b, "help"), y = 640, stop = stopAt(b), safe = W(b, "safe");
    const Eq = ({ x, w, top, bot, at, gold }) => { const o = out3(lt, at, 0.45) * (1 - reveal(lt, stop - 0.2, 0.3)); return o > 0 ? (
      <div style={{ position: "absolute", left: x, top: y, width: w, height: 136, opacity: o, zIndex: 2, borderRadius: 16, background: gold ? YEL : "rgba(5,30,22,0.9)", boxShadow: `0 0 0 3px ${YEL}`, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
        fontFamily: SERIF, fontWeight: 700, fontSize: 30, lineHeight: 1.15, color: gold ? SK.ink : SK.white }}><div>{top}</div><div>{bot}</div></div>) : null; };
    return (
      <Scene lt={lt} dur={d} captions={c} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={{ kicker: KICK, title: ctx.titles[10], lines: [L("CAREFUL HANDLING", h, "plain"), L("+ PROPER STORAGE", s, "plain"), L("+ PROTECTIVE EQUIPMENT", e, "plain"), L("= NO ACCIDENTS", n, "big"), L("Everyone stays SAFE!", safe, "big")] }}>
        <Shot slot="class_calm" label="The whole class working calmly and safely in the lab" lt={lt} at={0} zoom={1.08} />
        <Eq x={64} w={272} top="CAREFUL" bot="HANDLING" at={h} />
        <Plus x={336} y={y + 30} ch="+" lt={lt} at={s} />
        <Eq x={396} w={272} top="PROPER" bot="STORAGE" at={s} />
        <Plus x={668} y={y + 30} ch="+" lt={lt} at={e} />
        <Eq x={728} w={272} top="PROTECTIVE" bot="EQUIPMENT" at={e} />
        <Plus x={1000} y={y + 30} ch="=" lt={lt} at={n} />
        <Eq x={1060} w={316} top="NO" bot="ACCIDENTS" at={n} gold />
        <Stop lt={lt} b={b} heading="QUICK CHECK" x={40} y={36} w={1360} h={910} foot>
          <div style={{ marginTop: 26, textAlign: "left", width: 1160 }}>
            {QUICK.map((q, i) => <div key={i} style={{ display: "flex", gap: 22, alignItems: "baseline", marginTop: 16 }}>
              <span style={{ flex: "none", width: 44, fontFamily: SERIF, fontWeight: 700, fontSize: 46, color: SK.gold }}>{i + 1}</span>
              <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 46, lineHeight: 1.2, color: SK.white }}>{q}</span></div>)}
          </div>
        </Stop>
      </Scene>
    );
  };
}

// ---- The corner shield runs across the beats (global time). ------------------------------
function CornerShield() {
  const BN = ["b2", "b3", "b4", "b5", "b6", "b7", "b8"];
  return (
    <Sprite start={0} end={DUR}>
      {({ localTime: t }) => {
        const gt = (b, lt) => BEAT(b).start + lt;
        const appear = gt("b1", W("b1", "seven"));
        const earned = BN.filter((b) => t >= gt(b, SE(b, LAST(b)))).length;   // the star lands as the instruction's last line ends
        const justN = earned - 1, justAt = justN >= 0 ? gt(BN[justN], SE(BN[justN], LAST(BN[justN]))) : 0;
        const pulse = justN >= 0 && t < justAt + 0.8 ? [justN, reveal(t, justAt, 0.8)] : null;
        // Out of the way for the recap (its own big shield), the stops and the break.
        let o = reveal(t, appear, 0.5);
        STOPS.forEach((s) => { const a = BEAT(s.b).start + stopAt(s.b); o *= 1 - windowOp(t, a - 0.1, a + s.hold + (s.b === "b7" ? 4.4 : 0.2), 0.3); });
        o *= 1 - windowOp(t, BEAT("b9").start, BEAT("b10").start + 0.4, 0.3);
        const inEnd = reveal(t, gt("b10", W("b10", "follow")), 0.8);
        const gold = t >= BEAT("b9").start ? 7 : 0;
        return <Shield x={62} y={56} s={0.72} earned={earned} gold={gold} glow={inEnd} pulse={pulse} op={o} />;
      }}
    </Sprite>
  );
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
const COLLAGE = [{ slot: "khurpi", x: -60, y: -40, w: 760, h: 520, ph: 0 }, { slot: "sickle", x: 640, y: -80, w: 760, h: 520, ph: 2 },
  { slot: "hoe", x: -80, y: 520, w: 700, h: 560, ph: 4 }, { slot: "tool_iron", x: 560, y: 560, w: 820, h: 560, ph: 1 }];
function Lp18Scenes(props = {}) {
  const caps = props.showCaptions === "false" ? false : props.showCaptions !== false;
  const titles = {};
  for (let n = 1; n <= NB; n++) titles[n] = str(props["title" + n + "Text"], TITLES[n]);
  const ctx = { caps, titles, capSize: num(props.captionSize, 34) };
  const B = [B1, B2, B3, B4, B5, B6, B7, B8, B9, B10];
  const beats = B.map((Bn, i) => { const t = BEAT("b" + (i + 1)); return [t.start, t.start + t.dur, Bn]; });
  return (
    <StoryFrame props={props} dur={DUR} persistKey="thinkpro-lp18-farming-tool-safety" collage={COLLAGE}>
      {beats.map(([s, e, Bn], i) => (
        <Sprite key={i} start={s} end={e}>{Bn(ctx)}</Sprite>
      ))}
      <CornerShield />
      {STOPS.map((s) => <StopAt key={s.b} t={BEAT(s.b).start + stopAt(s.b)} hold={s.hold - 0.2} />)}
      <ChimeAt t={BEAT("b8").start + LEAD - 0.35} />
      <AudioSync />
    </StoryFrame>
  );
}
window.Lp18Scenes = Lp18Scenes;
