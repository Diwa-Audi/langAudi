// content.js - Batched translation using background chunk API

// Store original texts for restoration
const originalTexts = new Map();
let isTranslating = false;

// Tuning constants
const BATCH_SIZE = 20; // number of elements per translation request
const CHUNK_DELAY_MS = 50; // delay between batches to avoid rate limiting
const MIN_TEXT_LENGTH = 3; // ignore very short strings

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "TRANSLATE_PAGE") {
    if (!isTranslating) {
      translatePage(message.targetLang || "en");
    } else {
      console.log("Translation already in progress...");
    }
    sendResponse({ success: true });
  } else if (message.type === "RESTORE_PAGE") {
    restoreOriginalPage();
    sendResponse({ success: true });
  }
});

async function translatePage(targetLang) {
  if (isTranslating) return;
  isTranslating = true;
  console.log(`Starting translation to ${targetLang}`);

  // Get all candidate elements
  const nodeList = document.querySelectorAll(
    "p, h1, h2, h3, h4, h5, h6, span, li, a, button, td, th"
  );
  const elements = Array.from(nodeList);
  console.log(`Found ${elements.length} elements`);

  // Clear previous original texts and collect new work items
  originalTexts.clear();

  const workItems = [];
  for (const element of elements) {
    const originalText = element.textContent?.trim();

    // Skip if no text or too short
    if (!originalText || originalText.length < MIN_TEXT_LENGTH) continue;

    // Skip if it looks like non-translatable content
    if (shouldSkipElement(element, originalText)) continue;

    // Store original text for restoration
    const elementId = generateElementId(element);
    originalTexts.set(elementId, { element, originalText });

    workItems.push({ element, originalText });
  }

  console.log(`Prepared ${workItems.length} elements for translation`);

  let translatedCount = 0;

  // Process in batches
  for (let i = 0; i < workItems.length; i += BATCH_SIZE) {
    const batch = workItems.slice(i, i + BATCH_SIZE);
    const texts = batch.map(item => item.originalText);

    try {
      const response = await new Promise(resolve => {
        chrome.runtime.sendMessage(
          { type: "TRANSLATE_CHUNK", texts, target: targetLang },
          resolve
        );
      });

      const translations = Array.isArray(response?.translations)
        ? response.translations
        : texts; // fallback to originals if response malformed

      // Apply translations in order
      batch.forEach((item, idx) => {
        const translated = translations[idx];
        if (translated && translated !== item.originalText) {
          item.element.textContent = translated;
          translatedCount++;
          console.log(
            `✓ [${translatedCount}] ${item.originalText.substring(0, 50)}... → ${translated.substring(0, 50)}...`
          );
        }
      });
    } catch (error) {
      console.error("Batch translation failed:", error);
      // On failure, do nothing for this batch (originals remain)
    }

    // Small delay between batches to avoid overwhelming the API
    await delay(CHUNK_DELAY_MS);
  }

  isTranslating = false;
  console.log(`Translation complete! Translated ${translatedCount} elements.`);
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function shouldSkipElement(element, text) {
  // Skip if element has certain classes
  if (
    element.classList?.contains("no-translate") ||
    element.classList?.contains("notranslate")
  ) {
    return true;
  }

  // Skip if text is just numbers
  if (/^\d+$/.test(text)) return true;

  // Skip if text is all caps (might be constants/codes)
  if (/^[A-Z_\s]+$/.test(text) && text.length < 10) return true;

  // Skip if it looks like email
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) return true;

  // Skip if it looks like URL
  if (/^https?:\/\//.test(text)) return true;

  // Skip if parent is script or style
  const parent = element.parentElement;
  if (parent && ["SCRIPT", "STYLE", "CODE", "PRE"].includes(parent.tagName)) {
    return true;
  }

  return false;
}

function generateElementId(element) {
  return `translate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function restoreOriginalPage() {
  let restoredCount = 0;

  originalTexts.forEach((data) => {
    if (data.element && data.originalText) {
      data.element.textContent = data.originalText;

      restoredCount++;
    }
  });

  originalTexts.clear();
  console.log(`Restored ${restoredCount} elements to original language`);
}

console.log("Page Translator content script loaded (batched mode)");
