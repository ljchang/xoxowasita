<script>
  import MessageBubble from './MessageBubble.svelte'
  import Composer from './Composer.svelte'
  import TypingDots from './TypingDots.svelte'
  import { sendMessage, onTyping } from '../lib/chat.js'
  import { replies, typingLabel, groupReactions } from '../lib/derive.js'

  let { identity, parent, messages, reactionsRaw, onToggleReaction, onClose } = $props()

  let threadReplies = $derived(replies(messages, parent.id))

  let typing = $state([])
  $effect(() => onTyping(parent.id, (entries) => (typing = entries)))
  let label = $derived(typingLabel(typing, identity.clientId))

  function send(text) {
    sendMessage({ name: identity.name, text, parentId: parent.id })
  }
</script>

<div class="fixed inset-0 z-20 flex flex-col bg-night" data-testid="thread-panel">
  <header class="flex items-center gap-3 px-3 py-2 bg-surface shadow-md">
    <button
      type="button"
      aria-label="Close thread"
      data-testid="close-thread"
      class="h-9 w-9 rounded-lg bg-surface-2 text-mist active:scale-95 transition"
      onclick={onClose}
    >
      ←
    </button>
    <div>
      <h2 class="font-bold text-sm">Thread</h2>
      <p class="text-xs text-mist">replying to {parent.name}</p>
    </div>
  </header>

  <div class="flex-1 overflow-y-auto py-2">
    <MessageBubble
      message={parent}
      mine={false}
      reactions={groupReactions(reactionsRaw[parent.id], identity.clientId)}
      onToggleReaction={(id, emoji) => onToggleReaction(id, emoji)}
    />
    <div class="mx-4 my-2 border-t border-surface-2"></div>
    {#each threadReplies as m (m.id)}
      <MessageBubble
        message={m}
        mine={m.name === identity.name}
        reactions={groupReactions(reactionsRaw[m.id], identity.clientId)}
        onToggleReaction={(id, emoji) => onToggleReaction(id, emoji)}
      />
    {/each}
  </div>

  <TypingDots {label} />
  <Composer {identity} scope={parent.id} placeholder="Reply in thread…" onSend={send} />
</div>
