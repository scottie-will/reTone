// Extension configuration constants

export const EXTENSION_NAME = 'Social Media Rewriter';

export const STORAGE_KEYS = {
  ENABLED: 'enabled',
  REWRITE_MODE: 'rewriteMode',
  BEHAVIOR_MODE: 'behaviorMode',
  MODEL_LOADED: 'modelLoaded'
} as const;

export const DEFAULT_STATE = {
  enabled: false,
  rewriteMode: 'neutralize' as const,
  behaviorMode: 'manual' as const,
  modelLoaded: false
};

