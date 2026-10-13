(() => {
  'use strict';
  const CP = (window.__CP = window.__CP || {});
  const TEST = typeof globalThis.__CP_TEST !== 'undefined';

  const cvs = TEST ? null : document.createElement('canvas');
  if (cvs) { cvs.width = cvs.height = 1; }
  const ctx = TEST ? globalThis.__CP_CTX : cvs.getContext('2d', { willReadFrequently: true });
  const pcache = new Map();
  const KEYWORD = /^(currentcolor|inherit|initial|unset|revert|revert-layer|none|auto|transparent)$/i;

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const h2 = (n) => Math.round(clamp(n, 0, 255)).toString(16).padStart(2, '0');
  const toHex = (c) => '#' + h2(c.r) + h2(c.g) + h2(c.b);
  const fmt = (n, a) => (a >= 1 ? toHex(n) : `rgba(${Math.round(n.r)}, ${Math.round(n.g)}, ${Math.round(n.b)}, ${+a.toFixed(3)})`);
  const normHex = (s) => {
    s = String(s).trim().replace(/^#/, '');
    if (/^[0-9a-f]{3}$/i.test(s)) s = s.split('').map((x) => x + x).join('');
    return /^[0-9a-f]{6}$/i.test(s) ? '#' + s.toLowerCase() : null;
  };

  function parseColor(str) {
    if (str == null) return null;
    str = String(str).trim();
    if (pcache.has(str)) return pcache.get(str);
    let out = null;
    if (str && !KEYWORD.test(str) && !/var\(|env\(|calc\(/i.test(str)) {
      try {
        ctx.fillStyle = '#010203';
        ctx.fillStyle = str;
        const v = ctx.fillStyle;
        const bad = v === '#010203' && str.toLowerCase().replace(/\s/g, '') !== '#010203' && !/^rgba?\(\s*1\s*[, ]\s*2\s*[, ]\s*3\s*\)$/i.test(str);
        if (!bad) {
          if (v[0] === '#') {
            out = { r: parseInt(v.slice(1, 3), 16), g: parseInt(v.slice(3, 5), 16), b: parseInt(v.slice(5, 7), 16), a: 1 };
          } else {
            const m = v.match(/^rgba?\(([^)]+)\)/);
            if (m) {
              const p = m[1].split(/[\s,\/]+/).filter(Boolean).map(Number);
              out = { r: p[0], g: p[1], b: p[2], a: p[3] === undefined ? 1 : p[3] };
            } else {
              ctx.clearRect(0, 0, 1, 1);
              ctx.fillStyle = str;
              ctx.fillRect(0, 0, 1, 1);
              const d = ctx.getImageData(0, 0, 1, 1).data;
              out = { r: d[0], g: d[1], b: d[2], a: +(d[3] / 255).toFixed(3) };
            }
          }
        }
      } catch (e) {
        out = null;
      }
    }
    pcache.set(str, out);
    return out;
  }

  const lin = (v) => {
    v /= 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  const lumOf = (c) => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
  const contrast = (a, b) => {
    const x = lumOf(a), y = lumOf(b);
    return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
  };

  function toLch(c) {
    const r = lin(c.r), g = lin(c.g), b = lin(c.b);
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
    const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
    const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
    return { L, a, b: bb, C: Math.hypot(a, bb), h: ((Math.atan2(bb, a) * 180) / Math.PI + 360) % 360 };
  }

  const gam = (v) => {
    v = clamp(v);
    return Math.round((v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055) * 255);
  };

  function labToRgbRaw(L, a, b) {
    const l_ = L + 0.3963377774 * a + 0.2158037573 * b,
      m_ = L - 0.1055613458 * a - 0.0638541728 * b,
      s_ = L - 0.0894841775 * a - 1.291485548 * b;
    const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;
    return [
      4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
      -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
      -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
    ];
  }

  function lchToRgb(L, C, h) {
    L = clamp(L);
    let c = Math.max(0, C), raw;
    for (let i = 0; i < 30; i++) {
      const rad = (h * Math.PI) / 180;
      raw = labToRgbRaw(L, c * Math.cos(rad), c * Math.sin(rad));
      if (raw.every((x) => x >= -0.0015 && x <= 1.0015)) break;
      c *= 0.92;
    }
    return { r: gam(raw[0]), g: gam(raw[1]), b: gam(raw[2]), a: 1 };
  }

  const labDist = (a, b) => Math.hypot(a.L - b.L, a.a - b.a, a.b - b.b);
  const hueDiff = (a, b) => {
    const d = Math.abs(a - b) % 360;
    return d > 180 ? 360 - d : d;
  };
  const isChroma = (c) => c.lch.C >= 0.025 && c.lch.L > 0.08 && c.lch.L < 0.93;

  function hsv2rgb(h, s, v) {
    h = ((h % 360) + 360) % 360;
    const f = (n) => {
      const k = (n + h / 60) % 6;
      return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
    };
    return { r: Math.round(f(5) * 255), g: Math.round(f(3) * 255), b: Math.round(f(1) * 255), a: 1 };
  }

  function rgb2hsv({ r, g, b }) {
    r /= 255; g /= 255; b /= 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
    let h = 0;
    if (d) {
      if (mx === r) h = ((g - b) / d) % 6;
      else if (mx === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60;
      if (h < 0) h += 360;
    }
    return { h, s: mx ? d / mx : 0, v: mx };
  }

  // Export to namespace
  Object.assign(CP, {
    clamp, h2, toHex, fmt, normHex, parseColor, lin, lumOf, contrast,
    toLch, gam, labToRgbRaw, lchToRgb, labDist, hueDiff, isChroma,
    hsv2rgb, rgb2hsv,
  });
})();
