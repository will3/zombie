var THREE = require('three');

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x666666);
document.body.appendChild(renderer.domElement);

var scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000);

// image cache
var images = {};

function loadAssets(done) {
  var total = 1;
  var count = 0;

  var imageLoader = new THREE.ImageLoader();
  imageLoader.load(
    'images/zombie.png',
    function(image) {
      images['zombie'] = image;
      count++;
      if (count === total) { done(); }
    },
    function(xhr) { /* Progress */ },
    function(xhr) { /* Error */
      count++;
      if (count === total) { done(); }
    }
  );
};

function render() {
  renderer.render(scene, camera);
};

var dt = 1000 / 60;

var app = require('./core/runner')();

function animate() {
  app.tick(dt);
  render();
  requestAnimationFrame(animate);

  dragCamera.rotation.y += 0.01;
};

var Physics = require('./utils/physics');
var Zombie = require('./components/zombie');
var DragCamera = require('./components/dragcamera');
var spriteSheet;
var blockSheet;
var dragCamera;

loadAssets(function() {

  app.container.camera = camera;
  app.container.scene = scene;

  // Set up input
  var input = require('./utils/input')();
  app.attach(input);
  app.container.input = input;

  // Set up physics
  var physics = new Physics();
  app.attach(physics);
  var groundShape = new CANNON.Plane();
  var groundBody = new CANNON.Body({ mass: 0, shape: groundShape });
  groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
  physics.world.add(groundBody);
  physics.world.gravity.set(0, -9.82, 0);
  app.container.physics = physics;

  app.container.images = images;

  var zombie = new Zombie();
  scene.add(zombie.object);
  app.attach(zombie);

  var zombie = new Zombie();
  scene.add(zombie.object);
  zombie.object.position.x = 2;
  zombie.object.position.z = 2;
  app.attach(zombie);

  dragCamera = DragCamera();
  app.attach(dragCamera);

  animate();
});
