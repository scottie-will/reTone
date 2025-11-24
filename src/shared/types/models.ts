// Model configuration types

export interface ModelConfig {
  modelId: string;
  temperature: number;
  maxTokens: number;
}

export const DEFAULT_MODEL_CONFIG: ModelConfig = {
  modelId: 'Llama-3.2-1B-Instruct-q4f16_1-MLC',
  temperature: 0.7,
  maxTokens: 500
};

export interface InitProgressUpdate {
  progress: string;
  percent: number;
}

