// Message types for extension communication

export type RewriteMode = 'tldr' | 'debuzzword' | 'brainrot';
export type BehaviorMode = 'manual' | 'auto';

export interface ExtensionState {
  enabled: boolean;
  rewriteMode: RewriteMode;
  behaviorMode: BehaviorMode;
  modelLoaded: boolean;
}

// Messages from popup/content to background
export type MessageToBackground =
  | { type: 'GET_STATE' }
  | { type: 'INIT_MODEL' }
  | { type: 'SET_ENABLED'; enabled: boolean }
  | { type: 'SET_REWRITE_MODE'; mode: RewriteMode }
  | { type: 'SET_BEHAVIOR_MODE'; behavior: BehaviorMode }
  | { type: 'REWRITE_TEXT'; text: string; mode?: RewriteMode; requestId: string };

// Messages from background to popup/content
export type MessageFromBackground =
  | { type: 'STATE_UPDATED'; state: ExtensionState }
  | { type: 'STATE_CHANGED'; state: ExtensionState }
  | { type: 'INIT_PROGRESS'; progress: string; percent: number }
  | { type: 'INIT_ERROR'; error: string }
  | { type: 'REWRITE_COMPLETE'; requestId: string; rewrittenText: string }
  | { type: 'MODEL_INITIALIZED'; success: boolean; error?: string };

// Generic response type
export interface MessageResponse {
  success: boolean;
  error?: string;
  [key: string]: any;
}

