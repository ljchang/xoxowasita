import {
  ref,
  push,
  set,
  remove,
  onChildAdded,
  onValue,
  onDisconnect,
  serverTimestamp,
} from 'firebase/database'
import { db } from './firebase.js'
import { rememberOwnMessage } from './identity.js'

export const TEXT_MAX = 500

// --- messages ---------------------------------------------------------------

export function sendMessage({ name, text, parentId = null }) {
  const clean = String(text).trim().slice(0, TEXT_MAX)
  if (!clean) return null
  const msg = { name, text: clean, ts: serverTimestamp() }
  if (parentId) msg.parentId = parentId
  const r = push(ref(db, 'messages'), msg)
  rememberOwnMessage(r.key) // push ids are known synchronously
  return r
}

// Streams every message (existing + new) as {id, name, text, ts, parentId}.
// RTDB's latency compensation fires child_added for our own pushes
// immediately, which is what makes sends feel instant.
export function onMessages(cb) {
  return onChildAdded(ref(db, 'messages'), (snap) => {
    cb({ id: snap.key, parentId: null, ...snap.val() })
  })
}

// --- reactions --------------------------------------------------------------

export function toggleReaction(msgId, emoji, { clientId, name }, currentlyMine) {
  const node = ref(db, `reactions/${msgId}/${emoji}/${clientId}`)
  return currentlyMine ? remove(node) : set(node, name)
}

export function onReactions(cb) {
  return onValue(ref(db, 'reactions'), (snap) => cb(snap.val() ?? {}))
}

// --- typing (scope = 'main' or a thread's parent message id) ----------------

export function setTyping(scope, { clientId, name }, isTyping) {
  const node = ref(db, `typing/${scope}/${clientId}`)
  if (isTyping) {
    onDisconnect(node).remove() // never strand a "… is typing" if a phone drops
    return set(node, { name, ts: serverTimestamp() })
  }
  return remove(node)
}

export function onTyping(scope, cb) {
  return onValue(ref(db, `typing/${scope}`), (snap) => {
    const val = snap.val() ?? {}
    cb(Object.entries(val).map(([clientId, v]) => ({ clientId, name: v.name, ts: v.ts })))
  })
}

// --- presence (live audience count) ------------------------------------------

export function joinPresence({ clientId, name }) {
  const node = ref(db, `presence/${clientId}`)
  onDisconnect(node).remove()
  return set(node, { name, ts: serverTimestamp() })
}

export function onPresence(cb) {
  return onValue(ref(db, 'presence'), (snap) => cb(Object.keys(snap.val() ?? {}).length))
}

// --- connection state -------------------------------------------------------

export function onConnected(cb) {
  return onValue(ref(db, '.info/connected'), (snap) => cb(snap.val() === true))
}
