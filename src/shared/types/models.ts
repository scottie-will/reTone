// Model configuration types

export interface ModelConfig {
  modelId: string;
  temperature: number;
  maxTokens: number;
}

export const DEFAULT_MODEL_CONFIG: ModelConfig = {
  modelId: 'Phi-4-mini-instruct-q4f16_1-MLC',
  temperature: 0.7,
  maxTokens: 500
};

export interface InitProgressUpdate {
  progress: string;
  percent: number;
}

