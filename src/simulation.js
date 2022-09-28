class Simulation {
  constructor({ count, size }) {
    this.dots = Array.from({ length: count }, (v, i) => {
      const s = 1 + Math.random() * 2;
      const scale = 4 + s * 3;
      const direction = {
        x: Math.random() - 0.5,
        y: Math.random() - 0.5,
      };
      const l = Math.sqrt(direction.x ** 2 + direction.y ** 2);
      direction.x /= l;
      direction.y /= l;
      return {
        color: (i / 7) % 1,
        hit: 0,
        note: i,
        duration: s * 0.5,
        position: {
          x: scale + Math.random() * (size.x - scale * 2),
          y: scale + Math.random() * (size.y - scale * 2),
        },
        scale,
        direction,
        speed: (4 - s) * 5,
      };
    });
    this.size = size;
    for (let i = 0; i < 100; i++) {
      this.step(1 / 60);
    }
  }

  hit(dot) {
    const { onHit } = this;
    if (onHit && dot.hit < 0.5) {
      onHit(dot);
    }
    dot.hit = 1;
  }

  step(delta) {
    const { dots, size } = this;
    const count = dots.length;
    for (let i = 0; i < count; i++) {
      const dot = dots[i];

      dot.position.x += dot.direction.x * dot.speed * delta;
      dot.position.y += dot.direction.y * dot.speed * delta;

      if (dot.position.x < dot.scale || dot.position.x > size.x - dot.scale) {
        dot.position.x = Math.min(Math.max(dot.position.x, dot.scale), size.x - dot.scale);
        dot.direction.x *= -1;
        this.hit(dot);
      }
      if (dot.position.y < dot.scale || dot.position.y > size.y - dot.scale) {
        dot.position.y = Math.min(Math.max(dot.position.y, dot.scale), size.y - dot.scale);
        dot.direction.y *= -1;
        this.hit(dot);
      }

      for (let j = i + 1; j < count; j++) {
        const d = dots[j];
        const dx = dot.position.x - d.position.x;
        const dy = dot.position.y - d.position.y;
        const dist = Math.sqrt(dx ** 2 + dy ** 2);
        if (dist <= (dot.scale + d.scale)) {
          dot.direction.x = dx / dist;
          dot.direction.y = dy / dist;
          this.hit(dot);
          d.direction.x = -dot.direction.x;
          d.direction.y = -dot.direction.y;
          this.hit(d);
        }
      }

      dot.hit = Math.max(dot.hit - delta * 2, 0);
    }
  }
}

export default Simulation;
