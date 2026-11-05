/* global React, window */
// ThinkPro Academy — PEOPLE kit (window.TPPeople): flat "paper-puppet" students and teachers for the
// story videos. Pure functions of time (seek-safe, renders in the normal export). A character is a
// small SVG rig: head, torso, two arms (shoulder + elbow), two legs (hip + knee); poses are angle
// sets that blend into each other; outfits are colour layers (school uniform, festival dress).
const { Easing, clamp } = window;
const { reveal } = window.TPMotion;
const lerp = (a, b, k) => a + (b - a) * k;

const SKIN = { light: "#E9BD93", tan: "#CF9668", brown: "#A2693F", deep: "#6F4529" };
const OUTFITS = {
  uniform:  { shirt: "#D6E9F8", sleeve: "#D6E9F8", bottom: "#1E2A5A", skirt: "#1E2A5A", shoe: "#222", sock: "#fff", hair: "#1a1a1a", lanyard: "#C62828" },
  teacher:  { shirt: "#7B1FA2", sleeve: "#7B1FA2", bottom: "#4A148C", skirt: "#7B1FA2", shoe: "#4e342e", sock: null, hair: "#1a1a1a", drape: "#F6C343" },
  pongal:   { shirt: "#2E7D32", sleeve: "#2E7D32", bottom: "#C2185B", skirt: "#C2185B", border: "#F5C542", shoe: "#5d4037", sock: null, hair: "#1a1a1a", jasmine: true },
  baisakhi: { shirt: "#F6C343", sleeve: "#F6C343", bottom: "#F6C343", skirt: "#F6C343", shoe: "#5d4037", sock: null, hair: "#1a1a1a", turban: "#E65100" },
  onam:     { shirt: "#F4EBD0", sleeve: "#F4EBD0", bottom: "#F4EBD0", skirt: "#F4EBD0", border: "#D4A017", shoe: "#5d4037", sock: null, hair: "#1a1a1a", jasmine: true },
  bihu:     { shirt: "#B71C1C", sleeve: "#B71C1C", bottom: "#F3E5AB", skirt: "#F3E5AB", border: "#B71C1C", shoe: "#5d4037", sock: null, hair: "#1a1a1a", gamosa: "#fff" },
  nuakhai:  { shirt: "#FFF3E0", sleeve: "#FFF3E0", bottom: "#8E1B1B", skirt: "#8E1B1B", border: "#F3C13A", shoe: "#5d4037", sock: null, hair: "#1a1a1a", gamosa: "#8E1B1B" },
  lohri:    { shirt: "#F9A825", sleeve: "#F9A825", bottom: "#C62828", skirt: "#C62828", shoe: "#5d4037", sock: null, hair: "#1a1a1a", turban: "#C62828", drape: "#E65100" },
  sankranti:{ shirt: "#00897B", sleeve: "#00897B", bottom: "#F06292", skirt: "#F06292", border: "#FFD54F", shoe: "#5d4037", sock: null, hair: "#1a1a1a", jasmine: true },
};
// Angles in degrees: 0 = limb hanging straight down, positive = swung forward (the facing side).
const STAND = { sL: 0, eL: 0, sR: 0, eR: 0, wL: 0, wR: 0, hL: 0, kL: 0, hR: 0, kR: 0, fL: 0, fR: 0, lean: 0, chest: 0, dy: 0, head: 0 };
const HAND = { open: 0, grip: 1, point: 2 };      // hand shapes travel through blends as numbers (nearest wins)
const POSES = {
  stand: STAND,
  point:  { ...STAND, sR: 88, eR: 4, sL: 8, eL: -10, head: 4 },
  pointDown: { ...STAND, sR: 52, eR: -4, sL: 10, eL: -14, lean: 10, head: 14 },
  kneel:  { ...STAND, sL: 36, eL: -24, sR: 56, eR: -10, hL: 88, kL: -88, hR: -18, kR: 108, lean: 16, dy: 22, head: 12 },
  kneelPoint: { ...STAND, sL: 36, eL: -24, sR: 34, eR: 4, hL: 88, kL: -88, hR: -18, kR: 108, lean: 20, dy: 22, head: 16 },
  write:  { ...STAND, sL: 48, eL: -66, sR: 62, eR: -58, lean: 12, head: 20 },
  carry:  { ...STAND, sL: 38, eL: -84, sR: 38, eR: -84, head: 2 },
  hold:   { ...STAND, sL: 52, eL: -8, sR: 52, eR: -8, head: 8 },
  wave:   { ...STAND, sR: 166, eR: -26, sL: 6, eL: -8, head: -4 },
  cheer:  { ...STAND, sR: 170, eR: -10, sL: 170, eL: -10, head: -6 },
  read:   { ...STAND, sL: 60, eL: -92, sR: 60, eR: -92, head: 18 },
  pointUp:{ ...STAND, sR: 136, eR: -8, sL: 6, eL: -8, head: -10 },
  lookUp: { ...STAND, sR: 150, eR: -84, sL: 4, eL: -6, head: -16 },
  bend:   { ...STAND, lean: 28, sL: 62, eL: -22, sR: 72, eR: -26, head: 18 },
  reach:  { ...STAND, sR: 152, eR: -14, sL: 10, eL: -10, head: -10, dy: -2 },
  wash:   { ...STAND, sL: 58, eL: -52, sR: 58, eR: -54, lean: 8, head: 16 },
  glovesOn: { ...STAND, sL: 70, eL: -70, sR: 70, eR: -40, head: 14 },
  kneelHold: { ...STAND, sL: 48, eL: -6, sR: 48, eR: -2, hL: 88, kL: -88, hR: -18, kR: 108, lean: 14, dy: 22, head: 10 },
};
// Pose functions of time for repeated actions.
const wipe = (lt) => ({ ...POSES.bend, eR: -26 + 20 * Math.sin(lt * 9) });
const count = (lt, base = "kneelPoint") => ({ ...POSES[base], sR: POSES[base].sR + 6 * Math.sin(lt * 5), eR: POSES[base].eR + 4 * Math.sin(lt * 5 + 1) });
const scrub = (lt) => ({ ...POSES.wash, eL: -52 + 8 * Math.sin(lt * 10), eR: -54 - 8 * Math.sin(lt * 10) });
// A walk cycle as a pose function of time (steps per second ≈ 1.6).
const walk = (lt, speed = 1.6) => {
  const ph = lt * speed * Math.PI * 2, s = Math.sin(ph), c = Math.cos(ph);
  return { ...STAND, hL: 26 * s, hR: -26 * s, kL: Math.max(0, -42 * s), kR: Math.max(0, 42 * s),
    sL: -22 * s, sR: 22 * s, eL: -18, eR: -18, dy: -1.4 * Math.abs(c), lean: 3, head: 2 };
};
const blendPose = (a, b, k) => { const o = {}; for (const key in STAND) o[key] = lerp(a[key] ?? 0, b[key] ?? 0, k); o.handL = k < 0.5 ? a.handL : b.handL; o.handR = k < 0.5 ? a.handR : b.handR; return o; };
// ---- Motion clips: named keyframe sequences (engine/motions.js = the approved library) -------------
// clip = { dur, loop, base?: poseName, ease?: "smooth"|"snap"|"linear", keys: [{ t, p: {partial pose}, ease? }] }
function clipPose(clip, t) {
  const base = { ...STAND, ...(clip.base ? POSES[clip.base] : {}) };
  const dur = clip.dur || 1, keys = clip.keys || [];
  if (!keys.length) return base;
  const tt = clip.loop ? ((t % dur) + dur) % dur : clamp(t, 0, dur);
  const ks = clip.loop ? [...keys, { t: dur, p: keys[0].p, ease: keys[0].ease }] : keys;
  let i = 0; while (i + 1 < ks.length && tt >= ks[i + 1].t) i++;
  const a = ks[i], b = ks[Math.min(i + 1, ks.length - 1)];
  const span = b.t - a.t; let k = span > 0 ? (tt - a.t) / span : 1;
  const e = b.ease || clip.ease || "smooth";
  k = e === "linear" ? k : e === "snap" ? Easing.easeOutBack(k) : e === "out" ? Easing.easeOutCubic(k) : Easing.easeInOutCubic(k);
  return blendPose({ ...base, ...a.p }, { ...base, ...b.p }, k);
}
const clipByName = (name) => (window.TPMotions && window.TPMotions.clips && window.TPMotions.clips[name]) || null;
// play("walk") inside poseAt keys: [[t0, play("walk")], [t1, "stand"]] — clip time starts at the key's time.
const play = (nameOrClip, speed = 1) => ({ clip: nameOrClip, speed });
const resolve = (p, lt, t0 = 0) => {
  if (typeof p === "function") return p(lt);
  if (typeof p === "string") return POSES[p] || STAND;
  if (p && p.clip != null) { const c = typeof p.clip === "string" ? clipByName(p.clip) : p.clip; return c ? clipPose(c, (lt - t0) * (p.speed || 1)) : STAND; }
  return p;
};
// keys: [[time, pose | "name" | fn(lt)], ...] — blends into each new pose over `trans` seconds.
function poseAt(lt, keys, trans = 0.6) {
  let i = 0; while (i + 1 < keys.length && lt >= keys[i + 1][0]) i++;
  const cur = resolve(keys[i][1], lt, keys[i][0]);
  if (i === 0) return cur;
  const k = Easing.easeInOutCubic(clamp((lt - keys[i][0]) / trans, 0, 1));
  return k >= 1 ? cur : blendPose(resolve(keys[i - 1][1], lt, keys[i - 1][0]), cur, k);
}

