import { escapeJsonForHtml } from './escape-json-for-html'

describe('escapeJsonForHtml', () => {
    it('should escape < characters to prevent script tag injection', () => {
        const obj = { xss: '</script><script>alert(1)</script>' }
        const result = escapeJsonForHtml(obj)

        expect(result).toContain('\\u003c')
        expect(result).not.toContain('<')
    })

    it('should escape > characters', () => {
        const obj = { value: 'test>value' }
        const result = escapeJsonForHtml(obj)

        expect(result).toContain('\\u003e')
        expect(result).not.toContain('>')
    })

    it('should escape & characters', () => {
        const obj = { value: 'test&value' }
        const result = escapeJsonForHtml(obj)

        expect(result).toContain('\\u0026')
        expect(result).not.toContain('&')
    })

    it("should escape ' characters", () => {
        const obj = { value: "test'value" }
        const result = escapeJsonForHtml(obj)

        expect(result).toContain('\\u0027')
        expect(result).not.toContain("'")
    })

    it('should handle complex XSS payloads', () => {
        const obj = {
            NEXT_PUBLIC_XSS: '</script><script>alert(document.cookie)</script>',
            NEXT_PUBLIC_ANOTHER: "<img src=x onerror='alert(1)'>",
        }
        const result = escapeJsonForHtml(obj)

        // Should not contain any dangerous characters
        expect(result).not.toMatch(/<|>|&|'/)
        // Should still be valid JSON when unicode escapes are parsed
        expect(() => JSON.parse(result)).not.toThrow()
    })

    it('should produce valid JSON output', () => {
        const obj = {
            normal: 'hello world',
            special: '<script>alert("xss")</script>',
            ampersand: 'foo & bar',
        }
        const result = escapeJsonForHtml(obj)
        const parsed = JSON.parse(result)

        expect(parsed.normal).toBe('hello world')
        expect(parsed.special).toBe('<script>alert("xss")</script>')
        expect(parsed.ampersand).toBe('foo & bar')
    })

    it('should handle empty objects', () => {
        expect(escapeJsonForHtml({})).toBe('{}')
    })

    it('should handle nested objects', () => {
        const obj = {
            outer: {
                inner: '<script>',
            },
        }
        const result = escapeJsonForHtml(obj)

        expect(result).not.toContain('<')
        expect(JSON.parse(result).outer.inner).toBe('<script>')
    })

    it('should handle arrays', () => {
        const obj = {
            items: ['<a>', '</script>', 'normal'],
        }
        const result = escapeJsonForHtml(obj)

        expect(result).not.toMatch(/<|>/)
        const parsed = JSON.parse(result)
        expect(parsed.items).toEqual(['<a>', '</script>', 'normal'])
    })
})
