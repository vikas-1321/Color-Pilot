(() => {
  'use strict';
  const CP = (window.__CP = window.__CP || {});

  CP.ROLES = ['Primary', 'Secondary', 'Accent', 'Background', 'Surface', 'Text', 'Muted text', 'Border', 'Success', 'Warning', 'Danger', 'Other'];
  CP.HOST_ID = '__colorpilot_host__';

  CP.state = {
    masters: [],
    allClusters: [],
    records: [],
    elRecs: [],
    missed: [],
    blocked: 0,
    fetched: 0,
    follow: true,
    map: new Map(),
    lastCss: '',
    showAll: false,
    canvasHex: '#ffffff',
    varNames: new Set(),
    varUse: new Map(),
    themeColor: null,
    metaOrig: null,
    idc: 0,
    sheets: null,
    highlighted: [],
    mutatedVars: new Map(),
    isDark: false,
    isOpen: false,
    stats: { patched: 0 },
  };

  class Sheet {
    constructor() {
      this.cs = null;
      this.el = null;
      try {
        this.cs = new CSSStyleSheet();
        document.adoptedStyleSheets = [...document.adoptedStyleSheets, this.cs];
      } catch (e) {
        this.cs = null;
        this.el = document.createElement('style');
        this.el.setAttribute('data-colorpilot', '');
        (document.head || document.documentElement).appendChild(this.el);
      }
    }
    set(css) {
      if (this.cs) this.cs.replaceSync(css);
      else this.el.textContent = css;
    }
    remove() {
      if (this.cs) document.adoptedStyleSheets = document.adoptedStyleSheets.filter((s) => s !== this.cs);
      else this.el.remove();
    }
  }

  const ownSheets = new Set();
  CP.isOurs = (s) => ownSheets.has(s) || (s.ownerNode && s.ownerNode.hasAttribute && s.ownerNode.hasAttribute('data-colorpilot'));
  CP.newSheet = () => {
    const s = new Sheet();
    if (s.cs) ownSheets.add(s.cs);
    return s;
  };
  CP.Sheet = Sheet;

  CP.byRole = (r) => CP.state.masters.find((m) => m.role === r);
})();
