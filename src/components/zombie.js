var SpriteSheet = require('../utils/spritesheet');
var BlockSheet = require('../utils/blocksheet');

var Zombie = function() {
  this.object = new THREE.Object3D();
  this.spriteSheet = null;
  this.blockSheet = null;

  // Injected
  this.input = null;
  this.app = null;

  this.blockMode = false;
};

Zombie.prototype.onAttach = function(app) {
  var images = app.container.images;
  this.input = app.container.input;
  this.app = app;

  // Add zombie sprite
  spriteSheet = new SpriteSheet(images['zombie'], 2);
  spriteSheet.elementNeedsUpdate = true;
  spriteSheet.object.position.y = 0.5;

  this.spriteSheet = spriteSheet;


  // Add zombie blocks
  blockSheet = new BlockSheet(images['zombie'], 2);
  blockSheet.elementNeedsUpdate = true;
  blockSheet.object.position.y = 0.5;

  this.blockSheet = blockSheet;

  this.object.add(spriteSheet.object);
  this.object.add(blockSheet.object);

  this.blockSheet.onAttach(app);

  this.spriteSheet.object.visible = !this.blockMode;
  this.blockSheet.object.visible = this.blockMode;
};

Zombie.prototype.tick = function(dt) {
  this.spriteSheet.tick(dt);
  this.blockSheet.tick(dt);

  if (this.input.keyDown('enter')) {
    this.blockMode = !this.blockMode;
    this.spriteSheet.object.visible = !this.blockMode;
    this.blockSheet.object.visible = this.blockMode;
  }
};

Zombie.prototype.dispose = function() {
  this.spriteSheet.dispose();
  this.blockSheet.dispose();
};

module.exports = Zombie;
