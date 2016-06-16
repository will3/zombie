var SpriteSheet = function(image, frames) {
  this.image = image || null;
  this.frames = frames || 1;
  this.frame = 0;
  this.object = new THREE.Sprite();
  this.texture = null;
  this.material = null;
  this.frameWidth = 1 / frames;
  this.frameInterval = [];
  this.defaultFrameInterval = 500;
  this.dtCounter = 0;

  this.elementNeedsUpdate = false;
};

SpriteSheet.prototype.setFrame = function(frame) {
  this.frame = frame;
  this.texture.offset.set(this.frameWidth * frame, 0);
};

SpriteSheet.prototype.tick = function(dt) {
  if (this.elementNeedsUpdate) {
    this.dispose();

    this.texture = new THREE.Texture();
    this.texture.image = this.image;
    this.texture.needsUpdate = true;
    this.texture.repeat.set(1 / this.frames, 1);
    this.texture.minFilter = THREE.NearestFilter;
    this.texture.magFilter = THREE.NearestFilter;

    this.material = new THREE.SpriteMaterial({
      map: this.texture
    });

    this.object.material = this.material;
    this.elementNeedsUpdate = false;
  }

  this.dtCounter += dt;
  var interval = this.frameInterval[this.frame] || this.defaultFrameInterval;
  if (this.dtCounter > interval) {
    this.dtCounter -= interval;

    // Progress to next frame

    this.frame++;
    this.frame %= this.frames;
    this.setFrame(this.frame);
  }
};

SpriteSheet.prototype.dispose = function() {
  if (this.texture != null) {
    this.texture.dispose();
  }
  if (this.material != null) {
    this.material.dispose();
  }
};

module.exports = SpriteSheet;
