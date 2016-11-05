import * as Pixi from 'pixi.js';
import * as p2 from 'p2';

import {registerListeners, keysDown} from './util/inputter';
import keyCodes from './util/keyCodes';

const renderer = Pixi.autoDetectRenderer(600, 400);
document.querySelector('.game-container')!.appendChild(renderer.view);
registerListeners();

const stage = new Pixi.Container();

const world = new p2.World();

interface PhysicsState {
  world: p2.World;
  playerBody: p2.Body;
}

interface RenderState {
  playerGraphics: Pixi.Graphics;
}

let physState: PhysicsState;
let renderState: RenderState;

interface BoxOptions {
  width: number;
  height: number;
  x: number;
  y: number;
}

function createStaticBox(opts: BoxOptions) {
  const boxShape = new p2.Box({width: opts.width, height: opts.height})

  const boxBody = new p2.Body({
    mass: 0,
    position: [opts.x, opts.y],
  });

  boxBody.addShape(boxShape);

  return boxBody;
}

const platformData = [{
  width: 10, height: 10, x: 0, y: -20
}];

function init() {
  /*
   * Initialize physics
   */

  const world = new p2.World();

  const playerShape = new p2.Box({width: 3, height: 3});

  const playerBody = new p2.Body({
    mass: 1,
    position: [0, -12],
    angularVelocity: 0,
  });

  playerBody.addShape(playerShape);
  world.addBody(playerBody);

  platformData.forEach((opts) => {
    const box = createStaticBox(opts);
    world.addBody(box);
  });

  physState = {
    world,
    playerBody,
  };

  /*
   * Initialize rendering
   */

  // center at origin
  stage.position.x = renderer.width / 2;
  stage.position.y = renderer.height / 2;

  // zoom in
  const zoom = 10;
  stage.scale.x = zoom;
  stage.scale.y = -zoom;  // y axis is flipped because physics up and rendering up are opposite

  const playerGraphics = new Pixi.Graphics();
  playerGraphics.beginFill(0xFF0000);
  playerGraphics.drawRect(-playerShape.width/2, -playerShape.height/2, playerShape.width, playerShape.height);

  platformData.forEach((platform) => {
    const platformGraphics = new Pixi.Graphics();
    platformGraphics.beginFill(0x00FF00);
    platformGraphics.drawRect(-platform.width/2, -platform.height/2, platform.width, platform.height);
    platformGraphics.position.x = platform.x;
    platformGraphics.position.y = platform.y;
    stage.addChild(platformGraphics);
  });

  stage.addChild(playerGraphics);

  renderState = {
    playerGraphics,
  };
}

function update(dt: number) {
  const {world, playerBody} = physState;

  playerBody.angularDamping = 0.5;

  if (keysDown.has(keyCodes.SPACE) || keysDown.has(keyCodes.UP_ARROW) || keysDown.has(keyCodes.W)) {
    playerBody.applyForceLocal([0, 25]);
  }

  if (keysDown.has(keyCodes.A) || keysDown.has(keyCodes.LEFT_ARROW))  {
    playerBody.angularVelocity = 1;
  }
  if (keysDown.has(keyCodes.D) || keysDown.has(keyCodes.RIGHT_ARROW)) {
    playerBody.angularVelocity = -1;
  }

  world.step(dt);

  const {playerGraphics} = renderState;

  playerGraphics.position.x = playerBody.position[0];
  playerGraphics.position.y = playerBody.position[1];
  playerGraphics.rotation = playerBody.angle;

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
