import { describe, it, expect } from 'vitest'
import { topLevel, replies, replyCounts, typingLabel, groupReactions, sameGroup, linkify } from './derive.js'

const msg = (id, ts, parentId = null) => ({ id, ts, parentId, name: 'n', text: 't' })

describe('topLevel', () => {
  it('keeps only parentless messages, ordered by ts', () => {
    const out = topLevel([msg('b', 2), msg('r', 3, 'b'), msg('a', 1)])
    expect(out.map((m) => m.id)).toEqual(['a', 'b'])
  })
})

describe('replies', () => {
  it('returns replies of one parent, ordered by ts', () => {
    const out = replies([msg('a', 1), msg('r2', 3, 'a'), msg('r1', 2, 'a'), msg('x', 4, 'other')], 'a')
    expect(out.map((m) => m.id)).toEqual(['r1', 'r2'])
  })
})

describe('replyCounts', () => {
  it('counts replies per parent', () => {
    const counts = replyCounts([msg('a', 1), msg('r1', 2, 'a'), msg('r2', 3, 'a'), msg('b', 4)])
    expect(counts.get('a')).toBe(2)
    expect(counts.get('b')).toBeUndefined()
  })
})

describe('typingLabel', () => {
  const e = (clientId, name) => ({ clientId, name })
  it('is empty when nobody (or only self) is typing', () => {
    expect(typingLabel([], 'me')).toBe('')
    expect(typingLabel([e('me', 'Luke')], 'me')).toBe('')
  })
  it('names one or two typists', () => {
    expect(typingLabel([e('1', 'Sarah')], 'me')).toBe('Sarah is typing')
    expect(typingLabel([e('1', 'Sarah'), e('2', 'Jin')], 'me')).toBe('Sarah and Jin are typing')
  })
  it('counts three or more', () => {
    expect(typingLabel([e('1', 'A'), e('2', 'B'), e('3', 'C')], 'me')).toBe('3 people are typing')
  })
})

describe('groupReactions', () => {
  it('tallies per emoji and flags own reactions', () => {
    const raw = { '💜': { c1: 'Sarah', me: 'Luke' }, '🔥': { c2: 'Jin' } }
    const out = groupReactions(raw, 'me')
    expect(out).toEqual([
      { emoji: '💜', count: 2, mine: true },
      { emoji: '🔥', count: 1, mine: false },
    ])
  })
  it('handles missing input', () => {
    expect(groupReactions(null, 'me')).toEqual([])
  })
})

describe('sameGroup', () => {
  const m = (name, ts) => ({ name, ts })
  it('groups same author within 5 minutes', () => {
    expect(sameGroup(m('A', 1000), m('A', 2000))).toBe(true)
  })
  it('breaks on author change, long gaps, or pending timestamps', () => {
    expect(sameGroup(m('A', 1000), m('B', 2000))).toBe(false)
    expect(sameGroup(m('A', 0), m('A', 400_000))).toBe(false)
    expect(sameGroup(m('A', 1000), m('A', null))).toBe(false)
    expect(sameGroup(undefined, m('A', 1000))).toBe(false)
  })
})

describe('linkify', () => {
  it('passes plain text through as one part', () => {
    expect(linkify('hello world')).toEqual([{ text: 'hello world' }])
  })
  it('extracts urls with surrounding text', () => {
    expect(linkify('see https://a.com/x?y=1 now')).toEqual([
      { text: 'see ' },
      { url: 'https://a.com/x?y=1' },
      { text: ' now' },
    ])
  })
  it('handles a bare url and multiple urls', () => {
    expect(linkify('https://a.com')).toEqual([{ url: 'https://a.com' }])
    expect(linkify('https://a.com and http://b.org')).toEqual([
      { url: 'https://a.com' },
      { text: ' and ' },
      { url: 'http://b.org' },
    ])
  })
})
