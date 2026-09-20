const DEFAULT_OPACITY = "0.5";
const DEFAULT_BORDER_WIDTH = "15px";
const MILLISECONDS_PER_MINUTE = 60000;
const DEFAULT_SNOOZE_TIME = 5;
const SUPPORTER_CODE = "URLCOLORSVIP";
const CONFETTI_COLORS = ["#ffd700", "#ff6b6b", "#4ecdc4", "#a78bfa", "#ffb347"];

const handleMigration = () => {
  const oldPrefsString = localStorage.getItem("urlColorPrefs");
  if (!oldPrefsString) {
    // send message to service worker for it to remove any badge
    chrome.runtime.sendMessage({ action: "removeBadge" }, () => {
      if (chrome.runtime.lastError) {
        console.log("Error sending message to service worker for removing badge.");
        console.error(chrome.runtime.lastError);
      } else {
        console.log("Message sent to service worker for removing badge.");
      }
    });
    return;
  }
  const oldPrefs = JSON.parse(oldPrefsString);
  chrome.storage.local.set(
    {
      prefs: {
        keywords: oldPrefs.urlColorPairs,
        opacity: oldPrefs.opacity,
        borderWidth: oldPrefs.borderWidth,
      },
      active: oldPrefs.active,
      snoozeUntil: oldPrefs.expirationTimeUnix,
      snoozeTime: oldPrefs.snoozeTime,
    },
    () => {
      console.log("Settings migrated. Deleting old settings.");
      localStorage.removeItem("urlColorPrefs");
      // send message to service worker for it to change badge to green checkmark
      chrome.runtime.sendMessage({ action: "settingsMigrated" }, () => {
        if (chrome.runtime.lastError) {
          console.log("Error sending message to service worker for settings migration.");
          console.error(chrome.runtime.lastError);
        } else {
          console.log("Message sent to service worker for settings migration.");
        }
      });
    }
  );
};

