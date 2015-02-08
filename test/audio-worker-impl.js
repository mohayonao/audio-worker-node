"use strict";

var assert = require("power-assert");
var sinon = require("sinon");
var AudioWorkerImpl = require("../lib/audio-worker-impl");

describe("AudioWorkerImpl", function() {
  var audioContext;

  beforeEach(function() {
    audioContext = new global.AudioContext();
  });

  describe("constructor", function() {
    it("(audioContext: AudioContext, scriptURL: string, numbOfInput: number, numOfOutput: number)", function() {
      var impl = new AudioWorkerImpl(audioContext, "test_worker.js", 1, 1);

      assert(impl instanceof AudioWorkerImpl);
      assert(impl.sampleRate === audioContext.sampleRate);
      assert(impl.inlet instanceof global.AudioNode);
      assert(impl.outlet instanceof global.AudioNode);
      assert(typeof impl.scope === "object");
      assert(typeof impl.port1 === "object");
      assert(typeof impl.port2 === "object");

      assert.deepEqual(impl.outlet.toJSON(), {
        name: "ScriptProcessorNode",
        inputs: []
      });
    });
  });
  describe("#port", function() {
    it("works when not terminated", function(done) {
      var impl = new AudioWorkerImpl(audioContext, "test_worker.js", 1, 1);

      impl.port1.onmessage = sinon.spy(function() {
        assert(impl.port1.onmessage.callCount === 1);
        assert(impl.port1.onmessage.firstCall.args[0].type === "message");
        assert(impl.port1.onmessage.firstCall.args[0].data === "hello");
        done();
      });

      impl.port2.postMessage("hello");

      assert(impl.port1.onmessage.callCount === 0);
    });
    it("works when not terminated", function(done) {
      var impl = new AudioWorkerImpl(audioContext, "test_worker.js", 1, 1);

      impl.port1.onmessage = sinon.spy();

      impl.terminate();

      impl.port2.postMessage("hello");

      assert(impl.port1.onmessage.callCount === 0);

      setTimeout(function() {
        assert(impl.port1.onmessage.callCount === 0);
        done();
      }, 25);
    });
  });
  describe("#connect", function() {
    it("(destination: AudioNode): void", function() {
      var impl = new AudioWorkerImpl(audioContext, "test_worker.js", 1, 1);

      impl.addParameter("foo", 0.50);

      impl.connect(audioContext.destination);
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
                  value: 0,
                  inputs: []
                },
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
                        inputs: [
                          {
                            name: "AudioBufferSourceNode",
                            buffer: {
                              name: "AudioBuffer",
                              sampleRate: 44100,
                              length: 2,
                              duration: 2 / 44100,
                              numberOfChannels: 1
                            },
                            playbackRate: {
                              value: 1,
                              inputs: []
                            },
                            loop: true,
                            loopStart: 0,
                            loopEnd: 0,
                            inputs: []
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      });
    });
  });
  describe("#disconnect", function() {
    it("(): void", function() {
      var impl = new AudioWorkerImpl(audioContext, "test_worker.js", 1, 1);

      impl.connect(audioContext.destination);
      impl.disconnect();
      impl.disconnect();

      assert.deepEqual(audioContext.toJSON(), {
        name: "AudioDestinationNode",
        inputs: []
      });
    });
  });
  describe("#terminate", function() {
    it("(): void", function() {
      var impl = new AudioWorkerImpl(audioContext, "test_worker.js", 1, 1);

      impl.terminate();
      impl.terminate();
    });
  });
  describe("#addParameter", function() {
    it("(name: string, defaultValue: number): AudioParam when not connected", function() {
      var impl = new AudioWorkerImpl(audioContext, "test_worker.js", 1, 1);
      var param1 = impl.addParameter("foo", 0.50);
      var param2 = impl.addParameter("bar", 0.25);
      var param3 = impl.addParameter("bar", 0.25);

      assert(param1 instanceof global.AudioParam);
      assert(param2 instanceof global.AudioParam);
      assert(param2 === param3);
      assert(param1.value === 0.50);
      assert(param2.value === 0.25);

      assert.deepEqual(impl.outlet.toJSON(), {
        name: "ScriptProcessorNode",
        inputs: [
          {
            name: "GainNode",
            gain: {
              value: 0,
              inputs: []
            },
            inputs: [
              {
                name: "ScriptProcessorNode",
                inputs: [
                  {
                    name: "GainNode",
                    gain: {
                      value: 0.50,
                      inputs: []
                    },
                    inputs: []
                  }
                ]
              },
              {
                name: "ScriptProcessorNode",
                inputs: [
                  {
                    name: "GainNode",
                    gain: {
                      value: 0.25,
                      inputs: []
                    },
                    inputs: []
                  }
                ]
              }
            ]
          }
        ]
      });
    });
    it("(name: string, defaultValue: number): AudioParam when connected", function() {
      var impl = new AudioWorkerImpl(audioContext, "test_worker.js", 1, 1);

      impl.connect(audioContext.destination);

      var param1 = impl.addParameter("foo", 0.50);
      var param2 = impl.addParameter("bar", 0.25);
      var param3 = impl.addParameter("bar", 0.25);

      assert(param1 instanceof global.AudioParam);
      assert(param2 instanceof global.AudioParam);
      assert(param2 === param3);
      assert(param1.value === 0.50);
      assert(param2.value === 0.25);

      assert.deepEqual(impl.outlet.toJSON(), {
        name: "ScriptProcessorNode",
        inputs: [
          {
            name: "GainNode",
            gain: {
              value: 0,
              inputs: []
            },
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
                    inputs: [
                      {
                        name: "AudioBufferSourceNode",
                        buffer: {
                          name: "AudioBuffer",
                          sampleRate: 44100,
                          length: 2,
                          duration: 2 / 44100,
                          numberOfChannels: 1
                        },
                        playbackRate: {
                          value: 1,
                          inputs: []
                        },
                        loop: true,
                        loopStart: 0,
                        loopEnd: 0,
                        inputs: []
                      }
                    ]
                  }
                ]
              },
              {
                name: "ScriptProcessorNode",
                inputs: [
                  {
                    name: "GainNode",
                    gain: {
                      value: 0.25,
                      inputs: []
                    },
                    inputs: [
                      {
                        name: "AudioBufferSourceNode",
                        buffer: {
                          name: "AudioBuffer",
                          sampleRate: 44100,
                          length: 2,
                          duration: 2 / 44100,
                          numberOfChannels: 1
                        },
                        playbackRate: {
                          value: 1,
                          inputs: []
                        },
                        loop: true,
                        loopStart: 0,
                        loopEnd: 0,
                        inputs: []
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      });
    });
  });
  describe("#getParameter", function() {
    it("(name: string): AudioParam", function() {
      var impl = new AudioWorkerImpl(audioContext, "test_worker.js", 1, 1);
      var param1 = impl.addParameter("foo", 0.50);
      var param2 = impl.addParameter("bar", 0.25);

      assert(impl.getParameter("foo") === param1);
      assert(impl.getParameter("bar") === param2);
      assert(impl.getParameter("unknown") === undefined);
    });
  });
  describe("#removeParameter", function() {
    it("(name: string): void", function() {
      var impl = new AudioWorkerImpl(audioContext, "test_worker.js", 1, 1);

      impl.addParameter("foo", 0.50);
      impl.addParameter("bar", 0.25);
      impl.removeParameter("foo");
      impl.removeParameter("bar");
      impl.removeParameter("unknown");

      assert(impl.getParameter("foo") === undefined);
      assert(impl.getParameter("bar") === undefined);
      assert.deepEqual(impl.outlet.toJSON(), {
        name: "ScriptProcessorNode",
        inputs: []
      });
    });
  });
  describe("#onaudioprocess", function() {
    it("(func: function): void", function() {
      var impl = new AudioWorkerImpl(audioContext, "test_worker.js", 1, 1);
      var onaudioprocess = sinon.spy();

      assert(impl.inlet.onaudioprocess === null);

      impl.onaudioprocess(onaudioprocess);
      assert(typeof impl.inlet.onaudioprocess === "function");

      impl.onaudioprocess("INVALID");
      assert(impl.inlet.onaudioprocess === null);

      impl.terminate();
      impl.onaudioprocess(onaudioprocess);
      assert(impl.inlet.onaudioprocess === null);
    });
  });
  describe("#close", function() {
    it("(): void", function() {
      var impl = new AudioWorkerImpl(audioContext, "test_worker.js", 1, 1);

      sinon.spy(impl, "terminate");

      impl.close();

      assert(impl.terminate.callCount === 1);
    });
  });
  describe("#importScripts", function() {
    it("NOT SUPPORTED", function() {
      var impl = new AudioWorkerImpl(audioContext, "test_worker.js", 1, 1);

      assert.throws(function() {
        impl.importScripts();
      }, function(e) {
        return e instanceof Error && /not supported/i.test(e.message);
      });
    });
  });
});
