let snoozeTimeout;

const updateValue = function(property, value) {
  chrome.storage.local.set({[property]: value}, function() {
    console.log(`Updated ${property} to: `, value);
  });
};

const handleSnooze = (snoozeTime) => {
  clearTimeout(snoozeTimeout);
  const diffInTime = snoozeTime - Date.now();
  if (diffInTime > 0) {
    snoozeTimeout = setTimeout(function() {
      updateValue('snoozeUntil', '');
    }, diffInTime);
  } else {
    updateValue('snoozeUntil', '');
  }
}

const sendUpdateMessageToAllTabs = () => {
    chrome.tabs.query({}, function(tabs) {
        tabs.forEach((tab) => {
        chrome.tabs.sendMessage(tab.id, { action: "updateTab" }, () => {
            console.log('Sent message to update tab with id: ', tab.id);
        });
        });
    });
};

// On startup, if snooze is still active, set a timeout to clear it when it expires.
chrome.runtime.onStartup.addListener(() => {
  chrome.tabs.query({}, (tabs) => {
    for (const tab of tabs) {
      // Check if the tab has a URL (some special tabs like the Chrome start page won't have one)
      if (tab.url) {
        chrome.scripting.executeScript({
          target: {tabId: tab.id},
          files: ['contentScript.js']
        }).catch(error => console.log(`Error injecting script into tab ${tab.id}: ${error}`));
      }
    }
  });
  chrome.storage.local.get(['snoozeUntil'], function(result) {
    if (result.snoozeUntil) {
      handleSnooze(result.snoozeUntil);
    }
  });
});

chrome.tabs.onUpdated.addListener(
    function(tabId, changeInfo, tab) {
      chrome.tabs.sendMessage(tab.id, { action: "updateTab" }, () => {
        console.log('Sent message to update tab with id: ', tab.id);
      });
    }
);
chrome.storage.onChanged.addListener(function(changes, namespace) {
  if ((changes.prefs || changes.snoozeUntil || changes.active) && namespace === 'local') {
    if (changes.snoozeUntil && changes.snoozeUntil.newValue) {
      handleSnooze(changes.snoozeUntil.newValue);
    }
    sendUpdateMessageToAllTabs();
  }
});
