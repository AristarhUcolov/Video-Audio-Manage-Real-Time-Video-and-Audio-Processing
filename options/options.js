document.addEventListener('DOMContentLoaded', function() {
  function loadSettings() {
    chrome.storage.sync.get([
      'processingMode', 'maxAudioChannels', 'disableForBackgroundTabs',
      'toggleShortcut', 'resetShortcut', 'reverbQuality',
      'uiTheme', 'showTooltips'
    ], (data) => {
      document.getElementById('processingMode').value = data.processingMode || 'auto';
      document.getElementById('maxAudioChannels').value = data.maxAudioChannels || 2;
      document.getElementById('disableForBackgroundTabs').checked = data.disableForBackgroundTabs !== false;
      document.getElementById('toggleShortcut').value = data.toggleShortcut || 'Ctrl+Shift+V';
      document.getElementById('resetShortcut').value = data.resetShortcut || 'Ctrl+Shift+R';
      document.getElementById('reverbQuality').value = data.reverbQuality || 'medium';
      document.getElementById('uiTheme').value = data.uiTheme || 'dark';
      document.getElementById('showTooltips').checked = data.showTooltips !== false;
      
      document.body.className = data.uiTheme || 'dark';
      
      if (data.showTooltips !== false) {
        addTooltips();
      }
    });
  }
  
  function addTooltips() {
    const tooltips = {
      'processingMode': 'Auto: Balances quality and performance\nHigh: Best quality, higher CPU usage\nLow: Reduced quality, lower CPU usage',
      'maxAudioChannels': 'Maximum number of audio channels to process simultaneously',
      'disableForBackgroundTabs': 'Disables audio processing for tabs in background to save CPU',
      'reverbQuality': 'Controls the quality of reverb effect (higher = more CPU intensive)'
    };
    
    Object.entries(tooltips).forEach(([id, text]) => {
      const element = document.getElementById(id);
      if (element) {
        const label = element.closest('.control-group')?.querySelector('label');
        if (label && !label.querySelector('.tooltiptext')) {
          label.classList.add('tooltip');
          const tooltipSpan = document.createElement('span');
          tooltipSpan.className = 'tooltiptext';
          tooltipSpan.textContent = text;
          label.appendChild(tooltipSpan);
        }
      }
    });
  }
  
  function saveSettings() {
    const settings = {
      processingMode: document.getElementById('processingMode').value,
      maxAudioChannels: parseInt(document.getElementById('maxAudioChannels').value) || 2,
      disableForBackgroundTabs: document.getElementById('disableForBackgroundTabs').checked,
      toggleShortcut: document.getElementById('toggleShortcut').value,
      resetShortcut: document.getElementById('resetShortcut').value,
      reverbQuality: document.getElementById('reverbQuality').value,
      uiTheme: document.getElementById('uiTheme').value,
      showTooltips: document.getElementById('showTooltips').checked
    };
    
    chrome.storage.sync.set(settings, () => {
      const status = document.createElement('div');
      status.textContent = 'Settings saved!';
      status.style.position = 'fixed';
      status.style.bottom = '20px';
      status.style.right = '20px';
      status.style.backgroundColor = '#4CAF50';
      status.style.color = 'white';
      status.style.padding = '10px 20px';
      status.style.borderRadius = '3px';
      status.style.zIndex = '1000';
      document.body.appendChild(status);
      
      setTimeout(() => {
        document.body.removeChild(status);
      }, 2000);
      
      document.body.className = settings.uiTheme;
    });
  }
  
  function setShortcut(inputId, commandName) {
    const input = document.getElementById(inputId);
    input.placeholder = 'Press a key combination...';
    input.value = '';
    
    function keyDownHandler(e) {
      e.preventDefault();
      
      const keys = [];
      if (e.ctrlKey) keys.push('Ctrl');
      if (e.shiftKey) keys.push('Shift');
      if (e.altKey) keys.push('Alt');
      if (e.metaKey) keys.push('Cmd');
      
      if (!['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) {
        keys.push(e.key.toUpperCase());
      }
      
      const shortcut = keys.join('+');
      input.value = shortcut;
      
      document.removeEventListener('keydown', keyDownHandler);
      input.placeholder = '';
      
      chrome.storage.sync.set({ [commandName]: shortcut });
    }
    
    document.addEventListener('keydown', keyDownHandler);
  }
  
  function exportAllSettings() {
    chrome.storage.sync.get(null, (data) => {
      const settingsStr = JSON.stringify(data, null, 2);
      const blob = new Blob([settingsStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'video_audio_manager_settings.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }
  
  function importAllSettings(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const settings = JSON.parse(event.target.result);
        chrome.storage.sync.set(settings, () => {
          alert('All settings imported successfully!');
          loadSettings();
        });
      } catch (err) {
        alert('Error parsing settings file: ' + err.message);
      }
    };
    reader.readAsText(file);
    
    e.target.value = '';
  }
  
  function resetToDefaults() {
    if (confirm('Are you sure you want to reset ALL settings to defaults?')) {
      chrome.storage.sync.set({
        videoSettings: {
          brightness: 100, contrast: 100, saturation: 100,
          sharpness: 0, hue: 0, grayscale: 0,
          invert: 0, sepia: 0, blur: 0
        },
        audioSettings: {
          volume: 100, bass: 0, pan: 0,
          reverb: false, reverbLevel: 30,
          delay: false, delayLevel: 30,
          stereoReverse: false
        },
        enabled: true,
        lastPreset: 'default',
        processingMode: 'auto',
        maxAudioChannels: 2,
        disableForBackgroundTabs: true,
        toggleShortcut: 'Ctrl+Shift+V',
        resetShortcut: 'Ctrl+Shift+R',
        reverbQuality: 'medium',
        uiTheme: 'dark',
        showTooltips: true
      }, () => {
        alert('All settings have been reset to defaults!');
        loadSettings();
      });
    }
  }

  // Event listeners
  document.getElementById('setToggleShortcut').addEventListener('click', () => {
    setShortcut('toggleShortcut', 'toggleShortcut');
  });
  
  document.getElementById('setResetShortcut').addEventListener('click', () => {
    setShortcut('resetShortcut', 'resetShortcut');
  });
  
  document.getElementById('exportAllSettings').addEventListener('click', exportAllSettings);
  document.getElementById('importAllSettings').addEventListener('click', () => {
    document.getElementById('importAllSettingsFile').click();
  });
  document.getElementById('importAllSettingsFile').addEventListener('change', importAllSettings);
  document.getElementById('resetToDefaults').addEventListener('click', resetToDefaults);
  document.getElementById('saveSettings').addEventListener('click', saveSettings);
  document.getElementById('cancelChanges').addEventListener('click', () => {
    window.close();
  });
  
  document.getElementById('uiTheme').addEventListener('change', function() {
    document.body.className = this.value;
  });

  // Initialize
  loadSettings();
});