document.addEventListener('DOMContentLoaded', function() {
    let currentSettings = {
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
        enabled: true
    };
    let saveTimeout;

    // Tab switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${tabId}-tab`) {
                    content.classList.add('active');
                }
            });
        });
    });
    
    function loadSettings() {
        chrome.storage.sync.get(['videoSettings', 'audioSettings', 'enabled', 'uiTheme'], (data) => {
            if (data.videoSettings) {
                currentSettings.videoSettings = data.videoSettings;
            }
            if (data.audioSettings) {
                currentSettings.audioSettings = {
                    ...currentSettings.audioSettings,
                    ...data.audioSettings
                };
            }
            if (typeof data.enabled !== 'undefined') {
                currentSettings.enabled = data.enabled;
            }

            updateUIWithSettings();
            sendSettingsToContent();
            
            // Apply theme
            if (data.uiTheme) {
                document.body.className = data.uiTheme;
            }
        });
    }
    
    function updateUIWithSettings() {
        document.getElementById('extensionToggle').checked = currentSettings.enabled;
        document.getElementById('toggleStatus').textContent = currentSettings.enabled ? 'Enabled' : 'Disabled';
        
        // Video settings
        setSliderValue('brightness', currentSettings.videoSettings.brightness);
        setSliderValue('contrast', currentSettings.videoSettings.contrast);
        setSliderValue('saturation', currentSettings.videoSettings.saturation);
        setSliderValue('sharpness', currentSettings.videoSettings.sharpness);
        setSliderValue('hue', currentSettings.videoSettings.hue);
        setSliderValue('grayscale', currentSettings.videoSettings.grayscale);
        setSliderValue('invert', currentSettings.videoSettings.invert);
        setSliderValue('sepia', currentSettings.videoSettings.sepia);
        setSliderValue('blur', currentSettings.videoSettings.blur);
        
        // Audio settings
        setSliderValue('volume', currentSettings.audioSettings.volume);
        setSliderValue('bass', currentSettings.audioSettings.bass);
        setSliderValue('pan', currentSettings.audioSettings.pan);
        setSliderValue('reverbLevel', currentSettings.audioSettings.reverbLevel);
        setSliderValue('delayLevel', currentSettings.audioSettings.delayLevel);
        
        document.getElementById('stereoReverse').checked = currentSettings.audioSettings.stereoReverse || false;
        document.getElementById('reverb').checked = currentSettings.audioSettings.reverb || false;
        document.getElementById('delay').checked = currentSettings.audioSettings.delay || false;
        
        toggleDependentControls();
    }
    
    function setSliderValue(id, value) {
        const slider = document.getElementById(id);
        if (slider) {
            slider.value = value;
            updateSliderDisplay(id, value);
        }
    }
    
    function updateSliderDisplay(id, value) {
        const displayElement = document.getElementById(`${id}Value`);
        if (!displayElement) return;
        
        switch (id) {
            case 'brightness':
            case 'contrast':
            case 'saturation':
            case 'volume':
                displayElement.textContent = `${value}%`;
                break;
            case 'sharpness':
                displayElement.textContent = value;
                break;
            case 'hue':
                displayElement.textContent = `${value}°`;
                break;
            case 'grayscale':
            case 'invert':
            case 'sepia':
            case 'reverbLevel':
            case 'delayLevel':
                displayElement.textContent = `${value}%`;
                break;
            case 'blur':
                displayElement.textContent = `${value}px`;
                break;
            case 'bass':
                displayElement.textContent = `${value}dB`;
                break;
            case 'pan':
                if (value === 0) {
                    displayElement.textContent = 'Center';
                } else if (value < 0) {
                    displayElement.textContent = `Left ${Math.abs(value)}%`;
                } else {
                    displayElement.textContent = `Right ${value}%`;
                }
                break;
            default:
                displayElement.textContent = value;
        }
    }
    
    function toggleDependentControls() {
        const reverbChecked = document.getElementById('reverb').checked;
        const delayChecked = document.getElementById('delay').checked;
        
        document.getElementById('reverbLevelGroup').style.display = reverbChecked ? 'block' : 'none';
        document.getElementById('delayLevelGroup').style.display = delayChecked ? 'block' : 'none';
    }
    
    document.getElementById('extensionToggle').addEventListener('change', function() {
        currentSettings.enabled = this.checked;
        document.getElementById('toggleStatus').textContent = this.checked ? 'Enabled' : 'Disabled';
        
        sendSettingsToContent();
        chrome.storage.sync.set({ enabled: currentSettings.enabled });
    });
    
    const videoControls = ['brightness', 'contrast', 'saturation', 'sharpness', 'hue', 
                         'grayscale', 'invert', 'sepia', 'blur'];
    
    videoControls.forEach(control => {
        const slider = document.getElementById(control);
        if (slider) {
            slider.addEventListener('input', () => {
                const value = parseInt(slider.value);
                updateSliderDisplay(control, value);
                
                currentSettings.videoSettings[control] = value;
                slider.classList.add('active');
                
                sendSettingsToContent();
                scheduleSave();
                
                setTimeout(() => {
                    slider.classList.remove('active');
                }, 300);
            });
        }
    });
    
    const audioSliders = ['volume', 'bass', 'pan', 'reverbLevel', 'delayLevel'];
    
    audioSliders.forEach(control => {
        const slider = document.getElementById(control);
        if (slider) {
            slider.addEventListener('input', () => {
                const value = parseInt(slider.value);
                updateSliderDisplay(control, value);
                
                currentSettings.audioSettings[control] = value;
                slider.classList.add('active');
                
                sendSettingsToContent();
                scheduleSave();
                
                setTimeout(() => {
                    slider.classList.remove('active');
                }, 300);
            });
        }
    });
    
    const audioCheckboxes = ['stereoReverse', 'reverb', 'delay'];
    
    audioCheckboxes.forEach(control => {
        const checkbox = document.getElementById(control);
        if (checkbox) {
            checkbox.addEventListener('change', () => {
                const checked = checkbox.checked;
                currentSettings.audioSettings[control] = checked;
                
                sendSettingsToContent();
                scheduleSave();
                toggleDependentControls();
            });
        }
    });
    
    function scheduleSave() {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            chrome.storage.sync.set({
                videoSettings: currentSettings.videoSettings,
                audioSettings: currentSettings.audioSettings
            });
        }, 500);
    }
    
    function sendSettingsToContent() {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if (tabs[0]?.id) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: "applySettings",
                    settings: currentSettings
                }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.log("Cannot send message to tab:", chrome.runtime.lastError);
                    }
                });
            }
        });
    }

    // Preset handling
    document.getElementById('applyPresetBtn').addEventListener('click', applyPreset);
    document.getElementById('savePresetBtn').addEventListener('click', savePreset);
    document.getElementById('deletePresetBtn').addEventListener('click', deletePreset);
    document.getElementById('exportBtn').addEventListener('click', exportSettings);
    document.getElementById('importBtn').addEventListener('click', () => {
        document.getElementById('importFile').click();
    });
    document.getElementById('importFile').addEventListener('change', importSettings);

    // Donation buttons
    document.getElementById('coffeeBtn').addEventListener('click', () => {
        window.open('https://www.buymeacoffee.com/aristarh.ucolov', '_blank');
    });

    // Quick actions
    document.getElementById('resetBtn').addEventListener('click', resetSettings);
    document.getElementById('advancedBtn').addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
    });

    function applyPreset() {
        const presetSelect = document.getElementById('presetSelect');
        const presetName = presetSelect.value;
        
        if (presetName === 'default') {
            resetSettings();
            return;
        }
        
        chrome.storage.sync.get(['customPresets'], (data) => {
            const customPresets = data.customPresets || {};
            const builtInPresets = getBuiltInPresets();
            const allPresets = {...builtInPresets, ...customPresets};
            
            if (allPresets[presetName]) {
                currentSettings = {
                    videoSettings: {...allPresets[presetName].videoSettings},
                    audioSettings: {...allPresets[presetName].audioSettings},
                    enabled: true
                };
                
                updateUIWithSettings();
                sendSettingsToContent();
                
                chrome.storage.sync.set({
                    videoSettings: currentSettings.videoSettings,
                    audioSettings: currentSettings.audioSettings,
                    lastPreset: presetName
                });
                
                updatePresetDescription(presetName);
            }
        });
    }
    
    function getBuiltInPresets() {
        return {
            cinematic: {
                videoSettings: {
                    brightness: 90, contrast: 120, saturation: 90,
                    sharpness: 10, hue: 0, grayscale: 0,
                    invert: 0, sepia: 0, blur: 0
                },
                audioSettings: {
                    volume: 100, bass: 5, pan: 0,
                    reverb: false, reverbLevel: 30,
                    delay: false, delayLevel: 30,
                    stereoReverse: false
                }
            },
            vintage: {
                videoSettings: {
                    brightness: 95, contrast: 110, saturation: 85,
                    sharpness: -5, hue: 0, grayscale: 0,
                    invert: 0, sepia: 40, blur: 1
                },
                audioSettings: {
                    volume: 100, bass: 2, pan: 0,
                    reverb: true, reverbLevel: 25,
                    delay: false, delayLevel: 30,
                    stereoReverse: false
                }
            },
            night: {
                videoSettings: {
                    brightness: 70, contrast: 90, saturation: 80,
                    sharpness: 5, hue: 0, grayscale: 0,
                    invert: 0, sepia: 0, blur: 0
                },
                audioSettings: {
                    volume: 80, bass: -2, pan: 0,
                    reverb: false, reverbLevel: 30,
                    delay: false, delayLevel: 30,
                    stereoReverse: false
                }
            },
            bassBoost: {
                videoSettings: {
                    brightness: 100, contrast: 100, saturation: 100,
                    sharpness: 0, hue: 0, grayscale: 0,
                    invert: 0, sepia: 0, blur: 0
                },
                audioSettings: {
                    volume: 100, bass: 12, pan: 0,
                    reverb: false, reverbLevel: 30,
                    delay: false, delayLevel: 30,
                    stereoReverse: false
                }
            },
            voiceClarity: {
                videoSettings: {
                    brightness: 100, contrast: 100, saturation: 100,
                    sharpness: 5, hue: 0, grayscale: 0,
                    invert: 0, sepia: 0, blur: 0
                },
                audioSettings: {
                    volume: 100, bass: -5, pan: 0,
                    reverb: false, reverbLevel: 30,
                    delay: false, delayLevel: 30,
                    stereoReverse: false
                }
            }
        };
    }
    
    function savePreset() {
        const presetName = prompt("Enter a name for your preset:");
        if (!presetName) return;
        
        chrome.storage.sync.get(['customPresets'], (data) => {
            const customPresets = data.customPresets || {};
            customPresets[presetName] = {
                videoSettings: {...currentSettings.videoSettings},
                audioSettings: {...currentSettings.audioSettings}
            };
            
            chrome.storage.sync.set({ customPresets }, () => {
                updatePresetDropdown();
                document.getElementById('presetSelect').value = presetName;
                updatePresetDescription(presetName);
                alert(`Preset "${presetName}" saved successfully!`);
            });
        });
    }
    
    function deletePreset() {
        const presetSelect = document.getElementById('presetSelect');
        const presetName = presetSelect.value;
        
        const builtInPresets = ['default', 'cinematic', 'vintage', 'night', 'bassBoost', 'voiceClarity'];
        if (builtInPresets.includes(presetName)) {
            alert("Cannot delete built-in presets!");
            return;
        }
        
        if (!confirm(`Are you sure you want to delete the "${presetName}" preset?`)) {
            return;
        }
        
        chrome.storage.sync.get(['customPresets'], (data) => {
            const customPresets = data.customPresets || {};
            
            if (customPresets[presetName]) {
                delete customPresets[presetName];
                
                chrome.storage.sync.set({ customPresets }, () => {
                    updatePresetDropdown();
                    presetSelect.value = 'default';
                    updatePresetDescription('default');
                });
            } else {
                alert("Preset not found!");
            }
        });
    }
    
    function updatePresetDropdown() {
        chrome.storage.sync.get(['customPresets', 'lastPreset'], (data) => {
            const presetSelect = document.getElementById('presetSelect');
            const customPresets = data.customPresets || {};
            
            while (presetSelect.options.length > 6) {
                presetSelect.remove(6);
            }
            
            Object.keys(customPresets).forEach(presetName => {
                const option = document.createElement('option');
                option.value = presetName;
                option.textContent = presetName;
                presetSelect.appendChild(option);
            });
            
            if (data.lastPreset) {
                presetSelect.value = data.lastPreset;
            }
            
            updatePresetDescription(presetSelect.value);
        });
    }
    
    function updatePresetDescription(presetName) {
        const descriptions = {
            default: "Reset all settings to default values.",
            cinematic: "Enhances contrast and color for a movie-like experience with slightly boosted bass.",
            vintage: "Gives a warm, old-school look with subtle sepia tone and slight blur, audio has a vintage radio effect.",
            night: "Reduces brightness and blue light for comfortable night viewing, with softer audio.",
            bassBoost: "Significantly boosts bass frequencies for powerful low-end response.",
            voiceClarity: "Enhances vocal frequencies and reduces bass for clearer dialogue."
        };
        
        const customDescription = "Custom preset. No description available.";
        document.getElementById('presetDescription').textContent = 
            descriptions[presetName] || customDescription;
    }
    
    function exportSettings() {
        chrome.storage.sync.get(['videoSettings', 'audioSettings', 'customPresets'], (data) => {
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
    
    function importSettings(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const settings = JSON.parse(event.target.result);
                
                if (settings.videoSettings || settings.audioSettings || settings.customPresets) {
                    chrome.storage.sync.set(settings, () => {
                        loadSettings();
                        updatePresetDropdown();
                        alert('Settings imported successfully!');
                    });
                } else {
                    alert('Invalid settings file format!');
                }
            } catch (err) {
                alert('Error parsing settings file: ' + err.message);
            }
        };
        reader.readAsText(file);
        
        e.target.value = '';
    }
    
    function resetSettings() {
        if (!confirm("Are you sure you want to reset all settings to default?")) {
            return;
        }
        
        currentSettings = {
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
            enabled: true
        };
        
        updateUIWithSettings();
        sendSettingsToContent();
        
        chrome.storage.sync.set({
            videoSettings: currentSettings.videoSettings,
            audioSettings: currentSettings.audioSettings,
            lastPreset: 'default'
        });
        
        document.getElementById('presetSelect').value = 'default';
        updatePresetDescription('default');
    }

    // Initialize
    loadSettings();
    updatePresetDropdown();
    
    // Add tooltips
    addTooltips();
    
    function addTooltips() {
        const tooltips = {
            'brightness': 'Adjusts the overall lightness/darkness of the video',
            'contrast': 'Controls the difference between light and dark areas',
            'saturation': 'Changes the intensity of colors',
            'sharpness': 'Adjusts edge definition (positive) or softens image (negative)',
            'hue': 'Rotates all colors by the specified angle',
            'grayscale': 'Converts the image to grayscale at the specified percentage',
            'invert': 'Inverts the colors of the video',
            'sepia': 'Applies a vintage sepia tone effect',
            'blur': 'Adds Gaussian blur to the video',
            'volume': 'Adjusts the overall volume level',
            'bass': 'Boosts or reduces low frequencies',
            'pan': 'Controls stereo balance (left/right)',
            'stereoReverse': 'Swaps left and right audio channels',
            'reverb': 'Adds ambient room simulation effect',
            'delay': 'Adds echo/delay effect to the audio'
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
});