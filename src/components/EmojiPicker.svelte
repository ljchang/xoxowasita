<script>
  let { onPick, onClose } = $props()

  // quick-react set: her purple heart + octopus/unicorn (her avatar gradients) included
  const emojis = ['💜', '😂', '👏', '🔥', '😮', '🥹', '🎉', '💡', '🧠', '🐙', '🦄', '✨', '👍', '❓', '💯', '😭']

  let root = $state(null)

  function handleKey(e) {
    if (e.key === 'Escape') {
      e.stopPropagation()
      onClose?.()
    }
  }

  function handleOutside(e) {
    if (root && !root.contains(e.target)) onClose?.()
  }
</script>

<svelte:window onkeydown={handleKey} />
<svelte:document onpointerdown={handleOutside} />

<div
  bind:this={root}
  class="grid grid-cols-8 gap-0.5 p-1.5 rounded-xl bg-surface-2 shadow-xl ring-1 ring-white/5"
  data-testid="emoji-picker"
>
  {#each emojis as e (e)}
    <button
      type="button"
      class="text-lg p-1 rounded-lg hover:bg-surface active:scale-125 transition"
      onclick={() => onPick(e)}
      data-testid="pick-{e}"
    >
      {e}
    </button>
  {/each}
</div>
