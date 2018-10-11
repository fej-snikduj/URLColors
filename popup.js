window.urlColors = window.urlColors || {};

urlColors.updateLocalStorage = function(property, value) {
  let storage = JSON.parse(localStorage.getItem('urlColorPrefs') || "{}");
  storage[property] = value;
  localStorage.setItem('urlColorPrefs', JSON.stringify(storage));
};

urlColors.getValue = function(property) {
  let storage = JSON.parse(localStorage.getItem('urlColorPrefs') || "{}");
  return storage[property];
};

urlColors.updateTabs = function() {
  chrome.tabs.query({}, function(tabArray) {
    tabArray.forEach((tab) => {
      chrome.extension.getBackgroundPage().removePreviousDivs(tab.id);
      chrome.extension.getBackgroundPage().addDivsToPage(tab.id, tab);
    });
  });
}

urlColors.removePreviousDivs = function() {
  chrome.tabs.query({}, function(tabArray) {
    tabArray.forEach((tab) => {
      chrome.extension.getBackgroundPage().removePreviousDivs(tab.id);
    });
  });
}

urlColors.addDivsToPage = function() {
  chrome.tabs.query({}, function(tabArray) {
    tabArray.forEach((tab) => {
      chrome.extension.getBackgroundPage().addDivsToPage(tab.id, tab);
    });
  });
}

document.addEventListener('DOMContentLoaded', function () {
  var localStorage = window.localStorage;
  var urlColorPairsInput = document.querySelector('textarea');
  var opacityInput = document.querySelector('input[name="opacity"]');
  var borderWidthInput = document.querySelector('input[name="border-width"]');
  var activeCheckbox = document.querySelector('input[name="active"]');
  var snoozeTimeInput = document.querySelector('input[name="snooze-time"]');
  var snoozeButton = document.querySelector('button[id="snooze"]');
  var cancelButton = document.querySelector('button[id="cancel"]');
  var expirationTimeDiv = document.querySelector('div[id="expiration-time"]');

  // use localStorage for the application 'state'.

  // First, grab the default state from localStorage.
  var prefs = JSON.parse(localStorage.getItem('urlColorPrefs') || "{}");
  var urlColorPairs = prefs.urlColorPairs || '';
  var opacity = prefs.opacity || .2;
  var borderWidth = prefs.borderWidth || '15px';
  var isActive = typeof(prefs.active) === 'boolean' ? prefs.active : activeCheckbox.checked;
  var snoozeTime = prefs.snoozeTime || 5;
  var expirationTime = prefs.expirationTimeString || '';

  // Now initialize state with default or previous values.
  urlColors.updateLocalStorage('active', isActive);
  urlColors.updateLocalStorage('urlColorPairs', urlColorPairs);
  urlColors.updateLocalStorage('opacity', opacity);
  urlColors.updateLocalStorage('borderWidth', borderWidth);
  urlColors.updateLocalStorage('snoozeTime', snoozeTime);


  // Update the input values with initial state.
  urlColorPairs.value = urlColorPairs;
  opacityInput.value = opacity;
  borderWidthInput.value = borderWidth;
  activeCheckbox.checked = isActive;
  snoozeTimeInput.value = snoozeTime;
  expirationTimeDiv.textContent = `Snoozed until: ${expirationTime}`;
  // snoozeButton.disabled = !!expirationTime;
  cancelButton.disabled = !expirationTime;

  urlColorPairsInput.addEventListener('input', function(e) {
    urlColors.updateLocalStorage('urlColorPairs', e.target.value);
    urlColors.updateTabs();
  }, false);

  snoozeTimeInput.addEventListener('input', function(e) {
    urlColors.updateLocalStorage('snoozeTime', e.target.value);
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

  snoozeButton.addEventListener('click', function(e) {
    // Get the minutes to snooze from the current value of the input.
    var snoozeMinutes = urlColors.getValue('snoozeTime');
    var expirationTimeUnix = Date.now() + snoozeMinutes * 60000;
    var expirationTimeStamp = new Date(expirationTimeUnix);
    var localeString = expirationTimeStamp.toLocaleString();
    // Update State
    urlColors.updateLocalStorage('expirationTimeUnix', expirationTimeUnix);
    urlColors.updateLocalStorage('expirationTimeStamp', expirationTimeStamp);
    urlColors.updateLocalStorage('expirationTimeString', localeString);
    expirationTimeDiv.textContent = 'Snoozed until: ' + localeString;
    // Update UI
    snoozeButton.disabled = true;
    cancelButton.disabled = false;
    window.snoozeTimeout = setTimeout(function() {
      alert('what')
    }, 1000)
    urlColors.updateTabs();
  }, false);

  activeCheckbox.addEventListener('change', function(e) {
    urlColors.updateLocalStorage('active', e.target.checked);
    if (!e.target.checked) {
      urlColors.removePreviousDivs();
    } else {
      urlColors.addDivsToPage();
    }
  }, false);

});
