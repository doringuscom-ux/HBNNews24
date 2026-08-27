/**
 * Automatically cleans messy HTML formatting from Word, external news websites,
 * and rich text editors while preserving structure, headings, bold, italics, links, and images.
 */
export function cleanHtmlFormatting(rawHtml) {
    if (!rawHtml || typeof rawHtml !== 'string') return '';
    let html = rawHtml;

    // 1. Remove Word / XML comments <!--[if ...]> and standard HTML comments
    html = html.replace(/<!--[\s\S]*?-->/gi, '');

    // 2. Remove <font> and </font> tags
    html = html.replace(/<\/?font[^>]*>/gi, '');

    // 3. Remove inline styles and Word metadata (MsoNormal, lang, data-*) from text elements
    html = html.replace(/<(p|span|div|h[1-6]|b|strong|i|em|u|s|strike|del|li|ul|ol)\s+([^>]*?)>/gi, (match, tag, attrs) => {
        // Strip style, MsoNormal class, lang, data-* attributes
        let cleanAttrs = attrs
            .replace(/\s*style\s*=\s*["'][^"']*["']/gi, '')
            .replace(/\s*class\s*=\s*["'][^"']*(?:MsoNormal|msonormal)[^"']*["']/gi, '')
            .replace(/\s*lang\s*=\s*["'][^"']*["']/gi, '')
            .replace(/\s*data-[a-z0-9_-]+\s*=\s*["'][^"']*["']/gi, '');
        
        cleanAttrs = cleanAttrs.trim();
        return cleanAttrs ? `<${tag} ${cleanAttrs}>` : `<${tag}>`;
    });

    // 4. Unwrap pointless span tags (e.g. <span>text</span> -> text)
    for (let pass = 0; pass < 3; pass++) {
        html = html.replace(/<span\s*>([\s\S]*?)<\/span>/gi, '$1');
        html = html.replace(/<span>([\s\S]*?)<\/span>/gi, '$1');
    }

    // 5. Replace multiple consecutive &nbsp; with a single space
    html = html.replace(/(?:&nbsp;|\u00a0){2,}/gi, ' ');

    // 6. Clean empty paragraphs with only spaces or line breaks
    html = html.replace(/<p>\s*(?:&nbsp;|\u00a0|<br\s*\/?>|\s)*<\/p>/gi, '');

    return html.trim();
}
