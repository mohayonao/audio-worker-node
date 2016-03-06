var _dc1 = null;

function getDC1(audioContext) {
  if (_dc1 === null) {
    _dc1 = audioContext.createBuffer(1, 8, audioContext.sampleRate);
    _dc1.getChannelData(0).set([ 1, 1, 1, 1, 1, 1, 1, 1 ]);
  }
  return _dc1;
}

function AudioWorkerNode(audioContext, audioprocess, opts) {
  opts = opts || {};

  var numberOfInputs = Math.max(1, Math.min(+opts.numberOfInputs|0, 32));
  var numberOfOutputs = Math.max(1, Math.min(+opts.numberOfOutputs|0, 32));
  var bufferLength = Math.max(256, Math.min(+opts.bufferLength|0, 16384));
  var dspBufLength = Math.max(128, Math.min(+opts.dspBufLength|0, bufferLength));
  var playbackTimeIncr = dspBufLength / audioContext.sampleRate;
  var numberOfParams = (opts.parameters && opts.parameters.length)|0;
  var paramKeys = [], paramBuffers = [];
  var processor = opts.processor || {};
  var dc1, merger, capture;
  var node = audioContext.createScriptProcessor(bufferLength, numberOfInputs, numberOfOutputs);

  node._onmessage = null;

  Object.defineProperty(node, "onmessage", {
    get: function() {
      return this._onmessage;
    },
    set: function(callback) {
      if (callback === null || typeof callback === "function") {
        this._onmessage = callback;
      }
    },
  });

  node.postMessage = function(message) {
    var _this = this;

    setTimeout(function() {
      if (_this.__target__ && typeof _this.__target__.onmessage === "function") {
        _this.__target__.onmessage({ data: message });
      }
    }, 0);
  };

  if (numberOfParams) {
    dc1 = audioContext.createBufferSource();
    merger = audioContext.createChannelMerger(numberOfParams);
    capture = audioContext.createScriptProcessor(bufferLength, numberOfParams, 1);

    dc1.buffer = getDC1(audioContext);
    dc1.loop = true;
    dc1.start(0);

    opts.parameters.forEach(function(param, index) {
      var paramGain = audioContext.createGain();

      paramGain.channelCount = 1;
      paramGain.channelCountMode = "explicit";
      paramGain.gain.value = +param.defaultValue || 0;
      node[param.name] = paramGain.gain;

      paramKeys[index] = param.name;

      dc1.connect(paramGain);
      paramGain.connect(merger, 0, index);
    });

    capture.onaudioprocess = function(e) {
      for (var i = 0; i < numberOfParams; i++) {
        paramBuffers[i] = e.inputBuffer.getChannelData(i);
      }
    };

    merger.connect(capture);
    capture.connect(node);
  }

  node.onaudioprocess = function(e) {
    var inputs = new Array(numberOfInputs);
    var outputs = new Array(numberOfOutputs);
    var playbackTime = e.playbackTime;
    var parameters = {};
    var bufferIndex = 0;
    var nextBufferIndex = 0;
    var i, imax;

    while (bufferIndex < bufferLength) {
      nextBufferIndex = bufferIndex + dspBufLength;

      for (i = 0, imax = numberOfInputs; i < imax; i++) {
        inputs[i] = e.inputBuffer.getChannelData(i).subarray(bufferIndex, nextBufferIndex);
      }

      for (i = 0, imax = numberOfOutputs; i < imax; i++) {
        outputs[i] = e.outputBuffer.getChannelData(i).subarray(bufferIndex, nextBufferIndex);
      }

      for (i = 0, imax = paramKeys.length; i < imax; i++) {
        parameters[paramKeys[i]] = paramBuffers[i].subarray(bufferIndex, nextBufferIndex);
      }

      audioprocess({
        type: "audioprocess",
        playbackTime: playbackTime,
        node: processor,
        inputs: [ inputs ],
        outputs: [ outputs ],
        parameters: parameters,
      });

      playbackTime += playbackTimeIncr;
      bufferIndex = nextBufferIndex;
    }
  };

  return node;
}

module.exports = AudioWorkerNode;
