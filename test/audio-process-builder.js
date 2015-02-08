"use strict";

var assert = require("power-assert");
var sinon = require("sinon");
var AudioProcessBuilder = require("../lib/audio-process-builder");

describe("AudioProcessBuilder", function() {
  var audioContext;
  var inputBuffer;
  var outputBuffer;

  before(function() {
    audioContext = new global.AudioContext();
    inputBuffer = audioContext.createBuffer(16, 256, 44100);
    outputBuffer = audioContext.createBuffer(16, 256, 44100);
  });

  describe("#build", function() {
    it("in:1, out:1", function() {
      var opts = {
        func: sinon.spy(),
        scope: {},
        numOfInput: 1,
        numOfOutput: 1,
        parameters: {}
      };

      var audioprocess = AudioProcessBuilder.build(opts);
      var e1 = {
        playbackTime: Math.random(),
        inputBuffer: inputBuffer,
        outputBuffer: outputBuffer
      };

      audioprocess(e1);

      assert(opts.func.callCount === 1);
      assert(opts.func.calledOn(opts.scope));

      var e2 = opts.func.firstCall.args[0];
      assert(e2.playbackTime === e1.playbackTime);
      assert(e2.inputBuffers.length === 1);
      assert(e2.inputBuffers[0] === inputBuffer.getChannelData(0));
      assert(e2.outputBuffers.length === 1);
      assert(e2.outputBuffers[0] === outputBuffer.getChannelData(0));
    });
    it("in:2, out:2", function() {
      var opts = {
        func: sinon.spy(),
        scope: {},
        numOfInput: 2,
        numOfOutput: 2,
        parameters: {}
      };

      var audioprocess = AudioProcessBuilder.build(opts);
      var e1 = {
        playbackTime: Math.random(),
        inputBuffer: inputBuffer,
        outputBuffer: outputBuffer
      };

      audioprocess(e1);

      assert(opts.func.callCount === 1);
      assert(opts.func.calledOn(opts.scope));

      var e2 = opts.func.firstCall.args[0];
      assert(e2.playbackTime === e1.playbackTime);
      assert(e2.inputBuffers.length === 2);
      assert(e2.inputBuffers[0] === inputBuffer.getChannelData(0));
      assert(e2.inputBuffers[1] === inputBuffer.getChannelData(1));
      assert(e2.outputBuffers.length === 2);
      assert(e2.outputBuffers[0] === outputBuffer.getChannelData(0));
      assert(e2.outputBuffers[1] === outputBuffer.getChannelData(1));
    });
    it("in:6, out:2", function() {
      var opts = {
        func: sinon.spy(),
        scope: {},
        numOfInput: 6,
        numOfOutput: 2,
        parameters: {}
      };

      var audioprocess = AudioProcessBuilder.build(opts);
      var e1 = {
        playbackTime: Math.random(),
        inputBuffer: inputBuffer,
        outputBuffer: outputBuffer
      };

      audioprocess(e1);

      assert(opts.func.callCount === 1);
      assert(opts.func.calledOn(opts.scope));

      var e2 = opts.func.firstCall.args[0];
      assert(e2.playbackTime === e1.playbackTime);
      assert(e2.inputBuffers.length === 6);
      assert(e2.inputBuffers[0] === inputBuffer.getChannelData(0));
      assert(e2.inputBuffers[1] === inputBuffer.getChannelData(1));
      assert(e2.inputBuffers[2] === inputBuffer.getChannelData(2));
      assert(e2.inputBuffers[3] === inputBuffer.getChannelData(3));
      assert(e2.inputBuffers[4] === inputBuffer.getChannelData(4));
      assert(e2.inputBuffers[5] === inputBuffer.getChannelData(5));
      assert(e2.outputBuffers.length === 2);
      assert(e2.outputBuffers[0] === outputBuffer.getChannelData(0));
      assert(e2.outputBuffers[1] === outputBuffer.getChannelData(1));
    });
  });
});
