/**
 * Mode-specific rewriting instructions
 * Each mode focuses on a specific aspect of text improvement
 */

import type { RewriteMode } from '../types/messages';

export const MODE_INSTRUCTIONS: Record<RewriteMode, string> = {
  tldr: 'Create a concise summary of this text. Capture the key points and main ideas. Remove unnecessary details and examples while preserving the core message.',
  
  neutralize: 'Rewrite this text to be neutral and professional. Remove slang, desperation, cringe, and overly dramatic language. Keep it concise and measured.',
  
  decringe: 'Rewrite this text to remove cringe-worthy content, excessive enthusiasm, awkwardness, and over-the-top expressions. Make it sound natural and genuine.',
  
  debuzzword: 'Rewrite this text to remove buzzwords, corporate jargon, meaningless filler phrases, and industry speak. Use clear, direct, simple language.',
  
  dehumblebrag: 'Rewrite this text to remove humble bragging, false modesty, indirect self-promotion, and thinly veiled boasting. Be straightforward and honest.',
  
  calm: 'Rewrite this text in a calm, measured, rational tone. Remove drama, urgency, panic, and emotional language. Keep it balanced and composed.',
  
  facts: 'Rewrite this text to include only factual, objective information. Remove opinions, emotions, speculation, subjective statements, and personal feelings.'
};

export const MODE_NAMES: Record<RewriteMode, string> = {
  tldr: 'TL;DR',
  neutralize: 'Neutralize',
  decringe: 'De-cringe',
  debuzzword: 'De-buzzword',
  dehumblebrag: 'De-humblebrag',
  calm: 'Calm Mode',
  facts: 'Just the Facts'
};

