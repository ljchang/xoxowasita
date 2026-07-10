// No-auth identity: a random clientId + chosen display name, kept in
// localStorage so a refresh doesn't re-prompt. clientId is what reaction
// toggles and typing entries key on; name is display-only.

const CLIENT_KEY = 'defense-chat:clientId'
const NAME_KEY = 'defense-chat:name'
export const NAME_MAX = 30

let storage = typeof localStorage !== 'undefined' ? localStorage : null

// test seam: swap the backing store (node has no localStorage)
export function _setStorage(s) {
  storage = s
}

function randomId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `c-${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`
}

export function getIdentity() {
  let clientId = storage.getItem(CLIENT_KEY)
  if (!clientId) {
    clientId = randomId()
    storage.setItem(CLIENT_KEY, clientId)
  }
  return { clientId, name: storage.getItem(NAME_KEY) }
}

export function saveName(name) {
  const trimmed = String(name).trim().slice(0, NAME_MAX)
  if (!trimmed) throw new Error('name required')
  storage.setItem(NAME_KEY, trimmed)
}
