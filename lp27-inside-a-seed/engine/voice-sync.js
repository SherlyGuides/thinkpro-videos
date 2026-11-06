/* global window */
// ThinkPro Academy — voice-sync pipeline (window.TPVoice).
// The voice timeline is PRIMARY; the animation warps to it. Every number here
// is discovered by measurement, never assumed. Promoted from the Scissor Lift
// (G6/S12) production; the numbered sections match the pipeline doc in
// guidelines/voice-sync.card.html.
//
// Load order: animations-v2.jsx → motion.js → voice-sync.js → stage-kit.jsx →
// apparatus.jsx → <topic>-scenes.jsx
(function () {
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // ---- §6 Calibration ------------------------------------------------------
  // Calibrate ONCE per voice + speed, then treat as fixed. Line-by-line
  // paragraphs read faster than continuous prose — measure the form you ship.
  const RATE = {
    secPerWord: 0.34,     // paragraph/line form (measured)
    secPerWordProse: 0.38,// continuous prose form
    paraPause: 0.55,      // implicit pause between blank-line-separated paragraphs
    breakUnit: 3.0,       // <break time="Xs" /> above ~3s is unreliable — stack 3.0s tags
    lead: 0.55,           // visual arrives this far BEFORE its measured word onset
    leadMin: 0.4, leadMax: 0.8,
    capFloor: 1.6,        // minimum on-screen time for one caption row
    deadAirMax: 5.0,      // §1 hard cap on narration-free stretches
    tailPad: 1.5,         // §8 video length ≥ audio + this
  };
  function calibrate(o) { Object.assign(RATE, o || {}); return RATE; }
  const words = (s) => String(s || "").trim().split(/\s+/).filter(Boolean).length;
  const spokenDur = (s, rate) => words(s) * (rate || RATE.secPerWord);

  // ---- §1 Time warp --------------------------------------------------------
  // MD_WARP[scene] = [[playbackTime, authoredTime], …] ascending.
  // Authoring stays in comfortable authored time; playback compresses the
  // silent stretches so every cue lands on its measured voice onset.
  // buildWarp CLAMPS to monotonic (playback jumps backwards otherwise) and
  // enforces the dead-air cap by compressing any over-long playback stretch.
  function buildWarp(anchors, opts) {
    const o = Object.assign({ deadAirMax: RATE.deadAirMax, speech: null }, opts || {});
    const rows = (anchors || []).map((a) => [Number(a[0]), Number(a[1])])
      .filter((a) => isFinite(a[0]) && isFinite(a[1]))
      .sort((a, b) => a[0] - b[0]);
    const out = [];
    for (const r of rows) {
      const prev = out[out.length - 1];
      if (!prev) { out.push(r); continue; }
      // monotonic in BOTH axes
      const p = Math.max(r[0], prev[0] + 1e-3);
      const a = Math.max(r[1], prev[1] + 1e-3);
      out.push([p, a]);
    }
    // Dead-air cap: a playback gap with no narration inside it may not exceed
    // deadAirMax — pull every later anchor back by the excess.
    if (o.speech && o.speech.length) {
      for (let i = 1; i < out.length; i++) {
        const s = out[i - 1][0], e = out[i][0];
        const voiced = o.speech.some((seg) => seg[1] > s + 0.01 && seg[0] < e - 0.01);
        const excess = voiced ? 0 : (e - s) - o.deadAirMax;
        if (excess > 0) for (let j = i; j < out.length; j++) out[j][0] -= excess;
      }
    }
    return out;
  }
  // Piecewise-linear playback → authored. Extrapolates on the last slope.
  function warpTime(table, t) {
    if (!table || table.length < 2) return t;
    if (t <= table[0][0]) return table[0][1] + (t - table[0][0]);
    for (let i = 1; i < table.length; i++) {
      const [p0, a0] = table[i - 1], [p1, a1] = table[i];
      if (t <= p1) return a0 + (a1 - a0) * ((t - p0) / (p1 - p0 || 1));
    }
    const n = table.length;
    const [p0, a0] = table[n - 2], [p1, a1] = table[n - 1];
    return a1 + (t - p1) * ((a1 - a0) / (p1 - p0 || 1));
  }
  // Longest narration-free playback stretch inside [0, dur] (§1 assertion).
  function deadAir(speech, dur) {
    const segs = (speech || []).slice().sort((a, b) => a[0] - b[0]);
    let worst = 0, cursor = 0;
    for (const s of segs) { worst = Math.max(worst, s[0] - cursor); cursor = Math.max(cursor, s[1]); }
    return Math.max(worst, (dur || cursor) - cursor);
  }

  // ---- §2 Caption rows -----------------------------------------------------
  // ONE row list carrying an explicit `cont` flag. A continuation row (the 2nd
  // half of a sentence split across two screen lines) consumes NO voice onset;
  // its time derives from its predecessor's start + that predecessor's spoken
  // word-duration. Skipping continuations when counting onsets but not when
  // indexing is what mis-paired every caption after the first split sentence.
  //   rows in : [{ text, cont }] or ["text", ["text", true]]
  //   onsets  : measured paragraph start times (non-continuation rows only)
  function capRows(input) {
    return (input || []).map((r) => {
      if (typeof r === "string") return { text: r, cont: false };
      if (Array.isArray(r)) return { text: r[0], cont: !!r[1] };
      return { text: r.text, cont: !!r.cont };
    });
  }
  // §2b Anchor BOTH ends. The end anchor pins on-screen duration to the time
  // the line actually takes to speak (word count × calibrated rate, floor
  // capFloor) — anchoring starts only makes the last caption flash.
  function fitCaptions(rows, onsets, opts) {
    const o = Object.assign({ rate: RATE.secPerWord, lead: RATE.lead, floor: RATE.capFloor, t0: 0 }, opts || {});
    const R = capRows(rows), out = [];
    let k = 0, prevStart = 0, prevDur = 0;
    for (const r of R) {
      let start;
      if (r.cont) start = prevStart + prevDur;              // no onset consumed
      else { start = (onsets[k] != null ? onsets[k] : prevStart + prevDur) - o.lead; k++; }
      start = Math.max(o.t0, start);
      const dur = Math.max(o.floor, spokenDur(r.text, o.rate));
      out.push([start, start + dur, r.text]);
      prevStart = start; prevDur = dur;
    }
    // Never let a row outlive its successor's start (keeps the pair joined,
    // not overlapped — capOp cuts straight over a join).
    for (let i = 0; i < out.length - 1; i++) out[i][1] = Math.min(out[i][1], out[i + 1][0]);
    return out;
  }

  // ---- §6 Script generation ------------------------------------------------
  // Every paragraph ends a COMPLETE sentence — never break a sentence across
  // paragraphs (the implicit pause lands mid-sentence and the read breaks).
  // Split captions are joined onto one line here. No trailing break tag.
  function breakTags(seconds) {
    const n = Math.max(0, Math.round((seconds || 0) / RATE.breakUnit));
    return Array(n).fill('<break time="' + RATE.breakUnit.toFixed(1) + 's" />').join(" ");
  }
  // paragraphs: [{ text, pauseAfter }] — pauseAfter is EXTRA silence beyond the
  // implicit paragraph pause. Returns { text, predicted, issues }.
  function emitScript(paragraphs, opts) {
    const o = Object.assign({ rate: RATE.secPerWord }, opts || {});
    const P = (paragraphs || []).map((p) => (typeof p === "string" ? { text: p } : p));
    const issues = [], parts = [];
    let predicted = 0;
    P.forEach((p, i) => {
      const t = String(p.text || "").trim();
      if (!/[.!?"'”’)]$/.test(t)) issues.push("paragraph " + (i + 1) + " does not end a complete sentence");
      const extra = i < P.length - 1 ? (p.pauseAfter || 0) : 0;   // no trailing break
      parts.push(extra > 0 ? t + " " + breakTags(extra) : t);
      predicted += spokenDur(t, o.rate) + extra + (i < P.length - 1 ? RATE.paraPause : 0);
    });
    return { text: parts.join("\n\n"), predicted, issues };
  }

  // ---- §7 Measure the audio ------------------------------------------------
  // Decode the mp3, 20ms RMS envelope, threshold 3.5% of peak, drop < 200ms,
  // merge gaps < 350ms. Never trust the script's prediction.
  const ONSET = { frame: 0.02, threshold: 0.035, minSeg: 0.2, mergeGap: 0.35 };
  function detectOnsets(samples, sampleRate, opts) {
    const o = Object.assign({}, ONSET, opts || {});
    const n = Math.max(1, Math.round(o.frame * sampleRate));
    const env = [];
    for (let i = 0; i < samples.length; i += n) {
      let s = 0, c = 0;
      for (let j = i; j < i + n && j < samples.length; j++) { s += samples[j] * samples[j]; c++; }
      env.push(Math.sqrt(s / (c || 1)));
    }
    const peak = env.reduce((a, b) => Math.max(a, b), 0) || 1;
    const th = peak * o.threshold;
    const segs = [];
    let start = -1;
    env.forEach((v, i) => {
      const t = i * o.frame;
      if (v >= th && start < 0) start = t;
      else if (v < th && start >= 0) { segs.push([start, t]); start = -1; }
    });
    if (start >= 0) segs.push([start, env.length * o.frame]);
    const merged = [];
    for (const s of segs) {
      const last = merged[merged.length - 1];
      if (last && s[0] - last[1] < o.mergeGap) last[1] = s[1];
      else merged.push(s.slice());
    }
    return merged.filter((s) => s[1] - s[0] >= o.minSeg);
  }
  // Segment count EXCEEDS paragraph count (long paragraphs split at internal
  // commas). Recover paragraph starts from the (paragraphs − 1) LARGEST leading
  // gaps, then VERIFY separation — the smallest kept gap must be clearly larger
  // than the largest dropped one (production: ≥0.9s kept vs ≤0.62s dropped).
  // If they overlap the alignment is untrustworthy: stop and report.
  function paragraphStarts(segments, paraCount, opts) {
    const o = Object.assign({ minSeparation: 0.25 }, opts || {});
    const segs = (segments || []).slice().sort((a, b) => a[0] - b[0]);
    if (!segs.length) return { ok: false, reason: "no speech detected", starts: [] };
    const gaps = segs.slice(1).map((s, i) => ({ i: i + 1, gap: s[0] - segs[i][1] }));
    const ranked = gaps.slice().sort((a, b) => b.gap - a.gap);
    const keep = ranked.slice(0, Math.max(0, paraCount - 1));
    const drop = ranked.slice(Math.max(0, paraCount - 1));
    const minKept = keep.length ? Math.min(...keep.map((g) => g.gap)) : Infinity;
    const maxDropped = drop.length ? Math.max(...drop.map((g) => g.gap)) : 0;
    const idx = keep.map((g) => g.i).sort((a, b) => a - b);
    const starts = [segs[0][0]].concat(idx.map((i) => segs[i][0]));
    const ok = starts.length === paraCount && minKept - maxDropped >= o.minSeparation;
    return { ok, starts, minKept, maxDropped, segments: segs.length,
      reason: ok ? null : "gap separation too weak (kept " + minKept.toFixed(2) + "s vs dropped " + maxDropped.toFixed(2) + "s) — alignment untrustworthy, do not ship a guess" };
  }
  // Anchor EACH cue individually to its measured onset (a single least-squares
  // slope per scene left visible drift where the voice locally rushed), with a
  // consistent small lead so the visual arrives just before the word.
  function anchorCues(authoredCues, onsets, lead) {
    const L = lead == null ? RATE.lead : lead;
    return authoredCues.map((a, i) => [Math.max(0, (onsets[i] != null ? onsets[i] : a) - L), a]);
  }

  // ---- Acceptance test -----------------------------------------------------
  // Run before ANY video ships. Returns [] when clean, else a list of failures.
  //   spec: { speech, captions, warp, videoLen, audioLen, cues, onsets, capMaxChars }
  function assertPipeline(spec) {
    const f = [], s = spec || {};
    if (s.speech && s.videoLen != null) {
      const d = deadAir(s.speech, s.videoLen);
      if (d > RATE.deadAirMax + 0.01) f.push("dead air " + d.toFixed(2) + "s > " + RATE.deadAirMax + "s (§1)");
    }
    (s.captions || []).forEach((c, i) => {
      const need = Math.max(RATE.capFloor, spokenDur(c[2]));
      if (c[1] - c[0] + 0.01 < need) f.push('caption ' + (i + 1) + ' on screen ' + (c[1] - c[0]).toFixed(2) + 's < spoken ' + need.toFixed(2) + 's (§2b): "' + c[2] + '"');
      if (s.capMaxChars && String(c[2]).length > s.capMaxChars) f.push("caption " + (i + 1) + " would wrap to two lines (§4): " + c[2]);
      const nx = (s.captions || [])[i + 1];
      if (nx && nx[0] - c[1] > 0.001 && nx[0] - c[1] < 0.5 && c[3] === "join") f.push("gap between the halves of a split sentence at caption " + (i + 1) + " (§3)");
    });
    if (s.warp) for (let i = 1; i < s.warp.length; i++) {
      if (s.warp[i][0] <= s.warp[i - 1][0] || s.warp[i][1] <= s.warp[i - 1][1]) f.push("warp table not monotonic at anchor " + i + " (§1)");
    }
    if (s.videoLen != null && s.audioLen != null && s.videoLen < s.audioLen + RATE.tailPad - 0.01)
      f.push("video " + s.videoLen.toFixed(2) + "s < audio + " + RATE.tailPad + "s (§8)");
    (s.cues || []).forEach((c, i) => {
      const on = (s.onsets || [])[i];
      if (on == null) return;
      const lead = on - c;
      if (lead < RATE.leadMin - 0.01 || lead > RATE.leadMax + 0.01) f.push("cue " + (i + 1) + " leads its onset by " + lead.toFixed(2) + "s (want " + RATE.leadMin + "–" + RATE.leadMax + "s, §7)");
    });
    return f;
  }

  // §8 ffmpeg mux — `-shortest` ALONE truncates the video to the audio and has
  // cut off closing statements on three separate exports. Always pad the audio.
  function muxCommand(video, audio, out, music) {
    return music
      ? 'ffmpeg -i "' + video + '" -i "' + audio + '" -i "' + music + '" -filter_complex "[1:a]apad[v];[2:a]volume=0.12[m];[v][m]amix=inputs=2:normalize=0[a]" -map 0:v -map "[a]" -c:v copy -shortest "' + out + '"'
      : 'ffmpeg -i "' + video + '" -i "' + audio + '" -af apad -shortest -c:v copy "' + out + '"';
  }

  window.TPVoice = { RATE, ONSET, calibrate, words, spokenDur, buildWarp, warpTime, deadAir,
    capRows, fitCaptions, breakTags, emitScript, detectOnsets, paragraphStarts, anchorCues,
    assertPipeline, muxCommand, clamp };
})();
