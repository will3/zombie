module.exports = function() {

  var camera;

  function onAttach(app) {
    camera = app.container.camera;
  };

  function tick(dt) {
    updatePosition();
  }

  function updatePosition() {
    var position = new THREE.Vector3(0, 0, 1)
      .applyEuler(self.rotation)
      .multiplyScalar(self.distance)
      .add(self.target);
    camera.position.copy(position);
    camera.lookAt(self.target);
  }

  var self = {
    onAttach: onAttach,
    tick: tick,
    rotation: new THREE.Euler(-Math.PI / 4, Math.PI / 4, 0, 'YXZ'),
    distance: 20,
    target: new THREE.Vector3()
  };

  return self;
};
