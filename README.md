# 🎚️ Video & Audio Manager - Chrome Extension
[![Chrome Web Store Version](https://img.shields.io/chrome-web-store/v/efkidfgpglnlabaphedbiglpdaigfkpj?color=blue)](https://chrome.google.com/webstore/detail/video-audio-manager/efkidfgpglnlabaphedbiglpdaigfkpj)
[![GitHub license](https://img.shields.io/badge/license-MIT-green)](https://github.com/AristarhUcolov/Video-Audio-Manage-Real-Time-Video-and-Audio-Processing/LICENSE)
![Manifest Version](https://img.shields.io/badge/manifest-v3-important)

![image](https://github.com/user-attachments/assets/8adb444c-f407-404b-a5db-65e653b2caee)

**Advanced real-time video and audio processing for any website**  
*Created by Aristarh Ucolov*

## 🌟 Features

### 🎬 Video Enhancements
- **Basic Adjustments**: Brightness, Contrast, Saturation
- **Color Effects**: Hue Rotation, Grayscale, Sepia
- **Special Effects**: Invert Colors, Blur, Sharpness

### 🔊 Audio Processing
- **Volume Control**: Boost up to 200%
- **Bass Management**: ±20dB adjustment
- **Stereo Tools**: Panning, Channel Reverse (L↔R)
- **Audio Effects**: Reverb, Delay/Echo

### 🛠️ Additional Features
- Real-time preview while adjusting
- Preset system (Cinematic, Vintage, Night Mode)
- Custom preset creation
- Import/Export settings
- Dark/Light theme support
- Keyboard shortcuts

## 🚀 Installation

### Chrome Web Store
[![Available in Chrome Web Store](https://storage.googleapis.com/web-dev-uploads/image/WlD8wC6g8khYWPJUsQceQkhXSlv1/UV4C4ybeBTsZt43U4xis.png)](https://chrome.google.com/webstore/detail/efkidfgpglnlabaphedbiglpdaigfkpj)

### Manual Installation
1. Download the latest release
2. Open Chrome and navigate to:
```
chrome://extensions/
```
3. Enable "Developer mode" (toggle in top-right)
4. Click "Load unpacked" and select the extension folder

## 🧩 How It Works

The extension uses:
- Web Audio API for real-time audio processing
- CSS filters for video effects
- MutationObserver to detect new media elements
- Chrome Storage API for settings sync

```javascript
// Example of audio processing
function processAudio(e, settings) {
  const input = e.inputBuffer;
  const output = e.outputBuffer;
  
  for (let channel = 0; channel < output.numberOfChannels; channel++) {
    const inputData = input.getChannelData(channel);
    const outputData = output.getChannelData(channel);
    
    // Apply effects here
    for (let i = 0; i < inputData.length; i++) {
      outputData[i] = inputData[i] * (settings.volume / 100);
    }
  }
}
```

## 📂 Project Structure

```
/extension
  ├── /content         # Content scripts
  ├── /icons           # Extension icons
  ├── /options         # Settings page
  ├── /popup           # Main UI
  ├── background.js    # Background service worker
  ├── manifest.json    # Extension config
  └── README.md        # This file
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

## ☕ Support the Developer

If you enjoy this extension, consider supporting future development:

[![Buy Me A Coffee](https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png)](https://www.buymeacoffee.com/aristarh.ucolov)

## 📧 Contact

**Aristarh Ucolov**  
Email: aristarh.ucolov@gmail.com
GitHub: [@AristarhUcolov](https://github.com/AristarhUcolov)

---

**Transform your browsing experience with professional-grade audio and video controls!** 🎧🎥
