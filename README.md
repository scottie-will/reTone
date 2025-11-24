# reTone

A browser extension that uses local AI to rewrite social media posts with different styles and tones.

## Features

- **Multiple Rewriting Modes**: TL;DR, Neutralize, De-cringe, De-buzzword, De-humblebrag, Calm mode, Just the Facts
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

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `.output/chrome-mv3` directory

### First Use

1. Click the extension icon in your browser
2. Click "Initialize Model" (one-time setup, downloads ~300MB)
3. Wait for the model to download
4. Done! The model stays cached for future use

## Usage

1. Visit a supported site (Reddit, LinkedIn, or the test page)
2. Look for the rewrite button on posts
3. Click to rewrite the post
4. Click again to toggle back to original

## Testing Locally

```bash
# Serve the test page
npx http-server -p 8080

# Open http://localhost:8080/test-page.html
```

## Tech Stack

- React + TypeScript + Tailwind CSS
- WXT (browser extension framework)
- WebLLM (local AI inference)

## Browser Support

- Chrome 113+ ✅
- Edge 113+ ✅
- Brave (with WebGPU enabled) ✅

## License

MIT
