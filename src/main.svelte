<script>
  import { onMount } from 'svelte';
  import Audio from './audio/context.js';
  import Renderer from './renderer.svelte';
  import Simulation from './simulation.js';
  import Synth from './synth.svelte';

  let hasAudioContext = false;
  Audio().then(() => {
    hasAudioContext = true;
  });

  let renderer;
  const simulation = new Simulation({
    count: 21,
    size: { x: 320, y: 320 },
  });

  onMount(() => {
    let clock = performance.now() / 1000;
    document.addEventListener('visibilitychange', () => {
      clock = performance.now() / 1000;
    });
    const animate = () => {
      requestAnimationFrame(animate);
      const time = performance.now() / 1000;
      const delta = Math.min(time - clock, 1);
      clock = time;
      simulation.step(delta);
      renderer.draw();
    };
    requestAnimationFrame(animate);
  });
</script>

<div class="app">
  <Renderer bind:this={renderer} simulation={simulation} />
  <Synth simulation={simulation} />
</div>
{#if !hasAudioContext}
  <div class="play">
    <div><div /></div>
  </div>
{/if}
<a class="ribbon" href="https://github.com/sponsors/danielesteban" data-ribbon="♥ Become a sponsor" rel="noopener noreferrer" target="_blank">
  ♥ Become a sponsor
</a>

<style>
  :global(:root) {
    font-size: 16px;
    height: 100%;
  }

  :global(body) {
    margin: 0;
    background: #000;
    color: #eee;
    cursor: default;
    user-select: none;
    overflow: hidden;
    font-family: 'Roboto Condensed', monospace;
    font-size: 0.75rem;
    line-height: 1.125rem;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  :global(canvas) {
    vertical-align: middle;
  }

  .app {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .play {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    backdrop-filter: blur(8px);
  }

  .play > div {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 3rem;
    width: 3rem;
    height: 3rem;
    border: 4px solid #eee;
    opacity: 0.8;
  }

  .play > div > div {
    width: 0; 
    height: 0;
    border-top: 0.5rem solid transparent;
    border-bottom: 0.5rem solid transparent;
    border-left: 0.5rem solid #eee;
  }

  .ribbon {
    width: 12.1em;
    height: 12.1em;
    position: absolute;
    overflow: hidden;
    top: 0;
    right: 0;
    pointer-events: none;
    text-decoration: none;
    text-indent: -999999px;
  }

  .ribbon:before, .ribbon:after {
    position: absolute;
    display: block;
    width: 15.38em;
    height: 1.54em;
    top: 3.23em;
    right: -3.23em;
    box-sizing: content-box;
    transform: rotate(45deg);
  }

  .ribbon:before {
    content: "";
    padding: .38em 0;
    background-color: #393;
    background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.15));
    box-shadow: 0 .15em .23em 0 rgba(0, 0, 0, 0.5);
    pointer-events: auto;
  }

  .ribbon:after {
    content: attr(data-ribbon);
    color: #fff;
    line-height: 1.54em;
    text-decoration: none;
    text-shadow: 0 -.08em rgba(0, 0, 0, 0.5);
    text-align: center;
    text-indent: 0;
    padding: .15em 0;
    margin: .15em 0;
    border-width: .08em 0;
    border-style: dotted;
    border-color: #fff;
    border-color: rgba(255, 255, 255, 0.7);
  }
</style>
