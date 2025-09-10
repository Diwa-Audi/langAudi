document.getElementById('translate').addEventListener('click', async () => {
  const targetLang = document.getElementById('language').value;
  const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
  chrome.tabs.sendMessage(tab.id, {
    type: 'TRANSLATE_PAGE', 
    targetLang: targetLang
  });
});

document.getElementById('restore').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
  chrome.tabs.sendMessage(tab.id, {type: 'RESTORE_PAGE'});
});