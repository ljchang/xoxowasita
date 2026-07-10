<script>
  import ReactionBar from './ReactionBar.svelte'
  import { shortTime } from '../lib/time.js'

  let {
    message,
    mine,
    reactions = [],
    replyCount = 0,
    onToggleReaction,
    onOpenThread = null,
  } = $props()

  // ts is null until the server acks the write — that's the "pending" look
  let pending = $derived(!message.ts)
</script>

<div class="px-3 py-1" data-testid="message-{message.id}">
  <div class="flex items-baseline gap-2 text-xs text-mist {mine ? 'justify-end' : ''}">
    <span class="font-semibold text-petal">{message.name}</span>
    <span>{shortTime(message.ts)}</span>
  </div>
  <div class="flex {mine ? 'justify-end' : 'justify-start'}">
    <div
      class="inline-block max-w-[80%] px-3 py-2 mt-0.5 text-white shadow-lg break-words whitespace-pre-wrap transition-opacity
        {pending ? 'opacity-60' : 'opacity-100'}
        {mine
        ? 'ml-10 bg-own rounded-tl-xl rounded-tr-xl rounded-bl-xl'
        : 'mr-10 bg-other text-[#3b0764] rounded-tl-xl rounded-tr-xl rounded-br-xl'}"
    >
      {message.text}
    </div>
  </div>
  <div class="{mine ? 'text-right' : ''}">
    <ReactionBar {reactions} {mine} onToggle={(emoji) => onToggleReaction(message.id, emoji)} />
    {#if onOpenThread}
      <button
        type="button"
        data-testid="open-thread-{message.id}"
        class="mt-0.5 text-xs font-semibold text-accent hover:text-accent-hot transition"
        onclick={() => onOpenThread(message.id)}
      >
        {replyCount > 0 ? `${replyCount} ${replyCount === 1 ? 'reply' : 'replies'} →` : 'reply in thread'}
      </button>
    {/if}
  </div>
</div>
