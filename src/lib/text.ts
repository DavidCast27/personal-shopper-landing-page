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

// Minimal Markdown → HTML rendering for simple content.
export function renderMarkdown(md: string): string {
  if (!md) return ''
  const escapeHtml = (str: string) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#39;')

  const renderInline = (s: string) => {
    let r = s.replace(/`([^`]+)`/g, '<code>$1</code>')
    r = r.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    r = r.replace(/\*([^*]+)\*/g, '<em>$1</em>')
    r = r.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    return r
  }

  const lines = md.replace(/\r\n?/g, '\n').split('\n')
  const out: string[] = []
  let inList = false
  const closeList = () => { if (inList) { out.push('</ul>'); inList = false } }

  for (const raw of lines) {
    const line = raw.trimEnd()
    const h = line.match(/^(#{1,6})\s+(.*)$/)
    if (h) { closeList(); const level = h[1].length; out.push(`<h${level}>${renderInline(escapeHtml(h[2]).trim())}</h${level}>`); continue }
    const li = line.match(/^[-*]\s+(.*)$/)
    if (li) { if (!inList) { out.push('<ul>'); inList = true } out.push(`<li>${renderInline(escapeHtml(li[1]).trim())}</li>`); continue }
    if (!line.trim()) { closeList(); out.push(''); continue }
    closeList(); out.push(`<p>${renderInline(escapeHtml(line))}</p>`)
  }
  closeList()
  return out.filter(Boolean).join('\n')
}
