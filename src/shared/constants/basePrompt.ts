/**
 * Base prompt configuration
 * Contains shared instructions for all rewrite modes
 */

export const BASE_SYSTEM_PROMPT = `You are a text rewriting assistant. Follow these rules strictly:

1. ONLY return the rewritten text - no preamble, no commentary, no quotes
2. The input is in Markdown format - preserve all links [text](url) and formatting
3. Maintain paragraph structure and line breaks
4. Do not explain what you're doing - just return the rewritten content
5. Do not add "Here's the rewritten version" or similar phrases
6. Start your response with the actual rewritten content immediately`;

export const RESPONSE_RULES = `
CRITICAL: Your response must contain ONLY the rewritten text. Do not include:
- Preambles like "Sure, here's..." or "Here is..."
- Explanations of what you did
- Quotes around the response
- "Rewritten version:" or similar labels`;

/**
 * Combine base instructions with mode-specific instructions
 */
export function buildPrompt(modeInstructions: string, text: string): string {
  return `${BASE_SYSTEM_PROMPT}

${RESPONSE_RULES}

TASK: ${modeInstructions}

TEXT TO REWRITE:
${text}`;
}

