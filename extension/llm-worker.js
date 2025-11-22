// LLM Worker
// Runs WebLLM in a Web Worker to keep UI responsive

// Import WebLLM from local node_modules
import * as webllm from './node_modules/@mlc-ai/web-llm/lib/index.js';
import { buildPrompt } from './prompts/prompts.js';

let engine = null;
let isInitializing = false;

console.log('LLM Worker initialized');

// Listen for messages from main thread
self.addEventListener('message', async (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'INIT_MODEL':
      await initializeModel(payload);
      break;

    case 'REWRITE_TEXT':
      await rewriteText(payload);
      break;

    default:
      console.error('Unknown message type:', type);
  }
});

async function initializeModel(config = {}) {
  // Prevent multiple simultaneous initializations
  if (isInitializing) {
    console.log('Model initialization already in progress');
    return;
  }

  // If already initialized, notify and return
  if (engine) {
    self.postMessage({
      type: 'MODEL_INITIALIZED',
      success: true,
      cached: true
    });
    return;
  }

  isInitializing = true;

  try {
    console.log('Starting WebLLM model initialization...');
    
    const modelId = config.modelId || 'SmolLM2-360M-Instruct-q4f16_1-MLC';
    
    self.postMessage({
      type: 'INIT_PROGRESS',
      progress: 'Starting model download...',
      percent: 0
    });

    // Create WebLLM engine
    engine = await webllm.CreateMLCEngine(modelId, {
      initProgressCallback: (progress) => {
        console.log('Init progress:', progress);
        
        self.postMessage({
          type: 'INIT_PROGRESS',
          progress: progress.text || 'Loading model...',
          percent: progress.progress || 0
        });
      }
    });

    console.log('Model initialized successfully');
    
    self.postMessage({
      type: 'MODEL_INITIALIZED',
      success: true,
      cached: false,
      modelId: modelId
    });

  } catch (error) {
    console.error('Model initialization failed:', error);
    
    engine = null;
    
    self.postMessage({
      type: 'MODEL_INITIALIZED',
      success: false,
      error: error.message || 'Failed to initialize model',
      details: error.toString()
    });
  } finally {
    isInitializing = false;
  }
}

async function rewriteText({ text, mode, requestId }) {
  try {
    // TODO: Use WebLLM to rewrite text based on mode
    const prompt = buildPrompt(text, mode);
    // const result = await engine.chat.completions.create({ ... });
    
    self.postMessage({
      type: 'REWRITE_COMPLETE',
      requestId,
      success: true,
      rewrittenText: text // Placeholder
    });
  } catch (error) {
    self.postMessage({
      type: 'REWRITE_COMPLETE',
      requestId,
      success: false,
      error: error.message
    });
  }
}

