"use strict";

var assert = require("power-assert");
var sinon = require("sinon");
var AudioWorkerNode = require("../lib/audio-worker-node");

describe("AudioWorkerNode", function() {
  var audioContext;

  beforeEach(function() {
    audioContext = new global.AudioContext();
  });

  describe("constructor", function() {
    it("(audioContext: AudioContext, scriptURL: string, numberOfInputChannels: number, numberOfOutputChannels: number)", function() {
      var node = new AudioWorkerNode(audioContext, "test_worker.js", 1, 1);

      assert(node instanceof global.AudioNode);
    });
  });
  describe("#onmessage", function() {
    it("get/set: function", function() {
      var node = new AudioWorkerNode(audioContext, "test_worker.js", 1, 1);
      var onmessage = sinon.spy();

      assert(node.onmessage === null);

      node.onmessage = onmessage;
      assert(node.onmessage === onmessage);

      node.onmessage = "INVALID";
      assert(node.onmessage === null);
    });
  });
  describe("#connect", function() {
    it("(destination: AudioNode): void", function() {
      var node = new AudioWorkerNode(audioContext, "test_worker.js", 1, 1);

      node.connect(audioContext.destination);

      assert(audioContext.toJSON(), {
        name: "AudioDestinationNode",
        inputs: [
          {
            name: "ScriptProcessorNode",
            inputs: []
          }
        ]
      });
    });
  });
  describe("#disconnect", function() {
    it("(): void", function() {
      var node = new AudioWorkerNode(audioContext, "test_worker.js", 1, 1);

      node.connect(audioContext.destination);
      node.disconnect();

      assert(audioContext.toJSON(), {
        name: "AudioDestinationNode",
        inputs: []
      });
    });
  });
  describe("#postMessage", function() {
    it("(message: any, transfer: any): void", function(done) {
      var node = new AudioWorkerNode(audioContext, "test_worker.js", 1, 1);

      node.onmessage = sinon.spy(function() {
        assert(node.onmessage.callCount === 1);
        assert(node.onmessage.firstCall.args[0].type === "message");
        assert(node.onmessage.firstCall.args[0].data === "hello!!");
        done();
      });

      node.postMessage("hello");

      assert(node.onmessage.callCount === 0);
    });
  });
  describe("#addParameter", function() {
    it("(name: string, defaultValue: number): AudioParam", function() {
      var node = new AudioWorkerNode(audioContext, "test_worker.js", 1, 1);

      var param1 = node.addParameter("foo", 0.50);
      var param2 = node.addParameter("bar", 0.25);
      var param3 = node.addParameter("bar", 0.25);

      assert(param1 instanceof global.AudioParam);
      assert(param2 instanceof global.AudioParam);
      assert(node.foo === param1);
      assert(node.bar === param2);
      assert(param2 === param3);
    });
  });
  describe("#removeParameter", function() {
    it("(name: string): void", function() {
      var node = new AudioWorkerNode(audioContext, "test_worker.js", 1, 1);

      node.addParameter("foo", 0.50);
      node.addParameter("bar", 0.25);
      node.removeParameter("foo");
      node.removeParameter("bar");
      node.removeParameter("bar");

      assert(node.foo === undefined);
      assert(node.bar === undefined);
    });
  });
  describe("#terminate", function() {
    it("(): void", function(done) {
      var node = new AudioWorkerNode(audioContext, "test_worker.js", 1, 1);

      node.onmessage = sinon.spy();

      node.terminate();
      node.postMessage("hello");

      assert(node.onmessage.callCount === 0);

      setTimeout(function() {
        assert(node.onmessage.callCount === 0);
        done();
      }, 25);
    });
  });
});
