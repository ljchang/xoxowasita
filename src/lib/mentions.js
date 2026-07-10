// @-mention helpers. No accounts, so "users" = names seen in the room
// (presence + message authors). Pure functions, unit-tested.

// If the text ends in an unfinished "@partial" token (colon rule's sibling:
// @ preceded by start-of-text or whitespace), return the partial (may be
// empty — a bare "@" lists everyone) — else null.
export function mentionQuery(textBeforeCaret) {
  const m = /(?:^|\s)@([^\s@]{0,29})$/.exec(textBeforeCaret)
  return m ? m[1] : null
}

// Rank candidate names for a partial: prefix matches, then substring.
export function searchNames(query, names, limit = 6) {
  const q = query.toLowerCase()
  const starts = []
  const contains = []
  for (const name of names) {
    const n = name.toLowerCase()
    if (n.startsWith(q)) starts.push(name)
    else if (q && n.includes(q)) contains.push(name)
  }
  return [...starts, ...contains].slice(0, limit)
}

// Split text into parts, marking "@Known Name" tokens: [{text} | {mention}].
// At each "@", the longest case-insensitive match from `names` wins, so
// "@Sarah Jones" beats "@Sarah" when both are in the room.
export function tokenizeMentions(text, names) {
  if (!names?.length || !text.includes('@')) return [{ text }]
  const sorted = [...names].sort((a, b) => b.length - a.length)
  const parts = []
  let plain = ''
  let i = 0
  while (i < text.length) {
    if (text[i] === '@') {
      const rest = text.slice(i + 1)
      const hit = sorted.find((n) => rest.toLowerCase().startsWith(n.toLowerCase()))
      if (hit) {
        if (plain) parts.push({ text: plain })
        plain = ''
        parts.push({ mention: text.substr(i + 1, hit.length) })
        i += 1 + hit.length
        continue
      }
    }
    plain += text[i]
    i += 1
  }
  if (plain) parts.push({ text: plain })
  return parts
}
