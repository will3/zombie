var monotoneMesher = require('./monotone').mesher;

module.exports = function(chunk) {
  var f = function(i, j, k) {
    return chunk.get(i, j, k);
  }

  var result = monotoneMesher(f, chunk.shape);

  var geometry = new THREE.Geometry();

  result.faces.forEach(function(f) {
    var face = new THREE.Face3(f[0], f[1], f[2]);
    face.materialIndex = f[3];
    geometry.faces.push(face);
  });

  result.vertices.forEach(function(v) {
    var vertice = new THREE.Vector3(v[0], v[1], v[2]);
    geometry.vertices.push(vertice);
  });

  return geometry;
};
