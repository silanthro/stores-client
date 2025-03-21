import MarkdownIt from 'markdown-it'
import type { Token } from 'markdown-it'
import { h, VNode } from 'vue'
import CodeBlock from '@/components/docs/CodeBlock.vue'

// Initialize markdown-it with all required plugins
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
  xhtmlOut: true
})

// Override the default renderer to handle HTML properly
const defaultRender = md.renderer.rules.link_open || ((tokens, idx, options, env, self) => {
  return self.renderToken(tokens, idx, options)
})

md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  const token = tokens[idx]
  const href = token.attrGet('href')
  if (href) {
    token.attrSet('target', '_blank')
    token.attrSet('rel', 'noopener noreferrer')
  }
  return defaultRender(tokens, idx, options, env, self)
}

// Add heading IDs for scroll functionality
const defaultHeadingOpen = md.renderer.rules.heading_open || ((tokens, idx, options, env, self) => {
  return self.renderToken(tokens, idx, options)
})

md.renderer.rules.heading_open = (tokens, idx, options, env, self): string => {
  const token = tokens[idx]
  const nextToken = tokens[idx + 1]
  if (nextToken && nextToken.type === 'inline') {
    const id = nextToken.content.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
    token.attrSet('id', id)
  }
  return defaultHeadingOpen(tokens, idx, options, env, self)
}

// Override the fence renderer to handle code blocks
md.renderer.rules.fence = (tokens: Token[], idx: number): string => {
  const token = tokens[idx]
  const code = token.content.trim()
  const lang = token.info || ''

  // Return special marker for code blocks
  return `\x00CODE_BLOCK\x01${encodeURIComponent(code)}\x02${lang}\x00`
}

// Helper function to unescape HTML entities in rendered content
function unescapeHtml(html: string): string {
  const htmlEntities: Record<string, string> = {
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&amp;': '&'
  }
  return html.replace(/&[^;]+;/g, entity => htmlEntities[entity] || entity)
}

export function parseMarkdown(content: string): (string | VNode)[] {
  // Parse the markdown content
  const html = md.render(content)
  const result: (string | VNode)[] = []
  
  // Split the HTML by our special code block markers
  const parts = html.split(/(\x00CODE_BLOCK\x01.*?\x02.*?\x00)/)
  
  parts.forEach(part => {
    const match = part.match(/\x00CODE_BLOCK\x01(.*?)\x02(.*?)\x00/)
    if (match) {
      const [, encodedCode, lang] = match
      result.push(h(CodeBlock, {
        code: decodeURIComponent(encodedCode),
        language: lang || 'plaintext'
      }))
    } else if (part.trim()) {
      // Ensure HTML is properly rendered by unescaping entities
      result.push(unescapeHtml(part))
    }
  })
  
  return result
}

export async function loadTutorial(id: string): Promise<string> {
  try {
    const response = await fetch(`/src/tutorials/${id}.md`)
    if (!response.ok) {
      throw new Error(`Failed to load tutorial: ${id}`)
    }
    return await response.text()
  } catch (error) {
    console.error(`Error loading tutorial ${id}:`, error)
    return ''
  }
}
