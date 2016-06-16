module.exports = function(app) {
  var map = {};

  app.events.on('attach', function(component) {
    if (component.type != null) {
      if (map[component.type] == null) {
        map[component.type] = {};
      }
      map[component.type][component._id] = component;
    }
  });

  app.events.on('dettach', function(component) {
    if (component.type != null) {
      if (map[component.type] == null) {
        return;
      }
      delete map[component.type][component._id];
    }
  });

  function getAll(type) {
    return map[type] || {};
  };

  return {
    getAll: getAll
  };
};
