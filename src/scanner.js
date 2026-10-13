(() => {
  'use strict';
  const CP = (window.__CP = window.__CP || {});

  const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'LINK', 'META', 'HEAD', 'TITLE', 'TEMPLATE']);
  const BTN_SEL = 'button,[role=button],input[type=submit],input[type=button],.btn,[class*=button],[class*=btn]';
  const FORM_SEL = 'input,textarea,select,button';
  const REGION_SEL = 'header,nav,footer,[role=banner],[role=contentinfo],[class*=hero],[class*=banner],[class*=navbar],[class*=footer],[class*=header]';
  const PROPS = [
    ['color', 'text'], ['background-color', 'bg'], ['background-image', 'bg'], ['box-shadow', 'rule'],
    ['border-top-color', 'border'], ['border-right-color', 'border'], ['border-bottom-color', 'border'], ['border-left-color', 'border'],
    ['outline-color', 'border'],
  ];

  function getDomElements(limit = 6000) {
    const out = [];
    const queue = [document.documentElement];
    while (queue.length && out.length < limit) {
      const el = queue.shift();
      if (!el || el.id === CP.HOST_ID) continue;
      out.push(el);
      if (el.shadowRoot) {
        for (const ch of el.shadowRoot.children) queue.push(ch);
      }
      for (const ch of el.children) queue.push(ch);
    }
    return out;
  }

  async function scanPage() {
    const records = [], elRecs = [], stats = new Map(), varUse = new Map(), varNames = new Set();
    let blocked = 0, fetched = 0;

    const add = (hex, kind, w, extra) => {
      let s = stats.get(hex);
      if (!s) {
        const c = CP.parseColor(hex), l = CP.toLch(c);
        s = { hex, r: c.r, g: c.g, b: c.b, L: l.L, a: l.a, bb: l.b, bg: 0, text: 0, border: 0, fill: 0, rule: 0, btn: 0, link: 0, head: 0, region: 0, total: 0 };
        stats.set(hex, s);
      }
      s[kind] += w; s.total += w; if (extra) s[extra] += w;
    };

    /* ---- stylesheet rules ---- */
    const skipHdr = /^@(-webkit-)?(keyframes|font-face|property|page|counter-style|font-feature-values)/i;
    const walk = (rules, wrap) => {
      for (const r of rules) {
        if (r.type === 1 && r.selectorText !== undefined) {
          const st = r.style;
          for (let i = 0; i < st.length; i++) {
            const p = st[i], v = st.getPropertyValue(p);
            if (!v) continue;
            if (p.startsWith('--')) varNames.add(p);
            if (v.includes('var(') && CP.COLORISH.test(p)) {
              for (const m of v.matchAll(/var\(\s*(--[\w-]+)/g)) varUse.set(m[1], (varUse.get(m[1]) || 0) + (/background|fill/.test(p) ? 1.2 : 1));
            }
            if (CP.SKIP_PROP.test(p) || v.length > 800) continue;
            const found = CP.findColors(p, v);
            if (found.length && records.length < 80000) {
              records.push({ sel: r.selectorText, wrap, p, v });
              found.forEach((hx) => add(hx, 'rule', 1));
            }
          }
        } else if (r.cssRules) {
          const header = r.cssText.slice(0, Math.max(0, r.cssText.indexOf('{'))).trim();
          if (skipHdr.test(header)) continue;
          walk(r.cssRules, /^@(media|supports|container)/i.test(header) ? wrap.concat(header) : wrap);
        }
      }
    };

    /* ---- shadow DOM & document elements ---- */
    const els = getDomElements(6000);
    const shadowSheets = [];
    for (const el of els) {
      if (el.shadowRoot) {
        try {
          if (el.shadowRoot.styleSheets) shadowSheets.push(...Array.from(el.shadowRoot.styleSheets));
          if (el.shadowRoot.adoptedStyleSheets) shadowSheets.push(...Array.from(el.shadowRoot.adoptedStyleSheets));
        } catch (e) {}
      }
    }
    const sheets = [...document.styleSheets, ...(document.adoptedStyleSheets || []), ...shadowSheets].filter((s) => !CP.isOurs(s));
    for (const ss of sheets) {
      if (ss.disabled) continue;
      const mt = ss.media && ss.media.mediaText;
      const w0 = mt && mt !== 'all' ? ['@media ' + mt] : [];
      let rules = null;
      try { rules = ss.cssRules; } catch (e) { /* cross-origin */ }
      if (!rules && ss.href) {
        try {
          const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), 4000);
          const resp = await fetch(ss.href, { signal: ctl.signal, mode: 'cors', credentials: 'omit' });
          clearTimeout(timer);
          if (resp.ok) { const cs = new CSSStyleSheet(); cs.replaceSync(await resp.text()); rules = cs.cssRules; fetched++; }
        } catch (e) { /* blocked by CORS */ }
      }
      if (rules) walk(rules, w0); else blocked++;
    }

    /* ---- computed styles: usage signals + exact per-element records ---- */
    const vw = innerWidth, vh = innerHeight, vArea = Math.max(1, vw * vh);

    const collect = (el, cs, pseudo, ctxInfo) => {
      const { visible, rect, isBtn, isLink, isHead, textLen, hasText, fold, region } = ctxInfo;
      const list = el instanceof SVGElement && !pseudo ? PROPS.concat([['fill', 'fill'], ['stroke', 'fill']]) : PROPS;
      for (const [p, kind] of list) {
        if (p === 'color' && !(hasText || pseudo)) continue;
        if (p === 'background-image' && !/gradient/.test(cs.backgroundImage)) continue;
        if (p === 'box-shadow' && cs.boxShadow === 'none') continue;
        if (p === 'outline-color' && cs.outlineStyle === 'none') continue;
        if (/^border-(top|right|bottom|left)-color$/.test(p)) {
          const side = p.split('-')[1];
          if (!(parseFloat(cs.getPropertyValue(`border-${side}-width`)) > 0) || cs.getPropertyValue(`border-${side}-style`) === 'none') continue;
        }
        const val = cs.getPropertyValue(p);
        if (!val) continue;
        const found = CP.findColors(p, val);
        if (!found.length) continue;
        elRecs.push({ el, pseudo, prop: p, val, colors: found });
        if (pseudo || !visible) continue;
        let w = 1, extra = null;
        if (p === 'color') {
          const fs = parseFloat(cs.fontSize) || 16;
          w = (Math.min(textLen, 200) / 8 + 1) * CP.clamp(fs / 16, 0.7, 2.5);
          extra = isBtn ? 'btn' : isHead ? 'head' : isLink ? 'link' : null;
        } else if (p === 'background-color') {
          w = (Math.min(rect.width * rect.height, vArea * 3) / vArea) * 20 + 0.5;
          extra = isBtn ? 'btn' : region ? 'region' : null;
        } else if (p === 'box-shadow') w = 0.3;
        else if (kind === 'fill') w = 2;
        found.forEach((hx) => add(hx, kind, w * fold, extra));
      }
    };

    for (const el of els) {
      if (SKIP_TAGS.has(el.tagName)) continue;
      const cs = getComputedStyle(el);
      if (cs.display === 'none') continue;
      const rect = el.getBoundingClientRect();
      const visible = rect.width > 0 && rect.height > 0 && cs.visibility !== 'hidden' && cs.opacity !== '0';
      const bg = CP.parseColor(cs.backgroundColor);
      const bgSolid = bg && bg.a > 0.5;
      const tag = el.tagName;
      const isBtn = el.matches(BTN_SEL) || ((tag === 'A' || tag === 'BUTTON') && bgSolid && rect.height < 90 && rect.width < 420 && parseFloat(cs.borderTopLeftRadius) >= 0);
      let textLen = 0;
      for (const ch of el.childNodes) if (ch.nodeType === 3) textLen += ch.nodeValue.trim().length;
      const info = {
        visible, rect, isBtn: isBtn && (tag !== 'A' || bgSolid || el.matches(BTN_SEL)), isLink: tag === 'A', isHead: /^H[1-3]$/.test(tag), textLen,
        hasText: textLen > 0 || el.matches(FORM_SEL) || el instanceof SVGElement, fold: visible && rect.top < vh ? 1.4 : 1,
        region: visible && bgSolid ? !!el.closest(REGION_SEL) : false,
      };
      collect(el, cs, '', info);
      if (elRecs.length < 60000 && !(el instanceof SVGElement)) {
        for (const ps of ['::before', '::after']) {
          const pc = getComputedStyle(el, ps);
          if (pc.content && pc.content !== 'none' && pc.content !== 'normal') collect(el, pc, ps, info);
        }
      }
    }

    /* ---- the page canvas ---- */
    const rootBg = CP.parseColor(getComputedStyle(document.documentElement).backgroundColor);
    const bodyBg = document.body ? CP.parseColor(getComputedStyle(document.body).backgroundColor) : null;
    let canvasHex = '#ffffff';
    if (bodyBg && bodyBg.a > 0.9) canvasHex = CP.toHex(bodyBg);
    else if (rootBg && rootBg.a > 0.9) canvasHex = CP.toHex(rootBg);
    else {
      records.push({ sel: 'html', wrap: [], p: 'background-color', v: '#ffffff' });
      add('#ffffff', 'bg', 10);
    }

    CP.state.records = records;
    CP.state.elRecs = elRecs;
    CP.state.blocked = blocked;
    CP.state.fetched = fetched;
    CP.state.canvasHex = canvasHex;
    CP.state.varNames = varNames;
    CP.state.varUse = varUse;

    const tc = document.querySelector('meta[name="theme-color"]');
    CP.state.themeColor = tc ? CP.parseColor(tc.getAttribute('content')) : null;
    return stats;
  }

  Object.assign(CP, {
    getDomElements,
    scanPage,
  });
})();
