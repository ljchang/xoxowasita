<script>
  import { setTyping } from '../lib/chat.js'
  import { TEXT_MAX } from '../lib/chat.js'

  let { identity, scope, placeholder = 'Say something nice…', onSend } = $props()

  let text = $state('')
  let typingTimer
  let lastPing = 0

  // Slack-like feel: the indicator lingers 3 s after the last keystroke
  // instead of vanishing instantly. Writes are throttled to one refresh per
  // 1.5 s so an audience of typers doesn't hammer the database per keystroke.
  function handleInput() {
    const now = Date.now()
    if (now - lastPing > 1500) {
      lastPing = now
      setTyping(scope, identity, true)
    }
    clearTimeout(typingTimer)
    typingTimer = setTimeout(() => {
      lastPing = 0
      setTyping(scope, identity, false)
    }, 3000)
  }

  function submit(e) {
    e?.preventDefault()
    const clean = text.trim()
    if (!clean) return
    onSend(clean)
    text = ''
    clearTimeout(typingTimer)
    lastPing = 0 // so typing again right after a send re-pings immediately
    setTyping(scope, identity, false)
  }
</script>

<!-- No emoji button: phones have native emoji keyboards, macOS has ⌃⌘Space.
     Reactions get their own picker from each message's hover actions. -->
<form
  onsubmit={submit}
  class="px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-1"
>
  <div class="flex items-end gap-2">
    <input
      class="min-w-0 flex-1 h-11 rounded-xl bg-surface border border-surface-2 px-4 placeholder:text-mist/60 focus:outline-none focus:ring-2 focus:ring-accent"
      {placeholder}
      maxlength={TEXT_MAX}
      bind:value={text}
      oninput={handleInput}
      enterkeyhint="send"
      data-testid="composer-input"
    />
    <button
      type="submit"
      aria-label="Send message"
      data-testid="send-button"
      class="shrink-0 h-11 w-11 rounded-xl bg-gradient-to-r from-accent to-accent-hot text-white shadow-lg shadow-accent/30 active:scale-95 transition disabled:opacity-40 flex items-center justify-center"
      disabled={!text.trim()}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
      </svg>
    </button>
  </div>
</form>
