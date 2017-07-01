
var log = function(message) {
  chrome.tabs.executeScript(null, {
    code: `
      console.log(JSON.parse('${JSON.stringify(message)}'));
    `
  });
}
var removePreviousDivs = function(tabId) {
  chrome.tabs.executeScript(tabId, {
    code: `
      divs = document.getElementsByClassName('colordiv');
      console.log(divs.length);
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
    var opacity = prefs.opacity || .2;
    var borderWidth = prefs.borderWidth || '15px';
    var split = urlColorPairs.split(/\n|,/);
    var newObj = {};
    for ( var i = 0; i < split.length; i+=2) {
      newObj[split[i]] = split[i+1];
    }

    Object.keys(newObj).forEach(function(key) {
      if (tab.url.match(key)) {
        log('URL Color Message: Key matches settings - adding divs.')
        chrome.tabs.executeScript(tabId,
          {
            code:`
              var leftDiv = document.createElement('div');
              var rightDiv = document.createElement('div');
              var topDiv = document.createElement('div');
              var bottomDiv = document.createElement('div');

              var divs = [leftDiv, rightDiv, topDiv, bottomDiv];
              var horizontal = [topDiv, bottomDiv];
              var vertical = [rightDiv, leftDiv];

              divs.forEach(function(div, index) {
                div.setAttribute('class', 'colordiv');
                div.style.background = '${newObj[key]}';
                div.style.position = 'fixed';
                div.style.opacity = ${opacity};
                div.style.zIndex = '99999999999999';
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
              });
            `
          }
        );
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', function () {
  chrome.tabs.onUpdated.addListener(
    function(tabId, changeInfo, tab) {
      removePreviousDivs(tabId);
      addDivsToPage(tabId, tab);
    }
  );
});
