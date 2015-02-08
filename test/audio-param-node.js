"use strict";

var assert = require("power-assert");
var AudioParamNode = require("../lib/audio-param-node");

describe("AudioParamNode", function() {
  var audioContext;

  beforeEach(function() {
    audioContext = new global.AudioContext();
  });

  describe("constructor", function() {
    it("(audioContext: AudioContext, defaultValue: number)", function() {
      var node = new AudioParamNode(audioContext, 0.5, 256);

      assert(node instanceof global.AudioNode);
      assert(node.param instanceof global.AudioParam);
      assert(node.param.value === 0.5);
    });
  });
  describe("#array", function() {
    it("get: Float32Array", function() {
      var node = new AudioParamNode(audioContext, 0.5, 256);

      assert(node.array instanceof Float32Array);
    });
  });
  describe("#connect", function() {
    it("(destination: AudioNode): void", function() {
      var node = new AudioParamNode(audioContext, 0.5, 256);

      node.connect(audioContext.destination);

      assert.deepEqual(audioContext.toJSON(), {
        name: "AudioDestinationNode",
        inputs: [
          {
            name: "ScriptProcessorNode",
            inputs: [
              {
                name: "GainNode",
                gain: {
                  value: 0.5,
                  inputs: []
                },
                inputs: []
              }
            ]
          }
        ]
      });
    });
  });
  describe("#disconnect", function() {
    it("(): void", function() {
      var node = new AudioParamNode(audioContext, 0.5, 256);

      node.connect(audioContext.destination);
      node.disconnect();

      assert.deepEqual(audioContext.toJSON(), {
        name: "AudioDestinationNode",
        inputs: []
      });
    });
  });
});
