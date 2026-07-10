import { describe, it, expect } from 'vitest'
import { mentionQuery, searchNames, tokenizeMentions } from './mentions.js'

describe('mentionQuery', () => {
  it('extracts a trailing @partial (including bare @)', () => {
    expect(mentionQuery('hey @Sar')).toBe('Sar')
    expect(mentionQuery('@')).toBe('')
  })
  it('ignores emails and mid-word @', () => {
    expect(mentionQuery('luke@dartmouth')).toBeNull()
    expect(mentionQuery('no token')).toBeNull()
  })
})

describe('searchNames', () => {
  const names = ['Sarah', 'Sam', 'Wasita', 'Luke']
  it('prefix first, then substring, case-insensitive', () => {
    expect(searchNames('sa', names)).toEqual(['Sarah', 'Sam'])
    expect(searchNames('sit', names)).toEqual(['Wasita'])
  })
  it('bare query lists everyone up to the limit', () => {
    expect(searchNames('', names, 2)).toEqual(['Sarah', 'Sam'])
  })
})

describe('tokenizeMentions', () => {
  const names = ['Sarah', 'Sarah Jones', 'Luke']
  it('marks known mentions and keeps surrounding text', () => {
    expect(tokenizeMentions('hi @Luke !', names)).toEqual([
      { text: 'hi ' },
      { mention: 'Luke' },
      { text: ' !' },
    ])
  })
  it('prefers the longest matching name', () => {
    expect(tokenizeMentions('@Sarah Jones hi', names)).toEqual([
      { mention: 'Sarah Jones' },
      { text: ' hi' },
    ])
  })
  it('leaves unknown @tokens as plain text', () => {
    expect(tokenizeMentions('email me @nobody', names)).toEqual([{ text: 'email me @nobody' }])
  })
  it('is case-insensitive but preserves the typed casing', () => {
    expect(tokenizeMentions('cc @luke', names)).toEqual([{ text: 'cc ' }, { mention: 'luke' }])
  })
})
