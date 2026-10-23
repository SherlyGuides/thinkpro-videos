/* global React, window */
// ThinkPro Academy — cached stage layer for explainer videos (window.TPStage).
// Verbatim house recipes promoted from production (Electrolysis explainer).
// Load order: animations-v2.jsx → motion.js → stage-kit.jsx → apparatus.jsx →
// your scene file. A per-video scene file should contain ONLY topic content:
// LABEL_LIST rows, caption timings, beat windows and rig calls.
const { Stage, Sprite, Easing, clamp } = window;
const { reveal, fade, windowOp, rock } = window.TPMotion;

// ---- Palette (mirrors the design-system tokens). applyAccent mutates in
// place so every consumer (incl. apparatus.jsx) sees the rebind. ------------
const COL = Object.assign({
  stage: "#3D495B", floor: "#2E3846",
  fill: "#3C4B5C", fillLo: "#33414F", outline: "#F28C3E",
  white: "#FFFFFF", dim: "rgba(255,255,255,0.62)",
  tint: "rgba(255,255,255,0.06)", line: "rgba(255,255,255,0.85)",
  pill: "rgba(51,56,69,0.40)", warm: "#F28C3E", rust: "#BB3B16", cool: "#87A2C6",
}, window.TP_THEME || {});
function applyAccent(hex) { if (hex) { COL.outline = hex; COL.cool = hex; } }
const SANS = "system-ui, -apple-system, 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif";
const HDG = { x: 0, y: 0 };   // global offset applied to every heading pill (set by StageFrame)
const num = (v, d) => { const n = parseFloat(v); return isFinite(n) ? n : d; };
const str = (v, d) => (v == null || v === "" ? d : v);

