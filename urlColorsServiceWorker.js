let snoozeTimeout;

const updateValue = (property, value) => {
  chrome.storage.local.set({[property]: value}, () => {
    console.log(`Updated ${property} to: `, value);
  });
};

const handleSnooze = (snoozeTime) => {
  clearTimeout(snoozeTimeout);
  const diffInTime = snoozeTime - Date.now();
  if (diffInTime > 0) {
    snoozeTimeout = setTimeout(() => {
      updateValue('snoozeUntil', '');
      sendUpdateMessageToAllTabs('handleSnooze timeout expired');
    }, diffInTime);
  } else {
    updateValue('snoozeUntil', '');
    sendUpdateMessageToAllTabs('handleSnooze timeout expired');
  }
}

const injectContentScript = (tabId, callback)=> {
    chrome.scripting.executeScript({
        target: {tabId: tabId},
        files: ['urlColorsContentScript.js']
    }, () => {
        if (chrome.runtime.lastError) {
            console.log(`Could not inject script into tab ${tabId}: ${chrome.runtime.lastError.message}`);
        } else {
            console.log(`Successfully injected the content script into tab ${tabId}`);
            // Call the callback function if provided
            if (typeof callback === "function") {
                callback(tabId);
            }
        }
    });
}

const injectContentScriptOnAllTabs = () => {
    chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
            if (tab.url.startsWith('http://') || tab.url.startsWith('https://')) {
                injectContentScript(tab.id);
            }
        });
    });
}


const sendMessageToTab = (tabId) => {
    chrome.tabs.sendMessage(tabId, {action: "updateTab"}, response => {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
        } else {
            console.log('Sent message to update tab with id: ', tabId, ' with response:', response);
        }
    });
}

const attemptToSendMessage = (tabId) => {
    chrome.tabs.sendMessage(tabId, {action: "ping"}, () => {
        if (chrome.runtime.lastError) {
            // No response indicates the script isn't there, inject and then send message
            injectContentScript(tabId, sendMessageToTab);
        } else {
            // Got a response, so the content script is already there, just send the message
            console.log('Content script already injected, sending updateTab message now to tab: ', tabId);
            sendMessageToTab(tabId);
        }
    });
}

const sendUpdateMessageToAllTabs = (originator) => {
    console.log('sendUpdateMessageToAllTabs called with originator:', originator);
    chrome.tabs.query({}, (tabs) => {
        console.log('tabs', tabs);
        tabs.forEach((tab) => {
            attemptToSendMessage(tab.id);
        });
    });
};


const setBadge = (text, color, title) => {
    chrome.action.setBadgeText({text});
    chrome.action.setBadgeBackgroundColor({color});
    chrome.action.setTitle({title});
}

const setNeedUpdateBadge = () => {
    setBadge('!', 'red', 'Please open the popup to migrate your settings to URLColors V2.');
}

const setSuccessfulUpdateBadge = () => {
    setBadge("✅", "green", "Settings have been migrated successfully");
}

const removeBadge = () => {
    setBadge('', '', '');
}

chrome.runtime.onStartup.addListener(() => {
    injectContentScriptOnAllTabs();
    // On startup, if snooze is still active, set a timeout to clear it when it expires.
    chrome.storage.local.get(['snoozeUntil'], (result) => {
        if (result.snoozeUntil) {
            handleSnooze(result.snoozeUntil);
        }
    });
});

chrome.runtime.onInstalled.addListener((details) => {
    injectContentScriptOnAllTabs();
    if (details.reason === "update" && details.previousVersion === "1.1.2") {
        // Notify the user to open the popup for completing the migration
        setNeedUpdateBadge();
    }
});

chrome.tabs.onUpdated.addListener(
    (tabId, changeInfo, tab) => {
        // Only update if URL has changed and status is complete.
          chrome.tabs.sendMessage(tab.id, { action: "updateTab" }, (response) => {
              if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
              } else {
                console.log('Sent message to update tab with id: ', tab.id, ' with response:', response);
              }
          });
    }
);
chrome.storage.onChanged.addListener((changes, namespace) => {
  if ((changes.prefs || changes.snoozeUntil || changes.active) && namespace === 'local') {
    if (changes.snoozeUntil && changes.snoozeUntil.newValue) {
      handleSnooze(changes.snoozeUntil.newValue);
    }
    sendUpdateMessageToAllTabs('storage.onChanged listener');
  }
});


// Message receiving
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "settingsMigrated") {
        setSuccessfulUpdateBadge();
    }
    if (message.action === 'removeBadge') {
       removeBadge();
    }
});
