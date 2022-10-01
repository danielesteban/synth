<script>
  import { onMount } from 'svelte';

  export let simulation;

  let canvas;
  let ctx;
  let grid;

  export const draw = () => {
    ctx.clearRect(0, 0, simulation.size.x, simulation.size.y);
    ctx.lineWidth = 0.3;
    ctx.strokeStyle = `hsl(0, 0%, 10%)`;
    ctx.stroke(grid);
    ctx.lineWidth = 2;
    simulation.dots && simulation.dots.forEach(({ color, radius, body, hit }) => {
      const position = body.translation();
      ctx.fillStyle = `hsl(${color * 360}, 60%, ${50 + hit * 50}%)`;
      ctx.strokeStyle = `hsl(${color * 360}, 60%, 40%)`;
      ctx.beginPath();
      ctx.arc(position.x, position.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(position.x, position.y, radius - 1, 0, Math.PI * 2);
      ctx.stroke();
    });
  };

  const resize = () => {
    const pixelRatio = window.devicePixelRatio || 1;
    const screen = {
      x: window.innerWidth - 32,
      y: window.innerHeight - 112,
    };
    let resolution;
    if ((screen.x / screen.y) > (simulation.size.x / simulation.size.y)) {
      resolution = screen.y / simulation.size.y;
    } else {
      resolution = screen.x / simulation.size.x;
    }
    canvas.width = Math.floor(simulation.size.x * resolution * pixelRatio);
    canvas.height = Math.floor(simulation.size.y * resolution * pixelRatio);
    canvas.style.width = `${simulation.size.x * resolution}px`;
    canvas.style.height = `${simulation.size.y * resolution}px`;
    ctx.scale(resolution * pixelRatio, resolution * pixelRatio);
  };

  onMount(() => {
    ctx = canvas.getContext('2d');
    grid = new Path2D();
    for (let y = 0; y <= simulation.size.y; y += 16) {
      grid.moveTo(0, y - 0.5);
      grid.lineTo(simulation.size.x, y);
    }
    for (let x = 0; x <= simulation.size.x; x += 16) {
      grid.moveTo(x, 0);
      grid.lineTo(x, simulation.size.y);
    }
    window.addEventListener('resize', resize);
    resize();
  });

</script>

<canvas bind:this={canvas} />