// ---- Label atoms -----------------------------------------------------------
// Heading NOTCH: flush with the stage top edge, only the bottom corners
// rounded. Shares the floor bar's fill + edge so top and bottom chrome read as
// one family. Never scaled.
function HeadingPill({ children, op = 1 }) {
  return (
    <div style={{ boxSizing: "border-box", display: "inline-flex", alignItems: "center", justifyContent: "center",
      padding: "26px 56px 24px", borderRadius: "0 0 44px 44px", background: "#20272F",
      borderBottom: "2px solid rgba(255,255,255,0.10)", boxShadow: "0 14px 36px rgba(0,0,0,0.20)", opacity: op }}>
      <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 46, color: COL.white, whiteSpace: "nowrap", lineHeight: 1.1, letterSpacing: "-0.01em" }}>{children}</span>
    </div>
  );
}
// ONE general pill class covering every non-heading label on the stage.
//   variant "tag"   = 26px sentence-case chip with a leading dot, radius 999
//   variant "badge" = 24px bold uppercase tracked label, radius 18
// Positioned (absolute) when x is given — anchored top-centre so scale grows
// downward and clears the floor predictably; inline (flow) when x is null.
function Label({ text, children, x, y, scale = 1, tone = "white", variant = "tag", op = 1 }) {
  if (op <= 0) return null;
  const content = text != null ? text : children;
  const cTag = tone === "warm" ? COL.warm : tone === "cool" ? COL.cool : COL.line;
  const cBadge = tone === "warm" ? COL.warm : tone === "cool" ? COL.cool : COL.white;
  const flow = x == null;
  const base = variant === "badge"
    ? { display: "inline-flex", padding: "10px 22px", borderRadius: 18, boxShadow: `0 0 0 2px ${cBadge}`,
        background: COL.tint, fontFamily: SANS, fontWeight: 700, fontSize: 24, letterSpacing: "0.12em",
        textTransform: "uppercase", color: cBadge, whiteSpace: "nowrap" }
    : { display: "inline-flex", alignItems: "center", gap: 12, padding: "10px 24px", borderRadius: 999,
        boxShadow: `0 0 0 2px ${cTag}`, background: COL.pill, fontFamily: SANS, fontSize: 26, color: COL.white, whiteSpace: "nowrap" };
  if (flow) base.opacity = op;
  const inner = variant === "badge"
    ? content
    : <React.Fragment><span style={{ width: 10, height: 10, borderRadius: "50%", background: cTag }} />{content}</React.Fragment>;
  const chip = <span style={base}>{inner}</span>;
  if (flow) return chip;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translateX(-50%) scale(${scale})`,
      transformOrigin: "center top", opacity: op }}>{chip}</div>
  );
}
// Body caption — always rendered ON the dark floor bar at the bottom of the
// stage (never floating in the scene centre).
function Caption({ children, op = 1 }) {
  if (!children || op <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 600, bottom: 0, minHeight: groundWrap.bottom - 6,
      display: "flex", alignItems: "center", justifyContent: "center", padding: "14px 60px", boxSizing: "border-box", opacity: op }}>
      <p style={{ margin: 0, textAlign: "center", fontFamily: SANS,
        fontSize: 44, color: COL.white, lineHeight: 1.2 }}>{children}</p>
    </div>
  );
}
function TitleCard({ lt, children }) {
  const op = windowOp(lt, 0, 2.3, 0.4);
  const dy = (1 - Easing.easeOutCubic(reveal(lt, 0.05, 0.7))) * 26;
  if (op <= 0) return null;
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: op }}>
      <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 84, color: COL.white, textAlign: "center",
        maxWidth: 1500, lineHeight: 1.15, transform: `translateY(${dy}px)` }}>{children}</div>
    </div>
  );
}
// ---- Captions (voice-sync §3) ----------------------------------------------
// Display windows are used AS AUTHORED — never rescaled by a pacing/slow
// factor: with a warp in place that double-compresses and truncates lines.
// capOp is the ONLY caption-opacity path. Standard fade 0.25s, but when a
// line's end meets the next line's start (within CAP_JOIN — the two halves of
// ONE spoken sentence) both fades are suppressed and it cuts straight over,
// otherwise the crossing fades punch a visible hole mid-sentence.
const CAP_FADE = 0.25, CAP_JOIN = 0.08;
function capIndex(lt, lines) {
  if (!lines) return -1;
  for (let i = 0; i < lines.length; i++) if (lt >= lines[i][0] && lt < lines[i][1]) return i;
  return -1;
}
function capOp(lt, lines) {
  const i = capIndex(lt, lines);
  if (i < 0) return 0;
  const [s, e] = lines[i], prev = lines[i - 1], next = lines[i + 1];
  const fi = prev && s - prev[1] <= CAP_JOIN ? 0 : CAP_FADE;
  const fo = next && next[0] - e <= CAP_JOIN ? 0 : CAP_FADE;
  return clamp(Math.min(fi > 0 ? (lt - s) / fi : 1, fo > 0 ? (e - lt) / fo : 1), 0, 1);
}
// Timed subtitles: lines = [[start, end, text], …] in beat-local seconds.
function Subtitle({ lt, lines, show }) {
  if (!show) return null;
  return <Caption op={capOp(lt, lines)}>{subText(lt, lines)}</Caption>;
}
// subText/subOp remain as the pick/alias pair; opacity always routes through capOp.
function subText(lt, lines) { const i = capIndex(lt, lines); return i < 0 ? null : lines[i][2]; }
function subOp(lt, lines) { return capOp(lt, lines); }

// ---- Arrow atoms -------------------------------------------------------------
// House arrows (audio-sync pipeline §7): the shaft stops at the head's BASE
// and the solid head's apex sits exactly at the tip — base = tip − dir ×
// headLen — with strokeLinejoin round. Never draw line-through-triangle arrows
// by hand; use these inside any stage SVG.
function VArrow({ x, from, to, color = COL.white, sw = 5, headLen = 26, headW = 32, op = 1 }) {
  if (op <= 0) return null;
  const dir = to > from ? 1 : -1;
  const base = to - dir * headLen;
  return (
    <g stroke={color} strokeWidth={sw} fill={color} strokeLinejoin="round" opacity={op}>
      <line x1={x} y1={from} x2={x} y2={base} />
      <path d={`M${x} ${to} L${x - headW / 2} ${base} L${x + headW / 2} ${base} Z`} />
    </g>
  );
}
function HArrow({ y, from, to, color = COL.white, sw = 5, headLen = 26, headW = 32, op = 1 }) {
  if (op <= 0) return null;
  const dir = to > from ? 1 : -1;
  const base = to - dir * headLen;
  return (
    <g stroke={color} strokeWidth={sw} fill={color} strokeLinejoin="round" opacity={op}>
      <line x1={from} y1={y} x2={base} y2={y} />
      <path d={`M${to} ${y} L${base} ${y - headW / 2} L${base} ${y + headW / 2} Z`} />
    </g>
  );
}

// ---- Narrated-video retime (audio-sync pipeline §2) --------------------------
// Retimes a FINISHED composition to measured narration without touching scene
// code. The DC's plain inline script sets window.MD_TIMESCALE (global) and
// window.MD_SCENE = { sceneName: factor } (per scene, from the per-scene
// least-squares fit of speech onsets). Wrap the SceneStage children map in
// retimeScenes(map): each scene's localTime/dur are divided by
// SLOW × MD_TIMESCALE × MD_SCENE[name]. The durs in the OM_SCENES literal must
// be PRE-MULTIPLIED by the same factors so wall-clock windows agree. Scene-
// relative cue tables (captions, label windows, drivers) inherit the retime
// automatically — everything is a pure function of scene-local time.
// NOTE: MD_* values only apply on page reload (§5) — reload, verify duration,
// then export.
const SLOW = 1; // house base timescale
function mdFactor(name) {
  const g = Number(window.MD_TIMESCALE) > 0 ? Number(window.MD_TIMESCALE) : 1;
  const per = window.MD_SCENE && Number(window.MD_SCENE[name]) > 0 ? Number(window.MD_SCENE[name]) : 1;
  return SLOW * g * per;
}
// ---- Time warp (voice-sync §1) ----------------------------------------------
// The voice timeline is PRIMARY; the animation warps to it. Never author an
// animation and pad the script with silence to match — that is backwards and
// it shipped 42-second walls of dead air. window.MD_WARP[scene] =
// [[playbackTime, authoredTime], …] maps playback → the scene's authored clock
// piecewise-linearly, so authoring stays in comfortable authored time while
// playback compresses the silent stretches and lands every cue on its measured
// voice onset. Build the table with TPVoice.buildWarp (monotonic + 5s dead-air
// cap). A warp REPLACES the flat MD_TIMESCALE/MD_SCENE factor for that scene.
function warpFor(name) {
  const w = window.MD_WARP && window.MD_WARP[name];
  return w && w.length >= 2 ? w : null;
}
function sceneTime(name, t) {
  const w = warpFor(name);
  if (w) return window.TPVoice ? window.TPVoice.warpTime(w, t) : t;
  return t / mdFactor(name);
}
function retimeScenes(map) {
  const out = {};
  Object.keys(map).forEach((name) => {
    const Comp = map[name];
    out[name] = function RetimedScene(props) {
      if (warpFor(name)) {
        return <Comp {...props} localTime={sceneTime(name, props.localTime)} dur={sceneTime(name, props.dur)} />;
      }
      const f = mdFactor(name);
      if (f === 1) return <Comp {...props} />;
      return <Comp {...props} localTime={props.localTime / f} dur={props.dur / f} />;
    };
  });
  return out;
}
// Statement banner (§4): a conclusion line that must NEVER wrap to two lines.
function Statement({ children, op = 1, size = 44, y = 300 }) {
  if (op <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 600, top: y, display: "flex", justifyContent: "center", opacity: op }}>
      <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: size, color: COL.white, whiteSpace: "nowrap", lineHeight: 1.1 }}>{children}</span>
    </div>
  );
}
// ArcArrow (§11): rotation arrows are DERIVED from the part's radius — never
// hand-plotted path coordinates (those read as broken at every other radius).
// The head sits on the tangent at the arc's end.
function ArcArrow({ cx, cy, r, from = -60, to = 60, color = COL.white, sw = 5, headLen = 26, headW = 30, op = 1 }) {
  if (op <= 0 || !(r > 0)) return null;
  const rad = (d) => (d * Math.PI) / 180;
  const pt = (d) => [cx + r * Math.cos(rad(d)), cy + r * Math.sin(rad(d))];
  const dir = to >= from ? 1 : -1;
  const headDeg = (headLen / r) * (180 / Math.PI) * dir;
  const endDeg = to - headDeg;                       // shaft stops at the head's BASE
  const [x0, y0] = pt(from), [x1, y1] = pt(endDeg), [tx, ty] = pt(to);
  const large = Math.abs(endDeg - from) > 180 ? 1 : 0;
  // head base spans the radial normal at the arc's end; apex on the tangent
  const px = -Math.cos(rad(endDeg)), py = -Math.sin(rad(endDeg));
  return (
    <g stroke={color} strokeWidth={sw} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={op}>
      <path d={`M${x0} ${y0} A${r} ${r} 0 ${large} ${dir > 0 ? 1 : 0} ${x1} ${y1}`} />
      <path fill={color} d={`M${tx} ${ty} L${x1 + (px * headW) / 2} ${y1 + (py * headW) / 2} L${x1 - (px * headW) / 2} ${y1 - (py * headW) / 2} Z`} />
    </g>
  );
}
// §10 Frame geometry — template defaults, never per-video tuning. Floor bar is
// 85px; grounded objects anchor floorHeight + 6 so the ~5px centred accent
// stroke rests ON the floor line instead of dipping through it. This constant
// and the DC's floorHeight tweak default must change together (§5).
const FLOOR_H_DEFAULT = 85;

// ---- Label registry --------------------------------------------------------
// LABEL_LIST row: [id, scene, text, x, y, variant, tone, timing]
// timing: { at, dur, back } for a reveal, or { win:[s,e,f] } for a window.
// x/y are stage-absolute defaults; per-label Tweak X/Y are added as OFFSETS.
function labelOp(lt, d) {
  if (d.win) return windowOp(lt, d.win[0], d.win[1], d.win[2] == null ? 0.5 : d.win[2]);
  const o = reveal(lt, d.at, d.dur == null ? 0.6 : d.dur);
  return d.back ? Easing.easeOutBack(o) : o;
}
// makeSceneLabels(LABEL_LIST) → renderSceneLabels(sceneNum, lt, props):
// renders all of a scene's labels, applying per-label Tweaks
// (Text override + X/Y OFFSETS + Scale) pulled from the DC props.
function makeSceneLabels(list) {
  const LABELS = {};
  for (const [id, scene, text, x, y, variant, tone, tim] of list) {
    LABELS[id] = { scene, text, x, y, variant, tone, ...tim };
  }
  return function renderSceneLabels(sceneNum, lt, props) {
    const out = [];
    for (const id in LABELS) {
      const d = LABELS[id];
      if (d.scene !== sceneNum) continue;
      out.push(
        <Label key={id}
          text={str(props[id + "Text"], d.text)}
          x={d.x + num(props[id + "X"], 0)}
          y={d.y + num(props[id + "Y"], 0)}
          scale={num(props[id + "Scale"], 1)}
          tone={d.tone} variant={d.variant} op={labelOp(lt, d)} />
      );
    }
    return out;
  };
}

// ---- Scene shell ------------------------------------------------------------
// The standard one-beat scaffold: cross-dissolve, TitleCard, the HDG-offset
// HeadingPill (constant reveal(lt, 2.0, 0.6) entrance; NEVER scaled), the
// scene body, timed Subtitle.
function Shell({ lt, dur, title, pill, pillT = { x: 0, y: 0 }, children, captions, showCaps }) {
  const op = fade(lt, dur, 0.55, 0.6);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: op }}>
      <TitleCard lt={lt}>{title}</TitleCard>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, display: "flex", justifyContent: "center",
        opacity: reveal(lt, 2.0, 0.6) }}>
        <div style={{ transform: `translate(${pillT.x + HDG.x}px, ${pillT.y + HDG.y}px)` }}><HeadingPill>{pill}</HeadingPill></div>
      </div>
      {children}
      <Caption op={showCaps ? subOp(lt, captions) : 0}>{subText(lt, captions)}</Caption>
    </div>
  );
}
const groundWrap = { position: "absolute", left: 0, right: 0, bottom: 91, display: "flex", justifyContent: "center" };  // floorHeight(85) + 6, kept in sync by StageFrame (§7: the ~5px accent stroke is painted centered, so +6 rests it ON the floor line)
// LogoPlatform — the composition rule: animated elements must NOT intersect
// the logo lockup. When overlap is unavoidable, rise this small solid slate
// platform (NO outline) above the logo first, then place objects on it.
// `up` 0→1 drives the rise; children render standing on the platform top.
function LogoPlatform({ up = 1, w = 460, h = 26, right = 40, bottom = 250, children }) {
  const rise = Easing.easeOutCubic(clamp(up, 0, 1));
  if (rise <= 0) return null;
  return (
    <div style={{ position: "absolute", right, bottom, opacity: rise }}>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: h, display: "flex", justifyContent: "center",
        transform: `translateY(${(1 - rise) * 40}px)` }}>{children}</div>
      <div style={{ width: w, height: h, borderRadius: 6, background: COL.fill,
        transform: `translateY(${(1 - rise) * 40}px)` }} />
    </div>
  );
}

// ---- Stage frame -------------------------------------------------------------
// The whole per-video boilerplate: accent rebind, keyable chroma swap, whole-
// stage scale, branded background + 85px floor + optional logo lockup, global
// heading offset from tweaks. Wrap all beats in one <StageFrame>.
// Real photo in a house card (radius 18, 2px white outline, no shadow). Until the reviewer uploads
// it (review page → 📷), a dashed "Photo needed" placeholder shows instead. Declare slots with
// tools/photo_slots.py; the export refuses to render while any slot is still missing.
function Photo({ slot, x, y, w, h, op = 1, fit = "cover", caption }) {
  if (op <= 0) return null;
  const src = (window.TP_PHOTOS || {})[slot];
  const box = { position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 18, overflow: "hidden",
    boxShadow: `0 0 0 2px ${src ? COL.line : COL.warm}`, opacity: op, boxSizing: "border-box" };
  return (
    <div style={box}>
      {src
        ? <img src={src} alt={caption || slot} style={{ width: "100%", height: "100%", objectFit: fit, display: "block", background: COL.fillLo }} />
        : <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: 10, background: COL.pill, border: `3px dashed ${COL.warm}`, borderRadius: 18, boxSizing: "border-box",
            fontFamily: SANS, color: COL.white, textAlign: "center", padding: 24 }}>
            <div style={{ fontSize: 30, fontWeight: 700, color: COL.warm }}>Photo needed</div>
            <div style={{ fontSize: 22, color: COL.dim }}>{slot}</div>
          </div>}
    </div>
  );
}
// Exposes the playhead to the page (used by engine/notes.js).
function TimeProbe() {
  const tl = window.useTimeline();
  window.TP_NOW = { time: tl.time, duration: tl.duration, playing: !!(tl.playing || tl.extPlaying) };
  return null;
}
function StageFrame({ props = {}, dur, persistKey, children }) {
  applyAccent(props.accentColor);
  const keyable = props.keyable === true || props.keyable === "true";
  let SCALE = parseFloat(props.scale); if (!isFinite(SCALE)) SCALE = 1;
  // Backdrop is VECTOR by default: a layered CSS gradient reproducing the slate
  // vignette (soft light high-centre, darker corners). Sharp at any scale and
  // nothing to serialize per frame on .mp4 export. Pass `background` (a URL) to
  // go back to a bitmap.
  const BG = props.background || null;
  const BG_VECTOR = [
    "radial-gradient(120% 90% at 50% 4%, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.05) 34%, rgba(255,255,255,0) 62%)",
    "radial-gradient(90% 70% at 12% 96%, rgba(0,0,0,0.20) 0%, rgba(0,0,0,0) 60%)",
    "radial-gradient(90% 70% at 88% 96%, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0) 60%)",
    "linear-gradient(178deg, #4A566A 0%, #414D60 44%, #384453 100%)",
  ].join(", ");
  const showLogo = props.showLogo === false || props.showLogo === "false" ? false : true;
  const FLOOR_H = num(props.floorHeight, 85);
  const floorColor = props.floorColor || COL.floor;
  const logoDx = num(props.logoX, 0), logoDy = num(props.logoY, 70);
  let logoScale = parseFloat(props.logoScale); if (!isFinite(logoScale)) logoScale = 1;
  groundWrap.bottom = FLOOR_H + 6; // grounded objects anchor floorHeight + 6 (§7)
  HDG.x = num(props.headingsX != null ? props.headingsX : props.headingX, 0);
  HDG.y = num(props.headingsY != null ? props.headingsY : props.headingY, 0);
  // Render resolution: scenes are AUTHORED at 1920×1080 and the whole tree is
  // scaled up so the exported frame is 4K (renderScale 2 → 3840×2160). Vector
  // backdrop + text stay sharp; nothing in a scene needs new coordinates.
  let RS = parseFloat(props.renderScale); if (!isFinite(RS) || RS <= 0) RS = 2;
  return (
    <Stage width={1920 * RS} height={1080 * RS} duration={dur} background={keyable ? "#00B140" : COL.stage} persistKey={persistKey}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, transform: `scale(${RS})`, transformOrigin: "top left" }}>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${SCALE})`, transformOrigin: "center center" }}>
        {!keyable && (
          <Sprite start={0} end={dur}>
            {() => (
              <div style={{ position: "absolute", inset: 0, background: BG ? `url("${BG}") center / cover no-repeat` : BG_VECTOR }}>
                <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: FLOOR_H, background: floorColor,
                  borderTop: "2px solid rgba(255,255,255,0.10)", boxShadow: "0 -18px 40px rgba(0,0,0,0.22)" }} />
                {showLogo && (
                  // Logo plate straddles the floor line (binding): plate bottom = FLOOR_H − logoY places its
                  // vertical centre on the floor's top edge at the defaults logoY: 70 / logoScale: 1 — half above, half below.
                  <div style={{ position: "absolute", right: 60 - logoDx, bottom: FLOOR_H + 33 - logoDy, background: "#fff", padding: 0, borderRadius: 26, overflow: "hidden",
                    transform: `scale(${logoScale})`, transformOrigin: "bottom right" }}>
                    <img src={(window.TP_ASSETS || "assets/") + "thinkpro-logo.png"} alt="ThinkPro Academy" style={{ display: "block", width: 320, height: "auto" }} />
                  </div>
                )}
              </div>
            )}
          </Sprite>
        )}
        <TimeProbe />
        {children}
      </div>
      </div>
    </Stage>
  );
}

window.TPStage = { COL, SANS, HDG, applyAccent, num, str, HeadingPill, Label, Caption, TitleCard, Subtitle, subText, subOp, capOp, capIndex, CAP_FADE, CAP_JOIN, Statement, ArcArrow, warpFor, sceneTime, labelOp, makeSceneLabels, Shell, groundWrap, LogoPlatform, StageFrame, Photo, VArrow, HArrow, mdFactor, retimeScenes };
