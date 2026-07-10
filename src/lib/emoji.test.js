import { describe, it, expect } from 'vitest'
import { searchEmoji, completionQuery, applyCompletion, autoReplace } from './emoji.js'

describe('searchEmoji', () => {
  it('ranks prefix matches before substring matches', () => {
    const names = searchEmoji('heart').map((r) => r.name)
    expect(names[0]).toBe('heart')
    expect(names).toContain('heart_eyes')
  })
  it('finds fire and respects the limit', () => {
    expect(searchEmoji('fir')[0]).toEqual({ name: 'fire', emoji: '🔥' })
    expect(searchEmoji('a', 3)).toHaveLength(3)
  })
  it('returns empty for empty query', () => {
    expect(searchEmoji('')).toEqual([])
  })
})

describe('completionQuery', () => {
  it('extracts a partial token at the end', () => {
    expect(completionQuery('hello :fi')).toBe('fi')
    expect(completionQuery(':purple_he')).toBe('purple_he')
  })
  it('requires 2+ chars and a word boundary before the colon', () => {
    expect(completionQuery('hello :f')).toBeNull()
    expect(completionQuery('http://x.com/ab')).toBeNull()
    expect(completionQuery('no token here')).toBeNull()
  })
})

describe('applyCompletion', () => {
  it('replaces the trailing partial with the emoji', () => {
    expect(applyCompletion('so cool :fi', '🔥')).toBe('so cool 🔥')
  })
})

describe('autoReplace', () => {
  it('converts a completed known name inline', () => {
    expect(autoReplace('love this :purple_heart:')).toBe('love this 💜')
    expect(autoReplace(':tada:')).toBe('🎉')
  })
  it('leaves unknown names and non-tokens alone', () => {
    expect(autoReplace('what :notanemoji:')).toBeNull()
    expect(autoReplace('ratio 1:2:')).toBeNull()
  })
})
