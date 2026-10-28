/* global React, window */
// ThinkPro Academy — "LP8 Lab – Crop Check, Calendar and Festivals" (Grade 6 Agriculture, Session 8 Lab).
// After AG_S8_Lab_Video_Script_Draft1 (24 Oct 2026): 10 narrated beats, no presenter stops.
// Lab photos (students + teacher) are review-page / Gemini uploads; every scene also carries a
// drawn diagram of the activity so the video teaches even before the photos land.
// STORY STYLE (engine/story-kit.jsx). Everything is a pure function of beat-local time.
const { Sprite, Easing } = window;
const { reveal, windowOp, fade } = window.TPMotion;
const { num, str } = window.TPStage;
const { SK, SERIF, SANS, LEFT_W, pop, out3, lerp, drive, photoSrc,
  Pic, Chip, Badge, Big, Card, SVG, Arrow, Ring, T, ChimeAt, Scene, StoryFrame, StopCard, StopAt, Break, Flip } = window.TPStory;

// ---- Timing: EVERYTHING is keyed to the narration (tools/fit_timing.py → timing.js).
const TM = window.TP_TIMING;
if (!TM) console.error("timing.js missing — run: python3 tools/fit_timing.py videos/lp8-crop-check-calendar-festivals");
const LEAD = TM ? TM.lead : 1.0;
const DUR = TM ? TM.total : 200;
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
const NB = 10;
const CAPS = {};
if (TM) for (let n = 1; n <= NB; n++) CAPS[n] = capsFor("b" + n);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// ---- Panel copy. Title defaults mirror the DC data-props (titleNText) — keep in sync. ----
const TITLES = { 1: "LP8 Lab – Crop Check, Calendar and Festivals", 2: "Team jobs and materials", 3: "Weather Watch", 4: "Crop check 1: broadcast pan",
  5: "Crop check 2: line-sown bags", 6: "Crop check table", 7: "Class crop calendar", 8: "Festival match", 9: "Why celebrate the harvest?", 10: "Clean-up and tool check" };
const KICK = "Grade 6 · Agriculture · Session 8 · Lab";
const panel = (n, ctx, lines, extra = {}) => ({ kicker: KICK, title: ctx.titles[n], lines, ...extra });
const L = (text, at, kind = "item", extra = {}) => ({ text, at, kind, ...extra });

