import React, { useState } from 'react';

const App: React.FC = () => {
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = async (targetLang: string) => {
    setIsTranslating(true);
    
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    chrome.tabs.sendMessage(tab.id!, {
      type: 'TRANSLATE_PAGE', 
      targetLang: targetLang
    });
    
    setIsTranslating(false);
  };

  const handleRestore = async () => {
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    chrome.tabs.sendMessage(tab.id!, {type: 'RESTORE_PAGE'});
  };

  return (
    <div style={{ padding: '16px', width: '250px' }}>
      <h3>Page Translator</h3>
      
      <select style={{ width: '100%', marginBottom: '10px', padding: '5px' }}>
        <option value="es">Spanish</option>
        <option value="fr">French</option>
        <option value="de">German</option>
        <option value="hi">Hindi</option>
      </select>
      
      <button 
        onClick={() => handleTranslate('es')} 
        disabled={isTranslating}
        style={{ width: '100%', marginBottom: '10px', padding: '10px' }}
      >
        {isTranslating ? 'Translating...' : 'Translate Page'}
      </button>
      
      <button 
        onClick={handleRestore}
        style={{ width: '100%', padding: '10px' }}
      >
        Restore Original
      </button>
    </div>
  );
};

export default App;