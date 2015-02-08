"use strict";

var assert = require("power-assert");
var sinon = require("sinon");
var MessageChannel = require("../lib/message-channel");
var AudioWorkerGlobalScope = require("../lib/audio-worker-global-scope");

describe("AudioWorkerGlobalScope", function() {
  var node;

  beforeEach(function() {
    var port2 = new MessageChannel().port2;

    sinon.spy(port2, "postMessage");

    node = {
      sampleRate: 44100,
      port2: port2,
      onaudioprocess: sinon.spy(),
      close: sinon.spy(),
      importScripts: sinon.spy()
    };
  });

  describe("constructor", function() {
    it("(node: object)", function() {
      var scope = new AudioWorkerGlobalScope(node);

      assert(scope instanceof AudioWorkerGlobalScope);
    });
  });
  describe("#self", function() {
    it("get: AudioWorkerGlobalScope", function() {
      var scope = new AudioWorkerGlobalScope(node);

      assert(scope.self === scope);
    });
  });
  describe("#sampleRate", function() {
    it("get: number", function() {
      var scope = new AudioWorkerGlobalScope(node);

      assert(scope.sampleRate === node.sampleRate);
    });
  });
  describe("#onaudioprocess", function() {
    it("get: function", function() {
      var scope = new AudioWorkerGlobalScope(node);
      var onaudioprocess = sinon.spy();

      assert(scope.onaudioprocess === null);
      assert(node.onaudioprocess.callCount === 0);

      scope.onaudioprocess = onaudioprocess;
      assert(scope.onaudioprocess === onaudioprocess);
      assert(node.onaudioprocess.callCount === 1);
      assert(node.onaudioprocess.calledWith(onaudioprocess));

      scope.onaudioprocess = "INVALID";
      assert(scope.onaudioprocess === null);
      assert(node.onaudioprocess.callCount === 2);
      assert(node.onaudioprocess.calledWith(null));
    });
  });
  describe("#onmessage", function() {
    it("get: function", function() {
      var scope = new AudioWorkerGlobalScope(node);
      var onmessage = sinon.spy();

      assert(scope.onmessage === null);

      scope.onmessage = onmessage;
      assert(scope.onmessage === node.port2.onmessage);

      scope.onmessage = "INVALID";
      assert(scope.onmessage === null);
      assert(scope.onmessage === node.port2.onmessage);
    });
  });
  describe("#postMessage", function() {
    it("(message: string, transferList:any[]): void", function() {
      var scope = new AudioWorkerGlobalScope(node);
      var message = {
        name: "hello",
        values: new Float32Array(16),
      };
      var transferList = [ message.values ];

      assert(node.port2.postMessage.callCount === 0);

      scope.postMessage(message, transferList);
      assert(node.port2.postMessage.callCount === 1);
      assert(node.port2.postMessage.calledWith(message, transferList));
    });
  });
  describe("#close", function() {
    it("(): void", function() {
      var scope = new AudioWorkerGlobalScope(node);

      assert(node.close.callCount === 0);

      scope.close();
      assert(node.close.callCount === 1);
      assert(node.close.calledWith());
    });
  });
  describe("#importScripts", function() {
    it("(*src: string[]): void", function() {
      var scope = new AudioWorkerGlobalScope(node);

      assert(node.importScripts.callCount === 0);

      scope.importScripts("foo.js", "bar.js");
      assert(node.importScripts.callCount === 1);
      assert(node.importScripts.calledWith("foo.js", "bar.js"));
    });
  });
});
