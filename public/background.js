console.log("Background script loaded");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Background received message:", message.type, message);
  
  // ... rest of your code
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Handle single text translation (your original code)
    if (message.type === "TRANSLATE_TEXT") {
    console.log("Background: translating single text", message.text.substring(0, 30));
    
    translateSingleText(message.text, message.target || "en")
      .then(translatedText => {
        sendResponse({ translatedText });
      })
      .catch(err => {
        console.error("Single translation failed:", err);
        sendResponse({ translatedText: message.text });
      });
    
    return true;
  }
  
  // Handle chunk translation (needed for your content script)
  if (message.type === "TRANSLATE_CHUNK") {
    console.log(`Background: translating chunk of ${message.texts.length} items`);
    
    translateChunk(message.texts, message.target || "en")
      .then(translations => {
        sendResponse({ translations });
      })
      .catch(err => {
        console.error("Chunk translation failed:", err);
        sendResponse({ translations: message.texts });
      });
    
    return true;
  }
});

// Alternative: MyMemory API (free, no key needed)
async function translateSingleText(text, targetLanguage) {
  try {
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=auto|${targetLanguage}`
    );
    const data = await response.json();
    return data.responseData.translatedText || text;
  } catch (error) {
    console.error("Translation failed:", error);
    return text;
  }
}

async function translateChunk(texts, targetLanguage) {
  try {
    const translations = await Promise.allSettled(
      texts.map(text => translateSingleText(text, targetLanguage))
    );
    
    return translations.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        console.error(`Translation failed for text ${index}:`, result.reason);
        return texts[index];
      }
    });
    
  } catch (error) {
    console.error("Chunk translation error:", error);
    return texts;
  }
}
});