document.addEventListener('DOMContentLoaded', function () {
  var localStorage = window.localStorage;
  var textArea = document.querySelector('textarea');

  if (localStorage.getItem('colorPrefs')) {
    textArea.value = localStorage.getItem('colorPrefs');
  }

  textArea.addEventListener('input', function(e) {
    localStorage.setItem('colorPrefs', e.target.value)
  }, false);
});
