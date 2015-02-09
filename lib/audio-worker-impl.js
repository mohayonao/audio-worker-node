"use strict";

var AudioParamNode = require("./audio-param-node");
var AudioWorkerGlobalScope = require("./audio-worker-global-scope");
var AudioProcessBuilder = require("./audio-process-builder");
var ScriptLoader = require("./script-loader");
var AudioWorkerCode = require("./audio-worker-code");
var MessageChannel = require("./message-channel");

var BUFFER_SIZE = 1024;

function AudioWorkerNodeImpl(audioContext, scriptURL, numOfInput, numOfOutput) {
  var ch = new MessageChannel();

  this.audioContext = audioContext;
  this.sampleRate = audioContext.sampleRate;
  this.inlet = audioContext.createScriptProcessor(BUFFER_SIZE, numOfInput, numOfOutput);
  this.outlet = this.inlet;
  this.port1 = ch.port1;
  this.port2 = ch.port2;
  this.scope = new AudioWorkerGlobalScope(this);

  this._numOfInput = numOfInput;
  this._numOfOutput = numOfOutput;
  this._isConnected = false;
  this._isTerminated = false;
  this._silencer = null;
  this._dc1buffer = null;
  this._dc1 = null;
  this._params = {};
  this._parameters = {};

  var scope = this.scope;
  ScriptLoader.load(scriptURL, function(script) {
    AudioWorkerCode.compile(script).call(scope, scope);
  });
}

AudioWorkerNodeImpl.prototype.connect = function(destination) {
  var audioContext = this.audioContext;

  if (!this._isConnected) {
    this._dc1buffer = audioContext.createBuffer(1, 2, audioContext.sampleRate);
    this._dc1buffer.getChannelData(0).set([ 1, 1 ]);

    this._dc1 = audioContext.createBufferSource();
    this._dc1.buffer = this._dc1buffer;
    this._dc1.loop = true;
    this._dc1.start(audioContext.currentTime);

    Object.keys(this._params).forEach(function(name) {
      this._dc1.connect(this._params[name]);
    }, this);

    this._isConnected = true;
  }

  global.AudioNode.prototype.connect.call(this.inlet, destination);
};

AudioWorkerNodeImpl.prototype.disconnect = function() {
  var audioContext = this.audioContext;

  if (this._isConnected) {
    this._dc1.stop(audioContext.currentTime);
    this._dc1.disconnect();

    this._dc1buffer = null;
    this._dc1 = null;
    this._isConnected = false;
  }

  global.AudioNode.prototype.disconnect.call(this.outlet);
};

AudioWorkerNodeImpl.prototype.terminate = function() {
  if (!this._isTerminated) {
    this.inlet.onaudioprocess = null;
    this.port1.close();
    this.port2.close();
    this._isTerminated = true;
  }
};

AudioWorkerNodeImpl.prototype.addParameter = function(name, defaultValue) {
  var audioContext = this.audioContext;

  if (this._params.hasOwnProperty(name)) {
    return this._params[name].param;
  }

  if (this._silencer === null) {
    this._silencer = audioContext.createGain();
    this._silencer.gain.value = 0;
    this._silencer.connect(this.outlet);
  }

  var paramNode = new AudioParamNode(audioContext, defaultValue, BUFFER_SIZE);

  paramNode.connect(this._silencer);

  if (this._isConnected) {
    this._dc1.connect(paramNode);
  }

  this._params[name] = paramNode;
  this._parameters[name] = paramNode.array;

  return paramNode.param;
};

AudioWorkerNodeImpl.prototype.getParameter = function(name) {
  return this._params[name] && this._params[name].param;
};

AudioWorkerNodeImpl.prototype.removeParameter = function(name) {
  if (!this._params.hasOwnProperty(name)) {
    return;
  }

  this._params[name].disconnect();

  delete this._params[name];
  delete this._parameters[name];

  if (Object.keys(this._params).length === 0) {
    this._silencer.disconnect();
    this._silencer = null;
  }
};

AudioWorkerNodeImpl.prototype.onaudioprocess = function(func) {
  if (this._isTerminated || typeof func !== "function") {
    this.inlet.onaudioprocess = null;
  } else {
    this.inlet.onaudioprocess = AudioProcessBuilder.build({
      func: func,
      scope: this.scope,
      numOfInput: this._numOfInput,
      numOfOutput: this._numOfOutput,
      parameters: this._parameters,
    });
  }
};

AudioWorkerNodeImpl.prototype.close = function() {
  this.terminate();
};

AudioWorkerNodeImpl.prototype.importScripts = function() {
  throw new Error("Not Supported: importScripts");
};

module.exports = AudioWorkerNodeImpl;
