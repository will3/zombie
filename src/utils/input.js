var keycode = require('keycode');

module.exports = function() {
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);

  var keyHolds = {};
  var keyDowns = {};
  var keyUps = {};

  function onKeyDown(e) {
    var key = keycode(e);
    if (!keyHolds[key]) {
      keyDowns[key] = true;
    }
    keyHolds[key] = true;
  };

  function onKeyUp(e) {
    var key = keycode(e);
    keyHolds[key] = false;
    keyUps[key] = true;
  };

  function lateTick() {
    keyDowns = {};
    keyUps = {};
  };

  return {
    lateTick: lateTick,

    key: function(k) {
      return keyHolds[k] || false;
    },
    keyDown: function(k) {
      return keyDowns[k] || false;
    },
    keyUp: function(k) {
      return keyUps[k] || false;
    }
  }
};
