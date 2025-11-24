import type { RewriteMode } from '../types/messages';

export const REWRITE_MODES: Record<RewriteMode, string> = {
  neutralize: 'Neutralize',
  decringe: 'De-cringe',
  debuzzword: 'De-buzzword',
  dehumblebrag: 'De-humblebrag',
  calm: 'Calm mode',
  facts: 'Just the Facts'
};

export const PROMPTS: Record<RewriteMode, string> = {
  neutralize: 'Rewrite the following text into a clear, neutral, non-dramatic version without slang, desperation, or cringe. Keep it concise and professional:\n\n"{TEXT}"\n\nRewritten version:',
  
  decringe: 'Rewrite the following text to remove cringe, excessive enthusiasm, awkwardness, and over-the-top expressions. Make it sound natural and genuine:\n\n"{TEXT}"\n\nRewritten version:',
  
  debuzzword: 'Rewrite the following text to remove buzzwords, jargon, corporate speak, and meaningless filler phrases. Use clear, direct language, be concise, sound less corporate:\n\n"{TEXT}"\n\nRewritten version:',
  
  dehumblebrag: 'Rewrite the following text to remove humble bragging, false modesty, and indirect self-promotion. Be direct and honest:\n\n"{TEXT}"\n\nRewritten version:',
  
  calm: 'Rewrite the following text in a calm, measured, rational tone without drama, urgency, or emotional language. Keep it balanced and composed:\n\n"{TEXT}"\n\nRewritten version:',
  
  facts: 'Rewrite the following text to include only factual information, removing opinions, emotions, speculation, and subjective statements:\n\n"{TEXT}"\n\nRewritten version:'
};

export function getPromptForMode(mode: RewriteMode, text: string): string {
  return PROMPTS[mode].replace('{TEXT}', text);
}

