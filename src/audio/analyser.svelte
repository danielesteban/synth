<script>
  import { onMount } from 'svelte';
  import Audio from './context.js';

  const width = 128;
  const height = 36;

  let canvas;
  let ctx;
  let output;
  Audio().then((audio) => {
    output = audio.output;
  });

  const animate = () => {
    requestAnimationFrame(animate);
    if (!output) {
      return;
    }
    const bands = output.analyser.getBands();
    ctx.clearRect(0, 0, width, height);
    bands.forEach((amplitude, i) => {
      const h = amplitude / 255 * 7;
      for (let j = 0; j < 7; j++) {
        ctx.fillStyle = h > j ? '#eee' : '#666';
        ctx.fillRect(i * 16 + 2, height - (j + 1) * 5, 16 - 4, 4);
      }
    });
  };

  onMount(() => {
    ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;
    requestAnimationFrame(animate);
  });
</script>

<div class="analyser">
  <canvas bind:this={canvas} />
</div>

<style>
  .analyser {
    padding: 0.25rem;
    border: 1px solid hsl(0, 0%, 15%);
  }
</style>
