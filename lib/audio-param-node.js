"use strict";

var AudioParamImpl = require("./audio-param-impl");

function AudioParamNode(audioContext, defaultValue, bufferSize) {
  var impl = new AudioParamImpl(audioContext, defaultValue, bufferSize);

  Object.defineProperties(impl.inlet, {
    param: {
      value: impl.param,
      enumerable: true
    },
    array: {
      value: impl.array,
      enumerable: true
    },
    connect: {
      value: function(destination) {
        impl.connect(destination);
      }
    },
    disconnect: {
      value: function() {
        impl.disconnect();
      }
    }
  });

  return impl.inlet;
}

module.exports = AudioParamNode;
