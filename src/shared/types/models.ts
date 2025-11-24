// Model configuration types

export interface ModelConfig {
  modelId: string;
  temperature: number;
  maxTokens: number;
}

export const DEFAULT_MODEL_CONFIG: ModelConfig = {
  modelId: 'Llama-3.2-3B-Instruct-q4f16_1-MLC',
  temperature: 0.7,
  maxTokens: 20000  // Increased for longer posts 
};

// Extract display name from model ID
export function getModelDisplayName(modelId: string): string {
  // Remove mlc-ai/ prefix, quantization suffix (-q4f16_1-MLC or -q0f16-MLC), and -Instruct suffix
  return modelId
    .replace(/^mlc-ai\//i, '')
    .replace(/-q\d+f\d+(_\d+)?-MLC$/i, '')
    .replace(/-Instruct$/i, '');
}

export const MODEL_DISPLAY_NAME = getModelDisplayName(DEFAULT_MODEL_CONFIG.modelId);

// Get Hugging Face URL for a model
export function getModelHuggingFaceUrl(modelId: string): string {
  // Extract base model name without quantization
  const cleanName = modelId
    .replace(/^mlc-ai\//i, '')
    .replace(/-q\d+f\d+(_\d+)?-MLC$/i, '');
  
  // Map common models to their HF repos
  if (cleanName.startsWith('Llama-3.2')) {
    return `https://huggingface.co/meta-llama/${cleanName}`;
  } else if (cleanName.startsWith('SmolLM2')) {
    return `https://huggingface.co/HuggingFaceTB/${cleanName}`;
  } else if (cleanName.startsWith('Qwen')) {
    return `https://huggingface.co/Qwen/${cleanName}`;
  } else if (cleanName.startsWith('Phi-')) {
    return `https://huggingface.co/microsoft/${cleanName}`;
  }
  
  // Default fallback
  return `https://huggingface.co/models?search=${encodeURIComponent(cleanName)}`;
}

export const MODEL_HUGGINGFACE_URL = getModelHuggingFaceUrl(DEFAULT_MODEL_CONFIG.modelId);

export interface InitProgressUpdate {
  progress: string;
  percent: number;
}

