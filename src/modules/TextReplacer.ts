import type { BaseAdapter } from '@/adapters/BaseAdapter';
import TurndownService from 'turndown';
import { marked } from 'marked';

/**
 * Text Replacer - Handles text extraction and replacement
 * Preserves HTML structure using Markdown conversion
 */
export class TextReplacer {
  private adapter: BaseAdapter;
  private turndownService: TurndownService;

  constructor(adapter: BaseAdapter) {
    this.adapter = adapter;
    
    // Initialize markdown converter
    this.turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
      emDelimiter: '*',
      strongDelimiter: '**'
    });
  }

  /**
   * Extract text content from a post as markdown
   * Preserves links, formatting, and structure
   */
  extractText(post: HTMLElement): string {
    const textElement = this.adapter.getTextElement(post);
    if (!textElement) {
      throw new Error('No text element found in post');
    }
    
    const siteName = this.adapter.getSiteName();
    
    if (siteName === 'linkedin') {
      // LinkedIn: Return raw HTML directly
      return textElement.innerHTML.trim();
    } else {
      // Other platforms: Convert HTML to Markdown to preserve structure and links
      const markdown = this.turndownService.turndown(textElement.innerHTML);
      return markdown.trim();
    }
  }

  /**
   * Replace text in a post
   * Accepts markdown and converts back to HTML
   */
  replaceText(post: HTMLElement, newText: string): void {
    const textElement = this.adapter.getTextElement(post);
    if (!textElement) {
      throw new Error('No text element found in post');
    }

    const dataset = textElement.dataset as { originalHtml?: string; originalStyles?: string };

    // Store original HTML if not already stored
    if (!dataset.originalHtml) {
      dataset.originalHtml = textElement.innerHTML;
      dataset.originalStyles = textElement.getAttribute('style') || '';
    }

    const siteName = this.adapter.getSiteName();
    let html: string;

    if (siteName === 'linkedin') {
      // LinkedIn: LLM already generated HTML in the correct format
      // Just insert it directly - no conversion needed!
      html = newText;
    } else {
      // Reddit and other platforms: Convert markdown to HTML
      html = marked.parse(newText, { async: false }) as string;
    }

    // Replace HTML content
    textElement.innerHTML = html;

    // Mark as rewritten
    (post.dataset as { rewritten?: string }).rewritten = 'true';
  }

  /**
   * Restore original HTML in a post
   */
  restoreOriginal(post: HTMLElement): void {
    const textElement = this.adapter.getTextElement(post);
    if (!textElement) return;
    
    const dataset = textElement.dataset as { originalHtml?: string };
    if (!dataset.originalHtml) return;
    
    textElement.innerHTML = dataset.originalHtml;
    delete (post.dataset as { rewritten?: string }).rewritten;
  }

  /**
   * Check if post has been rewritten
   */
  isRewritten(post: HTMLElement): boolean {
    return (post.dataset as { rewritten?: string }).rewritten === 'true';
  }

  /**
   * Get original text if available
   */
  getOriginalText(post: HTMLElement): string | null {
    const textElement = this.adapter.getTextElement(post);
    if (!textElement) return null;
    
    const dataset = textElement.dataset as { originalHtml?: string };
    if (!dataset.originalHtml) return null;
    
    return this.turndownService.turndown(dataset.originalHtml);
  }
}

