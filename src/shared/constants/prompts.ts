/**
 * Main prompt generator
 * Combines base instructions with mode-specific instructions
 */

import type { RewriteMode } from '../types/messages';
import { buildPrompt } from './basePrompt';
import { MODE_INSTRUCTIONS, MODE_NAMES } from './modeInstructions';

// Re-export mode names for use in UI
export const REWRITE_MODES = MODE_NAMES;

/**
 * Generate a complete prompt for a specific rewrite mode
 */
export function getPromptForMode(mode: RewriteMode, text: string, platform?: string): string {
  const modeInstruction = MODE_INSTRUCTIONS[mode];
  return buildPrompt(modeInstruction, text, platform);
}

