var mesher = require('../voxel/mesher');
var ndarray = require('ndarray');
var BlockSheet = require('../utils/blocksheet');

var Turrent = function() {
  this.type = 'true';

  this.blockSheet = new BlockSheet();

  this.object = new THREE.Object3D();
  this.object.add(this.blockSheet.object);

  this.componentsByType = null;
};

Turrent.prototype.onAttach = function(app) {
  this.componentsByType = app.container.componentsByType;

  this.blockSheet.onAttach(app);
  this.blockSheet.materialType = 'lambert';
  this.blockSheet.elementNeedsUpdate = true;
  this.blockSheet.autoFaceCamera = false;
  this.chunk = ndarray([], [3, 3, 8]);

  for (var i = 0; i < 3; i++) {
    for (var j = 0; j < 3; j++) {
      for (var k = 0; k < 3; k++) {
        this.chunk.set(i, j, k, 1);
      }
    }
  }

  this.chunk.set(1, 1, 3, 1);
  this.chunk.set(1, 1, 4, 1);
  this.chunk.set(1, 1, 5, 1);
  this.chunk.set(1, 1, 6, 1);
  this.chunk.set(1, 1, 7, 1);

  this.blockSheet.blocksData = {
    palette: [null, 0x333333],
    chunks: [this.chunk]
  };

  this.blockSheet.center.set(-1.5, -1.5, -1.5);

  this.object.rotation.order = 'YXZ';
};

Turrent.prototype.tick = function(dt) {
  this.blockSheet.tick(dt);
};

Turrent.prototype.dispose = function() {
  this.blockSheet.dispose();
};

module.exports = Turrent;
