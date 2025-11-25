# reTone

A browser extension that uses local AI to rewrite social media posts with different styles and tones.

## Features

- **Multiple Rewriting Modes**: TL;DR, De-buzzword, Brain Rot
- **Privacy First**: All processing happens locally in your browser
- **No Internet Required**: Once initialized, works completely offline

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Load the Extension

You have two options:

**Option 1: Auto-launch (Recommended)**
```bash
npm run dev
```
This will automatically open a new Chromium browser window with the extension loaded.

**Option 2: Manual Load**
1. Run `npm run dev` in your terminal
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right)
4. Click "Load unpacked"
5. Navigate to your project directory
6. Select `.output/chrome-mv3` directory
   - **Note for Mac users**: If you don't see the `.output` folder, press `Command + Shift + Period` to show hidden files

### First Use

1. Click the extension icon in your browser toolbar
2. Click "Initialize Model" (one-time setup, downloads ~300MB-1GB depending on model)
3. Wait for the model to download and initialize
4. Done! The model stays cached locally for future use

## Supported Sites

- **Reddit** - Works on post pages and feeds
- **LinkedIn** - Works on feeds (not profile pages with truncated posts)
- **Local test page** - For development and testing

## Usage

### Manual Mode
1. Visit a supported site (Reddit, LinkedIn, or test page)
2. Look for the rewrite button on posts (styled based on selected mode)
3. Click to rewrite the post in your chosen style
4. Click the toggle button to switch back to original

### Auto Mode
1. Toggle to "Auto" mode in the extension popup
2. Visit a supported site
3. Posts will automatically rewrite as they appear
4. Toggle button appears after rewriting to restore original

### Rewrite Modes
- **TL;DR** - Concise summaries with key points
- **deBuzz** - Removes corporate jargon and buzzwords
- **Brain Rot** - Gen Z slang and internet meme language

## Testing Locally

### Using the Test Page
The extension includes a test page for development:

```bash
# Serve the test page
npx http-server -p 8080

# Open in browser
open http://localhost:8080/test-page.html
```

### Testing on Live Sites
You can also test directly on:
- Any Reddit post or feed page
- LinkedIn feed (avoid profile pages as posts are truncated)

The `npm run dev` command watches for file changes and automatically reloads the extension.

## Tech Stack

- React + TypeScript + Tailwind CSS
- WXT (browser extension framework)
- WebLLM (local AI inference)

## Browser Support

- Chrome 113+
- Edge 113+
- Brave (with WebGPU enabled)

## Contributing

Please check out our [contributing guidelines](CONTRIBUTING.md).

## License

This project is licensed under the [MIT License](LICENSE.md).
