/* global React, window */
// ThinkPro Academy — STORY kit (window.TPStory): the alternate "photo story" system.
// Dark-green stage, photos in motion on the LEFT (75%), a cream information panel
// on the RIGHT (25%) that builds up line by line, gold "Do you know?" cards,
// Cambria headings + Calibri text. Same engine, same timing, same review tools as
// the house style — only the frame and atoms differ. Everything is a pure
// function of time (scrub/export exact).
// Load order: animations-v2.jsx → motion.js → voice-sync.js → stage-kit.jsx → story-kit.jsx → scenes.jsx
const { Stage, Sprite, Easing, clamp } = window;
const { reveal, fade, windowOp } = window.TPMotion;
const { capOp, subText, num, str } = window.TPStage;

// ---- Palette + type ----------------------------------------------------------
const SK = {
  bg0: "#0F3D2E", bg1: "#1E5631", bgDeep: "#0A2B20",
  cream: "#F6F1E3", creamEdge: "#E3DBC3", ink: "#163A2C", inkDim: "rgba(22,58,44,0.62)", inkLine: "rgba(22,58,44,0.18)",
  gold: "#E2B04C", goldDeep: "#B8861B", white: "#FFFFFF", dim: "rgba(255,255,255,0.72)",
  leaf: "#8BD48A", card: "rgba(5,30,22,0.58)", line: "rgba(255,255,255,0.80)", soil: "#5C4A3E",
};
const SERIF = "'Caladea', 'Cambria', Georgia, 'Times New Roman', serif";
const SANS = "'Carlito', 'Calibri', 'Segoe UI', system-ui, sans-serif";
const LEFT_W = 1440, PANEL_X = 1440, PANEL_W = 480, PAD = 36;
const ENGINE = (window.TP_ENGINE || "../../engine/");

// Fonts (Cambria / Calibri from engine/fonts, local render only).
(function fonts() { /* public build: Caladea + Carlito from Google Fonts (see index.html) */ })();

const pop = (lt, at, d = 0.5) => Easing.easeOutBack(reveal(lt, at, d));
const out3 = (lt, at, d = 0.7) => Easing.easeOutCubic(reveal(lt, at, d));
const lerp = (a, b, t) => a + (b - a) * t;
// Eased 0→1 over [a,b]: gentle start and stop, steady in the middle.
const drive = (lt, a, b) => { const x = clamp((lt - a) / Math.max(0.1, b - a), 0, 1); return x - Math.sin(2 * Math.PI * x) / (2 * Math.PI); };
const photoSrc = (slot) => (window.TP_PHOTOS || {})[slot] || null;