// ---- Props held in a hand (hand-local: the hand is at 0,0, "down" = along the forearm) ------
const PROPS = {
  pencil: <g transform="rotate(-70)"><line x1="0" y1="-3" x2="0" y2="9" stroke="#F2C14E" strokeWidth="1.6" /><line x1="0" y1="9" x2="0" y2="11.5" stroke="#E4A66A" strokeWidth="1.6" /><circle cx="0" cy="-3" r="0.9" fill="#E57373" /></g>,
  marker: <g transform="rotate(-70)"><line x1="0" y1="-4" x2="0" y2="8" stroke="#1E88E5" strokeWidth="2.6" strokeLinecap="round" /><line x1="0" y1="8" x2="0" y2="10.5" stroke="#90CAF9" strokeWidth="1.8" /></g>,
  ruler: <g><rect x="-2" y="-1.4" width="34" height="3" fill="rgba(255,255,255,0.85)" stroke="#8d8d8d" strokeWidth="0.4" />{[...Array(9)].map((_, i) => <line key={i} x1={1 + i * 4} y1="-1.4" x2={1 + i * 4} y2="0.4" stroke="#555" strokeWidth="0.4" />)}</g>,
  book: <g transform="rotate(-20)"><rect x="-1" y="-10" width="11" height="13" rx="0.8" fill="#FFF8E1" stroke="#B08A4E" strokeWidth="0.6" /><line x1="1.5" y1="-6" x2="7.5" y2="-6" stroke="#B08A4E" strokeWidth="0.5" /><line x1="1.5" y1="-3" x2="7.5" y2="-3" stroke="#B08A4E" strokeWidth="0.5" /><line x1="1.5" y1="0" x2="7.5" y2="0" stroke="#B08A4E" strokeWidth="0.5" /></g>,
  cloth: <path d="M-3 0 q4 -5 8 0 q-2 6 -4 8 q-3 -3 -4 -8z" fill="#FFB74D" />,
  newspaper: <g><rect x="-2" y="-9" width="16" height="11" fill="#ECE4CF" stroke="#9e9e9e" strokeWidth="0.4" /><line x1="0" y1="-6" x2="12" y2="-6" stroke="#9e9e9e" strokeWidth="0.6" /><line x1="0" y1="-3" x2="12" y2="-3" stroke="#bdbdbd" strokeWidth="0.5" /></g>,
  wheat: <g transform="rotate(-150)">{[0, 1, 2].map(i => <g key={i} transform={`rotate(${(i - 1) * 14})`}><line x1="0" y1="0" x2="0" y2="16" stroke="#C9A227" strokeWidth="1" />{[6, 9, 12, 15].map(y => <ellipse key={y} cx="0" cy={y} rx="2.4" ry="1.3" fill="#E6C35C" />)}</g>)}</g>,
  sugarcane: <g transform="rotate(-165)"><line x1="0" y1="0" x2="0" y2="24" stroke="#8D6E63" strokeWidth="2" /><path d="M0 24 l-4 6 M0 24 l4 7 M0 24 l0 8" stroke="#66BB6A" strokeWidth="1.4" fill="none" /></g>,
  pot: <g><path d="M-5 0 q-1 -7 5 -7 q6 0 5 7z" fill="#B87333" /><ellipse cx="0" cy="-7" rx="5" ry="1.6" fill="#D7A86E" /></g>,
  leaf: <g transform="rotate(-100)"><ellipse cx="9" cy="0" rx="12" ry="4.5" fill="#43A047" /><line x1="-2" y1="0" x2="20" y2="0" stroke="#2E7D32" strokeWidth="0.8" /><ellipse cx="9" cy="-1" rx="3" ry="1.4" fill="#FFF8E1" /></g>,
  japi: <g transform="rotate(-90)"><path d="M0 -3 l14 -1 l-14 -9z" fill="#C9A227" /><path d="M0 -3 l14 -1 l-14 -9z" fill="none" stroke="#8D6E63" strokeWidth="0.6" /><circle cx="0" cy="-10" r="1.6" fill="#D32F2F" /></g>,
  bowl: <g><path d="M-6 -2 q0 6 6 6 q6 0 6 -6z" fill="#8D6E63" /><ellipse cx="0" cy="-2" rx="6" ry="1.8" fill="#FFF8E1" /></g>,
  tray: <g><rect x="-8" y="-3" width="16" height="2.4" rx="0.6" fill="#8D6E63" />{[-5, -2, 1, 4].map(x => <circle key={x} cx={x} cy="-4.2" r="1.3" fill="#D7A86E" />)}</g>,
  kite: <g transform="rotate(-160)"><path d="M0 0 l7 10 l-7 14 l-7 -10z" fill="#FF7043" /><path d="M0 0 l0 24 M-7 10 l14 0" stroke="#fff" strokeWidth="0.6" /><path d="M0 24 q3 3 0 6 q-3 3 0 6" stroke="#FF7043" strokeWidth="0.8" fill="none" /></g>,
  marker2: <g transform="rotate(-70)"><line x1="0" y1="-4" x2="0" y2="8" stroke="#43A047" strokeWidth="2.6" strokeLinecap="round" /><line x1="0" y1="8" x2="0" y2="10.5" stroke="#A5D6A7" strokeWidth="1.8" /></g>,
  cards: <g><rect x="-7" y="-9" width="14" height="9" rx="1" fill="#E07B39" /><rect x="-5" y="-11" width="14" height="9" rx="1" fill="#7CC27A" /><rect x="-3" y="-13" width="14" height="9" rx="1" fill="#D9A441" /></g>,
};

