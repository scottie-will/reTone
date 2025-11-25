/**
 * LLM Worker - Runs WebLLM in a Web Worker to keep UI responsive
 * Using defineUnlistedScript to properly bundle this worker with WXT
 */

import { defineUnlistedScript } from 'wxt/sandbox';

export default defineUnlistedScript(async () => {
  // Dynamic imports to avoid executing browser-only code during build
  const webllm = await import('@mlc-ai/web-llm');
  const { getPromptForMode } = await import('@/shared/constants/prompts');
  const { DEFAULT_MODEL_CONFIG } = await import('@/shared/types/models');
  const { logger } = await import('../shared/utils/logger');

logger.log('[Worker] LLM Worker script loading...');
  logger.log('[Worker] WebLLM imported');

  let engine: any = null;
let isInitializing = false;

logger.log('[Worker] LLM Worker initialized and ready');

// Listen for messages from main thread
  self.addEventListener('message', async (event: MessageEvent) => {
  logger.log('[Worker] Received message:', event.data);
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
      logger.log('[Worker] Model initialization already in progress');
    return;
  }

  // If already initialized, notify and return
  if (engine) {
      logger.log('[Worker] Model already initialized');
    self.postMessage({
      type: 'MODEL_INITIALIZED',
      success: true,
      cached: true
    });
    return;
  }

  isInitializing = true;

  try {
      logger.log('[Worker] Starting WebLLM model initialization...');

      const modelId = config.modelId || DEFAULT_MODEL_CONFIG.modelId;
      logger.log('[Worker] Model ID:', modelId);
    
    self.postMessage({
      type: 'INIT_PROGRESS',
      progress: 'Starting model download...',
      percent: 0
    });

    // Create WebLLM engine
      logger.log('[Worker] Creating MLC Engine...');
    engine = await webllm.CreateMLCEngine(modelId, {
        initProgressCallback: (progress: any) => {
          logger.log('[Worker] Init progress:', progress);
        
        self.postMessage({
          type: 'INIT_PROGRESS',
          progress: progress.text || 'Loading model...',
          percent: progress.progress || 0
        });
      }
    });

      logger.log('[Worker] Model initialized successfully!');
    
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
    logger.log('[Worker] rewriteText called with:', payload);
  
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
      logger.log(`[Worker] Rewriting text with mode: ${mode}`);
      logger.log('[Worker] Text to rewrite:', text);

    const prompt = getPromptForMode(mode, text);
      logger.log('[Worker] Prompt:', prompt);
    
    // Use WebLLM to generate rewrite
    const messages = [
      {
        role: 'user',
        content: prompt
      }
    ];

    const response = await engine.chat.completions.create({
      messages,
      temperature: DEFAULT_MODEL_CONFIG.temperature,
      max_tokens: DEFAULT_MODEL_CONFIG.maxTokens,
      top_p: 0.9        // Nucleus sampling for quality
    });

    let rewrittenText = response.choices[0].message.content;
    
      logger.log('[Worker] Raw response:', rewrittenText);
    
    // Extract content between <REWRITE> and </REWRITE> tags
    if (rewrittenText) {
      const match = rewrittenText.match(/<REWRITE>([\s\S]*?)<\/REWRITE>/);
      if (match && match[1]) {
        rewrittenText = match[1].trim();
          logger.log('[Worker] Extracted rewritten text:', rewrittenText);
      } else {
        // Fallback: if tags not found, use the whole response (trimmed)
          console.warn('[Worker] <REWRITE> tags not found, using full response');
        rewrittenText = rewrittenText.trim();
      }
    }
    
      logger.log('[Worker] Final rewrite:', rewrittenText);
    
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
