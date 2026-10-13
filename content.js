(() => {
  'use strict';
  const TEST = typeof globalThis.__CP_TEST !== 'undefined';
  if (!TEST && window.__colorPilot) {
    window.__colorPilot.toggle();
    return;
  }

  const CP = window.__CP;
  if (!CP) {
    console.error('[ColorPilot] Modules not loaded.');
    return;
  }

  async function init() {
    CP.setStatus('Scanning...');
    try {
      if (!CP.state.sheets) {
        CP.state.sheets = { rules: CP.newSheet(), patch: CP.newSheet(), highlight: CP.newSheet() };
      }
      const stats = await CP.scanPage();
      CP.state.masters = CP.buildClusters(stats);
      CP.collectHints();
      CP.detectRoles(CP.state.masters);
      const head = ['Primary', 'Secondary', 'Accent', 'Background', 'Surface', 'Text', 'Muted text', 'Border', 'Success', 'Warning', 'Danger'];
      CP.state.masters.sort((a, b) => {
        const ia = head.indexOf(a.role), ib = head.indexOf(b.role);
        return ia !== ib ? (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) : b.agg.total - a.agg.total;
      });
      if (typeof CP.loadDomainState === 'function') {
        await CP.loadDomainState();
      }
      CP.renderList();
      CP.updateContrast();
      CP.setStatus();
      CP.syncWheelFromPage();
      CP.updateThemeBtn();
      if (CP.segSuggest && CP.segSuggest.classList.contains('on')) CP.renderSuggestions();
      if (CP.state.blocked > 0) {
        CP.noteEl.style.display = 'block';
        CP.noteEl.textContent = `${CP.state.blocked} stylesheet${CP.state.blocked > 1 ? 's are' : ' is'} cross-origin and unreadable. Those colors are patched per element instead, so their hover styles may not follow.`;
      } else {
        CP.noteEl.style.display = 'none';
      }
    } catch (err) {
      console.error('[ColorPilot]', err);
      CP.setStatus('Scan failed');
      CP.listEl.textContent = '';
      CP.listEl.append(CP.h('div', { class: 'empty' }, 'Could not scan this page: ' + err.message));
    }
  }

  async function rescan() {
    CP.clearOverrides();
    CP.state.showAll = false;
    await init();
    CP.toast('Rescanned');
  }

  let lastUrl = location.href;
  function handleNavigation() {
    if (location.href === lastUrl) return;
    lastUrl = location.href;

    const domain = typeof CP.getDomainKey === 'function' ? CP.getDomainKey(location.href) : location.origin;
    const originKey = 'cp_domain:' + location.origin;
    const domainKey = 'cp_domain:' + domain;

    try {
      chrome.storage.local.get([originKey, domainKey], (res) => {
        const data = (res && res[originKey]) || (res && res[domainKey]);
        if (data && data.active) {
          setTimeout(async () => {
            await init();
          }, 350);
        }
      });
    } catch (e) {}
  }

  function setupNavigationWatcher() {
    window.addEventListener('popstate', handleNavigation);
    window.addEventListener('hashchange', handleNavigation);

    const origPushState = history.pushState;
    if (origPushState) {
      history.pushState = function (...args) {
        const ret = origPushState.apply(this, args);
        handleNavigation();
        return ret;
      };
    }

    const origReplaceState = history.replaceState;
    if (origReplaceState) {
      history.replaceState = function (...args) {
        const ret = origReplaceState.apply(this, args);
        handleNavigation();
        return ret;
      };
    }
  }

  CP.init = init;
  CP.rescan = rescan;
  CP.handleNavigation = handleNavigation;

  /* ---- test hook ---- */
  if (TEST) {
    globalThis.__CP = CP;
    return;
  }

  CP.mountUI();
  setupNavigationWatcher();
  window.__colorPilot = {
    toggle: CP.toggle,
    state: CP.state,
    rescan,
    onNavigate: handleNavigation,
  };
  init();
})();
