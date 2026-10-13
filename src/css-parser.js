(() => {
  'use strict';
  const CP = (window.__CP = window.__CP || {});

  const NAMED = new Set('aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen'.split(' '));
  const COLOR_FUNCS = new Set(['rgb', 'rgba', 'hsl', 'hsla', 'hwb', 'lab', 'lch', 'oklab', 'oklch', 'color']);
  const SKIP_PROP = /^(font|grid|animation|transition|content|will-change|transform|src|mask|clip|counter|quotes|cursor|list-style|filter|backdrop)/;
  const COLORISH = /color|background|fill|stroke|border|outline|shadow|accent|caret|^--/;
  const NOT_COLOR_VAR = /(spacing|size|radius|width|height|duration|opacity|index|ratio|font|line|gap|scale|rotate|blur|delay|ease|columns|rows)/i;

  function closeParen(v, open) {
    let d = 0;
    for (let k = open; k < v.length; k++) {
      if (v[k] === '(') d++;
      else if (v[k] === ')') {
        d--;
        if (d === 0) return k;
      }
    }
    return v.length - 1;
  }

  function colorSpans(v) {
    const out = [];
    let i = 0;
    const n = v.length;
    while (i < n) {
      const c = v[i];
      if (c === '"' || c === "'") {
        const e = v.indexOf(c, i + 1);
        i = e < 0 ? n : e + 1;
        continue;
      }
      if (c === '#') {
        const m = /^#[0-9a-f]+/i.exec(v.slice(i, i + 10));
        const L = m ? m[0].length : 0;
        if ([4, 5, 7, 9].includes(L) && !/[\w-]/.test(v[i + L] || '')) {
          out.push([i, i + L]);
          i += L;
        } else i++;
        continue;
      }
      if (/[a-z]/i.test(c) && (i === 0 || !/[\w-]/.test(v[i - 1]))) {
        let j = i;
        while (j < n && /[\w-]/.test(v[j])) j++;
        const w = v.slice(i, j).toLowerCase();
        if (v[j] === '(') {
          const k = closeParen(v, j);
          if (w === 'url') {
            i = k + 1;
            continue;
          }
          if (COLOR_FUNCS.has(w)) {
            out.push([i, k + 1]);
            i = k + 1;
            continue;
          }
          i = j + 1;
          continue;
        }
        if (NAMED.has(w)) out.push([i, j]);
        i = j;
        continue;
      }
      i++;
    }
    return out;
  }

  const TW_RE = /^rgba?\(\s*(\d{1,3})(?:\s*,\s*|\s+)(\d{1,3})(?:\s*,\s*|\s+)(\d{1,3})\s*(?=[,\/)])/i;

  function evalSpan(txt) {
    if (/var\(|env\(|calc\(/i.test(txt)) {
      const m = TW_RE.exec(txt);
      return m ? { r: +m[1], g: +m[2], b: +m[3], a: 1, tw: m } : null;
    }
    return CP.parseColor(txt);
  }

  function twRewrite(txt, m, n) {
    const comma = m[0].includes(',');
    const head = txt.slice(0, txt.indexOf('(') + 1);
    return head + (comma ? `${n.r}, ${n.g}, ${n.b}` : `${n.r} ${n.g} ${n.b} `) + txt.slice(m[0].length);
  }

  function tripletOf(p, v) {
    if (!p.startsWith('--') || NOT_COLOR_VAR.test(p)) return null;
    let m = v.match(/^\s*(\d+(?:\.\d+)?)(?:deg)?[\s,]+(\d+(?:\.\d+)?)%[\s,]+(\d+(?:\.\d+)?)%\s*$/);
    if (m) {
      const h = +m[1], s = +m[2] / 100, l = +m[3] / 100;
      const a = s * Math.min(l, 1 - l),
        f = (n) => {
          const k = (n + h / 30) % 12;
          return l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
        };
      return {
        rgb: { r: Math.round(f(0) * 255), g: Math.round(f(8) * 255), b: Math.round(f(4) * 255), a: 1 },
        format: (n) => {
          const r = n.r / 255, g = n.g / 255, b = n.b / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), L = (mx + mn) / 2;
          let H = 0, S = 0;
          if (mx !== mn) {
            const d = mx - mn;
            S = L > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
            H = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
            H *= 60;
          }
          return `${Math.round(H * 10) / 10} ${Math.round(S * 1000) / 10}% ${Math.round(L * 1000) / 10}%`;
        },
      };
    }
    m = v.match(/^\s*(\d{1,3})[\s,]+(\d{1,3})[\s,]+(\d{1,3})\s*$/);
    if (m && +m[1] <= 255 && +m[2] <= 255 && +m[3] <= 255) {
      return { rgb: { r: +m[1], g: +m[2], b: +m[3], a: 1 }, format: (n) => `${n.r} ${n.g} ${n.b}` };
    }
    return null;
  }

  function transformValue(p, v, res) {
    const t = tripletOf(p, v);
    if (t) {
      const n = res(t.rgb);
      return n ? t.format(n) : v;
    }
    const spans = colorSpans(v);
    if (!spans.length) return v;
    let out = v;
    for (let i = spans.length - 1; i >= 0; i--) {
      const [s, e] = spans[i], txt = v.slice(s, e), ev = evalSpan(txt);
      if (!ev || ev.a === 0) continue;
      const n = res(ev);
      if (!n) continue;
      out = out.slice(0, s) + (ev.tw ? twRewrite(txt, ev.tw, n) : CP.fmt(n, ev.a)) + out.slice(e);
    }
    return out;
  }

  function findColors(p, v) {
    const found = [];
    transformValue(p, v, (c) => {
      if (c.a > 0.02) found.push(CP.toHex(c));
      return null;
    });
    return found;
  }

  const SHADE_TOKENS = new Set(['dark', 'light', 'hover', 'active', 'focus', 'pressed', 'disabled', 'soft', 'tint', 'shade', 'subtle', 'lighter', 'darker', 'deep', 'pale']);

  function roleFromVarName(name) {
    const tokens = name.toLowerCase().replace(/^--/, '').replace(/([a-z])([A-Z])/g, '$1-$2').split(/[-_]+/).filter(Boolean);
    const has = (...ws) => ws.some((w) => tokens.includes(w));
    const conf = tokens.some((t) => SHADE_TOKENS.has(t) || /^\d{2,3}$/.test(t)) ? 0.55 : 1;
    if (has('on', 'contrast') && has('primary', 'secondary', 'accent', 'brand')) return null;
    if (has('foreground', 'fg', 'text', 'ink', 'heading', 'headings', 'copy')) {
      return { role: has('muted', 'subtle', 'secondary', 'tertiary', 'caption', 'placeholder', 'hint', 'faint', 'light') ? 'Muted text' : 'Text', conf };
    }
    if (has('border', 'divider', 'outline', 'ring', 'stroke', 'separator', 'hairline', 'line')) return { role: 'Border', conf };
    if (has('surface', 'card', 'panel', 'paper', 'popover', 'elevated', 'sheet', 'tile', 'modal', 'dialog', 'drawer', 'sidebar')) return { role: 'Surface', conf };
    if (has('background', 'bg', 'canvas', 'page', 'body', 'base', 'cream', 'ivory')) return { role: 'Background', conf };
    if (has('success', 'positive', 'valid', 'ok')) return { role: 'Success', conf };
    if (has('warning', 'caution', 'warn')) return { role: 'Warning', conf };
    if (has('danger', 'error', 'destructive', 'negative', 'invalid')) return { role: 'Danger', conf };
    if (has('primary', 'brand', 'main', 'theme', 'key', 'hero')) return { role: 'Primary', conf };
    if (has('secondary', 'alt', 'second')) return { role: 'Secondary', conf };
    if (has('accent', 'highlight', 'cta', 'action', 'link', 'emphasis', 'interactive')) return { role: 'Accent', conf };
    return null;
  }

  Object.assign(CP, {
    NAMED, COLOR_FUNCS, SKIP_PROP, COLORISH, NOT_COLOR_VAR,
    closeParen, colorSpans, evalSpan, twRewrite, tripletOf,
    transformValue, findColors, roleFromVarName,
  });
})();
