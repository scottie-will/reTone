// Prompt templates for different rewriting modes
// Each prompt should contain {TEXT} placeholder which will be replaced with actual content

export const PROMPTS = {
  neutralize: `Rewrite the following text into a clear, neutral, non-dramatic version without slang, desperation, or cringe. Keep it concise and professional:

"{TEXT}"

Rewritten version:`,

  decringe: `Rewrite the following text to remove cringe, excessive enthusiasm, awkwardness, and over-the-top expressions. Make it sound natural and genuine:

"{TEXT}"

Rewritten version:`,

  debuzzword: `Rewrite the following text to remove buzzwords, jargon, corporate speak, and meaningless filler phrases. Use clear, direct language:

"{TEXT}"

Rewritten version:`,

  dehumblebrag: `Rewrite the following text to remove humble bragging, false modesty, and indirect self-promotion. Be direct and honest:

"{TEXT}"

Rewritten version:`,

  calm: `Rewrite the following text in a calm, measured, rational tone without drama, urgency, or emotional language. Keep it balanced and composed:

"{TEXT}"

Rewritten version:`,

  facts: `Rewrite the following text to include only factual information, removing opinions, emotions, speculation, and subjective statements:

"{TEXT}"

Rewritten version:`
};

export function buildPrompt(text, mode) {
  const template = PROMPTS[mode] || PROMPTS.neutralize;
  return template.replace('{TEXT}', text);
}

