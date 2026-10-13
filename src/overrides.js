(() => {
  'use strict';
  const CP = (window.__CP = window.__CP || {});

  function buildMap() {
    const map = new Map();
    for (const m of CP.state.masters) {
      if (m.cur === m.orig) continue;
      const T = CP.toLch(CP.parseColor(m.cur)), F = m.lch, chroma = CP.isChroma(m);
      const group = chroma && CP.state.follow ? [m, ...m.sats] : [m];
      for (const g of group) {
        for (const hx of g.members) {
          if (hx === m.orig || !chroma) { map.set(hx, m.cur); continue; }
          const x = CP.toLch(CP.parseColor(hx));
          const ratio = F.C > 0.002 ? CP.clamp(T.C / F.C, 0, 4) : 1;
          const out = CP.lchToRgb(x.L + (T.L - F.L), x.C * ratio, x.h + (T.h - F.h));
          map.set(hx, CP.toHex(out));
        }
      }
    }
    return map;
  }

  const resolver = (map) => (c) => {
    const h = map.get(CP.toHex(c));
    return h ? CP.parseColor(h) : null;
  };

  function buildPatch() {
    const res = resolver(CP.state.map);
    let css = '';
    for (const r of CP.state.missed) {
      const nv = CP.transformValue(r.prop, r.val, res);
      if (nv === r.val || !r.el.isConnected) continue;
      if (!r.el.__cpid) { r.el.__cpid = ++CP.state.idc; r.el.setAttribute('data-cpid', String(r.el.__cpid)); }
      css += `[data-cpid="${r.el.__cpid}"]${r.pseudo}{${r.prop}:${nv} !important}\n`;
    }
    if (CP.state.sheets && CP.state.sheets.patch) {
      CP.state.sheets.patch.set(css);
    }
  }

  function verify() {
    if (!CP.state.map.size) {
      CP.state.missed = [];
      if (CP.state.sheets && CP.state.sheets.patch) CP.state.sheets.patch.set('');
      return;
    }
    const res = resolver(CP.state.map);
    if (CP.state.sheets && CP.state.sheets.patch) CP.state.sheets.patch.set('');
    const tmp = CP.newSheet();
    tmp.set('*,*::before,*::after{transition:none!important}');
    const missed = [];
    for (const r of CP.state.elRecs) {
      if (!r.el.isConnected) continue;
      if (CP.transformValue(r.prop, r.val, res) === r.val) continue;
      let cur;
      try { cur = getComputedStyle(r.el, r.pseudo || null).getPropertyValue(r.prop); } catch (e) { continue; }
      if (cur === r.val) missed.push(r);
    }
    tmp.remove();
    CP.state.missed = missed;
    buildPatch();
    CP.state.stats = { patched: missed.length };
    if (typeof CP.setStatus === 'function') CP.setStatus();
  }

  let verifyTimer = 0;
  const scheduleVerify = () => { clearTimeout(verifyTimer); verifyTimer = setTimeout(verify, 160); };

  function applyAll() {
    CP.state.map = buildMap();
    const res = resolver(CP.state.map);
    let css = '';
    for (const rec of CP.state.records) {
      const nv = CP.transformValue(rec.p, rec.v, res);
      if (nv === rec.v) continue;
      let rule = `${rec.sel}{${rec.p}:${nv} !important}`;
      for (let i = rec.wrap.length - 1; i >= 0; i--) rule = `${rec.wrap[i]}{${rule}}`;
      css += rule + '\n';
    }
    CP.state.lastCss = css;
    if (CP.state.sheets && CP.state.sheets.rules) {
      CP.state.sheets.rules.set(css);
    }

    // Direct CSS custom property mutation on :root for instant framework reactivity
    for (const m of CP.state.masters) {
      if (m.cur === m.orig && !CP.state.mutatedVars.size) continue;
      const group = [m, ...(CP.state.follow ? m.sats : [])];
      for (const g of group) {
        const targetHex = g === m ? m.cur : (CP.state.map.get(g.orig) || m.cur);
        for (const v of g.vars) {
          if (!v || !v.name) continue;
          let formattedVal = targetHex;
          if (v.triplet) {
            const p = CP.parseColor(targetHex);
            if (p) formattedVal = v.triplet.format(p);
          } else if (v.raw && /var\(|calc\(/i.test(v.raw)) {
            formattedVal = CP.transformValue(v.name, v.raw, res);
          }
          try {
            document.documentElement.style.setProperty(v.name, formattedVal);
            CP.state.mutatedVars.set(v.name, formattedVal);
          } catch (e) {}
        }
      }
    }

    buildPatch();
    scheduleVerify();
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      if (CP.state.metaOrig == null) CP.state.metaOrig = meta.getAttribute('content');
      meta.setAttribute('content', CP.state.map.size ? CP.transformValue('color', CP.state.metaOrig, res) : CP.state.metaOrig);
    }
    if (typeof CP.updateContrast === 'function') CP.updateContrast();
    scheduleSaveDomain();
  }

  let rafId = 0;
  const scheduleApply = () => { cancelAnimationFrame(rafId); rafId = requestAnimationFrame(applyAll); };

  function getDomainKey(urlOrHost) {
    try {
      let host = urlOrHost;
      if (host && host.includes('://')) {
        host = new URL(host).hostname;
      } else if (!host) {
        host = location.hostname;
      }
      host = (host || '').toLowerCase();
      if (!host || /^(\d{1,3}\.){3}\d{1,3}$/.test(host) || host === 'localhost') {
        return host || location.origin;
      }
      const parts = host.split('.');
      if (parts.length >= 3 && /^(co|com|org|net|gov|edu|ac|in)$/i.test(parts[parts.length - 2])) {
        return parts.slice(-3).join('.');
      }
      if (parts.length >= 2) {
        return parts.slice(-2).join('.');
      }
      return host;
    } catch (e) {
      return location.origin;
    }
  }

  let saveTimer = 0;
  const scheduleSaveDomain = () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveDomainState, 350);
  };

  async function saveDomainState() {
    const hasChanges = CP.state.masters.some((m) => m.cur !== m.orig);
    const origin = location.origin;
    const domain = getDomainKey(location.href);
    const domainKey = 'cp_domain:' + domain;
    const originKey = 'cp_domain:' + origin;
    if (!hasChanges) {
      await removeDomainState();
      return;
    }
    const roles = {};
    for (const m of CP.state.masters) {
      if (m.role && m.role !== 'Other') {
        roles[m.role] = m.cur;
      }
    }
    const pairs = CP.state.masters.filter((m) => m.cur !== m.orig).map((m) => [m.orig, m.cur]);
    const data = {
      origin,
      domain,
      active: true,
      roles,
      pairs,
      isDark: typeof CP.detectMode === 'function' ? CP.detectMode() : false,
      follow: CP.state.follow,
      isOpen: typeof CP.state.isOpen === 'boolean' ? CP.state.isOpen : true,
      updatedAt: Date.now(),
    };
    try {
      await chrome.storage.local.set({ [domainKey]: data, [originKey]: data });
      const res = await chrome.storage.local.get('cp_active_domains');
      const domains = new Set(res && Array.isArray(res.cp_active_domains) ? res.cp_active_domains : []);
      domains.add(origin);
      domains.add(domain);
      await chrome.storage.local.set({ cp_active_domains: Array.from(domains) });
    } catch (e) {}
  }

  async function removeDomainState() {
    const origin = location.origin;
    const domain = getDomainKey(location.href);
    const domainKey = 'cp_domain:' + domain;
    const originKey = 'cp_domain:' + origin;
    try {
      await chrome.storage.local.remove([domainKey, originKey]);
      const res = await chrome.storage.local.get('cp_active_domains');
      if (res && Array.isArray(res.cp_active_domains)) {
        const domains = res.cp_active_domains.filter((d) => d !== origin && d !== domain);
        await chrome.storage.local.set({ cp_active_domains: domains });
      }
    } catch (e) {}
  }

  async function loadDomainState() {
    const origin = location.origin;
    const domain = getDomainKey(location.href);
    const domainKey = 'cp_domain:' + domain;
    const originKey = 'cp_domain:' + origin;
    return new Promise((resolve) => {
      try {
        chrome.storage.local.get([domainKey, originKey], (res) => {
          const data = (res && res[originKey]) || (res && res[domainKey]);
          if (!data || !data.active) {
            resolve(false);
            return;
          }
          let changed = false;
          if (data.roles) {
            for (const [role, hex] of Object.entries(data.roles)) {
              const m = CP.byRole(role);
              if (m && hex && m.cur !== hex) {
                m.cur = hex;
                changed = true;
              }
            }
          }
          if (Array.isArray(data.pairs)) {
            for (const [orig, cur] of data.pairs) {
              const m = CP.state.masters.find((x) => x.orig === orig);
              if (m && cur && m.cur !== cur) {
                m.cur = cur;
                changed = true;
              }
            }
          }
          if (changed) {
            applyAll();
            if (typeof CP.refreshAll === 'function') CP.refreshAll();
            if (typeof CP.syncWheelFromPage === 'function') CP.syncWheelFromPage();
          }
          if (typeof data.isOpen === 'boolean' && typeof CP.toggle === 'function') {
            CP.toggle(data.isOpen);
          }
          resolve(changed);
        });
      } catch (e) {
        resolve(false);
      }
    });
  }

  function clearOverrides() {
    CP.state.map = new Map();
    CP.state.missed = [];
    if (CP.state.sheets) {
      if (CP.state.sheets.rules) CP.state.sheets.rules.set('');
      if (CP.state.sheets.patch) CP.state.sheets.patch.set('');
      if (CP.state.sheets.highlight) CP.state.sheets.highlight.set('');
    }
    if (CP.state.mutatedVars) {
      for (const name of CP.state.mutatedVars.keys()) {
        try { document.documentElement.style.removeProperty(name); } catch (e) {}
      }
      CP.state.mutatedVars.clear();
    }
    clearHighlight();
    document.querySelectorAll('[data-cpid]').forEach((el) => { el.removeAttribute('data-cpid'); delete el.__cpid; });
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta && CP.state.metaOrig != null) meta.setAttribute('content', CP.state.metaOrig);
  }

  /* ---------- interactive element highlight ---------- */
  function highlightCluster(m) {
    clearHighlight();
    if (!m || !CP.state.elRecs.length) return;
    const targetColors = new Set([...m.members, ...(CP.state.follow ? m.sats.flatMap((s) => s.members) : [])]);
    const matched = new Set();
    for (const r of CP.state.elRecs) {
      if (!r.el.isConnected) continue;
      if (r.colors && r.colors.some((c) => targetColors.has(c))) {
        matched.add(r.el);
      }
    }
    if (!matched.size) return;
    CP.state.highlighted = Array.from(matched);
    for (const el of CP.state.highlighted) {
      try { el.setAttribute('data-cphl', ''); } catch (e) {}
    }
    const count = CP.state.highlighted.length;
    if (typeof CP.setStatus === 'function') {
      CP.setStatus(`${count} element${count > 1 ? 's' : ''} highlighted`);
    }
    if (CP.state.sheets && CP.state.sheets.highlight) {
      CP.state.sheets.highlight.set(`
        [data-cphl] {
          outline: 2.5px solid #8ea2ff !important;
          outline-offset: 2px !important;
          box-shadow: 0 0 0 4px rgba(142, 162, 255, 0.35), 0 0 12px rgba(142, 162, 255, 0.45) !important;
          transition: outline 0.15s ease, box-shadow 0.15s ease !important;
        }
      `);
    }
  }

  function clearHighlight() {
    if (CP.state.highlighted && CP.state.highlighted.length) {
      for (const el of CP.state.highlighted) {
        if (el.isConnected) {
          try { el.removeAttribute('data-cphl'); } catch (e) {}
        }
      }
      CP.state.highlighted = [];
    }
    if (CP.state.sheets && CP.state.sheets.highlight) {
      CP.state.sheets.highlight.set('');
    }
    if (typeof CP.setStatus === 'function') CP.setStatus();
  }

  Object.assign(CP, {
    buildMap,
    resolver,
    buildPatch,
    verify,
    scheduleVerify,
    applyAll,
    scheduleApply,
    clearOverrides,
    highlightCluster,
    clearHighlight,
    saveDomainState,
    removeDomainState,
    loadDomainState,
    scheduleSaveDomain,
    getDomainKey,
  });
})();
