document.addEventListener('DOMContentLoaded', function() {
  // Define elements
  const keywordsInput = document.getElementById('url-settings');
  const opacityInput = document.getElementById('opacity');
  const borderWidthInput = document.getElementById('border-width');
  const activeCheckbox = document.getElementById('active-checkbox');
  const snoozeButton = document.getElementById('snooze');
  const cancelButton = document.getElementById('cancel');
  const snoozeDurationInput = document.getElementById('snooze-duration');
  const expirationTimeDiv = document.getElementById("expiration-time");
  const banner = document.getElementById('wildcardBanner');
  const dismissBtn = document.getElementById('dismissBanner');

  const resetSnoozeUIIfExpired = (snoozeUntil) => {
    if (!snoozeUntil || (snoozeUntil && snoozeUntil < Date.now())) {
      chrome.storage.local.set({snoozeUntil: ''}, function() {
        console.log('Snooze expired.');
      });
      snoozeButton.disabled = false;
      cancelButton.disabled = true;
      expirationTimeDiv.textContent = '';
    } else {
      snoozeButton.disabled = true;
      cancelButton.disabled = false;
      expirationTimeDiv.textContent = `Snoozed until: ${new Date(snoozeUntil).toLocaleString()}`;

    }
  }

  // Load and display stored preferences including snooze time
  chrome.storage.local.get(['prefs', 'snoozeUntil', 'snoozeTime', 'active', 'bannerDismissed'], function(data) {
    // Load preferences
    keywordsInput.value = data?.prefs?.keywords || '';
    opacityInput.value = data?.prefs?.opacity || '0.5'; // Default opacity
    borderWidthInput.value = data?.prefs?.borderWidth || '15px'; // Default border width
    activeCheckbox.checked = data?.active === undefined ? true: data.active; // Enabled by default
    snoozeDurationInput.value = data?.snoozeTime || 5;
    resetSnoozeUIIfExpired(data?.snoozeUntil);
    if (data?.bannerDismissed === undefined) {
      banner.style.display = 'block';
    }
  });

  // Save preferences function
  function savePreferences() {
    chrome.storage.local.set({
      prefs: {
        keywords: keywordsInput.value,
        opacity: opacityInput.value,
        borderWidth: borderWidthInput.value,
      },
      active: activeCheckbox.checked,
      snoozeTime: parseFloat(snoozeDurationInput.value) || 5 // Save snooze time, defaulting to 5 if not specified
    }, () => { console.log('Preferences saved.'); });
  }

  // Event listeners for real-time preference updates
  keywordsInput.addEventListener('input', savePreferences);
  opacityInput.addEventListener('input', savePreferences);
  borderWidthInput.addEventListener('input', savePreferences);
  activeCheckbox.addEventListener('change', savePreferences);
  snoozeDurationInput.addEventListener('input', savePreferences); // Update snooze time in storage on change

  // Snooze functionality
  snoozeButton.addEventListener('click', function() {
    const snoozeMinutes = parseFloat(snoozeDurationInput.value) || 5; // Use current value or default to 5 minutes
    const snoozeUntil = Date.now() + snoozeMinutes * 60000; // Calculate snooze end time
    chrome.storage.local.set({snoozeUntil}, function() {
      console.log(`Extension snoozed for ${snoozeMinutes} minutes.`);
    });
    snoozeButton.disabled = true;
    cancelButton.disabled = false;
  });

  // Cancel Snooze
  cancelButton.addEventListener('click', function() {
    const snoozeUntil =''; // Calculate snooze end time
    chrome.storage.local.set({snoozeUntil}, function() {
      console.log(`Snooze canceled.`);
    });
    snoozeButton.disabled = false;
    cancelButton.disabled = true;
  });

  dismissBtn.addEventListener('click', function() {
    banner.style.display = 'none'; // Hide the banner
    chrome.storage.local.set({bannerDismissed: true}, function() {
      console.log(`Banner dismissed.`);
    });
  });

  chrome.storage.onChanged.addListener((changes, namespace) => {
    if ((changes.snoozeUntil) && namespace === 'local') {
      if (changes.snoozeUntil) {
        if (changes.snoozeUntil.newValue) {
          expirationTimeDiv.textContent = `Snoozed until: ${new Date(changes.snoozeUntil.newValue).toLocaleString()}`;
          snoozeButton.disabled = true;
          cancelButton.disabled = false;
        } else {
            expirationTimeDiv.textContent = '';
            snoozeButton.disabled = false;
            cancelButton.disabled = true;
        }
      }
    }
  });
});
