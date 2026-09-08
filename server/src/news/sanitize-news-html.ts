import sanitizeHtml from 'sanitize-html';

/** MVP rich-text allowlist for News.content. Keep narrow. */
export const NEWS_HTML_SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'p',
    'br',
    'strong',
    'em',
    'u',
    'ul',
    'ol',
    'li',
    'a',
    'h2',
    'h3',
    'blockquote',
  ],
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowProtocolRelative: false,
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', {
      rel: 'noopener noreferrer',
    }),
  },
};

export function sanitizeNewsHtml(dirty: string): string {
  return sanitizeHtml(dirty, NEWS_HTML_SANITIZE_OPTIONS);
}
