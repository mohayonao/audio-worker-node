"use strict";

/**
 *  AudioParamImpl
 *  +-----------------+
 *  | GainNode(inlet) |
 *  | gain: value     |
 *  +-----------------+
 *    |
 *  +-----------------------------+
 *  | ScriptProcessorNode(outlet) |
 *  +-----------------------------+
 */
function AudioParamImpl(audioContext, defaultValue, bufferSize) {
  this.inlet = audioContext.createGain();
  this.outlet = audioContext.createScriptProcessor(bufferSize, 1, 1);

  this.param = this.inlet.gain;
  this.param.value = defaultValue;
  this.array = new Float32Array(bufferSize);

  this.inlet.connect(this.outlet);

  var array = this.array;
  this.outlet.onaudioprocess = function(e) {
    array.set(e.inputBuffer.getChannelData(0));
  };
}

AudioParamImpl.prototype.connect = function(destination) {
  global.AudioNode.prototype.connect.call(this.outlet, destination);
};

AudioParamImpl.prototype.disconnect = function() {
  global.AudioNode.prototype.disconnect.call(this.outlet);
};

module.exports = AudioParamImpl;
