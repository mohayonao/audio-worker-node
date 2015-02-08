"use strict";

var AudioProcessBuilder = {};

AudioProcessBuilder.build = function(opts) {
  var numOfInput = opts.numOfInput;
  var numOfOutput = opts.numOfOutput;

  if (numOfInput === 1 && numOfOutput === 1) {
    return build_onaudioprocess_1(opts);
  }
  if (numOfInput === 2 && numOfOutput === 2) {
    return build_onaudioprocess_2(opts);
  }
  return build_onaudioprocess_n(opts);
};

function build_onaudioprocess_1(opts) {
  var func = opts.func;
  var scope = opts.scope;
  var parameters = opts.parameters;

  return function(e) {
    e.inputBuffers = [
      e.inputBuffer.getChannelData(0)
    ];
    e.outputBuffers = [
      e.outputBuffer.getChannelData(0)
    ];
    e.parameters = parameters;

    func.call(scope, e);
  };
}

function build_onaudioprocess_2(opts) {
  var func = opts.func;
  var scope = opts.scope;
  var parameters = opts.parameters;

  return function(e) {
    var inp = e.inputBuffer;
    var out = e.outputBuffer;
    e.inputBuffers = [
      inp.getChannelData(0),
      inp.getChannelData(1)
    ];
    e.outputBuffers = [
      out.getChannelData(0),
      out.getChannelData(1)
    ];
    e.parameters = parameters;

    func.call(scope, e);
  };
}

function build_onaudioprocess_n(opts) {
  var func = opts.func;
  var scope = opts.scope;
  var numOfInput = opts.numOfInput;
  var numOfOutput = opts.numOfOutput;
  var parameters = opts.parameters;

  return function(e) {
    var inputBuffers = new Array(numOfInput);
    var outputBuffers = new Array(numOfOutput);
    var i;

    for (i = 0; i < numOfInput; i++) {
      inputBuffers[i] = e.inputBuffer.getChannelData(i);
    }
    for (i = 0; i < numOfOutput; i++) {
      outputBuffers[i] = e.outputBuffer.getChannelData(i);
    }

    e.inputBuffers = inputBuffers;
    e.outputBuffers = outputBuffers;
    e.parameters = parameters;

    func.call(scope, e);
  };
}

module.exports = AudioProcessBuilder;