// ---- The character --------------------------------------------------------------------------
// x,y = feet centre on the 1920×1080 stage; h = height in px; facing 1 (right) / -1 (left).
function Student({ x, y, h = 340, pose = "stand", facing = 1, outfit = "uniform", skin = "tan", girl = true, hair,
  propR = null, propL = null, lt = 0, at = 0, out = null, op = 1, seed = 0, adult = false, gloves = false, children }) {
  const o = reveal(lt, at, 0.4) * (out != null ? 1 - reveal(lt, out, 0.4) : 1) * op;
  if (o <= 0) return null;
  const c = OUTFITS[outfit] || OUTFITS.uniform, sk = SKIN[skin] || skin, s = h / 100;
  const p = { ...STAND, ...resolve(pose, lt) };
  const breathe = Math.sin(lt * 2.2 + seed) * 0.5;
  const blink = ((lt + seed * 0.7) % 3.9) < 0.13 ? 0.12 : 1;
  const rot = (a) => `rotate(${-a})`;
  const hairStyle = hair || (girl ? "plaits" : "crop");
  const headR = adult ? 10.5 : 12;
  const held = (pr) => pr ? (typeof pr === "string" ? PROPS[pr] : pr) : null;

  const Arm = ({ sx, sa, ea, wa = 0, hs = 0, pr }) => (
    <g transform={`translate(${sx},-73) ${rot(sa)}`}>
      <line x1="0" y1="0" x2="0" y2="8" stroke={c.sleeve} strokeWidth="7" strokeLinecap="round" />
      <line x1="0" y1="7" x2="0" y2="16" stroke={sk} strokeWidth="5.6" strokeLinecap="round" />
      <g transform={`translate(0,16) ${rot(ea)}`}>
        <line x1="0" y1="0" x2="0" y2="14" stroke={sk} strokeWidth="5.2" strokeLinecap="round" />
        {gloves && <line x1="0" y1="11" x2="0" y2="13" stroke="#fff" strokeWidth="5.6" />}
        <g transform={`translate(0,14) ${rot(wa)}`}>
          <circle cx="0" cy="1.5" r="3.3" fill={gloves ? "#4CAF50" : sk} />
          {hs === HAND.point && <line x1="0" y1="2" x2="0" y2="8" stroke={gloves ? "#4CAF50" : sk} strokeWidth="2.2" strokeLinecap="round" />}
          {hs === HAND.grip && <circle cx="0" cy="1.5" r="2" fill="rgba(0,0,0,0.18)" />}
          {held(pr) && <g transform="translate(0,1.5)">{held(pr)}</g>}
        </g>
      </g>
    </g>);
  const Leg = ({ hx, ha, ka, fa = 0 }) => {
    const legCol = girl && c.sock !== undefined ? sk : c.bottom;          // bare shins under a pinafore / dress, trousers otherwise
    return (
      <g transform={`translate(${hx},-46) ${rot(ha)}`}>
        <line x1="0" y1="0" x2="0" y2="22" stroke={girl ? c.skirt : c.bottom} strokeWidth="8" strokeLinecap="round" />
        <g transform={`translate(0,22) ${rot(ka)}`}>
          <line x1="0" y1="0" x2="0" y2="22" stroke={girl ? legCol : c.bottom} strokeWidth="6.4" strokeLinecap="round" />
          {c.sock && <line x1="0" y1="15" x2="0" y2="22" stroke={c.sock} strokeWidth="6.6" strokeLinecap="round" />}
          <path d="M-3.4 20 h7 q4 0 4 3.2 v1 h-11z" fill={c.shoe} transform={`translate(0,21) ${rot(fa)} translate(0,-21)`} />
        </g>
      </g>);
  };
  const Head = () => (
    <g transform={`translate(0,-88) ${rot(-p.head)}`}>
      <circle cx="0" cy="0" r={headR} fill={sk} />
      {/* hair */}
      {hairStyle === "plaits" && <>
        <path d={`M${-headR} 1 a${headR} ${headR} 0 0 1 ${2 * headR} 0 v-3 a${headR} ${headR} 0 0 0 ${-2 * headR} 0z`} fill={c.hair} />
        <path d={`M${-headR} -2 q0 -11 ${headR} -11 q${headR} 0 ${headR} 11 q-2 -4 -6 -5 q-4 4 -14 2 q-2 2 -2 3z`} fill={c.hair} />
        <ellipse cx={-headR + 1} cy="7" rx="2.6" ry="7" fill={c.hair} /><ellipse cx={headR - 1} cy="7" rx="2.6" ry="7" fill={c.hair} />
        <circle cx={-headR + 1} cy="13" r="1.6" fill="#E53935" /><circle cx={headR - 1} cy="13" r="1.6" fill="#E53935" />
      </>}
      {hairStyle === "crop" && <path d={`M${-headR} -1 q0 -12 ${headR} -12 q${headR} 0 ${headR} 12 q-3 -5 -8 -6 q-6 3 -16 0z`} fill={c.hair} />}
      {hairStyle === "bun" && <><path d={`M${-headR} -1 q0 -12 ${headR} -12 q${headR} 0 ${headR} 12 q-3 -6 -12 -7 q-9 1 -12 7z`} fill={c.hair} /><circle cx={-headR + 2} cy="-6" r="4.2" fill={c.hair} /></>}
      {c.turban && <path d={`M${-headR - 1.5} 0 q0 -16 ${headR + 1.5} -16 q${headR + 1.5} 0 ${headR + 1.5} 16 q-3 -4 -7 -4 q-6 2 -14 0 q-3 1 -5.5 4z`} fill={c.turban} />}
      {c.jasmine && [[-headR + 2, -4], [-headR + 4, -8], [-headR + 7.5, -10.5]].map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r="1.5" fill="#fff" />)}
      {/* face, looking the facing way */}
      <g transform="translate(2.5,0)">
        <ellipse cx="-4" cy="-1.5" rx="1.5" ry={1.9 * blink} fill="#222" /><ellipse cx="4.5" cy="-1.5" rx="1.5" ry={1.9 * blink} fill="#222" />
        <path d="M-6 -5 q2 -1.5 4 -0.3" stroke="#222" strokeWidth="0.9" fill="none" /><path d="M2.5 -5.3 q2 -1.2 4 0" stroke="#222" strokeWidth="0.9" fill="none" />
        <path d="M-3.5 4 q3.5 3.5 7 0" stroke="#7A3B2E" strokeWidth="1.1" fill="none" strokeLinecap="round" />
      </g>
      <ellipse cx={headR - 2} cy="1.5" rx="2.6" ry="1.6" fill={sk} />
    </g>);
  const Torso = () => (
    <g>
      <path d="M-11 -76 q0 -3 3 -3 h16 q3 0 3 3 l-1.5 30 q0 2.5 -2.5 2.5 h-14 q-2.5 0 -2.5 -2.5z" fill={c.shirt} />
      {girl && <path d={`M-9 -68 h18 l5 46 q0 2 -2 2 h-24 q-2 0 -2 -2z`} fill={c.skirt} />}
      {girl && c.border && <path d="M-14 -22 h28 l0.5 3 h-29z" fill={c.border} />}
      {!girl && <rect x="-10" y="-50" width="20" height="6" fill={c.bottom} />}
      {c.lanyard && <><path d="M-6 -74 l6 14 l6 -14" stroke={c.lanyard} strokeWidth="1" fill="none" /><rect x="-3" y="-61" width="6" height="7" rx="0.8" fill="#fff" stroke="#999" strokeWidth="0.4" /></>}
      {c.drape && <path d="M-10 -74 q-4 20 2 40 l4 0 q-5 -22 1 -40z" fill={c.drape} />}
      {c.gamosa && <path d="M-6 -74 l3 24 l3 0 l3 -24 l-3 2 z" fill={c.gamosa} stroke="#B71C1C" strokeWidth="0.6" />}
      <circle cx="0" cy="-77" r="4" fill={sk} />
    </g>);
  return (
    <g transform={`translate(${x},${y}) scale(${s * facing},${s})`} opacity={o}>
      <g transform={`translate(0,${p.dy})`}>
        <g transform={`translate(0,-46) ${rot(p.lean)} translate(0,46) translate(0,${breathe * 0.3})`}>
          <Arm sx={-7} sa={p.sL} ea={p.eL} wa={p.wL} hs={p.handL == null ? (propL ? HAND.grip : HAND.open) : p.handL} pr={propL} />
        </g>
        <Leg hx={-5} ha={p.hL} ka={p.kL} fa={p.fL} />
        <Leg hx={5} ha={p.hR} ka={p.kR} fa={p.fR} />
        <g transform={`translate(0,-46) ${rot(p.lean)} translate(0,46) translate(0,${breathe * 0.3})`}>
          <g transform={`translate(0,-62) ${rot(p.chest)} translate(0,62)`}>
          <Torso /><Head />
          <Arm sx={7} sa={p.sR} ea={p.eR} wa={p.wR} hs={p.handR == null ? (propR ? HAND.grip : HAND.open) : p.handR} pr={propR} />
          {children}
          </g>
        </g>
      </g>
    </g>
  );
}