// ---- Photo in motion ---------------------------------------------------------
// fx: "zoom" (slow Ken Burns push-in), "pan" (slow drift left→right), "pop"
// (easeOutBack arrival), "none". `at` = arrival, `out` = departure (beat-local s).
// Until the photo exists (generated or uploaded) a dashed gold placeholder shows.
function Pic({ slot, src, label, x, y, w, h, lt = 0, at = 0, dur = 0.8, fx = "zoom", out = null, outDur = 0.5,
  r = 18, fit = "cover", pos = "center", zoom = 1.12, kenDur = 14, op = 1, border = true, dim = 0, children, style }) {
  const img = src || photoSrc(slot);
  const a = reveal(lt, at, dur);
  const o = (out != null ? 1 - reveal(lt, out, outDur) : 1) * op * (fx === "pop" ? clamp(a * 1.6, 0, 1) : Easing.easeOutCubic(a));
  if (o <= 0) return null;
  const sc = fx === "pop" ? 0.82 + 0.18 * Easing.easeOutBack(a) : 1;
  const k = clamp((lt - at) / kenDur, 0, 1);
  const ken = fx === "zoom" ? 1 + (zoom - 1) * k : fx === "pan" ? 1.12 : 1;
  const panX = fx === "pan" ? lerp(-5, 5, k) : 0;
  const box = { position: "absolute", left: x, top: y, width: w, height: h, borderRadius: r, overflow: "hidden", opacity: o,
    transform: `scale(${sc})`, transformOrigin: "center center", boxSizing: "border-box",
    boxShadow: border ? `0 0 0 3px rgba(255,255,255,0.55)` : "none", background: SK.bgDeep, ...(style || {}) };
  return (
    <div style={box}>
      {img
        ? <img src={img} alt={label || slot} style={{ width: "100%", height: "100%", objectFit: fit, objectPosition: pos, display: "block",
            transform: `scale(${ken}) translateX(${panX}%)`, transformOrigin: "center center" }} />
        : <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8,
            border: `3px dashed ${SK.gold}`, borderRadius: r, boxSizing: "border-box", background: "rgba(255,255,255,0.06)", padding: 20, textAlign: "center" }}>
            <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: Math.min(30, Math.max(18, w / 9)), color: SK.gold }}>Photo</div>
            <div style={{ fontFamily: SANS, fontSize: Math.min(24, Math.max(15, w / 12)), color: SK.dim, lineHeight: 1.2 }}>{label || slot}</div>
          </div>}
      {dim > 0 && <div style={{ position: "absolute", inset: 0, background: `rgba(5,30,22,${dim})` }} />}
      {children}
    </div>
  );
}
// Small cream label pill (photo names, step names). Anchored top-centre at x,y.
function Chip({ text, x, y, lt = 0, at = 0, out = null, tone = "cream", size = 24, op = 1, anchor = "center" }) {
  const o = pop(lt, at) * (out != null ? 1 - reveal(lt, out, 0.4) : 1) * op;
  if (o <= 0) return null;
  const bg = tone === "gold" ? SK.gold : tone === "green" ? SK.bg1 : SK.cream;
  const fg = tone === "green" ? SK.white : SK.ink;
  const tx = anchor === "left" ? "0" : anchor === "right" ? "-100%" : "-50%";
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translateX(${tx}) scale(${0.9 + 0.1 * o})`, transformOrigin: "center top", opacity: o,
      fontFamily: SANS, fontWeight: 700, fontSize: size, color: fg, background: bg, padding: "6px 18px", borderRadius: 999, whiteSpace: "nowrap",
      boxShadow: "0 2px 10px rgba(0,0,0,0.25)" }}>{text}</div>
  );
}
// Gold "DO YOU KNOW?" badge (or any short shout).
function Badge({ text = "DO YOU KNOW?", x, y, lt = 0, at = 0, op = 1, size = 32 }) {
  const o = pop(lt, at, 0.6) * op;
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `scale(${0.7 + 0.3 * o}) rotate(${-2 * (1 - o)}deg)`, transformOrigin: "left center", opacity: o,
      fontFamily: SERIF, fontWeight: 700, fontSize: size, letterSpacing: "0.06em", color: SK.ink, background: SK.gold, padding: "10px 28px", borderRadius: 14,
      boxShadow: "0 6px 18px rgba(0,0,0,0.3)", whiteSpace: "nowrap" }}>{text}</div>
  );
}
// A large statement over the photo area (big question, quick check).
function Big({ children, x = 80, y = 120, w = LEFT_W - 160, lt = 0, at = 0, out = null, size = 56, op = 1, align = "left", color = SK.white, serif = true }) {
  const o = out3(lt, at, 0.7) * (out != null ? 1 - reveal(lt, out, 0.5) : 1) * op;
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, opacity: o, transform: `translateY(${(1 - o) * 18}px)`,
      fontFamily: serif ? SERIF : SANS, fontWeight: 700, fontSize: size, lineHeight: 1.18, color, textAlign: align,
      textShadow: "0 2px 14px rgba(0,0,0,0.45)" }}>{children}</div>
  );
}
// Translucent dark card on the photo area (text blocks, DYK facts).
function Card({ x, y, w, h, lt = 0, at = 0, out = null, op = 1, r = 22, children, pad = 28 }) {
  const o = out3(lt, at, 0.6) * (out != null ? 1 - reveal(lt, out, 0.5) : 1) * op;
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: r, background: SK.card, opacity: o, boxSizing: "border-box", padding: pad,
      boxShadow: "0 0 0 2px rgba(255,255,255,0.18)", backdropFilter: "none" }}>{children}</div>
  );
}

// ---- Right panel: title + key information, built line by line ------------------
// lines: [{ text, at, kind, out }], kinds: head | item | sub | think | big | plain | source
// When more than `max` lines are on, the earliest collapse as the voice moves on.
function Panel({ lt = 0, kicker, title, titleAt = 0.15, lines = [], max = 6, bottom }) {
  const tOp = out3(lt, titleAt, 0.7);
  const items = lines.map((l, i) => {
    const at = l.at != null ? l.at : 0;
    const outAt = l.out != null ? l.out : (lines[i + max] ? lines[i + max].at : null);
    const inO = Easing.easeOutCubic(reveal(lt, at, 0.55));
    const outO = outAt != null ? Easing.easeInCubic(reveal(lt, outAt, 0.5)) : 0;
    return { ...l, o: inO * (1 - outO), col: 1 - outO, inO };
  });
  const kindStyle = (k) => {
    switch (k) {
      case "head": return { fontFamily: SERIF, fontWeight: 700, fontSize: 27, color: SK.ink, marginTop: 8 };
      case "sub": return { fontFamily: SANS, fontSize: 23, color: SK.inkDim, paddingLeft: 26 };
      case "think": return { fontFamily: SANS, fontStyle: "italic", fontSize: 24, color: SK.goldDeep, marginTop: 6 };
      case "big": return { fontFamily: SANS, fontWeight: 700, fontSize: 30, color: SK.ink };
      case "source": return { fontFamily: SANS, fontSize: 19, color: SK.inkDim, marginTop: 10 };
      case "plain": return { fontFamily: SANS, fontSize: 26, color: SK.ink };
      default: return { fontFamily: SANS, fontSize: 26, color: SK.ink };
    }
  };
  return (
    <div style={{ position: "absolute", left: PANEL_X + PAD, top: 54, width: PANEL_W - PAD * 2, bottom: 150, overflow: "hidden" }}>
      {kicker && <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 17, letterSpacing: "0.14em", textTransform: "uppercase", color: SK.goldDeep, opacity: tOp, marginBottom: 6 }}>{kicker}</div>}
      {title && <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 36, lineHeight: 1.12, color: SK.ink, opacity: tOp, transform: `translateY(${(1 - tOp) * 10}px)`,
        paddingBottom: 12, marginBottom: 14, borderBottom: `3px solid ${SK.gold}` }}>{title}</div>}
      {items.map((l, i) => (
        <div key={i} style={{ opacity: l.o, maxHeight: 400 * l.col, marginBottom: 12 * l.col, overflow: "hidden", transform: `translateX(${(1 - l.inO) * 14}px)`,
          display: "flex", gap: 10, alignItems: "flex-start", lineHeight: 1.22, ...kindStyle(l.kind) }}>
          {(l.kind === "item" || !l.kind) && <span style={{ flex: "none", width: 10, height: 10, borderRadius: 3, background: SK.gold, marginTop: 11 }} />}
          <span>{l.text}</span>
        </div>
      ))}
      {bottom}
    </div>
  );
}

// ---- Caption (spoken line) at the foot of the photo area ----------------------
function Caption({ children, op = 1, size = 34 }) {
  if (!children || op <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 40, width: LEFT_W - 80, bottom: 22, display: "flex", justifyContent: "center", opacity: op }}>
      <span style={{ fontFamily: SANS, fontSize: size, color: SK.white, background: "rgba(4,24,18,0.62)", padding: "8px 24px", borderRadius: 12,
        whiteSpace: "nowrap", lineHeight: 1.25 }}>{children}</span>
    </div>
  );
}

// ---- SVG helpers ---------------------------------------------------------------
function SVG({ op = 1, children, style }) {
  if (op <= 0) return null;
  return (
    <svg width="1920" height="1080" viewBox="0 0 1920 1080" fill="none"
      style={{ position: "absolute", left: 0, top: 0, opacity: op, overflow: "visible", pointerEvents: "none", ...(style || {}) }}>{children}</svg>
  );
}
function Arrow({ x1, y1, x2, y2, color = SK.white, sw = 6, head = 22, op = 1 }) {
  if (op <= 0) return null;
  const a = Math.atan2(y2 - y1, x2 - x1), c = Math.cos(a), s = Math.sin(a);
  const bx = x2 - c * head, by = y2 - s * head;
  return (
    <g opacity={op}>
      <line x1={x1} y1={y1} x2={bx} y2={by} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <path d={`M${x2} ${y2} L${bx - s * head * 0.6} ${by + c * head * 0.6} L${bx + s * head * 0.6} ${by - c * head * 0.6} Z`} fill={color} />
    </g>
  );
}
// Countdown ring (think moments): counts n→1 over [from,to].
function Ring({ cx, cy, r = 70, from, to, lt, n = 3, color = SK.gold }) {
  const op = windowOp(lt, from - 0.2, to + 0.2, 0.3);
  if (op <= 0) return null;
  const p = clamp((lt - from) / (to - from), 0, 1), C = 2 * Math.PI * r;
  const k = Math.max(1, Math.ceil(n * (1 - p)));
  return (
    <g opacity={op}>
      <circle cx={cx} cy={cy} r={r} stroke="rgba(255,255,255,0.3)" strokeWidth="8" />
      <circle cx={cx} cy={cy} r={r} stroke={color} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${C * (1 - p)} ${C}`} transform={`rotate(-90 ${cx} ${cy})`} />
      <text x={cx} y={cy + 22} textAnchor="middle" fontFamily={SERIF} fontWeight="700" fontSize="64" fill={SK.white}>{k}</text>
    </g>
  );
}
// Flat scene text inside SVG (labels on diagrams).
function T({ x, y, size = 26, color = SK.white, w = 400, bold = false, anchor = "middle", serif = false, op = 1, children, italic = false }) {
  if (op <= 0) return null;
  return <text x={x} y={y} textAnchor={anchor} fontFamily={serif ? SERIF : SANS} fontWeight={bold ? 700 : w} fontSize={size} fill={color} opacity={op}
    fontStyle={italic ? "italic" : "normal"}>{children}</text>;
}

