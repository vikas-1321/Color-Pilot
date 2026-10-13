(() => {
  'use strict';
  const CP = (window.__CP = window.__CP || {});

  const MERGE = 0.028;
  const METRICS = ['bg', 'text', 'border', 'fill', 'rule', 'btn', 'link', 'head', 'region', 'total'];

  function newCluster(s) {
    const lch = CP.toLch(s);
    return {
      orig: s.hex,
      cur: s.hex,
      rep: { r: s.r, g: s.g, b: s.b },
      lch,
      members: [s.hex],
      sats: [],
      role: 'Other',
      why: [],
      vars: [],
      hints: {},
      w: Object.fromEntries(METRICS.map((k) => [k, s[k]])),
    };
  }

  function buildClusters(stats) {
    const arr = [...stats.values()].sort((a, b) => b.total - a.total);
    const cl = [];
    for (const s of arr) {
      const lab = { L: s.L, a: s.a, b: s.bb };
      let best = null, bd = Infinity;
      for (const c of cl) {
        const d = CP.labDist(c.lch, lab);
        if (d < bd) { bd = d; best = c; }
      }
      if (best && bd <= MERGE) {
        best.members.push(s.hex);
        METRICS.forEach((k) => { best.w[k] += s[k]; });
      } else {
        cl.push(newCluster(s));
      }
    }
    cl.sort((a, b) => b.w.total - a.w.total);
    CP.state.allClusters = cl.slice();

    const masters = [];
    for (const c of cl) {
      let parent = null;
      if (CP.isChroma(c)) {
        parent = masters.find((m) => CP.isChroma(m) && CP.hueDiff(m.lch.h, c.lch.h) <= 20 && c.lch.C / m.lch.C > 0.4 && c.lch.C / m.lch.C < 2.5);
      }
      if (parent) parent.sats.push(c);
      else masters.push(c);
    }
    masters.forEach((m) => {
      m.agg = Object.fromEntries(METRICS.map((k) => [k, m.w[k] + m.sats.reduce((s, x) => s + x.w[k], 0)]));
      m.agg.mass = m.agg.bg + m.agg.text * 0.6 + m.agg.fill + m.agg.border * 0.3;
      m.agg.textish = m.agg.text + m.agg.head * 2;
      CP.ROLES.forEach((r) => { m.hints[r] = 0; });
    });
    return masters;
  }

  const nearestMaster = (c, maxD) => {
    const lab = CP.toLch(c);
    let best = null, bd = Infinity;
    for (const m of CP.state.masters) {
      for (const x of [m, ...m.sats]) {
        const d = CP.labDist(x.lch, lab);
        if (d < bd) { bd = d; best = m; }
      }
    }
    return best && bd <= maxD ? best : null;
  };

  /* ---- evidence 1: CSS custom property names ---- */
  function varRaw(name) {
    const read = (el) => {
      try { return getComputedStyle(el).getPropertyValue(name).trim(); } catch (e) { return ''; }
    };
    return read(document.documentElement) || (document.body ? read(document.body) : '');
  }

  function varColor(name) {
    let v = varRaw(name);
    if (!v) return null;
    const c = CP.parseColor(v);
    if (c) return c;
    const t = CP.tripletOf(name, v);
    return t ? t.rgb : null;
  }

  function collectHints() {
    const names = new Set([...CP.state.varNames, ...CP.state.varUse.keys()]);
    for (const name of names) {
      const col = varColor(name);
      if (!col || col.a === 0) continue;
      const m = nearestMaster(col, 0.045);
      if (!m) continue;
      const uses = CP.state.varUse.get(name) || 0;
      const raw = varRaw(name);
      m.vars.push({ name, uses, raw, triplet: CP.tripletOf(name, raw) });
      const rr = CP.roleFromVarName(name);
      if (rr) { m.hints[rr.role] += rr.conf * (1 + Math.log2(1 + uses)); }
    }
    CP.state.masters.forEach((m) => m.vars.sort((a, b) => b.uses - a.uses));

    // evidence 2: <meta name="theme-color">
    if (CP.state.themeColor && CP.state.themeColor.a > 0.9) {
      const m = nearestMaster(CP.state.themeColor, 0.05);
      if (m) {
        m.themeColor = true;
        m.hints.Primary += 4;
        m.why.push('theme-color meta');
      }
    }
  }

  /* ---- evidence 3: where and how the colour is used ---- */
  function detectRoles(ms) {
    if (!ms.length) return;
    const mx = {};
    ['bg', 'btn', 'link', 'head', 'region', 'border', 'fill', 'mass', 'textish'].forEach((k) => {
      mx[k] = Math.max(1e-9, ...ms.map((m) => m.agg[k]));
    });
    const n = (k, m) => m.agg[k] / mx[k];
    const hn = (m, r) => Math.min(1, m.hints[r] / 3);
    const canvas = CP.parseColor(CP.state.canvasHex);
    const Cb = nearestMaster(canvas, 0.08) || ms[0];
    const used = new Set();
    let P = null;
    const distinct = (m, o) => !o || CP.labDist(m.lch, o.lch) > 0.07;
    const chromaN = (m) => Math.min(1, m.lch.C / 0.15);
    const used3 = (m) => n('btn', m) + n('fill', m) + n('head', m) + n('link', m);

    const SC = {
      Primary: (m) => ((CP.isChroma(m) || m.hints.Primary > 0) ? 0.34 * n('mass', m) + 0.2 * n('btn', m) + 0.14 * n('region', m) + 0.08 * n('head', m) + 0.08 * n('link', m) + 0.06 * chromaN(m) : 0)
        + 1.3 * hn(m, 'Primary') + (m.themeColor ? 0.9 : 0) - (m === Cb && !(m.hints.Primary > 0 || m.themeColor) ? 0.5 : 0),
      Background: (m) => (m === Cb ? 1 : 0) + 0.3 * n('bg', m) * (CP.isChroma(m) ? 0.3 : 1) + hn(m, 'Background'),
      Secondary: (m) => ((CP.isChroma(m) || m.hints.Secondary > 0) && distinct(m, P) && (m.hints.Secondary > 0 || used3(m) > 0.15) ? 0.3 * n('mass', m) + 0.28 * n('btn', m) + 0.12 * n('head', m) + 0.1 * n('link', m) + 0.1 * n('fill', m) : 0) + 1.2 * hn(m, 'Secondary'),
      Accent: (m) => ((CP.isChroma(m) || m.hints.Accent > 0) && distinct(m, P) && (m.hints.Accent > 0 || used3(m) > 0.15) ? 0.3 * n('btn', m) + 0.25 * n('fill', m) + 0.25 * chromaN(m) + 0.2 * n('link', m) : 0) + 1.2 * hn(m, 'Accent'),
      Surface: (m) => (!CP.isChroma(m) || m.hints.Surface > 0 ? 0.55 * n('bg', m) : 0) + hn(m, 'Surface'),
      Text: (m) => (!CP.isChroma(m) || m.hints.Text > 0 ? 0.55 * n('textish', m) + (CP.contrast(m.rep, canvas) >= 4.5 ? 0.25 : 0) : 0) + hn(m, 'Text'),
      'Muted text': (m) => { const c = CP.contrast(m.rep, canvas); return (!CP.isChroma(m) || m.hints['Muted text'] > 0 ? 0.45 * n('textish', m) + (c > 2.4 && c < 7 ? 0.3 : 0) : 0) + hn(m, 'Muted text'); },
      Border: (m) => (!CP.isChroma(m) || m.hints.Border > 0 ? 0.8 * n('border', m) : 0) + hn(m, 'Border'),
      Success: (m) => (CP.isChroma(m) && m.lch.h >= 125 && m.lch.h <= 168 ? 0.55 + 0.3 * chromaN(m) : 0) + 1.2 * hn(m, 'Success'),
      Warning: (m) => (CP.isChroma(m) && m.lch.h >= 55 && m.lch.h <= 105 ? 0.55 + 0.3 * chromaN(m) : 0) + 1.2 * hn(m, 'Warning'),
      Danger: (m) => (CP.isChroma(m) && (m.lch.h >= 10 && m.lch.h <= 42) ? 0.55 + 0.3 * chromaN(m) : 0) + 1.2 * hn(m, 'Danger'),
    };
    const MIN = { Primary: 0.12, Background: 0.3, Secondary: 0.22, Accent: 0.24, Surface: 0.08, Text: 0.25, 'Muted text': 0.2, Border: 0.15, Success: 0.6, Warning: 0.6, Danger: 0.6 };
    const ORDER = ['Primary', 'Background', 'Secondary', 'Accent', 'Surface', 'Text', 'Muted text', 'Border', 'Success', 'Warning', 'Danger'];

    for (const role of ORDER) {
      let best = null, bs = -1;
      for (const m of ms) {
        if (used.has(m)) continue;
        if (role === 'Muted text' && ms.find((x) => x.role === 'Text') && CP.labDist(m.lch, ms.find((x) => x.role === 'Text').lch) < 0.04) continue;
        const s = SC[role](m);
        if (s > bs) { bs = s; best = m; }
      }
      if (!best || bs < MIN[role]) { if (role === 'Primary') continue; continue; }
      best.role = role;
      used.add(best);
      if (role === 'Primary') P = best;
      if (best.hints[role] > 0) best.why.push(`variable name suggests ${role.toLowerCase()}`);
      best.why.push(`${role}: score ${bs.toFixed(2)}`);
    }

    if (!P) {
      const cand = ms.filter((m) => !used.has(m) && m !== Cb).sort((a, b) => b.agg.btn + b.agg.mass * 0.2 - (a.agg.btn + a.agg.mass * 0.2))[0];
      if (cand) {
        cand.role = 'Primary';
        cand.why.push('Primary: fallback (most button-like)');
      }
    }
  }

  Object.assign(CP, {
    buildClusters,
    nearestMaster,
    varRaw,
    varColor,
    collectHints,
    detectRoles,
  });
})();
