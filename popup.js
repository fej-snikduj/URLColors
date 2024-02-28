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

  // Load and display stored preferences including snooze time
  chrome.storage.local.get(['prefs', 'snoozeUntil', 'snoozeTime', 'active'], function(data) {
    // Load preferences
    keywordsInput.value = data?.prefs?.keywords || '';
    opacityInput.value = data?.prefs?.opacity || '0.5'; // Default opacity
    borderWidthInput.value = data?.prefs?.borderWidth || '2'; // Default border width
    activeCheckbox.checked = data?.active === undefined ? true: data.active; // Enabled by default
    snoozeDurationInput.value = data?.snoozeTime || 5;
    expirationTimeDiv.textContent = data?.snoozeUntil ? `Snoozed until: ${new Date(data.snoozeUntil).toLocaleString()}` : '';
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
      snoozeTime: parseInt(snoozeDurationInput.value) || 5 // Save snooze time, defaulting to 5 if not specified
    });
  }

  // Event listeners for real-time preference updates
  keywordsInput.addEventListener('input', savePreferences);
  opacityInput.addEventListener('input', savePreferences);
  borderWidthInput.addEventListener('input', savePreferences);
  activeCheckbox.addEventListener('change', savePreferences);
  snoozeDurationInput.addEventListener('input', savePreferences); // Update snooze time in storage on change

  // Snooze functionality
  snoozeButton.addEventListener('click', function() {
    const snoozeMinutes = parseInt(snoozeDurationInput.value) || 5; // Use current value or default to 5 minutes
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
});