// ---- Preview chime (Do you know?) — Web Audio, preview only -----------------------
// Fires once when the playhead crosses `t` while playing. The export mixes a chime
// from audio/sfx.json instead (see tools/export.sh).
function ChimeAt({ t }) {
  const tl = window.useTimeline();
  const last = React.useRef(null);
  React.useEffect(() => {
    const playing = tl.playing || tl.extPlaying;
    const prev = last.current; last.current = tl.time;
    if (!playing || prev == null || !(prev < t && tl.time >= t) || tl.time - t > 0.6) return;
    if (window.TP_AUDIO && /mix\.mp3/.test(window.TP_AUDIO)) return;   // the chime is already in the mixed audio
    try {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      const ctx = window.TP_AC || (window.TP_AC = new AC());
      [[880, 0], [1318.5, 0.16]].forEach(([f, d]) => {
        const o = ctx.createOscillator(), g = ctx.createGain(); o.type = "sine"; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, ctx.currentTime + d); g.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + d + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + d + 0.9);
        o.connect(g).connect(ctx.destination); o.start(ctx.currentTime + d); o.stop(ctx.currentTime + d + 1);
      });
    } catch (e) { /* no audio in this context */ }
  }, [tl.time, tl.playing, tl.extPlaying]);
  return null;
}
// Exposes the playhead to the page (engine/notes.js).
function TimeProbe() {
  const tl = window.useTimeline();
  window.TP_NOW = { time: tl.time, duration: tl.duration, playing: !!(tl.playing || tl.extPlaying) };
  return null;
}

