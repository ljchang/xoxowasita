<script>
  import EmojiPicker from './EmojiPicker.svelte'

  let { reactions, mine, onToggle } = $props()
  let showPicker = $state(false)

  function pick(emoji) {
    showPicker = false
    onToggle(emoji)
  }
</script>

<div class="flex flex-wrap items-center gap-1 mt-1 {mine ? 'justify-end' : ''}">
  {#each reactions as r (r.emoji)}
    <button
      type="button"
      data-testid="reaction-chip-{r.emoji}"
      class="flex items-center gap-1 rounded-full px-2 py-0.5 text-sm transition active:scale-110
        {r.mine
        ? 'bg-accent/30 ring-1 ring-accent text-white'
        : 'bg-surface-2 text-mist hover:bg-surface'}"
      onclick={() => onToggle(r.emoji)}
    >
      <span>{r.emoji}</span><span class="text-xs font-semibold">{r.count}</span>
    </button>
  {/each}
  <button
    type="button"
    aria-label="Add reaction"
    data-testid="add-reaction"
    class="rounded-full w-7 h-7 text-sm bg-surface-2/60 text-mist hover:bg-surface-2 active:scale-110 transition"
    onclick={() => (showPicker = !showPicker)}
  >
    {showPicker ? '×' : '＋'}
  </button>
</div>
{#if showPicker}
  <div class="mt-1 {mine ? 'flex justify-end' : ''}">
    <EmojiPicker onPick={pick} />
  </div>
{/if}
