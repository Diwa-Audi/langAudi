console.log("Popup script loaded");

document.addEventListener('DOMContentLoaded', () => {
  const translateButton = document.getElementById('translate');
  const restoreButton = document.getElementById('restore');
  const languageSelect = document.getElementById('language');

  translateButton.addEventListener('click', async () => {
    console.log("Translate button clicked");
    
    try {
      const targetLang = languageSelect.value;
      console.log("Target language:", targetLang);
      
      // Get the active tab
      const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
      console.log("Active tab:", tab.url);
      
      // Check if we can translate this page
      if (tab.url.startsWith('chrome://') || tab.url.startsWith('moz-extension://')) {
        alert("Cannot translate browser pages. Try a regular website.");
        return;
      }
      
      // Send message to content script
      chrome.tabs.sendMessage(tab.id, {
        type: 'TRANSLATE_PAGE',
        targetLang: targetLang
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error("Translation message failed:", chrome.runtime.lastError.message);
          alert("Extension failed to connect. Try refreshing the page and try again.");
        } else {
          console.log("Translation initiated:", response);
        }
      });
      
    } catch (error) {
      console.error("Translation error:", error);
      alert("Translation failed: " + error.message);
    }
  });

  restoreButton.addEventListener('click', async () => {
    console.log("Restore button clicked");
    
    try {
      const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
      
      chrome.tabs.sendMessage(tab.id, {
        type: 'RESTORE_PAGE'
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error("Restore message failed:", chrome.runtime.lastError.message);
        } else {
          console.log("Page restored:", response);
        }
      });
      
    } catch (error) {
      console.error("Restore error:", error);
    }
  });
});