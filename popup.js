var updateLocalStorage = function(property, value) {
  let storage = JSON.parse(localStorage.getItem('urlColorPrefs') || "{}");
  storage[property] = value;
  localStorage.setItem('urlColorPrefs', JSON.stringify(storage));
};

document.addEventListener('DOMContentLoaded', function () {
  var localStorage = window.localStorage;
  var urlColorPairs = document.querySelector('textarea');
  var opacityInput = document.querySelector('input[name="opacity"]');
  var borderWidthInput = document.querySelector('input[name="border-width"]')

  var prefs = JSON.parse(localStorage.getItem('urlColorPrefs') || "{}");
  urlColorPairs.value = prefs.urlColorPairs || '';
  opacityInput.value = prefs.opacity || .2;
  borderWidthInput.value = prefs.borderWidth || '15px';

  urlColorPairs.addEventListener('input', function(e) {
    updateLocalStorage('urlColorPairs', e.target.value);
  }, false);

  opacityInput.addEventListener('input', function(e) {
    updateLocalStorage('opacity', e.target.value);
  }, false);

  borderWidthInput.addEventListener('input', function(e) {
    updateLocalStorage('borderWidth', e.target.value);
  }, false);

});
