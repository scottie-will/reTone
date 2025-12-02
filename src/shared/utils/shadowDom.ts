/**
 * Shadow DOM utility for CSS isolation
 * Manages stylesheet injection into shadow roots
 */

// Import CSS as raw string using Vite's ?inline query
import styles from '../../styles/global.css?inline';
import { logger } from './logger';

let sharedStyleSheet: CSSStyleSheet | null = null;

/**
 * Initialize and cache the stylesheet for the extension
 * This should be called once when the content script loads
 */
export async function initializeStylesheet(): Promise<void> {
  if (sharedStyleSheet) {
    return; // Already initialized
  }

  try {
    logger.log('[ShadowDOM] Initializing stylesheet, length:', styles.length);

    // Try to use Constructable Stylesheets if supported
    if ('CSSStyleSheet' in window && 'adoptedStyleSheets' in Document.prototype) {
      sharedStyleSheet = new CSSStyleSheet();
      await sharedStyleSheet.replace(styles);
      logger.log('[ShadowDOM] Using Constructable Stylesheets (modern approach)');
    } else {
      logger.log('[ShadowDOM] Browser does not support Constructable Stylesheets, will use style element fallback');
    }
  } catch (error) {
    logger.error('[ShadowDOM] Failed to initialize stylesheet:', error);
    throw error;
  }
}

/**
 * Create a shadow root with injected styles
 * @param host The element to attach the shadow root to
 * @returns The shadow root with styles injected
 */
export function createStyledShadowRoot(host: HTMLElement): ShadowRoot {
  const shadowRoot = host.attachShadow({ mode: 'open' });

  // Inject styles into the shadow root
  if (sharedStyleSheet && 'adoptedStyleSheets' in shadowRoot) {
    // Use adopted stylesheets (modern, efficient)
    (shadowRoot as any).adoptedStyleSheets = [sharedStyleSheet];
    logger.log('[ShadowDOM] Styles injected via adoptedStyleSheets');
  } else {
    // Fallback: inject style tag with raw styles
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    shadowRoot.appendChild(styleElement);
    logger.log('[ShadowDOM] Styles injected via style element');
  }

  return shadowRoot;
}

/**
 * Create a container div inside a shadow root for React rendering
 * @param host The host element
 * @returns The container element inside the shadow root
 */
export function createShadowContainer(host: HTMLElement): HTMLDivElement {
  const shadowRoot = createStyledShadowRoot(host);
  const container = document.createElement('div');
  shadowRoot.appendChild(container);
  return container;
}
