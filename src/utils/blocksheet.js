var mesher = require('../voxel/mesher');
var ndarray = require('ndarray');

var BlockSheet = function(image, frames) {
  this.image = image || null;

  this.elementNeedsUpdate = false;

  this.object = new THREE.Object3D();
  this.mesh = new THREE.Mesh();
  this.object.add(this.mesh);

  this.material = null;

  // frames, palette
  this.blocksData = null;
  this.geometries = [];

  this.frames = frames || 1;
  this.frame = 0;
  this.frameInterval = [];
  this.defaultFrameInterval = 500;
  this.dtCounter = 0;
  this.center = new THREE.Vector3();

  // Injected
  this.physics = null;
  this.camera = null;
  this.scene = null;
};

BlockSheet.prototype.onAttach = function(app) {
  this.physics = app.container.physics;
  this.camera = app.container.camera;
  this.scene = app.container.scene;
};

BlockSheet.prototype.tick = function(dt) {
  if (this.elementNeedsUpdate) {
    this.updateElements();
    this.elementNeedsUpdate = false;
  }

  this.dtCounter += dt;
  var frameInterval = this.frameInterval[this.frame] || this.defaultFrameInterval;

  if (this.dtCounter > frameInterval) {
    this.dtCounter -= frameInterval;
    this.frame++;
    this.frame %= this.frames;

    var geometry = this.geometries[this.frame];
    if (geometry == null) {
      geometry = mesher(this.blocksData.chunks[this.frame]);
    }

    this.mesh.geometry = geometry;
  }

  // var dir =
  //   new THREE.Vector3().subVectors(this.object.position, this.camera.position).normalize();

  // var forward = new THREE.Vector3(0, 0, 1).applyEuler(this.camera.rotation);

  // var cameraRight = new THREE.Vector3().crossVectors(dir, forward);
  // var cameraUp = new THREE.Vector3(0, 1, 0).applyEuler(this.camera.rotation);

  // this.object.up.copy(cameraUp);
  this.object.lookAt(this.camera.position);
};

BlockSheet.prototype.updateElements = function() {
  this.dispose();

  this.blocksData = this.imageToBlocks(this.image, this.frames);
  var scale = 1 / this.image.height;
  this.object.scale.set(scale, scale, scale);
  this.center = new THREE.Vector3(-this.image.width / this.frames / 2, -this.image.height / 2, 0.5);
  this.mesh.position.copy(this.center);

  this.updateMaterial();

  this.mesh.material = this.material;
};

BlockSheet.prototype.dispose = function() {
  if (this.material != null) {
    this.material.materials.forEach(function(material) {
      if (material != null) {
        material.dispose();
      }
    });
  }

  this.geometries.forEach(function(geometry) {
    geometry.dispose();
  });
};

BlockSheet.prototype.updateMaterial = function() {
  this.material = new THREE.MultiMaterial();
  var self = this;
  this.blocksData.palette.forEach(function(color) {
    if (color == null) {
      self.material.materials.push(null);
      return;
    }
    self.material.materials.push(new THREE.MeshBasicMaterial({
      color: color
    }));
  });
};

BlockSheet.prototype.imageToBlocks = function(image, frames) {
  frames = frames || 1;

  // Temp canvas
  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');

  context.drawImage(image, 0, 0);
  var imageData = context.getImageData(0, 0, image.width, image.height);

  var shape = [image.width, image.height, 1];
  var chunk = ndarray([], shape);
  var palette = [null];
  var colorMap = {};

  var width = image.width;
  var row, column, frame, index;
  var totalRows = image.height;
  var frameWidth = width / frames;
  var chunks = [];

  for (var i = 0; i < imageData.data.length; i += 4) {
    var r = imageData.data[i] / 255.0;
    var g = imageData.data[i + 1] / 255.0;
    var b = imageData.data[i + 2] / 255.0;
    var a = imageData.data[i + 3] / 255.0;
    if (a === 0) {
      continue;
    }
    var color = new THREE.Color(r, g, b).getHex();

    row = (-Math.floor(i / 4 / width) - 2) % totalRows;
    column = (i / 4) % width;
    frame = Math.floor(column / frameWidth);
    column -= frame * frameWidth;

    if (colorMap[color]) {
      index = colorMap[color];
    } else {
      index = palette.length;
      palette.push(color);
      colorMap[color] = index;
    }

    if (chunks[frame] == null) {
      chunks[frame] = ndarray([], [frameWidth, image.height, 1]);
    }
    chunks[frame].set(column + 1, row, 1, index);
  }

  return {
    chunks: chunks,
    palette: palette
  };
};

module.exports = BlockSheet;
