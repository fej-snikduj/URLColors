// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
var textArea = document.querySelector('textarea');
var localStorage = window.localStorage;

if (localStorage.colorPrefs) {
  textArea.value = localStorage.colorPrefs;
}

textArea.on('change', function(event) {
  console.log('event', event);
})

function click(e) {
  chrome.tabs.executeScript(null,
      {code:"document.body.style.border='10px solid " + e.target.id + "'"});

}

document.addEventListener('DOMContentLoaded', function () {
  var divs = document.querySelectorAll('div');
  for (var i = 0; i < divs.length; i++) {
    divs[i].addEventListener('click', click);
  }
});


chrome.tabs.onUpdated.addListener(
  function(tabId, changeInfo, tab) {
    if (tab.url){
      var urlColorArray = document.querySelector('textarea').value;
      var split = urlColorArray.split(/\n|,/);
      console.log('split', split)
      var newObj = {};
      for ( var i = 0; i < split.length; i+=2) {
        newObj[split[i]] = split[i+1];
      }
      console.log('urlColorArray', newObj);

    }

  }
);


chrome.tabs.executeScript(null,
    {code:"document.body.style.border='10px solid red'"});
