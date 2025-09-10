console.log("Background script loaded and ready");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Background received message:", message.type, message);
  
  if (message.type === "TRANSLATE_TEXT") {
    console.log("Translating single text:", message.text.substring(0, 30) + "...");
    
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
  
  if (message.type === "TRANSLATE_CHUNK") {
    console.log(`Translating chunk of ${message.texts.length} items`);
    
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

async function translateSingleText(text, targetLanguage) {
  if (!text || !text.trim()) return text;
  
  try {
    // Try Lingva Translate API (LibreTranslate alternative)
    const response = await fetch(
      `https://lingva.ml/api/v1/auto/${targetLanguage}/${encodeURIComponent(text)}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.translation) {
      console.log(`Translation: "${text}" → "${data.translation}"`);
      return data.translation;
    } else {
      console.warn("No translation returned");
      return text;
    }
  } catch (error) {
    console.error("Lingva translation failed:", error);
    
    // Fallback: try a simple mock translation for testing
    if (targetLanguage === 'es') {
      return text + ' (ES)'; // Just append (ES) to test if the flow works
    }
    
    return text;
  }
}

async function translateChunk(texts, targetLanguage) {
  try {
    const translations = [];
    
    for (let i = 0; i < texts.length; i++) {
      const result = await translateSingleText(texts[i], targetLanguage);
      translations.push(result);
      
      // Small delay to avoid rate limiting
      if (i < texts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return translations;
  } catch (error) {
    console.error("Chunk translation error:", error);
    return texts;
  }
}