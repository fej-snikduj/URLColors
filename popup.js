window.urlColors = window.urlColors || {};

urlColors.updateLocalStorage = function(property, value) {
  let storage = JSON.parse(localStorage.getItem('urlColorPrefs') || "{}");
  storage[property] = value;
  localStorage.setItem('urlColorPrefs', JSON.stringify(storage));
};

urlColors.updateTabs = function() {
  chrome.tabs.query({}, function(tabArray) {
    tabArray.forEach((tab) => {
      console.log(tab, 'tab')
      chrome.extension.getBackgroundPage().removePreviousDivs(tab.id);
      chrome.extension.getBackgroundPage().addDivsToPage(tab.id, tab);
    });
  });
}

document.addEventListener('DOMContentLoaded', function () {
  var localStorage = window.localStorage;
  var urlColorPairs = document.querySelector('textarea');
  var opacityInput = document.querySelector('input[name="opacity"]');
  var borderWidthInput = document.querySelector('input[name="border-width"]')
  var active = document.querySelector('input[name="active"]')

  var prefs = JSON.parse(localStorage.getItem('urlColorPrefs') || "{}");
  urlColorPairs.value = prefs.urlColorPairs || '';
  opacityInput.value = prefs.opacity || .2;
  borderWidthInput.value = prefs.borderWidth || '15px';
  active.checked = typeof(prefs.active) === 'boolean' ? prefs.active : true;
  if (typeof(prefs.active) !== 'boolean') {
    urlColors.updateLocalStorage('active', active.checked);
  }

  urlColorPairs.addEventListener('input', function(e) {
    urlColors.updateLocalStorage('urlColorPairs', e.target.value);
    urlColors.updateTabs();
  }, false);

  opacityInput.addEventListener('input', function(e) {
    urlColors.updateLocalStorage('opacity', e.target.value);
    urlColors.updateTabs();
  }, false);

  borderWidthInput.addEventListener('input', function(e) {
    urlColors.updateLocalStorage('borderWidth', e.target.value);
    urlColors.updateTabs();
  }, false);

  active.addEventListener('change', function(e) {
    urlColors.updateLocalStorage('active', e.target.checked);
    if (!e.target.checked) {
      chrome.tabs.query({}, function(tabArray) {
        tabArray.forEach((tab) => {
          chrome.extension.getBackgroundPage().removePreviousDivs(tab.id);
        });
      });
    } else {
      chrome.tabs.query({}, function(tabArray) {
        tabArray.forEach((tab) => {
          chrome.extension.getBackgroundPage().addDivsToPage(tab.id, tab);
        });
      });
    }
  }, false);

});
