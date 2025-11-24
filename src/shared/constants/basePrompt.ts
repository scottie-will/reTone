/**
 * Base prompt configuration
 * Contains shared instructions for all rewrite modes
 */

export const BASE_SYSTEM_PROMPT = `You are a text rewriting assistant. Follow these rules strictly:

1. The input is in Markdown format - preserve all links [text](url) and formatting
2. Maintain paragraph structure and line breaks
3. You MUST wrap your rewritten text between these exact delimiters:
   <REWRITE>
   your rewritten text here
   </REWRITE>
4. Do NOT include ANY text outside these delimiters
5. The delimiters must be on their own lines`;

export const RESPONSE_RULES = `
CRITICAL OUTPUT FORMAT:
Your entire response must follow this exact structure:

<REWRITE>
[The rewritten text goes here]
</REWRITE>

Do NOT add:
- Any text before <REWRITE>
- Any text after </REWRITE>
- Preambles, explanations, or commentary`;

/**
 * Combine base instructions with mode-specific instructions
 */
export function buildPrompt(modeInstructions: string, text: string): string {
  return `${BASE_SYSTEM_PROMPT}

${RESPONSE_RULES}

TASK: ${modeInstructions}

TEXT TO REWRITE:
${text}

Remember: Wrap your output in <REWRITE> tags like this:
<REWRITE>
your rewritten text here
</REWRITE>`;
}