// A handy flat lab set: table, broadcast pan with seedlings, a row of nursery bags.
function LabTable({ x, y, w = 520, h = 20, legH = 150, color = "#8D6E63" }) {
  return <g><rect x={x} y={y} width={w} height={h} rx="4" fill={color} /><rect x={x + 18} y={y + h} width="14" height={legH} fill="#6D4C41" /><rect x={x + w - 32} y={y + h} width="14" height={legH} fill="#6D4C41" /></g>;
}
function SeedPan({ x, y, w = 300, seedlings = 14, ruler = false, seed = 3 }) {
  const rnd = (i) => { const v = Math.sin((i + 1) * 12.9898 + seed) * 43758.5453; return v - Math.floor(v); };
  const h = w * 0.42;
  return <g transform={`translate(${x},${y})`}>
    <ellipse cx={w / 2} cy={h * 0.55} rx={w / 2} ry={h * 0.45} fill="#263238" />
    <ellipse cx={w / 2} cy={h * 0.45} rx={w / 2 - 6} ry={h * 0.38} fill="#5D4037" />
    {[...Array(seedlings)].map((_, i) => { const px = 20 + rnd(i) * (w - 40), py = h * 0.2 + rnd(i + 50) * h * 0.5;
      return <path key={i} d={`M${px} ${py} l-5 -10 M${px} ${py} l5 -10 M${px} ${py} l0 -13`} stroke="#66BB6A" strokeWidth="2.6" strokeLinecap="round" fill="none" />; })}
    {ruler && <rect x={-10} y={h * 0.42} width={w + 20} height="9" fill="rgba(255,255,255,0.8)" stroke="#8d8d8d" strokeWidth="1" />}
  </g>;
}
function NurseryBags({ x, y, n = 5, gap = 70 }) {
  return <g>{[...Array(n)].map((_, i) => <g key={i} transform={`translate(${x + i * gap},${y})`}>
    <path d="M0 0 h50 l-4 60 h-42z" fill="#263238" /><path d="M12 6 l-6 -22 M12 6 l0 -26 M12 6 l6 -20" stroke="#66BB6A" strokeWidth="3.2" strokeLinecap="round" fill="none" />
    <path d="M36 6 l-5 -16 M36 6 l5 -16" stroke="#66BB6A" strokeWidth="3" strokeLinecap="round" fill="none" /></g>)}</g>;
}

window.TPPeople = { SKIN, OUTFITS, POSES, PROPS, STAND, HAND, walk, wipe, count, scrub, blendPose, clipPose, clipByName, play, poseAt, Student, LabTable, SeedPan, NurseryBags };