// ---- Presenter stops ----------------------------------------------------------------
// StopCard: "Pause and discuss" card over the photo area during a silent hold (a
// sentence's pauseAfter). StopAt: on the web player, really freeze the timeline when
// the playhead reaches the stop; when the teacher presses play, skip the rest of the
// hold. The export (frame-by-frame seeks) just shows the card for the hold.
function StopCard({ lt, at, hold, question, n, total, op = 1 }) {
  const o = windowOp(lt, at, at + hold, 0.35) * op;
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 40, top: 60, width: LEFT_W - 80, height: 900, borderRadius: 26, background: "rgba(5,30,22,0.82)", opacity: o,
      boxShadow: "0 0 0 3px rgba(226,176,76,0.9)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 80, boxSizing: "border-box", textAlign: "center" }}>
      <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 30, letterSpacing: "0.08em", color: SK.ink, background: SK.gold, padding: "10px 30px", borderRadius: 14 }}>PAUSE AND DISCUSS</div>
      <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 56, lineHeight: 1.2, color: SK.white, marginTop: 44, maxWidth: 1100 }}>{question}</div>
      <div style={{ fontFamily: SANS, fontSize: 26, color: SK.dim, marginTop: 50 }}>{n && total ? `Stop ${n} of ${total} · ` : ""}press play to continue</div>
    </div>
  );
}
function StopAt({ t, hold }) {
  const tl = window.useTimeline();
  const st = React.useRef({ last: null, armed: true });
  React.useEffect(() => {
    if (window.TP_AUTOSTOP === false) return;
    const playing = tl.playing || tl.extPlaying, prev = st.current.last; st.current.last = tl.time;
    if (tl.time < t - 1 || tl.time > t + hold + 1) { st.current.armed = true; return; }
    if (playing && st.current.armed && prev != null && prev < t && tl.time >= t) {
      st.current.armed = false; tl.setTime(t + 0.1);
      // Pause through the player's own key handler (same path as the teacher's space bar) — a
      // bare setPlaying(false) from here was ignored on hosted copies in a background tab.
      window.dispatchEvent(new KeyboardEvent("keydown", { code: "Space", bubbles: true }));
      return;
    }
    if (playing && !st.current.armed && tl.time >= t && tl.time < t + hold - 0.5) tl.setTime(t + hold - 0.45);
  }, [tl.time, tl.playing, tl.extPlaying]);
  return null;
}
// Visual break: the stage fades to plain green and a leaf wipes across (before a Do-you-know card).
function Break({ lt, at, dur = 2.5 }) {
  const o = reveal(lt, at, 0.5); if (o <= 0) return null;
  const p = clamp((lt - at - 0.3) / (dur - 0.5), 0, 1), x = -400 + p * 2800, y = 540 + Math.sin(p * Math.PI) * -120;
  return (
    <div style={{ position: "absolute", inset: 0, background: SK.bg0, opacity: o, zIndex: 5 }}>
      <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(${x} ${y}) rotate(${-20 + p * 40})`} opacity={Math.min(1, p * 4, (1 - p) * 4)}>
          <path d="M0 0 C 120 -140, 320 -140, 420 0 C 320 140, 120 140, 0 0 Z" fill={SK.leaf} />
          <path d="M20 0 L 400 0" stroke={SK.bg1} strokeWidth="6" strokeLinecap="round" />
          {[0.25, 0.45, 0.65].map((k) => <path key={k} d={`M${20 + k * 380} 0 L ${60 + k * 380} ${-60 * (1 - k)} M${20 + k * 380} 0 L ${60 + k * 380} ${60 * (1 - k)}`} stroke={SK.bg1} strokeWidth="4" strokeLinecap="round" fill="none" />)}
        </g>
      </svg>
    </div>
  );
}
// Flip card (quick checks, "why smart" cards): gold "?" back → cream front.
function Flip({ x, y, w, h, lt, at, q, n, label = "QUESTION", size = 38 }) {
  const p = reveal(lt, at, 0.7);
  if (p <= 0) return null;
  const front = p > 0.5, sx = Math.abs(1 - 2 * Easing.easeInOutCubic(p));
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, transform: `scaleX(${Math.max(0.02, sx)})`, borderRadius: 22, boxSizing: "border-box",
      background: front ? SK.cream : SK.gold, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 34px", textAlign: "center", boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }}>
      {front
        ? <div>{n != null && <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 20, letterSpacing: "0.12em", color: SK.goldDeep, marginBottom: 10 }}>{label} {n}</div>}
            <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: size, lineHeight: 1.2, color: SK.ink }}>{q}</div></div>
        : <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 120, color: SK.ink }}>?</div>}
    </div>
  );
}

// ---- Scene shell -----------------------------------------------------------------
// One beat: cross-fade, the right-panel content, the photo-area body, the caption.
function Scene({ lt, dur, panel, captions, showCaps = true, capSize = 34, children, fi = 0.5, fo = 0.5 }) {
  const op = fade(lt, dur, fi, fo);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: op }}>
      {children}
      {panel && <Panel lt={lt} {...panel} />}
      <Caption op={showCaps ? capOp(lt, captions) : 0} size={capSize}>{subText(lt, captions)}</Caption>
    </div>
  );
}

// ---- Frame ---------------------------------------------------------------------------
// Dark-green gradient + a slow collage of the video's own photos at low opacity,
// the cream panel on the right with the ThinkPro logo at its foot, the time probe.
// collage: [{ slot, x, y, w, h, ph }] — tiles drift gently (pure function of t).
function StoryFrame({ props = {}, dur, persistKey, collage = [], children }) {
  let RS = parseFloat(props.renderScale); if (!isFinite(RS) || RS <= 0) RS = 2;
  const showLogo = props.showLogo === false || props.showLogo === "false" ? false : true;
  const collageOp = num(props.collageOpacity, 0.07);
  const logoScale = num(props.logoScale, 1);
  return (
    <Stage width={1920 * RS} height={1080 * RS} duration={dur} background={SK.bg0} persistKey={persistKey}
      autoplay={window.TP_AUTOPLAY === false ? false : true}>   {/* hosted copies start on a tap so the browser allows sound */}
      <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, transform: `scale(${RS})`, transformOrigin: "top left", overflow: "hidden" }}>
        <Sprite start={0} end={dur}>
          {({ localTime: t }) => (
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(168deg, ${SK.bg0} 0%, ${SK.bg1} 100%)`, overflow: "hidden" }}>
              {collage.map((c, i) => {
                const src = photoSrc(c.slot); if (!src) return null;
                const dx = 26 * Math.sin(t * 0.045 + (c.ph || i)), dy = 18 * Math.cos(t * 0.035 + (c.ph || i) * 1.3);
                return <img key={i} src={src} alt="" style={{ position: "absolute", left: c.x, top: c.y, width: c.w, height: c.h, objectFit: "cover",
                  borderRadius: 24, opacity: collageOp, filter: "saturate(0.7)", transform: `translate(${dx}px, ${dy}px) scale(1.06)` }} />;
              })}
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 90% at 40% 50%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.35) 100%)" }} />
              <div style={{ position: "absolute", left: PANEL_X, top: 0, width: PANEL_W, height: 1080, background: SK.cream, borderLeft: `2px solid ${SK.creamEdge}`,
                boxShadow: "-14px 0 34px rgba(0,0,0,0.28)" }}>
                {showLogo && (
                  <div style={{ position: "absolute", left: 0, right: 0, bottom: 28, display: "flex", justifyContent: "center" }}>
                    <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", transform: `scale(${logoScale})`, transformOrigin: "bottom center",
                      boxShadow: `0 0 0 2px ${SK.creamEdge}` }}>
                      <img src={(window.TP_ASSETS || "assets/") + "thinkpro-logo.png"} alt="ThinkPro Academy" style={{ display: "block", width: 300, height: "auto" }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </Sprite>
        <TimeProbe />
        {children}
      </div>
    </Stage>
  );
}

window.TPStory = { SK, SERIF, SANS, LEFT_W, PANEL_X, PANEL_W, PAD, pop, out3, lerp, drive, photoSrc,
  Pic, Chip, Badge, Big, Card, Panel, Caption, SVG, Arrow, Ring, T, ChimeAt, TimeProbe, Scene, StoryFrame, StopCard, StopAt, Break, Flip };
