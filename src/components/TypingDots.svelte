<script>
  let { label } = $props()
</script>

<!-- Reserve the line even when idle so the composer never jumps -->
<div class="h-5 px-4 flex items-center gap-1.5 text-xs text-mist" aria-live="polite">
  {#if label}
    <span class="flex gap-0.5">
      {#each [0, 1, 2] as i (i)}
        <span
          class="w-1.5 h-1.5 rounded-full bg-other"
          style="animation: dot-bounce 1s {i * 0.15}s infinite"
        ></span>
      {/each}
    </span>
    <span>{label}…</span>
  {/if}
</div>
