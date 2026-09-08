import { sanitizeNewsHtml } from './sanitize-news-html';

describe('sanitizeNewsHtml', () => {
  it('keeps allowed rich-text tags and https links', () => {
    const input =
      '<p>Hello <strong>world</strong></p><a href="https://example.com">link</a>';
    const result = sanitizeNewsHtml(input);

    expect(result).toContain('<p>');
    expect(result).toContain('<strong>world</strong>');
    expect(result).toContain('href="https://example.com"');
    expect(result).toContain('>link</a>');
  });

  it('strips script tags and event handlers', () => {
    const input =
      '<p onclick="alert(1)">Hi</p><script>alert(1)</script><img src=x onerror="alert(1)">';
    const result = sanitizeNewsHtml(input);

    expect(result).not.toMatch(/script/i);
    expect(result).not.toMatch(/onclick/i);
    expect(result).not.toMatch(/onerror/i);
    expect(result).not.toMatch(/<img/i);
    expect(result).toContain('Hi');
  });

  it('removes javascript: hrefs', () => {
    const input = '<a href="javascript:alert(1)">click</a>';
    const result = sanitizeNewsHtml(input);

    expect(result).not.toMatch(/javascript:/i);
  });

  it('allows mailto links', () => {
    const result = sanitizeNewsHtml(
      '<a href="mailto:hello@example.com">email</a>',
    );
    expect(result).toContain('href="mailto:hello@example.com"');
  });
});