document.addEventListener("DOMContentLoaded", () => {
  // Handle Migration if necessary.
  handleMigration();
  // Define elements
  const keywordsInput = document.getElementById("url-settings");
  const opacityInput = document.getElementById("opacity");
  const borderWidthInput = document.getElementById("border-width");
  const activeCheckbox = document.getElementById("active-checkbox");
  const loggingCheckbox = document.getElementById("logging-checkbox");
  const snoozeButton = document.getElementById("snooze");
  const cancelButton = document.getElementById("cancel");
  const snoozeDurationInput = document.getElementById("snooze-duration");
  const expirationTimeDiv = document.getElementById("expiration-time");
  const banner = document.getElementById("wildcardBanner");
  const dismissBtn = document.getElementById("dismissBanner");
  const supporterBadge = document.getElementById("supporter-badge");
  const thankYouNote = document.getElementById("thank-you-note");
  const redeemRow = document.getElementById("redeem-row");
  const redeemCodeInput = document.getElementById("redeem-code");
  const redeemButton = document.getElementById("redeem-button");
  const redeemMessage = document.getElementById("redeem-message");

  const applySupporterTheme = () => {
    document.body.classList.add("supporter");
    supporterBadge.style.display = "inline-block";
    thankYouNote.style.display = "block";
    redeemRow.style.display = "none";
  };

  const launchConfetti = () => {
    for (let i = 0; i < 24; i++) {
      const piece = document.createElement("div");
      piece.className = "confetti-piece";
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.backgroundColor = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
      piece.style.animationDuration = `${0.8 + Math.random() * 0.6}s`;
      document.body.appendChild(piece);
      piece.addEventListener("animationend", () => piece.remove());
    }
  };

  const resetSnoozeUIIfExpired = (snoozeUntil) => {
    if (!snoozeUntil || (snoozeUntil && snoozeUntil < Date.now())) {
      chrome.storage.local.set({ snoozeUntil: "" }, () => {
        console.log("Snooze expired.");
      });
      snoozeButton.disabled = false;
      cancelButton.disabled = true;
      expirationTimeDiv.textContent = "";
    } else {
      snoozeButton.disabled = true;
      cancelButton.disabled = false;
      expirationTimeDiv.textContent = `Snoozed until: ${new Date(snoozeUntil).toLocaleString()}`;
    }
  };

  // Load and display stored preferences including snooze time
  chrome.storage.local.get(
    ["prefs", "snoozeUntil", "snoozeTime", "active", "bannerDismissed", "logging", "isSupporter"],
    (data) => {
      // Load preferences
      keywordsInput.value = data?.prefs?.keywords || "";
      opacityInput.value = data?.prefs?.opacity || DEFAULT_OPACITY; // Default opacity
      borderWidthInput.value = data?.prefs?.borderWidth || DEFAULT_BORDER_WIDTH; // Default border width
      activeCheckbox.checked = data?.active === undefined ? true : data.active; // Enabled by default
      loggingCheckbox.checked = data?.logging === undefined ? false : data.logging; // Enabled by default
      snoozeDurationInput.value = data?.snoozeTime || DEFAULT_SNOOZE_TIME;
      resetSnoozeUIIfExpired(data?.snoozeUntil);
      if (data?.bannerDismissed === undefined) {
        banner.style.display = "block";
      }
      if (data?.isSupporter) {
        applySupporterTheme();
      }
    }
  );

  // Save preferences function
  const savePreferences = () => {
    chrome.storage.local.set(
      {
        prefs: {
          keywords: keywordsInput.value,
          opacity: opacityInput.value,
          borderWidth: borderWidthInput.value,
        },
        active: activeCheckbox.checked,
        snoozeTime: parseFloat(snoozeDurationInput.value) || DEFAULT_SNOOZE_TIME,
        logging: loggingCheckbox.checked, // Save snooze time, defaulting to 5 if not specified
      },
      () => {
        console.log("Preferences saved.");
      }
    );
  };

  // Event listeners for real-time preference updates
  keywordsInput.addEventListener("input", savePreferences);
  opacityInput.addEventListener("input", savePreferences);
  borderWidthInput.addEventListener("input", savePreferences);
  activeCheckbox.addEventListener("change", savePreferences);
  loggingCheckbox.addEventListener("change", savePreferences);
  snoozeDurationInput.addEventListener("input", savePreferences);

  // Snooze functionality
  snoozeButton.addEventListener("click", () => {
    const snoozeMinutes = parseFloat(snoozeDurationInput.value) || DEFAULT_SNOOZE_TIME;
    const snoozeUntil = Date.now() + snoozeMinutes * MILLISECONDS_PER_MINUTE;
    chrome.storage.local.set({ snoozeUntil }, () => {
      console.log(`Extension snoozed for ${snoozeMinutes} minutes.`);
    });
    snoozeButton.disabled = true;
    cancelButton.disabled = false;
  });

  // Cancel Snooze
  cancelButton.addEventListener("click", () => {
    const snoozeUntil = ""; // Calculate snooze end time
    chrome.storage.local.set({ snoozeUntil }, () => {
      console.log(`Snooze canceled.`);
    });
    snoozeButton.disabled = false;
    cancelButton.disabled = true;
  });

  const redeemSupporterCode = () => {
    const entered = redeemCodeInput.value.trim().toUpperCase();
    if (!entered) {
      return;
    }
    if (entered === SUPPORTER_CODE) {
      chrome.storage.local.set({ isSupporter: true }, () => {
        console.log("Supporter unlocked.");
      });
      redeemMessage.textContent = "";
      redeemMessage.className = "";
      applySupporterTheme();
      launchConfetti();
    } else {
      redeemMessage.textContent = "That code doesn't look right — check your thank-you email.";
      redeemMessage.className = "error";
    }
  };

  redeemButton.addEventListener("click", redeemSupporterCode);
  redeemCodeInput.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
      redeemSupporterCode();
    }
  });

  dismissBtn.addEventListener("click", () => {
    banner.style.display = "none"; // Hide the banner
    chrome.storage.local.set({ bannerDismissed: true }, () => {
      console.log(`Banner dismissed.`);
    });
  });

  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (changes.snoozeUntil && namespace === "local") {
      if (changes.snoozeUntil) {
        if (changes.snoozeUntil.newValue) {
          expirationTimeDiv.textContent = `Snoozed until: ${new Date(changes.snoozeUntil.newValue).toLocaleString()}`;
          snoozeButton.disabled = true;
          cancelButton.disabled = false;
        } else {
          expirationTimeDiv.textContent = "";
          snoozeButton.disabled = false;
          cancelButton.disabled = true;
        }
      }
    }
  });
});
