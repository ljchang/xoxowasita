<script>
  import { untrack } from 'svelte'
  import MessageBubble from './MessageBubble.svelte'
  import Composer from './Composer.svelte'
  import TypingDots from './TypingDots.svelte'
  import ThreadPanel from './ThreadPanel.svelte'
  import {
    sendMessage,
    onMessages,
    onReactions,
    onTyping,
    onConnected,
    toggleReaction,
  } from '../lib/chat.js'
  import { topLevel, replyCounts, typingLabel, groupReactions, sameGroup } from '../lib/derive.js'

  let { identity } = $props()

  let messages = $state([])
  let reactionsRaw = $state({})
  let typing = $state([])
  let connected = $state(true)

  $effect(() => onMessages((m) => messages.push(m)))
  $effect(() => onReactions((r) => (reactionsRaw = r)))
  $effect(() => onTyping('main', (entries) => (typing = entries)))
  $effect(() => onConnected((c) => (connected = c)))

  let mainMessages = $derived(topLevel(messages))
  let counts = $derived(replyCounts(messages))
  let label = $derived(typingLabel(typing, identity.clientId))

  let openThreadId = $state(null)
  let openParent = $derived(messages.find((m) => m.id === openThreadId) ?? null)

  function handleToggleReaction(msgId, emoji) {
    const mine = groupReactions(reactionsRaw[msgId], identity.clientId).find(
      (r) => r.emoji === emoji,
    )?.mine
    toggleReaction(msgId, emoji, identity, !!mine)
  }

  // --- auto-scroll: stay pinned to the bottom unless the reader scrolled up
  let scroller = $state(null)
  let pinned = $state(true)
  let unseen = $state(0)

  function handleScroll() {
    const nearBottom = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < 80
    pinned = nearBottom
    if (nearBottom) unseen = 0
  }

  // Plain counter, not $state: writing it must not re-trigger this effect
  // (an `unseen += 1` inside the effect would read `unseen`, subscribe to it,
  // and loop until Svelte's update-depth limit — the "1000 new messages" bug).
  let seenCount = 0
  $effect(() => {
    const n = mainMessages.length
    if (!scroller || n === seenCount) return
    const delta = n - seenCount
    seenCount = n
    if (pinned) {
      requestAnimationFrame(() => scroller?.scrollTo({ top: scroller.scrollHeight }))
    } else {
      untrack(() => (unseen += delta))
    }
  })

  function jumpToLatest() {
    scroller.scrollTo({ top: scroller.scrollHeight, behavior: 'smooth' })
    unseen = 0
    pinned = true
  }

  function sendMain(text) {
    sendMessage({ name: identity.name, text })
    jumpToLatest() // your own message always brings you back to the bottom
  }
</script>

<!-- The chat is a raised card on desktop so it doesn't blend into the page;
     edge-to-edge on phones where the frame would just waste space. -->
<div class="h-dvh sm:py-4 sm:px-4">
  <main
    class="flex flex-col h-full max-w-xl mx-auto bg-card sm:rounded-2xl sm:ring-1 sm:ring-white/10 sm:shadow-2xl sm:shadow-accent/10 overflow-hidden"
  >
    <header class="px-4 py-2.5 bg-surface border-b border-white/5">
      <h1 class="text-xl leading-6 text-accent" style="font-family: 'Monas', 'American Typewriter', serif">
        xoxo wasita
      </h1>
      <p class="text-xs text-mist flex items-center gap-1.5">
        <span class="w-1.5 h-1.5 rounded-full {connected ? 'bg-emerald-400' : 'bg-amber-400'}"></span>
        {connected ? `chatting as ${identity.name}` : 'reconnecting…'}
      </p>
    </header>

    <div class="relative flex-1 min-h-0">
      <div
        class="h-full overflow-y-auto py-2"
        bind:this={scroller}
        onscroll={handleScroll}
        data-testid="chat-log"
      >
        {#if mainMessages.length === 0}
          <p class="text-center text-mist text-sm mt-10">
            No messages yet — say hi! 💜
          </p>
        {/if}
        {#each mainMessages as m, i (m.id)}
          <MessageBubble
            message={m}
            mine={m.name === identity.name}
            showMeta={!sameGroup(mainMessages[i - 1], m)}
            reactions={groupReactions(reactionsRaw[m.id], identity.clientId)}
            replyCount={counts.get(m.id) ?? 0}
            onToggleReaction={handleToggleReaction}
            onOpenThread={(id) => (openThreadId = id)}
          />
        {/each}
      </div>
      {#if unseen > 0}
        <button
          type="button"
          class="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-accent to-accent-hot px-4 py-1.5 text-sm font-semibold text-white shadow-lg active:scale-95 transition"
          onclick={jumpToLatest}
        >
          ↓ {unseen} new {unseen === 1 ? 'message' : 'messages'}
        </button>
      {/if}
    </div>

    <TypingDots {label} />
    <Composer {identity} scope="main" onSend={sendMain} />
  </main>
</div>

{#if openParent}
  <ThreadPanel
    {identity}
    parent={openParent}
    {messages}
    {reactionsRaw}
    onToggleReaction={handleToggleReaction}
    onClose={() => (openThreadId = null)}
  />
{/if}
