"use strict";

var assert = require("power-assert");
var AudioParamImpl = require("../lib/audio-param-impl");

describe("AudioParamImpl", function() {
  var audioContext;

  beforeEach(function() {
    audioContext = new global.AudioContext();
  });

  describe("constructor", function() {
    it("(audioContext: AudioContext, defaultValue: number, bufferSize: number)", function() {
      var impl = new AudioParamImpl(audioContext, 0.5, 256);

      assert(impl instanceof AudioParamImpl);
      assert(impl.inlet instanceof global.GainNode);
      assert(impl.outlet instanceof global.ScriptProcessorNode);
      assert(impl.param instanceof global.AudioParam);
      assert(impl.param.value === 0.5);
      assert(impl.array instanceof Float32Array);
      assert(impl.array.length === 256);
    });
  });
  describe("#connect", function() {
    it("(destination: AudioNode): void", function() {
      var impl = new AudioParamImpl(audioContext, 0.5, 256);

      impl.connect(audioContext.destination);

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
      var impl = new AudioParamImpl(audioContext, 0.5, 256);

      impl.connect(audioContext.destination);
      impl.disconnect();

      assert.deepEqual(audioContext.toJSON(), {
        name: "AudioDestinationNode",
        inputs: []
      });
    });
  });
  describe("works", function() {
    it("onaudioprocess", function() {
      var impl = new AudioParamImpl(audioContext, 0.5, 256);
      var input = new Float32Array(256);
      var e = {
        inputBuffer: {
          getChannelData: function() {
            return input;
          }
        }
      };
      for (var i = 0; i < 256; i++) {
        input[i] = Math.random() -0.5;
      }

      impl.outlet.onaudioprocess(e);

      assert.deepEqual(impl.array, input);
    });
  });
});
