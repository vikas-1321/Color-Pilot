(() => {
  'use strict';
  const CP = (window.__CP = window.__CP || {});

  function detectMode() {
    const docCl = document.documentElement.classList;
    const bodyCl = document.body ? document.body.classList : { contains: () => false };
    const hasDarkClass = docCl.contains('dark') || docCl.contains('theme-dark') || docCl.contains('dark-theme') ||
      bodyCl.contains('dark') || bodyCl.contains('theme-dark') || bodyCl.contains('dark-theme');
    const themeAttr = document.documentElement.getAttribute('data-theme') ||
      document.documentElement.getAttribute('data-mode') ||
      document.documentElement.getAttribute('data-color-mode');
    const hasDarkAttr = themeAttr && /dark/i.test(themeAttr);
    const isDarkCanvas = CP.state.canvasHex ? CP.lumOf(CP.parseColor(CP.state.canvasHex)) < 0.28 : false;
    const isMediaDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return !!(hasDarkClass || hasDarkAttr || isDarkCanvas || (isMediaDark && !docCl.contains('light')));
  }

  async function toggleThemeMode(onRescan) {
    const nowDark = detectMode();
    const targetMode = nowDark ? 'light' : 'dark';
    const docEl = document.documentElement;
    const bodyEl = document.body;

    if (nowDark) {
      docEl.classList.remove('dark', 'theme-dark', 'dark-theme');
      if (bodyEl) bodyEl.classList.remove('dark', 'theme-dark', 'dark-theme');
      docEl.classList.add('light');
      if (docEl.hasAttribute('data-theme')) docEl.setAttribute('data-theme', 'light');
      if (docEl.hasAttribute('data-mode')) docEl.setAttribute('data-mode', 'light');
      if (docEl.hasAttribute('data-color-mode')) docEl.setAttribute('data-color-mode', 'light');
      docEl.style.colorScheme = 'light';
    } else {
      docEl.classList.remove('light', 'theme-light', 'light-theme');
      if (bodyEl) bodyEl.classList.remove('light', 'theme-light', 'light-theme');
      docEl.classList.add('dark');
      if (docEl.hasAttribute('data-theme')) docEl.setAttribute('data-theme', 'dark');
      if (docEl.hasAttribute('data-mode')) docEl.setAttribute('data-mode', 'dark');
      if (docEl.hasAttribute('data-color-mode')) docEl.setAttribute('data-color-mode', 'dark');
      docEl.style.colorScheme = 'dark';
    }
    if (typeof CP.updateThemeBtn === 'function') CP.updateThemeBtn();
    if (typeof CP.toast === 'function') CP.toast(`Switched to ${targetMode === 'dark' ? 'Dark' : 'Light'} mode`);
    if (typeof onRescan === 'function') await onRescan();
  }

  function getSuggestions() {
    const isDark = detectMode();
    const pri = CP.byRole('Primary') || CP.state.masters[0];
    const baseHsv = pri ? CP.rgb2hsv(CP.parseColor(pri.cur)) : { h: 220, s: 0.65, v: 0.85 };
    const baseHex = pri ? pri.cur : '#4f46e5';

    const text = isDark ? '#f8fafc' : '#0f172a';
    const surface = isDark ? '#151b2a' : '#f8fafc';

    const hHsv = (hOff, sMult = 1, vMult = 1) =>
      CP.toHex(CP.hsv2rgb((baseHsv.h + hOff + 360) % 360, CP.clamp(baseHsv.s * sMult), CP.clamp(baseHsv.v * vMult)));

    return [
      {
        name: 'Harmonic Flow',
        cat: 'Harmonic',
        tag: 'Harmonic',
        desc: 'Analogous harmony computed directly from your current brand tone',
        roles: {
          Primary: baseHex,
          Secondary: hHsv(30, 0.95, 0.95),
          Accent: hHsv(-35, 1.1, 1),
          Surface: isDark ? hHsv(0, 0.15, 0.18) : hHsv(0, 0.05, 0.98),
        },
      },
      {
        name: 'Complementary Contrast',
        cat: 'Harmonic',
        tag: 'High Contrast',
        desc: 'Geometric chromatic complement with high CTA pop',
        roles: {
          Primary: baseHex,
          Secondary: hHsv(180, 0.9, 0.95),
          Accent: hHsv(150, 1.15, 1),
          Surface: surface,
        },
      },
      {
        name: 'Triadic Energy',
        cat: 'Harmonic',
        tag: 'Dynamic',
        desc: 'Equidistant 3-way color geometry based on your primary hue',
        roles: {
          Primary: baseHex,
          Secondary: hHsv(120, 0.85, 0.9),
          Accent: hHsv(240, 0.95, 1),
          Surface: surface,
        },
      },
      {
        name: 'Monochrome Luxe',
        cat: 'Harmonic',
        tag: 'Minimalist',
        desc: 'Curated single-hue depth palette with subtle lightness steps',
        roles: {
          Primary: baseHex,
          Secondary: hHsv(0, 0.5, 0.95),
          Accent: hHsv(0, 1.2, 0.8),
          Surface: isDark ? hHsv(0, 0.2, 0.15) : hHsv(0, 0.04, 0.97),
        },
      },
      {
        name: 'Modern SaaS (Indigo & Cyan)',
        cat: 'Modern Tech',
        tag: 'SaaS / Tech',
        desc: 'Stripe & Linear inspired electric indigo with sharp cyan secondary',
        roles: {
          Primary: '#6366f1',
          Secondary: '#06b6d4',
          Accent: '#f43f5e',
          Background: isDark ? '#090d16' : '#ffffff',
          Surface: isDark ? '#111726' : '#f8fafc',
          Text: text,
        },
      },
      {
        name: 'Cyber Emerald',
        cat: 'Modern Tech',
        tag: 'FinTech',
        desc: 'Futuristic mint emerald paired with deep teal and violet',
        roles: {
          Primary: '#10b981',
          Secondary: '#06b6d4',
          Accent: '#8b5cf6',
          Background: isDark ? '#060d09' : '#f0fdf4',
          Surface: isDark ? '#0d1e15' : '#ffffff',
          Text: isDark ? '#f0fdf4' : '#064e3b',
        },
      },
      {
        name: 'Sunset Horizon',
        cat: 'Warm & Bold',
        tag: 'Warm / Bold',
        desc: 'High-conversion amber, coral orange and warm rose',
        roles: {
          Primary: '#f97316',
          Secondary: '#ec4899',
          Accent: '#eab308',
          Background: isDark ? '#110c0b' : '#fffaf5',
          Surface: isDark ? '#1d1513' : '#ffffff',
          Text: isDark ? '#fff7ed' : '#431407',
        },
      },
      {
        name: 'Deep Oceanic',
        cat: 'Vibrant',
        tag: 'Trust & Flow',
        desc: 'Deep marine blues with refreshing teal and warm golden highlights',
        roles: {
          Primary: '#0284c7',
          Secondary: '#14b8a6',
          Accent: '#f59e0b',
          Background: isDark ? '#050f18' : '#f0f9ff',
          Surface: isDark ? '#0b1c2e' : '#ffffff',
          Text: isDark ? '#f0f9ff' : '#082f49',
        },
      },
      {
        name: 'Royal Amethyst',
        cat: 'Vibrant',
        tag: 'AI / Creative',
        desc: 'Electrifying neon purple and magenta with icy accents',
        roles: {
          Primary: '#8b5cf6',
          Secondary: '#d946ef',
          Accent: '#38bdf8',
          Background: isDark ? '#0b0817' : '#faf5ff',
          Surface: isDark ? '#17112c' : '#ffffff',
          Text: isDark ? '#faf5ff' : '#3b0764',
        },
      },
      {
        name: 'Nordic Slate',
        cat: 'Minimalist',
        tag: 'Editorial',
        desc: 'Architectural cool neutrals with crisp cobalt micro-accents',
        roles: {
          Primary: isDark ? '#e2e8f0' : '#1e293b',
          Secondary: isDark ? '#94a3b8' : '#64748b',
          Accent: '#3b82f6',
          Background: isDark ? '#090b10' : '#f8fafc',
          Surface: isDark ? '#121620' : '#ffffff',
          Text: isDark ? '#f8fafc' : '#0f172a',
        },
      },
    ];
  }

  function applyTemplate(tpl) {
    for (const [role, hex] of Object.entries(tpl.roles)) {
      const m = CP.byRole(role);
      if (m && hex) {
        m.cur = hex;
        if (typeof CP.refreshRow === 'function') CP.refreshRow(m);
      }
    }
    CP.scheduleApply();
    if (typeof CP.syncWheelFromPage === 'function') CP.syncWheelFromPage();
    if (typeof CP.toast === 'function') CP.toast(`Applied "${tpl.name}"`);
  }

  Object.assign(CP, {
    detectMode,
    toggleThemeMode,
    getSuggestions,
    applyTemplate,
  });
})();
