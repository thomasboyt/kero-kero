import * as Pixi from 'pixi.js';
import * as p2 from 'p2';

const renderer = Pixi.autoDetectRenderer(600, 400);
document.querySelector('.game-container')!.appendChild(renderer.view);

const stage = new Pixi.Container();

const world = new p2.World();

interface PhysicsState {
  world: p2.World;
  boxBody: p2.Body;
}

interface RenderState {
  boxGraphics: Pixi.Graphics;
}

let physState: PhysicsState;
let renderState: RenderState;

function init() {
  /*
   * Initialize physics
   */

  const world = new p2.World();

  const boxShape = new p2.Box({width: 2, height: 1});

  const boxBody = new p2.Body({
    mass: 1,
    position: [0, 2],
    angularVelocity: 1,
  });

  boxBody.addShape(boxShape);
  world.addBody(boxBody);

  const planeShape = new p2.Plane();
  const planeBody = new p2.Body({position: [0, -1]});
  planeBody.addShape(planeShape);

  world.addBody(planeBody);

  physState = {
    world,
    boxBody,
  };

  /*
   * Initialize rendering
   */

  // center at origin
  stage.position.x = renderer.width / 2;
  stage.position.y = renderer.height / 2;

  // zoom in
  const zoom = 100;
  stage.scale.x = zoom;
  stage.scale.y = -zoom;  // y axis is flipped because physics up and rendering up are opposite

  const boxGraphics = new Pixi.Graphics();
  boxGraphics.beginFill(0xFF0000);
  boxGraphics.drawRect(-boxShape.width/2, -boxShape.height/2, boxShape.width, boxShape.height);

  stage.addChild(boxGraphics);

  renderState = {
    boxGraphics,
  };
}

function update(dt: number) {
  const {world, boxBody} = physState;

  world.step(dt);

  const {boxGraphics} = renderState;

  boxGraphics.position.x = boxBody.position[0];
  boxGraphics.position.y = boxBody.position[1];
  boxGraphics.rotation = boxBody.angle;

  renderer.render(stage);
}

let prev = Date.now();
function runLoop() {
  const now = Date.now();
  const dt = now - prev;
  prev = now;

  update(dt / 1000);

  window.requestAnimationFrame(runLoop);
}

init();
runLoop();
