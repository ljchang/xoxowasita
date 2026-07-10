import { describe, it, expect, beforeEach } from 'vitest'
import { getIdentity, saveName, _setStorage } from './identity.js'

// minimal localStorage stand-in so tests run in node
function memoryStorage() {
  const m = new Map()
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
  }
}

describe('identity', () => {
  beforeEach(() => _setStorage(memoryStorage()))

  it('starts with a stable clientId and no name', () => {
    const a = getIdentity()
    expect(a.name).toBeNull()
    expect(a.clientId).toMatch(/^[a-z0-9-]{8,}$/)
    expect(getIdentity().clientId).toBe(a.clientId)
  })

  it('persists a trimmed name', () => {
    saveName('  Wasita  ')
    expect(getIdentity().name).toBe('Wasita')
  })

  it('rejects empty or whitespace-only names', () => {
    expect(() => saveName('   ')).toThrow()
    expect(() => saveName('')).toThrow()
  })

  it('caps names at 30 characters', () => {
    saveName('x'.repeat(50))
    expect(getIdentity().name).toHaveLength(30)
  })
})

describe('own messages', () => {
  beforeEach(() => _setStorage(memoryStorage()))
  it('remembers ids across calls', async () => {
    const { rememberOwnMessage, isOwnMessage } = await import('./identity.js')
    expect(isOwnMessage('m1')).toBe(false)
    rememberOwnMessage('m1')
    expect(isOwnMessage('m1')).toBe(true)
    expect(isOwnMessage('m2')).toBe(false)
  })
})