// ---- Shared pieces ---------------------------------------------------------------
const GREEN = "#6FBF6E", BLUE = "#7FD3F7", RED = "#E05A4E", PAPER = "#EFE6CF";
function Arr({ x1, y1, x2, y2, lt, at, color = SK.gold, sw = 6 }) { return <Arrow x1={x1} y1={y1} x2={x2} y2={y2} color={color} sw={sw} op={out3(lt, at, 0.5)} />; }
// Lab photo with a drawn stand-in while the slot is empty (so the draft never shows a bare placeholder).
function LabPic({ slot, label, x, y, w, h, lt, at, fx = "zoom", children }) {
  return (
    <React.Fragment>
      <Pic slot={slot} label={label} x={x} y={y} w={w} h={h} lt={lt} at={at} fx={fx} />
      {children}
    </React.Fragment>
  );
}
// Checklist rows ticking in one by one.
function Checklist({ x, y, w, lt, rows, size = 28, tone = "gold" }) {
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w }}>
      {rows.map(([text, at], i) => { const o = pop(lt, at, 0.5); if (o <= 0) return null;
        return <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14, opacity: o, transform: `translateX(${(1 - o) * 20}px)` }}>
          <span style={{ flex: "none", width: 44, height: 44, borderRadius: 12, background: tone === "gold" ? SK.gold : SK.cream, color: SK.ink, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 700, fontSize: 28 }}>✓</span>
          <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: size, color: SK.white }}>{text}</span></div>; })}
    </div>
  );
}
// Seedling glyph (SVG): stem + two leaves, scaled.
const Seedling = ({ x, y, s = 1, col = GREEN }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} stroke={col} strokeWidth={5} strokeLinecap="round" fill={col}>
    <line x1={0} y1={0} x2={0} y2={-34} /><ellipse cx={-14} cy={-22} rx={14} ry={6} transform="rotate(-30 -14 -22)" /><ellipse cx={14} cy={-30} rx={14} ry={6} transform="rotate(30 14 -30)" />
  </g>
);
// Broadcast pan (top view) with scattered seedlings; ruler splits it; halves counted.
const PAN_PTS = [[-150, -40], [-90, 60], [-120, -110], [-40, -80], [-60, 20], [-20, 110], [20, -130], [60, -50], [40, 40], [100, 90], [130, -20], [90, -110], [-180, 40], [150, 60], [-10, -20], [70, 10]];
function PanRig({ lt, at, rulerAt, leftAt, rightAt, warnAt, x = 380, y = 500 }) {
  const o = out3(lt, at, 0.8); if (o <= 0) return null;
  const r = Easing.easeOutCubic(reveal(lt, rulerAt, 0.8)), nL = PAN_PTS.filter((p) => p[0] < 0).length, nR = PAN_PTS.length - nL;
  const cL = Math.round(nL * clamp((lt - leftAt) / 1.6, 0, 1)), cR = Math.round(nR * clamp((lt - rightAt) / 1.6, 0, 1));
  const warn = pop(lt, warnAt, 0.5);
  return (
    <SVG op={o}>
      <circle cx={x} cy={y} r={230} fill="#8A6A48" stroke="#C9CED6" strokeWidth={10} />
      <circle cx={x} cy={y} r={212} fill="#6E5236" />
      {PAN_PTS.map(([px, py], i) => <Seedling key={i} x={x + px} y={y + py + 18} s={0.75} col={(px < 0 ? cL > PAN_PTS.filter((q) => q[0] < 0).indexOf(PAN_PTS[i]) : cR > PAN_PTS.filter((q) => q[0] >= 0).indexOf(PAN_PTS[i])) && lt > leftAt ? SK.gold : GREEN} />)}
      <g opacity={r}><rect x={x - 4} y={y - 250 + (1 - r) * 60} width={8} height={500} fill="#D8EDF6" stroke="#8FB7C8" strokeWidth={2} />
        {[-200, -150, -100, -50, 0, 50, 100, 150, 200].map((k) => <line key={k} x1={x - 4} y1={y + k} x2={x + 4} y2={y + k} stroke="#4A6B7A" strokeWidth={2} />)}</g>
      <T x={x - 120} y={y - 262} size={26} bold op={reveal(lt, rulerAt + 0.5, 0.4)}>half A</T>
      <T x={x + 120} y={y - 262} size={26} bold op={reveal(lt, rulerAt + 0.5, 0.4)}>half B</T>
      <T x={x - 120} y={y + 290} size={44} bold color={SK.gold} op={reveal(lt, leftAt, 0.3)}>{cL}</T>
      <T x={x + 120} y={y + 290} size={44} bold color={SK.gold} op={reveal(lt, rightAt, 0.3)}>{cR}</T>
      <T x={x} y={y + 290} size={40} bold op={reveal(lt, rightAt + 1.6, 0.4)}>+</T>
      <T x={x} y={y + 345} size={30} bold color={SK.gold} op={reveal(lt, rightAt + 1.8, 0.5)}>{`= ${cL + cR} seedlings`}</T>
      <g opacity={warn} transform={`translate(${x} ${y - 330}) scale(${0.8 + 0.2 * warn})`}>
        <rect x={-260} y={-34} width={520} height={68} rx={16} fill={RED} />
        <text x={0} y={12} textAnchor="middle" fontFamily={SERIF} fontWeight="700" fontSize="32" fill="#fff">Never pull a seedling out!</text></g>
    </SVG>
  );
}
// Row of line-sown nursery bags; ruler upright against the tallest; height label.
function BagsRig({ lt, at, measureAt, x = 80, y = 700 }) {
  const o = out3(lt, at, 0.8); if (o <= 0) return null;
  const hs = [0.9, 1.3, 1.1, 1.6, 1.0], m = Easing.easeOutCubic(reveal(lt, measureAt, 0.8));
  return (
    <SVG op={o}>
     <g transform={`translate(${x} ${y}) scale(1.15) translate(${-x} ${-y})`}>
      {hs.map((h, i) => { const bx = x + i * 130; const grow = clamp((lt - at - 0.3 - i * 0.15) / 0.8, 0, 1);
        return <g key={i}>
          <path d={`M${bx} ${y} L${bx + 100} ${y} L${bx + 90} ${y - 120} L${bx + 10} ${y - 120} Z`} fill="#1E1E1E" stroke="#3A3A3A" strokeWidth={3} />
          <rect x={bx + 12} y={y - 122} width={76} height={10} fill="#6E5236" />
          <Seedling x={bx + 50} y={y - 120} s={h * grow} />
          <text x={bx + 50} y={y + 34} textAnchor="middle" fontFamily={SANS} fontWeight="700" fontSize="22" fill={SK.white} opacity={grow}>{i + 1}</text></g>; })}
      <g opacity={m}><rect x={x + 3 * 130 + 96 - 4 * (1 - m)} y={y - 120 - 190} width={14} height={190 + 6} fill="#D8EDF6" stroke="#8FB7C8" strokeWidth={2} />
        {[0, 1, 2, 3, 4, 5, 6].map((k) => <line key={k} x1={x + 3 * 130 + 96} y1={y - 114 - k * 30} x2={x + 3 * 130 + 110} y2={y - 114 - k * 30} stroke="#4A6B7A" strokeWidth={2} />)}
        <text x={x + 3 * 130 + 80} y={y - 215} textAnchor="end" fontFamily={SANS} fontWeight="700" fontSize="24" fill={SK.gold}>tallest: 6 cm</text>
        <text x={x + 3 * 130 + 80} y={y - 186} textAnchor="end" fontFamily={SANS} fontSize="20" fill={SK.dim}>soil → leaf tip</text></g>
     </g>
    </SVG>
  );
}
// Weather Watch table filling in.
function WeatherTable({ lt, x = 760, y = 560, at, tempAt, humAt, skyAt, writeAt }) {
  const o = out3(lt, at, 0.7); if (o <= 0) return null;
  const rows = [["Date", "today", at + 0.3], ["Temperature (°C)", "28 °C", tempAt], ["Humidity (%)", "64 %", humAt], ["Sky", "sunny / cloudy / rainy", skyAt]];
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 640, opacity: o, borderRadius: 18, overflow: "hidden", boxShadow: "0 0 0 2px rgba(255,255,255,0.3)" }}>
      <div style={{ background: SK.gold, color: SK.ink, fontFamily: SERIF, fontWeight: 700, fontSize: 28, padding: "10px 20px" }}>WEATHER WATCH</div>
      {rows.map(([k, v, t], i) => <div key={k} style={{ display: "flex", background: i % 2 ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.12)", padding: "10px 20px", fontFamily: SANS, fontSize: 26, color: SK.white }}>
        <span style={{ width: 300, fontWeight: 700 }}>{k}</span><span style={{ color: SK.gold, fontWeight: 700, opacity: pop(lt, t, 0.5) }}>{v}</span></div>)}
      <div style={{ padding: "10px 20px", fontFamily: SANS, fontSize: 22, color: SK.dim, opacity: out3(lt, writeAt, 0.5) }}>→ the recorder writes it in the Activity Book</div>
    </div>
  );
}
// Crop check table.
function CropTable({ lt, x = 60, y = 520, at, thinkAt }) {
  const o = out3(lt, at, 0.7); if (o <= 0) return null;
  const head = ["Team", "Seeds sown (bags)", "Seedlings up (bags)", "Seedlings up (pan)", "Tallest (cm)"];
  const rows = [["1", "5", "4", "11", "6"], ["2", "5", "5", "9", "5"], ["…", "", "", "", ""]];
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 1320, opacity: o, borderRadius: 18, overflow: "hidden", boxShadow: "0 0 0 2px rgba(255,255,255,0.3)" }}>
      <div style={{ display: "flex", background: SK.gold, color: SK.ink, fontFamily: SANS, fontWeight: 700, fontSize: 24 }}>{head.map((h) => <span key={h} style={{ flex: 1, padding: "10px 16px" }}>{h}</span>)}</div>
      {rows.map((r, i) => <div key={i} style={{ display: "flex", background: i % 2 ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.12)", fontFamily: SANS, fontSize: 26, color: SK.white, opacity: pop(lt, at + 0.4 + i * 0.3, 0.5) }}>
        {r.map((c, j) => <span key={j} style={{ flex: 1, padding: "8px 16px", fontWeight: j === 0 ? 700 : 400 }}>{c}</span>)}</div>)}
      <div style={{ padding: "12px 16px", fontFamily: SANS, fontStyle: "italic", fontSize: 26, color: SK.gold, opacity: out3(lt, thinkAt, 0.5) }}>THINK: Which came up better? Why?</div>
    </div>
  );
}
// Newspaper calendar grid with the four kinds of mark.
function CalendarRig({ lt, at, sowAt, waterAt, checkAt, harvestAt, x = 60, y = 470 }) {
  const o = out3(lt, at, 0.8); if (o <= 0) return null;
  const cell = 92, cols = 7, rows = 6;
  const day = (d) => [x + 40 + ((d - 1) % cols) * cell + cell / 2, y + 70 + Math.floor((d - 1) / cols) * cell + cell / 2];
  const marks = [];
  const [sx, sy] = day(1); marks.push(<circle key="sow" cx={sx} cy={sy} r={26} fill="none" stroke={GREEN} strokeWidth={6} opacity={pop(lt, sowAt, 0.5)} />);
  [3, 6, 10, 13, 17, 20, 24, 27, 31, 34, 38].forEach((d, i) => { const [cx, cy] = day(d); marks.push(<path key={"w" + i} d={`M${cx} ${cy - 16} C ${cx + 14} ${cy + 2}, ${cx + 10} ${cy + 16}, ${cx} ${cy + 16} C ${cx - 10} ${cy + 16}, ${cx - 14} ${cy + 2}, ${cx} ${cy - 16} Z`} fill={BLUE} opacity={pop(lt, waterAt + i * 0.08, 0.4)} />); });
  [7, 14, 21, 28].forEach((d, i) => { const [cx, cy] = day(d); marks.push(<path key={"c" + i} d={`M${cx - 16} ${cy} L${cx - 4} ${cy + 12} L${cx + 18} ${cy - 14}`} stroke={SK.ink} strokeWidth={6} fill="none" strokeLinecap="round" opacity={pop(lt, checkAt + i * 0.15, 0.4)} />); });
  const [hx, hy] = day(35); const star = Array.from({ length: 10 }, (_, k) => { const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? 12 : 28; return `${hx + rr * Math.cos(a)} ${hy + rr * Math.sin(a)}`; }).join(" L");
  marks.push(<path key="h" d={`M${star} Z`} fill={SK.gold} opacity={pop(lt, harvestAt, 0.6)} />);
  return (
    <SVG op={o}>
      <rect x={x} y={y} width={cols * cell + 80} height={rows * cell + 110} rx={6} fill={PAPER} transform={`rotate(-1.5 ${x} ${y})`} />
      <g transform={`rotate(-1.5 ${x} ${y})`}>
        <text x={x + 40} y={y + 46} fontFamily={SERIF} fontWeight="700" fontSize="30" fill={SK.ink}>CLASS CROP CALENDAR</text>
        {Array.from({ length: rows + 1 }, (_, r) => <line key={"r" + r} x1={x + 40} y1={y + 70 + r * cell} x2={x + 40 + cols * cell} y2={y + 70 + r * cell} stroke="#8A8068" strokeWidth={2} />)}
        {Array.from({ length: cols + 1 }, (_, c) => <line key={"c" + c} x1={x + 40 + c * cell} y1={y + 70} x2={x + 40 + c * cell} y2={y + 70 + rows * cell} stroke="#8A8068" strokeWidth={2} />)}
        {Array.from({ length: 42 }, (_, i) => { const [cx, cy] = day(i + 1); return <text key={i} x={cx - cell / 2 + 8} y={cy - cell / 2 + 24} fontFamily={SANS} fontSize="18" fill="#6B6252">{i + 1}</text>; })}
        {marks}
        <g opacity={pop(lt, harvestAt + 0.4, 0.5)}><text x={x + 40 + cols * cell + 20} y={y + 70 + 5 * cell - 10} fontFamily={SANS} fontWeight="700" fontSize="24" fill={SK.ink}>harvest</text>
          <text x={x + 40 + cols * cell + 20} y={y + 70 + 5 * cell + 18} fontFamily={SANS} fontSize="20" fill="#6B6252">30–40 days</text></g>
      </g>
    </SVG>
  );
}
const FESTIVALS = [["Pongal", "Tamil Nadu", "rice, sugarcane", "pongal"], ["Baisakhi", "Punjab", "wheat", "baisakhi"], ["Onam", "Kerala", "rice", "onam"], ["Bihu", "Assam", "rice", "bihu"],
  ["Nuakhai", "Odisha", "new rice", "nuakhai"], ["Lohri", "Punjab", "winter crops", "lohri"], ["Makar Sankranti", "many states", "harvest", "makar"]];
