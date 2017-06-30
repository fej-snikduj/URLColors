document.addEventListener('DOMContentLoaded', function () {
  chrome.tabs.onUpdated.addListener(
    function(tabId, changeInfo, tab) {
      console.log('acting', tab.url)
      if (tab.url){
        var urlColorArray = window.localStorage.getItem('colorPrefs');
        var split = urlColorArray.split(/\n|,/);
        var newObj = {};
        for ( var i = 0; i < split.length; i+=2) {
          newObj[split[i]] = split[i+1];
        }

        console.log('hey there', newObj)
        Object.keys(newObj).forEach(function(key) {
          console.log('checking if there is a match', key, tab.url)
          if (tab.url.match(key)) {
            console.log('there is a match!');
            chrome.tabs.executeScript(tabId,
              {
                code:"document.body.style.border='10px solid " + newObj[key] + "'"
              }
            );
          }
        });

      }

    }
  );
});
