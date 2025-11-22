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
  console.log('Worker received message:', event.data);
  const { type, payload } = event.data;

  switch (type) {
    case 'INIT_MODEL':
      await initializeModel(payload);
      break;

    case 'REWRITE_TEXT':
      if (!payload) {
        console.error('REWRITE_TEXT received with no payload');
        self.postMessage({
          type: 'REWRITE_COMPLETE',
          success: false,
          error: 'No payload provided'
        });
      } else {
        await rewriteText(payload);
      }
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

async function rewriteText(payload) {
  console.log('rewriteText called with:', payload);
  
  if (!payload || typeof payload !== 'object') {
    console.error('Invalid payload:', payload);
    self.postMessage({
      type: 'REWRITE_COMPLETE',
      success: false,
      error: 'Invalid payload'
    });
    return;
  }
  
  const { text, mode, requestId } = payload;
  
  if (!engine) {
    self.postMessage({
      type: 'REWRITE_COMPLETE',
      requestId,
      success: false,
      error: 'Model not initialized'
    });
    return;
  }

  try {
    console.log(`Rewriting text with mode: ${mode}`);
    console.log('Text to rewrite:', text);
    
    const prompt = buildPrompt(text, mode);
    console.log('Prompt:', prompt);
    
    // Use WebLLM to generate rewrite
    const messages = [
      {
        role: 'user',
        content: prompt
      }
    ];

    const response = await engine.chat.completions.create({
      messages,
      temperature: 0.7,
      max_tokens: 256
    });

    const rewrittenText = response.choices[0].message.content;
    console.log('Rewrite complete:', rewrittenText);
    
    self.postMessage({
      type: 'REWRITE_COMPLETE',
      requestId,
      success: true,
      originalText: text,
      rewrittenText: rewrittenText
    });
  } catch (error) {
    console.error('Rewrite error:', error);
    self.postMessage({
      type: 'REWRITE_COMPLETE',
      requestId,
      success: false,
      error: error.message
    });
  }
}

