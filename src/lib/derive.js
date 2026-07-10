// Pure derivations over the single /messages stream. The client subscribes
// once and computes every view (main list, threads, counts) from the same
// array — at defense scale (hundreds of messages) this is trivially cheap.

const byTs = (a, b) => (a.ts ?? Infinity) - (b.ts ?? Infinity)

export function topLevel(messages) {
  return messages.filter((m) => !m.parentId).sort(byTs)
}

export function replies(messages, parentId) {
  return messages.filter((m) => m.parentId === parentId).sort(byTs)
}

export function replyCounts(messages) {
  const counts = new Map()
  for (const m of messages) {
    if (m.parentId) counts.set(m.parentId, (counts.get(m.parentId) ?? 0) + 1)
  }
  return counts
}

export function typingLabel(entries, selfClientId) {
  const others = entries.filter((e) => e.clientId !== selfClientId)
  if (others.length === 0) return ''
  if (others.length === 1) return `${others[0].name} is typing`
  if (others.length === 2) return `${others[0].name} and ${others[1].name} are typing`
  return `${others.length} people are typing`
}

export function groupReactions(raw, selfClientId) {
  if (!raw) return []
  return Object.entries(raw).map(([emoji, reactors]) => ({
    emoji,
    count: Object.keys(reactors).length,
    mine: selfClientId in reactors,
  }))
}
