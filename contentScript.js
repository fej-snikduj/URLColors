const removePreviousDivs = () => {
  const divs = document.getElementsByClassName('colordiv');
  Object.keys(divs).forEach(() => {
    if (divs[0]) {
      divs[0].parentNode.removeChild(divs[0]);
    }
  });
}

const addNewDivs = (color, flash, timer, borderWidth, opacity) => {
  const style = document.createElement('style');
  style.innerHTML = `.urlColorAnimate { animation: blinker ${timer}s linear infinite; } @keyframes blinker { 0% { opacity: ${opacity}; } 50% { opacity: 0; } 100% { opacity: ${opacity}; } }`;
  document.getElementsByTagName('head')[0].appendChild(style);
  const leftDiv = document.createElement('div');
  const rightDiv = document.createElement('div');
  const topDiv = document.createElement('div');
  const bottomDiv = document.createElement('div');

  const divs = [leftDiv, rightDiv, topDiv, bottomDiv];
  const horizontal = [topDiv, bottomDiv];
  const vertical = [rightDiv, leftDiv];

  divs.forEach((div) => {
    div.setAttribute('class', 'colordiv');
    div.style.background = color;
    div.style.position = 'fixed';
    div.style.opacity = opacity;
    div.style.zIndex = '99999999999999';
    div.style.pointerEvents = 'none';
  });

  horizontal.forEach((div) => {
    div.style.left = '0';
    div.style.right = '0';
    div.style.height = '${borderWidth}';
  });

  vertical.forEach((div) => {
    div.style.top = '0';
    div.style.bottom = '0';
    div.style.width = borderWidth;
  });

  leftDiv.style.left = '0';
  rightDiv.style.right = '0';
  topDiv.style.top = '0';
  bottomDiv.style.bottom = '0';

  divs.forEach(function(div) {
    document.body.appendChild(div);
    if (flash === 'flash') {
      div.classList.add('urlColorAnimate');
    }
  });
}


function updatePageWithPrefs(prefs) {
  // Get the current tab URL
  const currentUrl = window.location.href;

  // Iterate through each line of preferences
  prefs.keywords.split('\n').forEach(line => {
    // Parse the line for keyword and settings
    const [keyword, color, flash, timer, borderWidth = prefs?.borderWidth, opacity = prefs?.opacity] = line.split(',').map(s => s.trim());
    const regex = new RegExp(keyword.replace(/\*/g, '.*'), 'i'); // Convert wildcard to regex pattern

    // If the current URL matches the keyword pattern
    if (regex.test(currentUrl)) {
      console.log(`Match found for ${keyword} in URL: ${currentUrl}`);
      removePreviousDivs();
      addNewDivs(color, flash, timer, borderWidth, opacity);
    }
  });
}

function applyPreferences() {
  chrome.storage.local.get(['prefs', 'snoozeUntil', 'active'], function(data) {
    if (data.active === false) {
      console.log("Extension is inactive.");
      removePreviousDivs();
      return;
    }
    const now = Date.now();
    if (data.snoozeUntil && data.snoozeUntil > now) {
      console.log("Extension is snoozed.");
      removePreviousDivs();
      return;
    }
    updatePageWithPrefs(data.prefs);
  });
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'updateTab') {
    applyPreferences();
  }
});


document.addEventListener('DOMContentLoaded', applyPreferences);
