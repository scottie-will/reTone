/**
 * Base prompt configuration
 * Contains shared instructions for all rewrite modes
 */

export const BASE_SYSTEM_PROMPT = `You are a text rewriting assistant. Follow these rules strictly:

1. Preserve all links and formatting from the input
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
export function buildPrompt(modeInstructions: string, text: string, platform?: string): string {
  let formatInstructions = '';
  let responseExample = '';
  
  if (platform === 'linkedin') {
    formatInstructions = `
CRITICAL - LINKEDIN HTML FORMAT:
The input is LinkedIn HTML and you MUST output LinkedIn HTML in the EXACT same format.

IMPORTANT LINE BREAK RULES:
- LinkedIn does NOT automatically create new lines between <span> tags
- To go to the next line (like \\n), use ONE: <span><br></span>
- To go to the next line AND add a blank line (paragraph break), use TWO: <span><br></span><span><br></span>
- Think of it as:
  * One <span><br></span> = move to next line (no blank line between)
  * Two <span><br></span><span><br></span> = move to next line AND leave a blank line (paragraph break)
- Simply closing one <span> and opening another will NOT create a line break

IMPORTANT LINK RULES:
- ALL links MUST be preserved using <a> tags with href attribute
- Format: <a href="url" target="_blank">link text</a>
- You can rewrite the link text, but you MUST keep the href URL exactly as it appears in the input
- NEVER output plain URLs as text - they must be wrapped in <a> tags
- Example: <span>Check out <a href="https://example.com" target="_blank">this site</a></span>

LinkedIn HTML Structure:
- Plain text with inline elements ONLY
- Single line break (next line): <span><br></span>
- Paragraph break (blank line): <span><br></span><span><br></span>
- Text content: <span>your text here</span>
- Bold: <strong>text</strong>
- Italic: <em>text</em>
- Links: <a href="url" target="_blank">link text</a>
- Lists: Plain text with bullets (•) or numbers (1., 2., etc.)
  Example: <span>• First item</span><span><br></span><span>• Second item</span>
- NEVER use <p>, <ul>, <ol>, <li>, or any block-level tags
- NEVER add wrapper elements

Example with links and line breaks:
Input: 
<span>First line</span><span><br></span><span>Second line (no blank line above)</span><span><br></span><span><br></span><span>Third line (blank line above)</span>

Output (rewritten with same break structure):
<span>My first line</span><span><br></span><span>My second line (no blank line above)</span><span><br></span><span><br></span><span>My third line (blank line above)</span>`;
    
    responseExample = `
<REWRITE>
<span>Line one</span><span><br></span><span>Line two (consecutive)</span><span><br></span><span><br></span><span>Line three (with blank line above)</span>
</REWRITE>`;
  } else {
    formatInstructions = `
OUTPUT FORMAT:
- The input is in Markdown format
- Output your rewritten text as Markdown
- Preserve all links [text](url) and formatting
- Maintain paragraph structure and line breaks`;
    
    responseExample = `
<REWRITE>
your rewritten text here in markdown format
</REWRITE>`;
  }

  return `${BASE_SYSTEM_PROMPT}

${formatInstructions}

${RESPONSE_RULES}

TASK: ${modeInstructions}

TEXT TO REWRITE:
${text}

Remember: Wrap your output in <REWRITE> tags exactly like this:${responseExample}`;
}

