/**
 * Escapes a JSON string for safe embedding in HTML script tags.
 *
 * This function prevents XSS attacks by escaping characters that could
 * break out of the JSON context when embedded in a `<script>` tag.
 *
 * Specifically escapes:
 * - `<` → `\u003c` (prevents `</script>` injection)
 * - `>` → `\u003e` (prevents tag injection)
 * - `&` → `\u0026` (prevents HTML entity injection)
 * - `'` → `\u0027` (prevents single quote escapes)
 *
 * U+2028 and U+2029 need no escaping: they are valid in string literals since ES2019.
 *
 * @param obj - The object to serialize as safe JSON for HTML embedding
 * @returns A JSON string that is safe to embed in a `<script>` tag
 *
 * @example
 * ```ts
 * const env = { NEXT_PUBLIC_XSS: '</script><script>alert(1)</script>' }
 * const safe = escapeJsonForHtml(env)
 * // Returns: {"NEXT_PUBLIC_XSS":"\u003c/script\u003e\u003cscript\u003ealert(1)\u003c/script\u003e"}
 * ```
 *
 * @see https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
 */
export function escapeJsonForHtml(obj: object): string {
    return JSON.stringify(obj)
        .replace(/</g, '\\u003c')
        .replace(/>/g, '\\u003e')
        .replace(/&/g, '\\u0026')
        .replace(/'/g, '\\u0027')
}
