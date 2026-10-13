// Background service worker for ColorPilot
const MODULE_FILES = [
  'src/state.js',
  'src/color-math.js',
  'src/css-parser.js',
  'src/scanner.js',
  'src/clustering.js',
  'src/overrides.js',
  'src/templates.js',
  'src/ui.js',
  'content.js',
];

async function injectModules(tabId) {
  await chrome.scripting.executeScript({
    target: { tabId },
    files: MODULE_FILES,
  });
}

// Clicking the toolbar icon (or Alt+Shift+C) toggles the controller or injects it
chrome.action.onClicked.addListener(async (tab) => {
  if (!tab || !tab.id) return;
  try {
    const [res] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        if (window.__colorPilot) {
          window.__colorPilot.toggle();
          return true;
        }
        return false;
      },
    });

    if (res && res.result) return;
    await injectModules(tab.id);
  } catch (err) {
    // Restricted system pages (chrome://, Web Store, etc.) cannot be scripted
    chrome.action.setBadgeBackgroundColor({ tabId: tab.id, color: '#c0392b' });
    chrome.action.setBadgeText({ tabId: tab.id, text: '!' });
    setTimeout(() => chrome.action.setBadgeText({ tabId: tab.id, text: '' }), 2500);
  }
});

function getDomainKey(urlStr) {
  try {
    const url = new URL(urlStr);
    let host = url.hostname.toLowerCase();
    if (!host || /^(\d{1,3}\.){3}\d{1,3}$/.test(host) || host === 'localhost') return host;
    const parts = host.split('.');
    if (parts.length >= 3 && /^(co|com|org|net|gov|edu|ac|in)$/i.test(parts[parts.length - 2])) {
      return parts.slice(-3).join('.');
    }
    if (parts.length >= 2) {
      return parts.slice(-2).join('.');
    }
    return host;
  } catch (e) {
    return '';
  }
}

// Auto-persist colors across navigations on the SAME domain
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (tab && tab.url && /^https?:\/\//.test(tab.url)) {
    try {
      const url = new URL(tab.url);
      const origin = url.origin;
      const domain = getDomainKey(tab.url);
      const res = await chrome.storage.local.get('cp_active_domains');
      const activeDomains = res && Array.isArray(res.cp_active_domains) ? res.cp_active_domains : [];

      if (activeDomains.includes(origin) || activeDomains.includes(domain)) {
        if (changeInfo.status === 'complete') {
          const [check] = await chrome.scripting.executeScript({
            target: { tabId },
            func: () => typeof window.__colorPilot !== 'undefined',
          });

          if (!check || !check.result) {
            await injectModules(tabId);
          } else {
            await chrome.scripting.executeScript({
              target: { tabId },
              func: () => {
                if (window.__colorPilot && typeof window.__colorPilot.onNavigate === 'function') {
                  window.__colorPilot.onNavigate();
                }
              },
            });
          }
        }
      }
    } catch (e) {
      // Ignored for protected tabs
    }
  }
});
