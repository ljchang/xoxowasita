<script>
  // Chips only — adding a reaction happens from the hover action bar
  // (MessageBubble), like Slack. Renders nothing when there are no reactions.
  let { reactions, mine, onToggle } = $props()
</script>

{#if reactions.length > 0}
  <div class="flex flex-wrap items-center gap-1 mt-1 {mine ? 'justify-end' : ''}">
    {#each reactions as r (r.emoji)}
      <button
        type="button"
        data-testid="reaction-chip-{r.emoji}"
        class="flex items-center gap-1 rounded-full px-2 py-0.5 text-sm transition active:scale-110
          {r.mine
          ? 'bg-accent/30 ring-1 ring-accent text-white'
          : 'bg-surface-2 text-mist hover:bg-surface'}"
        style="animation: chip-pop 200ms ease-out"
        onclick={() => onToggle(r.emoji)}
      >
        <span>{r.emoji}</span><span class="text-xs font-semibold">{r.count}</span>
      </button>
    {/each}
  </div>
{/if}
