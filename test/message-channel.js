"use strict";

var assert = require("power-assert");
var sinon = require("sinon");
var MessageChannel = require("../lib/message-channel");

describe("MessageChannel", function() {
  describe("constructor", function() {
    it("()", function() {
      var ch = new MessageChannel();

      assert(ch instanceof MessageChannel);
    });
  });
  describe("#postMessage", function() {
    it("(message: any): async void", function(done) {
      var ch = new MessageChannel();

      ch.port1.postMessage("hello");

      ch.port1.onmessage = sinon.spy(function() {
        assert(ch.port2.onmessage.callCount === 1);
        assert(ch.port2.onmessage.firstCall.args[0].type === "message");
        assert(ch.port2.onmessage.firstCall.args[0].data === "hello");

        assert(ch.port1.onmessage.callCount === 1);
        assert(ch.port1.onmessage.firstCall.args[0].type === "message");
        assert(ch.port1.onmessage.firstCall.args[0].data === "world");

        assert(ch.port1.onmessage.calledAfter(ch.port2.onmessage));

        done();
      });
      ch.port2.onmessage = sinon.spy(function() {
        ch.port2.postMessage("world");
      });

      assert(ch.port1.onmessage.callCount === 0);
      assert(ch.port2.onmessage.callCount === 0);
    });
  });
  describe("#close", function() {
    it("(): void", function(done) {
      var ch = new MessageChannel();

      ch.port1.onmessage = sinon.spy();
      ch.port2.onmessage = sinon.spy();

      ch.port1.close();
      ch.port1.postMessage("hello");

      assert(ch.port1.onmessage.callCount === 0);
      assert(ch.port2.onmessage.callCount === 0);

      setTimeout(function() {
        assert(ch.port1.onmessage.callCount === 0);
        assert(ch.port2.onmessage.callCount === 0);
        done();
      }, 25);
    });
  });
});
