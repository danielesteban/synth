import Rapier from '@dimforge/rapier2d-compat';

const sdBox = (p, r) => {
  const q = { x: Math.abs(p.x) - r.x, y: Math.abs(p.y) - r.y };
  const m = Math.min(Math.max(q.x, q.y), 0);
  q.x = Math.max(q.x, 0) + m;
  q.y = Math.max(q.y, 0) + m;
  return Math.sqrt(q.x ** 2 + q.y ** 2);
};

class Simulation {
  constructor({ count, size }) {
    this.count = count;
    this.size = size;
    Rapier.init()
      .then(() => {
        this.world = new Rapier.World({ x: 0, y: 0 });
        this.boxes = [];
        [[0.2, 0.2], [0.8, 0.2], [0.2, 0.8], [0.8, 0.8]].forEach(([x, y]) => {
          const anchor = this.world.createRigidBody(
            Rapier.RigidBodyDesc.fixed()
              .setTranslation(size.x * x, size.y * y)
          );
          const body = this.world.createRigidBody(
            Rapier.RigidBodyDesc.dynamic()
              .setTranslation(size.x * x, size.y * y)
              .setRotation(Math.random() * Math.PI * 2)
          );
          const s = Math.min(size.x, size.y) * 0.05;
          const extents = [s * 0.5, s * (Math.random() * 0.25 + 0.75) * 4];
          const collider = this.world.createCollider(
            Rapier.ColliderDesc.cuboid(extents[0] * 0.5, extents[1] * 0.5),
            body
          );
          this.world.createImpulseJoint(Rapier.JointData.revolute({ x: 0, y: 0 }, { x: 0, y: 0 }), anchor, body, true)
            .configureMotorVelocity(0.5 + Math.random() * 0.1, 100);
          this.boxes.push({
            body,
            collider,
            extents,
          });
        });

        this.dots = [];
        for (let i = 0; i < count; i++) {
          const s = 1 + Math.random() * 2;
          const radius = 4 + s * 3;
          const position = { x: 0, y: 0 };
          const findPosition = () => {
            position.x = radius + Math.random() * (size.x - radius * 2);
            position.y = radius + Math.random() * (size.y - radius * 2);
            for (let j = 0; j < this.boxes.length; j++) {
              const b = this.boxes[j];
              const t = b.body.translation();
              const r = b.body.rotation();
              const dx = (position.x - t.x);
              const dy = (position.y - t.y);
              const d = sdBox({ x: dx * Math.cos(r) + dy * Math.sin(r), y: dy * Math.cos(r) - dx * Math.sin(r) }, { x: b.extents[0] * 0.5, y: b.extents[1] * 0.5 });
              if (d <= radius) {
                return false;
              }
            }
            for (let j = 0; j < i; j++) {
              const d = this.dots[j];
              const t = d.body.translation();
              if (Math.sqrt((position.x - t.x) ** 2 + (position.y - t.y) ** 2) <= (radius + d.radius)) {
                return false;
              }
            }
            return true;
          };
          while (true) {
            if (findPosition()) {
              break;
            }
          }
          const direction = {
            x: Math.random() - 0.5,
            y: Math.random() - 0.5,
          };
          const l = Math.sqrt(direction.x ** 2 + direction.y ** 2);
          direction.x /= l;
          direction.y /= l;
          const speed = (4 - s) * 3;
          const body = this.world.createRigidBody(
            Rapier.RigidBodyDesc.dynamic()
              .setAngularDamping(1)
              .setLinearDamping(0)
              .setTranslation(position.x, position.y)
              .setLinvel(direction.x * speed, direction.y * speed)
          );
          const collider = this.world.createCollider(
            Rapier.ColliderDesc.ball(radius)
              .setFriction(0)
              .setRestitution(1),
            body
          );
          this.dots.push({
            note: i,
            duration: s * 0.5,
            color: (i / 7) % 1,
            radius,
            hit: 0,
            body,
            collider,
          });
        }

        for (let i = 0; i < 2; i++) {
          this.world.createCollider(
            Rapier.ColliderDesc.cuboid(size.x * 0.5, 10)
              .setTranslation(size.x * 0.5, i === 0 ? -10 : size.y + 10)
          );
          this.world.createCollider(
            Rapier.ColliderDesc.cuboid(10, size.y * 0.5)
              .setTranslation(i === 0 ? -10 : size.x + 10, size.y * 0.5)
          );
        }
      });
  }

  hit(dot) {
    const { onHit } = this;
    if (onHit && dot.hit < 0.5) {
      onHit(dot);
    }
    dot.hit = 1;
  }

  step(delta) {
    const { dots, world } = this;
    if (!world) {
      return;
    }
    world.timestep = delta;
    world.step();

    const count = dots.length;
    for (let i = 0; i < count; i++) {
      const dot = dots[i];
      world.contactsWith(dot.collider, (collider) => {
        world.contactPair(dot.collider, collider, (manifold) => {
          if (manifold.contactDist() < 0) {
            this.hit(dot);
          }
        });
      });
      dot.hit = Math.max(dot.hit - delta * 2, 0);
    }
  }
}

export default Simulation;
