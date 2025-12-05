# 🎚️ Video & Audio Manager - Chrome Extension
[![Chrome Web Store Version](https://img.shields.io/chrome-web-store/v/efkidfgpglnlabaphedbiglpdaigfkpj?color=blue)](https://chrome.google.com/webstore/detail/video-audio-manager/efkidfgpglnlabaphedbiglpdaigfkpj)
[![GitHub license](https://img.shields.io/badge/license-GPL--3.0-blue)](https://github.com/AristarhUcolov/Video-Audio-Manage-Real-Time-Video-and-Audio-Processing/blob/main/LICENSE)
![Manifest Version](https://img.shields.io/badge/manifest-v3-important)
![Version](https://img.shields.io/badge/version-1.3.1-brightgreen)

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
- Preset system (Cinematic, Vintage, Night Mode, Bass Boost, Voice Clarity)
- Custom preset creation
- Import/Export settings
- Dark/Light theme support
- Keyboard shortcuts (Toggle: `Ctrl+Shift+V`, Reset: `Ctrl+Shift+R`)
- Settings sync across tabs
- Auto-detection of new media elements

## 🚀 Installation

### Chrome Web Store
[![Available in Chrome Web Store](https://storage.googleapis.com/web-dev-uploads/image/WlD8wC6g8khYWPJUsQceQkhXSlv1/UV4C4ybeBTsZt43U4xis.png)](https://chrome.google.com/webstore/detail/efkidfgpglnlabaphedbiglpdaigfkpj)

### Manual Installation
1. Download or clone this repository
2. Open Chrome and navigate to:
```
chrome://extensions/
```
3. Enable "Developer mode" (toggle in top-right corner)
4. Click "Load unpacked" and select the extension folder

## 🌐 Browser Compatibility

| Browser | Supported | Notes |
|---------|-----------|-------|
| Google Chrome | ✅ Yes | Fully supported (Manifest V3) |
| Microsoft Edge | ✅ Yes | Chromium-based, fully compatible |
| Brave | ✅ Yes | Chromium-based, fully compatible |
| Opera | ✅ Yes | Chromium-based, fully compatible |
| Firefox | ❌ No | Requires Manifest V2 adaptation |
| Safari | ❌ No | Different extension architecture |

## 🧩 How It Works

The extension uses:
- **Web Audio API** for real-time audio processing (volume boost, bass, reverb, delay, stereo effects)
- **CSS filters** for video effects (brightness, contrast, saturation, hue, etc.)
- **MutationObserver** to automatically detect new media elements on the page
- **Chrome Storage API** for syncing settings across browser sessions and tabs

```javascript
// Example: Applying video effects using CSS filters
function applyVideoEffects(element, videoSettings) {
    const filters = [];
    
    if (videoSettings.brightness !== 100) filters.push(`brightness(${videoSettings.brightness}%)`);
    if (videoSettings.contrast !== 100) filters.push(`contrast(${videoSettings.contrast}%)`);
    if (videoSettings.saturation !== 100) filters.push(`saturate(${videoSettings.saturation}%)`);
    if (videoSettings.hue !== 0) filters.push(`hue-rotate(${videoSettings.hue}deg)`);
    if (videoSettings.blur > 0) filters.push(`blur(${videoSettings.blur}px)`);
    
    element.style.filter = filters.join(' ');
}
```

## 📂 Project Structure

```
├── content/                 # Content scripts injected into web pages
│   ├── content.js          # Message bridge between extension and page
│   └── video-audio-processor.js  # Core processing logic
├── icons/                   # Extension icons
│   └── icon.png            # Main icon (48x48, 128x128)
├── options/                 # Extension options/settings page
│   ├── options.css         # Options page styles
│   ├── options.html        # Options page structure
│   └── options.js          # Options page logic
├── popup/                   # Extension popup UI
│   ├── popup.css           # Popup styles
│   ├── popup.html          # Popup structure
│   └── popup.js            # Popup logic
├── background.js            # Service worker for background tasks
├── manifest.json            # Chrome extension configuration
├── LICENSE                  # GPL-3.0 license
└── README.md                # This documentation
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📜 License

Distributed under the GNU General Public License v3.0. See [`LICENSE`](LICENSE) for more information.

## ☕ Support the Developer

If you enjoy this extension, consider supporting future development:

[![Buy Me A Coffee](https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png)](https://www.buymeacoffee.com/aristarh.ucolov)

## 📧 Contact

**Aristarh Ucolov**  
Email: aristarh.ucolov@gmail.com
GitHub: [@AristarhUcolov](https://github.com/AristarhUcolov)

---

**Transform your browsing experience with professional-grade audio and video controls!** 🎧🎥
