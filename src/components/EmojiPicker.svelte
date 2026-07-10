<script>
  let { onPick } = $props()

  // quick-react set: her purple heart + octopus/unicorn (her avatar gradients) included
  const emojis = ['💜', '😂', '👏', '🔥', '😮', '🥹', '🎉', '💡', '🧠', '🐙', '🦄', '✨', '👍', '❓', '💯', '😭']
</script>

<div class="flex flex-wrap gap-1 p-2 rounded-xl bg-surface-2 shadow-xl" data-testid="emoji-picker">
  {#each emojis as e (e)}
    <button
      type="button"
      class="text-xl p-1 rounded-lg hover:bg-surface active:scale-125 transition"
      onclick={() => onPick(e)}
      data-testid="pick-{e}"
    >
      {e}
    </button>
  {/each}
</div>
