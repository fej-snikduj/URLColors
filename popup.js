

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
  var applyInAllFramesCheckbox = document.querySelector('input[name="applyInAllFrames"]');

  // use localStorage for the application 'state'.

  // First, grab the default state from localStorage.
  var prefs = JSON.parse(localStorage.getItem('urlColorPrefs') || "{}");
  var urlColorPairs = prefs.urlColorPairs || '';
  var opacity = prefs.opacity || .2;
  var borderWidth = prefs.borderWidth || '15px';
  var isActive = typeof(prefs.active) === 'boolean' ? prefs.active : activeCheckbox.checked;
  var snoozeTime = prefs.snoozeTime || 5;
  var expirationTime = prefs.expirationTimeString || '';
  var applyInAllFrames = typeof(prefs.applyInAllFrames) === 'boolean' ? prefs.applyInAllFrames : applyInAllFramesCheckbox.checked;

  // Now initialize state with default or previous values.
  chrome.extension.getBackgroundPage().updateLocalStorage('active', isActive);
  chrome.extension.getBackgroundPage().updateLocalStorage('urlColorPairs', urlColorPairs);
  chrome.extension.getBackgroundPage().updateLocalStorage('opacity', opacity);
  chrome.extension.getBackgroundPage().updateLocalStorage('borderWidth', borderWidth);
  chrome.extension.getBackgroundPage().updateLocalStorage('snoozeTime', snoozeTime);
  chrome.extension.getBackgroundPage().updateLocalStorage('applyInAllFrames', applyInAllFrames);

  // Update the input values with initial state.
  urlColorPairsInput.value = urlColorPairs;
  opacityInput.value = opacity;
  borderWidthInput.value = borderWidth;
  activeCheckbox.checked = isActive;
  snoozeTimeInput.value = snoozeTime;
  expirationTimeDiv.textContent = expirationTime ? `Snoozed until: ${expirationTime}` : '';
  snoozeButton.disabled = !!expirationTime;
  cancelButton.disabled = !expirationTime;
  applyInAllFramesCheckbox.checked = applyInAllFrames;

  urlColorPairsInput.addEventListener('input', function(e) {
    chrome.extension.getBackgroundPage().updateLocalStorage('urlColorPairs', e.target.value);
    chrome.extension.getBackgroundPage().updateTabs();
  }, false);

  snoozeTimeInput.addEventListener('input', function(e) {
    chrome.extension.getBackgroundPage().updateLocalStorage('snoozeTime', e.target.value);
    chrome.extension.getBackgroundPage().updateTabs();
  }, false);

  opacityInput.addEventListener('input', function(e) {
    chrome.extension.getBackgroundPage().updateLocalStorage('opacity', e.target.value);
    chrome.extension.getBackgroundPage().updateTabs();
  }, false);

  borderWidthInput.addEventListener('input', function(e) {
    chrome.extension.getBackgroundPage().updateLocalStorage('borderWidth', e.target.value);
    chrome.extension.getBackgroundPage().updateTabs();
  }, false);

  snoozeButton.addEventListener('click', function(e) {
    // Get the minutes to snooze from the current value of the input.
    var snoozeMinutes = chrome.extension.getBackgroundPage().getValue('snoozeTime');
    var expirationTimeUnix = Date.now() + snoozeMinutes * 60000;
    var expirationTimeStamp = new Date(expirationTimeUnix);
    var localeString = expirationTimeStamp.toLocaleString();
    // Update State
    chrome.extension.getBackgroundPage().updateLocalStorage('expirationTimeUnix', expirationTimeUnix);
    chrome.extension.getBackgroundPage().updateLocalStorage('expirationTimeStamp', expirationTimeStamp);
    chrome.extension.getBackgroundPage().updateLocalStorage('expirationTimeString', localeString);
    expirationTimeDiv.textContent = 'Snoozed until: ' + localeString;
    // Update UI
    snoozeButton.disabled = true;
    cancelButton.disabled = false;
    chrome.extension.getBackgroundPage().handleSnooze();
    chrome.extension.getBackgroundPage().updateTabs();
  }, false);

  cancelButton.addEventListener('click', function(e) {
    // Update State
    chrome.extension.getBackgroundPage().resetSnooze();
    // Update UI
    expirationTimeDiv.textContent = '';
    snoozeButton.disabled = false;
    cancelButton.disabled = true;
    clearTimeout(chrome.extension.getBackgroundPage().snoozeTimeout);
    chrome.extension.getBackgroundPage().updateTabs();
  }, false);

  activeCheckbox.addEventListener('change', function(e) {
    chrome.extension.getBackgroundPage().updateLocalStorage('active', e.target.checked);
    if (!e.target.checked) {
      chrome.extension.getBackgroundPage().removePreviousDivsFromAllTabs();
    } else {
      chrome.extension.getBackgroundPage().addDivsToPageForAllTabs();
    }
  }, false);

  applyInAllFramesCheckbox.addEventListener('change', function(e) {
      chrome.extension.getBackgroundPage().updateLocalStorage('applyInAllFrames', e.target.checked);
      chrome.extension.getBackgroundPage().updateTabs();
  }, false);
  
});
