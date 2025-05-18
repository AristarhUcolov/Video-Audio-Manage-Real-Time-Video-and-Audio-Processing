// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "applySettings") {
    window.postMessage({
      type: 'FROM_EXTENSION',
      action: 'applySettings',
      settings: request.settings
    }, '*');
    sendResponse({success: true});
  }
  return true;
});

// Listen for messages from page script
window.addEventListener('message', (event) => {
  if (event.data.type === 'FROM_PAGE' && event.data.action === 'ready') {
    chrome.runtime.sendMessage({action: "getSettings"}, (response) => {
      if (response) {
        window.postMessage({
          type: 'FROM_EXTENSION',
          action: 'applySettings',
          settings: response
        }, '*');
      }
    });
  }
});

// Inject processor script
const script = document.createElement('script');
script.src = chrome.runtime.getURL('content/video-audio-processor.js');
(document.head || document.documentElement).appendChild(script);