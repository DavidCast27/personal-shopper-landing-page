// Minimal Markdown -> HTML renderer for headings, paragraphs, lists, inline styles, and links.
// Not a full spec implementation; intended for simple CMS content without heavy dependencies.

function escapeHtml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function renderInline(md: string) {
  // code spans
  let s = md.replace(/`([^`]+)`/g, '<code>$1</code>')
  // bold **text**
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  // italics *text*
  s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>')
  // links [text](url)
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
  return s
}

export function renderMarkdown(md: string): string {
  if (!md) return ''
  // Normalize newlines
  const lines = md.replace(/\r\n?/g, '\n').split('\n')
  const out: string[] = []
  let inList = false

  function closeList() {
    if (inList) {
      out.push('</ul>')
      inList = false
    }
  }

  for (let raw of lines) {
    const line = raw.trimEnd()

    // Headings
    const h = line.match(/^(#{1,6})\s+(.*)$/)
    if (h) {
      closeList()
      const level = h[1].length
      out.push(`<h${level}>${renderInline(escapeHtml(h[2]).trim())}</h${level}>`)
      continue
    }

    // List item
    const li = line.match(/^[-*]\s+(.*)$/)
    if (li) {
      if (!inList) {
        out.push('<ul>')
        inList = true
      }
      out.push(`<li>${renderInline(escapeHtml(li[1]).trim())}</li>`)
      continue
    }

    // Blank line => paragraph break
    if (!line.trim()) {
      closeList()
      out.push('')
      continue
    }

    // Paragraph
    closeList()
    out.push(`<p>${renderInline(escapeHtml(line))}</p>`)
  }

  closeList()

  // Join and collapse multiple blank lines
  return out.filter(Boolean).join('\n')
}

export function stripMarkdown(md: string): string {
  if (!md) return ''
  let s = md
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[-*]\s+/gm, '')
  // collapse whitespace lines
  s = s.replace(/\r\n?/g, '\n').split('\n').map((l) => l.trim()).filter(Boolean).join(' ')
  return s
}
