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
    simulation.boxes && simulation.boxes.forEach(({ body, extents }) => {
      const position = body.translation();
      const rotation = body.rotation();
      ctx.fillStyle = `hsl(0, 0%, 30%)`;
      ctx.strokeStyle = `hsl(0, 0%, 20%)`;
      ctx.save();
      ctx.translate(position.x, position.y);
      ctx.rotate(rotation);
      ctx.translate(extents[0] * -0.5, extents[1] * -0.5);
      ctx.fillRect(0, 0, extents[0], extents[1]);
      ctx.strokeRect(1, 1, extents[0] - 2, extents[1] - 2);
      ctx.restore();
    });
    simulation.dots && simulation.dots.forEach(({ color, radius, body, hit }) => {
      const position = body.translation();
      ctx.fillStyle = `hsl(${color * 280}, 50%, ${50 + hit * 50}%)`;
      ctx.strokeStyle = `hsl(${color * 280}, 50%, 40%)`;
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
