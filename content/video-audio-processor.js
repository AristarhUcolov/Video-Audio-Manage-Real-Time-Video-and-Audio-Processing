(function() {
    const processedElements = new WeakMap();
    let activeSettings = {
        enabled: true,
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
        }
    };

    // Audio processing buffers
    const delayBuffer = { left: [], right: [] };
    const delayBufferSize = 44100 * 2;
    let delayWritePointer = 0;
    let lastReverbSamples = [];

    function processMediaElement(element) {
        if (!activeSettings.enabled) {
            resetElement(element);
            return;
        }

        if (element instanceof HTMLVideoElement) {
            applyVideoEffects(element, activeSettings.videoSettings);
        }

        if (element.audioContext || needsAudioProcessing(element)) {
            setupAudioContext(element);
        }
    }

    function needsAudioProcessing(element) {
        const audio = activeSettings.audioSettings;
        return (element instanceof HTMLAudioElement || element instanceof HTMLVideoElement) &&
               (audio.volume !== 100 || audio.bass !== 0 || audio.pan !== 0 ||
                audio.stereoReverse || audio.reverb || audio.delay);
    }

    function setupAudioContext(element) {
        if (element.audioContext) return;

        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const audioContext = new AudioContext();
            const source = audioContext.createMediaElementSource(element);
            const processor = audioContext.createScriptProcessor(8192, 2, 2);

            element.audioContext = audioContext;
            element.audioSource = source;
            element.audioProcessor = processor;

            source.connect(processor);
            processor.connect(audioContext.destination);

            processor.onaudioprocess = (e) => processAudio(e, activeSettings.audioSettings);
        } catch (e) {
            console.error("Video & Audio Manager: Error creating audio context", e);
        }
    }

    function processAudio(e, audioSettings) {
        if (!audioSettings || !activeSettings.enabled) return;

        const inputBuffer = e.inputBuffer;
        const outputBuffer = e.outputBuffer;
        const volume = audioSettings.volume / 100;
        const bassBoost = 1 + (audioSettings.bass / 20);

        for (let channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
            const outputData = outputBuffer.getChannelData(channel);
            
            // Determine source channel (swap if stereo reverse is enabled)
            let sourceChannel = channel;
            if (audioSettings.stereoReverse && outputBuffer.numberOfChannels === 2) {
                sourceChannel = 1 - channel; // Swap left and right channels
            }
            
            const sourceData = inputBuffer.getChannelData(sourceChannel);

            // Apply panning
            let panValue = 1;
            if (outputBuffer.numberOfChannels === 2) {
                panValue = audioSettings.pan / 100;
                if (channel === 0) { // Left channel
                    panValue = Math.max(0, 1 - Math.abs(panValue));
                } else { // Right channel
                    panValue = Math.max(0, 1 + panValue);
                }
            }

            // Process each sample
            for (let i = 0; i < sourceData.length; i++) {
                let sample = sourceData[i] * volume * panValue;

                // Apply bass boost
                if (i > 0 && audioSettings.bass !== 0) {
                    sample = (sample * 0.7) + (outputData[i-1] * 0.3 * bassBoost);
                }

                // Apply delay effect
                if (audioSettings.delay) {
                    const delaySample = getDelayedSample(channel, i, audioSettings.delayLevel);
                    sample = sample * 0.7 + delaySample * 0.3;
                }

                // Apply reverb effect
                if (audioSettings.reverb) {
                    if (!lastReverbSamples[channel]) lastReverbSamples[channel] = [];
                    const reverbAmount = audioSettings.reverbLevel / 100;
                    
                    if (i > 0) {
                        sample = sample * 0.6 + lastReverbSamples[channel][i-1] * 0.4 * reverbAmount;
                    }
                    if (i > 100) {
                        sample = sample * 0.8 + lastReverbSamples[channel][i-100] * 0.2 * reverbAmount;
                    }
                    
                    lastReverbSamples[channel][i] = sample;
                }

                outputData[i] = Math.max(-1, Math.min(1, sample));
            }

            // Store for delay effect
            if (audioSettings.delay) {
                storeForDelay(channel, outputData);
            }
        }
    }

    function storeForDelay(channel, data) {
        const channelName = channel === 0 ? 'left' : 'right';
        if (!delayBuffer[channelName]) delayBuffer[channelName] = new Array(delayBufferSize).fill(0);
        
        for (let i = 0; i < data.length; i++) {
            delayBuffer[channelName][(delayWritePointer + i) % delayBufferSize] = data[i];
        }
    }

    function getDelayedSample(channel, index, delayLevel) {
        const channelName = channel === 0 ? 'left' : 'right';
        if (!delayBuffer[channelName]) return 0;
        
        const delaySamples = Math.floor(delayLevel * 44100 / 1000);
        const readPos = (delayWritePointer + index - delaySamples + delayBufferSize) % delayBufferSize;
        return delayBuffer[channelName][readPos] || 0;
    }

    function applyVideoEffects(element, videoSettings) {
        const filters = [];
        
        if (videoSettings.brightness !== 100) filters.push(`brightness(${videoSettings.brightness}%)`);
        if (videoSettings.contrast !== 100) filters.push(`contrast(${videoSettings.contrast}%)`);
        if (videoSettings.saturation !== 100) filters.push(`saturate(${videoSettings.saturation}%)`);
        if (videoSettings.hue !== 0) filters.push(`hue-rotate(${videoSettings.hue}deg)`);
        if (videoSettings.grayscale > 0) filters.push(`grayscale(${videoSettings.grayscale}%)`);
        if (videoSettings.sepia > 0) filters.push(`sepia(${videoSettings.sepia}%)`);
        if (videoSettings.invert > 0) filters.push(`invert(${videoSettings.invert}%)`);
        if (videoSettings.blur > 0) filters.push(`blur(${videoSettings.blur}px)`);
        
        element.style.filter = filters.join(' ');
        element.style.willChange = 'filter';
    }

    function resetElement(element) {
        element.style.filter = '';
        element.style.willChange = '';
        
        if (element.audioContext) {
            try {
                element.audioSource.disconnect(element.audioProcessor);
                element.audioProcessor.disconnect(element.audioContext.destination);
                element.audioContext.close();
                
                delete element.audioContext;
                delete element.audioSource;
                delete element.audioProcessor;
            } catch (e) {
                console.error("Error resetting audio context:", e);
            }
        }
    }

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    if (node instanceof HTMLVideoElement || node instanceof HTMLAudioElement) {
                        processMediaElement(node);
                    }
                    
                    const mediaElements = node.querySelectorAll('video, audio');
                    mediaElements.forEach((el) => processMediaElement(el));
                }
            });
        });
    });

    window.addEventListener('message', (event) => {
        if (event.data.type === 'FROM_EXTENSION' && event.data.action === 'applySettings') {
            if (event.data.settings.videoSettings) {
                activeSettings.videoSettings = event.data.settings.videoSettings;
            }
            if (event.data.settings.audioSettings) {
                activeSettings.audioSettings = event.data.settings.audioSettings;
            }
            if (typeof event.data.settings.enabled !== 'undefined') {
                activeSettings.enabled = event.data.settings.enabled;
            }

            document.querySelectorAll('video, audio').forEach(el => {
                processMediaElement(el);
            });
        }
    });

    observer.observe(document, {
        childList: true,
        subtree: true
    });

    document.querySelectorAll('video, audio').forEach(el => {
        processMediaElement(el);
    });

    window.postMessage({
        type: 'FROM_PAGE',
        action: 'ready'
    }, '*');

    setInterval(() => {
        delayWritePointer = (delayWritePointer + 44100) % delayBufferSize;
    }, 1000);
})();