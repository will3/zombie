var ee = require('event-emitter');

var Runner = function() {
  this.map = {};
  this.container = {};
  this.events = ee();
};

Runner.prototype.attach = function(component) {
  if (component._id == null) {
    component._id = guid();
  }
  this.map[component._id] = component;

  if (component.onAttach != null) {
    component.onAttach(this);
  }

  this.events.emit('attach', component);
};

Runner.prototype.dettach = function(component) {
  delete this.map[component._id];

  this.events.emit('dettach', component);
};

Runner.prototype.tick = function(dt) {
  var component;
  for (var id in this.map) {
    component = this.map[id];
    if (component.tick != null) {
      component.tick(dt);
    }
  }

  for (var id in this.map) {
    component = this.map[id];
    if (component.lateTick != null) {
      component.lateTick();
    }
  }
};

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

module.exports = function() {
  return new Runner();
};
