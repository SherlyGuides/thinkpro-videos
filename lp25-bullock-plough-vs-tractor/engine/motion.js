/* global React, window */
// ThinkPro Academy — canonical motion + label-registry idioms for explainer videos.
// Everything is a pure function of time: deterministic for scrub + .mp4 export.
(function () {
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  // 0→1 ramp starting at `at`
  const reveal = (lt, at, dur = 0.5) => clamp((lt - at) / dur, 0, 1);
  // 0→1→0 across a beat's full duration
  const fade = (lt, dur, fi = 0.6, fo = 0.6) => clamp(Math.min(lt / fi, (dur - lt) / fo), 0, 1);
  // 0→1→0 gated to [s,e] with f-sec ramps
  const windowOp = (lt, s, e, f = 0.5) => clamp(Math.min((lt - s) / f, (e - lt) / f), 0, 1);
  // sin idle-life ("idle rock")
  const rock = (lt, amp, speed = 1.1) => Math.sin(lt * speed) * amp;

  // Timing spec → opacity. spec: { at, dur, back } (reveal, easeOutBack pop
  // unless back === false) | { win: [s, e, f] } (window).
  function labelOp(lt, spec, Easing) {
    if (!spec) return 1;
    if (spec.win) return windowOp(lt, spec.win[0], spec.win[1], spec.win[2] == null ? 0.5 : spec.win[2]);
    const r = reveal(lt, spec.at || 0, spec.dur || 0.5);
    return spec.back === false || !Easing ? r : Easing.easeOutBack(r);
  }

  // LABEL_LIST row: [id, scene, text, x, y, variant, tone, timing]
  // Auto tweak forwarding: per-label Text override + X/Y OFFSETS + Scale.
  // Call from renderVals(): Object.assign(v, TPMotion.labelTweaks(LABEL_LIST, p))
  function labelTweaks(list, props, out = {}) {
    for (const row of list) {
      const id = row[0];
      out[id + "Text"] = props[id + "Text"] != null ? props[id + "Text"] : row[2];
      out[id + "X"] = props[id + "X"] != null ? props[id + "X"] : 0;
      out[id + "Y"] = props[id + "Y"] != null ? props[id + "Y"] : 0;
      out[id + "Scale"] = props[id + "Scale"] != null ? props[id + "Scale"] : 1;
    }
    return out;
  }

  // Render every label of one scene. `Label` is the DS atom
  // (components/labels/Label.jsx or a scene-local equivalent).
  // Tweaked X/Y are offsets added to the authored stage-absolute position.
  function renderSceneLabels(list, scene, lt, props, Label, Easing) {
    const out = [];
    for (const row of list) {
      const id = row[0], sc = row[1];
      if (sc !== scene) continue;
      out.push(React.createElement(Label, {
        key: id,
        text: props[id + "Text"] != null ? props[id + "Text"] : row[2],
        x: row[3] + (parseFloat(props[id + "X"]) || 0),
        y: row[4] + (parseFloat(props[id + "Y"]) || 0),
        scale: props[id + "Scale"] != null ? parseFloat(props[id + "Scale"]) || 1 : 1,
        variant: row[5], tone: row[6],
        op: labelOp(lt, row[7], Easing),
      }));
    }
    return out;
  }

  // Global heading-pill offset — shifts EVERY pill at once; per-beat pillT
  // nudges ride on top. Mutate via TPMotion.HDG or drive from a tweak.
  const HDG = { x: 0, y: 0 };

  // Shell — the standard one-beat scaffold: beat cross-dissolve, the offset
  // HeadingPill (constant entrance reveal(lt, 2.0, 0.6); NEVER scaled), the
  // scene body, and an optional caption. Pass the DS atoms in as props.
  function Shell({ lt, dur, pill, pillT, children, caption, showCaps = true, HeadingPill, Caption, Easing }) {
    const pt = pillT || { x: 0, y: 0 };
    const pillOp = Easing ? Easing.easeOutCubic(reveal(lt, 2.0, 0.6)) : reveal(lt, 2.0, 0.6);
    return React.createElement("div", { style: { position: "absolute", inset: 0, opacity: fade(lt, dur) } },
      pill && HeadingPill ? React.createElement("div", { style: { position: "absolute", top: 56, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: pillOp } },
        React.createElement("div", { style: { transform: "translate(" + (pt.x + HDG.x) + "px, " + (pt.y + HDG.y) + "px)" } },
          React.createElement(HeadingPill, null, pill))) : null,
      children,
      showCaps && caption && Caption ? React.createElement("div", { style: { position: "absolute", left: 0, right: 0, bottom: 140, display: "flex", justifyContent: "center" } },
        React.createElement(Caption, null, caption)) : null);
  }

  // Generate the DC data-props JSON entries for a LABEL_LIST — run once at
  // authoring time (console) and paste the result into data-props, so per-
  // label tweak panels cost zero hand-written wiring.
  // sections: optional { <sceneNum>: "Panel section label" } map.
  function labelPropsJson(list, sections = {}) {
    const o = {};
    for (const row of list) {
      const id = row[0], sec = sections[row[1]] || ("Scene " + row[1]);
      o[id + "Text"] = { editor: "text", default: row[2], tsType: "string", section: sec };
      for (const ax of ["X", "Y"]) o[id + ax] = { editor: "range", default: 0, min: -400, max: 400, step: 5, unit: "px", tsType: "number", section: sec };
      o[id + "Scale"] = { editor: "range", default: 1, min: 0.5, max: 2, step: 0.05, tsType: "number", section: sec };
    }
    return o;
  }

  window.TPMotion = { reveal, fade, windowOp, rock, labelOp, labelTweaks, renderSceneLabels, labelPropsJson, HDG, Shell };
})();
