(() => {
  'use strict';
  const CP = (window.__CP = window.__CP || {});

  const CSS = `
:host{all:initial}
*{box-sizing:border-box;font-family:"Inter","Segoe UI",system-ui,-apple-system,sans-serif}
.panel{position:fixed;top:16px;right:16px;width:352px;max-height:calc(100vh - 32px);display:flex;flex-direction:column;background:#171a24;color:#e7e9f1;border:1px solid #2b3042;border-radius:16px;box-shadow:0 24px 60px rgba(8,10,20,.5);font-size:13px;line-height:1.4;overflow:hidden}
.hd{display:flex;align-items:center;gap:9px;padding:11px 12px 11px 14px;background:#1d2130;border-bottom:1px solid #2b3042;cursor:grab;user-select:none;touch-action:none}
.hd:active{cursor:grabbing}
.logo{width:18px;height:18px;border-radius:50%;background:conic-gradient(#ff5c7a 0 25%,#ffb84d 0 50%,#46d39a 0 75%,#6c8cff 0);flex:none;position:relative}
.logo::after{content:"";position:absolute;inset:6px;border-radius:50%;background:#1d2130}
.title{font-weight:650;font-size:14px}
.status{margin-left:auto;color:#8b92aa;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:120px}
button{font:inherit;color:inherit;cursor:pointer}
.ib{width:26px;height:26px;border:0;border-radius:8px;background:transparent;color:#9aa1b8;display:grid;place-items:center;font-size:16px;flex:none}
.ib:hover{background:#2a3047;color:#fff}
.seg{display:flex;gap:4px;padding:8px 10px 0}
.seg button{flex:1;border:0;border-radius:9px;background:transparent;color:#9aa1b8;padding:7px;font-weight:600}
.seg button.on{background:#2a3047;color:#fff}
.body{overflow:auto;padding:8px 10px 4px;scrollbar-width:thin;scrollbar-color:#3a4160 transparent}
.panel.min .body,.panel.min .ft,.panel.min .seg{display:none}
.list{display:flex;flex-direction:column;gap:2px}
.row{display:grid;grid-template-columns:40px 1fr 84px 24px;gap:10px;align-items:center;padding:6px;border-radius:12px;transition:background .15s}
.row:hover{background:#1e2233}
.row.flash{animation:fl 1.2s ease}
@keyframes fl{0%,60%{background:#2c3560}100%{background:transparent}}
.sw{position:relative;width:40px;height:40px;border-radius:12px;box-shadow:inset 0 0 0 1px rgba(255,255,255,.16),0 1px 2px rgba(0,0,0,.4);cursor:pointer;display:block;overflow:hidden}
.sw input{position:absolute;inset:-6px;width:60px;height:60px;opacity:0;cursor:pointer;border:0;padding:0}
.meta{min-width:0}
select{width:100%;max-width:140px;appearance:none;background-color:transparent;border:0;color:#e7e9f1;font-weight:600;font-size:13px;cursor:pointer;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M1 1l4 4 4-4' fill='none' stroke='%238b92aa' stroke-width='1.5'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 2px center;padding:0 16px 0 0}
select option{background:#1d2130;color:#e7e9f1}
.sub{color:#8b92aa;font-size:11.5px;margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hex{width:84px;background:#10131b;border:1px solid #2b3042;border-radius:8px;color:#e7e9f1;padding:6px 8px;font:12.5px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
.hex:focus,select:focus-visible,button:focus-visible{outline:2px solid #8ea2ff;outline-offset:1px}
.hex.bad{border-color:#e5586e}
.rst{visibility:hidden}
.more{width:100%;margin:6px 0 2px;padding:7px;border:1px dashed #343a54;border-radius:10px;background:transparent;color:#9aa1b8}
.more:hover{background:#1e2233;color:#fff}
.sec{margin:12px 4px 6px;color:#8b92aa;font-size:12px;font-weight:600}
.ct{display:flex;flex-direction:column;gap:5px;padding:0 4px}
.ctr{display:flex;align-items:center;gap:8px;font-size:12px;color:#c3c8da}
.ctr .pill{margin-left:auto;font-weight:650;border-radius:6px;padding:2px 7px;font-size:11.5px}
.ok{background:#173a2b;color:#5be0a4}.warn{background:#3d3217;color:#ffc861}.fail{background:#431c26;color:#ff7d93}
.opt{display:flex;align-items:center;gap:8px;padding:10px 4px 6px;color:#c3c8da;font-size:12.5px}
.opt input{accent-color:#8ea2ff}
.note{margin:4px 4px 6px;padding:8px 10px;border-radius:10px;background:#272114;color:#e8c883;font-size:12px}
.ft{display:flex;gap:6px;padding:10px;border-top:1px solid #2b3042;background:#1a1d2a}
.btn{flex:1;border:1px solid #343a54;background:#222740;border-radius:10px;padding:8px 6px;font-weight:600;font-size:12.5px}
.btn:hover{background:#2b3254}
.btn.pri{background:#8ea2ff;border-color:#8ea2ff;color:#10142a}
.btn.pri:hover{background:#a5b4ff}
.btn.sm{flex:none;padding:6px 10px}
.ov{position:absolute;inset:0;background:#171a24;display:flex;flex-direction:column;z-index:5}
.ov .ohd{display:flex;align-items:center;gap:8px;padding:10px 12px;border-bottom:1px solid #2b3042;background:#1d2130;font-weight:650}
.ov .obd{padding:12px;overflow:auto;display:flex;flex-direction:column;gap:10px;flex:1}
.tabs{display:flex;gap:4px;flex-wrap:wrap}
.tab{border:0;background:transparent;color:#9aa1b8;padding:5px 10px;border-radius:8px;font-weight:600;font-size:12.5px}
.tab.on{background:#2a3047;color:#fff}
textarea{flex:1;min-height:200px;resize:none;background:#10131b;color:#d4d9ee;border:1px solid #2b3042;border-radius:10px;padding:10px;font:12px/1.5 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
.trow{display:flex;align-items:center;gap:8px;padding:8px 10px;border:1px solid #2b3042;border-radius:10px}
.trow .nm{flex:1;font-weight:600}
.trow .dots{display:flex}
.trow .dots i{width:14px;height:14px;border-radius:50%;margin-left:-4px;box-shadow:0 0 0 2px #171a24}
.save{display:flex;gap:6px}
.save input{flex:1;background:#10131b;border:1px solid #2b3042;border-radius:8px;color:#e7e9f1;padding:8px 10px;font-size:13px}
.empty{color:#8b92aa;padding:8px 2px}
.toast{position:absolute;left:50%;bottom:62px;transform:translateX(-50%);background:#e7e9f1;color:#10142a;border-radius:10px;padding:7px 12px;font-weight:600;font-size:12.5px;z-index:9;pointer-events:none;white-space:nowrap}
/* wheel */
.wtop{display:flex;gap:6px;align-items:center;padding:2px 4px 8px}
.wtop select{flex:1;max-width:none;background-color:#1d2130;border:1px solid #343a54;border-radius:9px;padding:7px 24px 7px 10px;background-position:right 9px center}
.wbox{position:relative;width:216px;height:216px;margin:2px auto 8px;touch-action:none;user-select:none}
.wbox canvas{position:absolute;inset:0;width:216px;height:216px;border-radius:50%;box-shadow:0 0 0 1px rgba(255,255,255,.12),0 8px 24px rgba(0,0,0,.4)}
.wbox svg{position:absolute;inset:0;pointer-events:none}
.hdl{position:absolute;width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,.55),0 2px 8px rgba(0,0,0,.55);cursor:grab}
.hdl.sel{width:30px;height:30px;margin:-15px 0 0 -15px}
.hdl.off{opacity:.5;border-style:dashed}
.bright{display:flex;align-items:center;gap:10px;padding:0 4px 8px;color:#c3c8da;font-size:12px}
.bright input{flex:1;appearance:none;height:10px;border-radius:6px;outline:none}
.bright input::-webkit-slider-thumb{appearance:none;width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:0 0 0 1px rgba(0,0,0,.5),0 2px 5px rgba(0,0,0,.5);cursor:pointer}
.hrow{display:grid;grid-template-columns:26px 78px 1fr;gap:10px;align-items:center;padding:5px 6px;border-radius:10px;cursor:pointer;border:1px solid transparent}
.hrow:hover{background:#1e2233}
.hrow.sel{border-color:#3d4670;background:#1e2233}
.hrow .dot{width:26px;height:26px;border-radius:8px;box-shadow:inset 0 0 0 1px rgba(255,255,255,.16)}
.hrow .hx{font:12.5px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:#c3c8da}
.hrow.off .dot{opacity:.45}
/* suggestions */
.sg-wrap{display:flex;flex-direction:column;gap:8px;padding:2px 2px 6px}
.sg-hero{padding:9px 11px;background:#1b2030;border-radius:10px;border:1px solid #293046;font-size:12px;color:#c0c7dd;line-height:1.4}
.sg-hero b{color:#fff}
.sg-filters{display:flex;gap:4px;overflow-x:auto;padding-bottom:3px;scrollbar-width:none}
.sg-filters::-webkit-scrollbar{display:none}
.sg-filter{border:0;background:#191d2c;color:#8f96af;padding:4px 9px;border-radius:7px;font-size:11.5px;font-weight:600;white-space:nowrap;cursor:pointer;transition:all .15s}
.sg-filter.on{background:#2e3656;color:#fff}
.sg-list{display:flex;flex-direction:column;gap:7px}
.sg-card{background:#151822;border:1px solid #272d3e;border-radius:12px;padding:9px 10px;display:flex;flex-direction:column;gap:6px;transition:all .15s}
.sg-card:hover{border-color:#3d486b;background:#1a1e2d}
.sg-head{display:flex;align-items:center;gap:6px}
.sg-name{font-weight:650;font-size:12.5px;color:#e7e9f1;flex:1}
.sg-tag{font-size:10.5px;padding:2px 6px;border-radius:5px;background:#242a3f;color:#8ea2ff;font-weight:600}
.sg-desc{font-size:11px;color:#8b93ad}
.sg-palette{display:flex;gap:5px;align-items:center;margin-top:2px}
.sg-chips{display:flex;gap:4px;flex:1}
.sg-chip{flex:1;height:24px;border-radius:6px;box-shadow:inset 0 0 0 1px rgba(255,255,255,.14),0 1px 2px rgba(0,0,0,.3);cursor:help}
.sg-apply{flex:none;padding:4px 10px;font-size:11.5px}
`;

  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (k === 'class') el.className = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else if (k === 'value' || k === 'checked' || k === 'selected') el[k] = v;
      else el.setAttribute(k, v);
    }
    for (const k of kids.flat()) if (k != null) el.append(k.nodeType ? k : document.createTextNode(k));
    return el;
  }
  const svgEl = (tag, attrs) => {
    const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [k, v] of Object.entries(attrs || {})) e.setAttribute(k, v);
    return e;
  };

  const host = h('div', { id: CP.HOST_ID });
  host.style.cssText = 'all:initial;position:fixed;z-index:2147483647;top:0;left:0;';
  const root = host.attachShadow({ mode: 'open' });
  const styleEl = h('style'); styleEl.textContent = CSS;
  const statusEl = h('span', { class: 'status' }, 'Scanning...');
  const listEl = h('div', { class: 'list' });
  const ctEl = h('div', { class: 'ct' });
  const noteEl = h('div', { class: 'note', style: 'display:none' });
  const bodyEl = h('div', { class: 'body' });
  const panel = h('div', { class: 'panel' });
  let toastTimer = 0;

  function toast(msg) {
    root.querySelectorAll('.toast').forEach((t) => t.remove());
    const t = h('div', { class: 'toast' }, msg);
    panel.appendChild(t);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.remove(), 1800);
  }

  function setStatus(text) {
    if (typeof text === 'string') {
      statusEl.textContent = text;
      return;
    }
    const p = CP.state.stats ? CP.state.stats.patched : 0;
    statusEl.textContent = `${CP.state.masters.length} colors` + (p ? ` \u00B7 ${p} patched` : '');
  }

  /* ---------- palette rows ---------- */
  function rowFor(m) {
    const picker = h('input', { type: 'color', value: m.cur });
    const sw = h('label', { class: 'sw' }, picker);
    const sel = h('select', { 'aria-label': 'Role' }, CP.ROLES.map((r) => h('option', { value: r, selected: r === m.role }, r)));
    const sub = h('div', { class: 'sub' });
    const hex = h('input', { class: 'hex', value: m.cur, spellcheck: 'false', maxlength: '7', 'aria-label': 'Hex value' });
    const rst = h('button', { class: 'ib rst', title: 'Reset this color' }, '\u21BA');
    const row = h('div', { class: 'row', title: m.why.join('\n') }, sw, h('div', { class: 'meta' }, sel, sub), hex, rst);
    m.ui = { row, picker, sw, hex, sub, rst, sel };

    picker.addEventListener('input', () => setColor(m, picker.value));
    hex.addEventListener('input', () => {
      const nh = CP.normHex(hex.value);
      hex.classList.toggle('bad', !nh);
      if (nh) setColor(m, nh, true);
    });
    hex.addEventListener('blur', () => {
      hex.value = m.cur;
      hex.classList.remove('bad');
    });
    sel.addEventListener('change', () => {
      m.role = sel.value;
      updateContrast();
      syncWheelFromPage();
    });
    rst.addEventListener('click', () => setColor(m, m.orig));
    row.addEventListener('pointerenter', () => CP.highlightCluster(m));
    row.addEventListener('pointerleave', () => CP.clearHighlight());
    refreshRow(m);
    return row;
  }

  function refreshRow(m, skipHex) {
    const u = m.ui; if (!u) return;
    u.picker.value = m.cur; u.sw.style.background = m.cur;
    if (!skipHex) u.hex.value = m.cur;
    u.rst.style.visibility = m.cur !== m.orig ? 'visible' : 'hidden';
    const uses = Math.round(m.agg.total);
    const v = m.vars.length ? ` \u00B7 ${m.vars[0].name}` : '';
    u.sub.textContent = `${uses} uses` + (m.sats.length && CP.state.follow ? ` \u00B7 +${m.sats.length} shade${m.sats.length > 1 ? 's' : ''}` : '') + v;
  }

  function setColor(m, hex, skipHex) {
    m.cur = hex;
    refreshRow(m, skipHex);
    CP.scheduleApply();
  }

  function renderList() {
    listEl.textContent = '';
    CP.state.masters.forEach((m) => { m.ui = null; });
    if (!CP.state.masters.length) {
      listEl.append(h('div', { class: 'empty' }, 'No colors found on this page.'));
      return;
    }
    const shown = CP.state.showAll ? CP.state.masters : CP.state.masters.slice(0, 10);
    shown.forEach((m) => listEl.appendChild(rowFor(m)));
    if (CP.state.masters.length > 10) {
      listEl.appendChild(h('button', {
        class: 'more',
        onclick: () => { CP.state.showAll = !CP.state.showAll; renderList(); },
      }, CP.state.showAll ? 'Show fewer' : `Show ${CP.state.masters.length - 10} more colors`));
    }
  }

  const refreshAll = () => CP.state.masters.forEach((m) => refreshRow(m));

  function updateContrast() {
    ctEl.textContent = '';
    const bg = CP.byRole('Background') || CP.byRole('Surface');
    let n = 0;
    for (const [label, a] of [['Text on background', CP.byRole('Text')], ['Primary on background', CP.byRole('Primary')]]) {
      if (!a || !bg) continue;
      n++;
      const ratio = CP.contrast(CP.parseColor(a.cur), CP.parseColor(bg.cur));
      ctEl.appendChild(h('div', { class: 'ctr' }, label, h('span', { class: 'pill ' + (ratio >= 4.5 ? 'ok' : ratio >= 3 ? 'warn' : 'fail') }, `${ratio.toFixed(1)}:1 \u00B7 ${ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : ratio >= 3 ? 'Large text only' : 'Fails'}`)));
    }
    if (!n) ctEl.appendChild(h('div', { class: 'empty' }, 'Assign Text and Background roles to see contrast.'));
  }

  /* ---------- COLOR WHEEL ---------- */
  const RULES = {
    Free: null,
    Analogous: [[0, 1, 1], [30, 1, 1], [-30, 1, 1], [60, .9, 1], [-60, .9, 1]],
    Monochromatic: [[0, 1, 1], [0, .55, 1], [0, .9, .7], [0, .4, .55], [0, .25, 1]],
    Triad: [[0, 1, 1], [120, 1, 1], [240, 1, 1], [120, .6, 1], [240, .6, 1]],
    Complementary: [[0, 1, 1], [180, 1, 1], [0, .6, 1], [180, .6, 1], [0, .8, .7]],
    'Split complementary': [[0, 1, 1], [150, 1, 1], [210, 1, 1], [150, .6, 1], [210, .6, 1]],
    Square: [[0, 1, 1], [90, 1, 1], [180, 1, 1], [270, 1, 1], [0, .6, 1]],
    Compound: [[0, 1, 1], [30, 1, 1], [180, 1, 1], [210, 1, 1], [330, 1, .9]],
    Shades: [[0, 1, 1], [0, 1, .8], [0, 1, .6], [0, 1, .4], [0, 1, .2]],
  };
  const W = {
    rule: 'Free', sel: 0, size: 216, base: { h: 150, s: 0.5, v: 0.5 },
    hs: ['Primary', 'Secondary', 'Accent', 'Surface', 'Background'].map((r, i) => ({ role: i < 3 ? r : '', h: 0, s: 0.5, v: 0.6, dfl: r })),
    built: false,
  };
  const wheelBox = h('div', { class: 'wbox' });
  const wheelCanvas = h('canvas');
  const wheelSvg = svgEl('svg', { width: W.size, height: W.size });
  const handleEls = [];
  const brightIn = h('input', { type: 'range', min: '0', max: '100', value: '60', 'aria-label': 'Brightness' });
  const brightVal = h('span', {}, '60%');
  const hrowsEl = h('div', { style: 'display:flex;flex-direction:column;gap:2px' });
  const ruleSel = h('select', { 'aria-label': 'Harmony rule' }, Object.keys(RULES).map((k) => h('option', { value: k }, k)));
  const wheelView = h('div', { style: 'display:none' });
  let wheelData = null;

  function drawWheel() {
    const dpr = Math.min(2, window.devicePixelRatio || 1), S = Math.round(W.size * dpr), R = S / 2;
    if (wheelCanvas.width !== S) { wheelCanvas.width = S; wheelCanvas.height = S; wheelData = null; }
    const g = wheelCanvas.getContext('2d');
    if (!wheelData) {
      wheelData = { hue: new Float32Array(S * S), sat: new Float32Array(S * S), a: new Uint8ClampedArray(S * S) };
      for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
        const dx = x + 0.5 - R, dy = y + 0.5 - R, d = Math.hypot(dx, dy), i = y * S + x;
        wheelData.hue[i] = ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360;
        wheelData.sat[i] = Math.min(1, d / R);
        wheelData.a[i] = d > R ? 0 : d > R - 1.5 ? Math.round(((R - d) / 1.5) * 255) : 255;
      }
    }
    const v = currentV(), img = g.createImageData(S, S), D = img.data;
    for (let i = 0; i < S * S; i++) {
      if (!wheelData.a[i]) continue;
      const c = CP.hsv2rgb(wheelData.hue[i], wheelData.sat[i], v);
      D[i * 4] = c.r; D[i * 4 + 1] = c.g; D[i * 4 + 2] = c.b; D[i * 4 + 3] = wheelData.a[i];
    }
    g.putImageData(img, 0, 0);
  }
  const defOf = (i) => (RULES[W.rule] ? RULES[W.rule][i] : null);
  function handleHsv(i) {
    const d = defOf(i);
    if (!d) return W.hs[i];
    return { h: (W.base.h + d[0] + 360) % 360, s: CP.clamp(W.base.s * d[1]), v: CP.clamp(W.base.v * d[2]) };
  }
  const currentV = () => handleHsv(W.sel).v;
  const handleHex = (i) => CP.toHex(CP.hsv2rgb(handleHsv(i).h, handleHsv(i).s, handleHsv(i).v));

  function layoutWheel(redraw = true) {
    const R = W.size / 2;
    wheelSvg.textContent = '';
    for (let i = 0; i < 5; i++) {
      const c = handleHsv(i), rad = (c.h * Math.PI) / 180, x = R + Math.cos(rad) * c.s * R, y = R + Math.sin(rad) * c.s * R;
      const el = handleEls[i];
      el.style.left = x + 'px'; el.style.top = y + 'px'; el.style.background = handleHex(i);
      el.classList.toggle('sel', i === W.sel); el.classList.toggle('off', !W.hs[i].role);
      wheelSvg.appendChild(svgEl('line', { x1: R, y1: R, x2: x, y2: y, stroke: 'rgba(255,255,255,.35)', 'stroke-width': 1 }));
      const row = hrowsEl.children[i];
      if (row) { row.classList.toggle('sel', i === W.sel); row.classList.toggle('off', !W.hs[i].role); row.querySelector('.dot').style.background = handleHex(i); row.querySelector('.hx').textContent = handleHex(i); }
    }
    const v = currentV(), s = handleHsv(W.sel);
    brightIn.value = Math.round(v * 100); brightVal.textContent = Math.round(v * 100) + '%';
    brightIn.style.background = `linear-gradient(90deg,#000,${CP.toHex(CP.hsv2rgb(s.h, s.s, 1))})`;
    if (redraw) drawWheel();
  }

  function pushWheel() {
    W.hs.forEach((hd, i) => { if (!hd.role) return; const m = CP.byRole(hd.role); if (m) setColor(m, handleHex(i)); });
  }
  function syncWheelFromPage() {
    if (!W.built) return;
    W.hs.forEach((hd) => { const m = hd.role && CP.byRole(hd.role); if (m) Object.assign(hd, CP.rgb2hsv(CP.parseColor(m.cur))); });
    if (RULES[W.rule]) { const p = W.hs[0]; W.base = { h: p.h, s: p.s, v: p.v }; }
    layoutWheel();
  }
  function setRule(name) {
    if (RULES[name]) {
      const m = W.hs[0].role && CP.byRole(W.hs[0].role);
      const src = m ? CP.rgb2hsv(CP.parseColor(m.cur)) : W.hs[0];
      W.base = { h: src.h, s: Math.max(0.15, src.s), v: Math.max(0.2, src.v) };
    } else W.hs.forEach((hd, i) => Object.assign(hd, handleHsv(i)));
    if (W.rule !== 'Free' && name === 'Free') W.hs.forEach((hd, i) => Object.assign(hd, handleHsv(i)));
    W.rule = name; ruleSel.value = name;
    layoutWheel(); if (name !== 'Free') pushWheel();
  }
  function dragTo(clientX, clientY) {
    const r = wheelBox.getBoundingClientRect(), R = W.size / 2;
    const dx = clientX - r.left - R, dy = clientY - r.top - R;
    const hue = ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360, sat = Math.min(1, Math.hypot(dx, dy) / R), i = W.sel, d = defOf(i);
    if (d) { W.base.h = (hue - d[0] + 360) % 360; W.base.s = d[1] > 0 ? CP.clamp(sat / d[1]) : W.base.s; }
    else { W.hs[i].h = hue; W.hs[i].s = sat; }
    layoutWheel(false); pushWheel();
  }
  function buildWheel() {
    for (let i = 0; i < 5; i++) { const el = h('div', { class: 'hdl' }); handleEls.push(el); }
    wheelBox.append(wheelCanvas, wheelSvg, ...handleEls);
    wheelBox.addEventListener('pointerdown', (e) => {
      let best = -1, bd = 22;
      handleEls.forEach((el, i) => { const b = el.getBoundingClientRect(), d = Math.hypot(e.clientX - (b.left + b.width / 2), e.clientY - (b.top + b.height / 2)); if (d < bd) { bd = d; best = i; } });
      if (best >= 0) { W.sel = best; layoutWheel(); }
      wheelBox.setPointerCapture(e.pointerId);
      const mv = (ev) => dragTo(ev.clientX, ev.clientY);
      const up = () => { wheelBox.removeEventListener('pointermove', mv); wheelBox.removeEventListener('pointerup', up); layoutWheel(); };
      wheelBox.addEventListener('pointermove', mv); wheelBox.addEventListener('pointerup', up);
      if (best < 0) dragTo(e.clientX, e.clientY);
    });
    brightIn.addEventListener('input', () => {
      const v = brightIn.value / 100, d = defOf(W.sel);
      if (d) W.base.v = d[2] > 0 ? CP.clamp(v / d[2]) : W.base.v; else W.hs[W.sel].v = v;
      layoutWheel(); pushWheel();
    });
    ruleSel.addEventListener('change', () => setRule(ruleSel.value));
    for (let i = 0; i < 5; i++) {
      const sel = h('select', { 'aria-label': 'Linked role' }, [h('option', { value: '' }, 'Not linked'), ...CP.ROLES.filter((r) => r !== 'Other').map((r) => h('option', { value: r, selected: r === W.hs[i].role }, r))]);
      sel.value = W.hs[i].role;
      sel.addEventListener('click', (e) => e.stopPropagation());
      sel.addEventListener('change', () => { W.hs[i].role = sel.value; if (sel.value) { const m = CP.byRole(sel.value); if (m && !RULES[W.rule]) Object.assign(W.hs[i], CP.rgb2hsv(CP.parseColor(m.cur))); } layoutWheel(false); pushWheel(); });
      const row = h('div', { class: 'hrow', onclick: () => { W.sel = i; layoutWheel(); } }, h('span', { class: 'dot' }), h('span', { class: 'hx' }), sel);
      hrowsEl.appendChild(row);
    }
    wheelView.append(
      h('div', { class: 'wtop' }, ruleSel,
        h('button', { class: 'btn sm', title: 'Random harmony', onclick: () => { const names = Object.keys(RULES).filter((k) => k !== 'Free'); W.rule = names[Math.floor(Math.random() * names.length)]; ruleSel.value = W.rule; W.base = { h: Math.random() * 360, s: 0.45 + Math.random() * 0.4, v: 0.4 + Math.random() * 0.4 }; layoutWheel(); pushWheel(); } }, 'Random'),
        h('button', { class: 'btn sm', title: 'Read colors from the page', onclick: () => { W.rule = 'Free'; ruleSel.value = 'Free'; syncWheelFromPage(); toast('Wheel synced'); } }, 'Sync')),
      wheelBox,
      h('div', { class: 'bright' }, 'Brightness', brightIn, brightVal),
      h('div', { class: 'sec', style: 'margin-top:2px' }, 'Linked colors (drag any handle to move them all)'),
      hrowsEl);
    W.built = true;
  }

  /* ---------- views ---------- */
  const paletteView = h('div', {});
  const suggestView = h('div', { class: 'sg-wrap', style: 'display:none' });
  const segPalette = h('button', { class: 'on', onclick: () => showView('palette') }, 'Palette');
  const segWheel = h('button', { onclick: () => showView('wheel') }, 'Color wheel');
  const segSuggest = h('button', { onclick: () => showView('suggest') }, 'Suggestions');
  let currentFilter = 'All';

  function showView(v) {
    segPalette.classList.toggle('on', v === 'palette');
    segWheel.classList.toggle('on', v === 'wheel');
    segSuggest.classList.toggle('on', v === 'suggest');
    paletteView.style.display = v === 'palette' ? '' : 'none';
    wheelView.style.display = v === 'wheel' ? '' : 'none';
    suggestView.style.display = v === 'suggest' ? '' : 'none';
    if (v === 'wheel') { if (!W.built) buildWheel(); syncWheelFromPage(); }
    if (v === 'suggest') renderSuggestions();
  }

  function renderSuggestions() {
    suggestView.textContent = '';
    const isDark = CP.detectMode();
    const pri = CP.byRole('Primary');
    const hero = h('div', { class: 'sg-hero' },
      h('div', {}, 'Suggested for this ', h('b', {}, isDark ? 'Dark mode' : 'Light mode'), ' UI:'),
      h('div', { style: 'font-size:11px;color:#8f96af;margin-top:2px' },
        pri ? `Anchored on primary: ${pri.cur}` : 'Select templates to recolor live'));

    const cats = ['All', 'Harmonic', 'Modern Tech', 'Warm & Bold', 'Vibrant', 'Minimalist'];
    const filterRow = h('div', { class: 'sg-filters' });
    cats.forEach((cat) => {
      const b = h('button', {
        class: 'sg-filter' + (currentFilter === cat ? ' on' : ''),
        onclick: () => { currentFilter = cat; renderSuggestions(); },
      }, cat);
      filterRow.appendChild(b);
    });

    const all = CP.getSuggestions();
    const list = h('div', { class: 'sg-list' });
    const filtered = currentFilter === 'All' ? all : all.filter((s) => s.cat === currentFilter);

    filtered.forEach((tpl) => {
      const chips = h('div', { class: 'sg-chips' });
      for (const [role, hex] of Object.entries(tpl.roles)) {
        chips.appendChild(h('div', { class: 'sg-chip', style: `background:${hex}`, title: `${role}: ${hex}` }));
      }
      const applyBtn = h('button', { class: 'btn pri sg-apply', onclick: () => CP.applyTemplate(tpl) }, 'Apply');
      const card = h('div', { class: 'sg-card' },
        h('div', { class: 'sg-head' },
          h('span', { class: 'sg-name' }, tpl.name),
          h('span', { class: 'sg-tag' }, tpl.tag),
          applyBtn),
        h('div', { class: 'sg-desc' }, tpl.desc),
        h('div', { class: 'sg-palette' }, chips));
      list.appendChild(card);
    });

    suggestView.append(hero, filterRow, list);
  }

  /* ---------- overlays ---------- */
  function openOverlay(title, content) {
    closeOverlay();
    panel.appendChild(h('div', { class: 'ov', id: 'ov' }, h('div', { class: 'ohd' }, h('button', { class: 'ib', title: 'Back', onclick: closeOverlay }, '\u2190'), title), h('div', { class: 'obd' }, content)));
  }
  const closeOverlay = () => { const o = panel.querySelector('#ov'); if (o) o.remove(); };
  const copy = async (text) => {
    try { await navigator.clipboard.writeText(text); toast('Copied'); }
    catch (e) {
      const t = panel.querySelector('textarea');
      if (t) { t.select(); document.execCommand('copy'); toast('Copied'); }
    }
  };

  function exportNames() {
    const used = new Map();
    return CP.state.masters.slice(0, 20).map((m) => {
      const base = m.role.toLowerCase().replace(/\s+/g, '-'), k = used.get(base) || 0;
      used.set(base, k + 1);
      return { m, name: k ? `${base}-${k + 1}` : base };
    });
  }
  const EXPORTS = {
    'CSS variables': () => ':root {\n' + exportNames().map(({ m, name }) => `  --color-${name}: ${m.cur};`).join('\n') + '\n}',
    Tailwind: () => '// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n' + exportNames().map(({ m, name }) => `        '${name}': '${m.cur}',`).join('\n') + '\n      },\n    },\n  },\n};',
    'Old \u2192 new': () => JSON.stringify(Object.fromEntries(CP.state.masters.filter((m) => m.cur !== m.orig).map((m) => [m.orig, m.cur])), null, 2),
    'Override CSS': () => (CP.state.lastCss || '/* no changes yet */') + (CP.state.missed.length ? `\n/* + ${CP.state.missed.length} per-element patches */` : ''),
  };
  function openExport() {
    const ta = h('textarea', { readonly: '', spellcheck: 'false' }), tabs = h('div', { class: 'tabs' });
    const show = (k) => { ta.value = EXPORTS[k](); tabs.querySelectorAll('.tab').forEach((t) => t.classList.toggle('on', t.textContent === k)); };
    Object.keys(EXPORTS).forEach((k) => tabs.appendChild(h('button', { class: 'tab', onclick: () => show(k) }, k)));
    openOverlay('Export', [tabs, ta, h('button', { class: 'btn pri', style: 'flex:none', onclick: () => copy(ta.value) }, 'Copy to clipboard')]);
    show(Object.keys(EXPORTS)[0]);
  }

  const GLOBAL_THEMES_KEY = 'colorpilot_global_themes';
  const store = {
    get: () => new Promise((res) => {
      try {
        chrome.storage.local.get([GLOBAL_THEMES_KEY, 'colorpilot:' + location.origin], (v) => {
          const globalThemes = (v && v[GLOBAL_THEMES_KEY]) || {};
          const legacyThemes = (v && v['colorpilot:' + location.origin]) || {};
          res({ ...legacyThemes, ...globalThemes });
        });
      } catch (e) { res({}); }
    }),
    set: (o) => new Promise((res) => {
      try { chrome.storage.local.set({ [GLOBAL_THEMES_KEY]: o }, res); }
      catch (e) { res(); }
    }),
  };

  function getThemeDots(t) {
    if (!t) return [];
    if (Array.isArray(t)) return t.map(([, to]) => to);
    if (Array.isArray(t.palette) && t.palette.length) return t.palette;
    if (t.roles) return Object.values(t.roles);
    if (Array.isArray(t.pairs)) return t.pairs.map(([, to]) => to);
    return [];
  }

  async function openThemes() {
    const themes = await store.get();
    const nameIn = h('input', { placeholder: 'Theme name (e.g. Modern Indigo, Warm Gold)', maxlength: '40' });
    const box = h('div', { style: 'display:flex;flex-direction:column;gap:8px' });

    const applyTheme = (t) => {
      let appliedCount = 0;
      const themeObj = Array.isArray(t) ? { pairs: t, roles: {} } : t;

      // 1. Semantic role application across any website
      if (themeObj.roles && typeof themeObj.roles === 'object') {
        for (const [role, hex] of Object.entries(themeObj.roles)) {
          const m = CP.byRole(role);
          if (m && hex) {
            setColor(m, hex);
            appliedCount++;
          }
        }
      }

      // 2. Exact original hex pair matching (for same website/elements)
      if (Array.isArray(themeObj.pairs)) {
        for (const [from, to] of themeObj.pairs) {
          const m = CP.state.masters.find((x) => x.orig === from);
          if (m && to) {
            setColor(m, to);
            appliedCount++;
          }
        }
      }

      // 3. Fallback: If no roles matched on this site, map palette colors to top masters
      if (!appliedCount) {
        const dots = getThemeDots(t);
        const targetMasters = CP.state.masters.slice(0, dots.length);
        targetMasters.forEach((m, idx) => {
          if (dots[idx]) {
            setColor(m, dots[idx]);
            appliedCount++;
          }
        });
      }

      closeOverlay();
      toast('Theme applied to this page');
      syncWheelFromPage();
      CP.applyAll();
    };

    const draw = () => {
      box.textContent = '';
      const keys = Object.keys(themes);
      if (!keys.length) {
        box.append(h('div', { class: 'empty' }, 'No saved themes yet. Change some colors and click "Save current" to save a theme for all websites.'));
        return;
      }
      keys.forEach((k) => {
        const t = themes[k];
        const dots = getThemeDots(t);
        const dotEls = dots.slice(0, 6).map((c) => h('i', { style: `background:${c}` }));
        box.appendChild(h('div', { class: 'trow' },
          h('span', { class: 'nm' }, k),
          h('div', { class: 'dots' }, dotEls),
          h('button', { class: 'btn sm', onclick: () => applyTheme(t) }, 'Apply'),
          h('button', { class: 'ib', title: 'Delete theme', onclick: async () => {
            delete themes[k];
            await store.set(themes);
            draw();
            toast('Theme deleted');
          } }, '\u00D7')));
      });
    };

    const save = async () => {
      const name = nameIn.value.trim();
      if (!name) { toast('Enter a theme name'); return; }
      const changedMasters = CP.state.masters.filter((m) => m.cur !== m.orig);
      if (!changedMasters.length) { toast('Change a color first'); return; }

      const roles = {};
      for (const m of changedMasters) {
        if (m.role && m.role !== 'Other') roles[m.role] = m.cur;
      }
      for (const m of CP.state.masters) {
        if (m.role && m.role !== 'Other' && !roles[m.role]) {
          roles[m.role] = m.cur;
        }
      }
      const pairs = changedMasters.map((m) => [m.orig, m.cur]);
      const palette = Array.from(new Set(changedMasters.map((m) => m.cur)));

      themes[name] = {
        name,
        roles,
        pairs,
        palette,
        createdAt: Date.now(),
      };
      await store.set(themes);
      nameIn.value = '';
      draw();
      toast('Theme saved for all websites');
    };

    draw();
    openOverlay('Saved themes (All websites)', [
      h('div', { class: 'save' }, nameIn, h('button', { class: 'btn pri sm', onclick: save }, 'Save current')),
      box,
    ]);
  }

  async function pickFromPage() {
    if (!window.EyeDropper) { toast('Eyedropper not supported in this browser'); return; }
    try {
      const c = CP.parseColor((await new EyeDropper().open()).sRGBHex);
      let best = null, bd = Infinity; const lab = CP.toLch(c);
      CP.state.masters.forEach((m) => { const d = CP.labDist(CP.toLch(CP.parseColor(m.cur)), lab); if (d < bd) { bd = d; best = m; } });
      if (!best) return;
      if (!best.ui) { CP.state.showAll = true; renderList(); }
      best.ui.row.scrollIntoView({ block: 'center', behavior: 'smooth' });
      best.ui.row.classList.remove('flash'); void best.ui.row.offsetWidth; best.ui.row.classList.add('flash');
    } catch (e) {}
  }

  function resetAll() {
    CP.state.masters.forEach((m) => { m.cur = m.orig; });
    CP.clearOverrides();
    if (typeof CP.removeDomainState === 'function') {
      CP.removeDomainState();
    }
    CP.applyAll();
    refreshAll();
    syncWheelFromPage();
  }

  function updateThemeBtn() {
    if (!themeBtn) return;
    const isDark = CP.detectMode();
    CP.state.isDark = isDark;
    themeBtn.textContent = isDark ? '\u2600\uFE0F' : '\uD83C\uDF19';
    themeBtn.title = isDark ? 'Switch to Light mode' : 'Switch to Dark mode';
  }

  const followCb = h('input', { type: 'checkbox', checked: true, id: 'follow' });
  followCb.addEventListener('change', () => { CP.state.follow = followCb.checked; refreshAll(); CP.scheduleApply(); });
  const themeBtn = h('button', { class: 'ib', title: 'Toggle Dark/Light mode', onclick: () => CP.toggleThemeMode(CP.rescan) }, '\uD83C\uDF19');
  const eyedropperBtn = h('button', { class: 'ib', title: 'Pick a color from the page', onclick: pickFromPage }, '\u25CE');
  const minBtn = h('button', { class: 'ib', title: 'Minimize', onclick: () => { panel.classList.toggle('min'); minBtn.textContent = panel.classList.contains('min') ? '+' : '\u2013'; } }, '\u2013');
  const hd = h('div', { class: 'hd' }, h('span', { class: 'logo' }), h('span', { class: 'title' }, 'ColorPilot'), statusEl,
    themeBtn, eyedropperBtn, minBtn,
    h('button', { class: 'ib', title: 'Hide (Alt+Shift+C to show)', onclick: () => toggle(false) }, '\u00D7'));

  paletteView.append(noteEl, listEl, h('div', { class: 'sec' }, 'Contrast'), ctEl,
    h('label', { class: 'opt', for: 'follow' }, followCb, 'Keep hover and dark shades in sync with their color'));
  bodyEl.append(paletteView, wheelView, suggestView);
  const ft = h('div', { class: 'ft' },
    h('button', { class: 'btn', onclick: () => CP.rescan() }, 'Rescan'),
    h('button', { class: 'btn', onclick: () => { resetAll(); toast('Reset to original'); } }, 'Reset'),
    h('button', { class: 'btn', onclick: openThemes }, 'Themes'),
    h('button', { class: 'btn pri', onclick: openExport }, 'Export'));
  panel.append(hd, h('div', { class: 'seg' }, segPalette, segWheel, segSuggest), bodyEl, ft);
  root.append(styleEl, panel);

  const pxClamp = (v, a, b) => Math.min(b, Math.max(a, v));
  hd.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button')) return;
    const r = panel.getBoundingClientRect(), dx = e.clientX - r.left, dy = e.clientY - r.top;
    hd.setPointerCapture(e.pointerId);
    const move = (ev) => {
      panel.style.right = 'auto';
      panel.style.left = pxClamp(ev.clientX - dx, 0, innerWidth - 80) + 'px';
      panel.style.top = pxClamp(ev.clientY - dy, 0, innerHeight - 40) + 'px';
    };
    const up = () => { hd.removeEventListener('pointermove', move); hd.removeEventListener('pointerup', up); };
    hd.addEventListener('pointermove', move); hd.addEventListener('pointerup', up);
  });

  function toggle(force) {
    const show = typeof force === 'boolean' ? force : host.style.display === 'none';
    host.style.display = show ? '' : 'none';
    CP.state.isOpen = show;
    if (typeof CP.scheduleSaveDomain === 'function') {
      CP.scheduleSaveDomain();
    }
  }

  function mountUI() {
    if (!document.getElementById(CP.HOST_ID)) {
      document.documentElement.appendChild(host);
    }
  }

  Object.assign(CP, {
    h, svgEl, toast, setStatus, refreshRow, setColor, renderList, refreshAll,
    updateContrast, syncWheelFromPage, renderSuggestions, showView, toggle,
    mountUI, updateThemeBtn, noteEl, statusEl, listEl, segSuggest,
  });
})();
