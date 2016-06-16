var CANNON = require('cannon');

var Physics = function() {
  this.world = new CANNON.World();
  this.maxSubSteps = 3;
  this.fixedTimeStep = 1 / 60.0;

  this.map = {};
};

Physics.prototype.add = function(obj, body) {
  this.map[obj.uuid] = {
    obj: obj,
    body: body
  };

  this.world.addBody(body);
};

Physics.prototype.tick = function(dt) {
  this.world.step(this.fixedTimeStep, dt / 1000, this.maxSubSteps);

  var obj, body;
  for (var id in this.map) {
    obj = this.map[id].obj;
    body = this.map[id].body;

    obj.position.x = body.position.x;
    obj.position.y = body.position.y;
    obj.position.z = body.position.z;
    obj.quaternion.x = body.quaternion.x;
    obj.quaternion.y = body.quaternion.y;
    obj.quaternion.z = body.quaternion.z;
    obj.quaternion.w = body.quaternion.w;
  }
};

module.exports = Physics;
