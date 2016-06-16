var monotoneMesher = require('./monotone').mesher;
var greedyMesher = require('./greedy').mesher;

module.exports = function(chunk) {
  var f = function(i, j, k) {
    return chunk.get(i, j, k);
  }

  var result = greedyMesher(f, chunk.shape);

  var geometry = new THREE.Geometry();

  result.faces.forEach(function(f) {
    var face1 = new THREE.Face3(f[0], f[1], f[2]);
    face1.materialIndex = f[4];
    var face2 = new THREE.Face3(f[2], f[3], f[0]);
    face2.materialIndex = f[4];
    geometry.faces.push(face1, face2);
  });

  result.vertices.forEach(function(v) {
    var vertice = new THREE.Vector3(v[0], v[1], v[2]);
    geometry.vertices.push(vertice);
  });

  geometry.computeFaceNormals();

  return geometry;
};
