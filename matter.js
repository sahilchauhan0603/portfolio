const canvas = document.querySelector("#wrapper-canvas");

const dimensions = {
  width: window.innerWidth,
  height: window.innerHeight,
};

Matter.use("matter-attractors");
Matter.use("matter-wrap");

function runMatter() {
  const {
    Engine,
    Runner,
    Render,
    World,
    Bodies,
    Body,
    Mouse,
    Events,
    Common,
  } = Matter;

  // Create engine and renderer
  const engine = Engine.create();
  engine.world.gravity.y = 0;
  engine.world.gravity.x = 0;

  const render = Render.create({
    element: canvas,
    engine: engine,
    options: {
      width: dimensions.width,
      height: dimensions.height,
      wireframes: false,
      background: "transparent",
    },
  });

  const runner = Runner.create();

  // Create the attractor body
  const attractorSize = Math.max(dimensions.width / 25, dimensions.height / 25) / 2;
  const attractor = Bodies.circle(
    render.options.width / 2,
    render.options.height / 2,
    attractorSize,
    {
      isStatic: true,
      render: { fillStyle: "#000" },
      plugin: {
        attractors: [
          (bodyA, bodyB) => ({
            x: (bodyA.position.x - bodyB.position.x) * 1e-6,
            y: (bodyA.position.y - bodyB.position.y) * 1e-6,
          }),
        ],
      },
    }
  );
  World.add(engine.world, attractor);

  // Create objects
  for (let i = 0; i < 60; i++) {
    const x = Common.random(0, render.options.width);
    const y = Common.random(0, render.options.height);

    const randomSize = Common.random(4, 60);
    const polygon = Bodies.polygon(
      x,
      y,
      Common.random(3, 6),
      randomSize,
      {
        mass: randomSize / 20,
        frictionAir: 0.02,
        render: { fillStyle: "#444" },
      }
    );
    World.add(engine.world, polygon);

    const circle = Bodies.circle(x, y, Common.random(2, 20), {
      mass: 0.1,
      frictionAir: 0.01,
      render: { fillStyle: "#888" },
    });
    World.add(engine.world, circle);
  }

  // Mouse control for attractor movement
  const mouse = Mouse.create(render.canvas);
  Events.on(engine, "afterUpdate", () => {
    if (!mouse.position.x) return;
    Body.translate(attractor, {
      x: (mouse.position.x - attractor.position.x) * 0.12,
      y: (mouse.position.y - attractor.position.y) * 0.12,
    });
  });

  // Run the engine and renderer
  Runner.run(runner, engine);
  Render.run(render);

  // Return control functions
  return {
    engine,
    runner,
    render,
    stop: () => {
      Render.stop(render);
      Runner.stop(runner);
    },
    play: () => {
      Runner.run(runner, engine);
      Render.run(render);
    },
  };
}

// Debounce function
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

// Handle window resizing
function resizeCanvas() {
  dimensions.width = window.innerWidth;
  dimensions.height = window.innerHeight;

  m.render.canvas.width = dimensions.width;
  m.render.canvas.height = dimensions.height;
}

// Initialize the Matter.js simulation
const m = runMatter();
window.addEventListener("resize", debounce(resizeCanvas, 250));
