# Social Media Rewriter

A browser extension that uses local AI (WebLLM) to rewrite social media posts, removing cringe, buzzwords, humblebrag, and excessive drama.

## Features

- **Local AI Processing**: Runs Llama-3.2-1B entirely in your browser using WebGPU
- **Multiple Rewriting Modes**:
  - Neutralize: Remove drama and cringe
  - De-cringe: Remove excessive enthusiasm
  - De-buzzword: Remove corporate jargon
  - De-humblebrag: Remove false modesty
  - Calm mode: Tone down urgency
  - Just the Facts: Keep only factual content
- **Manual & Auto Modes**: Choose when posts are rewritten
- **Privacy First**: No data leaves your browser

## Tech Stack

- **WXT**: Next-gen framework for browser extensions
- **React 18**: Modern UI components
- **TypeScript**: Full type safety
- **Tailwind CSS**: Utility-first styling
- **WebLLM**: Local AI inference with WebGPU
- **Vite**: Fast build tooling

## Project Structure

```
sentiment-rewrite/
├── public/
│   ├── icons/              # Extension icons
│   ├── llm-worker.js       # WebLLM worker
│   └── offscreen.html      # Offscreen document
├── src/
│   ├── adapters/           # Site-specific DOM adapters
│   │   ├── BaseAdapter.ts
│   │   ├── TestPageAdapter.ts
│   │   ├── RedditAdapter.ts (TODO)
│   │   └── LinkedInAdapter.ts (TODO)
│   ├── components/
│   │   ├── content/        # Content script React components
│   │   └── popup/          # Popup React components
│   ├── entrypoints/        # WXT entry points
│   │   ├── background.ts   # Background service worker
│   │   ├── content.tsx     # Content script
│   │   ├── offscreen.ts    # Offscreen document
│   │   └── popup/          # Popup UI
│   ├── modules/            # Core functionality
│   │   ├── DOMScanner.ts
│   │   ├── MessageHandler.ts
│   │   └── TextReplacer.ts
│   ├── shared/             # Shared code
│   │   ├── constants/
│   │   ├── types/
│   │   └── utils/
│   └── styles/
└── wxt.config.ts
```

## Development

### Prerequisites

- Node.js 18+ 
- Chrome/Edge 113+ (WebGPU support)
- ~1GB free RAM for model

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Create distribution zip
npm run zip
```

### Loading the Extension

1. Run `npm run dev`
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `.output/chrome-mv3` directory

### Testing

#### Option 1: Local Test Server (Recommended)
```bash
# Install a simple HTTP server (if you don't have one)
npm install -g http-server

# Serve the test page
http-server -p 8080

# Open http://localhost:8080/test-page.html in your browser
```

#### Option 2: File Access (Requires Extra Setup)
1. Go to `chrome://extensions/`
2. Find "Social Media Rewriter"
3. Enable "Allow access to file URLs"
4. Open `test-page.html` directly from your filesystem

## How It Works

### Architecture

1. **Background Worker**: Manages extension state and coordinates between components
2. **Offscreen Document**: Hosts the Web Worker (service workers can't create workers)
3. **Web Worker**: Runs WebLLM for AI inference using WebGPU
4. **Content Script**: Scans pages, injects buttons, manages text replacement
5. **Popup**: User interface for controlling the extension

### Message Flow

```
User clicks button → Content Script → Background → Offscreen → Worker
                                                               ↓
User sees result ← Content Script ← Background ← Offscreen ← Worker
```

### Adapter Pattern

The extension uses adapters to support different social media sites:

- Each site has unique DOM structure
- Adapters provide site-specific selectors
- Easy to add new platforms

## Model Information

- **Model**: Llama-3.2-1B-Instruct-q4f16_1-MLC
- **Size**: ~200-300MB
- **Speed**: 40-80 tokens/second
- **Memory**: ~500-800MB RAM
- **Storage**: Browser cache (persistent)

First initialization downloads the model (~30-90 seconds). Subsequent loads are instant.

## Configuration

### Adding New Modes

Edit `src/shared/constants/prompts.ts`:

```typescript
export const PROMPTS: Record<RewriteMode, string> = {
  // Add your new mode here
  mymode: 'Your prompt template with {TEXT} placeholder',
};
```

### Supporting New Sites

1. Create adapter in `src/adapters/NewSiteAdapter.ts`
2. Extend `BaseAdapter`
3. Implement required methods
4. Add to `content.tsx` adapter list

## Browser Support

- ✅ Chrome 113+
- ✅ Edge 113+
- ✅ Brave (with WebGPU enabled)
- ❌ Firefox (no WebGPU yet)
- ❌ Safari (limited WebGPU)

## Performance

- Model loads once, stays cached
- Inference: ~2-5 seconds per post
- Minimal impact on page performance
- All processing happens locally

## Privacy

- No data sent to servers
- No tracking or analytics
- Model runs entirely in browser
- Original text stored only in DOM

## TODO

- [ ] Implement Reddit adapter
- [ ] Implement LinkedIn adapter
- [ ] Add Twitter/X support
- [ ] Add Facebook support
- [ ] Streaming inference for longer posts
- [ ] Custom prompts
- [ ] Dark mode
- [ ] Keyboard shortcuts

## License

MIT

## Credits

- Built with [WXT](https://wxt.dev/)
- AI powered by [WebLLM](https://github.com/mlc-ai/web-llm)
- Model: [Llama 3.2](https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct)