const FEST_COL = ["#D9A441", "#E07B39", "#7CC27A", "#8BB8FF", "#E6C35C", "#F0A24A", "#C58BB0"];

// ============================================================================
function B1(ctx) {
  const todo = ["Weather Watch", "Crop check", "Class crop calendar", "Festival match", "Clean-up"];
  return ({ localTime: lt, duration }) => {
    const cSow = W("b1", "sowed"), cToday = S("b1", 2);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[1]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(1, ctx, [L("Calendars and Harvest Festivals", 0.4, "sub"), L("TODAY", cToday, "head"), ...todo.map((t, i) => L(t, cToday + 0.2 + i * 0.2))])}>
        <Pic slot="lab_entry" label="1 Lab entry" x={40} y={60} w={1360} h={900} lt={lt} at={0} fx="zoom" zoom={1.15} kenDur={10} dim={0.25} out={cSow} />
        <Pic slot="sown_crop" label="Maize and spinach sown in Session 4" x={40} y={60} w={1360} h={900} lt={lt} at={cSow} fx="zoom" dim={0.2} />
        <Big x={40} y={300} w={1360} lt={lt} at={1.0} out={cSow} size={80} align="center">Session 8 · Lab</Big>
        <Big x={40} y={420} w={1360} lt={lt} at={1.4} out={cSow} size={54} align="center" color={SK.gold}>Calendars and Harvest Festivals</Big>
        <Chip text="sown four sessions ago" x={720} y={70} lt={lt} at={cSow + 0.3} tone="gold" size={28} />
        <Big x={40} y={780} w={1360} lt={lt} at={cToday} size={60} align="center">Has our crop come up?</Big>
        {todo.map((t, i) => <Chip key={t} text={t} x={190 + i * 265} y={690} lt={lt} at={cToday + 0.2 + i * 0.2} size={22} />)}
      </Scene>
    );
  };
}
function B2(ctx) {
  const roles = ["leader", "recorder", "tool keeper", "water monitor", "clean-up monitor"];
  const mats = [["Air thermometer & hygrometer", "CSL 71"], ["Ruler 30 cm", "CSL 211"], ["Used newspaper", "CSL 23"], ["Markers", "CSL 29"], ["Activity Book", ""]];
  return ({ localTime: lt, duration }) => {
    const ats = roles.map((r) => W("b2", r.split(" ")[0] === "clean-up" ? "cleanup" : r.split(" ")[0])), cTool = S("b2", 2);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[2]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(2, ctx, [L("TEAM JOBS: leader · recorder · tool keeper · water monitor · clean-up monitor", ats[0]), L("YOU NEED", cTool, "head"),
          ...mats.map(([m, c]) => L(m + (c ? ` (${c})` : ""), cTool + 0.2))], { max: 8 })}>
        <Pic slot="team_briefing" label="2 Team briefing" x={40} y={60} w={760} h={520} lt={lt} at={0} fx="zoom" />
        <Chip text="8 teams of 5" x={420} y={530} lt={lt} at={S("b2", 1)} tone="gold" size={26} />
        {roles.map((r, i) => <Chip key={r} text={r} x={840 + (i % 2) * 290} y={90 + Math.floor(i / 2) * 80} lt={lt} at={ats[i]} tone={i % 2 ? "cream" : "gold"} size={24} anchor="left" />)}
        <Chip text="TEAM JOBS" x={840} y={30} lt={lt} at={S("b2", 1) - 0.2} tone="green" size={20} anchor="left" />
        <Card x={840} y={380} w={560} h={200} lt={lt} at={cTool} pad={22}>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 20, letterSpacing: "0.14em", color: SK.gold, marginBottom: 8 }}>TOOL KEEPERS COLLECT</div>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 34, lineHeight: 1.25, color: SK.white }}>the ruler, the newspaper and the markers</div>
        </Card>
        <Checklist x={60} y={640} w={1320} lt={lt} rows={mats.map(([m, c], i) => [m + (c ? `  ·  ${c}` : ""), cTool + 0.3 + i * 0.25])} size={26} />
      </Scene>
    );
  };
}
function B3(ctx) {
  return ({ localTime: lt, duration }) => {
    const cRead = S("b3", 1), cTemp = W("b3", "temperature"), cHum = W("b3", "humidity"), cSky = W("b3", "sky"), cWrite = S("b3", 3);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[3]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(3, ctx, [L("WEATHER WATCH", S("b3", 0), "head"), L("Date", cRead), L("Temperature (°C) – thermo-hygrometer", cTemp), L("Humidity (%)", cHum), L("Sky: sunny / cloudy / rainy", cSky), L("Recorder writes it in the Activity Book", cWrite)])}>
        <Pic slot="weather_watch" label="3 Weather Watch" x={40} y={60} w={680} h={460} lt={lt} at={0} fx="zoom" />
        <SVG op={out3(lt, cRead, 0.6)}>
          <rect x={790} y={90} width={300} height={200} rx={18} fill="#2B2F36" stroke="#9AA3B0" strokeWidth={4} />
          <rect x={815} y={115} width={250} height={150} rx={8} fill="#BFE3C9" />
          <text x={835} y={170} fontFamily={SANS} fontWeight="700" fontSize="44" fill="#1B3A2A" opacity={pop(lt, cTemp, 0.4)}>28.0 °C</text>
          <text x={835} y={235} fontFamily={SANS} fontWeight="700" fontSize="44" fill="#1B3A2A" opacity={pop(lt, cHum, 0.4)}>64 %</text>
          <text x={940} y={320} textAnchor="middle" fontFamily={SANS} fontSize="22" fill={SK.dim}>thermo-hygrometer (CSL 71)</text>
        </SVG>
        {[["sunny", "☀"], ["cloudy", "☁"], ["rainy", "☂"]].map(([s, g], i) => <Chip key={s} text={`${g} ${s}`} x={1160 + 0 * i} y={100 + i * 72} lt={lt} at={cSky + 0.2 + i * 0.2} size={24} anchor="left" />)}
        <WeatherTable lt={lt} x={760} y={560} at={cRead - 0.3} tempAt={cTemp} humAt={cHum} skyAt={cSky} writeAt={cWrite} />
        <Chip text="We begin, as always, with the Weather Watch" x={380} y={530} lt={lt} at={S("b3", 0)} tone="gold" size={24} />
      </Scene>
    );
  };
}
function B4(ctx) {
  return ({ localTime: lt, duration }) => {
    const cGloves = S("b4", 1), cPan = S("b4", 2), cRuler = W("b4", "ruler"), cHalf = W("b4", "one"), cOther = W("b4", "other"), cWarn = S("b4", 6);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[4]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(4, ctx, [L("CROP CHECK 1: Broadcast pan", S("b4", 0), "head"), L("Gloves on (CSL 24)", cGloves), L("Seeds thrown by hand → seedlings scattered", cPan),
          L("Split the pan in two with the ruler · count each half · add", cRuler), L("Look, point, count", S("b4", 5)), L("Never pull a seedling out!", cWarn, "big")], { max: 7 })}>
        <Pic slot="pan_check" label="4 Broadcast pan check" x={760} y={60} w={640} h={430} lt={lt} at={0} fx="zoom" />
        <Chip text="THE CROP CHECK!" x={1080} y={20} lt={lt} at={S("b4", 0)} tone="gold" size={26} />
        <Chip text="Gloves on" x={1080} y={440} lt={lt} at={cGloves} tone="green" size={26} />
        <PanRig lt={lt} at={cPan} rulerAt={cRuler} leftAt={cHalf} rightAt={cOther} warnAt={cWarn} x={380} y={520} />
        <Checklist x={790} y={540} w={600} lt={lt} rows={[["Seeds thrown by hand → scattered", cPan], ["Ruler splits the pan in two", cRuler], ["Count half A, then half B, then add", cHalf], ["Look, point and count", S("b4", 5)]]} size={24} />
      </Scene>
    );
  };
}
function B5(ctx) {
  return ({ localTime: lt, duration }) => {
    const cRows = S("b5", 1), cMeasure = S("b5", 2);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[5]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(5, ctx, [L("CROP CHECK 2: Line-sown bags", S("b5", 0), "head"), L("Neat rows → easy to count", cRows), L("Tallest seedling: ruler from soil to leaf tip (cm)", cMeasure)])}>
        <Pic slot="line_bags" label="5 Line-sown bags" x={760} y={60} w={640} h={430} lt={lt} at={0} fx="zoom" />
        <Chip text="LINE-SOWN BAGS" x={1080} y={20} lt={lt} at={S("b5", 0)} tone="gold" size={26} />
        <BagsRig lt={lt} at={S("b5", 0)} measureAt={cMeasure} x={70} y={760} />
        <Chip text="neat rows → easy to count" x={380} y={400} lt={lt} at={cRows} size={26} />
        <Checklist x={790} y={540} w={600} lt={lt} rows={[["Count the seedlings bag by bag", cRows], ["Ruler upright against the tallest", cMeasure], ["Measure from the soil to the leaf tip", cMeasure + 1.2]]} size={24} />
      </Scene>
    );
  };
}
function B6(ctx) {
  return ({ localTime: lt, duration }) => {
    const cQ = S("b6", 1), cWhy = S("b6", 2);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[6]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(6, ctx, [L("CROP CHECK TABLE (LP8 S3)", S("b6", 0), "head"), L("Team · Seeds sown (bags) · Seedlings up (bags) · Seedlings up (pan) · Tallest (cm)", S("b6", 0) + 0.3),
          L("THINK: Which came up better? Why?", cQ, "think")])}>
        <Pic slot="recording" label="6 Recording" x={40} y={60} w={640} h={430} lt={lt} at={0} fx="zoom" />
        <Pic slot="pots_ab" label="Broadcast pan" x={720} y={60} w={330} h={430} lt={lt} at={cQ} fx="pop" />
        <Chip text="scattered pan" x={885} y={440} lt={lt} at={cQ + 0.2} size={22} />
        <Pic slot="bags_sowing" label="Line-sown bags" x={1070} y={60} w={330} h={430} lt={lt} at={cQ + 0.3} fx="pop" />
        <Chip text="neat bags" x={1235} y={440} lt={lt} at={cQ + 0.5} size={22} />
        <CropTable lt={lt} x={60} y={520} at={S("b6", 0)} thinkAt={cQ} />
        <Ring cx={1330} cy={900} r={40} from={SE("b6", 2) + 0.1} to={SE("b6", 2) + 2.0} lt={lt} n={2} />
      </Scene>
    );
  };
}
function B7(ctx) {
  return ({ localTime: lt, duration }) => {
    const cDraw = S("b7", 1), cSow = W("b7", "sowing"), cWater = W("b7", "watering"), cCheck = W("b7", "weekly"), cHarvest = W("b7", "harvest");
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[7]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(7, ctx, [L("CLASS CROP CALENDAR", S("b7", 0), "head"), L("Sowing – Session 4 (green circle)", cSow), L("Watering – every lab day (blue drops)", cWater),
          L("Weekly check – count and measure (ticks)", cCheck), L("Harvest – 30–40 days after sowing (gold star)", cHarvest)])}>
        <Pic slot="calendar" label="7 Crop calendar" x={760} y={60} w={640} h={400} lt={lt} at={0} fx="zoom" />
        <Chip text="Plan like real farmers!" x={1080} y={20} lt={lt} at={S("b7", 0)} tone="gold" size={26} />
        <CalendarRig lt={lt} at={cDraw} sowAt={cSow} waterAt={cWater} checkAt={cCheck} harvestAt={cHarvest} x={60} y={380} />
        <Checklist x={790} y={520} w={600} lt={lt} rows={[["Newspaper + ruler → calendar grid", cDraw], ["Green circle: sowing day", cSow], ["Blue drops: watering days", cWater], ["Ticks: weekly checks", cCheck], ["Gold star: harvest, 30–40 days", cHarvest]]} size={24} />
      </Scene>
    );
  };
}
function B8(ctx) {
  return ({ localTime: lt, duration }) => {
    const ats = FESTIVALS.map(([n, st, cr, w]) => W("b8", w));
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[8]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(8, ctx, [L("FESTIVAL MATCH", S("b8", 0), "head"), ...FESTIVALS.map(([n, st, cr], i) => L(`${n} – ${st} – ${cr}`, ats[i]))], { max: 9 })}>
        <Pic slot="festival_match" label="8 Festival match" x={40} y={60} w={640} h={400} lt={lt} at={0} fx="zoom" />
        <Chip text="Celebrate like Indian farmers!" x={360} y={410} lt={lt} at={S("b8", 0)} tone="gold" size={26} />
        <Chip text="Match each festival card to its state and its crop" x={360} y={480} lt={lt} at={S("b8", 1)} size={22} />
        {FESTIVALS.map(([n, st, cr, w], i) => { const o = pop(lt, ats[i], 0.6); if (o <= 0) return null;
          const col = i < 4 ? i : i - 4, row = i < 4 ? 0 : 1, x = row === 0 ? 720 + col * 170 : 40 + col * 340, y = row === 0 ? 60 + 0 : 560, wdt = row === 0 ? 160 : 320;
          return <div key={n} style={{ position: "absolute", left: x, top: y + (row === 0 ? 0 : 0), width: wdt, height: row === 0 ? 400 : 380, borderRadius: 18, background: FEST_COL[i], opacity: o, transform: `scale(${0.85 + 0.15 * o})`,
            boxShadow: "0 8px 24px rgba(0,0,0,0.3)", padding: 16, boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
            <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: row === 0 ? 26 : 34, color: SK.ink, lineHeight: 1.1 }}>{n}</div>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 20, color: SK.ink, marginTop: 8, background: "rgba(255,255,255,0.55)", borderRadius: 8, padding: "4px 8px" }}>{st}</div>
            <div style={{ fontFamily: SANS, fontSize: 20, color: SK.ink, marginTop: 6, background: "rgba(255,255,255,0.35)", borderRadius: 8, padding: "4px 8px" }}>{cr}</div></div>; })}
      </Scene>
    );
  };
}
function B9(ctx) {
  const whys = [["why_nature", "Thank nature", "thank"], ["why_work", "Celebrate months of hard work", "celebrate"], ["why_share", "Share food with family and friends", "share"]];
  return ({ localTime: lt, duration }) => (
    <Scene lt={lt} dur={duration} captions={CAPS[9]} showCaps={ctx.caps} capSize={ctx.capSize}
      panel={panel(9, ctx, [L("WHY CELEBRATE THE HARVEST?", S("b9", 0), "head"), ...whys.map(([s, lab, w]) => L(lab, W("b9", w)))])}>
      <Big x={40} y={60} w={1360} lt={lt} at={S("b9", 0)} size={54} align="center">Why do farmers celebrate the harvest?</Big>
      {whys.map(([s, lab, w], i) => <React.Fragment key={s}>
        <Pic slot={s} label={lab} x={40 + i * 460} y={200} w={440} h={420} lt={lt} at={W("b9", w)} fx="zoom" />
        <Chip text={lab} x={260 + i * 460} y={640} lt={lt} at={W("b9", w) + 0.2} tone={i === 1 ? "gold" : "cream"} size={24} />
      </React.Fragment>)}
    </Scene>
  );
}
function B10(ctx) {
  return ({ localTime: lt, duration }) => {
    const rows = [["Cap and count the markers", W("b10", "cap")], ["Wipe the ruler", W("b10", "wipe")], ["Put everything back in its place", W("b10", "put")], ["Pin the calendar on the wall", W("b10", "pin")],
      ["Gloves off", W("b10", "gloves")], ["Wash hands", W("b10", "washed")], ["Line up", W("b10", "line")]];
    const cEnd = S("b10", 4);
    return (
      <Scene lt={lt} dur={duration} captions={CAPS[10]} showCaps={ctx.caps} capSize={ctx.capSize}
        panel={panel(10, ctx, [L("CLEAN-UP AND TOOL CHECK", S("b10", 0), "head"), ...rows.map(([t, at]) => L(t, at)), L("Our crop is growing, and so are we!", cEnd, "big")], { max: 9 })}>
        <Pic slot="cleanup" label="10 Clean-up" x={40} y={60} w={700} h={480} lt={lt} at={0} fx="zoom" />
        <Chip text="CLEAN-UP AND TOOL CHECK" x={390} y={20} lt={lt} at={S("b10", 0)} tone="gold" size={24} />
        <Checklist x={790} y={80} w={600} lt={lt} rows={rows} size={26} />
        <Card x={40} y={600} w={1360} h={260} lt={lt} at={cEnd} pad={34}>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 22, letterSpacing: "0.14em", color: SK.gold, marginBottom: 12 }}>SESSION 8 · DONE</div>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 56, lineHeight: 1.2, color: SK.white }}>Our crop is growing, and so are we!</div>
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
const COLLAGE = [{ slot: "sown_crop", x: -60, y: -40, w: 760, h: 520, ph: 0 }, { slot: "why_nature", x: 640, y: -80, w: 760, h: 520, ph: 2 },
  { slot: "bags_sowing", x: -80, y: 520, w: 700, h: 560, ph: 4 }, { slot: "why_work", x: 560, y: 560, w: 820, h: 560, ph: 1 }];
function LabScenes(props = {}) {
  const caps = props.showCaptions === "false" ? false : props.showCaptions !== false;
  const titles = {};
  for (let n = 1; n <= NB; n++) titles[n] = str(props["title" + n + "Text"], TITLES[n]);
  const ctx = { caps, titles, capSize: num(props.captionSize, 34) };
  const B = [B1, B2, B3, B4, B5, B6, B7, B8, B9, B10];
  const beats = B.map((Bn, i) => { const t = BEAT("b" + (i + 1)); return [t.start, t.start + t.dur, Bn]; });
  return (
    <StoryFrame props={props} dur={DUR} persistKey="thinkpro-lp8-lab" collage={COLLAGE}>
      {beats.map(([s, e, Bn], i) => (
        <Sprite key={i} start={s} end={e}>{Bn(ctx)}</Sprite>
      ))}
      <AudioSync />
    </StoryFrame>
  );
}
window.LabScenes = LabScenes;
