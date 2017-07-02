
var removePreviousDivs = function(tabId) {
  chrome.tabs.executeScript(tabId, {
    code: `
      divs = document.getElementsByClassName('colordiv');
      Object.keys(divs).forEach(() => {
        if (divs[0]) {
          divs[0].parentNode.removeChild(divs[0]);
        }
      });
    `
  });
}

var addDivsToPage = function(tabId, tab) {
  var prefs = JSON.parse(window.localStorage.getItem('urlColorPrefs'));
  if (tab.url && prefs.active){
    var urlColorPairs = prefs.urlColorPairs || '';
    var keywordOptionsArray = urlColorPairs.split('\n');
    var keywordOptionsObj = {};
    for ( var i = 0; i < keywordOptionsArray.length; i++) {
      let keywordOptions = keywordOptionsArray[i].split(', ');
      if (keywordOptions[0]) {
        keywordOptionsObj[keywordOptions[0]] = keywordOptions;
      }
    }

    Object.keys(keywordOptionsObj).forEach(function(key) {
      var opacity = keywordOptionsObj[key][5] || prefs.opacity || 1;
      var borderWidth = keywordOptionsObj[key][4] || prefs.borderWidth || '15px';
      var timer = keywordOptionsObj[key][3] || 2;
      if (tab.url.match(key)) {
        chrome.tabs.executeScript(tabId,
          {
            code:`
              var style = document.createElement('style');
              style.type = 'text/css';
              style.innerHTML = '.urlColorAnimate { animation: blinker ${timer}s linear infinite; } @keyframes blinker { 0% { opacity: ${opacity}; } 50% { opacity: 0; } 100% { opacity: ${opacity}; } }';
              document.getElementsByTagName('head')[0].appendChild(style);
              var leftDiv = document.createElement('div');
              var rightDiv = document.createElement('div');
              var topDiv = document.createElement('div');
              var bottomDiv = document.createElement('div');

              var divs = [leftDiv, rightDiv, topDiv, bottomDiv];
              var horizontal = [topDiv, bottomDiv];
              var vertical = [rightDiv, leftDiv];

              divs.forEach(function(div, index) {
                div.setAttribute('class', 'colordiv');
                div.style.background = '${keywordOptionsObj[key][1]}';
                div.style.position = 'fixed';
                div.style.opacity = ${opacity};
                div.style.zIndex = '99999999999999';
                div.style.pointerEvents = 'none';
              });

              horizontal.forEach(function(div) {
                div.style.left = '0';
                div.style.right = '0';
                div.style.height = '${borderWidth}';
              });

              vertical.forEach(function(div) {
                div.style.top = '0';
                div.style.bottom = '0';
                div.style.width = '${borderWidth}';
              });

              leftDiv.style.left = '0';
              rightDiv.style.right = '0';
              topDiv.style.top = '0';
              bottomDiv.style.bottom = '0';

              divs.forEach(function(div) {
                document.body.appendChild(div);
                if ('${keywordOptionsObj[key][2]}' === 'flash') {
                  div.classList.add('urlColorAnimate');
                }
              });
            `
          }
        );
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', function () {
  // initialize tabs
  chrome.tabs.query({}, function(tabArray) {
    tabArray.forEach((tab) => {
      addDivsToPage(tab.id, tab);
    });
  });
  chrome.tabs.onUpdated.addListener(
    function(tabId, changeInfo, tab) {
      removePreviousDivs(tabId);
      addDivsToPage(tabId, tab);
    }
  );
});
