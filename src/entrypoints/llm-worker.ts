/**
 * LLM Worker - Runs WebLLM in a Web Worker to keep UI responsive
 * Using defineUnlistedScript to properly bundle this worker with WXT
 */

import { defineUnlistedScript } from 'wxt/sandbox';

export default defineUnlistedScript(async () => {
  // Dynamic imports to avoid executing browser-only code during build
  const webllm = await import('@mlc-ai/web-llm');
  const { getPromptForMode } = await import('@/shared/constants/prompts');

console.log('[Worker] LLM Worker script loading...');
  console.log('[Worker] WebLLM imported');

  let engine: any = null;
let isInitializing = false;

console.log('[Worker] LLM Worker initialized and ready');

// Listen for messages from main thread
  self.addEventListener('message', async (event: MessageEvent) => {
  console.log('[Worker] Received message:', event.data);
  const { type, payload } = event.data;

    try {
  switch (type) {
    case 'INIT_MODEL':
      await initializeModel(payload);
      break;

    case 'REWRITE_TEXT':
      if (!payload) {
            throw new Error('No payload provided');
          }
        await rewriteText(payload);
      break;

    default:
          console.error('[Worker] Unknown message type:', type);
      }
    } catch (error) {
      console.error('[Worker] Error handling message:', error);
      self.postMessage({
        type: 'ERROR',
        error: error instanceof Error ? error.message : String(error)
      });
  }
});

  async function initializeModel(config: any = {}): Promise<void> {
  // Prevent multiple simultaneous initializations
  if (isInitializing) {
      console.log('[Worker] Model initialization already in progress');
    return;
  }

  // If already initialized, notify and return
  if (engine) {
      console.log('[Worker] Model already initialized');
    self.postMessage({
      type: 'MODEL_INITIALIZED',
      success: true,
      cached: true
    });
    return;
  }

  isInitializing = true;

  try {
      console.log('[Worker] Starting WebLLM model initialization...');
    
              const modelId = config.modelId || 'Phi-4-mini-instruct-q4f16_1-MLC';
      console.log('[Worker] Model ID:', modelId);
    
    self.postMessage({
      type: 'INIT_PROGRESS',
      progress: 'Starting model download...',
      percent: 0
    });

    // Create WebLLM engine
      console.log('[Worker] Creating MLC Engine...');
    engine = await webllm.CreateMLCEngine(modelId, {
        initProgressCallback: (progress: any) => {
          console.log('[Worker] Init progress:', progress);
        
        self.postMessage({
          type: 'INIT_PROGRESS',
          progress: progress.text || 'Loading model...',
          percent: progress.progress || 0
        });
      }
    });

      console.log('[Worker] Model initialized successfully!');
    
    self.postMessage({
      type: 'MODEL_INITIALIZED',
      success: true,
      cached: false,
      modelId: modelId
    });

  } catch (error) {
      console.error('[Worker] Model initialization failed:', error);
    
    engine = null;
    
    self.postMessage({
      type: 'MODEL_INITIALIZED',
      success: false,
        error: error instanceof Error ? error.message : 'Failed to initialize model',
        details: error instanceof Error ? error.stack : String(error)
    });
  } finally {
    isInitializing = false;
  }
}

  async function rewriteText(payload: any): Promise<void> {
    console.log('[Worker] rewriteText called with:', payload);
  
  if (!payload || typeof payload !== 'object') {
      throw new Error('Invalid payload');
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
      console.log(`[Worker] Rewriting text with mode: ${mode}`);
      console.log('[Worker] Text to rewrite:', text);
    
    const prompt = getPromptForMode(mode, text);
      console.log('[Worker] Prompt:', prompt);
    
    // Use WebLLM to generate rewrite
    const messages = [
      {
        role: 'user',
        content: prompt
      }
    ];

    const response = await engine.chat.completions.create({
      messages,
      temperature: 0.5,  // Lower temp = more focused, less creative
      max_tokens: 20000,   // Increased for longer posts
      top_p: 0.9        // Nucleus sampling for quality
    });

    let rewrittenText = response.choices[0].message.content;
    
    // Clean up response
    if (rewrittenText) {
      rewrittenText = rewrittenText.trim();
      
      // Remove surrounding quotes (single or double)
      if ((rewrittenText.startsWith('"') && rewrittenText.endsWith('"')) ||
          (rewrittenText.startsWith("'") && rewrittenText.endsWith("'"))) {
        rewrittenText = rewrittenText.slice(1, -1).trim();
      }
    }
    
      console.log('[Worker] Rewrite complete:', rewrittenText);
    
    self.postMessage({
      type: 'REWRITE_COMPLETE',
      requestId,
      success: true,
      originalText: text,
      rewrittenText: rewrittenText
    });
  } catch (error) {
      console.error('[Worker] Rewrite error:', error);
    self.postMessage({
      type: 'REWRITE_COMPLETE',
      requestId,
      success: false,
        error: error instanceof Error ? error.message : String(error)
    });
  }
}
});
