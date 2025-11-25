/**
 * Mode-specific rewriting instructions
 * Each mode focuses on a specific aspect of text improvement
 */

import type { RewriteMode } from '../types/messages';

export const MODE_INSTRUCTIONS: Record<RewriteMode, string> = {
  tldr: 'Create a concise summary of this text. Capture the key points and main ideas. Remove unnecessary details and examples while preserving the core message.',
  
  debuzzword: 'Rewrite this text to remove buzzwords, corporate jargon, meaningless filler phrases, and industry speak. Use clear, direct, simple language.',
  
  brainrot: 'Rewrite this text using brain rot language, Gen Z slang, and internet meme terminology. Use terms like "no cap", "fr fr", "bussin", "sigma", "rizz", "skibidi", "gyat", "fanum tax", "ohio", "mewing", "aura points", and other terminally online slang. Make it sound extremely chronically online and unhinged while keeping the core message.'
};

export const MODE_NAMES: Record<RewriteMode, string> = {
  tldr: 'TL;DR',
  debuzzword: 'De-buzzword',
  brainrot: 'Brain Rot'
};

/**
 * Button text for each mode
 * If a mode has button text defined, the button will display that text
 * Otherwise, it will display the default icon
 */
export const MODE_BUTTON_TEXT: Record<RewriteMode, string | null> = {
  tldr: 'TL;DR',
  debuzzword: 'deBuzz',
  brainrot: 'Rot'
};

