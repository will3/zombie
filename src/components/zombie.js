var BlockSheet = require('../utils/blocksheet');

var Zombie = function() {
  this.type = 'zombie';
  
  this.object = new THREE.Object3D();
  this.blockSheet = null;

  // Injected
  this.input = null;
  this.app = null;
};

Zombie.prototype.onAttach = function(app) {
  var images = app.container.images;
  this.input = app.container.input;
  this.app = app;

  // Add zombie blocks
  blockSheet = new BlockSheet();
  blockSheet.loadImage(images['zombie'], 2);
  blockSheet.elementNeedsUpdate = true;
  blockSheet.object.position.y = 0.5;

  this.blockSheet = blockSheet;

  this.object.add(blockSheet.object);

  this.blockSheet.onAttach(app);
};

Zombie.prototype.tick = function(dt) {
  this.blockSheet.tick(dt);
};

Zombie.prototype.dispose = function() {
  this.blockSheet.dispose();
};

module.exports = Zombie;
