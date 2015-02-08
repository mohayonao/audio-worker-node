"use strict";

var utils = require("./utils");
var AudioWorkerImpl = require("./audio-worker-impl");

function AudioWorkerNode(audioContext, scriptURL, numberOfInputChannels, numberOfOutputChannels) {
  numberOfInputChannels = utils.defaults(numberOfInputChannels, 2);
  numberOfOutputChannels = utils.defaults(numberOfOutputChannels, 2);

  var impl = new AudioWorkerImpl(audioContext, scriptURL, numberOfInputChannels, numberOfOutputChannels);

  Object.defineProperties(impl.inlet, {
    onmessage: {
      set: function(value) {
        if (typeof value !== "function") {
          value = null;
        }
        impl.port1.onmessage = value;
      },
      get: function() {
        return impl.port1.onmessage;
      },
      enumerable: true
    },
    connect: {
      value: function(destination) {
        return impl.connect(destination);
      }
    },
    disconnect: {
      value: function() {
        return impl.disconnect();
      }
    },
    postMessage: {
      value: function() {
        return impl.port1.postMessage.apply(impl.port1, arguments);
      }
    },
    addParameter: {
      value: function(name, defaultValue) {
        defaultValue = utils.defaults(defaultValue, 0);
        if (!Object.getOwnPropertyDescriptor(impl.inlet, name)) {
          Object.defineProperty(impl.inlet, name, {
            get: function() {
              return impl.getParameter(name);
            },
            configurable: true,
            enumerable: true
          });
        }
        return impl.addParameter(name, defaultValue);
      }
    },
    removeParameter: {
      value: function(name) {
        if (Object.getOwnPropertyDescriptor(impl.inlet, name)) {
          delete impl.inlet[name];
        }
        return impl.removeParameter(name);
      }
    },
    terminate: {
      value: function() {
        return impl.terminate();
      }
    }
  });

  return impl.inlet;
}
module.exports = AudioWorkerNode;
